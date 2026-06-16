import Link from "next/link";
import { Suspense } from "react";
import { Check, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { billingPlanList } from "@/lib/billing";
import { PlanCTA } from "@/components/plan-cta";
import { WaitlistForm } from "@/components/waitlist-form";
import { LandingWhatsAppDemo } from "@/components/landing-whatsapp-demo";
import { LoadingRespostas } from "@/components/loading-respostas";
import { HeroDevices } from "@/components/hero-devices";

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
function TagPill({ children }: { children: React.ReactNode }) {
  return (
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
        {/* Logo */}
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

        {/* Center links — hidden on small */}
        <div
          className="hidden md:flex"
          style={{ gap: "32px", alignItems: "center" }}
        >
          {["Recursos", "Como funciona", "Preços"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: "14px",
                textDecoration: "none",
              }}
              className="hover:text-[#C9A060] transition-colors"
            >
              {l}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/login"
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "14px",
              textDecoration: "none",
            }}
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
          position: "relative",
          overflow: "hidden",
          minHeight: "calc(100vh - 102px)",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        {/* Glow orbs */}
        <div style={{ position: "absolute", top: "-100px", left: "-80px", width: "550px", height: "550px", background: "radial-gradient(circle, rgba(201,160,96,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: "500px", height: "500px", background: "radial-gradient(circle, rgba(201,160,96,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Full-width flex — no max-width so right column bleeds to viewport edge */}
        <div className="hero-flex" style={{ display: "flex", alignItems: "center", width: "100%", minHeight: "inherit" }}>

          {/* Left — text, aligned with nav content */}
          <div
            className="hero-text"
            style={{
              flexShrink: 0,
              width: "min(500px, 42vw)",
              paddingLeft: "max(24px, calc((100vw - 1152px) / 2 + 24px))",
              paddingRight: "40px",
              paddingTop: "60px",
              paddingBottom: "60px",
            }}
          >
            <TagPill>
              ↘ Clínicas perdem em média R$8 mil/mês respondendo errado no WhatsApp
            </TagPill>

            <h1
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(40px, 4.5vw, 68px)",
                fontWeight: 700,
                lineHeight: 1.05,
                margin: "0 0 24px",
                letterSpacing: "-0.02em",
              }}
            >
              Ela sumiu.
              <br />
              E não foi
              <br />
              <span style={{ color: "#C9A060" }}>pelo preço.</span>
            </h1>

            <p
              style={{
                fontSize: "17px",
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.72)",
                margin: "0 0 36px",
              }}
            >
              Foi a resposta que não criou valor nenhum. O LeadBellus te dá a
              resposta certa — pronta pra copiar e colar — antes que a cliente
              esfrie. No seu tom, sem parecer robô.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}>
              <Link
                href={funilHref}
                style={{
                  background: "#C9A060",
                  color: "#07101e",
                  borderRadius: "9999px",
                  padding: "15px 30px",
                  fontSize: "15px",
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                Ver minha resposta em 1 min →
              </Link>
              <a
                href="#demo"
                style={{
                  border: "1.5px solid rgba(201,160,96,0.5)",
                  color: "#C9A060",
                  borderRadius: "9999px",
                  padding: "15px 28px",
                  fontSize: "15px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Ver demo ↓
              </a>
            </div>

            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)", marginBottom: "36px" }}>
              Sem cartão pra testar · Pronto no celular · Feito para clínicas de estética
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                { icon: "💬", label: "Respostas estratégicas" },
                { icon: "🔄", label: "Follow-ups" },
                { icon: "🛡️", label: "Objeções" },
                { icon: "🧠", label: "Lead Intelligence" },
              ].map((f) => (
                <div
                  key={f.label}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(201,160,96,0.15)",
                    borderRadius: "9999px",
                    padding: "7px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>{f.icon}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — devices fill the rest of the viewport */}
          <div
            className="hero-devices-col"
            style={{
              flex: 1,
              alignSelf: "stretch",
              position: "relative",
              overflow: "hidden",
              minHeight: "520px",
            }}
          >
            <HeroDevices />
          </div>
        </div>

        <style>{`
          @media (max-width: 860px) {
            .hero-flex { flex-direction: column !important; min-height: auto !important; }
            .hero-text { width: 100% !important; padding: 48px 24px 32px !important; }
            .hero-devices-col { width: 100% !important; min-height: 420px !important; }
          }
        `}</style>
      </section>

      {/* ── DEMO ─────────────────────────────────────────────────────────────── */}
      <section id="demo" style={{ background: "#07101e", padding: "0 24px 80px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: 600,
                color: "#ffffff",
                margin: "0 0 12px",
              }}
            >
              Veja a diferença em 30 segundos
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px" }}>
              Coloque o nome e o tom da sua clínica e veja a resposta mudar — sem login.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              {[
                { id: "preco", label: "Perguntou preço" },
                { id: "achou_caro", label: "Achou caro" },
                { id: "sumiu", label: "Sumiu" },
                { id: "medo", label: "Medo do procedimento" },
              ].map((d) => (
                <Link
                  key={d.id}
                  href={`/?demo=${d.id}#demo`}
                  style={{
                    border: "1px solid rgba(201,160,96,0.4)",
                    color: "#C9A060",
                    borderRadius: "9999px",
                    padding: "6px 16px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                    background: "rgba(201,160,96,0.07)",
                  }}
                >
                  {d.label}
                </Link>
              ))}
            </div>
          </div>
          <Suspense fallback={<LoadingRespostas etapas={["Carregando a demo…"]} />}>
            <LandingWhatsAppDemo />
          </Suspense>
        </div>
      </section>

      {/* ── PROBLEM ──────────────────────────────────────────────────────────── */}
      <section
        id="recursos"
        style={{
          background: "#F5F0E6",
          padding: "96px 24px",
        }}
      >
        <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <TagPill>Onde o dinheiro vaza</TagPill>
            <h2
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(30px, 4vw, 42px)",
                fontWeight: 700,
                color: "#0A1628",
                maxWidth: "600px",
                margin: "0 auto 20px",
                lineHeight: 1.2,
              }}
            >
              Ela queria agendar. A conversa morreu no meio do caminho.
            </h2>
            <p
              style={{
                color: "#4a5568",
                fontSize: "16px",
                maxWidth: "520px",
                margin: "0 auto 28px",
                lineHeight: 1.7,
              }}
            >
              Na estética, a venda se perde quando a resposta não cria valor,
              não acolhe e não conduz. Cada conversa travada pode ser um
              procedimento a menos na sua agenda.
            </p>
            {/* Chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
              {["Cria valor antes do preço", "Fala no tom da sua clínica", "Conduz para avaliação"].map((chip) => (
                <span
                  key={chip}
                  style={{
                    border: "1px solid #C9A060",
                    color: "#92610A",
                    borderRadius: "9999px",
                    padding: "6px 16px",
                    fontSize: "12px",
                    fontWeight: 700,
                    background: "rgba(201,160,96,0.1)",
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "64px",
            }}
          >
            {[
              {
                stat: "R$8.000",
                label: "média perdida por mês em clínicas de estética",
              },
              {
                stat: "67%",
                label: "das clientes que perguntam preço e somem voltariam com a resposta certa",
              },
              {
                stat: "3min",
                label: "é o tempo médio que uma cliente espera antes de ir buscar outra opção",
              },
            ].map((card) => (
              <div
                key={card.stat}
                style={{
                  background: "#0A1628",
                  borderRadius: "20px",
                  padding: "32px 28px",
                  color: "#ffffff",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-fraunces, Georgia, serif)",
                    fontSize: "48px",
                    fontWeight: 700,
                    color: "#C9A060",
                    margin: "0 0 12px",
                    lineHeight: 1,
                  }}
                >
                  {card.stat}
                </p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                  {card.label}
                </p>
              </div>
            ))}
          </div>

          {/* Before / After inline */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Before */}
            <div
              style={{
                background: "#fff0f0",
                border: "1.5px solid #fca5a5",
                borderRadius: "20px",
                padding: "28px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  borderRadius: "9999px",
                  padding: "4px 12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  marginBottom: "16px",
                }}
              >
                ✕ Resposta que afasta
              </div>
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  marginBottom: "16px",
                  fontStyle: "italic",
                  fontSize: "15px",
                  color: "#374151",
                  borderLeft: "3px solid #fca5a5",
                }}
              >
                "Botox é R$900."
              </div>
              <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6 }}>
                A cliente sente que é só mais um número. Compara com a mais barata. Some.
              </p>
            </div>

            {/* After */}
            <div
              style={{
                background: "#0f1b2f",
                border: "1.5px solid #C9A060",
                borderRadius: "20px",
                padding: "28px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(201,160,96,0.15)",
                  color: "#C9A060",
                  borderRadius: "9999px",
                  padding: "4px 12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  marginBottom: "16px",
                }}
              >
                ✓ Resposta que agenda
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1.65,
                  borderLeft: "3px solid #C9A060",
                }}
              >
                "Oi, Ana! O valor do botox varia conforme os pontos necessários pra atingir o seu objetivo — suavizar linhas da testa, pés de galinha ou prevenir marquinhas. Cada rosto é único. O que você acha de fazermos uma avaliação rápida pra eu te orientar direitinho?"
              </div>
              <p style={{ fontSize: "13px", color: "#C9A060", fontWeight: 600 }}>
                Resultado: acolhe, gera autoridade e conduz pra avaliação sem falar de preço.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER (full dark section) ───────────────────────────────── */}
      <section
        id="exemplo"
        style={{
          background: "#07101e",
          padding: "96px 24px",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <TagPill>
            <Sparkles size={12} /> Exemplo prático
          </TagPill>
          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 16px",
              lineHeight: 1.15,
            }}
          >
            A diferença entre responder e conduzir.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", marginBottom: "48px" }}>
            Uma resposta joga preço. A outra gera valor, acolhe e aumenta a
            chance de agendamento.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              marginBottom: "40px",
              textAlign: "left",
            }}
          >
            {/* LEFT: bad */}
            <div
              style={{
                background: "#fff0f0",
                borderRadius: "20px",
                padding: "32px",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#b91c1c",
                  letterSpacing: "0.08em",
                  marginBottom: "20px",
                }}
              >
                ✕ RESPOSTA QUE FAZ A CLIENTE SUMIR
              </p>
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #fca5a5",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  fontSize: "15px",
                  color: "#374151",
                  fontStyle: "italic",
                  marginBottom: "16px",
                }}
              >
                "Botox é R$900."
              </div>
              <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.65 }}>
                A cliente sente que é só mais um número. Compara com a mais barata. Some. Venda perdida.
              </p>
            </div>

            {/* RIGHT: good */}
            <div
              style={{
                background: "#0f1b2f",
                border: "2px solid #C9A060",
                borderRadius: "20px",
                padding: "32px",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#C9A060",
                  letterSpacing: "0.08em",
                  marginBottom: "16px",
                }}
              >
                ✓ RESPOSTA QUE AGENDA
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <LogoMark size={24} />
                <span style={{ fontSize: "13px", color: "#C9A060", fontWeight: 600 }}>LeadBellus</span>
              </div>
              <div
                style={{
                  background: "rgba(201,160,96,0.08)",
                  border: "1px solid rgba(201,160,96,0.25)",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1.7,
                  marginBottom: "16px",
                }}
              >
                "Oi, Ana! O valor do botox varia conforme os pontos necessários pra atingir o seu objetivo..."
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#C9A060",
                  background: "rgba(201,160,96,0.1)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontWeight: 600,
                }}
              >
                Resultado: acolhe, gera autoridade e conduz pra avaliação sem falar de preço.
              </p>
            </div>
          </div>

          <Link
            href={funilHref}
            style={{
              display: "block",
              background: "#C9A060",
              color: "#07101e",
              borderRadius: "16px",
              padding: "18px 32px",
              fontSize: "16px",
              fontWeight: 700,
              textDecoration: "none",
              marginBottom: "16px",
            }}
          >
            Quero a resposta certa pra cada situação →
          </Link>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
            7 dias grátis · Sem cartão · Você usa hoje mesmo
          </p>
        </div>
      </section>

      {/* ── LEAD INTELLIGENCE ────────────────────────────────────────────────── */}
      <section
        style={{
          background: "#07101e",
          padding: "0 24px 96px",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div
            style={{
              background: "#0f1b2f",
              border: "1px solid rgba(201,160,96,0.25)",
              borderRadius: "24px",
              padding: "56px 40px",
              textAlign: "center",
            }}
          >
            <TagPill>
              <Sparkles size={12} /> Exclusivo · Já disponível no Pro
            </TagPill>
            <h2
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 auto 20px",
                maxWidth: "680px",
                lineHeight: 1.15,
              }}
            >
              Cole a mensagem da cliente.{" "}
              <span style={{ color: "#C9A060" }}>Receba o raio-x completo dela.</span>
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: "16px",
                maxWidth: "540px",
                margin: "0 auto 40px",
                lineHeight: 1.7,
              }}
            >
              Não é só saber se ela está quente ou fria. Em segundos, o
              LeadBellus te entrega três coisas:
            </p>

            {/* 3 bullets */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                maxWidth: "540px",
                margin: "0 auto 48px",
                textAlign: "left",
              }}
            >
              {[
                {
                  title: "Score de conversão",
                  desc: "a probabilidade real dela fechar, em número.",
                },
                {
                  title: "Perfil psicológico",
                  desc: "como ela decide, o que trava ela, o que destrava.",
                },
                {
                  title: "Estratégia exata",
                  desc: "o caminho específico pra fechar aquela cliente, não um conselho genérico.",
                },
              ].map((b) => (
                <div key={b.title} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "rgba(201,160,96,0.2)",
                      border: "1px solid #C9A060",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    <Check size={12} color="#C9A060" />
                  </span>
                  <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                    <strong style={{ color: "#ffffff" }}>{b.title}</strong> — {b.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Temperature cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
                marginBottom: "36px",
              }}
            >
              {[
                {
                  emoji: "🔥",
                  pct: "92%",
                  msg: '"Posso pagar no cartão? Tem horário amanhã?"',
                  desc: "Decisora rápida, sensível a urgência. Estratégia: oferecer horário ainda hoje.",
                  borderColor: "#f97316",
                },
                {
                  emoji: "☀️",
                  pct: "54%",
                  msg: '"Vou pensar e te falo..."',
                  desc: "Precisa de segurança, não de pressão. Estratégia: reforçar prova social, não desconto.",
                  borderColor: "#C9A060",
                },
                {
                  emoji: "❄️",
                  pct: "18%",
                  msg: "Sumiu depois do orçamento",
                  desc: "Esfriou por falta de follow-up. Estratégia: mensagem de reativação em 48h.",
                  borderColor: "#60a5fa",
                },
              ].map((card) => (
                <div
                  key={card.pct}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${card.borderColor}33`,
                    borderLeft: `3px solid ${card.borderColor}`,
                    borderRadius: "14px",
                    padding: "20px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "20px" }}>{card.emoji}</span>
                    <span
                      style={{
                        fontFamily: "var(--font-fraunces, Georgia, serif)",
                        fontSize: "24px",
                        fontWeight: 700,
                        color: card.borderColor,
                      }}
                    >
                      {card.pct}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontStyle: "italic", marginBottom: "8px" }}>
                    {card.msg}
                  </p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "28px" }}>
              🔒 Em breve no Premium — Agendamento Autônomo e Acompanhamento Pós-Consulta
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
              Ver minha lead mais quente agora →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "#07101e",
          padding: "0 24px 96px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 0 16px",
              }}
            >
              O que você nunca mais vai travar pra responder
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px" }}>
              Menos improviso, menos texto frio, mais conversa que anda pra frente:
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              "Nunca mais trave quando perguntarem o preço — resposta que cria valor antes do número.",
              "Quebre o \"tá caro\" sem brigar no desconto — reposicione sem desvalorizar seu trabalho.",
              "Traga de volta quem sumiu, sem parecer desesperada — follow-up com progressão psicológica.",
              "Conduza qualquer conversa até o agendamento — scripts completos do \"oi\" ao horário marcado.",
              "Botox, harmonização, preenchimento — a resposta certa pra cada um — o LeadBellus conhece o procedimento que você oferece.",
              "Tudo que funcionou, salvo e pronto pra repetir — histórico organizado por situação.",
            ].map((feat, i) => (
              <div
                key={i}
                style={{
                  background: "#0f1b2f",
                  border: "1px solid rgba(201,160,96,0.15)",
                  borderRadius: "18px",
                  padding: "24px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "rgba(201,160,96,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Check size={14} color="#C9A060" />
                </span>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.65 }}>
                  {feat}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section
        id="como-funciona"
        style={{
          background: "#F5F0E6",
          padding: "96px 24px",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <LogoMark size={36} />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              color: "#0A1628",
              margin: "0 0 12px",
              lineHeight: 1.2,
            }}
          >
            Configure <em>uma vez</em>. Use <em>pra sempre</em>.
          </h2>
          <p style={{ color: "#4a5568", fontSize: "16px", marginBottom: "0" }}>
            A resposta certa em menos de 2 minutos.
          </p>

          <GoldDivider />

          {/* Step cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              textAlign: "left",
            }}
          >
            {[
              {
                num: "01",
                title: "Ensine o sistema a falar como você",
                time: "5 minutos — só na primeira vez",
                body: "Nome da clínica, tom de voz, como você chama suas clientes, qual é o seu CTA. O LeadBellus cria o DNA da sua clínica — todas as respostas saem com a sua personalidade. Não parece IA. Parece você num dia perfeito.",
              },
              {
                num: "02",
                title: "Cole a mensagem e selecione a situação",
                time: null,
                body: "Perguntou preço. Achou caro. Sumiu. Medo do procedimento. Veio do Instagram. Em segundos o sistema entende o contexto e sabe o que precisa ser dito.",
              },
              {
                num: "03",
                title: "Escolha a resposta, copie e mande",
                time: null,
                body: "Três versões — suave, consultiva e de fechamento. Você escolhe a que faz mais sentido, clica em Copiar e manda direto no WhatsApp. Pronto.",
              },
            ].map((step, i) => (
              <div key={step.num} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                {i > 0 && (
                  <div
                    className="hidden md:flex"
                    style={{
                      position: "absolute",
                      marginLeft: "-30px",
                      marginTop: "14px",
                      color: "#C9A060",
                      fontSize: "20px",
                    }}
                  />
                )}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #E8E4DC",
                    borderRadius: "20px",
                    padding: "28px 24px",
                    flex: 1,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#C9A060",
                      color: "#07101e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "14px",
                      marginBottom: "16px",
                    }}
                  >
                    {step.num}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-fraunces, Georgia, serif)",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#0A1628",
                      margin: "0 0 8px",
                    }}
                  >
                    {step.title}
                  </h3>
                  {step.time && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#C9A060",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        marginBottom: "10px",
                      }}
                    >
                      {step.time}
                    </p>
                  )}
                  <p style={{ fontSize: "14px", color: "#4a5568", lineHeight: 1.7 }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ─────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "#07101e",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <TagPill>Quem já testou</TagPill>
          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(24px, 3vw, 36px)",
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 40px",
            }}
          >
            Profissionais de estética já estão respondendo diferente
          </h2>

          <div
            style={{
              background: "#0f1b2f",
              border: "1px solid rgba(201,160,96,0.25)",
              borderRadius: "20px",
              padding: "36px 32px",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "20px",
                left: "28px",
                fontSize: "48px",
                color: "rgba(201,160,96,0.25)",
                fontFamily: "Georgia, serif",
                lineHeight: 1,
              }}
            >
              "
            </span>
            <p
              style={{
                fontSize: "17px",
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.75,
                fontStyle: "italic",
                margin: "0 0 20px",
                paddingTop: "16px",
              }}
            >
              Testei no período de lançamento. Em uma semana já vi diferença em como as clientes respondiam de volta.
            </p>
            <p style={{ fontSize: "13px", color: "#C9A060", fontWeight: 600 }}>
              Beta tester, harmonizadora facial (SP)
            </p>
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────────── */}
      <section
        id="preços"
        style={{
          background: "#07101e",
          padding: "0 24px 96px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 16px",
            }}
          >
            Uma cliente recuperada já paga o mês inteiro
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", marginBottom: "56px" }}>
            Se uma única cliente que ia sumir fechar um procedimento, o plano
            já se pagou — e sobra.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              alignItems: "start",
            }}
          >
            {billingPlanList.map((plano) => {
              const isHighlighted = plano.destaque;
              return (
                <div
                  key={plano.id}
                  style={{
                    background: isHighlighted ? "#0f1b2f" : "#0a1220",
                    border: isHighlighted ? "2px solid #C9A060" : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "24px",
                    padding: "36px 28px",
                    position: "relative",
                    transition: "transform 0.15s",
                  }}
                >
                  {plano.selo && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-14px",
                        right: "20px",
                        background: plano.disponivel ? "#22c55e" : "rgba(201,160,96,0.9)",
                        color: plano.disponivel ? "#ffffff" : "#07101e",
                        borderRadius: "9999px",
                        padding: "4px 14px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {plano.disponivel ? "Disponível agora" : plano.selo}
                    </span>
                  )}

                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>
                    Plano {plano.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-fraunces, Georgia, serif)",
                      fontSize: "48px",
                      fontWeight: 700,
                      color: isHighlighted ? "#C9A060" : "#ffffff",
                      margin: "0 0 4px",
                      lineHeight: 1,
                    }}
                  >
                    {plano.priceLabel}
                    <span style={{ fontSize: "16px", fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>
                      {plano.periodLabel}
                    </span>
                  </p>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", marginBottom: "24px" }}>
                    {plano.tagline}
                  </p>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", textAlign: "left" }}>
                    {plano.features.map((f) => (
                      <li
                        key={f}
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                          marginBottom: "10px",
                          fontSize: "13px",
                          color: "rgba(255,255,255,0.75)",
                          lineHeight: 1.5,
                        }}
                      >
                        <Check size={14} color="#C9A060" style={{ flexShrink: 0, marginTop: "2px" }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {plano.disponivel ? (
                    <>
                      <PlanCTA
                        plan={plano.id}
                        className="w-full block text-center font-bold text-sm rounded-xl py-3 px-5 mb-3 bg-[#C9A060] text-[#07101e] border-0"
                      >
                        Quero o {plano.label} →
                      </PlanCTA>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
                        Com garantia de 7 dias — sem risco.
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#C9A060",
                          fontWeight: 600,
                          marginBottom: "12px",
                          textAlign: "left",
                        }}
                      >
                        Entrar na fila de prioridade →
                      </p>
                      <WaitlistForm plan={plano.id} className="" />
                      {plano.id === "pro" && (
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "10px" }}>
                          Quem já é Start entra na frente.
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <p style={{ marginTop: "28px", fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>
            Planos mensais, cancela quando quiser.
          </p>
        </div>
      </section>

      {/* ── GUARANTEE ────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "#F5F0E6",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            background: "#ffffff",
            border: "2px solid #E8E4DC",
            borderRadius: "24px",
            padding: "48px 36px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <ShieldCheck size={48} color="#C9A060" style={{ margin: "0 auto 20px" }} />
          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "28px",
              fontWeight: 700,
              color: "#0A1628",
              margin: "0 0 16px",
            }}
          >
            Garantia de 7 dias, sem letra miúda
          </h2>
          <p style={{ fontSize: "15px", color: "#4a5568", lineHeight: 1.75 }}>
            Teste o LeadBellus por 7 dias. Se você não sentir que está respondendo melhor e
            perdendo menos cliente, é só pedir o cancelamento — devolvemos 100% do valor, sem perguntas.
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "#07101e",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(24px, 3vw, 36px)",
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              margin: "0 0 48px",
            }}
          >
            Perguntas frequentes
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              {
                q: "Preciso instalar alguma coisa no meu WhatsApp?",
                a: "Não. O LeadBellus funciona pelo navegador — no celular ou computador. Você recebe a mensagem no WhatsApp, abre o LeadBellus, pega a resposta e cola. Zero instalação, zero integração complicada.",
              },
              {
                q: "As respostas vão parecer robóticas?",
                a: "Não. O LeadBellus usa o DNA da sua clínica — tom de voz, como você chama suas clientes, seu estilo. Quanto mais você usa, mais parece você.",
              },
              {
                q: "Funciona pra qualquer procedimento?",
                a: "Sim. Botox, harmonização, preenchimento, skincare, fios, bichectomia — o sistema conhece os principais procedimentos do mercado estético e adapta a resposta ao que você oferece.",
              },
              {
                q: "E se a cliente fizer uma pergunta difícil, tipo \"dói?\" ou \"tem desconto?\"",
                a: "Essas são exatamente as situações que o LeadBellus foi feito pra resolver. Temos respostas específicas pra objeções de medo, preço e comparação com concorrentes.",
              },
              {
                q: "Posso cancelar quando quiser?",
                a: "Sim. Sem multa, sem burocracia. Você cancela com um clique e não é cobrada no mês seguinte.",
              },
              {
                q: "O LeadBellus segue as regras de publicidade da estética?",
                a: "Sim. As respostas nunca prometem resultado garantido, não fixam preço sem avaliação e sempre direcionam pra uma avaliação profissional — seguindo as boas práticas do setor. Você fica tranquila e em conformidade.",
              },
            ].map((item) => (
              <details
                key={item.q}
                style={{
                  background: "#0f1b2f",
                  border: "1px solid rgba(201,160,96,0.15)",
                  borderRadius: "14px",
                  padding: "0",
                  overflow: "hidden",
                }}
              >
                <summary
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    padding: "18px 22px",
                    cursor: "pointer",
                    listStyle: "none",
                    fontWeight: 600,
                    fontSize: "15px",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  {item.q}
                  <span style={{ color: "#C9A060", flexShrink: 0, fontSize: "20px" }}>+</span>
                </summary>
                <p
                  style={{
                    padding: "0 22px 18px",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "#07101e",
          padding: "80px 24px 100px",
          textAlign: "center",
          borderTop: "1px solid rgba(201,160,96,0.15)",
        }}
      >
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(26px, 4vw, 42px)",
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 16px",
              lineHeight: 1.2,
            }}
          >
            Sua próxima conversa pode virar agenda —{" "}
            <span style={{ color: "#C9A060" }}>ou pode ser a próxima que some.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", marginBottom: "36px", lineHeight: 1.7 }}>
            Teste no seu ritmo, no celular, e veja como a conversa muda quando
            a resposta já nasce com valor, acolhimento e CTA.
          </p>
          <Link
            href={funilHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "#C9A060",
              color: "#07101e",
              borderRadius: "16px",
              padding: "20px 40px",
              fontSize: "17px",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Teste grátis agora e agende mais em minutos <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: "#050d17",
          borderTop: "1px solid rgba(201,160,96,0.12)",
          padding: "48px 24px 32px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "32px",
            marginBottom: "32px",
          }}
        >
          {/* Brand */}
          <div style={{ minWidth: "200px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <LogoMark size={24} />
              <span
                style={{
                  fontFamily: "var(--font-fraunces, Georgia, serif)",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                LeadBellus
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, maxWidth: "220px" }}>
              Conversão para clínicas de estética — responda melhor e agende mais pelo WhatsApp.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: "12px", letterSpacing: "0.08em" }}>
                PRODUTO
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: "Termos de Uso", href: "/termos" },
                  { label: "Privacidade", href: "/privacidade" },
                ].map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <GoldDivider />

        <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
          © 2026 LeadBellus · ResonAnza Inova Simples I S · Vinicius Paes da Serra Freire (MEI)
        </p>
      </footer>
    </div>
  );
}
