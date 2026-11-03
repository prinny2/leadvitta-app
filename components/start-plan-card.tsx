import { Check } from "@/components/static-icons";
import type { ReactNode } from "react";
import { billingPlans } from "@/lib/billing";
import { cn } from "@/lib/utils";

/**
 * Card único do plano Start (landing e onboarding). Preço, período e selo vêm
 * de `billingPlans.start` (lib/billing.ts); os bullets são copy de cada tela e
 * os botões entram como `children`.
 */
export function StartPlanCard({
  bullets,
  tagline,
  children,
  className,
}: {
  bullets: string[];
  tagline?: string;
  children?: ReactNode;
  className?: string;
}) {
  const plan = billingPlans.start;
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[460px] rounded-3xl border-2 border-gold-500/60 bg-navy-700 p-6 text-left shadow-soft sm:p-8",
        className
      )}
    >
      {plan.selo ? (
        <span className="absolute -top-3 right-5 rounded-full bg-gold-500 px-3 py-1 text-xs font-bold text-navy-900">
          {plan.selo}
        </span>
      ) : null}
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-champagne-300">
        {plan.label}
      </p>
      <p className="mt-1 font-serif text-5xl font-semibold">
        <span className="text-gold-gradient">{plan.priceLabel}</span>
        <span className="font-sans text-lg font-normal text-navy-50">{plan.periodLabel}</span>
      </p>
      {tagline ? (
        <p className="mt-2 text-sm leading-relaxed text-champagne-300">{tagline}</p>
      ) : null}
      <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-champagne-200">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2.5">
            <Check size={17} className="mt-0.5 shrink-0 text-gold-400" aria-hidden="true" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
