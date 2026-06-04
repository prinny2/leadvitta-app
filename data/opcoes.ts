// Opções de configuração e de formulário (DNA da Clínica, objetivos, etc.).

export const comoChamarOptions = [
  { value: "linda", label: "Linda" },
  { value: "amor", label: "Amor" },
  { value: "nome", label: "Pelo nome" },
  { value: "nenhum", label: "Sem apelido" },
];

/** Instrução de tratamento para o prompt, conforme o DNA da clínica. */
export function comoChamarInstrucao(value?: string, nome?: string): string {
  switch (value) {
    case "amor":
      return nome
        ? `Trate a cliente por "${nome}" e use "amor" com naturalidade.`
        : `Trate a cliente por "amor" com naturalidade.`;
    case "nome":
      return nome
        ? `Use o nome da cliente ("${nome}") sem apelidos carinhosos.`
        : `Use o nome da cliente quando houver; não use apelidos carinhosos.`;
    case "nenhum":
      return nome
        ? `Trate a cliente por "${nome}"; não use apelidos como "linda/amor".`
        : `Seja gentil, mas não use apelidos como "linda/amor".`;
    case "linda":
    default:
      return nome
        ? `Trate a cliente por "${nome}" e use "linda" com naturalidade.`
        : `Trate a cliente por "linda" com naturalidade.`;
  }
}

export const ctaOptions = [
  { value: "marcar uma avaliação", label: "Marcar avaliação" },
  { value: "ver os horários da agenda", label: "Ver agenda" },
  { value: "vir conhecer a clínica", label: "Vir conhecer" },
];

export const objetivoOptions = [
  { value: "continuar a conversa", label: "Continuar a conversa" },
  { value: "direcionar para a avaliação", label: "Direcionar para avaliação" },
  { value: "fechar o agendamento", label: "Fechar agendamento" },
  { value: "reativar o interesse", label: "Reativar interesse" },
];

export const oQueMelhorarOptions = [
  { value: "está fria ou seca", label: "Está fria/seca" },
  { value: "jogou o preço cedo demais", label: "Jogou o preço cedo demais" },
  { value: "não tem chamada para ação (CTA)", label: "Não tem CTA" },
  { value: "parece robótica", label: "Parece robótica" },
  { value: "quero mais persuasão", label: "Quero mais persuasão" },
  { value: "quero mais acolhimento", label: "Quero mais acolhimento" },
];

export const followupContextoOptions = [
  { value: "ela perguntou o preço", label: "Perguntou o preço" },
  { value: "ela disse que ia pensar", label: "Disse que ia pensar" },
  { value: "ela agendou e sumiu", label: "Agendou e sumiu" },
  { value: "ela disse que ia falar com alguém", label: "Ia falar com alguém" },
  { value: "ela simplesmente parou de responder", label: "Parou de responder" },
];

/** Descreve a formalidade (slider 0–100) em texto para o prompt e a UI. */
export function formalidadeLabel(n: number): string {
  if (n < 25) return "Bem íntimo e acolhedor";
  if (n < 50) return "Próximo e caloroso";
  if (n < 75) return "Equilibrado (caloroso, mas profissional)";
  return "Mais formal e técnico";
}
