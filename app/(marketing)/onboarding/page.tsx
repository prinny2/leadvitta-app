"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { PlanCTA } from "@/components/plan-cta";
import { WaitlistForm } from "@/components/waitlist-form";
import { billingPlanList } from "@/lib/billing";
import { procedimentos } from "@/data/procedimentos";
import { comoChamarOptions, ctaOptions, formalidadeLabel } from "@/data/opcoes";
import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { saveClinica } from "@/lib/store";
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

export default function OnboardingFunnelPage() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("clinica");
  const [c, setC] = useState<Clinica>(clinicaVazia);
  const [logado, setLogado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mostrarTodosProcedimentos, setMostrarTodosProcedimentos] = useState(false);

  // “Ours” gerado ao vivo na aba 2.
  const [gerando, setGerando] = useState(false);
  const [respostaNossa, setRespostaNossa] = useState<string>("");

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    try {
      const auth = getFirebaseAuth();
      setLogado(!!auth.currentUser);
      const unsub = onAuthStateChanged(auth, (u) => setLogado(!!u));
      return () => unsub();
    } catch {
      /* sem firebase: segue como visitante */
    }
  }, []);

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
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
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
          ) : (
            <Link href="/login" className="text-sm font-medium text-muted hover:text-ink">
              Já tenho conta
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
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
                Monte o jeito da sua clínica e veja{" "}
                <span className="text-gold-gradient">a resposta mudar na hora.</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-muted">
                Sem cadastro para testar. Escolha o tom, os procedimentos e o CTA
                que combinam com sua clínica e veja como isso muda a conversa.
              </p>
            </>
          )}
        </div>

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
                      ? "bg-white text-brand-600 shadow-sm"
                      : "text-muted hover:text-ink",
                    !habilitada && "cursor-not-allowed opacity-40"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                      ativa ? "bg-brand-500 text-white" : "bg-brand-100 text-brand-600"
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
            className="h-full rounded-full bg-brand-500 transition-all duration-300"
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
                    <p className="text-sm font-semibold text-ink">1. Identidade rápida</p>
                    <p className="mt-1 text-sm text-muted">
                      O básico para as respostas saírem com cara de atendimento da sua clínica.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="nome">Qual o nome da sua clínica?</Label>
                    <Input
                      id="nome"
                      value={c.nome_clinica}
                      onChange={(e) => set("nome_clinica", e.target.value)}
                      placeholder="Ex.: Espaço Beleza & Cuidado"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label htmlFor="cidade">Cidade <span className="text-muted">(opcional)</span></Label>
                    <Input
                      id="cidade"
                      value={c.cidade}
                      onChange={(e) => set("cidade", e.target.value)}
                      placeholder="Ex.: São Paulo - SP"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>2. O que mais entra na sua agenda?</Label>
                    <p className="mt-1 text-sm text-muted">
                      Escolha os procedimentos que mais aparecem no seu WhatsApp.
                    </p>
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
                      <Label>3. Como você fala com suas clientes?</Label>
                      <p className="mt-1 text-sm text-muted">
                        Escolha o clima da conversa que mais parece com o seu atendimento.
                      </p>
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
                    <Label htmlFor="form">Seu nível de formalidade</Label>
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
                    <Label>4. Qual CTA combina mais com sua clínica?</Label>
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
                <div className="flex flex-col rounded-3xl border border-red-100 bg-red-50/40 p-6">
                  <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-600">
                    <X size={13} /> Resposta qualquer
                  </div>
                  <div className="rounded-2xl rounded-bl-md border border-red-100 bg-white px-4 py-3 text-sm leading-relaxed text-ink">
                    “Botox é R$900. Qualquer dúvida, estou à disposição.”
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-red-800/70">
                    Joga o preço, não cria valor. A cliente compara com a concorrente
                    mais barata e <strong>some</strong> — e some calada.
                  </p>
                </div>

                {/* nossa */}
                <div className="relative flex flex-col overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-white to-brand-50 p-6 shadow-soft">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-200/20 blur-2xl" />
                  <div className="relative flex flex-col">
                    <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600">
                      <Check size={13} /> A resposta da {c.nome_clinica.trim() || "sua clínica"}
                    </div>
                    <div className="rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-sm leading-relaxed text-white shadow-soft">
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
              <div className="rounded-2xl border border-lavender-200 bg-lavender-50 px-5 py-4 text-center text-sm text-lavender-800">
                Cada cliente que some sem fechar pode ser{" "}
                <strong>R$500 a R$2.000</strong> que saíram da sua agenda — toda semana,
                sem você nem perceber.
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
                <Button onClick={() => irPara("planos")} className="sm:min-w-[220px]">
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
                      <PlanCTA
                        plan={plano.id}
                        className={cn(
                          "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60",
                          plano.destaque
                            ? "bg-brand-500 text-white shadow-soft hover:bg-brand-600"
                            : "border border-brand-300 text-brand-600 hover:bg-brand-50"
                        )}
                      >
                        Começar com o {plano.label}
                        {plano.destaque && <ArrowRight size={16} />}
                      </PlanCTA>
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
      </div>
    </div>
  );
}
