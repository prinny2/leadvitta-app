// Módulo 2 — Biblioteca de objeções (estática, sem IA).
// Respostas prontas para copiar e colar, seguindo a fórmula e o compliance.

export type ObjecaoItem = {
  gatilho: string;
  resposta: string;
};

export type CategoriaObjecao = {
  id: string;
  titulo: string;
  itens: ObjecaoItem[];
};

export const objecoes: CategoriaObjecao[] = [
  {
    id: "preco",
    titulo: "Preço",
    itens: [
      {
        gatilho: "Está caro.",
        resposta:
          "Entendo você 😊 Mais do que o valor, o que pesa aqui é a segurança e o cuidado com o seu resultado: cada caso é avaliado individualmente para indicar o que realmente faz sentido pra você. Posso te explicar como funciona a avaliação e o que está incluído?",
      },
      {
        gatilho: "Na outra clínica é mais barato.",
        resposta:
          "Imagino que você queira o melhor custo e, principalmente, segurança 💕 Cada lugar tem sua forma de trabalhar — aqui a gente preza por avaliação individual, profissional responsável e produtos de qualidade, porque isso faz toda diferença no resultado e na sua tranquilidade. Quer que eu te explique como conduzimos?",
      },
      {
        gatilho: "Tem desconto?",
        resposta:
          "A gente sempre tenta facilitar pra você 😊 Temos condições de pagamento e, na avaliação, consigo te mostrar a melhor forma de encaixar no seu momento. Quer que eu veja um horário pra te explicar tudo certinho?",
      },
      {
        gatilho: "Faz por menos?",
        resposta:
          "Eu entendo 🙏 O valor reflete a segurança, a avaliação individual e o cuidado com o seu resultado. O que posso fazer é te mostrar as condições de pagamento na avaliação, pra ficar tranquilo pra você. Quer que eu te explique?",
      },
      {
        gatilho: "Vou pensar.",
        resposta:
          "Claro, é uma decisão sua e faz todo sentido querer pensar 😊 Se quiser, posso te explicar melhor como funciona a avaliação e tirar qualquer dúvida agora — assim você pensa com todas as informações. O que te deixaria mais segura?",
      },
      {
        gatilho: "Só queria saber o valor.",
        resposta:
          "Te explico sim 😊 O valor depende da avaliação e do seu objetivo, porque cada caso é único. Me conta rapidinho o que você gostaria de tratar/melhorar? Assim consigo te orientar com bem mais precisão.",
      },
    ],
  },
  {
    id: "medo",
    titulo: "Medo",
    itens: [
      {
        gatilho: "Dói?",
        resposta:
          "Que bom que você perguntou 💕 A gente faz tudo pensando no seu conforto, com técnica e cuidado para minimizar a sensação. Cada pessoa sente de um jeito, e na avaliação te explico exatamente como é o passo a passo. Quer que eu te conte como funciona?",
      },
      {
        gatilho: "Tenho medo de ficar artificial.",
        resposta:
          "Esse cuidado é ótimo e a gente compartilha dele 😊 O foco aqui é justamente a naturalidade: por isso a avaliação é tão importante, para respeitar suas características e o seu objetivo. Quer que eu te explique como buscamos um resultado natural pra você?",
      },
      {
        gatilho: "Tenho medo de dar errado.",
        resposta:
          "Entendo totalmente, é natural sentir isso 🙏 Por isso trabalhamos com avaliação individual e responsabilidade em cada etapa, pra você decidir com segurança e tranquilidade. Posso te explicar como conduzimos cada passo?",
      },
      {
        gatilho: "E se eu não gostar?",
        resposta:
          "Sua tranquilidade vem em primeiro lugar 💕 Na avaliação alinhamos suas expectativas e o que é possível no seu caso, justamente pra você se sentir segura na decisão. Quer que eu veja um horário pra conversarmos sobre o que você deseja?",
      },
      {
        gatilho: "Tem risco?",
        resposta:
          "Pergunta importante 😊 Como todo procedimento, a segurança vem da avaliação individual, da indicação correta e do cuidado profissional — e é exatamente assim que trabalhamos. Na avaliação te explico tudo com transparência. Quer que eu te oriente?",
      },
    ],
  },
  {
    id: "confianca",
    titulo: "Confiança",
    itens: [
      {
        gatilho: "Você tem antes e depois?",
        resposta:
          "Tenho sim 😊 Posso te mostrar alguns casos respeitando a privacidade das clientes. Lembrando que cada pessoa é única e o resultado varia conforme a avaliação. Quer que eu te envie alguns exemplos e já veja um horário pra avaliarmos o seu caso?",
      },
      {
        gatilho: "Quem realiza o procedimento?",
        resposta:
          "Ótima pergunta 💕 O procedimento é realizado por profissional habilitado e responsável, com avaliação individual antes de qualquer coisa. Quer que eu te explique como funciona o atendimento aqui?",
      },
      {
        gatilho: "Qual produto você usa?",
        resposta:
          "A gente trabalha com produtos de qualidade e a escolha é definida na avaliação, conforme o seu caso e objetivo 😊 Quer que eu te explique as opções na avaliação?",
      },
      {
        gatilho: "É seguro?",
        resposta:
          "A segurança é a nossa prioridade 🙏 Ela vem da avaliação individual, da indicação correta e do cuidado em cada etapa. Na avaliação te explico tudo com transparência. Quer que eu te oriente sobre o próximo passo?",
      },
      {
        gatilho: "Tem registro?",
        resposta:
          "Sim, trabalhamos com responsabilidade e dentro das boas práticas 😊 Na avaliação você conhece a estrutura e tira todas as dúvidas com tranquilidade. Quer que eu veja um horário pra você?",
      },
    ],
  },
  {
    id: "agendamento",
    titulo: "Agendamento",
    itens: [
      {
        gatilho: "Tem horário hoje?",
        resposta:
          "Deixa eu verificar pra você agora mesmo 😊 Me confirma: você prefere de manhã ou à tarde? Assim já encaixo o melhor horário disponível.",
      },
      {
        gatilho: "Só posso sábado.",
        resposta:
          "Perfeito, vamos achar um sábado que funcione pra você 💕 Você prefere começo da manhã ou mais pro fim da tarde? Já reservo pra você.",
      },
      {
        gatilho: "Vou ver minha agenda.",
        resposta:
          "Claro 😊 Se quiser, já deixo dois horários separados pra você e você me confirma qual encaixa melhor. Prefere início ou fim da semana?",
      },
      {
        gatilho: "Depois eu marco.",
        resposta:
          "Sem problema 💕 Pra facilitar, posso já deixar um horário pré-reservado pra você não perder a vaga — e você confirma quando puder. Prefere essa ou a próxima semana?",
      },
      {
        gatilho: "Preciso falar com meu marido.",
        resposta:
          "Faz todo sentido conversar com calma 😊 Se ajudar, posso te enviar as informações certinhas pra vocês decidirem juntos, e já deixo um horário sugerido. O que acha?",
      },
    ],
  },
  {
    id: "pos_venda",
    titulo: "Pós-venda",
    itens: [
      {
        gatilho: "Achei que ia ficar diferente.",
        resposta:
          "Obrigada por compartilhar comigo 💕 Quero entender certinho a sua expectativa pra te orientar da melhor forma. Muitos resultados são progressivos e às vezes um retorno de avaliação ajuda bastante. Podemos marcar um horário pra eu te acompanhar de perto?",
      },
      {
        gatilho: "É normal ficar inchado?",
        resposta:
          "Em muitos procedimentos um inchaço nos primeiros dias é esperado 😊 Mas cada caso é único — me conta como está e desde quando? Se precisar, agendo um retorno pra te avaliar com cuidado e te deixar tranquila.",
      },
      {
        gatilho: "Quando vejo resultado?",
        resposta:
          "Ótima pergunta 💕 O tempo varia conforme o procedimento e o seu organismo — alguns são mais imediatos, outros progressivos. Posso te passar as orientações do seu caso e marcar um acompanhamento pra avaliarmos sua evolução. Quer?",
      },
      {
        gatilho: "Preciso retornar?",
        resposta:
          "Na maioria dos casos o retorno faz parte do cuidado e ajuda a acompanhar seu resultado 😊 Quer que eu já veja um horário de retorno pra você?",
      },
    ],
  },
];

export const categoriaPorId = (id: string) => objecoes.find((c) => c.id === id);
