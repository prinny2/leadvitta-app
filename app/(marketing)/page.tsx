"use client";

import { useState } from "react";
import Link from "next/link";
import { Suspense } from "react";
import {
  Check, X, Sparkles, ArrowRight, MessageSquareText,
  BookOpen, Clock, Target, History, Brain, Zap, MessageCircle,
  BarChart2, Bell, Mail, MapPin, Heart, Send, TrendingUp, Calendar,
  Gift, Copy, Home, Settings, Users, Flame, Snowflake, Moon,
  Shield, CreditCard, Globe,
} from "lucide-react";
import { isFirebaseConfigured } from "@/lib/config";
import { PlanCTA } from "@/components/plan-cta";
import { LandingWhatsAppDemo } from "@/components/landing-whatsapp-demo";
import { LoadingRespostas } from "@/components/loading-respostas";

const comecarHref = isFirebaseConfigured ? "/signup" : "/dashboard";

const features = [
  { icon: MessageCircle, title: "Gerador de Respostas", subtitle: "Você nunca mais vai ficar sem saber o que falar", description: "Cola a mensagem da cliente, seleciona o que está acontecendo na conversa, e recebe 3 respostas no seu tom — suave, consultiva ou de fechamento. Botox, harmonização, preenchimento, laser, bioestimulador — o sistema conhece cada procedimento e sabe como apresentar o valor sem espantar.", highlight: true },
  { icon: Brain, title: "Lead Intelligence", subtitle: "Você responde primeiro quem tem mais chance de fechar", description: "Cada mensagem analisada e classificada: Quente, Morna ou Fria. Score de prioridade visível antes de você abrir a conversa. Pare de responder na ordem que chegou — comece a responder na ordem que fecha." },
  { icon: BookOpen, title: "Biblioteca de Objeções", subtitle: 'Aquele "está caro" nunca mais vai te deixar sem resposta', description: 'Mais de 25 respostas prontas para as objeções que mais travam venda na estética: "está caro", "vou pensar", "na outra é mais barato". Um clique pra copiar. Outro pra adaptar ao seu tom.' },
  { icon: Clock, title: "Follow-up Inteligente", subtitle: "A cliente que sumiu há 3 dias ainda pode fechar", description: "Selecione quanto tempo faz que ela desapareceu e receba 3 mensagens com progressão psicológica — suave no começo, mais direta depois, última tentativa no timing certo. Você reativa sem parecer desesperada." },
  { icon: Target, title: "Scripts de Atendimento", subtitle: 'Do primeiro "oi" ao agendamento — sem improvisar', description: "Fluxos completos de 4 a 5 mensagens com indicação de quando mandar cada uma. O caminho já está traçado — você só segue." },
  { icon: Sparkles, title: "DNA da Clínica", subtitle: "As respostas saem como se você tivesse escrito", description: "Tom de voz, apelido preferido, CTA, procedimentos que você oferece. Configure uma vez. Suas clientes não vão saber que foi uma ferramenta." },
  { icon: History, title: "Histórico", subtitle: "Sua melhor resposta de hoje vira o padrão de amanhã", description: "Tudo que você gerou fica salvo com data e contexto. Favorite as que mais funcionaram. Filtre por módulo." },
];

const faqs = [
  { icon: MessageCircle, q: "As respostas vão soar robóticas?", a: "Essa é a pergunta que todo mundo faz — e é exatamente o que o DNA da Clínica resolve. Antes de gerar qualquer resposta, o sistema aprende como você fala, como você chama suas clientes e qual é o seu CTA preferido. O resultado parece você escrevendo com calma e estratégia. Profissionais que usam relatam que as clientes não percebem. Algumas acham que a atendente melhorou." },
  { icon: Target, q: "Funciona pra qualquer procedimento estético?", a: "Sim. O LeadBellus foi construído especificamente pro mercado estético brasileiro. Conhece botox, harmonização facial, preenchimento labial, bioestimulador, laser, microagulhamento, limpeza de pele, drenagem linfática, skinbooster e mais." },
  { icon: TrendingUp, q: "E se eu não tiver muitas leads ainda?", a: "Melhor ainda. Você aprende a usar quando o volume é menor e já está com o sistema rodando quando as leads aumentarem. Cada lead que chegar vai ser tratada da forma certa desde o primeiro dia." },
  { icon: Clock, q: "Preciso de muito tempo pra configurar?", a: "Menos de 5 minutos no primeiro acesso. A maioria das profissionais gera a primeira resposta em menos de 2 minutos após o cadastro." },
  { icon: MessageSquareText, q: "Funciona pelo celular?", a: "Foi feito pensando em quem atende pelo celular. Interface limpa, campos simples, botão de copiar com um toque. Você usa entre um procedimento e outro." },
  { icon: Brain, q: "Qual a diferença pra usar o ChatGPT?", a: 'O ChatGPT não conhece a jornada psicológica da cliente de estética no Brasil. Não sabe que "vou pensar" quase sempre é objeção de preço disfarçada. O LeadBellus foi treinado nesse contexto específico.' },
  { icon: Shield, q: "Se eu não gostar, como cancelo?", a: "Pelo painel, em um clique. Sem ligação. Sem formulário. Sem prazo de aviso. Cancela hoje, não cobra mais amanhã." },
];

export default function LandingPage() {
  const [billing, setBilling] = useState<"mensal" | "anual">("mensal");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <header className="relative overflow-hidden" style={{ background: "#0D1B2E" }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-0 h-96 w-96 -translate-x-1/2 rounded-full opacity-15 blur-3xl" style={{ background: "#C9A84C" }} />
          <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full opacity-10 blur-3xl" style={{ background: "#C9A84C" }} />
        </div>

        <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/"><img src="/LEADBELLUS.png" alt="LeadBellus" className="h-9 w-auto" /></Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm text-white/50 hover:text-[#DEC9A0] transition-colors">Recursos</Link>
            <Link href="#como-funciona" className="text-sm text-white/50 hover:text-[#DEC9A0] transition-colors">Como funciona</Link>
            <Link href="#planos" className="text-sm text-white/50 hover:text-[#DEC9A0] transition-colors">Preços</Link>
            <Link href="/login" className="text-sm text-white/50 hover:text-[#DEC9A0] transition-colors">Entrar</Link>
          </div>
          <Link href="#planos" className="rounded-full bg-[#C9A84C] px-5 py-2 text-sm font-bold text-[#0D1B2E] hover:opacity-90 transition-all">
            Começar grátis
          </Link>
        </nav>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 pb-16 pt-8 lg:grid-cols-2 lg:items-center lg:pb-24">
          {/* Left */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-4 py-1.5 text-xs font-medium text-[#C9A84C]">
              <Sparkles size={11} /> A ferramenta que sua clínica precisava para vender mais no WhatsApp
            </span>
            <h1 className="mt-6 font-serif text-4xl font-bold leading-tight text-[#DEC9A0] sm:text-5xl lg:text-6xl">
              Toda semana sua clínica perde dinheiro no WhatsApp por{" "}
              <span className="text-[#C9A84C]">responder do jeito errado.</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/60 lg:text-lg">
              O LeadBellus entrega a resposta certa pra cada situação — no seu tom, em segundos, pronta pra copiar e colar. Nenhuma cliente a mais vai sumir por falta de condução.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#planos" className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-7 py-3.5 text-sm font-bold text-[#0D1B2E] shadow-lg hover:scale-105 hover:opacity-90 transition-all">
                Quero testar grátis por 7 dias <ArrowRight size={16} />
              </Link>
              <Link href="#demo" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/80 hover:border-white/40 hover:bg-white/5 transition-all">
                Ver como funciona
              </Link>
            </div>
            <p className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1"><CreditCard size={12} /> Sem cartão</span>
              <span className="flex items-center gap-1"><Zap size={12} /> Acesso imediato</span>
              <span className="flex items-center gap-1"><Clock size={12} /> Configure em menos de 5 minutos</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {[
                { icon: MessageCircle, label: "Respostas estratégicas" },
                { icon: TrendingUp, label: "Follow-ups inteligentes" },
                { icon: Shield, label: "Objeções respondidas" },
                { icon: Calendar, label: "Mais agendamentos" },
              ].map((pill) => (
                <div key={pill.label} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                  <pill.icon size={13} className="text-[#C9A84C]" /> {pill.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right — App mockup */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 rounded-3xl opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #C9A84C, transparent)" }} />
            <div className="relative z-10 overflow-hidden rounded-2xl border border-[#C9A84C]/20 shadow-2xl" style={{ background: "#111827" }}>
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <img src="/LEADBELLUS.png" alt="" className="h-5 w-auto" />
                  <span className="text-sm font-bold text-[#C9A84C]">LeadBellus</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/40">
                  <span>Clínica Beleza & Harmonia</span>
                  <Bell size={13} />
                </div>
              </div>
              <div className="flex" style={{ minHeight: 280 }}>
                <div className="w-28 border-r border-white/10 p-3 space-y-0.5">
                  {[
                    { icon: Home, label: "Início" },
                    { icon: MessageCircle, label: "Conversas", active: true },
                    { icon: Send, label: "Respostas" },
                    { icon: Users, label: "Clientes" },
                    { icon: BarChart2, label: "Relatórios" },
                    { icon: Settings, label: "Config." },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs ${item.active ? "bg-[#C9A84C]/20 text-[#C9A84C] font-medium" : "text-white/40"}`}>
                      <item.icon size={11} /> {item.label}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-3">
                  <div className="mb-2 text-xs font-semibold text-white/40">Conversa · WhatsApp</div>
                  <div className="rounded-xl bg-white/5 p-3 mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-7 w-7 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-xs font-bold text-[#C9A84C]">J</div>
                      <div>
                        <div className="text-xs font-semibold text-white">Juliana Ferreira</div>
                        <div className="text-xs text-green-400">Online</div>
                      </div>
                    </div>
                    <p className="text-xs text-white/70">"Olá! Tenho interesse em fazer harmonização facial. Como funciona e qual o valor?"</p>
                    <div className="text-right text-xs text-white/30 mt-1">10:42</div>
                  </div>
                  <div className="rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/5 p-3">
                    <div className="text-xs font-semibold text-[#C9A84C] mb-1.5 flex items-center gap-1"><Sparkles size={9} /> Resposta sugerida pelo LeadBellus</div>
                    <p className="text-xs text-white/75 leading-relaxed">"Olá, Juliana! Que ótimo ter você aqui 💛 A harmonização realça sua beleza de forma natural. Para te orientar melhor, qual é o seu principal objetivo com o tratamento?"</p>
                    <button className="mt-2 w-full rounded-lg bg-[#C9A84C] py-1 text-xs font-bold text-[#0D1B2E] flex items-center justify-center gap-1">
                      <Copy size={9} /> Copiar resposta
                    </button>
                  </div>
                </div>
                <div className="w-36 border-l border-white/10 p-3 space-y-3">
                  <div className="text-xs font-semibold text-white/40">Contexto</div>
                  <div><div className="text-xs text-white/30 mb-0.5">Funil</div><div className="text-xs text-[#C9A84C] font-medium">Interesse</div></div>
                  <div><div className="text-xs text-white/30 mb-0.5">Origem</div><div className="text-xs text-white/60">Instagram</div></div>
                  <div><div className="text-xs text-white/30 mb-1">Tags</div><span className="inline-block rounded-md bg-[#C9A84C]/20 px-2 py-0.5 text-xs text-[#C9A84C]">Harmonização</span></div>
                  <div className="mt-4 space-y-2">
                    <div className="text-xs font-semibold text-white/40">Histórico</div>
                    <div className="text-xs text-white/40">● Perguntou preços</div>
                    <div className="text-xs text-white/30">● Solicitou infos</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 top-4 space-y-2 z-20">
              {[
                { icon: Send, label: "Respostas enviadas", value: "1.248", delta: "+28%" },
                { icon: TrendingUp, label: "Taxa de conversão", value: "32,7%", delta: "+9%" },
                { icon: Calendar, label: "Agendamentos", value: "89", delta: "+31%" },
              ].map((s) => (
                <div key={s.label} className="w-40 rounded-xl border border-[#C9A84C]/20 p-3 shadow-xl" style={{ background: "rgba(13,27,46,0.95)" }}>
                  <div className="text-xs text-white/40">{s.label}</div>
                  <div className="mt-0.5 text-lg font-bold text-white">{s.value}</div>
                  <div className="text-xs text-green-400">{s.delta} vs semana anterior</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── PROBLEMA ── */}
      <section style={{ background: "#FAF7F2" }} className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px w-8 bg-[#C9A84C]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">Onde o dinheiro some todo dia</span>
          </div>
          <div className="grid gap-12 lg:grid-cols-3 lg:items-start">
            {/* Left */}
            <div>
              <h2 className="font-serif text-4xl font-bold leading-tight text-[#0D1B2E]">
                A cliente pergunta o preço. Você responde. Ela <span className="text-[#C9A84C] italic">some.</span>
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-500">
                <p>Você não perdeu essa venda por falta de talento. Você não perdeu por causa do preço.</p>
                <p>Você perdeu porque <strong className="text-[#0D1B2E]">a sua formação não incluiu uma aula sobre como vender no WhatsApp</strong> — e porque quando você está no meio de um procedimento, cansada ou atendendo outra pessoa, a resposta que sai é a mais rápida, não a mais estratégica.</p>
                <div className="h-px bg-[#C9A84C]/20" />
                <p>Uma resposta fria, seca ou que joga o preço cedo demais faz a cliente não perceber o valor do que você oferece. Cada cliente que some assim pode valer <span className="text-2xl font-bold text-[#C9A84C]">R$800 a R$3.000</span> que você nunca mais vê.</p>
              </div>
              <div className="mt-6 rounded-2xl p-5" style={{ background: "#0D1B2E" }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C]/20">
                    <TrendingUp size={18} className="text-[#C9A84C]" />
                  </div>
                  <div>
                    <div className="text-xs text-white/50">Dinheiro que escapa todos os dias</div>
                    <div className="text-lg font-bold text-[#C9A84C]">R$800 a R$3.000</div>
                    <div className="text-xs text-white/50">por cada cliente que some.</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Middle */}
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C]/10">
                  <MessageCircle size={18} className="text-[#C9A84C]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#0D1B2E]">Você já viveu alguma dessas?</h3>
                  <div className="mt-0.5 h-0.5 w-8 bg-[#C9A84C]" />
                </div>
              </div>
              <ul className="space-y-4">
                {[
                  "Deu o valor do botox e a cliente simplesmente parou de responder",
                  'A cliente disse "vou pensar" — e nunca mais apareceu',
                  '"Na outra clínica é mais barato" — e você ficou sem saber o que responder',
                  "Fez orçamento dias atrás, não lembrou de fazer follow-up, perdeu a janela",
                  '"Ela ia fechar — eu errei na hora de responder"',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <X size={14} className="mt-0.5 shrink-0 text-red-400" /> {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-3 flex items-start gap-2">
                <span className="text-amber-500 text-xs mt-0.5">ℹ</span>
                <p className="text-xs text-slate-500">Se você se reconheceu em pelo menos uma, continue lendo.</p>
              </div>
            </div>
            {/* Right */}
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 bg-slate-50">
                  <div className="h-8 w-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-xs font-bold text-[#C9A84C]">C</div>
                  <div>
                    <div className="text-xs font-semibold text-[#0D1B2E]">Cliente</div>
                    <div className="text-xs text-green-500">online</div>
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex justify-start">
                    <div className="max-w-xs rounded-xl rounded-tl-none bg-slate-100 px-3 py-2 text-xs text-slate-700">
                      Olá! Tenho interesse no preenchimento labial. Quanto fica?
                      <div className="text-right text-xs text-slate-400 mt-0.5">10:42</div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-xs rounded-xl rounded-tr-none px-3 py-2 text-xs text-white" style={{ background: "#128C7E" }}>
                      O valor é R$1.500.
                      <div className="text-right text-xs text-green-200 mt-0.5">10:43 ✓✓</div>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-xs rounded-xl rounded-tl-none bg-slate-100 px-3 py-2 text-xs text-slate-700">
                      Vou pensar e te aviso.
                      <div className="text-right text-xs text-slate-400 mt-0.5">10:44</div>
                    </div>
                  </div>
                  <div className="text-center text-xs text-slate-400 italic">Última visualização hoje às 10:44</div>
                </div>
              </div>
              <div className="rounded-2xl p-5" style={{ background: "#0D1B2E" }}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C9A84C]/20 text-xl">💰</div>
                  <div>
                    <p className="text-sm text-white/70">Cada cliente que some pode representar</p>
                    <p className="text-xl font-bold text-[#C9A84C]">R$800 a R$3.000</p>
                    <p className="text-sm text-white/70">perdidos da sua clínica.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ANTES / DEPOIS ── */}
      <section style={{ background: "#0D1B2E" }} className="py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full opacity-10 blur-3xl" style={{ background: "#C9A84C" }} />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
            <Sparkles size={10} /> Exemplo prático
          </span>
          <h2 className="mt-5 font-serif text-3xl font-bold text-[#DEC9A0] sm:text-5xl">A diferença entre responder e conduzir.</h2>
          <p className="mt-3 text-white/50">Uma resposta joga preço. A outra gera valor, acolhe e aumenta a chance de agendamento.</p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 text-left">
            <div className="rounded-3xl border border-red-900/30 p-8" style={{ background: "rgba(255,100,100,0.05)" }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
                <X size={12} /> Resposta que faz a cliente sumir
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xl">😞</div>
                <div className="flex-1 rounded-xl rounded-tl-none bg-white/10 p-4">
                  <p className="text-xl font-medium italic text-white/60">"Botox é R$900."</p>
                  <div className="text-right text-xs text-white/30 mt-1">10:42 ✓</div>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-red-300/70">A cliente sente que é só mais um número. Compara com a mais barata. Some. Venda perdida.</p>
            </div>
            <div className="rounded-3xl border border-[#C9A84C]/30 p-8" style={{ background: "rgba(201,168,76,0.05)" }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#C9A84C]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#C9A84C]">
                <Check size={12} /> Resposta que agenda
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/20">
                  <img src="/LEADBELLUS.png" alt="" className="h-6 w-auto" />
                </div>
                <div className="flex-1 rounded-xl rounded-tl-none border border-[#C9A84C]/20 bg-white/5 p-4">
                  <p className="text-sm leading-relaxed text-[#DEC9A0]">"Oi, Ana! O valor do botox varia conforme os pontos necessários pra atingir o seu objetivo — suavizar linhas da testa, pés de galinha ou prevenir marquinhas. Cada rosto é único. O que você acha de fazermos uma avaliação pra eu te orientar direitinho?"</p>
                  <div className="text-right text-xs text-white/30 mt-1">10:42 ✓✓</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-[#C9A84C]/70">
                <Sparkles size={12} /> Resultado: acolhe, gera autoridade e conduz pra avaliação sem falar de preço.
              </div>
            </div>
          </div>
          <div className="mt-12">
            <Link href="#planos" className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-8 py-4 text-base font-bold text-[#0D1B2E] shadow-lg hover:scale-105 hover:opacity-90 transition-all">
              Quero a resposta certa pra cada situação <ArrowRight size={18} />
            </Link>
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-white/30">
              <Shield size={12} /> 7 dias grátis · Sem cartão · Você usa hoje mesmo
            </p>
          </div>
        </div>
      </section>

      {/* ── LEAD INTELLIGENCE ── */}
      <section style={{ background: "#060E1A" }} className="py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-0 h-32 w-full opacity-20" style={{ background: "linear-gradient(to top, #C9A84C20, transparent)" }} />
          {[
            { top: "15%", left: "8%", op: 0.3 },
            { top: "35%", left: "88%", op: 0.2 },
            { top: "65%", left: "15%", op: 0.15 },
            { top: "55%", left: "65%", op: 0.25 },
            { top: "80%", left: "78%", op: 0.2 },
            { top: "10%", left: "48%", op: 0.1 },
          ].map((s, i) => (
            <div key={i} className="absolute h-1 w-1 rounded-full bg-[#C9A84C]" style={{ top: s.top, left: s.left, opacity: s.op }} />
          ))}
        </div>
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
            ✦ Exclusivo LeadBellus
          </span>
          <h2 className="mt-5 font-serif text-3xl font-bold leading-tight text-[#DEC9A0] sm:text-5xl">
            Você tem 20 mensagens no WhatsApp.<br />
            Uma delas é de uma cliente prestes a fechar.<br />
            <span className="text-[#C9A84C]">Você sabe qual é?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base text-white/60">
            A profissional que tem mais agendamentos não é a que responde mais rápido. É a que responde <strong className="text-white">as certas primeiro.</strong>
          </p>
          <div className="mx-auto mt-2 h-px w-16 bg-[#C9A84C]/40" />
          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-[#C9A84C]/60">Score de prioridade</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Flame, label: "Quente", desc: "Quer marcar agora. Responda esta primeiro.", color: "#FF6B35", bg: "rgba(255,107,53,0.08)", border: "rgba(255,107,53,0.2)" },
              { icon: Moon, label: "Morna", desc: "Ainda está considerando. Precisa de condução.", color: "#C9A84C", bg: "rgba(201,168,76,0.08)", border: "rgba(201,168,76,0.2)" },
              { icon: Snowflake, label: "Fria", desc: "Sumiu por enquanto. Follow-up no momento exato.", color: "#60A5FA", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl p-6 text-left" style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-1 w-1 rounded-full" style={{ background: item.color }} />
                  <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: `${item.color}20` }}>
                    <item.icon size={22} style={{ color: item.color }} />
                  </div>
                </div>
                <p className="font-serif text-xl font-bold" style={{ color: item.color }}>{item.label}</p>
                <div className="mt-1 h-0.5 w-6" style={{ background: item.color }} />
                <p className="mt-3 text-sm leading-relaxed text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-5 text-left">
            <img src="/LEADBELLUS.png" alt="" className="h-10 w-10 shrink-0 object-contain" />
            <div>
              <p className="text-sm font-semibold text-[#C9A84C]">Com o score de prioridade visível em cada lead, você para de responder na ordem errada e começa a responder na ordem que fecha.</p>
              <p className="mt-1 text-xs text-white/40">Nenhuma outra ferramenta criada especificamente para o mercado estético brasileiro faz isso.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" style={{ background: "#FAF7F2" }} className="py-24 relative overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#0D1B2E" }}>
              <img src="/LEADBELLUS.png" alt="" className="h-9 w-auto" />
            </div>
          </div>
          <h2 className="font-serif text-4xl font-bold text-[#0D1B2E] sm:text-5xl">
            Configure <em className="text-[#C9A84C]">uma vez</em>. Use <em className="text-[#C9A84C]">pra sempre</em>.
          </h2>
          <p className="mt-3 text-slate-500">A resposta certa em menos de 2 minutos.</p>
          <div className="mt-2 flex justify-center"><div className="h-px w-8 bg-[#C9A84C]" /></div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { num: "01", icon: Brain, title: "Ensine o sistema a falar como você", sub: "5 minutos — só na primeira vez", desc: "Nome da clínica, tom de voz, como você chama suas clientes, qual é o seu CTA. O LeadBellus cria o DNA da sua clínica — todas as respostas saem com a sua personalidade. Não parece IA. Parece você num dia perfeito." },
              { num: "02", icon: MessageCircle, title: "Cole a mensagem e selecione a situação", sub: null, desc: "Perguntou preço. Achou caro. Sumiu. Medo do procedimento. Veio do Instagram. Em segundos o sistema entende o contexto e sabe o que precisa ser dito." },
              { num: "03", icon: Copy, title: "Escolha a resposta, copie e mande", sub: null, desc: "Três versões — suave, consultiva e de fechamento. Você escolhe a que faz mais sentido, clica em Copiar e manda direto no WhatsApp. Pronto." },
            ].map((step, i) => (
              <div key={step.num} className="relative rounded-3xl border border-[#C9A84C]/20 bg-white p-8 shadow-sm text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#C9A84C]/20 bg-[#FAF7F2]">
                  <step.icon size={24} className="text-[#C9A84C]" />
                </div>
                <div className="text-sm font-bold text-[#C9A84C]">· {step.num} ·</div>
                <h3 className="mt-2 font-serif text-lg font-bold text-[#0D1B2E]">{step.title}</h3>
                {step.sub && <p className="mt-1 text-xs italic text-[#C9A84C]">{step.sub}</p>}
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{step.desc}</p>
                {i < 2 && (
                  <div className="absolute -right-3 top-16 z-10 hidden md:flex h-6 w-6 items-center justify-center rounded-full bg-[#C9A84C]/20">
                    <ArrowRight size={12} className="text-[#C9A84C]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIMULADOR ── */}
      <section id="demo" style={{ background: "#FAF7F2" }} className="pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
              ● Demonstração ao vivo
            </span>
            <h2 className="mt-4 font-serif text-3xl font-bold text-[#0D1B2E] sm:text-4xl">
              Teste com a sua clínica agora — <span className="text-[#C9A84C]">sem criar conta.</span>
            </h2>
            <p className="mt-3 text-slate-500">Coloque o nome, o tom e veja a resposta sair no seu jeito. Em segundos, a LeadBellus entende o contexto e escreve como sua clínica falaria.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {[
                { id: "preco", label: "Perguntou preço" },
                { id: "achou_caro", label: "Achou caro" },
                { id: "sumiu", label: "Sumiu" },
                { id: "medo", label: "Medo do procedimento" },
              ].map((d) => (
                <Link key={d.id} href={`/?demo=${d.id}#demo`} className="inline-flex items-center gap-1.5 rounded-full border border-[#0D1B2E]/15 bg-white px-4 py-2 text-xs font-semibold text-[#0D1B2E] hover:border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0D1B2E] transition-all">
                  {d.label}
                </Link>
              ))}
            </div>
          </div>
          <Suspense fallback={<LoadingRespostas mensagem="Carregando a demo…" />}>
            <LandingWhatsAppDemo />
          </Suspense>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background: "#FAF7F2" }} className="pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
              <Sparkles size={10} /> Módulos LeadBellus
            </span>
            <h2 className="mt-4 font-serif text-3xl font-bold text-[#0D1B2E] sm:text-4xl">Tudo que você precisa pra nunca mais improvisar no WhatsApp</h2>
            <p className="mt-3 text-slate-500">Cada módulo resolve uma situação específica que te faz perder cliente hoje.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className={`rounded-2xl border bg-white p-6 ${f.highlight ? "border-[#C9A84C]/30 shadow-md" : "border-slate-100 shadow-sm"}`}>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: "#0D1B2E" }}>
                    <f.icon size={20} className="text-[#C9A84C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-base font-bold text-[#0D1B2E]">{f.title}</h3>
                      {f.highlight && <span className="shrink-0 rounded-full bg-[#C9A84C] px-2 py-0.5 text-xs font-bold text-[#0D1B2E]">DESTAQUE</span>}
                    </div>
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
      <section style={{ background: "#060E1A" }} className="py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-8 rounded-3xl border border-[#C9A84C]/10" />
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full opacity-10 blur-3xl" style={{ background: "#C9A84C" }} />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[18rem] font-bold text-white opacity-[0.02] select-none leading-none">B</div>
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
            💎 Acesso de Fundadora — Vagas Limitadas
          </span>
          <h2 className="mt-6 font-serif text-4xl font-bold leading-tight text-[#DEC9A0] sm:text-5xl">
            Você está entrando antes de todo mundo.<br /><em className="text-[#C9A84C]">Isso tem valor.</em>
          </h2>
          <div className="mt-3 mx-auto h-px w-8 bg-[#C9A84C]/40" />
          <p className="mx-auto mt-5 max-w-xl text-base text-white/60">
            As primeiras 100 profissionais que assinarem o LeadBellus entram com <strong className="text-white">preço de fundadora garantido para sempre</strong> — mesmo quando os planos subirem no lançamento oficial.
          </p>
          <ul className="mx-auto mt-8 max-w-lg space-y-3 text-left">
            {[
              "Acesso prioritário ao Pro assim que lancar — WhatsApp integrado e agendamento online",
              "Canal direto com a equipe pra sugerir o que precisa existir",
              "Preço de hoje garantido enquanto você permanecer assinante",
            ].map((item) => (
              <li key={item} className="flex items-start gap-4 rounded-xl border border-white/10 p-4 text-sm text-white/70">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#C9A84C]/40">
                  <Check size={12} className="text-[#C9A84C]" />
                </div>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm italic text-[#C9A84C]/60">✦ O preço de hoje não volta depois do lançamento oficial.</p>
          <Link href="#planos" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-8 py-4 text-base font-bold text-[#0D1B2E] shadow-lg hover:scale-105 hover:opacity-90 transition-all">
            Quero entrar como fundadora <ArrowRight size={18} />
          </Link>
          <p className="mt-3 text-xs text-white/30">Vagas limitadas · Preço garantido para sempre · Acesso imediato</p>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="planos" style={{ background: "#0D1B2E" }} className="py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 top-0 h-80 w-80 rounded-full opacity-10 blur-3xl" style={{ background: "#C9A84C" }} />
          <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full opacity-5 blur-3xl" style={{ background: "#C9A84C" }} />
        </div>
        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold text-[#DEC9A0] sm:text-5xl">Uma cliente recuperada já paga o mês inteiro</h2>
            <p className="mt-3 text-white/50">Se uma única cliente que ia sumir fechar um procedimento, o plano já se pagou — e sobra.</p>
            <div className="mt-3 mx-auto h-px w-8 bg-[#C9A84C]/40" />
            <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
              <button onClick={() => setBilling("mensal")} className="rounded-full px-6 py-2 text-sm font-medium transition-all" style={billing === "mensal" ? { background: "#C9A84C", color: "#0D1B2E" } : { color: "rgba(255,255,255,0.5)" }}>
                Mensal
              </button>
              <button onClick={() => setBilling("anual")} className="rounded-full px-6 py-2 text-sm font-medium transition-all flex items-center gap-2" style={billing === "anual" ? { background: "#C9A84C", color: "#0D1B2E" } : { color: "rgba(255,255,255,0.5)" }}>
                Anual <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${billing === "anual" ? "bg-[#0D1B2E] text-[#C9A84C]" : "bg-[#C9A84C]/20 text-[#C9A84C]"}`}>41% off</span>
              </button>
            </div>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3 items-start">
            {/* Start */}
            <div className="relative rounded-3xl p-8" style={{ background: "#111827", border: "2px solid #C9A84C", boxShadow: "0 0 40px rgba(201,168,76,0.15)" }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-[#C9A84C] px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0D1B2E]">Disponível agora</span>
              </div>
              <p className="mt-2 text-sm font-medium text-white/50">Plano Start</p>
              {billing === "mensal" ? (
                <><p className="mt-1 font-serif text-5xl font-bold text-[#C9A84C]">R$97<span className="text-xl font-normal text-white/30">/mês</span></p><p className="mt-1 text-xs text-white/30">Cobrança mensal</p></>
              ) : (
                <><p className="mt-1 font-serif text-5xl font-bold text-[#C9A84C]">R$57<span className="text-xl font-normal text-white/30">/mês</span></p><p className="mt-1 text-sm font-semibold text-[#C9A84C]">R$684/ano · Economia de R$480</p></>
              )}
              <p className="mt-2 text-xs text-white/40">Pra profissional solo que quer parar de perder cliente no WhatsApp</p>
              <ul className="mt-6 space-y-2.5">
                {["Gerador de Respostas ilimitado", "Lead Intelligence — score de prioridade", "Biblioteca de Objeções completa", "Follow-up Inteligente", "Scripts de Atendimento com timing", "DNA da Clínica", "Histórico"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/75">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#C9A84C]/40"><Check size={11} className="text-[#C9A84C]" /></div>
                    {f}
                  </li>
                ))}
              </ul>
              <PlanCTA plan="start" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-4 py-3.5 text-sm font-bold text-[#0D1B2E] hover:opacity-90 transition-all disabled:opacity-60">
                Começar grátis por 7 dias
              </PlanCTA>
              <p className="mt-2 text-center text-xs text-white/30">Sem cartão · Cancele quando quiser</p>
            </div>
            {/* Pro */}
            <div className="rounded-3xl p-8" style={{ background: "#FAF7F2" }}>
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-400"><Bell size={13} /> Em breve</div>
              <p className="font-serif text-lg font-bold text-[#0D1B2E]">Plano Pro</p>
              <p className="mt-1 font-serif text-3xl font-bold text-[#C9A84C]">Em breve</p>
              <div className="mt-2 h-px bg-[#C9A84C]/20" />
              <p className="mt-4 text-sm leading-relaxed text-slate-500">WhatsApp integrado · Resposta automática 24h · Agendamento online · Lembrete automático · 3 usuárias</p>
              <div className="mt-6 space-y-2">
                <input type="email" placeholder="Seu e-mail para ser avisada" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30" />
                <button className="w-full rounded-xl border border-[#C9A84C]/30 px-4 py-2.5 text-sm font-medium text-[#0D1B2E] hover:bg-[#C9A84C]/10 transition-colors">Quero ser avisada quando lançar</button>
              </div>
            </div>
            {/* Premium */}
            <div className="rounded-3xl p-8" style={{ background: "#FAF7F2" }}>
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-400"><Bell size={13} /> Em breve</div>
              <p className="font-serif text-lg font-bold text-[#0D1B2E]">Plano Premium</p>
              <p className="mt-1 font-serif text-3xl font-bold text-[#C9A84C]">Em breve</p>
              <div className="mt-2 h-px bg-[#C9A84C]/20" />
              <p className="mt-4 text-sm leading-relaxed text-slate-500">Tudo do Pro · Pós-atendimento automatizado · Relatórios de conversão · 10 usuárias</p>
              <div className="mt-6 space-y-2">
                <input type="email" placeholder="Seu e-mail para ser avisada" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30" />
                <button className="w-full rounded-xl border border-[#C9A84C]/30 px-4 py-2.5 text-sm font-medium text-[#0D1B2E] hover:bg-[#C9A84C]/10 transition-colors">Quero ser avisada quando lançar</button>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/30">
            <span className="flex items-center gap-1"><Shield size={11} /> Cancele quando quiser</span>
            <span>·</span><span>Sem multa</span><span>·</span><span>Sem burocracia</span>
          </div>
        </div>
      </section>

      {/* ── GARANTIA ── */}
      <section style={{ background: "#FAF7F2" }} className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
              <Shield size={10} /> Sem burocracia
            </span>
            <h2 className="mt-4 font-serif text-4xl font-bold text-[#0D1B2E] sm:text-5xl">Simples assim: só paga se usar.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500">
              Teste grátis por 7 dias — sem colocar cartão, sem compromisso. Explore tudo, gere respostas, use no seu WhatsApp real.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500">
              Depois do trial, você decide. Se assinar e quiser cancelar, cancela pelo painel em um clique. Para de usar, para de pagar. <strong className="text-[#C9A84C]">Sem multa, sem ligação, sem formulário.</strong>
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { num: "01", icon: Gift, title: "Teste por 7 dias grátis", desc: "Acesse todas as ferramentas sem colocar cartão e veja como o LeadBellus transforma suas conversas." },
              { num: "02", icon: Zap, title: "Use no seu dia a dia", desc: "Gere respostas, organize atendimentos e feche mais. Tudo integrado ao seu WhatsApp real." },
              { num: "03", icon: CreditCard, title: "Decida com liberdade", desc: "Continue assinando se fizer sentido pra você. Sem fidelidade, sem pegadinha." },
              { num: "04", icon: X, title: "Cancele quando quiser", desc: "Um clique no painel e pronto. Para de usar, para de pagar. Sem complicação." },
            ].map((step) => (
              <div key={step.num} className="relative rounded-2xl border border-[#C9A84C]/15 bg-white p-6 shadow-sm">
                <div className="absolute -top-3 right-4 flex h-6 w-8 items-center justify-center rounded-md text-xs font-bold text-white" style={{ background: "#0D1B2E" }}>{step.num}</div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "#FAF7F2", border: "1px solid rgba(201,168,76,0.2)" }}>
                  <step.icon size={20} className="text-[#C9A84C]" />
                </div>
                <h3 className="font-semibold text-[#0D1B2E]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-4 rounded-2xl border border-[#C9A84C]/20 bg-white p-5">
            <Shield size={20} className="mt-0.5 shrink-0 text-[#C9A84C]" />
            <p className="text-sm text-slate-600">É por lei, você ainda tem <strong className="text-[#C9A84C]">7 dias de garantia após a primeira cobrança</strong> para solicitar reembolso total — direito garantido pelo Código de Defesa do Consumidor (Art. 49) para compras realizadas online.</p>
          </div>
          <p className="mt-4 text-center text-sm italic text-slate-400">Você testa grátis, assina só se quiser, e ainda tem 7 dias para mudar de ideia. Risco zero.</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: "#FAF7F2" }} className="pb-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C9A84C]">❓ Dúvidas frequentes</span>
            <h2 className="mt-4 font-serif text-4xl font-bold text-[#0D1B2E] sm:text-5xl">Perguntas frequentes</h2>
            <p className="mt-2 text-slate-500">Tire as principais dúvidas sobre o LeadBellus.</p>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <button className="flex w-full items-center gap-4 px-6 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAF7F2] border border-[#C9A84C]/20">
                    <faq.icon size={15} className="text-[#C9A84C]" />
                  </div>
                  <span className="flex-1 text-sm font-semibold text-[#0D1B2E]">{faq.q}</span>
                  <span className="text-xl font-light text-[#C9A84C] transition-transform" style={{ display: "inline-block", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                {openFaq === i && (
                  <div className="border-t border-slate-100 px-6 pb-5 pt-3">
                    <p className="text-sm leading-relaxed text-slate-500">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background: "#FAF7F2" }} className="pb-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C9A84C]/20 bg-white shadow-sm">
            <MessageSquareText size={24} className="text-[#C9A84C]" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#0D1B2E] sm:text-4xl">
            Cada semana sem o LeadBellus é uma semana <span className="text-[#C9A84C]">respondendo no improviso.</span>
          </h2>
          <div className="mt-8 space-y-3">
            {[
              { icon: Brain, text: <span>Mais uma semana de <strong>"vou pensar"</strong> sem follow-up.</span> },
              { icon: TrendingUp, text: <span>Mais uma semana de <strong>preço jogado cedo</strong> demais.</span> },
              { icon: Snowflake, text: <span>Mais uma cliente que foi pra concorrente porque a <strong>resposta foi fria</strong>.</span> },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-left shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAF7F2] border border-[#C9A84C]/20">
                  <item.icon size={16} className="text-[#C9A84C]" />
                </div>
                <p className="text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#C9A84C]/20 bg-[#C9A84C]/5 p-5 text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C9A84C]">
              <Calendar size={20} className="text-[#0D1B2E]" />
            </div>
            <div>
              <p className="text-base font-semibold text-[#0D1B2E]">Você paga <span className="text-[#C9A84C]">R$97/mês.</span></p>
              <p className="text-sm text-slate-500">Um único procedimento de harmonização paga <span className="font-semibold text-[#C9A84C]">19 meses</span> de assinatura.</p>
            </div>
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Shield size={12} className="text-[#C9A84C]" /> O risco de testar é zero. O custo de não testar você já conhece — está sentindo toda semana.
          </p>
          <Link href="#planos" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0D1B2E] px-8 py-4 text-base font-bold text-white shadow-lg hover:scale-105 hover:opacity-90 transition-all">
            Quero minha clínica respondendo melhor agora <ArrowRight size={18} />
          </Link>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Shield size={11} className="text-[#C9A84C]" /> 7 dias grátis</span>
            <span className="flex items-center gap-1"><CreditCard size={11} className="text-[#C9A84C]" /> Sem cartão</span>
            <span className="flex items-center gap-1"><Clock size={11} className="text-[#C9A84C]" /> Acesso em menos de 2 minutos</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 md:grid-cols-3">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#0D1B2E" }}>
                <img src="/LEADBELLUS.png" alt="" className="h-9 w-auto" />
              </div>
              <div>
                <p className="font-semibold text-[#0D1B2E]">Inteligência de conversão para clínicas de estética.</p>
                <p className="mt-1 text-sm text-slate-400">Responda melhor, feche mais e encante seus clientes pelo WhatsApp.</p>
              </div>
              <div className="flex items-center gap-3">
{[Globe, MessageCircle, Mail].map((Icon, i) => (
                  <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C9A84C]/20"><MapPin size={15} className="text-[#C9A84C]" /></div>
                <h4 className="font-semibold text-[#0D1B2E]">Contato</h4>
              </div>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 shrink-0 text-[#C9A84C]" /><span>Av. Rômulo Maiorana, 1695, Marco<br />Belém - PA, 66093-674</span></div>
                <div className="flex items-center gap-2"><MessageCircle size={13} className="shrink-0 text-[#C9A84C]" /><span>WhatsApp: +55 91 8515-6690</span></div>
                <div className="flex items-center gap-2"><Mail size={13} className="shrink-0 text-[#C9A84C]" /><span>contato@leadbellus.com.br</span></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C9A84C]/20"><Clock size={15} className="text-[#C9A84C]" /></div>
                <h4 className="font-semibold text-[#0D1B2E]">Horário</h4>
              </div>
              <p className="text-sm text-slate-500">Segunda a Sábado: 24h (IA ativa)</p>
              <div className="border-t border-slate-100 pt-4 text-xs text-slate-400">
                <p>© 2026 LeadBellus</p><p>VPS Automações</p>
              </div>
            </div>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Shield, title: "Segurança e privacidade", desc: "Seus dados protegidos com criptografia e em conformidade com a LGPD." },
              { icon: Heart, title: "Feito para clínicas", desc: "Pensado para profissionais que querem mais tempo, organização e resultados." },
              { icon: MessageCircle, title: "Suporte humano", desc: "Precisa de ajuda? Fale com a gente pelo WhatsApp." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-slate-100 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAF7F2] border border-[#C9A84C]/20">
                  <item.icon size={15} className="text-[#C9A84C]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0D1B2E]">{item.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
