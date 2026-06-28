import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ---------------------------------------------------------------------------
// O webhook delega a persistência para lib/stripe/billing-sync. Mockamos essa
// camada (e o SDK Stripe / Firestore Admin) para testar o roteamento de eventos
// sem rede, Firebase ou Stripe reais.
// ---------------------------------------------------------------------------
const { constructEvent, subRetrieve, getDb } = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  subRetrieve: vi.fn(),
  getDb: vi.fn(),
}));
const { applyClinicBilling, saveBillingPending, syncSubscriptionBilling } =
  vi.hoisted(() => ({
    applyClinicBilling: vi.fn(),
    saveBillingPending: vi.fn(),
    syncSubscriptionBilling: vi.fn(),
  }));
const sendOps = vi.hoisted(() => vi.fn());

vi.mock("@/lib/stripe/server", () => ({
  getStripe: () => ({
    webhooks: { constructEvent },
    subscriptions: { retrieve: subRetrieve },
  }),
}));

vi.mock("@/lib/stripe/billing-sync", () => ({
  applyClinicBilling,
  saveBillingPending,
  syncSubscriptionBilling,
}));

vi.mock("@/lib/firebase/admin", () => ({ getFirebaseAdminDb: getDb }));
vi.mock("@/lib/ops-notify", () => ({ sendOpsNotify: sendOps }));

import { POST } from "@/app/api/stripe/webhook/route";

function makeDb() {
  const writes: Array<{ collection: string; doc: string }> = [];
  const db = {
    collection: (collection: string) => ({
      doc: (doc: string) => ({
        set: async () => {
          writes.push({ collection, doc });
        },
      }),
    }),
  };
  return { db, writes };
}

function webhookRequest(body = "{}", signature: string | null = "sig_123") {
  const headers: Record<string, string> = {};
  if (signature !== null) headers["stripe-signature"] = signature;
  return new Request("http://localhost:3000/api/stripe/webhook", {
    method: "POST",
    headers,
    body,
  });
}

function checkoutEvent(session: Record<string, unknown>) {
  return {
    id: "evt_checkout_1",
    type: "checkout.session.completed",
    livemode: false,
    created: 1_700_000_000,
    data: { object: session },
  } as any;
}

function subscriptionEvent(subscription: Record<string, unknown>) {
  return {
    id: "evt_sub_1",
    type: "customer.subscription.updated",
    livemode: false,
    created: 1_700_000_000,
    data: { object: subscription },
  } as any;
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
  constructEvent.mockReset();
  subRetrieve.mockReset();
  getDb.mockReset().mockReturnValue(makeDb().db);
  applyClinicBilling.mockReset().mockResolvedValue(undefined);
  saveBillingPending.mockReset().mockResolvedValue(undefined);
  syncSubscriptionBilling.mockReset().mockResolvedValue("clinica");
  sendOps
    .mockReset()
    .mockResolvedValue({ sent: false, reason: "not_configured" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("Stripe webhook — guardas de entrada", () => {
  it("retorna 503 sem STRIPE_WEBHOOK_SECRET", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    expect((await POST(webhookRequest())).status).toBe(503);
  });

  it("retorna 400 sem header stripe-signature", async () => {
    const res = await POST(webhookRequest("{}", null));
    expect(res.status).toBe(400);
    expect(constructEvent).not.toHaveBeenCalled();
  });

  it("retorna 400 quando a assinatura é inválida", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });
    expect((await POST(webhookRequest())).status).toBe(400);
  });
});

describe("Stripe webhook — checkout.session.completed", () => {
  it("ativa o billing por firebase_uid (pagamento avulso)", async () => {
    constructEvent.mockReturnValue(
      checkoutEvent({
        id: "cs_1",
        metadata: { firebase_uid: "uid_1", plan: "pro" },
        payment_status: "paid",
        customer: "cus_1",
        customer_details: { email: "ana@exemplo.com" },
      }),
    );

    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ received: true });

    expect(applyClinicBilling).toHaveBeenCalledTimes(1);
    const [uid, billing] = applyClinicBilling.mock.calls[0];
    expect(uid).toBe("uid_1");
    expect(billing).toMatchObject({
      plan: "pro",
      status: "paid",
      stripe_customer_id: "cus_1",
      stripe_checkout_session_id: "cs_1",
    });
    expect(saveBillingPending).not.toHaveBeenCalled();
    expect(sendOps).toHaveBeenCalledWith(
      "stripe.checkout.completed",
      expect.objectContaining({ firebase_uid: "uid_1" }),
    );
  });

  it("resolve o status pela assinatura quando o checkout cria uma subscription", async () => {
    subRetrieve.mockResolvedValue({ status: "active" });
    constructEvent.mockReturnValue(
      checkoutEvent({
        id: "cs_sub",
        metadata: { firebase_uid: "uid_2", plan: "pro" },
        payment_status: "paid",
        subscription: "sub_1",
        customer: "cus_2",
      }),
    );

    await POST(webhookRequest());
    expect(subRetrieve).toHaveBeenCalledWith("sub_1");
    expect(applyClinicBilling.mock.calls[0][1]).toMatchObject({
      status: "active",
    });
  });

  // Reconciliação do "paga mas não ativa": guest checkout guarda por e-mail.
  it("guest checkout (sem uid) com e-mail salva billing_pending", async () => {
    constructEvent.mockReturnValue(
      checkoutEvent({
        id: "cs_guest",
        metadata: { plan: "pro" },
        payment_status: "paid",
        customer: "cus_guest",
        customer_details: { email: "guest@exemplo.com" },
      }),
    );

    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);
    expect(applyClinicBilling).not.toHaveBeenCalled();
    expect(saveBillingPending).toHaveBeenCalledTimes(1);
    expect(saveBillingPending.mock.calls[0][0]).toBe("guest@exemplo.com");
  });

  it("sem uid e sem e-mail não persiste billing (mas confirma 200)", async () => {
    constructEvent.mockReturnValue(
      checkoutEvent({
        id: "cs_orfao",
        metadata: { plan: "pro" },
        payment_status: "paid",
        customer: "cus_x",
      }),
    );

    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);
    expect(applyClinicBilling).not.toHaveBeenCalled();
    expect(saveBillingPending).not.toHaveBeenCalled();
  });
});

describe("Stripe webhook — eventos de assinatura", () => {
  it("delega para syncSubscriptionBilling", async () => {
    constructEvent.mockReturnValue(
      subscriptionEvent({
        id: "sub_evt",
        object: "subscription",
        status: "active",
        metadata: { firebase_uid: "uid_sub", plan: "premium" },
        customer: "cus_sub",
        items: { data: [{ current_period_end: 1_800_000_000 }] },
      }),
    );

    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);
    expect(syncSubscriptionBilling).toHaveBeenCalledTimes(1);
    expect(sendOps).toHaveBeenCalledWith(
      "stripe.subscription.active",
      expect.objectContaining({ firebase_uid: "uid_sub" }),
    );
  });
});

describe("Stripe webhook — tipos não tratados e falhas", () => {
  it("ignora tipos desconhecidos mas registra o evento e confirma 200", async () => {
    const { db, writes } = makeDb();
    getDb.mockReturnValue(db);
    constructEvent.mockReturnValue({
      id: "evt_other",
      type: "invoice.paid",
      livemode: false,
      created: 1,
      data: { object: {} },
    } as any);

    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);
    expect(writes.some((w) => w.collection === "stripe_events")).toBe(true);
    expect(applyClinicBilling).not.toHaveBeenCalled();
    expect(syncSubscriptionBilling).not.toHaveBeenCalled();
  });

  it("retorna 500 quando o processamento lança", async () => {
    applyClinicBilling.mockRejectedValue(new Error("Firestore indisponível"));
    constructEvent.mockReturnValue(
      checkoutEvent({
        id: "cs_err",
        metadata: { firebase_uid: "uid_err", plan: "pro" },
        payment_status: "paid",
        customer: "cus_err",
      }),
    );

    expect((await POST(webhookRequest())).status).toBe(500);
  });
});
