import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { SetupWhatsappCta } from "@/components/setup-whatsapp-cta";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/setup-whatsapp",
  title: "Setup de WhatsApp Business para clínica de estética — LeadBellus",
  description:
    "Textos de saudação, ausência e respostas rápidas escritos para a sua clínica de estética, aplicados com você numa chamada de até 1 hora. R$397, uma vez só.",
});

const ENTRA = [
  "Saudação e mensagem de ausência escritas para a sua clínica",
  "Respostas rápidas para as perguntas que mais chegam, como “quanto custa?” e “dói?”",
  "Perfil comercial completo: foto, descrição, horário, endereço e site",
  "Etiquetas para organizar quem está em conversa",
  "Link direto para o WhatsApp com mensagem pronta e QR code",
  "Passagem rápida com quem atende e resumo por escrito",
];

const NAO_ENTRA = [
  "Robô, API ou resposta automática com IA",
  "Responder as suas clientes",
  "Agenda ou anúncios",
  "Verificação da empresa na Meta",
  "Promessa de mais agendamentos ou faturamento",
];

const PASSOS = [
  ["Você conta como é a clínica", "Pelo WhatsApp, eu pergunto o que preciso saber: procedimentos, horário e as dúvidas que mais chegam."],
  ["Eu escrevo, você aprova", "Você recebe todos os textos antes da chamada e muda o que quiser."],
  ["Aplicamos juntos", "Numa chamada de vídeo de até 1 hora, você aplica tudo no seu celular, comigo guiando."],
  ["Testamos e você paga o resto", "Conferimos o que foi configurado e só então você paga o restante."],
];

const PERGUNTAS = [
  ["Você vai entrar no meu WhatsApp?", "Não. Quem toca na tela é você, no seu celular. Eu nunca peço código de verificação nem acesso à sua conta."],
  ["Isso é um robô?", "Não. São recursos do próprio WhatsApp Business, com textos que você aprova. Quem conversa com a cliente continua sendo a sua equipe."],
  ["Preciso assinar o LeadBellus?", "Não. O setup é um serviço à parte, pago uma vez só."],
  ["Os textos prometem resultado ou citam preço de procedimento?", "Não. Eles não prometem resultado, não fazem diagnóstico e não citam preço de procedimento. Quem aprova é você."],
  ["E se eu desistir?", "Se desistir antes da chamada, ou se eu não entregar, o sinal volta no mesmo dia."],
  ["Meu número está ligado a robô ou CRM. Serve?", "Hoje não. Este serviço só funciona com o app WhatsApp Business no celular."],
];

export default function SetupWhatsappPage() {
  return (
    <main className="min-h-screen bg-navy-900 text-navy-50">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:py-20">
        <Link href="/" className="text-sm font-medium text-gold-400 hover:text-gold-300">
          ← LeadBellus
        </Link>

        <section className="mt-8">
          <p className="text-sm font-semibold text-gold-400">Serviço para clínicas de estética</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-champagne-300 sm:text-5xl">
            Seu WhatsApp Business pronto, com textos escritos para a sua clínica.
          </h1>
          <p className="mt-5 text-lg leading-relaxed">
            Eu escrevo a saudação, a ausência e as respostas rápidas no tom de vocês. Depois,
            numa chamada de até 1 hora, você aplica tudo no seu celular, comigo junto.
          </p>
          <div className="mt-7 flex flex-col items-start gap-3">
            <SetupWhatsappCta origem="topo" label="Falar no WhatsApp" />
            <p className="text-sm text-navy-100">R$397, uma vez só. R$97 de sinal e R$300 no fim da chamada.</p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-2xl font-semibold text-champagne-200">O que fica pronto</h2>
          <ul className="mt-4 space-y-3">
            {ENTRA.map((item) => (
              <li key={item} className="flex gap-3">
                <Check size={20} className="mt-0.5 shrink-0 text-gold-400" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-2xl font-semibold text-champagne-200">Como funciona</h2>
          <ol className="mt-4 space-y-5">
            {PASSOS.map(([titulo, texto], i) => (
              <li key={titulo} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400 text-sm font-bold text-navy-900">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-champagne-200">{titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed">{texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-2xl font-semibold text-champagne-200">O que não entra</h2>
          <ul className="mt-4 space-y-3">
            {NAO_ENTRA.map((item) => (
              <li key={item} className="flex gap-3">
                <X size={20} className="mt-0.5 shrink-0 text-navy-100" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 rounded-2xl border border-navy-500 p-6">
          <h2 className="font-serif text-2xl font-semibold text-champagne-200">Preço</h2>
          <p className="mt-3 font-serif text-4xl font-semibold text-gold-400">R$397</p>
          <p className="mt-1 text-sm">Pagamento único, sem mensalidade.</p>
          <p className="mt-4 leading-relaxed">
            Você reserva com R$97 de sinal por Pix e paga os R$300 no fim da chamada, depois de
            testar tudo. Se desistir antes da chamada, ou se eu não entregar, o sinal volta no
            mesmo dia.
          </p>
          <p className="mt-3 text-sm text-navy-100">
            Você estaria entre as primeiras clínicas: ainda não tenho caso para mostrar.
          </p>
          <div className="mt-5">
            <SetupWhatsappCta origem="preco" label="Quero reservar um horário" />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-2xl font-semibold text-champagne-200">Perguntas frequentes</h2>
          <dl className="mt-4 space-y-5">
            {PERGUNTAS.map(([pergunta, resposta]) => (
              <div key={pergunta}>
                <dt className="font-semibold text-champagne-200">{pergunta}</dt>
                <dd className="mt-1 text-sm leading-relaxed">{resposta}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </main>
  );
}
