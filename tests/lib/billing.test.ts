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

  it("retorna 'subscription' quando STRIPE_CHECKOUT_MODE=subscription", () => {
    vi.stubEnv("STRIPE_CHECKOUT_MODE", "subscription");
    expect(getStripeCheckoutMode()).toBe("subscription");
  });

  it("retorna 'payment' por padrão", () => {
    vi.stubEnv("STRIPE_CHECKOUT_MODE", "");
    expect(getStripeCheckoutMode()).toBe("payment");
  });

  it("retorna 'payment' para qualquer outro valor", () => {
    vi.stubEnv("STRIPE_CHECKOUT_MODE", "qualquer-coisa");
    expect(getStripeCheckoutMode()).toBe("payment");
  });
});
