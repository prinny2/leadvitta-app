const FAQS = [
  {
    q: "Tem risco de banir meu WhatsApp?",
    a: "Não. O LeadBellus não se conecta ao seu WhatsApp e não envia nada sozinho. Ele só gera o texto da resposta — você copia e cola na conversa, do seu jeito. Nada de automação que coloca seu número em risco.",
  },
  {
    q: "É um chatbot que responde no automático?",
    a: "Não. É um co-piloto: a IA escreve, você revisa e envia. Quem fala com a cliente continua sendo você ou a sua secretária — com controle total sobre cada mensagem.",
  },
  {
    q: "As respostas parecem robóticas?",
    a: "Não. Você define o tom da clínica (acolhedor, premium, direto…) e revisa antes de copiar. As respostas saem com cara de gente, no estilo da sua clínica.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim. O LeadBellus roda direto no navegador do celular, do tablet ou do computador — sem instalar app. Dá para gerar a resposta e colar no WhatsApp na mesma tela.",
  },
  {
    q: "Funciona para quais procedimentos?",
    a: "Botox, preenchimento, harmonização, laser, limpeza de pele, bioestimulador e outros atendimentos estéticos. Você também pode personalizar pelo DNA da sua clínica.",
  },
  {
    q: "Meus dados e os das clientes ficam seguros?",
    a: "Sim. Cada conta enxerga só os próprios dados, o acesso é protegido por login e nada é compartilhado entre clínicas.",
  },
  {
    q: "Preciso de cartão para testar?",
    a: "Não. Você cria a conta e ganha respostas grátis para testar no atendimento real. Só assina o Start (R$97/mês) se fizer sentido para a sua rotina.",
  },
  {
    q: "Demora para configurar?",
    a: "O cadastro e o DNA da Clínica levam poucos minutos. Depois você já pode gerar respostas.",
  },
  {
    q: "Como cancelo?",
    a: "Pelo painel, sem multa e sem ligação.",
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
