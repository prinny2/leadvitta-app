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
import { cn } from "@/lib/utils";

// Funil de captação (sem login). Visitante deslogado experimenta antes de criar conta.
const funilHref = "/onboarding";

const dores = [
  "respostas para quem pergunta preço",
  "respostas para quem achou caro",
  "mensagens para a cliente que sumiu",
  "scripts para conduzir até a avaliação",
  "follow-ups prontos pra trazer de volta",
  "respostas por procedimento",
];

const heroHooks = [
  {
    emoji: "📜",
    title: "\"Muito texto\" estressa a cliente",
    desc: "Textões robóticos afastam quem quer praticidade. O cliente premium lê e foge.",
    tone: "pain" as const,
  },
  {
    emoji: "⏱️",
    title: "A demora faz ela sumir",
    desc: "Demorou uma eternidade? Nesse tempo ela já agendou na concorrente.",
    tone: "pain" as const,
  },
  {
    emoji: "📱",
    title: "Respostas que não fecham",
    desc: "A conversa esfria sem um puxão firme para o agendamento.",
    tone: "muted" as const,
  },
];

const vazamentos = [
  {
    stat: "R$ 500–2.000",
    title: "Preço sem contexto",
    desc: "Só número na mensagem. A cliente vai pra quem explica melhor — ou pra quem é mais barata.",
  },
  {
    stat: "3 em 5",
    title: "Conversa sem CTA",
    desc: "A conversa esfria porque ninguém conduz pro horário. Venda morre no WhatsApp.",
  },
  {
    stat: "Toda semana",
    title: "Cliente que some",
    desc: "Orçou, não fechou, desapareceu. Sem follow-up certo, esse dinheiro não volta.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-nude-50">
      {/* Top nav */}
      <header className="relative overflow-hidden bg-hero">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-10 h-48 w-48 rounded-full bg-brand-200/40 blur-3xl animate-float" />
          <div className="absolute -right-12 top-20 h-56 w-56 rounded-full bg-gold-200/50 blur-3xl animate-float-delayed" />
        </div>
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Logo href="/" textClass="text-lg text-ink" />
          <Link href={funilHref} className="btn-cta px-4 py-2 text-sm">
            Teste grátis e agende mais
          </Link>
        </nav>

        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pb-12 pt-10 text-center sm:pt-16">
          <span className="badge-pain animate-float border border-pain-200 bg-white/80">
            <TrendingDown size={14} /> Clínicas perdem até R$8 mil/mês no WhatsApp
          </span>
          <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight text-ink sm:text-6xl">
            Ela perguntou o preço.{" "}
            <span className="text-gold-gradient">Você respondeu errado.</span>{" "}
            Ela sumiu.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Resposta curta, no tom da sua clínica, que cria valor e puxa pra
            avaliação — sem parede de texto e sem improviso.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={funilHref} className="btn-cta min-w-[260px] px-8 py-4">
              Ver minha resposta em 1 min <ArrowRight size={18} />
            </Link>
            <Link href="#demo" className="btn-cta-outline min-w-[220px] px-8 py-4">
              Comparar antes e depois
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
            <span>Sem cartão pra testar</span>
            <span>Pronto no celular</span>
            <span>Feito para clínicas de estética</span>
          </div>
          <div className="mt-10 grid gap-3 text-left sm:grid-cols-3">
            {heroHooks.map((hook) => (
              <div
                key={hook.title}
                className={cn(
                  "rounded-2xl border p-4 shadow-sm backdrop-blur",
                  hook.tone === "pain"
                    ? "border-pain-200 bg-pain-50/80"
                    : "border-brand-100 bg-white/80"
                )}
              >
                <div className="text-2xl">{hook.emoji}</div>
                <p
                  className={cn(
                    "mt-3 text-sm font-bold",
                    hook.tone === "pain" ? "text-pain-600" : "text-ink"
                  )}
                >
                  {hook.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{hook.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Lançamento — sem logos fictícios até ter depoimentos reais */}
        <div className="mx-auto max-w-5xl px-4 pb-16 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-2 text-sm font-medium text-muted">
            <Flower2 size={16} className="text-brand-500" />
            Entre no lançamento e padronize suas respostas antes da próxima cliente sumir
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
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="mx-auto mb-4 badge-pain">
          <TrendingDown size={14} /> Onde o dinheiro vaza
        </div>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-ink">
            Ela queria agendar. A conversa morreu no meio do caminho.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Na estética, a venda se perde quando a resposta não cria valor, não acolhe
            e não conduz. Cada conversa travada pode ser um procedimento a menos na sua agenda.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {vazamentos.map((item) => (
            <div
              key={item.title}
              className="card-pain rounded-3xl p-6"
            >
              <p className="font-serif text-2xl font-bold text-pain-500">{item.stat}</p>
              <h3 className="mt-2 text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Antes / Depois */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-pain-200 bg-pain-50/70 p-8 shadow-sm">
            <div className="badge-pain mb-4">
              <X size={14} /> Resposta qualquer
            </div>
            <p className="font-serif text-xl italic text-pain-600">“Botox é R$900.”</p>
            <p className="mt-4 text-sm leading-relaxed text-pain-600/80">
              Resposta seca, focada só no preço. A cliente sente que é só mais um
              número, compara com o concorrente mais barato e some. Venda perdida.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-3xl border-2 border-gold-300 bg-gradient-to-br from-white to-gold-50 p-8 shadow-cta">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gold-200/40 blur-2xl" />
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-700">
              <Check size={14} /> A resposta que agenda
            </div>
            <p className="text-lg font-medium leading-relaxed text-ink">
              “Oi, Ana! O investimento pode variar conforme os pontos avaliados e
              o objetivo do tratamento. Você busca suavizar linhas da testa, pés
              de galinha ou prevenir marcas? Assim consigo te orientar melhor e
              ver o melhor caminho para você.”
            </p>
            <p className="mt-4 text-sm font-semibold text-gold-700">
              Resultado: acolhe, cria valor e puxa pra avaliação.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {[
            "Cria valor antes do preço",
            "Fala no tom da sua clínica",
            "Conduz para avaliação",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border border-gold-200 bg-gold-50 px-4 py-2 text-xs font-semibold text-gold-700"
            >
              {item}
            </span>
          ))}
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
                Filtro de ROI: O fim do tempo perdido com curiosos
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-nude-200">
                Nossa inteligência separa quem quer agendar hoje de quem só está pesquisando preço. 
                O LeadBellus prioriza os agendamentos no seu WhatsApp e pode até fechar o horário 
                sozinho enquanto você atende.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-300 border border-brand-500/30">
                  Agendamento Autônomo (Zero Toque)
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-lavender-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-lavender-300 border border-lavender-500/30">
                  Priorização de Faturamento
                </span>
              </div>
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
              O que você passa a responder sem travar
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
                className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-card"
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
          {/* Start */}
          <div className="rounded-3xl border border-brand-100 bg-white p-7">
            <p className="text-sm font-medium text-muted">Plano Start</p>
            <p className="mt-1 font-serif text-4xl font-semibold text-ink">
              {billingPlanList[0].priceLabel}
              <span className="text-lg font-normal text-muted">
                {billingPlanList[0].periodLabel}
              </span>
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
            <Link
              href={funilHref}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-brand-300 px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50"
            >
              Começar com o Start
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-3xl border-2 border-brand-300 bg-gradient-to-br from-white to-brand-50 p-7 shadow-soft">
            <span className="absolute -top-3 right-6 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
              Mais escolhido
            </span>
            <p className="text-sm font-medium text-muted">Plano Pro</p>
            <p className="mt-1 font-serif text-4xl font-semibold text-ink">
              {billingPlanList[1].priceLabel}
              <span className="text-lg font-normal text-muted">
                {billingPlanList[1].periodLabel}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted">O produto completo.</p>
            <ul className="mt-5 space-y-2 text-sm text-ink">
              {[
                "Tudo do Start",
                "Biblioteca completa de objeções",
                "Scripts de atendimento",
                "Histórico de respostas",
                "Tons de voz + respostas por procedimento",
                "Reativação e pós-atendimento",
                "Atualizações por 12 meses",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check size={16} className="text-brand-500" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href={funilHref}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-brand-600"
            >
              Quero o Pro <ArrowRight size={16} />
            </Link>
          </div>

          {/* Premium */}
          <div className="rounded-3xl border border-lavender-200 bg-gradient-to-br from-white to-lavender-50 p-7">
            <p className="text-sm font-medium text-muted">Plano Premium</p>
            <p className="mt-1 font-serif text-4xl font-semibold text-ink">
              {billingPlanList[2].priceLabel}
              <span className="text-lg font-normal text-muted">
                {billingPlanList[2].periodLabel}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted">Máximo desempenho e inteligência.</p>
            <ul className="mt-5 space-y-2 text-sm text-ink">
              {[
                "Tudo do Pro",
                "NLP avançado e score de intenção",
                "Prioridade em novas funcionalidades",
                "Suporte prioritário",
                "Relatórios de conversão",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check size={16} className="text-brand-500" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href={funilHref}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-lavender-300 px-4 py-2.5 text-sm font-medium text-lavender-700 hover:bg-lavender-50"
            >
              Quero o Premium <ArrowRight size={16} />
            </Link>
          </div>
        </div>
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
            Sua próxima conversa pode virar agenda
          </h2>
          <p className="mt-2 text-sm text-nude-200">
            Teste no seu ritmo, no celular, e veja como a conversa muda quando a
            resposta já nasce com valor, acolhimento e CTA.
          </p>
          <Link href={funilHref} className="btn-cta mt-6 px-8 py-4">
            Teste grátis agora e agende mais em minutos <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-brand-100 py-8 text-center text-xs text-muted">
        LeadBellus · Inteligência de conversão para clínicas de estética —
        responda melhor e agende mais pelo WhatsApp.
      </footer>
    </div>
  );
}
