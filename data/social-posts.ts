// Calendário editorial de posts orgânicos (Facebook + Instagram) publicados
// automaticamente pelo cron /api/marketing/social-post. Datas no fuso
// America/Belem (YYYY-MM-DD). Post sem imagemUrl sai só no Facebook — o
// Instagram exige imagem. Edite/adicione posts aqui; o cron cuida do resto.

export type CanalSocial = "facebook" | "instagram";

/** Horário do cron: manhã = 11:00, noite = 19:00 (America/Belem). */
export type TurnoSocial = "manha" | "noite";

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
  /** Qual disparo do cron publica o post. Sem valor = "manha". */
  turno?: TurnoSocial;
};

export function turnoDoPost(post: SocialPost): TurnoSocial {
  return post.turno ?? "manha";
}

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
  ...secretariaPostsDezembro(),
  ...secretariaPostsDiarios(),
];

function secretaria(post: {
  id: string;
  data: string;
  arte: string;
  texto: string;
  turno?: TurnoSocial;
}): SocialPost {
  return {
    id: post.id,
    data: post.data,
    turno: post.turno,
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

/**
 * Pack de fim de ano, de 2026-11-22 a 2026-12-14 (a cada 2 dias): Black
 * Friday, agenda de dezembro, festas e retomada de janeiro. Reaproveita as
 * artes do pack anterior (sem repetir a mesma arte em posts seguidos).
 * Ela escreve; a equipe revisa e envia.
 */
function secretariaPostsDezembro(): SocialPost[] {
  return [
    secretaria({
      id: "2026-11-22-black-friday-fila",
      data: "2026-11-22",
      arte: "03-fila.png",
      texto: `Semana de Black Friday: o WhatsApp da clínica enche antes da agenda.

Camila quer saber se tem condição especial no botox.
Bruna pergunta se ainda tem horário em dezembro.
Lívia pediu informações na sexta e não respondeu mais.

A secretária do LeadBellus escreve a próxima mensagem de cada uma, no tom da clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-24-tem-desconto",
      data: "2026-11-24",
      arte: "05-preco.png",
      texto: `“Tem desconto na Black Friday?”

Responder só com um número é o jeito mais rápido de virar comparação de preço. A secretária mostra o cuidado e o valor da avaliação antes de falar em condição — e convida para o próximo passo.

Sem preço fechado por mensagem, sem promessa de resultado. Três versões: você escolhe, ajusta e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-26-espera",
      data: "2026-11-26",
      arte: "02-espera.png",
      texto: `Na semana da Black Friday, cada minuto sem resposta pode esfriar uma conversa.

A cliente que pergunta na Black Friday está conversando com várias clínicas ao mesmo tempo. Enquanto a equipe está na cadeira, a mensagem dela espera.

A secretária deixa a resposta pronta em segundos. A equipe só revisa e envia no intervalo.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-28-orcou-nao-fechou",
      data: "2026-11-28",
      arte: "07-sumiu.png",
      texto: `A Black Friday passou. E quem pediu orçamento e ainda não fechou?

“Vou ver e te falo” nem sempre é um não. A secretária retoma a conversa do ponto em que parou, sem pressionar e com um próximo passo claro: uma avaliação, um horário, uma dúvida respondida.

Sua equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-30-agenda-dezembro",
      data: "2026-11-30",
      arte: "09-rotina.png",
      texto: `Dezembro chega e a agenda aperta.

Cliente querendo horário antes das festas, cliente remarcando, cliente perguntando se ainda dá tempo. A secretária escreve cada resposta no tom da clínica, sem prometer prazo nem resultado.

Cole a conversa, escolha a versão, envie. No celular, entre um procedimento e outro.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-12-02-medo-festas",
      data: "2026-12-02",
      arte: "06-medo.png",
      texto: `“Quero ficar bem para as festas, mas tenho medo de ficar artificial.”

Pressa e medo na mesma mensagem. A secretária acolhe a insegurança com naturalidade, lembra que tudo começa pela avaliação e não promete resultado nem data.

A equipe lê, ajusta se quiser e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-12-04-vou-pensar",
      data: "2026-12-04",
      arte: "01-quente.png",
      texto: `“Vou pensar. Depois das festas eu vejo.”

Às vezes, falta uma informação para a cliente decidir. Uma resposta que tire a dúvida e deixe a porta aberta pode ajudar, sem empurrar.

A secretária escreve essa mensagem em segundos, no tom da sua clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-12-06-retorno",
      data: "2026-12-06",
      arte: "08-retorno.png",
      texto: `Quem fez o procedimento no meio do ano e não voltou?

Dezembro é um bom momento para lembrar da manutenção. A secretária escreve o convite de retorno no tom da clínica — sem diagnóstico e sem orientação clínica à distância.

A equipe revisa e envia. Um retorno pode ajudar a pagar meses de secretária.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-12-08-equipe",
      data: "2026-12-08",
      arte: "04-equipe.png",
      texto: `Fim de ano, equipe reduzida, WhatsApp cheio.

A secretária não responde sozinha: ela escreve a resposta e o próximo passo. Sua equipe revisa e envia; o LeadBellus não manda mensagens automaticamente.

Menos tempo digitando, o mesmo cuidado em cada conversa.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-12-10-assinatura",
      data: "2026-12-10",
      arte: "10-mes.png",
      texto: `Quanto custa uma secretária que escreve no tom da sua clínica?

Start por R$97/mês. Cancele quando quiser, direto no painel, sem multa.

Em uma clínica de ticket alto, uma cliente que volta para a manutenção em dezembro pode cobrir a assinatura.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-12-12-janeiro",
      data: "2026-12-12",
      arte: "03-fila.png",
      texto: `Janeiro começa agora.

Toda clínica tem uma lista de “depois das festas eu vejo”: quem pediu orçamento, quem ficou de pensar, quem fez e não voltou.

A secretária escreve a mensagem de cada uma para retomar a conversa em janeiro, no tom da clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-12-14-cadeira-festas",
      data: "2026-12-14",
      arte: "12-cadeira.png",
      texto: `Nas festas, sua equipe cuida da cliente na cadeira.
A secretária cuida da conversa — antes e depois.

Coloque o LeadBellus no atendimento da clínica antes da virada do ano. Ela escreve; a equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
  ];
}

/**
 * Calendário diário de 2026-11-01 a 2026-12-14, dois posts por dia:
 * - manhã (11:00) nos dias ímpares, completando os packs acima (dias pares);
 * - noite (19:00) todos os dias, em formato curto e rotativo: dica da noite,
 *   mensagem da cliente + resposta melhor, mito ou verdade, micro-roteiro e
 *   pergunta para o público.
 * Ela escreve; a equipe revisa e envia.
 */
function secretariaPostsDiarios(): SocialPost[] {
  return [
    // ── 2026-11-01 ──
    secretaria({
      id: "2026-11-01-novembro",
      data: "2026-11-01",
      arte: "01-quente.png",
      texto: `Novembro começou. E o WhatsApp da clínica também.

Tem cliente perguntando preço, cliente com medo, cliente que pediu informação e não respondeu mais. Cada conversa pede uma resposta diferente — e todas pedem rapidez.

A secretária do LeadBellus escreve a próxima mensagem de cada uma, no tom da clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-01-noite-nome",
      data: "2026-11-01",
      turno: "noite",
      arte: "02-espera.png",
      texto: `Dica da noite: comece a resposta pelo nome da cliente.

“Oi, Carla! Que bom que você chamou.” soa como conversa. “Olá, segue a tabela” soa como sistema.

Um detalhe pequeno que muda o tom da conversa inteira.`,
    }),
    // ── 2026-11-02 ──
    secretaria({
      id: "2026-11-02-noite-sabado",
      data: "2026-11-02",
      turno: "noite",
      arte: "12-cadeira.png",
      texto: `A cliente escreve: “Vocês atendem sábado?”

Resposta fraca: “Sim.”

Resposta melhor: “Atendemos, sim! Os horários de sábado costumam sair rápido. Quer que eu veja o próximo disponível para a sua avaliação?”

A segunda já leva para o próximo passo.`,
    }),
    // ── 2026-11-03 ──
    secretaria({
      id: "2026-11-03-orcou-nao-fechou",
      data: "2026-11-03",
      arte: "07-sumiu.png",
      texto: `Orçou e não fechou.

Ela pediu valores, agradeceu e a conversa parou ali. Na correria, ninguém lembra de chamar de volta — e a cliente acaba fechando com quem lembrou.

A secretária escreve o retorno no tom da clínica: sem pressão, sem desconto por impulso, com um próximo passo claro. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-03-noite-mito-insistencia",
      data: "2026-11-03",
      turno: "noite",
      arte: "08-retorno.png",
      texto: `Mito ou verdade: “Mandar follow-up é ser insistente.”

Mito. Insistente é cobrar resposta. Follow-up bom retoma do ponto em que a conversa parou e oferece algo útil: tirar uma dúvida, sugerir um horário.

Uma mensagem leve, no momento certo, costuma ser bem recebida.`,
    }),
    // ── 2026-11-04 ──
    secretaria({
      id: "2026-11-04-noite-roteiro-preco",
      data: "2026-11-04",
      turno: "noite",
      arte: "05-preco.png",
      texto: `Micro-roteiro para “quanto custa?”:

1. Agradeça o contato.
2. Explique que o valor depende da avaliação.
3. Conte o que acontece nessa avaliação.
4. Ofereça um horário.

Quatro linhas. Nenhuma delas é só o número.`,
    }),
    // ── 2026-11-05 ──
    secretaria({
      id: "2026-11-05-primeira-mensagem",
      data: "2026-11-05",
      arte: "02-espera.png",
      texto: `A primeira resposta decide muita coisa.

A cliente que chama no WhatsApp quase sempre está falando com outras clínicas também. Quem responde primeiro — e responde bem — sai na frente.

A secretária deixa essa primeira mensagem pronta em segundos, acolhedora e com o próximo passo. A equipe só revisa e envia no intervalo.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-05-noite-pergunta-dificil",
      data: "2026-11-05",
      turno: "noite",
      arte: "03-fila.png",
      texto: `Pergunta para quem cuida do WhatsApp da clínica:

Qual é a mensagem de cliente que você mais demora para responder?

“Quanto custa?”, “Dói?”, “Vou pensar”… Conta aqui nos comentários. A gente lê todas.`,
    }),
    // ── 2026-11-06 ──
    secretaria({
      id: "2026-11-06-noite-pergunta-final",
      data: "2026-11-06",
      turno: "noite",
      arte: "09-rotina.png",
      texto: `Dica da noite: termine a mensagem com uma pergunta simples.

“Prefere de manhã ou à tarde?” rende mais resposta do que “Qualquer coisa, estou à disposição.”

A pergunta mostra para a cliente qual é o próximo passo.`,
    }),
    // ── 2026-11-07 ──
    secretaria({
      id: "2026-11-07-tom",
      data: "2026-11-07",
      arte: "04-equipe.png",
      texto: `Toda clínica tem um jeito de falar.

Umas são mais próximas, com “querida” e emoji. Outras são mais formais e diretas. Quando cada pessoa da equipe responde de um jeito, a cliente sente.

A secretária aprende o tom da sua clínica no cadastro e escreve sempre nele. Quem revisa e envia continua sendo a equipe.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-07-noite-doi",
      data: "2026-11-07",
      turno: "noite",
      arte: "12-cadeira.png",
      texto: `A cliente escreve: “Dói?”

Resposta fraca: “Não dói nada!”

Resposta melhor: “É super normal ter essa dúvida. Na avaliação, a profissional explica cada etapa e conversa com você sobre o que esperar. Quer agendar?”

Acolhe sem prometer.`,
    }),
    // ── 2026-11-08 ──
    secretaria({
      id: "2026-11-08-noite-mito-interesse",
      data: "2026-11-08",
      turno: "noite",
      arte: "07-sumiu.png",
      texto: `Mito ou verdade: “Se ela não respondeu, é porque não tem interesse.”

Mito. Muita gente lê no meio do trabalho, pensa em responder depois e esquece.

Um follow-up curto, um ou dois dias depois, lembra a cliente sem pressionar.`,
    }),
    // ── 2026-11-09 ──
    secretaria({
      id: "2026-11-09-tres-versoes",
      data: "2026-11-09",
      arte: "09-rotina.png",
      texto: `Por que a secretária escreve 3 versões?

Porque cada cliente pede um tom. Tem quem precisa de acolhimento (Suave), quem quer entender o processo (Consultiva) e quem só precisa de um convite claro (Fechamento).

A equipe lê a conversa, escolhe a versão certa, ajusta se quiser e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-09-noite-roteiro-vespera",
      data: "2026-11-09",
      turno: "noite",
      arte: "12-cadeira.png",
      texto: `Micro-roteiro para confirmar o horário na véspera:

“Oi, Ana! Passando para confirmar sua avaliação amanhã às 15h. Está tudo certo para você? Se precisar remarcar, me avise por aqui.”

Curto, gentil e com espaço para a cliente responder.`,
    }),
    // ── 2026-11-10 ──
    secretaria({
      id: "2026-11-10-noite-pergunta-tempo",
      data: "2026-11-10",
      turno: "noite",
      arte: "02-espera.png",
      texto: `Pergunta sincera: quanto tempo a sua clínica leva, em média, para responder uma mensagem nova no WhatsApp?

Menos de 10 minutos? Uma hora? Só no fim do dia?

Sem julgamento — a correria da cadeira é real. Conta aqui.`,
    }),
    // ── 2026-11-11 ──
    secretaria({
      id: "2026-11-11-fora-do-horario",
      data: "2026-11-11",
      arte: "03-fila.png",
      texto: `Muita cliente escreve fora do horário.

Às 22h, no domingo, no meio do expediente dela. Na manhã seguinte, a equipe abre o WhatsApp e encontra uma fila inteira esperando.

A secretária ajuda a zerar essa fila: cole cada conversa, receba a resposta pronta no tom da clínica e envie. Cada uma continua sendo revisada por alguém da equipe.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-11-noite-retome",
      data: "2026-11-11",
      turno: "noite",
      arte: "01-quente.png",
      texto: `Dica da noite: retome o que a cliente perguntou.

Se ela falou de olheiras, não responda com a lista de todos os procedimentos. “Sobre as olheiras que você comentou…” mostra que alguém leu de verdade.

Atenção vale mais do que texto longo.`,
    }),
    // ── 2026-11-12 ──
    secretaria({
      id: "2026-11-12-noite-horario-semana",
      data: "2026-11-12",
      turno: "noite",
      arte: "04-equipe.png",
      texto: `A cliente escreve: “Tem horário essa semana?”

Resposta fraca: “Só sexta.”

Resposta melhor: “Tenho sexta às 10h ou às 16h. Qual fica melhor para você? Já deixo reservado.”

Duas opções concretas facilitam a decisão.`,
    }),
    // ── 2026-11-13 ──
    secretaria({
      id: "2026-11-13-comparando",
      data: "2026-11-13",
      arte: "05-preco.png",
      texto: `“Estou vendo com outras clínicas também.”

Ela está comparando — e isso é normal. Entrar em guerra de preço por mensagem raramente ajuda. O que diferencia é mostrar o cuidado: avaliação, segurança, atenção ao que ela quer.

A secretária escreve essa resposta sem atacar ninguém e sem prometer resultado. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-13-noite-mito-desconto",
      data: "2026-11-13",
      turno: "noite",
      arte: "07-sumiu.png",
      texto: `Mito ou verdade: “Follow-up só funciona se eu oferecer desconto.”

Mito. Na maioria das vezes, a cliente não sumiu por causa do preço — sumiu porque a vida aconteceu.

Retomar com atenção e um horário sugerido costuma funcionar melhor do que baixar o valor.`,
    }),
    // ── 2026-11-14 ──
    secretaria({
      id: "2026-11-14-noite-roteiro-orcamento",
      data: "2026-11-14",
      turno: "noite",
      arte: "01-quente.png",
      texto: `Micro-roteiro para retomar um orçamento depois de 3 dias:

“Oi, Fernanda! Ficou alguma dúvida sobre o que conversamos? Se quiser, posso ver um horário de avaliação para você esta semana.”

Sem cobrança, sem “e aí, vai fechar?”.`,
    }),
    // ── 2026-11-15 ──
    secretaria({
      id: "2026-11-15-feriado",
      data: "2026-11-15",
      arte: "02-espera.png",
      texto: `Feriado: a clínica descansa, o WhatsApp não.

Muita cliente aproveita o dia livre para pesquisar e mandar mensagem. Na volta, a pergunta dela está lá, esperando há horas.

Com a secretária, a equipe responde a fila do feriado em minutos: a mensagem já vem pronta, no tom da clínica. É só revisar e enviar.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-15-noite-pergunta-feriado",
      data: "2026-11-15",
      turno: "noite",
      arte: "03-fila.png",
      texto: `Pergunta de feriado: alguém da sua clínica olha o WhatsApp em dia de folga?

Ou a regra é responder tudo no próximo dia útil?

Não existe resposta certa — mas existe a que funciona para a sua equipe. Conta como é aí.`,
    }),
    // ── 2026-11-16 ──
    secretaria({
      id: "2026-11-16-noite-preco-sozinho",
      data: "2026-11-16",
      turno: "noite",
      arte: "05-preco.png",
      texto: `Dica da noite: nunca mande o preço sozinho.

Um número solto na tela vira comparação. Antes dele, uma frase sobre o cuidado da avaliação. Depois dele, um convite para o próximo passo.

O valor faz mais sentido quando vem com contexto.`,
    }),
    // ── 2026-11-17 ──
    secretaria({
      id: "2026-11-17-dia-seguinte",
      data: "2026-11-17",
      arte: "12-cadeira.png",
      texto: `O atendimento não termina quando a cliente sai da cadeira.

Uma mensagem no dia seguinte — “Oi, tudo bem? Qualquer dúvida, a equipe está aqui” — mostra cuidado e abre espaço para o retorno.

A secretária escreve essa mensagem no tom da clínica, sem orientação clínica à distância. Quem revisa e envia é a equipe.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-17-noite-gostei",
      data: "2026-11-17",
      turno: "noite",
      arte: "08-retorno.png",
      texto: `A cliente escreve: “Amei o atendimento de vocês!”

Resposta fraca: “Obrigada!”

Resposta melhor: “Que alegria ler isso, Bia! Foi um prazer cuidar de você. Quando quiser, já deixamos seu retorno combinado.”

Agradecer também é um próximo passo.`,
    }),
    // ── 2026-11-18 ──
    secretaria({
      id: "2026-11-18-noite-mito-longo",
      data: "2026-11-18",
      turno: "noite",
      arte: "09-rotina.png",
      texto: `Mito ou verdade: “Follow-up precisa ser longo para convencer.”

Mito. No WhatsApp, mensagem comprida costuma ficar para depois — e depois vira nunca.

Duas ou três linhas, com uma pergunta no final, funcionam melhor para retomar a conversa.`,
    }),
    // ── 2026-11-19 ──
    secretaria({
      id: "2026-11-19-indicacao",
      data: "2026-11-19",
      arte: "01-quente.png",
      texto: `“Uma amiga me indicou vocês.”

Essa cliente chega mais quente do que qualquer anúncio. Ela já confia — e espera ser atendida com o mesmo cuidado que a amiga recebeu.

A secretária escreve uma resposta que valoriza a indicação e convida para a avaliação, no tom da clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-19-noite-roteiro-remarcou",
      data: "2026-11-19",
      turno: "noite",
      arte: "02-espera.png",
      texto: `Micro-roteiro para quem remarcou pela segunda vez:

“Oi, Luana! Sem problema, a rotina às vezes aperta mesmo. Quer que eu deixe dois horários reservados para você escolher com calma?”

Compreensão primeiro, opção concreta depois.`,
    }),
    // ── 2026-11-20 ──
    secretaria({
      id: "2026-11-20-noite-pergunta-objecao",
      data: "2026-11-20",
      turno: "noite",
      arte: "06-medo.png",
      texto: `Pergunta para encerrar a semana:

Qual objeção você mais ouve no WhatsApp da clínica?

Achou caro, medo de ficar artificial, “vou falar com meu marido”, “depois eu vejo”… Deixa aqui embaixo. Pode virar dica nas próximas noites.`,
    }),
    // ── 2026-11-21 ──
    secretaria({
      id: "2026-11-21-pre-black-friday",
      data: "2026-11-21",
      arte: "09-rotina.png",
      texto: `A Black Friday é na próxima sexta. O WhatsApp esquenta antes.

Vale se preparar agora: quem vai responder, o que a clínica vai oferecer (ou não) e como falar de condição sem virar só preço.

A secretária ajuda nessa semana: cole a conversa, receba 3 versões no tom da clínica e envie. Sem prometer resultado, sem preço fechado por mensagem.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-21-noite-blocos",
      data: "2026-11-21",
      turno: "noite",
      arte: "04-equipe.png",
      texto: `Dica da noite: quebre a mensagem em parágrafos curtos.

Um bloco de texto gigante no WhatsApp cansa antes de ser lido. Duas ou três frases, um espaço, mais duas.

No celular, o respiro entre as linhas faz diferença.`,
    }),
    // ── 2026-11-22 ──
    secretaria({
      id: "2026-11-22-noite-valor-por-aqui",
      data: "2026-11-22",
      turno: "noite",
      arte: "05-preco.png",
      texto: `A cliente escreve: “Me passa o valor por aqui mesmo.”

Resposta fraca: só o número.

Resposta melhor: “Claro! O valor depende do que a profissional indicar na avaliação, que é rapidinha. Posso te explicar como funciona e já ver um horário?”

Atende o pedido sem perder a conversa.`,
    }),
    // ── 2026-11-23 ──
    secretaria({
      id: "2026-11-23-domingo",
      data: "2026-11-23",
      arte: "02-espera.png",
      texto: `Domingo à noite é quando muita cliente decide cuidar de si.

Ela rola o Instagram, salva um post, abre o WhatsApp da clínica e pergunta. Na segunda de manhã, a mensagem já esfriou um pouco.

A secretária deixa a resposta pronta para a equipe enviar logo cedo, no tom da clínica.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-23-noite-mito-so-preco",
      data: "2026-11-23",
      turno: "noite",
      arte: "01-quente.png",
      texto: `Mito ou verdade: “Quem pergunta preço e some não quer mais.”

Mito. Muitas vezes, ela recebeu o valor sem contexto e ficou sem saber o próximo passo.

Um follow-up que explica como funciona a avaliação pode reabrir a conversa.`,
    }),
    // ── 2026-11-24 ──
    secretaria({
      id: "2026-11-24-noite-roteiro-tres-linhas",
      data: "2026-11-24",
      turno: "noite",
      arte: "03-fila.png",
      texto: `Micro-roteiro para a primeira resposta da semana de Black Friday:

Linha 1: “Oi, [nome]! Obrigada por chamar.”
Linha 2: o que a clínica oferece nesta semana, sem número solto.
Linha 3: “Quer que eu veja um horário de avaliação?”

Três linhas. Resposta enviada.`,
    }),
    // ── 2026-11-25 ──
    secretaria({
      id: "2026-11-25-lista-outubro",
      data: "2026-11-25",
      arte: "07-sumiu.png",
      texto: `Antes da sexta, olhe para trás.

Quem pediu orçamento em outubro e não fechou? Quem disse “vou ver” e não voltou? Essas clientes já conhecem a clínica — e podem estar só esperando um motivo.

A secretária escreve a mensagem de retomada de cada uma, sem pressão. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-25-noite-pergunta-bf",
      data: "2026-11-25",
      turno: "noite",
      arte: "12-cadeira.png",
      texto: `Pergunta da semana: a sua clínica faz Black Friday?

Condição especial, brinde, agenda estendida… ou prefere ficar de fora?

Os dois caminhos fazem sentido. O importante é a equipe saber responder bem quando a cliente perguntar. Conta como é aí.`,
    }),
    // ── 2026-11-26 ──
    secretaria({
      id: "2026-11-26-noite-palavras",
      data: "2026-11-26",
      turno: "noite",
      arte: "09-rotina.png",
      texto: `Dica da noite: use as palavras da cliente.

Se ela escreveu “bigode chinês”, responda falando de bigode chinês — não com o nome técnico que só a equipe conhece.

A cliente se sente entendida quando reconhece as próprias palavras.`,
    }),
    // ── 2026-11-27 ──
    secretaria({
      id: "2026-11-27-black-friday",
      data: "2026-11-27",
      arte: "01-quente.png",
      texto: `É hoje.

Na Black Friday, a cliente abre várias conversas ao mesmo tempo e responde para quem chega primeiro com uma resposta clara. Demorar é perder lugar na fila dela.

A secretária escreve cada resposta em segundos, no tom da clínica e sem preço fechado por mensagem. A equipe revisa e envia entre um atendimento e outro.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-27-noite-mais-barato",
      data: "2026-11-27",
      turno: "noite",
      arte: "05-preco.png",
      texto: `A cliente escreve: “Na outra clínica está mais barato.”

Resposta fraca: “Então faço o mesmo valor.”

Resposta melhor: “Entendo! Cada clínica trabalha de um jeito. Aqui, tudo começa pela avaliação, com calma. Quer conhecer antes de decidir?”

Valor antes de desconto.`,
    }),
    // ── 2026-11-28 ──
    secretaria({
      id: "2026-11-28-noite-mito-depois-bf",
      data: "2026-11-28",
      turno: "noite",
      arte: "08-retorno.png",
      texto: `Mito ou verdade: “Passou a Black Friday, ninguém mais fecha.”

Mito. Muita cliente pesquisou na sexta e vai decidir com calma nos próximos dias.

Um follow-up gentil nesta semana pode ser exatamente o lembrete que faltava.`,
    }),
    // ── 2026-11-29 ──
    secretaria({
      id: "2026-11-29-organizar-semana",
      data: "2026-11-29",
      arte: "04-equipe.png",
      texto: `Domingo pós-Black Friday: hora de organizar a semana.

Quem perguntou e ainda não recebeu resposta? Quem recebeu e não respondeu? Quem agendou e precisa de confirmação?

Com a secretária, cada uma dessas mensagens sai pronta no tom da clínica. A equipe revisa e envia, sem começar do zero a cada conversa.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-11-29-noite-roteiro-agendou",
      data: "2026-11-29",
      turno: "noite",
      arte: "12-cadeira.png",
      texto: `Micro-roteiro para quem acabou de agendar:

“Prontinho, Rafa! Sua avaliação está marcada para quinta, às 14h. Vou te mandar um lembrete na véspera. Qualquer dúvida até lá, é só chamar.”

Confirma, combina o lembrete e deixa a porta aberta.`,
    }),
    // ── 2026-11-30 ──
    secretaria({
      id: "2026-11-30-noite-pergunta-novembro",
      data: "2026-11-30",
      turno: "noite",
      arte: "03-fila.png",
      texto: `Último dia de novembro. Pergunta honesta:

Quantas conversas ficaram sem resposta no WhatsApp da clínica este mês?

Não precisa contar aqui. Mas vale olhar com calma — e escolher pelo menos uma para retomar amanhã cedo.`,
    }),
    // ── 2026-12-01 ──
    secretaria({
      id: "2026-12-01-cliente-antiga",
      data: "2026-12-01",
      arte: "08-retorno.png",
      texto: `Cliente nova e cliente antiga não pedem a mesma mensagem.

Para quem chega agora, acolhimento e explicação. Para quem já é da casa, proximidade e lembrança do histórico. Responder as duas igual soa frio.

A secretária ajusta o tom para cada situação, sempre no jeito da clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-12-01-noite-vespera",
      data: "2026-12-01",
      turno: "noite",
      arte: "02-espera.png",
      texto: `Dica da noite: em dezembro, confirme todo horário na véspera.

Agenda cheia, compras, confraternização: é o mês em que a cliente mais esquece.

Uma mensagem curta no dia anterior ajuda a evitar cadeira vazia e libera o horário para outra pessoa, se for o caso.`,
    }),
    // ── 2026-12-02 ──
    secretaria({
      id: "2026-12-02-noite-parcela",
      data: "2026-12-02",
      turno: "noite",
      arte: "05-preco.png",
      texto: `A cliente escreve: “Vocês parcelam?”

Resposta fraca: “Sim.”

Resposta melhor: “Temos algumas opções de pagamento, sim! Na avaliação a equipe te mostra tudo com calma. Quer que eu veja um horário para você?”

A dúvida respondida vira convite.`,
    }),
    // ── 2026-12-03 ──
    secretaria({
      id: "2026-12-03-relacionamento",
      data: "2026-12-03",
      arte: "12-cadeira.png",
      texto: `Nem toda mensagem precisa vender.

Um parabéns no aniversário, um “como você está?” depois do procedimento, um obrigado por indicar uma amiga. É esse tipo de mensagem que faz a cliente lembrar da clínica quando decidir voltar.

A secretária escreve essas mensagens também, no tom da clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-12-03-noite-mito-chato",
      data: "2026-12-03",
      turno: "noite",
      arte: "07-sumiu.png",
      texto: `Mito ou verdade: “Chamar quem não voltou é chato.”

Mito — desde que a mensagem seja sobre ela, não sobre a agenda da clínica.

“Lembrei de você e queria saber como está” abre conversa. “Temos horário livre” parece cobrança.`,
    }),
    // ── 2026-12-04 ──
    secretaria({
      id: "2026-12-04-noite-roteiro-natal",
      data: "2026-12-04",
      turno: "noite",
      arte: "09-rotina.png",
      texto: `Micro-roteiro para “dá tempo antes do Natal?”:

“Oi, Gabi! Vamos ver juntas. O primeiro passo é a avaliação, e a profissional te explica tudo com calma por lá. Tenho horário na terça ou na quinta. Qual prefere?”

Sem prometer prazo, com um próximo passo claro.`,
    }),
    // ── 2026-12-05 ──
    secretaria({
      id: "2026-12-05-fila-segunda",
      data: "2026-12-05",
      arte: "03-fila.png",
      texto: `A fila de segunda-feira começa no sábado.

Quem escreve no fim de semana e só recebe resposta dias depois pode já ter agendado em outro lugar. Em dezembro, isso acontece ainda mais rápido.

A secretária ajuda a responder a fila do fim de semana em minutos: a mensagem vem pronta, no tom da clínica, e a equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-12-05-noite-quem-responde",
      data: "2026-12-05",
      turno: "noite",
      arte: "04-equipe.png",
      texto: `Pergunta de sábado: quem responde o WhatsApp na sua clínica?

A recepção? A própria profissional, entre um atendimento e outro? Cada dia uma pessoa?

Conta aqui embaixo. Queremos entender como é a rotina de verdade.`,
    }),
    // ── 2026-12-06 ──
    secretaria({
      id: "2026-12-06-noite-proximo-passo",
      data: "2026-12-06",
      turno: "noite",
      arte: "02-espera.png",
      texto: `Dica da noite: toda mensagem precisa de um próximo passo.

Agendar, tirar uma dúvida, confirmar um horário. Se a cliente termina de ler e não sabe o que fazer, a conversa para ali.

Antes de enviar, pergunte: o que eu quero que ela responda?`,
    }),
    // ── 2026-12-07 ──
    secretaria({
      id: "2026-12-07-tres-erros",
      data: "2026-12-07",
      arte: "05-preco.png",
      texto: `Três erros comuns no WhatsApp da clínica:

1. Responder só o preço, sem contexto.
2. Demorar horas na primeira resposta.
3. Prometer resultado para convencer.

O terceiro é o mais perigoso. A secretária escreve respostas persuasivas sem promessa de resultado, sem preço fechado e sem diagnóstico. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-12-07-noite-garante",
      data: "2026-12-07",
      turno: "noite",
      arte: "06-medo.png",
      texto: `A cliente escreve: “Vocês garantem o resultado?”

Resposta arriscada: “Garantimos, sim!”

Resposta melhor: “Cada pessoa responde de um jeito, então ninguém deveria garantir resultado. O que oferecemos é uma avaliação cuidadosa e um plano pensado para você.”

Honestidade também convence.`,
    }),
    // ── 2026-12-08 ──
    secretaria({
      id: "2026-12-08-noite-mito-robo",
      data: "2026-12-08",
      turno: "noite",
      arte: "09-rotina.png",
      texto: `Mito ou verdade: “Follow-up escrito com ajuda de IA soa robótico.”

Depende. Texto genérico soa robótico, venha de onde vier. Por isso a secretária escreve no tom da clínica — e alguém da equipe sempre revisa antes de enviar.

Quer testar? As 5 primeiras respostas são grátis.`,
    }),
    // ── 2026-12-09 ──
    secretaria({
      id: "2026-12-09-teste-agora",
      data: "2026-12-09",
      arte: "02-espera.png",
      texto: `Faça um teste agora.

Abra o WhatsApp da clínica e pegue a conversa mais antiga sem resposta. Cole no LeadBellus. Em segundos, a secretária escreve 3 versões no tom da clínica, com o próximo passo claro.

Escolha uma, ajuste se quiser e envie. Uma cliente a menos esperando.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-12-09-noite-roteiro-cancelou",
      data: "2026-12-09",
      turno: "noite",
      arte: "12-cadeira.png",
      texto: `Micro-roteiro para quem cancelou em cima da hora:

“Oi, Dani! Tudo bem, imprevistos acontecem. Quando quiser remarcar, me chama que eu vejo os próximos horários para você.”

Sem cobrança, sem culpa. A porta continua aberta.`,
    }),
    // ── 2026-12-10 ──
    secretaria({
      id: "2026-12-10-noite-pergunta-painel",
      data: "2026-12-10",
      turno: "noite",
      arte: "11-piloto.png",
      texto: `Pergunta da noite: se a clínica tivesse um painel mostrando quem está esperando resposta e quem sumiu, o que você olharia primeiro?

Estamos testando isso em um piloto conectado ao WhatsApp, com lista de espera. Conta aqui o que não pode faltar.`,
    }),
    // ── 2026-12-11 ──
    secretaria({
      id: "2026-12-11-recesso",
      data: "2026-12-11",
      arte: "09-rotina.png",
      texto: `Sua clínica vai ter recesso no fim do ano?

Avise antes. Uma mensagem clara com os dias de pausa e a data de volta evita cliente esperando sem resposta — e já abre espaço para agendar janeiro.

A secretária escreve esse aviso e as respostas da semana no tom da clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-12-11-noite-zerar",
      data: "2026-12-11",
      turno: "noite",
      arte: "02-espera.png",
      texto: `Dica da noite: antes do recesso, zere a fila.

Responda todo mundo que está esperando, mesmo que seja para dizer “voltamos dia 5, posso já reservar um horário para você?”.

Ninguém gosta de ficar no vácuo nas festas.`,
    }),
    // ── 2026-12-12 ──
    secretaria({
      id: "2026-12-12-noite-abrem",
      data: "2026-12-12",
      turno: "noite",
      arte: "04-equipe.png",
      texto: `A cliente escreve: “Vocês abrem entre o Natal e o Ano Novo?”

Resposta fraca: “Não.”

Resposta melhor: “Nesse período a clínica faz uma pausa, mas voltamos dia 5. Quer que eu já reserve um horário na primeira semana de janeiro?”

Um não que vira agendamento.`,
    }),
    // ── 2026-12-13 ──
    secretaria({
      id: "2026-12-13-balanco",
      data: "2026-12-13",
      arte: "01-quente.png",
      texto: `Um balanço rápido do ano.

Quantas clientes perguntaram e não receberam resposta a tempo? Quantas pediram orçamento e ficaram no “vou pensar”? Quantas fizeram e não voltaram?

Não é para se culpar — é para começar 2027 diferente. A secretária escreve a próxima mensagem de cada uma, no tom da clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretaria({
      id: "2026-12-13-noite-mito-janeiro",
      data: "2026-12-13",
      turno: "noite",
      arte: "08-retorno.png",
      texto: `Mito ou verdade: “Janeiro é mês parado na clínica.”

Depende de dezembro. Quem deixa os follow-ups combinados agora — “te chamo dia 6, combinado?” — começa janeiro com conversas já abertas.

Anote os nomes antes das festas.`,
    }),
    // ── 2026-12-14 ──
    secretaria({
      id: "2026-12-14-noite-boas-festas",
      data: "2026-12-14",
      turno: "noite",
      arte: "09-rotina.png",
      texto: `Micro-roteiro de boas festas, sem vender nada:

“Oi, Paula! Passando para agradecer por ter escolhido a gente este ano. Desejamos festas leves e um 2027 cheio de cuidado com você.”

Às vezes, a melhor mensagem é só um obrigado.`,
    }),
  ];
}
