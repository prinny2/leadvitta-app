import Link from "next/link";
import { Suspense } from "react";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  MessageSquareText,
  ShieldCheck,
  Flower2,
  TrendingDown,
} from "lucide-react";
import { isFirebaseConfigured } from "@/lib/config";
import { billingPlanList } from "@/lib/billing";
import { Logo } from "@/components/logo";
import { PlanCTA } from "@/components/plan-cta";
import { LandingWhatsAppDemo } from "@/components/landing-whatsapp-demo";
import { LoadingRespostas } from "@/components/loading-respostas";

// Funil de captação (sem login). Visitante deslogado experimenta antes de criar conta.
const funilHref = "/onboarding";
const entrarHref = isFirebaseConfigured ? "/login" : "/dashboard";

const dores = [
  "respostas para quem pergunta preço",
  "respostas para quem achou caro",
  "mensagens para a cliente que sumiu",
  "scripts para conduzir até a avaliação",
  "follow-ups prontos pra trazer de volta",
  "respostas por procedimento",
];

export default function LandingPage() {
  return (
    <div className="bg-nude-50">
      {/* Top nav */}
      <header className="relative overflow-hidden bg-hero">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-10 h-48 w-48 rounded-full bg-lavender-200/30 blur-3xl animate-float" />
          <div className="absolute -right-12 top-20 h-56 w-56 rounded-full bg-brand-200/25 blur-3xl animate-float-delayed" />
        </div>
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Logo href="/" textClass="text-lg text-ink" />
          <div className="flex items-center gap-2">
            <Link
              href={entrarHref}
              className="rounded-xl px-4 py-2 text-sm font-medium text-ink hover:bg-white/60"
            >
              Entrar
            </Link>
            <Link
              href={funilHref}
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-brand-600"
            >
              Testar grátis
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 pb-12 pt-10 text-center sm:pt-16">
          <span className="inline-flex animate-float items-center gap-1.5 rounded-full border border-lavender-300 bg-white/70 px-3 py-1 text-xs font-medium text-lavender-700 shadow-sm">
            <Sparkles size={14} className="text-brand-500" /> Responda melhor. Agende mais.
          </span>
          <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight text-ink sm:text-6xl">
            Toda semana sua clínica perde dinheiro no WhatsApp por{" "}
            <span className="text-gold-gradient">responder do jeito errado.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            A cliente pergunta o preço, recebe uma resposta fria e some — calada.
            Te entregamos a resposta certa pra cada situação, no seu jeito de falar,
            pra transformar dúvida em agendamento em vez de perder pra concorrente
            mais barata.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={funilHref}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-4 text-base font-semibold text-white shadow-soft transition-all hover:scale-105 hover:bg-brand-600"
            >
              Testar com a minha clínica <ArrowRight size={18} />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white/70 px-8 py-4 text-base font-semibold text-ink transition-all hover:bg-white"
            >
              Ver a diferença
            </Link>
          </div>
          <div className="mt-6 text-sm text-muted">
            Sem cadastro pra testar · pronto em minutos
          </div>
        </section>

        {/* Social Proof Bar */}
        <div className="mx-auto max-w-5xl px-4 pb-16">
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40 grayscale transition-all hover:opacity-70 hover:grayscale-0">
            <div className="flex items-center gap-2 font-serif text-xl font-bold">
              <ShieldCheck size={24} /> CLINIC PRO
            </div>
            <div className="flex items-center gap-2 font-serif text-xl font-bold">
              <Sparkles size={24} /> ESTÉTICA VIVA
            </div>
            <div className="flex items-center gap-2 font-serif text-xl font-bold">
              <Flower2 size={24} /> DERMA CARE
            </div>
            <div className="flex items-center gap-2 font-serif text-xl font-bold">
              <MessageSquareText size={24} /> SOFT SKIN
            </div>
          </div>
        </div>
      </header>

      {/* Demo */}
      <section id="demo" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-ink">
            Veja a diferença em 30 segundos
          </h2>
          <p className="mt-3 text-muted">
            Coloque o nome e o tom da sua clínica e veja a resposta mudar — sem login.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "preco", label: "Perguntou preço" },
              { id: "achou_caro", label: "Achou caro" },
              { id: "sumiu", label: "Sumiu" },
              { id: "medo", label: "Medo do procedimento" },
            ].map((d) => (
              <Link
                key={d.id}
                href={`/?demo=${d.id}#demo`}
                className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-brand-50"
              >
                {d.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-10">
          <Suspense fallback={<LoadingRespostas mensagem="Carregando a demo…" />}>
            <LandingWhatsAppDemo />
          </Suspense>
        </div>
      </section>

      {/* Dor */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-600">
          <TrendingDown size={14} /> Onde o dinheiro vaza
        </div>
        <h2 className="font-serif text-3xl font-semibold text-ink">
          A cliente pergunta o preço. Você responde. Ela some.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          Na estética, a maioria das vendas não se perde por falta de interesse —
          se perde por falta de condução. Quando a resposta é fria, curta ou só
          fala de valor, a cliente não percebe o porquê do preço e vai embora
          comparar com a mais barata. Cada uma dessas pode valer{" "}
          <strong className="text-ink">R$500 a R$2.000</strong> que você nunca mais
          vê voltar.
        </p>
      </section>

      {/* Antes / Depois */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-red-100 bg-red-50/50 p-8 shadow-sm">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-600">
              <X size={14} /> Resposta qualquer
            </div>
            <p className="font-serif text-xl italic text-red-900/70">“Botox é R$900.”</p>
            <p className="mt-4 text-sm leading-relaxed text-red-800/60">
              Resposta seca, focada só no preço. A cliente sente que é só mais um
              número, compara com o concorrente mais barato e some. Venda perdida.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-white to-brand-50 p-8 shadow-soft">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-brand-200/20 blur-2xl" />
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600">
              <Check size={14} /> A resposta que agenda
            </div>
            <p className="text-lg font-medium leading-relaxed text-ink">
              “Oi, Ana! O investimento pode variar conforme os pontos avaliados e
              o objetivo do tratamento. Você busca suavizar linhas da testa, pés
              de galinha ou prevenir marcas? Assim consigo te orientar melhor e
              ver o melhor caminho para você.”
            </p>
            <p className="mt-4 text-sm font-medium text-brand-700">
              Resultado: gera autoridade, acolhe e conduz pra avaliação.
            </p>
          </div>
        </div>
      </section>

      {/* Solução */}
      <section className="bg-soft py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-semibold text-ink">
              A resposta certa, pronta, pra cada situação
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Em segundos, no tom da sua clínica — é só copiar e colar no WhatsApp:
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dores.map((d) => (
              <div
                key={d}
                className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
                  <Check size={16} />
                </span>
                <span className="text-sm text-ink">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Oferta */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-semibold text-ink">
            Uma cliente recuperada já paga o mês inteiro
          </h2>
          <p className="mt-3 text-muted">
            Se uma única cliente que ia sumir fechar um procedimento, o plano já se
            pagou — e sobra.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {billingPlanList.map((plano) => (
            <div
              key={plano.id}
              className={
                plano.destaque
                  ? "group relative rounded-3xl border-2 border-brand-300 bg-gradient-to-br from-white to-brand-50 p-7 shadow-soft transition-transform hover:scale-[1.03]"
                  : "relative rounded-3xl border border-brand-100 bg-white p-7 transition-transform hover:scale-[1.02]"
              }
            >
              {plano.selo && (
                <span
                  className={
                    plano.destaque
                      ? "absolute -top-3 right-5 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white"
                      : "absolute -top-3 right-5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700"
                  }
                >
                  {plano.selo}
                </span>
              )}
              <p className="text-sm font-medium text-muted">Plano {plano.label}</p>
              <p
                className={
                  plano.destaque
                    ? "mt-1 font-serif text-4xl font-semibold text-gold-gradient"
                    : "mt-1 font-serif text-4xl font-semibold text-ink"
                }
              >
                {plano.priceLabel}
                <span className="text-lg font-normal text-muted">{plano.periodLabel}</span>
              </p>
              <p className="mt-1 text-sm text-muted">{plano.tagline}</p>
              <ul className="mt-5 space-y-2 text-sm text-ink">
                {plano.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-brand-500" /> {f}
                  </li>
                ))}
              </ul>
              <PlanCTA
                plan={plano.id}
                className={
                  plano.destaque
                    ? "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-600 disabled:opacity-60"
                    : "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-300 px-4 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-60"
                }
              >
                Começar com o {plano.label}
                {plano.destaque && <ArrowRight size={16} />}
              </PlanCTA>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-muted">
          Planos mensais, cancela quando quiser. Acesso contínuo a todas as
          atualizações e novas respostas.
        </p>
      </section>

      {/* Compliance / confiança */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="flex items-start gap-3 rounded-2xl border border-lavender-200 bg-lavender-50 p-5 text-sm text-lavender-700">
          <ShieldCheck size={20} className="mt-0.5 shrink-0" />
          <p>
            As respostas são pensadas para a estética: nunca prometem resultado
            garantido, não fazem diagnóstico e valorizam a avaliação individual —
            mais profissionalismo e segurança para você.
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-brand-dark py-20 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <MessageSquareText size={32} className="mx-auto text-lavender-400" />
          <h2 className="mt-4 font-serif text-3xl font-semibold text-nude-50">
            Pare de perder agendamento pra resposta fria
          </h2>
          <p className="mt-2 text-sm text-nude-200">
            Teste com a sua clínica agora — sem cadastro.
          </p>
          <Link
            href={funilHref}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-lavender-400 px-6 py-3 text-base font-semibold text-brand-900 shadow-soft hover:bg-lavender-300"
          >
            Testar com a minha clínica <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-brand-100 py-12 text-center text-xs text-muted">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-3 md:text-left">
            <div className="space-y-3">
              <Logo href="/" textClass="text-lg text-ink" />
              <p className="text-balance">
                Conversão para clínicas de estética — responda melhor e agende mais
                pelo WhatsApp.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-ink">Contato</h4>
              <p>Av. Rômulo Maiorana, 1695, Marco<br />Belém - PA, 66093-674</p>
              <p>WhatsApp: +55 91 8515-6690</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-ink">Horário</h4>
              <p>Respostas prontas 24h, todo dia</p>
              <p>© 2026 LeadBellus · VPS Automações</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
