"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  X,
  Settings,
  MessageSquare,
  Copy,
  ArrowRight,
} from "lucide-react";

const KEY = "lb_onboarding_dismissed_v1";

const STEPS = [
  {
    icon: Settings,
    title: "Configure o tom da sua clínica",
    desc: "1 minuto — pra cada resposta sair com a sua voz.",
  },
  {
    icon: MessageSquare,
    title: "Cole uma conversa no Gerador",
    desc: 'Veja na hora a resposta certa pra preço, "achou caro" ou cliente que sumiu.',
  },
  {
    icon: Copy,
    title: "Copie e cole no WhatsApp",
    desc: "Pronto — você respondeu rápido e no ponto.",
  },
];

/**
 * Card de boas-vindas do primeiro acesso. Tira a sensação de "cadastrei e caí
 * no dashboard sem saber o que fazer": mostra os 3 passos até a primeira
 * resposta e leva direto ao Gerador. Some após dispensar (localStorage).
 */
export function WelcomeOnboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // localStorage indisponível: apenas esconde nesta sessão
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold-500/30 bg-gold-500/8 p-5 sm:p-6 animate-fade-in">
      <button
        onClick={dismiss}
        aria-label="Fechar boas-vindas"
        className="absolute right-4 top-4 text-navy-100 transition-colors hover:text-champagne-300"
      >
        <X size={18} />
      </button>

      <div className="mb-1 flex items-center gap-2">
        <Sparkles size={18} className="text-gold-400" />
        <h2 className="font-serif text-xl font-semibold text-champagne-300">
          Bem-vinda ao LeadBellus ✦
        </h2>
      </div>
      <p className="mb-4 text-sm text-navy-100">
        Sua primeira resposta certa no WhatsApp em 3 passos:
      </p>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className="rounded-xl border border-navy-500 bg-navy-700/60 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/20 text-[11px] font-bold text-gold-400">
                {i + 1}
              </span>
              <s.icon size={15} className="text-gold-400" />
            </div>
            <p className="text-sm font-semibold leading-snug text-champagne-300">
              {s.title}
            </p>
            <p className="mt-1 text-xs leading-snug text-navy-100">{s.desc}</p>
          </div>
        ))}
      </div>

      <Link
        href="/gerador"
        onClick={dismiss}
        className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-900 shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-glow"
      >
        <Sparkles size={15} /> Gerar minha primeira resposta
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}
