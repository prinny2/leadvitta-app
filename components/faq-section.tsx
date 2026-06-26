"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "As respostas vão soar robóticas?",
    a: "Não — esse é exatamente o ponto. O DNA da Clínica aprende o seu tom, como você chama as clientes e o seu CTA preferido. O resultado parece você escrevendo num dia muito bom. As clientes não percebem que foi uma ferramenta — percebem que você responde bem.",
  },
  {
    q: "Qual é a diferença real entre os três planos?",
    a: "O Start te dá o arsenal completo de resposta manual. O Pro adiciona Lead Intelligence e um chatbot que qualifica leads, mas você ainda confirma o agendamento. O Premium fecha o ciclo: o agendamento acontece sozinho, sem você entrar na conversa.",
  },
  {
    q: "O chatbot do Pro realmente substitui uma recepcionista?",
    a: "Em grande parte, sim. Ele atende, responde dúvidas, quebra objeções e conduz a lead até o momento de fechar — o único passo que ainda é seu é a confirmação final. No Premium, até esse último passo é automatizado.",
  },
  {
    q: "O agendamento autônomo do Premium já funciona?",
    a: "O núcleo do sistema funciona hoje. O agendamento 100% autônomo está em desenvolvimento. Quem assinar o Premium agora entra no preço de lançamento e recebe acesso imediato assim que lançar.",
  },
  {
    q: "Funciona pra qualquer procedimento estético?",
    a: "Sim. Conhece botox, harmonização facial, preenchimento, bioestimulador, laser, microagulhamento, limpeza de pele, drenagem linfática e muito mais. Não é ChatGPT genérico — é especializado no seu nicho.",
  },
  {
    q: "Preciso de muito tempo pra configurar?",
    a: "O setup inicial leva menos de 5 minutos. A maioria gera a primeira resposta em menos de 2 minutos após o cadastro. Se você sabe usar o WhatsApp, você sabe usar o LeadBellus.",
  },
  {
    q: "Qual a diferença do LeadBellus pra usar o ChatGPT direto?",
    a: "O ChatGPT não conhece a jornada psicológica da cliente de estética no Brasil. Não sabe que \"vou pensar\" é objeção de preço disfarçada. Não tem DNA da Clínica, histórico, Lead Intelligence nem chatbot integrado ao WhatsApp. O LeadBellus faz tudo isso especializado pra esse nicho.",
  },
  {
    q: "Se eu não gostar, como cancelo?",
    a: "Pelo próprio painel, em um clique. Sem ligar pra ninguém, sem formulário, sem prazo de aviso. Cancela hoje, não cobra mais amanhã.",
  },
];

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #EAE0CC",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 6px 18px rgba(20,15,5,.03)",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "20px 24px",
          textAlign: "left",
          fontFamily: "inherit",
        }}
        aria-expanded={open}
      >
        <span style={{ fontSize: "15.5px", fontWeight: 700, color: "#16202F" }}>{q}</span>
        <span
          style={{
            flexShrink: 0,
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            border: "1px solid rgba(189,162,105,.5)",
            color: "#9A7B3C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: 700,
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform .25s ease",
          }}
        >
          +
        </span>
      </button>

      <div
        style={{
          maxHeight: open ? "600px" : "0px",
          overflow: "hidden",
          transition: "max-height .3s ease",
        }}
      >
        <div
          style={{
            padding: "0 24px 22px",
            fontSize: "14.5px",
            lineHeight: 1.65,
            color: "#5E6373",
          }}
        >
          {a}
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  return (
    <section id="faq" style={{ background: "#F5F0E6" }}>
      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "96px 32px" }}>
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
            Dúvidas frequentes
          </div>
          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontWeight: 800,
              fontSize: "clamp(30px, 4vw, 48px)",
              lineHeight: 1.12,
              letterSpacing: "-.02em",
              margin: "18px auto 0",
              maxWidth: "16ch",
              color: "#16202F",
            }}
          >
            Perguntas que a gente sabe que você tem
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "42px" }}>
          {FAQS.map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
