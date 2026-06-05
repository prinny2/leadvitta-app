export type BillingPlan = "start" | "pro" | "premium";

export type CheckoutMode = "payment" | "subscription";

export type BillingPlanConfig = {
  id: BillingPlan;
  label: string;
  priceLabel: string;
  priceId?: string;
};

export const billingPlans: Record<BillingPlan, BillingPlanConfig> = {
  start: {
    id: "start",
    label: "Plano Start",
    priceLabel: "R$197/mês",
    priceId: process.env.STRIPE_PRICE_ID_START,
  },
  pro: {
    id: "pro",
    label: "Plano Pro",
    priceLabel: "R$297/mês",
    priceId: process.env.STRIPE_PRICE_ID_PRO,
  },
  premium: {
    id: "premium",
    label: "Plano Premium",
    priceLabel: "R$397/mês",
    priceId: process.env.STRIPE_PRICE_ID_PREMIUM,
  },
};

export function parseBillingPlan(value: unknown): BillingPlan | null {
  return value === "start" || value === "pro" || value === "premium" ? value : null;
}

export function getBillingPlan(plan: BillingPlan): BillingPlanConfig {
  return billingPlans[plan];
}

export function getStripeCheckoutMode(): CheckoutMode {
  return process.env.STRIPE_CHECKOUT_MODE === "subscription"
    ? "subscription"
    : "payment";
}
