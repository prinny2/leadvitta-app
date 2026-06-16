import { describe, it, expect, beforeEach, vi } from "vitest";

// Fake do Firestore Admin com subcoleções (conversas/{id}/mensagens) e a
// coleção de idempotência (mensagens_processadas). Registra as escritas para
// asserção, sem Firebase real.
function makeDb(
  seedConversas: Record<string, Record<string, unknown>> = {},
  opts: { createThrows?: boolean } = {}
) {
  const conversas = new Map<string, Record<string, unknown>>(
    Object.entries(seedConversas)
  );
  const calls = {
    conversaSet: [] as Array<{ id: string; data: Record<string, unknown> }>,
    mensagensAdd: [] as Array<{ parent: string; data: Record<string, unknown> }>,
    mensagensDocSet: [] as Array<{ parent: string; doc: string; data: Record<string, unknown> }>,
    processadasCreate: [] as string[],
    processadasDelete: [] as string[],
  };

  function mensagensCollection(parentId: string) {
    return {
      add: async (data: Record<string, unknown>) => {
        calls.mensagensAdd.push({ parent: parentId, data });
      },
      doc: (doc: string) => ({
        set: async (data: Record<string, unknown>) => {
          calls.mensagensDocSet.push({ parent: parentId, doc, data });
        },
      }),
    };
  }

  function conversaDoc(id: string) {
    return {
      async get() {
        return { exists: conversas.has(id), data: () => conversas.get(id) };
      },
      async set(data: Record<string, unknown>) {
        calls.conversaSet.push({ id, data });
        conversas.set(id, { ...(conversas.get(id) ?? {}), ...data });
      },
      collection: () => mensagensCollection(id),
    };
  }

  function processadasDoc(doc: string) {
    return {
      async create() {
        if (opts.createThrows) throw new Error("already exists");
        calls.processadasCreate.push(doc);
      },
      async delete() {
        calls.processadasDelete.push(doc);
      },
    };
  }

  const db = {
    collection: (name: string) => ({
      doc: (id: string) =>
        name === "mensagens_processadas" ? processadasDoc(id) : conversaDoc(id),
    }),
  };

  return { db, conversas, calls };
}

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
} from "@/lib/conversas";

beforeEach(() => {
  getDb.mockReset();
});

describe("prioridadeDoScore", () => {
  it("aplica os limiares 70/40", () => {
    expect(prioridadeDoScore(80)).toBe("quente");
    expect(prioridadeDoScore(71)).toBe("quente");
    expect(prioridadeDoScore(70)).toBe("morno");
    expect(prioridadeDoScore(41)).toBe("morno");
    expect(prioridadeDoScore(40)).toBe("frio");
    expect(prioridadeDoScore(0)).toBe("frio");
  });

  it("retorna 'morno' para score ausente", () => {
    expect(prioridadeDoScore(undefined)).toBe("morno");
    expect(prioridadeDoScore(null)).toBe("morno");
  });
});

describe("conversaId", () => {
  it("é determinístico por (clínica, número normalizado)", () => {
    expect(conversaId("c1", "+55 (91) 98515-6690")).toBe("c1__5591985156690");
    expect(conversaId("c1", "5591985156690")).toBe("c1__5591985156690");
  });
});

describe("reservarProcessamento (idempotência)", () => {
  it("retorna true (e não toca no db) quando não há providerMessageId", async () => {
    const { db, calls } = makeDb();
    getDb.mockReturnValue(db);
    expect(await reservarProcessamento(undefined)).toBe(true);
    expect(calls.processadasCreate).toEqual([]);
  });

  it("retorna true sem Admin SDK", async () => {
    getDb.mockReturnValue(null);
    expect(await reservarProcessamento("M1")).toBe(true);
  });

  it("retorna true na 1ª vez (create bem-sucedido), sanitizando o id", async () => {
    const { db, calls } = makeDb();
    getDb.mockReturnValue(db);
    expect(await reservarProcessamento("M:1/2")).toBe(true);
    expect(calls.processadasCreate).toEqual(["M_1_2"]);
  });

  it("retorna false quando a mensagem já foi reservada (retry)", async () => {
    const { db } = makeDb({}, { createThrows: true });
    getDb.mockReturnValue(db);
    expect(await reservarProcessamento("M1")).toBe(false);
  });
});

describe("liberarProcessamento", () => {
  it("apaga a reserva sanitizando o id", async () => {
    const { db, calls } = makeDb();
    getDb.mockReturnValue(db);
    await liberarProcessamento("M:1");
    expect(calls.processadasDelete).toEqual(["M_1"]);
  });

  it("é no-op sem id ou sem db", async () => {
    const { db, calls } = makeDb();
    getDb.mockReturnValue(db);
    await liberarProcessamento(undefined);
    expect(calls.processadasDelete).toEqual([]);

    getDb.mockReturnValue(null);
    await expect(liberarProcessamento("M1")).resolves.toBeUndefined();
  });
});

describe("registrarMensagemRecebida", () => {
  it("cria a conversa nova com created_at e grava a mensagem por id determinístico", async () => {
    const { db, calls } = makeDb();
    getDb.mockReturnValue(db);

    const id = await registrarMensagemRecebida({
      clinicaId: "c1",
      from: "+55 91 98515-6690",
      text: "quanto custa?",
      contactName: "Ana",
      score: 80,
      intent: "preco",
      sentiment: "positivo",
      providerMessageId: "M1",
    });

    expect(id).toBe("c1__5591985156690");
    const set = calls.conversaSet[0].data;
    expect(set).toMatchObject({
      clinica_id: "c1",
      cliente_numero: "5591985156690",
      cliente_nome: "Ana",
      nao_lida: true,
      score: 80,
      prioridade: "quente",
      intent: "preco",
      sentiment: "positivo",
      arquivada: false,
    });
    expect(set.created_at).toBeDefined();
    // providerMessageId presente → escreve a mensagem com id determinístico (dedupe).
    expect(calls.mensagensDocSet).toHaveLength(1);
    expect(calls.mensagensDocSet[0]).toMatchObject({ parent: id, doc: "M1" });
    expect(calls.mensagensAdd).toHaveLength(0);
  });

  it("não regrava created_at em conversa existente e usa add() sem providerMessageId", async () => {
    const { db, calls } = makeDb({ "c1__5591985156690": { created_at: "antes" } });
    getDb.mockReturnValue(db);

    await registrarMensagemRecebida({
      clinicaId: "c1",
      from: "5591985156690",
      text: "oi",
    });

    expect(calls.conversaSet[0].data.created_at).toBeUndefined();
    expect(calls.mensagensAdd).toHaveLength(1);
    expect(calls.mensagensDocSet).toHaveLength(0);
  });

  it("trunca ultima_mensagem em 500 chars mas guarda o texto completo na thread", async () => {
    const { db, calls } = makeDb();
    getDb.mockReturnValue(db);
    const longo = "x".repeat(600);

    await registrarMensagemRecebida({ clinicaId: "c1", from: "5591985156690", text: longo });
    expect((calls.conversaSet[0].data.ultima_mensagem as string).length).toBe(500);
    expect(calls.mensagensAdd[0].data.texto).toBe(longo);
  });

  it("retorna null sem Admin SDK", async () => {
    getDb.mockReturnValue(null);
    expect(
      await registrarMensagemRecebida({ clinicaId: "c1", from: "55", text: "x" })
    ).toBeNull();
  });
});

describe("registrarMensagemEnviada", () => {
  it("com marcarLida zera 'não lida' e grava a saída", async () => {
    const { db, calls } = makeDb();
    getDb.mockReturnValue(db);

    await registrarMensagemEnviada("c1", "5591985156690", "resposta", { marcarLida: true });
    expect(calls.conversaSet[0].data).toMatchObject({ nao_lida: false });
    expect(calls.mensagensAdd[0].data).toMatchObject({ direcao: "out", texto: "resposta" });
  });

  it("sem marcarLida (auto-resposta) NÃO mexe em 'não lida'", async () => {
    const { db, calls } = makeDb();
    getDb.mockReturnValue(db);

    await registrarMensagemEnviada("c1", "5591985156690", "auto");
    expect(calls.conversaSet[0].data.nao_lida).toBeUndefined();
  });
});

describe("marcarPrecisaAtencao", () => {
  it("sinaliza precisa_atencao na conversa", async () => {
    const { db, calls } = makeDb();
    getDb.mockReturnValue(db);
    await marcarPrecisaAtencao("c1", "5591985156690");
    expect(calls.conversaSet[0]).toMatchObject({
      id: "c1__5591985156690",
      data: { precisa_atencao: true },
    });
  });
});

describe("getConversaServidor", () => {
  it("retorna dono e número quando a conversa existe e está completa", async () => {
    const { db } = makeDb({
      "c1__5591985156690": { clinica_id: "c1", cliente_numero: "5591985156690" },
    });
    getDb.mockReturnValue(db);
    expect(await getConversaServidor("c1__5591985156690")).toEqual({
      clinica_id: "c1",
      cliente_numero: "5591985156690",
    });
  });

  it("retorna null para conversa inexistente ou com campos faltando", async () => {
    const { db } = makeDb({ "c1__incompleta": { clinica_id: "c1" } });
    getDb.mockReturnValue(db);
    expect(await getConversaServidor("nao_existe")).toBeNull();
    expect(await getConversaServidor("c1__incompleta")).toBeNull();
  });

  it("retorna null sem Admin SDK", async () => {
    getDb.mockReturnValue(null);
    expect(await getConversaServidor("x")).toBeNull();
  });
});
