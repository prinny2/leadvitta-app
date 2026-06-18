"use client";

import type { BillingInterval, BillingPlan } from "@/lib/billing";
import { PlanCheckoutButton } from "@/components/plan-checkout-button";

type PlanCTAProps = {
  plan: BillingPlan;
  interval?: BillingInterval;
  className?: string;
  children: React.ReactNode;
};

/** CTA de plano — abre Stripe direto, sem login antes. */
export function PlanCTA({ plan, interval, className, children }: PlanCTAProps) {
  return (
    <PlanCheckoutButton plan={plan} interval={interval} className={className}>
      {children}
    </PlanCheckoutButton>
  );
}