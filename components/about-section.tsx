"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Microscope,
  Smartphone,
  FlaskConical,
  Brain,
  Heart,
  ShieldOff,
  Award,
  Map,
  LayoutGrid,
  ThumbsUp,
  ArrowRight,
  Zap,
} from "lucide-react";
import { motion, useScroll, useTransform, useInView, useSpring, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const services = [
  {
    icon: <Microscope className="w-6 h-6" />,
    title: "Especialização cirúrgica",
    description:
      "Construído só pra estética brasileira. Conhece botox, harmonização, laser, preenchimento e a psicologia de compra de cada procedimento.",
    position: "left",
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Pensado para usar no celular",
    description:
      "Feito pra quem atende pelo celular entre um procedimento e outro. Interface limpa, resposta em 3 toques, sem curva de aprendizado.",
    position: "left",
  },
  {
    icon: <FlaskConical className="w-6 h-6" />,
    title: "Criado para situações reais de atendimento",
    description:
      "Cada parte foi pensada para situações comuns de WhatsApp em clínicas de estética: preço, medo, comparação, sumiço e agendamento.",
    position: "left",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Resposta com clareza e próximo passo",
    description:
      "A ideia não é só escrever bonito. É ajudar a acolher, explicar valor e sugerir um próximo passo sem prometer resultado.",
    position: "right",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Produto que cresce com você",
    description:
      "Você manda feedback, a gente implementa. Não somos empresa grande com fila de demanda. Somos pequenos e ágeis por escolha.",
    position: "right",
  },
  {
    icon: <ShieldOff className="w-6 h-6" />,
    title: "Zero jargão de tecnologia",
    description:
      "Você não precisa entender de tecnologia pra usar o LeadBellus. Se você sabe usar o WhatsApp, você já sabe usar o sistema.",
    position: "right",
  },
];

const stats = [
  { icon: <Award className="w-6 h-6" />, value: 16, label: "Situações no gerador", suffix: "" },
  { icon: <Map className="w-6 h-6" />, value: 26, label: "Objeções prontas", suffix: "" },
  { icon: <LayoutGrid className="w-6 h-6" />, value: 6, label: "Ferramentas no Start", suffix: "" },
  { icon: <ThumbsUp className="w-6 h-6" />, value: 8, label: "Tons de voz", suffix: "" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
  const isStatsInView = useInView(statsRef, { once: false, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -20]);

  return (
    <section
      id="sobre"
      ref={sectionRef}
      style={{
        background: "linear-gradient(to bottom, #F5F0E6, #FAF7F2)",
        padding: "96px 24px",
        overflow: "hidden",
        position: "relative",
        color: "#0A1628",
      }}
    >
      {/* Decorative blobs */}
      <motion.div
        style={{
          position: "absolute", top: "80px", left: "40px",
          width: "256px", height: "256px", borderRadius: "50%",
          background: "rgba(201,160,96,0.06)", filter: "blur(48px)",
          y: y1, rotate: rotate1,
        }}
      />
      <motion.div
        style={{
          position: "absolute", bottom: "80px", right: "40px",
          width: "320px", height: "320px", borderRadius: "50%",
          background: "rgba(201,160,96,0.05)", filter: "blur(48px)",
          y: y2, rotate: rotate2,
        }}
      />
      <motion.div
        style={{ position: "absolute", top: "50%", left: "25%", width: "16px", height: "16px", borderRadius: "50%", background: "rgba(201,160,96,0.3)" }}
        animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{ position: "absolute", bottom: "33%", right: "25%", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(201,160,96,0.2)" }}
        animate={{ y: [0, 20, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <motion.div
        style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 10 }}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px" }} variants={itemVariants}>
          <motion.span
            style={{ color: "#C9A060", fontWeight: 600, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase" }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Zap className="w-4 h-4" />
            Por Dentro do LeadBellus
          </motion.span>
          <h2 style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, textAlign: "center", color: "#0A1628", margin: "0 0 16px" }}>
            Quem somos nós
          </h2>
          <motion.div
            style={{ height: "3px", background: "#C9A060", borderRadius: "2px" }}
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        <motion.p
          style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 64px", color: "rgba(10,22,40,0.75)", fontSize: "16px", lineHeight: 1.75 }}
          variants={itemVariants}
        >
          Não somos uma empresa de tecnologia que resolveu entrar na estética. Somos quem ficou obcecado em entender por que clínicas perdem venda no WhatsApp — e construiu a solução certa pra isso.
        </motion.p>

        {/* 3-column grid */}
        <div className="about-grid" style={{ display: "grid", gap: "32px", alignItems: "center" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
            {services.filter((s) => s.position === "left").map((s, i) => (
              <ServiceItem key={i} icon={s.icon} title={s.title} description={s.description} variants={itemVariants} delay={i * 0.2} direction="left" />
            ))}
          </div>

          {/* Center image */}
          <motion.div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} variants={itemVariants}>
            <div style={{ position: "relative", width: "100%" }}>
              <motion.div
                style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", position: "relative" }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                <Image
                  src="/app-mockup.png"
                  alt="LeadBellus app dashboard"
                  width={320}
                  height={620}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                <motion.div
                  style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(7,16,30,0.55), transparent)",
                    display: "flex", alignItems: "flex-end", justifyContent: "center",
                    padding: "20px",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  <Link
                    href="/signup"
                    style={{
                      background: "#C9A060", color: "#07101e",
                      padding: "10px 20px", borderRadius: "9999px",
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      fontSize: "13px", fontWeight: 700, textDecoration: "none",
                    }}
                  >
                    Conhecer o sistema <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Border frame */}
              <motion.div
                style={{
                  position: "absolute", inset: "-12px",
                  border: "2px solid rgba(201,160,96,0.25)",
                  borderRadius: "24px", zIndex: -1,
                }}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />

              {/* Floating orbs */}
              <motion.div
                style={{ position: "absolute", top: "-16px", right: "-32px", width: "64px", height: "64px", borderRadius: "50%", background: "rgba(201,160,96,0.12)", y: y1 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9 }}
              />
              <motion.div
                style={{ position: "absolute", bottom: "-24px", left: "-40px", width: "80px", height: "80px", borderRadius: "50%", background: "rgba(201,160,96,0.08)", y: y2 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.1 }}
              />
              <motion.div
                style={{ position: "absolute", top: "-40px", left: "50%", transform: "translateX(-50%)", width: "10px", height: "10px", borderRadius: "50%", background: "#C9A060" }}
                animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
            {services.filter((s) => s.position === "right").map((s, i) => (
              <ServiceItem key={i} icon={s.icon} title={s.title} description={s.description} variants={itemVariants} delay={i * 0.2} direction="right" />
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          ref={statsRef}
          style={{ marginTop: "80px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "24px" }}
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {stats.map((stat, i) => (
            <StatCounter key={i} icon={stat.icon} value={stat.value} label={stat.label} suffix={stat.suffix} delay={i * 0.1} />
          ))}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          style={{
            marginTop: "64px",
            background: "#07101e",
            borderRadius: "20px",
            padding: "40px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            flexWrap: "wrap",
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div>
            <h3 style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: "22px", fontWeight: 700, color: "#ffffff", margin: "0 0 6px" }}>
              Pronto pra ver o LeadBellus na prática?
            </h3>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", margin: 0 }}>
              Teste grátis por 7 dias — sem colocar cartão.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/signup"
              style={{
                background: "#C9A060", color: "#07101e",
                padding: "14px 28px", borderRadius: "9999px",
                display: "inline-flex", alignItems: "center", gap: "8px",
                fontSize: "15px", fontWeight: 700, textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Começar agora <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
      <style>{`
        .about-grid {
          grid-template-columns: 1fr 320px 1fr;
        }
        @media (max-width: 991px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}

interface ServiceItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  variants: Variants;
  delay: number;
  direction: "left" | "right";
}

function ServiceItem({ icon, title, description, variants, delay, direction }: ServiceItemProps) {
  return (
    <motion.div
      style={{ display: "flex", flexDirection: "column" }}
      variants={variants}
      transition={{ delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <motion.div
        style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}
        initial={{ x: direction === "left" ? -20 : 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.2 }}
      >
        <motion.div
          style={{
            color: "#C9A060",
            background: "rgba(201,160,96,0.10)",
            padding: "10px",
            borderRadius: "10px",
            position: "relative",
            flexShrink: 0,
          }}
          whileHover={{ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.5 } }}
        >
          {icon}
        </motion.div>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0A1628", margin: 0 }}>{title}</h3>
      </motion.div>
      <motion.p
        style={{ fontSize: "13px", color: "rgba(10,22,40,0.7)", lineHeight: 1.75, paddingLeft: "48px", margin: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.4 }}
      >
        {description}
      </motion.p>
    </motion.div>
  );
}

interface StatCounterProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix: string;
  delay: number;
}

function StatCounter({ icon, value, label, suffix, delay }: StatCounterProps) {
  const countRef = useRef(null);
  const isInView = useInView(countRef, { once: false });
  const [hasAnimated, setHasAnimated] = useState(false);

  const springValue = useSpring(0, { stiffness: 50, damping: 10 });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      springValue.set(value);
      setHasAnimated(true);
    } else if (!isInView && hasAnimated) {
      springValue.set(0);
      setHasAnimated(false);
    }
  }, [isInView, value, springValue, hasAnimated]);

  const displayValue = useTransform(springValue, (latest) => Math.floor(latest));

  return (
    <motion.div
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(8px)",
        padding: "28px 20px",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        border: "1px solid rgba(201,160,96,0.12)",
      }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <motion.div
        style={{
          width: "52px", height: "52px", borderRadius: "50%",
          background: "rgba(201,160,96,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "12px", color: "#C9A060",
        }}
        whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
      >
        {icon}
      </motion.div>
      <motion.div ref={countRef} style={{ fontSize: "28px", fontWeight: 700, color: "#0A1628", display: "flex", alignItems: "center" }}>
        <motion.span>{displayValue}</motion.span>
        <span>{suffix}</span>
      </motion.div>
      <p style={{ fontSize: "12px", color: "rgba(10,22,40,0.65)", marginTop: "4px" }}>{label}</p>
      <motion.div
        style={{ width: "32px", height: "2px", background: "#C9A060", borderRadius: "1px", marginTop: "10px" }}
        whileHover={{ width: 56, transition: { duration: 0.3 } }}
      />
    </motion.div>
  );
}
