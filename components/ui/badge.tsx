import { cn } from "@/lib/utils";

type Variant = "pain" | "brand" | "gold" | "neutral";

const variants: Record<Variant, string> = {
  // Gancho de dor / perda — equivale ao `.badge-pain` do globals.css.
  pain: "bg-pain-100 text-pain-600",
  // Marca / informativo.
  brand: "bg-brand-100 text-brand-700",
  // Destaque / conversão.
  gold: "bg-gold-100 text-gold-700",
  // Neutro / metadado.
  neutral: "bg-nude-100 text-muted",
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
