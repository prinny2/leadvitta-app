import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Firestore Admin falso, controlado por seed, para exercitar a lógica de
// reconciliação de billing sem Firebase real.
const { getDb } = vi.hoisted(() => ({ getDb: vi.fn() }));
vi.mock("@/lib/firebase/admin", () => ({ getFirebaseAdminDb: getDb }));

import {
  normalizeBillingEmail,
  applyClinicBilling,
  saveBillingPending,
  reconcileBillingForUser,
  resolveSubscriptionEmail,
  syncSubscriptionBilling,
} from "@/lib/stripe/billing-sync";

function makeFirestore(seed: Record<string, any> = {}) {
  const store = new Map<string, any>(Object.entries(seed));
  const deleted: string[] = [];
  const sets: Array<{ path: string; data: any; merge?: boolean }> = [];
  const docRef = (path: string) => ({
    async get() {
      return {
        exists: store.has(path),
        data: () => store.get(path),
        ref: docRef(path),
      };
    },
    async set(data: any, opts?: { merge?: boolean }) {
      sets.push({ path, data, merge: opts?.merge });
      const prev = store.get(path) || {};
      store.set(path, opts?.merge ? { ...prev, ...data } : data);
    },
    async delete() {
      deleted.push(path);
      store.delete(path);
    },
  });
  const db = {
    collection: (c: string) => ({ doc: (d: string) => docRef(`${c}/${d}`) }),
  };
  return { db, store, deleted, sets };
}

beforeEach(() => {
  getDb.mockReset();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("normalizeBillingEmail", () => {
  it("apara espaços e normaliza para minúsculas", () => {
    expect(normalizeBillingEmail("  Ana@Exemplo.COM ")).toBe("ana@exemplo.com");
  });
});

describe("applyClinicBilling", () => {
  it("grava billing em clinicas/{uid} com merge e updated_at", async () => {
    const fs = makeFirestore();
    getDb.mockReturnValue(fs.db);
    await applyClinicBilling("uid_1", { plan: "pro", status: "paid" });
    const w = fs.sets.find((s) => s.path === "clinicas/uid_1");
    expect(w?.merge).toBe(true);
    expect(w?.data.billing).toMatchObject({ plan: "pro", status: "paid" });
    expect(typeof w?.data.billing.updated_at).toBe("string");
  });

  it("é no-op sem db ou sem uid", async () => {
    getDb.mockReturnValue(null);
    await expect(applyClinicBilling("uid", {})).resolves.toBeUndefined();
    const fs = makeFirestore();
    getDb.mockReturnValue(fs.db);
    await applyClinicBilling("", { plan: "pro" });
    expect(fs.sets).toHaveLength(0);
  });
});

describe("saveBillingPending", () => {
  it("grava por e-mail normalizado em billing_pending", async () => {
    const fs = makeFirestore();
    getDb.mockReturnValue(fs.db);
    await saveBillingPending("Guest@Exemplo.com", {
      plan: "pro",
      status: "paid",
    });
    const w = fs.sets.find(
      (s) => s.path === "billing_pending/guest@exemplo.com",
    );
    expect(w).toBeTruthy();
    expect(w?.data).toMatchObject({ email: "guest@exemplo.com", plan: "pro" });
  });

  it("é no-op para e-mail vazio", async () => {
    const fs = makeFirestore();
    getDb.mockReturnValue(fs.db);
    await saveBillingPending("   ", { plan: "pro" });
    expect(fs.sets).toHaveLength(0);
  });
});

describe("reconcileBillingForUser", () => {
  it("liga a pendência por e-mail à clínica e apaga a pendência", async () => {
    const fs = makeFirestore({
      "billing_pending/ana@exemplo.com": {
        plan: "pro",
        status: "paid",
        stripe_customer_id: "cus_1",
        email: "ana@exemplo.com",
      },
    });
    getDb.mockReturnValue(fs.db);

    const res = await reconcileBillingForUser("uid_1", "Ana@Exemplo.com");
    expect(res).toEqual({ linked: true });

    const clinic = fs.store.get("clinicas/uid_1");
    expect(clinic.billing).toMatchObject({
      plan: "pro",
      stripe_customer_id: "cus_1",
      linked_from_email: "ana@exemplo.com",
    });
    expect(fs.deleted).toContain("billing_pending/ana@exemplo.com");
  });

  it("não religa quando a clínica já tem billing", async () => {
    const fs = makeFirestore({
      "clinicas/uid_1": { billing: { stripe_customer_id: "cus_existente" } },
    });
    getDb.mockReturnValue(fs.db);
    const res = await reconcileBillingForUser("uid_1", "ana@exemplo.com");
    expect(res).toEqual({ linked: false, reason: "ja_tem_billing" });
  });

  it("retorna sem_pendencia quando não há cobrança pendente para o e-mail", async () => {
    const fs = makeFirestore();
    getDb.mockReturnValue(fs.db);
    const res = await reconcileBillingForUser("uid_1", "ninguem@exemplo.com");
    expect(res).toEqual({ linked: false, reason: "sem_pendencia" });
  });

  it.each([
    ["sem_db", null, "uid", "a@b.com"],
    ["sem_uid", "db", "", "a@b.com"],
    ["sem_email", "db", "uid", ""],
  ])("retorna %s nos guardas iniciais", async (reason, dbKind, uid, email) => {
    const fs = makeFirestore();
    getDb.mockReturnValue(dbKind ? fs.db : null);
    const res = await reconcileBillingForUser(uid, email);
    expect(res).toEqual({ linked: false, reason });
  });
});

describe("resolveSubscriptionEmail", () => {
  it("prefere o e-mail dos metadados da assinatura", async () => {
    const stripe = { customers: { retrieve: vi.fn() } } as any;
    const email = await resolveSubscriptionEmail(
      {
        metadata: { firebase_email: "Meta@Exemplo.com" },
        customer: "cus_1",
      } as any,
      stripe,
    );
    expect(email).toBe("meta@exemplo.com");
    expect(stripe.customers.retrieve).not.toHaveBeenCalled();
  });

  it("busca no customer quando não há e-mail nos metadados", async () => {
    const stripe = {
      customers: {
        retrieve: vi.fn().mockResolvedValue({ email: "Cli@Exemplo.com" }),
      },
    } as any;
    const email = await resolveSubscriptionEmail(
      { metadata: {}, customer: "cus_2" } as any,
      stripe,
    );
    expect(stripe.customers.retrieve).toHaveBeenCalledWith("cus_2");
    expect(email).toBe("cli@exemplo.com");
  });

  it("retorna undefined quando o customer foi deletado", async () => {
    const stripe = {
      customers: { retrieve: vi.fn().mockResolvedValue({ deleted: true }) },
    } as any;
    const email = await resolveSubscriptionEmail(
      { metadata: {}, customer: "cus_3" } as any,
      stripe,
    );
    expect(email).toBeUndefined();
  });
});

describe("syncSubscriptionBilling", () => {
  const stripe = { customers: { retrieve: vi.fn() } } as any;

  function subscription(over: Record<string, any> = {}) {
    return {
      id: "sub_1",
      status: "active",
      customer: "cus_1",
      metadata: {},
      items: { data: [{ current_period_end: 1_800_000_000 }] },
      ...over,
    } as any;
  }

  it("aplica direto na clínica quando há firebase_uid", async () => {
    const fs = makeFirestore();
    getDb.mockReturnValue(fs.db);
    const out = await syncSubscriptionBilling(
      subscription({ metadata: { firebase_uid: "uid_1", plan: "pro" } }),
      stripe,
    );
    expect(out).toBe("clinica");
    expect(fs.store.get("clinicas/uid_1").billing).toMatchObject({
      status: "active",
      stripe_subscription_id: "sub_1",
    });
  });

  it("salva como pendência quando só há e-mail", async () => {
    const fs = makeFirestore();
    getDb.mockReturnValue(fs.db);
    const out = await syncSubscriptionBilling(
      subscription({ metadata: { firebase_email: "x@y.com" } }),
      stripe,
    );
    expect(out).toBe("pending");
    expect(fs.store.has("billing_pending/x@y.com")).toBe(true);
  });

  it("pula quando não há uid nem e-mail", async () => {
    const fs = makeFirestore();
    getDb.mockReturnValue(fs.db);
    const stripeNoEmail = {
      customers: { retrieve: vi.fn().mockResolvedValue({ email: null }) },
    } as any;
    const out = await syncSubscriptionBilling(subscription(), stripeNoEmail);
    expect(out).toBe("skipped");
  });
});
