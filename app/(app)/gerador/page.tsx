"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Wand2,
  Loader2,
  Info,
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
import { CopyButton } from "@/components/copy-button";
import { procedimentos } from "@/data/procedimentos";
import { situacoes } from "@/data/situacoes";
import { tons } from "@/data/tons";
import { perfisCliente } from "@/data/perfis-cliente";
import { objetivoOptions, oQueMelhorarOptions } from "@/data/opcoes";
import { getClinica, addHistorico } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Clinica, RespostaTripla, Variante } from "@/lib/types";

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

export default function GeradorPage() {
  const [clinica, setClinica] = useState<Clinica | null>(null);
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
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    getClinica().then((c) => {
      setClinica(c);
      if (c.tom_padrao) setTom(c.tom_padrao);
    });
  }, []);

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
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || "Não foi possível gerar agora.");
        return;
      }
      setRespostas(data.respostas);
      if (data.mock) {
        setAviso(
          data.aviso ||
            "Exemplo de demonstração — configure a chave da IA para respostas reais."
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
      const data = await res.json();
      if (res.ok && data.texto) {
        setRespostas((prev) => (prev ? { ...prev, [variante]: data.texto } : prev));
        setSalvo(false);
      }
    } catch {
      /* silencioso */
    } finally {
      setRefinando(null);
    }
  }

  async function salvar() {
    if (!respostas) return;
    await addHistorico({
      tipo: modo === "reescrever" ? "reescrever" : "gerador",
      contexto: { procedimento, situacao, tom, objetivo, perfilCliente, nomeCliente, mensagemCliente },
      respostas: [respostas.curta, respostas.consultiva, respostas.persuasiva],
    });
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-ink">
          Gerador de Respostas
        </h1>
        <p className="text-sm text-muted">
          Cole a mensagem da cliente e receba 3 respostas estratégicas — já no
          tom da sua clínica.
        </p>
      </header>

      <div className="mb-6 inline-flex rounded-xl bg-nude-100 p-1">
        <button
          type="button"
          onClick={() => setModo("gerar")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            modo === "gerar" ? "bg-white text-brand-600 shadow-sm" : "text-muted hover:text-ink"
          )}
        >
          <Sparkles size={16} /> Gerar resposta
        </button>
        <button
          type="button"
          onClick={() => setModo("reescrever")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            modo === "reescrever" ? "bg-white text-brand-600 shadow-sm" : "text-muted hover:text-ink"
          )}
        >
          <Wand2 size={16} /> Reescrever minha mensagem
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário */}
        <Card>
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nome">Nome da cliente (opcional)</Label>
                <Input id="nome" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} placeholder="Ex.: Ana" />
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
                <Label htmlFor="perfil">Perfil da cliente (opcional)</Label>
                <Select id="perfil" value={perfilCliente} onChange={setPerfilCliente} options={perfilOptions} placeholder="Não sei / tanto faz" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="tom">Tom da resposta</Label>
                <Select id="tom" value={tom} onChange={setTom} options={tomOptions} />
              </div>
              <div>
                <Label htmlFor="obj">Objetivo</Label>
                <Select id="obj" value={objetivo} onChange={setObjetivo} options={objetivoOptions} />
              </div>
            </div>

            {modo === "reescrever" && (
              <div>
                <Label>O que você quer melhorar? (opcional)</Label>
                <div className="flex flex-wrap gap-2">
                  {oQueMelhorarOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => toggleMelhorar(o.value)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        oQueMelhorar.includes(o.value)
                          ? "border-brand-400 bg-brand-50 text-brand-600"
                          : "border-brand-200 bg-white text-muted hover:bg-nude-100"
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
              />
            </div>

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            <Button onClick={gerar} disabled={loading} size="lg" className="w-full">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {modo === "reescrever" ? "Melhorar mensagem" : "Gerar respostas"}
            </Button>
          </CardBody>
        </Card>

        {/* Resultados */}
        <div className="space-y-4">
          {aviso && (
            <div className="flex items-start gap-2 rounded-xl border border-lavender-200 bg-lavender-50 px-3.5 py-2.5 text-xs text-lavender-700">
              <Info size={15} className="mt-0.5 shrink-0" />
              <span>{aviso}</span>
            </div>
          )}

          {loading && (
            <Card>
              <CardBody className="flex flex-col items-center gap-3 py-14 text-muted">
                <Loader2 size={28} className="animate-spin text-brand-400" />
                <p className="text-sm">Escrevendo as melhores respostas...</p>
              </CardBody>
            </Card>
          )}

          {!loading && respostas && (
            <>
              {VARIANTES.map((v) => (
                <div key={v.key} className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
                  <div className="mb-2.5 flex items-start justify-between gap-3">
                    <div>
                      <div className={cn("text-sm font-semibold", v.accent === "lavender" ? "text-lavender-600" : "text-brand-600")}>
                        {v.titulo}
                      </div>
                      <div className="text-xs text-muted">{v.descricao}</div>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        onClick={() => melhorar(v.key)}
                        disabled={refinando !== null}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-2.5 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-50"
                      >
                        {refinando === v.key ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                        Melhorar
                      </button>
                      <CopyButton text={respostas[v.key]} />
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                    {respostas[v.key]}
                  </p>
                </div>
              ))}

              <Button onClick={salvar} variant="outline" className="w-full">
                {salvo ? <Check size={16} className="text-green-600" /> : <Save size={16} />}
                {salvo ? "Salvo no histórico!" : "Salvar no histórico"}
              </Button>
            </>
          )}

          {!loading && !respostas && (
            <Card>
              <CardBody className="flex flex-col items-center gap-3 py-14 text-center text-muted">
                <MessageSquareText size={28} className="text-brand-300" />
                <p className="max-w-xs text-sm">
                  Preencha ao lado e clique em{" "}
                  <strong>{modo === "reescrever" ? "Melhorar mensagem" : "Gerar respostas"}</strong>{" "}
                  para ver 3 opções prontas aqui.
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
