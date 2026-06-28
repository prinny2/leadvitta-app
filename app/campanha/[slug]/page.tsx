import Link from "next/link";
import { HeroDevices } from "@/components/hero-devices";
import { HeroTextContent } from "@/components/hero-text-content";
import { PricingSection } from "@/components/pricing-section";

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
        x1="40"
        y1="32"
        x2="40"
        y2="86"
        stroke="#C9A060"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="40" cy="27" r="5.5" fill="#C9A060" />
    </svg>
  );
}

// ─── Section tag pill ──────────────────────────────────────────────────────────
function TagPill({
  children,
  light,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginLeft: "auto",
          }}
        >
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
            Começar Grátis
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
      Oferta de lançamento: teste 5 respostas grátis e veja se o Start encaixa
      na rotina.
    </div>
  );
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CampaignPage({ params }: Props) {
  await params;

  const campaignHeadline = (
    <>
      Clientes de estética
      <br />
      não somem pelo preço.
      <br />
      <span style={{ color: "#C9A060" }}>Somem pela resposta errada.</span>
    </>
  );

  const campaignSubtitle =
    "O LeadBellus transforma mensagens do WhatsApp em opções de resposta no tom da sua clínica para lidar melhor com objeções e conduzir a conversa. É só escolher, copiar e mandar.";

  const campaignBullets = [
    "Chega de 'vou ver e aviso': Tenha respostas prontas no WhatsApp para quebrar a objeção de preço com naturalidade.",
    "Retome quem sumiu: mensagens prontas para voltar à conversa sem parecer insistente.",
    "No tom da sua clínica: respostas adaptadas ao seu jeito de atender, prontas para revisar, copiar e mandar.",
  ];

  return (
    <div
      style={{
        fontFamily: "var(--font-inter, system-ui, sans-serif)",
        background: "#07101e",
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <LaunchBanner />

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

        <div
          style={{ maxWidth: "1152px", margin: "0 auto", position: "relative" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "420px 1fr",
              gap: "40px",
              alignItems: "flex-start",
            }}
            className="hero-grid"
          >
            {/* Left — custom copy (animado) */}
            <HeroTextContent
              headline={campaignHeadline}
              subtitle={campaignSubtitle}
              bullets={campaignBullets}
              ctaHref="/signup?plan=start"
              ctaText="Gerar 5 respostas grátis"
              hideSimuladorLink={true}
            />

            {/* Right — animated device mockups */}
            <div
              className="hero-devices-container"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                paddingTop: "48px",
              }}
            >
              <HeroDevices />
            </div>
          </div>
        </div>
      </section>

      {/* ── PREÇOS ───────────────────────────────────────────────────────────── */}
      <section
        id="precos"
        style={{
          background: "#07101e",
          color: "#ffffff",
          padding: "96px 24px",
          position: "relative",
          overflow: "hidden",
          borderTop: "1px solid rgba(201,160,96,0.15)",
        }}
      >
        <div
          style={{ maxWidth: "1152px", margin: "0 auto", position: "relative" }}
        >
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
              Uma conversa recuperada pode pagar o investimento
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "16px",
                maxWidth: "560px",
                margin: "0 auto",
              }}
            >
              Se uma conversa que antes esfriaria virar agendamento, o Start já
              pode fazer sentido financeiro. O LeadBellus ajuda na resposta, mas
              não garante faturamento.
            </p>
          </div>

          <PricingSection ctaHref="/signup?plan=start" />
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "#040a14",
          color: "rgba(255,255,255,0.45)",
          padding: "48px 24px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          textAlign: "center",
          fontSize: "14px",
        }}
      >
        <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
          <p style={{ margin: "0 0 12px" }}>
            © {new Date().getFullYear()} LeadBellus. Todos os direitos
            reservados.
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "rgba(255,255,255,0.25)",
            }}
          >
            LeadBellus — MEI Vinícius Paes da Serra Freire · CNPJ sob consulta.
          </p>
        </div>
      </footer>

      {/* Espaço pra barra fixa não cobrir o rodapé (só mobile) */}
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
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            R$97
            <span
              style={{
                fontSize: "12px",
                fontWeight: 400,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              /mês
            </span>
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            5 respostas grátis · sem cartão
          </p>
        </div>
        <Link
          href="/signup?plan=start"
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

      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
          .hero-devices-container {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
