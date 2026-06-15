export type BillingPlan = "start" | "pro" | "premium";

export type CheckoutMode = "payment" | "subscription";

export type BillingPlanConfig = {
  id: BillingPlan;
  label: string;
  /** Valor mensal em reais (fonte única para UI). */
  price: number;
  /** Ex.: "R$97" (sem o "/mês"). */
  priceLabel: string;
  periodLabel: string;
  /** Frase curta de resultado, com gancho de dor. */
  tagline: string;
  /** Selo opcional (ex.: "Em breve"). */
  selo?: string;
  /** Destaca visualmente o card. */
  destaque?: boolean;
  /**
   * False = ainda não vendável (lançamento começa só pelo Start).
   * Na UI vira "Em breve" + lista de espera; o checkout recusa no servidor.
   */
  disponivel: boolean;
  features: string[];
  priceId?: string;
};

export const billingPlans: Record<BillingPlan, BillingPlanConfig> = {
  start: {
    id: "start",
    label: "Start",
    price: 97,
    priceLabel: "R$97",
    periodLabel: "/mês",
    tagline: "Pra parar de perder cliente no WhatsApp.",
    selo: "Preço de lançamento",
    destaque: true,
    disponivel: true,
    features: [
      "Respostas prontas pra preço, “achou caro” e cliente que sumiu",
      "Quebra de objeção sem soar robótico",
      "Follow-up que traz a cliente de volta",
      "Respostas por procedimento",
      "Botão copiar e colar direto no WhatsApp",
    ],
    priceId: process.env.STRIPE_PRICE_ID_START,
  },
  pro: {
    id: "pro",
    label: "Pro",
    price: 197,
    priceLabel: "R$197",
    periodLabel: "/mês",
    tagline: "Pra fechar mais em cada conversa.",
    selo: process.env.STRIPE_PRICE_ID_PRO ? undefined : "Em breve",
    disponivel: !!process.env.STRIPE_PRICE_ID_PRO,
    features: [
      "Tudo do Start",
      "Biblioteca completa de objeções",
      "Scripts de atendimento — do “oi” até o agendamento",
      "Histórico das suas melhores respostas",
      "O tom de voz da sua clínica em tudo",
    ],
    priceId: process.env.STRIPE_PRICE_ID_PRO,
  },
  premium: {
    id: "premium",
    label: "Premium",
    price: 347,
    priceLabel: "R$347",
    periodLabel: "/mês",
    tagline: "Pra não deixar nenhum agendamento na mesa.",
    selo: process.env.STRIPE_PRICE_ID_PREMIUM ? undefined : "Em breve",
    disponivel: !!process.env.STRIPE_PRICE_ID_PREMIUM,
    features: [
      "Tudo do Pro",
      "Organização automática por potencial de venda",
      "Alerta de fechamento imediato (Lead Quente)",
      "Recuperação inteligente de clientes que sumiram",
      "Priorização automática do seu time de vendas",
      "Suporte prioritário via WhatsApp",
    ],
    priceId: process.env.STRIPE_PRICE_ID_PREMIUM,
  },
};

/** Lista ordenada (Start → Pro → Premium) para renderizar os cards. */
export const billingPlanList: BillingPlanConfig[] = [
  billingPlans.start,
  billingPlans.pro,
  billingPlans.premium,
];

export function parseBillingPlan(value: unknown): BillingPlan | null {
  return value === "start" || value === "pro" || value === "premium" ? value : null;
}

export function getBillingPlan(plan: BillingPlan): BillingPlanConfig {
  return billingPlans[plan];
}

export function getStripeCheckoutMode(): CheckoutMode {
  return process.env.STRIPE_CHECKOUT_MODE === "subscription"
    ? "subscription"
    : "payment";
}
