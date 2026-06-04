// Os 8 tons de voz. A `instrucao` entra no prompt para moldar o estilo do texto.

export type Tom = {
  id: string;
  label: string;
  instrucao: string;
};

export const tons: Tom[] = [
  {
    id: "acolhedor",
    label: "Acolhedor",
    instrucao:
      "Calor humano, empatia e proximidade. Faça a cliente se sentir cuidada. Emojis suaves com moderação.",
  },
  {
    id: "profissional",
    label: "Profissional",
    instrucao:
      "Técnico, seguro e confiável, transmitindo credibilidade. Pouco ou nenhum emoji.",
  },
  {
    id: "persuasivo",
    label: "Persuasivo",
    instrucao:
      "Conduz à ação com convicção, destacando valor e benefício. Persuasivo, nunca agressivo ou insistente.",
  },
  {
    id: "premium",
    label: "Premium",
    instrucao:
      "Sofisticado, elegante e exclusivo. Foco em experiência, cuidado e excelência. Linguagem refinada, emojis raros.",
  },
  {
    id: "direto",
    label: "Direto",
    instrucao:
      "Objetivo, frases curtas, sem rodeios — mantendo gentileza e clareza.",
  },
  {
    id: "delicado",
    label: "Delicado",
    instrucao:
      "Suave e cuidadoso, ideal para clientes inseguras ou com medo. Muita sensibilidade.",
  },
  {
    id: "humanizado",
    label: "Humanizado",
    instrucao:
      "Coloquial e próximo, como uma conversa natural de pessoa para pessoa. Nada robótico.",
  },
  {
    id: "urgencia_leve",
    label: "Urgência leve",
    instrucao:
      "Cria um leve senso de oportunidade (horários, agenda) para estimular a ação, SEM pressão agressiva.",
  },
];

export const tomPorId = (id: string) => tons.find((t) => t.id === id);
