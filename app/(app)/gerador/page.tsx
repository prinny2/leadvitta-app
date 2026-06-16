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
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ResponseCard } from "@/components/response-card";
import { AvisoIA } from "@/components/aviso-ia";
import { LoadingRespostas } from "@/components/loading-respostas";
import { LeadTermometro } from "@/components/lead-termometro";
import { EmptyState } from "@/components/empty-state";
import { procedimentos } from "@/data/procedimentos";
import { situacoes } from "@/data/situacoes";
import { tons } from "@/data/tons";
import { perfisCliente } from "@/data/perfis-cliente";
import { objetivoOptions, oQueMelhorarOptions } from "@/data/opcoes";
import { addHistorico } from "@/lib/store";
import { useClinica } from "@/lib/hooks/use-clinica";
import { cn } from "@/lib/utils";
import type { RespostaTripla, Variante } from "@/lib/types";

const procOptions = procedimentos.map((p) => ({ value: p.id, label: p.label }));
const sitOptions = situacoes.map((s) => ({ value: s.id, label: s.label }));
const tomOptions = tons.map((t) => ({ value: t.id, label: t.label }));
const perfilOptions = perfisCliente.map((p) => ({ value: p.value, label: p.label }));

const VARIANTES: {
  key: Variante;
  titulo: string;
  descricao: string;
  accent: "brand" | "lavender";
}[] = [
  { key: "curta", titulo: "Resposta Suave", descricao: "Acolhe sem pressionar; reabre com uma pergunta.", accent: "brand" },
  { key: "consultiva", titulo: "Resposta Consultiva", descricao: "Educa, qualifica e posiciona autoridade.", accent: "lavender" },
  { key: "persuasiva", titulo: "Resposta de Fechamento", descricao: "Conduz direto para a avaliação/agendamento.", accent: "brand" },
];

const fieldClass =
  "border-navy-500 bg-navy-800 text-champagne-300 placeholder:text-navy-100/60 focus:border-gold-500/50 focus:ring-gold-500/20";
const labelClass = "text-champagne-400";

async function readApiJson<T>(
  response: Response
): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return {
      error: response.ok
        ? "O backend respondeu em um formato inesperado."
        : "O backend retornou uma falha sem JSON válido.",
    } as unknown as T;
  }
}

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

  useEffect(() => {
    if (clinica?.tom_padrao) setTom(clinica.tom_padrao);
  }, [clinica]);

  // Pré-preenchimento vindo do "Personalizar com IA" (Biblioteca de Objeções).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem("re_prefill");
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      if (p.mensagem) setMensagemCliente(p.mensagem);
      if (p.situacao) setSituacao(p.situacao);
      if (p.procedimento) setProcedimento(p.procedimento);
    } catch {
      /* ignora */
    }
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

  async function gerar() {
    if (!mensagemCliente.trim()) {
      setErro(
        modo === "reescrever"
          ? "Escreva a mensagem que você quer melhorar."
          : "Cole a mensagem da cliente."
      );
      return;
    }
    setLoading(true);
    setErro("");
    setAviso("");
    setRespostas(null);
    setNlp(null);
    setSalvo(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo,
          procedimento,
          situacao,
          tom,
          objetivo,
          perfilCliente,
          oQueMelhorar: modo === "reescrever" ? oQueMelhorar : undefined,
          nomeCliente,
          mensagemCliente,
          clinica: dnaPayload(),
        }),
      });
      const data = await readApiJson<{
        respostas?: RespostaTripla;
        mock?: boolean;
        aviso?: string;
        intent?: string;
        sentiment?: string;
        score?: number;
        error?: string;
      }>(res);
      if (!res.ok) {
        setErro(data.error || "Não foi possível gerar agora.");
        return;
      }
      if (!data.respostas) {
        setErro(data.error || "O backend não retornou as 3 respostas.");
        return;
      }
      setRespostas(data.respostas);
      setNlp({ intent: data.intent, sentiment: data.sentiment, score: data.score });
      if (data.mock) {
        setAviso(
          data.aviso ||
            "Modo demonstração — mostrando um exemplo. As respostas reais entram quando a clínica está ativa."
        );
      } else if (data.aviso) {
        setAviso(data.aviso);
      }
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
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
          acao: "refinar",
          variante,
          respostaAtual: respostas[variante],
          procedimento,
          situacao,
          tom,
          objetivo,
          perfilCliente,
          nomeCliente,
          mensagemCliente,
          clinica: dnaPayload(),
        }),
      });
      const data = await readApiJson<{ texto?: string; error?: string; aviso?: string }>(res);
      if (res.ok && data.texto) {
        setRespostas((prev) => (prev ? { ...prev, [variante]: data.texto } : prev));
        setSalvo(false);
      } else if (data.error || data.aviso) {
        setAviso(data.error || data.aviso || "");
      }
    } catch {
      setAviso("Não consegui melhorar essa resposta agora. A versão atual foi mantida.");
    } finally {
      setRefinando(null);
    }
  }

  async function salvar() {
    if (!respostas) return;
    setErro("");
    try {
      await addHistorico({
        tipo: modo === "reescrever" ? "reescrever" : "gerador",
        contexto: { procedimento, situacao, tom, objetivo, perfilCliente, nomeCliente, mensagemCliente },
        respostas: [respostas.curta, respostas.consultiva, respostas.persuasiva],
        intent: nlp?.intent,
        sentiment: nlp?.sentiment,
        score: nlp?.score,
      });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
    } catch {
      setErro("Não consegui salvar no histórico agora. As respostas continuam na tela para copiar.");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
        <h1 className="font-serif text-3xl font-semibold text-champagne-300">
          Gerador de Respostas
        </h1>
        <p className="mt-1 text-sm text-navy-100">
          Cole a mensagem da cliente e receba 3 respostas estratégicas — já no
          tom da sua clínica.
        </p>
        </div>
      </header>

      <div className="inline-flex rounded-xl bg-navy-700 p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setModo("gerar")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            modo === "gerar" ? "bg-navy-800 text-gold-400 shadow-sm" : "text-navy-100 hover:text-champagne-300"
          )}
        >
          <Sparkles size={16} /> Gerar resposta
        </button>
        <button
          type="button"
          onClick={() => setModo("reescrever")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            modo === "reescrever" ? "bg-navy-800 text-gold-400 shadow-sm" : "text-navy-100 hover:text-champagne-300"
          )}
        >
          <Wand2 size={16} /> Reescrever mensagem
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário */}
        <Card className="border-navy-500 bg-navy-700">
          <CardBody className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gold-400">
              Contexto da conversa
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nome" className={labelClass}>Nome da cliente (opcional)</Label>
                <Input id="nome" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} placeholder="Ex.: Ana" className={fieldClass} />
              </div>
              <div>
                <Label htmlFor="proc" className={labelClass}>Procedimento</Label>
                <Select id="proc" value={procedimento} onChange={setProcedimento} options={procOptions} placeholder="Selecione..." className={fieldClass} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sit" className={labelClass}>Situação</Label>
                <Select id="sit" value={situacao} onChange={setSituacao} options={sitOptions} className={fieldClass} />
              </div>
              <div>
                <Label htmlFor="perfil" className={labelClass}>Perfil da cliente (opcional)</Label>
                <Select id="perfil" value={perfilCliente} onChange={setPerfilCliente} options={perfilOptions} placeholder="Não sei / tanto faz" className={fieldClass} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="tom" className={labelClass}>Tom da resposta</Label>
                <Select id="tom" value={tom} onChange={setTom} options={tomOptions} className={fieldClass} />
              </div>
              <div>
                <Label htmlFor="obj" className={labelClass}>Objetivo</Label>
                <Select id="obj" value={objetivo} onChange={setObjetivo} options={objetivoOptions} className={fieldClass} />
              </div>
            </div>

            {modo === "reescrever" && (
              <div>
                <Label className={labelClass}>O que você quer melhorar? (opcional)</Label>
                <div className="flex flex-wrap gap-2">
                  {oQueMelhorarOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => toggleMelhorar(o.value)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        oQueMelhorar.includes(o.value)
                          ? "border-gold-500/40 bg-gold-500/10 text-gold-400"
                          : "border-navy-500 bg-navy-800 text-navy-100 hover:bg-navy-600"
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="msg" className={labelClass}>
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
                className={cn(fieldClass, "min-h-[100px]")}
              />
            </div>

            {erro && <p className="text-sm text-red-300">{erro}</p>}

            <Button
              onClick={gerar}
              disabled={loading}
              size="lg"
              className="w-full bg-navy-800 text-gold-400 shadow-soft hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-cta"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {modo === "reescrever" ? "Reescrever mensagem" : "Gerar 3 respostas"}
            </Button>
          </CardBody>
        </Card>

        {/* Resultados */}
        <div className="space-y-4">
          <AvisoIA
            aviso={aviso}
            className="border-gold-500/25 bg-gold-500/10 text-champagne-300"
          />

          {loading && <LoadingRespostas tone="dark" />}

          {!loading && nlp && (
            <Card className="animate-fade-in border-navy-500 bg-navy-700">
              <CardBody className="py-4">
                <div className="mb-3 flex items-center gap-2 text-gold-400">
                  <Sparkles size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Lead Intelligence</span>
                </div>
                <LeadTermometro score={nlp.score} tone="dark" />
                {(nlp.intent || nlp.sentiment) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {nlp.intent && (
                      <span className="rounded-full bg-navy-800 px-2.5 py-1 text-xs font-medium text-champagne-300 capitalize shadow-sm">
                        Intenção: {nlp.intent.replace(/_/g, " ")}
                      </span>
                    )}
                    {nlp.sentiment && (
                      <span className="rounded-full bg-navy-800 px-2.5 py-1 text-xs font-medium text-champagne-300 shadow-sm">
                        Sentimento: {nlp.sentiment}
                      </span>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {!loading && respostas && (
            <>
              {VARIANTES.map((v, idx) => (
                <div
                  key={v.key}
                  className="relative animate-fade-in"
                  style={{ animationDelay: `${idx * 120}ms` }}
                >
                  <ResponseCard
                    titulo={v.titulo}
                    descricao={v.descricao}
                    texto={respostas[v.key]}
                    accent={v.accent}
                    tone="dark"
                  />
                  <div className="absolute right-14 top-4">
                    <button
                      type="button"
                      onClick={() => melhorar(v.key)}
                      disabled={refinando !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gold-500/25 bg-navy-800 px-2.5 py-1.5 text-xs font-medium text-gold-400 transition-colors hover:bg-gold-500/10 disabled:opacity-50"
                    >
                      {refinando === v.key ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RefreshCw size={14} />
                      )}
                      Melhorar
                    </button>
                  </div>
                </div>
              ))}

              <Button
                onClick={salvar}
                variant="outline"
                className="w-full border-navy-500 bg-navy-800 text-gold-400 hover:bg-gold-500/10"
              >
                {salvo ? <Check size={16} className="text-green-600" /> : <Save size={16} />}
                {salvo ? "Salvo no histórico!" : "Salvar no histórico"}
              </Button>
            </>
          )}

          {!loading && !respostas && (
            <EmptyState
              icon={MessageSquareText}
              tone="dark"
              mensagem={
                <>
                  Preencha ao lado e clique em{" "}
                  <strong>{modo === "reescrever" ? "Reescrever mensagem" : "Gerar 3 respostas"}</strong>.
                </>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
