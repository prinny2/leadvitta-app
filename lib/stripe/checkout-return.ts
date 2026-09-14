/**
 * Para onde o Stripe Checkout devolve a pessoa depois de pagar ou desistir.
 *
 * A origem é um enum fechado (nunca uma URL vinda do cliente) justamente para
 * não abrir redirecionamento arbitrário: o cliente só diz "de onde veio" e o
 * servidor escolhe o caminho.
 */
export type CheckoutOrigin = "onboarding" | "app";

const CHECKOUT_ORIGINS: readonly CheckoutOrigin[] = ["onboarding", "app"];

export function parseCheckoutOrigin(value: unknown): CheckoutOrigin | null {
  return typeof value === "string" &&
    (CHECKOUT_ORIGINS as readonly string[]).includes(value)
    ? (value as CheckoutOrigin)
    : null;
}

export type CheckoutReturnPaths = {
  successPath: string;
  cancelPath: string;
};

/**
 * `signedIn` decide o sucesso: quem pagou sem conta precisa criar uma com o
 * mesmo e-mail para liberar o acesso; quem já está logado volta para as
 * configurações, onde o plano aparece.
 *
 * `origin` decide o cancelamento: quem desistiu dentro do funil de onboarding
 * volta para a etapa de planos (antes caía na landing e perdia o progresso
 * visível do funil).
 */
export function buildCheckoutReturnPaths({
  origin,
  signedIn,
}: {
  origin: CheckoutOrigin | null;
  signedIn: boolean;
}): CheckoutReturnPaths {
  const successPath = signedIn
    ? "/configuracoes?checkout=sucesso&session_id={CHECKOUT_SESSION_ID}"
    : "/signup?checkout=sucesso&session_id={CHECKOUT_SESSION_ID}";

  if (origin === "onboarding") {
    return {
      successPath,
      cancelPath: "/onboarding?aba=planos&checkout=cancelado",
    };
  }

  return {
    successPath,
    cancelPath: signedIn ? "/configuracoes?checkout=cancelado" : "/#demo",
  };
}
