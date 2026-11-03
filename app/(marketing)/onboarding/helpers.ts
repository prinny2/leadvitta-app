import { ctaOptions } from "@/data/opcoes";
import type { Clinica } from "@/lib/types";

export function getTreatment(comoChamar: string): string {
  switch (comoChamar) {
    case "amor":
      return "amor";
    case "nome":
      return "Ana";
    case "nenhum":
      return "";
    default:
      return "linda";
  }
}

/** Rótulo curto do CTA (ex.: "Marcar avaliação") a partir do texto salvo. */
export function ctaLabel(value: string): string {
  const match = ctaOptions.find((option) => option.value === value);
  if (match) return match.label;
  return value.trim() || "Marcar avaliação";
}

export function fallbackResponse(c: Clinica): string {
  const treatment = getTreatment(c.como_chamar);
  const greeting = treatment ? `Oi, ${treatment}! ` : "Oi! ";
  const clinicPrefix = c.nome_clinica.trim()
    ? ` Aqui na ${c.nome_clinica.trim()}, a gente`
    : " A gente";

  return `${greeting}O valor do botox depende muito do seu objetivo e de uma avaliação, porque cada rosto pede um cuidado diferente.${clinicPrefix} prefere te entender primeiro para indicar o que faz sentido pra você. Quer que eu já deixe sua avaliação reservada?`;
}

export type OnboardingView = {
  /** Mostra a seção de planos (#planos). */
  showPlans: boolean;
  /** Planos ACIMA do teste (e com rolagem até eles). */
  plansFirst: boolean;
};

/**
 * O que a URL pede ao onboarding (`?plan=`, `?aba=`, `?checkout=`).
 *
 * Não depende de nome de clínica salvo: o funil começa colando a mensagem e
 * a pessoa pode nunca ter preenchido nada. Antes os planos só abriam com nome
 * gravado, e quem cancelava o Stripe como visitante
 * (`/onboarding?checkout=cancelado&aba=planos`) caía na etapa 1.
 */
export function resolveOnboardingView(
  planFromUrl: string | null,
  tabFromUrl: string | null,
  checkoutFromUrl: string | null
): OnboardingView {
  const plansFirst = tabFromUrl === "planos" || checkoutFromUrl === "cancelado";
  return { showPlans: plansFirst || !!planFromUrl, plansFirst };
}
