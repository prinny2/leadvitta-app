import type { ReactNode } from "react";
import { ArrowRight, PlayCircle } from "lucide-react";
import { LandingCtaLink } from "@/components/landing-cta-link";

const INTENT_TAGS = [
  "Preço com contexto",
  "Objeção sem desconto",
  "Follow-up elegante",
  "Tom da sua clínica",
];

const DEFAULT_HERO_BULLETS = [
  "3 respostas prontas para copiar, adaptar e enviar em segundos.",
  "Tom consultivo da clínica, sem soar genérico ou improvisado.",
  "Demo grátis com 5 respostas. Depois, Start R$97/mês para uso contínuo.",
];

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
  ctaText = "Testar 5 respostas grátis",
  hideSimuladorLink = false,
}: HeroTextContentProps = {}) {
  const heroBullets = bullets || DEFAULT_HERO_BULLETS;

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
        WhatsApp da estética, sem improviso
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
            Sua clínica recebe o lead.
            <br />
            <span style={{ color: "#F7C96B" }}>O LeadBellus devolve a resposta</span>
            <br />
            com contexto e padrão.
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
          "Para clínicas de estética que querem responder preço, medo, objeção e sumiço com mais clareza, mais consistência e uma percepção mais premium no WhatsApp."}
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
          <span style={{ color: "#5EE0A0", fontSize: "11px", fontWeight: 800 }}>lead quente</span>
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

      {heroBullets.length ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "28px",
            maxWidth: "480px",
          }}
        >
          {heroBullets.slice(0, 3).map((bullet) => (
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
        <LandingCtaLink
          href={ctaHref}
          source="hero_primary"
          className="px-7"
        >
          {ctaText}
          <ArrowRight size={17} />
        </LandingCtaLink>
        {!hideSimuladorLink ? (
          <LandingCtaLink
            href="#simulador"
            source="hero_demo"
            variant="secondary"
            className="px-6"
          >
            <PlayCircle size={17} />
            Ver demo
          </LandingCtaLink>
        ) : null}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "0 0 28px" }}>
        {["Sem cartão para testar", "Start R$97/mês", "Checkout seguro via Stripe"].map((item) => (
          <span
            key={item}
            style={{
              border: "1px solid rgba(201,160,96,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.72)",
              borderRadius: "9999px",
              padding: "7px 12px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {item}
          </span>
        ))}
      </div>

      <div aria-label="Situações que o LeadBellus ajuda a responder" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {INTENT_TAGS.map((label) => (
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
