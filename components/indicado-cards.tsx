"use client";

import { motion } from "framer-motion";
import { Building2, User, Users, TrendingUp, Layers } from "lucide-react";
import Link from "next/link";

export function IndicadoHeader({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: "center" }}
    >
      {children}
    </motion.div>
  );
}
import React from "react";

const CARDS = [
  {
    emoji: "🏥",
    icon: <Building2 size={22} strokeWidth={1.5} />,
    title: "Você tem ou gerencia uma clínica de estética",
    body: "Botox, harmonização, preenchimento, laser, bioestimulador, microagulhamento — qualquer clínica onde a venda começa numa conversa de WhatsApp antes de virar agendamento.",
  },
  {
    emoji: "💼",
    icon: <User size={22} strokeWidth={1.5} />,
    title: "Você é autônomo e atende no seu próprio espaço",
    body: "Profissional solo que faz tudo: o procedimento, o atendimento e a venda. Cada conversa de WhatsApp é uma oportunidade que não pode escapar.",
  },
  {
    emoji: "👥",
    icon: <Users size={22} strokeWidth={1.5} />,
    title: "Você tem recepcionista ou está pensando em contratar",
    body: "Treinar alguém pra conduzir conversa de venda leva meses. Com o LeadBellus, seu atendimento já nasce padronizado e estratégico — sem depender da habilidade de cada pessoa.",
  },
  {
    emoji: "📈",
    icon: <TrendingUp size={22} strokeWidth={1.5} />,
    title: "Você quer mais agendamentos sem aumentar anúncios",
    body: "O problema não é a captação. É a conversão. Você já tem as leads chegando — elas só estão vazando na conversa.",
  },
  {
    emoji: "🔄",
    icon: <Layers size={22} strokeWidth={1.5} />,
    title: "Você quer escalar sem depender de você em tudo",
    body: "Hoje cada resposta importante precisa passar pela sua aprovação. Com o LeadBellus — especialmente no Premium — o sistema atende, qualifica, agenda e acompanha.",
  },
];

export function IndicadoCards({ funilHref = "/signup" }: { funilHref?: string }) {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          marginBottom: "48px",
        }}
      >
        {CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            style={{
              background: "#0f1b2f",
              border: "1px solid rgba(201,160,96,0.15)",
              borderRadius: "20px",
              padding: "28px 24px",
              cursor: "default",
              transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.background = "#F5F0E6";
              el.style.borderColor = "#C9A060";
              el.style.boxShadow = "0 12px 40px rgba(201,160,96,0.15)";
              el.querySelectorAll("[data-title]").forEach((t) => ((t as HTMLElement).style.color = "#0A1628"));
              el.querySelectorAll("[data-body]").forEach((t) => ((t as HTMLElement).style.color = "#4a5568"));
              el.querySelectorAll("[data-icon]").forEach((t) => {
                (t as HTMLElement).style.background = "rgba(201,160,96,0.15)";
                (t as HTMLElement).style.color = "#C9A060";
              });
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.background = "#0f1b2f";
              el.style.borderColor = "rgba(201,160,96,0.15)";
              el.style.boxShadow = "none";
              el.querySelectorAll("[data-title]").forEach((t) => ((t as HTMLElement).style.color = "#ffffff"));
              el.querySelectorAll("[data-body]").forEach((t) => ((t as HTMLElement).style.color = "rgba(255,255,255,0.6)"));
              el.querySelectorAll("[data-icon]").forEach((t) => {
                (t as HTMLElement).style.background = "rgba(201,160,96,0.1)";
                (t as HTMLElement).style.color = "#C9A060";
              });
            }}
          >
            <div
              data-icon
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(201,160,96,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                fontSize: "20px",
                color: "#C9A060",
                transition: "background 0.3s ease",
              }}
            >
              {card.emoji}
            </div>
            <h3
              data-title
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "16px",
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 0 10px",
                lineHeight: 1.3,
                transition: "color 0.3s ease",
              }}
            >
              {card.title}
            </h3>
            <p
              data-body
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.7,
                margin: 0,
                transition: "color 0.3s ease",
              }}
            >
              {card.body}
            </p>
          </motion.div>
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "24px" }}>
          Seja biomédico, médico, fisioterapeuta, esteticista ou gestor de clínica — se o seu negócio de estética vive de agendamentos, esse sistema foi construído pra você.
        </p>
        <Link
          href={funilHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#C9A060",
            color: "#07101e",
            borderRadius: "9999px",
            padding: "14px 32px",
            fontSize: "15px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Quero testar grátis por 7 dias →
        </Link>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "10px" }}>
          Sem cartão · Acesso imediato · Pronto em 2 minutos
        </p>
      </div>
    </>
  );
}
