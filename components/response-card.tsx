import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

export function ResponseCard({
  titulo,
  descricao,
  texto,
  accent = "brand",
  tone = "light",
}: {
  titulo: string;
  descricao?: string;
  texto: string;
  accent?: "brand" | "lavender";
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-card transition-shadow hover:shadow-soft",
        dark ? "border-navy-500 bg-navy-700" : "border-brand-100 bg-white",
      )}
    >
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div>
          <div
            className={cn(
              "text-sm font-semibold",
              dark
                ? "text-gold-400"
                : accent === "lavender"
                  ? "text-lavender-600"
                  : "text-brand-600",
            )}
          >
            {titulo}
          </div>
          {descricao && (
            <div
              className={cn("text-xs", dark ? "text-navy-100" : "text-muted")}
            >
              {descricao}
            </div>
          )}
        </div>
        <CopyButton text={texto} />
      </div>
      <p
        className={cn(
          "whitespace-pre-wrap text-sm leading-relaxed",
          dark ? "text-champagne-300" : "text-ink",
        )}
      >
        {texto}
      </p>
    </div>
  );
}
