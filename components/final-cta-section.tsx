"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LegalConsentLinks } from "@/components/legal-consent-links";

function TagPill({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "inline-block", marginBottom: "24px" }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          border: "1px solid rgba(201,160,96,0.35)",
          color: "#C9A060",
          borderRadius: "9999px",
          padding: "5px 14px",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          background: "rgba(201,160,96,0.07)",
        }}
      >
        Última parada
      </span>
    </motion.div>
  );
}

const PROMISES = [
  "Nunca mais fique em branco no WhatsApp",
  "Nunca mais perca uma lead por não saber o que falar",
];

export function FinalCTASection({ funilHref }: { funilHref: string }) {
  return (
    <section
      id="cta-final"
      style={{
        background: "#07101e",
        padding: "80px 24px 100px",
        borderTop: "1px solid rgba(201,160,96,0.15)",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <TagPill>Última parada</TagPill>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-fraunces, Georgia, serif)",
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 700,
            color: "#ffffff",
            margin: "0 0 24px",
            lineHeight: 1.15,
          }}
        >
          Você vai continuar respondendo do mesmo jeito?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ color: "rgba(255,255,255,0.65)", fontSize: "16px", lineHeight: 1.8, marginBottom: "20px" }}
        >
          Toda semana, mais clientes perguntam o preço e somem.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{ color: "rgba(255,255,255,0.65)", fontSize: "16px", lineHeight: 1.8, marginBottom: "32px" }}
        >
          Isso não é falta de talento. É falta da ferramenta certa.
        </motion.p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginBottom: "40px",
            textAlign: "left",
          }}
        >
          {PROMISES.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.35 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3, boxShadow: "0 0 20px rgba(201,160,96,0.15)" }}
              style={{
                background: "rgba(201,160,96,0.06)",
                border: "1px solid rgba(201,160,96,0.2)",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                cursor: "default",
                transition: "border-color 0.2s ease",
              }}
            >
              <span style={{ color: "#C9A060", fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>✦</span>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{item}</span>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-fraunces, Georgia, serif)",
            fontSize: "18px",
            color: "#C9A060",
            marginBottom: "32px",
            fontWeight: 600,
          }}
        >
          Uma boa conversa já pode justificar o mês. O risco de testar é zero.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ display: "inline-block" }}
        >
          <Link
            href={funilHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "#C9A060",
              color: "#07101e",
              borderRadius: "16px",
              padding: "20px 48px",
              fontSize: "17px",
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 0 0 rgba(201,160,96,0)",
              transition: "box-shadow 0.25s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 32px rgba(201,160,96,0.45)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 0 rgba(201,160,96,0)";
            }}
          >
            Quero minha clínica respondendo melhor agora
            <ArrowRight size={20} />
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: "14px" }}
        >
          Demo com 5 respostas grátis · Start pago para uso contínuo
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 1 }}
          style={{ maxWidth: "430px", margin: "10px auto 0" }}
        >
          <LegalConsentLinks tone="light" />
        </motion.div>
      </div>
    </section>
  );
}
