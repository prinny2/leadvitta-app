// Calendário editorial de posts orgânicos (Facebook + Instagram) publicados
// automaticamente pelo cron /api/marketing/social-post. Datas no fuso
// America/Belem (YYYY-MM-DD). Post com videoUrl sai como Reel no Instagram e
// vídeo na Página; senão, com imagemUrl, sai como foto. Post sem imagem nem
// vídeo sai só no Facebook — o Instagram exige mídia. Edite/adicione posts
// aqui; o cron cuida do resto.

export type CanalSocial = "facebook" | "instagram";

/** Horário do cron: manhã = 11:00, noite = 19:00 (America/Belem). */
export type TurnoSocial = "manha" | "noite";

export type SocialPost = {
  id: string;
  /** Data de publicação (YYYY-MM-DD, fuso America/Belem). */
  data: string;
  canais: CanalSocial[];
  texto: string;
  /** URL pública da arte. Obrigatória para Instagram quando não há videoUrl. */
  imagemUrl?: string;
  /**
   * URL pública https do mp4 (9:16), ex.
   * https://www.leadbellus.com.br/reels/r5-na-cadeira.mp4. Quando existe, o
   * post sai como Reel no Instagram e como vídeo na Página do Facebook (tem
   * prioridade sobre imagemUrl).
   */
  videoUrl?: string;
  /** Link anexado ao post do Facebook (feed). */
  link?: string;
  /** Qual disparo do cron publica o post. Sem valor = "manha". */
  turno?: TurnoSocial;
  /** Spec da arte única (public/social/auto/<id>.png), lida por scripts/social/render-social.mjs. */
  arte?: ArteSocial;
};

/** Layouts de arte do renderer (scripts/social/render-social.mjs). */
export type LayoutArte =
  | "chat" // mockup de WhatsApp: mensagem da cliente + resposta pronta
  | "antesdepois" // resposta fraca × resposta da secretária
  | "citacao" // frase grande em destaque
  | "checklist" // lista com checks (ou X, com `negativo`)
  | "mito" // mito × verdade
  | "agenda" // linhas de agenda/rotina (rótulo|texto)
  | "persona" // cartão de persona com procedimento
  | "pergunta"; // enquete A/B/C/D

/**
 * Spec curta da arte. `hook` (≤ 8 palavras) aceita *ênfase* entre asteriscos.
 * Os demais campos são usados conforme o layout.
 */
export type ArteSocial = {
  layout: LayoutArte;
  hook: string;
  /** Linha de apoio ou rótulo extra (opcional). */
  sub?: string;
  /** Etiqueta do topo: persona · procedimento. */
  tag?: string;
  /** chat/antesdepois: mensagem da cliente. */
  cliente?: string;
  /** chat: resposta pronta; antesdepois: resposta da secretária. */
  resposta?: string;
  /** chat: "clinica" mostra a mensagem da clínica primeiro. */
  ordem?: "cliente" | "clinica";
  /** antesdepois: resposta fraca. */
  fraca?: string;
  /** checklist/pergunta: itens; agenda: "rótulo|texto". */
  itens?: string[];
  /** checklist: itens como erros (X) em vez de checks. */
  negativo?: boolean;
  mito?: string;
  verdade?: string;
  /** citacao: atribuição. */
  autor?: string;
  /** persona: nome da persona. */
  persona?: string;
};

export function turnoDoPost(post: SocialPost): TurnoSocial {
  return post.turno ?? "manha";
}

const LP = "https://www.leadbellus.com.br";
const HASHTAGS =
  "#clinicaestetica #estetica #whatsappdaclinica #atendimento #harmonizacaofacial #botox #leadbellus #secretariadaclinica";
/** Hashtags fixas dos posts com arte única; cada post soma as suas, de nicho. */
const HASHTAGS_BASE = "#clinicaestetica #estetica #whatsappdaclinica #secretariadaclinica #leadbellus";
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
  ...secretariaPostsInicioNovembro(),
  ...postsArtesUnicas(),
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

/** Pack manual de 2026-10-29 a 2026-11-02 (já publicado — não editar). Ela escreve; a equipe envia. */
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
  ];
}

/** Posts diários de 2026-11-01 e 2026-11-02 (já publicados — não editar). */
function secretariaPostsInicioNovembro(): SocialPost[] {
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
  ];
}

/**
 * Artes únicas + copy de nicho, de 2026-11-03 a 2026-12-14 (manhã e noite).
 * Cada post tem uma arte própria em public/social/auto/<id>.png, gerada por
 * scripts/social/render-social.mjs a partir do campo `arte`.
 * - manhã (11:00) vende: termina em "5 respostas grátis, sem cartão.";
 * - noite (19:00) ensina/engaja: mais curto, com pergunta ou CTA leve.
 * Formatos (layouts) se alternam: nunca dois posts seguidos com o mesmo.
 * Compliance: sem promessa de resultado, sem preço de procedimento (só o
 * Start R$97/mês, raramente), sem diagnóstico e sem dizer que envia sozinha
 * ou que conecta ao WhatsApp (isso só como piloto/lista de espera).
 * Ela escreve; a equipe revisa e envia.
 */
function secretariaArte(post: {
  id: string;
  data: string;
  arte: ArteSocial;
  texto: string;
  tags: string;
  turno?: TurnoSocial;
}): SocialPost {
  return {
    id: post.id,
    data: post.data,
    turno: post.turno,
    canais: ["facebook", "instagram"],
    texto: `${post.texto.trim()}\n${LP}\n\n${post.tags} ${HASHTAGS_BASE}`,
    imagemUrl: `${ARTE}/auto/${post.id}.png`,
    link: utm("secretaria", "facebook"),
    arte: post.arte,
  };
}

function postsArtesUnicas(): SocialPost[] {
  return [
    // ── 2026-11-03 (ter) ──
    secretariaArte({
      id: "2026-11-03-preco-sozinho",
      data: "2026-11-03",
      tags: "#botox #toxinabotulinica #donadeclinica",
      arte: {
        layout: "persona",
        persona: "Dona de clínica",
        tag: "Toxina botulínica",
        hook: "Ela mandou o preço. A cliente *sumiu*.",
        sub: "O número sozinho encerrou a conversa.",
      },
      texto: `Terça, 14h. A Bia, dona de clínica, está entre uma aplicação de toxina e outra. Chega: “quanto custa o botox?”.

Ela responde rápido, só com o valor. Visualizado. Nenhuma resposta.

Não foi o preço que espantou a cliente — foi a conversa ter acabado ali. Faltou explicar que o valor depende da avaliação, acolher a dúvida e oferecer um horário.

A secretária do LeadBellus escreve essa resposta no tom da sua clínica, em segundos. Você revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-03-noite-mito-rapido",
      data: "2026-11-03",
      turno: "noite",
      tags: "#atendimentoaocliente #clinicadeestetica",
      arte: {
        layout: "mito",
        hook: "Rápido não é de qualquer *jeito*.",
        mito: "Responder rápido é mandar o valor e pronto.",
        verdade: "Rápido é acolher, explicar e sugerir o próximo passo — em minutos.",
      },
      texto: `Mito ou verdade: “Responder rápido é mandar o preço e pronto.”

Mito. Rapidez sem contexto vira tabela de preço — e tabela não agenda ninguém.

Resposta rápida e boa tem três partes: acolhe, explica o que define o valor e sugere um horário de avaliação.

Qual dessas três a sua equipe mais esquece?`,
    }),
    // ── 2026-11-04 (qua) ──
    secretariaArte({
      id: "2026-11-04-medo-boca",
      data: "2026-11-04",
      tags: "#preenchimentolabial #biomedicinaestetica #biomedicaesteta",
      arte: {
        layout: "antesdepois",
        tag: "Biomédica esteta · Preenchimento labial",
        hook: "O medo dela merece mais que “relaxa”.",
        cliente: "Tenho medo de ficar com a boca exagerada…",
        fraca: "Relaxa, fica natural!",
        resposta:
          "Esse cuidado é muito comum! Na avaliação a gente conversa sobre o que você quer e planeja tudo com calma. Quer ver um horário?",
      },
      texto: `“Tenho medo de ficar com a boca exagerada.”

Resposta fraca: “Relaxa, fica natural!”
Resposta da secretária: “Esse cuidado é muito comum — e é ótimo você falar. Na avaliação a gente conversa sobre o que você quer e planeja tudo com calma. Quer que eu veja um horário?”

A primeira tenta encerrar o medo. A segunda acolhe e leva para a avaliação, sem prometer resultado.

Biomédica esteta que atende e responde ao mesmo tempo: a secretária escreve essa mensagem no seu tom. Você revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-04-noite-roteiro-quanto-custa",
      data: "2026-11-04",
      turno: "noite",
      tags: "#roteirodevendas #recepcaodeclinica",
      arte: {
        layout: "checklist",
        hook: "“Quanto custa?” em *4 passos*.",
        itens: [
          "Agradeça pelo contato, pelo nome",
          "Diga do que o valor depende",
          "Conte como é a avaliação",
          "Ofereça dois horários",
        ],
      },
      texto: `Mini-roteiro para o “quanto custa?” de amanhã:

1. Agradeça pelo contato, pelo nome.
2. Diga do que o valor depende (avaliação, área, quantidade).
3. Conte em uma linha como é a avaliação.
4. Ofereça dois horários — não “quando você puder”.

Salve e mande para quem responde o WhatsApp da clínica.`,
    }),
    // ── 2026-11-05 (qui) ──
    secretariaArte({
      id: "2026-11-05-autonoma-maca",
      data: "2026-11-05",
      tags: "#esteticista #esteticistaautonoma #limpezadepele",
      arte: {
        layout: "agenda",
        tag: "Esteticista autônoma · Limpeza de pele",
        hook: "Mãos ocupadas. WhatsApp *esperando*.",
        itens: [
          "09:00|Limpeza de pele — na maca",
          "09:40|“Tem horário sábado?” — sem resposta",
          "10:30|Limpeza de pele — na maca",
          "11:15|“Quanto é a limpeza?” — esperando",
        ],
      },
      texto: `A agenda de quinta de uma esteticista autônoma:

9h — limpeza de pele, mãos ocupadas.
9h40 — “tem horário sábado?” fica sem resposta.
10h30 — outra limpeza.
11h15 — “quanto é a limpeza?” ainda esperando.

Quem atende sozinha não tem como parar o procedimento para digitar. Mas dá para, no intervalo, colar as mensagens e ter as respostas prontas.

A secretária do LeadBellus escreve cada uma no seu tom. Você revisa e envia em poucos minutos.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-05-noite-enquete-trava",
      data: "2026-11-05",
      turno: "noite",
      tags: "#clinicadeestetica #atendimentoaocliente",
      arte: {
        layout: "pergunta",
        hook: "Qual mensagem mais trava sua *equipe*?",
        itens: ["“Quanto custa?”", "“Vou pensar.”", "“Tá caro.”", "“Dói?”"],
      },
      texto: `Pergunta da noite: qual mensagem mais trava a sua equipe no WhatsApp?

A) “Quanto custa?”
B) “Vou pensar.”
C) “Tá caro.”
D) “Dói?”

Responde com a letra. As mais votadas viram roteiro aqui no perfil.`,
    }),
    // ── 2026-11-06 (sex) ──
    secretariaArte({
      id: "2026-11-06-ta-caro-hof",
      data: "2026-11-06",
      tags: "#harmonizacaofacial #hof #harmonizacao",
      arte: {
        layout: "chat",
        tag: "Harmonização facial",
        hook: "“Tá caro” é pedido de *contexto*.",
        cliente: "Achei caro… vi mais barato em outro lugar.",
        resposta:
          "Entendo! Comparar faz parte. Aqui a harmonização começa com uma avaliação completa e um plano pensado para você. Posso te explicar o que está incluso?",
      },
      texto: `“Achei caro, vi mais barato em outro lugar.”

Para quem faz harmonização facial, essa frase chega toda semana. E a vontade é responder com desconto.

Antes de mexer no valor, dê contexto: como é a avaliação, o planejamento, o cuidado com a segurança e o acompanhamento. Muita gente compara números sem saber o que está incluso.

A secretária do LeadBellus escreve essa resposta no tom da sua clínica — firme, gentil e sem prometer resultado. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-06-noite-bastidor-recepcao",
      data: "2026-11-06",
      turno: "noite",
      tags: "#recepcionista #secretariadeclinica",
      arte: {
        layout: "citacao",
        hook: "Respondo entre o telefone e a *porta*.",
        autor: "Recepcionista de clínica, numa sexta cheia",
      },
      texto: `Bastidor: a recepcionista atende o telefone, recebe quem chega, confirma a agenda de amanhã — e ainda responde o WhatsApp.

Não é falta de vontade quando a resposta sai curta. É falta de tempo.

Se você trabalha na recepção de uma clínica, conta aqui: qual é o momento mais corrido do seu dia?`,
    }),
    // ── 2026-11-07 (sáb) ──
    secretariaArte({
      id: "2026-11-07-derma-primeira-resposta",
      data: "2026-11-07",
      tags: "#bioestimulador #clinicadermatologica #dermatologia",
      arte: {
        layout: "checklist",
        tag: "Clínica dermatológica · Bioestimulador",
        hook: "A primeira resposta precisa ter *isto*.",
        itens: [
          "O nome da cliente",
          "Uma linha de acolhimento",
          "O que define o plano e o valor",
          "Um horário concreto",
        ],
      },
      texto: `Na clínica dermatológica, a agenda do médico é cheia e quem responde o WhatsApp é a equipe. A cliente pergunta sobre bioestimulador e espera.

Checklist da primeira resposta:
• começa pelo nome da cliente
• acolhe a dúvida em uma linha
• explica que o plano e o valor saem da consulta de avaliação
• termina com um horário concreto

A secretária do LeadBellus escreve essa mensagem com tudo isso, no tom da clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-07-noite-mito-so-preco",
      data: "2026-11-07",
      turno: "noite",
      tags: "#vendasnaestetica #clinicadeestetica",
      arte: {
        layout: "mito",
        hook: "Quem pergunta preço quer *só* preço?",
        mito: "Quem pergunta o preço só quer saber o número.",
        verdade: "Muitas vezes é o jeito mais fácil de puxar conversa. Responda com contexto.",
      },
      texto: `Mito ou verdade: “Quem pergunta o preço só quer saber o número.”

Mito. Para muita cliente, “quanto custa?” é só a forma mais fácil de começar a conversa.

Responda com contexto e uma pergunta de volta: “qual área você quer cuidar?”. A conversa continua — e você entende o que ela procura.`,
    }),
    // ── 2026-11-08 (dom) ──
    secretariaArte({
      id: "2026-11-08-orcou-sumiu-hof",
      data: "2026-11-08",
      tags: "#bioestimulador #harmonizacaofacial #hof",
      arte: {
        layout: "persona",
        persona: "Harmonizadora (HOF)",
        tag: "Bioestimulador",
        hook: "Orçou na terça. *Sumiu* na quarta.",
        sub: "Ninguém lembrou de chamar de volta.",
      },
      texto: `A Carol faz harmonização e bioestimulador. Na terça, uma cliente pediu orçamento, agradeceu e disse “vou ver”.

Quarta, quinta, sexta: agenda cheia. Ninguém lembrou de chamar de volta. No domingo, a Carol descobre que a cliente fechou em outro lugar.

Não foi preço. Foi silêncio.

A secretária do LeadBellus escreve o retorno no tom da clínica — leve, sem pressão e com um próximo passo. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-08-noite-roteiro-retorno",
      data: "2026-11-08",
      turno: "noite",
      tags: "#followup #roteirodevendas",
      arte: {
        layout: "chat",
        tag: "Follow-up · 2 dias depois",
        hook: "O retorno que não soa como *cobrança*.",
        cliente: "Obrigada pelas informações! Vou ver e te falo.",
        resposta:
          "Oi, Carla! Passando só para saber se ficou alguma dúvida sobre o bioestimulador. Se quiser, te mostro os horários da semana que vem.",
      },
      texto: `Mini-roteiro de retorno, dois dias depois do orçamento:

“Oi, Carla! Passando só para saber se ficou alguma dúvida sobre o bioestimulador. Se quiser, te mostro os horários da semana que vem.”

Sem “e aí, decidiu?”. Sem desconto. Só a porta aberta.

Salve para usar na segunda.`,
    }),
    // ── 2026-11-09 (seg) ──
    secretariaArte({
      id: "2026-11-09-vou-pensar-toxina",
      data: "2026-11-09",
      tags: "#botox #toxinabotulinica #biomedicinaestetica",
      arte: {
        layout: "citacao",
        tag: "Biomédica esteta · Toxina botulínica",
        hook: "“Vou pensar” ainda não é um *não*.",
        autor: "É uma dúvida que ainda não foi dita",
      },
      texto: `“Vou pensar.”

Para a biomédica esteta, essa resposta depois do orçamento de toxina parece um fim de conversa. Quase sempre não é.

Por trás do “vou pensar” costuma ter uma dúvida que não foi dita: medo de ficar artificial, receio de doer, insegurança sobre o valor.

Em vez de “ok, fico no aguardo”, pergunte com leveza: “claro! Ficou alguma dúvida que eu possa te ajudar a pensar?”.

A secretária do LeadBellus escreve essa resposta no seu tom. Você revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-09-noite-enquete-vou-pensar",
      data: "2026-11-09",
      turno: "noite",
      tags: "#vendasnaestetica #clinicadeestetica",
      arte: {
        layout: "pergunta",
        hook: "O que você responde no “vou pensar”?",
        itens: ["“Ok, fico no aguardo”", "“Ficou alguma dúvida?”", "Um desconto", "Nada — a conversa para"],
      },
      texto: `Pergunta da noite: quando a cliente diz “vou pensar”, o que costuma sair daí?

A) “Ok, fico no aguardo.”
B) “Ficou alguma dúvida?”
C) Um desconto.
D) Nada — a conversa para.

Sem julgamento. Comenta a letra e amanhã a gente fala sobre isso.`,
    }),
    // ── 2026-11-10 (ter) ──
    secretariaArte({
      id: "2026-11-10-laser-tabela",
      data: "2026-11-10",
      tags: "#depilacaoalaser #depilacao #clinicadeestetica",
      arte: {
        layout: "antesdepois",
        tag: "Depilação a laser",
        hook: "Duas respostas. Só uma *agenda*.",
        cliente: "Quanto custa o laser na axila?",
        fraca: "Segue a tabela em PDF.",
        resposta:
          "Oi, Ju! O valor depende do número de sessões, que a gente define na avaliação. Quer que eu reserve um horário para você esta semana?",
      },
      texto: `“Quanto custa o laser na axila?”

Resposta fraca: mandar a tabela inteira em PDF.
Resposta da secretária: “Oi, Ju! O valor depende do número de sessões, que a gente define na avaliação. Quer que eu reserve um horário para você esta semana?”

A tabela faz a cliente comparar número com número. A conversa faz a cliente vir até a clínica.

A secretária do LeadBellus escreve essa resposta no tom da sua clínica de depilação a laser. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-10-noite-mito-desconto",
      data: "2026-11-10",
      turno: "noite",
      tags: "#vendasnaestetica #gestaodeclinica",
      arte: {
        layout: "mito",
        hook: "Desconto fecha venda? *Nem sempre*.",
        mito: "Se ela achou caro, é só dar desconto.",
        verdade: "Desconto por impulso ensina a cliente a esperar o próximo. Primeiro, contexto.",
      },
      texto: `Mito ou verdade: “Se a cliente achou caro, é só dar desconto.”

Mito. Desconto por impulso resolve a conversa de hoje e ensina a cliente a esperar o próximo.

Antes de mexer no valor, explique o que está incluso: avaliação, planejamento, retorno. Muitas vezes, era isso que faltava.`,
    }),
    // ── 2026-11-11 (qua) ──
    secretariaArte({
      id: "2026-11-11-recepcao-remarcacoes",
      data: "2026-11-11",
      tags: "#recepcionista #agendadeclinica #secretariadeclinica",
      arte: {
        layout: "agenda",
        tag: "Recepção · Remarcações",
        hook: "Quarta de manhã: três *remarcações*.",
        itens: [
          "08:10|“Preciso desmarcar amanhã”",
          "08:45|“Dá para trocar para sexta?”",
          "09:20|“Surgiu um imprevisto”",
          "09:30|A recepção ainda abrindo a clínica",
        ],
      },
      texto: `Quarta, antes das 9h30, na recepção:

8h10 — “Preciso desmarcar amanhã.”
8h45 — “Dá para trocar para sexta?”
9h20 — “Surgiu um imprevisto.”

E a recepção ainda está abrindo a clínica.

Remarcação bem respondida segura a cliente na agenda: acolhe, oferece duas opções de horário e confirma. Mal respondida, vira cancelamento.

A secretária do LeadBellus escreve essas mensagens no tom da clínica. A recepção revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-11-noite-roteiro-desmarcou",
      data: "2026-11-11",
      turno: "noite",
      tags: "#agendadeclinica #roteirodevendas",
      arte: {
        layout: "chat",
        tag: "Remarcação",
        hook: "Desmarcou? Ofereça *duas* opções.",
        cliente: "Oi, vou precisar desmarcar amanhã…",
        resposta:
          "Sem problema, Lu! Imprevistos acontecem. Tenho quinta às 15h ou sábado às 10h — qual fica melhor para você?",
      },
      texto: `Mini-roteiro para quando a cliente desmarca:

“Sem problema, Lu! Imprevistos acontecem. Tenho quinta às 15h ou sábado às 10h — qual fica melhor para você?”

Duas opções concretas. Nada de “me avisa quando puder” — esse quase nunca volta.`,
    }),
    // ── 2026-11-12 (qui) ──
    secretariaArte({
      id: "2026-11-12-microagulhamento-nao-voltou",
      data: "2026-11-12",
      tags: "#microagulhamento #donadeclinica #posprocedimento",
      arte: {
        layout: "persona",
        persona: "Dona de clínica",
        tag: "Microagulhamento",
        hook: "Ela fez. Gostou. E *não voltou*.",
        sub: "Ninguém mandou o “como você está?”.",
      },
      texto: `Uma cliente fez microagulhamento, saiu feliz e elogiou o atendimento. O plano previa novas sessões. Ela não voltou.

Não houve reclamação. Só faltou alguém perguntar, alguns dias depois: “como você está? Ficou alguma dúvida sobre os cuidados?”.

A mensagem de pós-procedimento é a mais fácil de esquecer — e a que mais aproxima a cliente da próxima sessão.

A secretária do LeadBellus escreve essa mensagem no tom da sua clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-12-noite-tres-mensagens-pos",
      data: "2026-11-12",
      turno: "noite",
      tags: "#posprocedimento #relacionamentocomcliente",
      arte: {
        layout: "checklist",
        hook: "Pós-procedimento: três mensagens que *aproximam*.",
        itens: ["No dia: “chegou bem?”", "Dias depois: “como você está?”", "Perto do retorno: “vamos agendar?”"],
      },
      texto: `Três mensagens de pós-procedimento que aproximam a cliente:

• No mesmo dia: “Chegou bem? Qualquer dúvida, estou por aqui.”
• Alguns dias depois: “Como você está se sentindo?”
• Perto do retorno: “Quer que eu já reserve o seu horário?”

Nenhuma vende. Todas cuidam. Os prazos certos são os que o profissional da clínica orientar.`,
    }),
    // ── 2026-11-13 (sex) ──
    secretariaArte({
      id: "2026-11-13-derma-nao-envia-sozinha",
      data: "2026-11-13",
      tags: "#clinicadermatologica #dermatologia #iaparaclinicas",
      arte: {
        layout: "mito",
        tag: "Clínica dermatológica",
        hook: "Ela escreve. Sua equipe *decide*.",
        mito: "IA no WhatsApp fala sozinha com as pacientes.",
        verdade: "No LeadBellus, a secretária só escreve. A equipe revisa, ajusta e decide o que enviar.",
      },
      texto: `Mito ou verdade: “Usar IA no WhatsApp da clínica é deixar um robô falando com as pacientes.”

No LeadBellus, mito. A secretária só escreve: você cola a mensagem e recebe 3 opções — Suave, Consultiva e Fechamento. Quem revisa, ajusta e envia é a equipe.

Para a clínica dermatológica, isso importa: nada sai sem alguém da equipe ler antes, e as respostas evitam promessa de resultado e diagnóstico pelo WhatsApp.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-13-noite-doi",
      data: "2026-11-13",
      turno: "noite",
      tags: "#botox #toxinabotulinica",
      arte: {
        layout: "antesdepois",
        tag: "Toxina botulínica",
        hook: "“Dói?” pede acolhimento, não *pressa*.",
        cliente: "Dói muito aplicar botox?",
        fraca: "Não dói nada!",
        resposta:
          "É uma dúvida super comum! A sensação varia de pessoa para pessoa, e na avaliação o profissional explica tudo sobre o conforto no procedimento.",
      },
      texto: `A cliente escreve: “Dói muito aplicar botox?”

Resposta fraca: “Não dói nada!”
Resposta melhor: “É uma dúvida super comum! A sensação varia de pessoa para pessoa, e na avaliação o profissional explica tudo sobre o conforto no procedimento.”

A primeira promete. A segunda acolhe — e é honesta.`,
    }),
    // ── 2026-11-14 (sáb) ──
    secretariaArte({
      id: "2026-11-14-sabado-hof",
      data: "2026-11-14",
      tags: "#harmonizacaofacial #preenchimento #hof",
      arte: {
        layout: "citacao",
        tag: "Harmonização · Sábado",
        hook: "Sábado é o dia que mais chega *mensagem*.",
        autor: "Harmonizadora, entre um atendimento e outro",
      },
      texto: `Sábado na clínica de harmonização: agenda cheia, sala ocupada — e o WhatsApp recebendo pergunta de quem só tem tempo de pesquisar no fim de semana.

“Quanto fica o preenchimento?” “Tem horário semana que vem?” “Vocês fazem bioestimulador?”

Quem responde segunda de manhã chega depois de quem respondeu no sábado.

A secretária do LeadBellus deixa as respostas prontas no intervalo, no tom da sua clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-14-noite-roteiro-fora-horario",
      data: "2026-11-14",
      turno: "noite",
      tags: "#limpezadepele #roteirodevendas",
      arte: {
        layout: "chat",
        tag: "Fora do horário",
        hook: "Mensagem às 22h? Responda assim *amanhã*.",
        cliente: "Oi! Vocês fazem limpeza de pele? Queria marcar.",
        resposta:
          "Bom dia, Rê! Vi sua mensagem de ontem. Fazemos sim — tenho terça às 14h ou quinta às 10h. Qual prefere?",
      },
      texto: `Mini-roteiro para a mensagem que chegou tarde da noite:

“Bom dia, Rê! Vi sua mensagem de ontem. Fazemos limpeza de pele, sim — tenho terça às 14h ou quinta às 10h. Qual prefere?”

Ela mostra que a mensagem foi vista, responde a dúvida e já oferece horário. Logo cedo, antes de a cliente procurar outra clínica.`,
    }),
    // ── 2026-11-15 (dom, feriado) ──
    secretariaArte({
      id: "2026-11-15-feriado-autonoma",
      data: "2026-11-15",
      tags: "#esteticistaautonoma #esteticista #organizacao",
      arte: {
        layout: "checklist",
        tag: "Feriado · Esteticista autônoma",
        hook: "Feriado: deixe o WhatsApp em *ordem*.",
        itens: [
          "Avise o horário da semana",
          "Responda quem ficou esperando",
          "Confirme as clientes de segunda",
          "Anote quem orçou e não fechou",
        ],
      },
      texto: `Feriado de domingo, segunda chegando. Para a esteticista autônoma, é a hora de deixar o WhatsApp em ordem:

• avisar o horário de funcionamento da semana
• responder quem ficou esperando
• confirmar as clientes de segunda
• anotar quem pediu orçamento e não fechou

Quinze minutos hoje evitam uma segunda inteira apagando incêndio.

A secretária do LeadBellus escreve todas essas mensagens no seu tom. Você revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-15-noite-enquete-folga",
      data: "2026-11-15",
      turno: "noite",
      tags: "#rotinadeclinica #clinicadeestetica",
      arte: {
        layout: "pergunta",
        hook: "Você responde WhatsApp no *feriado*?",
        itens: ["Sim, normalmente", "Só o que é urgente", "Deixo para o dia seguinte", "Aviso que estou de folga"],
      },
      texto: `Pergunta de feriado: você responde o WhatsApp da clínica em dia de folga?

A) Sim, normalmente.
B) Só o que é urgente.
C) Deixo para o dia seguinte.
D) Aviso que estou de folga.

Não tem resposta certa — tem a que cabe na sua rotina. Conta aqui.`,
    }),
    // ── 2026-11-16 (seg) ──
    secretariaArte({
      id: "2026-11-16-medo-artificial-hof",
      data: "2026-11-16",
      tags: "#harmonizacaofacial #biomedicinaestetica #naturalidade",
      arte: {
        layout: "chat",
        tag: "Biomédica esteta · Harmonização facial",
        hook: "Medo de ficar artificial? *Comece por aí*.",
        cliente: "Quero fazer harmonização, mas morro de medo de ficar artificial.",
        resposta:
          "Faz todo sentido esse cuidado! Na avaliação a gente conversa sobre o que você quer manter no seu rosto e planeja junto, com calma. Quer ver um horário?",
      },
      texto: `“Quero fazer harmonização, mas morro de medo de ficar artificial.”

Essa frase não é uma objeção a vencer. É o motivo de a cliente ter escrito para você.

A biomédica esteta que responde “fica natural, pode confiar” perde a chance de conversar. A que acolhe o medo — e explica que tudo começa por uma avaliação e um planejamento conjunto — abre espaço para a confiança.

A secretária do LeadBellus escreve essa resposta no tom da sua clínica, sem prometer resultado. Você revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-16-noite-mito-audio",
      data: "2026-11-16",
      turno: "noite",
      tags: "#atendimentoaocliente #whatsappbusiness",
      arte: {
        layout: "mito",
        hook: "Áudio resolve mais rápido? *Depende*.",
        mito: "Mandar áudio é sempre mais rápido e mais pessoal.",
        verdade: "Muita cliente lê no trabalho. Texto curto e claro funciona melhor no primeiro contato.",
      },
      texto: `Mito ou verdade: “Áudio é sempre mais rápido e mais pessoal.”

Depende. Muita cliente lê o WhatsApp no trabalho ou no transporte e não consegue ouvir na hora.

No primeiro contato, texto curto e claro costuma funcionar melhor. O áudio pode vir depois, se ela preferir — pergunte.`,
    }),
    // ── 2026-11-17 (ter) ──
    secretariaArte({
      id: "2026-11-17-cinco-conversas-paradas",
      data: "2026-11-17",
      tags: "#donadeclinica #gestaodeclinica #clinicadeestetica",
      arte: {
        layout: "agenda",
        tag: "Dona de clínica · Terça cedo",
        hook: "Cinco conversas paradas desde *sábado*.",
        itens: [
          "Ana|Preenchimento labial — pediu valor",
          "Bruna|Limpeza de pele — quer sábado",
          "Cris|Toxina — “vou pensar”",
          "Dani|Drenagem — sem resposta",
          "Eli|Bioestimulador — “dói?”",
        ],
      },
      texto: `Terça cedo. A dona da clínica abre o WhatsApp e encontra cinco conversas paradas desde sábado:

Ana quer saber o valor do preenchimento labial.
Bruna quer limpeza de pele no sábado.
Cris disse “vou pensar” sobre a toxina.
Dani perguntou da drenagem e ninguém respondeu.
Eli quer saber se o bioestimulador dói.

Cinco conversas, cinco respostas diferentes. A secretária do LeadBellus escreve cada uma no tom da clínica. A equipe revisa e envia — em minutos.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-17-noite-termine-com-pergunta",
      data: "2026-11-17",
      turno: "noite",
      tags: "#dicadeatendimento #vendasnaestetica",
      arte: {
        layout: "citacao",
        hook: "Resposta boa termina com uma *pergunta*.",
        autor: "Dica da noite",
      },
      texto: `Dica da noite: toda resposta boa termina com uma pergunta.

“Quer que eu veja um horário?” “Qual área você quer cuidar?” “Prefere manhã ou tarde?”

Sem pergunta, a conversa acaba em você. Com pergunta, a próxima mensagem é dela.`,
    }),
    // ── 2026-11-18 (qua) ──
    secretariaArte({
      id: "2026-11-18-pacote-drenagem",
      data: "2026-11-18",
      tags: "#drenagemlinfatica #esteticistaautonoma #esteticacorporal",
      arte: {
        layout: "antesdepois",
        tag: "Esteticista autônoma · Drenagem",
        hook: "Pacote de drenagem: venda o *cuidado*.",
        cliente: "Quanto fica o pacote de drenagem?",
        fraca: "10 sessões, valor na tabela.",
        resposta:
          "Oi, Dani! A gente monta o pacote de acordo com a sua rotina e o seu objetivo. Posso te fazer duas perguntas rápidas para indicar o melhor formato?",
      },
      texto: `“Quanto fica o pacote de drenagem?”

Resposta fraca: “10 sessões, valor na tabela.”
Resposta da secretária: “Oi, Dani! A gente monta o pacote de acordo com a sua rotina e o seu objetivo. Posso te fazer duas perguntas rápidas para indicar o melhor formato?”

A primeira entrega um número. A segunda começa um atendimento.

Esteticista autônoma não tem tempo de pensar em cada resposta entre uma sessão e outra. A secretária do LeadBellus escreve no seu tom. Você revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-18-noite-enquete-quem-responde",
      data: "2026-11-18",
      turno: "noite",
      tags: "#rotinadeclinica #recepcionista",
      arte: {
        layout: "pergunta",
        hook: "Quem responde o WhatsApp da sua *clínica*?",
        itens: ["Eu mesma, entre atendimentos", "A recepção", "Quem estiver livre", "Cada dia é um"],
      },
      texto: `Pergunta da noite: quem responde o WhatsApp da sua clínica?

A) Eu mesma, entre um atendimento e outro.
B) A recepção.
C) Quem estiver livre na hora.
D) Cada dia é um.

Comenta a letra — a resposta muda muito o tipo de ajuda que faz sentido.`,
    }),
    // ── 2026-11-19 (qui) ──
    secretariaArte({
      id: "2026-11-19-recepcao-indicacao",
      data: "2026-11-19",
      tags: "#recepcionista #indicacao #limpezadepele",
      arte: {
        layout: "persona",
        persona: "Recepcionista",
        tag: "Indicação de cliente",
        hook: "“Foi a Paula que me indicou.” E *agora*?",
        sub: "Indicação pede uma resposta à altura.",
      },
      texto: `A Lia é recepcionista de uma clínica de estética. Chega a mensagem: “Oi! A Paula me indicou vocês. Queria saber sobre limpeza de pele.”

Indicação é a cliente mais fácil de agendar — e a mais fácil de decepcionar com um “segue a tabela”.

Uma boa resposta agradece a indicação, chama pelo nome, mostra que a clínica está feliz em receber e já oferece um horário.

A secretária do LeadBellus escreve essa mensagem no tom da clínica. A recepção revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-19-noite-mito-emoji",
      data: "2026-11-19",
      turno: "noite",
      tags: "#comunicacao #clinicadeestetica",
      arte: {
        layout: "mito",
        hook: "Emoji deixa a clínica pouco *profissional*?",
        mito: "Clínica séria não usa emoji no WhatsApp.",
        verdade: "Um emoji bem colocado deixa a conversa leve. O que pesa é exagero e erro de digitação.",
      },
      texto: `Mito ou verdade: “Clínica séria não usa emoji no WhatsApp.”

Mito. Um emoji bem colocado deixa a conversa mais leve e próxima. O que pesa é exagero — e erro de digitação na pressa.

A regra: o tom da clínica primeiro, o emoji depois.`,
    }),
    // ── 2026-11-20 (sex, feriado) ──
    secretariaArte({
      id: "2026-11-20-feriadao-quatro-mensagens",
      data: "2026-11-20",
      tags: "#harmonizacaofacial #agendadeclinica #feriado",
      arte: {
        layout: "checklist",
        tag: "Feriado prolongado",
        hook: "Feriadão: 4 mensagens para deixar *prontas*.",
        itens: [
          "Aviso de horário do feriado",
          "“Tem horário semana que vem?”",
          "Retorno para quem orçou",
          "Confirmação de segunda",
        ],
      },
      texto: `Feriado de sexta, fim de semana prolongado. As mensagens não tiram folga.

Quatro respostas para deixar prontas antes de sair:
• o aviso de horário do feriado
• o “tem horário semana que vem?”
• o retorno para quem pediu orçamento
• a confirmação das clientes de segunda

A secretária do LeadBellus escreve as quatro no tom da sua clínica. A equipe revisa e envia quando for a hora.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-20-noite-roteiro-abre-feriado",
      data: "2026-11-20",
      turno: "noite",
      tags: "#agendadeclinica #roteirodevendas",
      arte: {
        layout: "chat",
        tag: "Feriado",
        hook: "“Abre no feriado?” Não termine no *não*.",
        cliente: "Vocês abrem amanhã? É feriado, né?",
        resposta:
          "Oi, Bel! No feriado a clínica fecha, mas segunda tenho horário às 11h e às 16h. Quer que eu reserve um para você?",
      },
      texto: `Mini-roteiro para “vocês abrem no feriado?”:

“Oi, Bel! No feriado a clínica fecha, mas segunda tenho horário às 11h e às 16h. Quer que eu reserve um para você?”

Um não que já vira agendamento.`,
    }),
    // ── 2026-11-21 (sáb) ──
    secretariaArte({
      id: "2026-11-21-semana-black-friday",
      data: "2026-11-21",
      tags: "#blackfriday #donadeclinica #clinicadeestetica",
      arte: {
        layout: "agenda",
        tag: "Semana da Black Friday",
        hook: "A semana mais cheia do *WhatsApp*.",
        itens: [
          "SEG|“Vai ter promoção?”",
          "TER|“Quanto fica com desconto?”",
          "QUA|“Dá para parcelar?”",
          "SEX|Black Friday — fila de mensagens",
        ],
      },
      texto: `Semana que vem é Black Friday. No WhatsApp da clínica, costuma ser assim:

Segunda: “vai ter promoção?”
Terça: “quanto fica com desconto?”
Quarta: “dá para parcelar?”
Sexta: fila de mensagens.

Tendo promoção ou não, cada pergunta pede uma resposta clara — sem prometer o que a clínica não vai fazer.

Com a secretária do LeadBellus, a equipe tem as respostas prontas no tom da clínica. Revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-21-noite-promocao-conversa",
      data: "2026-11-21",
      turno: "noite",
      tags: "#blackfriday #vendasnaestetica",
      arte: {
        layout: "citacao",
        hook: "Promoção não substitui uma boa *conversa*.",
        autor: "Dica da noite · Black Friday",
      },
      texto: `Dica da noite: promoção atrai mensagem, mas quem agenda é a conversa.

Se a sua clínica vai ter condição especial na Black Friday, explique as regras com clareza: o que entra, até quando, como agendar.

Se não vai ter, diga com gentileza — e ofereça a avaliação mesmo assim.`,
    }),
    // ── 2026-11-22 (dom) ──
    secretariaArte({
      id: "2026-11-22-sem-black-friday",
      data: "2026-11-22",
      tags: "#blackfriday #donadeclinica #gestaodeclinica",
      arte: {
        layout: "antesdepois",
        tag: "Black Friday sem promoção",
        hook: "Sem promoção? Ainda dá para *agendar*.",
        cliente: "Vai ter Black Friday aí?",
        fraca: "Não vamos ter promoção.",
        resposta:
          "Oi, Mari! Este ano não teremos promoção, mas posso te explicar como funciona a avaliação e reservar um horário com calma. Quer ver as opções?",
      },
      texto: `Sua clínica não vai fazer Black Friday? Tudo bem. A pergunta vai chegar mesmo assim.

“Vai ter Black Friday aí?”

Resposta fraca: “Não vamos ter promoção.”
Resposta da secretária: “Oi, Mari! Este ano não teremos promoção, mas posso te explicar como funciona a avaliação e reservar um horário com calma. Quer ver as opções?”

Um não que mantém a conversa viva. A secretária do LeadBellus escreve no tom da sua clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-22-noite-enquete-black-friday",
      data: "2026-11-22",
      turno: "noite",
      tags: "#blackfriday #clinicadeestetica",
      arte: {
        layout: "pergunta",
        hook: "Sua clínica vai fazer *Black Friday*?",
        itens: ["Sim, com condição especial", "Só para clientes da casa", "Não este ano", "Ainda estou decidindo"],
      },
      texto: `Pergunta da noite: sua clínica vai fazer Black Friday este ano?

A) Sim, com condição especial.
B) Só para clientes da casa.
C) Não este ano.
D) Ainda estou decidindo.

Comenta a letra. Esta semana vamos postar roteiros para cada caso.`,
    }),
    // ── 2026-11-23 (seg) ──
    secretariaArte({
      id: "2026-11-23-promocao-clara",
      data: "2026-11-23",
      tags: "#blackfriday #harmonizacaofacial #hof",
      arte: {
        layout: "checklist",
        tag: "Black Friday com promoção",
        hook: "Promoção clara evita conversa *travada*.",
        itens: [
          "O que entra na condição",
          "Até quando vale",
          "Como reservar o horário",
          "O que depende da avaliação",
        ],
      },
      texto: `Vai ter condição especial na Black Friday? Então a mensagem precisa ser clara antes de ser bonita.

Checklist da resposta:
• o que entra na condição
• até quando vale
• como reservar o horário
• o que continua dependendo da avaliação

Sem isso, cada cliente faz cinco perguntas — e a equipe responde cinco vezes.

A secretária do LeadBellus escreve essas respostas no tom da clínica, sem promessa de resultado. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-23-noite-mito-menor-preco",
      data: "2026-11-23",
      turno: "noite",
      tags: "#blackfriday #vendasnaestetica",
      arte: {
        layout: "mito",
        hook: "Na Black Friday, só o preço *importa*?",
        mito: "Na Black Friday, a cliente só quer o menor preço.",
        verdade: "Ela também quer segurança. Quem explica o cuidado se destaca no meio das promoções.",
      },
      texto: `Mito ou verdade: “Na Black Friday, a cliente só quer o menor preço.”

Mito. Em estética, ela também quer se sentir segura com quem vai cuidar dela.

No meio de tantas promoções, a clínica que explica a avaliação e o cuidado se destaca — mesmo sem ser a mais barata.`,
    }),
    // ── 2026-11-24 (ter) ──
    secretariaArte({
      id: "2026-11-24-tres-clinicas",
      data: "2026-11-24",
      tags: "#preenchimentolabial #harmonizacaofacial #hof",
      arte: {
        layout: "persona",
        persona: "Harmonizadora (HOF)",
        tag: "Preenchimento labial",
        hook: "Ela está conversando com *três* clínicas.",
        sub: "Sai na frente quem responde rápido — e bem.",
      },
      texto: `Semana de Black Friday. Uma cliente quer preenchimento labial e mandou a mesma mensagem para três clínicas.

A primeira respondeu só o valor. A segunda respondeu no dia seguinte. A terceira respondeu em minutos, chamou pelo nome, explicou a avaliação e ofereceu dois horários.

Adivinha qual ela foi conhecer.

A secretária do LeadBellus deixa a sua resposta pronta em segundos, no tom da sua clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-24-noite-roteiro-parcelar",
      data: "2026-11-24",
      turno: "noite",
      tags: "#roteirodevendas #formasdepagamento",
      arte: {
        layout: "chat",
        tag: "Forma de pagamento",
        hook: "“Posso parcelar?” é sinal de *interesse*.",
        cliente: "Dá para parcelar o preenchimento?",
        resposta:
          "Dá sim, Nina! As formas de pagamento a gente combina depois da avaliação. Quer que eu veja um horário para você esta semana?",
      },
      texto: `Mini-roteiro para “posso parcelar?”:

“Dá sim, Nina! As formas de pagamento a gente combina depois da avaliação. Quer que eu veja um horário para você esta semana?”

Quem pergunta como pagar já está imaginando fazer. Responda e leve para o próximo passo — sempre de acordo com a política da sua clínica.`,
    }),
    // ── 2026-11-25 (qua) ──
    secretariaArte({
      id: "2026-11-25-lista-que-vale-ouro",
      data: "2026-11-25",
      tags: "#blackfriday #followup #donadeclinica",
      arte: {
        layout: "agenda",
        tag: "Antes da Black Friday",
        hook: "A lista que vale ouro esta *semana*.",
        itens: [
          "OUT|Pediu valor do bioestimulador",
          "OUT|Disse “vou pensar” na toxina",
          "SET|Fez limpeza e não voltou",
          "SET|Perguntou de laser e sumiu",
        ],
      },
      texto: `Antes de gastar com anúncio na Black Friday, abra o WhatsApp e faça uma lista:

• quem pediu valor do bioestimulador em outubro
• quem disse “vou pensar” na toxina
• quem fez limpeza de pele em setembro e não voltou
• quem perguntou de laser e sumiu

Essas clientes já conhecem a sua clínica. Uma mensagem bem escrita, sem pressão, pode reabrir a conversa.

A secretária do LeadBellus escreve cada retomada no tom da clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-25-noite-retomar-nao-cobrar",
      data: "2026-11-25",
      turno: "noite",
      tags: "#followup #dicadeatendimento",
      arte: {
        layout: "citacao",
        hook: "Retomar a conversa não é *cobrar* resposta.",
        autor: "Dica da noite",
      },
      texto: `Dica da noite: retomar a conversa não é cobrar resposta.

“E aí, decidiu?” pressiona.
“Lembrei de você porque abrimos horários na semana que vem” ajuda.

Mesma intenção, sensação completamente diferente.`,
    }),
    // ── 2026-11-26 (qui) ──
    secretariaArte({
      id: "2026-11-26-mito-cara-de-robo",
      data: "2026-11-26",
      tags: "#recepcionista #iaparaclinicas #secretariadeclinica",
      arte: {
        layout: "mito",
        tag: "Recepção",
        hook: "Resposta de IA tem cara de *robô*?",
        mito: "Resposta escrita com IA sempre parece robô.",
        verdade: "A secretária usa o tom da sua clínica — e a equipe ajusta o que quiser antes de enviar.",
      },
      texto: `Mito ou verdade: “Resposta escrita com IA sempre parece robô.”

Mito — quando a ferramenta conhece a clínica. No LeadBellus, você cadastra o tom, os procedimentos e o jeito de falar da clínica. A secretária escreve 3 opções nesse tom: Suave, Consultiva e Fechamento.

A recepção escolhe uma, ajusta o que quiser e envia. Fica com cara de gente, porque quem decide é gente.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-26-noite-cliente-da-casa",
      data: "2026-11-26",
      turno: "noite",
      tags: "#relacionamentocomcliente #clinicadeestetica",
      arte: {
        layout: "antesdepois",
        tag: "Cliente da casa",
        hook: "Cliente antiga pedindo desconto? *Valorize*.",
        cliente: "Já sou cliente, tem algum desconto para mim?",
        fraca: "Não temos desconto.",
        resposta:
          "Oi, Tati! Que bom te ver por aqui de novo. Vou ver com a equipe o que temos para clientes da casa e já te falo. Reservo seu horário enquanto isso?",
      },
      texto: `A cliente escreve: “Já sou cliente, tem algum desconto para mim?”

Resposta fraca: “Não temos desconto.”
Resposta melhor: “Oi, Tati! Que bom te ver por aqui de novo. Vou ver com a equipe o que temos para clientes da casa e já te falo. Quer que eu reserve seu horário enquanto isso?”

Mesmo que a resposta final seja não, ela se sente lembrada.`,
    }),
    // ── 2026-11-27 (sex, Black Friday) ──
    secretariaArte({
      id: "2026-11-27-black-friday-hoje",
      data: "2026-11-27",
      tags: "#blackfriday #clinicadeestetica #harmonizacaofacial",
      arte: {
        layout: "citacao",
        tag: "Black Friday",
        hook: "Hoje o WhatsApp da clínica não *para*.",
        autor: "Sexta, 27 de novembro",
        sub: "Plano Start R$97/mês",
      },
      texto: `Hoje é Black Friday. O WhatsApp da clínica não vai parar.

“Vai ter promoção?” “Quanto fica?” “Dá para parcelar?” “Tem horário amanhã?” — tudo ao mesmo tempo, enquanto a equipe atende.

A secretária do LeadBellus escreve a próxima mensagem de cada conversa no tom da sua clínica, em segundos. A equipe só revisa e envia.

Plano Start por R$97/mês. Para conhecer, as primeiras são por nossa conta: 5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-27-noite-enquete-mais-chegou",
      data: "2026-11-27",
      turno: "noite",
      tags: "#blackfriday #rotinadeclinica",
      arte: {
        layout: "pergunta",
        hook: "Qual pergunta mais chegou *hoje*?",
        itens: ["“Vai ter promoção?”", "“Quanto fica?”", "“Dá para parcelar?”", "“Tem horário amanhã?”"],
      },
      texto: `Pergunta de Black Friday: qual mensagem mais chegou hoje no WhatsApp da clínica?

A) “Vai ter promoção?”
B) “Quanto fica?”
C) “Dá para parcelar?”
D) “Tem horário amanhã?”

Comenta a letra. Amanhã tem roteiro para quem não fechou.`,
    }),
    // ── 2026-11-28 (sáb) ──
    secretariaArte({
      id: "2026-11-28-perdi-a-promocao",
      data: "2026-11-28",
      tags: "#esteticistaautonoma #limpezadepele #blackfriday",
      arte: {
        layout: "chat",
        tag: "Esteticista autônoma · Depois da Black Friday",
        hook: "“Perdi a promoção?” Não perca a *cliente*.",
        cliente: "Vi a promoção ontem, ainda dá tempo?",
        resposta:
          "Oi, Lê! A condição era até ontem, mas posso te encaixar numa avaliação esta semana e explicar as opções com calma. Quer ver um horário?",
      },
      texto: `Sábado depois da Black Friday. Chega: “Vi a promoção ontem, ainda dá tempo?”

Se a condição acabou, diga com clareza — e não feche a porta. “A condição era até ontem, mas posso te encaixar numa avaliação esta semana e explicar as opções com calma. Quer ver um horário?”

Para a esteticista autônoma, cada conversa dessas é uma cliente que já levantou a mão.

A secretária do LeadBellus escreve essa resposta no seu tom. Você revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-28-noite-mito-agenda-esfria",
      data: "2026-11-28",
      turno: "noite",
      tags: "#followup #blackfriday",
      arte: {
        layout: "mito",
        hook: "Depois da Black Friday, a agenda *esfria*?",
        mito: "Passou a Black Friday, a agenda esfria.",
        verdade: "Quem conversou e não fechou continua interessada. É hora do follow-up leve.",
      },
      texto: `Mito ou verdade: “Passou a Black Friday, a agenda esfria.”

Mito. Quem conversou com a clínica nesta semana e não fechou continua interessada — só não decidiu ainda.

Na segunda, um follow-up leve, sem pressão, retoma de onde parou.`,
    }),
    // ── 2026-11-29 (dom) ──
    secretariaArte({
      id: "2026-11-29-derma-quem-responde",
      data: "2026-11-29",
      tags: "#clinicadermatologica #dermatologia #equipedeatendimento",
      arte: {
        layout: "persona",
        persona: "Dermatologista com clínica",
        tag: "Equipe de atendimento",
        hook: "O médico atende. Quem *responde*?",
        sub: "A equipe toda no mesmo tom da clínica.",
      },
      texto: `Na clínica dermatológica, o médico está no consultório. O WhatsApp fica com a equipe — e a equipe muda: recepção de manhã, outra pessoa à tarde, alguém cobrindo férias.

Resultado: cada uma responde de um jeito. Uma é curta, outra promete demais, outra esquece de oferecer horário.

A secretária do LeadBellus dá à equipe inteira respostas no tom da clínica, sem diagnóstico e sem promessa de resultado. Cada pessoa revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-29-noite-domingo-tres-minutos",
      data: "2026-11-29",
      turno: "noite",
      tags: "#organizacao #rotinadeclinica",
      arte: {
        layout: "checklist",
        hook: "Domingo: três minutos que salvam a *segunda*.",
        itens: ["Veja quem ficou sem resposta", "Separe quem orçou e não fechou", "Confirme as clientes de segunda"],
      },
      texto: `Três minutos de domingo que salvam a segunda:

• veja quem ficou sem resposta no fim de semana
• separe quem pediu orçamento e não fechou
• confirme as clientes de segunda cedo

Segunda começa com lista pronta, não com susto.`,
    }),
    // ── 2026-11-30 (seg) ──
    secretariaArte({
      id: "2026-11-30-pronta-para-o-natal",
      data: "2026-11-30",
      tags: "#botox #biomedicinaestetica #dezembro",
      arte: {
        layout: "antesdepois",
        tag: "Biomédica esteta · Antes das festas",
        hook: "“Quero ficar pronta para o *Natal*.”",
        cliente: "Quero fazer o botox antes do Natal, dá tempo?",
        fraca: "Dá sim, pode vir.",
        resposta:
          "Que bom que você se planejou! O melhor momento a gente define na avaliação. Dezembro costuma lotar — que tal reservar já? Tenho quinta às 10h.",
      },
      texto: `Dezembro chegando e com ele a mensagem: “Quero fazer o botox antes do Natal, dá tempo?”

Resposta fraca: “Dá sim, pode vir.”
Resposta da secretária: “Que bom que você se planejou! O melhor momento a gente define na avaliação. Dezembro costuma lotar, então que tal reservar já? Tenho quinta às 10h.”

A primeira promete. A segunda orienta, sem prometer, e já reserva o horário.

A secretária do LeadBellus escreve no seu tom. Você revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-11-30-noite-enquete-novembro",
      data: "2026-11-30",
      turno: "noite",
      tags: "#rotinadeclinica #clinicadeestetica",
      arte: {
        layout: "pergunta",
        hook: "Como foi novembro no seu *WhatsApp*?",
        itens: ["Mais mensagens que o normal", "Igual aos outros meses", "Mais parado", "Nem consegui contar"],
      },
      texto: `Pergunta da noite: como foi novembro no WhatsApp da sua clínica?

A) Mais mensagens que o normal.
B) Igual aos outros meses.
C) Mais parado.
D) Nem consegui contar.

Conta aqui — e diz qual mensagem foi a mais difícil de responder.`,
    }),
    // ── 2026-12-01 (ter) ──
    secretariaArte({
      id: "2026-12-01-cliente-antiga",
      data: "2026-12-01",
      tags: "#bioestimulador #donadeclinica #relacionamentocomcliente",
      arte: {
        layout: "persona",
        persona: "Dona de clínica",
        tag: "Cliente antiga · Bioestimulador",
        hook: "Seis meses sem notícia. Uma mensagem *reabre*.",
        sub: "Ela não foi embora. Só ninguém chamou.",
      },
      texto: `A Re fez bioestimulador em junho. Gostou, elogiou, disse que voltaria. Seis meses depois, nenhuma notícia.

Ela não foi para outra clínica. Só ninguém chamou.

Em dezembro, uma mensagem simples reabre a conversa: “Oi, Re! Lembrei de você esta semana. Como você está? Se quiser, temos horários antes das festas.”

A secretária do LeadBellus escreve essa retomada no tom da clínica — sem pressão, sem promessa. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-12-01-noite-roteiro-vespera",
      data: "2026-12-01",
      turno: "noite",
      tags: "#agendadeclinica #roteirodevendas",
      arte: {
        layout: "chat",
        ordem: "clinica",
        tag: "Confirmação de véspera",
        hook: "Confirmação que a cliente *responde*.",
        cliente: "Tudo certo! Obrigada por lembrar.",
        resposta: "Oi, Gabi! Passando para confirmar sua limpeza de pele amanhã às 15h. Está tudo certo para você?",
      },
      texto: `Mini-roteiro de confirmação de véspera:

“Oi, Gabi! Passando para confirmar sua limpeza de pele amanhã às 15h. Está tudo certo para você?”

Termina com pergunta — e a cliente responde. “Lembrete: consulta amanhã” ninguém responde.`,
    }),
    // ── 2026-12-02 (qua) ──
    secretariaArte({
      id: "2026-12-02-festas-planejamento",
      data: "2026-12-02",
      tags: "#harmonizacaofacial #hof #dezembro",
      arte: {
        layout: "checklist",
        tag: "Harmonização · Dezembro",
        hook: "Antes das festas, responda com *planejamento*.",
        itens: [
          "Pergunte a data do evento",
          "Explique que o plano sai da avaliação",
          "Ofereça os horários mais próximos",
          "Não prometa prazo de resultado",
        ],
      },
      texto: `Dezembro é o mês do “quero ficar bonita para a festa”. Para quem faz harmonização, é também o mês de responder com cuidado.

Checklist da resposta:
• pergunte a data do evento
• explique que o plano sai da avaliação
• ofereça os horários mais próximos
• não prometa prazo de resultado

Planejamento passa segurança. Promessa vira problema.

A secretária do LeadBellus escreve essas respostas no tom da clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-12-02-noite-mito-mensagem-longa",
      data: "2026-12-02",
      turno: "noite",
      tags: "#comunicacao #dicadeatendimento",
      arte: {
        layout: "mito",
        hook: "Mensagem longa ninguém *lê*?",
        mito: "Mensagem longa ninguém lê no WhatsApp.",
        verdade: "Ninguém lê mensagem confusa. Três frases claras, com um próximo passo, funcionam.",
      },
      texto: `Mito ou verdade: “Mensagem longa ninguém lê.”

Meia verdade. Ninguém lê mensagem confusa. Três frases claras — acolhe, explica, sugere um horário — são lidas até o fim.

O problema nunca foi o tamanho. É não ter um próximo passo.`,
    }),
    // ── 2026-12-03 (qui) ──
    secretariaArte({
      id: "2026-12-03-recepcao-dezembro",
      data: "2026-12-03",
      tags: "#recepcionista #agendadeclinica #dezembro",
      arte: {
        layout: "agenda",
        tag: "Recepção · Dezembro",
        hook: "Dezembro: a agenda fecha antes do *mês*.",
        itens: [
          "SEG|“Tem horário dia 20?”",
          "TER|“E dia 22?”",
          "QUA|“Qualquer dia antes do Natal!”",
          "QUI|Agenda de dezembro quase cheia",
        ],
      },
      texto: `Na recepção, dezembro tem um roteiro conhecido:

Segunda: “tem horário dia 20?”
Terça: “e dia 22?”
Quarta: “qualquer dia antes do Natal!”
Quinta: agenda quase cheia.

Quem responde rápido e oferece horário concreto preenche a agenda com quem já estava decidida. Quem demora passa dezembro dizendo “não tenho mais”.

A secretária do LeadBellus escreve essas respostas no tom da clínica. A recepção revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-12-03-noite-agenda-cheia",
      data: "2026-12-03",
      turno: "noite",
      tags: "#agendadeclinica #dicadeatendimento",
      arte: {
        layout: "antesdepois",
        tag: "Agenda cheia",
        hook: "Agenda cheia não é fim de *conversa*.",
        cliente: "Tem horário antes do Natal?",
        fraca: "Não tenho mais.",
        resposta:
          "Antes do Natal está tudo reservado, Bia, mas posso te colocar na lista de encaixe e já reservar a primeira semana de janeiro. Pode ser?",
      },
      texto: `A cliente escreve: “Tem horário antes do Natal?”

Resposta fraca: “Não tenho mais.”
Resposta melhor: “Antes do Natal está tudo reservado, Bia, mas posso te colocar na lista de encaixe e já reservar a primeira semana de janeiro. Pode ser?”

Agenda cheia não é fim de conversa.`,
    }),
    // ── 2026-12-04 (sex) ──
    secretariaArte({
      id: "2026-12-04-vou-pensar-dezembro",
      data: "2026-12-04",
      tags: "#microagulhamento #esteticistaautonoma #esteticista",
      arte: {
        layout: "chat",
        tag: "Esteticista autônoma · Microagulhamento",
        hook: "“Vou pensar” em dezembro tem *prazo*.",
        cliente: "Gostei, mas vou pensar e te falo.",
        resposta:
          "Claro, Fê! Fica à vontade. Só te aviso que os horários de dezembro estão acabando — se quiser, seguro um para você até amanhã, sem compromisso.",
      },
      texto: `“Gostei, mas vou pensar e te falo.”

Em dezembro, “vou pensar” tem prazo: a agenda fecha. Avisar isso não é pressão — é informação.

“Claro, Fê! Fica à vontade. Só te aviso que os horários de dezembro estão acabando. Se quiser, seguro um para você até amanhã, sem compromisso.”

Para a esteticista autônoma que faz microagulhamento, é uma frase que ajuda a cliente a decidir sem empurrar.

A secretária do LeadBellus escreve essa resposta no seu tom. Você revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-12-04-noite-aviso-fim-de-ano",
      data: "2026-12-04",
      turno: "noite",
      tags: "#recesso #roteirodevendas",
      arte: {
        layout: "checklist",
        hook: "Aviso de fim de ano em *3 linhas*.",
        itens: ["Últimos dias de atendimento", "Data de volta", "Como reservar janeiro"],
      },
      texto: `Mini-roteiro do aviso de fim de ano:

1. Últimos dias de atendimento.
2. Data de volta.
3. Como reservar janeiro.

“Oi! Atendemos até dia 23 e voltamos dia 5. Quer que eu já reserve seu horário de janeiro?”

Curto, claro e já com o próximo passo.`,
    }),
    // ── 2026-12-05 (sáb) ──
    secretariaArte({
      id: "2026-12-05-mito-contratar",
      data: "2026-12-05",
      tags: "#donadeclinica #gestaodeclinica #secretariadeclinica",
      arte: {
        layout: "mito",
        tag: "Dona de clínica",
        hook: "WhatsApp lotado pede mais uma *contratação*?",
        mito: "Se o WhatsApp acumula, preciso contratar mais gente.",
        verdade: "Muitas vezes falta tempo de escrever, não gente. Respostas prontas aceleram a equipe que você já tem.",
      },
      texto: `Mito ou verdade: “Se o WhatsApp está acumulando, preciso contratar mais uma pessoa.”

Às vezes é verdade. Mas muitas vezes o que falta não é gente — é tempo de pensar em cada resposta.

Com a secretária do LeadBellus, a equipe que você já tem cola a mensagem, recebe 3 respostas no tom da clínica, revisa e envia. A fila anda mais rápido sem mudar o time.

Plano Start: R$97/mês. Para começar, 5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-12-05-noite-enquete-recesso",
      data: "2026-12-05",
      turno: "noite",
      tags: "#recesso #rotinadeclinica",
      arte: {
        layout: "pergunta",
        hook: "Sua clínica vai ter *recesso*?",
        itens: ["Sim, entre Natal e Ano Novo", "Só nos feriados", "Não, atendemos direto", "Ainda não decidi"],
      },
      texto: `Pergunta da noite: sua clínica vai ter recesso no fim do ano?

A) Sim, entre o Natal e o Ano Novo.
B) Só nos feriados.
C) Não, atendemos direto.
D) Ainda não decidi.

Comenta a letra. Semana que vem tem roteiro de aviso para cada caso.`,
    }),
    // ── 2026-12-06 (dom) ──
    secretariaArte({
      id: "2026-12-06-pos-preenchimento",
      data: "2026-12-06",
      tags: "#preenchimentolabial #hof #posprocedimento",
      arte: {
        layout: "antesdepois",
        tag: "Harmonizadora · Pós-preenchimento",
        hook: "Três dias depois, ela *escreveu*.",
        cliente: "Oi! Fiz o preenchimento terça, é normal estar assim?",
        fraca: "É normal, relaxa.",
        resposta:
          "Oi, Ká! Que bom que você chamou. Vou passar sua mensagem para a profissional agora e ela te orienta. Pode me contar como está se sentindo?",
      },
      texto: `Três dias depois do preenchimento labial, chega: “É normal estar assim?”

Resposta fraca: “É normal, relaxa.”
Resposta da secretária: “Oi, Ká! Que bom que você chamou. Vou passar sua mensagem para a profissional agora e ela te orienta. Pode me contar como está se sentindo?”

No pós-procedimento, quem responde não avalia pelo WhatsApp: acolhe e encaminha para quem fez o procedimento. A segunda resposta faz isso — e a cliente se sente cuidada.

A secretária do LeadBellus escreve respostas assim, sempre dentro dessas regras. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-12-06-noite-quem-cuida-depois",
      data: "2026-12-06",
      turno: "noite",
      tags: "#posprocedimento #relacionamentocomcliente",
      arte: {
        layout: "citacao",
        hook: "Quem cuida depois é lembrada *antes*.",
        autor: "Dica da noite · Pós-procedimento",
      },
      texto: `Dica da noite: quem cuida depois é lembrada antes.

A mensagem de pós-procedimento é a que a cliente menos espera receber. Por isso ela marca tanto.

Uma pergunta simples — “como você está?” — vale mais que qualquer promoção de dezembro.`,
    }),
    // ── 2026-12-07 (seg) ──
    secretariaArte({
      id: "2026-12-07-tres-erros-preco",
      data: "2026-12-07",
      tags: "#depilacaoalaser #recepcionista #vendasnaestetica",
      arte: {
        layout: "checklist",
        negativo: true,
        tag: "Recepção · Depilação a laser",
        hook: "Três erros na resposta de *preço*.",
        itens: ["Mandar só o número", "Mandar a tabela inteira", "Terminar sem um horário"],
      },
      texto: `Três erros que a recepção comete na resposta de preço — e que fazem a cliente sumir:

1. Mandar só o número. A conversa acaba ali.
2. Mandar a tabela inteira. A cliente compara e vai embora.
3. Terminar sem oferecer horário. Ninguém agenda sozinho.

Na depilação a laser, em que o pacote depende da avaliação, isso pesa ainda mais.

A secretária do LeadBellus escreve a resposta de preço no tom da clínica, evitando os três. A recepção revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-12-07-noite-resultado-certo",
      data: "2026-12-07",
      turno: "noite",
      tags: "#eticanaestetica #atendimentoaocliente",
      arte: {
        layout: "chat",
        tag: "Promessa de resultado",
        hook: "Quando perguntam se o resultado é *certo*.",
        cliente: "Vocês garantem que vai ficar bom?",
        resposta:
          "Entendo a dúvida, Lia! Cada organismo responde de um jeito, então ninguém sério promete resultado. O que a gente oferece é avaliação cuidadosa e acompanhamento.",
      },
      texto: `A cliente escreve: “Vocês garantem que vai ficar bom?”

A resposta honesta: “Entendo a dúvida, Lia! Cada organismo responde de um jeito, então ninguém sério promete resultado. O que a gente oferece é avaliação cuidadosa e acompanhamento. Quer conhecer?”

Prometer resultado é risco para a clínica. Explicar o cuidado é o que passa confiança.`,
    }),
    // ── 2026-12-08 (ter) ──
    secretariaArte({
      id: "2026-12-08-sozinha-na-maca",
      data: "2026-12-08",
      tags: "#esteticistaautonoma #drenagemlinfatica #limpezadepele",
      arte: {
        layout: "persona",
        persona: "Esteticista autônoma",
        tag: "Limpeza de pele · Drenagem",
        hook: "Sozinha na maca, não no *WhatsApp*.",
        sub: "3 respostas no seu tom, entre uma cliente e outra.",
      },
      texto: `A Jé é esteticista autônoma: faz limpeza de pele e drenagem, atende, cobra, agenda e responde o WhatsApp. Tudo sozinha.

Entre uma cliente e outra, sobram poucos minutos. E cada mensagem pede uma resposta pensada: preço, horário, medo, “vou pensar”.

Com a secretária do LeadBellus, ela cola a mensagem e recebe 3 respostas no tom dela — Suave, Consultiva e Fechamento. Escolhe, ajusta se quiser e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-12-08-noite-enquete-tom",
      data: "2026-12-08",
      turno: "noite",
      tags: "#comunicacao #clinicadeestetica",
      arte: {
        layout: "pergunta",
        hook: "Qual tom combina com a sua *clínica*?",
        itens: ["Suave e acolhedor", "Consultivo, explicando tudo", "Direto ao ponto", "Depende da cliente"],
      },
      texto: `Pergunta da noite: qual tom combina mais com o WhatsApp da sua clínica?

A) Suave e acolhedor.
B) Consultivo, explicando tudo.
C) Direto ao ponto.
D) Depende da cliente.

Se você respondeu D, é exatamente por isso que a secretária entrega 3 versões.`,
    }),
    // ── 2026-12-09 (qua) ──
    secretariaArte({
      id: "2026-12-09-como-funciona",
      data: "2026-12-09",
      tags: "#preenchimento #iaparaclinicas #clinicadeestetica",
      arte: {
        layout: "agenda",
        tag: "Como funciona",
        hook: "Do “quanto custa?” à resposta, sem *travar*.",
        itens: [
          "1|Cole a mensagem da cliente",
          "2|Receba 3 respostas no tom da clínica",
          "3|Escolha e ajuste se quiser",
          "4|Sua equipe envia, como sempre",
        ],
      },
      texto: `Como funciona a secretária do LeadBellus, no meio de um dia corrido:

1. Chegou “quanto custa o preenchimento?” — você cola a mensagem.
2. Em segundos, aparecem 3 respostas no tom da clínica: Suave, Consultiva e Fechamento.
3. Você escolhe a que combina com a cliente e ajusta se quiser.
4. A equipe envia pelo WhatsApp da clínica, como sempre.

Sem trocar de número, sem robô falando sozinho.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-12-09-noite-mito-sumiu",
      data: "2026-12-09",
      turno: "noite",
      tags: "#followup #vendasnaestetica",
      arte: {
        layout: "mito",
        hook: "Cliente que some já *desistiu*?",
        mito: "Se ela parou de responder, é porque desistiu.",
        verdade: "Muitas vezes ela só se distraiu. Uma mensagem leve, dias depois, reabre a conversa.",
      },
      texto: `Mito ou verdade: “Se a cliente parou de responder, é porque desistiu.”

Mito, na maioria das vezes. Ela se distraiu, ficou sem tempo ou esperou para ver a agenda.

Uma mensagem leve, alguns dias depois, costuma reabrir a conversa. O silêncio não é um não.`,
    }),
    // ── 2026-12-10 (qui) ──
    secretariaArte({
      id: "2026-12-10-vale-presente",
      data: "2026-12-10",
      tags: "#limpezadepele #presentedenatal #donadeclinica",
      arte: {
        layout: "chat",
        tag: "Presente de fim de ano",
        hook: "“Quero dar de presente.” Facilite o *sim*.",
        cliente: "Vocês têm vale-presente? Queria dar uma limpeza de pele para a minha mãe.",
        resposta:
          "Que presente lindo, Carol! Temos sim. Me conta o nome dela que eu te explico como funciona o agendamento. Quer que eu já prepare?",
      },
      texto: `Dezembro traz uma mensagem diferente: “Vocês têm vale-presente? Queria dar uma limpeza de pele para a minha mãe.”

É uma venda praticamente pronta — e muita clínica perde por responder “temos, é só passar aqui”.

Facilite: agradeça, explique em uma frase como funciona e ofereça preparar na hora.

A secretária do LeadBellus escreve essa resposta no tom da sua clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-12-10-noite-zere-a-fila",
      data: "2026-12-10",
      turno: "noite",
      tags: "#recesso #organizacao",
      arte: {
        layout: "checklist",
        hook: "Antes do recesso, zere a *fila*.",
        itens: ["Responda quem está esperando", "Avise a data de volta", "Ofereça horário em janeiro"],
      },
      texto: `Dica da noite: antes do recesso, zere a fila.

• Responda todo mundo que está esperando.
• Avise a data de volta.
• Ofereça um horário em janeiro.

Ninguém gosta de ficar no vácuo nas festas — e janeiro começa com agenda.`,
    }),
    // ── 2026-12-11 (sex) ──
    secretariaArte({
      id: "2026-12-11-recepcao-recesso",
      data: "2026-12-11",
      tags: "#recepcionista #recesso #secretariadeclinica",
      arte: {
        layout: "citacao",
        tag: "Recepção · Recesso",
        hook: "Avisar o recesso também é *atender* bem.",
        autor: "Recepção de clínica, sexta antes das festas",
      },
      texto: `Avisar o recesso também é atender bem.

Uma mensagem clara — últimos dias de atendimento, data de volta, como reservar janeiro — evita cliente esperando resposta no meio das festas e já abre a agenda do ano novo.

Para a recepção, é um texto a mais numa semana já cheia. A secretária do LeadBellus escreve esse aviso e as respostas da semana no tom da clínica. A recepção revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-12-11-noite-abrem-nas-festas",
      data: "2026-12-11",
      turno: "noite",
      tags: "#recesso #agendadeclinica",
      arte: {
        layout: "antesdepois",
        tag: "Recesso",
        hook: "Um não que vira *agendamento*.",
        cliente: "Vocês abrem entre o Natal e o Ano Novo?",
        fraca: "Não.",
        resposta:
          "Nesse período a clínica faz uma pausa, mas voltamos dia 5. Quer que eu já reserve um horário na primeira semana de janeiro?",
      },
      texto: `A cliente escreve: “Vocês abrem entre o Natal e o Ano Novo?”

Resposta fraca: “Não.”
Resposta melhor: “Nesse período a clínica faz uma pausa, mas voltamos dia 5. Quer que eu já reserve um horário na primeira semana de janeiro?”

Um não que vira agendamento.`,
    }),
    // ── 2026-12-12 (sáb) ──
    secretariaArte({
      id: "2026-12-12-janeiro-agora",
      data: "2026-12-12",
      tags: "#donadeclinica #agendadeclinica #janeiro",
      arte: {
        layout: "agenda",
        tag: "Planejamento de janeiro",
        hook: "Janeiro começa a ser agendado *agora*.",
        itens: [
          "DEZ|Retome quem disse “vou pensar”",
          "DEZ|Combine “te chamo dia 6”",
          "JAN|Chame quem fez e não voltou",
          "JAN|Confirme a primeira semana",
        ],
      },
      texto: `Janeiro começa a ser agendado agora.

Em dezembro: retome quem disse “vou pensar” e combine “te chamo dia 6, pode ser?”.
Em janeiro: chame quem fez procedimento e não voltou, e confirme a primeira semana.

Quem chega em janeiro com conversas abertas não começa o ano do zero.

A secretária do LeadBellus escreve cada uma dessas mensagens no tom da clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-12-12-noite-enquete-painel",
      data: "2026-12-12",
      turno: "noite",
      tags: "#piloto #gestaodeclinica",
      arte: {
        layout: "pergunta",
        tag: "Piloto · lista de espera",
        hook: "O que não pode faltar num *painel*?",
        itens: ["Quem espera resposta", "Quem sumiu após o orçamento", "Quem precisa de retorno", "Quem remarcou"],
      },
      texto: `Pergunta da noite: se a sua clínica tivesse um painel mostrando as conversas do WhatsApp, o que você olharia primeiro?

A) Quem está esperando resposta.
B) Quem sumiu depois do orçamento.
C) Quem precisa de retorno pós-procedimento.
D) Quem remarcou.

Estamos preparando um piloto conectado ao WhatsApp, com lista de espera no site. Conta aqui o que não pode faltar.`,
    }),
    // ── 2026-12-13 (dom) ──
    secretariaArte({
      id: "2026-12-13-balanco-do-ano",
      data: "2026-12-13",
      tags: "#donadeclinica #gestaodeclinica #planejamento",
      arte: {
        layout: "checklist",
        tag: "Dona de clínica · Balanço do ano",
        hook: "Três perguntas para fechar o *ano*.",
        itens: [
          "Quem perguntou e não teve resposta?",
          "Quem ficou no “vou pensar”?",
          "Quem fez e não voltou?",
        ],
      },
      texto: `Três perguntas para a dona de clínica fechar o ano:

• Quantas clientes perguntaram e não tiveram resposta a tempo?
• Quantas ficaram no “vou pensar” depois do orçamento?
• Quantas fizeram o procedimento e não voltaram?

Não é para se culpar. É para começar 2027 diferente.

A secretária do LeadBellus escreve a próxima mensagem de cada uma, no tom da clínica. A equipe revisa e envia.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-12-13-noite-mito-janeiro",
      data: "2026-12-13",
      turno: "noite",
      tags: "#janeiro #followup",
      arte: {
        layout: "mito",
        hook: "Janeiro é mês *parado*?",
        mito: "Janeiro é mês parado na clínica.",
        verdade: "Depende de dezembro. Quem combina os retornos agora começa o ano com conversa aberta.",
      },
      texto: `Mito ou verdade: “Janeiro é mês parado na clínica.”

Depende de dezembro. Quem combina os retornos agora — “te chamo dia 6, combinado?” — começa janeiro com conversas já abertas.

Anote os nomes antes das festas.`,
    }),
    // ── 2026-12-14 (seg) ──
    secretariaArte({
      id: "2026-12-14-cadeira-e-conversa",
      data: "2026-12-14",
      tags: "#harmonizacaofacial #limpezadepele #clinicadeestetica",
      arte: {
        layout: "chat",
        tag: "Fim de ano · Toda a equipe",
        hook: "Na cadeira, a equipe. Na conversa, a *secretária*.",
        cliente: "Oi! Queria marcar uma avaliação de harmonização antes do Ano Novo.",
        resposta:
          "Oi, Duda! Que bom que você chamou. Tenho quarta às 16h ou sexta às 10h — qual fica melhor? Na avaliação a gente conversa com calma.",
      },
      texto: `Nas festas, a equipe cuida de quem está na cadeira. E o WhatsApp continua chegando: avaliação de harmonização, horário de limpeza de pele, “ainda dá tempo?”.

A secretária do LeadBellus escreve a próxima mensagem de cada conversa no tom da sua clínica. A equipe revisa e envia — sem trocar de número e sem nada sair sozinho.

Comece antes da virada do ano.

5 respostas grátis, sem cartão.`,
    }),
    secretariaArte({
      id: "2026-12-14-noite-boas-festas",
      data: "2026-12-14",
      turno: "noite",
      tags: "#boasfestas #relacionamentocomcliente",
      arte: {
        layout: "citacao",
        hook: "Às vezes, a melhor mensagem é um *obrigado*.",
        autor: "Mini-roteiro de boas festas",
      },
      texto: `Mini-roteiro de boas festas, sem vender nada:

“Oi, Paula! Passando para agradecer por ter escolhido a gente este ano. Desejamos festas leves e um 2027 cheio de cuidado com você.”

Às vezes, a melhor mensagem é só um obrigado.`,
    }),
  ];
}
