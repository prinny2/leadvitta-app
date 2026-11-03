"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { PlanCheckoutButton } from "@/components/plan-checkout-button";
import { WaitlistForm } from "@/components/waitlist-form";
import { StartPlanCard } from "@/components/start-plan-card";
import { HeroLoop } from "@/components/hero-loop";
import { AvisoIA } from "@/components/aviso-ia";
import { TrackLink } from "@/components/track-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ComoChamarChoice,
  JeitoDeFalarChoice,
  QuickReplyCards,
  useLoadingStep,
  useQuickReply,
} from "@/components/quick-reply-demo";
import { trackCheckoutReturn, trackEvent } from "@/components/Analytics";
import { parseBillingPlan } from "@/lib/billing";
import {
  isClerkClientConfigured,
  isFirebaseConfigured,
} from "@/lib/config";
import { DEMO_LIMIT } from "@/lib/quick-reply";
import { clinicaVazia, type Clinica } from "@/lib/types";
import { resolveOnboardingView } from "@/app/(marketing)/onboarding/helpers";

const DRAFT_KEY = "lb_dna_draft";
const SIGNUP_START = "/signup?plan=start";

const LOADING_STEPS = [
  "Lendo a mensagem…",
  "Entendendo a situação…",
  "Escrevendo no tom da clínica…",
];

const PLAN_BULLETS = [
  "3 respostas para cada mensagem, no tom da clínica",
  "Follow-up e retorno pós-procedimento",
  "Cancele quando quiser, no painel",
];

type ScrollTarget = "result" | "plans" | "personalizar" | "input";

/**
 * lib/store (Firebase + Supabase, ~180 KB gzip) só carrega quando há conta
 * para ler/gravar o DNA (`canPersist`). No funil público com Firebase ligado e
 * sem login, o onboarding nem baixa esse SDK.
 */
const loadStore = () => import("@/lib/store");

function loadDraft(): Partial<Clinica> | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<Clinica>) : null;
  } catch {
    return null;
  }
}

/**
 * O visual-auth-panel lê esta chave no cadastro (persistDraft): é assim que o
 * tom escolhido aqui chega na conta nova.
 */
function saveDraft(c: Clinica) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(c));
  } catch {
    // Storage indisponivel nao deve travar o funil publico.
  }
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

type OnboardingCoreProps = {
  authLoaded: boolean;
  signedIn: boolean;
};

function OnboardingCore({ authLoaded, signedIn }: OnboardingCoreProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planFromUrl = parseBillingPlan(searchParams.get("plan"));
  const checkoutParam = searchParams.get("checkout");
  const checkoutSuccess = checkoutParam === "sucesso";
  const checkoutCanceled = checkoutParam === "cancelado";
  const tabFromUrl = searchParams.get("aba");
  const canPersist = signedIn || !isFirebaseConfigured;
  const urlView = resolveOnboardingView(planFromUrl, tabFromUrl, checkoutParam);

  const qr = useQuickReply("onboarding");
  const loadingStep = useLoadingStep(qr.loading, LOADING_STEPS.length, 1300);

  const [clinic, setClinic] = useState<Clinica>(clinicaVazia);
  const [showPlans, setShowPlans] = useState(urlView.showPlans);
  const [editing, setEditing] = useState(true);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [personalizarOpen, setPersonalizarOpen] = useState(false);
  const [personalizado, setPersonalizado] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  // Com `?aba=planos` / `?checkout=cancelado` os planos já abrem no topo
  // (logo abaixo do aviso de pagamento): sem rolagem automática no mount, que
  // esconderia o aviso "Pagamento cancelado".
  const [scrollTarget, setScrollTarget] = useState<ScrollTarget | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resultTitleRef = useRef<HTMLHeadingElement>(null);
  const plansRef = useRef<HTMLElement>(null);
  const personalizarRef = useRef<HTMLDivElement>(null);

  // A URL pode mudar sem remontar (ex.: link interno com ?plan=start).
  useEffect(() => {
    if (urlView.showPlans) setShowPlans(true);
  }, [urlView.showPlans]);

  useEffect(() => {
    const draft = loadDraft();
    if (!draft) return;
    setClinic((prev) => ({ ...prev, ...draft }));
  }, []);

  useEffect(() => {
    if (!authLoaded || !canPersist) return;

    loadStore()
      .then(({ getClinica }) => getClinica())
      .then((saved) => {
        if (saved.nome_clinica || saved.onboarded) {
          setClinic((prev) => ({ ...prev, ...saved }));
        }
      })
      .catch(() => {
        // Mantem o rascunho local se a sessao Firebase ainda nao sincronizou.
      });
  }, [authLoaded, canPersist]);

  useEffect(() => {
    if (!checkoutSuccess) return;
    const sessionId = searchParams.get("session_id");
    void trackCheckoutReturn(sessionId);
  }, [checkoutSuccess, searchParams]);

  // view_demo uma vez por visita ao onboarding (vira ViewContent no Meta).
  const viewTracked = useRef(false);
  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    trackEvent("view_demo", { content_name: "onboarding" });
  }, []);

  // Esgotou os testes grátis: os planos passam a aparecer.
  useEffect(() => {
    if (qr.exhausted) setShowPlans(true);
  }, [qr.exhausted]);

  useEffect(() => {
    if (!scrollTarget) return;
    const el =
      scrollTarget === "result"
        ? resultTitleRef.current
        : scrollTarget === "plans"
          ? plansRef.current
          : scrollTarget === "personalizar"
            ? personalizarRef.current
            : textareaRef.current;
    if (!el) return;
    setScrollTarget(null);
    el.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: scrollTarget === "input" ? "center" : "start",
    });
    if (scrollTarget === "result") resultTitleRef.current?.focus({ preventScroll: true });
    if (scrollTarget === "input") textareaRef.current?.focus({ preventScroll: true });
  }, [scrollTarget, qr.respostas, showPlans, personalizarOpen, editing]);

  function updateClinic(patch: Partial<Clinica>) {
    setClinic((prev) => {
      const next = { ...prev, ...patch };
      saveDraft(next);
      return next;
    });
  }

  function clinicPayload() {
    return {
      nome_clinica: clinic.nome_clinica,
      formalidade: clinic.formalidade,
      como_chamar: clinic.como_chamar,
      cta_preferido: clinic.cta_preferido,
    };
  }

  async function gerar(
    override?: { mensagem: string; situacao?: string; procedimento?: string },
    origem: "tela1" | "refazer" = "tela1"
  ) {
    const outcome = await qr.generate({ clinica: clinicPayload(), override });
    if (outcome.status === "ok") {
      setHasGenerated(true);
      setEditing(false);
      if (origem === "refazer") setPersonalizado(true);
      setScrollTarget("result");
    } else if (outcome.status === "esgotado") {
      setShowPlans(true);
      setScrollTarget("plans");
    }
  }

  function usarExemplo() {
    trackEvent("cta_click", { source: "onboarding_example" });
    const preset = qr.applyPreset("preco");
    if (preset) void gerar(preset);
  }

  function trocarMensagem() {
    qr.clearResult();
    setEditing(true);
    setScrollTarget("input");
  }

  function testarOutra() {
    qr.clearResult();
    qr.editMensagem("");
    setEditing(true);
    setScrollTarget("input");
  }

  function abrirPlanos() {
    trackEvent("cta_click", { source: "onboarding_planos" });
    setShowPlans(true);
    setScrollTarget("plans");
  }

  function abrirPersonalizar() {
    setPersonalizarOpen(true);
    setScrollTarget("personalizar");
  }

  /** Único caminho de gravação do DNA — evita salvar duas vezes o mesmo estado. */
  async function persistClinic(): Promise<boolean> {
    if (!canPersist) return false;
    try {
      const { saveClinica } = await loadStore();
      await saveClinica({ ...clinic, onboarded: true });
      return true;
    } catch {
      setSaveFailed(true);
      return false;
    }
  }

  async function saveAndEnter() {
    setSaving(true);
    setSaveFailed(false);
    try {
      const ok = await persistClinic();
      if (!ok) return;
      trackEvent("sign_up", {
        method: "Onboarding",
        city: clinic.cidade || undefined,
        procedures_count: clinic.procedimentos.length,
      });
      router.push("/gerador");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const erro = qr.erro;
  const respostasVisiveis = !!qr.respostas && !editing;

  const exhaustedBlock = (
    <div className="mt-3 rounded-2xl border border-gold-500/40 bg-gold-500/10 p-5 text-center">
      <p className="font-serif text-lg font-semibold text-champagne-100">
        Seus 5 testes grátis acabaram.
      </p>
      <p className="mt-1 text-sm leading-relaxed text-champagne-300">
        Crie sua conta grátis e ganhe mais 5 respostas, sem cartão.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <TrackLink
          event="cta_click"
          source="onboarding_signup"
          href={SIGNUP_START}
          className="btn-cta w-full text-sm"
        >
          Criar conta grátis
        </TrackLink>
        <button type="button" onClick={abrirPlanos} className="btn-cta-outline w-full text-sm">
          Ver planos
        </button>
      </div>
    </div>
  );

  const errorBlock = erro ? (
    <div
      role="alert"
      className="mt-3 rounded-xl border border-pain-500/40 bg-pain-500/10 px-4 py-3 text-sm text-pain-300"
    >
      <p>{erro.mensagem}</p>
      {erro.tipo === "api" || erro.tipo === "conexao" ? (
        <button
          type="button"
          onClick={() => void gerar(undefined, editing ? "tela1" : "refazer")}
          disabled={qr.loading}
          className="mt-2 rounded-lg border border-pain-300/40 px-3 py-1.5 text-xs font-semibold text-pain-200 hover:bg-pain-500/10 disabled:opacity-60"
        >
          Tentar de novo
        </button>
      ) : null}
      {erro.tipo === "limite_diario" ? (
        <TrackLink
          event="cta_click"
          source="onboarding_signup"
          href={SIGNUP_START}
          className="mt-2 inline-flex items-center gap-1.5 font-semibold text-gold-300 hover:text-gold-200"
        >
          Criar conta grátis <ArrowRight size={14} />
        </TrackLink>
      ) : null}
    </div>
  ) : null;

  const plansSection = showPlans ? (
    <section
      id="planos"
      ref={plansRef}
      aria-labelledby="planos-titulo"
      className="scroll-mt-6 space-y-5"
    >
      {urlView.plansFirst ? (
        <h1 id="planos-titulo" className="text-center font-serif text-3xl font-semibold text-ink">
          Planos
        </h1>
      ) : (
        <h2 id="planos-titulo" className="text-center font-serif text-2xl font-semibold text-ink">
          Planos
        </h2>
      )}

      <StartPlanCard bullets={PLAN_BULLETS}>
        <PlanCheckoutButton
          plan="start"
          className="btn-cta w-full text-sm disabled:opacity-60"
        >
          Assinar o Start
        </PlanCheckoutButton>
      </StartPlanCard>

      <div className="mx-auto max-w-[460px] rounded-2xl border border-navy-500 bg-navy-700 p-5">
        <p className="text-sm font-semibold text-champagne-200">Pro e Premium · em breve</p>
        <p className="mb-3 mt-0.5 text-sm text-muted">Me avise quando abrir</p>
        <WaitlistForm plan="pro" />
      </div>

      {!signedIn && (
        <p className="text-center text-sm text-champagne-300">
          Prefere criar a conta antes?{" "}
          <TrackLink
            event="cta_click"
            source="onboarding_signup"
            href={SIGNUP_START}
            className="font-semibold text-gold-400 hover:text-gold-300"
          >
            Criar conta grátis
          </TrackLink>
        </p>
      )}

      <div className="mx-auto flex max-w-[460px] items-start gap-3 rounded-2xl border border-lavender-200 bg-lavender-50 p-4 text-xs text-lavender-700">
        <ShieldCheck size={18} className="mt-0.5 shrink-0" />
        <p>
          Respostas feitas para estética: sem promessa de resultado, sem preço
          fixo de procedimento e sem diagnóstico.
        </p>
      </div>
    </section>
  ) : null;

  const primaryCta = signedIn ? (
    personalizado ? (
      <Button
        type="button"
        variant="cta"
        size="lg"
        className="w-full font-bold"
        onClick={saveAndEnter}
        disabled={saving}
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : null}
        Salvar e ir para o painel
      </Button>
    ) : (
      <Link href="/gerador" className="btn-cta w-full">
        Ir para o painel <ArrowRight size={16} />
      </Link>
    )
  ) : (
    <>
      <TrackLink
        event="cta_click"
        source="onboarding_signup"
        href={SIGNUP_START}
        className="btn-cta w-full"
      >
        {personalizado ? "Criar conta grátis e salvar meu tom" : "Criar conta grátis"}{" "}
        <ArrowRight size={16} />
      </TrackLink>
      <p className="mt-2 text-center text-xs text-muted">5 respostas grátis · sem cartão</p>
    </>
  );

  return (
    <div className="min-h-screen bg-navy-900">
      <header className="border-b border-navy-500/50 bg-navy-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Logo href="/" textClass="text-lg text-ink" />
          {signedIn ? (
            <Link
              href="/gerador"
              className="text-sm font-medium text-muted hover:text-ink"
            >
              Ir para o painel
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-muted hover:text-ink"
            >
              Entrar
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-10 px-4 py-8 sm:py-12">
        {(checkoutSuccess || checkoutCanceled) && (
          <div>
            {checkoutSuccess && (
              <div className="rounded-2xl border border-gold-500/30 bg-gold-500/10 px-5 py-4 text-center text-sm text-champagne-200">
                <p className="font-semibold text-ink">Pagamento confirmado.</p>
                <p className="mt-1">
                  Crie ou entre com o mesmo e-mail do pagamento para liberar o
                  acesso.
                </p>
              </div>
            )}
            {checkoutCanceled && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-center text-sm text-amber-200">
                Pagamento cancelado. Nada foi cobrado.
              </div>
            )}
          </div>
        )}

        {urlView.plansFirst ? plansSection : null}

        {/* ── TELA 1 — COLAR ─────────────────────────────────────────────── */}
        <section aria-labelledby="teste-titulo">
          {urlView.plansFirst ? (
            <h2
              id="teste-titulo"
              className="text-center font-serif text-2xl font-semibold leading-tight text-ink"
            >
              Ou teste grátis antes:
            </h2>
          ) : (
            <h1
              id="teste-titulo"
              className="text-center font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl"
            >
              Cole a mensagem da cliente
            </h1>
          )}

          {editing ? (
            <>
              <p className="mx-auto mt-3 max-w-md text-center text-base leading-relaxed text-muted">
                Veja 3 respostas prontas em segundos. Grátis, sem cadastro.
              </p>

              <div className="mt-6">
                <Textarea
                  ref={textareaRef}
                  aria-label="Mensagem da cliente"
                  value={qr.mensagem}
                  onChange={(event) => qr.editMensagem(event.target.value)}
                  placeholder="Ex.: Oi! Quanto custa o botox?"
                  className="min-h-[120px] text-base"
                />

                {qr.exhausted ? (
                  exhaustedBlock
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="cta"
                      size="lg"
                      className="mt-3 w-full font-bold"
                      onClick={() => void gerar()}
                      disabled={qr.loading || !qr.limitLoaded}
                    >
                      {qr.loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Escrevendo 3 respostas…
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} /> Ver 3 respostas
                        </>
                      )}
                    </Button>
                    <p className="mt-2 text-center text-xs text-navy-50" aria-live="polite">
                      {qr.loading
                        ? LOADING_STEPS[loadingStep]
                        : `${qr.limitLoaded ? qr.remaining : DEMO_LIMIT} de ${DEMO_LIMIT} testes grátis · sem cadastro`}
                    </p>
                  </>
                )}

                {editing ? errorBlock : null}

                {!qr.exhausted && (
                  <p className="mt-1 text-center">
                    <button
                      type="button"
                      onClick={usarExemplo}
                      disabled={qr.loading || !qr.limitLoaded}
                      className="inline-flex min-h-[44px] items-center px-3 text-sm font-semibold text-gold-400 underline-offset-2 hover:text-gold-300 hover:underline disabled:opacity-60"
                    >
                      Não tenho uma agora · usar um exemplo
                    </button>
                  </p>
                )}
                <p className="mt-2 text-center text-xs text-muted">
                  Não precisa colar nome nem telefone da cliente.
                </p>
              </div>

              {!hasGenerated && (
                <figure className="mx-auto mt-8 w-full max-w-[240px]">
                  <HeroLoop />
                  <figcaption className="mt-2 text-center text-xs font-medium text-muted">
                    Assim funciona
                  </figcaption>
                </figure>
              )}
            </>
          ) : (
            <p className="mt-4 rounded-2xl border border-navy-500 bg-navy-700 px-4 py-3 text-sm text-champagne-300">
              <span className="text-muted">Mensagem:</span>{" "}
              <span className="text-champagne-100">“{qr.mensagemRespondida}”</span>{" "}
              ·{" "}
              <button
                type="button"
                onClick={trocarMensagem}
                className="font-semibold text-gold-400 hover:text-gold-300"
              >
                Trocar
              </button>
            </p>
          )}
        </section>

        {/* ── TELA 2 — AS 3 RESPOSTAS ────────────────────────────────────── */}
        {respostasVisiveis && qr.respostas ? (
          <section aria-labelledby="respostas-titulo" className="space-y-6">
            <div>
              <h2
                id="respostas-titulo"
                ref={resultTitleRef}
                tabIndex={-1}
                className="scroll-mt-6 text-center font-serif text-2xl font-semibold text-ink outline-none"
              >
                Suas 3 respostas
              </h2>
              <p className="mt-1 text-center text-sm text-muted">
                Escolha uma, ajuste se quiser e envie pelo seu WhatsApp.
              </p>
            </div>

            <QuickReplyCards respostas={qr.respostas} />
            <AvisoIA aviso={qr.aviso} />

            <div className="rounded-3xl border border-gold-500/40 bg-navy-700 p-5 shadow-card sm:p-6">
              <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                E agora?
              </p>
              {primaryCta}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="mt-3 w-full border-gold-500/40 text-gold-300 hover:bg-gold-500/10"
                onClick={abrirPersonalizar}
                aria-expanded={personalizarOpen}
              >
                Deixar no tom da minha clínica
              </Button>
              <p className="mt-1 text-center">
                <button
                  type="button"
                  onClick={testarOutra}
                  className="inline-flex min-h-[44px] items-center px-3 text-sm font-semibold text-champagne-300 underline-offset-2 hover:text-champagne-100 hover:underline"
                >
                  Testar outra mensagem
                </button>
              </p>
              <p className="mt-4 border-t border-navy-500 pt-4 text-center text-xs leading-relaxed text-muted">
                Depois das 5 grátis, o Start custa R$97/mês. Cancele quando
                quiser. ·{" "}
                <button
                  type="button"
                  onClick={abrirPlanos}
                  className="font-semibold text-gold-400 hover:text-gold-300"
                >
                  Ver planos
                </button>
              </p>
              {saveFailed && <SaveError onRetry={saveAndEnter} />}
            </div>

            {/* ── PERSONALIZAR (opcional, só depois do resultado) ──────────── */}
            {personalizarOpen && (
              <div
                ref={personalizarRef}
                className="scroll-mt-6 space-y-5 rounded-3xl border border-navy-500 bg-navy-700 p-5 shadow-card sm:p-6"
              >
                <h3 className="font-serif text-xl font-semibold text-ink">
                  No tom da sua clínica
                </h3>
                <div>
                  <Label htmlFor="nome_clinica">Nome da clínica (opcional)</Label>
                  <Input
                    id="nome_clinica"
                    name="nome_clinica"
                    autoComplete="organization"
                    value={clinic.nome_clinica}
                    onChange={(event) => updateClinic({ nome_clinica: event.target.value })}
                    placeholder="Ex.: Espaço Beleza & Cuidado"
                  />
                </div>
                <ComoChamarChoice
                  label="Como você chama a cliente?"
                  value={clinic.como_chamar}
                  onChange={(value) => updateClinic({ como_chamar: value })}
                />
                <JeitoDeFalarChoice
                  value={clinic.formalidade}
                  onChange={(value) => updateClinic({ formalidade: value })}
                />
                {qr.exhausted ? (
                  exhaustedBlock
                ) : (
                  <Button
                    type="button"
                    variant="cta"
                    size="lg"
                    className="h-auto min-h-12 w-full py-3 font-bold leading-tight"
                    onClick={() => void gerar(undefined, "refazer")}
                    disabled={qr.loading || !qr.limitLoaded}
                  >
                    {qr.loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> {LOADING_STEPS[loadingStep]}
                      </>
                    ) : (
                      "Refazer as 3 respostas no meu tom"
                    )}
                  </Button>
                )}
                {!editing ? errorBlock : null}
              </div>
            )}
          </section>
        ) : null}

        {!urlView.plansFirst ? plansSection : null}
      </main>
    </div>
  );
}

function SaveError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Não conseguimos salvar o perfil da sua clínica agora.
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-amber-300 px-3 py-1 text-xs font-semibold hover:bg-amber-100"
      >
        Tentar de novo
      </button>
    </div>
  );
}

function ClerkAwareOnboarding() {
  const { isLoaded, isSignedIn } = useAuth();
  return <OnboardingCore authLoaded={isLoaded} signedIn={!!isSignedIn} />;
}

function OnboardingInner() {
  if (isClerkClientConfigured) return <ClerkAwareOnboarding />;
  return (
    <OnboardingCore
      authLoaded
      signedIn={!isFirebaseConfigured}
    />
  );
}

export default function OnboardingFunnelPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingInner />
    </Suspense>
  );
}
