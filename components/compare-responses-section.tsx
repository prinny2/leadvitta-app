"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── Data ────────────────────────────────────────────────────────────────────

const SCENARIOS = [
  {
    id: "preco",
    label: "Perguntou preço",
    bad1: {
      message: '"Botox é R$900."',
      explanation: "Resposta seca, focada só no preço. A cliente sente que é um número, não uma pessoa. Compara com a concorrente mais barata e some.",
    },
    bad2: {
      message: '"O valor varia, manda mensagem na semana que vem pra eu ver."',
      explanation: "Adia sem dar nenhuma informação. A cliente interpreta como desinteresse e já está pesquisando outra clínica.",
    },
    good1: {
      message: '"Oi, Ana! O investimento pode variar conforme os pontos avaliados e o objetivo do tratamento. Você busca suavizar as linhas da testa, pés de galinha ou prefere um resultado mais preventivo? Assim consigo te orientar melhor sobre o melhor caminho pra você. 💚"',
      explanation: "Acolhe, demonstra expertise, desvia do preço e conduz pra avaliação.",
    },
    good2: {
      message: '"Oi! O valor do botox depende de quantas áreas vamos tratar juntas. Me conta: você quer um resultado mais natural ou mais expressivo? Com isso já consigo te dar uma estimativa real e montar o melhor protocolo pra você. 😊"',
      explanation: "Personaliza sem revelar preço cedo. Cria diálogo e posiciona a profissional como especialista.",
    },
    score: 85,
    perfil: "Analítico · Cautelosa · Detalhista",
    perfilSub: "Busca segurança, provas e clareza.",
    estrategia: "Reforce autoridade, apresente resultados e conduza para o próximo passo.",
  },
  {
    id: "caro",
    label: "Achou caro",
    bad1: {
      message: '"Ah entendo, mas meu trabalho é diferente..."',
      explanation: "Modo defensivo, resposta genérica, não convence. A cliente já foi embora mentalmente.",
    },
    bad2: {
      message: '"É esse o valor mesmo, infelizmente não tem como diminuir."',
      explanation: "Fecha a negociação sem oferecer contexto. A cliente sente que foi descartada e vai buscar quem justifique melhor.",
    },
    good1: {
      message: '"Entendo, e faz todo sentido querer comparar! Preço mais baixo pode significar produto diluído, aplicador sem especialização ou sem garantia de retoque. No meu atendimento você tem [seu diferencial] e acompanhamento completo. Às vezes a diferença de R$200 evita uma correção de R$2.000 depois. Posso te mostrar o que está incluso?"',
      explanation: "Educa sem atacar a concorrente. Posiciona o valor real. A cliente vê o preço como investimento.",
    },
    good2: {
      message: '"Faz sentido! Quero te mostrar o que está dentro desse investimento: [lista rápida de diferenciais]. Além disso, ofereço retoque incluso e acompanhamento pós-procedimento. Quer que eu te mande um comparativo rápido do que está incluso?"',
      explanation: "Transforma o preço em percepção de valor. A cliente entende o que está comprando, não só o número.",
    },
    score: 72,
    perfil: "Econômica · Comparativa · Racional",
    perfilSub: "Precisa entender o custo-benefício antes de decidir.",
    estrategia: "Posicione valor, use âncoras de preço e mostre o risco do mais barato.",
  },
  {
    id: "pensar",
    label: "Vou pensar",
    bad1: {
      message: '"Ok, qualquer coisa me chama!"',
      explanation: 'A resposta "ok" encerra a conversa. A cliente pensa, esquece e nunca volta. Venda perdida por omissão.',
    },
    bad2: {
      message: '"Tudo bem! Quando decidir é só falar comigo 😊"',
      explanation: "Educada, mas passiva. Joga toda a responsabilidade pra cliente e não cria nenhum motivo pra ela agir agora.",
    },
    good1: {
      message: '"Claro, faz sentido! Só uma coisa: a agenda costuma fechar rápido e não quero que você perca a janela ideal. O que te impede de decidir agora? Às vezes consigo resolver uma dúvida que faz tudo ficar mais claro. 😊"',
      explanation: "Mantém o diálogo aberto, identifica a objeção real e cria senso de urgência sem pressionar.",
    },
    good2: {
      message: '"Claro! Só pra te ajudar a pensar: o que ainda ficou em aberto pra você? Se for dúvida sobre o procedimento, resultado ou valor — me fala que a gente resolve isso agora juntas. Não quero que você fique com dúvida. 💛"',
      explanation: "Acolhe a indecisão e convida a cliente a revelar a objeção real. Gera confiança ao invés de pressão.",
    },
    score: 61,
    perfil: "Indecisa · Reflexiva · Cautelosa",
    perfilSub: "Precisa de segurança antes de qualquer compromisso.",
    estrategia: "Identifique a objeção oculta e ofereça um próximo passo leve.",
  },
  {
    id: "sumiu",
    label: "Sumiu",
    bad1: {
      message: '"Oi, tudo bem? Ainda tem interesse?"',
      explanation: 'Follow-up genérico que parece cobrado. A cliente sente pressão, ignora ou responde "já resolvi".',
    },
    bad2: {
      message: '"Oi! Só passando pra saber se você ainda quer marcar 😊"',
      explanation: "Parece um lembrete de cobrador. A cliente que sumiu não precisa de pressão — precisa de um motivo pra voltar.",
    },
    good1: {
      message: '"Oi! Passando pra deixar uma coisa que pode te ajudar a decidir: [resultado real de uma cliente com o mesmo perfil]. Quando quiser retomar, é só falar — sem compromisso. 🌿"',
      explanation: "Retoma o contato com valor real, sem cobrar resposta. Reativa o interesse de forma natural.",
    },
    good2: {
      message: '"Oi! Sei que a vida corrida às vezes empurra as decisões pra depois. Só vim te lembrar que [procedimento] tem resultado cumulativo — quanto antes você começa, mais cedo você vê a diferença. Qualquer coisa, tô aqui! 💚"',
      explanation: "Cria contexto de urgência com cuidado genuíno. Não pressiona, mas planta a semente de agir logo.",
    },
    score: 55,
    perfil: "Dispersa · Ocupada · Indecisa",
    perfilSub: "Precisa de um motivo relevante para voltar à conversa.",
    estrategia: "Reengaje com prova social ou conteúdo de valor, sem pedir resposta direta.",
  },
  {
    id: "desconto",
    label: "Tem desconto?",
    bad1: {
      message: '"Não faço desconto, mas posso parcelar."',
      explanation: "Nega e fecha a conversa. A cliente sente que tentou e não conseguiu — vai embora sem agendamento.",
    },
    bad2: {
      message: '"Não trabalho com desconto, meu preço já é justo."',
      explanation: "Soa defensivo e arrogante. A cliente não se sente ouvida e vai buscar quem trate a dúvida com mais cuidado.",
    },
    good1: {
      message: '"Desconto no procedimento não faço, porque isso impactaria a qualidade que eu entrego. Mas o que posso fazer é montar um protocolo personalizado que entrega mais resultado com o mesmo investimento. Posso te mostrar como isso funciona?"',
      explanation: "Reposiciona a conversa do preço para o valor. A cliente entende que não é teimosia — é padrão de qualidade.",
    },
    good2: {
      message: '"Não trabalho com desconto porque não abro mão da qualidade do material que uso. Mas posso te ajudar a montar um pacote que caiba no seu orçamento e ainda entregue o resultado que você quer. Quer que eu monte uma sugestão pra você?"',
      explanation: "Mantém o posicionamento premium mas oferece flexibilidade real. A cliente sente que você está do lado dela.",
    },
    score: 68,
    perfil: "Orientada a preço · Direta · Objetiva",
    perfilSub: "Quer sentir que fez um bom negócio.",
    estrategia: "Defenda o preço com posicionamento de valor, nunca com negativa seca.",
  },
];

const BENEFITS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3L17.5 10.5L26 11.5L20 17.5L21.5 26L14 22L6.5 26L8 17.5L2 11.5L10.5 10.5L14 3Z" stroke="#C9A060" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Respostas que educam e encantam",
    text: "Transforme objeções em oportunidades com as palavras certas.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="#C9A060" strokeWidth="1.5"/>
        <path d="M14 8v6l4 2" stroke="#C9A060" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Condução estratégica que agenda",
    text: "Guias práticos para levar a conversa até o próximo passo com naturalidade.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4L5 10v8l9 6 9-6v-8L14 4z" stroke="#C9A060" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 14l-4-3m4 3l4-3m-4 3v6" stroke="#C9A060" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Mais confiança para sua equipe",
    text: "Padronize atendimentos e dê segurança para seu time vender mais.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <polyline points="4,20 10,13 15,17 24,8" stroke="#C9A060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="18,8 24,8 24,14" stroke="#C9A060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Resultado que você vê no caixa",
    text: "Menos perda de leads, mais agendamentos e tratamentos realizados.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function BadResponseCard({
  message,
  explanation,
  delay = 0,
}: {
  message: string;
  explanation: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(220,38,38,0.10)" }}
      style={{
        background: "#fff8f8",
        border: "1.5px solid #fca5a5",
        borderRadius: "20px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        cursor: "default",
        transition: "box-shadow 0.25s ease",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171", flexShrink: 0 }} />
        <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", color: "#ef4444", textTransform: "uppercase" }}>
          Resposta Comum
        </span>
      </div>

      {/* Message bubble */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #fca5a5",
          borderRadius: "12px",
          padding: "14px 16px",
          fontSize: "14px",
          color: "#374151",
          fontStyle: "italic",
          lineHeight: 1.6,
        }}
      >
        {message}
      </div>

      {/* Icon + badge */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect x="2" y="5" width="32" height="22" rx="6" stroke="#f87171" strokeWidth="1.5"/>
            <path d="M8 27l4-5h12l4 5" stroke="#f87171" strokeWidth="1.5" strokeLinejoin="round"/>
            <line x1="13" y1="12" x2="23" y2="18" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="23" y1="12" x2="13" y2="18" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{
          background: "#fee2e2",
          color: "#b91c1c",
          fontSize: "9px",
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          borderRadius: "9999px",
          padding: "3px 10px",
        }}>
          Sem Estratégia
        </div>
      </div>

      {/* Explanation */}
      <p style={{ fontSize: "12.5px", color: "#6b7280", lineHeight: 1.65, margin: 0 }}>
        {explanation}
      </p>
    </motion.div>
  );
}

function GoodResponseCard({
  message,
  explanation,
  delay = 0,
}: {
  message: string;
  explanation: string;
  delay?: number;
}) {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  function handleCopy() {
    const raw = message.replace(/^"|"$/g, "");
    navigator.clipboard.writeText(raw).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -3 }}
      style={{
        background: "#fffcf5",
        border: `1.5px solid ${hovered ? "#C9A060" : "#e8d5a3"}`,
        borderRadius: "20px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        cursor: "default",
        boxShadow: hovered ? "0 12px 40px rgba(201,160,96,0.15)" : "none",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C9A060", flexShrink: 0 }} />
        <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", color: "#92610A", textTransform: "uppercase" }}>
          Resposta com LeadBellus
        </span>
      </div>

      {/* Brand stamp + message bubble */}
      <div style={{
        background: "rgba(201,160,96,0.06)",
        border: "1px solid rgba(201,160,96,0.25)",
        borderRadius: "14px",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}>
        {/* Mini logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke="#C9A060" strokeWidth="1.5"/>
            <path d="M8 12l3 3 5-5" stroke="#C9A060" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#C9A060", letterSpacing: "0.04em" }}>LeadBellus</span>
        </div>
        <p style={{ fontSize: "13px", color: "#2d3748", lineHeight: 1.7, margin: 0 }}>
          {message}
        </p>
      </div>

      {/* Check */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: delay + 0.3, type: "spring", stiffness: 300 }}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(201,160,96,0.15)",
            border: "1.5px solid #C9A060",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7.5l3 3 6-6" stroke="#C9A060" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </div>

      {/* Explanation */}
      <p style={{ fontSize: "12.5px", color: "#92610A", fontWeight: 600, lineHeight: 1.55, margin: 0 }}>
        {explanation}
      </p>

      {/* Copy button on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            onClick={handleCopy}
            style={{
              background: copied ? "rgba(201,160,96,0.2)" : "rgba(201,160,96,0.1)",
              border: "1px solid #C9A060",
              borderRadius: "9999px",
              padding: "6px 14px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#92610A",
              cursor: "pointer",
              alignSelf: "center",
              letterSpacing: "0.04em",
            }}
          >
            {copied ? "Copiado ✓" : "Copiar resposta"}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false });

  useEffect(() => {
    if (inView) {
      setCurrent(0);
      const timeout = setTimeout(() => {
        const steps = 40;
        const step = score / steps;
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setCurrent(Math.min(Math.round(step * i), score));
          if (i >= steps) clearInterval(interval);
        }, 18);
        return () => clearInterval(interval);
      }, 400);
      return () => clearTimeout(timeout);
    } else {
      setCurrent(0);
    }
  }, [inView, score]);

  return (
    <div ref={ref}>
      <div style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.12em", color: "#C9A060", textTransform: "uppercase", marginBottom: "6px" }}>
        Score da Conversa
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
        <span style={{ fontSize: "32px", fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>{current}</span>
        <span style={{ fontSize: "11px", color: "rgba(201,160,96,0.8)" }}>Alta chance de agendamento</span>
      </div>
      <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "9999px", overflow: "hidden" }}>
        <motion.div
          animate={{ width: `${current}%` }}
          transition={{ duration: 0.05, ease: "linear" }}
          style={{ height: "100%", background: "linear-gradient(90deg, #C9A060, #e8c98a)", borderRadius: "9999px" }}
        />
      </div>
    </div>
  );
}

function PhoneMockup({ scenario }: { scenario: typeof SCENARIOS[0] }) {
  return (
    <div style={{
      width: "100%",
      maxWidth: "260px",
      margin: "0 auto",
      background: "#0A1628",
      borderRadius: "40px",
      padding: "10px",
      boxShadow: "0 40px 80px rgba(10,22,40,0.45), 0 0 0 1px rgba(255,255,255,0.06)",
      position: "relative",
    }}>
      {/* Notch */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "6px" }}>
        <div style={{ width: "72px", height: "20px", background: "#000", borderRadius: "0 0 14px 14px" }} />
      </div>

      {/* Screen */}
      <div style={{
        background: "#0f1b2f",
        borderRadius: "30px",
        padding: "16px 14px 14px",
        minHeight: "440px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: 22, height: 22, background: "rgba(201,160,96,0.2)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke="#C9A060" strokeWidth="2"/>
                <path d="M8 12l3 3 5-5" stroke="#C9A060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>Lead<span style={{ color: "#C9A060" }}>Bellus</span></span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Main card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: "16px",
          padding: "14px",
          border: "1px solid rgba(201,160,96,0.15)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>Lead Intelligence</span>
            <span style={{ fontSize: "8px", fontWeight: 800, background: "#C9A060", color: "#0A1628", borderRadius: "4px", padding: "1px 6px", letterSpacing: "0.05em" }}>PRO</span>
          </div>
          <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>
            Cole a mensagem de uma cliente e descubra: score da conversa, perfil psicológico e a estratégia exata para fechar esse lead.
          </p>

          {/* Score */}
          <ScoreBar score={scenario.score} />

          {/* Perfil */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px" }}>
            <div style={{ fontSize: "7px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: "4px" }}>
              Perfil Psicológico
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <p style={{ fontSize: "10px", fontWeight: 700, color: "#ffffff", margin: "0 0 2px" }}>{scenario.perfil}</p>
                <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.45)", margin: 0 }}>{scenario.perfilSub}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Estratégia */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px" }}>
            <div style={{ fontSize: "7px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: "4px" }}>
              Estratégia Recomendada
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={scenario.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                style={{ fontSize: "9px", color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.6 }}
              >
                {scenario.estrategia}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Button */}
          <motion.button
            animate={{ boxShadow: ["0 0 0px rgba(201,160,96,0)", "0 0 10px rgba(201,160,96,0.35)", "0 0 0px rgba(201,160,96,0)"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: "transparent",
              border: "1px solid #C9A060",
              borderRadius: "9999px",
              padding: "8px 12px",
              fontSize: "9px",
              fontWeight: 700,
              color: "#C9A060",
              cursor: "pointer",
              letterSpacing: "0.04em",
              marginTop: "2px",
            }}
          >
            Ver análise completa →
          </motion.button>
        </div>

        {/* Footer nav */}
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "10px",
        }}>
          {["Início", "Gerador", "Inteligência", "Scripts", "Histórico"].map((item) => (
            <div key={item} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
              <div style={{
                width: 16,
                height: 16,
                borderRadius: "4px",
                background: item === "Inteligência" ? "rgba(201,160,96,0.2)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "2px", background: item === "Inteligência" ? "#C9A060" : "rgba(255,255,255,0.25)" }} />
              </div>
              <span style={{ fontSize: "6px", color: item === "Inteligência" ? "#C9A060" : "rgba(255,255,255,0.3)" }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Home indicator */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: "8px" }}>
        <div style={{ width: "80px", height: "4px", background: "rgba(255,255,255,0.2)", borderRadius: "9999px" }} />
      </div>
    </div>
  );
}

function ConnectorLines() {
  return (
    <svg
      viewBox="0 0 800 560"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9A060" stopOpacity="0.4"/>
          <stop offset="50%" stopColor="#C9A060" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#C9A060" stopOpacity="0.4"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Left top → center */}
      <motion.path
        d="M 245 140 Q 340 140 400 200"
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="1"
        filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
      />
      {/* Center → right top */}
      <motion.path
        d="M 400 200 Q 460 140 555 140"
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="1"
        filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, delay: 1.0, ease: "easeOut" }}
      />
      {/* Left bottom → center */}
      <motion.path
        d="M 245 420 Q 340 420 400 360"
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="1"
        filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
      />
      {/* Center → right bottom */}
      <motion.path
        d="M 400 360 Q 460 420 555 420"
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="1"
        filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, delay: 1.4, ease: "easeOut" }}
      />
    </svg>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function CompareResponsesSection({ funilHref = "/signup" }: { funilHref?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scenario = SCENARIOS[activeIndex];

  return (
    <section
      id="antes-depois"
      style={{ background: "#F7F3EB", padding: "100px 24px", overflow: "hidden" }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid #C9A060",
              borderRadius: "9999px",
              padding: "5px 14px",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "#92610A",
              textTransform: "uppercase",
              marginBottom: "20px",
              background: "rgba(201,160,96,0.06)",
            }}
          >
            ✦ Ver pra crer
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(26px, 4vw, 46px)",
              fontWeight: 700,
              color: "#0A1628",
              margin: "0 0 16px",
              lineHeight: 1.2,
            }}
          >
            A diferença entre a resposta<br />
            que perde e a resposta que{" "}
            <span style={{ position: "relative", display: "inline-block" }}>
              <span style={{ color: "#C9A060" }}>agenda</span>
              <motion.svg
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: 0.7 }}
                viewBox="0 0 120 12"
                style={{ position: "absolute", bottom: "-6px", left: 0, width: "100%", overflow: "visible" }}
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M 2 8 Q 30 2 60 8 Q 90 14 118 6"
                  fill="none"
                  stroke="#C9A060"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                />
              </motion.svg>
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ color: "#6b7280", fontSize: "15px", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}
          >
            Não é sobre ser mais inteligente. É sobre ter a resposta certa já pronta pra usar.
          </motion.p>
        </div>

        {/* ── Scenario Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          {SCENARIOS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveIndex(i)}
              style={{
                background: activeIndex === i ? "#0A1628" : "#ffffff",
                color: activeIndex === i ? "#C9A060" : "#6b7280",
                border: `1.5px solid ${activeIndex === i ? "#0A1628" : "#e5e7eb"}`,
                borderRadius: "9999px",
                padding: "7px 18px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                letterSpacing: "0.02em",
              }}
            >
              {s.label}
            </button>
          ))}
        </motion.div>

        {/* ── 3-column layout ── */}
        <div style={{ position: "relative" }}>
          {/* Connector lines — desktop only */}
          <div className="connector-lines-wrapper" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <ConnectorLines />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "24px",
            alignItems: "center",
          }}
          className="compare-grid"
          >
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`bad-${scenario.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                >
                  <BadResponseCard message={scenario.bad1.message} explanation={scenario.bad1.explanation} delay={0} />
                  <BadResponseCard message={scenario.bad2.message} explanation={scenario.bad2.explanation} delay={0.1} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Center — phone */}
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: "260px", flexShrink: 0 }}
              className="phone-center"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PhoneMockup scenario={scenario} />
                </motion.div>
              </AnimatePresence>

              {/* CTA below phone */}
              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <Link
                  href={funilHref}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#0A1628",
                    color: "#C9A060",
                    borderRadius: "9999px",
                    padding: "13px 28px",
                    fontSize: "14px",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 4px 20px rgba(10,22,40,0.2)",
                    transition: "box-shadow 0.25s ease, transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 28px rgba(201,160,96,0.25), 0 4px 20px rgba(10,22,40,0.2)";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(10,22,40,0.2)";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                  }}
                >
                  Ver como fica na minha clínica →
                </Link>
                <p style={{ fontSize: "11px", color: "#92610A", marginTop: "8px" }}>
                  Teste grátis no simulador abaixo — sem login, sem cartão
                </p>
              </div>
            </motion.div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`good-${scenario.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                >
                  <GoodResponseCard message={scenario.good1.message} explanation={scenario.good1.explanation} delay={0} />
                  <GoodResponseCard message={scenario.good2.message} explanation={scenario.good2.explanation} delay={0.1} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Benefits strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginTop: "56px",
            background: "#ffffff",
            border: "1px solid #e8d5a3",
            borderRadius: "24px",
            padding: "36px 32px",
            boxShadow: "0 4px 24px rgba(10,22,40,0.06)",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px",
          }}
          className="benefits-grid"
        >
          {BENEFITS.map((b) => (
            <motion.div
              key={b.title}
              whileHover={{ y: -2 }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                alignItems: "flex-start",
              }}
            >
              <motion.div
                whileHover={{ filter: "drop-shadow(0 0 6px rgba(201,160,96,0.5))" }}
                transition={{ duration: 0.2 }}
              >
                {b.icon}
              </motion.div>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#0A1628", margin: 0, lineHeight: 1.4 }}>
                {b.title}
              </h3>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: 0, lineHeight: 1.6 }}>
                {b.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .compare-grid {
            grid-template-columns: 1fr !important;
          }
          .phone-center {
            width: 220px !important;
            margin: 0 auto !important;
          }
          .connector-lines-wrapper {
            display: none !important;
          }
          .benefits-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 560px) {
          .benefits-grid {
            grid-template-columns: 1fr !important;
          }
          .phone-center {
            width: 200px !important;
          }
        }
      `}</style>
    </section>
  );
}
