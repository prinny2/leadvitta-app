export const FAQS = [
  {
    q: "As respostas parecem robóticas?",
    a: "Não. Você define o tom da clínica e revisa antes de copiar para o WhatsApp.",
  },
  {
    q: "Qual é a diferença entre a demo e o Start?",
    a: "A demo pública libera 5 respostas grátis para testar. O Start é o plano pago para usar o gerador na rotina real da clínica, sem depender do limite da landing.",
  },
  {
    q: "O app promete resultado ou preço fixo?",
    a: "Não. As respostas seguem guardrails para evitar promessa de resultado, diagnóstico e preço fechado quando o caso depende de avaliação.",
  },
  {
    q: "Funciona para quais procedimentos?",
    a: "Botox, preenchimento, harmonização, laser, limpeza de pele e outros atendimentos estéticos em que o WhatsApp participa da conversa comercial.",
  },
  {
    q: "Demora para configurar?",
    a: "O cadastro e o DNA da clínica levam poucos minutos. Depois disso, você já consegue gerar respostas no seu tom de atendimento.",
  },
  {
    q: "Como funciona cobrança, cancelamento e reembolso?",
    a: "A demo é sem cartão. Quando você assina o Start, a cobrança é processada pela Stripe. O cancelamento é pelo painel e eventuais pedidos de análise seguem a política de reembolso publicada no site.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" style={{ background: "#07101e", padding: "88px 24px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "42px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              border: "1px solid rgba(201,160,96,0.35)",
              color: "#C9A060",
              borderRadius: "9999px",
              padding: "5px 14px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              background: "rgba(201,160,96,0.07)",
              marginBottom: "16px",
            }}
          >
            Dúvidas frequentes
          </span>

          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(24px, 3.5vw, 38px)",
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
            }}
          >
            Antes de começar
          </h2>
        </div>

        <div style={{ display: "grid", gap: "10px" }}>
          {FAQS.map((item, index) => (
            <details
              key={item.q}
              open={index === 0}
              style={{
                borderRadius: "14px",
                border: "1px solid rgba(201,160,96,0.15)",
                background: "#0f1b2f",
                overflow: "hidden",
              }}
            >
              <summary
                style={{
                  padding: "18px 22px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {item.q}
              </summary>
              <p
                style={{
                  padding: "0 22px 20px",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.7,
                  margin: 0,
                  borderTop: "1px solid rgba(201,160,96,0.1)",
                  paddingTop: "16px",
                }}
              >
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
