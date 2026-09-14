import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  PlayCircle,
  MessageCircle,
  Sparkles,
  Copy,
  ShieldCheck,
  Lock,
  Smartphone,
  Clock,
  Check,
} from "lucide-react";
import { FadeUp } from "@/components/fade-up";
import { LandingWhatsAppDemo } from "@/components/landing-whatsapp-demo";
import { LoadingRespostas } from "@/components/loading-respostas";
import { PricingSection } from "@/components/pricing-section";
import { FooterSection } from "@/components/footer-section";
import { LegalConsentLinks } from "@/components/legal-consent-links";
import { MarketingMobileMenu } from "@/components/marketing-mobile-menu";
import { TrackLink } from "@/components/track-link";
import { WhatsAppCta } from "@/components/whatsapp-cta";

const SIGNUP = "/onboarding";

// Paleta (navy profundo + dourado vivo; verde só nos elementos de WhatsApp) ----
const INK = "#0B1B33";
const INK_SOFT = "#3D5068";
const CREAM = "#FFFFFF";
const CREAM_2 = "#F3F6FB";
const NAVY = "#081426";
const GOLD = "#E4A84D";
const GOLD_DEEP = "#9A6414";
const GOLD_HOT = "#F7C96B";

/** Depoimentos reais entram aqui. Vazio = a seção mostra prova honesta, sem inventar. */
const DEPOIMENTOS: { nome: string; clinica: string; texto: string }[] = [
  // { nome: "Dra. Fulana", clinica: "Clínica X — Curitiba", texto: "..." },
];

function StructuredDataTags() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LeadBellus",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://www.leadbellus.com.br",
    description:
      "LeadBellus entende a mensagem, o contexto da conversa e o jeito da sua clínica de estética para sugerir respostas no WhatsApp — a equipe revisa e conduz cada cliente ao próximo passo.",
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
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// ── Logo ───────────────────────────────────────────────────────────────────────
function LogoMark({ size = 30, stroke = GOLD }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
    { label: "Para quem é", href: "#para-quem" },
    { label: "Demo", href: "#demo" },
    { label: "Preços", href: "#precos" },
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
          <Link
            href={SIGNUP}
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
          </Link>
          <MarketingMobileMenu />
        </div>
      </div>
    </nav>
  );
}

// ── Mini prova WhatsApp (visível no mobile e desktop) ──────────────────────────
function ChatProof() {
  return (
    <div
      className="lp-float"
      style={{
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(14px) saturate(1.3)",
        WebkitBackdropFilter: "blur(14px) saturate(1.3)",
        border: "1px solid rgba(255,255,255,0.9)",
        outline: "1px solid rgba(16,35,59,0.07)",
        borderRadius: "22px",
        padding: "18px",
        boxSizing: "border-box",
        width: "100%",
        boxShadow: "0 40px 80px rgba(16,35,59,0.16), 0 8px 24px rgba(16,35,59,0.08)",
        maxWidth: "420px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "12px", borderBottom: "1px solid rgba(16,35,59,0.07)" }}>
        <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#E9F7EF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MessageCircle size={18} style={{ color: "#1FA855" }} />
        </div>
        <div style={{ lineHeight: 1.2 }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: INK }}>Cliente · WhatsApp</p>
          <p style={{ margin: 0, fontSize: "11px", color: "#1FA855", fontWeight: 700 }}>conversa em andamento</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: "8px", margin: "14px 0" }}>
        <div style={{ alignSelf: "flex-start", maxWidth: "85%", background: "#F1F4F8", color: INK, borderRadius: "14px 14px 14px 4px", padding: "10px 12px", fontSize: "13px", lineHeight: 1.4 }}>
          Oi! Quanto fica o botox? Tenho um pouco de medo de ficar artificial…
        </div>
        <div style={{ alignSelf: "flex-end", maxWidth: "88%", background: "#DCF6E6", color: "#0B3D2A", borderRadius: "14px 14px 4px 14px", padding: "10px 12px", fontSize: "13px", lineHeight: 1.45 }}>
          Oi! Que bom que você perguntou 😊 O valor depende da avaliação, porque cada rosto pede uma quantidade diferente — e quando é bem indicado, o resultado fica natural. Quer que eu veja um horário pra você conhecer a clínica essa semana?
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {["Suave", "Consultiva", "Fechamento"].map((t, i) => (
          <span
            key={t}
            style={{
              fontSize: "11px",
              fontWeight: 700,
              padding: "5px 10px",
              borderRadius: "9999px",
              border: `1px solid ${i === 2 ? GOLD : "rgba(16,35,59,0.14)"}`,
              background: i === 2 ? "rgba(201,160,96,0.16)" : "transparent",
              color: i === 2 ? GOLD_DEEP : INK_SOFT,
            }}
          >
            {t}
          </span>
        ))}
        <span style={{ fontSize: "11px", color: INK_SOFT, alignSelf: "center" }}>3 sugestões — a equipe revisa e envia</span>
      </div>
    </div>
  );
}

// ── PAGE ───────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="landing-root" style={{ fontFamily: "var(--font-inter, system-ui, sans-serif)", background: CREAM, color: INK, overflowX: "hidden" }}>
      <StructuredDataTags />
      <Navbar />

      {/* Faixa de lançamento */}
      <div className="launch-strip" style={{ background: `linear-gradient(90deg, ${GOLD_HOT}, ${GOLD} 55%, #D18A1F)`, color: NAVY, textAlign: "center", padding: "9px 24px", fontSize: "13px", fontWeight: 700 }}>
        Plano Start por R$97/mês · teste grátis, sem cartão
      </div>

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="landing-hero" style={{ padding: "72px 24px 80px", overflowX: "hidden", position: "relative", background: `linear-gradient(180deg, ${NAVY} 0%, #0D2038 100%)` }}>
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
              gap: "44px",
              alignItems: "center",
            }}
          >
            <FadeUp className="hero-copy-col" style={{ minWidth: 0 }}>
              <Eyebrow onNavy>Clínicas de estética · WhatsApp</Eyebrow>
              <h1
                className="hero-title"
                style={{
                  fontFamily: "var(--font-inter, system-ui, sans-serif)",
                  fontSize: "clamp(36px, 5vw, 60px)",
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.06,
                  margin: "0 0 18px",
                  color: "#FFFFFF",
                  overflowWrap: "break-word",
                }}
              >
                Cada conversa no WhatsApp{" "}
                <span className="hero-title-highlight" style={{ background: `linear-gradient(100deg, ${GOLD_HOT}, ${GOLD} 55%, #D18A1F)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", fontStyle: "italic" }}>pode terminar em um agendamento.</span>
              </h1>
              <p className="hero-subtitle" style={{ fontSize: "18px", lineHeight: 1.6, color: "rgba(255,255,255,0.78)", maxWidth: "500px", margin: "0 0 26px" }}>
                O LeadBellus entende a mensagem, o contexto da conversa e o jeito da sua clínica de estética — e sugere respostas para{" "}
                <strong style={{ color: "#FFFFFF" }}>sua equipe revisar, enviar e conduzir cada cliente ao próximo passo</strong>.
              </p>

              <div className="hero-cta-row" style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                <TrackLink
                  event="cta_click"
                  source="hero"
                  href={SIGNUP}
                  className="hero-cta lp-btn-primary"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD_HOT}, ${GOLD} 60%, #D18A1F)`,
                    color: NAVY,
                    borderRadius: "14px",
                    padding: "15px 28px",
                    fontSize: "15px",
                    fontWeight: 800,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 18px 44px rgba(228,168,77,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
                  }}
                >
                  Testar grátis (sem cartão) <ArrowRight size={17} />
                </TrackLink>
                <a
                  href="#demo"
                  className="hero-cta lp-btn-ghost"
                  style={{
                    border: `1.5px solid rgba(255,255,255,0.28)`,
                    background: "rgba(255,255,255,0.07)",
                    backdropFilter: "blur(8px)",
                    color: "#FFFFFF",
                    borderRadius: "14px",
                    padding: "15px 24px",
                    fontSize: "15px",
                    fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <PlayCircle size={17} /> Ver demo
                </a>
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", margin: "0 0 26px" }}>
                A IA sugere, <strong style={{ color: "rgba(255,255,255,0.85)" }}>sua equipe decide o que enviar</strong> · funciona no celular · cancele quando quiser
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["Preço", "Objeção", "Medo", "Silêncio", "Decisão"].map((t) => (
                  <span
                    key={t}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.16)",
                      borderRadius: "9999px",
                      padding: "7px 13px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.75)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.15} className="hero-proof-col" style={{ display: "flex", justifyContent: "center", minWidth: 0, width: "100%" }}>
              <ChatProof />
            </FadeUp>
          </div>
        </section>

        {/* ── Faixa de confiança ───────────────────────────────────────────── */}
        <section style={{ background: CREAM_2, padding: "20px 24px" }}>
          <div
            style={{
              maxWidth: "1000px",
              margin: "0 auto",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "14px 28px",
              fontSize: "13px",
              fontWeight: 600,
              color: INK_SOFT,
            }}
          >
            {[
              { icon: <Lock size={15} />, t: "Pagamento seguro" },
              { icon: <ShieldCheck size={15} />, t: "Você revisa antes de enviar" },
              { icon: <Smartphone size={15} />, t: "Funciona no celular" },
              { icon: <Check size={15} />, t: "Sem cartão pra testar" },
            ].map((s) => (
              <span key={s.t} style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
                <span style={{ color: GOLD_DEEP }}>{s.icon}</span> {s.t}
              </span>
            ))}
          </div>
        </section>

        {/* ── ROTINA DA CLÍNICA ────────────────────────────────────────────── */}
        <section style={{ padding: "76px 24px", background: CREAM }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div className="rotina-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "44px", alignItems: "center" }}>
              <FadeUp>
                <Eyebrow>Um dia comum de atendimento</Eyebrow>
                <SectionTitle>14h37 na sua clínica</SectionTitle>
                <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.7, margin: "0 0 16px", maxWidth: "480px" }}>
                  Alguém da equipe está em procedimento. Outra pessoa atende na recepção. E o WhatsApp continua recebendo mensagens — cada uma em um momento diferente da decisão.
                </p>
                <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.7, margin: 0, maxWidth: "480px" }}>
                  O LeadBellus lê a mensagem, entende o momento da conversa e sugere respostas no tom da sua clínica —{" "}
                  <strong style={{ color: INK }}>para a equipe responder com segurança, sem parecer apressada nem robótica</strong>.
                </p>
              </FadeUp>

              <FadeUp delay={0.1}>
                <div
                  role="list"
                  aria-label="Conversas chegando no WhatsApp da clínica"
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(16,35,59,0.08)",
                    borderRadius: "22px",
                    padding: "22px",
                    boxShadow: "0 24px 60px rgba(16,35,59,0.08)",
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  {[
                    { h: "14h37", nome: "Mariana", msg: "Oi! Quanto custa o botox?", momento: "quer entender o valor" },
                    { h: "14h41", nome: "Paula", msg: "Tenho medo de ficar com o rosto artificial…", momento: "precisa de segurança" },
                    { h: "14h48", nome: "Renata", msg: "Recebeu as informações ontem e ainda não respondeu", momento: "hora do follow-up" },
                    { h: "14h52", nome: "Camila", msg: "Consigo um horário ainda essa semana?", momento: "pronta para agendar" },
                  ].map((c) => (
                    <div
                      key={c.h}
                      role="listitem"
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start",
                        padding: "12px 14px",
                        borderRadius: "14px",
                        background: CREAM_2,
                        border: "1px solid rgba(16,35,59,0.05)",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: 700, color: GOLD_DEEP, whiteSpace: "nowrap", marginTop: "2px", fontVariantNumeric: "tabular-nums" }}>{c.h}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: INK }}>{c.nome}</p>
                        <p style={{ margin: "2px 0 4px", fontSize: "13.5px", lineHeight: 1.5, color: INK_SOFT }}>{c.msg}</p>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#1FA855", textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.momento}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ── SITUAÇÕES DE ATENDIMENTO ─────────────────────────────────────── */}
        <section style={{ padding: "76px 24px", background: CREAM_2 }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <FadeUp>
            <div style={{ maxWidth: "640px", marginBottom: "34px" }}>
              <Eyebrow>Situações de atendimento</Eyebrow>
              <SectionTitle>A mesma resposta não serve para todas as conversas</SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.7, margin: 0 }}>
                Cada cliente chega em um momento diferente da decisão. O LeadBellus reconhece esse momento e sugere a resposta adequada — sempre no tom da sua clínica.
              </p>
            </div>
            </FadeUp>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "18px" }}>
              {[
                { t: "Preço", c: "Contextualiza o valor e o cuidado envolvido antes de falar em número — e convida para a avaliação." },
                { t: "Objeção", c: "Responde a comparações e ao “achei caro” sem partir direto para o desconto." },
                { t: "Medo", c: "Acolhe a insegurança com naturalidade, sem prometer resultados que não podem ser prometidos." },
                { t: "Silêncio", c: "Sugere um follow-up contextual e leve, que retoma a conversa sem parecer insistente." },
                { t: "Decisão", c: "Oferece um próximo passo claro — uma avaliação ou um horário — quando a pessoa está pronta." },
              ].map((card) => (
                <article
                  key={card.t}
                  className="lp-card"
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(16,35,59,0.07)",
                    borderRadius: "18px",
                    padding: "26px",
                    boxShadow: "0 10px 30px rgba(16,35,59,0.05)",
                  }}
                >
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: GOLD, marginBottom: "14px" }} />
                  <h3 style={{ color: INK, fontSize: "18px", fontWeight: 700, margin: "0 0 8px" }}>{card.t}</h3>
                  <p style={{ color: INK_SOFT, fontSize: "14px", lineHeight: 1.65, margin: 0 }}>{card.c}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ────────────────────────────────────────────────── */}
        <section id="como-funciona" style={{ background: CREAM, padding: "76px 24px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <FadeUp>
            <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 40px" }}>
              <Eyebrow>Como funciona</Eyebrow>
              <SectionTitle>Simples de encaixar na rotina</SectionTitle>
            </div>
            </FadeUp>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
              {[
                { n: "01", icon: <MessageCircle size={20} />, t: "Cole a mensagem", c: "Copie o que a pessoa mandou no WhatsApp e cole no LeadBellus." },
                { n: "02", icon: <Sparkles size={20} />, t: "Ele entende o contexto", c: "O LeadBellus interpreta o momento da conversa e sugere 3 respostas no tom da sua clínica." },
                { n: "03", icon: <Copy size={20} />, t: "A equipe revisa e envia", c: "Você lê, ajusta se quiser e cola na conversa — com o próximo passo claro." },
              ].map((s) => (
                <div key={s.n} className="lp-card" style={{ background: CREAM_2, border: "1px solid rgba(16,35,59,0.07)", borderRadius: "18px", padding: "26px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <span style={{ width: "42px", height: "42px", borderRadius: "12px", background: INK, color: GOLD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {s.icon}
                    </span>
                    <span style={{ fontFamily: "var(--font-inter, system-ui, sans-serif)", fontSize: "26px", fontWeight: 700, color: "rgba(16,35,59,0.14)" }}>{s.n}</span>
                  </div>
                  <h3 style={{ color: INK, fontSize: "18px", fontWeight: 700, margin: "0 0 8px" }}>{s.t}</h3>
                  <p style={{ color: INK_SOFT, fontSize: "14px", lineHeight: 1.65, margin: 0 }}>{s.c}</p>
                </div>
              ))}
            </div>
            <FadeUp>
              <p style={{ textAlign: "center", margin: "28px auto 0", maxWidth: "520px", fontSize: "16px", lineHeight: 1.6, color: INK_SOFT }}>
                <strong style={{ color: INK }}>A IA sugere. A clínica decide.</strong> O LeadBellus não envia mensagens sozinho — nada sai sem passar pela sua equipe.
              </p>
            </FadeUp>
          </div>
        </section>

        {/* ── PARA QUEM É ──────────────────────────────────────────────────── */}
        <section id="para-quem" style={{ padding: "78px 24px", background: CREAM_2 }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <FadeUp>
            <div style={{ textAlign: "center", maxWidth: "660px", margin: "0 auto 40px" }}>
              <Eyebrow>Para quem é</Eyebrow>
              <SectionTitle>Feito para a rotina comercial de clínicas de estética</SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.7, margin: 0 }}>
                Do injetável ao capilar, cada procedimento gera dúvidas diferentes no WhatsApp. O LeadBellus adapta a resposta ao procedimento, ao cliente e ao momento da conversa — para mulheres e homens.
              </p>
            </div>
            </FadeUp>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {[
                {
                  tag: "Facial e injetáveis",
                  bg: "#ffffff",
                  titulo: "Conversas que pedem confiança",
                  itens: ["Botox e preenchimento", "Harmonização facial", "Bioestimulador e skinbooster", "Limpeza de pele e peeling", "Skincare e cuidados de rotina"],
                },
                {
                  tag: "Corporal e capilar",
                  bg: INK,
                  titulo: "Conversas que pedem continuidade",
                  itens: ["Drenagem e gordura localizada", "Depilação a laser", "Queda capilar e calvície", "Design de barba e sobrancelha", "Protocolos com várias sessões"],
                },
              ].map((col) => {
                const dark = col.bg === INK;
                return (
                  <div
                    key={col.tag}
                    style={{
                      background: col.bg,
                      border: dark ? "1px solid rgba(201,160,96,0.25)" : "1px solid rgba(16,35,59,0.08)",
                      borderRadius: "22px",
                      padding: "30px",
                      boxShadow: dark ? "none" : "0 10px 30px rgba(16,35,59,0.05)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: dark ? GOLD : GOLD_DEEP,
                        border: `1px solid ${dark ? "rgba(201,160,96,0.4)" : "rgba(138,99,18,0.3)"}`,
                        borderRadius: "9999px",
                        padding: "5px 12px",
                        marginBottom: "16px",
                      }}
                    >
                      {col.tag}
                    </span>
                    <h3 style={{ fontFamily: "var(--font-inter, system-ui, sans-serif)", fontSize: "22px", fontWeight: 700, color: dark ? "#FFFFFF" : INK, margin: "0 0 16px" }}>
                      {col.titulo}
                    </h3>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "10px" }}>
                      {col.itens.map((it) => (
                        <li key={it} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "14.5px", color: dark ? "rgba(255,255,255,0.85)" : INK_SOFT }}>
                          <Check size={17} style={{ color: GOLD, flexShrink: 0, marginTop: "2px" }} />
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── DEMO ─────────────────────────────────────────────────────────── */}
        <section id="demo" style={{ background: CREAM, padding: "78px 24px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <FadeUp>
            <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 36px" }}>
              <Eyebrow>Experimente o raciocínio</Eyebrow>
              <SectionTitle>Veja como o LeadBellus responderia essa conversa</SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "15px", lineHeight: 1.7, margin: 0 }}>
                Escolha uma situação real do seu WhatsApp e acompanhe o caminho: mensagem recebida → contexto da conversa → sugestões de resposta → próximo passo.
              </p>
            </div>
            </FadeUp>

            <Suspense fallback={<LoadingRespostas etapas={["Carregando a demo…"]} />}>
              <LandingWhatsAppDemo />
            </Suspense>

            <div
              style={{
                background: "#ffffff",
                border: `1px solid rgba(201,160,96,0.4)`,
                borderRadius: "18px",
                padding: "26px",
                marginTop: "28px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "15px", color: INK, lineHeight: 1.6, margin: "0 0 18px", fontWeight: 600 }}>
                Gostou do raciocínio? Crie sua conta grátis e use no atendimento real, com o tom da sua clínica.
              </p>
              <TrackLink
                event="cta_click"
                source="demo"
                href={SIGNUP}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: INK,
                  color: "#FFFFFF",
                  borderRadius: "9999px",
                  padding: "14px 30px",
                  fontSize: "15px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Criar conta grátis <ArrowRight size={16} />
              </TrackLink>
              <p style={{ fontSize: "12px", color: INK_SOFT, marginTop: "10px" }}>Start R$97/mês · sem cartão pra testar · cancele quando quiser</p>
              <div style={{ maxWidth: "430px", margin: "10px auto 0" }}>
                <LegalConsentLinks />
              </div>
            </div>
          </div>
        </section>

        {/* ── PREÇO SIMPLES ────────────────────────────────────────────────── */}
        <section style={{ padding: "78px 24px", background: CREAM_2 }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <FadeUp>
            <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 40px" }}>
              <Eyebrow>Preço simples</Eyebrow>
              <SectionTitle>Uma assinatura, atendimento consistente</SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.7, margin: 0 }}>
                Sem contrato longo, sem implantação, sem treinamento demorado. O valor está na rotina: menos tempo travado em resposta difícil, mais consistência em cada conversa.
              </p>
            </div>
            </FadeUp>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
              {[
                { n: "R$97", t: "por mês", c: "O plano Start, com teste grátis antes. Cancele quando quiser, direto no painel." },
                { n: "Segundos", t: "por sugestão", c: "Da mensagem colada às 3 sugestões de resposta — mesmo nos horários mais cheios." },
                { n: "Um tom", t: "para a equipe toda", c: "Quem responder, responde no jeito da clínica. A conversa mantém o mesmo padrão." },
              ].map((s) => (
                <div key={s.n} className="lp-card" style={{ background: "#ffffff", border: "1px solid rgba(11,27,51,0.07)", borderRadius: "20px", padding: "30px", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: "36px", fontWeight: 800, letterSpacing: "-0.02em", background: `linear-gradient(120deg, ${GOLD_DEEP}, ${GOLD})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{s.n}</p>
                  <p style={{ margin: "2px 0 12px", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: GOLD_DEEP }}>{s.t}</p>
                  <p style={{ margin: 0, fontSize: "14.5px", lineHeight: 1.65, color: INK_SOFT }}>{s.c}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PREÇOS ───────────────────────────────────────────────────────── */}
        <section id="precos" style={{ background: NAVY, padding: "84px 24px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: "760px", height: "480px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,160,96,0.14), transparent 62%)", filter: "blur(52px)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <FadeUp>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <Eyebrow onNavy>Escolha o seu plano</Eyebrow>
              <SectionTitle onNavy>Comece pelo plano que resolve hoje</SectionTitle>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", maxWidth: "540px", margin: "0 auto" }}>
                Teste grátis primeiro e assine quando fizer sentido para a rotina da sua clínica.
              </p>
            </div>
            </FadeUp>
            <PricingSection />
          </div>
        </section>

        {/* ── CONFIANÇA ────────────────────────────────────────────────────── */}
        <section style={{ padding: "78px 24px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <FadeUp>
            <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 36px" }}>
              <Eyebrow>Confiança</Eyebrow>
              <SectionTitle>Sua equipe no controle, sempre</SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.7, margin: 0 }}>
                O LeadBellus não envia mensagens sozinho e não se conecta ao seu WhatsApp. Ele sugere — quem revisa e envia é a sua equipe.
              </p>
            </div>
            </FadeUp>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              {[
                { icon: <ShieldCheck size={20} />, t: "Cuidado com promessas", c: "As sugestões evitam promessas de resultado, cura ou preço fixo — linguagem adequada ao segmento de estética." },
                { icon: <MessageCircle size={20} />, t: "No tom da sua clínica", c: "Você define o jeito de falar da clínica e as sugestões seguem esse tom — com cara de gente, não de robô." },
                { icon: <Lock size={20} />, t: "Privacidade", c: "Cada conta acessa apenas os próprios dados. Pagamento processado com segurança." },
                { icon: <Clock size={20} />, t: "Teste sem compromisso", c: "Sem cartão para começar. Cancele quando quiser, direto no painel, sem multa." },
              ].map((s) => (
                <div key={s.t} className="lp-card" style={{ background: "#ffffff", border: "1px solid rgba(16,35,59,0.07)", borderRadius: "16px", padding: "22px" }}>
                  <span style={{ display: "inline-flex", color: GOLD_DEEP, marginBottom: "12px" }}>{s.icon}</span>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: INK, margin: "0 0 6px" }}>{s.t}</h3>
                  <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: INK_SOFT, margin: 0 }}>{s.c}</p>
                </div>
              ))}
            </div>

            {DEPOIMENTOS.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginTop: "20px" }}>
                {DEPOIMENTOS.map((d) => (
                  <figure key={d.nome} style={{ background: CREAM_2, borderRadius: "16px", padding: "22px", margin: 0 }}>
                    <blockquote style={{ margin: "0 0 12px", fontSize: "14.5px", lineHeight: 1.6, color: INK }}>“{d.texto}”</blockquote>
                    <figcaption style={{ fontSize: "13px", color: INK_SOFT }}>
                      <strong style={{ color: INK }}>{d.nome}</strong> · {d.clinica}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section id="faq" style={{ background: CREAM_2, padding: "78px 24px" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <FadeUp>
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <Eyebrow>Dúvidas frequentes</Eyebrow>
              <SectionTitle>Antes de começar</SectionTitle>
            </div>
            </FadeUp>
            <div style={{ display: "grid", gap: "10px" }}>
              {[
                { q: "Tem risco de banir meu WhatsApp?", a: "Não. O LeadBellus não envia nada sozinho nem se conecta ao seu WhatsApp. Ele só sugere a resposta — você lê, ajusta e cola na conversa. Seu número fica seguro." },
                { q: "É um robô que responde sozinho?", a: "Não. Quem responde é a sua equipe. A IA sugere o texto e o próximo passo; a clínica decide o que enviar. O controle é todo seu." },
                { q: "Serve pra público masculino também?", a: "Sim. Botox masculino, barba, sobrancelha, queda capilar, skincare… as sugestões se adaptam ao procedimento e ao cliente." },
                { q: "Funciona no celular?", a: "Sim. No celular, tablet ou computador, direto no navegador. Dá pra gerar a sugestão e colar no WhatsApp na mesma tela." },
                { q: "Preciso de cartão pra testar?", a: "Não. Você testa de graça e só assina o Start (R$97/mês) se fizer sentido pra sua rotina." },
                { q: "Como cancelo?", a: "Pelo painel, quando quiser. Sem multa e sem ligação." },
              ].map((item, i) => (
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
        <section style={{ background: NAVY, padding: "84px 24px" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
            <LogoMark size={42} stroke={GOLD} />
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
              Sua equipe já sabe cuidar da cliente. O LeadBellus ajuda a cuidar da conversa.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "16px", lineHeight: 1.7, margin: "0 auto 28px", maxWidth: "520px" }}>
              Veja como o LeadBellus se encaixa no atendimento da sua clínica. Comece hoje, de graça.
            </p>
            <TrackLink
              event="cta_click"
              source="cta_final"
              href={SIGNUP}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: GOLD,
                color: NAVY,
                borderRadius: "9999px",
                padding: "16px 34px",
                fontSize: "16px",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 18px 44px rgba(201,160,96,0.32)",
              }}
            >
              Testar grátis agora <ArrowRight size={18} />
            </TrackLink>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "14px" }}>Sem cartão · cancele quando quiser</p>
          </div>
        </section>
      </main>

      <FooterSection />

      {/* Espaço + barra fixa mobile */}
      <style>{`
        .lp-btn-primary, .lp-btn-ghost { transition: transform .2s ease, box-shadow .2s ease; will-change: transform; }
        .lp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 22px 48px rgba(16,35,59,0.34), inset 0 1px 0 rgba(255,255,255,0.12); }
        .lp-btn-ghost:hover { transform: translateY(-2px); }
        .lp-card { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
        .lp-card:hover { transform: translateY(-4px); box-shadow: 0 22px 48px rgba(16,35,59,0.10); border-color: rgba(201,160,96,0.45) !important; }
        @keyframes lp-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        .lp-float { animation: lp-float 7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .lp-float { animation: none; }
          .lp-btn-primary, .lp-btn-ghost, .lp-card { transition: none; }
        }
      `}</style>
      <style>{`
        @media (min-width: 768px) { .hero-grid { grid-template-columns: 1.05fr 0.95fr !important; } }
        @media (min-width: 900px) { .rotina-grid { grid-template-columns: 0.95fr 1.05fr !important; } }
        .lp-mobile-bar { display: none; }
        @media (max-width: 767px) {
          .landing-root { max-width: 100vw; overflow-x: hidden; }
          .launch-strip { padding: 8px 12px !important; font-size: 12px !important; line-height: 1.25; }
          .landing-hero { padding: 52px 20px 58px !important; }
          .hero-grid,
          .hero-copy-col,
          .hero-proof-col { min-width: 0; width: 100%; }
          .hero-title { max-width: 360px !important; font-size: clamp(30px, 9vw, 40px) !important; line-height: 1.1 !important; }
          .hero-title-highlight { display: block; max-width: 100%; }
          .hero-subtitle { max-width: 360px !important; font-size: 17px !important; line-height: 1.55 !important; }
          .hero-cta-row { display: grid !important; grid-template-columns: 1fr; gap: 10px !important; }
          .hero-cta { box-sizing: border-box; width: 100%; justify-content: center; }
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
            Teste grátis
          </p>
          <p className="lp-mobile-bar-subtitle" style={{ margin: "3px 0 0", fontSize: "11px", color: INK_SOFT }}>
            Sem cartão · depois R$97/mês
          </p>
        </div>
        <TrackLink
          event="cta_click"
          source="mobile_bar"
          href={SIGNUP}
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
          Começar grátis
        </TrackLink>
      </div>
      <WhatsAppCta />
    </div>
  );
}
