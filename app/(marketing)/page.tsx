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
} from "lucide-react";
import { isFirebaseConfigured } from "@/lib/config";
import { Logo } from "@/components/logo";
import { PlanCTA } from "@/components/plan-cta";
import { LandingWhatsAppDemo } from "@/components/landing-whatsapp-demo";
import { LoadingRespostas } from "@/components/loading-respostas";

const comecarHref = isFirebaseConfigured ? "/signup" : "/dashboard";

const dores = [
  "respostas para clientes que perguntam preço",
  "respostas para quem acha caro",
  "mensagens para clientes que somem",
  "scripts para conduzir até a avaliação",
  "follow-ups prontos",
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
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-ink hover:bg-white/60"
            >
              Entrar
            </Link>
            <Link
              href={comecarHref}
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-brand-600"
            >
              Começar
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="mx-auto max-w-4xl px-4 pb-12 pt-10 text-center sm:pt-16">
          <span className="inline-flex animate-float items-center gap-1.5 rounded-full border border-lavender-300 bg-white/70 px-3 py-1 text-xs font-medium text-lavender-700 shadow-sm">
            <Sparkles size={14} className="text-brand-500" /> Responda melhor. Agende mais.
          </span>
          <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight text-ink sm:text-6xl">
            Pare de perder clientes no WhatsApp por{" "}
            <span className="text-gold-gradient">responder do jeito errado.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Gere respostas estratégicas com IA para quebrar objeções, fazer
            follow-up e transformar dúvidas sobre procedimentos estéticos em
            agendamentos.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={comecarHref}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-4 text-base font-semibold text-white shadow-soft transition-all hover:scale-105 hover:bg-brand-600"
            >
              Quero responder melhor no WhatsApp <ArrowRight size={18} />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white/70 px-8 py-4 text-base font-semibold text-ink transition-all hover:bg-white"
            >
              Ver demo
            </Link>
          </div>
          <div className="mt-6 text-sm text-muted">
            Sem cartão para testar · pronto em minutos
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
            Veja funcionando em 30 segundos
          </h2>
          <p className="mt-3 text-muted">
            Simule uma conversa de WhatsApp, teste o tom e personalize a clínica
            — sem login.
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
        <h2 className="font-serif text-3xl font-semibold text-ink">
          A cliente pergunta preço. Você responde. Ela some.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          Na estética, muitas vendas são perdidas não por falta de interesse,
          mas por falta de condução. Quando a resposta é fria, curta ou focada
          só no valor, a cliente não entende o procedimento, não percebe valor e
          acaba comparando só por preço.
        </p>
      </section>

      {/* Antes / Depois */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-red-100 bg-red-50/50 p-8 shadow-sm">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-600">
              <X size={14} /> Atendimento Comum
            </div>
            <p className="font-serif text-xl italic text-red-900/70">“Botox é R$900.”</p>
            <p className="mt-4 text-sm leading-relaxed text-red-800/60">
              Resposta seca, focada apenas no preço. A cliente sente que é apenas mais um número, compara com o concorrente mais barato e some.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-white to-brand-50 p-8 shadow-soft">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-brand-200/20 blur-2xl" />
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600">
              <Check size={14} /> Método LeadBellus
            </div>
            <p className="text-lg font-medium leading-relaxed text-ink">
              “Oi, Ana! O investimento pode variar conforme os pontos avaliados e
              o objetivo do tratamento. Você busca suavizar linhas da testa, pés
              de galinha ou prevenir marcas? Assim consigo te orientar melhor e
              ver o melhor caminho para você.”
            </p>
            <p className="mt-4 text-sm font-medium text-brand-700">
              Resultado: Gera autoridade, acolhimento e inicia uma consultoria.
            </p>
          </div>
        </div>
      </section>

      {/* Solução */}
      <section className="bg-soft py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-semibold text-ink">
              Responda com segurança, acolhimento e estratégia
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              O LeadBellus te entrega, em segundos, a resposta certa para cada
              situação:
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
            Escolha como começar
          </h2>
          <p className="mt-3 text-muted">
            Se uma única cliente que ia sumir fechar um procedimento, o produto
            já se pagou.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {/* Start */}
          <div className="rounded-3xl border border-brand-100 bg-white p-7">
            <p className="text-sm font-medium text-muted">Plano Start</p>
            <p className="mt-1 font-serif text-4xl font-semibold text-ink">
              R$197<span className="text-lg font-normal text-muted">/mês</span>
            </p>
            <p className="mt-1 text-sm text-muted">Para validar e começar.</p>
            <ul className="mt-5 space-y-2 text-sm text-ink">
              {[
                "Gerador de respostas com IA",
                "Respostas para objeções",
                "Follow-up",
                "Procedimentos principais",
                "Botão copiar para WhatsApp",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check size={16} className="text-brand-500" /> {f}
                </li>
              ))}
            </ul>
            <PlanCTA
              plan="start"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-300 px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 disabled:opacity-60"
            >
              Começar com o Start
            </PlanCTA>
          </div>

          {/* Pro */}
          <div className="relative rounded-3xl border border-brand-100 bg-white p-7 shadow-sm transition-transform hover:scale-[1.02]">
            <p className="text-sm font-medium text-muted">Plano Pro</p>
            <p className="mt-1 font-serif text-4xl font-semibold text-ink">
              R$297<span className="text-lg font-normal text-muted">/mês</span>
            </p>
            <p className="mt-1 text-sm text-muted">Inteligência avançada.</p>
            <ul className="mt-5 space-y-2 text-sm text-ink">
              {[
                "Tudo do Start",
                "Biblioteca completa de objeções",
                "Scripts de atendimento",
                "Histórico de respostas",
                "Tons de voz personalizados",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check size={16} className="text-brand-500" /> {f}
                </li>
              ))}
            </ul>
            <PlanCTA
              plan="pro"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-300 px-4 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-60"
            >
              Quero o Pro
            </PlanCTA>
          </div>

          {/* Premium */}
          <div className="group relative rounded-3xl border-2 border-brand-300 bg-gradient-to-br from-white to-brand-50 p-7 shadow-soft transition-transform hover:scale-[1.03]">
            <div className="absolute -inset-0.5 animate-pulse rounded-3xl bg-brand-300/30 blur opacity-0 transition group-hover:opacity-100" />
            <div className="relative">
              <span className="absolute -top-3 right-0 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                Mais Inteligente
              </span>
              <p className="text-sm font-medium text-muted">Plano Premium</p>
              <p className="mt-1 font-serif text-4xl font-semibold text-ink text-gold-gradient">
                R$397<span className="text-lg font-normal text-muted">/mês</span>
              </p>
              <p className="mt-1 text-sm text-muted">Inteligência completa.</p>
              <ul className="mt-5 space-y-2 text-sm text-ink">
                {[
                  "Tudo do Pro",
                  "Inteligência de Leads (NLP)",
                  "Score de Prioridade automático",
                  "Classificação de Sentimento",
                  "Análise de Intenção",
                  "Suporte prioritário",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={16} className="text-brand-500" /> {f}
                  </li>
                ))}
              </ul>
              <PlanCTA
                plan="premium"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-600 disabled:opacity-60"
              >
                Quero o Premium <ArrowRight size={16} />
              </PlanCTA>
            </div>
          </div>

        </div>
        <p className="mt-5 text-center text-xs text-muted">
          Planos mensais com acesso contínuo a todas as atualizações e novas respostas.
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
            Transforme dúvidas em agendamentos hoje mesmo
          </h2>
          <p className="mt-2 text-sm text-nude-200">
            Responda melhor. Agende mais.
          </p>
          <Link
            href={comecarHref}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-lavender-400 px-6 py-3 text-base font-semibold text-brand-900 shadow-soft hover:bg-lavender-300"
          >
            Quero responder melhor no WhatsApp <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-brand-100 py-12 text-center text-xs text-muted">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-3 md:text-left">
            <div className="space-y-3">
              <Logo href="/" textClass="text-lg text-ink" />
              <p className="text-balance">
                Inteligência de conversão para clínicas de estética — responda melhor e agende mais pelo WhatsApp.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-ink">Contato</h4>
              <p>Av. Rômulo Maiorana, 1695, Marco<br />Belém - PA, 66093-674</p>
              <p>WhatsApp: +55 91 8515-6690</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-ink">Horário</h4>
              <p>Segunda a Sábado: 24h (IA ativa)</p>
              <p>© 2026 LeadBellus · VPS Automações</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
