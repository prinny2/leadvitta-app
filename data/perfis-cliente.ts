// Perfil da cliente — opcional no Gerador, aumenta a precisão da resposta.

export const perfisCliente = [
  {
    value: "é a primeira vez que entra em contato",
    label: "Primeira vez",
    diretriz:
      "Capriche no acolhimento e na construção de confiança; ela ainda não conhece você.",
  },
  {
    value: "já conhece a clínica",
    label: "Já conhece a clínica",
    diretriz:
      "Reforce o vínculo e o histórico; pode ser mais direta ao conduzir.",
  },
  {
    value: "veio pelo Instagram",
    label: "Veio pelo Instagram",
    diretriz:
      "Aproxime a conversa do Instagram para o atendimento; acolha e qualifique.",
  },
  {
    value: "veio por indicação",
    label: "Indicação",
    diretriz: "Valorize a indicação e a confiança que já vem com ela.",
  },
  {
    value: "parece sensível a preço",
    label: "Sensível a preço",
    diretriz:
      "Reposicione valor sobre preço (segurança, avaliação, resultado) sem brigar por desconto.",
  },
  {
    value: "parece focada em qualidade e segurança",
    label: "Focada em qualidade",
    diretriz:
      "Destaque diferenciais de segurança, avaliação individual e cuidado.",
  },
];

export const perfilPorValue = (value: string) =>
  perfisCliente.find((p) => p.value === value);
