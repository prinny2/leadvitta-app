import { describe, it, expect, beforeEach, vi } from "vitest";

// Firestore Admin falso (com runTransaction) + FieldValue.increment mockado, para
// testar a reserva ATÔMICA do plano grátis sem Firebase real.
const { getDb } = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("@/lib/firebase/admin", () => ({ getFirebaseAdminDb: getDb }));
vi.mock("firebase-admin/firestore", () => ({
  FieldValue: { increment: (n: number) => ({ __increment: n }) },
}));

import { reserveGeneration, releaseGeneration } from "@/lib/usage-limit";
import { TRIAL_DAYS, trialDaysLeft } from "@/lib/free-limit";

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS).toISOString();

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
    expect(res.remaining).toBe(TRIAL_DAYS);
    expect(res.reserved).toBe(true);
    expect(sets[0].data.usage.free_generations).toEqual({ __increment: 1 });
  });

  it("primeira geração: permite, reserva, incrementa e marca o início do teste", async () => {
    const { db, sets } = makeFirestore({ "clinicas/u1": {} });
    getDb.mockReturnValue(db);
    const res = await reserveGeneration("u1");
    expect(res).toEqual({
      allowed: true,
      paid: false,
      used: 0,
      remaining: TRIAL_DAYS,
      reserved: true,
    });
    expect(sets).toHaveLength(1);
    expect(sets[0].merge).toBe(true);
    expect(sets[0].data.usage.free_generations).toEqual({ __increment: 1 });
    expect(Date.parse(sets[0].data.usage.trial_started_at)).not.toBeNaN();
  });

  it("teste em andamento: calcula os dias e não reinicia o prazo", async () => {
    const { db, sets } = makeFirestore({
      "clinicas/u1": { usage: { free_generations: 3, trial_started_at: daysAgo(2) } },
    });
    getDb.mockReturnValue(db);
    const res = await reserveGeneration("u1");
    expect(res.used).toBe(3);
    expect(res.remaining).toBe(5);
    expect(res.allowed).toBe(true);
    expect(res.reserved).toBe(true);
    expect(sets[0].data.usage).not.toHaveProperty("trial_started_at");
  });

  it("volume não encerra o teste: só o prazo bloqueia", async () => {
    const { db } = makeFirestore({
      "clinicas/u1": { usage: { free_generations: 200, trial_started_at: daysAgo(1) } },
    });
    getDb.mockReturnValue(db);
    const res = await reserveGeneration("u1");
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(6);
  });

  it("teste vencido: bloqueia (allowed=false, reserved=false, sem incremento)", async () => {
    const { db, sets } = makeFirestore({
      "clinicas/u1": { usage: { free_generations: 5, trial_started_at: daysAgo(7) } },
    });
    getDb.mockReturnValue(db);
    const res = await reserveGeneration("u1");
    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);
    expect(res.reserved).toBe(false);
    expect(sets).toHaveLength(0); // bloqueado não pode incrementar
  });

  it("conta antiga que usou as 5 respostas ganha os 7 dias", async () => {
    const { db, sets } = makeFirestore({
      "clinicas/u1": { usage: { free_generations: 5 } },
    });
    getDb.mockReturnValue(db);
    const res = await reserveGeneration("u1");
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(TRIAL_DAYS);
    expect(sets[0].data.usage.trial_started_at).toBeTypeOf("string");
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

describe("trialDaysLeft", () => {
  const start = "2026-11-06T12:00:00.000Z";
  const at = (iso: string) => Date.parse(iso);

  it("teste não iniciado ou data inválida tem os 7 dias inteiros", () => {
    expect(trialDaysLeft(undefined)).toBe(7);
    expect(trialDaysLeft("não é data")).toBe(7);
  });

  it("arredonda para cima e zera no fim exato do prazo", () => {
    expect(trialDaysLeft(start, at("2026-11-06T12:00:00.000Z"))).toBe(7);
    expect(trialDaysLeft(start, at("2026-11-06T12:00:01.000Z"))).toBe(7);
    expect(trialDaysLeft(start, at("2026-11-13T11:59:59.000Z"))).toBe(1);
    expect(trialDaysLeft(start, at("2026-11-13T12:00:00.000Z"))).toBe(0);
    expect(trialDaysLeft(start, at("2026-12-01T12:00:00.000Z"))).toBe(0);
  });

  it("data futura não dá mais que 7 dias", () => {
    expect(trialDaysLeft("2027-01-01T00:00:00.000Z", at(start))).toBe(7);
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
