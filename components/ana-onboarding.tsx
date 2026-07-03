"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Ana — a guia de boas-vindas do LeadBellus.
 * Aparece enquanto o DNA da clínica não foi concluído (onboarded=false) e
 * conduz a pessoa pelos 3 primeiros passos, em tom de conversa de WhatsApp.
 */

function AnaAvatar() {
  return (
    <div className="relative shrink-0">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold-400/60 bg-gradient-to-br from-gold-500/30 to-gold-500/10">
        <span className="font-serif text-lg font-bold text-gold-300">A</span>
      </div>
      {/* bolinha de "online", como no WhatsApp */}
      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-navy-800 bg-green-400" />
    </div>
  );
}

type AnaOnboardingProps = {
  /** Percentual do DNA preenchido (0–100). */
  dnaPct: number;
  /** Nome da clínica, se já preenchido, pra Ana chamar pelo nome. */
  nomeClinica?: string;
  className?: string;
};

export function AnaOnboarding({ dnaPct, nomeClinica, className }: AnaOnboardingProps) {
  const passos = [
    {
      titulo: "Conte da sua clínica",
      detalhe: "Nome, cidade, procedimentos e tom — é o formulário aqui embaixo.",
      feito: dnaPct >= 100,
    },
    {
      titulo: "Salve o DNA",
      detalhe: "Um clique em “Salvar” e todas as respostas saem com a sua cara.",
      feito: false,
    },
    {
      titulo: "Gere sua primeira resposta",
      detalhe: "Cole uma mensagem real de cliente no Gerador e veja a mágica.",
      feito: false,
    },
  ];

  return (
    <section
      aria-label="Boas-vindas da Ana"
      className={cn(
        "overflow-hidden rounded-2xl border border-gold-500/25 bg-navy-800",
        className
      )}
    >
      <div className="flex items-start gap-3 px-5 py-4 sm:px-6">
        <AnaAvatar />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">
            Ana <span className="font-normal text-champagne-300">· sua guia no LeadBellus</span>
          </p>
          <div className="mt-2 rounded-2xl rounded-tl-md bg-navy-700/40 px-4 py-3">
            <p className="text-sm leading-relaxed text-champagne-100">
              Oi{nomeClinica ? `, ${nomeClinica}` : ""}! 👋 Eu sou a Ana e vou te
              acompanhar nos primeiros passos. Me conta da sua clínica aqui
              embaixo — leva menos de 2 minutos e as respostas já saem no seu
              tom, sem cara de robô.
            </p>
          </div>
        </div>
      </div>

      <ol className="grid gap-2 border-t border-brand-50 px-5 py-4 sm:grid-cols-3 sm:px-6">
        {passos.map((p, i) => (
          <li key={p.titulo} className="flex items-start gap-2.5">
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                p.feito
                  ? "bg-green-500/20 text-green-300"
                  : "bg-gold-500/15 text-gold-300"
              )}
            >
              {p.feito ? <Check size={13} /> : i + 1}
            </span>
            <div>
              <p className="text-xs font-semibold text-white">{p.titulo}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-navy-100">{p.detalhe}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-50 bg-navy-700/20 px-5 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-navy-700/50">
            <div
              className="h-full rounded-full bg-gold-400 transition-all"
              style={{ width: `${Math.max(dnaPct, 6)}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-champagne-300">
            DNA {dnaPct}% completo
          </span>
        </div>
        <Link
          href="/gerador"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-300 hover:text-gold-200"
        >
          Já salvei — ir pro Gerador <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
