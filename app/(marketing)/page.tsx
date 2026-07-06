import Link from "next/link";
import dynamic from "next/dynamic";
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
import { LoadingRespostas } from "@/components/loading-respostas";
import { PricingSection } from "@/components/pricing-section";
import { FooterSection } from "@/components/footer-section";
import { LegalConsentLinks } from "@/components/legal-consent-links";
import { MarketingMobileMenu } from "@/components/marketing-mobile-menu";
import { TrackLink } from "@/components/track-link";
import { WhatsAppCta } from "@/components/whatsapp-cta";

const SIGNUP = "/onboarding";

const LandingWhatsAppDemo = dynamic(
  () =>
    import("@/components/landing-whatsapp-demo").then(
      (mod) => mod.LandingWhatsAppDemo
    ),
  {
    loading: () => <LoadingRespostas etapas={["Carregando a demo…"]} />,
  }
);

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
      "Copiloto de WhatsApp para clínicas de estética cria respostas prontas para preço, objeções e follow-up — para clientes mulheres e homens.",
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
          <p style={{ margin: 0, fontSize: "11px", color: "#1FA855", fontWeight: 700 }}>quase fechando</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: "8px", margin: "14px 0" }}>
        <div style={{ alignSelf: "flex-start", maxWidth: "85%", background: "#F1F4F8", color: INK, borderRadius: "14px 14px 14px 4px", padding: "10px 12px", fontSize: "13px", lineHeight: 1.4 }}>
          Quanto fica o botox? 😬 Tenho medo de ficar com cara artificial…
        </div>
        <div style={{ alignSelf: "flex-end", maxWidth: "88%", background: "#DCF6E6", color: "#0B3D2A", borderRadius: "14px 14px 4px 14px", padding: "10px 12px", fontSize: "13px", lineHeight: 1.45 }}>
          Oi! 😊 O valor depende da avaliação e do que você busca — o resultado é sempre natural quando bem indicado. Quer que eu veja um horário essa semana?
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
        <span style={{ fontSize: "11px", color: INK_SOFT, alignSelf: "center" }}>3 respostas prontas pra copiar</span>
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
        Lançamento: R$97/mês — menos de R$3,30 por dia · teste grátis, sem cartão
      </div>

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="landing-hero" style={{ padding: "72px 24px 80px", overflowX: "hidden", position: "relative", background: `linear-gradient(180deg, ${NAVY} 0%, #0D2038 100%)` }}>
          {/* Glows + grid de fundo (decoração tech) */}
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-180px", right: "-120px", width: "560px", height: "560px", borderRadius: "50%", background: "radial-gradient(circle, rgba(228,168,77,0.28), transparent 65%)", filter: "blur(44px)" }} />
            <div style={{ position: "absolute", bottom: "-240px", left: "-160px", width: "560px", height: "560px", borderRadius: "50%", background: "radial-gradient(circle, rgba(31,168,85,0.14), transparent 65%)", filter: "blur(52px)" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)", backgroundSize: "26px 26px", maskImage: "linear-gradient(to bottom, black 0%, transparent 78%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 78%)" }} />
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
                Você não perde cliente pelo preço.{" "}
                <span className="hero-title-highlight" style={{ background: `linear-gradient(100deg, ${GOLD_HOT}, ${GOLD} 55%, #D18A1F)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", fontStyle: "italic" }}>Perde pela resposta.</span>
              </h1>
              <p className="hero-subtitle" style={{ fontSize: "18px", lineHeight: 1.6, color: "rgba(255,255,255,0.78)", maxWidth: "480px", margin: "0 0 26px" }}>
                Cole a mensagem da cliente. Em segundos saem <strong style={{ color: "#FFFFFF" }}>3 respostas no tom da sua clínica</strong> — é copiar, colar no WhatsApp e agendar.
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
                Atende <strong style={{ color: "rgba(255,255,255,0.85)" }}>mulheres e homens</strong> · funciona no celular · cancele quando quiser
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["Preço", "“Achou caro”", "Cliente sumiu", "Medo", "Follow-up"].map((t) => (
                  <span
                    key={t}
                    style={{
                      background: "rgba(228,168,77,0.1)",
                      border: "1px solid rgba(228,168,77,0.35)",
                      borderRadius: "9999px",
                      padding: "7px 13px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: GOLD_HOT,
                    }}
                  >
                    ✓ {t}
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

        {/* ── DOR / SINAIS ─────────────────────────────────────────────────── */}
        <section style={{ padding: "76px 24px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <FadeUp>
            <div style={{ maxWidth: "640px", marginBottom: "34px" }}>
              <Eyebrow>As 5 conversas que definem seu mês</Eyebrow>
              <SectionTitle>Toda conversa difícil já chega respondida</SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.7, margin: 0 }}>
                Um app, todos os travamentos do WhatsApp resolvidos — no tom da sua clínica.
              </p>
            </div>
            </FadeUp>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "18px" }}>
              {[
                { t: "Perguntou o preço", c: "Sai resposta que valoriza antes de falar número — e já convida pra avaliação." },
                { t: "“Achou caro”", c: "Sai resposta que defende seu valor sem sair dando desconto." },
                { t: "Sumiu", c: "Sai follow-up leve, com dia e hora pra voltar." },
                { t: "Medo do procedimento", c: "Sai resposta que acolhe e passa segurança — sem prometer milagre." },
                { t: "Quase fechando", c: "Sai mensagem de fechamento com o próximo passo claro." },
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
        <section id="como-funciona" style={{ background: CREAM_2, padding: "76px 24px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <FadeUp>
            <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 40px" }}>
              <Eyebrow>Como funciona</Eyebrow>
              <SectionTitle>Em 3 passos, sem complicação</SectionTitle>
            </div>
            </FadeUp>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
              {[
                { n: "01", icon: <MessageCircle size={20} />, t: "Cole a mensagem", c: "Copie o que a pessoa mandou no WhatsApp e cole no LeadBellus." },
                { n: "02", icon: <Sparkles size={20} />, t: "Receba 3 respostas", c: "No tom da sua clínica: uma suave, uma consultiva e uma de fechamento." },
                { n: "03", icon: <Copy size={20} />, t: "Copie e mande", c: "Revisa, ajusta se quiser e cola na conversa. Você no controle, sempre." },
              ].map((s) => (
                <div key={s.n} className="lp-card" style={{ background: "#ffffff", border: "1px solid rgba(16,35,59,0.07)", borderRadius: "18px", padding: "26px" }}>
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
          </div>
        </section>

        {/* ── PARA QUEM É (elas e eles) ────────────────────────────────────── */}
        <section id="para-quem" style={{ padding: "78px 24px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <FadeUp>
            <div style={{ textAlign: "center", maxWidth: "660px", margin: "0 auto 40px" }}>
              <Eyebrow>Para quem é</Eyebrow>
              <SectionTitle>Estética não tem só um público</SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.7, margin: 0 }}>
                Seu WhatsApp atende mulheres e homens — e cada conversa tem o seu tom. O LeadBellus responde os dois do jeito certo.
              </p>
            </div>
            </FadeUp>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {[
                {
                  tag: "Para elas",
                  bg: "#ffffff",
                  titulo: "A estética que elas já procuram",
                  itens: ["Botox e preenchimento", "Harmonização facial", "Limpeza de pele e peeling", "Bioestimulador e skinbooster", "Corporal: drenagem, gordura localizada"],
                },
                {
                  tag: "Para eles",
                  bg: INK,
                  titulo: "O público masculino que mais cresce",
                  itens: ["Botox masculino (testa, bruxismo)", "Design de barba e sobrancelha", "Queda capilar e calvície", "Skincare e limpeza de pele", "Depilação a laser"],
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
        <section id="demo" style={{ background: CREAM_2, padding: "78px 24px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <FadeUp>
            <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 36px" }}>
              <Eyebrow>Experimente agora</Eyebrow>
              <SectionTitle>Veja uma resposta da sua clínica — de graça</SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "15px", margin: 0 }}>
                Escolha uma situação e veja como ficaria. Gostou? É só criar a conta e usar no atendimento real.
              </p>
            </div>
            </FadeUp>

            <LandingWhatsAppDemo />

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
                Esta é a demonstração. Crie sua conta grátis pra usar no WhatsApp de verdade.
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

        {/* ── FAÇA A CONTA (ancoragem de preço) ────────────────────────────── */}
        <section style={{ padding: "78px 24px", background: CREAM }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <FadeUp>
            <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 40px" }}>
              <Eyebrow>Faça a conta</Eyebrow>
              <SectionTitle>Uma cliente que não some paga o app por meses</SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.7, margin: 0 }}>
                Você sabe quanto vale o seu ticket médio. Agora compare:
              </p>
            </div>
            </FadeUp>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
              {[
                { n: "R$3,23", t: "por dia", c: "É o LeadBellus no plano Start. Menos que a água da recepção." },
                { n: "1 cliente", t: "recuperada", c: "Uma única avaliação que não some já cobre meses de assinatura." },
                { n: "30 seg", t: "por resposta", c: "Da mensagem colada às 3 respostas prontas — em todas as conversas, todo dia." },
              ].map((s) => (
                <div key={s.n} className="lp-card" style={{ background: CREAM_2, border: "1px solid rgba(11,27,51,0.07)", borderRadius: "20px", padding: "30px", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: "40px", fontWeight: 800, letterSpacing: "-0.02em", background: `linear-gradient(120deg, ${GOLD_DEEP}, ${GOLD})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{s.n}</p>
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
                Teste grátis primeiro. Assine só quando as respostas já estiverem fechando avaliação por você.
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
            <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 36px" }}>
              <Eyebrow>Por que confiar</Eyebrow>
              <SectionTitle>Feito pra estética brasileira — não parece resposta pronta</SectionTitle>
            </div>
            </FadeUp>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              {[
                { icon: <ShieldCheck size={20} />, t: "Respeita as regras", c: "Nunca promete resultado, cura ou preço fixo. Suas respostas saem dentro do que pode." },
                { icon: <MessageCircle size={20} />, t: "No seu tom", c: "Você define o jeito da clínica. As respostas saem com cara de gente, não de robô." },
                { icon: <Lock size={20} />, t: "Seus dados protegidos", c: "Cada conta vê só os próprios dados. Pagamento seguro." },
                { icon: <Clock size={20} />, t: "Risco zero pra testar", c: "Sem cartão pra começar e cancele quando quiser, sem multa." },
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
                { q: "Tem risco de banir meu WhatsApp?", a: "Não 🙂 Ele não envia nada sozinho nem se conecta no seu WhatsApp. Só escreve a resposta — você lê, ajusta e cola na conversa. Seu número fica seguro." },
                { q: "É um robô que responde sozinho?", a: "Não. Quem responde é você. A IA só te entrega o texto pronto e você decide o que mandar. O controle é todo seu." },
                { q: "Serve pra público masculino também?", a: "Sim. Botox masculino, barba, sobrancelha, queda capilar, skincare… o tom se ajusta pra cada cliente, homem ou mulher." },
                { q: "Funciona no celular?", a: "Sim! No celular, tablet ou computador, direto no navegador. Dá pra gerar a resposta e colar no WhatsApp na mesma tela." },
                { q: "Preciso de cartão pra testar?", a: "Não. Testa de graça e só assina o Start (R$97/mês) se curtir." },
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
              Quantas vão perguntar o preço essa semana?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "16px", lineHeight: 1.7, margin: "0 auto 28px", maxWidth: "520px" }}>
              Com a resposta certa, elas agendam. Sem ela, elas somem. Comece hoje, de graça.
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
        .lp-mobile-bar { display: none; }
        @media (max-width: 767px) {
          .landing-root { max-width: 100vw; overflow-x: hidden; }
          .launch-strip { padding: 8px 12px !important; font-size: 12px !important; line-height: 1.25; }
          .landing-hero { padding: 52px 20px 58px !important; }
          .hero-grid,
          .hero-copy-col,
          .hero-proof-col { min-width: 0; width: 100%; }
          .hero-title { max-width: 340px !important; font-size: clamp(34px, 10.7vw, 42px) !important; line-height: 1.06 !important; }
          .hero-title-highlight { display: block; max-width: 100%; }
          .hero-subtitle { max-width: 340px !important; font-size: 17px !important; line-height: 1.55 !important; }
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
