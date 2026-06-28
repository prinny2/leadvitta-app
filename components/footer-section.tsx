"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 6 C26 14, 10 32, 10 54 C10 70, 22 82, 40 90" stroke="#C9A060" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M40 6 C54 14, 70 32, 70 54 C70 70, 58 82, 40 90" stroke="#C9A060" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <line x1="40" y1="32" x2="40" y2="86" stroke="#C9A060" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="40" cy="27" r="5.5" fill="#C9A060"/>
    </svg>
  );
}

function Wordmark() {
  return (
    <span
      style={{
        fontFamily: "var(--font-fraunces, Georgia, serif)",
        fontSize: "18px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
      }}
    >
      <span style={{ color: "#ffffff" }}>Lead</span>
      <span style={{ color: "#C9A060" }}>Bellus</span>
    </span>
  );
}

function GoldDivider() {
  return (
    <div
      style={{
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(201,160,96,0.25) 30%, rgba(201,160,96,0.25) 70%, transparent)",
        margin: "0 0 28px",
      }}
    />
  );
}

const PRODUTO = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Preços", href: "#precos" },
  { label: "FAQ", href: "#faq" },
];

const LEGAL = [
  { label: "Termos de Serviço", href: "/termos" },
  { label: "Privacidade", href: "/privacidade" },
  { label: "Política de Reembolso", href: "/reembolso" },
];

const STACK = [
  { label: "Z-API WhatsApp", icon: MessageCircle },
  { label: "NLP de intenção", icon: Brain },
  { label: "GPT-4o + Claude + Gemini", icon: Sparkles },
  { label: "Stripe seguro", icon: ShieldCheck },
];

function FooterLink({ href, children, isNext }: { href: string; children: React.ReactNode; isNext?: boolean }) {
  const style: React.CSSProperties = {
    fontSize: "14px",
    color: "rgba(255,255,255,0.45)",
    textDecoration: "none",
    display: "inline-block",
    transition: "color 0.2s ease, transform 0.2s ease",
  };
  const handlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.currentTarget.style.color = "rgba(255,255,255,0.7)";
      e.currentTarget.style.transform = "translateX(3px)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.currentTarget.style.color = "rgba(255,255,255,0.45)";
      e.currentTarget.style.transform = "translateX(0)";
    },
  };
  if (isNext) {
    return <Link href={href} style={style} {...handlers}>{children}</Link>;
  }
  return <a href={href} style={style} {...handlers}>{children}</a>;
}

export function FooterSection() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "#050d17",
        borderTop: "1px solid rgba(201,160,96,0.12)",
        padding: "56px 24px 32px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "40px",
          marginBottom: "40px",
        }}
      >
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <LogoMark size={34} />
            <Wordmark />
          </div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: "220px", marginBottom: "16px" }}>
            WhatsApp, NLP e IA no tom da sua clínica.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "260px" }}>
            {STACK.map(({ label, icon: Icon }) => (
              <span
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "rgba(255,255,255,0.52)",
                  fontSize: "12px",
                }}
              >
                <Icon size={14} color="#C9A060" />
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Produto */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: "16px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Produto
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {PRODUTO.map((l) => (
              <FooterLink key={l.label} href={l.href}>{l.label}</FooterLink>
            ))}
          </div>
        </motion.div>

        {/* Legal */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.19, ease: [0.22, 1, 0.36, 1] }}
        >
          <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: "16px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Legal
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {LEGAL.map((l) => (
              <FooterLink key={l.label} href={l.href} isNext>{l.label}</FooterLink>
            ))}
          </div>
        </motion.div>

        {/* Contato / Suporte */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: "16px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Suporte
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <FooterLink href="mailto:suporte@leadbellus.com.br">
              suporte@leadbellus.com.br
            </FooterLink>
            <FooterLink href="https://instagram.com/leadbellus" isNext={false}>
              Instagram @leadbellus
            </FooterLink>
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)" }}>
              Suporte pelo chat no app
            </span>
          </div>
        </motion.div>
      </div>

      <GoldDivider />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}
      >
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: 0 }}>
          © 2026 LeadBellus · Vinicius Paes da Serra Freire (MEI)
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            padding: "6px 12px",
          }}
        >
          <ShieldCheck size={14} color="rgba(255,255,255,0.4)" />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
            Stripe · Firebase · Z-API · dados protegidos
          </span>
        </div>
      </motion.div>
    </motion.footer>
  );
}
