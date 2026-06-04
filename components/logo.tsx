import Link from "next/link";
import { Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Marca LeadVitta — flor dourada sobre verde-escuro.
 * Placeholder fiel à identidade; troque por um <svg> com o logo oficial quando tiver.
 */
export function LogoMark({
  size = 18,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-xl bg-brand-800 text-lavender-400",
        className
      )}
    >
      <Flower2 size={size} strokeWidth={1.6} />
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-serif font-semibold tracking-tight", className)}>
      Lead<span className="text-lavender-600">Vitta</span>
    </span>
  );
}

export function Logo({
  href = "/dashboard",
  markSize = 18,
  markClass = "h-9 w-9",
  textClass = "text-base text-ink",
}: {
  href?: string;
  markSize?: number;
  markClass?: string;
  textClass?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <LogoMark size={markSize} className={markClass} />
      <Wordmark className={textClass} />
    </Link>
  );
}
