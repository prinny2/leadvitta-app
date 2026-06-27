"use client";

import { useState } from "react";
import { PlanCTA } from "@/components/plan-cta";
import { WaitlistForm } from "@/components/waitlist-form";
import { LegalConsentLinks } from "@/components/legal-consent-links";
import { billingPlanList } from "@/lib/billing";

const PLAN_META = {
  start: {
    kicker: "Plano de entrada",
    tagline: "Pra parar de perder cliente no WhatsApp e nunca mais improvisar.",
    priceM: "R$97",
    priceA: "R$80",
    priceATotal: "R$970/ano",
    featured: false,
    badge: null,
    ctaLabel: "Começar com o Start — 7 dias grátis",
    note: "Sem cartão · Cancele quando quiser · Sem multa",
    features: [
      "Gerador de Respostas ilimitado — 3 versões",
      "Biblioteca de Objeções completa",
      "Follow-up Inteligente",
      "Scripts de Atendimento Completo",
      "DNA da Clínica",
      "Histórico de respostas",
    ],
  },
  pro: {
    kicker: "Mais operação e inteligência",
    tagline: "Inteligência pra qualificar leads + um bot que prepara o terreno. Você entra só pra fechar.",
    priceM: "R$197",
    priceA: "R$164",
    priceATotal: "R$1.970/ano",
    featured: true,
    badge: "★ Mais escolhido",
    ctaLabel: "Começar com o Pro — 7 dias grátis",
    note: "Sem cartão · Cancele quando quiser · Sem multa",
    features: [
      "Tudo do Start",
      "Lead Intelligence — score + perfil + estratégia",
      "Chatbot WhatsApp — atende e qualifica",
      "Lembrete + Orientações Pré-consulta",
      "Gestão Pós-consulta automática",
    ],
  },
  premium: {
    kicker: "Rotina completa e prioridade",
    tagline: "A clínica no piloto automático — do primeiro contato ao agendamento fechado, sem tocar em nada.",
    priceM: "R$347",
    priceA: "R$289",
    priceATotal: "R$3.470/ano",
    featured: false,
    badge: null,
    ctaLabel: "Garantir meu acesso Premium",
    note: "Preço de lançamento garantido · Cancele quando quiser",
    features: [
      "Tudo do Pro",
      "Agendamento Autônomo — o bot fecha sozinho",
      "Acesso prioritário a todos os módulos futuros",
    ],
  },
} as const;

const CMP_ROWS = [
  { plan: "START", human: "Tudo — mas com as respostas certas na mão", bot: "Ferramenta manual" },
  { plan: "PRO", human: "Só confirma o fechamento", bot: "Atende, qualifica e aquece" },
  { plan: "PREMIUM", human: "Só faz o procedimento", bot: "Atende, qualifica, agenda e acompanha" },
];

export function PricingSection({ ctaHref }: { ctaHref?: string } = {}) {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      {/* Toggle mensal / anual */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "46px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "#fff",
            border: "1px solid #EAE0CC",
            borderRadius: "99px",
            padding: "7px 8px",
            boxShadow: "0 6px 18px rgba(20,15,5,.04)",
          }}
        >
          <button
            onClick={() => setAnnual(false)}
            style={{
              fontSize: "14px",
              fontWeight: annual ? 700 : 800,
              padding: "9px 20px",
              borderRadius: "99px",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              background: annual ? "none" : "#BDA269",
              color: annual ? "#5C6273" : "#1A1206",
            }}
          >
            Mensal
          </button>
          <button
            onClick={() => setAnnual(true)}
            style={{
              fontSize: "14px",
              fontWeight: annual ? 800 : 700,
              padding: "9px 20px",
              borderRadius: "99px",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              background: annual ? "#BDA269" : "none",
              color: annual ? "#1A1206" : "#5C6273",
            }}
          >
            Anual <span style={{ fontSize: "11px", opacity: 0.85 }}>· 2 meses gr&aacute;tis</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          alignItems: "stretch",
        }}
        className="pricing-grid"
      >
        {billingPlanList.map((plan) => {
          const meta = PLAN_META[plan.id];
          const price = annual ? meta.priceA : meta.priceM;
          const sub = annual ? `cobrado anualmente · ${meta.priceATotal}` : "cobrado mensalmente";

          return (
            <article
              key={plan.id}
              style={{
                position: "relative",
                background: meta.featured
                  ? "linear-gradient(180deg,#FFFDF8,#FBF3E2)"
                  : "#fff",
                border: meta.featured ? "1.5px solid #BDA269" : "1px solid #EAE0CC",
                borderRadius: "22px",
                padding: meta.featured ? "38px 28px 32px" : "32px 28px",
                display: "flex",
                flexDirection: "column",
                boxShadow: meta.featured
                  ? "0 28px 70px rgba(189,162,105,.2)"
                  : "0 14px 40px rgba(20,15,5,.05)",
              }}
            >
              {meta.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: "-13px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#BDA269",
                    color: "#1A1206",
                    fontSize: "11.5px",
                    fontWeight: 800,
                    letterSpacing: ".05em",
                    padding: "6px 16px",
                    borderRadius: "99px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {meta.badge}
                </div>
              )}

              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "#9A7B3C",
                }}
              >
                {meta.kicker}
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-fraunces, Georgia, serif)",
                  fontWeight: 700,
                  fontSize: "30px",
                  margin: "10px 0 0",
                  color: "#16202F",
                }}
              >
                {plan.label}
              </h3>

              <p
                style={{
                  fontSize: "14px",
                  color: "#5E6373",
                  margin: "8px 0 18px",
                  lineHeight: 1.5,
                  minHeight: "42px",
                }}
              >
                {meta.tagline}
              </p>

              <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-fraunces, Georgia, serif)",
                    fontWeight: 800,
                    fontSize: "48px",
                    color: "#9A7B3C",
                    lineHeight: 1,
                  }}
                >
                  {price}
                </span>
                <span style={{ fontSize: "15px", color: "#8A8E99", marginBottom: "8px" }}>/m&ecirc;s</span>
              </div>

              <div style={{ fontSize: "12.5px", color: "#8A8E99", marginTop: "8px", minHeight: "18px" }}>
                {sub}
              </div>

              {/* CTA */}
              <div style={{ marginTop: "22px" }}>
                {plan.disponivel ? (
                  ctaHref ? (
                    <a
                      href={ctaHref}
                      style={{
                        display: "block",
                        textAlign: "center",
                        background: meta.featured ? "#BDA269" : "#0A121F",
                        color: meta.featured ? "#1A1206" : "#fff",
                        textDecoration: "none",
                        fontSize: "15px",
                        fontWeight: 800,
                        padding: "15px",
                        borderRadius: "12px",
                      }}
                    >
                      {meta.ctaLabel}
                    </a>
                  ) : (
                    <PlanCTA
                      plan={plan.id}
                      interval={annual ? "annual" : "monthly"}
                      className={
                        meta.featured
                          ? "block w-full rounded-xl px-5 py-4 text-center text-[15px] font-extrabold cursor-pointer border-0 bg-[#BDA269] text-[#1A1206]"
                          : "block w-full rounded-xl px-5 py-4 text-center text-[15px] font-extrabold cursor-pointer border-0 bg-[#0A121F] text-white"
                      }
                    >
                      {meta.ctaLabel}
                    </PlanCTA>
                  )
                ) : (
                  <>
                    <p style={{ fontSize: "13px", color: "#9A7B3C", fontWeight: 700, margin: "0 0 12px" }}>
                      Entre na lista de prioridade
                    </p>
                    <WaitlistForm plan={plan.id} />
                  </>
                )}
              </div>

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
                {meta.features.map((f) => (
                  <div key={f} style={{ display: "flex", gap: "11px", alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, color: "#9A7B3C", fontWeight: 800, fontSize: "14px", marginTop: "1px" }}>
                      ✓
                    </span>
                    <span style={{ fontSize: "14px", lineHeight: 1.45, color: "#3A4150" }}>{f}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: "12px", color: "#8A8E99", marginTop: "20px", textAlign: "center" }}>
                {meta.note}
              </div>

              {plan.disponivel && <LegalConsentLinks tone="dark" className="mt-2" />}
            </article>
          );
        })}
      </div>

      {/* Comparativo */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #EAE0CC",
          borderRadius: "20px",
          marginTop: "32px",
          overflow: "hidden",
          boxShadow: "0 14px 40px rgba(20,15,5,.04)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr 1.4fr",
            padding: "16px 26px",
            borderBottom: "1px solid #EAE0CC",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "#8A8E99",
          }}
          className="cmp-row"
        >
          <span>Plano</span>
          <span>O que o humano faz</span>
          <span>O que o bot faz</span>
        </div>
        {CMP_ROWS.map((row, i) => (
          <div
            key={row.plan}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.4fr 1.4fr",
              padding: "18px 26px",
              borderBottom: i < CMP_ROWS.length - 1 ? "1px solid #EAE0CC" : "none",
              alignItems: "center",
            }}
            className="cmp-row"
          >
            <span style={{ fontWeight: 800, color: "#9A7B3C", fontSize: "14px", letterSpacing: ".04em" }}>
              {row.plan}
            </span>
            <span style={{ fontSize: "14px", color: "#3A4150" }}>{row.human}</span>
            <span style={{ fontSize: "14px", color: "#3A4150" }}>{row.bot}</span>
          </div>
        ))}
      </div>

      <p style={{ textAlign: "center", fontSize: "13.5px", color: "#5E6373", marginTop: "24px" }}>
        Todos os planos: cancele quando quiser &middot; sem multa &middot; sem fidelidade &middot; pagamento seguro via Stripe
      </p>

      <style>{`
        @media (max-width: 880px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
          .cmp-row { grid-template-columns: 1fr !important; gap: 4px !important; }
        }
      `}</style>
    </>
  );
}
