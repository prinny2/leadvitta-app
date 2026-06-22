import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Serviço — LeadBellus",
  description: "Termos de Serviço do LeadBellus.",
};

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-navy-900">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <Link href="/" className="text-sm font-medium text-gold-400 hover:text-gold-300">
          ← Voltar ao início
        </Link>

        <h1 className="mt-6 font-serif text-3xl font-semibold text-champagne-300 sm:text-4xl">
          Termos de Serviço
        </h1>
        <p className="mt-2 text-xs text-navy-100">Última atualização: junho de 2026</p>

        <div className="mt-6 rounded-2xl border border-gold-500/30 bg-gold-500/10 px-4 py-3">
          <p className="text-sm font-semibold text-gold-300">⚠️ Rascunho para revisão</p>
          <p className="mt-1 text-xs leading-relaxed text-champagne-300">
            Este documento é um modelo inicial e precisa de revisão jurídica antes
            de valer como termo definitivo. Não constitui aconselhamento jurídico.
          </p>
        </div>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-navy-50">
          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">1. Aceitação</h2>
            <p className="mt-2">
              Ao acessar ou usar o LeadBellus (&quot;Serviço&quot;), você concorda
              com estes Termos de Serviço. Se não concordar, não utilize o Serviço.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">2. O que é o Serviço</h2>
            <p className="mt-2">
              O LeadBellus é uma ferramenta de apoio que usa inteligência
              artificial para ajudar clínicas e profissionais de estética a
              responder mensagens de clientes no WhatsApp, gerando sugestões de
              resposta, contornos de objeção e follow-ups. É uma ferramenta de
              apoio à comunicação — não substitui o julgamento do profissional nem
              constitui aconselhamento médico, estético ou financeiro.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">3. Conta e cadastro</h2>
            <p className="mt-2">
              Você é responsável por manter a confidencialidade das suas credenciais
              e por todas as atividades realizadas na sua conta. Os dados informados
              no cadastro devem ser verdadeiros e atualizados.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">4. Planos, pagamento e cancelamento</h2>
            <p className="mt-2">
              A demonstração pública permite até 5 respostas gratuitas por navegador.
              O plano Start é uma assinatura mensal paga, cobrada via Stripe, para uso
              contínuo do gerador enquanto a assinatura estiver ativa. A assinatura é
              renovada automaticamente a cada período até que seja cancelada. Você
              pode cancelar a qualquer momento, e o acesso permanece até o fim do
              período já pago. Salvo disposição legal em contrário, não há reembolso
              proporcional de períodos já iniciados. Não armazenamos os dados do seu
              cartão — o processamento é feito pela Stripe.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">5. Uso aceitável</h2>
            <p className="mt-2">
              Você concorda em não usar o Serviço para fins ilícitos, envio de spam,
              assédio, violação de direitos de terceiros ou qualquer conduta que
              viole a legislação aplicável ou as políticas do WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">6. Conteúdo gerado por IA</h2>
            <p className="mt-2">
              As respostas são sugestões geradas por IA e devem ser revisadas antes
              do envio. O LeadBellus não garante resultados de venda, agendamento ou
              conversão. As sugestões seguem diretrizes de conformidade do setor —
              sem promessa de resultado garantido, sem preço fixo definitivo e sem
              diagnóstico médico — mas a responsabilidade final pelo conteúdo enviado
              é sua.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">7. Propriedade intelectual</h2>
            <p className="mt-2">
              O software, a marca e os materiais do LeadBellus são de titularidade do
              fornecedor. O conteúdo que você insere e as respostas geradas para o seu
              uso permanecem seus, dentro dos limites destes Termos.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">8. Limitação de responsabilidade</h2>
            <p className="mt-2">
              O Serviço é fornecido &quot;no estado em que se encontra&quot;. Na
              máxima extensão permitida em lei, o fornecedor não se responsabiliza por
              perdas indiretas, lucros cessantes ou decisões tomadas com base nas
              sugestões geradas.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">9. Rescisão</h2>
            <p className="mt-2">
              Podemos suspender ou encerrar o acesso em caso de violação destes Termos.
              Você pode encerrar sua conta a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">10. Alterações</h2>
            <p className="mt-2">
              Estes Termos podem ser atualizados. Mudanças relevantes serão
              comunicadas pelos canais oficiais. O uso continuado após a atualização
              representa concordância com a nova versão.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">11. Lei aplicável</h2>
            <p className="mt-2">
              Estes Termos são regidos pelas leis brasileiras, eleito o foro do
              domicílio do consumidor para dirimir eventuais controvérsias.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">12. Contato</h2>
            <p className="mt-2">
              Dúvidas sobre estes Termos:{" "}
              <a href="mailto:contato@leadbellus.com.br" className="text-gold-400 hover:text-gold-300 underline">
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
