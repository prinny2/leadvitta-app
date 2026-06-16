"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import {
  getClinica,
  getConversa,
  getMensagens,
  marcarConversaLida,
} from "@/lib/store";
import { PRIO } from "@/lib/prioridade-ui";
import type { Clinica, Conversa, MensagemConversa } from "@/lib/types";

export default function ConversaThreadPage() {
  const params = useParams();
  const id = decodeURIComponent(String(params?.id ?? ""));

  const [conversa, setConversa] = useState<Conversa | null>(null);
  const [clinica, setClinica] = useState<Clinica | null>(null);
  const [mensagens, setMensagens] = useState<MensagemConversa[] | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sugerindo, setSugerindo] = useState(false);
  const [erro, setErro] = useState("");
  const [erroCarregamento, setErroCarregamento] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    setErroCarregamento(false);
    setMensagens(null);
    getConversa(id)
      .then(setConversa)
      .catch(() => {
        setErroCarregamento(true);
        setConversa(null);
      });
    getMensagens(id)
      .then(setMensagens)
      .catch(() => {
        setErroCarregamento(true);
        setMensagens([]);
      });
    marcarConversaLida(id).catch(() => {});
  }, [id]);

  useEffect(() => {
    getClinica().then(setClinica).catch(() => {});
  }, []);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviar() {
    const corpo = texto.trim();
    if (!corpo || enviando) return;
    setErro("");

    if (!isFirebaseConfigured) {
      setErro("Disponível só com a conta conectada.");
      return;
    }
    const user = getFirebaseAuth().currentUser;
    if (!user) {
      setErro("Faça login novamente.");
      return;
    }

    setEnviando(true);
    try {
      const firebaseIdToken = await user.getIdToken();
      const res = await fetch("/api/conversas/reply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversaId: id, texto: corpo, firebaseIdToken }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Não foi possível enviar.");
      }
      setMensagens((prev) => [
        ...(prev ?? []),
        { id: `local-${Date.now()}`, direcao: "out", texto: corpo, em: new Date().toISOString() },
      ]);
      setTexto("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao enviar.");
    } finally {
      setEnviando(false);
    }
  }

  // A sugestão só faz sentido quando a ÚLTIMA mensagem é da cliente (ou seja,
  // a conversa está aguardando a resposta da clínica).
  const ultimaMsg =
    mensagens && mensagens.length ? mensagens[mensagens.length - 1] : null;
  const aguardandoResposta = ultimaMsg?.direcao === "in";

  async function sugerir() {
    if (!aguardandoResposta || !ultimaMsg || sugerindo) return;
    setSugerindo(true);
    setErro("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo: "gerar",
          // Sem situação fixa: a IA lê a mensagem real da cliente.
          situacao: "",
          tom: clinica?.tom_padrao || "acolhedor",
          objetivo: "direcionar para a avaliação",
          nomeCliente: conversa?.cliente_nome,
          mensagemCliente: ultimaMsg.texto,
          // Usa o DNA salvo da clínica (nome, formalidade, CTA, procedimentos).
          clinica: clinica
            ? {
                nome_clinica: clinica.nome_clinica,
                cidade: clinica.cidade,
                procedimentos: clinica.procedimentos,
                formalidade: clinica.formalidade,
                como_chamar: clinica.como_chamar,
                cta_preferido: clinica.cta_preferido,
              }
            : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.respostas?.consultiva) {
        setTexto(data.respostas.consultiva);
      } else {
        setErro(data?.error || "Não consegui sugerir agora.");
      }
    } catch {
      setErro("Falha ao sugerir resposta.");
    } finally {
      setSugerindo(false);
    }
  }

  const prio = conversa ? PRIO[conversa.prioridade] ?? PRIO.morno : null;

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-2xl flex-col">
      {/* cabeçalho */}
      <div className="flex items-center gap-3 border-b border-brand-100 pb-3">
        <Link
          href="/conversas"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-nude-100 hover:text-ink"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold text-ink">
              {conversa?.cliente_nome || conversa?.cliente_numero || "Conversa"}
            </span>
            {prio && (
              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold", prio.cls)}>
                {prio.emoji} {prio.label}
                {typeof conversa?.score === "number" ? ` · ${conversa.score}%` : ""}
              </span>
            )}
          </div>
          {conversa?.cliente_nome && (
            <span className="text-xs text-muted">{conversa.cliente_numero}</span>
          )}
        </div>
      </div>

      {/* thread */}
      <div className="flex-1 space-y-3 overflow-y-auto py-5">
        {mensagens === null && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-brand-400" />
          </div>
        )}
        {mensagens?.map((m) => (
          <div
            key={m.id}
            className={cn("flex", m.direcao === "out" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-card",
                m.direcao === "out"
                  ? "rounded-br-md bg-brand-600 text-white"
                  : "rounded-bl-md border border-brand-100 bg-white text-ink"
              )}
            >
              {m.texto}
            </div>
          </div>
        ))}
        {erroCarregamento && (
          <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-muted">
            <p>Não foi possível carregar esta conversa agora.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-brand-300 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
            >
              Tentar de novo
            </button>
          </div>
        )}
        {!erroCarregamento && mensagens && mensagens.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">
            Sem mensagens nesta conversa ainda.
          </p>
        )}
        <div ref={fimRef} />
      </div>

      {/* responder */}
      <div className="border-t border-brand-100 pt-3">
        {erro && <p className="mb-2 text-xs text-red-600">{erro}</p>}
        {aguardandoResposta && (
          <button
            type="button"
            onClick={sugerir}
            disabled={sugerindo}
            className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-60"
          >
            {sugerindo ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Sparkles size={13} />
            )}
            {sugerindo ? "Pensando…" : "Sugerir resposta com IA"}
          </button>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar();
              }
            }}
            rows={1}
            placeholder="Escreva a resposta…"
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-brand-400"
          />
          <button
            type="button"
            onClick={enviar}
            disabled={enviando || !texto.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
            aria-label="Enviar"
          >
            {enviando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
