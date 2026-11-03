// Os 7 gatilhos de follow-up. A `diretriz` orienta a IA na reativação.

export type FollowUp = {
  id: string;
  label: string;
  diretriz: string;
};

export const followups: FollowUp[] = [
  {
    id: "sumiu_1h",
    label: "Sumiu há 1 hora",
    diretriz:
      "Conversa ainda quente. Retomar de forma leve, tirar uma dúvida pontual e manter o diálogo aberto, sem pressa.",
  },
  {
    id: "sumiu_1d",
    label: "Sumiu há 1 dia",
    diretriz:
      "Relembrar o interesse com gentileza, mostrar disponibilidade para ajudar e oferecer um próximo passo simples. Baixa pressão.",
  },
  {
    id: "sumiu_3d",
    label: "Sumiu há 3 dias",
    diretriz:
      "Reaquecer trazendo valor (segurança, cuidado, avaliação). Mostrar que é normal querer pensar e oferecer uma avaliação para esclarecer.",
  },
  {
    id: "sumiu_7d",
    label: "Sumiu há 7 dias",
    diretriz:
      "Última reativação suave. Oferecer uma condição/horário de avaliação e deixar a porta aberta com carinho, sem insistência.",
  },
  {
    id: "cliente_antiga",
    label: "Cliente antiga",
    diretriz:
      "Reaproximar com afeto, lembrando do cuidado contínuo. Trazer uma novidade ou convite de retorno, valorizando o vínculo.",
  },
  {
    id: "orcou_nao_fechou",
    label: "Orçou e não fechou",
    diretriz:
      "Retomar do ponto onde parou, ajudar a resolver a possível objeção (valor, medo, agenda) e conduzir para a avaliação.",
  },
  {
    id: "fez_nao_voltou",
    label: "Fez procedimento e não voltou",
    diretriz:
      "Falar de manutenção e continuidade do resultado. Convidar para um retorno de acompanhamento de forma cuidadosa.",
  },
  {
    id: "retorno_procedimento",
    label: "Retorno pós-procedimento",
    diretriz: "Faça um contato cuidadoso, pergunte como ela está se sentindo e se surgiu alguma dúvida. Nunca prometa ou avalie resultados, diagnostique, sugira novo procedimento ou preço. Se algo incomodar, convide-a a conversar com a profissional ou ir à clínica. Quando o objetivo mencionar foto, peça apenas para acompanhar a evolução e deixe claro que não será usada em publicidade sem autorização escrita separada.",
  },
  {
    id: "avaliacao_nao_fechou_48h",
    label: "Fez avaliação e não fechou (48h)",
    diretriz: "Retome com leveza e sem pressão, lembre o que foi conversado na avaliação, ofereça esclarecer dúvidas e proponha um próximo passo simples. Não confunda com acompanhamento pós-procedimento.",
  },
  {
    id: "avaliacao_nao_fechou_7d",
    label: "Fez avaliação e não fechou (7 dias)",
    diretriz: "Retome com leveza e sem pressão, lembre o que foi conversado na avaliação, ofereça esclarecer dúvidas e proponha um próximo passo simples. Não confunda com acompanhamento pós-procedimento.",
  },
];

export const followUpPorId = (id: string) =>
  followups.find((f) => f.id === id);
