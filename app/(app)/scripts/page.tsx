import { Clock } from "lucide-react";
import { scripts } from "@/data/scripts";
import { CopyButton } from "@/components/copy-button";
import { PrintButton } from "@/components/print-button";

export const metadata = { title: "Scripts de Atendimento — LeadBellus" };

export default function ScriptsPage() {
  return (
    <div>
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink">
            Scripts de Atendimento
          </h1>
          <p className="text-sm text-muted">
            Fluxos prontos que conduzem a conversa até o agendamento. A cliente
            não compra uma resposta — ela compra um caminho.
          </p>
        </div>
        <PrintButton label="Exportar tudo" />
      </header>

      <div className="space-y-6">
        {scripts.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card transition-shadow hover:shadow-soft"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl font-semibold text-ink">
                  {s.titulo}
                </h2>
                <p className="text-sm text-muted">{s.descricao}</p>
              </div>
              <CopyButton
                label="Copiar fluxo"
                text={s.passos.map((p, i) => `${i + 1}. ${p.mensagem}`).join("\n\n")}
              />
            </div>

            <ol className="space-y-3">
              {s.passos.map((p, i) => (
                <li key={i} className="relative flex gap-3">
                  {i < s.passos.length - 1 && (
                    <span className="absolute left-[13px] top-7 h-[calc(100%-0.5rem)] w-px bg-brand-100" />
                  )}
                  <span className="relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <div className="flex-1 rounded-xl bg-nude-50 p-3">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-lavender-600">
                        {p.etapa}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                        <Clock size={12} /> {p.intervalo}
                      </span>
                      <CopyButton text={p.mensagem} />
                    </div>
                    <p className="text-sm leading-relaxed text-ink">
                      {p.mensagem}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
