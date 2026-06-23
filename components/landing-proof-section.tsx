import { MessageSquareQuote, ShieldCheck, WalletCards } from "lucide-react";

const CASES = [
  {
    title: "Preço com contexto",
    context:
      "A cliente pede valor no WhatsApp, mas ainda não entendeu indicação, naturalidade ou avaliação.",
    shift:
      "Em vez de resposta seca, a clínica ganha opções que acolhem, explicam e puxam o próximo passo sem fixar preço fora de contexto.",
  },
  {
    title: "Objeção sem desconto automático",
    context:
      "A conversa esquenta, a pessoa compara com outro orçamento e a recepção precisa sustentar valor sem endurecer o tom.",
    shift:
      "O LeadBellus organiza respostas mais consultivas para defender diferenciais, reduzir atrito e manter a conversa elegante.",
  },
  {
    title: "Follow-up sem parecer cobrança",
    context:
      "A lead sumiu depois do interesse inicial e a equipe quer retomar sem soar insistente ou desesperada.",
    shift:
      "A retomada sai com mais tato, CTA claro e linguagem alinhada ao posicionamento premium da clínica.",
  },
];

const TRUST_POINTS = [
  {
    title: "Demo pública sem cartão",
    copy: "A landing libera 5 respostas grátis para validar o tom antes de qualquer cobrança.",
    icon: WalletCards,
  },
  {
    title: "Cobrança segura e cancelamento claro",
    copy: "Quando a clínica decide continuar, o Start segue com checkout via Stripe e cancelamento pelo painel.",
    icon: ShieldCheck,
  },
  {
    title: "Copy com guardrails de compliance",
    copy: "As respostas evitam promessa de resultado, diagnóstico e preço fixo quando o caso depende de avaliação.",
    icon: MessageSquareQuote,
  },
];

export function LandingProofSection() {
  return (
    <section id="prova" style={{ background: "#F6F0E6", padding: "88px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto 38px", textAlign: "center" }}>
          <span className="landing-eyebrow landing-eyebrow-light">Prova na prática</span>
          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              color: "#07101e",
              margin: "0 0 14px",
              lineHeight: 1.16,
            }}
          >
            Casos comuns do WhatsApp estético, com resposta mais segura
          </h2>
          <p style={{ color: "#475569", fontSize: "16px", lineHeight: 1.7, margin: 0 }}>
            Sem inventar depoimento: aqui estão contextos reais da rotina comercial que o
            Start ajuda a conduzir com mais padrão, clareza e percepção premium.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {CASES.map((item) => (
            <article key={item.title} className="landing-surface-card">
              <p className="landing-mini-label">Caso de uso</p>
              <h3
                style={{
                  color: "#07101e",
                  fontSize: "20px",
                  fontWeight: 700,
                  margin: "0 0 12px",
                  fontFamily: "var(--font-fraunces, Georgia, serif)",
                }}
              >
                {item.title}
              </h3>
              <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.7, margin: "0 0 14px" }}>
                {item.context}
              </p>
              <div className="landing-soft-panel">
                <strong style={{ display: "block", color: "#7A5108", fontSize: "12px", marginBottom: "6px" }}>
                  O que muda com o LeadBellus
                </strong>
                <p style={{ color: "#334155", fontSize: "13px", lineHeight: 1.65, margin: 0 }}>
                  {item.shift}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
          }}
        >
          {TRUST_POINTS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="landing-dark-card">
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    background: "rgba(201,160,96,0.12)",
                    border: "1px solid rgba(201,160,96,0.18)",
                    color: "#D9B66D",
                    marginBottom: "12px",
                  }}
                >
                  <Icon size={18} />
                </div>
                <h3 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: "16px", fontWeight: 700 }}>
                  {item.title}
                </h3>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.68)", fontSize: "13px", lineHeight: 1.65 }}>
                  {item.copy}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
