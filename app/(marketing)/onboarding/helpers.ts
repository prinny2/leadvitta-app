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

export function fallbackResponse(c: Clinica): string {
  const treatment = getTreatment(c.como_chamar);
  const greeting = treatment ? `Oi, ${treatment}! ` : "Oi! ";
  const clinicPrefix = c.nome_clinica.trim()
    ? ` Aqui na ${c.nome_clinica.trim()}, a gente`
    : " A gente";

  return `${greeting}O valor do botox depende muito do seu objetivo e de uma avaliacao, porque cada rosto pede um cuidado diferente.${clinicPrefix} prefere te entender primeiro para indicar o que faz sentido pra voce. Quer que eu ja deixe sua avaliacao reservada?`;
}

export function getStepFromUrl(
  tabFromUrl: string | null,
  nomeClinica: string
): "clinica" | "resposta" | "planos" {
  if (!nomeClinica.trim()) return "clinica";
  if (tabFromUrl === "resposta" || tabFromUrl === "planos") return tabFromUrl;
  return "clinica";
}
