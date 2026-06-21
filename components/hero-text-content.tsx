import type { ReactNode } from "react";
import Link from "next/link";

interface HeroTextContentProps {
  headline?: ReactNode;
  subtitle?: ReactNode;
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
  ctaText = "Gerar minha resposta grátis",
  hideSimuladorLink = false,
}: HeroTextContentProps = {}) {
  const intentTags = ["Preço", "Achou caro", "Sumiu", "Agendar"];

  return (
    <div className="hero-copy">
      <div
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
        Copiloto de WhatsApp para estética
      </div>

      <h1
        style={{
          fontFamily: "var(--font-fraunces, Georgia, serif)",
          fontSize: "clamp(40px, 5vw, 68px)",
          fontWeight: 700,
          lineHeight: 1.05,
          margin: "0 0 20px",
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
      </h1>

      <p
        style={{
          fontSize: "17px",
          lineHeight: 1.65,
          color: "rgba(255,255,255,0.72)",
          maxWidth: "460px",
          margin: "0 0 28px",
        }}
      >
        {subtitle ||
          "3 respostas curtas, no tom da sua clínica, para copiar e mandar no WhatsApp."}
      </p>

      {bullets ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "28px",
            maxWidth: "480px",
          }}
        >
          {bullets.slice(0, 3).map((bullet) => (
            <div key={bullet} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
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
                  color: "#C9A060",
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
              >
                ✓
              </span>
              <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.85)", lineHeight: 1.45 }}>
                {bullet}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <Link
          href={ctaHref}
          style={{
            background: "#C9A060",
            color: "#07101e",
            borderRadius: "9999px",
            padding: "15px 28px",
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
        {!hideSimuladorLink ? (
          <a
            href="#simulador"
            style={{
              border: "1.5px solid rgba(201,160,96,0.5)",
              color: "#C9A060",
              borderRadius: "9999px",
              padding: "15px 24px",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Ver demo
          </a>
        ) : null}
      </div>

      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.42)", margin: "0 0 28px" }}>
        5 respostas grátis · sem cartão · acesso imediato
      </p>

      <div aria-label="Situações que o LeadBellus ajuda a responder" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {intentTags.map((label) => (
          <span
            key={label}
            style={{
              background: "rgba(201,160,96,0.08)",
              border: "1px solid rgba(201,160,96,0.28)",
              borderRadius: "9999px",
              padding: "7px 13px",
              fontSize: "12px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
