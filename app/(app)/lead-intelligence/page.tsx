"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Brain,
  Sparkles,
  Loader2,
  TrendingUp,
  Target,
  Zap,
  ChevronRight,
  AlertCircle,
  Send,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import type { LeadIntelligenceResult } from "@/app/api/lead-intelligence/route";

// ── Theme tokens ──────────────────────────────────────────────────────────────
function useTokens() {
  const { theme } = useTheme();
  const light = theme === "light";
  return {
    light,
    // Surfaces
    surface: light ? "#FFFFFF" : "#0f1b2f",
    surfaceAlt: light ? "#F9F8F5" : "#131f35",
    surfaceSub: light ? "#F5F4F0" : "#0b1424",
    // Borders
    border: light ? "#E8E4DC" : "rgba(255,255,255,0.06)",
    borderGold: light ? "rgba(201,160,96,0.35)" : "rgba(201,160,96,0.25)",
    // Text
    textPrimary: light ? "#0A1628" : "#FFFFFF",
    textSecondary: light ? "#6B7280" : "#8aacc8",
    textMuted: light ? "#9CA3AF" : "#5a7a9a",
    // Ring track
    ringTrack: light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)",
    // Chip bg
    chipBg: light ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)",
    chipBorder: light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
  };
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({
  score,
  temperatura,
}: {
  score: number;
  temperatura: string;
}) {
  const tk = useTokens();
  const R = 70;
  const circ = 2 * Math.PI * R;
  const offset = circ - (score / 100) * circ;

  const ringColor =
    temperatura === "quente"
      ? "#F97316"
      : temperatura === "morno"
        ? "#C9A060"
        : "#6B8CAE";

  const tempLabel =
    temperatura === "quente"
      ? "Lead Quente 🔥"
      : temperatura === "morno"
        ? "Lead Morno ☀️"
        : "Lead Frio ❄️";

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={R}
          fill="none"
          stroke={tk.ringTrack}
          strokeWidth="12"
        />
        <circle
          cx="90"
          cy="90"
          r={R}
          fill="none"
          stroke={ringColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)",
            filter: `drop-shadow(0 0 8px ${ringColor}80)`,
          }}
        />
        <circle
          cx="90"
          cy="90"
          r={R}
          fill="none"
          stroke={ringColor}
          strokeWidth="2"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
          style={{
            opacity: 0.3,
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
        <text
          x="90"
          y="82"
          textAnchor="middle"
          fill={tk.textPrimary}
          fontSize="36"
          fontWeight="700"
          fontFamily="serif"
        >
          {score}
        </text>
        <text
          x="90"
          y="104"
          textAnchor="middle"
          fill={ringColor}
          fontSize="12"
          fontWeight="600"
        >
          SCORE
        </text>
      </svg>
      <span
        className="rounded-full px-4 py-1.5 text-sm font-bold"
        style={{
          background: `${ringColor}18`,
          border: `1px solid ${ringColor}45`,
          color: ringColor,
        }}
      >
        {tempLabel}
      </span>
    </div>
  );
}

// ── Radar chart ───────────────────────────────────────────────────────────────
function LeadRadar({ eixos }: { eixos: LeadIntelligenceResult["eixos"] }) {
  const { light } = useTokens();
  const data = [
    { axis: "Urgência", val: eixos.urgencia },
    { axis: "Intenção", val: eixos.intencao },
    { axis: "Confiança", val: eixos.confianca },
    { axis: "Receptiv.", val: eixos.receptividade },
    { axis: "Maturidade", val: eixos.maturidade },
  ];
  return (
    <ResponsiveContainer width="100%" height={230}>
      <RadarChart
        data={data}
        margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
      >
        <PolarGrid
          stroke={light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}
        />
        <PolarAngleAxis
          dataKey="axis"
          tick={{
            fill: light ? "#6B7280" : "#8aacc8",
            fontSize: 11,
            fontWeight: 600,
          }}
        />
        <Radar
          name="Lead"
          dataKey="val"
          stroke="#C9A060"
          strokeWidth={2}
          fill="#C9A060"
          fillOpacity={0.18}
          dot={{ fill: "#C9A060", r: 4, strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Insight card ──────────────────────────────────────────────────────────────
function InsightCard({
  icon: Icon,
  label,
  text,
  color,
  tk,
}: {
  icon: React.ElementType;
  label: string;
  text: string;
  color: string;
  tk: ReturnType<typeof useTokens>;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: `${color}0A`, border: `1px solid ${color}28` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `${color}20` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
        <p
          className="text-[10px] uppercase tracking-widest font-bold"
          style={{ color: `${color}BB` }}
        >
          {label}
        </p>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: tk.textPrimary }}>
        {text}
      </p>
    </div>
  );
}

// ── Exemplos ──────────────────────────────────────────────────────────────────
const EXEMPLOS = [
  "Oi! Quanto custa o botox? Achei caro no outro lugar",
  "Quero agendar uma avaliação, quando tem horário?",
  "Tenho medo de agulha, mas quero fazer harmonização",
  "Vi resultados incríveis nas fotos, isso funciona mesmo?",
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LeadIntelligencePage() {
  const router = useRouter();
  const tk = useTokens();
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
      setTimeout(
        () =>
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        100,
      );
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
    } catch {
      /**/
    }
    router.push("/gerador");
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      {/* ── Header ── */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 sm:p-7"
        style={{
          background: tk.light
            ? "linear-gradient(135deg, #FFFFFF 0%, #FBF9F5 100%)"
            : "linear-gradient(135deg, #0f1b2f 0%, #131f35 60%, #0d1a2e 100%)",
          border: `1px solid ${tk.borderGold}`,
          boxShadow: tk.light
            ? "0 2px 16px rgba(201,160,96,0.08)"
            : "0 0 60px rgba(201,160,96,0.06), 0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 90% 50%, rgba(201,160,96,0.07) 0%, transparent 60%)",
          }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(201,160,96,0.2) 0%, rgba(201,160,96,0.08) 100%)",
              border: "1px solid rgba(201,160,96,0.3)",
              boxShadow: "0 0 20px rgba(201,160,96,0.15)",
            }}
          >
            <Brain size={28} style={{ color: "#C9A060" }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1
                className="font-serif text-2xl sm:text-3xl font-semibold"
                style={{ color: tk.textPrimary }}
              >
                Lead Intelligence
              </h1>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: "rgba(201,160,96,0.18)",
                  border: "1px solid rgba(201,160,96,0.4)",
                  color: "#C9A060",
                }}
              >
                PRO
              </span>
            </div>
            <p className="text-sm" style={{ color: tk.textSecondary }}>
              Cole a mensagem da cliente e a IA revela o perfil, score de
              conversão e a estratégia ideal de resposta.
            </p>
          </div>
        </div>
      </div>

      {/* ── Input ── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: tk.surface, border: `1px solid ${tk.border}` }}
      >
        <label
          className="block text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: tk.textMuted }}
        >
          Mensagem da Cliente
        </label>

        {/* Exemplos */}
        <div className="flex flex-wrap gap-2 mb-3">
          {EXEMPLOS.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setMensagem(ex)}
              className="rounded-full px-3 py-1 text-xs transition-all hover:scale-105 hover:border-[rgba(201,160,96,0.4)]"
              style={{
                background: tk.chipBg,
                border: `1px solid ${tk.chipBorder}`,
                color: tk.textSecondary,
              }}
            >
              {ex.length > 38 ? ex.slice(0, 38) + "…" : ex}
            </button>
          ))}
        </div>

        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder={`Ex: "Quanto custa o botox? Vi que no lugar X é mais barato…"`}
          rows={4}
          className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all"
          style={{
            background: tk.surfaceAlt,
            border: `1px solid ${tk.border}`,
            color: tk.textPrimary,
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(201,160,96,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = tk.border)}
          onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && analisar()}
        />

        <div className="flex items-center justify-between mt-3 gap-3">
          <p className="text-xs" style={{ color: tk.textMuted }}>
            {mensagem.length > 0
              ? `${mensagem.length} caracteres`
              : "Ctrl+Enter para analisar"}
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
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Brain size={15} />
            )}
            {loading ? "Analisando…" : "Analisar Lead"}
          </button>
        </div>

        {error && (
          <div
            className="mt-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#F87171",
            }}
          >
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </div>

      {/* ── Resultado ── */}
      {result && (
        <div ref={resultRef} className="space-y-4 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Score ring + barras */}
            <div
              className="flex flex-col items-center justify-center rounded-2xl p-6 gap-4"
              style={{
                background: tk.surface,
                border: `1px solid ${tk.border}`,
              }}
            >
              <ScoreRing
                score={result.score}
                temperatura={result.temperatura}
              />
              <div className="w-full space-y-2">
                {(Object.entries(result.eixos) as [string, number][]).map(
                  ([key, val]) => {
                    const labels: Record<string, string> = {
                      urgencia: "Urgência",
                      intencao: "Intenção",
                      confianca: "Confiança",
                      receptividade: "Receptividade",
                      maturidade: "Maturidade",
                    };
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span
                          className="w-24 text-[11px] shrink-0"
                          style={{ color: tk.textMuted }}
                        >
                          {labels[key]}
                        </span>
                        <div
                          className="flex-1 h-1.5 rounded-full overflow-hidden"
                          style={{ background: tk.chipBg }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${val}%`,
                              background:
                                "linear-gradient(90deg, #6B8CAE, #C9A060)",
                              transition:
                                "width 1s cubic-bezier(0.34,1.56,0.64,1)",
                            }}
                          />
                        </div>
                        <span
                          className="w-8 text-[11px] text-right font-semibold shrink-0"
                          style={{ color: tk.textPrimary }}
                        >
                          {val}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Radar */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: tk.surface,
                border: `1px solid ${tk.border}`,
              }}
            >
              <p
                className="text-[10px] uppercase tracking-widest font-bold mb-2"
                style={{ color: tk.textMuted }}
              >
                Radar de Perfil
              </p>
              <LeadRadar eixos={result.eixos} />
            </div>
          </div>

          {/* Insights */}
          <div className="grid gap-3 sm:grid-cols-3">
            <InsightCard
              icon={Target}
              label="Perfil do Lead"
              text={result.perfil}
              color="#C9A060"
              tk={tk}
            />
            <InsightCard
              icon={TrendingUp}
              label="Melhor Abordagem"
              text={result.abordagem}
              color="#6B8CAE"
              tk={tk}
            />
            <InsightCard
              icon={Zap}
              label="Gatilho de Venda"
              text={result.gatilho}
              color="#A0C9A0"
              tk={tk}
            />
          </div>

          {/* CTA */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl p-5"
            style={{
              background: tk.light
                ? "linear-gradient(135deg, rgba(201,160,96,0.06) 0%, rgba(201,160,96,0.02) 100%)"
                : "linear-gradient(135deg, rgba(201,160,96,0.1) 0%, rgba(201,160,96,0.04) 100%)",
              border: `1px solid ${tk.borderGold}`,
            }}
          >
            <div>
              <p className="font-semibold" style={{ color: tk.textPrimary }}>
                Pronta para responder?
              </p>
              <p className="text-sm mt-0.5" style={{ color: tk.textSecondary }}>
                Gere as 3 variantes de resposta no seu tom e com a estratégia
                certa para esse lead.
              </p>
            </div>
            <button
              type="button"
              onClick={irParaGerador}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5"
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
            <p className="text-center text-xs" style={{ color: tk.textMuted }}>
              Análise demonstrativa — conecte uma chave de IA em Configurações
              para análise em tempo real.
            </p>
          )}
        </div>
      )}

      {/* ── Estado vazio ── */}
      {!result && !loading && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: Brain,
              step: "01",
              title: "Cole a mensagem",
              desc: "Qualquer mensagem recebida no WhatsApp, Instagram ou e-mail.",
            },
            {
              icon: Target,
              step: "02",
              title: "IA analisa o perfil",
              desc: "Score de conversão, temperatura e diagnóstico psicológico do lead.",
            },
            {
              icon: Send,
              step: "03",
              title: "Resposta estratégica",
              desc: "Abordagem e gatilho personalizados para fechar esse lead específico.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="rounded-2xl p-5"
              style={{
                background: tk.surface,
                border: `1px solid ${tk.border}`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="font-serif text-2xl font-bold"
                  style={{ color: "rgba(201,160,96,0.35)" }}
                >
                  {s.step}
                </span>
                <s.icon size={16} style={{ color: "#C9A060" }} />
              </div>
              <p
                className="font-semibold text-sm mb-1"
                style={{ color: tk.textPrimary }}
              >
                {s.title}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: tk.textSecondary }}
              >
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
