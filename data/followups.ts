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
];

export const followUpPorId = (id: string) => followups.find((f) => f.id === id);
