"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AvisoIA } from "@/components/aviso-ia";
import { PlanCTA } from "@/components/plan-cta";
import { LegalConsentLinks } from "@/components/legal-consent-links";
import { TrackLink } from "@/components/track-link";
import { trackEvent } from "@/components/Analytics";
import {
  ComoChamarChoice,
  JeitoDeFalarChoice,
  QuickReplyCards,
  useQuickReply,
} from "@/components/quick-reply-demo";
import { DEMO_LIMIT, DEMO_PRESET_EVENT } from "@/lib/quick-reply";
import { procedimentos } from "@/data/procedimentos";
import type { ComoChamar } from "@/lib/types";

const PROC_OPTIONS = procedimentos.slice(0, 10).map((p) => ({
  value: p.id,
  label: p.label,
}));

/** Chips logo abaixo da caixa (rótulos curtos; o texto vem de QUICK_REPLY_PRESETS). */
const EXEMPLOS: { id: string; label: string }[] = [
  { id: "preco", label: "Perguntou o preço" },
  { id: "achou_caro", label: "Achou caro" },
  { id: "medo", label: "Tem medo" },
  { id: "sumiu", label: "Sumiu" },
];

const SIGNUP_START = "/signup?plan=start";

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function LandingWhatsAppDemo() {
  const demoRef = useRef<HTMLDivElement>(null);
  const demoViewed = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultTitleRef = useRef<HTMLHeadingElement>(null);
  const searchParams = useSearchParams();
  const demoParam = searchParams.get("demo") || "";

  const qr = useQuickReply("landing_demo");
  const { applyPreset } = qr;

  // Tom da clínica (opcional, recolhido).
  const [nomeClinica, setNomeClinica] = useState("");
  const [comoChamar, setComoChamar] = useState<ComoChamar>("linda");
  const [formalidade, setFormalidade] = useState(50);
  const [procedimento, setProcedimento] = useState("");

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [scrollToResult, setScrollToResult] = useState(false);

  useEffect(() => {
    const target = demoRef.current;
    if (!target || demoViewed.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // A 1ª notificação chega com isIntersecting mesmo abaixo do threshold.
        // No celular a demo é mais alta que a tela, então "40% da demo" pode
        // nunca acontecer: conta também quando ela ocupa 40% da tela.
        const visto =
          entry.intersectionRatio >= 0.4 ||
          entry.intersectionRect.height >= window.innerHeight * 0.4;
        if (!entry.isIntersecting || !visto || demoViewed.current) return;
        demoViewed.current = true;
        trackEvent("view_demo", { content_name: "landing_demo" });
        observer.disconnect();
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4] }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // `?demo=<id>` (links externos e anúncios).
  useEffect(() => {
    if (demoParam) applyPreset(demoParam);
    // applyPreset só muda estado; reagir só ao parâmetro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoParam]);

  // Chips da seção Situações: o mesmo exemplo pode ser escolhido de novo, o
  // que o `?demo=` não permitia (o efeito só roda quando o parâmetro muda).
  const applyPresetRef = useRef(applyPreset);
  applyPresetRef.current = applyPreset;
  useEffect(() => {
    function onPreset(event: Event) {
      const id = (event as CustomEvent<string>).detail;
      if (typeof id === "string") applyPresetRef.current(id);
    }
    window.addEventListener(DEMO_PRESET_EVENT, onPreset);
    return () => window.removeEventListener(DEMO_PRESET_EVENT, onPreset);
  }, []);

  useEffect(() => {
    if (!upgradeOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setUpgradeOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [upgradeOpen]);

  useEffect(() => {
    if (!scrollToResult || !qr.respostas) return;
    setScrollToResult(false);
    const title = resultTitleRef.current;
    if (!title) return;
    title.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
    title.focus({ preventScroll: true });
  }, [scrollToResult, qr.respostas]);

  async function gerar() {
    if (qr.exhausted) {
      setUpgradeOpen(true);
      return;
    }
    const outcome = await qr.generate({
      procedimento,
      clinica: {
        nome_clinica: nomeClinica,
        formalidade,
        como_chamar: comoChamar,
      },
    });
    if (outcome.status === "esgotado") {
      setUpgradeOpen(true);
      return;
    }
    if (outcome.status === "ok") {
      setScrollToResult(true);
      if (outcome.esgotouAgora) setUpgradeOpen(true);
    }
  }

  function testarOutra() {
    qr.clearResult();
    qr.editMensagem("");
    const box = textareaRef.current;
    if (!box) return;
    box.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "center",
    });
    box.focus({ preventScroll: true });
  }

  return (
    <div ref={demoRef} className="mx-auto w-full max-w-[640px]">
      {upgradeOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6"
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
          <div className="relative w-full max-w-[440px] animate-fade-in overflow-hidden rounded-2xl border border-[#C9A060]/30 bg-[#07101e] p-6 text-white shadow-2xl">
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setUpgradeOpen(false)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              <X size={17} />
            </button>

            <div className="mb-4 inline-flex rounded-full border border-[#C9A060]/35 bg-[#C9A060]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#D9B66D]">
              Testes encerrados
            </div>

            <h3
              id="start-upgrade-title"
              className="font-serif text-2xl font-semibold leading-tight text-white"
            >
              Seus 5 testes grátis acabaram.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Crie sua conta grátis e ganhe mais 5 respostas, sem cartão. Para
              usar todo dia no atendimento, o Start custa R$97/mês.
            </p>

            <div className="mt-5 grid gap-3">
              <TrackLink
                event="cta_click"
                source="demo_limit"
                href={SIGNUP_START}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A060] px-5 py-3 text-sm font-extrabold text-[#07101e] transition hover:bg-[#D9B66D]"
              >
                Criar conta grátis
                <ArrowRight size={15} />
              </TrackLink>
              <PlanCTA
                plan="start"
                interval="monthly"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#C9A060]/35 px-5 py-3 text-sm font-bold text-[#D9B66D] transition hover:bg-[#C9A060]/10"
              >
                Assinar o Start
              </PlanCTA>
              <LegalConsentLinks tone="light" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-navy-500 bg-navy-800 p-5 shadow-soft sm:p-7">
        <Label htmlFor="demo_msg">Mensagem da cliente</Label>
        <Textarea
          id="demo_msg"
          ref={textareaRef}
          value={qr.mensagem}
          onChange={(e) => qr.editMensagem(e.target.value)}
          placeholder="Cole aqui a mensagem da cliente…"
          className="min-h-[104px] text-base"
        />

        <div className="mt-3 flex flex-wrap gap-2" aria-label="Exemplos de mensagem">
          {EXEMPLOS.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => applyPreset(ex.id)}
              aria-pressed={qr.situacao === ex.id}
              className={
                qr.situacao === ex.id
                  ? "min-h-[44px] rounded-full border border-gold-500 bg-gold-500/15 px-3.5 text-sm font-semibold text-champagne-100"
                  : "min-h-[44px] rounded-full border border-gold-500/35 bg-transparent px-3.5 text-sm font-semibold text-champagne-300 transition-colors hover:border-gold-500/70 hover:bg-gold-500/10"
              }
            >
              {ex.label}
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="cta"
          size="lg"
          className="mt-4 w-full font-bold"
          onClick={gerar}
          disabled={qr.loading || !qr.limitLoaded}
        >
          {qr.loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Escrevendo 3 respostas…
            </>
          ) : (
            <>
              <Sparkles size={18} /> Ver minhas 3 respostas
            </>
          )}
        </Button>

        <p className="mt-2.5 text-center text-xs text-navy-50" aria-live="polite">
          {qr.limitLoaded ? qr.remaining : DEMO_LIMIT} de {DEMO_LIMIT} testes grátis · sem cadastro
        </p>
        <p className="mt-1 text-center text-xs text-muted">
          Não precisa colar nome nem telefone da cliente.
        </p>

        {qr.erro ? (
          <div role="alert" className="mt-3 rounded-xl border border-pain-500/40 bg-pain-500/10 px-3.5 py-2.5 text-sm text-pain-300">
            <p>{qr.erro.mensagem}</p>
            {qr.erro.tipo === "limite_diario" ? (
              <TrackLink
                event="cta_click"
                source="demo_signup"
                href={SIGNUP_START}
                className="mt-2 inline-flex items-center gap-1.5 font-semibold text-gold-300 underline-offset-2 hover:underline"
              >
                Criar conta grátis <ArrowRight size={14} />
              </TrackLink>
            ) : null}
          </div>
        ) : null}

        <details className="lb-demo-options mt-4 rounded-2xl border border-navy-500 bg-navy-700/60">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-champagne-300">
            Deixar no tom da minha clínica (opcional)
          </summary>
          <div className="space-y-4 border-t border-navy-500 px-4 pb-4 pt-4">
            <div>
              <Label htmlFor="demo_nome_clinica">Nome da clínica</Label>
              <Input
                id="demo_nome_clinica"
                value={nomeClinica}
                onChange={(e) => setNomeClinica(e.target.value)}
                placeholder="Ex.: Clínica Aurora"
                autoComplete="organization"
              />
            </div>
            <ComoChamarChoice
              label="Como chamar a cliente"
              value={comoChamar}
              onChange={setComoChamar}
            />
            <JeitoDeFalarChoice value={formalidade} onChange={setFormalidade} />
            <div>
              <Label htmlFor="demo_proc">Procedimento (opcional)</Label>
              <Select
                id="demo_proc"
                value={procedimento}
                onChange={setProcedimento}
                options={PROC_OPTIONS}
                placeholder="Qualquer procedimento"
              />
            </div>
          </div>
        </details>
      </div>

      {qr.respostas ? (
        <div className="mt-8">
          <h3
            ref={resultTitleRef}
            tabIndex={-1}
            className="scroll-mt-24 text-center font-serif text-2xl font-semibold text-[#0B1B33] outline-none"
          >
            Suas 3 respostas
          </h3>
          <p className="mb-4 mt-1 text-center text-sm text-[#3D5068]">
            Escolha uma, ajuste se quiser e envie pelo seu WhatsApp.
          </p>
          <QuickReplyCards respostas={qr.respostas} />
          <AvisoIA aviso={qr.aviso} className="mt-3" />

          <div className="mt-6 rounded-2xl border border-[rgba(201,160,96,0.45)] bg-white p-6 text-center">
            <p className="m-0 text-[15px] font-semibold leading-relaxed text-[#0B1B33]">
              Gostou? Crie sua conta e use com as mensagens da sua clínica.
            </p>
            <TrackLink
              event="cta_click"
              source="demo_signup"
              href={SIGNUP_START}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#0B1B33] px-7 py-3.5 text-[15px] font-bold text-white no-underline"
            >
              Criar conta grátis <ArrowRight size={16} />
            </TrackLink>
            <p className="mt-2.5 text-xs text-[#3D5068]">
              5 respostas grátis · sem cartão · depois, Start R$97/mês
            </p>
            <div className="mx-auto mt-2 max-w-[430px]">
              <LegalConsentLinks />
            </div>
            <button
              type="button"
              onClick={testarOutra}
              className="mt-3 text-sm font-semibold text-[#9A6414] underline-offset-2 hover:underline"
            >
              Testar outra mensagem
            </button>
          </div>
        </div>
      ) : null}

      <style>{`
        .lb-demo-options > summary::-webkit-details-marker { display: none; }
        .lb-demo-options > summary::after { content: "+"; float: right; color: #C9A060; font-weight: 700; }
        .lb-demo-options[open] > summary::after { content: "–"; }
      `}</style>
    </div>
  );
}
