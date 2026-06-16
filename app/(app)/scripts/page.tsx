import { Clock, FileText } from "lucide-react";
import { scripts } from "@/data/scripts";
import { CopyButton } from "@/components/copy-button";
import { PrintButton } from "@/components/print-button";

export const metadata = { title: "Scripts de Atendimento — LeadBellus" };

export default function ScriptsPage() {
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink">
            Scripts de Atendimento
          </h1>
          <p className="text-sm text-muted mt-1">
            Fluxos prontos que conduzem a conversa até o agendamento.
            A cliente não compra uma resposta — ela compra um caminho.
          </p>
        </div>
        <PrintButton label="Exportar tudo" />
      </div>

      {/* Scripts */}
      <div className="space-y-5">
        {scripts.map((s, sIdx) => (
          <div
            key={s.id}
            className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card"
          >
            {/* Cabeçalho do script */}
            <div className="flex items-start justify-between gap-3 border-b border-brand-50 bg-brand-500 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <FileText size={18} className="text-gold-400" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-semibold text-white">
                    {s.titulo}
                  </h2>
                  <p className="text-sm text-lavender-300">{s.descricao}</p>
                </div>
              </div>
              <CopyButton
                label="Copiar fluxo"
                text={s.passos.map((p, i) => `${i + 1}. ${p.mensagem}`).join("\n\n")}
              />
            </div>

            {/* Passos */}
            <div className="p-5">
              <ol className="relative space-y-4">
                {s.passos.map((p, i) => (
                  <li key={i} className="relative flex gap-4">
                    {/* Linha conectora */}
                    {i < s.passos.length - 1 && (
                      <div className="absolute left-[17px] top-9 h-[calc(100%+4px)] w-px bg-brand-100" />
                    )}

                    {/* Número */}
                    <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-xs font-bold text-gold-400 shadow-sm">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Conteúdo */}
                    <div className="flex-1 rounded-xl border border-brand-100 bg-nude-50 p-3">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                          {p.etapa}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white border border-brand-100 px-2 py-0.5 text-[11px] font-medium text-muted">
                            <Clock size={11} /> {p.intervalo}
                          </span>
                          <CopyButton text={p.mensagem} />
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-ink">{p.mensagem}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
