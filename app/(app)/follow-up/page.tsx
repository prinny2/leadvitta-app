"use client";

import { useEffect, useState } from "react";
import { Send, Loader2, Clock, MessageCircle, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CopyButton } from "@/components/copy-button";
import { AvisoIA } from "@/components/aviso-ia";
import { LoadingRespostas } from "@/components/loading-respostas";
import { followups } from "@/data/followups";
import { procedimentos } from "@/data/procedimentos";
import { tons } from "@/data/tons";
import { followupContextoOptions } from "@/data/opcoes";
import { addHistorico } from "@/lib/store";
import { useClinica } from "@/lib/hooks/use-clinica";
import { cn } from "@/lib/utils";

const fupOptions = followups.map((f) => ({ value: f.id, label: f.label }));
const procOptions = procedimentos.map((p) => ({ value: p.id, label: p.label }));
const tomOptions = tons.map((t) => ({ value: t.id, label: t.label }));

const MSG_LABELS = [
  { titulo: "Abertura", descricao: "Reativa sem pressionar", icon: "01" },
  { titulo: "Meio", descricao: "Reforça valor ou urgência", icon: "02" },
  { titulo: "Fechamento", descricao: "Convida diretamente", icon: "03" },
];

export default function FollowUpPage() {
  const { clinica } = useClinica();
  const [gatilho, setGatilho] = useState("sumiu_1d");
  const [contexto, setContexto] = useState("ela disse que ia pensar");
  const [procedimento, setProcedimento] = useState("");
  const [detalhe, setDetalhe] = useState("");
  const [tom, setTom] = useState("acolhedor");
  const [nomeCliente, setNomeCliente] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [mensagens, setMensagens] = useState<string[] | null>(null);

  useEffect(() => {
    if (clinica?.tom_padrao) setTom(clinica.tom_padrao);
  }, [clinica]);

  async function gerar() {
    setLoading(true);
    setErro("");
    setAviso("");
    setMensagens(null);
    try {
      const res = await fetch("/api/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gatilho, contexto, detalhe, procedimento, tom, nomeCliente,
          clinica: clinica
            ? {
                nome_clinica: clinica.nome_clinica,
                cidade: clinica.cidade,
                como_chamar: clinica.como_chamar,
                formalidade: clinica.formalidade,
                cta_preferido: clinica.cta_preferido,
              }
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error || "Não foi possível gerar agora."); return; }
      setMensagens(data.mensagens);
      if (data.mock) {
        setAviso(data.aviso || "Modo demonstração — mostrando um exemplo. As mensagens reais entram quando a clínica está ativa.");
      } else if (data.aviso) {
        setAviso(data.aviso);
      }
      addHistorico({
        tipo: "follow_up",
        contexto: { gatilho, contexto, procedimento, tom, nomeCliente },
        respostas: data.mensagens,
      }).catch(() => {});
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-semibold text-champagne-300">
          Follow-up Inteligente
        </h1>
        <p className="text-sm text-navy-100 mt-1">
          Reative quem sumiu depois de perguntar ou agendar — sem parecer insistente.
          São 3 mensagens escalonadas no ritmo certo.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">

        {/* Formulário */}
        <div className="rounded-2xl border border-navy-500 bg-navy-700 shadow-card">
          <div className="border-b border-brand-50 px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-100">
              Contexto da cliente
            </p>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="gat">Sumiu há quanto tempo?</Label>
                <Select id="gat" value={gatilho} onChange={setGatilho} options={fupOptions} />
              </div>
              <div>
                <Label htmlFor="ctx">O que aconteceu antes?</Label>
                <Select id="ctx" value={contexto} onChange={setContexto} options={followupContextoOptions} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nome">Nome da cliente</Label>
                <Input id="nome" value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} placeholder="Ex.: Ana (opcional)" />
              </div>
              <div>
                <Label htmlFor="proc">Procedimento de interesse</Label>
                <Select id="proc" value={procedimento} onChange={setProcedimento} options={procOptions} placeholder="Selecione..." />
              </div>
            </div>

            <div>
              <Label htmlFor="tom">Tom da mensagem</Label>
              <Select id="tom" value={tom} onChange={setTom} options={tomOptions} />
            </div>

            <div>
              <Label htmlFor="det">Detalhe adicional</Label>
              <Textarea
                id="det"
                value={detalhe}
                onChange={(e) => setDetalhe(e.target.value)}
                placeholder="Ex.: ela pediu orçamento de preenchimento e disse que ia ver com o marido."
                className="min-h-[80px]"
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
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Gerar sequência de follow-up
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          <AvisoIA aviso={aviso} />
          {loading && <LoadingRespostas mensagem="Preparando mensagens de reativação..." />}

          {!loading && mensagens && (
            <div className="space-y-3">
              {/* Timeline visual */}
              {mensagens.map((m, i) => {
                const meta = MSG_LABELS[i] ?? { titulo: `Mensagem ${i + 1}`, descricao: "", icon: String(i + 1).padStart(2, "0") };
                const isGold = i === 1;
                return (
                  <div key={i} className="relative flex gap-3">
                    {/* Linha conectora */}
                    {i < mensagens.length - 1 && (
                      <div className="absolute left-[18px] top-10 h-[calc(100%+12px)] w-px bg-brand-100" />
                    )}
                    {/* Ícone */}
                    <div className={cn(
                      "relative z-10 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold shadow-sm",
                      isGold ? "bg-gold-500 text-navy-900" : "bg-navy-800 text-white"
                    )}>
                      {meta.icon}
                    </div>
                    {/* Card */}
                    <div className={cn(
                      "flex-1 rounded-2xl border p-4",
                      isGold ? "border-gold-500/40 bg-gradient-to-br from-navy-700 to-navy-800" : "border-navy-500 bg-navy-700"
                    )}>
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-champagne-300">{meta.titulo}</p>
                          <p className="text-xs text-navy-100">{meta.descricao}</p>
                        </div>
                        <CopyButton text={m} />
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-champagne-300">{m}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !mensagens && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-500 bg-navy-700 py-14 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10">
                <Clock size={22} className="text-gold-500" />
              </div>
              <p className="text-sm font-medium text-champagne-300 mb-1">Sequência aparece aqui</p>
              <p className="text-xs text-navy-100 max-w-[220px] leading-relaxed">
                Escolha o tempo e o contexto ao lado para gerar 3 mensagens escalonadas.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs text-navy-100">
                <ChevronRight size={14} className="text-gold-500" />
                Abertura · Meio · Fechamento
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
