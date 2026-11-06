/**
 * Teste grátis da conta: 7 dias corridos, sem cartão, contados da primeira resposta.
 * A demo pública, sem cadastro, continua com seus 5 testes (`lib/quick-reply.ts`).
 */
// Fica separado de lib/usage-limit.ts (que puxa o firebase-admin) para a UI poder importar.
export const TRIAL_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export const TRIAL_ENDED_MESSAGE =
  "Seu teste grátis de 7 dias acabou. Assine o Start pra continuar gerando respostas ilimitadas.";

/** Instante em que o teste começou, ou null se ainda não começou (ou a data é inválida). */
export function trialStartMs(startedAt: unknown): number | null {
  if (typeof startedAt !== "string") return null;
  const ms = Date.parse(startedAt);
  return Number.isNaN(ms) ? null : ms;
}

/** Dias que faltam, arredondados para cima; teste não iniciado tem os 7 dias inteiros. */
export function trialDaysLeft(startedAt: unknown, now = Date.now()): number {
  const start = trialStartMs(startedAt);
  if (start === null) return TRIAL_DAYS;
  const left = start + TRIAL_DAYS * DAY_MS - now;
  return left <= 0 ? 0 : Math.min(TRIAL_DAYS, Math.ceil(left / DAY_MS));
}
