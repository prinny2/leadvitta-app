import { describe, it, expect, beforeEach, vi } from "vitest";

// Fake mínimo do Firestore Admin: um Map "colecao/doc" -> dados, com
// runTransaction/get/set/delete suficientes para exercitar o mapa canônico
// de números (numeros_whatsapp) sem Firebase real.
function makeDb(seed: Record<string, unknown> = {}) {
  const store = new Map<string, Record<string, unknown>>(
    Object.entries(seed) as [string, Record<string, unknown>][]
  );
  const ops: Array<{ op: "set" | "delete"; key: string }> = [];

  function docRef(collection: string, id: string) {
    const key = `${collection}/${id}`;
    return {
      key,
      async get() {
        return { exists: store.has(key), data: () => store.get(key) };
      },
    };
  }

  const tx = {
    async get(ref: { get: () => Promise<unknown> }) {
      return ref.get();
    },
    set(
      ref: { key: string },
      data: Record<string, unknown>,
      opts?: { merge?: boolean }
    ) {
      ops.push({ op: "set", key: ref.key });
      store.set(ref.key, opts?.merge ? { ...(store.get(ref.key) ?? {}), ...data } : data);
    },
    delete(ref: { key: string }) {
      ops.push({ op: "delete", key: ref.key });
      store.delete(ref.key);
    },
  };

  const db = {
    collection: (c: string) => ({ doc: (id: string) => docRef(c, id) }),
    async runTransaction(fn: (t: typeof tx) => unknown) {
      return fn(tx);
    },
  };

  return { db, store, ops };
}

const { getDb } = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("@/lib/firebase/admin", () => ({ getFirebaseAdminDb: getDb }));

import {
  reivindicarNumero,
  liberarNumero,
  resolverClinicaPorNumero,
} from "@/lib/numeros";

beforeEach(() => {
  getDb.mockReset();
});

describe("reivindicarNumero", () => {
  it("grava o número no mapa canônico e na clínica (normalizando dígitos)", async () => {
    const { db, store } = makeDb({ "clinicas/clinicaA": {} });
    getDb.mockReturnValue(db);

    const r = await reivindicarNumero("clinicaA", "+55 (91) 98515-6690");
    expect(r).toMatchObject({ ok: true, numero: "5591985156690" });
    expect(store.get("numeros_whatsapp/5591985156690")).toMatchObject({
      clinica_id: "clinicaA",
    });
    expect(store.get("clinicas/clinicaA")).toMatchObject({
      whatsapp: "5591985156690",
    });
  });

  it("recusa número já pertencente a OUTRA clínica (anti-sequestro)", async () => {
    const { db, store } = makeDb({
      "numeros_whatsapp/5591985156690": { clinica_id: "clinicaB" },
      "clinicas/clinicaA": {},
    });
    getDb.mockReturnValue(db);

    const r = await reivindicarNumero("clinicaA", "5591985156690");
    expect(r).toEqual({ ok: false, motivo: "em_uso" });
    // O dono original permanece intacto.
    expect(store.get("numeros_whatsapp/5591985156690")).toMatchObject({
      clinica_id: "clinicaB",
    });
  });

  it("permite reivindicar o PRÓPRIO número novamente", async () => {
    const { db } = makeDb({
      "numeros_whatsapp/5591985156690": { clinica_id: "clinicaA" },
      "clinicas/clinicaA": { whatsapp: "5591985156690" },
    });
    getDb.mockReturnValue(db);

    const r = await reivindicarNumero("clinicaA", "5591985156690");
    expect(r).toMatchObject({ ok: true });
  });

  it("libera o número antigo da clínica ao trocar de número", async () => {
    const { db, ops, store } = makeDb({
      "numeros_whatsapp/559100000000": { clinica_id: "clinicaA" },
      "clinicas/clinicaA": { whatsapp: "559100000000" },
    });
    getDb.mockReturnValue(db);

    await reivindicarNumero("clinicaA", "5591985156690");
    expect(ops).toContainEqual({ op: "delete", key: "numeros_whatsapp/559100000000" });
    expect(store.has("numeros_whatsapp/559100000000")).toBe(false);
    expect(store.get("numeros_whatsapp/5591985156690")).toMatchObject({
      clinica_id: "clinicaA",
    });
  });

  it("retorna 'vazio' para número sem dígitos", async () => {
    const { db } = makeDb({ "clinicas/clinicaA": {} });
    getDb.mockReturnValue(db);
    expect(await reivindicarNumero("clinicaA", "   ")).toEqual({
      ok: false,
      motivo: "vazio",
    });
  });

  it("retorna 'sem_db' quando o Admin SDK não está configurado", async () => {
    getDb.mockReturnValue(null);
    expect(await reivindicarNumero("clinicaA", "5591985156690")).toEqual({
      ok: false,
      motivo: "sem_db",
    });
  });
});

describe("liberarNumero", () => {
  it("limpa o mapa e o campo whatsapp da clínica", async () => {
    const { db, store } = makeDb({
      "numeros_whatsapp/5591985156690": { clinica_id: "clinicaA" },
      "clinicas/clinicaA": { whatsapp: "5591985156690" },
    });
    getDb.mockReturnValue(db);

    const r = await liberarNumero("clinicaA");
    expect(r).toMatchObject({ ok: true, numero: "" });
    expect(store.has("numeros_whatsapp/5591985156690")).toBe(false);
    expect(store.get("clinicas/clinicaA")).toMatchObject({ whatsapp: "" });
  });

  it("retorna 'sem_db' sem Admin SDK", async () => {
    getDb.mockReturnValue(null);
    expect(await liberarNumero("clinicaA")).toEqual({ ok: false, motivo: "sem_db" });
  });
});

describe("resolverClinicaPorNumero", () => {
  it("encontra a clínica dona pelo número exato", async () => {
    const { db } = makeDb({
      "numeros_whatsapp/5591985156690": { clinica_id: "clinicaA" },
    });
    getDb.mockReturnValue(db);
    expect(await resolverClinicaPorNumero("+55 91 98515-6690")).toBe("clinicaA");
  });

  it("casa por variante de DDI (número salvo sem o 55)", async () => {
    const { db } = makeDb({
      "numeros_whatsapp/91985156690": { clinica_id: "clinicaA" },
    });
    getDb.mockReturnValue(db);
    // Provedor entrega com 55; o resolvedor tenta as variantes.
    expect(await resolverClinicaPorNumero("5591985156690")).toBe("clinicaA");
  });

  it("retorna null quando nenhum candidato existe", async () => {
    const { db } = makeDb();
    getDb.mockReturnValue(db);
    expect(await resolverClinicaPorNumero("5591985156690")).toBeNull();
  });

  it("retorna null sem Admin SDK", async () => {
    getDb.mockReturnValue(null);
    expect(await resolverClinicaPorNumero("5591985156690")).toBeNull();
  });
});
