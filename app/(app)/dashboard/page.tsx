"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Sparkles,
  MessagesSquare,
  Send,
  ListChecks,
  History,
  Settings,
  ArrowRight,
  Flame,
  Snowflake,
  Sun,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { getClinica } from "@/lib/store";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "janeiro","fevereiro","março","abril","maio","junho",
  "julho","agosto","setembro","outubro","novembro","dezembro",
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function formatDate() {
  const d = new Date();
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

const modulos = [
  {
    href: "/gerador",
    title: "Gerador de Respostas",
    desc: "Cole a mensagem e receba 3 respostas no seu tom em segundos.",
    icon: Sparkles,
    destaque: true,
  },
  {
    href: "/objecoes",
    title: "Objeções Prontas",
    desc: "Respostas para "tá caro", "vou pensar", "na outra é mais barato".",
    icon: MessagesSquare,
  },
  {
    href: "/follow-up",
    title: "Follow-up Inteligente",
    desc: "Reative quem sumiu sem parecer insistente.",
    icon: Send,
  },
  {
    href: "/scripts",
    title: "Scripts de Atendimento",
    desc: "Fluxos completos do primeiro "oi" até o agendamento.",
    icon: ListChecks,
  },
  {
    href: "/historico",
    title: "Histórico",
    desc: "Tudo que você gerou salvo e pronto para reaproveitar.",
    icon: History,
  },
  {
    href: "/configuracoes",
    title: "DNA da Clínica",
    desc: "Configure uma vez — todas as respostas saem no seu tom.",
    icon: Settings,
  },
];

const dadosSemana = [4, 7, 3, 9, 6, 11, 8];
const maxSemana = Math.max(...dadosSemana);

export default function DashboardPage() {
  const [nome, setNome] = useState("");

  useEffect(() => {
    getClinica().then((c) => setNome(c.nome_clinica || ""));
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted mb-1">{formatDate()}</p>
          <h1 className="font-serif text-3xl font-semibold text-ink">
            {getGreeting()}{nome ? `, ${nome}` : ""} ✦
          </h1>
          <p className="text-sm text-muted mt-1">Pronta para converter mais hoje?</p>
        </div>
        <Link
          href="/gerador"
          className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-gold-400 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-cta"
        >
          <Sparkles size={15} />
          Gerar resposta
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-brand-500 p-4 sm:p-5 text-white shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-lavender-400 uppercase tracking-wide">Quentes</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/20">
              <Flame size={14} className="text-orange-400" />
            </span>
          </div>
          <p className="font-serif text-4xl font-bold text-white mb-1">3</p>
          <p className="text-xs text-lavender-400">Responda agora</p>
        </div>

        <div className="rounded-2xl bg-white border border-brand-100 p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wide">Mornos</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-100">
              <Sun size={14} className="text-gold-600" />
            </span>
          </div>
          <p className="font-serif text-4xl font-bold text-ink mb-1">7</p>
          <p className="text-xs text-muted">Conduza hoje</p>
        </div>

        <div className="rounded-2xl bg-white border border-brand-100 p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wide">Frias</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
              <Snowflake size={14} className="text-blue-400" />
            </span>
          </div>
          <p className="font-serif text-4xl font-bold text-ink mb-1">12</p>
          <p className="text-xs text-muted">Follow-up amanhã</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">Esta semana</p>
              <p className="font-serif text-lg font-semibold text-ink">Respostas geradas</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1">
              <TrendingUp size={12} className="text-brand-500" />
              <span className="text-xs font-semibold text-brand-500">+24%</span>
            </div>
          </div>
          <div className="flex items-end gap-2 h-24">
            {dadosSemana.map((val, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-brand-500 transition-all"
                  style={{ height: `${(val / maxSemana) * 80}px`, opacity: i === 5 ? 1 : 0.35 + (i * 0.1) }}
                />
                <span className="text-[10px] text-muted">{DIAS[i]}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-muted">
            <span className="font-semibold text-brand-500">48</span> respostas esta semana
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-brand-500 p-5 text-white shadow-soft">
          <div className="absolute -right-4 -top-4 opacity-5">
            <MessageSquare size={120} />
          </div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 px-3 py-1 text-xs font-bold text-gold-400 border border-gold-500/20 mb-3">
              <Sparkles size={11} /> LEAD INTELLIGENCE
            </span>
            <h3 className="font-serif text-xl font-semibold text-white mb-2">
              Saiba com quem falar primeiro
            </h3>
            <p className="text-sm text-lavender-300 leading-relaxed mb-4">
              Cada lead é analisada e classificada por prioridade.{" "}
              <span className="text-orange-400 font-semibold">🔥 Quente</span>,{" "}
              <span className="text-gold-400 font-semibold">🟡 Morna</span> ou{" "}
              <span className="text-blue-300 font-semibold">❄️ Fria</span> — sem precisar ler tudo.
            </p>
            <Link
              href="/gerador"
              className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-2 text-sm font-bold text-brand-900 transition-all hover:bg-gold-400"
            >
              Responder agora <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl font-semibold text-ink mb-4">Módulos</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modulos.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`group relative rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft ${
                  m.destaque
                    ? "border-gold-200 bg-gradient-to-br from-nude-50 to-gold-50"
                    : "border-brand-100 bg-white"
                }`}
              >
                {m.destaque && (
                  <span className="absolute top-4 right-4 rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-bold text-gold-600 border border-gold-200">
                    PRINCIPAL
                  </span>
                )}
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-gold-400">
                  <Icon size={18} />
                </div>
                <div className="flex items-center gap-1 font-serif text-base font-semibold text-ink mb-1">
                  {m.title}
                  <ArrowRight
                    size={14}
                    className="text-brand-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </div>
                <p className="text-sm text-muted leading-snug">{m.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="sm:hidden">
        <Link
          href="/gerador"
          className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-4 text-base font-bold text-gold-400 shadow-soft"
        >
          <Sparkles size={18} />
          Gerar resposta agora
        </Link>
      </div>

    </div>
  );
}
