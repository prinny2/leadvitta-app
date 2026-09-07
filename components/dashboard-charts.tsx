"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

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
  { nome: "Botox", qtd: 18 },
  { nome: "Preench.", qtd: 14 },
  { nome: "Harmoniz.", qtd: 11 },
  { nome: "Skin Care", qtd: 8 },
  { nome: "Fios", qtd: 6 },
  { nome: "Outros", qtd: 4 },
];

const dadosLeads = [
  { name: "Quentes", value: 3, color: "#F97316" },
  { name: "Mornos", value: 7, color: "#C9A060" },
  { name: "Frias", value: 12, color: "#6B8CAE" },
];

const dadosSituacoes = [
  { sit: "Preço", qtd: 22 },
  { sit: "Medo", qtd: 14 },
  { sit: "Confiança", qtd: 10 },
  { sit: "Agendamento", qtd: 8 },
  { sit: "Pós-venda", qtd: 4 },
];

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

export function DashboardCharts() {
  const totalLeads = dadosLeads.reduce((a, b) => a + b.value, 0);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
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
                  <stop offset="5%" stopColor="#C9A060" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#C9A060" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="dia" tick={{ fill: "#6B8CAE", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B8CAE", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Area type="monotone" dataKey="respostas" name="Respostas" stroke="#C9A060" strokeWidth={2.5} fill="url(#goldGrad)" dot={{ fill: "#C9A060", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#D4A84A" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

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
                  <span className="text-navy-100">{Math.round((l.value / totalLeads) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy-500 bg-navy-700 p-5 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-100 mb-1">Mais consultados</p>
          <p className="font-serif text-base font-semibold text-champagne-300 mb-4">Procedimentos</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dadosProcedimentos} margin={{ top: 0, right: 0, bottom: 0, left: -20 }} barSize={14}>
              <defs>
                <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A84A" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6B8CAE" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <XAxis dataKey="nome" tick={{ fill: "#6B8CAE", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B8CAE", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="qtd" name="Consultas" fill="url(#barGold)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-navy-500 bg-navy-700 p-5 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-100 mb-1">Qualidade das respostas</p>
          <p className="font-serif text-base font-semibold text-champagne-300 mb-4">Score médio de conversão</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={dadosSemanais} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="lineGold" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6B8CAE" />
                  <stop offset="100%" stopColor="#C9A060" />
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
            const pct = Math.round((s.qtd / max) * 100);
            return (
              <div key={s.sit} className="flex items-center gap-3">
                <span className="w-24 text-xs text-navy-100 shrink-0">{s.sit}</span>
                <div className="flex-1 h-2.5 rounded-full bg-navy-600 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full transition-all"
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
    </>
  );
}
