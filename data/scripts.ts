// Módulo de Scripts — fluxos prontos de venda por WhatsApp (estáticos).
// Cada fluxo segue: acolher -> investigar -> orientar -> direcionar.
// A cliente não compra uma resposta; compra um caminho de atendimento.

export type PassoScript = {
  etapa: string;
  mensagem: string;
  /** Intervalo sugerido antes de enviar este passo. */
  intervalo: string;
};

export type Script = {
  id: string;
  titulo: string;
  descricao: string;
  passos: PassoScript[];
};

export const scripts: Script[] = [
  {
    id: "perguntou_preco",
    titulo: "Cliente perguntou o preço",
    descricao: "Quando ela só pergunta 'quanto custa?' antes de qualquer contexto.",
    passos: [
      {
        etapa: "Acolher",
        intervalo: "Assim que ela enviar",
        mensagem:
          "Oi! Te explico sim 😊 Antes de te passar certinho, me conta: você já fez esse procedimento antes ou seria a primeira vez?",
      },
      {
        etapa: "Investigar",
        intervalo: "Logo após a resposta dela",
        mensagem:
          "Entendi! E hoje o que mais te incomoda ou o que você gostaria de melhorar?",
      },
      {
        etapa: "Orientar",
        intervalo: "Na sequência da conversa",
        mensagem:
          "Perfeito. Nesse caso, o ideal é fazermos uma avaliação pra entender o melhor procedimento e a quantidade necessária — assim evitamos indicar algo que talvez não seja o mais adequado pra você.",
      },
      {
        etapa: "Direcionar",
        intervalo: "Ainda na mesma conversa",
        mensagem:
          "Tenho horários de avaliação essa semana. Você prefere de manhã ou à tarde?",
      },
    ],
  },
  {
    id: "achou_caro",
    titulo: "Cliente achou caro",
    descricao: "Reposicionar de preço para valor sem brigar por desconto.",
    passos: [
      {
        etapa: "Acolher",
        intervalo: "Assim que ela enviar",
        mensagem: "Entendo você 😊 É super válido pensar no investimento.",
      },
      {
        etapa: "Investigar",
        intervalo: "Logo em seguida",
        mensagem:
          "Me conta: o que é mais importante pra você nesse momento — o resultado, a segurança ou caber no orçamento agora?",
      },
      {
        etapa: "Orientar",
        intervalo: "Na sequência",
        mensagem:
          "Aqui a gente preza pela avaliação individual e pelo cuidado em cada etapa, porque é isso que protege o seu resultado. E temos condições de pagamento pra facilitar.",
      },
      {
        etapa: "Direcionar",
        intervalo: "Ainda na mesma conversa",
        mensagem:
          "Que tal fazermos uma avaliação pra eu te mostrar exatamente o que faz sentido pra você e as condições? Prefere essa semana ou a próxima?",
      },
    ],
  },
  {
    id: "instagram",
    titulo: "Cliente nova vinda do Instagram",
    descricao: "Trazer a conversa do Instagram para o atendimento.",
    passos: [
      {
        etapa: "Acolher",
        intervalo: "Assim que ela chamar",
        mensagem:
          "Oi! Que bom te ver por aqui 😊 Vi que você se interessou pelo nosso conteúdo. Posso te ajudar a entender o que faz mais sentido pra você?",
      },
      {
        etapa: "Investigar",
        intervalo: "Logo em seguida",
        mensagem:
          "Me conta o que você gostaria de tratar ou melhorar? Assim te oriento certinho.",
      },
      {
        etapa: "Orientar",
        intervalo: "Na sequência",
        mensagem:
          "Perfeito. O ideal é uma avaliação pra entender seu caso e indicar o melhor caminho com segurança.",
      },
      {
        etapa: "Direcionar",
        intervalo: "Ainda na mesma conversa",
        mensagem:
          "Tenho horários essa semana. Prefere começo ou fim de semana? Já reservo pra você 💕",
      },
    ],
  },
  {
    id: "reativacao",
    titulo: "Reativação de cliente antiga",
    descricao: "Reaproximar quem não volta há um tempo.",
    passos: [
      {
        etapa: "Acolher",
        intervalo: "Quando fizer sentido reaproximar",
        mensagem:
          "Oi! Saudades de você por aqui 💕 Passando pra saber como você está e se está cuidando da sua pele/autoestima ultimamente.",
      },
      {
        etapa: "Investigar",
        intervalo: "Após a resposta dela",
        mensagem:
          "Tem algo que você gostaria de retomar ou melhorar nesse momento?",
      },
      {
        etapa: "Direcionar",
        intervalo: "Na sequência",
        mensagem:
          "Se quiser, posso reservar um horário de avaliação pra a gente conversar com calma e ver o melhor pra você. O que acha?",
      },
    ],
  },
];

export const scriptPorId = (id: string) => scripts.find((s) => s.id === id);
