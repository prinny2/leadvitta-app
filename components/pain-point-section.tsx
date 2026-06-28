"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";

const CHECKLIST = [
  "Deu o preço e a cliente sumiu",
  'Ouviu "vou pensar" e nunca mais teve retorno',
  'A cliente disse "na outra é mais barato" e você travou',
  "Fez orçamento e não fez follow-up",
  'Sentiu: "ela ia fechar — eu errei na resposta"',
  "Tem conversas abertas e não sabe qual está quente",
];

// ─── AnimatedCounter ──────────────────────────────────────────────────────────
function AnimatedCounter({
  target,
  prefix = "",
  duration = 900,
}: {
  target: number;
  prefix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const steps = 40;
    const step = target / steps;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setValue(Math.min(Math.round(step * i), target));
      if (i >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString("pt-BR")}
    </span>
  );
}

// ─── ConversationBubbles ──────────────────────────────────────────────────────
function ConversationBubbles() {
  return (
    <div style={{ pointerEvents: "none" }}>
      {/* Bubble 1 - typing indicator */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.92 }}
        whileInView={{ opacity: 0.7, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "#ffffff",
          border: "1px solid #E8E4DC",
          borderRadius: "18px 18px 18px 4px",
          padding: "12px 18px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
          marginBottom: "10px",
          width: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "4px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {[0, 0.15, 0.3].map((delay, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.8,
                delay,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: "easeInOut",
              }}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#C9A060",
                opacity: 0.7,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Bubble 2 - message lines */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.92 }}
        whileInView={{ opacity: 0.55, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "#ffffff",
          border: "1px solid #E8E4DC",
          borderRadius: "18px 18px 18px 4px",
          padding: "14px 18px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
          width: "140px",
          display: "flex",
          flexDirection: "column",
          gap: "7px",
        }}
      >
        {[100, 70, 85].map((w, i) => (
          <div
            key={i}
            style={{
              height: 6,
              borderRadius: 9999,
              background: "#E8E4DC",
              width: `${w}%`,
            }}
          />
        ))}
      </motion.div>

      {/* X mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 0.4,
          delay: 1.1,
          type: "spring",
          stiffness: 300,
        }}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "#fee2e2",
          border: "1.5px solid #fca5a5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "20px",
          marginTop: "6px",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 2l8 8M10 2l-8 8"
            stroke="#ef4444"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </div>
  );
}

// ─── LossValueCard ────────────────────────────────────────────────────────────
function LossValueCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.65, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "#ffffff",
        border: "1px solid #E8E4DC",
        borderRadius: "20px",
        padding: "20px 22px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(201,160,96,0.12)",
            border: "1.5px solid rgba(201,160,96,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#C9A060" strokeWidth="1.5" />
            <path
              d="M12 7v1m0 8v1M9.5 9.5C9.5 8.4 10.6 8 12 8s2.5.9 2.5 2c0 1.5-2.5 2-2.5 3.5M12 16h.01"
              stroke="#C9A060"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <p
            style={{
              fontSize: "12px",
              color: "#6b7280",
              margin: "0 0 4px",
              lineHeight: 1.4,
            }}
          >
            Cada conversa que some pode valer de
          </p>
          <p
            style={{
              fontSize: "15px",
              fontWeight: 800,
              color: "#C9A060",
              margin: 0,
            }}
          >
            <AnimatedCounter target={800} prefix="R$" duration={800} /> a{" "}
            <AnimatedCounter target={3000} prefix="R$" duration={900} />
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── LeakingFunnelCard ────────────────────────────────────────────────────────
function LeakingFunnelCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "#fffcf5",
        border: "1.5px solid rgba(201,160,96,0.25)",
        borderRadius: "20px",
        padding: "24px",
        width: "180px",
        flexShrink: 0,
      }}
    >
      <p
        style={{
          fontSize: "10px",
          fontWeight: 700,
          color: "#C9A060",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          margin: "0 0 16px",
          textAlign: "center",
        }}
      >
        Vendas que vazam
        <br />
        antes de acontecer
      </p>

      {/* Funnel illustration */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* Leads entering */}
        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
          {[0, 0.1, 0.2, 0.3].map((delay, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, 3, 0] }}
              transition={{
                duration: 2,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "rgba(201,160,96,0.15)",
                border: "1.5px solid rgba(201,160,96,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle
                  cx="5"
                  cy="5"
                  r="3"
                  stroke="#C9A060"
                  strokeWidth="1.2"
                />
                <line
                  x1="5"
                  y1="2.5"
                  x2="5"
                  y2="3.5"
                  stroke="#C9A060"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          ))}
        </div>

        {/* Funnel shape */}
        <svg width="100" height="70" viewBox="0 0 100 70" fill="none">
          <path
            d="M10 5 L90 5 L62 45 L38 45 Z"
            stroke="#C9A060"
            strokeWidth="1.5"
            fill="rgba(201,160,96,0.06)"
            strokeLinejoin="round"
          />
          <line
            x1="50"
            y1="45"
            x2="50"
            y2="65"
            stroke="#C9A060"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="3 3"
          />
          {/* Leaking dots */}
          <motion.circle
            cx="22"
            cy="28"
            r="4"
            fill="#fee2e2"
            stroke="#fca5a5"
            strokeWidth="1"
            animate={{ x: [-5, -12], opacity: [0.8, 0], y: [0, 8] }}
            transition={{
              duration: 2,
              delay: 0.5,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeOut",
            }}
          />
          <motion.circle
            cx="78"
            cy="28"
            r="4"
            fill="#fee2e2"
            stroke="#fca5a5"
            strokeWidth="1"
            animate={{ x: [5, 12], opacity: [0.8, 0], y: [0, 8] }}
            transition={{
              duration: 2,
              delay: 1,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeOut",
            }}
          />
        </svg>

        {/* X marks at bottom */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            marginTop: "-4px",
          }}
        >
          {[0.2, 0.4, 0.6].map((delay, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.3,
                delay: 0.8 + delay,
                type: "spring",
                stiffness: 300,
              }}
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fee2e2",
                border: "1px solid #fca5a5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path
                  d="M1.5 1.5l5 5M6.5 1.5l-5 5"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── RecognitionChecklist ─────────────────────────────────────────────────────
function RecognitionChecklist() {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const showMessage = checked.size >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "#ffffff",
        border: "1.5px solid #E8E4DC",
        borderRadius: "24px",
        padding: "36px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.07)",
        flex: 1,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-fraunces, Georgia, serif)",
          fontSize: "20px",
          fontWeight: 700,
          color: "#0A1628",
          margin: "0 0 24px",
        }}
      >
        Você já se reconheceu aqui?
      </p>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {CHECKLIST.map((item, i) => {
          const isChecked = checked.has(i);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                duration: 0.45,
                delay: 0.15 + i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                style={{
                  width: "100%",
                  background: isChecked
                    ? "rgba(201,160,96,0.06)"
                    : "transparent",
                  border: "none",
                  borderRadius: "10px",
                  padding: "13px 10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  textAlign: "left",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isChecked)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(239,68,68,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (!isChecked)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                }}
              >
                <motion.div
                  animate={{ scale: isChecked ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: isChecked ? "rgba(201,160,96,0.15)" : "#fee2e2",
                    border: `1.5px solid ${isChecked ? "#C9A060" : "#fca5a5"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s ease, border-color 0.2s ease",
                  }}
                >
                  {isChecked ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5l2.5 2.5 4-4"
                        stroke="#C9A060"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path
                        d="M1.5 1.5l6 6M7.5 1.5l-6 6"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </motion.div>
                <span
                  style={{
                    fontSize: "14px",
                    color: isChecked ? "#0A1628" : "#374151",
                    fontWeight: isChecked ? 600 : 400,
                    lineHeight: 1.55,
                    transition: "color 0.2s ease, font-weight 0.2s ease",
                  }}
                >
                  {item}
                </span>
              </button>
              {i < CHECKLIST.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  style={{
                    height: "1px",
                    background: "#F3F0EA",
                    margin: "0 10px",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginTop: "20px",
              background: "rgba(201,160,96,0.08)",
              border: "1px solid rgba(201,160,96,0.3)",
              borderRadius: "12px",
              padding: "13px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "16px", flexShrink: 0 }}>✦</span>
            <p
              style={{
                fontSize: "13px",
                color: "#92610A",
                fontWeight: 600,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Esse é exatamente o problema que a LeadBellus resolve.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── FinalDiagnosisBlock ──────────────────────────────────────────────────────
function FinalDiagnosisBlock({ funilHref }: { funilHref: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "linear-gradient(135deg, #0A1628 0%, #0f1e35 100%)",
        borderRadius: "28px",
        padding: "48px 40px",
        marginTop: "48px",
        boxShadow: "0 20px 60px rgba(10,22,40,0.25)",
        border: "1px solid rgba(201,160,96,0.15)",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: "32px",
        alignItems: "center",
      }}
      className="diagnosis-block"
    >
      {/* Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.5,
          delay: 0.2,
          type: "spring",
          stiffness: 200,
        }}
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "rgba(201,160,96,0.1)",
          border: "1.5px solid rgba(201,160,96,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <circle cx="17" cy="17" r="14" stroke="#C9A060" strokeWidth="1.5" />
          <circle
            cx="17"
            cy="17"
            r="9"
            stroke="#C9A060"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <circle cx="17" cy="17" r="4" fill="#C9A060" opacity="0.8" />
          <line
            x1="17"
            y1="3"
            x2="17"
            y2="6"
            stroke="#C9A060"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="17"
            y1="28"
            x2="17"
            y2="31"
            stroke="#C9A060"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="3"
            y1="17"
            x2="6"
            y2="17"
            stroke="#C9A060"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="28"
            y1="17"
            x2="31"
            y2="17"
            stroke="#C9A060"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Text */}
      <div>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            fontSize: "17px",
            color: "rgba(255,255,255,0.9)",
            fontWeight: 600,
            margin: "0 0 6px",
            lineHeight: 1.4,
          }}
        >
          Se você marcou dois ou mais — o problema não é você.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            fontFamily: "var(--font-fraunces, Georgia, serif)",
            fontSize: "20px",
            fontWeight: 700,
            color: "#C9A060",
            margin: "0 0 14px",
            lineHeight: 1.3,
            position: "relative",
            display: "inline-block",
          }}
        >
          É que você nunca teve a ferramenta certa.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75,
            margin: "0 0 10px",
          }}
        >
          Cada conversa que some pode valer de R$800 a R$3.000. Não porque você
          é ruim no atendimento — mas porque responder bem no WhatsApp é uma
          habilidade de vendas que ninguém te ensinou.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{
            fontFamily: "var(--font-fraunces, Georgia, serif)",
            fontSize: "15px",
            fontWeight: 700,
            color: "#C9A060",
            margin: 0,
          }}
        >
          O LeadBellus foi construído exatamente para isso.
        </motion.p>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.55 }}
      >
        <Link
          href={funilHref}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(201,160,96,0.08)",
            border: "1.5px solid #C9A060",
            borderRadius: "14px",
            padding: "16px 22px",
            fontSize: "13px",
            fontWeight: 700,
            color: "#C9A060",
            textDecoration: "none",
            whiteSpace: "nowrap",
            boxShadow: hovered ? "0 0 20px rgba(201,160,96,0.2)" : "none",
            transform: hovered ? "translateY(-2px)" : "translateY(0)",
            transition: "box-shadow 0.25s ease, transform 0.2s ease",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="#C9A060" strokeWidth="1.3" />
            <circle
              cx="9"
              cy="9"
              r="4"
              stroke="#C9A060"
              strokeWidth="1.3"
              opacity="0.5"
            />
            <circle cx="9" cy="9" r="1.5" fill="#C9A060" />
          </svg>
          <span>
            Quero responder melhor agora{" "}
            <motion.span
              animate={{ x: hovered ? 4 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: "inline-block" }}
            >
              →
            </motion.span>
          </span>
        </Link>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .diagnosis-block {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .diagnosis-block > div:first-child {
            margin: 0 auto;
          }
        }
      `}</style>
    </motion.div>
  );
}

// ─── Main PainPointSection ────────────────────────────────────────────────────
export function PainPointSection({
  funilHref = "/signup",
}: {
  funilHref?: string;
}) {
  return (
    <section
      id="problema"
      style={{
        background: "#F5F0E6",
        padding: "100px 24px",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        {/* ── Header ── */}
        {/* 3-col grid: decorative left | text center | decorative right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 1fr 160px",
            gap: "24px",
            marginBottom: "64px",
            alignItems: "start",
          }}
          className="header-grid"
        >
          {/* Left decorative */}
          <div style={{ paddingTop: "48px" }} className="hidden lg:block">
            <ConversationBubbles />
          </div>

          {/* Center text */}
          <div style={{ textAlign: "center" }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                border: "1px solid rgba(201,160,96,0.5)",
                background: "rgba(201,160,96,0.07)",
                borderRadius: "9999px",
                padding: "6px 16px",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: "#92610A",
                textTransform: "uppercase",
                marginBottom: "24px",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle
                  cx="6.5"
                  cy="6.5"
                  r="5.5"
                  stroke="#92610A"
                  strokeWidth="1.2"
                />
                <path
                  d="M6.5 4v3.5"
                  stroke="#92610A"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <circle cx="6.5" cy="9.5" r="0.6" fill="#92610A" />
              </svg>
              Onde o dinheiro vaza sem você perceber
            </motion.div>

            {/* Title line 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.6,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(30px, 4.5vw, 52px)",
                fontWeight: 700,
                color: "#0A1628",
                lineHeight: 1.15,
                margin: "0 0 4px",
              }}
            >
              A cliente perguntou o preço. Você respondeu.
            </motion.div>

            {/* Title line 2 - "Ela sumiu." with weight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.65,
                delay: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(30px, 4.5vw, 52px)",
                fontWeight: 700,
                color: "#0A1628",
                lineHeight: 1.15,
                margin: "0 0 32px",
              }}
            >
              Ela sumiu.
            </motion.div>

            {/* Text 1 */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                color: "#4a5568",
                fontSize: "16px",
                lineHeight: 1.8,
                maxWidth: "580px",
                margin: "0 auto 16px",
              }}
            >
              Não foi o preço. Foi a resposta — que não conduziu nem criou o
              próximo passo.
            </motion.p>

            {/* Text 2 */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                color: "#4a5568",
                fontSize: "16px",
                lineHeight: 1.8,
                maxWidth: "580px",
                margin: "0 auto 20px",
              }}
            >
              A maioria das vendas se perde nos primeiros minutos no WhatsApp —
              não por falta de interesse.
            </motion.p>

            {/* Impact phrase */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.55,
                delay: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                color: "#92610A",
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: 1.7,
                maxWidth: "520px",
                margin: "0 auto",
                fontStyle: "italic",
              }}
            >
              E você já sabe disso: "essa eu devia ter conseguido".
            </motion.p>
          </div>
          {/* end center text */}

          {/* Right decorative */}
          <div style={{ paddingTop: "48px" }} className="hidden lg:block">
            <LossValueCard />
          </div>
        </div>
        {/* end header-grid */}

        {/* ── Checklist + Funnel ── */}
        <div
          style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
          className="checklist-row"
        >
          <RecognitionChecklist />
          <LeakingFunnelCard />
        </div>

        {/* ── Final diagnosis ── */}
        <FinalDiagnosisBlock funilHref={funilHref} />
      </div>

      {/* Mobile value card */}
      <div
        className="lg:hidden"
        style={{ maxWidth: "980px", margin: "24px auto 0", padding: "0" }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #E8E4DC",
            borderRadius: "16px",
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(201,160,96,0.12)",
              border: "1.5px solid rgba(201,160,96,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="#C9A060"
                strokeWidth="1.5"
              />
              <path
                d="M12 7v1m0 8v1M9.5 9.5C9.5 8.4 10.6 8 12 8s2.5.9 2.5 2c0 1.5-2.5 2-2.5 3.5M12 16h.01"
                stroke="#C9A060"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "#374151",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Cada conversa que some pode valer de{" "}
            <strong style={{ color: "#C9A060" }}>R$800 a R$3.000</strong>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .header-grid {
            grid-template-columns: 1fr !important;
          }
          .header-grid > div:first-child,
          .header-grid > div:last-child {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .checklist-row {
            flex-direction: column !important;
          }
          .checklist-row > div:last-child {
            width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
}
