"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Sparkles, TrendingUp, Flame, Snowflake, Sun, ArrowRight, ChevronRight,
  MessagesSquare, Send, ListChecks, History, Settings, Zap } from "lucide-react";
import { getClinica } from "@/lib/store";
import { cn } from "@/lib/utils";

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

// Dados mock para os gráficos
const dadosSemanais = [
  { dia: "Seg", respostas: 4, score: 62 },
  { dia: "Ter", respostas: 7, score: 70 },
  { dia: "Qua", respostas: 5, score: 58 },
  { dia: "Qui", respostas: 9, score: 82 },
  { dia: "Sex", respostas: 12, score: 76 },
  { dia: "Sáb", respostas: 8, score: 85 },
  { dia: "Dom", respostas: 3, score: 68 },
];

const dadosProcedimentos = [
  { nome: "Botox",       qtd: 18 },
  { nome: "Preench.",    qtd: 14 },
  { nome: "Harmoniz.",   qtd: 11 },
  { nome: "Skin Care",   qtd: 8  },
  { nome: "Fios",        qtd: 6  },
  { nome: "Outros",      qtd: 4  },
];

const dadosLeads = [
  { name: "Quentes", value: 3,  color: "#F97316" },
  { name: "Mornos",  value: 7,  color: "#C9A060" },
  { name: "Frias",   value: 12, color: "#6B8CAE" },
];

const dadosSituacoes = [
  { sit: "Preço",       qtd: 22 },
  { sit: "Medo",        qtd: 14 },
  { sit: "Confiança",   qtd: 10 },
  { sit: "Agendamento", qtd: 8  },
  { sit: "Pós-venda",   qtd: 4  },
];

const MODULES = [
  { href: "/gerador",       label: "Gerador",       desc: "3 respostas no seu tom",          icon: Sparkles,      hot: true  },
  { href: "/objecoes",      label: "Objeções",       desc: "Respostas prontas para objeções", icon: MessagesSquare, hot: false },
  { href: "/follow-up",     label: "Follow-up",      desc: "Reative quem sumiu",              icon: Send,          hot: false },
  { href: "/scripts",       label: "Scripts",        desc: "Fluxos até o agendamento",        icon: ListChecks,    hot: false },
  { href: "/historico",     label: "Histórico",      desc: "Tudo que você já gerou",          icon: History,       hot: false },
  { href: "/configuracoes", label: "Configurações",  desc: "DNA da sua clínica",              icon: Settings,      hot: false },
];

// Tooltip customizado dark
function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-navy-500 bg-navy-700 px-3 py-2 shadow-navy-lg text-xs">
      <p className="text-navy-100 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [nome, setNome] = useState("");

  useEffect(() => {
    getClinica().then((c) => setNome(c.nome_clinica || ""));
  }, []);

  const totalLeads = dadosLeads.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-6 animate-fade-in">

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
        {[
          { label: "Respostas hoje",    value: "12",  sub: "+3 vs ontem",       icon: Zap,       color: "text-gold-400"   },
          { label: "Score médio",       value: "74%", sub: "esta semana",        icon: TrendingUp, color: "text-green-400" },
          { label: "Leads quentes",     value: "3",   sub: "responda agora",     icon: Flame,      color: "text-orange-400"},
          { label: "Follow-ups feitos", value: "8",   sub: "esta semana",        icon: Send,       color: "text-blue-400"  },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-navy-500 bg-navy-700 p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-100">{kpi.label}</span>
              <kpi.icon size={16} className={kpi.color} />
            </div>
            <p className={cn("font-serif text-3xl font-bold", kpi.color)}>{kpi.value}</p>
            <p className="text-xs text-navy-100 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Gráficos linha 1 ── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Área — Respostas por dia */}
        <div className="lg:col-span-2 rounded-2xl border border-navy-500 bg-navy-700 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-100">Esta semana</p>
              <p className="font-serif text-base font-semibold text-champagne-300">Respostas geradas</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 border border-green-500/25 px-2.5 py-1 text-xs font-semibold text-green-400">
              <TrendingUp size={11} /> +24%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={dadosSemanais} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C9A060" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#C9A060" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="dia" tick={{ fill: "#6B8CAE", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B8CAE", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Area type="monotone" dataKey="respostas" name="Respostas" stroke="#C9A060" strokeWidth={2.5} fill="url(#goldGrad)" dot={{ fill: "#C9A060", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#D4A84A" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut — Temperatura dos leads */}
        <div className="rounded-2xl border border-navy-500 bg-navy-700 p-5 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-100 mb-1">Temperatura</p>
          <p className="font-serif text-base font-semibold text-champagne-300 mb-3">Seus leads</p>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={dadosLeads} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {dadosLeads.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-1">
            {dadosLeads.map((l) => (
              <div key={l.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-navy-100">{l.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-champagne-300">{l.value}</span>
                  <span className="text-navy-100">{Math.round(l.value / totalLeads * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Gráficos linha 2 ── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Barras — Procedimentos */}
        <div className="rounded-2xl border border-navy-500 bg-navy-700 p-5 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-100 mb-1">Mais consultados</p>
          <p className="font-serif text-base font-semibold text-champagne-300 mb-4">Procedimentos</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dadosProcedimentos} margin={{ top: 0, right: 0, bottom: 0, left: -20 }} barSize={14}>
              <defs>
                <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#D4A84A" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#6B8CAE" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="nome" tick={{ fill: "#6B8CAE", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B8CAE", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="qtd" name="Consultas" fill="url(#barGold)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Linha — Score médio */}
        <div className="rounded-2xl border border-navy-500 bg-navy-700 p-5 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-100 mb-1">Qualidade das respostas</p>
          <p className="font-serif text-base font-semibold text-champagne-300 mb-4">Score médio de conversão</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={dadosSemanais} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="lineGold" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#6B8CAE"/>
                  <stop offset="100%" stopColor="#C9A060"/>
                </linearGradient>
              </defs>
              <XAxis dataKey="dia" tick={{ fill: "#6B8CAE", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fill: "#6B8CAE", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Line type="monotone" dataKey="score" name="Score" stroke="url(#lineGold)" strokeWidth={2.5} dot={{ fill: "#C9A060", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Barras horizontais — Situações ── */}
      <div className="rounded-2xl border border-navy-500 bg-navy-700 p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-100 mb-1">Onde você mais precisa de ajuda</p>
            <p className="font-serif text-base font-semibold text-champagne-300">Situações mais geradas</p>
          </div>
        </div>
        <div className="space-y-3">
          {dadosSituacoes.map((s, i) => {
            const max = dadosSituacoes[0].qtd;
            const pct = Math.round(s.qtd / max * 100);
            return (
              <div key={s.sit} className="flex items-center gap-3">
                <span className="w-24 text-xs text-navy-100 shrink-0">{s.sit}</span>
                <div className="flex-1 h-2 rounded-full bg-navy-600 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, #6B8CAE ${i * 15}%, #C9A060 100%)`,
                    }}
                  />
                </div>
                <span className="w-6 text-xs font-semibold text-champagne-300 shrink-0 text-right">{s.qtd}</span>
              </div>
            );
          })}
        </div>
      </div>

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
