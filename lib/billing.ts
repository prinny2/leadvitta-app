export type BillingPlan = "start" | "pro" | "premium";

export type CheckoutMode = "payment" | "subscription";

export type BillingPlanConfig = {
  id: BillingPlan;
  label: string;
  /** Valor mensal em reais (fonte única para UI). */
  price: number;
  /** Ex.: "R$297" (sem o "/mês"). */
  priceLabel: string;
  periodLabel: string;
  /** Frase curta de resultado, com gancho de dor. */
  tagline: string;
  /** Selo opcional (ex.: "Mais vendido"). */
  selo?: string;
  /** Destaca visualmente o card (topo de gama). */
  destaque?: boolean;
  features: string[];
  priceId?: string;
};

export const billingPlans: Record<BillingPlan, BillingPlanConfig> = {
  start: {
    id: "start",
    label: "Start",
    price: 297,
    priceLabel: "R$297",
    periodLabel: "/mês",
    tagline: "Pra parar de perder cliente no WhatsApp.",
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
    price: 497,
    priceLabel: "R$497",
    periodLabel: "/mês",
    tagline: "Pra fechar mais em cada conversa.",
    selo: "Mais vendido",
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
    price: 797,
    priceLabel: "R$797",
    periodLabel: "/mês",
    tagline: "Pra não deixar nenhum agendamento na mesa.",
    destaque: true,
    selo: "Mais completo",
    features: [
      "Tudo do Pro",
      "Mostra sozinho quem está quente pra fechar",
      "Score de prioridade de cada cliente",
      "Lê o clima da conversa (animada, na dúvida, fria)",
      "Identifica quem está pronto pra comprar",
      "Suporte prioritário",
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
