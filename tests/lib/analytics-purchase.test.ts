import { describe, expect, it } from "vitest";
import {
  buildPurchaseEventParams,
  resolvePurchaseValue,
} from "@/lib/analytics-purchase";

describe("analytics-purchase", () => {
  it("resolvePurchaseValue usa preço mensal do plano", () => {
    expect(resolvePurchaseValue("start", "monthly")).toBe(97);
    expect(resolvePurchaseValue("pro", "monthly")).toBe(197);
  });

  it("resolvePurchaseValue anual usa 10× mensal (fallback)", () => {
    expect(resolvePurchaseValue("start", "annual")).toBe(970);
  });

  it("buildPurchaseEventParams inclui value, currency e transaction_id", () => {
    const params = buildPurchaseEventParams({
      stripeSessionId: "cs_test_123",
      plan: "start",
      interval: "monthly",
    });
    expect(params).toMatchObject({
      value: 97,
      currency: "BRL",
      plan: "start",
      billing_interval: "monthly",
      transaction_id: "cs_test_123",
      stripe_session_id: "cs_test_123",
    });
  });

  it("defaulta para start mensal quando plano ausente", () => {
    const params = buildPurchaseEventParams({
      stripeSessionId: null,
      plan: null,
      interval: null,
    });
    expect(params.value).toBe(97);
    expect(params.plan).toBe("start");
    expect(params.transaction_id).toBeUndefined();
  });
});