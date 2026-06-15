"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Loader2,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { WaitlistForm } from "@/components/waitlist-form";
import { billingPlanList, parseBillingPlan } from "@/lib/billing";
import { PlanCheckoutButton } from "@/components/plan-checkout-button";
import { procedimentos } from "@/data/procedimentos";
import { comoChamarOptions, ctaOptions, formalidadeLabel } from "@/data/opcoes";
import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { getClinica, saveClinica } from "@/lib/store";
import { clinicaVazia, type Clinica } from "@/lib/types";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/components/Analytics";

type Aba = "clinica" | "diferenca" | "planos";

const ABAS: { id: Aba; n: number; label: string }[] = [
  { id: "clinica", n: 1, label: "Sua clínica" },
  { id: "diferenca", n: 2, label: "A resposta" },
  { id: "planos", n: 3, label: "Seu plano" },
];

const PROCEDIMENTOS_INICIAIS = 8;

/** Como a clínica chama a cliente vira o "Oi, ___" da resposta. */
function tratamento(comoChamar: string): string {
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

/** Resposta nossa de reserva (sem depender da API) — calorosa e personalizada. */
function respostaNossaFallback(c: Clinica): string {
  const t = tratamento(c.como_chamar);
  const saud = t ? `Oi, ${t}! ` : "Oi! ";
  const casa = c.nome_clinica.trim() ? ` Aqui na ${c.nome_clinica.trim()},` : "";
  return `${saud}O valor do botox depende muito do seu objetivo e de uma avaliação — cada rosto é único.${casa} a gente prefere te entender primeiro pra indicar o que faz sentido pra você. Quer que eu já deixe sua avaliação reservada pra você decidir com calma? 💛`;
}

function OnboardingFunnelInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planoUrl = parseBillingPlan(searchParams.get("plan"));
  const checkoutSucesso = searchParams.get("checkout") === "sucesso";
  const checkoutCancelado = searchParams.get("checkout") === "cancelado";
  const abaUrl = searchParams.get("aba");
  const [aba, setAba] = useState<Aba>(
    abaUrl === "planos" || abaUrl === "diferenca" ? abaUrl : "clinica"
  );
  const [c, setC] = useState<Clinica>(clinicaVazia);
  const [logado, setLogado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvarFalhou, setSalvarFalhou] = useState(false);
  const [mostrarTodosProcedimentos, setMostrarTodosProcedimentos] = useState(false);

  // “Ours” gerado ao vivo na aba 2.
  const [gerando, setGerando] = useState(false);
  const [respostaNossa, setRespostaNossa] = useState<string>("");

  // O DNA montado aqui fica como rascunho no navegador: quem configura, cria a
  // conta e volta (gate) reencontra tudo preenchido — nada se perde no signup.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("lb_dna_draft");
      if (raw) setC((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      /* draft corrompido: ignora */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("lb_dna_draft", JSON.stringify(c));
    } catch {
      /* storage cheio/indisponível: segue sem rascunho */
    }
  }, [c]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    try {
      const auth = getFirebaseAuth();
      setLogado(!!auth.currentUser);
      const unsub = onAuthStateChanged(auth, async (u) => {
        setLogado(!!u);
        if (!u) return;
        // Reúne o DNA: rascunho do navegador como base, sobrescrito pela clínica
        // salva se já existir (evita closure desatualizada do estado `c`).
        let clinicaAtual: Clinica = clinicaVazia;
        try {
          const raw = window.localStorage.getItem("lb_dna_draft");
          if (raw) clinicaAtual = { ...clinicaVazia, ...JSON.parse(raw) };
        } catch {
          /* rascunho corrompido: ignora */
        }
        try {
          const salva = await getClinica();
          if (salva.nome_clinica || salva.onboarded) {
            clinicaAtual = salva;
            setC(salva);
          }
        } catch {
          /* mantém o rascunho */
        }
      });
      return () => unsub();
    } catch {
      /* sem firebase: segue como visitante */
    }
  }, []);

  useEffect(() => {
    if (planoUrl && c.nome_clinica.trim()) {
      setAba("planos");
    }
  }, [planoUrl, c.nome_clinica]);

  function set<K extends keyof Clinica>(key: K, value: Clinica[K]) {
    setC((prev) => ({ ...prev, [key]: value }));
  }

  function toggleProc(label: string) {
    setC((prev) => ({
      ...prev,
      procedimentos: prev.procedimentos.includes(label)
        ? prev.procedimentos.filter((p) => p !== label)
        : [...prev.procedimentos, label],
    }));
  }

  const podeAvancar = c.nome_clinica.trim().length > 0;
  const passoAtual = ABAS.findIndex((item) => item.id === aba) + 1;
  const progresso = `${Math.round((passoAtual / ABAS.length) * 100)}%`;
  const procedimentosVisiveis = useMemo(
    () =>
      mostrarTodosProcedimentos
        ? procedimentos
        : procedimentos.slice(0, PROCEDIMENTOS_INICIAIS),
    [mostrarTodosProcedimentos]
  );

  function irPara(proxima: Aba) {
    setAba(proxima);
    // Logado que chegou na escolha de plano já configurou o DNA: persiste e
    // marca onboarded — senão o gate devolveria pro onboarding depois de pagar.
    if (proxima === "planos" && logado && podeAvancar) {
      setSalvarFalhou(false);
      saveClinica({ ...c, onboarded: true }).catch(() => setSalvarFalhou(true));
    }
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function tentarSalvarDeNovo() {
    setSalvarFalhou(false);
    saveClinica({ ...c, onboarded: true }).catch(() => setSalvarFalhou(true));
  }

  async function gerarRespostaNossa() {
    setGerando(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo: "gerar",
          procedimento: "botox",
          situacao: "preco",
          tom: "acolhedor",
          objetivo: "direcionar para a avaliação",
          nomeCliente: tratamento(c.como_chamar) || "Ana",
          mensagemCliente: "Oi! Quanto custa o botox? 🙂",
          clinica: {
            nome_clinica: c.nome_clinica || "Sua clínica",
            formalidade: c.formalidade,
            como_chamar: c.como_chamar,
            cta_preferido: c.cta_preferido || "marcar uma avaliação",
          },
        }),
      });
      const data = await res.json();
      const r = data?.respostas?.consultiva || data?.respostas?.curta || "";
      setRespostaNossa(r || respostaNossaFallback(c));
    } catch {
      setRespostaNossa(respostaNossaFallback(c));
    } finally {
      setGerando(false);
    }
  }

  // Para usuário logado (caiu aqui pelo gate): salva o DNA e entra no painel.
  async function salvarEEntrar() {
    setSalvando(true);
    try {
      await saveClinica({ ...c, onboarded: true });
      trackEvent("sign_up", {
        method: "Onboarding",
        city: c.cidade || undefined,
        procedures_count: c.procedimentos?.length ?? 0,
      });
      router.push("/gerador");
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  const nossa = respostaNossa || respostaNossaFallback(c);

  useEffect(() => {
    if (aba === "diferenca" && !respostaNossa && !gerando) {
      gerarRespostaNossa();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba]);

  return (
    <div className="min-h-screen bg-nude-50">
      {/* topo */}
      <header className="border-b border-brand-100 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Logo href="/" textClass="text-lg text-ink" />
          {logado ? (
            <Link href="/gerador" className="text-sm font-medium text-muted hover:text-ink">
              Ir para o painel
            </Link>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        {checkoutSucesso && (
          <div className="mb-8 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 text-center text-sm text-brand-800">
            <p className="font-semibold text-ink">Pagamento confirmado!</p>
            <p className="mt-1">
              Use o mesmo e-mail do pagamento em{" "}
              <Link href="/signup" className="font-medium text-brand-600 underline">
                criar sua senha
              </Link>{" "}
              e entrar no painel.
            </p>
          </div>
        )}
        {checkoutCancelado && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm text-amber-800">
            Pagamento cancelado. Escolha um plano quando quiser.
          </div>
        )}

        <div className="text-center">
          {logado ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                Etapa {passoAtual} de {ABAS.length}
              </p>
              <h1 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                Ajuste o jeito da sua clínica{" "}
                <span className="text-gold-gradient">em poucos toques.</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-muted">
                Quanto mais claro fica o seu jeito de atender, mais a IA responde
                parecendo parte da sua equipe.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                Etapa {passoAtual} de 3
              </p>
              <h1 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                Ela perguntou o preço.{" "}
                <span className="text-gold-gradient">Veja como responder diferente.</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-muted">
                Toque no seu jeito de atender — a resposta muda na hora.
              </p>
            </>
          )}
        </div>

        <>
        {/* abas */}
        <div className="mt-9 flex justify-center">
          <div className="inline-flex w-full max-w-md gap-1 rounded-2xl bg-nude-100 p-1.5 sm:w-auto">
            {ABAS.map((a) => {
              const ativa = aba === a.id;
              const habilitada = a.id === "clinica" || podeAvancar;
              return (
                <button
                  key={a.id}
                  type="button"
                  disabled={!habilitada}
                  onClick={() => habilitada && irPara(a.id)}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-center text-[11px] font-medium transition-colors sm:flex-row sm:gap-2 sm:px-5 sm:text-sm",
                    ativa
                      ? "bg-white text-gold-700 shadow-sm"
                      : "text-muted hover:text-ink",
                    !habilitada && "cursor-not-allowed opacity-40"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                      ativa ? "bg-gold-500 text-brand-900" : "bg-brand-100 text-brand-600"
                    )}
                      >
                    {a.n}
                  </span>
                  <span>{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mx-auto mt-4 h-2 w-full max-w-md overflow-hidden rounded-full bg-brand-100">
          <div
            className="h-full rounded-full bg-gold-500 transition-all duration-300"
            style={{ width: progresso }}
          />
        </div>

        <div className="mt-8">
          {/* ===== ABA 1 — SUA CLÍNICA ===== */}
          {aba === "clinica" && (
            <Card>
              <CardBody className="space-y-8 p-6 sm:p-8">
                <div className="rounded-3xl border border-brand-100 bg-gradient-to-br from-white to-brand-50 p-5 shadow-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                        Seu estilo no LeadBellus
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-ink">
                        A IA vai responder como a {c.nome_clinica.trim() || "sua clínica"}.
                      </h2>
                    </div>
                    <div className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                      {c.procedimentos.length || 0} procedimentos
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white/80 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                        Tom
                      </p>
                      <p className="mt-1 text-sm font-medium text-ink">
                        {formalidadeLabel(c.formalidade)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/80 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                        Como chama
                      </p>
                      <p className="mt-1 text-sm font-medium text-ink">
                        {comoChamarOptions.find((o) => o.value === c.como_chamar)?.label}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/80 px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                        CTA
                      </p>
                      <p className="mt-1 text-sm font-medium text-ink capitalize">
                        {c.cta_preferido}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="nome">Nome da clínica</Label>
                    <Input
                      id="nome"
                      value={c.nome_clinica}
                      onChange={(e) => set("nome_clinica", e.target.value)}
                      placeholder="Ex.: Espaço Beleza & Cuidado"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Procedimentos da agenda</Label>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {procedimentosVisiveis.map((p) => {
                      const ativo = c.procedimentos.includes(p.label);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleProc(p.label)}
                          className={cn(
                            "rounded-2xl border p-4 text-left transition-all",
                            ativo
                              ? "border-brand-400 bg-brand-50 text-brand-700 shadow-sm"
                              : "border-brand-200 bg-white text-muted hover:bg-nude-100"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-ink">{p.label}</p>
                              <p className="mt-1 text-xs leading-relaxed text-muted">
                                {p.beneficios[0] || p.duvidas[0]}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                                ativo
                                  ? "border-brand-400 bg-brand-500 text-white"
                                  : "border-brand-200 bg-white text-muted"
                              )}
                            >
                              {ativo ? <Check size={14} /> : "+"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {procedimentos.length > PROCEDIMENTOS_INICIAIS && (
                    <button
                      type="button"
                      onClick={() => setMostrarTodosProcedimentos((prev) => !prev)}
                      className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                      {mostrarTodosProcedimentos ? "Ver menos procedimentos" : "Ver mais procedimentos"}
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label>Como você chama a cliente?</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {comoChamarOptions.map((o) => (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => set("como_chamar", o.value)}
                          className={cn(
                            "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                            c.como_chamar === o.value
                              ? "border-brand-400 bg-brand-50 text-brand-600"
                              : "border-brand-200 bg-white text-ink hover:bg-nude-100"
                          )}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <Label htmlFor="form">Tom da conversa</Label>
                    <input
                      id="form"
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={c.formalidade}
                      onChange={(e) => set("formalidade", Number(e.target.value))}
                      className="h-11 w-full accent-brand-500"
                    />
                    <div className="flex justify-between text-xs text-muted">
                      <span>Bem próximo</span>
                      <span className="font-medium text-brand-600">
                        {formalidadeLabel(c.formalidade)}
                      </span>
                      <span>Mais formal</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Como você fecha?</Label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {ctaOptions.map((opcao) => (
                        <button
                          key={opcao.value}
                          type="button"
                          onClick={() => set("cta_preferido", opcao.value)}
                          className={cn(
                            "rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                            c.cta_preferido === opcao.value
                              ? "border-brand-400 bg-brand-50 text-brand-700"
                              : "border-brand-200 bg-white text-ink hover:bg-nude-100"
                          )}
                        >
                          {opcao.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-3 border-t border-brand-100 pt-6 sm:flex-row sm:items-center sm:justify-end">
                  {logado && (
                    <Button
                      variant="ghost"
                      onClick={salvarEEntrar}
                      disabled={salvando || !podeAvancar}
                    >
                      {salvando ? <Loader2 size={16} className="animate-spin" /> : null}
                      Salvar e ir para o painel
                    </Button>
                  )}
                <Button
                    variant="cta"
                    onClick={() => irPara("diferenca")}
                    disabled={!podeAvancar}
                    className="sm:min-w-[220px]"
                  >
                    Quero ver minha resposta <ArrowRight size={16} />
                  </Button>
                </div>
                {!podeAvancar && (
                  <p className="text-center text-xs text-muted sm:text-right">
                    Coloque o nome da clínica pra continuar.
                  </p>
                )}
              </CardBody>
            </Card>
          )}

          {/* ===== ABA 2 — A DIFERENÇA ===== */}
          {aba === "diferenca" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-serif text-2xl font-semibold text-ink">
                  Mesma cliente. Mesmo WhatsApp. Resultado totalmente diferente.
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
                  A cliente do WhatsApp manda:{" "}
                  <span className="font-medium text-ink">“Oi! Quanto custa o botox? 🙂”</span>
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* genérica */}
                <div className="flex flex-col rounded-3xl border border-pain-200 bg-pain-50/60 p-6">
                  <div className="badge-pain mb-4 w-fit">
                    <X size={13} /> Resposta qualquer
                  </div>
                  <div className="rounded-2xl rounded-bl-md border border-pain-200 bg-white px-4 py-3 text-sm leading-relaxed text-ink">
                    “Botox é R$900. Qualquer dúvida, estou à disposição.”
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-pain-600/90">
                    Joga o preço, não cria valor. A cliente compara com a concorrente
                    mais barata e <strong>some</strong> — e some calada.
                  </p>
                </div>

                {/* nossa */}
                <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-gold-300 bg-gradient-to-br from-white to-gold-50 p-6 shadow-cta">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-200/20 blur-2xl" />
                  <div className="relative flex flex-col">
                    <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-700">
                      <Check size={13} /> A resposta da {c.nome_clinica.trim() || "sua clínica"}
                    </div>
                    <div className="rounded-2xl rounded-br-md bg-brand-500 px-4 py-3 text-sm leading-relaxed text-white shadow-soft">
                      {gerando ? (
                        <span className="inline-flex items-center gap-2 text-white/90">
                          <Loader2 size={15} className="animate-spin" /> Escrevendo no seu tom…
                        </span>
                      ) : (
                        <span className="whitespace-pre-wrap">{nossa}</span>
                      )}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-brand-800">
                      Acolhe, mostra valor e conduz pra avaliação — no <strong>seu</strong> jeito
                      de falar. É assim que a dúvida vira agendamento.
                    </p>
                    <button
                      type="button"
                      onClick={gerarRespostaNossa}
                      disabled={gerando}
                      className="mt-4 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800 disabled:opacity-60"
                    >
                      {gerando ? "Gerando…" : "↻ Gerar de novo com a cara da minha clínica"}
                    </button>
                  </div>
                </div>
              </div>

              {/* gancho de dor / dinheiro */}
              <div className="badge-pain mx-auto w-fit px-5 py-3 text-sm normal-case tracking-normal">
                Cada cliente que some = <strong>R$500 a R$2.000</strong> fora da agenda toda semana
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    title: "Acolhe",
                    desc: "A cliente sente atenção real em vez de resposta pronta demais.",
                  },
                  {
                    title: "Cria valor",
                    desc: "O preço deixa de ser o centro e a avaliação ganha força.",
                  },
                  {
                    title: "Conduz",
                    desc: "A conversa já aponta para agenda, horário ou próxima ação.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-brand-100 bg-white p-4 text-left shadow-card"
                  >
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="ghost" onClick={() => irPara("clinica")}>
                  <ArrowLeft size={16} /> Voltar
                </Button>
                <Button variant="cta" onClick={() => irPara("planos")} className="sm:min-w-[220px]">
                  Quero esse tipo de resposta <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* ===== ABA 3 — PLANOS ===== */}
          {aba === "planos" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-serif text-2xl font-semibold text-ink">
                  Uma cliente recuperada já paga o mês inteiro.
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
                  Escolha como começar. Você cancela quando quiser.
                </p>
              </div>

              {salvarFalhou && (
                <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Não conseguimos salvar o perfil da sua clínica agora.
                  <button
                    type="button"
                    onClick={tentarSalvarDeNovo}
                    className="rounded-lg border border-amber-300 px-3 py-1 text-xs font-semibold hover:bg-amber-100"
                  >
                    Tentar de novo
                  </button>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-3">
                {billingPlanList.map((plano) => (
                  <div
                    key={plano.id}
                    className={cn(
                      "relative flex flex-col rounded-3xl border bg-white p-6",
                      plano.destaque
                        ? "border-2 border-brand-300 bg-gradient-to-br from-white to-brand-50 shadow-soft"
                        : "border-brand-100"
                    )}
                  >
                    {plano.selo && (
                      <span
                        className={cn(
                          "absolute -top-3 right-5 rounded-full px-3 py-1 text-xs font-semibold",
                          plano.destaque
                            ? "bg-brand-500 text-white"
                            : "bg-brand-100 text-brand-700"
                        )}
                      >
                        {plano.selo}
                      </span>
                    )}
                    <p className="text-sm font-medium text-muted">Plano {plano.label}</p>
                    <p
                      className={cn(
                        "mt-1 font-serif text-4xl font-semibold text-ink",
                        plano.destaque && "text-gold-gradient"
                      )}
                    >
                      {plano.priceLabel}
                      <span className="text-lg font-normal text-muted">
                        {plano.periodLabel}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-muted">{plano.tagline}</p>
                    <ul className="mt-5 flex-1 space-y-2 text-sm text-ink">
                      {plano.features.map((f) => (
                        <li
                          key={f}
                          className={cn(
                            "flex items-start gap-2",
                            !plano.disponivel && "opacity-70"
                          )}
                        >
                          <Check size={16} className="mt-0.5 shrink-0 text-brand-500" /> {f}
                        </li>
                      ))}
                    </ul>
                    {plano.disponivel ? (
                      <PlanCheckoutButton
                        plan={plano.id}
                        className={cn(
                          "mt-6 w-full px-4 py-2.5 text-sm disabled:opacity-60",
                          plano.destaque ? "btn-cta" : "btn-cta-outline"
                        )}
                      >
                        Assinar {plano.label}
                        {plano.destaque && <ArrowRight size={16} />}
                      </PlanCheckoutButton>
                    ) : (
                      <WaitlistForm plan={plano.id} className="mt-6" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-lavender-200 bg-lavender-50 p-4 text-xs text-lavender-700">
                <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                <p>
                  Respostas feitas para a estética: nunca prometem resultado garantido,
                  não fazem diagnóstico e sempre valorizam a avaliação — mais segurança
                  pra você e pra sua cliente.
                </p>
              </div>

              <div className="flex justify-center">
                <Button variant="ghost" onClick={() => irPara("diferenca")}>
                  <ArrowLeft size={16} /> Ver a diferença de novo
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* rodapé curto */}
        <div className="mt-12 flex items-center justify-center gap-2 text-center text-xs text-muted">
          <MessageSquareText size={14} /> Responda melhor. Agende mais.
        </div>
        </>
      </div>
    </div>
  );
}

export default function OnboardingFunnelPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingFunnelInner />
    </Suspense>
  );
}
