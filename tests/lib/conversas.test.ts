import { describe, it, expect, beforeEach, vi } from "vitest";

// Firestore Admin falso (com subcoleção `mensagens` e create()/delete()) para
// testar a persistência de conversas do webhook sem Firebase real.
const { getDb } = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("@/lib/firebase/admin", () => ({ getFirebaseAdminDb: getDb }));

import {
  prioridadeDoScore,
  conversaId,
  reservarProcessamento,
  liberarProcessamento,
  registrarMensagemRecebida,
  registrarMensagemEnviada,
  marcarPrecisaAtencao,
  getConversaServidor,
  getCanalClinica,
} from "@/lib/conversas";

function makeFirestore(seed: Record<string, any> = {}) {
  const store = new Map<string, any>(Object.entries(seed));
  let autoId = 0;

  const collectionRef = (base: string) => ({
    doc: (d: string) => docRef(`${base}/${d}`),
    add: async (data: any) => {
      const path = `${base}/__auto_${autoId++}`;
      store.set(path, data);
      return { id: path };
    },
  });

  function docRef(path: string) {
    return {
      async get() {
        return { exists: store.has(path), data: () => store.get(path) };
      },
      async set(data: any, opts?: { merge?: boolean }) {
        const prev = store.get(path) || {};
        store.set(path, opts?.merge ? { ...prev, ...data } : data);
      },
      async create(data: any) {
        if (store.has(path)) throw new Error("already-exists");
        store.set(path, data);
      },
      async delete() {
        store.delete(path);
      },
      collection: (c: string) => collectionRef(`${path}/${c}`),
    };
  }

  const db = { collection: (c: string) => collectionRef(c) };
  return { db, store };
}

beforeEach(() => {
  getDb.mockReset();
});

describe("prioridadeDoScore", () => {
  it("sem score numérico → morno", () => {
    expect(prioridadeDoScore()).toBe("morno");
    expect(prioridadeDoScore(null)).toBe("morno");
  });

  it("aplica os cortes 70 / 40", () => {
    expect(prioridadeDoScore(90)).toBe("quente");
    expect(prioridadeDoScore(71)).toBe("quente");
    expect(prioridadeDoScore(70)).toBe("morno"); // limite inferior é >70
    expect(prioridadeDoScore(41)).toBe("morno");
    expect(prioridadeDoScore(40)).toBe("frio"); // limite inferior é >40
    expect(prioridadeDoScore(0)).toBe("frio");
  });
});

describe("conversaId", () => {
  it("é determinístico e usa só os dígitos do número", () => {
    expect(conversaId("c1", "+55 (11) 99999-8888")).toBe("c1__5511999998888");
    expect(conversaId("c1", "5511999998888")).toBe("c1__5511999998888");
  });
});

describe("reservarProcessamento (idempotência)", () => {
  it("sem id de mensagem → segue (true)", async () => {
    expect(await reservarProcessamento(undefined)).toBe(true);
    expect(getDb).not.toHaveBeenCalled();
  });

  it("sem Admin SDK → segue (true)", async () => {
    getDb.mockReturnValue(null);
    expect(await reservarProcessamento("wamid.abc")).toBe(true);
  });

  it("primeira vez reserva (true); retry da mesma mensagem é bloqueado (false)", async () => {
    const { db } = makeFirestore();
    getDb.mockReturnValue(db);
    expect(await reservarProcessamento("wamid.abc")).toBe(true);
    expect(await reservarProcessamento("wamid.abc")).toBe(false);
  });
});

describe("liberarProcessamento", () => {
  it("remove a reserva para permitir reprocessar após falha", async () => {
    const { db, store } = makeFirestore();
    getDb.mockReturnValue(db);
    await reservarProcessamento("wamid.xyz");
    // o id é sanitizado (. → _) para ser um doc id válido
    expect(store.has("mensagens_processadas/wamid_xyz")).toBe(true);
    await liberarProcessamento("wamid.xyz");
    expect(store.has("mensagens_processadas/wamid_xyz")).toBe(false);
    // após liberar, dá pra reservar de novo
    expect(await reservarProcessamento("wamid.xyz")).toBe(true);
  });

  it("é no-op sem id ou sem Admin SDK", async () => {
    getDb.mockReturnValue(null);
    await expect(liberarProcessamento("wamid.xyz")).resolves.toBeUndefined();
    await expect(liberarProcessamento(undefined)).resolves.toBeUndefined();
  });
});

describe("registrarMensagemRecebida", () => {
  it("cria a conversa e devolve o id determinístico", async () => {
    const { db, store } = makeFirestore();
    getDb.mockReturnValue(db);

    const id = await registrarMensagemRecebida({
      clinicaId: "c1",
      from: "+55 11 99999-8888",
      text: "ola, quanto custa o botox?",
      score: 85,
      providerMessageId: "wamid.1",
    });

    expect(id).toBe("c1__5511999998888");
    const conv = store.get("conversas/c1__5511999998888");
    expect(conv.clinica_id).toBe("c1");
    expect(conv.cliente_numero).toBe("5511999998888");
    expect(conv.nao_lida).toBe(true);
    expect(conv.prioridade).toBe("quente"); // score 85
    expect(conv.created_at).toBeTruthy(); // conversa nova
    // mensagem gravada com id determinístico sanitizado (dedup) → sub-doc fixo
    expect(store.has("conversas/c1__5511999998888/mensagens/wamid_1")).toBe(true);
  });

  it("sem providerMessageId grava a mensagem via add()", async () => {
    const { db, store } = makeFirestore();
    getDb.mockReturnValue(db);
    await registrarMensagemRecebida({
      clinicaId: "c1",
      from: "5511999998888",
      text: "oi",
    });
    const msgs = [...store.keys()].filter((k) =>
      k.startsWith("conversas/c1__5511999998888/mensagens/__auto_")
    );
    expect(msgs).toHaveLength(1);
  });

  it("devolve null sem Admin SDK", async () => {
    getDb.mockReturnValue(null);
    expect(
      await registrarMensagemRecebida({ clinicaId: "c1", from: "x", text: "y" })
    ).toBeNull();
  });
});

describe("registrarMensagemEnviada", () => {
  it("resposta manual (marcarLida) zera o não-lida", async () => {
    const { db, store } = makeFirestore();
    getDb.mockReturnValue(db);
    await registrarMensagemEnviada("c1", "5511999998888", "resposta", {
      marcarLida: true,
    });
    expect(store.get("conversas/c1__5511999998888").nao_lida).toBe(false);
  });

  it("auto-resposta (sem marcarLida) não mexe no não-lida", async () => {
    const { db, store } = makeFirestore({
      "conversas/c1__5511999998888": { nao_lida: true },
    });
    getDb.mockReturnValue(db);
    await registrarMensagemEnviada("c1", "5511999998888", "auto");
    expect(store.get("conversas/c1__5511999998888").nao_lida).toBe(true);
  });
});

describe("marcarPrecisaAtencao", () => {
  it("seta a flag precisa_atencao na conversa", async () => {
    const { db, store } = makeFirestore();
    getDb.mockReturnValue(db);
    await marcarPrecisaAtencao("c1", "5511999998888");
    expect(store.get("conversas/c1__5511999998888").precisa_atencao).toBe(true);
  });
});

describe("getConversaServidor", () => {
  it("devolve dono e número quando válida", async () => {
    const { db } = makeFirestore({
      "conversas/x": { clinica_id: "c1", cliente_numero: "5511999998888" },
    });
    getDb.mockReturnValue(db);
    expect(await getConversaServidor("x")).toEqual({
      clinica_id: "c1",
      cliente_numero: "5511999998888",
    });
  });

  it("devolve null para conversa inexistente ou incompleta", async () => {
    const { db } = makeFirestore({ "conversas/incompleta": { clinica_id: "c1" } });
    getDb.mockReturnValue(db);
    expect(await getConversaServidor("nao-existe")).toBeNull();
    expect(await getConversaServidor("incompleta")).toBeNull();
  });
});

describe("getCanalClinica", () => {
  it("devolve a chave do canal quando presente", async () => {
    const { db } = makeFirestore({
      "clinicas/c1": { whatsapp_channel_key: "chave-123" },
    });
    getDb.mockReturnValue(db);
    expect(await getCanalClinica("c1")).toBe("chave-123");
  });

  it("devolve undefined quando ausente ou sem db", async () => {
    const { db } = makeFirestore({ "clinicas/c1": {} });
    getDb.mockReturnValue(db);
    expect(await getCanalClinica("c1")).toBeUndefined();
    getDb.mockReturnValue(null);
    expect(await getCanalClinica("c1")).toBeUndefined();
  });
});
