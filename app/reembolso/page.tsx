import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Reembolso — LeadBellus",
  description: "Política de cancelamento e reembolso do LeadBellus.",
};

export default function ReembolsoPage() {
  return (
    <main className="min-h-screen bg-navy-900">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <Link
          href="/"
          className="text-sm font-medium text-gold-400 hover:text-gold-300"
        >
          ← Voltar ao início
        </Link>

        <h1 className="mt-6 font-serif text-3xl font-semibold text-champagne-300 sm:text-4xl">
          Política de Reembolso
        </h1>
        <p className="mt-2 text-xs text-navy-100">
          Última atualização: junho de 2026
        </p>

        <div className="mt-6 rounded-2xl border border-gold-500/30 bg-gold-500/10 px-4 py-3">
          <p className="text-sm font-semibold text-gold-300">
            Rascunho para revisão
          </p>
          <p className="mt-1 text-xs leading-relaxed text-champagne-300">
            Este documento é um modelo inicial e precisa de revisão jurídica
            antes de valer como política definitiva.
          </p>
        </div>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-navy-50">
          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">
              1. Teste grátis
            </h2>
            <p className="mt-2">
              A demo pública do LeadBellus permite gerar até 5 respostas grátis
              para avaliar o produto antes de contratar o plano Start.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">
              2. Assinatura Start
            </h2>
            <p className="mt-2">
              O Start é uma assinatura mensal paga. A cobrança é processada pela
              Stripe, e os dados do cartão não ficam armazenados no LeadBellus.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">
              3. Cancelamento
            </h2>
            <p className="mt-2">
              Você pode cancelar quando quiser. Após o cancelamento, o acesso
              pago permanece ativo até o fim do período já contratado.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">
              4. Reembolso
            </h2>
            <p className="mt-2">
              Salvo direito legal aplicável ou erro de cobrança, períodos já
              iniciados não têm reembolso proporcional automático. Se houver
              cobrança indevida, duplicada ou problema técnico relevante, entre
              em contato para análise.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">
              5. Contato
            </h2>
            <p className="mt-2">
              Para solicitar análise de cobrança ou cancelamento, escreva para{" "}
              <a
                href="mailto:contato@leadbellus.com.br"
                className="text-gold-400 hover:text-gold-300 underline"
              >
                contato@leadbellus.com.br
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
