"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Sparkles, TrendingUp, Flame, Snowflake, Sun, ArrowRight, ChevronRight,
  MessagesSquare, Send, ListChecks, History, Settings, Zap, Brain, Target } from "lucide-react";
import { getClinica, getBillingPlan } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { WelcomeOnboarding } from "@/components/welcome-onboarding";

const DashboardCharts = dynamic(
  () => import("@/components/dashboard-charts").then((mod) => mod.DashboardCharts),
  { ssr: false }
);

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function formatDate() {
  const d = new Date();
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

const MODULES = [
  { href: "/gerador",           label: "Gerador",           desc: "3 respostas no seu tom",          icon: Sparkles,       hot: true  },
  { href: "/lead-intelligence", label: "Lead Intelligence", desc: "Score e perfil de cada lead",     icon: Brain,          hot: true  },
  { href: "/objecoes",          label: "Objeções",          desc: "Respostas prontas para objeções", icon: MessagesSquare, hot: false },
  { href: "/follow-up",         label: "Follow-up",         desc: "Reative quem sumiu",              icon: Send,           hot: false },
  { href: "/scripts",           label: "Scripts",           desc: "Fluxos até o agendamento",        icon: ListChecks,     hot: false },
  { href: "/historico",         label: "Histórico",         desc: "Tudo que você já gerou",          icon: History,        hot: false },
  { href: "/configuracoes",     label: "Configurações",     desc: "DNA da sua clínica",              icon: Settings,       hot: false },
];

export default function DashboardPage() {
  const [nome, setNome] = useState("");
  const [plano, setPlano] = useState<"start" | "pro" | "premium">("start");
  const { theme } = useTheme();
  const isLight = theme === "light";
  const isPro = plano === "pro" || plano === "premium";

  useEffect(() => {
    getClinica().then((c) => setNome(c.nome_clinica || ""));
    getBillingPlan().then((plan) => setPlano(plan));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Onboarding do primeiro acesso ── */}
      <WelcomeOnboarding />

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs text-navy-100 uppercase tracking-widest mb-1">{formatDate()}</p>
          <h1 className="font-serif text-3xl font-semibold text-champagne-300">
            {getGreeting()}{nome ? `, ${nome}` : ""} ✦
          </h1>
          <p className="text-sm text-navy-100 mt-1">Pronta para converter mais hoje?</p>
        </div>
        <Link
          href="/gerador"
          className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-bold text-navy-900 shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-glow"
        >
          <Sparkles size={15} /> Gerar resposta
        </Link>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Respostas hoje */}
        <div className="rounded-2xl border border-navy-500 bg-navy-700 p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-100">Respostas hoje</span>
            <Zap size={16} className="text-gold-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-white">12</p>
          <p className="text-xs text-navy-100 mt-0.5">+3 vs ontem</p>
        </div>

        {/* Score médio — PRO / ou card de upgrade */}
        {isPro ? (
          <div
            className="relative rounded-2xl p-4 overflow-hidden"
            style={{
              background: isLight
                ? "linear-gradient(135deg, #FFFBF2 0%, #FFF8EA 100%)"
                : "linear-gradient(135deg, #1a1e0f 0%, #14180a 100%)",
              border: "1px solid rgba(201,160,96,0.45)",
              boxShadow: "0 0 20px rgba(201,160,96,0.12)",
            }}
          >
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(201,160,96,0.15) 0%, transparent 60%)" }} />
            <div className="relative flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#C9A060" }}>Score médio</span>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} style={{ color: "#C9A060" }} />
                <span className="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase"
                  style={{ background: "rgba(201,160,96,0.2)", color: "#C9A060", border: "1px solid rgba(201,160,96,0.3)" }}>PRO</span>
              </div>
            </div>
            <p className="relative font-serif text-3xl font-bold" style={{ color: "#C9A060" }}>74%</p>
            <p className="relative text-xs mt-0.5" style={{ color: isLight ? "#9A7A40" : "rgba(201,160,96,0.6)" }}>esta semana</p>
          </div>
        ) : (
          /* Plano Start — card de upgrade */
          <Link
            href="/configuracoes"
            className="group relative rounded-2xl p-4 overflow-hidden transition-all hover:-translate-y-0.5"
            style={{
              background: isLight ? "#FFFFFF" : "#0f1b2f",
              border: "1px solid rgba(201,160,96,0.2)",
            }}
          >
            {/* Shimmer no hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 60% 0%, rgba(201,160,96,0.06) 0%, transparent 70%)" }} />

            <div className="relative flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-100">Seu plano</span>
              <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                style={{ background: "rgba(107,140,174,0.15)", color: "#6B8CAE", border: "1px solid rgba(107,140,174,0.25)" }}>
                START
              </span>
            </div>

            <p className="relative font-serif text-xl font-bold text-white mb-1">R$97<span className="text-sm font-normal text-navy-100">/mês</span></p>

            <div className="relative flex items-center gap-1 mt-2 text-[11px] font-semibold transition-all group-hover:gap-2"
              style={{ color: "#C9A060" }}>
              <span>🔓 Ver planos Pro</span>
              <ChevronRight size={11} className="transition-transform group-hover:translate-x-0.5" />
            </div>

            <p className="relative text-[10px] mt-1 leading-snug" style={{ color: isLight ? "#9CA3AF" : "rgba(107,140,174,0.7)" }}>
              Score Médio + Lead Intelligence no Pro
            </p>
          </Link>
        )}

        {/* Leads quentes */}
        <div className="rounded-2xl border border-navy-500 bg-navy-700 p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-100">Leads quentes</span>
            <Flame size={16} className="text-orange-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-white">3</p>
          <p className="text-xs text-navy-100 mt-0.5">responda agora</p>
        </div>

        {/* Follow-ups feitos */}
        <div className="rounded-2xl border border-navy-500 bg-navy-700 p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-100">Follow-ups feitos</span>
            <Send size={16} className="text-blue-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-white">8</p>
          <p className="text-xs text-navy-100 mt-0.5">esta semana</p>
        </div>
      </div>

      {/* ── Lead Intelligence — card de destaque ── */}
      <Link
        href="/lead-intelligence"
        className="group relative flex flex-col sm:flex-row items-center gap-5 rounded-2xl p-5 sm:p-6 overflow-hidden transition-all hover:-translate-y-0.5"
        style={{
          background: isLight
            ? "linear-gradient(135deg, #FFFFFF 0%, #FBF9F5 100%)"
            : "linear-gradient(135deg, #0f1b2f 0%, #131f35 60%, #0d1a2e 100%)",
          border: "1px solid rgba(201,160,96,0.3)",
          boxShadow: isLight
            ? "0 2px 16px rgba(201,160,96,0.1)"
            : "0 0 40px rgba(201,160,96,0.06), 0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {/* Glow radial */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 90% 50%, rgba(201,160,96,0.08) 0%, transparent 60%)" }} />

        {/* Anel pulsante */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden sm:block pointer-events-none">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full animate-ping"
              style={{ background: "rgba(201,160,96,0.08)", animationDuration: "2.5s" }} />
            <div className="absolute inset-2 rounded-full"
              style={{ background: "rgba(201,160,96,0.06)", border: "1px solid rgba(201,160,96,0.2)" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain size={24} style={{ color: "#C9A060", filter: "drop-shadow(0 0 8px rgba(201,160,96,0.6))" }} />
            </div>
          </div>
        </div>

        {/* Ícone */}
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(201,160,96,0.2) 0%, rgba(201,160,96,0.08) 100%)",
            border: "1px solid rgba(201,160,96,0.3)",
            boxShadow: "0 0 20px rgba(201,160,96,0.2)",
          }}>
          <Brain size={28} style={{ color: "#C9A060" }} />
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-serif text-lg sm:text-xl font-semibold" style={{ color: isLight ? "#0A1628" : "#FFFFFF" }}>Lead Intelligence</p>
            <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0"
              style={{ background: "rgba(201,160,96,0.2)", border: "1px solid rgba(201,160,96,0.35)", color: "#C9A060" }}>
              PRO
            </span>
          </div>
          <p className="text-sm sm:pr-28" style={{ color: isLight ? "#6B7280" : "#8aacc8" }}>
            Cole a mensagem de uma cliente e descubra: score de conversão, perfil psicológico e a estratégia exata para fechar esse lead.
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-sm font-semibold transition-all group-hover:gap-2.5"
            style={{ color: "#C9A060" }}>
            <Target size={14} /> Analisar um lead agora
            <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>

      <DashboardCharts />

      {/* ── Grid de módulos ── */}
      <div>
        <p className="font-serif text-xl font-semibold text-champagne-300 mb-4">Módulos</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                "group relative flex items-center gap-4 rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft",
                m.hot
                  ? "border-gold-500/30 bg-gold-500/8 hover:border-gold-400/50"
                  : "border-navy-500 bg-navy-700 hover:border-navy-400"
              )}
            >
              {m.hot && (
                <span className="absolute right-3 top-3 rounded-full bg-gold-500/20 border border-gold-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold-400">
                  Popular
                </span>
              )}
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                m.hot ? "bg-gold-500/20" : "bg-navy-600"
              )}>
                <m.icon size={18} className={m.hot ? "text-gold-400" : "text-navy-100"} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-champagne-300 text-sm">{m.label}</p>
                <p className="text-xs text-navy-100 mt-0.5 leading-snug">{m.desc}</p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-navy-100 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── CTA mobile ── */}
      <div className="sm:hidden">
        <Link
          href="/gerador"
          className="flex items-center justify-center gap-2 rounded-2xl bg-gold-500 px-6 py-4 text-base font-bold text-navy-900 shadow-cta"
        >
          <Sparkles size={18} /> Gerar resposta agora
        </Link>
      </div>

    </div>
  );
}
