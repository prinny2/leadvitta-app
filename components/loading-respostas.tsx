"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  tone = "light",
}: {
  etapas?: string[];
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";
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
    <Card
      className={cn(
        "animate-fade-in",
        isDark ? "border-navy-500 bg-navy-700" : "border-brand-200"
      )}
    >
      <CardBody className="py-8">
        <div
          className={cn(
            "mb-4 flex items-center gap-2.5",
            isDark ? "text-gold-400" : "text-brand-700"
          )}
        >
          <Sparkles size={18} className="animate-pulse" />
          <span className="text-sm font-semibold transition-opacity">{etapasForRun[i]}</span>
        </div>
        <div
          className={cn(
            "h-1.5 w-full overflow-hidden rounded-full",
            isDark ? "bg-navy-500" : "bg-nude-200"
          )}
        >
          <div
            className={cn(
              "h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out",
              isDark ? "from-gold-400 to-champagne-300" : "from-brand-400 to-gold-500"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-5 space-y-2.5">
          {[0, 1, 2].map((n) => (
            <div
              key={n}
              className={cn(
                "h-12 animate-pulse rounded-xl",
                isDark ? "bg-navy-500/60" : "bg-nude-100"
              )}
              style={{ animationDelay: `${n * 150}ms` }}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
