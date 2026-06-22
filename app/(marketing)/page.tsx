import Link from "next/link";
import { Suspense } from "react";
import { LandingWhatsAppDemo } from "@/components/landing-whatsapp-demo";
import { LoadingRespostas } from "@/components/loading-respostas";
import { HeroDevices } from "@/components/hero-devices";
import { HeroTextContent } from "@/components/hero-text-content";
import { PricingSection } from "@/components/pricing-section";
import { AppBenefitsSection } from "@/components/app-benefits-section";
import { SimuladorFadeUp, SimuladorUnderline, SimuladorScenarioBtn } from "@/components/simulador-ui";
import { FaqSection } from "@/components/faq-section";
import { FinalCTASection } from "@/components/final-cta-section";
import { FooterSection } from "@/components/footer-section";
import { LegalConsentLinks } from "@/components/legal-consent-links";

const funilHref = "/signup";

function StructuredDataTags() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LeadBellus",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://www.leadbellus.com.br",
    description:
      "Copiloto de WhatsApp para clínicas de estética cria respostas curtas para preço, objeções e follow-up.",
    inLanguage: "pt-BR",
    offers: {
      "@type": "Offer",
      price: "97",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: "https://www.leadbellus.com.br/signup",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Clínicas de estética e profissionais de beleza",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── Logo SVG inline ───────────────────────────────────────────────────────────
function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M40 6 C26 14, 10 32, 10 54 C10 70, 22 82, 40 90"
        stroke="#C9A060"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M40 6 C54 14, 70 32, 70 54 C70 70, 58 82, 40 90"
        stroke="#C9A060"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <line
        x1="40" y1="32" x2="40" y2="86"
        stroke="#C9A060"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="40" cy="27" r="5.5" fill="#C9A060" />
    </svg>
  );
}

// ─── Section tag pill ──────────────────────────────────────────────────────────
function TagPill({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        border: `1px solid ${light ? "rgba(201,160,96,0.5)" : "#C9A060"}`,
        color: light ? "#7A5108" : "#C9A060",
        background: light ? "rgba(201,160,96,0.1)" : "transparent",
        borderRadius: "9999px",
        padding: "4px 14px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: 0,
        textTransform: "uppercase",
        marginBottom: "20px",
      }}
    >
      {children}
    </div>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(7,16,30,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(201,160,96,0.15)",
      }}
    >
      <div
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <LogoMark size={28} />
          <span
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "18px",
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "-0.01em",
            }}
          >
            LeadBellus
          </span>
        </Link>

        <div className="hidden md:flex" style={{ gap: "32px", alignItems: "center" }}>
          {[
            { label: "Sinais", href: "#sinais" },
            { label: "Demo", href: "#simulador" },
            { label: "Preços", href: "#precos" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", textDecoration: "none" }}
              className="hover:text-[#C9A060] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/login"
            style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", textDecoration: "none" }}
            className="hidden md:block"
          >
            Entrar
          </Link>
          <Link
            href="/signup?plan=start"
            style={{
              background: "#C9A060",
              color: "#07101e",
              borderRadius: "9999px",
              padding: "8px 20px",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Gerar 5 respostas
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Launch banner ─────────────────────────────────────────────────────────────
function LaunchBanner() {
  return (
    <div
      style={{
        background: "linear-gradient(90deg, #92610A, #C9A060, #92610A)",
        color: "#07101e",
        textAlign: "center",
        padding: "10px 24px",
        fontSize: "13px",
        fontWeight: 700,
        letterSpacing: "0.02em",
      }}
    >
      Plantão de lançamento: 5 respostas grátis para testar no WhatsApp da sua clínica.
    </div>
  );
}

function CompactProblemSection() {
  const cards = [
    {
      title: "Preço seco",
      copy: "Transforme pedido de valor em resposta com contexto, segurança e convite para agenda.",
      tags: ["Preço", "Avaliação"],
    },
    {
      title: "Objeção de caro",
      copy: "Responda sem desconto automático e mostre valor antes de perder a conversa.",
      tags: ["Valor", "Sem desconto"],
    },
    {
      title: "Cliente sumiu",
      copy: "Retome o contato com follow-up educado, direto e com próximo passo claro.",
      tags: ["Follow-up", "Retomar"],
    },
  ];

  return (
    <section id="sinais" style={{ background: "#F6F0E6", padding: "72px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ maxWidth: "640px", marginBottom: "32px" }}>
          <TagPill light>Sinais que ele lê</TagPill>
          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              color: "#07101e",
              margin: "0 0 12px",
              lineHeight: 1.16,
            }}
          >
            O WhatsApp mostra a intenção. O LeadBellus transforma em resposta.
          </h2>
          <p style={{ color: "#475569", fontSize: "16px", lineHeight: 1.7, margin: 0 }}>
            Tags curtas guiam a resposta sem virar script engessado.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {cards.map((card) => (
            <article
              key={card.title}
              style={{
                background: "#ffffff",
                border: "1px solid rgba(7,16,30,0.08)",
                borderRadius: "8px",
                padding: "24px",
              }}
            >
              <h3 style={{ color: "#07101e", fontSize: "18px", fontWeight: 700, margin: "0 0 10px" }}>
                {card.title}
              </h3>
              <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.65, margin: 0 }}>{card.copy}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "18px" }}>
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      border: "1px solid rgba(122,81,8,0.18)",
                      background: "rgba(201,160,96,0.1)",
                      borderRadius: "9999px",
                      color: "#7A5108",
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "6px 10px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ fontFamily: "var(--font-inter, system-ui, sans-serif)" }}>
      <StructuredDataTags />
      <Navbar />
      <LaunchBanner />
      <main>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        style={{
          background: "#07101e",
          color: "#ffffff",
          padding: "78px 24px 84px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(118deg, transparent 0 45%, rgba(255,122,89,0.10) 45% 46%, transparent 46% 68%, rgba(94,224,160,0.08) 68% 69%, transparent 69% 100%), repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 76px), repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 76px)",
            opacity: 0.72,
          }}
        />

        <div style={{ maxWidth: "1152px", margin: "0 auto", position: "relative" }}>
          <div className="hero-grid grid grid-cols-1 md:grid-cols-[410px_1fr] gap-10 items-start">
            <HeroTextContent />

            <div className="hidden md:flex justify-center items-start pt-12">
              <HeroDevices />
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .hero-grid {
              grid-template-columns: 1fr !important;
              text-align: center;
            }
            .hero-grid > div:first-child > p { margin-left: auto; margin-right: auto; }
            .hero-grid > div:first-child > div { justify-content: center; }
          }
        `}</style>
      </section>

      {/* ── PROBLEMA E SOLUÇÃO ───────────────────────────────────────────────── */}
      <CompactProblemSection />

      <AppBenefitsSection funilHref={funilHref} />

      {/* ── SIMULADOR INTERATIVO ─────────────────────────────────────────────── */}
      <section id="simulador" style={{ background: "#07101e", padding: "96px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

          {/* ── Header animado ── */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            {/* Badge */}
            <SimuladorFadeUp delay={0}>
              <TagPill>✦ Experimente agora</TagPill>
            </SimuladorFadeUp>

            {/* Título */}
            <SimuladorFadeUp delay={0.1}>
              <h2
                style={{
                  fontFamily: "var(--font-fraunces, Georgia, serif)",
                  fontSize: "clamp(28px, 4vw, 42px)",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: "0 0 16px",
                  lineHeight: 1.2,
                }}
              >
                Veja como ficaria{" "}
                <span style={{ position: "relative", display: "inline-block" }}>
                  <span style={{ color: "#C9A060" }}>uma resposta da sua clínica</span>
                  <SimuladorUnderline />
                </span>{" "}
                — agora
              </h2>
            </SimuladorFadeUp>

            <SimuladorFadeUp delay={0.2}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", maxWidth: "520px", margin: "0 auto 20px" }}>
                Escolha uma situação e veja a resposta personalizada.
              </p>
            </SimuladorFadeUp>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
              {[
                { id: "preco", label: "Perguntou preço" },
                { id: "achou_caro", label: "Achou caro" },
                { id: "sumiu", label: "Sumiu" },
                { id: "medo", label: "Medo do procedimento" },
              ].map((d, i) => (
                <SimuladorFadeUp key={d.id} delay={0.28 + i * 0.07}>
                  <SimuladorScenarioBtn href={`/?demo=${d.id}#simulador`} active={false}>
                    {d.label}
                  </SimuladorScenarioBtn>
                </SimuladorFadeUp>
              ))}
            </div>
          </div>

          <Suspense fallback={<LoadingRespostas etapas={["Carregando a demo…"]} />}>
            <LandingWhatsAppDemo />
          </Suspense>

          {/* ── CTA card ── */}
          <SimuladorFadeUp delay={0.1}>
          <div
            style={{
              background: "#0f1b2f",
              border: "1px solid rgba(201,160,96,0.2)",
              borderRadius: "16px",
              padding: "24px 28px",
              marginTop: "32px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.75, marginBottom: "20px" }}>
              A demo libera 5 respostas para testar. O Start é o plano pago para usar no atendimento real.
            </p>
            <Link
              href="/signup?plan=start"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#C9A060",
                color: "#07101e",
                borderRadius: "9999px",
                padding: "14px 32px",
                fontSize: "15px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Criar conta grátis →
            </Link>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "10px" }}>
              Demo: 5 respostas · Start: R$97/mês · cancele quando quiser
            </p>
            <div style={{ maxWidth: "430px", margin: "10px auto 0" }}>
              <LegalConsentLinks tone="light" />
            </div>
          </div>
          </SimuladorFadeUp>
        </div>
      </section>

      {/* ── OFERTA / PREÇOS ──────────────────────────────────────────────────── */}
      <section
        id="precos"
        style={{ background: "#07101e", padding: "96px 24px" }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <TagPill>Escolha o seu plano</TagPill>
            <h2
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 0 16px",
                lineHeight: 1.2,
              }}
            >
              Comece pelo plano que resolve hoje
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", maxWidth: "560px", margin: "0 auto" }}>
              Teste grátis e assine só se fizer sentido para sua rotina.
            </p>
          </div>

          <PricingSection />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <FaqSection />

      {/* ── CTA FINAL ────────────────────────────────────────────────────────── */}
      <FinalCTASection funilHref={funilHref} />

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      </main>
      <FooterSection />

      <style>{`
        .mobile-sales-spacer,
        .mobile-sales-bar {
          display: none;
        }

        @media (max-width: 767px) {
          .mobile-sales-spacer {
            display: block;
            height: 76px;
          }

          .mobile-sales-bar {
            display: flex;
          }
        }
      `}</style>

      {/* Espaço pra barra fixa no mobile */}
      <div className="mobile-sales-spacer" />

      {/* Barra de venda fixa — só mobile */}
      <div
        className="mobile-sales-bar"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 60,
          alignItems: "center",
          gap: "12px",
          background: "rgba(7,16,30,0.97)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(201,160,96,0.28)",
          padding: "10px 16px calc(10px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ lineHeight: 1.2 }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
            Start R$97<span style={{ fontSize: "12px", fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>/mês</span>
          </p>
          <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>
            Demo grátis: 5 respostas
          </p>
        </div>
        <Link
          href="#precos"
          style={{
            marginLeft: "auto",
            background: "#C9A060",
            color: "#07101e",
            fontWeight: 700,
            fontSize: "15px",
            borderRadius: "12px",
            padding: "13px 22px",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Ver Start →
        </Link>
      </div>
    </div>
  );
}
