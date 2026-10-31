import { cn } from "@/lib/utils";

type Variant = "pain" | "brand" | "gold" | "neutral";

const variants: Record<Variant, string> = {
  // Gancho de dor / perda — equivale ao `.badge-pain` do globals.css.
  pain: "bg-pain-500/15 text-pain-300",
  // Marca / informativo.
  brand: "bg-navy-600 text-champagne-300",
  // Destaque / conversão.
  gold: "bg-gold-500/15 text-gold-300",
  // Neutro / metadado.
  neutral: "bg-navy-700 text-navy-50",
};

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

/**
 * Selo curto (rótulo, status, gancho). Pílula com a paleta da marca.
 * Substitui a classe utilitária `.badge-pain` por uma primitiva com variantes.
 */
export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
