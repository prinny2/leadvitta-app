// As 16 situações de atendimento. A `diretriz` orienta a IA sobre como conduzir.

export type Situacao = {
  id: string;
  label: string;
  diretriz: string;
};

export const situacoes: Situacao[] = [
  {
    id: "preco",
    label: "Perguntou o preço",
    diretriz:
      "Não cravar valor fixo. Contextualizar que depende da avaliação, do objetivo e da necessidade. Fazer uma pergunta estratégica sobre o objetivo e conduzir para a avaliação.",
  },
  {
    id: "achou_caro",
    label: "Achou caro",
    diretriz:
      "Reposicionar de preço para valor: segurança, avaliação individual, naturalidade e resultado. Nunca brigar por preço nem desvalorizar o serviço. Reforçar a importância da avaliação.",
  },
  {
    id: "sumiu",
    label: "Sumiu / não respondeu",
    diretriz:
      "Reabrir a conversa com leveza, sem cobrança ou culpa. Relembrar o interesse, mostrar disponibilidade para ajudar e oferecer um próximo passo simples.",
  },
  {
    id: "desconto",
    label: "Pediu desconto",
    diretriz:
      "Valorizar o serviço sem desvalorizá-lo. Em vez de desconto, oferecer condição (parcelamento, avaliação) e reforçar o cuidado e a segurança. Manter percepção premium.",
  },
  {
    id: "dor",
    label: "Quer saber se dói",
    diretriz:
      "Acolher o receio. Explicar com honestidade e cuidado, sem prometer 'não dói'. Falar de conforto, técnica e da avaliação para esclarecer o caso dela.",
  },
  {
    id: "medo",
    label: "Tem medo do procedimento",
    diretriz:
      "Validar o medo com empatia. Transmitir segurança e naturalidade SEM dar garantias. Convidar para a avaliação como forma de esclarecer e decidir com tranquilidade.",
  },
  {
    id: "parcelar",
    label: "Quer parcelar",
    diretriz:
      "Confirmar que há formas de pagamento facilitadas e conduzir para a avaliação, onde os detalhes do valor e do parcelamento são acertados.",
  },
  {
    id: "antes_depois",
    label: "Quer ver antes e depois",
    diretriz:
      "Oferecer mostrar casos respeitando a privacidade das clientes. Reforçar que cada caso é único e que o resultado varia. Conduzir para a avaliação.",
  },
  {
    id: "instagram",
    label: "Perguntou pelo Instagram",
    diretriz:
      "Acolher e aproximar a conversa. Trazer com naturalidade para um atendimento mais próximo (WhatsApp/avaliação) sem soar automático.",
  },
  {
    id: "agendar",
    label: "Quer agendar",
    diretriz:
      "Facilitar ao máximo. Confirmar o procedimento/avaliação e oferecer opções de horário de forma objetiva e gentil.",
  },
  {
    id: "desmarcou",
    label: "Desmarcou",
    diretriz:
      "Acolher sem culpa. Mostrar compreensão e oferecer remarcar, mantendo a porta aberta e o vínculo.",
  },
  {
    id: "promocao",
    label: "Quer promoção",
    diretriz:
      "Não desvalorizar o serviço. Falar de condições e do valor entregue (segurança/avaliação) e conduzir para a avaliação.",
  },
  {
    id: "comparou",
    label: "Comparou com outra clínica",
    diretriz:
      "Nunca falar mal da concorrência. Reforçar diferenciais (segurança, avaliação individual, profissional responsável, produtos) e valor acima do preço.",
  },
  {
    id: "pos_atendimento",
    label: "Pós-atendimento",
    diretriz:
      "Demonstrar cuidado e acompanhamento. Reforçar orientações pós-procedimento e abrir canal para dúvidas, com carinho.",
  },
  {
    id: "pedir_avaliacao",
    label: "Pedir avaliação (review)",
    diretriz:
      "Após um bom atendimento, pedir o feedback/avaliação de forma gentil e simples, agradecendo a confiança.",
  },
  {
    id: "reativar",
    label: "Reativar cliente antiga",
    diretriz:
      "Reaproximar com carinho, lembrando do cuidado contínuo. Oferecer um retorno ou novidade sem soar invasivo.",
  },
];

export const situacaoPorId = (id: string) =>
  situacoes.find((s) => s.id === id);
