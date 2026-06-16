"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, MessageCircle, ChevronRight } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { formatarData } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { listConversas } from "@/lib/store";
import { PRIO } from "@/lib/prioridade-ui";
import type { Conversa } from "@/lib/types";

const FILTROS = [
  { value: "todas", label: "Todas" },
  { value: "quente", label: "🔥 Quentes" },
  { value: "nao_lida", label: "Não lidas" },
] as const;

type Filtro = (typeof FILTROS)[number]["value"];

export default function ConversasPage() {
  const [itens, setItens] = useState<Conversa[] | null>(null);
  const [erro, setErro] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todas");

  useEffect(() => {
    listConversas()
      .then(setItens)
      .catch(() => {
        // Falha de carregamento NÃO é inbox vazio — mostra erro e permite retry.
        setErro(true);
        setItens([]);
      });
  }, []);

  const visiveis = useMemo(() => {
    const base = (itens ?? []).filter((c) => !c.arquivada);
    const filtrada =
      filtro === "quente"
        ? base.filter((c) => c.prioridade === "quente")
        : filtro === "nao_lida"
          ? base.filter((c) => c.nao_lida)
          : base;
    // Celebra a prioridade: mais quente primeiro, depois maior score.
    const rank: Record<string, number> = { quente: 0, morno: 1, frio: 2 };
    return [...filtrada].sort((a, b) =>
      rank[a.prioridade] !== rank[b.prioridade]
        ? rank[a.prioridade] - rank[b.prioridade]
        : (b.score ?? 0) - (a.score ?? 0)
    );
  }, [itens, filtro]);

  return (
    <div>
      <header className="mb-5">
        <h1 className="font-serif text-3xl font-semibold text-ink">Conversas</h1>
        <p className="text-sm text-muted">
          As mensagens das suas clientes no WhatsApp, organizadas por prioridade.
          Responda primeiro quem está mais quente — direto daqui.
        </p>
      </header>

      {itens && itens.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFiltro(f.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filtro === f.value
                  ? "border-brand-400 bg-brand-50 text-brand-600"
                  : "border-brand-200 bg-white text-muted hover:bg-nude-100"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {itens === null && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-brand-400" />
        </div>
      )}

      {erro && (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-16 text-center text-muted">
            <MessageCircle size={28} className="text-red-300" />
            <p className="max-w-sm text-sm">
              Não foi possível carregar suas conversas agora.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-brand-300 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
            >
              Tentar de novo
            </button>
          </CardBody>
        </Card>
      )}

      {!erro && itens && visiveis.length === 0 && (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-16 text-center text-muted">
            <MessageCircle size={28} className="text-brand-300" />
            <p className="max-w-sm text-sm">
              {itens.length === 0
                ? "Quando uma cliente te chamar no WhatsApp, a conversa aparece aqui — já com a prioridade e a resposta pronta."
                : "Nenhuma conversa nesse filtro."}
            </p>
          </CardBody>
        </Card>
      )}

      {visiveis.length > 0 && (
        <div className="space-y-2">
          {visiveis.map((c) => {
            const prio = PRIO[c.prioridade] ?? PRIO.morno;
            const acento =
              c.prioridade === "quente"
                ? "border-l-red-400"
                : c.prioridade === "morno"
                  ? "border-l-amber-400"
                  : "border-l-sky-400";
            return (
              <Link
                key={c.id}
                href={`/conversas/${encodeURIComponent(c.id)}`}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border border-l-4 border-brand-100 bg-white p-4 shadow-card transition-colors hover:bg-nude-50",
                  acento
                )}
              >
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-lg">
                  {prio.emoji}
                  {c.nao_lida && (
                    <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-brand-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate font-medium text-ink",
                        c.nao_lida && "font-semibold"
                      )}
                    >
                      {c.cliente_nome || c.cliente_numero}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        prio.cls
                      )}
                    >
                      {prio.label}
                      {typeof c.score === "number" ? ` · ${c.score}%` : ""}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted">{c.ultima_mensagem}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[11px] text-muted">
                    {formatarData(c.ultima_atividade)}
                  </span>
                  <ChevronRight size={16} className="text-brand-300" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
