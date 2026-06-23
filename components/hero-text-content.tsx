import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

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
  ctaHref = "/signup?plan=start",
  ctaText = "Gerar 5 respostas grátis",
  hideSimuladorLink = false,
}: HeroTextContentProps = {}) {
  const intentTags = ["Preço sem susto", "Achou caro", "Cliente sumiu", "Medo do procedimento"];

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
          letterSpacing: 0,
          textTransform: "uppercase",
          marginBottom: "20px",
        }}
      >
        Seu WhatsApp da estética sem aperto
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
            A cliente chamou.
            <br />
            <span style={{ color: "#F7C96B" }}>A resposta já sai pronta.</span>
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
          "Travou no que responder? Cola a mensagem aqui e saem 3 respostas no jeitinho da sua clínica, prontas pra colar no WhatsApp. Grátis pra testar, sem cartão."}
      </p>

      <div
        className="hero-mobile-proof"
        style={{
          display: "none",
          border: "1px solid rgba(247,201,107,0.24)",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.055)",
          padding: "12px",
          margin: "0 auto 22px",
          maxWidth: "330px",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "9px" }}>
          <strong style={{ color: "#F7F1E4", fontSize: "12px" }}>Ana - WhatsApp</strong>
          <span style={{ color: "#5EE0A0", fontSize: "11px", fontWeight: 800 }}>quase fechando</span>
        </div>
        <div style={{ display: "grid", gap: "8px" }}>
          <div style={{ borderRadius: "13px 13px 13px 4px", background: "rgba(255,255,255,0.08)", padding: "9px 10px", color: "rgba(255,255,255,0.86)", fontSize: "12px", lineHeight: 1.45 }}>
            Quanto fica o botox? Tenho medo de ficar artificial.
          </div>
          <div style={{ borderRadius: "13px 13px 4px 13px", border: "1px solid rgba(94,224,160,0.28)", background: "rgba(94,224,160,0.12)", padding: "9px 10px", color: "#EFFFF5", fontSize: "12px", lineHeight: 1.45 }}>
            3 respostas prontas para copiar no tom da clínica.
          </div>
        </div>
      </div>

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
            boxShadow: "0 18px 46px rgba(247,201,107,0.28)",
          }}
        >
          {ctaText}
          <ArrowRight size={17} />
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
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <PlayCircle size={17} />
            Ver demo
          </a>
        ) : null}
      </div>

      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.42)", margin: "0 0 28px" }}>
        Demo com 5 respostas · Start R$97/mês · sem cartão para testar
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

      <style>{`
        @media (max-width: 767px) {
          .hero-mobile-proof {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
