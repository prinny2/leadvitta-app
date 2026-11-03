import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  MessageCircle,
  Sparkles,
  Copy,
  ShieldCheck,
  Lock,
  Clock,
} from "@/components/static-icons";
import { FadeUp } from "@/components/fade-up";
import { HeroLoop } from "@/components/hero-loop";
import { LandingWhatsAppDemo } from "@/components/landing-whatsapp-demo";
import { LoadingRespostas } from "@/components/loading-respostas";
import { DemoSituationChips } from "@/components/demo-situation-chips";
import { StartPlanCard } from "@/components/start-plan-card";
import { PlanCTA } from "@/components/plan-cta";
import { FooterSection } from "@/components/footer-section";
import { LegalConsentLinks } from "@/components/legal-consent-links";
import { MarketingMobileMenu } from "@/components/marketing-mobile-menu";
import { RevealAfter } from "@/components/reveal-after";
import { EMPRESA } from "@/lib/empresa";
import { pageMetadata } from "@/lib/seo";
import { TrackLink } from "@/components/track-link";
import { WaitlistForm } from "@/components/waitlist-form";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { situacaoPorId } from "@/data/situacoes";

const SIGNUP_START = "/signup?plan=start";

// Paleta (navy profundo + dourado vivo; verde só nos elementos de WhatsApp) ----
const INK = "#0B1B33";
const INK_SOFT = "#3D5068";
const CREAM = "#FFFFFF";
const CREAM_2 = "#F3F6FB";
const NAVY = "#081426";
const GOLD = "#E4A84D";
const GOLD_DEEP = "#9A6414";
const GOLD_HOT = "#F7C96B";

/** Chips da seção Situações (rótulos de data/situacoes.ts; textos em lib/quick-reply.ts). */
const SITUACOES_IDS = ["preco", "achou_caro", "desconto", "medo", "dor", "sumiu"];
const SITUACOES_CHIPS = SITUACOES_IDS.map((id) => ({
  id,
  label: situacaoPorId(id)?.label ?? id,
}));

const START_BULLETS = [
  "3 respostas para cada mensagem, no tom da clínica",
  "Preço, “achei caro”, medo, desconto e quem sumiu",
  "Follow-up e mensagem de retorno pós-procedimento",
  "Copiar e colar no WhatsApp, pelo celular",
  "Sem fidelidade: cancele quando quiser, no painel",
];

const FAQ = [
  {
    q: "A LeadBellus envia mensagens pelo meu WhatsApp?",
    a: "Não. Ela não se conecta à sua conta e não envia nada. Você escolhe a resposta, ajusta se quiser e envia pelo seu WhatsApp.",
  },
  {
    q: "Preciso de cartão para testar?",
    a: "Não. Você testa aqui sem cadastro e, ao criar a conta, ganha 5 respostas grátis. Assine o Start (R$97/mês) só se fizer sentido para a sua rotina.",
  },
  {
    q: "As respostas ficam no tom da minha clínica?",
    a: "Sim. Você informa o nome da clínica, como chama a cliente e o jeito de falar. As respostas seguem esse tom e evitam promessa de resultado, preço fixo de procedimento e diagnóstico.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim. Direto no navegador do celular, tablet ou computador, sem instalar nada.",
  },
];

export const metadata: Metadata = pageMetadata({
  path: "/",
  title: "Respostas de WhatsApp para clínicas de estética | LeadBellus",
  description:
    "Transforme mensagens de clientes em três respostas no tom da sua clínica. A equipe revisa e envia pelo WhatsApp, com 5 respostas grátis e sem cartão.",
});

function StructuredDataTags() {
  const organization = {
    "@type": "Organization",
    "@id": "https://www.leadbellus.com.br/#organization",
    name: EMPRESA.marca,
    url: "https://www.leadbellus.com.br",
    logo: "https://www.leadbellus.com.br/LEADBELLUS.png",
    email: EMPRESA.email,
    taxID: EMPRESA.cnpj,
  };
  const app = {
    "@type": "SoftwareApplication",
    publisher: { "@id": organization["@id"] },
    name: "LeadBellus",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://www.leadbellus.com.br",
    description:
      "Assistente de escrita para clínicas de estética: cria três respostas no tom da clínica para a equipe revisar e enviar pelo WhatsApp.",
    inLanguage: "pt-BR",
    offers: {
      "@type": "Offer",
      price: "97",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: "https://www.leadbellus.com.br/onboarding",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Clínicas de estética e profissionais de beleza",
    },
  };
  const data = { "@context": "https://schema.org", "@graph": [organization, app] };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// ── Logo ───────────────────────────────────────────────────────────────────────
function LogoMark({ size = 30, stroke = GOLD, style }: { size?: number; stroke?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={style}>
      <path d="M40 6 C26 14, 10 32, 10 54 C10 70, 22 82, 40 90" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M40 6 C54 14, 70 32, 70 54 C70 70, 58 82, 40 90" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />
      <line x1="40" y1="32" x2="40" y2="86" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="27" r="5.5" fill={stroke} />
    </svg>
  );
}

function Eyebrow({ children, onNavy }: { children: React.ReactNode; onNavy?: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        border: `1px solid ${onNavy ? "rgba(201,160,96,0.45)" : "rgba(138,99,18,0.35)"}`,
        background: onNavy ? "rgba(201,160,96,0.1)" : "rgba(201,160,96,0.14)",
        color: onNavy ? GOLD : GOLD_DEEP,
        borderRadius: "9999px",
        padding: "6px 14px",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        marginBottom: "18px",
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, onNavy }: { children: React.ReactNode; onNavy?: boolean }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-inter, system-ui, sans-serif)",
        fontSize: "clamp(28px, 4vw, 42px)",
        fontWeight: 800,
        letterSpacing: "-0.02em",
        lineHeight: 1.12,
        color: onNavy ? "#FFFFFF" : INK,
        margin: "0 0 14px",
      }}
    >
      {children}
    </h2>
  );
}

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const links = [
    { label: "Como funciona", href: "#como-funciona" },
    { label: "Preço", href: "#precos" },
    { label: "Dúvidas", href: "#faq" },
  ];
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(18px) saturate(1.5)",
        WebkitBackdropFilter: "blur(18px) saturate(1.5)",
        borderBottom: "1px solid rgba(16,35,59,0.08)",
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
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}>
          <LogoMark size={28} stroke={GOLD_DEEP} />
          <span style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: "19px", fontWeight: 600, color: INK }}>
            LeadBellus
          </span>
        </Link>

        <div className="hidden md:flex" style={{ gap: "30px", alignItems: "center" }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} style={{ color: INK_SOFT, fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>
              {l.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/login" className="hidden md:block" style={{ color: INK_SOFT, fontSize: "14px", textDecoration: "none" }}>
            Entrar
          </Link>
          {/* O botão do topo leva à demo, não ao cadastro. */}
          <TrackLink
            event="cta_click"
            source="nav"
            href="#demo"
            className="hidden md:inline-flex"
            style={{
              background: INK,
              color: "#FFFFFF",
              borderRadius: "9999px",
              padding: "9px 20px",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Testar grátis
          </TrackLink>
          <MarketingMobileMenu />
        </div>
      </div>
    </nav>
  );
}

const PRIMARY_BUTTON_STYLE: React.CSSProperties = {
  background: `linear-gradient(135deg, ${GOLD_HOT}, ${GOLD} 60%, #D18A1F)`,
  color: NAVY,
  borderRadius: "14px",
  padding: "16px 26px",
  fontSize: "16px",
  fontWeight: 800,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxShadow: "0 18px 44px rgba(228,168,77,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
  textAlign: "center",
};

// ── PAGE ───────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="landing-root" style={{ fontFamily: "var(--font-inter, system-ui, sans-serif)", background: CREAM, color: INK, overflowX: "hidden" }}>
      <StructuredDataTags />
      <Navbar />

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────────
            Sem animação de entrada: o H1 é o LCP e precisa vir visível no HTML. */}
        <section className="landing-hero" style={{ padding: "64px 24px 72px", overflowX: "hidden", position: "relative", background: `linear-gradient(180deg, ${NAVY} 0%, #0D2038 100%)` }}>
          {/* Glows suaves de fundo */}
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-180px", right: "-120px", width: "560px", height: "560px", borderRadius: "50%", background: "radial-gradient(circle, rgba(228,168,77,0.22), transparent 65%)", filter: "blur(44px)" }} />
            <div style={{ position: "absolute", bottom: "-240px", left: "-160px", width: "560px", height: "560px", borderRadius: "50%", background: "radial-gradient(circle, rgba(31,168,85,0.1), transparent 65%)", filter: "blur(52px)" }} />
          </div>
          <div
            className="hero-grid"
            style={{
              position: "relative",
              zIndex: 1,
              maxWidth: "1152px",
              width: "100%",
              minWidth: 0,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "36px",
              alignItems: "center",
            }}
          >
            <div className="hero-copy-col" style={{ minWidth: 0 }}>
              <Eyebrow onNavy>Para clínicas de estética</Eyebrow>
              <h1
                className="hero-title"
                style={{
                  fontFamily: "var(--font-inter, system-ui, sans-serif)",
                  fontSize: "clamp(30px, 8.5vw, 56px)",
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.08,
                  margin: "0 0 18px",
                  color: "#FFFFFF",
                  overflowWrap: "break-word",
                }}
              >
                Respostas de WhatsApp{" "}
                <span className="hero-title-highlight" style={{ background: `linear-gradient(100deg, ${GOLD_HOT}, ${GOLD} 55%, #D18A1F)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", fontStyle: "italic", paddingRight: "0.06em" }}>no tom da sua clínica</span>, em segundos.
              </h1>
              <p className="hero-subtitle" style={{ fontSize: "17px", lineHeight: 1.6, color: "rgba(255,255,255,0.8)", maxWidth: "480px", margin: "0 0 26px" }}>
                Cole a mensagem da cliente e veja 3 opções. Sua equipe só revisa e envia.
              </p>

              <div id="hero-ctas" className="hero-cta-row" style={{ display: "flex", marginBottom: "12px" }}>
                {/* CTA único: o anúncio promete "cole a mensagem e veja 3 respostas",
                    então o 1º toque leva à demo, sem cadastro. */}
                <TrackLink
                  event="cta_click"
                  source="hero_demo"
                  href="#demo"
                  className="hero-cta lp-btn-primary"
                  style={PRIMARY_BUTTON_STYLE}
                >
                  Colar mensagem e ver 3 respostas grátis <ArrowRight size={18} aria-hidden="true" />
                </TrackLink>
              </div>
              <p className="hero-micro" style={{ fontSize: "13px", color: "rgba(255,255,255,0.62)", margin: 0 }}>
                Sem cadastro e sem cartão · depois, Start R$97/mês
              </p>
            </div>

            <div className="hero-proof-col" style={{ display: "flex", justifyContent: "center", minWidth: 0, width: "100%" }}>
              <div className="hero-loop-wrap" style={{ width: "100%", maxWidth: "360px" }}>
                <HeroLoop />
              </div>
            </div>
          </div>
        </section>

        {/* ── DEMO ─────────────────────────────────────────────────────────── */}
        <section id="demo" className="lp-section" style={{ background: CREAM_2, padding: "72px 24px", scrollMarginTop: "64px" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 28px" }}>
              <Eyebrow>Teste agora</Eyebrow>
              <SectionTitle>Cole a mensagem. Veja 3 respostas.</SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.6, margin: 0 }}>
                Use uma mensagem real do seu WhatsApp ou toque num exemplo.
              </p>
            </div>

            <div className="lp-demo-slot">
              <Suspense fallback={<LoadingRespostas etapas={["Carregando a demo…"]} />}>
                <LandingWhatsAppDemo />
              </Suspense>
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ────────────────────────────────────────────────── */}
        <section id="como-funciona" className="lp-section" style={{ background: CREAM, padding: "76px 24px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <FadeUp>
              <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 36px" }}>
                <Eyebrow>Como funciona</Eyebrow>
                <SectionTitle>Três passos, direto no celular</SectionTitle>
                <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.6, margin: 0 }}>
                  Dá para fazer na pausa entre uma cliente e outra.
                </p>
              </div>
            </FadeUp>
            <div className="passos-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
              {[
                { n: "01", icon: <MessageCircle size={20} />, t: "Cole a mensagem", c: "Copie do WhatsApp o que a cliente escreveu." },
                { n: "02", icon: <Sparkles size={20} />, t: "Veja 3 respostas", c: "Suave, Consultiva e Fechamento, no tom da clínica." },
                { n: "03", icon: <Copy size={20} />, t: "Revise e envie", c: "Escolha uma, ajuste se quiser e envie pelo seu WhatsApp." },
              ].map((s) => (
                <div key={s.n} className="lp-card passo-card" style={{ background: CREAM_2, border: "1px solid rgba(16,35,59,0.07)", borderRadius: "18px", padding: "26px" }}>
                  <div className="passo-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <span style={{ width: "42px", height: "42px", borderRadius: "12px", background: INK, color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {s.icon}
                    </span>
                    <span className="passo-num" style={{ fontFamily: "var(--font-inter, system-ui, sans-serif)", fontSize: "26px", fontWeight: 700, color: "rgba(16,35,59,0.14)" }}>{s.n}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ color: INK, fontSize: "18px", fontWeight: 700, margin: "0 0 6px" }}>
                      <span className="passo-num-inline" style={{ color: GOLD_DEEP }}>{Number(s.n)} · </span>
                      {s.t}
                    </h3>
                    <p style={{ color: INK_SOFT, fontSize: "14px", lineHeight: 1.6, margin: 0 }}>{s.c}</p>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", margin: "28px auto 0", maxWidth: "520px", fontSize: "16px", lineHeight: 1.6, color: INK }}>
              <strong>A LeadBellus escreve. Sua equipe decide o que enviar.</strong>
            </p>
          </div>
        </section>

        {/* ── SITUAÇÕES ────────────────────────────────────────────────────── */}
        <section className="lp-section" style={{ background: CREAM_2, padding: "72px 24px" }}>
          <div style={{ maxWidth: "820px", margin: "0 auto", textAlign: "center" }}>
            <FadeUp>
              <Eyebrow>Situações</Eyebrow>
              <SectionTitle>Para as mensagens de todo dia</SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.6, margin: "0 0 26px" }}>
                Toque numa situação e teste na hora.
              </p>
            </FadeUp>
            <DemoSituationChips items={SITUACOES_CHIPS} />
            <p style={{ color: INK_SOFT, fontSize: "14px", lineHeight: 1.6, margin: "24px auto 0", maxWidth: "520px" }}>
              Serve para os procedimentos da sua clínica, de botox e preenchimento a limpeza de pele.
            </p>
          </div>
        </section>

        {/* ── PREÇO ────────────────────────────────────────────────────────── */}
        <section id="precos" className="lp-section" style={{ background: NAVY, padding: "80px 24px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: "760px", height: "480px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,160,96,0.14), transparent 62%)", filter: "blur(52px)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <FadeUp>
              <div style={{ textAlign: "center", marginBottom: "36px" }}>
                <Eyebrow onNavy>Preço</Eyebrow>
                <SectionTitle onNavy>Comece grátis. Continue por R$97/mês.</SectionTitle>
              </div>
            </FadeUp>

            <StartPlanCard bullets={START_BULLETS} tagline="Tudo o que você precisa para responder bem no WhatsApp.">
              <TrackLink
                event="cta_click"
                source="pricing"
                href={SIGNUP_START}
                className="lp-btn-primary"
                style={{ ...PRIMARY_BUTTON_STYLE, width: "100%", boxSizing: "border-box", fontSize: "15px", padding: "15px 22px" }}
              >
                Criar conta grátis <ArrowRight size={17} aria-hidden="true" />
              </TrackLink>
              <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.62)", textAlign: "center", margin: "10px 0 0" }}>
                5 respostas grátis, sem cartão. Assine só se fizer sentido.
              </p>
              <PlanCTA
                plan="start"
                interval="monthly"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gold-500/40 px-5 py-3 text-sm font-bold text-gold-300 transition hover:bg-gold-500/10 disabled:opacity-60"
              >
                Já quero assinar o Start
              </PlanCTA>
              <div style={{ marginTop: "12px" }}>
                <LegalConsentLinks tone="light" />
              </div>
            </StartPlanCard>

            <div style={{ maxWidth: "460px", margin: "22px auto 0", textAlign: "center" }}>
              <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(255,255,255,0.6)", margin: 0 }}>
                Pro e Premium chegam em breve. O Start já inclui o essencial.
              </p>
              <details className="lp-waitlist" style={{ marginTop: "8px" }}>
                <summary style={{ cursor: "pointer", fontSize: "13.5px", fontWeight: 700, color: GOLD, listStyle: "none" }}>
                  Me avise quando abrir
                </summary>
                <div style={{ marginTop: "12px", textAlign: "left" }}>
                  <WaitlistForm plan="pro" />
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* ── CONFIANÇA ────────────────────────────────────────────────────── */}
        <section className="lp-section" style={{ background: CREAM, padding: "76px 24px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <FadeUp>
              <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 32px" }}>
                <Eyebrow>Confiança</Eyebrow>
                <SectionTitle>Sua equipe no controle de cada mensagem</SectionTitle>
              </div>
            </FadeUp>
            <div className="confianca-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              {[
                { icon: <ShieldCheck size={20} />, t: "Não envia nada sozinha", c: "A LeadBellus só escreve. Quem envia é sempre alguém da sua equipe." },
                { icon: <MessageCircle size={20} />, t: "Não se conecta ao seu WhatsApp", c: "Você copia a resposta e cola na conversa. Sem acesso à sua conta." },
                { icon: <Clock size={20} />, t: "Cancele quando quiser", c: "Sem fidelidade e sem multa, direto no painel." },
                { icon: <Lock size={20} />, t: "Privacidade", c: "Cada conta vê só os próprios dados. Pagamento seguro pela Stripe." },
              ].map((s) => (
                <div key={s.t} className="lp-card confianca-card" style={{ background: "#ffffff", border: "1px solid rgba(16,35,59,0.07)", borderRadius: "16px", padding: "22px" }}>
                  <span className="confianca-icon" style={{ display: "inline-flex", color: GOLD_DEEP, marginBottom: "12px", flexShrink: 0 }}>{s.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: INK, margin: "0 0 6px" }}>{s.t}</h3>
                    <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: INK_SOFT, margin: 0 }}>{s.c}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section id="faq" className="lp-section" style={{ background: CREAM_2, padding: "76px 24px" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <FadeUp>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <Eyebrow>Dúvidas</Eyebrow>
                <SectionTitle>Antes de começar</SectionTitle>
              </div>
            </FadeUp>
            <div style={{ display: "grid", gap: "10px" }}>
              {FAQ.map((item, i) => (
                <details key={item.q} open={i === 0} style={{ borderRadius: "14px", border: "1px solid rgba(16,35,59,0.1)", background: "#ffffff", overflow: "hidden" }}>
                  <summary style={{ padding: "18px 22px", cursor: "pointer", fontWeight: 700, fontSize: "15px", color: INK }}>{item.q}</summary>
                  <p style={{ padding: "0 22px 20px", fontSize: "14px", color: INK_SOFT, lineHeight: 1.7, margin: 0, borderTop: "1px solid rgba(16,35,59,0.06)", paddingTop: "14px" }}>
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
        <section className="lp-section" style={{ background: NAVY, padding: "80px 24px" }}>
          <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
            {/* O preflight do Tailwind deixa <svg> como block: centraliza na mão. */}
            <LogoMark size={42} stroke={GOLD} style={{ margin: "0 auto" }} />
            <h2
              style={{
                fontFamily: "var(--font-inter, system-ui, sans-serif)",
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
                margin: "18px 0 14px",
                lineHeight: 1.12,
              }}
            >
              Teste com a próxima mensagem que chegar.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "16px", lineHeight: 1.6, margin: "0 auto 26px", maxWidth: "480px" }}>
              Cole, veja 3 respostas e escolha a sua. Grátis e sem cartão.
            </p>
            <TrackLink
              event="cta_click"
              source="cta_final"
              href="#demo"
              className="lp-btn-primary final-cta"
              style={PRIMARY_BUTTON_STYLE}
            >
              Colar mensagem e ver 3 respostas grátis <ArrowRight size={18} aria-hidden="true" />
            </TrackLink>
            <p style={{ margin: "16px 0 0" }}>
              <TrackLink
                event="cta_click"
                source="cta_final_signup"
                href={SIGNUP_START}
                style={{ color: "rgba(255,255,255,0.78)", fontSize: "14px", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                ou criar conta grátis
              </TrackLink>
            </p>
          </div>
        </section>
      </main>

      <FooterSection />

      <style>{`
        .lp-btn-primary { transition: transform .2s ease, box-shadow .2s ease; }
        .lp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 22px 48px rgba(16,35,59,0.34), inset 0 1px 0 rgba(255,255,255,0.12); }
        .lp-card { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
        .lp-card:hover { transform: translateY(-4px); box-shadow: 0 22px 48px rgba(16,35,59,0.10); border-color: rgba(201,160,96,0.45) !important; }
        .lp-waitlist > summary::-webkit-details-marker { display: none; }
        .lp-demo-slot { min-height: 440px; }
        .passo-num-inline { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .lp-btn-primary, .lp-card { transition: none; }
        }
        @media (min-width: 768px) { .hero-grid { grid-template-columns: 1.1fr 0.9fr !important; } }
        .lp-mobile-bar { display: none; }
        @media (max-width: 767px) {
          .landing-root { max-width: 100vw; overflow-x: hidden; }
          .landing-hero { padding: 44px 20px 48px !important; }
          .hero-grid { gap: 28px !important; }
          .hero-grid,
          .hero-copy-col,
          .hero-proof-col { min-width: 0; width: 100%; }
          .hero-title { max-width: 380px; line-height: 1.1 !important; }
          .hero-subtitle { max-width: 380px !important; }
          .hero-cta-row { display: block !important; }
          .hero-cta { box-sizing: border-box; width: 100%; }
          .hero-loop-wrap { max-width: 300px !important; }
          .lp-section { padding: 56px 20px !important; }
          .lp-demo-slot { min-height: 480px; }
          .lp-card:hover { transform: none; }
          .final-cta { box-sizing: border-box; width: 100%; }
          .passos-grid { gap: 10px !important; }
          .passo-card { display: flex; gap: 14px; align-items: flex-start; padding: 18px !important; }
          .passo-head { margin-bottom: 0 !important; }
          .passo-num { display: none; }
          .passo-num-inline { display: inline; }
          .confianca-grid { gap: 10px !important; }
          .confianca-card { display: flex; gap: 14px; align-items: flex-start; padding: 18px !important; }
          .confianca-icon { margin-bottom: 0 !important; margin-top: 1px; }
          .lp-mobile-bar-cta { min-width: 122px !important; padding: 12px 14px !important; font-size: 13px !important; }
          .lp-mobile-spacer { height: 92px; }
          .lp-mobile-bar { display: flex; }
          .lp-mobile-bar-copy { min-width: 0; }
          .lp-mobile-bar-title,
          .lp-mobile-bar-subtitle {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
        @media (max-width: 374px) {
          .lp-mobile-bar { gap: 8px !important; padding-left: 12px !important; }
          .lp-mobile-bar-cta { padding: 11px 14px !important; font-size: 13px !important; min-width: 112px !important; }
        }
      `}</style>
      <div className="lp-mobile-spacer" />
      {/* Barra fixa do mobile: aparece depois do CTA do hero e some enquanto a
          demo está na tela (senão cobre o botão "Ver minhas 3 respostas"). */}
      <RevealAfter targetId="hero-ctas" hideWhileVisibleId="demo">
        <div
          className="lp-mobile-bar"
          style={{
            position: "fixed",
            left: "12px",
            right: "12px",
            bottom: "calc(10px + env(safe-area-inset-bottom))",
            zIndex: 58,
            alignItems: "center",
            gap: "12px",
            boxSizing: "border-box",
            maxWidth: "520px",
            minHeight: "66px",
            margin: "0 auto",
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(201,160,96,0.24)",
            borderRadius: "20px",
            boxShadow: "0 18px 48px rgba(11,26,46,0.22)",
            padding: "10px 10px 10px 14px",
          }}
        >
          <div className="lp-mobile-bar-copy" style={{ lineHeight: 1.2 }}>
            <p className="lp-mobile-bar-title" style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: INK }}>
              Teste grátis agora
            </p>
            <p className="lp-mobile-bar-subtitle" style={{ margin: "3px 0 0", fontSize: "11px", color: INK_SOFT }}>
              Sem cadastro · sem cartão
            </p>
          </div>
          <TrackLink
            event="cta_click"
            source="mobile_bar"
            href="#demo"
            className="lp-mobile-bar-cta"
            style={{
              marginLeft: "auto",
              background: INK,
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "14px",
              borderRadius: "14px",
              padding: "12px 18px",
              minWidth: "132px",
              textDecoration: "none",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            Ver 3 respostas
          </TrackLink>
        </div>
      </RevealAfter>
      <WhatsAppCta />
    </div>
  );
}
