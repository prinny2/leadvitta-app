"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const GUARANTEES = [
  {
    title: "7 dias grátis sem cartão",
    description: "Você testa antes de decidir. Sem cobrança automática.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="6" width="16" height="11" rx="2" stroke="#C9A060" strokeWidth="1.4" />
        <path d="M2 10h16" stroke="#C9A060" strokeWidth="1.4" />
        <path d="M6 14h4" stroke="#C9A060" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M15 3l-3 3-1.5-1.5" stroke="#C9A060" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "30 dias com dinheiro de volta após assinar",
    description: "Assinou e não sentiu diferença? Você pode pedir reembolso.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L4 5v5c0 3.87 2.57 7.5 6 8.5 3.43-1 6-4.63 6-8.5V5l-6-3z" stroke="#C9A060" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M7.5 10.5l2 2 3-3" stroke="#C9A060" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Cancele em 1 clique — sem ligar pra ninguém",
    description: "Sem ligação, sem formulário e sem burocracia.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="#C9A060" strokeWidth="1.4" />
        <path d="M10 6v4.5l3 1.5" stroke="#C9A060" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 4l12 12" stroke="#C9A060" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
  },
];

function GuaranteeItem({
  item,
  index,
}: {
  item: (typeof GUARANTEES)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: 0.55 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
        padding: "14px 16px",
        borderRadius: "14px",
        background: hovered ? "rgba(201,160,96,0.05)" : "transparent",
        transition: "background 0.25s ease",
        cursor: "default",
      }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: 0.6 + index * 0.12, type: "spring", stiffness: 280 }}
        style={{
          width: 38,
          height: 38,
          borderRadius: "10px",
          background: "rgba(201,160,96,0.08)",
          border: "1px solid rgba(201,160,96,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: hovered ? "0 0 12px rgba(201,160,96,0.18)" : "none",
          transition: "box-shadow 0.25s ease",
        }}
      >
        {item.icon}
      </motion.div>

      {/* Text */}
      <div>
        <p style={{ fontSize: "15px", color: "#0A1628", fontWeight: 600, margin: "0 0 2px", lineHeight: 1.4 }}>
          {item.title}
        </p>
        <AnimatePresence>
          {hovered && (
            <motion.p
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 4 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{ fontSize: "13px", color: "#6b7280", margin: 0, lineHeight: 1.55, overflow: "hidden" }}
            >
              {item.description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function AnimatedShield() {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ margin: "0 auto 28px", display: "block", width: 72, height: 72 }}
    >
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        {/* Glow circle */}
        <motion.circle
          cx="36" cy="36" r="34"
          fill="rgba(201,160,96,0.07)"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
        />
        {/* Shield body */}
        <motion.path
          d="M36 8L14 18v16c0 13.25 9.33 25.63 22 28.5C48.67 59.63 58 47.25 58 34V18L36 8z"
          stroke="#C9A060"
          strokeWidth="1.8"
          fill="rgba(201,160,96,0.06)"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        />
        {/* Check mark — drawn after shield */}
        <motion.path
          d="M26 36l7 7 13-13"
          stroke="#C9A060"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.85, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  );
}

export function RiskFreeSection({ funilHref = "/signup" }: { funilHref?: string }) {
  const [ctaHovered, setCtaHovered] = useState(false);

  return (
    <section
      id="garantia"
      style={{ background: "#F5F0E6", padding: "96px 24px", position: "relative", overflow: "hidden" }}
    >
      {/* Subtle background aura */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(201,160,96,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative" }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: "32px" }}
        >
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            border: "1px solid rgba(201,160,96,0.5)",
            background: "rgba(201,160,96,0.07)",
            borderRadius: "9999px",
            padding: "6px 18px",
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: "#92610A",
            textTransform: "uppercase",
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L2 3v4c0 2.76 1.87 5.35 4 5.94C8.13 12.35 10 9.76 10 7V3L6 1z" stroke="#92610A" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            Risco zero — literalmente
          </span>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "#ffffff",
            border: "1.5px solid #E8E4DC",
            borderRadius: "28px",
            padding: "52px 44px",
            boxShadow: "0 12px 48px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Shimmer sweep — once only */}
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            whileInView={{ x: "200%", opacity: [0, 0.06, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.9, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "50%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(201,160,96,0.3), transparent)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            {/* Shield */}
            <AnimatedShield />

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(24px, 3.5vw, 32px)",
                fontWeight: 700,
                color: "#0A1628",
                margin: "0 0 24px",
                lineHeight: 1.25,
              }}
            >
              Teste 7 dias. Se não gostar, não paga nada.
            </motion.h2>

            {/* Text block 1 */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: "15px", color: "#4a5568", lineHeight: 1.8, marginBottom: "12px" }}
            >
              Você não vai precisar colocar cartão de crédito pra começar. Você testa por 7 dias sem custo.
            </motion.p>

            {/* Text block 2 */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.46, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: "15px", color: "#4a5568", lineHeight: 1.8, marginBottom: "28px" }}
            >
              Se depois do trial você decidir assinar e em 30 dias sentir que o LeadBellus não fez diferença real — devolvemos{" "}
              <strong style={{ color: "#0A1628" }}>100% do que você pagou</strong>.
            </motion.p>

            {/* Stamp phrase */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
              style={{ marginBottom: "36px" }}
            >
              <p style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#0A1628",
                fontStyle: "italic",
                margin: "0 0 8px",
                lineHeight: 1.4,
              }}>
                Sem questionamento. Sem formulário. Sem explicação necessária.
              </p>
              {/* Underline drawn */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <svg width="260" height="8" viewBox="0 0 260 8" preserveAspectRatio="none" style={{ overflow: "visible" }}>
                  <motion.path
                    d="M 2 5 Q 65 1 130 5 Q 195 9 258 4"
                    fill="none"
                    stroke="#C9A060"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.7 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
                  />
                </svg>
              </div>
            </motion.div>

            {/* Guarantee items */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              textAlign: "left",
              marginBottom: "32px",
            }}>
              {GUARANTEES.map((item, i) => (
                <GuaranteeItem key={item.title} item={item} index={i} />
              ))}
            </div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.9, ease: "easeOut" }}
              style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, #E8E4DC, transparent)",
                marginBottom: "24px",
                transformOrigin: "center",
              }}
            />

            {/* Closing text */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1.0 }}
              style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.75, marginBottom: "28px" }}
            >
              O único risco aqui é{" "}
              <span style={{ color: "#0A1628", fontWeight: 600 }}>
                continuar perdendo clientes no WhatsApp
              </span>{" "}
              enquanto existe uma ferramenta que resolve isso por menos do que um único procedimento por mês.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={funilHref}
                  onMouseEnter={() => setCtaHovered(true)}
                  onMouseLeave={() => setCtaHovered(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#0A1628",
                    color: "#C9A060",
                    borderRadius: "14px",
                    padding: "15px 36px",
                    fontSize: "15px",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: ctaHovered
                      ? "0 0 24px rgba(201,160,96,0.2), 0 6px 24px rgba(10,22,40,0.2)"
                      : "0 4px 16px rgba(10,22,40,0.15)",
                    transition: "box-shadow 0.25s ease",
                  }}
                >
                  Começar teste grátis
                  <motion.span
                    animate={{ x: ctaHovered ? 4 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "inline-block" }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
              <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "12px" }}>
                7 dias grátis · Sem cartão · Acesso imediato
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
