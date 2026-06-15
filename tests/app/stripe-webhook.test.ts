import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks dos colaboradores externos do webhook (Firestore Admin, Stripe SDK e
// Zapier). Nenhum teste toca rede, Firebase ou Stripe de verdade.
// ---------------------------------------------------------------------------
const { constructEvent, getDb, sendZapier } = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  getDb: vi.fn(),
  sendZapier: vi.fn(),
}));

vi.mock("@/lib/stripe/server", () => ({
  getStripe: () => ({ webhooks: { constructEvent } }),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getFirebaseAdminDb: getDb,
}));

vi.mock("@/lib/zapier", () => ({
  sendZapierEvent: sendZapier,
}));

import { POST } from "@/app/api/stripe/webhook/route";

/** Firestore falso que grava cada `.set()` para inspeção. */
function makeDb() {
  const writes: Array<{
    collection: string;
    doc: string;
    data: any;
    options: any;
  }> = [];
  const db = {
    collection: (collection: string) => ({
      doc: (doc: string) => ({
        set: async (data: any, options: any) => {
          writes.push({ collection, doc, data, options });
        },
      }),
    }),
  };
  const clinicWrite = (uid: string) =>
    writes.find((w) => w.collection === "clinicas" && w.doc === uid);
  const eventWrite = (id: string) =>
    writes.find((w) => w.collection === "stripe_events" && w.doc === id);
  return { db, writes, clinicWrite, eventWrite };
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
  getDb.mockReset();
  sendZapier.mockReset().mockResolvedValue({ sent: false, reason: "not_configured" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("Stripe webhook — guardas de entrada", () => {
  it("retorna 503 sem STRIPE_WEBHOOK_SECRET", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    const res = await POST(webhookRequest());
    expect(res.status).toBe(503);
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
    const res = await POST(webhookRequest());
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({
      error: expect.stringContaining("signature"),
    });
  });
});

describe("Stripe webhook — checkout.session.completed", () => {
  it("ativa o billing da clínica quando há firebase_uid", async () => {
    const { db, clinicWrite, eventWrite } = makeDb();
    getDb.mockReturnValue(db);
    constructEvent.mockReturnValue(
      checkoutEvent({
        id: "cs_1",
        metadata: { firebase_uid: "uid_1", plan: "pro" },
        payment_status: "paid",
        customer: "cus_1",
        subscription: "sub_1",
        customer_details: { email: "ana@exemplo.com" },
      })
    );

    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ received: true });

    // Evento registrado em stripe_events (idempotência).
    expect(eventWrite("evt_checkout_1")).toBeTruthy();

    // Billing da clínica atualizado com merge.
    const w = clinicWrite("uid_1");
    expect(w).toBeTruthy();
    expect(w!.options).toEqual({ merge: true });
    expect(w!.data.billing).toMatchObject({
      plan: "pro",
      status: "paid",
      stripe_customer_id: "cus_1",
      stripe_checkout_session_id: "cs_1",
      stripe_subscription_id: "sub_1",
    });
    expect(typeof w!.data.billing.updated_at).toBe("string");

    expect(sendZapier).toHaveBeenCalledWith(
      "stripe.checkout.completed",
      expect.objectContaining({ plan: "pro", firebase_uid: "uid_1" })
    );
  });

  it("usa client_reference_id como fallback de uid", async () => {
    const { db, clinicWrite } = makeDb();
    getDb.mockReturnValue(db);
    constructEvent.mockReturnValue(
      checkoutEvent({
        id: "cs_2",
        metadata: { plan: "start" }, // sem firebase_uid
        client_reference_id: "uid_ref",
        payment_status: "paid",
        customer: { id: "cus_2" }, // objeto, não string
      })
    );

    await POST(webhookRequest());
    const w = clinicWrite("uid_ref");
    expect(w).toBeTruthy();
    expect(w!.data.billing.stripe_customer_id).toBe("cus_2");
  });

  // Regressão do bug "paga mas não ativa": checkout de convidado (sem uid).
  it("NÃO ativa nenhuma clínica quando falta uid (guest checkout)", async () => {
    const { db, writes, eventWrite } = makeDb();
    getDb.mockReturnValue(db);
    constructEvent.mockReturnValue(
      checkoutEvent({
        id: "cs_guest",
        metadata: { plan: "pro" }, // sem firebase_uid
        // sem client_reference_id
        payment_status: "paid",
        customer: "cus_guest",
      })
    );

    const res = await POST(webhookRequest());
    expect(res.status).toBe(200); // webhook ainda confirma recebimento

    // O evento é registrado, mas nenhuma clínica é atualizada -> billing fica órfão.
    expect(eventWrite("evt_checkout_1")).toBeTruthy();
    expect(writes.some((w) => w.collection === "clinicas")).toBe(false);
  });

  it("não grava nada quando o Firebase Admin não está configurado (db nulo)", async () => {
    getDb.mockReturnValue(null);
    constructEvent.mockReturnValue(
      checkoutEvent({
        id: "cs_3",
        metadata: { firebase_uid: "uid_x", plan: "pro" },
        payment_status: "paid",
        customer: "cus_3",
      })
    );

    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);
    // Zapier ainda é chamado mesmo sem Firestore.
    expect(sendZapier).toHaveBeenCalled();
  });
});

describe("Stripe webhook — eventos de assinatura", () => {
  it("mapeia subscription.status para o billing da clínica", async () => {
    const { db, clinicWrite } = makeDb();
    getDb.mockReturnValue(db);
    constructEvent.mockReturnValue(
      subscriptionEvent({
        id: "sub_active",
        object: "subscription",
        status: "active",
        metadata: { firebase_uid: "uid_sub", plan: "premium" },
        customer: "cus_sub",
        items: { data: [{ current_period_end: 1_800_000_000 }] },
      })
    );

    const res = await POST(webhookRequest());
    expect(res.status).toBe(200);

    const w = clinicWrite("uid_sub");
    expect(w!.data.billing).toMatchObject({
      plan: "premium",
      status: "active",
      stripe_customer_id: "cus_sub",
      stripe_subscription_id: "sub_active",
    });
    expect(typeof w!.data.billing.current_period_end).toBe("string");

    expect(sendZapier).toHaveBeenCalledWith(
      "stripe.subscription.active",
      expect.objectContaining({ status: "active", firebase_uid: "uid_sub" })
    );
  });

  it("não atualiza clínica em assinatura sem firebase_uid", async () => {
    const { db, writes } = makeDb();
    getDb.mockReturnValue(db);
    constructEvent.mockReturnValue(
      subscriptionEvent({
        id: "sub_orfa",
        object: "subscription",
        status: "active",
        metadata: {},
        customer: "cus_orfa",
        items: { data: [{}] },
      })
    );

    await POST(webhookRequest());
    expect(writes.some((w) => w.collection === "clinicas")).toBe(false);
  });
});

describe("Stripe webhook — tipos não tratados e falhas", () => {
  it("ignora tipos de evento desconhecidos mas registra o evento", async () => {
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
    expect(writes.some((w) => w.collection === "clinicas")).toBe(false);
  });

  it("retorna 500 quando o processamento do evento lança", async () => {
    getDb.mockReturnValue({
      collection: () => ({
        doc: () => ({
          set: async () => {
            throw new Error("Firestore indisponível");
          },
        }),
      }),
    });
    constructEvent.mockReturnValue(
      checkoutEvent({
        id: "cs_err",
        metadata: { firebase_uid: "uid_err", plan: "pro" },
        payment_status: "paid",
        customer: "cus_err",
      })
    );

    const res = await POST(webhookRequest());
    expect(res.status).toBe(500);
  });
});
