"use client";

import Link from "next/link";
import { LegalConsentLinks } from "@/components/legal-consent-links";

export function FinalCTASection({ funilHref }: { funilHref: string }) {
  return (
    <section
      id="cta-final"
      style={{
        background: [
          "radial-gradient(900px 500px at 50% 0%,rgba(189,162,105,.14),transparent 60%)",
          "linear-gradient(180deg,#0E1A30,#0A121F)",
        ].join(","),
      }}
    >
      <div
        style={{
          maxWidth: "820px",
          margin: "0 auto",
          padding: "100px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "#BDA269",
          }}
        >
          Última parada
        </div>

        <h2
          style={{
            fontFamily: "var(--font-fraunces, Georgia, serif)",
            fontWeight: 800,
            fontSize: "clamp(32px, 4.6vw, 58px)",
            lineHeight: 1.08,
            letterSpacing: "-.02em",
            margin: "18px auto 0",
            maxWidth: "16ch",
            color: "#F1ECE0",
          }}
        >
          Você vai continuar respondendo do mesmo jeito?
        </h2>

        <p
          style={{
            fontSize: "17px",
            lineHeight: 1.65,
            color: "#AEB6C6",
            maxWidth: "600px",
            margin: "22px auto 0",
          }}
        >
          Toda semana são mais clientes que perguntaram o preço e nunca mais responderam. Isso não é falta de talento. É falta da ferramenta certa.
        </p>

        <p
          style={{
            fontFamily: "var(--font-fraunces, Georgia, serif)",
            fontStyle: "italic",
            fontSize: "20px",
            color: "#BDA269",
            margin: "24px auto 0",
            lineHeight: 1.4,
          }}
        >
          Uma única cliente recuperada paga o mês inteiro. O risco de testar é zero.
        </p>

        <Link
          href={funilHref}
          style={{
            display: "inline-flex",
            marginTop: "34px",
            background: "#BDA269",
            color: "#1A1206",
            textDecoration: "none",
            fontSize: "17px",
            fontWeight: 800,
            padding: "18px 36px",
            borderRadius: "99px",
            boxShadow: "0 16px 40px rgba(189,162,105,.32)",
          }}
        >
          Quero minha clínica respondendo melhor &rarr;
        </Link>

        <p
          style={{
            fontSize: "13.5px",
            color: "#8C94A6",
            marginTop: "18px",
            fontWeight: 600,
          }}
        >
          7 dias grátis · Sem cartão · Acesso imediato · Você usa hoje mesmo
        </p>

        <div style={{ maxWidth: "430px", margin: "12px auto 0" }}>
          <LegalConsentLinks tone="light" />
        </div>
      </div>
    </section>
  );
}
