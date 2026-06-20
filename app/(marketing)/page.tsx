import Link from "next/link";
import { Suspense } from "react";
import {
  Check,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Target,
  Brain,
  MessageSquare,
  RefreshCw,
  FileText,
  Dna,
  Archive,
  Bot,
  CalendarCheck,
  Bell,
  Heart,
  Building2,
  User,
  Users,
  TrendingUp,
  Layers,
  Star,
} from "lucide-react";
import { billingPlanList } from "@/lib/billing";
import { PlanCTA } from "@/components/plan-cta";
import { WaitlistForm } from "@/components/waitlist-form";
import { LandingWhatsAppDemo } from "@/components/landing-whatsapp-demo";
import { LoadingRespostas } from "@/components/loading-respostas";
import { HeroDevices } from "@/components/hero-devices";
import { HeroShapes } from "@/components/hero-shapes";
import { HeroTextContent } from "@/components/hero-text-content";
import { PricingSection } from "@/components/pricing-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { AboutSection } from "@/components/about-section";
import { CompareResponsesSection } from "@/components/compare-responses-section";
import { AppBenefitsSection } from "@/components/app-benefits-section";
import { HeroHighlight, Highlight } from "@/components/hero-highlight-leadbellus";
import { PainPointSection } from "@/components/pain-point-section";
import { IndicadoCards, IndicadoHeader } from "@/components/indicado-cards";
import { SimuladorFadeUp, SimuladorUnderline, SimuladorScenarioBtn } from "@/components/simulador-ui";
import { RiskFreeSection } from "@/components/risk-free-section";
import { FaqSection } from "@/components/faq-section";
import { FinalCTASection } from "@/components/final-cta-section";
import { FooterSection } from "@/components/footer-section";

const funilHref = "/signup";

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
        color: light ? "#92610A" : "#C9A060",
        background: light ? "rgba(201,160,96,0.1)" : "transparent",
        borderRadius: "9999px",
        padding: "4px 14px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: "20px",
      }}
    >
      {children}
    </div>
  );
}

// ─── Gold divider ──────────────────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div
      style={{
        height: "1px",
        background: "linear-gradient(90deg, transparent, #C9A060, transparent)",
        margin: "32px 0",
        width: "100%",
      }}
    />
  );
}

// ─── Check bullet ─────────────────────────────────────────────────────────────
function CheckBullet({ children, color = "#C9A060" }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <span
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: `${color}22`,
          border: `1px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        <Check size={11} color={color} />
      </span>
      <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.82)", lineHeight: 1.65 }}>
        {children}
      </span>
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
            { label: "Funções", href: "#funcoes" },
            { label: "Como funciona", href: "#simulador" },
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
            href={funilHref}
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
            Começar grátis
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
      ✦ Lançamento: garanta seu preço de fundadora — ele fica congelado enquanto você for assinante.
    </div>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ fontFamily: "var(--font-inter, system-ui, sans-serif)" }}>
      <Navbar />
      <LaunchBanner />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        style={{
          background: "#07101e",
          color: "#ffffff",
          padding: "72px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "-80px", left: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(201,160,96,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", right: "-80px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(201,160,96,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", right: "10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(96,160,201,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <HeroShapes />

        <div style={{ maxWidth: "1152px", margin: "0 auto", position: "relative" }}>
          <div className="hero-grid grid grid-cols-1 md:grid-cols-[420px_1fr] gap-10 items-start">
            {/* Left — copy (animado) */}
            <HeroTextContent />

            {/* Right — animated device mockups */}
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
      <PainPointSection funilHref={funilHref} />

      {/* ── PRA QUEM É INDICADO ──────────────────────────────────────────────── */}
      <section
        id="indicado"
        style={{ background: "#07101e", padding: "96px 24px" }}
      >
        <HeroHighlight containerClassName="min-h-0 py-0 mb-14">
        <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
          <IndicadoHeader>
            <TagPill>Antes de continuar</TagPill>
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
              Se você cuida de clientes —{" "}
              <Highlight>
                <span style={{ color: "#C9A060" }}>o LeadBellus cuida do seu atendimento</span>
              </Highlight>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", maxWidth: "580px", margin: "0 auto" }}>
              Não importa se você atende sozinho, tem uma equipe ou gerencia uma
              clínica completa. Se o WhatsApp é onde as suas vendas acontecem,
              é aqui que você vai parar de perder dinheiro.
            </p>
          </IndicadoHeader>
        </div>
        </HeroHighlight>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <IndicadoCards funilHref={funilHref} />
        </div>
      </section>

      <AppBenefitsSection funilHref={funilHref} />

      <AboutSection />

      <CompareResponsesSection funilHref={funilHref} />

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

            {/* Subtítulo */}
            <SimuladorFadeUp delay={0.2}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", maxWidth: "520px", margin: "0 auto 20px" }}>
                Coloque o nome da sua clínica, escolha o tom e uma situação. A
                resposta já sai personalizada pra você. Sem criar conta. Sem
                cartão. Em 30 segundos.
              </p>
            </SimuladorFadeUp>

            {/* Botões de situação em cascata */}
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
              Essa foi <strong style={{ color: "#ffffff" }}>uma</strong> resposta.
              O LeadBellus faz isso com cada mensagem que chega no seu WhatsApp
              — com DNA da Clínica completo configurado, histórico de cliente e
              Lead Intelligence te dizendo o quanto ela está pronta pra fechar.
            </p>
            <Link
              href={funilHref}
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
              Quero o sistema completo — 7 dias grátis →
            </Link>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "10px" }}>
              Sem cartão · Acesso imediato · Você configura em 5 minutos
            </p>
          </div>
          </SimuladorFadeUp>
        </div>
      </section>

      <TestimonialsSection />

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
              Uma cliente recuperada já paga o mês inteiro
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", maxWidth: "560px", margin: "0 auto" }}>
              Você cobra R$1.500 numa harmonização. Se o LeadBellus te ajuda a
              fechar 1 cliente a mais por mês — você está pagando R$97 pra
              faturar R$1.500. São 15x de retorno no pior cenário.
            </p>
          </div>

          <PricingSection />
        </div>
      </section>

      <RiskFreeSection funilHref={funilHref} />

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <FaqSection />

      {/* ── CTA FINAL ────────────────────────────────────────────────────────── */}
      <FinalCTASection funilHref={funilHref} />

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <FooterSection />

      {/* Espaço pra barra fixa no mobile */}
      <div className="md:hidden" style={{ height: "76px" }} />

      {/* Barra de venda fixa — só mobile */}
      <div
        className="md:hidden"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 60,
          display: "flex",
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
            R$97<span style={{ fontSize: "12px", fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>/mês</span>
          </p>
          <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>
            7 dias grátis · sem cartão
          </p>
        </div>
        <Link
          href={funilHref}
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
          Testar grátis →
        </Link>
      </div>
    </div>
  );
}
