"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import confetti from "canvas-confetti";
import { Check } from "lucide-react";
import { PlanCTA } from "@/components/plan-cta";
import { WaitlistForm } from "@/components/waitlist-form";
import { billingPlanList } from "@/lib/billing";
import Link from "next/link";

// ─── Dados dos planos ──────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "start" as const,
    index: 0,
    isPopular: false,
    label: "Start",
    monthly: 97,
    annual: 80,
    annualTotal: 970,
    savings: 194,
    paraQuem: "Quer parar de improvisar no WhatsApp e ter boas respostas à mão",
    tagline: "Um pacote de respostas e roteiros para você conduzir melhor cada conversa.",
    selo: "Preço de lançamento",
    features: [
      "Gerador de Respostas ilimitado — 3 versões por situação, no seu tom",
      "Biblioteca de Objeções completa — resposta pronta pra cada objeção",
      "Mensagens de retomada — reative quem sumiu com 3 abordagens em etapas",
      `Roteiros de atendimento — sequências de mensagens para conduzir do primeiro "oi" ao próximo passo`,
      "Tom da sua clínica — respostas com o seu jeito de falar",
      "Histórico de respostas geradas",
    ],
    ctaMonthly: "Começar com o Start — 5 respostas grátis →",
    ctaAnnual: "Garantir Start Anual →",
  },
  {
    id: "pro" as const,
    index: 1,
    isPopular: true,
    label: "Pro",
    monthly: 197,
    annual: 164,
    annualTotal: 1970,
    savings: 394,
    paraQuem: "Em breve: para quem quer priorizar conversas e receber apoio extra no atendimento",
    tagline: "Em breve: recursos para ajudar a identificar conversas com mais chance de avançar e responder com mais contexto.",
    selo: "Em breve",
    features: [
      "Tudo do Start",
      "Análise de prioridade da conversa — em breve",
      "Integração com WhatsApp — em desenvolvimento",
      "Apoio automático no WhatsApp — em desenvolvimento",
    ],
    ctaMonthly: "Começar com o Pro — 5 respostas grátis →",
    ctaAnnual: "Garantir Pro Anual →",
  },
  {
    id: "premium" as const,
    index: 2,
    isPopular: false,
    label: "Premium",
    monthly: 347,
    annual: 289,
    annualTotal: 3470,
    savings: 694,
    paraQuem: "Em breve: para quem quer automatizar mais etapas do atendimento",
    tagline: "Em breve: automações para reduzir tarefas repetitivas antes e depois do atendimento.",
    selo: "Em breve",
    features: [
      "Tudo do Pro",
      "Lembrete + Orientações Pré-consulta — confirmação automática 24h antes, com preparo por procedimento",
      "Gestão Pós-consulta — acompanhamento automático após o procedimento, fidelização e próximo agendamento",
      "Agendamento pelo WhatsApp — em desenvolvimento",
      "Acesso prioritário a todos os módulos futuros, assim que saírem",
    ],
    ctaMonthly: "Garantir meu acesso Premium agora →",
    ctaAnnual: "Garantir Premium Anual →",
  },
] as const;

// ─── Card de preço ─────────────────────────────────────────────────────────────
function PricingCard({
  plan,
  isAnnual,
  disponivel,
  ctaHref,
}: {
  plan: (typeof PLANS)[number];
  isAnnual: boolean;
  disponivel: boolean;
  ctaHref?: string;
}) {
  const isPremium = plan.id === "premium";
  const isPro = plan.id === "pro";

  const cardStyle: React.CSSProperties = isPremium
    ? {
        background: "linear-gradient(160deg, #0f1b2f 0%, #0a1220 60%, #111820 100%)",
        border: "1.5px solid rgba(201,160,96,0.35)",
        borderRadius: "24px",
        padding: "36px 28px",
        position: "relative",
        boxShadow: "0 0 40px rgba(201,160,96,0.08), inset 0 1px 0 rgba(201,160,96,0.12)",
        overflow: "hidden",
      }
    : isPro
    ? {
        background: "#0f1b2f",
        border: "2px solid #C9A060",
        borderRadius: "24px",
        padding: "36px 28px",
        position: "relative",
      }
    : {
        background: "#0a1220",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px",
        padding: "36px 28px",
        position: "relative",
      };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{
        y: plan.isPopular ? -20 : 0,
        opacity: 1,
        x: plan.index === 2 ? -30 : plan.index === 0 ? 30 : 0,
        scale: plan.index === 0 || plan.index === 2 ? 0.94 : 1.0,
      }}
      viewport={{ once: true }}
      transition={{
        duration: 1.6,
        type: "spring",
        stiffness: 100,
        damping: 30,
        delay: 0.1 + plan.index * 0.12,
        opacity: { duration: 0.45 },
      }}
      style={{
        ...cardStyle,
        zIndex: plan.isPopular ? 10 : 0,
        transformOrigin:
          plan.index === 0 ? "right center" : plan.index === 2 ? "left center" : "center center",
      }}
    >
      {/* Glow orb premium */}
      {isPremium && (
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "140px",
            height: "140px",
            background: "radial-gradient(circle, rgba(201,160,96,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Selo */}
      {isPremium ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "linear-gradient(90deg, rgba(201,160,96,0.2), rgba(201,160,96,0.08))",
            border: "1px solid rgba(201,160,96,0.4)",
            borderRadius: "9999px",
            padding: "5px 14px",
            fontSize: "11px",
            fontWeight: 700,
            color: "#C9A060",
            letterSpacing: "0.06em",
            marginBottom: "16px",
          }}
        >
          {plan.selo}
        </div>
      ) : (
        <span
          style={{
            position: "absolute",
            top: "-14px",
            right: "20px",
            background: isPro ? "#C9A060" : "rgba(201,160,96,0.9)",
            color: "#07101e",
            borderRadius: "9999px",
            padding: "4px 14px",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          {plan.selo}
        </span>
      )}

      {/* Para quem */}
      <p
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        Para quem
      </p>
      <p
        style={{
          fontSize: "13px",
          color: isPremium ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.65)",
          lineHeight: 1.6,
          marginBottom: "20px",
        }}
      >
        {plan.paraQuem}
      </p>

      {/* Plano label */}
      <p
        style={{
          fontSize: "13px",
          color: isPremium
            ? "rgba(201,160,96,0.7)"
            : isPro
            ? "rgba(255,255,255,0.5)"
            : "rgba(255,255,255,0.5)",
          marginBottom: "4px",
          fontWeight: isPremium ? 600 : 400,
        }}
      >
        Plano {plan.label}
      </p>

      {/* Preço com NumberFlow */}
      <div style={{ marginBottom: "4px" }}>
        <span
          style={{
            fontFamily: "var(--font-fraunces, Georgia, serif)",
            fontSize: isPremium ? "52px" : "48px",
            fontWeight: 700,
            color: isPro ? "#C9A060" : "#ffffff",
            lineHeight: 1,
          }}
        >
          R$
          <NumberFlow
            value={isAnnual ? plan.annual : plan.monthly}
            transformTiming={{ duration: 500, easing: "ease-out" }}
            willChange
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: isPremium ? "52px" : "48px",
              fontWeight: 700,
              color: isPro ? "#C9A060" : "#ffffff",
              lineHeight: 1,
            }}
          />
        </span>
        <span style={{ fontSize: "16px", fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>
          /mês
        </span>
      </div>

      {/* Preço anual cobrado + economia */}
      {isAnnual ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: "8px",
            padding: "5px 10px",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
            Cobrado R${plan.annualTotal.toLocaleString("pt-BR")}/ano
          </span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#4ade80" }}>
            Você economiza R${plan.savings}
          </span>
        </div>
      ) : (
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>
          cobrado mensalmente
        </p>
      )}

      {/* Tagline box — igual em todos os planos */}
      <div
        style={{
          background: "rgba(201,160,96,0.07)",
          border: "1px solid rgba(201,160,96,0.18)",
          borderRadius: "12px",
          padding: "12px 16px",
          marginBottom: "20px",
          clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
        }}
      >
        <p
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.78)",
            lineHeight: 1.7,
            margin: 0,
            fontStyle: "italic",
          }}
        >
          {plan.tagline}
        </p>
      </div>

      {/* Features */}
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
        {plan.features.map((f, i) => {
          const isExclusive = isPremium && i > 0 && i < 4;
          return (
            <li
              key={f}
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                marginBottom: "10px",
                fontSize: "13px",
                color: isExclusive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.75)",
                lineHeight: 1.5,
                background: isExclusive ? "rgba(201,160,96,0.04)" : "transparent",
                border: isExclusive ? "1px solid rgba(201,160,96,0.1)" : "none",
                borderRadius: isExclusive ? "8px" : "0",
                padding: isExclusive ? "8px 10px" : "0",
                marginLeft: isExclusive ? "-10px" : "0",
                marginRight: isExclusive ? "-10px" : "0",
              }}
            >
              <Check size={14} color="#C9A060" style={{ flexShrink: 0, marginTop: "2px" }} />
              {f}
            </li>
          );
        })}
      </ul>

      {/* CTA */}
      {disponivel ? (
        <>
          {ctaHref ? (
            <Link
              href={ctaHref}
              className="w-full block text-center font-bold text-sm rounded-xl py-3 px-5 mb-3 bg-[#C9A060] text-[#07101e] border-0 font-sans"
              style={{ textDecoration: "none" }}
            >
              {isAnnual ? plan.ctaAnnual : plan.ctaMonthly}
            </Link>
          ) : (
            <PlanCTA
              plan={plan.id}
              interval={isAnnual ? "annual" : "monthly"}
              className="w-full block text-center font-bold text-sm rounded-xl py-3 px-5 mb-3 bg-[#C9A060] text-[#07101e] border-0"
            >
              {isAnnual ? plan.ctaAnnual : plan.ctaMonthly}
            </PlanCTA>
          )}
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
            {isPremium && !isAnnual
              ? "Preço de lançamento garantido · Cancele quando quiser"
              : "Sem cartão · Cancele quando quiser · Sem multa"}
          </p>
        </>
      ) : (
        <>
          <p style={{ fontSize: "13px", color: "#C9A060", fontWeight: 600, marginBottom: "12px" }}>
            Entrar na lista de prioridade →
          </p>
          <WaitlistForm plan={plan.id} className="" />
          {isPremium && (
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "10px" }}>
              Preço de lançamento garantido · Agendamento pelo WhatsApp em desenvolvimento
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export function PricingSection({ ctaHref }: { ctaHref?: string } = {}) {
  const [isAnnual, setIsAnnual] = useState(false);
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    const next = !isAnnual;
    setIsAnnual(next);

    // Confetti só ao ativar anual
    if (next && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ["#C9A060", "#D4C4A0", "#ffffff", "#92610A"],
        ticks: 220,
        gravity: 1.1,
        decay: 0.93,
        startVelocity: 28,
        shapes: ["circle"],
      });
    }
  };

  return (
    <>
      {/* Toggle mensal / anual */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          marginBottom: "48px",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: isAnnual ? 400 : 700,
            color: isAnnual ? "rgba(255,255,255,0.45)" : "#ffffff",
            transition: "color 0.2s",
          }}
        >
          Mensal
        </span>

        {/* Switch pill */}
        <button
          ref={switchRef}
          onClick={handleToggle}
          style={{
            width: "52px",
            height: "28px",
            borderRadius: "9999px",
            background: isAnnual ? "#C9A060" : "rgba(255,255,255,0.15)",
            border: "none",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.25s",
            flexShrink: 0,
          }}
          aria-label="Alternar plano anual"
        >
          <span
            style={{
              position: "absolute",
              top: "4px",
              left: isAnnual ? "28px" : "4px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#ffffff",
              transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "14px",
              fontWeight: isAnnual ? 700 : 400,
              color: isAnnual ? "#ffffff" : "rgba(255,255,255,0.45)",
              transition: "color 0.2s",
            }}
          >
            Anual
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: isAnnual ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${isAnnual ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "9999px",
              padding: "3px 10px",
              fontSize: "11px",
              fontWeight: 700,
              color: isAnnual ? "#4ade80" : "rgba(255,255,255,0.4)",
              transition: "all 0.25s",
            }}
          >
            Economize ~17%
          </span>
        </div>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
          gap: "20px",
          alignItems: "start",
          marginBottom: "40px",
        }}
      >
        {PLANS.map((plan) => {
          const billingEntry = billingPlanList.find((p) => p.id === plan.id);
          return (
            <PricingCard
              key={plan.id}
              plan={plan}
              isAnnual={isAnnual}
              disponivel={billingEntry?.disponivel ?? false}
              ctaHref={ctaHref}
            />
          );
        })}
      </div>

      {/* Comparison table */}
      <div
        style={{
          background: "#0f1b2f",
          border: "1px solid rgba(201,160,96,0.2)",
          borderRadius: "20px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <table style={{ width: "100%", minWidth: "520px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(201,160,96,0.2)" }}>
              <th style={{ padding: "16px 20px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>PLANO</th>
              <th style={{ padding: "16px 20px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>O QUE O HUMANO FAZ</th>
              <th style={{ padding: "16px 20px", textAlign: "center", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>O QUE O SISTEMA AJUDA A FAZER</th>
            </tr>
          </thead>
          <tbody>
            {[
              { plan: "START", human: "Tudo — mas com as respostas certas na mão", bot: "Ferramenta manual" },
              { plan: "PRO", human: "Em breve: confirma os próximos passos", bot: "Em breve: ajuda a priorizar conversas" },
              { plan: "PREMIUM", human: "Em breve: reduz tarefas manuais", bot: "Em breve: apoia etapas antes e depois da consulta" },
            ].map((row, i) => (
              <tr
                key={row.plan}
                style={{
                  borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  background: row.plan === "PRO" ? "rgba(201,160,96,0.05)" : "transparent",
                }}
              >
                <td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: 700, color: "#C9A060" }}>{row.plan}</td>
                <td style={{ padding: "14px 20px", fontSize: "13px", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>{row.human}</td>
                <td style={{ padding: "14px 20px", fontSize: "13px", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>{row.bot}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: "20px" }}>
        Todos os planos: cancele quando quiser · sem multa · sem fidelidade
        <br />
        💡 Prefere pagar anual?{" "}
        <button
          onClick={handleToggle}
          style={{
            background: "none",
            border: "none",
            color: "#C9A060",
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: "13px",
            padding: 0,
          }}
        >
          {isAnnual ? "Voltar pro mensal" : "Ative o plano anual acima e economize até R$694/ano"}
        </button>
      </p>
    </>
  );
}
