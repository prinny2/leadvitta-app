// Calendário editorial de posts orgânicos (Facebook + Instagram) publicados
// automaticamente pelo cron /api/marketing/social-post. Datas no fuso
// America/Belem (YYYY-MM-DD). Post sem imagemUrl sai só no Facebook — o
// Instagram exige imagem. Edite/adicione posts aqui; o cron cuida do resto.

export type CanalSocial = "facebook" | "instagram";

export type SocialPost = {
  id: string;
  /** Data de publicação (YYYY-MM-DD, fuso America/Belem). */
  data: string;
  canais: CanalSocial[];
  texto: string;
  /** URL pública da arte. Obrigatória para Instagram. */
  imagemUrl?: string;
  /** Link anexado ao post do Facebook (feed). */
  link?: string;
};

const LP = "https://www.leadbellus.com.br";
const utm = (campanha: string, source: string) =>
  `${LP}/?utm_source=${source}&utm_medium=organic&utm_campaign=${campanha}`;

// Artes de public/social (geradas por scripts/social-art/render.mjs). São JPEG
// porque a API de publicação do Instagram só aceita JPEG na image_url, e só as
// proporções 4:5 e 1:1 passam na validação do feed — nunca use arte 9:16 aqui.
const arte = (nome: string) => `${LP}/social/${nome}.jpg`;

export const SOCIAL_POSTS: SocialPost[] = [
  {
    id: "2026-07-06-quanto-custa",
    data: "2026-07-06",
    canais: ["facebook"],
    texto:
      'Cliente perguntou "quanto custa?" e você travou? 😬\n\nÉ nessa hora que a maioria das clínicas perde a venda: responde só o preço e a conversa morre.\n\nO LeadBellus te entrega 3 respostas prontas — uma suave, uma consultiva e uma de fechamento — no tom da sua clínica, pra colar direto no WhatsApp.\n\nTeste grátis, sem cartão 👇',
    link: utm("calendario_julho", "facebook"),
  },
  {
    id: "2026-07-08-achou-caro",
    data: "2026-07-08",
    canais: ["facebook"],
    texto:
      '"Achou caro" não é NÃO. É pedido de contexto. 💡\n\nAntes de sair dando desconto, mostre o valor do seu trabalho: avaliação, segurança, resultado natural.\n\nO LeadBellus escreve essa resposta pra você em segundos — sem parecer robô e sem prometer o impossível.\n\nTeste grátis no link 👇',
    link: utm("calendario_julho", "facebook"),
  },
  {
    id: "2026-07-10-cliente-sumiu",
    data: "2026-07-10",
    canais: ["facebook"],
    texto:
      "Cliente pediu o preço, disse \"vou ver e te falo\"… e sumiu? 👻\n\nUm follow-up leve, no momento certo, recupera muita conversa dada como perdida. A regra: chamar de volta sem pressionar e com um próximo passo claro.\n\nO LeadBellus gera esse follow-up pronto pra você. Teste grátis 👇",
    link: utm("calendario_julho", "facebook"),
  },
  {
    id: "2026-07-13-publico-masculino",
    data: "2026-07-13",
    canais: ["facebook"],
    texto:
      "O público masculino é o que mais cresce na estética: botox pra bruxismo, barba, queda capilar, skincare. 📈\n\nMas homem conversa diferente no WhatsApp — mais direto, menos emoji, decisão mais rápida.\n\nO LeadBellus ajusta o tom da resposta pra cada cliente, ela ou ele. Conheça 👇",
    link: utm("calendario_julho", "facebook"),
  },
  {
    id: "2026-07-15-compliance",
    data: "2026-07-15",
    canais: ["facebook"],
    texto:
      "Responder rápido não pode virar responder errado. ⚠️\n\nPrometer resultado garantido, dar preço fechado sem avaliação ou opinar como diagnóstico é risco pra sua clínica.\n\nToda resposta do LeadBellus já sai dentro dessas regras — persuasiva, mas segura. Teste grátis 👇",
    link: utm("calendario_julho", "facebook"),
  },
  {
    id: "2026-07-17-3-respostas",
    data: "2026-07-17",
    canais: ["facebook"],
    texto:
      "Por que 3 respostas e não 1? 🤔\n\nPorque cada conversa pede um tom: tem cliente que precisa de acolhimento (Suave), tem quem precisa entender o processo (Consultiva) e tem quem só falta o empurrãozinho (Fechamento).\n\nVocê lê a conversa, escolhe a certa e cola. Simples assim 👇",
    link: utm("calendario_julho", "facebook"),
  },
  {
    id: "2026-07-20-demo",
    data: "2026-07-20",
    canais: ["facebook"],
    texto:
      "Quer ver funcionando antes de criar conta? 👀\n\nNa nossa página tem uma demo gratuita: você escolhe a situação (preço, objeção, cliente sumiu) e vê a resposta que a sua clínica mandaria.\n\nSem cadastro, sem cartão. Só clicar 👇",
    link: utm("calendario_julho", "facebook"),
  },
  {
    id: "2026-07-22-rotina",
    data: "2026-07-22",
    canais: ["facebook"],
    texto:
      "Entre um procedimento e outro, o WhatsApp acumula. 📱\n\nCada mensagem sem resposta é uma cliente esfriando. Com o LeadBellus, você cola a mensagem, recebe 3 respostas prontas e resolve a fila no intervalo do café.\n\nR$97/mês, teste grátis sem cartão 👇",
    link: utm("calendario_julho", "facebook"),
  },
  // ── Campanha "A conversa que trava" (set–out/2026) ────────────────────────
  // Plano completo em docs/marketing/campanha-social-set-out-2026.md
  {
    id: "2026-09-15-preco-mata-conversa",
    data: "2026-09-15",
    canais: ["facebook", "instagram"],
    imagemUrl: arte("ig-01-feed-quanto-custa"),
    texto:
      'Ela perguntou o preço. Você respondeu o valor. E ela sumiu. 😬\n\nNão é falta de talento — é que preço solto vira comparação de tabela. A cliente ainda não tem como julgar o que ela não entende.\n\nA resposta que mantém a conversa viva tem 3 partes: o valor depende da avaliação → o que está incluso no seu protocolo → um convite com dia e hora.\n\nO LeadBellus escreve essas respostas por você, no tom da sua clínica. Teste grátis, sem cartão 👇',
    link: utm("conversa_trava", "facebook"),
  },
  {
    id: "2026-09-17-achou-caro",
    data: "2026-09-17",
    canais: ["facebook", "instagram"],
    imagemUrl: arte("ig-05-carrossel-3-achou-caro"),
    texto:
      '"Achei caro" não é um não. É pedido de contexto. 💡\n\nDesconto na primeira objeção ensina a cliente a sempre pedir desconto. Antes de baixar o preço, mostre o que sustenta ele: avaliação, produto, técnica e acompanhamento.\n\nO LeadBellus escreve essa resposta em segundos — sem parecer robô e sem prometer o impossível.\n\nTeste grátis 👇',
    link: utm("conversa_trava", "facebook"),
  },
  {
    id: "2026-09-19-tres-respostas",
    data: "2026-09-19",
    canais: ["facebook", "instagram"],
    imagemUrl: arte("ig-02-feed-tres-respostas"),
    texto:
      "Por que 3 respostas e não 1? 🤔\n\nPorque cada conversa pede um tom. Tem cliente que precisa de acolhimento (Suave), tem quem precisa entender o processo (Consultiva) e tem quem só falta o empurrãozinho (Fechamento).\n\nVocê lê a conversa, escolhe a certa, ajusta e envia. Quem decide é sempre você — o LeadBellus só tira a página em branco da frente.\n\nR$97/mês, teste grátis sem cartão 👇",
    link: utm("conversa_trava", "facebook"),
  },
  {
    id: "2026-09-22-follow-up",
    data: "2026-09-22",
    canais: ["facebook", "instagram"],
    imagemUrl: arte("ig-06-carrossel-4-sumiu"),
    texto:
      'Cliente pediu o orçamento, disse "vou ver e te falo"… e sumiu? 👻\n\nO silêncio tem prazo de validade. Sem um próximo passo claro, a conversa esfria e morre no vácuo.\n\nO que funciona: um follow-up leve em 48h, sem cobrança, oferecendo dois horários concretos.\n\nO LeadBellus gera esse follow-up pronto pra você 👇',
    link: utm("conversa_trava", "facebook"),
  },
  {
    id: "2026-09-24-resposta-pronta",
    data: "2026-09-24",
    canais: ["facebook", "instagram"],
    imagemUrl: arte("wa-02-canal-achou-caro"),
    texto:
      "Essa resposta foi gerada em 10 segundos, no tom da clínica. 💬\n\nRepare na estrutura: acolhe a objeção, explica o que o valor cobre e termina com um convite — sem desconto e sem promessa de resultado.\n\nÉ isso que o LeadBellus entrega pra cada mensagem que trava o seu WhatsApp.\n\nTeste grátis, sem cartão 👇",
    link: utm("conversa_trava", "facebook"),
  },
  {
    id: "2026-09-26-demo-ao-vivo",
    data: "2026-09-26",
    canais: ["facebook", "instagram"],
    imagemUrl: arte("fb-02-anuncio-1080x1080"),
    texto:
      "Me manda uma mensagem real que você recebeu essa semana na sua clínica. 📲\n\nEu te devolvo 3 respostas prontas — uma suave, uma consultiva e uma de fechamento — na hora, de graça, pra você ver na prática.\n\nSe fizer sentido, o teste é grátis e sem cartão. Comenta aqui ou chama no direct 👇",
    link: utm("conversa_trava", "facebook"),
  },
  {
    id: "2026-09-29-erro-do-preco",
    data: "2026-09-29",
    canais: ["facebook", "instagram"],
    imagemUrl: arte("ig-04-carrossel-2-preco"),
    texto:
      'O erro mais caro do WhatsApp da clínica: responder "quanto custa?" só com o número. 💸\n\nPreço sem contexto joga você na guerra de tabela com quem cobra metade e entrega outra coisa.\n\nInverta a ordem: avaliação primeiro, o que está incluso depois, convite no final.\n\nQuer essa resposta pronta pra qualquer mensagem? Teste grátis 👇',
    link: utm("conversa_trava", "facebook"),
  },
  {
    id: "2026-10-01-compliance",
    data: "2026-10-01",
    canais: ["facebook", "instagram"],
    imagemUrl: arte("ig-07-carrossel-5-cta"),
    texto:
      "Responder rápido não pode virar responder errado. ⚠️\n\nPrometer resultado garantido, cravar preço sem avaliação ou opinar como se fosse diagnóstico é risco real pra sua clínica.\n\nToda resposta do LeadBellus já sai dentro dessas regras: persuasiva, mas segura.\n\nTeste grátis, sem cartão 👇",
    link: utm("conversa_trava", "facebook"),
  },
];
