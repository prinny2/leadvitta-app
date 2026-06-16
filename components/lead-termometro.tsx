"use client";

import { cn } from "@/lib/utils";
import { PRIO, prioridadeFromScore } from "@/lib/prioridade-ui";

/**
 * Termômetro visual do lead — celebra a "Lead Intelligence" da landing page
 * dentro do app. Mostra a temperatura (🔥/🌤️/❄️), uma barra colorida com
 * marcador na posição do score e o valor em %.
 *
 * Reutilizável no Gerador (tone="light") e no cockpit do Dashboard
 * (tone="dark", sobre o fundo brand-dark).
 */
export function LeadTermometro({
  score,
  tone = "light",
  className,
}: {
  score?: number;
  tone?: "light" | "dark";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(score ?? 0)));
  const prio = prioridadeFromScore(score);
  const p = PRIO[prio];
  const dark = tone === "dark";

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-end justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
            dark ? "bg-white/12 text-white" : p.cls
          )}
        >
          <span className="text-sm leading-none">{p.emoji}</span>
          {p.label}
        </span>
        <span
          className={cn(
            "font-serif text-2xl font-semibold leading-none tabular-nums",
            dark ? "text-white" : "text-ink"
          )}
        >
          {pct}
          <span className={cn("text-sm", dark ? "text-nude-200" : "text-muted")}>%</span>
        </span>
      </div>

      {/* Barra: frio (sky) → morno (amber) → quente (red) */}
      <div className="relative">
        <div
          className={cn(
            "h-2.5 w-full overflow-hidden rounded-full",
            dark ? "bg-white/15" : "bg-nude-200"
          )}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-red-500 transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* Marcador na posição do score */}
        <div
          className={cn(
            "absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-sm transition-[left] duration-700 ease-out",
            dark ? "border-brand-dark bg-white" : "border-white bg-ink"
          )}
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}
