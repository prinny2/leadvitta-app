import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  billingPlans,
  parseBillingPlan,
  getBillingPlan,
  getStripeCheckoutMode,
} from "@/lib/billing";

describe("parseBillingPlan", () => {
  it("aceita os três planos válidos", () => {
    expect(parseBillingPlan("start")).toBe("start");
    expect(parseBillingPlan("pro")).toBe("pro");
    expect(parseBillingPlan("premium")).toBe("premium");
  });

  it("retorna null para valores inválidos", () => {
    expect(parseBillingPlan("enterprise")).toBeNull();
    expect(parseBillingPlan("")).toBeNull();
    expect(parseBillingPlan(undefined)).toBeNull();
    expect(parseBillingPlan(null)).toBeNull();
    expect(parseBillingPlan(123)).toBeNull();
  });
});

describe("getBillingPlan", () => {
  it("retorna a configuração correspondente ao plano", () => {
    expect(getBillingPlan("pro")).toBe(billingPlans.pro);
    expect(getBillingPlan("pro").label).toBe("Pro");
    expect(getBillingPlan("start").priceLabel).toBe("R$97");
    expect(getBillingPlan("start").price).toBe(97);
  });

  it("cobre todos os planos do mapa", () => {
    for (const id of ["start", "pro", "premium"] as const) {
      expect(getBillingPlan(id).id).toBe(id);
    }
  });
});

describe("getStripeCheckoutMode", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("retorna 'payment' quando STRIPE_CHECKOUT_MODE=payment", () => {
    vi.stubEnv("STRIPE_CHECKOUT_MODE", "payment");
    expect(getStripeCheckoutMode()).toBe("payment");
  });

  it("retorna 'subscription' por padrão (produto é assinatura)", () => {
    vi.stubEnv("STRIPE_CHECKOUT_MODE", "");
    expect(getStripeCheckoutMode()).toBe("subscription");
  });

  it("retorna 'subscription' para qualquer outro valor", () => {
    vi.stubEnv("STRIPE_CHECKOUT_MODE", "qualquer-coisa");
    expect(getStripeCheckoutMode()).toBe("subscription");
  });
});

describe("billingPlans.start — disponibilidade", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function reimportBilling() {
    vi.resetModules();
    return (await import("@/lib/billing")).billingPlans;
  }

  it("fica indisponível e marcado 'Em breve' sem STRIPE_PRICE_ID_START", async () => {
    vi.stubEnv("STRIPE_PRICE_ID_START", "");
    const plans = await reimportBilling();
    expect(plans.start.disponivel).toBe(false);
    expect(plans.start.selo).toBe("Em breve");
  });

  it("fica vendável quando o price id existe", async () => {
    vi.stubEnv("STRIPE_PRICE_ID_START", "price_123");
    const plans = await reimportBilling();
    expect(plans.start.disponivel).toBe(true);
    expect(plans.start.selo).toBe("Preço de lançamento");
  });

  it("segue a mesma regra de Pro e Premium", async () => {
    vi.stubEnv("STRIPE_PRICE_ID_START", "");
    vi.stubEnv("STRIPE_PRICE_ID_PRO", "");
    vi.stubEnv("STRIPE_PRICE_ID_PREMIUM", "");
    const plans = await reimportBilling();
    for (const plan of ["start", "pro", "premium"] as const) {
      expect(plans[plan].disponivel).toBe(false);
    }
  });
});
