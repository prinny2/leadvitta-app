"use client";

import { useEffect, useState } from "react";
import { History as HistoryIcon, Loader2, Star } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import { PrintButton } from "@/components/print-button";
import { formatarData } from "@/lib/utils";
import { procedimentoPorId } from "@/data/procedimentos";
import { situacaoPorId } from "@/data/situacoes";
import { listHistorico, toggleFavorito } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { HistoricoItem } from "@/lib/types";

const tipoLabel: Record<string, string> = {
  gerador: "Gerador",
  follow_up: "Follow-up",
  reescrever: "Reescrever",
};

const filtros = [
  { value: "todos", label: "Todos" },
  { value: "gerador", label: "Gerador" },
  { value: "follow_up", label: "Follow-up" },
  { value: "reescrever", label: "Reescrever" },
];

function resumoContexto(ctx: Record<string, unknown>): string {
  const partes: string[] = [];
  const proc = ctx.procedimento as string | undefined;
  const sit = ctx.situacao as string | undefined;
  if (proc) partes.push(procedimentoPorId(proc)?.label ?? proc);
  if (sit) partes.push(situacaoPorId(sit)?.label ?? sit);
  return partes.join(" · ");
}

export default function HistoricoPage() {
  const [itens, setItens] = useState<HistoricoItem[] | null>(null);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [soFavoritos, setSoFavoritos] = useState(false);

  useEffect(() => {
    listHistorico().then(setItens);
  }, []);

  async function favoritar(item: HistoricoItem) {
    const novo = !item.favorito;
    await toggleFavorito(item.id, novo);
    setItens((prev) =>
      prev ? prev.map((i) => (i.id === item.id ? { ...i, favorito: novo } : i)) : prev
    );
  }

  const filtrados = (itens ?? []).filter(
    (i) =>
      (filtroTipo === "todos" || i.tipo === filtroTipo) &&
      (!soFavoritos || i.favorito)
  );

  return (
    <div>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink">Histórico</h1>
          <p className="text-sm text-muted">
            Tudo o que você já gerou fica salvo aqui para reaproveitar.
          </p>
        </div>
        <PrintButton />
      </header>

      {/* filtros */}
      {itens && itens.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {filtros.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFiltroTipo(f.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filtroTipo === f.value
                  ? "border-brand-400 bg-brand-50 text-brand-600"
                  : "border-brand-200 bg-white text-muted hover:bg-nude-100"
              )}
            >
              {f.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSoFavoritos((v) => !v)}
            className={cn(
              "ml-1 inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              soFavoritos
                ? "border-amber-300 bg-amber-50 text-amber-600"
                : "border-brand-200 bg-white text-muted hover:bg-nude-100"
            )}
          >
            <Star size={13} fill={soFavoritos ? "currentColor" : "none"} /> Favoritos
          </button>
        </div>
      )}

      {itens === null && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-brand-400" />
        </div>
      )}

      {itens && filtrados.length === 0 && (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-16 text-center text-muted">
            <HistoryIcon size={28} className="text-brand-300" />
            <p className="max-w-xs text-sm">
              {itens.length === 0
                ? "Você ainda não salvou nenhuma resposta. Comece pelo Gerador!"
                : "Nenhum item para esse filtro."}
            </p>
          </CardBody>
        </Card>
      )}

      {filtrados.length > 0 && (
        <div className="space-y-4">
          {filtrados.map((item) => {
            const resumo = resumoContexto(item.contexto || {});
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600">
                    {tipoLabel[item.tipo] ?? item.tipo}
                  </span>
                  {item.intent && (
                    <span className="rounded-full bg-lavender-100 px-2.5 py-0.5 text-xs font-bold text-lavender-700 capitalize">
                      {item.intent.replace("_", " ")}
                    </span>
                  )}
                  {item.score !== undefined && (
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold",
                      item.score > 70 ? "bg-green-100 text-green-700" : item.score > 40 ? "bg-amber-100 text-amber-700" : "bg-brand-100 text-brand-700"
                    )}>
                      Score: {item.score}%
                    </span>
                  )}
                  {resumo && <span className="text-xs text-muted">{resumo}</span>}
                  <span className="ml-auto text-xs text-muted">
                    {formatarData(item.created_at)}
                  </span>
                  <button
                    type="button"
                    onClick={() => favoritar(item)}
                    aria-label="Favoritar"
                    className={cn(
                      "transition-colors",
                      item.favorito ? "text-amber-500" : "text-brand-200 hover:text-amber-400"
                    )}
                  >
                    <Star size={18} fill={item.favorito ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="space-y-2">
                  {item.respostas.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-3 rounded-xl bg-nude-50 p-3"
                    >
                      <p className="text-sm leading-relaxed text-ink">{r}</p>
                      <CopyButton text={r} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
