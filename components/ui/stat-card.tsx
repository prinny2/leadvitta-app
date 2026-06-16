import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "brand" | "gold" | "pain";

const TONES: Record<Tone, { chip: string; value: string }> = {
  brand: { chip: "bg-brand-500 text-white", value: "text-ink" },
  gold: { chip: "bg-gold-500 text-brand-900", value: "text-ink" },
  pain: { chip: "bg-pain-500 text-white", value: "text-pain-600" },
};

/**
 * Cartão de métrica do cockpit. Mostra um número grande (dado vivo) com
 * ícone e rótulo — usa a paleta da landing (brand/gold/pain) para dar peso
 * visual e senso de urgência onde faz sentido.
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "brand",
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: Tone;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <div
      className={cn(
        "animate-fade-in rounded-2xl border border-brand-100 bg-white p-4 shadow-card",
        className
      )}
    >
      <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-xl", t.chip)}>
        <Icon size={18} />
      </div>
      <div className={cn("font-serif text-3xl font-semibold leading-none tabular-nums", t.value)}>
        {value}
      </div>
      <p className="mt-1.5 text-xs font-medium text-muted">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted/80">{hint}</p>}
    </div>
  );
}
