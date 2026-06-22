"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Sparkles, Wand2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import { PlanCTA } from "@/components/plan-cta";
import { LegalConsentLinks } from "@/components/legal-consent-links";

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
  { key: "curta", label: "Suave", hint: "Curtinha e carinhosa" },
  { key: "consultiva", label: "Explica", hint: "Mostra o valor antes do preço" },
  { key: "persuasiva", label: "Fechamento", hint: "Puxa pro agendamento" },
];

const LOADING_STEPS = [
  "Analisando mensagem…",
  "Identificando objeção…",
  "Adaptando ao DNA da clínica…",
  "Gerando resposta…",
];

const DEMO_LIMIT = 5;
const DEMO_USAGE_KEY = "leadbellus_landing_demo_generations_v1";

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
  const [loadingStep, setLoadingStep] = useState(0);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [respostas, setRespostas] = useState<RespostaTripla | null>(null);
  const [variante, setVariante] = useState<Variante>("consultiva");
  const [responseKey, setResponseKey] = useState(0);
  const [demoUses, setDemoUses] = useState(0);
  const [limitLoaded, setLimitLoaded] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const respostaAtual = respostas?.[variante] || "";
  const demoRemaining = Math.max(0, DEMO_LIMIT - demoUses);
  const demoExhausted = limitLoaded && demoRemaining <= 0;
  const usageProgress = Math.min(100, (demoUses / DEMO_LIMIT) * 100);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DEMO_USAGE_KEY);
      const parsed = raw ? Number.parseInt(raw, 10) : 0;
      setDemoUses(Number.isFinite(parsed) ? Math.min(DEMO_LIMIT, Math.max(0, parsed)) : 0);
    } catch {
      setDemoUses(0);
    } finally {
      setLimitLoaded(true);
    }
  }, []);

  // Cycle through loading steps while generating
  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((s) => (s + 1) % LOADING_STEPS.length);
    }, 420);
    return () => clearInterval(interval);
  }, [loading]);

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
    if (demoExhausted) {
      setErro("");
      setUpgradeOpen(true);
      return;
    }
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
      setResponseKey((k) => k + 1);
      setDemoUses((current) => {
        const next = Math.min(DEMO_LIMIT, current + 1);
        try {
          window.localStorage.setItem(DEMO_USAGE_KEY, String(next));
        } catch {
          /* contador local indisponível: a demo segue funcionando. */
        }
        if (next >= DEMO_LIMIT) setUpgradeOpen(true);
        return next;
      });
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
      <AnimatePresence>
        {upgradeOpen ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="start-upgrade-title"
          >
            <button
              type="button"
              aria-label="Fechar"
              className="absolute inset-0 bg-[#020711]/75 backdrop-blur-sm"
              onClick={() => setUpgradeOpen(false)}
            />
            <motion.div
              className="relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-[#C9A060]/30 bg-[#07101e] p-6 text-white shadow-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setUpgradeOpen(false)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/65 transition hover:bg-white/10 hover:text-white"
              >
                <X size={17} />
              </button>

              <div className="mb-4 inline-flex rounded-full border border-[#C9A060]/35 bg-[#C9A060]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#D9B66D]">
                Demo encerrada
              </div>

              <h3
                id="start-upgrade-title"
                className="font-serif text-2xl font-semibold leading-tight text-white"
              >
                As 5 respostas grátis acabaram.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/68">
                O Start libera o uso contínuo do gerador para preço, objeções e
                clientes que sumiram, sem depender da demo da landing.
              </p>

              <div className="mt-5 grid gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/74">
                <div className="flex items-start justify-between gap-3">
                  <span>Demo grátis</span>
                  <strong className="text-white">5 respostas</strong>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span>Start</span>
                  <strong className="text-[#D9B66D]">R$97/mês</strong>
                </div>
                <p className="border-t border-white/10 pt-3 text-xs leading-relaxed text-white/48">
                  Demo serve para testar. Start é o plano pago para usar no atendimento
                  real da clínica.
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                <PlanCTA
                  plan="start"
                  interval="monthly"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A060] px-5 py-3 text-sm font-extrabold text-[#07101e] transition hover:bg-[#D9B66D]"
                >
                  Assinar Start e continuar
                </PlanCTA>
                <Link
                  href="/signup?plan=start"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#C9A060]/35 px-5 py-3 text-sm font-bold text-[#D9B66D] transition hover:bg-[#C9A060]/10"
                >
                  Criar conta primeiro
                  <ArrowRight size={15} />
                </Link>
                <LegalConsentLinks tone="light" />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── Left card — simulator form ── */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="overflow-hidden">
          <CardBody className="space-y-4">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Simulador rápido</CardTitle>
                  <p className="mt-1 text-sm text-muted">
                    Você tem 5 gerações grátis para testar a resposta no seu tom.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => demoExhausted && setUpgradeOpen(true)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-bold",
                    demoExhausted
                      ? "border-[#C9A060] bg-[#C9A060]/10 text-[#7A5108]"
                      : "border-brand-100 bg-nude-50 text-muted"
                  )}
                >
                  {demoRemaining} de {DEMO_LIMIT} restantes
                </button>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-nude-100">
                <motion.div
                  className="h-full rounded-full bg-[#C9A060]"
                  initial={false}
                  animate={{ width: `${usageProgress}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
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
                  className="simulator-input"
                />
              </div>
              <div>
                <Label htmlFor="demo_cta">CTA preferido</Label>
                <Input
                  id="demo_cta"
                  value={ctaPreferido}
                  onChange={(e) => setCtaPreferido(e.target.value)}
                  placeholder="Ex.: agendar uma avaliação"
                  className="simulator-input"
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

            <div>
              <Label htmlFor="demo_nome_cliente">Nome da cliente</Label>
              <Input
                id="demo_nome_cliente"
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                placeholder="Ex.: Ana"
                className="simulator-input"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 transition-transform hover:-translate-y-px"
                onClick={aplicarExemplo}
              >
                <Wand2 size={16} /> Usar exemplo
              </Button>
              <motion.div className="flex-1" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  className="w-full"
                  onClick={gerar}
                  disabled={loading || !limitLoaded}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin flex-shrink-0" /> Gerando…
                    </span>
                  ) : demoExhausted ? (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles size={16} className="flex-shrink-0" /> Ver Start
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles size={16} className="flex-shrink-0" /> Gerar
                    </span>
                  )}
                </Button>
              </motion.div>
            </div>

            <div>
              <Label htmlFor="demo_msg">Mensagem da cliente</Label>
              <Textarea
                id="demo_msg"
                value={mensagemCliente}
                onChange={(e) => setMensagemCliente(e.target.value)}
                placeholder="Cole uma mensagem real do WhatsApp…"
                className="simulator-input"
              />
              {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
              {demoExhausted ? (
                <p className="mt-2 text-sm font-medium text-[#7A5108]">
                  Você já usou as 5 respostas da demo. O Start libera o uso no
                  atendimento real.
                </p>
              ) : null}
              <AvisoIA aviso={aviso} className="mt-3" />
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* ── Right card — WhatsApp preview ── */}
      <motion.div
        className="mx-auto w-full max-w-[420px]"
        initial={{ opacity: 0, x: 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative overflow-hidden rounded-[2.25rem] border border-brand-100 bg-white shadow-soft">
          <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_10%_-10%,rgba(205,163,71,0.18),transparent_55%),radial-gradient(700px_420px_at_100%_0%,rgba(14,58,48,0.16),transparent_55%)] opacity-70" />
          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-100 bg-white/70 px-5 py-4 backdrop-blur">
              <div>
                <div className="text-sm font-semibold text-ink">{contato}</div>
                <div className="text-xs text-muted">WhatsApp · demo</div>
              </div>
              {respostaAtual ? <CopyButton text={respostaAtual} /> : null}
            </div>

            {/* Messages area */}
            <div className="space-y-3 bg-nude-100/70 px-5 py-5">
              {/* Client bubble */}
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-brand-100 bg-white px-4 py-3 text-sm leading-relaxed text-ink shadow-card">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={mensagemCliente}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {mensagemCliente.trim() || (
                        <span className="text-muted">
                          Digite uma mensagem para começar…
                        </span>
                      )}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Response bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-sm leading-relaxed text-white shadow-soft">
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex items-center gap-2 text-white/90"
                      >
                        <Loader2 size={14} className="animate-spin flex-shrink-0" />
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={loadingStep}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                          >
                            {LOADING_STEPS[loadingStep]}
                          </motion.span>
                        </AnimatePresence>
                      </motion.span>
                    ) : respostaAtual ? (
                      <motion.span
                        key={`response-${responseKey}-${variante}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="whitespace-pre-wrap"
                      >
                        {respostaAtual}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-white/80"
                      >
                        Clique em "Gerar" para ver uma resposta aqui.
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Variant tabs + copy hint */}
            <div className="border-t border-brand-100 bg-white/80 px-4 py-4 backdrop-blur">
              <div className="grid grid-cols-3 gap-2">
                {VARIANTES.map((v) => (
                  <motion.button
                    key={v.key}
                    type="button"
                    onClick={() => setVariante(v.key)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
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
                  </motion.button>
                ))}
              </div>
              <p className="mt-3 text-center text-[11px] text-muted">
                Você pode copiar e colar direto no WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Gold focus ring for inputs */}
      <style>{`
        .simulator-input:focus {
          outline: none;
          border-color: #C9A060 !important;
          box-shadow: 0 0 0 3px rgba(201,160,96,0.12) !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
      `}</style>
    </div>
  );
}
