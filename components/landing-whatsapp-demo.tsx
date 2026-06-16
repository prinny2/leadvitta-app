"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AvisoIA } from "@/components/aviso-ia";
import { CopyButton } from "@/components/copy-button";
import { procedimentos } from "@/data/procedimentos";
import { situacoes } from "@/data/situacoes";
import { tons } from "@/data/tons";
import { cn } from "@/lib/utils";
import type { ComoChamar, RespostaTripla, Variante } from "@/lib/types";

const procOptions = procedimentos.slice(0, 10).map((p) => ({
  value: p.id,
  label: p.label,
}));
const sitOptions = situacoes.slice(0, 6).map((s) => ({
  value: s.id,
  label: s.label,
}));
const tomOptions = tons.map((t) => ({ value: t.id, label: t.label }));

const COMO_CHAMAR_OPTIONS: { value: ComoChamar; label: string }[] = [
  { value: "linda", label: "Linda" },
  { value: "amor", label: "Amor" },
  { value: "nome", label: "Pelo nome" },
  { value: "nenhum", label: "Sem apelido" },
];

const PRESETS: Record<string, { mensagem: string; procedimento?: string }> = {
  preco: {
    mensagem: "Oi! Quanto fica o botox? 🙂",
    procedimento: "botox",
  },
  achou_caro: {
    mensagem: "Achei caro… tem como melhorar esse valor?",
  },
  sumiu: {
    mensagem: "Oi… (silêncio depois do orçamento)",
  },
  desconto: {
    mensagem: "Se eu fechar hoje você faz um desconto?",
  },
  dor: {
    mensagem: "Dói? Tenho muito medo de agulha…",
  },
  medo: {
    mensagem: "Tenho receio de ficar artificial. Como vocês fazem?",
  },
};

const VARIANTES: { key: Variante; label: string; hint: string }[] = [
  {
    key: "curta",
    label: "Suave",
    hint: "Curtinha e carinhosa",
  },
  {
    key: "consultiva",
    label: "Explica",
    hint: "Mostra o valor antes do preço",
  },
  {
    key: "persuasiva",
    label: "Fechamento",
    hint: "Puxa pro agendamento",
  },
];

export function LandingWhatsAppDemo() {
  const searchParams = useSearchParams();
  const demoParam = searchParams.get("demo") || "";
  const [nomeClinica, setNomeClinica] = useState("Clínica Aurora");
  const [comoChamar, setComoChamar] = useState<ComoChamar>("linda");
  const [ctaPreferido, setCtaPreferido] = useState("marcar uma avaliação");
  const [formalidade, setFormalidade] = useState(40);

  const [nomeCliente, setNomeCliente] = useState("Ana");
  const [procedimento, setProcedimento] = useState("botox");
  const [situacao, setSituacao] = useState("preco");
  const [tom, setTom] = useState("acolhedor");
  const [mensagemCliente, setMensagemCliente] = useState(PRESETS.preco.mensagem);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [respostas, setRespostas] = useState<RespostaTripla | null>(null);
  const [variante, setVariante] = useState<Variante>("consultiva");

  const respostaAtual = respostas?.[variante] || "";

  useEffect(() => {
    if (!demoParam) return;
    const preset = PRESETS[demoParam];
    if (!preset) return;
    setSituacao(demoParam);
    setMensagemCliente(preset.mensagem);
    if (preset.procedimento) setProcedimento(preset.procedimento);
    setRespostas(null);
    setAviso("");
    setErro("");
    setVariante("consultiva");
  }, [demoParam]);

  const contato = useMemo(() => {
    const clinica = nomeClinica.trim() || "Sua clínica";
    return clinica.length > 24 ? clinica.slice(0, 24) + "…" : clinica;
  }, [nomeClinica]);

  function aplicarExemplo() {
    const p = PRESETS[situacao];
    if (!p) return;
    setMensagemCliente(p.mensagem);
    if (p.procedimento) setProcedimento(p.procedimento);
    setRespostas(null);
    setAviso("");
    setErro("");
  }

  async function gerar() {
    if (!mensagemCliente.trim()) {
      setErro("Digite a mensagem da cliente para simular.");
      return;
    }

    setLoading(true);
    setErro("");
    setAviso("");
    setRespostas(null);
    setVariante("consultiva");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo: "gerar",
          procedimento,
          situacao,
          tom,
          objetivo: "direcionar para a avaliação",
          nomeCliente,
          mensagemCliente,
          clinica: {
            nome_clinica: nomeClinica,
            formalidade,
            como_chamar: comoChamar,
            cta_preferido: ctaPreferido,
          },
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
            "Modo demonstração: mostramos um exemplo realista pra você ver como fica."
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

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <Card className="overflow-hidden">
        <CardBody className="space-y-4">
          <div>
            <CardTitle>Simulador rápido</CardTitle>
            <p className="mt-1 text-sm text-muted">
              É simples: <strong>1.</strong> diga o nome e o tom da sua clínica ·{" "}
              <strong>2.</strong> cole a mensagem da cliente · <strong>3.</strong>{" "}
              veja 3 jeitos de responder e copie o melhor.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="demo_nome_clinica">Nome da clínica</Label>
              <Input
                id="demo_nome_clinica"
                value={nomeClinica}
                onChange={(e) => setNomeClinica(e.target.value)}
                placeholder="Ex.: Clínica Aurora"
              />
            </div>
            <div>
              <Label htmlFor="demo_cta">CTA preferido</Label>
              <Input
                id="demo_cta"
                value={ctaPreferido}
                onChange={(e) => setCtaPreferido(e.target.value)}
                placeholder="Ex.: agendar uma avaliação"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <Label htmlFor="demo_chamar">Como chamar</Label>
              <Select
                id="demo_chamar"
                value={comoChamar}
                onChange={(v) => setComoChamar(v as ComoChamar)}
                options={COMO_CHAMAR_OPTIONS}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="demo_formalidade">
                Formalidade{" "}
                <span className="text-xs font-medium text-muted">
                  ({formalidade}%)
                </span>
              </Label>
              <input
                id="demo_formalidade"
                type="range"
                min={0}
                max={100}
                value={formalidade}
                onChange={(e) => setFormalidade(Number(e.target.value))}
                className="h-11 w-full accent-brand-600"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="demo_proc">Procedimento</Label>
              <Select
                id="demo_proc"
                value={procedimento}
                onChange={(v) => {
                  setProcedimento(v);
                  setRespostas(null);
                  setAviso("");
                  setErro("");
                }}
                options={procOptions}
              />
            </div>
            <div>
              <Label htmlFor="demo_sit">Situação</Label>
              <Select
                id="demo_sit"
                value={situacao}
                onChange={(v) => {
                  setSituacao(v);
                  setRespostas(null);
                  setAviso("");
                  setErro("");
                }}
                options={sitOptions}
              />
            </div>
            <div>
              <Label htmlFor="demo_tom">Tom</Label>
              <Select
                id="demo_tom"
                value={tom}
                onChange={(v) => {
                  setTom(v);
                  setRespostas(null);
                  setAviso("");
                  setErro("");
                }}
                options={tomOptions}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="demo_nome_cliente">Nome da cliente</Label>
              <Input
                id="demo_nome_cliente"
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                placeholder="Ex.: Ana"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={aplicarExemplo}
              >
                <Wand2 size={16} /> Usar exemplo
              </Button>
              <Button
                type="button"
                className="w-full"
                onClick={gerar}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Gerando…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Gerar
                  </>
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="demo_msg">Mensagem da cliente</Label>
            <Textarea
              id="demo_msg"
              value={mensagemCliente}
              onChange={(e) => setMensagemCliente(e.target.value)}
              placeholder="Cole uma mensagem real do WhatsApp…"
            />
            {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
            <AvisoIA aviso={aviso} className="mt-3" />
          </div>
        </CardBody>
      </Card>

      <div className="mx-auto w-full max-w-[420px]">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-brand-100 bg-white shadow-soft">
          <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_10%_-10%,rgba(205,163,71,0.18),transparent_55%),radial-gradient(700px_420px_at_100%_0%,rgba(14,58,48,0.16),transparent_55%)] opacity-70" />
          <div className="relative">
            <div className="flex items-center justify-between border-b border-brand-100 bg-white/70 px-5 py-4 backdrop-blur">
              <div>
                <div className="text-sm font-semibold text-ink">{contato}</div>
                <div className="text-xs text-muted">WhatsApp · demo</div>
              </div>
              {respostaAtual ? <CopyButton text={respostaAtual} /> : null}
            </div>

            <div className="space-y-3 bg-nude-100/70 px-5 py-5">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-brand-100 bg-white px-4 py-3 text-sm leading-relaxed text-ink shadow-card">
                  {mensagemCliente.trim() || (
                    <span className="text-muted">
                      Digite uma mensagem para começar…
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-sm leading-relaxed text-white shadow-soft">
                  {loading ? (
                    <span className="inline-flex items-center gap-2 text-white/90">
                      <Loader2 size={16} className="animate-spin" /> Escrevendo…
                    </span>
                  ) : respostaAtual ? (
                    <span className="whitespace-pre-wrap">{respostaAtual}</span>
                  ) : (
                    <span className="text-white/80">
                      Clique em “Gerar” para ver uma resposta aqui.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-brand-100 bg-white/80 px-4 py-4 backdrop-blur">
              <div className="grid grid-cols-3 gap-2">
                {VARIANTES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setVariante(v.key)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors",
                      variante === v.key
                        ? "border-brand-300 bg-brand-50 text-brand-700"
                        : "border-brand-100 bg-white text-ink hover:bg-nude-50"
                    )}
                  >
                    <div>{v.label}</div>
                    <div className="mt-0.5 text-[11px] font-medium text-muted">
                      {v.hint}
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center text-[11px] text-muted">
                Você pode copiar e colar direto no WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
