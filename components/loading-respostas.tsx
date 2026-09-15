"use client";

import { useEffect, useMemo, useState } from "react";
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
export function LoadingRespostas({
  etapas = ETAPAS,
}: {
  etapas?: string[];
}) {
  const [i, setI] = useState(0);
  const etapasAtivas = etapas.length > 0 ? etapas : ETAPAS;
  const etapasSignature = etapasAtivas.join("\u0000");
  const etapasForRun = useMemo(() => etapasAtivas, [etapasSignature]);

  useEffect(() => {
    setI(0);
    if (etapasForRun.length <= 1) return;

    const t = setInterval(() => {
      setI((prev) => {
        const next = prev < etapasForRun.length - 1 ? prev + 1 : prev;
        if (next >= etapasForRun.length - 1) {
          clearInterval(t);
        }
        return next;
      });
    }, 1100);

    return () => clearInterval(t);
  }, [etapasForRun]);

  const pct = Math.round(((i + 1) / etapasForRun.length) * 100);

  return (
    <Card className="animate-fade-in">
      <CardBody className="py-8">
        <div
          className="mb-4 flex items-center gap-2.5 text-gold-300"
          role="status"
          aria-live="polite"
        >
          <Sparkles size={18} className="animate-pulse" aria-hidden="true" />
          <span className="text-sm font-semibold transition-opacity">{etapasForRun[i]}</span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-gold-500/15"
          role="progressbar"
          aria-label="Progresso da geração"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-700 to-gold-400 transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-5 space-y-2.5" aria-hidden="true">
          {[0, 1, 2].map((n) => (
            <div
              key={n}
              className="h-12 animate-pulse rounded-xl bg-gold-500/10"
              style={{ animationDelay: `${n * 150}ms` }}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
