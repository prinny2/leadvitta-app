"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  MessageSquare, Brain, ShieldCheck, RefreshCw, FileText, Dna,
  Bookmark, Bot, CalendarCheck, Bell, Heart,
  Zap, Target, Star, TrendingUp, Shield,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CARDS = [
  {
    number: "01",
    title: "Gerador de Respostas",
    description: "Respostas prontas e personalizadas para qualquer situação no WhatsApp.",
    highlight: "Agilidade que encanta.",
    icon: <MessageSquare size={24} strokeWidth={1.5} />,
    featured: true,
  },
  {
    number: "02",
    title: "Lead Intelligence",
    description: "Entenda o perfil, a intenção e o momento da cliente para responder com estratégia e aumentar a conversão.",
    highlight: "Resposta certa no momento certo.",
    icon: <Brain size={24} strokeWidth={1.5} />,
  },
  {
    number: "03",
    title: "Biblioteca de Objeções",
    description: "Objeções reais do dia a dia da estética, com respostas que acolhem, educam e conduzem.",
    highlight: "Transforme objeções em oportunidades.",
    icon: <ShieldCheck size={24} strokeWidth={1.5} />,
  },
  {
    number: "04",
    title: "Follow-up Inteligente",
    description: "Mensagens de follow-up que reativam e aquecem o lead sem parecer insistente.",
    highlight: "Mais retornos, menos esforço.",
    icon: <RefreshCw size={24} strokeWidth={1.5} />,
  },
  {
    number: "05",
    title: "Scripts de Atendimento Completo",
    description: "Roteiros completos para cada etapa da jornada da cliente, do primeiro contato ao pós-atendimento.",
    highlight: "Padronização que gera resultados.",
    icon: <FileText size={24} strokeWidth={1.5} />,
  },
  {
    number: "06",
    title: "DNA da Clínica",
    description: "Defina a personalidade, diferenciais e protocolos da sua clínica para que a IA responda com a sua voz.",
    highlight: "Sua essência em cada mensagem.",
    icon: <Dna size={24} strokeWidth={1.5} />,
  },
  {
    number: "07",
    title: "Histórico e Favoritos",
    description: "Salve suas melhores respostas e acesse rapidamente o que funciona para sua clínica.",
    highlight: "Organização que economiza tempo.",
    icon: <Bookmark size={24} strokeWidth={1.5} />,
  },
  {
    number: "08",
    title: "Chatbot WhatsApp Business",
    description: "Atenda, qualifique e agende no automático, 24h por dia.",
    highlight: "Mais agendamentos no piloto automático.",
    icon: <Bot size={24} strokeWidth={1.5} />,
  },
  {
    number: "09",
    title: "Agendamento Autônomo",
    description: "Deixe a cliente escolher o melhor dia e horário. Menos idas e vindas, mais confirmações.",
    highlight: "Facilidade para você e para ela.",
    icon: <CalendarCheck size={24} strokeWidth={1.5} />,
  },
  {
    number: "10",
    title: "Lembretes e Orientações Pré-consulta",
    description: "Reduza faltas com lembretes automáticos e orientações claras antes do atendimento.",
    highlight: "Mais presença, menos remarcações.",
    icon: <Bell size={24} strokeWidth={1.5} />,
  },
  {
    number: "11",
    title: "Gestão Pós-consulta",
    description: "Acompanhe o pós, peça feedbacks e mantenha o relacionamento ativo com suas clientes.",
    highlight: "Mais fidelização e indicações.",
    icon: <Heart size={24} strokeWidth={1.5} />,
  },
];

const RESULTS = [
  {
    icon: <Zap size={22} strokeWidth={1.5} />,
    title: "Mais agilidade",
    text: "Respostas prontas e automações que economizam seu tempo.",
  },
  {
    icon: <Target size={22} strokeWidth={1.5} />,
    title: "Mais conversão",
    text: "Estratégias certeiras que transformam conversas em agendamentos.",
  },
  {
    icon: <Shield size={22} strokeWidth={1.5} />,
    title: "Mais consistência",
    text: "Padronização e dados que ajudam a manter qualidade em todos os atendimentos.",
  },
  {
    icon: <Star size={22} strokeWidth={1.5} />,
    title: "Mais experiência",
    text: "Atendimento humanizado e previsível em cada ponto de contato.",
  },
  {
    icon: <TrendingUp size={22} strokeWidth={1.5} />,
    title: "Mais resultado",
    text: "Mais agendamentos, mais vendas e crescimento sustentável para sua clínica.",
  },
];

// ─── Stagger variants ─────────────────────────────────────────────────────────

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      delay: (i % 4) * 0.08 + Math.floor(i / 4) * 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const stripVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const stripItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ─── BenefitCard ──────────────────────────────────────────────────────────────

function BenefitCard({ card, index }: { card: typeof CARDS[0]; index: number }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{ y: -4 }}
      style={{
        background: "#ffffff",
        border: card.featured ? "1.5px solid #C9A060" : "1px solid #e8e4dc",
        borderRadius: "18px",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: card.featured
          ? "0 0 0 3px rgba(201,160,96,0.08), 0 4px 20px rgba(10,22,40,0.07)"
          : "0 2px 12px rgba(10,22,40,0.05)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "#C9A060";
        el.style.boxShadow = "0 8px 32px rgba(201,160,96,0.15), 0 2px 12px rgba(10,22,40,0.06)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = card.featured ? "#C9A060" : "#e8e4dc";
        el.style.boxShadow = card.featured
          ? "0 0 0 3px rgba(201,160,96,0.08), 0 4px 20px rgba(10,22,40,0.07)"
          : "0 2px 12px rgba(10,22,40,0.05)";
      }}
    >
      {/* Number pill */}
      <div style={{
        position: "absolute",
        top: "16px",
        left: "16px",
        fontSize: "10px",
        fontWeight: 800,
        color: "#C9A060",
        letterSpacing: "0.06em",
        background: "rgba(201,160,96,0.08)",
        borderRadius: "9999px",
        padding: "2px 8px",
        border: "1px solid rgba(201,160,96,0.2)",
      }}>
        {card.number}
      </div>

      {/* Icon */}
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "14px",
        background: "rgba(10,22,40,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#0A1628",
        marginTop: "20px",
        flexShrink: 0,
        transition: "background 0.25s ease, color 0.25s ease",
      }}
        className="benefit-icon"
      >
        {card.icon}
      </div>

      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h3 style={{
          fontSize: "14px",
          fontWeight: 700,
          color: "#0A1628",
          margin: 0,
          lineHeight: 1.35,
          fontFamily: "var(--font-fraunces, Georgia, serif)",
        }}>
          {card.title}
        </h3>
        <p style={{
          fontSize: "12.5px",
          color: "#64748b",
          margin: 0,
          lineHeight: 1.65,
        }}>
          {card.description}
        </p>
      </div>

      {/* Highlight */}
      <p style={{
        fontSize: "12px",
        fontWeight: 700,
        color: "#C9A060",
        margin: 0,
        letterSpacing: "0.01em",
      }}>
        {card.highlight}
      </p>

      <style>{`
        .benefit-card:hover .benefit-icon {
          background: rgba(10,22,40,0.12);
        }
      `}</style>
    </motion.div>
  );
}

// ─── ResultStrip ──────────────────────────────────────────────────────────────

function ResultStrip() {
  return (
    <motion.div
      variants={stripVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="result-strip-wrapper"
      style={{
        background: "#0A1628",
        border: "1px solid rgba(201,160,96,0.2)",
        borderRadius: "24px",
        padding: "40px 32px",
        display: "flex",
        alignItems: "flex-start",
        gap: "0",
        marginTop: "40px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Subtle gold shimmer */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(201,160,96,0.6), transparent)",
      }} />

      {RESULTS.map((item, i) => (
        <motion.div
          key={item.title}
          variants={stripItemVariants}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "12px",
            padding: "0 20px",
            borderRight: i < RESULTS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
          }}
          className="result-strip-item"
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.2 }}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "1.5px solid rgba(201,160,96,0.4)",
              background: "rgba(201,160,96,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#C9A060",
            }}
          >
            {item.icon}
          </motion.div>
          <div>
            <p style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 6px",
              fontFamily: "var(--font-fraunces, Georgia, serif)",
            }}>
              {item.title}
            </p>
            <p style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.55)",
              margin: 0,
              lineHeight: 1.6,
            }}>
              {item.text}
            </p>
          </div>
        </motion.div>
      ))}

      <style>{`
        @media (max-width: 768px) {
          .result-strip-item {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.07);
            padding: 16px 0 !important;
          }
        }
      `}</style>
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function AppBenefitsSection({ funilHref = "/signup" }: { funilHref?: string }) {
  return (
    <section
      id="funcoes"
      style={{
        background: "#F5F0E6",
        padding: "100px 24px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Decorative lines */}
      <svg
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.35 }}
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M -50 200 Q 200 100 400 250 Q 600 400 800 200" fill="none" stroke="#C9A060" strokeWidth="0.8" />
        <path d="M 900 600 Q 1050 500 1250 650" fill="none" stroke="#C9A060" strokeWidth="0.8" />
        <path d="M 50 700 Q 150 600 300 720" fill="none" stroke="#C9A060" strokeWidth="0.6" />
      </svg>

      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid #C9A060",
              borderRadius: "9999px",
              padding: "5px 16px",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "#92610A",
              textTransform: "uppercase",
              marginBottom: "20px",
              background: "rgba(201,160,96,0.08)",
            }}
          >
            ✦ Benefícios do Aplicativo
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(28px, 4vw, 46px)",
              fontWeight: 700,
              color: "#0A1628",
              margin: "0 0 16px",
              lineHeight: 1.2,
            }}
          >
            Tudo que o LeadBellus entrega<br />
            para transformar conversas em{" "}
            <span style={{ position: "relative", display: "inline-block" }}>
              <span style={{ color: "#C9A060" }}>agendamentos</span>
              <motion.svg
                viewBox="0 0 160 10"
                style={{ position: "absolute", bottom: "-6px", left: 0, width: "100%", overflow: "visible" }}
                preserveAspectRatio="none"
                aria-hidden
              >
                <motion.path
                  d="M 2 7 Q 40 2 80 7 Q 120 12 158 5"
                  fill="none"
                  stroke="#C9A060"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.9, delay: 0.7, ease: "easeOut" }}
                />
              </motion.svg>
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: "15px",
              color: "#4a5568",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: 1.75,
            }}
          >
            O aplicativo completo que centraliza respostas estratégicas, prioriza leads,
            contorna objeções, automatiza follow-ups e gera resultados reais para sua clínica.
          </motion.p>
        </div>

        {/* ── Cards grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "0",
        }}
          className="benefits-grid"
        >
          {CARDS.map((card, i) => (
            <BenefitCard key={card.number} card={card} index={i} />
          ))}
        </div>

        {/* ── Result strip ── */}
        <ResultStrip />

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginTop: "40px" }}
        >
          <Link
            href={funilHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "#0A1628",
              color: "#C9A060",
              border: "1.5px solid rgba(201,160,96,0.3)",
              borderRadius: "9999px",
              padding: "15px 36px",
              fontSize: "15px",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(10,22,40,0.2)",
              transition: "box-shadow 0.25s ease, transform 0.2s ease, border-color 0.2s ease",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.boxShadow = "0 6px 28px rgba(201,160,96,0.22), 0 4px 20px rgba(10,22,40,0.2)";
              el.style.transform = "translateY(-2px)";
              el.style.borderColor = "rgba(201,160,96,0.7)";
              const arrow = el.querySelector(".cta-arrow") as HTMLElement;
              if (arrow) arrow.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.boxShadow = "0 4px 20px rgba(10,22,40,0.2)";
              el.style.transform = "translateY(0)";
              el.style.borderColor = "rgba(201,160,96,0.3)";
              const arrow = el.querySelector(".cta-arrow") as HTMLElement;
              if (arrow) arrow.style.transform = "translateX(0)";
            }}
          >
            <span>✦</span>
            <span>Quero transformar meus atendimentos</span>
            <span className="cta-arrow" style={{ transition: "transform 0.2s ease" }}>→</span>
          </Link>
          <p style={{ fontSize: "12px", color: "#92610A", marginTop: "10px" }}>
            Teste grátis no simulador abaixo — sem login, sem cartão
          </p>
        </motion.div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 1024px) {
          .benefits-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .benefits-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .result-strip-wrapper {
            flex-direction: column !important;
          }
        }
        @media (max-width: 480px) {
          .benefits-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
