"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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
import {
  ctaLabel,
  fallbackResponse,
  getTreatment,
  resolveUrlStep,
} from "@/app/(marketing)/onboarding/helpers";

type Step = "clinica" | "resposta" | "planos";

const STEPS: { id: Step; n: number; label: string }[] = [
  { id: "clinica", n: 1, label: "Sua clínica" },
  { id: "resposta", n: 2, label: "A resposta" },
  { id: "planos", n: 3, label: "Seu plano" },
];

const DRAFT_KEY = "lb_dna_draft";
const INITIAL_PROCEDURES = 8;

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
    // Storage indisponível não deve travar o funil público.
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

  const [step, setStep] = useState<Step>("clinica");
  const [clinic, setClinic] = useState<Clinica>(clinicaVazia);
  const [showAllProcedures, setShowAllProcedures] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateFailed, setGenerateFailed] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState("");

  // Nome da clínica JÁ GRAVADO (rascunho local ou Firestore). A navegação por
  // URL usa este valor, nunca o campo em edição.
  const [storedName, setStoredName] = useState("");

  useEffect(() => {
    const draft = loadDraft();
    if (!draft) return;
    setClinic((prev) => ({ ...prev, ...draft }));
    setStoredName(draft.nome_clinica ?? "");
  }, []);

  // `?plan=` / `?aba=` só reposicionam o funil UMA vez e a partir do que já
  // estava salvo. Antes o efeito acompanhava o que a pessoa estava digitando e
  // pulava para os planos na primeira tecla do nome da clínica.
  const urlStepApplied = useRef(false);
  useEffect(() => {
    if (urlStepApplied.current) return;
    const nextStep = resolveUrlStep(planFromUrl, tabFromUrl, storedName);
    if (nextStep === "clinica") return;
    urlStepApplied.current = true;
    setStep(nextStep);
  }, [planFromUrl, tabFromUrl, storedName]);

  useEffect(() => {
    saveDraft(clinic);
  }, [clinic]);

  useEffect(() => {
    if (!authLoaded || !canPersist) return;

    getClinica()
      .then((saved) => {
        if (saved.nome_clinica || saved.onboarded) {
          setClinic((prev) => ({ ...prev, ...saved }));
          if (saved.nome_clinica) setStoredName(saved.nome_clinica);
        }
      })
      .catch(() => {
        // Mantém o rascunho local se a sessão Firebase ainda não sincronizou.
      });
  }, [authLoaded, canPersist]);

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
  const progressPercent = Math.round(
    ((currentStepIndex + 1) / STEPS.length) * 100
  );
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

  /** Único caminho de gravação do DNA — evita salvar duas vezes o mesmo estado. */
  async function persistClinic(): Promise<boolean> {
    if (!canPersist || !canContinue) return false;
    try {
      await saveClinica({ ...clinic, onboarded: true });
      return true;
    } catch {
      setSaveFailed(true);
      return false;
    }
  }

  function goTo(nextStep: Step) {
    setStep(nextStep);
    setSaveFailed(false);

    if (nextStep === "planos") void persistClinic();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Sequência da requisição: se a pessoa clicar em "gerar de novo" antes da
  // anterior responder, só a última resposta pode vencer a corrida.
  const generationSeq = useRef(0);

  async function generateResponse() {
    const seq = ++generationSeq.current;
    setGenerating(true);
    setGenerateFailed(false);

    try {
      const result = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          modo: "gerar",
          procedimento: "botox",
          situacao: "preco",
          tom: "acolhedor",
          objetivo: "direcionar para a avaliação",
          nomeCliente: getTreatment(clinic.como_chamar) || "Ana",
          mensagemCliente: "Oi! Quanto custa o botox?",
          clinica: {
            nome_clinica: clinic.nome_clinica || "Sua clínica",
            formalidade: clinic.formalidade,
            como_chamar: clinic.como_chamar,
            cta_preferido:
              clinic.cta_preferido || "marcar uma avaliação",
          },
        }),
      });
      const data = (await result.json().catch(() => ({}))) as {
        respostas?: { consultiva?: string; curta?: string };
      };
      if (seq !== generationSeq.current) return;

      const texto = data.respostas?.consultiva || data.respostas?.curta || "";
      if (!result.ok || !texto) {
        // Sem resposta da IA seguimos mostrando o exemplo local (que acompanha
        // as edições do DNA), mas dizemos que a geração ao vivo falhou.
        setGenerateFailed(true);
        return;
      }
      setGeneratedResponse(texto);
    } catch {
      if (seq === generationSeq.current) setGenerateFailed(true);
    } finally {
      if (seq === generationSeq.current) setGenerating(false);
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

  const autoGenerated = useRef(false);
  useEffect(() => {
    if (step !== "resposta" || autoGenerated.current) return;
    autoGenerated.current = true;
    generateResponse();
    // A resposta deve ser gerada uma vez ao entrar na etapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="min-h-screen bg-navy-900">
      <header className="border-b border-navy-500/70 bg-navy-900/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Logo href="/" textClass="text-lg text-champagne-200" />
          {signedIn ? (
            <Link
              href="/gerador"
              className="text-sm font-medium text-navy-50 transition-colors hover:text-champagne-200"
            >
              Ir para o painel
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-navy-50 transition-colors hover:text-champagne-200"
            >
              Entrar
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        {checkoutSuccess && (
          <div className="mb-8 rounded-2xl border border-gold-500/40 bg-gold-500/10 px-5 py-4 text-center text-sm text-champagne-300">
            <p className="font-semibold text-champagne-100">
              Pagamento confirmado.
            </p>
            <p className="mt-1">
              Crie ou entre com o mesmo e-mail do pagamento para liberar o
              acesso.
            </p>
          </div>
        )}

        {checkoutCanceled && (
          <div className="mb-8 rounded-2xl border border-pain-500/40 bg-pain-500/10 px-5 py-4 text-center text-sm text-pain-200">
            Pagamento cancelado. Nada foi cobrado — você pode escolher o plano
            de novo quando quiser.
          </div>
        )}

        <section className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            Etapa {currentStepIndex + 1} de {STEPS.length}
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl font-serif text-3xl font-semibold leading-tight text-champagne-200 sm:text-5xl">
            Ela perguntou o preço.{" "}
            <span className="text-gold-gradient">
              Veja como responder diferente.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-navy-50 sm:text-lg">
            Monte o DNA da clínica, veja a resposta mudar no seu tom e escolha
            como começar.
          </p>
        </section>

        <nav className="mt-9 flex justify-center" aria-label="Etapas do cadastro">
          <div className="inline-flex w-full max-w-md gap-1 rounded-2xl border border-navy-500 bg-navy-800 p-1.5 sm:w-auto">
            {STEPS.map((item) => {
              const active = step === item.id;
              const enabled = item.id === "clinica" || canContinue;

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!enabled}
                  aria-current={active ? "step" : undefined}
                  onClick={() => enabled && goTo(item.id)}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-center text-[11px] font-medium transition-colors sm:flex-row sm:gap-2 sm:whitespace-nowrap sm:px-5 sm:text-sm",
                    active
                      ? "bg-navy-600 text-gold-300 shadow-sm ring-1 ring-gold-500/25"
                      : "text-navy-50 hover:text-champagne-300",
                    !enabled && "cursor-not-allowed opacity-40"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                      active
                        ? "bg-gold-500 text-navy-900"
                        : "bg-navy-600 text-navy-50"
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

        <div
          className="mx-auto mt-4 h-2 w-full max-w-md overflow-hidden rounded-full bg-navy-700"
          role="progressbar"
          aria-label="Progresso do cadastro"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
        >
          <div
            className="h-full rounded-full bg-gold-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-8">
          {step === "clinica" && (
            <Card>
              <CardBody className="p-6 sm:p-8">
                <form
                  className="space-y-8"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (canContinue) goTo("resposta");
                  }}
                >
                  <div className="rounded-3xl border border-gold-500/20 bg-navy-600 p-5 shadow-card">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                          Seu estilo no LeadBellus
                        </p>
                        <h2 className="mt-2 text-lg font-semibold text-champagne-200">
                          A IA vai responder como a{" "}
                          {clinic.nome_clinica.trim() || "sua clínica"}.
                        </h2>
                      </div>
                      <span className="rounded-full bg-navy-800 px-3 py-1 text-xs font-semibold text-champagne-300">
                        {clinic.procedimentos.length}{" "}
                        {clinic.procedimentos.length === 1
                          ? "procedimento"
                          : "procedimentos"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <MiniStat
                        label="Tom"
                        value={formalidadeLabel(clinic.formalidade)}
                      />
                      <MiniStat
                        label="Como chama"
                        value={
                          comoChamarOptions.find(
                            (option) => option.value === clinic.como_chamar
                          )?.label || "Linda"
                        }
                      />
                      <MiniStat
                        label="CTA"
                        value={ctaLabel(clinic.cta_preferido)}
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="nome">Nome da clínica</Label>
                      <Input
                        id="nome"
                        name="nome_clinica"
                        aria-label="Nome da clínica"
                        autoComplete="organization"
                        value={clinic.nome_clinica}
                        onChange={(event) =>
                          setClinicField("nome_clinica", event.target.value)
                        }
                        placeholder="Ex.: Espaço Beleza & Cuidado"
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
                        placeholder="Ex.: São Paulo - SP"
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
                            aria-pressed={active}
                            onClick={() => toggleProcedure(procedure.label)}
                            className={cn(
                              "rounded-2xl border p-4 text-left transition-all",
                              active
                                ? "border-gold-500/50 bg-gold-500/10 shadow-sm"
                                : "border-navy-500 bg-navy-800 hover:border-navy-400 hover:bg-navy-600"
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-champagne-200">
                                  {procedure.label}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-navy-50">
                                  {procedure.beneficios[0] ||
                                    procedure.duvidas[0]}
                                </p>
                              </div>
                              <span
                                className={cn(
                                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                                  active
                                    ? "border-gold-500 bg-gold-500 text-navy-900"
                                    : "border-navy-400 bg-navy-700 text-navy-50"
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
                        className="text-sm font-semibold text-gold-400 transition-colors hover:text-gold-300"
                      >
                        {showAllProcedures
                          ? "Ver menos procedimentos"
                          : "Ver mais procedimentos"}
                      </button>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div>
                      <Label>Como você chama a cliente?</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {comoChamarOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={clinic.como_chamar === option.value}
                            onClick={() =>
                              setClinicField("como_chamar", option.value)
                            }
                            className={cn(
                              "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                              clinic.como_chamar === option.value
                                ? "border-gold-500/50 bg-gold-500/10 text-champagne-200"
                                : "border-navy-500 bg-navy-800 text-navy-50 hover:border-navy-400 hover:bg-navy-600"
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
                          setClinicField(
                            "formalidade",
                            Number(event.target.value)
                          )
                        }
                        className="mt-2 h-11 w-full accent-gold-500"
                      />
                      <div className="flex justify-between text-xs text-navy-50">
                        <span>Bem próximo</span>
                        <span className="font-medium text-gold-300">
                          {formalidadeLabel(clinic.formalidade)}
                        </span>
                        <span>Mais formal</span>
                      </div>
                    </div>

                    <div>
                      <Label>Como você fecha?</Label>
                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        {ctaOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={
                              clinic.cta_preferido === option.value
                            }
                            onClick={() =>
                              setClinicField("cta_preferido", option.value)
                            }
                            className={cn(
                              "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                              clinic.cta_preferido === option.value
                                ? "border-gold-500/50 bg-gold-500/10 text-champagne-200"
                                : "border-navy-500 bg-navy-800 text-navy-50 hover:border-navy-400 hover:bg-navy-600"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-stretch gap-3 border-t border-navy-500 pt-6 sm:flex-row sm:items-center sm:justify-end">
                    {canPersist && (
                      <Button
                        type="button"
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
                      type="submit"
                      variant="cta"
                      disabled={!canContinue}
                      className="sm:min-w-[220px]"
                    >
                      Quero ver minha resposta <ArrowRight size={16} />
                    </Button>
                  </div>

                  {!canContinue && (
                    <p className="text-center text-xs text-navy-50 sm:text-right">
                      Coloque o nome da clínica para continuar.
                    </p>
                  )}
                  {saveFailed && <SaveError onRetry={saveAndEnter} />}
                </form>
              </CardBody>
            </Card>
          )}

          {step === "resposta" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-serif text-2xl font-semibold text-champagne-200">
                  Mesma cliente. Mesmo WhatsApp. Resultado diferente.
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-navy-50">
                  A cliente manda:{" "}
                  <span className="font-medium text-champagne-300">
                    &ldquo;Oi! Quanto custa o botox?&rdquo;
                  </span>
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <ResponsePanel
                  badge={
                    <>
                      <X size={13} /> Resposta qualquer
                    </>
                  }
                  body="Botox é R$900. Qualquer dúvida, estou à disposição."
                  caption="Joga o preço, não cria valor. A cliente compara com a concorrente mais barata e some."
                />

                <div className="relative flex flex-col overflow-hidden rounded-3xl border border-gold-500/40 bg-navy-700 p-6 shadow-cta">
                  <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-gold-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-300">
                    <Check size={13} /> A resposta da{" "}
                    {clinic.nome_clinica.trim() || "sua clínica"}
                  </div>
                  <div
                    className="rounded-2xl rounded-br-md border border-gold-500/15 bg-[rgba(94,224,160,0.10)] px-4 py-3 text-sm leading-relaxed text-champagne-200"
                    aria-live="polite"
                    aria-busy={generating}
                  >
                    {generating ? (
                      <span className="inline-flex items-center gap-2 text-champagne-300">
                        <Loader2 size={15} className="animate-spin" />
                        Escrevendo no seu tom...
                      </span>
                    ) : (
                      <span className="whitespace-pre-wrap">{response}</span>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-navy-50">
                    Acolhe, mostra valor e conduz para a avaliação no seu jeito
                    de falar.
                  </p>
                  {generateFailed && !generating && (
                    <p className="mt-3 text-xs text-pain-300">
                      Não conseguimos gerar ao vivo agora — este é um exemplo no
                      seu tom. Tente de novo em instantes.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={generateResponse}
                    disabled={generating}
                    className="mt-4 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-gold-400 transition-colors hover:text-gold-300 disabled:opacity-60"
                  >
                    <Sparkles size={14} />
                    {generating
                      ? "Gerando..."
                      : "Gerar de novo com a cara da minha clínica"}
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Acolhe", "A cliente sente atenção real."],
                  ["Cria valor", "A avaliação vira parte da conversa."],
                  ["Conduz", "O próximo passo fica claro."],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-navy-500 bg-navy-700 p-4 shadow-card"
                  >
                    <p className="text-sm font-semibold text-champagne-200">
                      {title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-navy-50">
                      {description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => goTo("clinica")}
                >
                  <ArrowLeft size={16} /> Voltar
                </Button>
                <Button
                  type="button"
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
                <h2 className="font-serif text-2xl font-semibold text-champagne-200">
                  Uma cliente recuperada já paga o mês inteiro.
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-navy-50">
                  Comece pelo Start. Você cancela quando quiser.
                </p>
              </div>

              {saveFailed && <SaveError onRetry={saveAndEnter} />}

              <div className="grid gap-5 md:grid-cols-3">
                {billingPlanList.map((plan) => (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative flex flex-col rounded-3xl border p-6",
                      plan.destaque
                        ? "border-gold-500/40 bg-navy-600 shadow-cta"
                        : "border-navy-500 bg-navy-700"
                    )}
                  >
                    {plan.selo && (
                      <span
                        className={cn(
                          "absolute -top-3 right-5 rounded-full px-3 py-1 text-xs font-semibold",
                          plan.destaque
                            ? "bg-gold-500 text-navy-900"
                            : "bg-navy-500 text-champagne-300"
                        )}
                      >
                        {plan.selo}
                      </span>
                    )}
                    <p className="text-sm font-medium text-navy-50">
                      Plano {plan.label}
                    </p>
                    <p
                      className={cn(
                        "mt-1 font-serif text-4xl font-semibold text-champagne-200",
                        plan.destaque && "text-gold-gradient"
                      )}
                    >
                      {plan.priceLabel}
                      <span className="text-lg font-normal text-navy-50">
                        {plan.periodLabel}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-navy-50">{plan.tagline}</p>
                    <ul className="mt-5 flex-1 space-y-2 text-sm text-champagne-300">
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
                            className="mt-0.5 shrink-0 text-gold-400"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {plan.disponivel ? (
                      <PlanCheckoutButton
                        plan={plan.id}
                        origem="onboarding"
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
                <div className="rounded-2xl border border-navy-500 bg-navy-700 px-5 py-4 text-center text-sm text-navy-50 shadow-card">
                  Quer criar conta antes de pagar?{" "}
                  <Link
                    href="/signup?plan=start"
                    className="font-semibold text-gold-400 transition-colors hover:text-gold-300"
                  >
                    Criar conta grátis
                  </Link>
                </div>
              )}

              <div className="flex items-start gap-3 rounded-2xl border border-navy-500 bg-navy-800 p-4 text-xs text-champagne-400">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-gold-400"
                />
                <p>
                  Respostas feitas para estética: sem promessa de resultado,
                  sem diagnóstico e sempre valorizando a avaliação.
                </p>
              </div>

              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => goTo("resposta")}
                >
                  <ArrowLeft size={16} /> Ver a diferença de novo
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-center text-xs text-navy-50">
          <MessageSquareText size={14} /> Responda melhor. Agende mais.
        </div>
      </main>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-navy-800 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-navy-50">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-champagne-200 first-letter:uppercase">
        {value}
      </p>
    </div>
  );
}

function ResponsePanel({
  badge,
  body,
  caption,
}: {
  badge: React.ReactNode;
  body: string;
  caption: string;
}) {
  return (
    <div className="card-pain flex flex-col rounded-3xl p-6">
      <div className="badge-pain mb-4 w-fit">{badge}</div>
      <div className="rounded-2xl rounded-bl-md border border-navy-500 bg-navy-800 px-4 py-3 text-sm leading-relaxed text-champagne-300">
        &ldquo;{body}&rdquo;
      </div>
      <p className="mt-4 text-sm leading-relaxed text-pain-300">{caption}</p>
    </div>
  );
}

function SaveError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-pain-500/40 bg-pain-500/10 px-4 py-3 text-sm text-pain-200">
      Não conseguimos salvar o perfil da sua clínica agora.
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-pain-500/50 px-3 py-1 text-xs font-semibold transition-colors hover:bg-pain-500/20"
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
