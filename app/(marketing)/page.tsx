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
import { LandingWhatsAppDemo } from "@/components/landing-whatsapp-demo";
import { LoadingRespostas } from "@/components/loading-respostas";
import { PricingSection } from "@/components/pricing-section";
import { FooterSection } from "@/components/footer-section";
import { LegalConsentLinks } from "@/components/legal-consent-links";
import { MarketingMobileMenu } from "@/components/marketing-mobile-menu";
import { FaqSection } from "@/components/faq-section";
import { FinalCTASection } from "@/components/final-cta-section";
import { FuncoesSection } from "@/components/funcoes-section";

const SIGNUP = "/signup?plan=start";

// Paleta (on-brand: creme do logo + tinta navy + dourado) ----------------------
const INK = "#10233B";
const INK_SOFT = "#46566B";
const CREAM = "#FBF6EC";
const CREAM_2 = "#F2E9D8";
const NAVY = "#0B1A2E";
const GOLD = "#C9A060";
const GOLD_DEEP = "#8A6312";

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
      url: "https://www.leadbellus.com.br/signup",
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
        fontFamily: "var(--font-fraunces, Georgia, serif)",
        fontSize: "clamp(28px, 4vw, 44px)",
        fontWeight: 700,
        lineHeight: 1.12,
        color: onNavy ? "#FBF6EC" : INK,
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
        background: "rgba(251,246,236,0.85)",
        backdropFilter: "blur(12px)",
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
              color: "#F7C96B",
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
      style={{
        background: "#ffffff",
        border: "1px solid rgba(16,35,59,0.08)",
        borderRadius: "22px",
        padding: "18px",
        boxShadow: "0 30px 60px rgba(16,35,59,0.12)",
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
        <div style={{ alignSelf: "flex-start", maxWidth: "85%", background: "#F1EEE7", color: INK, borderRadius: "14px 14px 14px 4px", padding: "10px 12px", fontSize: "13px", lineHeight: 1.4 }}>
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
    <div style={{ fontFamily: "var(--font-inter, system-ui, sans-serif)", background: CREAM, color: INK }}>
      <StructuredDataTags />
      <Navbar />

      {/* Faixa de lançamento */}
      <div style={{ background: INK, color: "#F7C96B", textAlign: "center", padding: "9px 24px", fontSize: "13px", fontWeight: 600 }}>
        {"Preço de lançamento · teste grátis, sem cartão"}
      </div>

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section
          style={{
            position: "relative",
            background: ["radial-gradient(1100px 620px at 88% -10%,rgba(189,162,105,.16),transparent 60%)", "#F5F0E6"].join(","),
            overflow: "hidden",
          }}
        >
          <div
            className="hero-grid"
            style={{
              maxWidth: "1240px",
              margin: "0 auto",
              padding: "84px 32px 96px",
              display: "grid",
              gridTemplateColumns: "1.05fr .95fr",
              gap: "64px",
              alignItems: "center",
            }}
          >
            {/* Texto */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  border: "1px solid rgba(189,162,105,.55)",
                  color: "#9A7B3C",
                  borderRadius: "99px",
                  padding: "7px 16px",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                }}
              >
                ✦ Feito para clínicas de estética brasileiras
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-fraunces, Georgia, serif)",
                  fontWeight: 800,
                  fontSize: "clamp(44px, 5.4vw, 76px)",
                  lineHeight: 1.02,
                  letterSpacing: "-.02em",
                  margin: "26px 0 0",
                  color: "#16202F",
                }}
              >
                A resposta certa.<br />No seu tom.<br />
                <span style={{ color: "#9A7B3C", fontStyle: "italic" }}>Em segundos.</span>
              </h1>

              <p
                style={{
                  fontSize: "19px",
                  lineHeight: 1.6,
                  color: "#5E6373",
                  maxWidth: "540px",
                  margin: "26px 0 0",
                }}
              >
                O LeadBellus lê cada mensagem da sua cliente e devolve a resposta que acolhe, quebra a objeção e conduz pro agendamento — sem soar robótico. Você só copia e cola no WhatsApp.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "36px" }}>
                <Link
                  href={SIGNUP}
                  style={{
                    background: "#BDA269",
                    color: "#1A1206",
                    textDecoration: "none",
                    fontSize: "16px",
                    fontWeight: 800,
                    padding: "17px 32px",
                    borderRadius: "99px",
                    boxShadow: "0 14px 34px rgba(189,162,105,.32)",
                  }}
                >
                  Começar grátis por 7 dias →
                </Link>
                <a
                  href="#demo"
                  style={{
                    border: "1px solid #EAE0CC",
                    color: "#16202F",
                    textDecoration: "none",
                    fontSize: "16px",
                    fontWeight: 700,
                    padding: "17px 30px",
                    borderRadius: "99px",
                    background: "#fff",
                  }}
                >
                  Testar o simulador ↓
                </a>
              </div>

              <p style={{ fontSize: "13.5px", color: "#5E6373", marginTop: "20px", fontWeight: 600 }}>
                Sem cartão · Acesso imediato · Você usa hoje mesmo
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "30px" }}>
                {["💬 Respostas estratégicas", "🔄 Follow-up automático", "🧠 Lead Intelligence"].map((t) => (
                  <span
                    key={t}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      background: "#fff",
                      border: "1px solid #EAE0CC",
                      borderRadius: "99px",
                      padding: "8px 15px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#16202F",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Mock do gerador */}
            <div className="hero-mock">
              <div
                style={{
                  background: "linear-gradient(180deg,#0F1A30,#0B1626)",
                  border: "1px solid #1E2C46",
                  borderRadius: "24px",
                  boxShadow: "0 40px 90px rgba(16,24,40,.28)",
                  overflow: "hidden",
                }}
              >
                {/* Barra topo mac-style */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "16px 20px", borderBottom: "1px solid #1E2C46" }}>
                  <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#E0685B", display: "inline-block" }} />
                  <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#E6B95C", display: "inline-block" }} />
                  <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#5EBB7C", display: "inline-block" }} />
                  <span style={{ marginLeft: "8px", fontSize: "12.5px", fontWeight: 700, color: "#8C94A6", letterSpacing: ".04em" }}>
                    LeadBellus · Gerador de Respostas
                  </span>
                </div>

                <div style={{ padding: "22px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#8C94A6" }}>
                    Mensagem da cliente
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      background: "#13213A",
                      border: "1px solid #1E2C46",
                      borderRadius: "14px 14px 14px 4px",
                      padding: "13px 16px",
                      fontSize: "14.5px",
                      color: "#D8DEE9",
                      maxWidth: "78%",
                    }}
                  >
                    Oi! Quanto fica o botox? 😊
                  </div>

                  <div style={{ display: "flex", gap: "8px", margin: "20px 0 14px" }}>
                    {["Suave", "Consultiva", "Fechamento"].map((v) => (
                      <span
                        key={v}
                        style={{
                          fontSize: "12.5px",
                          fontWeight: v === "Consultiva" ? 800 : 700,
                          padding: "7px 14px",
                          borderRadius: "99px",
                          color: v === "Consultiva" ? "#1A1206" : "#8C94A6",
                          background: v === "Consultiva" ? "#BDA269" : "transparent",
                          border: v === "Consultiva" ? "none" : "1px solid #1E2C46",
                        }}
                      >
                        {v}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      background: "linear-gradient(180deg,rgba(189,162,105,.12),rgba(189,162,105,.05))",
                      border: "1px solid rgba(189,162,105,.35)",
                      borderRadius: "4px 14px 14px 14px",
                      padding: "16px 18px",
                      fontSize: "14.5px",
                      lineHeight: 1.55,
                      color: "#EDE7D8",
                    }}
                  >
                    "Oi, Ana! O investimento pode variar conforme os pontos avaliados e o objetivo do tratamento. Você busca suavizar as linhas da testa, pés de galinha ou prefere um resultado mais preventivo? Assim consigo te orientar melhor. 💚"
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" }}>
                    <span style={{ fontSize: "12.5px", color: "#5EBB7C", fontWeight: 700 }}>● Gerado em 0,8s</span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                        background: "#BDA269",
                        color: "#1A1206",
                        fontSize: "13px",
                        fontWeight: 800,
                        padding: "9px 18px",
                        borderRadius: "99px",
                      }}
                    >
                      ⧉ Copiar pro WhatsApp
                    </span>
                  </div>
                </div>
              </div>

              {/* Score card */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "18px",
                  padding: "14px 18px",
                  background: "#fff",
                  border: "1px solid #EAE0CC",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(20,15,5,.05)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-fraunces, Georgia, serif)",
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#9A7B3C",
                  }}
                >
                  85
                </span>
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#16202F" }}>Score de conversão</div>
                  <div style={{ fontSize: "12px", color: "#5E6373" }}>Alta chance de agendamento agora</div>
                </div>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes lbFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
            .hero-mock { animation: lbFloat 7s ease-in-out infinite; }
            @media (max-width: 880px) {
              .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
              .hero-mock { animation: none; }
            }
          `}</style>
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
              { icon: <Lock size={15} />, t: "Pagamento seguro via Stripe" },
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
            <div style={{ maxWidth: "640px", marginBottom: "34px" }}>
              <Eyebrow>O que trava o seu WhatsApp</Eyebrow>
              <SectionTitle>Você lê a mensagem. A gente já te entrega a resposta.</SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.7, margin: 0 }}>
                Sem decoreba e sem parecer robô — no tom da sua clínica.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
              {[
                { t: "Perguntou o preço", c: "Você responde com jeitinho, passa segurança e convida pra avaliação — sem jogar só o valor." },
                { t: "Achou caro", c: "Mostra o valor do seu trabalho antes de sair dando desconto." },
                { t: "Sumiu", c: "Você chama de volta com leveza e um próximo passo claro — sem parecer chata." },
              ].map((card) => (
                <article
                  key={card.t}
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
            <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 40px" }}>
              <Eyebrow>Como funciona</Eyebrow>
              <SectionTitle>Em 3 passos, sem complicação</SectionTitle>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
              {[
                { n: "01", icon: <MessageCircle size={20} />, t: "Cole a mensagem", c: "Copie o que a pessoa mandou no WhatsApp e cole no LeadBellus." },
                { n: "02", icon: <Sparkles size={20} />, t: "Receba 3 respostas", c: "No tom da sua clínica: uma suave, uma consultiva e uma de fechamento." },
                { n: "03", icon: <Copy size={20} />, t: "Copie e mande", c: "Revisa, ajusta se quiser e cola na conversa. Você no controle, sempre." },
              ].map((s) => (
                <div key={s.n} style={{ background: "#ffffff", border: "1px solid rgba(16,35,59,0.07)", borderRadius: "18px", padding: "26px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <span style={{ width: "42px", height: "42px", borderRadius: "12px", background: INK, color: GOLD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {s.icon}
                    </span>
                    <span style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: "26px", fontWeight: 700, color: "rgba(16,35,59,0.14)" }}>{s.n}</span>
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
            <div style={{ textAlign: "center", maxWidth: "660px", margin: "0 auto 40px" }}>
              <Eyebrow>Para quem é</Eyebrow>
              <SectionTitle>Estética não tem só um público</SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.7, margin: 0 }}>
                Seu WhatsApp atende mulheres e homens — e cada conversa tem o seu tom. O LeadBellus responde os dois do jeito certo.
              </p>
            </div>

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
                    <h3 style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: "22px", fontWeight: 700, color: dark ? "#FBF6EC" : INK, margin: "0 0 16px" }}>
                      {col.titulo}
                    </h3>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "10px" }}>
                      {col.itens.map((it) => (
                        <li key={it} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "14.5px", color: dark ? "rgba(251,246,236,0.85)" : INK_SOFT }}>
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

        {/* ── FUNÇÕES ──────────────────────────────────────────────────────── */}
        <FuncoesSection />

        {/* ── DEMO ─────────────────────────────────────────────────────────── */}
        <section id="demo" style={{ background: CREAM_2, padding: "78px 24px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 36px" }}>
              <Eyebrow>Experimente agora</Eyebrow>
              <SectionTitle>Veja uma resposta da sua clínica — de graça</SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "15px", margin: 0 }}>
                Escolha uma situação e veja como ficaria. Gostou? É só criar a conta e usar no atendimento real.
              </p>
            </div>

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
                Esta é a demonstração. Crie sua conta grátis pra usar no WhatsApp de verdade.
              </p>
              <Link
                href={SIGNUP}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: INK,
                  color: "#F7C96B",
                  borderRadius: "9999px",
                  padding: "14px 30px",
                  fontSize: "15px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Criar conta grátis <ArrowRight size={16} />
              </Link>
              <p style={{ fontSize: "12px", color: INK_SOFT, marginTop: "10px" }}>Start R$97/mês · sem cartão pra testar · cancele quando quiser</p>
              <div style={{ maxWidth: "430px", margin: "10px auto 0" }}>
                <LegalConsentLinks />
              </div>
            </div>
          </div>
        </section>

        {/* ── PREÇOS ───────────────────────────────────────────────────────── */}
        <section id="precos" style={{ background: "#F5F0E6", padding: "96px 32px" }}>
          <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "0" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "#9A7B3C" }}>
                Escolha o seu plano
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-fraunces, Georgia, serif)",
                  fontWeight: 800,
                  fontSize: "clamp(30px, 4vw, 50px)",
                  lineHeight: 1.1,
                  letterSpacing: "-.02em",
                  margin: "18px auto 0",
                  maxWidth: "20ch",
                  color: "#16202F",
                }}
              >
                Uma cliente recuperada já paga o{" "}
                <span style={{ color: "#9A7B3C", fontStyle: "italic" }}>mês inteiro</span>
              </h2>
              <p style={{ fontSize: "16.5px", lineHeight: 1.6, color: "#5E6373", maxWidth: "600px", margin: "18px auto 46px" }}>
                Você cobra R$1.500 numa harmonização. Se fechar 1 cliente a mais por mês, são 15x de retorno no pior cenário.
              </p>
            </div>
            <PricingSection />
          </div>
        </section>

        {/* ── CONFIANÇA ────────────────────────────────────────────────────── */}
        <section style={{ padding: "78px 24px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 36px" }}>
              <Eyebrow>Por que confiar</Eyebrow>
              <SectionTitle>Feito pra estética brasileira — não é ChatGPT genérico</SectionTitle>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              {[
                { icon: <ShieldCheck size={20} />, t: "Respeita as regras", c: "Nunca promete resultado, cura ou preço fixo. Suas respostas saem dentro do que pode." },
                { icon: <MessageCircle size={20} />, t: "No seu tom", c: "Você define o jeito da clínica. As respostas saem com cara de gente, não de robô." },
                { icon: <Lock size={20} />, t: "Seus dados protegidos", c: "Cada conta vê só os próprios dados. Pagamento seguro via Stripe." },
                { icon: <Clock size={20} />, t: "Risco zero pra testar", c: "Sem cartão pra começar e cancele quando quiser, sem multa." },
              ].map((s) => (
                <div key={s.t} style={{ background: "#ffffff", border: "1px solid rgba(16,35,59,0.07)", borderRadius: "16px", padding: "22px" }}>
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
                    <blockquote style={{ margin: "0 0 12px", fontSize: "14.5px", lineHeight: 1.6, color: INK }}>"{d.texto}"</blockquote>
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
        <FaqSection />

        {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
        <FinalCTASection funilHref={SIGNUP} />
      </main>

      <FooterSection />

      {/* Espaço + barra fixa mobile */}
      <style>{`
        @media (min-width: 768px) { .hero-grid { grid-template-columns: 1.05fr 0.95fr !important; } }
        .lp-mobile-bar { display: none; }
        @media (max-width: 767px) {
          .lp-mobile-spacer { height: 74px; }
          .lp-mobile-bar { display: flex; }
        }
      `}</style>
      <div className="lp-mobile-spacer" />
      <div
        className="lp-mobile-bar"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 60,
          alignItems: "center",
          gap: "12px",
          background: "rgba(251,246,236,0.97)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(201,160,96,0.3)",
          padding: "10px 16px calc(10px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ lineHeight: 1.2 }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: INK }}>
            Start R$97<span style={{ fontSize: "12px", fontWeight: 400, color: INK_SOFT }}>/mês</span>
          </p>
          <p style={{ margin: 0, fontSize: "11px", color: INK_SOFT }}>Teste grátis, sem cartão</p>
        </div>
        <Link
          href={SIGNUP}
          style={{
            marginLeft: "auto",
            background: INK,
            color: "#F7C96B",
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
