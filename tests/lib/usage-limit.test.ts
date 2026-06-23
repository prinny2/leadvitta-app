import { describe, it, expect, beforeEach, vi } from "vitest";

// Firestore Admin falso + FieldValue.increment mockado, para testar o portão do
// plano grátis (limite de gerações) sem Firebase real.
const { getDb } = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("@/lib/firebase/admin", () => ({ getFirebaseAdminDb: getDb }));
vi.mock("firebase-admin/firestore", () => ({
  FieldValue: { increment: (n: number) => ({ __increment: n }) },
}));

import {
  checkGenerationLimit,
  incrementFreeUsage,
  FREE_GENERATION_LIMIT,
} from "@/lib/usage-limit";

function makeFirestore(seed: Record<string, any> = {}) {
  const store = new Map<string, any>(Object.entries(seed));
  const sets: Array<{ path: string; data: any; merge?: boolean }> = [];
  const docRef = (path: string) => ({
    async get() {
      return { exists: store.has(path), data: () => store.get(path) };
    },
    async set(data: any, opts?: { merge?: boolean }) {
      sets.push({ path, data, merge: opts?.merge });
      const prev = store.get(path) || {};
      store.set(path, opts?.merge ? { ...prev, ...data } : data);
    },
  });
  const db = { collection: (c: string) => ({ doc: (d: string) => docRef(`${c}/${d}`) }) };
  return { db, store, sets };
}

beforeEach(() => {
  getDb.mockReset();
});

describe("checkGenerationLimit", () => {
  it("falha ABERTO (ilimitado) quando não há Admin SDK", async () => {
    getDb.mockReturnValue(null);
    const res = await checkGenerationLimit("u1");
    expect(res.allowed).toBe(true);
    expect(res.paid).toBe(true);
    expect(res.remaining).toBe(Number.POSITIVE_INFINITY);
  });

  it("usuário pagante (status active) → ilimitado", async () => {
    const { db } = makeFirestore({
      "clinicas/u1": { billing: { status: "active" } },
    });
    getDb.mockReturnValue(db);
    const res = await checkGenerationLimit("u1");
    expect(res).toEqual({
      allowed: true,
      paid: true,
      used: 0,
      remaining: Number.POSITIVE_INFINITY,
    });
  });

  it.each(["trialing", "past_due"])(
    "status pagante '%s' também libera ilimitado",
    async (status) => {
      const { db } = makeFirestore({ "clinicas/u1": { billing: { status } } });
      getDb.mockReturnValue(db);
      const res = await checkGenerationLimit("u1");
      expect(res.paid).toBe(true);
      expect(res.allowed).toBe(true);
    }
  );

  it("status NÃO pagante (canceled) cai no caminho grátis", async () => {
    const { db } = makeFirestore({
      "clinicas/u1": { billing: { status: "canceled" } },
    });
    getDb.mockReturnValue(db);
    const res = await checkGenerationLimit("u1");
    expect(res.paid).toBe(false);
    expect(res.remaining).toBe(FREE_GENERATION_LIMIT);
  });

  it("grátis sem uso prévio: permite e conta o limite cheio", async () => {
    const { db } = makeFirestore({ "clinicas/u1": {} });
    getDb.mockReturnValue(db);
    const res = await checkGenerationLimit("u1");
    expect(res).toEqual({
      allowed: true,
      paid: false,
      used: 0,
      remaining: FREE_GENERATION_LIMIT,
    });
  });

  it("grátis com uso parcial calcula o restante", async () => {
    const { db } = makeFirestore({
      "clinicas/u1": { usage: { free_generations: 3 } },
    });
    getDb.mockReturnValue(db);
    const res = await checkGenerationLimit("u1");
    expect(res.used).toBe(3);
    expect(res.remaining).toBe(FREE_GENERATION_LIMIT - 3);
    expect(res.allowed).toBe(true);
  });

  it("grátis no limite: bloqueia (allowed=false, remaining=0)", async () => {
    const { db } = makeFirestore({
      "clinicas/u1": { usage: { free_generations: FREE_GENERATION_LIMIT } },
    });
    getDb.mockReturnValue(db);
    const res = await checkGenerationLimit("u1");
    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);
  });

  it("não fica negativo se o uso ultrapassou o limite", async () => {
    const { db } = makeFirestore({
      "clinicas/u1": { usage: { free_generations: FREE_GENERATION_LIMIT + 10 } },
    });
    getDb.mockReturnValue(db);
    const res = await checkGenerationLimit("u1");
    expect(res.remaining).toBe(0);
    expect(res.allowed).toBe(false);
  });

  it("doc inexistente é tratado como grátis sem uso", async () => {
    const { db } = makeFirestore();
    getDb.mockReturnValue(db);
    const res = await checkGenerationLimit("desconhecido");
    expect(res.allowed).toBe(true);
    expect(res.used).toBe(0);
  });
});

describe("incrementFreeUsage", () => {
  it("é no-op sem Admin SDK", async () => {
    getDb.mockReturnValue(null);
    await expect(incrementFreeUsage("u1")).resolves.toBeUndefined();
  });

  it("faz merge incrementando o contador de gerações grátis", async () => {
    const { db, sets } = makeFirestore({ "clinicas/u1": {} });
    getDb.mockReturnValue(db);

    await incrementFreeUsage("u1");
    expect(sets).toHaveLength(1);
    expect(sets[0].merge).toBe(true);
    expect(sets[0].data.usage.free_generations).toEqual({ __increment: 1 });
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
    await expect(incrementFreeUsage("u1")).resolves.toBeUndefined();
  });
});
