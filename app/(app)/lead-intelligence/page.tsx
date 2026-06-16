"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from "recharts";
import {
  Brain, Flame, Thermometer, Sparkles, Send, Loader2,
  TrendingUp, Target, Zap, ChevronRight, AlertCircle,
} from "lucide-react";
import type { LeadIntelligenceResult } from "@/app/api/lead-intelligence/route";

// ── Score ring SVG animado ──────────────────────────────────────────────────
function ScoreRing({ score, temperatura }: { score: number; temperatura: string }) {
  const R = 70;
  const circ = 2 * Math.PI * R;
  const offset = circ - (score / 100) * circ;

  const ringColor =
    temperatura === "quente" ? "#F97316"
    : temperatura === "morno" ? "#C9A060"
    : "#6B8CAE";

  const tempLabel =
    temperatura === "quente" ? "Lead Quente 🔥"
    : temperatura === "morno" ? "Lead Morno ☀️"
    : "Lead Frio ❄️";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Track */}
          <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          {/* Progress */}
          <circle
            cx="90" cy="90" r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 90 90)"
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              filter: `drop-shadow(0 0 8px ${ringColor}80)`,
            }}
          />
          {/* Glow ring */}
          <circle
            cx="90" cy="90" r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth="2"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 90 90)"
            style={{ opacity: 0.3, transition: "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />
          {/* Score number */}
          <text x="90" y="82" textAnchor="middle" fill="white" fontSize="36" fontWeight="700" fontFamily="serif">
            {score}
          </text>
          <text x="90" y="104" textAnchor="middle" fill={ringColor} fontSize="12" fontWeight="600">
            SCORE
          </text>
        </svg>
      </div>
      <span
        className="rounded-full px-4 py-1.5 text-sm font-bold"
        style={{
          background: `${ringColor}20`,
          border: `1px solid ${ringColor}50`,
          color: ringColor,
        }}
      >
        {tempLabel}
      </span>
    </div>
  );
}

// ── Radar chart ──────────────────────────────────────────────────────────────
function LeadRadar({ eixos }: { eixos: LeadIntelligenceResult["eixos"] }) {
  const data = [
    { axis: "Urgência",      val: eixos.urgencia      },
    { axis: "Intenção",      val: eixos.intencao      },
    { axis: "Confiança",     val: eixos.confianca     },
    { axis: "Receptiv.",     val: eixos.receptividade },
    { axis: "Maturidade",    val: eixos.maturidade    },
  ];

  return (
    <ResponsiveContainer width="100%" height={230}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "#8aacc8", fontSize: 11, fontWeight: 600 }}
        />
        <Radar
          name="Lead"
          dataKey="val"
          stroke="#C9A060"
          strokeWidth={2}
          fill="#C9A060"
          fillOpacity={0.2}
          dot={{ fill: "#C9A060", r: 4, strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Insight card ──────────────────────────────────────────────────────────────
function InsightCard({
  icon: Icon, label, text, color,
}: { icon: React.ElementType; label: string; text: string; color: string }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}25`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `${color}20` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: `${color}CC` }}>
          {label}
        </p>
      </div>
      <p className="text-sm text-white/90 leading-relaxed">{text}</p>
    </div>
  );
}

// ── Exemplos de mensagem ──────────────────────────────────────────────────────
const EXEMPLOS = [
  "Oi! Quanto custa o botox? Achei caro no outro lugar",
  "Quero agendar uma avaliação, quando tem horário?",
  "Tenho medo de agulha, mas quero fazer harmonização",
  "Vi resultados incríveis nas fotos, isso funciona mesmo?",
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LeadIntelligencePage() {
  const router = useRouter();
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LeadIntelligenceResult | null>(null);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  async function analisar() {
    if (!mensagem.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/lead-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na análise");
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  function irParaGerador() {
    if (!mensagem) return;
    try {
      sessionStorage.setItem("re_prefill", JSON.stringify({ mensagem }));
    } catch { /* ignora */ }
    router.push("/gerador");
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">

      {/* ── Header premium ── */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8"
        style={{
          background: "linear-gradient(135deg, #0f1b2f 0%, #131f35 60%, #0d1a2e 100%)",
          border: "1px solid rgba(201,160,96,0.25)",
          boxShadow: "0 0 60px rgba(201,160,96,0.08), inset 0 1px 0 rgba(201,160,96,0.12)",
        }}
      >
        {/* Glow radial de fundo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 80% 50%, rgba(201,160,96,0.08) 0%, transparent 60%)",
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(201,160,96,0.2) 0%, rgba(201,160,96,0.08) 100%)",
              border: "1px solid rgba(201,160,96,0.3)",
              boxShadow: "0 0 20px rgba(201,160,96,0.2)",
            }}
          >
            <Brain size={28} style={{ color: "#C9A060" }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
                Lead Intelligence
              </h1>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: "rgba(201,160,96,0.2)", border: "1px solid rgba(201,160,96,0.4)", color: "#C9A060" }}
              >
                PRO
              </span>
            </div>
            <p className="text-sm" style={{ color: "#8aacc8" }}>
              Cole a mensagem da cliente e a IA revela o perfil, score de conversão e a estratégia ideal de resposta.
            </p>
          </div>
        </div>
      </div>

      {/* ── Input ── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "#0f1b2f", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#5a7a9a" }}>
          Mensagem da Cliente
        </label>

        {/* Exemplos rápidos */}
        <div className="flex flex-wrap gap-2 mb-3">
          {EXEMPLOS.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setMensagem(ex)}
              className="rounded-full px-3 py-1 text-xs transition-all hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#8aacc8",
              }}
            >
              {ex.length > 35 ? ex.slice(0, 35) + "…" : ex}
            </button>
          ))}
        </div>

        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Ex: &quot;Quanto custa o botox? Vi que no lugar X é mais barato…&quot;"
          rows={4}
          className="w-full resize-none rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onFocus={(e) => e.target.style.borderColor = "rgba(201,160,96,0.4)"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
          onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && analisar()}
        />

        <div className="flex items-center justify-between mt-3 gap-3">
          <p className="text-xs" style={{ color: "#5a7a9a" }}>
            {mensagem.length > 0 ? `${mensagem.length} caracteres` : "Ctrl+Enter para analisar"}
          </p>
          <button
            type="button"
            onClick={analisar}
            disabled={!mensagem.trim() || loading}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              background: "linear-gradient(135deg, #D4A84A 0%, #C9A060 100%)",
              color: "#07101e",
              boxShadow: "0 4px 20px rgba(201,160,96,0.35)",
            }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Brain size={15} />}
            {loading ? "Analisando…" : "Analisar Lead"}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-red-400"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </div>

      {/* ── Resultado ── */}
      {result && (
        <div ref={resultRef} className="space-y-4 animate-fade-in">

          {/* Score + Radar */}
          <div className="grid gap-4 sm:grid-cols-2">

            {/* Score ring */}
            <div
              className="flex flex-col items-center justify-center rounded-2xl p-6 gap-4"
              style={{ background: "#0f1b2f", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <ScoreRing score={result.score} temperatura={result.temperatura} />

              {/* Eixos em mini barras */}
              <div className="w-full space-y-2">
                {(Object.entries(result.eixos) as [string, number][]).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    urgencia: "Urgência", intencao: "Intenção",
                    confianca: "Confiança", receptividade: "Receptividade", maturidade: "Maturidade",
                  };
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-24 text-[11px] shrink-0" style={{ color: "#5a7a9a" }}>{labels[key]}</span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${val}%`,
                            background: "linear-gradient(90deg, #6B8CAE, #C9A060)",
                            transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          }}
                        />
                      </div>
                      <span className="w-8 text-[11px] text-right font-semibold text-white shrink-0">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Radar */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "#0f1b2f", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "#5a7a9a" }}>
                Radar de Perfil
              </p>
              <LeadRadar eixos={result.eixos} />
            </div>
          </div>

          {/* 3 Insight cards */}
          <div className="grid gap-3 sm:grid-cols-3">
            <InsightCard icon={Target}    label="Perfil do Lead"    text={result.perfil}    color="#C9A060" />
            <InsightCard icon={TrendingUp} label="Melhor Abordagem" text={result.abordagem} color="#6B8CAE" />
            <InsightCard icon={Zap}       label="Gatilho de Venda"  text={result.gatilho}   color="#A0C9A0" />
          </div>

          {/* CTA */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, rgba(201,160,96,0.1) 0%, rgba(201,160,96,0.04) 100%)",
              border: "1px solid rgba(201,160,96,0.25)",
            }}
          >
            <div>
              <p className="font-semibold text-white">Pronta para responder?</p>
              <p className="text-sm mt-0.5" style={{ color: "#8aacc8" }}>
                Gere as 3 variantes de resposta no seu tom e com a estratégia certa para esse lead.
              </p>
            </div>
            <button
              type="button"
              onClick={irParaGerador}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #D4A84A 0%, #C9A060 100%)",
                color: "#07101e",
                boxShadow: "0 4px 20px rgba(201,160,96,0.35)",
              }}
            >
              <Sparkles size={15} /> Gerar resposta ideal
              <ChevronRight size={14} />
            </button>
          </div>

          {result.mock && (
            <p className="text-center text-xs" style={{ color: "rgba(90,122,154,0.6)" }}>
              Análise demonstrativa — conecte uma chave de IA em Configurações para análise em tempo real.
            </p>
          )}
        </div>
      )}

      {/* Estado vazio — como funciona */}
      {!result && !loading && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Brain,     step: "01", title: "Cole a mensagem", desc: "Qualquer mensagem recebida no WhatsApp, Instagram ou e-mail." },
            { icon: Target,    step: "02", title: "IA analisa o perfil", desc: "Score de conversão, temperatura e diagnóstico psicológico do lead." },
            { icon: Send,      step: "03", title: "Resposta estratégica", desc: "Abordagem e gatilho personalizados para fechar esse lead específico." },
          ].map((s) => (
            <div
              key={s.step}
              className="rounded-2xl p-4"
              style={{ background: "#0f1b2f", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="font-serif text-2xl font-bold" style={{ color: "rgba(201,160,96,0.3)" }}>{s.step}</span>
                <s.icon size={16} style={{ color: "#C9A060" }} />
              </div>
              <p className="font-semibold text-white text-sm mb-1">{s.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "#5a7a9a" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
