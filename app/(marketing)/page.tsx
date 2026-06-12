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
import { WaitlistForm } from "@/components/waitlist-form";
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

        {/* Lançamento — sem logos fictícios até ter depoimentos reais */}
        <div className="mx-auto max-w-5xl px-4 pb-16 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-2 text-sm font-medium text-muted">
            <Flower2 size={16} className="text-brand-500" />
            Seja uma das primeiras profissionais a atender com o LeadBellus
          </p>
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

      {/* Lead Intelligence — killer feature */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-brand-dark p-8 text-white shadow-soft sm:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-lavender-400/10 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lavender-400/30 bg-lavender-400/20 px-3 py-1 text-xs font-bold text-lavender-300">
                <Sparkles size={14} /> EXCLUSIVO · LEAD INTELLIGENCE
              </span>
              <h2 className="mt-4 font-serif text-3xl font-semibold text-nude-50">
                Saiba quem está pronta pra fechar — antes de responder
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-nude-200">
                Cada mensagem que chega é lida e organizada pra você: quem está
                pronta pra agendar, quem ainda está na dúvida e quem esfriou.
                Você responde primeiro quem tem mais chance de fechar — sem ler
                tudo e sem deixar ninguém escapar.
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-lavender-300">
                Em breve, no plano Premium
              </p>
            </div>
            <div className="space-y-3">
              {[
                { emoji: "🔥", t: "Quente", d: "“Posso pagar no cartão? Tem horário amanhã?” — quer fechar agora", cls: "border-red-300/30" },
                { emoji: "🌤️", t: "Morna", d: "“Vou pensar e te falo…” — precisa de um empurrãozinho", cls: "border-amber-300/30" },
                { emoji: "❄️", t: "Fria", d: "Sumiu depois do orçamento — hora do follow-up certo", cls: "border-sky-300/30" },
              ].map((x) => (
                <div
                  key={x.t}
                  className={`flex items-start gap-3 rounded-2xl border bg-white/5 px-4 py-3 ${x.cls}`}
                >
                  <span className="text-xl">{x.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-nude-50">{x.t}</p>
                    <p className="text-xs leading-relaxed text-nude-200">{x.d}</p>
                  </div>
                </div>
              ))}
            </div>
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
                  <li
                    key={f}
                    className={
                      plano.disponivel
                        ? "flex items-start gap-2"
                        : "flex items-start gap-2 opacity-70"
                    }
                  >
                    <Check size={16} className="mt-0.5 shrink-0 text-brand-500" /> {f}
                  </li>
                ))}
              </ul>
              {plano.disponivel ? (
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
              ) : (
                <WaitlistForm plan={plano.id} className="mt-6" />
              )}
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-muted">
          Planos mensais, cancela quando quiser. Acesso contínuo a todas as
          atualizações e novas respostas.
        </p>
      </section>

      {/* Garantia */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="rounded-3xl border-2 border-brand-200 bg-white p-8 text-center shadow-soft">
          <ShieldCheck size={32} className="mx-auto text-brand-500" />
          <h2 className="mt-3 font-serif text-2xl font-semibold text-ink">
            Garantia de 7 dias, sem letra miúda
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Teste o LeadBellus por 7 dias. Se você não sentir que está
            respondendo melhor e perdendo menos cliente, é só pedir o
            cancelamento — devolvemos 100% do valor, sem perguntas.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="text-center font-serif text-3xl font-semibold text-ink">
          Perguntas frequentes
        </h2>
        <div className="mt-8 space-y-3">
          {[
            {
              q: "Preciso instalar alguma coisa no meu WhatsApp?",
              a: "Não. Você usa o LeadBellus pelo navegador (celular ou computador): cola a mensagem da cliente, recebe a resposta pronta no seu tom e copia de volta pro WhatsApp. Em 30 segundos está respondendo melhor.",
            },
            {
              q: "As respostas vão parecer robóticas?",
              a: "Não — esse é o ponto. Você configura o DNA da sua clínica (seu jeito de falar, como chama as clientes, seus procedimentos) e toda resposta sai no SEU tom. É como ter alguém que escreve exatamente como você, só que na hora.",
            },
            {
              q: "Funciona pra qualquer procedimento?",
              a: "Sim. Botox, preenchimento, harmonização, limpeza de pele, depilação a laser, pós-operatório e dezenas de outros — as respostas levam em conta o procedimento que a cliente perguntou.",
            },
            {
              q: "E se a cliente fizer uma pergunta difícil, tipo 'dói?' ou 'tem desconto?'",
              a: "É exatamente pra isso que existe a Biblioteca de Objeções: as perguntas que travam a venda ('tá caro', 'vou pensar', 'dói?', 'tem desconto?') já têm resposta pronta, testada e no seu tom.",
            },
            {
              q: "Posso cancelar quando quiser?",
              a: "Sim. O plano é mensal, sem fidelidade, e o cancelamento é direto pelo painel. E nos primeiros 7 dias você tem garantia total: devolvemos 100% se não gostar.",
            },
            {
              q: "As respostas prometem resultado dos procedimentos?",
              a: "Nunca. As respostas são pensadas para a estética: não prometem resultado garantido, não fazem diagnóstico e sempre valorizam a avaliação individual — mais profissionalismo e segurança pra você.",
            },
          ].map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-brand-100 bg-white px-5 py-4 shadow-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-ink">
                {item.q}
                <span className="shrink-0 text-brand-400 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
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
            Comece com o Start por R$97/mês — preço de lançamento, garantia de 7
            dias, cancela quando quiser.
          </p>
          <Link
            href={funilHref}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-lavender-400 px-6 py-3 text-base font-semibold text-brand-900 shadow-soft hover:bg-lavender-300"
          >
            Começar com o Start <ArrowRight size={18} />
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
