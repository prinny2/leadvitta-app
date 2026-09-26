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
        letterSpacing: 0,
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
  { label: "Sugere respostas para o WhatsApp", icon: MessageCircle },
  { label: "Entende o pedido", icon: Brain },
  { label: "Mantém o tom da clínica", icon: Sparkles },
  { label: "Pagamento seguro", icon: ShieldCheck },
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
      className="lb-footer"
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
        className="lb-footer-grid"
      >
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="lb-footer-brand"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <LogoMark size={34} />
            <Wordmark />
          </div>
          <p className="lb-footer-lead" style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: "220px", marginBottom: "16px" }}>
            Respostas prontas no tom da sua clínica.
          </p>
          <div className="lb-footer-stack" style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "260px" }}>
            {STACK.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="lb-footer-chip"
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
          className="lb-footer-column"
        >
          <p className="lb-footer-heading" style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: "16px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Produto
          </p>
          <div className="lb-footer-links" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
          className="lb-footer-column"
        >
          <p className="lb-footer-heading" style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: "16px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Legal
          </p>
          <div className="lb-footer-links" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
          className="lb-footer-support"
        >
          <p className="lb-footer-heading" style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: "16px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Suporte
          </p>
          <div className="lb-footer-links lb-footer-support-links" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <FooterLink href="mailto:suporte@leadbellus.com.br">
              suporte@leadbellus.com.br
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
        className="lb-footer-bottom"
      >
        <p className="lb-footer-fineprint" style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: 0 }}>
          © 2026 LeadBellus · Vinicius Paes da Serra Freire (MEI)
        </p>
        <div
          className="lb-footer-badge"
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
            Pagamento seguro · dados protegidos
          </span>
        </div>
      </motion.div>
      <style>{`
        @media (max-width: 767px) {
          .lb-footer {
            padding: 30px 18px calc(76px + env(safe-area-inset-bottom)) !important;
          }

          .lb-footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 24px 18px !important;
            margin-bottom: 24px !important;
          }

          .lb-footer-brand,
          .lb-footer-support {
            grid-column: 1 / -1;
          }

          .lb-footer-brand {
            padding-bottom: 2px;
          }

          .lb-footer-lead {
            max-width: 280px !important;
            margin-bottom: 14px !important;
            font-size: 13px !important;
            line-height: 1.55 !important;
          }

          .lb-footer-stack {
            max-width: none !important;
            flex-direction: row !important;
            flex-wrap: wrap;
            gap: 8px !important;
          }

          .lb-footer-chip {
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 999px;
            background: rgba(255,255,255,0.035);
            padding: 7px 9px;
            line-height: 1;
            white-space: nowrap;
          }

          .lb-footer-heading {
            margin-bottom: 10px !important;
            letter-spacing: 0.08em !important;
          }

          .lb-footer-links {
            gap: 8px !important;
          }

          .lb-footer-links a,
          .lb-footer-links span {
            font-size: 13px !important;
            line-height: 1.35;
          }

          .lb-footer-support-links {
            display: grid !important;
            grid-template-columns: 1fr;
            gap: 8px !important;
          }

          .lb-footer-bottom {
            align-items: flex-start !important;
            gap: 10px !important;
          }

          .lb-footer-fineprint {
            font-size: 11px !important;
            line-height: 1.45 !important;
            max-width: 250px;
          }

          .lb-footer-badge {
            padding: 6px 10px !important;
          }

          .lb-footer-badge span {
            font-size: 11px !important;
          }
        }

        @media (max-width: 374px) {
          .lb-footer {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          .lb-footer-grid {
            gap: 22px 14px !important;
          }

          .lb-footer-chip {
            font-size: 11px !important;
            padding: 6px 8px;
          }
        }
      `}</style>
    </motion.footer>
  );
}
