"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Wand2,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Save,
  Check,
  ChevronRight,
  Dna,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CopyButton } from "@/components/copy-button";
import { AvisoIA } from "@/components/aviso-ia";
import { LoadingRespostas } from "@/components/loading-respostas";
import { procedimentos } from "@/data/procedimentos";
import { situacoes } from "@/data/situacoes";
import { tons } from "@/data/tons";
import { perfisCliente } from "@/data/perfis-cliente";
import { objetivoOptions, oQueMelhorarOptions } from "@/data/opcoes";
import { addHistorico } from "@/lib/store";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { useClinica } from "@/lib/hooks/use-clinica";
import { cn } from "@/lib/utils";
import type { RespostaTripla, Variante } from "@/lib/types";

const procOptions = procedimentos.map((p) => ({ value: p.id, label: p.label }));
const sitOptions = situacoes.map((s) => ({ value: s.id, label: s.label }));
const tomOptions = tons.map((t) => ({ value: t.id, label: t.label }));
const perfilOptions = perfisCliente.map((p) => ({ value: p.value, label: p.label }));

const VARIANTES: {
  key: Variante;
  num: string;
  titulo: string;
  descricao: string;
  cor: string;
  badge: string;
}[] = [
  {
    key: "curta",
    num: "01",
    titulo: "Suave",
    descricao: "Acolhe sem pressionar; reabre com uma pergunta.",
    cor: "border-navy-500 bg-navy-700",
    badge: "bg-navy-800 text-white",
  },
  {
    key: "consultiva",
    num: "02",
    titulo: "Consultiva",
    descricao: "Educa, qualifica e posiciona autoridade.",
    cor: "border-gold-500/40 bg-gradient-to-br from-navy-700 to-navy-800",
    badge: "bg-gold-500 text-navy-900",
  },
  {
    key: "persuasiva",
    num: "03",
    titulo: "Fechamento",
    descricao: "Conduz direto para a avaliação/agendamento.",
    cor: "border-navy-500 bg-navy-700",
    badge: "bg-navy-800 text-white",
  },
];

export default function GeradorPage() {
  const { clinica } = useClinica();
  const [modo, setModo] = useState<"gerar" | "reescrever">("gerar");

  const [nomeCliente, setNomeCliente] = useState("");
  const [procedimento, setProcedimento] = useState("");
  const [situacao, setSituacao] = useState("preco");
  const [perfilCliente, setPerfilCliente] = useState("");
  const [tom, setTom] = useState("acolhedor");
  const [objetivo, setObjetivo] = useState("direcionar para a avaliação");
  const [oQueMelhorar, setOQueMelhorar] = useState<string[]>([]);
  const [mensagemCliente, setMensagemCliente] = useState("");

  const [loading, setLoading] = useState(false);
  const [refinando, setRefinando] = useState<Variante | null>(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [respostas, setRespostas] = useState<RespostaTripla | null>(null);
  const [nlp, setNlp] = useState<{ intent?: string; sentiment?: string; score?: number } | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState<number | null>(null);
  const [assinando, setAssinando] = useState(false);

  useEffect(() => {
    if (clinica?.tom_padrao) setTom(clinica.tom_padrao);
  }, [clinica]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("re_prefill");
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      if (p.mensagem) setMensagemCliente(p.mensagem);
      if (p.situacao) setSituacao(p.situacao);
      if (p.procedimento) setProcedimento(p.procedimento);
    } catch { /* ignora */ }
    window.sessionStorage.removeItem("re_prefill");
  }, []);

  function dnaPayload() {
    return clinica
      ? {
          nome_clinica: clinica.nome_clinica,
          cidade: clinica.cidade,
          procedimentos: clinica.procedimentos,
          formalidade: clinica.formalidade,
          como_chamar: clinica.como_chamar,
          cta_preferido: clinica.cta_preferido,
        }
      : undefined;
  }

  function toggleMelhorar(v: string) {
    setOQueMelhorar((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }

  async function getToken(): Promise<string | undefined> {
    try {
      return await getFirebaseAuth().currentUser?.getIdToken();
    } catch {
      return undefined;
    }
  }

  async function gerar() {
    if (!mensagemCliente.trim()) {
      setErro(modo === "reescrever" ? "Escreva a mensagem que você quer melhorar." : "Cole a mensagem da cliente.");
      return;
    }
    setLoading(true);
    setErro("");
    setAviso("");
    setLimitReached(false);
    setFreeRemaining(null);
    setRespostas(null);
    setNlp(null);
    setSalvo(false);
    try {
      const firebaseIdToken = await getToken();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo, procedimento, situacao, tom, objetivo, perfilCliente,
          oQueMelhorar: modo === "reescrever" ? oQueMelhorar : undefined,
          nomeCliente, mensagemCliente, clinica: dnaPayload(), firebaseIdToken,
        }),
      });
      const data = await res.json();
      if (res.status === 402 || data.limitReached) {
        setLimitReached(true);
        setFreeRemaining(0);
        return;
      }
      if (!res.ok) { setErro(data.error || "Não foi possível gerar agora."); return; }
      setRespostas(data.respostas);
      setNlp({ intent: data.intent, sentiment: data.sentiment, score: data.score });
      if (typeof data.freeRemaining === "number") setFreeRemaining(data.freeRemaining);
      if (data.mock) {
        setAviso(data.aviso || "Modo demonstração — mostrando um exemplo. As respostas reais entram quando a clínica está ativa.");
      } else if (data.aviso) {
        setAviso(data.aviso);
      }
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function assinarStart() {
    setAssinando(true);
    try {
      const firebaseIdToken = await getToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "start", interval: "monthly", firebaseIdToken }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setErro(data.error || "Não foi possível abrir o checkout.");
    } catch {
      setErro("Falha ao abrir o checkout.");
    } finally {
      setAssinando(false);
    }
  }

  async function melhorar(variante: Variante) {
    if (!respostas) return;
    setRefinando(variante);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acao: "refinar", variante, respostaAtual: respostas[variante],
          procedimento, situacao, tom, objetivo, perfilCliente,
          nomeCliente, mensagemCliente, clinica: dnaPayload(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.texto) {
        setRespostas((prev) => (prev ? { ...prev, [variante]: data.texto } : prev));
        setSalvo(false);
      }
    } catch { /* silencioso */ } finally { setRefinando(null); }
  }

  async function salvar() {
    if (!respostas) return;
    await addHistorico({
      tipo: modo === "reescrever" ? "reescrever" : "gerador",
      contexto: { procedimento, situacao, tom, objetivo, perfilCliente, nomeCliente, mensagemCliente },
      respostas: [respostas.curta, respostas.consultiva, respostas.persuasiva],
      intent: nlp?.intent, sentiment: nlp?.sentiment, score: nlp?.score,
    });
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  }

  const nomeDna = clinica?.nome_clinica;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-champagne-300">
            Gerador de Respostas
          </h1>
          <p className="text-sm text-navy-100 mt-1">
            Cole a mensagem da cliente e receba 3 respostas estratégicas — já no tom da sua clínica.
          </p>
        </div>
        {nomeDna && (
          <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-navy-500 bg-gold-500/10 px-3 py-1.5 text-xs font-semibold text-gold-400">
            <Dna size={12} />
            DNA ativo · {nomeDna}
          </span>
        )}
      </div>

      {/* Toggle modo */}
      <div className="inline-flex rounded-xl bg-navy-700 p-1 shadow-sm">
        {(["gerar", "reescrever"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModo(m)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              modo === m
                ? "bg-navy-800 text-gold-400 shadow-sm"
                : "text-navy-100 hover:text-champagne-300"
            )}
          >
            {m === "gerar" ? <Sparkles size={15} /> : <Wand2 size={15} />}
            {m === "gerar" ? "Gerar resposta" : "Reescrever mensagem"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">

        {/* ── Formulário ── */}
        <div className="rounded-2xl border border-navy-500 bg-navy-700 shadow-card">
          <div className="border-b border-brand-50 px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-100">
              {modo === "reescrever" ? "Sua mensagem" : "Contexto da conversa"}
            </p>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nome">Nome da cliente</Label>
                <Input
                  id="nome"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  placeholder="Ex.: Ana (opcional)"
                />
              </div>
              <div>
                <Label htmlFor="proc">Procedimento</Label>
                <Select id="proc" value={procedimento} onChange={setProcedimento} options={procOptions} placeholder="Selecione..." />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sit">Situação</Label>
                <Select id="sit" value={situacao} onChange={setSituacao} options={sitOptions} />
              </div>
              <div>
                <Label htmlFor="perfil">Perfil da cliente</Label>
                <Select id="perfil" value={perfilCliente} onChange={setPerfilCliente} options={perfilOptions} placeholder="Não sei / tanto faz" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="tom">Tom</Label>
                <Select id="tom" value={tom} onChange={setTom} options={tomOptions} />
              </div>
              <div>
                <Label htmlFor="obj">Objetivo</Label>
                <Select id="obj" value={objetivo} onChange={setObjetivo} options={objetivoOptions} />
              </div>
            </div>

            {modo === "reescrever" && (
              <div>
                <Label>O que melhorar? (opcional)</Label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {oQueMelhorarOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => toggleMelhorar(o.value)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        oQueMelhorar.includes(o.value)
                          ? "border-brand-500 bg-navy-800 text-white"
                          : "border-navy-500 bg-navy-700 text-navy-100 hover:bg-navy-700"
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="msg">
                {modo === "reescrever" ? "Sua mensagem (vou deixar melhor)" : "Mensagem da cliente"}
              </Label>
              <Textarea
                id="msg"
                value={mensagemCliente}
                onChange={(e) => setMensagemCliente(e.target.value)}
                placeholder={
                  modo === "reescrever"
                    ? "Ex.: O botox é 900, quer marcar?"
                    : "Ex.: Oi, quanto tá o preenchimento labial?"
                }
                className="min-h-[100px]"
              />
            </div>

            {erro && (
              <p className="rounded-lg bg-red-900/20 px-3 py-2 text-sm text-red-400">{erro}</p>
            )}

            <button
              type="button"
              onClick={gerar}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-800 px-4 py-3 text-sm font-bold text-gold-400 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-cta disabled:opacity-60 disabled:translate-y-0"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {modo === "reescrever" ? "Melhorar mensagem" : "Gerar 3 respostas"}
            </button>
          </div>
        </div>

        {/* ── Resultados ── */}
        <div className="space-y-4">
          <AvisoIA aviso={aviso} />

          {freeRemaining !== null && freeRemaining > 0 && !limitReached && (
            <div className="rounded-xl border border-gold-500/30 bg-gold-500/8 px-4 py-2.5 text-xs text-champagne-300">
              Plano grátis · <strong className="text-gold-400">faltam {freeRemaining}</strong>{" "}
              {freeRemaining === 1 ? "resposta grátis" : "respostas grátis"}. Assine o Start pra liberar ilimitado.
            </div>
          )}

          {limitReached && (
            <div className="rounded-2xl border border-gold-500/40 bg-gold-500/10 p-6 text-center shadow-card">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/20">
                <Sparkles size={22} className="text-gold-400" />
              </div>
              <p className="font-serif text-lg font-semibold text-champagne-300 mb-1">
                Você usou suas respostas grátis 🎉
              </p>
              <p className="text-sm text-navy-100 mb-4 max-w-[340px] mx-auto leading-relaxed">
                Assine o <strong className="text-gold-400">Start (R$97/mês)</strong> e gere
                respostas ilimitadas, no tom da sua clínica.
              </p>
              <button
                type="button"
                onClick={assinarStart}
                disabled={assinando}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-900 shadow-cta transition-all hover:-translate-y-0.5 disabled:opacity-60"
              >
                {assinando ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Assinar o Start e continuar
              </button>
            </div>
          )}

          {loading && <LoadingRespostas />}

          {/* Lead Intelligence */}
          {!loading && nlp && (
            <div className="rounded-2xl border border-navy-500 bg-navy-800 p-4 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-gold-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400">Lead Intelligence</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Intenção", val: nlp.intent?.replace(/_/g, " ") ?? "—" },
                  { label: "Sentimento", val: nlp.sentiment ?? "—" },
                ].map((item) => (
                  <div key={item.label} className="col-span-1">
                    <p className="text-[10px] uppercase text-navy-100 font-medium">{item.label}</p>
                    <p className="text-sm font-semibold text-white capitalize">{item.val}</p>
                  </div>
                ))}
                <div>
                  <p className="text-[10px] uppercase text-navy-100 font-medium">Prioridade</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 w-full rounded-full bg-navy-700/20 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          (nlp.score ?? 0) > 70 ? "bg-green-400" : (nlp.score ?? 0) > 40 ? "bg-gold-400" : "bg-blue-300"
                        )}
                        style={{ width: `${nlp.score ?? 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white shrink-0">{nlp.score ?? 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cards de resposta */}
          {!loading && respostas && (
            <>
              {VARIANTES.map((v) => (
                <div
                  key={v.key}
                  className={cn("rounded-2xl border p-4 shadow-card transition-shadow hover:shadow-soft", v.cor)}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold", v.badge)}>
                        {v.num}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-champagne-300">{v.titulo}</p>
                        <p className="text-xs text-navy-100">{v.descricao}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => melhorar(v.key)}
                        disabled={refinando !== null}
                        className="inline-flex items-center gap-1 rounded-lg border border-navy-500 bg-navy-700 px-2.5 py-1.5 text-xs font-medium text-gold-400 transition-colors hover:bg-gold-500/10 disabled:opacity-50"
                      >
                        {refinando === v.key
                          ? <Loader2 size={12} className="animate-spin" />
                          : <RefreshCw size={12} />}
                        Refinar
                      </button>
                      <CopyButton text={respostas[v.key]} />
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-champagne-300">
                    {respostas[v.key]}
                  </p>
                </div>
              ))}

              <button
                type="button"
                onClick={salvar}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-navy-500 bg-navy-700 px-4 py-2.5 text-sm font-medium text-gold-400 transition-colors hover:bg-gold-500/10"
              >
                {salvo ? <Check size={15} className="text-green-400" /> : <Save size={15} />}
                {salvo ? "Salvo no histórico!" : "Salvar no histórico"}
              </button>
            </>
          )}

          {/* Empty state */}
          {!loading && !respostas && !limitReached && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-500 bg-navy-700 py-14 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10">
                <MessageSquareText size={22} className="text-gold-500" />
              </div>
              <p className="text-sm font-medium text-champagne-300 mb-1">Suas respostas aparecem aqui</p>
              <p className="text-xs text-navy-100 max-w-[220px] leading-relaxed">
                Preencha o contexto ao lado e clique em{" "}
                <strong className="text-gold-400">Gerar 3 respostas</strong>.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs text-navy-100">
                <ChevronRight size={14} className="text-gold-500" />
                Suave · Consultiva · Fechamento
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
