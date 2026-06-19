import Link from "next/link";
import { Suspense } from "react";
import {
  Check,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Target,
  Brain,
  MessageSquare,
  RefreshCw,
  FileText,
  Dna,
  Archive,
  Bot,
  CalendarCheck,
  Bell,
  Heart,
  Building2,
  User,
  Users,
  TrendingUp,
  Layers,
  Star,
} from "lucide-react";
import { billingPlanList } from "@/lib/billing";
import { PlanCTA } from "@/components/plan-cta";
import { WaitlistForm } from "@/components/waitlist-form";
import { LandingWhatsAppDemo } from "@/components/landing-whatsapp-demo";
import { LoadingRespostas } from "@/components/loading-respostas";
import { HeroDevices } from "@/components/hero-devices";
import { HeroShapes } from "@/components/hero-shapes";
import { HeroTextContent } from "@/components/hero-text-content";
import { PricingSection } from "@/components/pricing-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { AboutSection } from "@/components/about-section";
import { CompareResponsesSection } from "@/components/compare-responses-section";
import { HeroHighlight, Highlight } from "@/components/hero-highlight-leadbellus";
import { IndicadoCards, IndicadoHeader } from "@/components/indicado-cards";

const funilHref = "/signup";

// ─── Logo SVG inline ───────────────────────────────────────────────────────────
function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M40 6 C26 14, 10 32, 10 54 C10 70, 22 82, 40 90"
        stroke="#C9A060"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M40 6 C54 14, 70 32, 70 54 C70 70, 58 82, 40 90"
        stroke="#C9A060"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <line
        x1="40" y1="32" x2="40" y2="86"
        stroke="#C9A060"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="40" cy="27" r="5.5" fill="#C9A060" />
    </svg>
  );
}

// ─── Section tag pill ──────────────────────────────────────────────────────────
function TagPill({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        border: `1px solid ${light ? "rgba(201,160,96,0.5)" : "#C9A060"}`,
        color: light ? "#92610A" : "#C9A060",
        background: light ? "rgba(201,160,96,0.1)" : "transparent",
        borderRadius: "9999px",
        padding: "4px 14px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: "20px",
      }}
    >
      {children}
    </div>
  );
}

// ─── Gold divider ──────────────────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div
      style={{
        height: "1px",
        background: "linear-gradient(90deg, transparent, #C9A060, transparent)",
        margin: "32px 0",
        width: "100%",
      }}
    />
  );
}

// ─── Check bullet ─────────────────────────────────────────────────────────────
function CheckBullet({ children, color = "#C9A060" }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <span
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: `${color}22`,
          border: `1px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        <Check size={11} color={color} />
      </span>
      <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.82)", lineHeight: 1.65 }}>
        {children}
      </span>
    </div>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(7,16,30,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(201,160,96,0.15)",
      }}
    >
      <div
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <LogoMark size={28} />
          <span
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "18px",
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "-0.01em",
            }}
          >
            LeadBellus
          </span>
        </Link>

        <div className="hidden md:flex" style={{ gap: "32px", alignItems: "center" }}>
          {[
            { label: "Funções", href: "#funcoes" },
            { label: "Como funciona", href: "#simulador" },
            { label: "Preços", href: "#precos" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", textDecoration: "none" }}
              className="hover:text-[#C9A060] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/login"
            style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", textDecoration: "none" }}
            className="hidden md:block"
          >
            Entrar
          </Link>
          <Link
            href={funilHref}
            style={{
              background: "#C9A060",
              color: "#07101e",
              borderRadius: "9999px",
              padding: "8px 20px",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Começar grátis
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Launch banner ─────────────────────────────────────────────────────────────
function LaunchBanner() {
  return (
    <div
      style={{
        background: "linear-gradient(90deg, #92610A, #C9A060, #92610A)",
        color: "#07101e",
        textAlign: "center",
        padding: "10px 24px",
        fontSize: "13px",
        fontWeight: 700,
        letterSpacing: "0.02em",
      }}
    >
      ✦ Lançamento: garanta seu preço de fundadora — ele fica congelado enquanto você for assinante.
    </div>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ fontFamily: "var(--font-inter, system-ui, sans-serif)" }}>
      <Navbar />
      <LaunchBanner />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        style={{
          background: "#07101e",
          color: "#ffffff",
          padding: "72px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "-80px", left: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(201,160,96,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", right: "-80px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(201,160,96,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", right: "10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(96,160,201,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <HeroShapes />

        <div style={{ maxWidth: "1152px", margin: "0 auto", position: "relative" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "420px 1fr",
              gap: "40px",
              alignItems: "flex-start",
            }}
            className="hero-grid"
          >
            {/* Left — copy (animado) */}
            <HeroTextContent />

            {/* Right — animated device mockups */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "48px" }}>
              <HeroDevices />
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .hero-grid {
              grid-template-columns: 1fr !important;
              text-align: center;
            }
            .hero-grid > div:first-child > p { margin-left: auto; margin-right: auto; }
            .hero-grid > div:first-child > div { justify-content: center; }
          }
        `}</style>
      </section>

      {/* ── PROBLEMA E SOLUÇÃO ───────────────────────────────────────────────── */}
      <section
        id="problema"
        style={{ background: "#F5F0E6", padding: "96px 24px" }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <TagPill light>Onde o dinheiro vaza sem você perceber</TagPill>
            <h2
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(28px, 4vw, 46px)",
                fontWeight: 700,
                color: "#0A1628",
                lineHeight: 1.15,
                margin: "0 0 24px",
                maxWidth: "700px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              A cliente perguntou o preço. Você respondeu. Ela sumiu.
            </h2>
            <p
              style={{
                color: "#4a5568",
                fontSize: "16px",
                lineHeight: 1.8,
                maxWidth: "640px",
                margin: "0 auto 24px",
              }}
            >
              Não foi porque era cara demais. Foi porque a resposta não conduziu.
              Não acolheu. Não gerou autoridade. Não criou o próximo passo.
            </p>
            <p
              style={{
                color: "#4a5568",
                fontSize: "16px",
                lineHeight: 1.8,
                maxWidth: "640px",
                margin: "0 auto 24px",
              }}
            >
              Na estética, a maioria das vendas não se perde por falta de
              interesse — se perde nos primeiros três minutos de conversa no
              WhatsApp. Quando a mensagem é seca, quando o preço aparece cedo
              demais, quando a cliente não sente que você é diferente da clínica
              do lado.
            </p>
            <p
              style={{
                color: "#92610A",
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: 1.8,
                maxWidth: "640px",
                margin: "0 auto",
              }}
            >
              E o pior: você já sabe disso. Já ficou olhando pro WhatsApp
              pensando "essa eu devia ter conseguido".
            </p>
          </div>

          {/* Checklist de dor */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #E8E4DC",
              borderRadius: "24px",
              padding: "40px 36px",
              marginBottom: "48px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "18px",
                fontWeight: 700,
                color: "#0A1628",
                marginBottom: "24px",
              }}
            >
              Você já se reconheceu aqui?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                "Deu o preço do botox e a cliente sumiu sem responder",
                `Ouviu "vou pensar" e nunca mais teve retorno`,
                `A cliente disse "na outra é mais barato" e você não soube o que responder`,
                "Fez orçamento há 3 dias e não fez follow-up porque não sabe o que falar",
                `Ficou com aquela sensação: "ela ia fechar — eu errei na resposta"`,
                "Tem 15 conversas abertas e não sabe qual delas está quente pra fechar",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "#fee2e2",
                      border: "1px solid #fca5a5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                      fontSize: "10px",
                      color: "#b91c1c",
                      fontWeight: 800,
                    }}
                  >
                    ✗
                  </span>
                  <span style={{ fontSize: "15px", color: "#374151", lineHeight: 1.65 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Solução */}
          <div
            style={{
              background: "#0A1628",
              borderRadius: "24px",
              padding: "40px 36px",
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: "16px" }}>
              Se você marcou dois ou mais — o problema não é você. É que você
              nunca teve a ferramenta certa.
            </p>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.8)", lineHeight: 1.8, marginBottom: "24px" }}>
              Cada conversa que some sem agendar pode valer de{" "}
              <strong style={{ color: "#C9A060" }}>R$800 a R$3.000</strong>.
              Não porque você é ruim no atendimento — mas porque responder bem
              no WhatsApp, com condução psicológica e estratégia, é uma habilidade
              de vendas. E ninguém te ensinou isso.
            </p>
            <p
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "20px",
                fontWeight: 700,
                color: "#C9A060",
              }}
            >
              O LeadBellus foi construído exatamente pra isso.
            </p>
          </div>
        </div>
      </section>

      {/* ── PRA QUEM É INDICADO ──────────────────────────────────────────────── */}
      <section
        id="indicado"
        style={{ background: "#07101e", padding: "96px 24px" }}
      >
        <HeroHighlight containerClassName="min-h-0 py-0 mb-14">
        <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
          <IndicadoHeader>
            <TagPill>Antes de continuar</TagPill>
            <h2
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 0 16px",
                lineHeight: 1.2,
              }}
            >
              Se você cuida de clientes —{" "}
              <Highlight>
                <span style={{ color: "#C9A060" }}>o LeadBellus cuida do seu atendimento</span>
              </Highlight>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", maxWidth: "580px", margin: "0 auto" }}>
              Não importa se você atende sozinho, tem uma equipe ou gerencia uma
              clínica completa. Se o WhatsApp é onde as suas vendas acontecem,
              é aqui que você vai parar de perder dinheiro.
            </p>
          </IndicadoHeader>
        </div>
        </HeroHighlight>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <IndicadoCards funilHref={funilHref} />
        </div>
      </section>

      {/* ── BENEFÍCIOS / FUNÇÕES ─────────────────────────────────────────────── */}
      <section
        id="funcoes"
        style={{ background: "#F5F0E6", padding: "96px 24px" }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <TagPill light>As funções do LeadBellus</TagPill>
            <h2
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 700,
                color: "#0A1628",
                margin: "0 0 16px",
                lineHeight: 1.2,
              }}
            >
              Cada situação que você enfrenta no WhatsApp —{" "}
              <em>resolvida</em>
            </h2>
            <p style={{ color: "#4a5568", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
              Não é um ChatGPT genérico. O LeadBellus foi treinado nas situações
              reais da jornada de compra de uma cliente de estética brasileira.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              {
                num: "01",
                emoji: "🎯",
                icon: <Target size={18} color="#C9A060" strokeWidth={1.5} />,
                title: "Gerador de Respostas",
                subtitle: "A resposta certa, no seu tom, em 30 segundos",
                body: "Cola a mensagem que a cliente mandou → seleciona a situação → escolhe o procedimento → clica em Gerar. Você recebe 3 versões: Suave, Consultiva e Fechamento. Lê, escolhe, copia e manda. Trinta segundos. Venda conduzida.",
                impact: "Você para de ficar olhando pra tela pensando no que escrever. A resposta sai no seu tom — porque você configurou isso uma vez, e o sistema nunca esquece.",
                plans: "START · PRO · PREMIUM",
                dark: false,
              },
              {
                num: "02",
                emoji: "🧠",
                icon: <Brain size={18} color="#C9A060" strokeWidth={1.5} />,
                title: "Lead Intelligence",
                subtitle: "Saiba na hora quem está quase fechando — sem ler tudo",
                body: "Cola a conversa da cliente → o Lead Intelligence analisa e devolve: ① Score de conversão — a porcentagem de chance de fechamento. ② Perfil psicológico — o que ela quer, o que a trava. ③ Estratégia exata — como abordá-la pra maximizar o agendamento.",
                impact: "Você tem 18 conversas abertas. Com o Lead Intelligence, sabe em 3 minutos quais são as 3 prontas pra fechar — e o que dizer pra cada uma.",
                plans: "PRO · PREMIUM",
                dark: true,
              },
              {
                num: "03",
                emoji: "💬",
                icon: <MessageSquare size={18} color="#C9A060" strokeWidth={1.5} />,
                title: "Biblioteca de Objeções",
                subtitle: `Nunca mais trava quando a cliente diz "está caro"`,
                body: `"Está caro." "Vou pensar." "Na outra clínica é mais barato." "Tenho medo de ficar artificial." Cada objeção tem uma resposta estratégica que acolhe, educa e conduz. Você clica na situação, a resposta aparece adaptada ao seu tom, e você copia. Em menos de 15 segundos.`,
                impact: "Toda objeção tem uma resposta certa. Agora você sempre vai ter ela na ponta dos dedos — sem pensar, sem hesitar, sem perder a venda.",
                plans: "START · PRO · PREMIUM",
                dark: false,
              },
              {
                num: "04",
                emoji: "🔄",
                icon: <RefreshCw size={18} color="#C9A060" strokeWidth={1.5} />,
                title: "Follow-up Inteligente",
                subtitle: "Reativa a cliente que sumiu — sem parecer desesperado",
                body: "Seleciona quanto tempo faz que ela sumiu: 2h / 1 dia / 3 dias / 1 semana / 15 dias ou mais. Gera 3 mensagens com progressão psicológica: suave → direta com gatilho de valor → última tentativa com fechamento.",
                impact: `Você para de ter leads paradas na caixa. Clientes que iam embora pra nunca mais voltar começam a responder "oi, ainda tem vaga?" — porque a mensagem certa chegou na hora certa.`,
                plans: "START · PRO · PREMIUM",
                dark: true,
              },
              {
                num: "05",
                emoji: "📋",
                icon: <FileText size={18} color="#C9A060" strokeWidth={1.5} />,
                title: "Scripts de Atendimento Completo",
                subtitle: `Do primeiro "oi" ao agendamento — sem improvisar`,
                body: "Fluxo completo de 4–5 mensagens com indicação de quando mandar cada uma. Fluxos disponíveis: cliente perguntou preço pela primeira vez · disse que está caro · nova do Instagram · reativação de cliente antiga · pós-procedimento.",
                impact: "Você vai de 0 a agendamento com a mesma lead que antes ficava só olhando. Sem improvisar em cada etapa.",
                plans: "START · PRO · PREMIUM",
                dark: false,
              },
              {
                num: "06",
                emoji: "🧬",
                icon: <Dna size={18} color="#C9A060" strokeWidth={1.5} />,
                title: "DNA da Clínica",
                subtitle: "Toda resposta parece você — não uma máquina",
                body: "Configure uma vez (5 minutos): como você chama as clientes, nível de formalidade, seu CTA preferido, procedimentos que você oferece, seu diferencial. Depois disso, toda resposta gerada sai com esses parâmetros gravados.",
                impact: "As clientes não percebem que foi uma ferramenta. Percebem que você responde bem. É como ter uma versão sua que nunca está cansada, nunca trava, nunca responde seco.",
                plans: "START · PRO · PREMIUM",
                dark: true,
              },
              {
                num: "07",
                emoji: "🗂️",
                icon: <Archive size={18} color="#C9A060" strokeWidth={1.5} />,
                title: "Histórico e Favoritos",
                subtitle: "Suas melhores respostas, organizadas e prontas pra usar de novo",
                body: "Tudo que você gerar fica salvo automaticamente com data, módulo usado, situação e procedimento. Você pode favoritar as respostas que mais funcionaram e filtrar por tipo quando precisar.",
                impact: "Com o tempo, você constrói uma biblioteca pessoal das suas melhores respostas. Não começa do zero toda vez.",
                plans: "START · PRO · PREMIUM",
                dark: false,
              },
              {
                num: "08",
                emoji: "📲",
                icon: <Bot size={18} color="#C9A060" strokeWidth={1.5} />,
                title: "Chatbot WhatsApp Business",
                subtitle: "Sua clínica atendendo — mesmo quando você está em procedimento",
                body: "O LeadBellus se conecta diretamente ao seu WhatsApp Business. Quando uma lead nova entra, o chatbot assume: responde, apresenta a clínica, quebra objeções, faz follow-up. No Pro, o bot prepara o terreno e você confirma o fechamento. No Premium, o ciclo é 100% autônomo.",
                impact: "São 23h. Uma pessoa viu seu post e mandou mensagem. Sem o chatbot: ela esfria. Com o chatbot: você acorda com um lead quente esperando só pela sua confirmação.",
                plans: "PRO (semi-autônomo) · PREMIUM (totalmente autônomo)",
                dark: true,
              },
              {
                num: "09",
                emoji: "📅",
                icon: <CalendarCheck size={18} color="#C9A060" strokeWidth={1.5} />,
                title: "Agendamento Autônomo",
                subtitle: "O bot fecha a consulta. Você aparece só pra atender.",
                body: "Você configura seus dias, horários e tempo por procedimento. O chatbot apresenta os próximos horários disponíveis, a cliente escolhe e o agendamento é confirmado automaticamente — sem intermediário humano.",
                impact: "A sua agenda se preenche enquanto você está em procedimento, dormindo ou no fim de semana.",
                plans: "PREMIUM",
                dark: false,
              },
              {
                num: "10",
                emoji: "⏰",
                icon: <Bell size={18} color="#C9A060" strokeWidth={1.5} />,
                title: "Lembrete + Orientações Pré-consulta",
                subtitle: "Zero falta. Cliente preparada. Consulta que acontece.",
                body: "24 horas antes de cada consulta: ① Lembrete personalizado com horário e endereço. ② Orientações pré-procedimento personalizadas por tipo. ③ Pedido de confirmação com resposta em um toque. Se cancelar — você recebe alerta com tempo hábil.",
                impact: "Taxa de no-show cai. A cliente chega preparada. O resultado é melhor — o que gera mais indicação.",
                plans: "PRO · PREMIUM",
                dark: true,
              },
              {
                num: "11",
                emoji: "💚",
                icon: <Heart size={18} color="#C9A060" strokeWidth={1.5} />,
                title: "Gestão Pós-consulta",
                subtitle: "O procedimento acabou. O relacionamento começa agora.",
                body: "No intervalo que você definir (2, 5 ou 7 dias após o procedimento), o sistema envia: pergunta sobre a recuperação → orientação específica do pós → abre porta pra tirar dúvidas → planta a semente do próximo agendamento.",
                impact: "A cliente sente que você se importa com o resultado — não só com o pagamento. Isso gera confiança, indicação e recorrência.",
                plans: "PRO · PREMIUM",
                dark: false,
              },
            ].map((fn) => (
              <div
                key={fn.num}
                style={{
                  background: fn.dark ? "#0A1628" : "#ffffff",
                  border: `1px solid ${fn.dark ? "rgba(201,160,96,0.15)" : "#E8E4DC"}`,
                  borderRadius: "20px",
                  padding: "32px 28px",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  gap: "24px",
                  alignItems: "flex-start",
                  boxShadow: fn.dark ? "none" : "0 2px 12px rgba(0,0,0,0.05)",
                }}
                className="fn-card"
              >
                {/* Number + emoji */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", minWidth: "48px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-fraunces, Georgia, serif)",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#C9A060",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {fn.num}
                  </span>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(201,160,96,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                    }}
                  >
                    {fn.emoji}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-fraunces, Georgia, serif)",
                      fontSize: "20px",
                      fontWeight: 700,
                      color: fn.dark ? "#ffffff" : "#0A1628",
                      margin: "0 0 4px",
                    }}
                  >
                    {fn.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#C9A060", fontWeight: 600, marginBottom: "12px" }}>
                    {fn.subtitle}
                  </p>
                  <p style={{ fontSize: "14px", color: fn.dark ? "rgba(255,255,255,0.65)" : "#4a5568", lineHeight: 1.75, marginBottom: "12px" }}>
                    {fn.body}
                  </p>
                  <div
                    style={{
                      background: fn.dark ? "rgba(201,160,96,0.08)" : "rgba(201,160,96,0.08)",
                      border: "1px solid rgba(201,160,96,0.2)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                    }}
                  >
                    <p style={{ fontSize: "13px", color: fn.dark ? "rgba(255,255,255,0.8)" : "#374151", lineHeight: 1.65, margin: 0 }}>
                      <strong style={{ color: "#C9A060" }}>O que muda na prática: </strong>
                      {fn.impact}
                    </p>
                  </div>
                </div>

                {/* Plan badge */}
                <div style={{ flexShrink: 0 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      padding: "5px 12px",
                      borderRadius: "9999px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: "rgba(201,160,96,0.12)",
                      color: "#C9A060",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fn.plans}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <style>{`
            @media (max-width: 640px) {
              .fn-card { grid-template-columns: auto 1fr !important; }
              .fn-card > div:last-child { grid-column: 1 / -1; }
            }
          `}</style>
        </div>
      </section>

      <AboutSection />

      <CompareResponsesSection funilHref={funilHref} />

      {/* ── SIMULADOR INTERATIVO ─────────────────────────────────────────────── */}
      <section id="simulador" style={{ background: "#07101e", padding: "96px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <TagPill>✦ Experimente agora</TagPill>
            <h2
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 0 16px",
                lineHeight: 1.2,
              }}
            >
              Veja como ficaria{" "}
              <span style={{ color: "#C9A060" }}>uma resposta da sua clínica</span>{" "}
              — agora
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", maxWidth: "520px", margin: "0 auto 20px" }}>
              Coloque o nome da sua clínica, escolha o tom e uma situação. A
              resposta já sai personalizada pra você. Sem criar conta. Sem
              cartão. Em 30 segundos.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
              }}
            >
              {[
                { id: "preco", label: "Perguntou preço" },
                { id: "achou_caro", label: "Achou caro" },
                { id: "sumiu", label: "Sumiu" },
                { id: "medo", label: "Medo do procedimento" },
              ].map((d) => (
                <Link
                  key={d.id}
                  href={`/?demo=${d.id}#simulador`}
                  style={{
                    border: "1px solid rgba(201,160,96,0.4)",
                    color: "#C9A060",
                    borderRadius: "9999px",
                    padding: "6px 16px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                    background: "rgba(201,160,96,0.07)",
                  }}
                >
                  {d.label}
                </Link>
              ))}
            </div>
          </div>

          <Suspense fallback={<LoadingRespostas etapas={["Carregando a demo…"]} />}>
            <LandingWhatsAppDemo />
          </Suspense>

          <div
            style={{
              background: "#0f1b2f",
              border: "1px solid rgba(201,160,96,0.2)",
              borderRadius: "16px",
              padding: "24px 28px",
              marginTop: "32px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.75, marginBottom: "20px" }}>
              Essa foi <strong style={{ color: "#ffffff" }}>uma</strong> resposta.
              O LeadBellus faz isso com cada mensagem que chega no seu WhatsApp
              — com DNA da Clínica completo configurado, histórico de cliente e
              Lead Intelligence te dizendo o quanto ela está pronta pra fechar.
            </p>
            <Link
              href={funilHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#C9A060",
                color: "#07101e",
                borderRadius: "9999px",
                padding: "14px 32px",
                fontSize: "15px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Quero o sistema completo — 7 dias grátis →
            </Link>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "10px" }}>
              Sem cartão · Acesso imediato · Você configura em 5 minutos
            </p>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      {/* ── OFERTA / PREÇOS ──────────────────────────────────────────────────── */}
      <section
        id="precos"
        style={{ background: "#07101e", padding: "96px 24px" }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <TagPill>Escolha o seu plano</TagPill>
            <h2
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 700,
                color: "#ffffff",
                margin: "0 0 16px",
                lineHeight: 1.2,
              }}
            >
              Uma cliente recuperada já paga o mês inteiro
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", maxWidth: "560px", margin: "0 auto" }}>
              Você cobra R$1.500 numa harmonização. Se o LeadBellus te ajuda a
              fechar 1 cliente a mais por mês — você está pagando R$97 pra
              faturar R$1.500. São 15x de retorno no pior cenário.
            </p>
          </div>

          <PricingSection />
        </div>
      </section>

      {/* ── GARANTIA ─────────────────────────────────────────────────────────── */}
      <section
        id="garantia"
        style={{ background: "#F5F0E6", padding: "96px 24px" }}
      >
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <TagPill light>Risco zero — literalmente</TagPill>
          <div
            style={{
              background: "#ffffff",
              border: "2px solid #E8E4DC",
              borderRadius: "24px",
              padding: "56px 40px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
            }}
          >
            <ShieldCheck size={56} color="#C9A060" style={{ margin: "0 auto 24px", display: "block" }} />
            <h2
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "32px",
                fontWeight: 700,
                color: "#0A1628",
                margin: "0 0 20px",
                lineHeight: 1.2,
              }}
            >
              Teste 7 dias. Se não gostar, não paga nada.
            </h2>
            <p style={{ fontSize: "16px", color: "#4a5568", lineHeight: 1.8, marginBottom: "32px" }}>
              Você não vai precisar colocar cartão de crédito pra começar. Você
              testa por 7 dias sem custo. Se depois do trial você decidir assinar
              e em 30 dias sentir que o LeadBellus não fez diferença real —
              devolvemos 100% do que você pagou.
            </p>
            <p
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#0A1628",
                fontStyle: "italic",
                marginBottom: "32px",
              }}
            >
              Sem questionamento. Sem formulário. Sem explicação necessária.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                textAlign: "left",
                marginBottom: "36px",
              }}
            >
              {[
                "7 dias grátis sem cartão",
                "30 dias com dinheiro de volta após assinar",
                "Cancele em 1 clique — sem ligar pra ninguém",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ fontSize: "16px" }}>🔒</span>
                  <span style={{ fontSize: "15px", color: "#374151", fontWeight: 600 }}>{item}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.7 }}>
              O único risco aqui é continuar perdendo cliente no WhatsApp
              enquanto existe uma ferramenta que resolve isso por menos do que
              um único procedimento por mês.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section
        id="faq"
        style={{ background: "#07101e", padding: "96px 24px" }}
      >
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <TagPill>Dúvidas frequentes</TagPill>
            <h2
              style={{
                fontFamily: "var(--font-fraunces, Georgia, serif)",
                fontSize: "clamp(24px, 3.5vw, 38px)",
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
              }}
            >
              Perguntas que a gente sabe que você tem
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              {
                q: "As respostas vão soar robóticas?",
                a: "Não — esse é exatamente o ponto. O DNA da Clínica aprende o seu tom, como você chama as clientes e o seu CTA preferido. O resultado parece você escrevendo num dia muito bom. As clientes não percebem que foi uma ferramenta — percebem que você responde bem.",
              },
              {
                q: "Qual é a diferença real entre os três planos?",
                a: "O Start te dá o arsenal completo de resposta manual — você nunca mais fica em branco. O Pro adiciona inteligência de diagnóstico (Lead Intelligence) e um chatbot que qualifica leads e prepara o terreno, mas você ainda confirma o agendamento. O Premium fecha o ciclo: o agendamento acontece sozinho, sem você precisar entrar na conversa.",
              },
              {
                q: "O chatbot do Pro realmente substitui uma recepcionista?",
                a: "Em grande parte, sim. Ele atende, responde dúvidas, quebra objeções e conduz a lead até o momento de fechar — o único passo que ainda é seu é a confirmação final do agendamento. No Premium, até esse último passo é automatizado.",
              },
              {
                q: "O agendamento autônomo do Premium já funciona?",
                a: "O núcleo do sistema (todas as funções de geração de resposta, Lead Intelligence, chatbot semi-autônomo, lembretes e pós-consulta) funciona hoje. O agendamento 100% autônomo está em desenvolvimento e será lançado em breve. Quem assinar o Premium agora entra no preço de lançamento e recebe acesso assim que sair.",
              },
              {
                q: "Funciona pra qualquer procedimento estético?",
                a: "Sim. O LeadBellus foi construído especificamente pro mercado estético brasileiro. Conhece botox, harmonização facial, preenchimento, bioestimulador, laser, microagulhamento, limpeza de pele, drenagem linfática e muito mais. Não é um ChatGPT genérico — é especializado no seu nicho.",
              },
              {
                q: "Preciso de muito tempo pra configurar?",
                a: "O setup inicial (DNA da Clínica) leva menos de 5 minutos. Depois disso você já está usando. A maioria das pessoas gera a primeira resposta em menos de 2 minutos após o cadastro.",
              },
              {
                q: "Qual a diferença do LeadBellus pra usar o ChatGPT direto?",
                a: `O ChatGPT não conhece a jornada psicológica da cliente de estética no Brasil. Não sabe que "vou pensar" é objeção de preço disfarçada. Não sabe quando usar autoridade ao invés de acolhimento. Não tem DNA da Clínica, não tem histórico, não tem Lead Intelligence, não tem chatbot integrado ao WhatsApp.`,
              },
              {
                q: "Se eu não gostar, como cancelo?",
                a: "Pelo próprio painel, em um clique. Sem ligar pra ninguém, sem formulário, sem prazo de aviso. Cancela hoje, não cobra mais amanhã.",
              },
            ].map((item) => (
              <details
                key={item.q}
                style={{
                  background: "#0f1b2f",
                  border: "1px solid rgba(201,160,96,0.15)",
                  borderRadius: "14px",
                  overflow: "hidden",
                }}
              >
                <summary
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    padding: "18px 22px",
                    cursor: "pointer",
                    listStyle: "none",
                    fontWeight: 600,
                    fontSize: "15px",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  {item.q}
                  <span style={{ color: "#C9A060", flexShrink: 0, fontSize: "20px" }}>+</span>
                </summary>
                <p
                  style={{
                    padding: "0 22px 18px",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────────── */}
      <section
        id="cta-final"
        style={{
          background: "#07101e",
          padding: "80px 24px 100px",
          borderTop: "1px solid rgba(201,160,96,0.15)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <TagPill>Última parada</TagPill>
          <h2
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 24px",
              lineHeight: 1.15,
            }}
          >
            Você vai continuar respondendo do mesmo jeito?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "16px", lineHeight: 1.8, marginBottom: "20px" }}>
            Toda semana que passa são mais clientes que perguntaram o preço e
            nunca mais responderam. Mais follow-ups que não foram feitos. Mais
            objeções respondidas errado.
          </p>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "16px", lineHeight: 1.8, marginBottom: "32px" }}>
            Isso não é falta de talento. É falta da ferramenta certa.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              marginBottom: "40px",
              textAlign: "left",
            }}
          >
            {[
              "Nunca mais fique em branco no WhatsApp",
              "Nunca mais perca uma lead por não saber o que falar",
              "Nunca mais sinta que deixou dinheiro na mesa",
            ].map((item) => (
              <div
                key={item}
                style={{
                  background: "rgba(201,160,96,0.06)",
                  border: "1px solid rgba(201,160,96,0.2)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ color: "#C9A060", fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>✦</span>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>

          <p
            style={{
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "18px",
              color: "#C9A060",
              marginBottom: "32px",
              fontWeight: 600,
            }}
          >
            Uma única cliente recuperada paga o mês inteiro.<br />
            O risco de testar é zero.
          </p>

          <Link
            href={funilHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "#C9A060",
              color: "#07101e",
              borderRadius: "16px",
              padding: "20px 48px",
              fontSize: "17px",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Quero minha clínica respondendo melhor agora
            <ArrowRight size={20} />
          </Link>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: "14px" }}>
            7 dias grátis · Sem cartão · Acesso imediato · Você usa hoje mesmo
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer
        style={{
          background: "#050d17",
          borderTop: "1px solid rgba(201,160,96,0.12)",
          padding: "56px 24px 32px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <LogoMark size={28} />
              <span
                style={{
                  fontFamily: "var(--font-fraunces, Georgia, serif)",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                LeadBellus
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: "220px", marginBottom: "16px" }}>
              A resposta certa. No seu tom. Em segundos.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <a
                href="https://instagram.com/leadbellus"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                📷
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: "16px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Produto
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Funções", href: "#funcoes" },
                { label: "Preços", href: "#precos" },
                { label: "FAQ", href: "#faq" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: "16px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Legal
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Termos de Uso", href: "/termos" },
                { label: "Privacidade", href: "/privacidade" },
                { label: "Política de Reembolso", href: "/reembolso" },
              ].map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: "16px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Contato
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href="mailto:contato@leadbellus.com.br"
                style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
              >
                📧 contato@leadbellus.com.br
              </a>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                💬 Suporte pelo chat no app
              </p>
            </div>
          </div>
        </div>

        <GoldDivider />

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: 0 }}>
            © 2026 LeadBellus · ResonAnza Inova Simples I S · Vinicius Paes da Serra Freire (MEI)
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "6px 12px",
            }}
          >
            <ShieldCheck size={14} color="rgba(255,255,255,0.4)" />
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
              Pagamento seguro via Stripe · Dados protegidos
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
