import type { Prioridade } from "@/lib/types";

/** Apresentação dos selos de prioridade do inbox (fonte única — lista e thread). */
export const PRIO: Record<Prioridade, { emoji: string; label: string; cls: string }> = {
  quente: { emoji: "🔥", label: "Quente", cls: "bg-red-100 text-red-700" },
  morno: { emoji: "🌤️", label: "Morna", cls: "bg-amber-100 text-amber-700" },
  frio: { emoji: "❄️", label: "Fria", cls: "bg-sky-100 text-sky-700" },
};

/**
 * Deriva a prioridade do score (0–100). Espelha `prioridadeDoScore` de
 * `lib/conversas.ts` (lá é só-servidor); aqui é client-safe para UI.
 */
export function prioridadeFromScore(score?: number | null): Prioridade {
  if (typeof score !== "number") return "frio";
  if (score > 70) return "quente";
  if (score > 40) return "morno";
  return "frio";
}
