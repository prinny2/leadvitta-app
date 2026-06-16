"use client";

import type { BillingPlan } from "@/lib/billing";
import { PlanCheckoutButton } from "@/components/plan-checkout-button";

type PlanCTAProps = {
  plan: BillingPlan;
  className?: string;
  children: React.ReactNode;
};

/** CTA de plano — abre Stripe direto, sem login antes. */
export function PlanCTA({ plan, className, children }: PlanCTAProps) {
  return (
    <PlanCheckoutButton plan={plan} className={className}>
      {children}
    </PlanCheckoutButton>
  );
}