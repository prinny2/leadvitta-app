import Link from "next/link";
import {
  Brain,
  CopyCheck,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

const CARDS = [
  {
    title: "Respostas prontas",
    description:
      "Preço, medo, desconto, comparação e sumiço sem começar do zero.",
    icon: MessageSquare,
  },
  {
    title: "Tom da clínica",
    description:
      "A resposta sai consultiva, acolhedora ou objetiva, conforme seu jeito de atender.",
    icon: SlidersHorizontal,
  },
  {
    title: "Objeções com contexto",
    description:
      "Mostra valor sem brigar por preço nem parecer resposta copiada.",
    icon: ShieldCheck,
  },
  {
    title: "Retomadas",
    description: "Mensagens para voltar em leads paradas sem soar insistente.",
    icon: RefreshCw,
  },
  {
    title: "Lead Intelligence",
    description:
      "Ajuda a entender quando a conversa está quente e qual próximo passo faz sentido.",
    icon: Brain,
  },
  {
    title: "Copiar e mandar",
    description: "Você revisa, ajusta se quiser e cola direto no WhatsApp.",
    icon: CopyCheck,
  },
];

export function AppBenefitsSection({
  funilHref = "/signup",
}: {
  funilHref?: string;
}) {
  return (
    <section
      id="funcoes"
      style={{
        background: "#F5F0E6",
        padding: "88px 24px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}
      >
        <div style={{ textAlign: "center", marginBottom: "42px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              border: "1px solid #C9A060",
              borderRadius: "9999px",
              padding: "5px 16px",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "#92610A",
              textTransform: "uppercase",
              marginBottom: "18px",
              background: "rgba(201,160,96,0.08)",
            }}
          >
            O que o app faz
          </div>

          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              color: "#0A1628",
              margin: "0 0 14px",
              lineHeight: 1.18,
            }}
          >
            Menos improviso no WhatsApp.
            <br />
            Mais conversa conduzida.
          </h2>

          <p
            style={{
              fontSize: "15px",
              color: "#4a5568",
              maxWidth: "560px",
              margin: "0 auto",
              lineHeight: 1.65,
            }}
          >
            O LeadBellus organiza as respostas que sua equipe precisa todos os
            dias.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
          className="benefits-grid"
        >
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e8e4dc",
                  borderRadius: "14px",
                  padding: "22px 20px",
                  boxShadow: "0 2px 12px rgba(10,22,40,0.05)",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(201,160,96,0.12)",
                    display: "grid",
                    placeItems: "center",
                    color: "#92610A",
                    marginBottom: "14px",
                  }}
                >
                  <Icon size={22} strokeWidth={1.7} />
                </div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#0A1628",
                    margin: "0 0 7px",
                    fontFamily: "var(--font-fraunces, Georgia, serif)",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {card.description}
                </p>
              </article>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: "34px" }}>
          <Link
            href={funilHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#0A1628",
              color: "#C9A060",
              border: "1.5px solid rgba(201,160,96,0.3)",
              borderRadius: "9999px",
              padding: "14px 30px",
              fontSize: "15px",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Testar 5 respostas grátis
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .benefits-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .benefits-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
