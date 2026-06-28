import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Estado mutável compartilhado com os mocks (ajustado por teste).
const cfg = vi.hoisted(() => ({
  isFirebaseConfigured: false,
  isStripeConfigured: true,
  siteUrl: "http://localhost:3000",
}));
const billingState = vi.hoisted(() => ({
  priceId: "price_1Tj5j8RTJ7iCFKxkiXFVTyx1",
  mode: "payment",
  disponivel: true,
}));
const { verifyToken, sessionsCreate, sendOps } = vi.hoisted(() => ({
  verifyToken: vi.fn(),
  sessionsCreate: vi.fn(),
  sendOps: vi.fn(),
}));

vi.mock("@/lib/config", () => cfg);

vi.mock("@/lib/billing", () => ({
  parseBillingPlan: (v: unknown) =>
    v === "start" || v === "pro" || v === "premium" ? v : null,
  getBillingPlan: (p: string) => ({
    id: p,
    label: p,
    priceLabel: "x",
    disponivel: billingState.disponivel,
    priceId: billingState.priceId,
  }),
  getStripeCheckoutMode: () => billingState.mode,
}));

vi.mock("@/lib/firebase/admin", () => ({
  verifyFirebaseIdToken: verifyToken,
}));

vi.mock("@/lib/stripe/server", () => ({
  getStripe: () => ({ checkout: { sessions: { create: sessionsCreate } } }),
}));

vi.mock("@/lib/ops-notify", () => ({
  sendOpsNotify: sendOps,
}));

import { POST } from "@/app/api/stripe/checkout/route";

function checkoutRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/stripe/checkout", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  cfg.isFirebaseConfigured = false;
  cfg.isStripeConfigured = true;
  cfg.siteUrl = "http://localhost:3000";
  billingState.priceId = "price_1Tj5j8RTJ7iCFKxkiXFVTyx1";
  billingState.mode = "payment";
  billingState.disponivel = true;
  verifyToken.mockReset().mockResolvedValue(null);
  sessionsCreate.mockReset().mockResolvedValue({ id: "cs_new", url: "https://stripe/checkout/cs_new" });
  sendOps.mockReset().mockResolvedValue({ sent: false, reason: "not_configured" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Stripe checkout — validações", () => {
  it("rejeita plano inválido com 400", async () => {
    const res = await POST(checkoutRequest({ plan: "enterprise" }));
    expect(res.status).toBe(400);
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it("retorna 503 quando falta o price id do plano", async () => {
    billingState.priceId = undefined as unknown as string;
    const res = await POST(checkoutRequest({ plan: "pro" }));
    expect(res.status).toBe(503);
  });

  it("retorna 503 quando o Stripe não está configurado", async () => {
    cfg.isStripeConfigured = false;
    const res = await POST(checkoutRequest({ plan: "pro" }));
    expect(res.status).toBe(503);
  });

  it("retorna 503 quando o price id não é da conta LeadBellus esperada", async () => {
    billingState.priceId = "price_1ThIde6Qz7MOnODLInHcArD4";
    const res = await POST(checkoutRequest({ plan: "pro" }));
    expect(res.status).toBe(503);
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it("retorna 400 quando o plano ainda não está disponível", async () => {
    billingState.disponivel = false;
    const res = await POST(checkoutRequest({ plan: "premium" }));
    expect(res.status).toBe(400);
    expect(sessionsCreate).not.toHaveBeenCalled();
  });
});

describe("Stripe checkout — criação da sessão", () => {
  it("propaga firebase_uid e client_reference_id para o usuário logado", async () => {
    cfg.isFirebaseConfigured = true;
    verifyToken.mockResolvedValue({ uid: "uid_1", email: "ana@exemplo.com" });

    const res = await POST(
      checkoutRequest({ plan: "pro", firebaseIdToken: "tok" })
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      url: "https://stripe/checkout/cs_new",
    });

    const params = sessionsCreate.mock.calls[0][0];
    expect(params.client_reference_id).toBe("uid_1");
    expect(params.customer_email).toBe("ana@exemplo.com");
    expect(params.metadata).toMatchObject({
      plan: "pro",
      firebase_uid: "uid_1",
      firebase_email: "ana@exemplo.com",
    });
    // Modo payment embute metadata no payment_intent.
    expect(params.payment_intent_data.metadata.firebase_uid).toBe("uid_1");

    expect(sendOps).toHaveBeenCalledWith(
      "checkout.started",
      expect.objectContaining({ firebase_uid: "uid_1", plan: "pro" })
    );
  });

  // Documenta a origem do bug "paga mas não ativa": checkout de convidado
  // gera metadata.firebase_uid VAZIO, e o webhook não consegue mapear a clínica.
  it("permite guest checkout mas grava firebase_uid vazio (Firebase off)", async () => {
    cfg.isFirebaseConfigured = false;
    verifyToken.mockResolvedValue(null);

    const res = await POST(
      checkoutRequest({ plan: "pro", customerEmail: "guest@exemplo.com" })
    );
    expect(res.status).toBe(200);

    const params = sessionsCreate.mock.calls[0][0];
    expect(params.metadata.firebase_uid).toBe("");
    expect(params.client_reference_id).toBeUndefined();
    expect(params.customer_email).toBe("guest@exemplo.com");
  });

  it("usa subscription_data no modo subscription", async () => {
    billingState.mode = "subscription";
    const res = await POST(checkoutRequest({ plan: "premium" }));
    expect(res.status).toBe(200);
    const params = sessionsCreate.mock.calls[0][0];
    expect(params.mode).toBe("subscription");
    expect(params.subscription_data.metadata.plan).toBe("premium");
    expect(params.payment_intent_data).toBeUndefined();
  });

  it("retorna 500 quando a criação da sessão falha no Stripe", async () => {
    sessionsCreate.mockRejectedValue(new Error("Stripe down"));
    const res = await POST(checkoutRequest({ plan: "pro" }));
    expect(res.status).toBe(500);
  });
});
