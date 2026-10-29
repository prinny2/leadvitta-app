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
const HASHTAGS =
  "#clinicaestetica #estetica #whatsappdaclinica #atendimento #harmonizacaofacial #botox #leadbellus #secretariadaclinica";
const ARTE = "https://www.leadbellus.com.br/social";
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
  ...secretariaPosts(),
];

function secretaria(post: {
  id: string;
  data: string;
  arte: string;
  texto: string;
}): SocialPost {
  return {
    id: post.id,
    data: post.data,
    canais: ["facebook", "instagram"],
    texto: post.texto.includes(LP)
      ? `${post.texto.trim()}\n\n${HASHTAGS}`
      : `${post.texto.trim()}\n${LP}\n\n${HASHTAGS}`,
    imagemUrl: `${ARTE}/${post.arte}`,
    link: utm("secretaria", "facebook"),
  };
}

/** Pack manual de 2026-10-29 a 2026-11-20. Ela escreve; a equipe envia. */
function secretariaPosts(): SocialPost[] {
  return [
    secretaria({
      id: "2026-10-29-quente",
      data: "2026-10-29",
      arte: "01-quente.png",
      texto: `A secretária que responde no tom da sua clínica enquanto a cliente ainda está quente.

Preço, medo, indecisão, cliente que sumiu e quem fez o procedimento e não voltou: o LeadBellus escreve a próxima mensagem em segundos.

Ela escreve. Sua equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-10-31-espera",
      data: "2026-10-31",
      arte: "02-espera.png",
      texto: `Não é o preço. É a espera — antes e depois do procedimento.

Enquanto a equipe está na cadeira, a cliente espera no WhatsApp. A clínica que responde primeiro leva.

Depois do procedimento, ninguém pergunta por ela. E o retorno que pagaria o mês não acontece.

A secretária escreve a próxima mensagem. A equipe só revisa e envia.`,
    }),
    secretaria({
      id: "2026-11-02-fila",
      data: "2026-11-02",
      arte: "03-fila.png",
      texto: `Enquanto a equipe está na cadeira, o WhatsApp não para.

Mariana pergunta o preço do botox há 40 minutos.
Paula tem medo de ficar com o rosto artificial.
Renata recebeu as informações ontem e sumiu.
Juliana fez preenchimento há 5 meses e não voltou.

A secretária do LeadBellus escreve a próxima mensagem de cada uma, no tom da clínica. A equipe revisa e envia.`,
    }),
    secretaria({
      id: "2026-11-04-equipe",
      data: "2026-11-04",
      arte: "04-equipe.png",
      texto: `A secretária não responde sozinha.

Ela escreve a resposta e o próximo passo. Quem revisa e envia é a sua equipe. O LeadBellus não se conecta ao WhatsApp e não manda nada no seu número.

Preço, promessa e diagnóstico não saem sozinhos.`,
    }),
    secretaria({
      id: "2026-11-06-preco",
      data: "2026-11-06",
      arte: "05-preco.png",
      texto: `“Quanto custa o botox?”

Responder só o número é o jeito mais rápido de perder a cliente. A secretária contextualiza o valor e o cuidado antes de falar em preço — e convida para a avaliação.

Três versões, no tom da sua clínica. Você escolhe, ajusta e envia.`,
    }),
    secretaria({
      id: "2026-11-08-medo",
      data: "2026-11-08",
      arte: "06-medo.png",
      texto: `“Tenho medo de ficar com o rosto artificial.”

Isso não se resolve com desconto. A secretária acolhe a insegurança com naturalidade, sem prometer resultado, cura ou preço fixo.

A equipe lê e envia no tom da clínica.`,
    }),
    secretaria({
      id: "2026-11-10-sumiu",
      data: "2026-11-10",
      arte: "07-sumiu.png",
      texto: `“Vou ver e te falo.”

Não é um não. É silêncio. A secretária retoma do ponto em que parou, com um próximo passo claro, sem parecer insistente.

Sua equipe revisa e envia.`,
    }),
    secretaria({
      id: "2026-11-12-retorno",
      data: "2026-11-12",
      arte: "08-retorno.png",
      texto: `Juliana fez preenchimento há 5 meses e não voltou.

A secretária escreve a mensagem de manutenção e o convite de retorno, no tom da clínica. Não faz diagnóstico nem orientação clínica à distância.

Um retorno recuperado paga meses de secretária.`,
    }),
    secretaria({
      id: "2026-11-14-rotina",
      data: "2026-11-14",
      arte: "09-rotina.png",
      texto: `Uma secretária que cabe na rotina de hoje.

1. Cole a conversa — ou escolha a situação: sumiu, orçou e não fechou, fez e não voltou.
2. A secretária escreve 3 versões, no tom da clínica, com o próximo passo claro.
3. A equipe revisa e envia.

No celular, no intervalo do procedimento.`,
    }),
    secretaria({
      id: "2026-11-16-mes",
      data: "2026-11-16",
      arte: "10-mes.png",
      texto: `Um retorno recuperado paga meses de secretária.

Start por R$97/mês, depois de 5 respostas grátis. Sem cartão para testar. Cancele quando quiser, direto no painel, sem multa.

Em clínica de ticket alto, uma cliente que volta para a manutenção já cobre a assinatura.`,
    }),
    secretaria({
      id: "2026-11-18-piloto",
      data: "2026-11-18",
      arte: "11-piloto.png",
      texto: `Hoje a secretária escreve e a equipe envia.

Estamos abrindo a versão conectada ao WhatsApp para poucas clínicas: um painel de quem está esperando, quem sumiu e quem fez e não voltou — com o aviso antes de a cliente esfriar.

Quer a sua clínica no piloto? Deixe o e-mail em
https://www.leadbellus.com.br/#piloto`,
    }),
    secretaria({
      id: "2026-11-20-cadeira",
      data: "2026-11-20",
      arte: "12-cadeira.png",
      texto: `Sua equipe cuida da cliente na cadeira.
A secretária cuida da conversa — antes e depois.

Coloque o LeadBellus no atendimento da clínica hoje. As 5 primeiras respostas são por nossa conta. Sem cartão.`,
    }),
  ];
}
