import Link from "next/link";
import { Check } from "lucide-react";
import { PlanCTA } from "@/components/plan-cta";
import { WaitlistForm } from "@/components/waitlist-form";
import { billingPlanList, type BillingPlanConfig } from "@/lib/billing";
import { LegalConsentLinks } from "@/components/legal-consent-links";

const PLAN_META = {
  start: {
    eyebrow: "Disponível agora",
    scope: "Plano pago de entrada",
    bestFor: "Para usar no atendimento real depois das 5 respostas grátis.",
    contrast: "Demo: 5 respostas. Start: uso contínuo.",
  },
  pro: {
    eyebrow: "Próximo degrau",
    scope: "Mais operação e histórico",
    bestFor: "Para equipes que querem padronizar respostas e aprender com as melhores conversas.",
    contrast: "Tudo do Start, com mais biblioteca e histórico.",
  },
  premium: {
    eyebrow: "Rotina completa",
    scope: "Automação e prioridade",
    bestFor: "Para reduzir trabalho manual quando os módulos avançados abrirem.",
    contrast: "Mais automações sobre a base do Pro.",
  },
} as const;

function PricingCard({
  plan,
  ctaHref,
}: {
  plan: BillingPlanConfig;
  ctaHref?: string;
}) {
  const available = plan.disponivel;
  const featured = plan.destaque || plan.id === "start";
  const meta = PLAN_META[plan.id];

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

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
        <span
          style={{
            border: "1px solid rgba(201,160,96,0.35)",
            background: featured ? "rgba(201,160,96,0.12)" : "rgba(255,255,255,0.04)",
            borderRadius: "9999px",
            color: featured ? "#D9B66D" : "rgba(255,255,255,0.62)",
            fontSize: "11px",
            fontWeight: 800,
            padding: "5px 10px",
          }}
        >
          {meta.eyebrow}
        </span>
        <span
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "9999px",
            color: "rgba(255,255,255,0.55)",
            fontSize: "11px",
            fontWeight: 700,
            padding: "5px 10px",
          }}
        >
          {meta.scope}
        </span>
      </div>
      <h3
        style={{
          fontFamily: "var(--font-inter, system-ui, sans-serif)",
          fontSize: "24px",
          fontWeight: 800,
          letterSpacing: "-0.01em",
          color: "#ffffff",
          margin: "0 0 8px",
        }}
      >
        {plan.label}
      </h3>

      <div style={{ marginBottom: "14px" }}>
        <span
          style={{
            fontFamily: "var(--font-inter, system-ui, sans-serif)",
            fontSize: "44px",
            letterSpacing: "-0.02em",
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

      <div
        style={{
          background: featured ? "rgba(201,160,96,0.08)" : "rgba(255,255,255,0.035)",
          border: featured
            ? "1px solid rgba(201,160,96,0.22)"
            : "1px solid rgba(255,255,255,0.07)",
          borderRadius: "12px",
          padding: "12px 13px",
          marginBottom: "18px",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "12px", lineHeight: 1.55, margin: 0 }}>
          {meta.bestFor}
        </p>
        <p style={{ color: featured ? "#D9B66D" : "rgba(255,255,255,0.45)", fontSize: "11px", fontWeight: 700, lineHeight: 1.45, margin: "7px 0 0" }}>
          {meta.contrast}
        </p>
      </div>

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
              {plan.id === "start" ? "Assinar Start agora" : `Assinar ${plan.label}`}
            </Link>
          ) : (
            <PlanCTA
              plan={plan.id}
              interval="monthly"
              className="block w-full rounded-xl bg-[#C9A060] px-5 py-3 text-center text-sm font-bold text-[#07101e]"
            >
              {plan.id === "start" ? "Assinar Start agora" : `Assinar ${plan.label}`}
            </PlanCTA>
          )}
          {/* Upsell anual: só aparece quando o price anual existe no ambiente
              (senão o checkout responderia 503 e queimaria a venda). */}
          {!ctaHref && plan.priceIdAnnual ? (
            <PlanCTA
              plan={plan.id}
              interval="annual"
              className="mt-2 block w-full rounded-xl border border-[#C9A060]/45 px-5 py-2.5 text-center text-[13px] font-bold text-[#D9B66D]"
            >
              {`Anual: R$${plan.price * 10}/ano — 2 meses grátis`}
            </PlanCTA>
          ) : null}
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.42)", textAlign: "center", margin: "10px 0 0" }}>
            {plan.id === "start"
              ? "Depois da demo: R$97/mês · cancele quando quiser"
              : "Checkout seguro"}
          </p>
          <LegalConsentLinks tone="light" className="mt-2" />
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
    start: "Pago agora: respostas continuas",
    pro: "Biblioteca, roteiros e histórico",
    premium: "Automacoes avancadas em breve",
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 110px",
            gap: "14px",
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            alignItems: "center",
          }}
          className="pricing-row"
        >
          <strong style={{ color: "rgba(255,255,255,0.86)", fontSize: "14px" }}>
            Demo grátis
          </strong>
          <span style={{ color: "rgba(255,255,255,0.62)", fontSize: "13px" }}>
            5 respostas para testar, sem cartão
          </span>
          <span style={{ color: "#D9B66D", fontSize: "12px", fontWeight: 800 }}>
            Limitada
          </span>
        </div>
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
