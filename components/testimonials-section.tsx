"use client";

import React from "react";
import { motion } from "framer-motion";
import { useShouldReduce } from "@/components/motion-gate";

const situations = [
  {
    title: "Perguntou o preço e sumiu",
    context:
      "A cliente pede valor pelo WhatsApp, recebe uma resposta seca e para de responder.",
    support:
      "O LeadBellus ajuda a explicar o valor antes de falar só de preço, com opções curtas no tom da clínica.",
  },
  {
    title: "Achou caro",
    context:
      "A pessoa compara com outro orçamento e você precisa responder sem parecer defensiva.",
    support:
      "Você recebe caminhos para acolher a objeção, reforçar diferenciais e chamar para o próximo passo.",
  },
  {
    title: "Cliente interessada, mas insegura",
    context:
      "Ela quer fazer o procedimento, mas tem medo de dor, resultado artificial ou arrependimento.",
    support:
      "A resposta sai mais cuidadosa, explicando processo, avaliação e acompanhamento sem prometer resultado.",
  },
  {
    title: "Recepção respondendo de jeitos diferentes",
    context:
      "Cada pessoa da equipe escreve de um jeito, e o atendimento perde padrão.",
    support:
      "A clínica configura seu tom e usa respostas como base para manter consistência sem virar robô.",
  },
  {
    title: "Domingo à noite no WhatsApp",
    context:
      "Você vê mensagem fora do horário e sente que, se demorar, pode perder a oportunidade.",
    support:
      "A ferramenta organiza a resposta mais rápido para você revisar, copiar e mandar quando fizer sentido.",
  },
  {
    title: "Follow-up que parece cobrança",
    context:
      "Você quer retomar quem sumiu, mas não quer soar insistente ou desesperada.",
    support:
      "O LeadBellus sugere retomadas em etapas, com mensagens naturais e menos pressão.",
  },
];

const columns = [
  situations.slice(0, 2),
  situations.slice(2, 4),
  situations.slice(4, 6),
];

function SituationCard({
  title,
  context,
  support,
}: {
  title: string;
  context: string;
  support: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1.5px solid #E8E4DC",
        borderRadius: "20px",
        padding: "26px 24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        maxWidth: "340px",
        width: "100%",
      }}
    >
      <p
        style={{
          display: "inline-flex",
          border: "1px solid rgba(201,160,96,0.35)",
          borderRadius: "9999px",
          color: "#92610A",
          fontSize: "10px",
          fontWeight: 800,
          letterSpacing: "0.08em",
          margin: "0 0 14px",
          padding: "4px 10px",
          textTransform: "uppercase",
        }}
      >
        Situação comum
      </p>
      <h3
        style={{
          color: "#0A1628",
          fontFamily: "var(--font-fraunces, Georgia, serif)",
          fontSize: "22px",
          fontWeight: 700,
          lineHeight: 1.2,
          margin: "0 0 14px",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "#4a5568",
          fontSize: "14px",
          lineHeight: 1.7,
          margin: "0 0 16px",
        }}
      >
        {context}
      </p>
      <div
        style={{
          background: "rgba(201,160,96,0.08)",
          border: "1px solid rgba(201,160,96,0.18)",
          borderRadius: "14px",
          padding: "12px 14px",
        }}
      >
        <p
          style={{
            color: "#0A1628",
            fontSize: "13px",
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {support}
        </p>
      </div>
    </div>
  );
}

function SituationsColumn({
  items,
  duration = 18,
  reverse = false,
}: {
  items: typeof situations;
  duration?: number;
  reverse?: boolean;
}) {
  const reduce = useShouldReduce();
  if (reduce) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {items.map((item) => (
          <SituationCard key={item.title} {...item} />
        ))}
      </div>
    );
  }
  return (
    <div style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: "20px" }}>
      <motion.div
        animate={{ translateY: reverse ? "0%" : "-50%" }}
        initial={{ translateY: reverse ? "-50%" : "0%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        style={{ display: "flex", flexDirection: "column", gap: "20px", paddingBottom: "20px" }}
      >
        {[0, 1].map((pass) => (
          <React.Fragment key={pass}>
            {items.map((item) => (
              <SituationCard key={`${pass}-${item.title}`} {...item} />
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section
      id="situacoes"
      style={{ background: "#F5F0E6", padding: "96px 24px", overflow: "hidden" }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid #C9A060",
              color: "#92610A",
              borderRadius: "9999px",
              padding: "4px 14px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            Situações comuns do atendimento
          </div>
          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              color: "#0A1628",
              margin: "0 0 12px",
            }}
          >
            Onde a conversa costuma quebrar
          </h2>
          <p style={{ color: "#4a5568", fontSize: "16px", margin: 0 }}>
            Em vez de prova social fabricada, aqui estão cenários comuns que o LeadBellus ajuda a responder melhor.
          </p>
        </div>

        <div
          className="situations-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            maxHeight: "620px",
            overflow: "hidden",
            maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <SituationsColumn items={columns[0]} duration={18} />
          <SituationsColumn items={columns[1]} duration={22} reverse />
          <SituationsColumn items={columns[2]} duration={16} />
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .situations-grid {
            grid-template-columns: 1fr !important;
          }
          .situations-grid > div:nth-child(2),
          .situations-grid > div:nth-child(3) {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
