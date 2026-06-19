"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";

const funilHref = "/signup";

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      delay: 0.3 + i * 0.18,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
};

interface HeroTextContentProps {
  headline?: React.ReactNode;
  subtitle?: React.ReactNode;
  bullets?: string[];
  ctaHref?: string;
  ctaText?: string;
  hideSimuladorLink?: boolean;
}

export function HeroTextContent({
  headline,
  subtitle,
  bullets,
  ctaHref = "/signup",
  ctaText = "Quero gerar minha resposta agora →",
  hideSimuladorLink = false,
}: HeroTextContentProps = {}) {
  return (
    <div>
      {/* Tag pill */}
      <motion.div
        variants={fadeUpVariants} custom={0}
        initial="hidden"
        animate="visible"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          border: "1px solid #C9A060",
          color: "#C9A060",
          borderRadius: "9999px",
          padding: "4px 14px",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "20px",
        }}
      >
        ✦ Feito para clínicas de estética brasileiras
      </motion.div>

      {/* H1 */}
      <motion.h1
        variants={fadeUpVariants} custom={1}
        initial="hidden"
        animate="visible"
        style={{
          fontFamily: "var(--font-fraunces, Georgia, serif)",
          fontSize: "clamp(40px, 5vw, 68px)",
          fontWeight: 700,
          lineHeight: 1.05,
          margin: "0 0 24px",
          letterSpacing: "-0.02em",
          color: "#ffffff",
        }}
      >
        {headline || (
          <>
            Ela sumiu.
            <br />
            E não foi
            <br />
            <span style={{ color: "#C9A060" }}>pelo preço.</span>
          </>
        )}
      </motion.h1>

      {/* Subtítulo */}
      <motion.p
        variants={fadeUpVariants} custom={2}
        initial="hidden"
        animate="visible"
        style={{
          fontSize: "17px",
          lineHeight: 1.75,
          color: "rgba(255,255,255,0.72)",
          maxWidth: "480px",
          margin: "0 0 36px",
        }}
      >
        {subtitle || "Foi por uma resposta que não conduziu. O LeadBellus transforma a mensagem da cliente em 3 opções de resposta no seu tom, para você escolher, copiar e mandar."}
      </motion.p>

      {/* Bullets customizados se fornecidos */}
      {bullets && (
        <motion.div
          variants={fadeUpVariants} custom={2.5}
          initial="hidden"
          animate="visible"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            marginBottom: "36px",
            maxWidth: "480px",
          }}
        >
          {bullets.map((bullet, idx) => (
            <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "rgba(201,160,96,0.15)",
                  border: "1px solid #C9A060",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                <span style={{ color: "#C9A060", fontSize: "11px", fontWeight: "bold" }}>✓</span>
              </span>
              <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                {bullet}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Botões CTA */}
      <motion.div
        variants={fadeUpVariants} custom={3}
        initial="hidden"
        animate="visible"
        style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}
      >
        <Link
          href={ctaHref}
          style={{
            background: "#C9A060",
            color: "#07101e",
            borderRadius: "9999px",
            padding: "15px 30px",
            fontSize: "15px",
            fontWeight: 700,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {ctaText}
        </Link>
        {!hideSimuladorLink && (
          <a
            href="#simulador"
            style={{
              border: "1.5px solid rgba(201,160,96,0.5)",
              color: "#C9A060",
              borderRadius: "9999px",
              padding: "15px 28px",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Ver como funciona ↓
          </a>
        )}
      </motion.div>

      {/* Micro-copy */}
      <motion.p
        variants={fadeUpVariants} custom={4}
        initial="hidden"
        animate="visible"
        style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)", marginBottom: "40px" }}
      >
        7 dias grátis · Sem cartão · Você usa hoje mesmo
      </motion.p>

      {/* Feature pills */}
      <motion.div
        variants={fadeUpVariants} custom={5}
        initial="hidden"
        animate="visible"
        style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
      >
        {[
          { icon: "💬", label: "Respostas estratégicas" },
          { icon: "🔄", label: "Retomadas" },
          { icon: "🛡️", label: "Objeções" },
          { icon: "🧠", label: "Prioridade da conversa" },
        ].map((f) => (
          <div
            key={f.label}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,160,96,0.15)",
              borderRadius: "9999px",
              padding: "7px 14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "14px" }}>{f.icon}</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
              {f.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
