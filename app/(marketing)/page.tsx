import Link from "next/link";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { isFirebaseConfigured } from "@/lib/config";
import { Logo } from "@/components/logo";

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
      <header className="bg-hero">
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
        <section className="mx-auto max-w-4xl px-4 pb-20 pt-10 text-center sm:pt-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-lavender-300 bg-white/70 px-3 py-1 text-xs font-medium text-lavender-700">
            <Sparkles size={14} /> Responda melhor. Agende mais.
          </span>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Pare de perder clientes no WhatsApp por responder do jeito errado.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            Gere respostas estratégicas com IA para quebrar objeções, fazer
            follow-up e transformar dúvidas sobre procedimentos estéticos em
            agendamentos.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={comecarHref}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-base font-medium text-white shadow-soft hover:bg-brand-600"
            >
              Quero responder melhor no WhatsApp <ArrowRight size={18} />
            </Link>
            <span className="text-sm text-muted">
              Sem cartão para testar · pronto em minutos
            </span>
          </div>
        </section>
      </header>

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
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">
              <X size={14} /> Antes
            </div>
            <p className="font-serif text-lg text-ink">“Botox é R$900.”</p>
            <p className="mt-2 text-sm text-muted">
              Resposta seca, sem condução. A cliente compara preço e some.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-lavender-50 p-6">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-600">
              <Check size={14} /> Depois
            </div>
            <p className="text-[15px] leading-relaxed text-ink">
              “Oi, Ana! O investimento pode variar conforme os pontos avaliados e
              o objetivo do tratamento. Você busca suavizar linhas da testa, pés
              de galinha ou prevenir marcas? Assim consigo te orientar melhor e
              ver o melhor caminho para você.”
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
            <Link
              href={comecarHref}
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
              R$297<span className="text-lg font-normal text-muted">/mês</span>
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
              href={comecarHref}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-brand-600"
            >
              Quero o Pro <ArrowRight size={16} />
            </Link>
          </div>

          {/* Premium */}
          <div className="rounded-3xl border border-lavender-200 bg-gradient-to-br from-white to-lavender-50 p-7">
            <p className="text-sm font-medium text-muted">Plano Premium</p>
            <p className="mt-1 font-serif text-4xl font-semibold text-ink">
              R$397<span className="text-lg font-normal text-muted">/mês</span>
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
              href={comecarHref}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-lavender-300 px-4 py-2.5 text-sm font-medium text-lavender-700 hover:bg-lavender-50"
            >
              Quero o Premium <ArrowRight size={16} />
            </Link>
          </div>
        </div>
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

      <footer className="border-t border-brand-100 py-8 text-center text-xs text-muted">
        LeadBellus · Inteligência de conversão para clínicas de estética —
        responda melhor e agende mais pelo WhatsApp.
      </footer>
    </div>
  );
}
