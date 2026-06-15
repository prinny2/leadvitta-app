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
} from "lucide-react";
import { getClinica } from "@/lib/store";
import { cn } from "@/lib/utils";

const cards = [
  {
    href: "/gerador",
    title: "Gerador de Respostas",
    desc: "Transforme a mensagem da cliente em 3 respostas prontas para enviar.",
    icon: Sparkles,
    primary: true,
  },
  {
    href: "/objecoes",
    title: "Objeções Prontas",
    desc: "Respostas para 'tá caro', 'dói?', 'vou pensar', 'tem desconto?'...",
    icon: MessagesSquare,
  },
  {
    href: "/follow-up",
    title: "Follow-up",
    desc: "Reative quem sumiu ou não fechou, sem parecer insistente.",
    icon: Send,
  },
  {
    href: "/scripts",
    title: "Scripts de Atendimento",
    desc: "Fluxos prontos para conduzir a conversa até o agendamento.",
    icon: ListChecks,
  },
  {
    href: "/historico",
    title: "Histórico",
    desc: "Tudo o que você já gerou fica salvo e fácil de reaproveitar.",
    icon: History,
  },
  {
    href: "/configuracoes",
    title: "Configurações",
    desc: "Dados da sua clínica, procedimentos e tom de voz padrão.",
    icon: Settings,
  },
];

export default function DashboardPage() {
  const [nome, setNome] = useState("");
  useEffect(() => {
    getClinica().then((c) => setNome(c.nome_clinica || ""));
  }, []);

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm text-muted">
          Bem-vinda{nome ? `, ${nome}` : ""} 💕
        </p>
        <h1 className="font-serif text-3xl font-semibold text-ink">
          O que vamos responder hoje?
        </h1>
      </header>

      {/* Prioridade de leads — explicado em linguagem simples */}
      <div className="mb-8 rounded-3xl bg-brand-dark p-8 text-white shadow-soft overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
           <Sparkles size={120} />
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lavender-400/20 px-3 py-1 text-xs font-bold text-lavender-300 mb-4 border border-lavender-400/30">
            <Sparkles size={14} /> COM QUEM FALAR PRIMEIRO
          </span>
          <h2 className="text-2xl font-serif font-semibold mb-3">
            Saiba na hora quem está quase fechando
          </h2>
          <p className="text-nude-200 text-sm leading-relaxed mb-5">
            Cada mensagem que chega no seu WhatsApp a gente lê e organiza pra você:
            marca quem está pronta pra agendar, quem ainda está na dúvida e quem
            esfriou. Assim você responde primeiro quem tem mais chance de fechar —
            sem ler tudo e sem deixar ninguém escapar.
          </p>
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              🔥 Quente · quer fechar agora
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              🌤️ Morna · ainda na dúvida
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              ❄️ Fria · sumiu por enquanto
            </span>
          </div>
          <Link
            href="/gerador"
            className="inline-flex items-center gap-2 bg-lavender-400 px-5 py-2.5 rounded-xl text-brand-900 font-bold text-sm hover:bg-lavender-300 transition-colors"
          >
            Responder agora <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className={cn(
                "group rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft",
                c.primary
                  ? "border-brand-200 bg-gradient-to-br from-brand-50 to-lavender-50"
                  : "border-brand-100 bg-white"
              )}
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white">
                <Icon size={20} />
              </div>
              <div className="flex items-center gap-1 font-serif text-lg font-semibold text-ink">
                {c.title}
                <ArrowRight
                  size={16}
                  className="text-brand-500 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
                />
              </div>
              <p className="mt-1 text-sm text-muted">{c.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
