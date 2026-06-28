"use client";

import { useEffect, useState } from "react";
import { History as HistoryIcon, Loader2, Star } from "lucide-react";
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

const tipoBadge: Record<string, string> = {
  gerador: "bg-navy-800 text-white",
  follow_up: "bg-gold-500 text-navy-900",
  reescrever: "bg-gold-100 text-navy-900",
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
      prev
        ? prev.map((i) => (i.id === item.id ? { ...i, favorito: novo } : i))
        : prev,
    );
  }

  const filtrados = (itens ?? []).filter(
    (i) =>
      (filtroTipo === "todos" || i.tipo === filtroTipo) &&
      (!soFavoritos || i.favorito),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-champagne-300">
            Histórico
          </h1>
          <p className="text-sm text-navy-100 mt-1">
            Tudo que você gerou fica salvo aqui para reaproveitar a qualquer
            momento.
          </p>
        </div>
        <PrintButton />
      </div>

      {/* Filtros */}
      {itens && itens.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filtros.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFiltroTipo(f.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filtroTipo === f.value
                  ? "border-brand-500 bg-navy-800 text-white"
                  : "border-navy-500 bg-navy-700 text-navy-100 hover:bg-navy-700",
              )}
            >
              {f.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSoFavoritos((v) => !v)}
            className={cn(
              "ml-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              soFavoritos
                ? "border-gold-400 bg-gold-50 text-gold-700"
                : "border-navy-500 bg-navy-700 text-navy-100 hover:bg-navy-700",
            )}
          >
            <Star size={12} fill={soFavoritos ? "currentColor" : "none"} />{" "}
            Favoritos
          </button>
        </div>
      )}

      {/* Loading */}
      {itens === null && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-gold-500" />
        </div>
      )}

      {/* Empty */}
      {itens && filtrados.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-500 bg-navy-700 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10">
            <HistoryIcon size={22} className="text-gold-500" />
          </div>
          <p className="text-sm font-medium text-champagne-300 mb-1">
            {itens.length === 0
              ? "Nenhuma resposta salva ainda"
              : "Nenhum item para esse filtro"}
          </p>
          <p className="text-xs text-navy-100 max-w-xs">
            {itens.length === 0
              ? "Gere respostas no Gerador e salve no histórico para acessar aqui."
              : "Tente outro filtro ou remova o filtro de favoritos."}
          </p>
        </div>
      )}

      {/* Lista */}
      {filtrados.length > 0 && (
        <div className="space-y-4">
          {filtrados.map((item) => {
            const resumo = resumoContexto(item.contexto || {});
            const badge = tipoBadge[item.tipo] ?? "bg-brand-100 text-gold-400";
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-navy-500 bg-navy-700 shadow-card"
              >
                {/* Cabeçalho do item */}
                <div className="flex flex-wrap items-center gap-2 border-b border-brand-50 px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      badge,
                    )}
                  >
                    {tipoLabel[item.tipo] ?? item.tipo}
                  </span>
                  {item.intent && (
                    <span className="rounded-full bg-navy-700 px-2.5 py-0.5 text-xs font-medium text-champagne-300 capitalize">
                      {item.intent.replace(/_/g, " ")}
                    </span>
                  )}
                  {item.score !== undefined && (
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-bold",
                        item.score > 70
                          ? "bg-green-900/30 text-green-400"
                          : item.score > 40
                            ? "bg-gold-100 text-gold-700"
                            : "bg-brand-100 text-gold-400",
                      )}
                    >
                      Score {item.score}%
                    </span>
                  )}
                  {resumo && (
                    <span className="text-xs text-navy-100">{resumo}</span>
                  )}
                  <span className="ml-auto text-xs text-navy-100">
                    {formatarData(item.created_at)}
                  </span>
                  <button
                    type="button"
                    onClick={() => favoritar(item)}
                    aria-label="Favoritar"
                    className={cn(
                      "transition-colors",
                      item.favorito
                        ? "text-gold-500"
                        : "text-brand-200 hover:text-gold-400",
                    )}
                  >
                    <Star
                      size={16}
                      fill={item.favorito ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                {/* Respostas */}
                <div className="space-y-2 p-4">
                  {item.respostas.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-3 rounded-xl bg-navy-800 p-3"
                    >
                      <p className="text-sm leading-relaxed text-champagne-300">
                        {r}
                      </p>
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
