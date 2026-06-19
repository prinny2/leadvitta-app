"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#C9A060" fillOpacity="0.12" />
      <path
        d="M16 6 C10 6 7 10 7 14 C7 18 10 20 16 26 C22 20 25 18 25 14 C25 10 22 6 16 6Z"
        fill="#C9A060"
        fillOpacity="0.8"
      />
    </svg>
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
  { label: "Funções", href: "#funcoes" },
  { label: "Preços", href: "#precos" },
  { label: "FAQ", href: "#faq" },
];

const LEGAL = [
  { label: "Termos de Uso", href: "/termos" },
  { label: "Privacidade", href: "/privacidade" },
  { label: "Política de Reembolso", href: "/reembolso" },
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
            <LogoMark size={28} />
            <span
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "18px",
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              LeadBellus
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: "220px", marginBottom: "16px" }}>
            A resposta certa. No seu tom. Em segundos.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <a
              href="https://instagram.com/leadbellus"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
                textDecoration: "none",
                transition: "background 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.18)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              📷
            </a>
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

        {/* Contato */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: "16px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Contato
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <FooterLink href="mailto:contato@leadbellus.com.br">
              📧 contato@leadbellus.com.br
            </FooterLink>
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)" }}>
              💬 Suporte pelo chat no app
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
          © 2026 LeadBellus · ResonAnza Inova Simples I S · Vinicius Paes da Serra Freire (MEI)
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
            Pagamento seguro via Stripe · Dados protegidos
          </span>
        </div>
      </motion.div>
    </motion.footer>
  );
}
