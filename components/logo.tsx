import Link from "next/link";
import { Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "flex items-center justify-center rounded-xl bg-brand-800 text-gold-400",
        className,
      )}
    >
      <Flower2 size={size} strokeWidth={1.6} />
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-serif font-semibold tracking-tight", className)}>
      Lead<span className="text-gold-600">Bellus</span>
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
