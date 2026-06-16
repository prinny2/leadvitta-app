"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";

const ETAPAS = [
  "Lendo a mensagem da cliente…",
  "Analisando intenção e temperatura…",
  "Escrevendo 3 respostas no seu tom…",
  "Conferindo a conformidade…",
];

/**
 * Estado de carregamento "vivo": mostra as etapas da IA em sequência com
 * uma barra de progresso, em vez de um spinner mudo. Dá a sensação de que
 * tem inteligência trabalhando por trás.
 */
export function LoadingRespostas({ etapas = ETAPAS }: { etapas?: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setI((prev) => (prev < etapas.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(t);
  }, [etapas.length]);

  const pct = Math.round(((i + 1) / etapas.length) * 100);

  return (
    <Card className="animate-fade-in border-brand-200">
      <CardBody className="py-8">
        <div className="mb-4 flex items-center gap-2.5 text-brand-700">
          <Sparkles size={18} className="animate-pulse" />
          <span className="text-sm font-semibold transition-opacity">{etapas[i]}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-nude-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-gold-500 transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-5 space-y-2.5">
          {[0, 1, 2].map((n) => (
            <div
              key={n}
              className="h-12 animate-pulse rounded-xl bg-nude-100"
              style={{ animationDelay: `${n * 150}ms` }}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
