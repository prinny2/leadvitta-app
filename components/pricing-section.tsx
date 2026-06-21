import Link from "next/link";
import { Check } from "lucide-react";
import { PlanCTA } from "@/components/plan-cta";
import { WaitlistForm } from "@/components/waitlist-form";
import { billingPlanList, type BillingPlanConfig } from "@/lib/billing";

function PricingCard({
  plan,
  ctaHref,
}: {
  plan: BillingPlanConfig;
  ctaHref?: string;
}) {
  const available = plan.disponivel;
  const featured = plan.destaque || plan.id === "start";

  return (
    <article
      style={{
        background: featured ? "#0f1b2f" : "#0a1220",
        border: featured ? "2px solid #C9A060" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: "28px 24px",
        position: "relative",
        boxShadow: featured ? "0 18px 48px rgba(201,160,96,0.13)" : "none",
      }}
    >
      {plan.selo ? (
        <span
          style={{
            position: "absolute",
            top: "-13px",
            right: "20px",
            background: "#C9A060",
            color: "#07101e",
            borderRadius: "9999px",
            padding: "4px 13px",
            fontSize: "11px",
            fontWeight: 800,
          }}
        >
          {plan.selo}
        </span>
      ) : null}

      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: "0 0 4px" }}>
        Plano
      </p>
      <h3
        style={{
          fontFamily: "var(--font-fraunces, Georgia, serif)",
          fontSize: "28px",
          color: "#ffffff",
          margin: "0 0 8px",
        }}
      >
        {plan.label}
      </h3>

      <div style={{ marginBottom: "14px" }}>
        <span
          style={{
            fontFamily: "var(--font-fraunces, Georgia, serif)",
            fontSize: "48px",
            fontWeight: 700,
            color: featured ? "#C9A060" : "#ffffff",
            lineHeight: 1,
          }}
        >
          {plan.priceLabel}
        </span>
        <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)" }}>{plan.periodLabel}</span>
      </div>

      <p
        style={{
          minHeight: "42px",
          fontSize: "14px",
          color: "rgba(255,255,255,0.72)",
          lineHeight: 1.5,
          margin: "0 0 20px",
        }}
      >
        {plan.tagline}
      </p>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "grid", gap: "10px" }}>
        {plan.features.slice(0, featured ? 5 : 4).map((feature) => (
          <li
            key={feature}
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              fontSize: "13px",
              color: "rgba(255,255,255,0.76)",
              lineHeight: 1.45,
            }}
          >
            <Check size={15} color="#C9A060" style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {available ? (
        <>
          {ctaHref ? (
            <Link
              href={ctaHref}
              className="block w-full rounded-xl bg-[#C9A060] px-5 py-3 text-center text-sm font-bold text-[#07101e]"
              style={{ textDecoration: "none" }}
            >
              Começar com {plan.label}
            </Link>
          ) : (
            <PlanCTA
              plan={plan.id}
              interval="monthly"
              className="block w-full rounded-xl bg-[#C9A060] px-5 py-3 text-center text-sm font-bold text-[#07101e]"
            >
              Começar com {plan.label}
            </PlanCTA>
          )}
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.42)", textAlign: "center", margin: "10px 0 0" }}>
            5 respostas grátis · sem cartão
          </p>
        </>
      ) : (
        <>
          <p style={{ fontSize: "13px", color: "#C9A060", fontWeight: 700, margin: "0 0 12px" }}>
            Entre na lista de prioridade
          </p>
          <WaitlistForm plan={plan.id} />
        </>
      )}
    </article>
  );
}

export function PricingSection({ ctaHref }: { ctaHref?: string } = {}) {
  const focusByPlan = {
    start: "Responder melhor hoje",
    pro: "Priorizar conversas e automações",
    premium: "Rotina completa de WhatsApp",
  } as const;
  const rows = billingPlanList.map((plan) => ({
    plan: plan.label,
    focus: focusByPlan[plan.id],
    status: plan.disponivel ? "Disponível" : "Em breve",
  }));

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
          gap: "18px",
          alignItems: "stretch",
          marginBottom: "28px",
        }}
      >
        {billingPlanList.map((plan) => (
          <PricingCard key={plan.id} plan={plan} ctaHref={ctaHref} />
        ))}
      </div>

      <div
        style={{
          background: "#0f1b2f",
          border: "1px solid rgba(201,160,96,0.2)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {rows.map((row, index) => (
          <div
            key={row.plan}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 110px",
              gap: "14px",
              padding: "14px 18px",
              borderBottom: index < rows.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              alignItems: "center",
            }}
            className="pricing-row"
          >
            <strong style={{ color: "#C9A060", fontSize: "14px" }}>{row.plan}</strong>
            <span style={{ color: "rgba(255,255,255,0.72)", fontSize: "13px" }}>{row.focus}</span>
            <span style={{ color: row.status === "Disponível" ? "#4ade80" : "rgba(255,255,255,0.45)", fontSize: "12px", fontWeight: 700 }}>
              {row.status}
            </span>
          </div>
        ))}
      </div>

      <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.42)", marginTop: "18px" }}>
        Cancele quando quiser. Sem multa.
      </p>

      <style>{`
        @media (max-width: 640px) {
          .pricing-row {
            grid-template-columns: 1fr !important;
            gap: 5px !important;
          }
        }
      `}</style>
    </>
  );
}
