const MODULES = [
  {
    num: "01",
    icon: "🎯",
    title: "Gerador de Respostas",
    desc: "Cola a mensagem, escolhe a situação e recebe 3 versões: Suave, Consultiva e Fechamento. É só copiar e colar.",
    benefit: "Agilidade que encanta.",
    plans: ["START", "PRO", "PREMIUM"],
  },
  {
    num: "02",
    icon: "🧠",
    title: "Lead Intelligence",
    desc: "Score de conversão + perfil psicológico + estratégia exata por lead. Saiba quem está quase fechando.",
    benefit: "Resposta certa no momento certo.",
    plans: ["PRO", "PREMIUM"],
  },
  {
    num: "03",
    icon: "💬",
    title: "Biblioteca de Objeções",
    desc: '"Está caro", "vou pensar", "na outra é mais barato" — cada objeção com a resposta que acolhe e conduz.',
    benefit: "Transforme objeções em oportunidades.",
    plans: ["START", "PRO", "PREMIUM"],
  },
  {
    num: "04",
    icon: "🔄",
    title: "Follow-up Inteligente",
    desc: "Reativa quem sumiu com progressão psicológica: suave → direta → última tentativa.",
    benefit: "Mais retornos, menos esforço.",
    plans: ["START", "PRO", "PREMIUM"],
  },
  {
    num: "05",
    icon: "📋",
    title: "Scripts de Atendimento",
    desc: "Fluxos de 4–5 mensagens com timing exato, do primeiro \"oi\" ao agendamento.",
    benefit: "Padronização que gera resultados.",
    plans: ["START", "PRO", "PREMIUM"],
  },
  {
    num: "06",
    icon: "🧬",
    title: "DNA da Clínica",
    desc: "Configura uma vez e toda resposta sai com o seu tom, CTA e procedimentos. Parece você.",
    benefit: "Sua essência em cada mensagem.",
    plans: ["START", "PRO", "PREMIUM"],
  },
  {
    num: "07",
    icon: "🗂️",
    title: "Histórico e Favoritos",
    desc: "Suas melhores respostas salvas, favoritadas e prontas pra reusar. Não comece do zero.",
    benefit: "Organização que economiza tempo.",
    plans: ["START", "PRO", "PREMIUM"],
  },
  {
    num: "08",
    icon: "📲",
    title: "Chatbot WhatsApp",
    desc: "Conecta ao seu WhatsApp Business e atende, qualifica e faz follow-up automático, 24h por dia.",
    benefit: "Mais agendamentos no piloto automático.",
    plans: ["PRO", "PREMIUM"],
  },
  {
    num: "09",
    icon: "📅",
    title: "Agendamento Autônomo",
    desc: "O bot conduz o interessado até o agendamento fechado, sem intermediário humano.",
    benefit: "A clínica no piloto automático.",
    plans: ["PREMIUM"],
  },
  {
    num: "10",
    icon: "⏰",
    title: "Lembrete Pré-consulta",
    desc: "Confirmação 24h antes + orientações personalizadas por procedimento. Zero falta.",
    benefit: "Mais presença, menos remarcações.",
    plans: ["PRO", "PREMIUM"],
  },
  {
    num: "11",
    icon: "💚",
    title: "Gestão Pós-consulta",
    desc: "Acompanhamento automático após o procedimento — fideliza, gera indicação e recompra.",
    benefit: "Mais fidelização e recorrência.",
    plans: ["PRO", "PREMIUM"],
  },
];

const VALUE_STRIP = [
  { icon: "⚡", title: "Mais agilidade", desc: "Respostas prontas e automações que economizam seu tempo." },
  { icon: "🎯", title: "Mais conversão", desc: "Estratégias certeiras que transformam conversas em agendamentos." },
  { icon: "🛡️", title: "Mais consistência", desc: "Qualidade previsível em todos os atendimentos." },
  { icon: "⭐", title: "Mais experiência", desc: "Atendimento humanizado em cada ponto de contato." },
  { icon: "📈", title: "Mais resultado", desc: "Mais vendas e crescimento sustentável pra sua clínica." },
];

export function FuncoesSection() {
  return (
    <section id="funcoes" style={{ background: "#FBF7EE", color: "#16202F" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "96px 32px" }}>
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "#9A7B3C",
            }}
          >
            As funções do LeadBellus
          </div>
          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontWeight: 800,
              fontSize: "clamp(32px, 4.2vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "-.02em",
              margin: "18px auto 0",
              maxWidth: "20ch",
            }}
          >
            Cada situação do WhatsApp —{" "}
            <span style={{ color: "#9A7B3C", fontStyle: "italic" }}>resolvida</span>
          </h2>
          <p
            style={{
              fontSize: "17px",
              lineHeight: 1.6,
              color: "#5E6373",
              maxWidth: "680px",
              margin: "20px auto 0",
            }}
          >
            Não é um ChatGPT genérico. Cada módulo foi treinado nas situações reais da jornada de compra de uma cliente de estética brasileira.
          </p>
        </div>

        {/* Módulos grid */}
        <div className="funcoes-mod-grid" style={{ marginTop: "52px" }}>
          {MODULES.map((m) => (
            <div
              key={m.num}
              style={{
                background: "#fff",
                border: "1px solid #EAE0CC",
                borderRadius: "18px",
                padding: "24px",
                boxShadow: "0 10px 30px rgba(20,15,5,.04)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontFamily: "var(--font-fraunces, Georgia, serif)",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#9A7B3C",
                    border: "1px solid rgba(189,162,105,.45)",
                    borderRadius: "8px",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {m.num}
                </span>
                <span style={{ fontSize: "20px" }}>{m.icon}</span>
              </div>

              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  margin: "16px 0 8px",
                  lineHeight: 1.25,
                  color: "#16202F",
                }}
              >
                {m.title}
              </h3>

              <p
                style={{
                  fontSize: "13.5px",
                  lineHeight: 1.55,
                  color: "#5E6373",
                  margin: "0 0 14px",
                  flex: 1,
                }}
              >
                {m.desc}
              </p>

              <div
                style={{
                  fontSize: "12.5px",
                  fontWeight: 700,
                  color: "#9A7B3C",
                  marginBottom: "12px",
                }}
              >
                {m.benefit}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {m.plans.map((pl) => (
                  <span
                    key={pl}
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 800,
                      letterSpacing: ".05em",
                      padding: "4px 9px",
                      borderRadius: "99px",
                      background: "rgba(189,162,105,.16)",
                      color: "#8A6A2E",
                    }}
                  >
                    {pl}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Value strip */}
        <div
          className="funcoes-val-grid"
          style={{
            background: "#fff",
            border: "1px solid #EAE0CC",
            borderRadius: "22px",
            padding: "34px",
            marginTop: "36px",
            boxShadow: "0 14px 40px rgba(20,15,5,.05)",
          }}
        >
          {VALUE_STRIP.map((v) => (
            <div key={v.title} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "1px solid rgba(189,162,105,.4)",
                  background: "rgba(189,162,105,.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  fontSize: "20px",
                }}
              >
                {v.icon}
              </div>
              <div
                style={{
                  fontSize: "14.5px",
                  fontWeight: 800,
                  color: "#9A7B3C",
                  margin: "14px 0 6px",
                }}
              >
                {v.title}
              </div>
              <p style={{ fontSize: "12.5px", lineHeight: 1.5, color: "#5E6373", margin: 0 }}>
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .funcoes-mod-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        .funcoes-val-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }
        @media (max-width: 1000px) {
          .funcoes-mod-grid { grid-template-columns: repeat(2, 1fr); }
          .funcoes-val-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .funcoes-mod-grid { grid-template-columns: 1fr; }
          .funcoes-val-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
