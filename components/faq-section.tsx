"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "As respostas vão soar robóticas?",
    a: "Não — esse é exatamente o ponto. O DNA da Clínica aprende o seu tom, como você chama as clientes e o seu CTA preferido. O resultado parece você escrevendo num dia muito bom. As clientes não percebem que foi uma ferramenta — percebem que você responde bem.",
  },
  {
    q: "Qual é a diferença real entre os três planos?",
    a: "O Start te dá o arsenal completo de resposta manual — você nunca mais fica em branco. O Pro adiciona inteligência de diagnóstico (Lead Intelligence) e um chatbot que qualifica leads e prepara o terreno, mas você ainda confirma o agendamento. O Premium fecha o ciclo: o agendamento acontece sozinho, sem você precisar entrar na conversa.",
  },
  {
    q: "O chatbot do Pro realmente substitui uma recepcionista?",
    a: "Em grande parte, sim. Ele atende, responde dúvidas, quebra objeções e conduz a lead até o momento de fechar — o único passo que ainda é seu é a confirmação final do agendamento. No Premium, até esse último passo é automatizado.",
  },
  {
    q: "O agendamento autônomo do Premium já funciona?",
    a: "O núcleo do sistema (todas as funções de geração de resposta, Lead Intelligence, chatbot semi-autônomo, lembretes e pós-consulta) funciona hoje. O agendamento 100% autônomo está em desenvolvimento e será lançado em breve. Quem assinar o Premium agora entra no preço de lançamento e recebe acesso assim que sair.",
  },
  {
    q: "Funciona pra qualquer procedimento estético?",
    a: "Sim. O LeadBellus foi construído especificamente pro mercado estético brasileiro. Conhece botox, harmonização facial, preenchimento, bioestimulador, laser, microagulhamento, limpeza de pele, drenagem linfática e muito mais. Não é um ChatGPT genérico — é especializado no seu nicho.",
  },
  {
    q: "Preciso de muito tempo pra configurar?",
    a: "O setup inicial (DNA da Clínica) leva menos de 5 minutos. Depois disso você já está usando. A maioria das pessoas gera a primeira resposta em menos de 2 minutos após o cadastro.",
  },
  {
    q: "Qual a diferença do LeadBellus pra usar o ChatGPT direto?",
    a: `O ChatGPT não conhece a jornada psicológica da cliente de estética no Brasil. Não sabe que "vou pensar" é objeção de preço disfarçada. Não sabe quando usar autoridade ao invés de acolhimento. Não tem DNA da Clínica, não tem histórico, não tem Lead Intelligence, não tem chatbot integrado ao WhatsApp.`,
  },
  {
    q: "Se eu não gostar, como cancelo?",
    a: "Pelo próprio painel, em um clique. Sem ligar pra ninguém, sem formulário, sem prazo de aviso. Cancela hoje, não cobra mais amanhã.",
  },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{
          borderColor: open ? "rgba(201,160,96,0.45)" : "rgba(201,160,96,0.15)",
          background: open ? "#111c2f" : "#0f1b2f",
        }}
        transition={{ duration: 0.25 }}
        style={{
          borderRadius: "14px",
          overflow: "hidden",
          border: "1px solid rgba(201,160,96,0.15)",
        }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            padding: "18px 22px",
            cursor: "pointer",
            background: "transparent",
            border: "none",
            textAlign: "left",
            fontWeight: 600,
            fontSize: "15px",
            color: open ? "#ffffff" : "rgba(255,255,255,0.9)",
          }}
          aria-expanded={open}
        >
          <span>{q}</span>
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              color: "#C9A060",
              flexShrink: 0,
              fontSize: "22px",
              lineHeight: 1,
              display: "inline-block",
              fontWeight: 300,
            }}
          >
            +
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="answer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
            >
              <p
                style={{
                  padding: "0 22px 20px",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.75,
                  margin: 0,
                  borderTop: "1px solid rgba(201,160,96,0.1)",
                  paddingTop: "16px",
                }}
              >
                {a}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export function FaqSection() {
  return (
    <section id="faq" style={{ background: "#07101e", padding: "96px 24px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "inline-block", marginBottom: "16px" }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                border: "1px solid rgba(201,160,96,0.35)",
                color: "#C9A060",
                borderRadius: "9999px",
                padding: "5px 14px",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                background: "rgba(201,160,96,0.07)",
              }}
            >
              Dúvidas frequentes
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(24px, 3.5vw, 38px)",
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
            }}
          >
            Perguntas que a gente sabe que você tem
          </motion.h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {FAQS.map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
