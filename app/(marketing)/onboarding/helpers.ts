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

/**
 * Etapa pedida pela URL (`?plan=` / `?aba=`).
 *
 * `knownClinicName` é o nome JÁ GRAVADO (rascunho local ou Firestore) — nunca o
 * que está sendo digitado. Sem essa distinção, o funil reagia a cada tecla e
 * arrancava a pessoa da etapa 1 no meio do preenchimento.
 */
export function resolveUrlStep(
  planFromUrl: string | null,
  tabFromUrl: string | null,
  knownClinicName: string
): "clinica" | "resposta" | "planos" {
  if (!knownClinicName.trim()) return "clinica";
  if (planFromUrl) return "planos";
  return getStepFromUrl(tabFromUrl, knownClinicName);
}

export function getStepFromUrl(
  tabFromUrl: string | null,
  nomeClinica: string
): "clinica" | "resposta" | "planos" {
  if (!nomeClinica.trim()) return "clinica";
  if (tabFromUrl === "resposta" || tabFromUrl === "planos") return tabFromUrl;
  return "clinica";
}
