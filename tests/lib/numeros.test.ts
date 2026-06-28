import { describe, it, expect, beforeEach, vi } from "vitest";

// Firestore Admin falso (com runTransaction) para exercitar o mapa canônico de
// números — reivindicar/liberar/resolver — sem Firebase real.
const { getDb } = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("@/lib/firebase/admin", () => ({ getFirebaseAdminDb: getDb }));

import {
  reivindicarNumero,
  liberarNumero,
  resolverClinicaPorNumero,
} from "@/lib/numeros";

function makeFirestore(seed: Record<string, any> = {}) {
  const store = new Map<string, any>(Object.entries(seed));
  const docRef = (path: string) => ({
    path,
    async get() {
      return { exists: store.has(path), data: () => store.get(path) };
    },
  });
  const tx = {
    async get(ref: { path: string }) {
      return { exists: store.has(ref.path), data: () => store.get(ref.path) };
    },
    set(ref: { path: string }, data: any, opts?: { merge?: boolean }) {
      const prev = store.get(ref.path) || {};
      store.set(ref.path, opts?.merge ? { ...prev, ...data } : data);
    },
    delete(ref: { path: string }) {
      store.delete(ref.path);
    },
  };
  const db = {
    collection: (c: string) => ({ doc: (d: string) => docRef(`${c}/${d}`) }),
    async runTransaction(fn: (t: typeof tx) => Promise<any>) {
      return fn(tx);
    },
  };
  return { db, store };
}

beforeEach(() => {
  getDb.mockReset();
});

describe("reivindicarNumero", () => {
  it("falha com sem_db quando não há Admin SDK", async () => {
    getDb.mockReturnValue(null);
    expect(await reivindicarNumero("c1", "11999998888")).toEqual({
      ok: false,
      motivo: "sem_db",
    });
  });

  it("falha com vazio quando o número não tem dígitos", async () => {
    const { db } = makeFirestore();
    getDb.mockReturnValue(db);
    expect(await reivindicarNumero("c1", "sem numero")).toEqual({
      ok: false,
      motivo: "vazio",
    });
  });

  it("reivindica um número livre e grava o mapa + a clínica", async () => {
    const { db, store } = makeFirestore();
    getDb.mockReturnValue(db);

    const res = await reivindicarNumero("c1", "+55 11 99999-8888");
    expect(res).toEqual({ ok: true, numero: "5511999998888" });
    expect(store.get("numeros_whatsapp/5511999998888")?.clinica_id).toBe("c1");
    expect(store.get("clinicas/c1")?.whatsapp).toBe("5511999998888");
  });

  it("bloqueia o sequestro: número já é de OUTRA clínica → em_uso", async () => {
    const { db, store } = makeFirestore({
      "numeros_whatsapp/5511999998888": { clinica_id: "outra" },
    });
    getDb.mockReturnValue(db);

    const res = await reivindicarNumero("c1", "5511999998888");
    expect(res).toEqual({ ok: false, motivo: "em_uso" });
    // não sobrescreve o dono original
    expect(store.get("numeros_whatsapp/5511999998888")?.clinica_id).toBe(
      "outra",
    );
  });

  it("é idempotente: reivindicar o mesmo número pela MESMA clínica funciona", async () => {
    const { db } = makeFirestore({
      "numeros_whatsapp/5511999998888": { clinica_id: "c1" },
    });
    getDb.mockReturnValue(db);
    const res = await reivindicarNumero("c1", "5511999998888");
    expect(res).toEqual({ ok: true, numero: "5511999998888" });
  });

  it("ao trocar de número, libera o antigo da própria clínica", async () => {
    const { db, store } = makeFirestore({
      "clinicas/c1": { whatsapp: "5511111111111" },
      "numeros_whatsapp/5511111111111": { clinica_id: "c1" },
    });
    getDb.mockReturnValue(db);

    const res = await reivindicarNumero("c1", "5511999998888");
    expect(res).toEqual({ ok: true, numero: "5511999998888" });
    expect(store.has("numeros_whatsapp/5511111111111")).toBe(false);
    expect(store.get("numeros_whatsapp/5511999998888")?.clinica_id).toBe("c1");
  });
});

describe("liberarNumero", () => {
  it("falha com sem_db quando não há Admin SDK", async () => {
    getDb.mockReturnValue(null);
    expect(await liberarNumero("c1")).toEqual({ ok: false, motivo: "sem_db" });
  });

  it("limpa o mapa e o campo whatsapp da clínica", async () => {
    const { db, store } = makeFirestore({
      "clinicas/c1": { whatsapp: "5511999998888" },
      "numeros_whatsapp/5511999998888": { clinica_id: "c1" },
    });
    getDb.mockReturnValue(db);

    const res = await liberarNumero("c1");
    expect(res).toEqual({ ok: true, numero: "" });
    expect(store.has("numeros_whatsapp/5511999998888")).toBe(false);
    expect(store.get("clinicas/c1")?.whatsapp).toBe("");
  });

  it("não quebra quando a clínica não tem número", async () => {
    const { db } = makeFirestore({ "clinicas/c1": {} });
    getDb.mockReturnValue(db);
    expect(await liberarNumero("c1")).toEqual({ ok: true, numero: "" });
  });
});

describe("resolverClinicaPorNumero", () => {
  it("devolve null sem Admin SDK", async () => {
    getDb.mockReturnValue(null);
    expect(await resolverClinicaPorNumero("5511999998888")).toBeNull();
  });

  it("acha a clínica por uma variante de DDI (sem 55 no mapa)", async () => {
    const { db } = makeFirestore({
      "numeros_whatsapp/11999998888": { clinica_id: "c1" },
    });
    getDb.mockReturnValue(db);
    // provedor entrega com 55; o mapa tem sem 55 → variante casa
    expect(await resolverClinicaPorNumero("5511999998888")).toBe("c1");
  });

  it("devolve null quando nenhuma variante existe", async () => {
    const { db } = makeFirestore();
    getDb.mockReturnValue(db);
    expect(await resolverClinicaPorNumero("5511999998888")).toBeNull();
  });
});
