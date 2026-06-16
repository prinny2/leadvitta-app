import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — LeadBellus",
  description: "Política de Privacidade do LeadBellus (LGPD).",
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-navy-900">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <Link href="/" className="text-sm font-medium text-gold-400 hover:text-gold-300">
          ← Voltar ao início
        </Link>

        <h1 className="mt-6 font-serif text-3xl font-semibold text-champagne-300 sm:text-4xl">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-xs text-navy-100">Última atualização: junho de 2026</p>

        <div className="mt-6 rounded-2xl border border-gold-500/30 bg-gold-500/10 px-4 py-3">
          <p className="text-sm font-semibold text-gold-300">⚠️ Rascunho para revisão</p>
          <p className="mt-1 text-xs leading-relaxed text-champagne-300">
            Este documento é um modelo inicial à luz da LGPD e precisa de revisão
            jurídica antes de valer como política definitiva. Confirme os operadores
            e dados efetivamente usados antes de publicar.
          </p>
        </div>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-navy-50">
          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">1. Controlador</h2>
            <p className="mt-2">
              O tratamento dos dados é realizado por Vinicius Paes da Serra Freire
              (MEI), responsável pelo LeadBellus. Contato:{" "}
              <a href="mailto:contato@leadbellus.com.br" className="text-gold-400 hover:text-gold-300 underline">
                contato@leadbellus.com.br
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">2. Dados que coletamos</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong className="text-champagne-300">Cadastro:</strong> nome, e-mail e dados da clínica informados por você.</li>
              <li><strong className="text-champagne-300">Uso:</strong> histórico de respostas geradas e configurações da conta.</li>
              <li><strong className="text-champagne-300">Mensagens:</strong> o texto das mensagens que você submete é processado para gerar as respostas.</li>
              <li><strong className="text-champagne-300">Pagamento:</strong> processado pela Stripe. Não armazenamos os dados do seu cartão.</li>
              <li><strong className="text-champagne-300">Técnicos:</strong> dados de navegação e métricas de uso.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">3. Finalidades e bases legais</h2>
            <p className="mt-2">
              Tratamos os dados para prestar o Serviço e processar pagamentos
              (execução de contrato), enviar comunicações e melhorar o produto
              (legítimo interesse) e para finalidades em que você consentir. Você pode
              revogar o consentimento a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">4. Compartilhamento com operadores</h2>
            <p className="mt-2">
              Compartilhamos dados apenas com operadores necessários ao funcionamento
              do Serviço, como: provedores de IA (para gerar as respostas),
              processador de pagamento (Stripe), infraestrutura de autenticação e
              banco de dados (Google Firebase) e provedor de mensageria do WhatsApp.
              Cada operador trata os dados conforme suas próprias políticas.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">5. Transferência internacional</h2>
            <p className="mt-2">
              Alguns operadores estão sediados fora do Brasil. Nesses casos, a
              transferência ocorre com as garantias previstas na LGPD.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">6. Cookies e análises</h2>
            <p className="mt-2">
              Podemos usar cookies e ferramentas de análise (como Google Analytics e
              Meta Pixel) para medir o uso e melhorar a experiência. Você pode
              gerenciar cookies nas configurações do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">7. Seus direitos (LGPD)</h2>
            <p className="mt-2">
              Você pode solicitar acesso, correção, exclusão, anonimização,
              portabilidade dos seus dados e revogação de consentimento, conforme o
              art. 18 da LGPD. Para exercê-los, escreva para{" "}
              <a href="mailto:contato@leadbellus.com.br" className="text-gold-400 hover:text-gold-300 underline">
                contato@leadbellus.com.br
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">8. Retenção</h2>
            <p className="mt-2">
              Mantemos os dados pelo tempo necessário às finalidades descritas e às
              obrigações legais. Após o encerramento da conta, os dados são eliminados
              ou anonimizados, salvo quando a guarda for exigida por lei.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">9. Segurança</h2>
            <p className="mt-2">
              Adotamos medidas técnicas e organizacionais para proteger os dados, como
              controle de acesso e isolamento por conta. Nenhum sistema é 100% imune,
              mas trabalhamos para reduzir riscos.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-champagne-200">10. Alterações</h2>
            <p className="mt-2">
              Esta Política pode ser atualizada. Mudanças relevantes serão comunicadas
              pelos canais oficiais.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
