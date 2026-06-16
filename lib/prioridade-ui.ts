import type { Prioridade } from "@/lib/types";

/** Apresentação dos selos de prioridade do inbox (fonte única — lista e thread). */
export const PRIO: Record<Prioridade, { emoji: string; label: string; cls: string }> = {
  quente: { emoji: "🔥", label: "Quente", cls: "bg-red-100 text-red-700" },
  morno: { emoji: "🌤️", label: "Morna", cls: "bg-amber-100 text-amber-700" },
  frio: { emoji: "❄️", label: "Fria", cls: "bg-sky-100 text-sky-700" },
};
