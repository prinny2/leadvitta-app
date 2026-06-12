"use client";

import { useState } from "react";
import Link from "next/link";
import { Suspense } from "react";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  MessageSquareText,
  ShieldCheck,
  BookOpen,
  Clock,
  Target,
  History,
  Brain,
} from "lucide-react";
import { isFirebaseConfigured } from "@/lib/config";
import { PlanCTA } from "@/components/plan-cta";
import { LandingWhatsAppDemo } from "@/components/landing-whatsapp-demo";
import { LoadingRespostas } from "@/components/loading-respostas";

const comecarHref = isFirebaseConfigured ? "/signup" : "/dashboard";

const features = [
  {
    icon: MessageSquareText,
    title: "Gerador de Respostas",
    subtitle: "Você nunca mais vai ficar sem saber o que falar",
    description:
      "Cola a mensagem da cliente, seleciona o que está acontecendo na conversa, e recebe 3 respostas no seu tom — suave, consultiva ou de fechamento. Botox, harmonização, preenchimento, laser, bioestimulador — o sistema conhece cada procedimento e sabe como apresentar o valor sem espantar.",
  },
  {
    icon: Brain,
    title: "Lead Intelligence",
    subtitle: "Você responde primeiro quem tem mais chance de fechar",
    description:
      "Cada mensagem analisada e classificada: Quente, Morna ou Fria. Score de prioridade visível antes de você abrir a conversa. Pare de responder na ordem que chegou — comece a responder na ordem que fecha.",
  },
  {
    icon: BookOpen,
    title: "Biblioteca de Objeções",
    subtitle: 'Aquele "está caro" nunca mais vai te deixar sem resposta',
    description:
      'Mais de 25 respostas prontas para as objeções que mais travam venda na estética: "está caro", "vou pensar", "na outra é mais barato", "faz por menos?", "tem desconto?". Um clique pra copiar. Outro pra adaptar ao seu tom.',
  },
  {
    icon: Clock,
    title: "Follow-up Inteligente",
    subtitle: "A cliente que sumiu há 3 dias ainda pode fechar",
    description:
      "Selecione quanto tempo faz que ela desapareceu e receba 3 mensagens com progressão psicológica — suave no começo, mais direta depois, última tentativa no timing certo. Você reativa sem parecer desesperada. Sem parecer chata.",
  },
  {
    icon: Target,
    title: "Scripts de Atendimento",
    subtitle: 'Do primeiro "oi" ao agendamento — sem improvisar uma única mensagem',
    description:
      "Fluxos completos de 4 a 5 mensagens com indicação de quando mandar cada uma. Cliente nova do Instagram. Cliente que achou caro. Cliente que pediu orçamento e sumiu. O caminho já está traçado — você só segue.",
  },
  {
    icon: Sparkles,
    title: "DNA da Clínica",
    subtitle: "As respostas saem como se você tivesse escrito — porque você ensinou o sistema a falar como você",
    description:
      "Tom de voz, apelido preferido, CTA, procedimentos que você oferece. Configure uma vez. A partir daí, cada resposta sai com a sua personalidade. Suas clientes não vão saber que foi uma ferramenta.",
  },
  {
    icon: History,
    title: "Histórico",
    subtitle: "Sua melhor resposta de hoje vira o padrão de amanhã",
    description:
      "Tudo que você gerou fica salvo com data e contexto. Favorite as que mais funcionaram. Filtre por módulo.",
  },
];

const faqs = [
  {
    q: "As respostas vão soar robóticas?",
    a: "Essa é a pergunta que todo mundo faz — e é exatamente o que o DNA da Clínica resolve. Antes de gerar qualquer resposta, o sistema aprende como você fala, como você chama suas clientes e qual é o seu CTA preferido. O resultado parece você escrevendo com calma e estratégia. Profissionais que usam relatam que as clientes não percebem. Algumas acham que a atendente melhorou.",
  },
  {
    q: "Funciona pra qualquer procedimento estético?",
    a: "Sim. O LeadBellus foi construído especificamente pro mercado estético brasileiro — não adaptado de uma ferramenta genérica. Conhece botox, harmonização facial, preenchimento labial, bioestimulador de colágeno, laser, microagulhamento, limpeza de pele, drenagem linfática, skinbooster e mais. Se é estética no Brasil, o sistema conhece.",
  },
  {
    q: "E se eu não tiver muitas leads ainda?",
    a: "Melhor ainda. Você aprende a usar quando o volume é menor e já está com o sistema rodando quando as leads aumentarem. Cada lead que chegar vai ser tratada da forma certa desde o primeiro dia.",
  },
  {
    q: "Preciso de muito tempo pra configurar?",
    a: "Menos de 5 minutos no primeiro acesso. Depois disso, é só colar a mensagem e clicar em Gerar. A maioria das profissionais gera a primeira resposta em menos de 2 minutos após o cadastro.",
  },
  {
    q: "Funciona pelo celular?",
    a: "Foi feito pensando em quem atende pelo celular. Interface limpa, campos simples, botão de copiar com um toque. Você usa entre um procedimento e outro.",
  },
  {
    q: "Qual a diferença pra usar o ChatGPT?",
    a: 'O ChatGPT não conhece a jornada psicológica da cliente de estética no Brasil. Não sabe que "vou pensar" quase sempre é objeção de preço disfarçada. Não sabe quando autoridade leve converte mais do que acolhimento. O LeadBellus foi treinado nesse contexto específico — e a diferença aparece na resposta.',
  },
  {
    q: "Se eu não gostar, como cancelo?",
    a: "Pelo painel, em um clique. Sem ligação. Sem formulário. Sem prazo de aviso. Cancela hoje, não cobra mais amanhã.",
  },
];

export default function LandingPage() {
  const [billing, setBilling] = useState<"mensal" | "anual">("mensal");

  return (
    <div className="bg-white">

      {/* ── HEADER + HERO ── */}
      <header className="relative overflow-hidden" style={{ background: "#0D1B2E" }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-10 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: "#C9A84C" }} />
          <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full opacity-10 blur-3xl" style={{ background: "#DEC9A0" }} />
        </div>

        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Link href="/">
            <img src="/LEADBELLUS.png" alt="LeadBellus" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-[#DEC9A0] hover:bg-white/10"
            >
              Entrar
            </Link>
            <Link
              href="#planos"
              className="rounded-xl bg-[#DEC9A0] px-4 py-2 text-sm font-semibold text-[#0D1B2E] transition-all hover:opacity-90"
            >
              Começar grátis
            </Link>
          </div>
        </nav>

        <section className="relative mx-auto max-w-4xl px-4 pb-24 pt-12 text-center sm:pt-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
            <Sparkles size={12} /> ✦ A ferramenta que sua clínica perdeu dinheiro sem ter
          </span>

          <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight text-[#DEC9A0] sm:text-6xl">
            Toda semana sua clínica perde dinheiro no WhatsApp por{" "}
            <span className="text-[#C9A84C]">responder do jeito errado.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#DEC9A0]/70">
            O LeadBellus entrega a resposta certa pra cada situação — no seu tom, em segundos, pronta pra copiar e colar. Nenhuma cliente a mais vai sumir por falta de condução.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#planos"
              className="inline-flex items-center gap-2 rounded-xl bg-[#DEC9A0] px-8 py-4 text-base font-semibold text-[#0D1B2E] shadow-lg transition-all hover:scale-105 hover:opacity-90"
            >
              Quero testar grátis por 7 dias <ArrowRight size={18} />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center gap-2 rounded-xl border border-[#DEC9A0]/30 px-8 py-4 text-base font-semibold text-[#DEC9A0] transition-all hover:bg-white/10"
            >
              Ver como funciona
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#DEC9A0]/40">
            Sem cartão · Acesso imediato · Configure e use em menos de 5 minutos
          </p>
        </section>
      </header>

      {/* ── PROBLEMA ── */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
          Onde o dinheiro some todo dia
        </p>
        <h2 className="text-center font-serif text-3xl font-semibold text-[#0D1B2E] sm:text-4xl">
          A cliente pergunta o preço. Você responde. Ela some.
        </h2>

        <div className="mx-auto mt-6 max-w-2xl space-y-4 text-center text-lg leading-relaxed text-slate-500">
          <p>Você não perdeu essa venda por falta de talento. Você não perdeu por causa do preço.</p>
          <p>
            Você perdeu porque{" "}
            <strong className="font-semibold text-[#0D1B2E]">
              a sua formação não incluiu uma aula sobre como vender no WhatsApp
            </strong>{" "}
            — e porque quando você está no meio de um procedimento, cansada ou atendendo outra pessoa, a resposta que sai é a mais rápida, não a mais estratégica.
          </p>
          <p>
            Uma resposta fria, seca ou que joga o preço cedo demais faz a cliente não perceber o valor do que você oferece. Cada cliente que some assim pode valer{" "}
            <strong className="text-[#0D1B2E]">R$800 a R$3.000</strong> que você nunca mais vê.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-bold text-[#0D1B2E]">Você já viveu alguma dessas?</p>
          <ul className="space-y-3">
            {[
              "Deu o valor do botox e a cliente simplesmente parou de responder",
              'A cliente disse "vou pensar" — e nunca mais apareceu',
              '"Na outra clínica é mais barato" — e você ficou sem saber o que responder',
              "Fez orçamento dias atrás, não lembrou de fazer follow-up, perdeu a janela",
              '"Ela ia fechar — eu errei na hora de responder"',
            ].map((d) => (
              <li key={d} className="flex items-start gap-3 text-sm text-slate-500">
                <X size={14} className="mt-0.5 shrink-0 text-red-400" /> {d}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs italic text-slate-400">
            Se você se reconheceu em pelo menos uma, continue lendo.
          </p>
        </div>
      </section>

      {/* ── ANTES / DEPOIS ── */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-red-100 bg-red-50/50 p-8">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-600">
              <X size={14} /> Resposta que faz a cliente sumir
            </div>
            <p className="font-serif text-xl italic text-red-900/70">"Botox é R$900."</p>
            <p className="mt-4 text-sm leading-relaxed text-red-800/60">
              A cliente sente que é só mais um número. Compara com a mais barata. Some. Venda perdida.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg" style={{ background: "linear-gradient(135deg, #0D1B2E 0%, #162440 100%)" }}>
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#C9A84C]/20 blur-2xl" />
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#C9A84C]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#C9A84C]">
              <Check size={14} /> Resposta que agenda
            </div>
            <p className="text-lg font-medium leading-relaxed text-[#DEC9A0]">
              "Oi, Ana! O valor do botox varia conforme os pontos necessários pra atingir o seu objetivo — suavizar linhas da testa, pés de galinha ou prevenir marquinhas. Cada rosto é único. O que você acha de fazermos uma avaliação pra eu te orientar direitinho?"
            </p>
            <p className="mt-4 text-sm font-medium text-[#C9A84C]">
              Resultado: acolhe, gera autoridade e conduz pra avaliação sem falar de preço.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA INTERMEDIÁRIO ── */}
      <section className="py-12 text-center" style={{ background: "#F5F2EE" }}>
        <Link
          href="#planos"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0D1B2E] px-8 py-4 text-base font-semibold text-[#DEC9A0] shadow-lg transition-all hover:scale-105 hover:opacity-90"
        >
          Quero a resposta certa pra cada situação <ArrowRight size={18} />
        </Link>
        <p className="mt-3 text-sm text-slate-500">7 dias grátis · Sem cartão · Você usa hoje mesmo</p>
      </section>

      {/* ── LEAD INTELLIGENCE ── */}
      <section className="py-24" style={{ background: "#0D1B2E" }}>
        <div className="mx-auto max-w-5xl px-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
            ✦ Exclusivo LeadBellus
          </span>
          <h2 className="mt-4 font-serif text-3xl font-semibold text-[#DEC9A0] sm:text-4xl">
            Você tem 20 mensagens no WhatsApp. Uma delas é de uma cliente prestes a fechar. Você sabe qual é?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#DEC9A0]/70">
            A profissional que tem mais agendamentos não é a que responde mais rápido. É a que responde{" "}
            <strong className="text-[#DEC9A0]">as certas primeiro.</strong>
          </p>
          <p className="mx-auto mt-3 max-w-xl text-[#DEC9A0]/60">
            O LeadBellus lê cada conversa e classifica antes de você abrir:
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { emoji: "🔥", label: "Quente", desc: "Quer marcar agora. Responda esta primeiro." },
              { emoji: "🟡", label: "Morna", desc: "Ainda está considerando. Precisa de condução." },
              { emoji: "❄️", label: "Fria", desc: "Sumiu por enquanto. Follow-up no momento exato." },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl p-6 text-center"
                style={{ background: "rgba(222,201,160,0.05)", border: "1px solid rgba(222,201,160,0.1)" }}
              >
                <span className="text-3xl">{item.emoji}</span>
                <p className="mt-3 font-semibold text-[#DEC9A0]">{item.label}</p>
                <p className="mt-1 text-sm text-[#DEC9A0]/60">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm font-medium text-[#C9A84C]">
            Com o score de prioridade visível em cada lead, você para de responder na ordem errada e começa a responder na ordem que fecha.
          </p>
          <p className="mt-2 text-sm text-[#DEC9A0]/40">
            Nenhuma outra ferramenta criada especificamente para o mercado estético brasileiro faz isso.
          </p>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="py-20" style={{ background: "#F5F2EE" }}>
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-semibold text-[#0D1B2E] sm:text-4xl">
              Configure uma vez. Use pra sempre.
            </h2>
            <p className="mt-3 text-slate-500">A resposta certa em menos de 2 minutos.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Ensine o sistema a falar como você",
                sub: "5 minutos — só na primeira vez",
                desc: "Nome da clínica, tom de voz, como você chama suas clientes, qual é o seu CTA. O LeadBellus cria o DNA da sua clínica — todas as respostas saem com a sua personalidade. Não parece IA. Parece você num dia perfeito.",
              },
              {
                num: "02",
                title: "Cole a mensagem e selecione a situação",
                sub: null,
                desc: "Perguntou preço. Achou caro. Sumiu. Medo do procedimento. Em segundos o sistema entende o contexto e sabe o que precisa ser dito.",
              },
              {
                num: "03",
                title: "Escolha a resposta, copie e mande",
                sub: null,
                desc: "Três versões — suave, consultiva e de fechamento. Você escolhe a que faz mais sentido, clica em Copiar e manda direto no WhatsApp. Pronto.",
              },
            ].map((step) => (
              <div key={step.num} className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
                <span className="font-serif text-5xl font-bold text-[#C9A84C]">{step.num}</span>
                <h3 className="mt-4 font-semibold text-[#0D1B2E]">{step.title}</h3>
                {step.sub && (
                  <p className="mt-1 text-xs font-medium italic text-[#C9A84C]">{step.sub}</p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIMULADOR ── */}
      <section id="demo" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-[#0D1B2E]">
            Teste com a sua clínica agora — sem criar conta.
          </h2>
          <p className="mt-3 text-slate-500">
            Coloque o nome, o tom e veja a resposta sair no seu jeito. Em 30 segundos você entende o que o LeadBellus faz — melhor do que qualquer explicação.
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
                className="rounded-full border border-[#0D1B2E]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#0D1B2E] transition-all hover:border-[#0D1B2E] hover:bg-[#0D1B2E] hover:text-[#DEC9A0]"
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

      {/* ── FEATURES ── */}
      <section className="py-20" style={{ background: "#F5F2EE" }}>
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-semibold text-[#0D1B2E] sm:text-4xl">
              Tudo que você precisa pra nunca mais improvisar no WhatsApp
            </h2>
            <p className="mt-3 text-slate-500">
              Cada módulo resolve uma situação específica que te faz perder cliente hoje.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0D1B2E]/5 text-[#0D1B2E]">
                    <f.icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#0D1B2E]">{f.title}</h3>
                    <p className="mt-0.5 text-xs italic text-[#C9A84C]">{f.subtitle}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EARLY ADOPTER ── */}
      <section className="py-24" style={{ background: "#0D1B2E" }}>
        <div className="mx-auto max-w-3xl px-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
            Acesso de Fundadora — Vagas Limitadas
          </span>
          <h2 className="mt-4 font-serif text-3xl font-semibold text-[#DEC9A0] sm:text-4xl">
            Você está entrando antes de todo mundo. Isso tem valor.
          </h2>
          <p className="mt-4 text-lg text-[#DEC9A0]/70">
            As primeiras 100 profissionais que assinarem o LeadBellus entram com{" "}
            <strong className="text-[#DEC9A0]">preço de fundadora garantido para sempre</strong> — mesmo quando os planos subirem no lançamento oficial.
          </p>
          <ul className="mx-auto mt-6 max-w-md space-y-3 text-left">
            {[
              "Acesso prioritário ao Pro assim que lançar — WhatsApp integrado e agendamento online",
              "Canal direto com a equipe pra sugerir o que precisa existir",
              "Preço de hoje garantido enquanto você permanecer assinante",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-[#DEC9A0]/70">
                <Check size={16} className="mt-0.5 shrink-0 text-[#C9A84C]" /> {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm italic text-[#C9A84C]/60">
            O preço de hoje não volta depois do lançamento oficial.
          </p>
          <Link
            href="#planos"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#DEC9A0] px-8 py-4 text-base font-bold text-[#0D1B2E] shadow-lg transition-all hover:scale-105 hover:opacity-90"
          >
            Quero entrar como fundadora <ArrowRight size={18} />
          </Link>
          <p className="mt-3 text-xs text-[#DEC9A0]/30">
            Vagas limitadas · Preço garantido para sempre · Acesso imediato
          </p>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="planos" className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-semibold text-[#0D1B2E] sm:text-4xl">
              Uma cliente recuperada já paga o mês inteiro
            </h2>
            <p className="mt-3 text-slate-500">
              Se uma única cliente que ia sumir fechar um procedimento, o plano já se pagou — e sobra.
            </p>
            <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                onClick={() => setBilling("mensal")}
                className="rounded-full px-6 py-2 text-sm font-medium transition-all"
                style={billing === "mensal" ? { background: "#0D1B2E", color: "#DEC9A0" } : { color: "#64748B" }}
              >
                Mensal
              </button>
              <button
                onClick={() => setBilling("anual")}
                className="rounded-full px-6 py-2 text-sm font-medium transition-all"
                style={billing === "anual" ? { background: "#0D1B2E", color: "#DEC9A0" } : { color: "#64748B" }}
              >
                Anual{" "}
                <span className="ml-1 rounded-full bg-[#C9A84C]/15 px-1.5 py-0.5 text-xs font-bold text-[#C9A84C]">
                  41% off
                </span>
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="relative rounded-3xl p-8 shadow-xl" style={{ background: "#0D1B2E", border: "2px solid #C9A84C" }}>
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#C9A84C] px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#0D1B2E]">
                Disponível agora
              </span>
              <p className="text-sm font-medium text-[#DEC9A0]/60">Plano Start</p>
              {billing === "mensal" ? (
                <>
                  <p className="mt-1 font-serif text-4xl font-bold text-[#DEC9A0]">
                    R$97<span className="text-lg font-normal text-[#DEC9A0]/40">/mês</span>
                  </p>
                  <p className="mt-1 text-sm text-[#DEC9A0]/40">Cobrança mensal</p>
                </>
              ) : (
                <>
                  <p className="mt-1 font-serif text-4xl font-bold text-[#DEC9A0]">
                    R$57<span className="text-lg font-normal text-[#DEC9A0]/40">/mês</span>
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#C9A84C]">R$684/ano · Economia de R$480</p>
                </>
              )}
              <p className="mt-2 text-xs text-[#DEC9A0]/40">
                Pra profissional solo que quer parar de perder cliente no WhatsApp
              </p>
              <ul className="mt-5 space-y-2">
                {[
                  "Gerador de Respostas ilimitado",
                  "Lead Intelligence — score de prioridade",
                  "Biblioteca de Objeções completa",
                  "Follow-up Inteligente",
                  "Scripts de Atendimento com timing",
                  "DNA da Clínica",
                  "Histórico",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#DEC9A0]/80">
                    <Check size={14} className="shrink-0 text-[#C9A84C]" /> {f}
                  </li>
                ))}
              </ul>
              <PlanCTA
                plan="start"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#DEC9A0] px-4 py-3 text-sm font-bold text-[#0D1B2E] transition-all hover:opacity-90 disabled:opacity-60"
              >
                Começar grátis por 7 dias
              </PlanCTA>
              <p className="mt-2 text-center text-xs text-[#DEC9A0]/30">Sem cartão · Cancele quando quiser</p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-8 opacity-70">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400">
                🔒 Em breve
              </span>
              <p className="mt-3 text-sm font-medium text-slate-400">Plano Pro</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-slate-300">Em breve</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                WhatsApp integrado · Resposta automática 24h · Agendamento online · Lembrete automático · 3 usuárias
              </p>
              <div className="mt-6 space-y-2">
                <input type="email" placeholder="Seu e-mail para ser avisada" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0D1B2E]" />
                <button className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50">
                  Quero ser avisada quando lançar
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-8 opacity-70">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400">
                🔒 Em breve
              </span>
              <p className="mt-3 text-sm font-medium text-slate-400">Plano Premium</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-slate-300">Em breve</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Tudo do Pro · Pós-atendimento automatizado · Relatórios de conversão · 10 usuárias
              </p>
              <div className="mt-6 space-y-2">
                <input type="email" placeholder="Seu e-mail para ser avisada" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0D1B2E]" />
                <button className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50">
                  Quero ser avisada quando lançar
                </button>
              </div>
            </div>
          </div>
          <p className="mt-5 text-center text-xs text-slate-400">Cancele quando quiser · Sem multa · Sem burocracia</p>
        </div>
      </section>

      {/* ── GARANTIA ── */}
      <section className="py-20" style={{ background: "#F5F2EE" }}>
        <div className="mx-auto max-w-2xl px-4 text-center">
          <ShieldCheck size={44} className="mx-auto text-[#C9A84C]" />
          <h2 className="mt-4 font-serif text-3xl font-semibold text-[#0D1B2E]">
            Simples assim: só paga se usar.
          </h2>
          <p className="mt-4 text-slate-500">
            Teste grátis por 7 dias — sem colocar cartão, sem compromisso. Explore tudo, gere respostas, use no seu WhatsApp real.
          </p>
          <p className="mt-3 text-slate-500">
            Depois do trial, você decide. Se assinar e quiser cancelar, cancela pelo painel em um clique. Para de usar, para de pagar. Sem multa, sem ligação, sem formulário.
          </p>
          <div className="mt-6 rounded-2xl border border-[#0D1B2E]/10 bg-white p-4 text-sm text-[#0D1B2E]">
            <ShieldCheck size={15} className="mb-1 inline text-[#C9A84C]" />{" "}
            E por lei, você ainda tem{" "}
            <strong>7 dias de garantia após a primeira cobrança</strong> para solicitar reembolso total — direito garantido pelo Código de Defesa do Consumidor (Art. 49) para compras realizadas online.
          </div>
          <p className="mt-4 text-sm italic text-slate-400">
            Você testa grátis, assina só se quiser, e ainda tem 7 dias para mudar de ideia. Risco zero.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center font-serif text-3xl font-semibold text-[#0D1B2E]">
            Perguntas frequentes
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-slate-100 bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-sm font-semibold text-[#0D1B2E]">
                  {faq.q}
                  <span className="ml-4 shrink-0 text-xl text-[#C9A84C] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-6 pb-5 text-sm leading-relaxed text-slate-500">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 text-center" style={{ background: "#0D1B2E" }}>
        <div className="mx-auto max-w-2xl px-4">
          <MessageSquareText size={36} className="mx-auto text-[#C9A84C]" />
          <h2 className="mt-4 font-serif text-3xl font-semibold text-[#DEC9A0] sm:text-4xl">
            Cada semana sem o LeadBellus é uma semana respondendo no improviso.
          </h2>
          <p className="mt-4 text-sm leading-loose text-[#DEC9A0]/60">
            Mais uma semana de "vou pensar" sem follow-up.<br />
            Mais uma semana de preço jogado cedo demais.<br />
            Mais uma cliente que foi pra concorrente porque a resposta foi fria.
          </p>
          <div className="mx-auto mt-6 max-w-sm rounded-2xl p-5" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>
            <p className="text-[#DEC9A0]">Você paga <strong className="text-[#C9A84C]">R$97/mês</strong>.</p>
            <p className="mt-1 text-sm text-[#DEC9A0]/60">Um único procedimento de harmonização paga 19 meses de assinatura.</p>
          </div>
          <p className="mt-4 text-sm italic text-[#DEC9A0]/40">
            O risco de testar é zero. O custo de não testar você já conhece — está sentindo toda semana.
          </p>
          <Link
            href="#planos"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#DEC9A0] px-10 py-4 text-base font-bold text-[#0D1B2E] shadow-xl transition-all hover:scale-105 hover:opacity-90"
          >
            Quero minha clínica respondendo melhor agora <ArrowRight size={18} />
          </Link>
          <p className="mt-3 text-xs text-[#DEC9A0]/30">7 dias grátis · Sem cartão · Acesso em menos de 2 minutos</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 py-12 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-3 md:text-left">
            <div className="space-y-3">
              <Link href="/">
                <img src="/LEADBELLUS.png" alt="LeadBellus" className="h-8 w-auto" />
              </Link>
              <p className="text-balance">
                Inteligência de conversão para clínicas de estética — responda melhor e agende mais pelo WhatsApp.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#0D1B2E]">Contato</h4>
              <p>Av. Rômulo Maiorana, 1695, Marco<br />Belém - PA, 66093-674</p>
              <p>WhatsApp: +55 91 8515-6690</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#0D1B2E]">Horário</h4>
              <p>Segunda a Sábado: 24h (IA ativa)</p>
              <p>© 2026 LeadBellus · VPS Automações</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
