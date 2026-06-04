import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

export function ResponseCard({
  titulo,
  descricao,
  texto,
  accent = "brand",
}: {
  titulo: string;
  descricao?: string;
  texto: string;
  accent?: "brand" | "lavender";
}) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card transition-shadow hover:shadow-soft">
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div>
          <div
            className={cn(
              "text-sm font-semibold",
              accent === "lavender" ? "text-lavender-600" : "text-brand-600"
            )}
          >
            {titulo}
          </div>
          {descricao && (
            <div className="text-xs text-muted">{descricao}</div>
          )}
        </div>
        <CopyButton text={texto} />
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
        {texto}
      </p>
    </div>
  );
}
