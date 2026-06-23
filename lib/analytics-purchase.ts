import {
  getBillingPlan,
  parseBillingInterval,
  parseBillingPlan,
  type BillingInterval,
  type BillingPlan,
} from "@/lib/billing";

/** Valor em BRL para ROAS no GA4/Ads (import via GA4). */
export function resolvePurchaseValue(
  plan: BillingPlan,
  interval: BillingInterval
): number {
  const config = getBillingPlan(plan);
  // Anual: fallback 10× mensal até termos preço anual explícito no billing.
  return interval === "annual" ? config.price * 10 : config.price;
}

export function buildPurchaseEventParams(opts: {
  stripeSessionId?: string | null;
  plan?: string | null;
  interval?: string | null;
}): Record<string, string | number> {
  const plan = parseBillingPlan(opts.plan) ?? "start";
  const interval = parseBillingInterval(opts.interval);
  const value = resolvePurchaseValue(plan, interval);

  const params: Record<string, string | number> = {
    value,
    currency: "BRL",
    plan,
    billing_interval: interval,
  };

  if (opts.stripeSessionId) {
    params.transaction_id = opts.stripeSessionId;
    params.stripe_session_id = opts.stripeSessionId;
  }

  return params;
}