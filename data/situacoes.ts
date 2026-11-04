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
      "Valorizar o serviço sem desvalorizá-lo. Não prometer desconto nem condição de pagamento que não foi informada; dizer que vai verificar o que é possível e reforçar o cuidado e a segurança. Manter percepção premium.",
  },
  {
    id: "dor",
    label: "Quer saber se dói",
    diretriz:
      "Acolher o receio. Explicar com honestidade e cuidado, sem prometer 'não dói'. Falar de acolhimento e de que o conforto é conversado na avaliação, sem citar anestesia, técnica ou produto que não foram informados.",
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
      "Não afirmar parcelamento nem número de parcelas que não foram informados. Dizer que vai confirmar as formas de pagamento e conduzir para a avaliação, onde os detalhes do valor são acertados.",
  },
  {
    id: "antes_depois",
    label: "Quer ver antes e depois",
    diretriz:
      "Não afirmar que há fotos ou casos para mostrar; dizer que vai verificar o que pode compartilhar, respeitando a privacidade das clientes. Reforçar que cada caso é único e que o resultado varia. Conduzir para a avaliação.",
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
      "Facilitar ao máximo. Confirmar qual procedimento ela quer, perguntar a preferência de dia e período e dizer que vai verificar a agenda, de forma objetiva e gentil, sem citar horários específicos, a menos que a própria profissional os tenha informado.",
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
      "Não desvalorizar o serviço. Não afirmar promoção nem condição que não foi informada; falar do valor entregue (segurança/avaliação) e conduzir para a avaliação.",
  },
  {
    id: "comparou",
    label: "Comparou com outra clínica",
    diretriz:
      "Nunca falar mal da concorrência. Reforçar segurança, avaliação individual e valor acima do preço, sem citar marcas, formação ou números que não foram informados.",
  },
  {
    id: "pos_atendimento",
    label: "Pós-atendimento",
    diretriz:
      "Demonstrar cuidado e acompanhamento. Lembrar de seguir as orientações já passadas pela profissional, sem criar orientação nova; dúvida clínica vai para a profissional. Abrir canal para dúvidas, com carinho.",
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
      "Reaproximar com carinho, lembrando do cuidado contínuo. Convidar para um retorno sem soar invasivo, sem citar novidade que não foi informada.",
  },
];

export const situacaoPorId = (id: string) =>
  situacoes.find((s) => s.id === id);
