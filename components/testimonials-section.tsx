"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    text: "Eu sempre soube que perdia clientes no WhatsApp, mas achava que era falta de talento pra venda. Não era. Era falta de resposta mais clara. Com o LeadBellus, passei a ter opções melhores para responder orçamento, objeção e cliente que sumiu.",
    name: "Camila Rocha",
    role: "Harmonizadora Facial · São Paulo, SP",
    initials: "CR",
    image: "/CAMILA.png",
  },
  {
    text: "Minha maior dificuldade era retomar uma conversa sem parecer insistente. Eu sabia que estava deixando oportunidades para trás, mas nunca encontrava a mensagem certa. O LeadBellus organizou esse processo e deixou o atendimento muito mais natural.",
    name: "Dra. Renata Oliveira",
    role: "Biomédica Esteta · Curitiba, PR",
    initials: "RO",
    image: "/RENATA.png",
  },
  {
    text: "Tenho uma equipe pequena e cada pessoa respondia de um jeito diferente. Isso deixava o atendimento confuso e dificultava acompanhar os contatos. Depois que configuramos o tom da clínica e os roteiros, a comunicação ficou mais padronizada, sem perder o nosso jeito de falar.",
    name: "Mariana Castro",
    role: "Gestora de Clínica Estética · Recife, PE",
    initials: "MC",
    image: "/MARIANA.png",
  },
  {
    text: "Trabalho sozinha e respondia tudo manualmente entre procedimentos. Era exaustivo. Hoje abro o LeadBellus, colo a mensagem, escolho uma opção de resposta e sigo a conversa com mais segurança.",
    name: "Dra. Patrícia Mendes",
    role: "Biomédica Esteta · Belo Horizonte, MG",
    initials: "PM",
    image: "/PATRICIA%20MENDES.png",
  },
  {
    text: "Eu recebia muitos pedidos de orçamento pelo Instagram, mas várias conversas morriam logo depois que eu informava o valor. Com o LeadBellus, comecei a conduzir melhor cada atendimento e parei de responder tudo de forma automática. Hoje consigo explicar valor, lidar com objeções e levar a cliente até o próximo passo com mais segurança.",
    name: "Juliana Azevedo",
    role: "Esteticista e proprietária · Campinas, SP",
    initials: "JA",
    image: "/JULIANA%20AZEVEDO.png",
  },
  {
    text: "Tenho uma recepcionista que ama o trabalho mas tinha dificuldade para conduzir conversa de venda. Configurei o tom da clínica com ela e ensinei a usar os roteiros e a biblioteca de objeções. Ficou mais fácil delegar sem perder o nosso jeito de atender.",
    name: "Fernanda Lopes",
    role: "Gestora de Clínica Estética · Uberlândia, MG",
    initials: "FL",
    image: "/FERNANDA.png",
  },
];

const col1 = testimonials.slice(0, 2);
const col2 = testimonials.slice(2, 4);
const col3 = testimonials.slice(4, 6);

function TestimonialCard({ text, name, role, initials, image }: {
  text: string;
  name: string;
  role: string;
  initials: string;
  image?: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1.5px solid #E8E4DC",
        borderRadius: "20px",
        padding: "28px 24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        maxWidth: "340px",
        width: "100%",
      }}
    >
      {/* Stars */}
      <div style={{ display: "flex", gap: "2px", marginBottom: "14px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="#C9A060">
            <path d="M7 1l1.545 3.13 3.455.502-2.5 2.437.59 3.44L7 8.885l-3.09 1.624.59-3.44L2 4.632l3.455-.502L7 1z" />
          </svg>
        ))}
      </div>
      <p
        style={{
          fontSize: "14px",
          color: "#374151",
          lineHeight: 1.75,
          fontStyle: "italic",
          marginBottom: "20px",
        }}
      >
        &ldquo;{text}&rdquo;
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {image ? (
          <Image
            src={image}
            alt={name}
            width={40}
            height={40}
            style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C9A060, #92610A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "14px",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        )}
        <div>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#0A1628", margin: 0, lineHeight: 1.3 }}>{name}</p>
          <p style={{ fontSize: "12px", color: "#C9A060", fontWeight: 600, margin: 0, lineHeight: 1.4 }}>{role}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsColumn({ items, duration = 18, reverse = false }: {
  items: typeof testimonials;
  duration?: number;
  reverse?: boolean;
}) {
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
            {items.map((t) => (
              <TestimonialCard key={`${pass}-${t.name}`} {...t} />
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
      id="depoimentos"
      style={{ background: "#F5F0E6", padding: "96px 24px", overflow: "hidden" }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid #C9A060",
              color: "#C9A060",
              borderRadius: "9999px",
              padding: "4px 14px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            ✦ Situações comuns
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
            O que muda quando você começa a responder do jeito certo
          </h2>
          <p style={{ color: "#4a5568", fontSize: "16px", margin: 0 }}>
            Situações comuns de profissionais de estética. Veja o tipo de problema que o LeadBellus ajuda a resolver.
          </p>
        </div>

        {/* Columns */}
        <div
          className="testimonials-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            maxHeight: "600px",
            overflow: "hidden",
            maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <TestimonialsColumn items={col1} duration={16} />
          <TestimonialsColumn items={col2} duration={20} reverse />
          <TestimonialsColumn items={col3} duration={14} />
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .testimonials-grid {
            grid-template-columns: 1fr !important;
          }
          .testimonials-grid > div:nth-child(2),
          .testimonials-grid > div:nth-child(3) {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
