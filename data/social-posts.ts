// Calendário editorial de posts orgânicos (Facebook + Instagram) publicados
// automaticamente pelo cron /api/marketing/social-post. Datas no fuso
// America/Belem (YYYY-MM-DD). Post sem imagemUrl sai só no Facebook — o
// Instagram exige imagem. Artes 1080×1350 em public/social (script
// scripts/render-social-cards.py). Edite/adicione posts aqui; o cron cuida do resto.

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
  {
    id: "2026-10-29-secretaria",
    data: "2026-10-29",
    canais: ["facebook", "instagram"],
    texto:
      "A secretária da clínica de estética responde enquanto a cliente ainda está quente.\n\nNo tom da casa. Sua equipe lê e envia. Preço, promessa e diagnóstico não saem sozinhos.\n\n5 respostas grátis, sem cartão 👇",
    imagemUrl: `${LP}/social/2026-10-29-secretaria.png`,
    link: utm("secretaria", "facebook"),
  },
  {
    id: "2026-10-31-espera",
    data: "2026-10-31",
    canais: ["facebook", "instagram"],
    texto:
      "Cada minuto sem resposta é uma cliente esfriando.\n\nEntre um procedimento e outro, o WhatsApp acumula. A secretária escreve a mensagem. Você manda no intervalo.\n\nTeste grátis 👇",
    imagemUrl: `${LP}/social/2026-10-31-espera.png`,
    link: utm("secretaria", "facebook"),
  },
  {
    id: "2026-11-02-depois",
    data: "2026-11-02",
    canais: ["facebook", "instagram"],
    texto:
      "Quem já fez o procedimento também precisa de cuidado.\n\nO oi do dia seguinte. A manutenção. O retorno que a clínica esquece. O LeadBellus prepara essa mensagem no tom da sua casa.\n\nSua equipe envia 👇",
    imagemUrl: `${LP}/social/2026-11-02-depois.png`,
    link: utm("secretaria", "facebook"),
  },
  {
    id: "2026-11-04-equipe",
    data: "2026-11-04",
    canais: ["facebook", "instagram"],
    texto:
      "A secretária escreve. Sua equipe envia.\n\nÉ assim que clínica de estética atende rápido sem a IA falar sozinha com a paciente. Preço, promessa e diagnóstico passam por gente.\n\nConheça o LeadBellus 👇",
    imagemUrl: `${LP}/social/2026-11-04-equipe.png`,
    link: utm("secretaria", "facebook"),
  },
  {
    id: "2026-11-06-painel",
    data: "2026-11-06",
    canais: ["facebook", "instagram"],
    texto:
      "Três filas que decidem o mês de uma clínica de ticket alto:\n\n• quem está esperando agora\n• quem sumiu antes de marcar\n• quem fez e não voltou\n\nO LeadBellus mostra a conversa e escreve o próximo passo. Sua equipe envia 👇",
    imagemUrl: `${LP}/social/2026-11-06-painel.png`,
    link: utm("secretaria", "facebook"),
  },
  {
    id: "2026-11-08-preco",
    data: "2026-11-08",
    canais: ["facebook", "instagram"],
    texto:
      "“Quanto custa?”\n\nResponder só o número é o jeito mais rápido de perder a cliente. Ela precisa de contexto: avaliação, segurança, próximo horário.\n\nO LeadBellus entrega 3 respostas — suave, consultiva e fechamento — no tom da sua clínica 👇",
    imagemUrl: `${LP}/social/2026-11-08-preco.png`,
    link: utm("secretaria", "facebook"),
  },
  {
    id: "2026-11-10-sumiu",
    data: "2026-11-10",
    canais: ["facebook", "instagram"],
    texto:
      "“Vou ver e te falo” não é um não.\n\nÉ silêncio. Um follow-up leve, com o próximo horário, traz a conversa de volta sem pressionar.\n\nA secretária escreve. Sua equipe envia 👇",
    imagemUrl: `${LP}/social/2026-11-10-sumiu.png`,
    link: utm("secretaria", "facebook"),
  },
  {
    id: "2026-11-12-start",
    data: "2026-11-12",
    canais: ["facebook", "instagram"],
    texto:
      "Uma conversa recuperada paga o mês.\n\nStart por R$97. 5 respostas grátis, sem cartão. A secretária da clínica de estética: responde quem está esperando e não esquece quem já passou pela cadeira.\n\nleadbellus.com.br 👇",
    imagemUrl: `${LP}/social/2026-11-12-start.png`,
    link: utm("secretaria", "facebook"),
  },
];
