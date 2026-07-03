"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { PlanCheckoutButton } from "@/components/plan-checkout-button";
import { WaitlistForm } from "@/components/waitlist-form";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackEvent } from "@/components/Analytics";
import { billingPlanList, parseBillingPlan } from "@/lib/billing";
import {
  isClerkClientConfigured,
  isFirebaseConfigured,
} from "@/lib/config";
import { getClinica, saveClinica } from "@/lib/store";
import { clinicaVazia, type Clinica } from "@/lib/types";
import { cn } from "@/lib/utils";
import { procedimentos } from "@/data/procedimentos";
import {
  comoChamarOptions,
  ctaOptions,
  formalidadeLabel,
} from "@/data/opcoes";

type Step = "clinica" | "resposta" | "planos";

const STEPS: { id: Step; n: number; label: string }[] = [
  { id: "clinica", n: 1, label: "Sua clínica" },
  { id: "resposta", n: 2, label: "A resposta" },
  { id: "planos", n: 3, label: "Seu plano" },
];

const DRAFT_KEY = "lb_dna_draft";
const INITIAL_PROCEDURES = 8;

function getTreatment(comoChamar: string): string {
  switch (comoChamar) {
    case "amor":
      return "amor";
    case "nome":
      return "Ana";
    case "nenhum":
      return "";
    default:
      return "linda";
  }
}

function fallbackResponse(c: Clinica): string {
  const treatment = getTreatment(c.como_chamar);
  const greeting = treatment ? `Oi, ${treatment}! ` : "Oi! ";
  const clinic = c.nome_clinica.trim()
    ? ` Aqui na ${c.nome_clinica.trim()},`
    : "";

  return `${greeting}O valor do botox depende muito do seu objetivo e de uma avaliacao, porque cada rosto pede um cuidado diferente.${clinic} a gente prefere te entender primeiro para indicar o que faz sentido pra voce. Quer que eu ja deixe sua avaliacao reservada?`;
}

function loadDraft(): Partial<Clinica> | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<Clinica>) : null;
  } catch {
    return null;
  }
}

function saveDraft(c: Clinica) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(c));
  } catch {
    // Storage indisponivel nao deve travar o funil publico.
  }
}

type OnboardingCoreProps = {
  authLoaded: boolean;
  signedIn: boolean;
};

function OnboardingCore({ authLoaded, signedIn }: OnboardingCoreProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planFromUrl = parseBillingPlan(searchParams.get("plan"));
  const checkoutSuccess = searchParams.get("checkout") === "sucesso";
  const checkoutCanceled = searchParams.get("checkout") === "cancelado";
  const tabFromUrl = searchParams.get("aba");
  const canPersist = signedIn || !isFirebaseConfigured;

  const [step, setStep] = useState<Step>(
    tabFromUrl === "planos" || tabFromUrl === "resposta"
      ? tabFromUrl
      : "clinica"
  );
  const [clinic, setClinic] = useState<Clinica>(clinicaVazia);
  const [showAllProcedures, setShowAllProcedures] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState("");

  useEffect(() => {
    const draft = loadDraft();
    if (draft) setClinic((prev) => ({ ...prev, ...draft }));
  }, []);

  useEffect(() => {
    saveDraft(clinic);
  }, [clinic]);

  useEffect(() => {
    if (!authLoaded || !canPersist) return;

    getClinica()
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
    if (planFromUrl && clinic.nome_clinica.trim()) setStep("planos");
  }, [planFromUrl, clinic.nome_clinica]);

  useEffect(() => {
    if (!checkoutSuccess) return;
    const sessionId = searchParams.get("session_id");
    const key = `lb_checkout_returned_${sessionId ?? "sem_sessao"}`;
    try {
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
    } catch {
      // Se localStorage falhar, ainda registramos o retorno no GA client.
    }
    trackEvent("checkout_returned", { stripe_session_id: sessionId });
  }, [checkoutSuccess, searchParams]);

  const currentStepIndex = STEPS.findIndex((item) => item.id === step);
  const progress = `${Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}%`;
  const canContinue = clinic.nome_clinica.trim().length > 0;
  const visibleProcedures = useMemo(
    () =>
      showAllProcedures
        ? procedimentos
        : procedimentos.slice(0, INITIAL_PROCEDURES),
    [showAllProcedures]
  );
  const response = generatedResponse || fallbackResponse(clinic);

  function setClinicField<K extends keyof Clinica>(
    key: K,
    value: Clinica[K]
  ) {
    setClinic((prev) => ({ ...prev, [key]: value }));
  }

  function toggleProcedure(label: string) {
    setClinic((prev) => ({
      ...prev,
      procedimentos: prev.procedimentos.includes(label)
        ? prev.procedimentos.filter((item) => item !== label)
        : [...prev.procedimentos, label],
    }));
  }

  function goTo(nextStep: Step) {
    setStep(nextStep);
    setSaveFailed(false);

    if (nextStep === "planos" && canPersist && canContinue) {
      saveClinica({ ...clinic, onboarded: true }).catch(() =>
        setSaveFailed(true)
      );
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function generateResponse() {
    setGenerating(true);
    try {
      const result = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          modo: "gerar",
          procedimento: "botox",
          situacao: "preco",
          tom: "acolhedor",
          objetivo: "direcionar para a avaliacao",
          nomeCliente: getTreatment(clinic.como_chamar) || "Ana",
          mensagemCliente: "Oi! Quanto custa o botox?",
          clinica: {
            nome_clinica: clinic.nome_clinica || "Sua clinica",
            formalidade: clinic.formalidade,
            como_chamar: clinic.como_chamar,
            cta_preferido:
              clinic.cta_preferido || "marcar uma avaliacao",
          },
        }),
      });
      const data = (await result.json().catch(() => ({}))) as {
        respostas?: { consultiva?: string; curta?: string };
      };
      setGeneratedResponse(
        data.respostas?.consultiva ||
          data.respostas?.curta ||
          fallbackResponse(clinic)
      );
    } catch {
      setGeneratedResponse(fallbackResponse(clinic));
    } finally {
      setGenerating(false);
    }
  }

  async function saveAndEnter() {
    setSaving(true);
    setSaveFailed(false);
    try {
      await saveClinica({ ...clinic, onboarded: true });
      trackEvent("sign_up", {
        method: "Onboarding",
        city: clinic.cidade || undefined,
        procedures_count: clinic.procedimentos.length,
      });
      router.push("/gerador");
      router.refresh();
    } catch {
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (step === "resposta" && !generatedResponse && !generating) {
      generateResponse();
    }
    // A resposta deve ser gerada uma vez ao entrar na etapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="min-h-screen bg-nude-50">
      <header className="border-b border-brand-100 bg-white/75 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
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

      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        {checkoutSuccess && (
          <div className="mb-8 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 text-center text-sm text-brand-800">
            <p className="font-semibold text-ink">Pagamento confirmado.</p>
            <p className="mt-1">
              Crie ou entre com o mesmo e-mail do pagamento para liberar o
              acesso.
            </p>
          </div>
        )}

        {checkoutCanceled && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm text-amber-800">
            Pagamento cancelado. Nada foi cobrado.
          </div>
        )}

        <section className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            Etapa {currentStepIndex + 1} de {STEPS.length}
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl font-serif text-3xl font-semibold leading-tight text-ink sm:text-5xl">
            Ela perguntou o preco.{" "}
            <span className="text-gold-gradient">
              Veja como responder diferente.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Monte o DNA da clinica, veja a resposta mudar no seu tom e escolha
            como comecar.
          </p>
        </section>

        <nav className="mt-9 flex justify-center">
          <div className="inline-flex w-full max-w-md gap-1 rounded-2xl bg-nude-100 p-1.5 sm:w-auto">
            {STEPS.map((item) => {
              const active = step === item.id;
              const enabled = item.id === "clinica" || canContinue;

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!enabled}
                  onClick={() => enabled && goTo(item.id)}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-center text-[11px] font-medium transition-colors sm:flex-row sm:gap-2 sm:px-5 sm:text-sm",
                    active
                      ? "bg-white text-gold-700 shadow-sm"
                      : "text-muted hover:text-ink",
                    !enabled && "cursor-not-allowed opacity-40"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                      active
                        ? "bg-gold-500 text-brand-900"
                        : "bg-brand-100 text-brand-600"
                    )}
                  >
                    {item.n}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="mx-auto mt-4 h-2 w-full max-w-md overflow-hidden rounded-full bg-brand-100">
          <div
            className="h-full rounded-full bg-gold-500 transition-all duration-300"
            style={{ width: progress }}
          />
        </div>

        <div className="mt-8">
          {step === "clinica" && (
            <Card>
              <CardBody className="space-y-8 p-6 sm:p-8">
                <div className="rounded-3xl border border-brand-100 bg-gradient-to-br from-white to-brand-50 p-5 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                        Seu estilo no LeadBellus
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-ink">
                        A IA vai responder como a{" "}
                        {clinic.nome_clinica.trim() || "sua clinica"}.
                      </h2>
                    </div>
                    <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                      {clinic.procedimentos.length} procedimentos
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <MiniStat label="Tom" value={formalidadeLabel(clinic.formalidade)} />
                    <MiniStat
                      label="Como chama"
                      value={
                        comoChamarOptions.find(
                          (option) => option.value === clinic.como_chamar
                        )?.label || "Linda"
                      }
                    />
                    <MiniStat label="CTA" value={clinic.cta_preferido} />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="nome">Nome da clinica</Label>
                    <Input
                      id="nome"
                      name="nome_clinica"
                      aria-label="Nome da clinica"
                      autoComplete="organization"
                      value={clinic.nome_clinica}
                      onChange={(event) =>
                        setClinicField("nome_clinica", event.target.value)
                      }
                      placeholder="Ex.: Espaco Beleza & Cuidado"
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      name="cidade"
                      aria-label="Cidade"
                      autoComplete="address-level2"
                      value={clinic.cidade}
                      onChange={(event) =>
                        setClinicField("cidade", event.target.value)
                      }
                      placeholder="Ex.: Sao Paulo - SP"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Procedimentos da agenda</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {visibleProcedures.map((procedure) => {
                      const active = clinic.procedimentos.includes(
                        procedure.label
                      );

                      return (
                        <button
                          key={procedure.id}
                          type="button"
                          onClick={() => toggleProcedure(procedure.label)}
                          className={cn(
                            "rounded-2xl border p-4 text-left transition-all",
                            active
                              ? "border-brand-400 bg-brand-50 text-brand-700 shadow-sm"
                              : "border-brand-200 bg-white text-muted hover:bg-nude-100"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-ink">
                                {procedure.label}
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-muted">
                                {procedure.beneficios[0] ||
                                  procedure.duvidas[0]}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                                active
                                  ? "border-brand-400 bg-brand-500 text-white"
                                  : "border-brand-200 bg-white text-muted"
                              )}
                            >
                              {active ? <Check size={14} /> : "+"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {procedimentos.length > INITIAL_PROCEDURES && (
                    <button
                      type="button"
                      onClick={() => setShowAllProcedures((value) => !value)}
                      className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                      {showAllProcedures
                        ? "Ver menos procedimentos"
                        : "Ver mais procedimentos"}
                    </button>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <Label>Como voce chama a cliente?</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {comoChamarOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setClinicField("como_chamar", option.value)
                          }
                          className={cn(
                            "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                            clinic.como_chamar === option.value
                              ? "border-brand-400 bg-brand-50 text-brand-600"
                              : "border-brand-200 bg-white text-ink hover:bg-nude-100"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="formalidade">Tom da conversa</Label>
                    <input
                      id="formalidade"
                      name="formalidade"
                      aria-label="Tom da conversa"
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={clinic.formalidade}
                      onChange={(event) =>
                        setClinicField("formalidade", Number(event.target.value))
                      }
                      className="mt-2 h-11 w-full accent-brand-500"
                    />
                    <div className="flex justify-between text-xs text-muted">
                      <span>Bem proximo</span>
                      <span className="font-medium text-brand-600">
                        {formalidadeLabel(clinic.formalidade)}
                      </span>
                      <span>Mais formal</span>
                    </div>
                  </div>

                  <div>
                    <Label>Como voce fecha?</Label>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      {ctaOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setClinicField("cta_preferido", option.value)
                          }
                          className={cn(
                            "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                            clinic.cta_preferido === option.value
                              ? "border-brand-400 bg-brand-50 text-brand-700"
                              : "border-brand-200 bg-white text-ink hover:bg-nude-100"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-3 border-t border-brand-100 pt-6 sm:flex-row sm:items-center sm:justify-end">
                  {canPersist && (
                    <Button
                      variant="ghost"
                      onClick={saveAndEnter}
                      disabled={saving || !canContinue}
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : null}
                      Salvar e ir para o painel
                    </Button>
                  )}
                  <Button
                    variant="cta"
                    onClick={() => goTo("resposta")}
                    disabled={!canContinue}
                    className="sm:min-w-[220px]"
                  >
                    Quero ver minha resposta <ArrowRight size={16} />
                  </Button>
                </div>

                {!canContinue && (
                  <p className="text-center text-xs text-muted sm:text-right">
                    Coloque o nome da clinica para continuar.
                  </p>
                )}
                {saveFailed && <SaveError onRetry={saveAndEnter} />}
              </CardBody>
            </Card>
          )}

          {step === "resposta" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-serif text-2xl font-semibold text-ink">
                  Mesma cliente. Mesmo WhatsApp. Resultado diferente.
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
                  A cliente manda:{" "}
                  <span className="font-medium text-ink">
                    "Oi! Quanto custa o botox?"
                  </span>
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <ResponsePanel
                  tone="bad"
                  badge={
                    <>
                      <X size={13} /> Resposta qualquer
                    </>
                  }
                  body="Botox e R$900. Qualquer duvida, estou a disposicao."
                  caption="Joga o preco, nao cria valor. A cliente compara com a concorrente mais barata e some."
                />

                <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-gold-300 bg-gradient-to-br from-white to-gold-50 p-6 shadow-cta">
                  <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-700">
                    <Check size={13} /> A resposta da{" "}
                    {clinic.nome_clinica.trim() || "sua clinica"}
                  </div>
                  <div className="rounded-2xl rounded-br-md bg-brand-500 px-4 py-3 text-sm leading-relaxed text-white shadow-soft">
                    {generating ? (
                      <span className="inline-flex items-center gap-2 text-white/90">
                        <Loader2 size={15} className="animate-spin" />
                        Escrevendo no seu tom...
                      </span>
                    ) : (
                      <span className="whitespace-pre-wrap">{response}</span>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-brand-800">
                    Acolhe, mostra valor e conduz para avaliacao no seu jeito
                    de falar.
                  </p>
                  <button
                    type="button"
                    onClick={generateResponse}
                    disabled={generating}
                    className="mt-4 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800 disabled:opacity-60"
                  >
                    <Sparkles size={14} />
                    {generating
                      ? "Gerando..."
                      : "Gerar de novo com a cara da minha clinica"}
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Acolhe", "A cliente sente atencao real."],
                  ["Cria valor", "A avaliacao vira parte da conversa."],
                  ["Conduz", "O proximo passo fica claro."],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card"
                  >
                    <p className="text-sm font-semibold text-ink">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="ghost" onClick={() => goTo("clinica")}>
                  <ArrowLeft size={16} /> Voltar
                </Button>
                <Button
                  variant="cta"
                  onClick={() => goTo("planos")}
                  className="sm:min-w-[220px]"
                >
                  Quero esse tipo de resposta <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === "planos" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-serif text-2xl font-semibold text-ink">
                  Uma cliente recuperada ja paga o mes inteiro.
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
                  Comece pelo Start. Voce cancela quando quiser.
                </p>
              </div>

              {saveFailed && <SaveError onRetry={saveAndEnter} />}

              <div className="grid gap-5 md:grid-cols-3">
                {billingPlanList.map((plan) => (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative flex flex-col rounded-3xl border bg-white p-6",
                      plan.destaque
                        ? "border-2 border-brand-300 bg-gradient-to-br from-white to-brand-50 shadow-soft"
                        : "border-brand-100"
                    )}
                  >
                    {plan.selo && (
                      <span
                        className={cn(
                          "absolute -top-3 right-5 rounded-full px-3 py-1 text-xs font-semibold",
                          plan.destaque
                            ? "bg-brand-500 text-white"
                            : "bg-brand-100 text-brand-700"
                        )}
                      >
                        {plan.selo}
                      </span>
                    )}
                    <p className="text-sm font-medium text-muted">
                      Plano {plan.label}
                    </p>
                    <p
                      className={cn(
                        "mt-1 font-serif text-4xl font-semibold text-ink",
                        plan.destaque && "text-gold-gradient"
                      )}
                    >
                      {plan.priceLabel}
                      <span className="text-lg font-normal text-muted">
                        {plan.periodLabel}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
                    <ul className="mt-5 flex-1 space-y-2 text-sm text-ink">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className={cn(
                            "flex items-start gap-2",
                            !plan.disponivel && "opacity-70"
                          )}
                        >
                          <Check
                            size={16}
                            className="mt-0.5 shrink-0 text-brand-500"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {plan.disponivel ? (
                      <PlanCheckoutButton
                        plan={plan.id}
                        className={cn(
                          "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-60",
                          plan.destaque ? "btn-cta" : "btn-cta-outline"
                        )}
                      >
                        Assinar {plan.label}
                        {plan.destaque && <ArrowRight size={16} />}
                      </PlanCheckoutButton>
                    ) : (
                      <WaitlistForm plan={plan.id} className="mt-6" />
                    )}
                  </div>
                ))}
              </div>

              {!signedIn && (
                <div className="rounded-2xl border border-brand-100 bg-white px-5 py-4 text-center text-sm text-muted shadow-card">
                  Quer criar conta antes de pagar?{" "}
                  <Link
                    href="/signup?plan=start"
                    className="font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Criar conta gratis
                  </Link>
                </div>
              )}

              <div className="flex items-start gap-3 rounded-2xl border border-lavender-200 bg-lavender-50 p-4 text-xs text-lavender-700">
                <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                <p>
                  Respostas feitas para estetica: sem promessa de resultado,
                  sem diagnostico e sempre valorizando a avaliacao.
                </p>
              </div>

              <div className="flex justify-center">
                <Button variant="ghost" onClick={() => goTo("resposta")}>
                  <ArrowLeft size={16} /> Ver a diferenca de novo
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-center text-xs text-muted">
          <MessageSquareText size={14} /> Responda melhor. Agende mais.
        </div>
      </main>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/80 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium capitalize text-ink">{value}</p>
    </div>
  );
}

function ResponsePanel({
  badge,
  body,
  caption,
  tone,
}: {
  badge: React.ReactNode;
  body: string;
  caption: string;
  tone: "bad";
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-3xl border p-6",
        tone === "bad" && "border-pain-200 bg-pain-50/60"
      )}
    >
      <div className="badge-pain mb-4 w-fit">{badge}</div>
      <div className="rounded-2xl rounded-bl-md border border-pain-200 bg-white px-4 py-3 text-sm leading-relaxed text-ink">
        "{body}"
      </div>
      <p className="mt-4 text-sm leading-relaxed text-pain-600/90">
        {caption}
      </p>
    </div>
  );
}

function SaveError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Nao conseguimos salvar o perfil da sua clinica agora.
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
