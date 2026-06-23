import { describe, it, expect, beforeEach, vi } from "vitest";

// Firestore Admin falso (com runTransaction) + FieldValue.increment mockado, para
// testar a reserva ATÔMICA do plano grátis sem Firebase real.
const { getDb } = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("@/lib/firebase/admin", () => ({ getFirebaseAdminDb: getDb }));
vi.mock("firebase-admin/firestore", () => ({
  FieldValue: { increment: (n: number) => ({ __increment: n }) },
}));

import {
  reserveGeneration,
  releaseGeneration,
  FREE_GENERATION_LIMIT,
} from "@/lib/usage-limit";

function makeFirestore(seed: Record<string, any> = {}) {
  const store = new Map<string, any>(Object.entries(seed));
  const sets: Array<{ path: string; data: any; merge?: boolean }> = [];
  const read = (path: string) => ({ exists: store.has(path), data: () => store.get(path) });
  const write = (path: string, data: any, opts?: { merge?: boolean }) => {
    sets.push({ path, data, merge: opts?.merge });
    const prev = store.get(path) || {};
    store.set(path, opts?.merge ? { ...prev, ...data } : data);
  };
  const docRef = (path: string) => ({
    __path: path,
    async get() {
      return read(path);
    },
    async set(data: any, opts?: { merge?: boolean }) {
      write(path, data, opts);
    },
  });
  const db = {
    collection: (c: string) => ({ doc: (d: string) => docRef(`${c}/${d}`) }),
    async runTransaction(fn: (tx: any) => Promise<any>) {
      const tx = {
        async get(ref: any) {
          return read(ref.__path);
        },
        set(ref: any, data: any, opts?: { merge?: boolean }) {
          write(ref.__path, data, opts);
        },
      };
      return fn(tx);
    },
  };
  return { db, store, sets };
}

beforeEach(() => {
  getDb.mockReset();
});

describe("reserveGeneration", () => {
  it("falha ABERTO (ilimitado) quando não há Admin SDK", async () => {
    getDb.mockReturnValue(null);
    const res = await reserveGeneration("u1");
    expect(res.allowed).toBe(true);
    expect(res.paid).toBe(true);
    expect(res.reserved).toBe(false);
    expect(res.remaining).toBe(Number.POSITIVE_INFINITY);
  });

  it("usuário pagante (status active) → ilimitado e NÃO reserva", async () => {
    const { db, sets } = makeFirestore({
      "clinicas/u1": { billing: { status: "active" } },
    });
    getDb.mockReturnValue(db);
    const res = await reserveGeneration("u1");
    expect(res).toEqual({
      allowed: true,
      paid: true,
      used: 0,
      remaining: Number.POSITIVE_INFINITY,
      reserved: false,
    });
    expect(sets).toHaveLength(0); // pagante não incrementa contador
  });

  it.each(["trialing", "past_due"])(
    "status pagante '%s' também libera ilimitado",
    async (status) => {
      const { db } = makeFirestore({ "clinicas/u1": { billing: { status } } });
      getDb.mockReturnValue(db);
      const res = await reserveGeneration("u1");
      expect(res.paid).toBe(true);
      expect(res.allowed).toBe(true);
      expect(res.reserved).toBe(false);
    }
  );

  it("status NÃO pagante (canceled) cai no caminho grátis e reserva", async () => {
    const { db, sets } = makeFirestore({
      "clinicas/u1": { billing: { status: "canceled" } },
    });
    getDb.mockReturnValue(db);
    const res = await reserveGeneration("u1");
    expect(res.paid).toBe(false);
    expect(res.remaining).toBe(FREE_GENERATION_LIMIT);
    expect(res.reserved).toBe(true);
    expect(sets[0].data.usage.free_generations).toEqual({ __increment: 1 });
  });

  it("grátis sem uso prévio: permite, reserva e incrementa", async () => {
    const { db, sets } = makeFirestore({ "clinicas/u1": {} });
    getDb.mockReturnValue(db);
    const res = await reserveGeneration("u1");
    expect(res).toEqual({
      allowed: true,
      paid: false,
      used: 0,
      remaining: FREE_GENERATION_LIMIT,
      reserved: true,
    });
    expect(sets).toHaveLength(1);
    expect(sets[0].merge).toBe(true);
    expect(sets[0].data.usage.free_generations).toEqual({ __increment: 1 });
  });

  it("grátis com uso parcial calcula o restante e reserva", async () => {
    const { db } = makeFirestore({
      "clinicas/u1": { usage: { free_generations: 3 } },
    });
    getDb.mockReturnValue(db);
    const res = await reserveGeneration("u1");
    expect(res.used).toBe(3);
    expect(res.remaining).toBe(FREE_GENERATION_LIMIT - 3);
    expect(res.allowed).toBe(true);
    expect(res.reserved).toBe(true);
  });

  it("grátis no limite: bloqueia (allowed=false, reserved=false, sem incremento)", async () => {
    const { db, sets } = makeFirestore({
      "clinicas/u1": { usage: { free_generations: FREE_GENERATION_LIMIT } },
    });
    getDb.mockReturnValue(db);
    const res = await reserveGeneration("u1");
    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);
    expect(res.reserved).toBe(false);
    expect(sets).toHaveLength(0); // bloqueado não pode incrementar
  });

  it("não fica negativo se o uso ultrapassou o limite", async () => {
    const { db } = makeFirestore({
      "clinicas/u1": { usage: { free_generations: FREE_GENERATION_LIMIT + 10 } },
    });
    getDb.mockReturnValue(db);
    const res = await reserveGeneration("u1");
    expect(res.remaining).toBe(0);
    expect(res.allowed).toBe(false);
    expect(res.reserved).toBe(false);
  });

  it("doc inexistente é tratado como grátis sem uso", async () => {
    const { db } = makeFirestore();
    getDb.mockReturnValue(db);
    const res = await reserveGeneration("desconhecido");
    expect(res.allowed).toBe(true);
    expect(res.used).toBe(0);
    expect(res.reserved).toBe(true);
  });
});

describe("releaseGeneration", () => {
  it("é no-op sem Admin SDK", async () => {
    getDb.mockReturnValue(null);
    await expect(releaseGeneration("u1")).resolves.toBeUndefined();
  });

  it("decrementa o contador de gerações grátis (devolve o slot)", async () => {
    const { db, sets } = makeFirestore({
      "clinicas/u1": { usage: { free_generations: 3 } },
    });
    getDb.mockReturnValue(db);

    await releaseGeneration("u1");
    expect(sets).toHaveLength(1);
    expect(sets[0].merge).toBe(true);
    expect(sets[0].data.usage.free_generations).toEqual({ __increment: -1 });
  });

  it("não lança quando o set falha (falha silenciosa)", async () => {
    const db = {
      collection: () => ({
        doc: () => ({
          set: async () => {
            throw new Error("boom");
          },
        }),
      }),
    };
    getDb.mockReturnValue(db);
    await expect(releaseGeneration("u1")).resolves.toBeUndefined();
  });
});
