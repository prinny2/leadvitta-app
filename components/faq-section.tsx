const FAQS = [
  {
    q: "Tem risco de banir meu WhatsApp?",
    a: "Não 🙂 Ele não envia nada sozinho nem se conecta no seu WhatsApp. Só escreve a resposta — você lê, ajusta se quiser e cola na conversa. Seu número fica seguro.",
  },
  {
    q: "É um robô que responde sozinho?",
    a: "Não. Quem responde é você. A IA só te entrega o texto pronto e você decide o que mandar. O controle é todo seu.",
  },
  {
    q: "As respostas parecem robóticas?",
    a: "Que nada. Você escolhe o tom da sua clínica e as respostas saem com cara de gente, do seu jeitinho.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim! No celular, tablet ou computador, direto no navegador. Dá pra gerar a resposta e colar no WhatsApp na mesma tela.",
  },
  {
    q: "Serve pra quais procedimentos?",
    a: "Botox, preenchimento, harmonização, laser, limpeza de pele, bioestimulador e muito mais. E você ainda ajusta tudo pro jeito da sua clínica.",
  },
  {
    q: "Meus dados ficam seguros?",
    a: "Ficam. Cada conta vê só os próprios dados e tudo é protegido por login.",
  },
  {
    q: "Preciso de cartão pra testar?",
    a: "Não. Testa de graça e só assina o Start (R$97/mês) se curtir.",
  },
  {
    q: "Demora pra configurar?",
    a: "Poucos minutos. Você cria a conta, conta um pouquinho sobre a clínica e já começa a gerar respostas.",
  },
  {
    q: "Como cancelo?",
    a: "Pelo painel, quando quiser. Sem multa e sem ligação.",
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
