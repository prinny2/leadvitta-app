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
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ── Logo ───────────────────────────────────────────────────────────────────────
function LogoMark({
  size = 30,
  stroke = GOLD,
}: {
  size?: number;
  stroke?: string;
}) {
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
        stroke={stroke}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M40 6 C54 14, 70 32, 70 54 C70 70, 58 82, 40 90"
        stroke={stroke}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <line
        x1="40"
        y1="32"
        x2="40"
        y2="86"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="40" cy="27" r="5.5" fill={stroke} />
    </svg>
  );
}

function Eyebrow({
  children,
  onNavy,
}: {
  children: React.ReactNode;
  onNavy?: boolean;
}) {
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

function SectionTitle({
  children,
  onNavy,
}: {
  children: React.ReactNode;
  onNavy?: boolean;
}) {
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
          <LogoMark size={28} stroke={GOLD_DEEP} />
          <span
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "19px",
              fontWeight: 600,
              color: INK,
            }}
          >
            LeadBellus
          </span>
        </Link>

        <div
          className="hidden md:flex"
          style={{ gap: "30px", alignItems: "center" }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                color: INK_SOFT,
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/login"
            className="hidden md:block"
            style={{
              color: INK_SOFT,
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          paddingBottom: "12px",
          borderBottom: "1px solid rgba(16,35,59,0.07)",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "#E9F7EF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MessageCircle size={18} style={{ color: "#1FA855" }} />
        </div>
        <div style={{ lineHeight: 1.2 }}>
          <p
            style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: INK }}
          >
            Cliente · WhatsApp
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              color: "#1FA855",
              fontWeight: 700,
            }}
          >
            quase fechando
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gap: "8px", margin: "14px 0" }}>
        <div
          style={{
            alignSelf: "flex-start",
            maxWidth: "85%",
            background: "#F1EEE7",
            color: INK,
            borderRadius: "14px 14px 14px 4px",
            padding: "10px 12px",
            fontSize: "13px",
            lineHeight: 1.4,
          }}
        >
          Quanto fica o botox? 😬 Tenho medo de ficar com cara artificial…
        </div>
        <div
          style={{
            alignSelf: "flex-end",
            maxWidth: "88%",
            background: "#DCF6E6",
            color: "#0B3D2A",
            borderRadius: "14px 14px 4px 14px",
            padding: "10px 12px",
            fontSize: "13px",
            lineHeight: 1.45,
          }}
        >
          Oi! 😊 O valor depende da avaliação e do que você busca — o resultado
          é sempre natural quando bem indicado. Quer que eu veja um horário essa
          semana?
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
        <span
          style={{ fontSize: "11px", color: INK_SOFT, alignSelf: "center" }}
        >
          3 respostas prontas pra copiar
        </span>
      </div>
    </div>
  );
}

// ── PAGE ───────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div
      style={{
        fontFamily: "var(--font-inter, system-ui, sans-serif)",
        background: CREAM,
        color: INK,
      }}
    >
      <StructuredDataTags />
      <Navbar />

      {/* Faixa de lançamento */}
      <div
        style={{
          background: INK,
          color: "#F7C96B",
          textAlign: "center",
          padding: "9px 24px",
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        Preço de lançamento · teste grátis, sem cartão
      </div>

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section style={{ padding: "64px 24px 72px" }}>
          <div
            className="hero-grid"
            style={{
              maxWidth: "1152px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "44px",
              alignItems: "center",
            }}
          >
            <div>
              <Eyebrow>Conversão na estética · WhatsApp</Eyebrow>
              <h1
                style={{
                  fontFamily: "var(--font-fraunces, Georgia, serif)",
                  fontSize: "clamp(38px, 5.2vw, 64px)",
                  fontWeight: 700,
                  lineHeight: 1.04,
                  margin: "0 0 18px",
                  color: INK,
                }}
              >
                Pare de perder cliente no{" "}
                <span style={{ color: GOLD_DEEP, fontStyle: "italic" }}>
                  “quanto custa?”
                </span>
              </h1>
              <p
                style={{
                  fontSize: "18px",
                  lineHeight: 1.6,
                  color: INK_SOFT,
                  maxWidth: "480px",
                  margin: "0 0 26px",
                }}
              >
                Recebeu mensagem e travou? Cola aqui e saem{" "}
                <strong>3 respostas no jeitinho da sua clínica</strong>, prontas
                pra colar no WhatsApp. Sem prometer o impossível, sem soar robô.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "14px",
                }}
              >
                <Link
                  href={SIGNUP}
                  style={{
                    background: INK,
                    color: "#F7C96B",
                    borderRadius: "9999px",
                    padding: "15px 28px",
                    fontSize: "15px",
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 16px 38px rgba(16,35,59,0.22)",
                  }}
                >
                  Testar grátis (sem cartão) <ArrowRight size={17} />
                </Link>
                <a
                  href="#demo"
                  style={{
                    border: `1.5px solid rgba(16,35,59,0.2)`,
                    color: INK,
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
                  <PlayCircle size={17} /> Ver demo
                </a>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: INK_SOFT,
                  margin: "0 0 26px",
                }}
              >
                Atende <strong>mulheres e homens</strong> · funciona no celular
                · cancele quando quiser
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {[
                  "Preço sem susto",
                  "“Achou caro”",
                  "Cliente sumiu",
                  "Medo do procedimento",
                ].map((t) => (
                  <span
                    key={t}
                    style={{
                      background: "rgba(16,35,59,0.04)",
                      border: "1px solid rgba(16,35,59,0.1)",
                      borderRadius: "9999px",
                      padding: "7px 13px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: INK_SOFT,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <ChatProof />
            </div>
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
              { icon: <Lock size={15} />, t: "Pagamento seguro via Stripe" },
              {
                icon: <ShieldCheck size={15} />,
                t: "Você revisa antes de enviar",
              },
              { icon: <Smartphone size={15} />, t: "Funciona no celular" },
              { icon: <Check size={15} />, t: "Sem cartão pra testar" },
            ].map((s) => (
              <span
                key={s.t}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
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
              <SectionTitle>
                Você lê a mensagem. A gente já te entrega a resposta.
              </SectionTitle>
              <p
                style={{
                  color: INK_SOFT,
                  fontSize: "16px",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Sem decoreba e sem parecer robô — no tom da sua clínica.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "18px",
              }}
            >
              {[
                {
                  t: "Perguntou o preço",
                  c: "Você responde com jeitinho, passa segurança e convida pra avaliação — sem jogar só o valor.",
                },
                {
                  t: "Achou caro",
                  c: "Mostra o valor do seu trabalho antes de sair dando desconto.",
                },
                {
                  t: "Sumiu",
                  c: "Você chama de volta com leveza e um próximo passo claro — sem parecer chata.",
                },
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
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: GOLD,
                      marginBottom: "14px",
                    }}
                  />
                  <h3
                    style={{
                      color: INK,
                      fontSize: "18px",
                      fontWeight: 700,
                      margin: "0 0 8px",
                    }}
                  >
                    {card.t}
                  </h3>
                  <p
                    style={{
                      color: INK_SOFT,
                      fontSize: "14px",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {card.c}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ────────────────────────────────────────────────── */}
        <section
          id="como-funciona"
          style={{ background: CREAM_2, padding: "76px 24px" }}
        >
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div
              style={{
                textAlign: "center",
                maxWidth: "620px",
                margin: "0 auto 40px",
              }}
            >
              <Eyebrow>Como funciona</Eyebrow>
              <SectionTitle>Em 3 passos, sem complicação</SectionTitle>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "18px",
              }}
            >
              {[
                {
                  n: "01",
                  icon: <MessageCircle size={20} />,
                  t: "Cole a mensagem",
                  c: "Copie o que a pessoa mandou no WhatsApp e cole no LeadBellus.",
                },
                {
                  n: "02",
                  icon: <Sparkles size={20} />,
                  t: "Receba 3 respostas",
                  c: "No tom da sua clínica: uma suave, uma consultiva e uma de fechamento.",
                },
                {
                  n: "03",
                  icon: <Copy size={20} />,
                  t: "Copie e mande",
                  c: "Revisa, ajusta se quiser e cola na conversa. Você no controle, sempre.",
                },
              ].map((s) => (
                <div
                  key={s.n}
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(16,35,59,0.07)",
                    borderRadius: "18px",
                    padding: "26px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <span
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: INK,
                        color: GOLD,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {s.icon}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-fraunces, Georgia, serif)",
                        fontSize: "26px",
                        fontWeight: 700,
                        color: "rgba(16,35,59,0.14)",
                      }}
                    >
                      {s.n}
                    </span>
                  </div>
                  <h3
                    style={{
                      color: INK,
                      fontSize: "18px",
                      fontWeight: 700,
                      margin: "0 0 8px",
                    }}
                  >
                    {s.t}
                  </h3>
                  <p
                    style={{
                      color: INK_SOFT,
                      fontSize: "14px",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {s.c}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PARA QUEM É (elas e eles) ────────────────────────────────────── */}
        <section id="para-quem" style={{ padding: "78px 24px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div
              style={{
                textAlign: "center",
                maxWidth: "660px",
                margin: "0 auto 40px",
              }}
            >
              <Eyebrow>Para quem é</Eyebrow>
              <SectionTitle>Estética não tem só um público</SectionTitle>
              <p
                style={{
                  color: INK_SOFT,
                  fontSize: "16px",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Seu WhatsApp atende mulheres e homens — e cada conversa tem o
                seu tom. O LeadBellus responde os dois do jeito certo.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {[
                {
                  tag: "Para elas",
                  bg: "#ffffff",
                  titulo: "A estética que elas já procuram",
                  itens: [
                    "Botox e preenchimento",
                    "Harmonização facial",
                    "Limpeza de pele e peeling",
                    "Bioestimulador e skinbooster",
                    "Corporal: drenagem, gordura localizada",
                  ],
                },
                {
                  tag: "Para eles",
                  bg: INK,
                  titulo: "O público masculino que mais cresce",
                  itens: [
                    "Botox masculino (testa, bruxismo)",
                    "Design de barba e sobrancelha",
                    "Queda capilar e calvície",
                    "Skincare e limpeza de pele",
                    "Depilação a laser",
                  ],
                },
              ].map((col) => {
                const dark = col.bg === INK;
                return (
                  <div
                    key={col.tag}
                    style={{
                      background: col.bg,
                      border: dark
                        ? "1px solid rgba(201,160,96,0.25)"
                        : "1px solid rgba(16,35,59,0.08)",
                      borderRadius: "22px",
                      padding: "30px",
                      boxShadow: dark
                        ? "none"
                        : "0 10px 30px rgba(16,35,59,0.05)",
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
                    <h3
                      style={{
                        fontFamily: "var(--font-fraunces, Georgia, serif)",
                        fontSize: "22px",
                        fontWeight: 700,
                        color: dark ? "#FBF6EC" : INK,
                        margin: "0 0 16px",
                      }}
                    >
                      {col.titulo}
                    </h3>
                    <ul
                      style={{
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                        display: "grid",
                        gap: "10px",
                      }}
                    >
                      {col.itens.map((it) => (
                        <li
                          key={it}
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "flex-start",
                            fontSize: "14.5px",
                            color: dark ? "rgba(251,246,236,0.85)" : INK_SOFT,
                          }}
                        >
                          <Check
                            size={17}
                            style={{
                              color: GOLD,
                              flexShrink: 0,
                              marginTop: "2px",
                            }}
                          />
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
        <section
          id="demo"
          style={{ background: CREAM_2, padding: "78px 24px" }}
        >
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div
              style={{
                textAlign: "center",
                maxWidth: "600px",
                margin: "0 auto 36px",
              }}
            >
              <Eyebrow>Experimente agora</Eyebrow>
              <SectionTitle>
                Veja uma resposta da sua clínica — de graça
              </SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "15px", margin: 0 }}>
                Escolha uma situação e veja como ficaria. Gostou? É só criar a
                conta e usar no atendimento real.
              </p>
            </div>

            <Suspense
              fallback={<LoadingRespostas etapas={["Carregando a demo…"]} />}
            >
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
              <p
                style={{
                  fontSize: "15px",
                  color: INK,
                  lineHeight: 1.6,
                  margin: "0 0 18px",
                  fontWeight: 600,
                }}
              >
                Esta é a demonstração. Crie sua conta grátis pra usar no
                WhatsApp de verdade.
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
              <p
                style={{ fontSize: "12px", color: INK_SOFT, marginTop: "10px" }}
              >
                Start R$97/mês · sem cartão pra testar · cancele quando quiser
              </p>
              <div style={{ maxWidth: "430px", margin: "10px auto 0" }}>
                <LegalConsentLinks />
              </div>
            </div>
          </div>
        </section>

        {/* ── PREÇOS ───────────────────────────────────────────────────────── */}
        <section id="precos" style={{ background: NAVY, padding: "84px 24px" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <Eyebrow onNavy>Escolha o seu plano</Eyebrow>
              <SectionTitle onNavy>
                Comece pelo plano que resolve hoje
              </SectionTitle>
              <p
                style={{
                  color: "rgba(251,246,236,0.7)",
                  fontSize: "16px",
                  maxWidth: "540px",
                  margin: "0 auto",
                }}
              >
                Teste grátis e assine só se fizer sentido pra sua rotina.
              </p>
            </div>
            <PricingSection />
          </div>
        </section>

        {/* ── CONFIANÇA ────────────────────────────────────────────────────── */}
        <section style={{ padding: "78px 24px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div
              style={{
                textAlign: "center",
                maxWidth: "620px",
                margin: "0 auto 36px",
              }}
            >
              <Eyebrow>Por que confiar</Eyebrow>
              <SectionTitle>
                Feito pra estética brasileira — não é ChatGPT genérico
              </SectionTitle>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              {[
                {
                  icon: <ShieldCheck size={20} />,
                  t: "Respeita as regras",
                  c: "Nunca promete resultado, cura ou preço fixo. Suas respostas saem dentro do que pode.",
                },
                {
                  icon: <MessageCircle size={20} />,
                  t: "No seu tom",
                  c: "Você define o jeito da clínica. As respostas saem com cara de gente, não de robô.",
                },
                {
                  icon: <Lock size={20} />,
                  t: "Seus dados protegidos",
                  c: "Cada conta vê só os próprios dados. Pagamento seguro via Stripe.",
                },
                {
                  icon: <Clock size={20} />,
                  t: "Risco zero pra testar",
                  c: "Sem cartão pra começar e cancele quando quiser, sem multa.",
                },
              ].map((s) => (
                <div
                  key={s.t}
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(16,35,59,0.07)",
                    borderRadius: "16px",
                    padding: "22px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      color: GOLD_DEEP,
                      marginBottom: "12px",
                    }}
                  >
                    {s.icon}
                  </span>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: INK,
                      margin: "0 0 6px",
                    }}
                  >
                    {s.t}
                  </h3>
                  <p
                    style={{
                      fontSize: "13.5px",
                      lineHeight: 1.6,
                      color: INK_SOFT,
                      margin: 0,
                    }}
                  >
                    {s.c}
                  </p>
                </div>
              ))}
            </div>

            {DEPOIMENTOS.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "16px",
                  marginTop: "20px",
                }}
              >
                {DEPOIMENTOS.map((d) => (
                  <figure
                    key={d.nome}
                    style={{
                      background: CREAM_2,
                      borderRadius: "16px",
                      padding: "22px",
                      margin: 0,
                    }}
                  >
                    <blockquote
                      style={{
                        margin: "0 0 12px",
                        fontSize: "14.5px",
                        lineHeight: 1.6,
                        color: INK,
                      }}
                    >
                      “{d.texto}”
                    </blockquote>
                    <figcaption style={{ fontSize: "13px", color: INK_SOFT }}>
                      <strong style={{ color: INK }}>{d.nome}</strong> ·{" "}
                      {d.clinica}
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
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <Eyebrow>Dúvidas frequentes</Eyebrow>
              <SectionTitle>Antes de começar</SectionTitle>
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              {[
                {
                  q: "Tem risco de banir meu WhatsApp?",
                  a: "Não 🙂 Ele não envia nada sozinho nem se conecta no seu WhatsApp. Só escreve a resposta — você lê, ajusta e cola na conversa. Seu número fica seguro.",
                },
                {
                  q: "É um robô que responde sozinho?",
                  a: "Não. Quem responde é você. A IA só te entrega o texto pronto e você decide o que mandar. O controle é todo seu.",
                },
                {
                  q: "Serve pra público masculino também?",
                  a: "Sim. Botox masculino, barba, sobrancelha, queda capilar, skincare… o tom se ajusta pra cada cliente, homem ou mulher.",
                },
                {
                  q: "Funciona no celular?",
                  a: "Sim! No celular, tablet ou computador, direto no navegador. Dá pra gerar a resposta e colar no WhatsApp na mesma tela.",
                },
                {
                  q: "Preciso de cartão pra testar?",
                  a: "Não. Testa de graça e só assina o Start (R$97/mês) se curtir.",
                },
                {
                  q: "Como cancelo?",
                  a: "Pelo painel, quando quiser. Sem multa e sem ligação.",
                },
              ].map((item, i) => (
                <details
                  key={item.q}
                  open={i === 0}
                  style={{
                    borderRadius: "14px",
                    border: "1px solid rgba(16,35,59,0.1)",
                    background: "#ffffff",
                    overflow: "hidden",
                  }}
                >
                  <summary
                    style={{
                      padding: "18px 22px",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "15px",
                      color: INK,
                    }}
                  >
                    {item.q}
                  </summary>
                  <p
                    style={{
                      padding: "0 22px 20px",
                      fontSize: "14px",
                      color: INK_SOFT,
                      lineHeight: 1.7,
                      margin: 0,
                      borderTop: "1px solid rgba(16,35,59,0.06)",
                      paddingTop: "14px",
                    }}
                  >
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
        <section style={{ background: NAVY, padding: "84px 24px" }}>
          <div
            style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}
          >
            <LogoMark size={42} stroke={GOLD} />
            <h2
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 700,
                color: "#FBF6EC",
                margin: "18px 0 14px",
                lineHeight: 1.12,
              }}
            >
              Sua próxima cliente não vai esperar
            </h2>
            <p
              style={{
                color: "rgba(251,246,236,0.72)",
                fontSize: "16px",
                lineHeight: 1.7,
                margin: "0 auto 28px",
                maxWidth: "520px",
              }}
            >
              Toda semana mais gente pergunta o preço e some. Não é falta de
              talento — é falta da resposta certa na hora certa.
            </p>
            <Link
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
            </Link>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(251,246,236,0.5)",
                marginTop: "14px",
              }}
            >
              Sem cartão · cancele quando quiser
            </p>
          </div>
        </section>
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
          <p
            style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: INK }}
          >
            Start R$97
            <span
              style={{ fontSize: "12px", fontWeight: 400, color: INK_SOFT }}
            >
              /mês
            </span>
          </p>
          <p style={{ margin: 0, fontSize: "11px", color: INK_SOFT }}>
            Teste grátis, sem cartão
          </p>
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
