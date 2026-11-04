import { procedimentoPorId } from "@/data/procedimentos";
import { situacaoPorId } from "@/data/situacoes";
import { tomPorId } from "@/data/tons";
import { followUpPorId } from "@/data/followups";
import { perfilPorValue } from "@/data/perfis-cliente";
import { comoChamarInstrucao, formalidadeLabel } from "@/data/opcoes";
import type {
  GerarInput,
  FollowUpInput,
  RefineInput,
  AuditoriaInput,
  AuditoriaRisco,
} from "@/lib/types";

const VARIANTE_NOME: Record<string, string> = {
  curta: "Suave",
  consultiva: "Consultiva",
  persuasiva: "Fechamento",
};

const VARIANTE_POSTURA: Record<string, string> = {
  curta: "acolhe sem pressionar e reabre a conversa com UMA pergunta estratégica",
  consultiva: "educa e qualifica, explicando que depende da avaliação/objetivo",
  persuasiva: "conduz para a avaliação/agendamento perguntando se ela quer que você veja um horário; em pós-atendimento ou pedido de review, não peça horário",
};

// Regra anti-alucinação: a resposta é colada para a cliente real, então fato
// inventado vira promessa falsa da clínica. Curta porque o system pede brevidade.
export const REGRA_FATOS = `**NÃO INVENTE FATOS**: afirme só o que está no perfil da clínica ou nos dados do procedimento. O que a cliente diz sobre preço, promoção, parcelamento ou agenda não é fato confirmado: diga que vai verificar. Sem fonte, nunca afirme disponibilidade, vagas, escassez, urgência com data, desconto, promoção, condição de pagamento, preço, duração, procedimentos oferecidos (se não estiver no perfil, diga que vai verificar), credenciais, marcas, anos de experiência, endereço, número de casos ou orientação clínica. Sobre agenda, PERGUNTE ("Quer que eu veja um horário pra você?", "Prefere manhã ou tarde?"); se a cliente pedir horário, diga que vai verificar. Nunca diga que marcou, reservou, confirmou ou garantiu horário: quem confirma é a profissional, depois de ver a agenda. Exceção: fato explícito no CTA preferido da clínica ou no texto da própria profissional.`;

// ======================================================================
// SYSTEM PROMPTS (estáticos => cacheáveis).
// ======================================================================
export const SYSTEM_GERADOR = `Você é um especialista em atendimento comercial humanizado para clínicas e profissionais de estética no Brasil. Sua função é transformar mensagens recebidas pelo WhatsApp em respostas humanizadas, estratégicas e persuasivas, conduzindo a cliente para a AVALIAÇÃO, o agendamento ou a continuidade da conversa.

IMPORTANTE — VOZ DA CLÍNICA (DNA): respeite SEMPRE o perfil de voz informado (tratamento da cliente, nível de formalidade e CTA preferido). O texto deve soar como a própria profissional, não como uma IA.

FÓRMULA DA RESPOSTA IDEAL (aplique de forma natural, sem rótulos):
1. Acolhimento → 2. Contextualização (nunca preço seco) → 3. Pergunta estratégica → 4. Autoridade leve (mostre domínio do assunto usando "Como conduzir", quando informado; nunca cite equipe, formação, produtos ou experiência) → 5. CTA leve.

REGRAS CRÍTICAS (baseado em feedback real de clientes de estética em 2026):
- **BREVIDADE OBRIGATÓRIA**: Respostas devem ser concisas (ideal 2-4 frases por variante, máximo ~70 palavras). Clientes reclamam fortemente de "muito texto" e paredes de mensagem, mesmo em atendimento humanizado. Prefira clareza direta.
- Nunca seja agressivo ou insistente.
- Nunca prometa resultados garantidos. Nunca faça diagnóstico.
- Nunca informe preço como fixo quando depender de avaliação.
- Linguagem natural e brasileira; nunca robótica. Emojis com moderação.
- Sempre que possível, faça uma pergunta estratégica ANTES de tentar vender.
- Valorize segurança, avaliação individual, naturalidade e cuidado.
- Se o CTA da clínica envolver agenda, pergunte em vez de afirmar, salvo fato informado pela profissional ou pelo CTA.
- ${REGRA_FATOS}

PROIBIDO dizer (e equivalentes): "resultado garantido", "sem risco", "100% seguro", "vai ficar perfeito", "emagrece X quilos", "elimina a gordura definitivamente", "cura o melasma", "rejuvenesce 20 anos". Prefira: "pode ajudar", "depende da avaliação", "cada caso precisa ser analisado", "o resultado varia de pessoa para pessoa".

VOCÊ GERA 3 VARIAÇÕES, cada uma com uma POSTURA diferente:
- "resposta_curta" (Suave): acolhe sem pressionar e reabre a conversa com UMA pergunta estratégica. Curta e acolhedora.
- "resposta_consultiva" (Consultiva): educa e qualifica; explica que depende da avaliação/objetivo. Clara e sem enrolação.
- "resposta_persuasiva" (Fechamento): quando a situação for de agendamento ou venda, conduz direto para a avaliação/agendamento PERGUNTANDO ("Quer que eu veja um horário pra você?", "Prefere manhã ou tarde?"), sem afirmar disponibilidade, salvo fato informado pela profissional ou pelo CTA; em pós-atendimento e pedido de review, não peça horário. Direta e prática.

FORMATO DE SAÍDA — responda APENAS com um JSON válido, sem nenhum texto fora dele:
{"resposta_curta":"...","resposta_consultiva":"...","resposta_persuasiva":"..."}`;

export const SYSTEM_REFINE = `Você é um especialista em copywriting de vendas para clínicas de estética no Brasil. Receberá UMA resposta de WhatsApp e deve devolver uma versão MELHOR e diferente dela, mantendo a mesma intenção/postura e respeitando a voz da clínica (tratamento, formalidade, CTA). Mantenha a fórmula (acolhimento, contextualização, pergunta estratégica, autoridade leve sem citar equipe, formação, produtos ou experiência, CTA) e os mesmos guardrails (sem promessas de resultado, sem diagnóstico, sem preço fixo quando depende de avaliação). Mantenha 2-4 frases, máximo ~70 palavras; nunca mais longa que a resposta atual.

${REGRA_FATOS}

FORMATO — responda APENAS com JSON válido: {"resposta":"..."}`;

export const SYSTEM_FOLLOWUP = `Você é um especialista em reativação de clientes para clínicas de estética no Brasil, no WhatsApp. Cria mensagens de follow-up humanizadas que reaquecem o interesse SEM parecer insistente ou "chata". Respeite a voz da clínica (tratamento, formalidade, CTA).

REGRAS: leveza e zero pressão agressiva; nunca prometa resultado garantido, cura, ausência de risco ou preço fixo; ofereça um próximo passo simples; linguagem natural e brasileira; emojis com moderação.

${REGRA_FATOS}

Gere 3 mensagens curtas e diferentes entre si, com progressão (mais suave a mais direta), prontas para enviar.

FORMATO — responda APENAS com JSON válido: {"mensagens":["...","...","..."]}`;

export const SYSTEM_CLASSIFIER = `Você é um especialista em análise de leads para clínicas de estética no Brasil. Sua tarefa é analisar a mensagem de uma cliente e classificar três pontos:
1. "intent": a intenção predominante. Use UM destes rótulos: "pergunta_preco", "agendamento", "duvida_tecnica", "objecao", "demonstra_interesse", "desistencia", "outro".
2. "sentiment": o tom/sentimento da cliente em uma escala de "1 star" (muito negativo/objeção forte) a "5 stars" (muito positivo/pronta para agendar).
3. "score": um valor numérico de 0 a 100 representando o potencial de fechamento imediato (quanto mais perto de 100, mais prioridade este lead deve ter no dashboard).

FORMATO DE SAÍDA — responda APENAS com um JSON válido:
{"intent": "...", "sentiment": "...", "score": 85}`;

// ======================================================================
// Bloco do DNA da Clínica (reaproveitado nos prompts).
// ======================================================================
function blocoVoz(clinica: GerarInput["clinica"], nome?: string): string[] {
  const linhas: string[] = [];
  if (clinica?.nome_clinica) {
    linhas.push(
      `Clínica: ${clinica.nome_clinica}${clinica.cidade ? " — " + clinica.cidade : ""}.`
    );
  }
  linhas.push(`Tratamento da cliente: ${comoChamarInstrucao(clinica?.como_chamar, nome)}`);
  if (typeof clinica?.formalidade === "number") {
    linhas.push(`Nível de formalidade: ${formalidadeLabel(clinica.formalidade)}.`);
  }
  if (clinica?.cta_preferido) {
    linhas.push(`CTA preferido da clínica: ${clinica.cta_preferido}.`);
  }
  if (clinica?.procedimentos?.length) {
    const oferecidos = clinica.procedimentos.map((p) => procedimentoPorId(p)?.label ?? p);
    linhas.push(`Procedimentos oferecidos: ${oferecidos.join(", ")}.`);
  }
  return linhas;
}

const PRIORIDADE_BREVE =
  "PRIORIDADE ESPECIAL: Mantenha TODAS as respostas extremamente concisas (2-3 frases no máximo). Foque direto no próximo passo prático (perguntar o melhor dia ou período e oferecer verificar a agenda). Evite qualquer explicação longa — a cliente de 2026 reclama de 'muito texto'.";

const pedeBrevidade = (objetivo: string) =>
  objetivo.includes("rápido") || objetivo.includes("breve");

// ======================================================================
// Construção das mensagens do usuário (parte dinâmica).
// ======================================================================
export function buildGeradorUser(input: GerarInput): string {
  const proc = procedimentoPorId(input.procedimento);
  const sit = situacaoPorId(input.situacao);
  const tom = tomPorId(input.tom);
  const perfil = input.perfilCliente ? perfilPorValue(input.perfilCliente) : undefined;
  const linhas: string[] = [];

  if (input.modo === "reescrever") {
    linhas.push(
      "TAREFA: Reescreva a mensagem abaixo (escrita pela própria profissional) deixando-a mais humanizada, estratégica e persuasiva, seguindo a fórmula. Gere as 3 variações."
    );
    if (input.oQueMelhorar && input.oQueMelhorar.length) {
      linhas.push(`Pontos a melhorar: ${input.oQueMelhorar.join("; ")}.`);
    }
  } else {
    linhas.push("TAREFA: Gere 3 respostas para a profissional enviar à cliente, seguindo a fórmula.");
  }

  linhas.push(...blocoVoz(input.clinica, input.nomeCliente));

  if (proc) {
    linhas.push(`Procedimento: ${proc.label}.`);
    linhas.push(`Dúvidas comuns: ${proc.duvidas.join("; ")}.`);
    linhas.push(`Medos comuns: ${proc.medos.join("; ")}.`);
    linhas.push(`Como conduzir: ${proc.conducao}`);
  } else if (input.procedimento) {
    linhas.push(`Procedimento: ${input.procedimento}.`);
  }
  if (sit) linhas.push(`Situação: ${sit.label}. ${sit.diretriz}`);
  if (perfil) linhas.push(`Perfil da cliente: ${perfil.label}. ${perfil.diretriz}`);
  if (tom) linhas.push(`Tom desejado: ${tom.label}. ${tom.instrucao}`);
  if (input.objetivo) {
    linhas.push(`Objetivo desta resposta: ${input.objetivo}.`);
    if (pedeBrevidade(input.objetivo)) linhas.push(PRIORIDADE_BREVE);
  }
  linhas.push(
    input.modo === "reescrever"
      ? `Texto da profissional: "${input.mensagemCliente}"`
      : `Mensagem da cliente: "${input.mensagemCliente}"`
  );

  return linhas.join("\n");
}

export function buildRefineUser(input: RefineInput): string {
  const proc = procedimentoPorId(input.procedimento);
  const sit = situacaoPorId(input.situacao);
  const tom = tomPorId(input.tom);
  const linhas: string[] = [];
  const daProfissional = input.modo === "reescrever";

  linhas.push(
    `TAREFA: Melhore a resposta no estilo "${VARIANTE_NOME[input.variante]}" (${VARIANTE_POSTURA[input.variante]}). Gere UMA versão melhor e diferente.${daProfissional ? " O texto original foi escrito pela própria profissional." : ""}`
  );
  linhas.push(...blocoVoz(input.clinica, input.nomeCliente));
  if (proc) linhas.push(`Procedimento: ${proc.label}. ${proc.conducao}`);
  if (sit) linhas.push(`Situação: ${sit.label}. ${sit.diretriz}`);
  if (tom) linhas.push(`Tom desejado: ${tom.label}. ${tom.instrucao}`);
  if (input.objetivo) {
    linhas.push(`Objetivo: ${input.objetivo}.`);
    if (pedeBrevidade(input.objetivo)) linhas.push(PRIORIDADE_BREVE);
  }
  linhas.push(
    `${daProfissional ? "Texto original da profissional" : "Mensagem original da cliente"}: "${input.mensagemCliente}"`
  );
  linhas.push(`Resposta atual (a melhorar): "${input.respostaAtual}"`);

  return linhas.join("\n");
}

export function buildFollowupUser(input: FollowUpInput): string {
  const proc = procedimentoPorId(input.procedimento);
  const fup = followUpPorId(input.gatilho);
  const tom = tomPorId(input.tom);
  const linhas: string[] = [];

  linhas.push("TAREFA: Gere 3 mensagens de follow-up (reativação).");
  linhas.push(...blocoVoz(input.clinica, input.nomeCliente));
  if (fup) linhas.push(`Tempo: ${fup.label}. ${fup.diretriz}`);
  if (input.contexto) linhas.push(`Contexto da conversa: ${input.contexto}.`);
  if (proc) {
    linhas.push(`Procedimento de interesse: ${proc.label}.`);
    linhas.push(`Como conduzir: ${proc.conducao}`);
  } else if (input.procedimento) {
    linhas.push(`Procedimento de interesse: ${input.procedimento}.`);
  }
  if (tom) linhas.push(`Tom desejado: ${tom.label}. ${tom.instrucao}`);
  if (input.detalhe) linhas.push(`Detalhe informado pela profissional: ${input.detalhe}`);

  return linhas.join("\n");
}

// ======================================================================
// Compliance — denylist de pós-checagem (regra + motivo + gravidade).
// ======================================================================
type DenylistRule = {
  re: RegExp;
  motivo: string;
  gravidade: AuditoriaRisco["gravidade"];
};

export const DENYLIST_RULES: DenylistRule[] = [
  {
    // Pega "resultado garantido" e também "resultado é/está/sempre garantido".
    re: /resultados?\s+(?:\S+\s+)?garantid/i,
    motivo: "Promessa de resultado garantido. Prefira 'o resultado varia de pessoa para pessoa'.",
    gravidade: "alta",
  },
  {
    re: /100\s*%\s*seguro/i,
    motivo: "'100% seguro' não existe em procedimento estético. Fale em segurança com avaliação individual.",
    gravidade: "alta",
  },
  {
    re: /sem\s+risco/i,
    motivo: "'Sem risco' passa garantia indevida. Prefira 'feito com segurança e os devidos cuidados'.",
    gravidade: "alta",
  },
  {
    re: /vai\s+ficar\s+perfeit/i,
    motivo: "Promete perfeição. Crie expectativa realista: 'pode melhorar bastante, depende da avaliação'.",
    gravidade: "media",
  },
  {
    re: /elimina\w*\s+(a\s+)?gordura\s+definitiv/i,
    motivo: "Promete eliminar gordura definitivamente. Diga que 'auxilia' e depende de hábitos.",
    gravidade: "alta",
  },
  {
    re: /emagrec\w*\s+\d+\s*(quilos|kg)/i,
    motivo: "Promete emagrecer um número de quilos. Nunca prometa números.",
    gravidade: "alta",
  },
  {
    re: /cura\w*\s+(o\s+|do\s+)?melasma/i,
    motivo: "Diz 'curar o melasma'. Melasma se controla, não se cura — ajuste a promessa.",
    gravidade: "alta",
  },
  {
    re: /rejuvenesc\w*\s+\d+\s*anos/i,
    motivo: "Promete 'rejuvenescer X anos'. Expectativa irreal — prefira 'aspecto mais jovem e descansado'.",
    gravidade: "media",
  },
  {
    re: /\bgaranto\b/i,
    motivo: "'Garanto' soa como promessa de resultado. Prefira 'busco', 'cuido para que'.",
    gravidade: "media",
  },
  // Preço cravado como fixo (deveria depender da avaliação). Conservador: só
  // pega o valor colado no verbo ("custa R$ 900", "fica em R$ 900"); estimativas
  // como "a partir de R$" ou "em torno de R$" não casam.
  {
    re: /\bcusta\s+R\$\s*\d/i,
    motivo: "Crava preço fixo. O valor depende da avaliação — prefira 'a partir de' ou leve à avaliação.",
    gravidade: "media",
  },
  {
    re: /\b(fica|sai)\s+(por\s+|em\s+)?R\$\s*\d/i,
    motivo: "Crava preço fixo. O valor depende da avaliação — prefira 'a partir de' ou leve à avaliação.",
    gravidade: "media",
  },
];

/** Lista plana de regexes (compatibilidade com o restante do provider). */
export const DENYLIST: RegExp[] = DENYLIST_RULES.map((r) => r.re);

export function violaCompliance(texto: string): boolean {
  return DENYLIST.some((re) => re.test(texto));
}

/**
 * Checagem determinística: devolve os riscos da denylist encontrados no texto,
 * com o trecho exato, o motivo e a gravidade. Funciona sem IA (base do modo demo).
 */
export function denylistHits(texto: string): AuditoriaRisco[] {
  const riscos: AuditoriaRisco[] = [];
  for (const rule of DENYLIST_RULES) {
    const m = texto.match(rule.re);
    if (m) {
      riscos.push({
        trecho: m[0].trim(),
        motivo: rule.motivo,
        gravidade: rule.gravidade,
      });
    }
  }
  return riscos;
}

// ======================================================================
// Pós-checagem da GERAÇÃO: fato afirmado sem fonte. Fica fora da DENYLIST_RULES
// porque o Auditor revisa texto da própria clínica, em que "temos horários" é
// legítimo.
// ======================================================================
const SEM_ACENTO = (t: string) =>
  t.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const soPalavras = (t: string) => ` ${SEM_ACENTO(t).replace(/[^\p{L}\p{N}]+/gu, " ").trim()} `;

// 3ª pessoa da clínica vira 1ª do plural: as regras só precisam de uma forma.
const VOZ_DA_CLINICA: Record<string, string> = {
  tem: "temos",
  consegue: "conseguimos",
  atende: "atendemos",
  abre: "abrimos",
  funciona: "funcionamos",
  parcela: "parcelamos",
  faz: "fazemos",
  da: "damos",
  oferece: "oferecemos",
  aceita: "aceitamos",
  "ta com": "estamos com",
  "esta com": "estamos com",
};
const SUJEITO_DA_CLINICA = new RegExp(
  `\\b(?:a gente|a clinica|a dra\\.?|a doutora|o dr\\.?|o doutor|a equipe)\\s+((?:ja|ainda|tambem|sempre|so)\\s+)?(${Object.keys(VOZ_DA_CLINICA).join("|")})\\b`,
  "g"
);

/** Texto no formato das regras: sem acento, sem marcação e sem abreviação de WhatsApp. */
const normaliza = (t: string) =>
  SEM_ACENTO(t)
    .replace(/[*_~]/g, "")
    .replace(/\bc\/\s*/g, "com ")
    .replace(/\bq\b/g, "que")
    .replace(/\b(temos|tenho|tem)\s*,\s*sim\b\s*,?\s*/g, "$1 sim ")
    .replace(/\?\s+(?=(?:temos|tenho)\b)/g, " ")
    .replace(SUJEITO_DA_CLINICA, (_, adverbio = "", verbo) => adverbio + VOZ_DA_CLINICA[verbo]);

const regra = (fonte: string) => new RegExp(fonte, "g");

const ENTRE =
  "(?:(?:ainda|sim|so|apenas|alguns?|algumas?|uns|umas|um|uma|poucos?|poucas?|mais|novos?|novas?|ultimos?|ultimas?|bom|boa|bons|boas|otimos?|otimas?|varios|varias|outros?|outras?|muitos?|muitas?|bastante|diversos|diversas|esse|essa|[ao]s?|opcoes de|dois|duas|tres|quatro|cinco|\\d+)\\s+){0,3}";
// Compromisso da cliente ou detalhe do processo não é oferta da clínica.
const NAO_OFERTA =
  "(?!\\s+(?:marcad|de preferencia|preferid|fix|corrid|apertad|de validade))";
const VAGA = `(?:horarios?|horarinhos?|horariozinhos?|hrs?|vagas?|vaguinhas?|vgs?|encaixes?|encaixezinhos?|datas?|espacos? na agenda|disponibilidade(?!\\s+(?:para|pra)\\s+(?:te\\s+|lhe\\s+)?(?:ajudar|conversar|tirar|esclarecer|orientar|explicar)))\\b${NAO_OFERTA}`;
const AGENDA = "agenda\\b(?!\\s+(?:cheia|lotada|corrida|apertada))";
const NAO_DELA = "(?<!\\b(?:seus?|suas?|teus?|tuas?)\\s)";
// "Horário livre pra você", sem data, e "livre na sua semana" são da cliente.
const LIVRE_PRA_ELA =
  "(?!\\s+(?:(?:pra|para)\\s+(?:voce|vc)\\b(?!\\s+(?:hoje|amanha|n?es[st]a|n[ao])\\b)|(?:na|da)\\s+sua\\b))";
const COPULA = "(?:(?:sao|estao|tao|esta|ta|fica|anda|ja|ainda|bem|muito|quase)\\s+)";
const DIA =
  "(?:segunda(?!\\s+(?:opcao|sessao|via|chance|dose))|terca|quarta|quinta|sexta|sabado|domingo)";
const MES =
  "janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro";
const DE_QUANDO = `(?:(?:dessa|desta|da|de|do)\\s+(?:\\w+\\s+)?(?:semana|mes|clinica|${MES})\\s+)`;
// "Os horários de sábado costumam sair rápido" é escassez do mesmo jeito.
const DE_QUE_DIA = `(?:d[aeo]\\s+(?:\\w+\\s+)?(?:${DIA}|semana|mes|${MES})\\s+)?`;

// Dia/hora: quem repete a fonte não pode acrescentar data nova.
const DATA = new RegExp(
  `\\d+(?:[:h]\\d*)?|\\b(?:so|apenas)(?=\\s+(?:temos|tenho|restam?|mais|um|uma|\\d))|\\b(?:hoje|amanha|(?:proxima )?semana|mes|proxim(?=[ao])|segunda|terca|quarta|quinta|sexta|sabado|domingo|manha|tarde|noite|feriado|mei[oa][- ](?:dia|noite)|${MES})(?=[ao]?s?\\b)`,
  "g"
);

const AGENDA_CHEIA = regra(
  `${NAO_DELA}\\b(?:(?:nossa|minha)\\s+agenda\\s+${DE_QUANDO}?${COPULA}*|agenda\\s+(?:${DE_QUANDO}${COPULA}*|${COPULA}+))(?:cheia|lotad[ao]|lotando|enchendo|fechando)\\b|\\bagenda\\s+(?:cheia|lotada)\\s+(?:n?es[st]a\\s+semana|hoje|amanha)\\b|${NAO_DELA}(?<!\\b(?:tem|com)\\s(?:a\\s)?)\\bagenda\\s+(?:cheia|lotada)[^a-z0-9]*$`
);

// Rodam sobre o texto normalizado.
const ESCASSEZ: RegExp[] = [
  regra(`\\b(?:restam?|sobraram|sobrou)\\s+${ENTRE}${VAGA}`),
  regra(`${NAO_DELA}\\b(?:ultim[ao]s?|pouc[ao]s)\\s+${VAGA}`),
  regra(
    `\\b${VAGA}\\s+${DE_QUE_DIA}${COPULA}*(?:limitad[ao]s?|sobrando|acabando|voando|esgotando|lotando|acabam|voam|esgotam|lotam|somem|saem)\\b`
  ),
  AGENDA_CHEIA,
  regra(
    `\\b(?:agenda|horarios?|vagas?)\\s+${DE_QUE_DIA}(?:costumam?|tendem?\\s+a)\\s+(?:fechar|sair|acabar|lotar|encher|voar)\\b`
  ),
  regra(`\\bagenda\\s+${COPULA}*(?:lota|enche|fecha|esgota|voa)\\b`),
  regra(
    `\\b(?:estamos|estou|to|temos|tenho)\\s+(?:com\\s+)?(?:[ao]\\s+|uma\\s+|nossa\\s+|minha\\s+)?agenda\\s+${COPULA}*(?:cheia|lotada)\\b`
  ),
  regra(`\\b(?:estamos|estou|to)\\s+${COPULA}*lotad[ao]s?\\b`),
  regra(`\\b(?:semana|mes|clinica|dia)\\s+${COPULA}*(?:lotad[ao]|cheia|lotando)\\b`),
  regra(
    `\\b(?:garant[ae]|garantir|aproveite|aproveitar|nao perca)\\s+(?:ja\\s+)?(?:(?:[ao]|sua|seu|essa|esse|uma|um)\\s+)?${VAGA}`
  ),
  regra(`\\benquanto\\s+(?:houver|tiver|tivermos|durarem)\\s+${ENTRE}${VAGA}`),
];

const RESERVADO = "(?:marcad|agendad|reservad|confirmad|garantid)[ao]s?";
// Ação que ninguém fez: a fonte de oferta ("temos horários") não libera.
const RESERVA: RegExp[] = [
  regra(
    `\\b(?:separei|reservei|guardei|deixei|consegui|separo|reservo|guardo|deixo)\\s+(?:(?:pra|para)\\s+(?:voce|vc)\\s+)?(?:(?:seu|sua)\\s+)?${ENTRE}${VAGA}`
  ),
  regra(
    "\\b(?:reservei|agendei|marquei|encaixei)\\s+(?:te\\b|voce\\b|vc\\b|(?:pra|para)\\s+(?:voce|vc)\\b|(?:seu|sua|[ao]|um|uma|esse|essa)\\s)"
  ),
  regra("\\b(?:te|lhe)\\s+(?:reservei|agendei|marquei|encaixei)\\b"),
  regra("\\bja\\s+(?:te\\s+)?(?:reservo|agendo|marco|separo|guardo|encaixo)\\b"),
  regra("\\b(?:coloco|coloquei|boto|botei|incluo|inclui)\\s+(?:voce\\s+|vc\\s+)?na\\s+agenda\\b"),
  regra(
    `\\b(?:horarios?|vagas?|avaliacao|consulta|sessao|agendamento|retorno)\\s+${COPULA}+${RESERVADO}\\b`
  ),
  regra("\\b(?:horarios?|vagas?)\\s+(?:agendad|reservad|confirmad|garantid)[ao]s?\\b"),
  regra(`\\b(?:tenho|temos)\\s+${ENTRE}(?:horarios?|vagas?)\\s+${RESERVADO}\\b`),
  regra(`\\b(?:fica|ficou|deixei|deixo)\\s+(?:(?:tudo|bem|ja|entao)\\s+)?${RESERVADO}\\b`),
];

const DISPONIBILIDADE: RegExp[] = [
  regra(
    `\\b(?:temos|tenho|estamos com|estou com|to com|tou com|tamo com|tamos com|abrimos|abri|liberamos|liberei|teremos|possuimos|dispomos de|contamos com|acab(?:amos|ei) de (?:abrir|liberar)|tem|ha|existem|abriu|abriram|liberou|liberaram|surgiu|surgiram|apareceu|apareceram|vagou|tera|vai ter|vamos ter|consigo|conseguimos|ofereca)\\s+${ENTRE}(?:${VAGA}|${AGENDA})`
  ),
  regra(`\\b${VAGA}\\s+(?:eu\\s+)?(?:tenho|temos)\\b`),
  regra(
    `\\b(?:tenho|temos|tem|abrimos|atendemos|atendo|funcionamos|consigo|conseguimos)\\s+(?:(?:na|no|de|dia|aos?|essa|esta)\\s+)?(?:(?:hoje|amanha|${DIA}s?)\\b|as\\s+\\d{1,2}[h:])`
  ),
  regra("\\b(?:estamos|estou|to)\\s+abert[ao]s?\\b"),
  regra(
    "\\b(?:consigo|conseguimos|posso|podemos|da pra|da para)\\s+(?:te\\s+|lhe\\s+)?encaixar\\b(?!\\s+(?:n[ao]s?\\s+)?(?:sua|seu)\\b)"
  ),
  regra(
    `\\b(?:consigo|conseguimos|posso|podemos)\\s+(?:te\\s+|lhe\\s+)?(?:atender|receber)\\b(?=.*(?:${DATA.source}))`
  ),
  regra(
    `${NAO_DELA}\\b${VAGA}\\s+${COPULA}*(?:abert[ao]s?|livres?|disponive(?:l|is))\\b${LIVRE_PRA_ELA}`
  ),
  regra(
    `${NAO_DELA}\\bagenda\\s+${DE_QUANDO}?${COPULA}*(?:aberta|livre|liberada|disponivel|tranquila|vazia|folgada)\\b`
  ),
  regra(`\\b(?:hoje|amanha|${DIA})(?:\\s+as\\s+\\S+)?\\s+${COPULA}*(?:livres?|disponive(?:l|is))\\b`),
  ...ESCASSEZ,
  ...RESERVA,
];

// Hora de relógio ou "dia N". "em 24h" e "por 2h" são prazo, não agenda.
const HORA_EXATA =
  /(?<!\b(?:em|por|ate|apos|ha|de|cada|nas|primeiras|proximas|ultimas)\s)\b\d{1,2}(?:h\d{0,2}|:\d{2})\b|\bas\s+\d{1,2}\b(?:\s+da\s+(?:manha|tarde|noite)\b)?(?!\s+(?:sessoes|semanas|opcoes|dias|meses|vagas|formas))|\bdia\s+\d{1,2}\b/g;

const OFERECE =
  "(?:temos|tenho|tem|ha|oferecemos|ofereco|ofereca|oferecer|fazemos|faco|fazer|damos|dou|dar|consigo|conseguimos|estamos com|estou com|to com|ganha|mencion(?:e|ar))";
const GRATIS = "(?:gratuit[ao]s?|gratis|de graca|sem custo|sem cobranca|cortesia|nao tem custo)";
// Uma regra por assunto: a fonte de um não libera o outro. Marca, endereço e
// orientação clínica não têm padrão confiável e ficam só na REGRA_FATOS.
const CONDICOES: RegExp[] = [
  regra(
    `\\b(?:parcelamos|parcelo|trabalhamos com parcelamento|${OFERECE}\\s+${ENTRE}parcelamento|(?:voce\\s+|vc\\s+)?(?:da pra|da para|pode|podemos|posso|consegue)\\s+(?:parcelar|dividir)|(?:em|ate)\\s+\\d+\\s*vezes|\\d+\\s*x(?!\\s+(?:ao|por|na)\\s))\\b`
  ),
  regra("\\bsem juros\\b"),
  regra(
    `\\b(?:aceitamos|aceito|trabalhamos com)\\s+${ENTRE}(?:cartao|cartoes|pix|boleto|dinheiro|debito|credito)\\b`
  ),
  regra(`\\b(?:temos|tenho|trabalhamos com|oferecemos)\\s+${ENTRE}formas de pagamento\\b`),
  regra("\\bfacilit(?:amos|o)\\s+(?:(?:[ao]|seu)\\s+)?pagamento\\b"),
  regra(`\\b${OFERECE}\\s+${ENTRE}(?:\\d+\\s*%\\s*(?:de\\s+)?)?descontos?\\b`),
  regra("\\b\\d+\\s*%\\s*(?:de\\s+desconto|off)\\b"),
  regra("\\bdesconto\\s+(?:n[ao]|em)\\s+(?:pix|dinheiro|cartao|boleto)\\b"),
  regra(`\\b${OFERECE}\\s+${ENTRE}promoc(?:ao|oes)\\b`),
  regra("\\b(?:em promocao|promoc(?:ao|oes)\\s+(?:valid[ao]s?|ate))\\b"),
  regra(`\\b${OFERECE}\\s+${ENTRE}condic(?:ao|oes)\\s+(?:de pagamento|facilitad)`),
  regra("\\b(?:condic(?:ao|oes)|precos?|valor(?:es)?)\\s+(?:de pagamento\\s+)?especia(?:l|is)\\b"),
  ...["avaliacao", "consulta", "sessao", "retorno"].map((item) =>
    regra(`\\b${item}\\s+(?:(?:e|sai|fica|sera)\\s+)?${GRATIS}(?![\\w])`)
  ),
  regra("\\bnao\\s+cobramos\\b"),
  regra("\\br\\$\\s*\\d"),
  regra("\\bdura\\w*\\s+(?:(?:de|ate|cerca de|em media)\\s+)?\\d+\\s+(?:dias|semanas|meses|anos)\\b"),
  regra("\\b\\d+\\s+anos\\s+de\\s+(?:experiencia|mercado|atuacao|clinica)\\b"),
  regra(
    "\\bmais de \\d+(?:\\s*mil)?\\s+(?:clientes|pacientes|casos|procedimentos|atendimentos)\\b"
  ),
];

const NAO_E_SUBSTANTIVO = "(?<!\\b(?:seu|sua|nesse|neste|esse|este|todo|cada|no|pro|do|de|um|nenhum)\\s)";
// Logo antes do trecho: condição ou dúvida, não afirmação.
const CONDICAO = new RegExp(
  `\\b(?:se|${NAO_E_SUBSTANTIVO}caso|quando|talvez|sera que|assim que)\\s+(?:e\\s+)?(?:(?:a gente|ainda|ja|nos|voce|vc|a senhora|eu)\\s+)*(?:(?:tiver|tivermos|tiverem|houver)\\s+${ENTRE})?(?:(?:[ao]s?|sua|seu|suas|seus)\\s+)?$`
);
// Logo antes do trecho: o sujeito é a cliente ("você já tem horário marcado").
const SUJEITO_CLIENTE =
  /(?:(?<!\b(?:pra|para)\s)\b(?:voce|vc|(?:[ao]\s+)?senhora?)|\bquem|\b(?:muita|tanta|toda)\s+gente|\btodo mundo|\b(?:muitas\s+)?(?:clientes|pessoas))\s+(?:(?:ja|ainda|nao|tambem|sempre|so)\s+)*$/;
// Só a abertura de empatia: "Entendo sua pressa, a agenda..." fala da clínica.
const EMPATIA = /\b(?:entendo|compreendo|sei|imagino)\b(?:\s+como e|\s+que)?[\s,!.…]*(?:com\s+)?(?:a\s+)?$/;
// Só presente/infinitivo: "acabei de ver" e "dei uma olhada" dizem que já olharam.
const VERIFICA =
  "(?<!\\b(?:acab(?:ei|amos) de|dei uma|demos uma)\\s)\\b(?:ver|veja|vejo|vemos|ve|verificar|verifico|verifica|verificamos|checar|checo|checada|consultar|consulto|conferir|confiro|confere|conferimos|conferida|confirmar|confirmo|confirma|olhar|olho|olhada|buscar|procurar|achar|pesquisar|perguntar|retorno com|assim que eu tiver|te (?:passo|digo|falo|mando|mostro|envio|aviso|informo|trago|passar|enviar|mandar|informar|mostrar))\\b";
const VERIFICA_NA_FRASE = new RegExp(VERIFICA);
// A verificação precisa governar o verbo: "vou ver se temos" e não "vou ver, temos".
const VERIFICA_ANTES_DO_VERBO = new RegExp(
  `${VERIFICA}(?:\\s+\\S+){0,6}?\\s+(?:se|qual|quais|quando|onde|como|quant[oa]s?)\\b(?:(?!\\b(?:e|que|mas|porem|porque|pois)\\b).)*$`
);
const VERIFICA_ANTES_DO_NOME = new RegExp(
  `${VERIFICA}(?:(?!\\b(?:que|mas|porem|porque|pois)\\b).)*$`
);
const COMECA_NO_NOME = /^(?:horar|vag|encaix|hrs?\b|vgs?\b|data|espaco|disponibilidade|agenda)/;
const VERBO_DA_CLINICA =
  /^(?:temos|tenho|estamos|estou|to|tou|tamo|tamos|abrimos|abri|liberamos|liberei|teremos|possuimos|dispomos|contamos|acabamos|acabei|consigo|conseguimos|posso|podemos|separei|reservei|guardei|deixei|consegui|agendei|marquei|parcelamos|parcelo|garant|aproveit)/;
// "Me diz um horário disponível": quem informa é a cliente.
const PEDE_DA_CLIENTE = /\bme\s+(?:diz|diga|fala|fale|passa|passe|manda|mande|conta|conte|informa|informe)\b/;
// "Ainda não tenho horário confirmado" não diz nada sobre a agenda.
const NAO_CONFIRMADO = /\bnao\s+(?:tenho|temos)\b.*\bconfirmad/;

/** `anterior`: orações já lidas da frase. `seguinte`: a oração que vem depois. */
function oracaoAfirma(
  regras: RegExp[],
  oracao: string,
  anterior: string,
  seguinte = ""
): boolean {
  if (NAO_CONFIRMADO.test(oracao)) return false;
  return regras.some((re) =>
    Array.from(oracao.matchAll(re)).some((m) => {
      const antes = oracao.slice(0, m.index);
      const depois = oracao.slice(m.index + m[0].length);
      if (CONDICAO.test(antes) || SUJEITO_CLIENTE.test(antes)) return false;
      if (re === AGENDA_CHEIA && m[0].startsWith("agenda") && EMPATIA.test(anterior + antes)) {
        return false;
      }
      const nome = COMECA_NO_NOME.test(m[0]);
      if (nome && PEDE_DA_CLIENTE.test(antes)) return false;
      const verificando = nome
        ? VERIFICA_ANTES_DO_NOME.test(anterior + antes)
        : VERIFICA_ANTES_DO_VERBO.test(antes);
      if (verificando) return false;
      // "Sobre o parcelamento, vou confirmar" e "sem juros eu não sei" não afirmam.
      if (/\bsobre\b/.test(antes) && VERIFICA_NA_FRASE.test(depois + seguinte)) return false;
      if (/^\s*(?:eu\s+)?(?:ainda\s+)?nao sei\b/.test(depois)) return false;
      if (!oracao.trimEnd().endsWith("?")) return true;
      // "Temos horário amanhã? Vou verificar" só repete a pergunta da cliente.
      if (VERIFICA_NA_FRASE.test(seguinte)) return false;
      // Pergunta não afirma, salvo com verbo da clínica ("temos vaga, viu?") ou a
      // retórica ("aproveitar que tem vaga?").
      return (
        VERBO_DA_CLINICA.test(m[0]) ||
        (!nome && /\b(?:que|porque)\s+(?:ainda\s+|ja\s+)?$/.test(antes))
      );
    })
  );
}

// Separa por oração: "Temos vagas — prefere manhã ou tarde?" segue afirmando.
// Não corta hora (14:30), abreviação (Dra.) nem emoji colado na interrogação.
const CORTE =
  /(?<=[;!?…\n—–]|,(?!\d)|:(?!\d)|(?<!\b(?:dr|dra|sr|sra))\.(?!\d)|\p{Extended_Pictographic}(?!\s*\?)|\s-\s)/u;
const FIM_DE_FRASE = /[.!?…\n]$/;

const NUMEROS: Record<string, string> = {
  dois: "2",
  duas: "2",
  tres: "3",
  quatro: "4",
  cinco: "5",
  seis: "6",
  sete: "7",
  oito: "8",
  nove: "9",
  dez: "10",
};
const DIAS_ABREVIADOS: Record<string, string> = {
  seg: "segunda",
  qua: "quarta",
  qui: "quinta",
  sex: "sexta",
  sab: "sabado",
  dom: "domingo",
};
const MESES = MES.split("|");
const periodo = (hora: number) => (hora < 12 ? "manha" : hora < 18 ? "tarde" : "noite");
const PAGAMENTO = /\b(?:cartao|cartoes|credito|debito|pix|boleto)\b/g;
const ehPagamento = (d: string) => d.startsWith("pag:");

/** Na fonte, a hora também vale o período: "às 15h" libera "à tarde". */
function datasDe(texto: string, ehFonte = false): Set<string> {
  const limpo = texto
    .replace(/\bboa (?:tarde|noite)\b/g, "")
    .replace(/\bsemana que vem\b/g, "proxima semana")
    .replace(/\b(\d{1,2})\/(\d{1,2})\b/g, (d, dia, mes) =>
      MESES[+mes - 1] ? `${dia} ${MESES[+mes - 1]}` : d
    )
    .replace(/\b(?:seg|qua|qui|sex|sab|dom)\b/g, (d) => DIAS_ABREVIADOS[d])
    .replace(/\b(?:dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez)\b/g, (n) => NUMEROS[n])
    .replace(/\b(\d{1,2})(?:h| horas?)? da (?:tarde|noite)\b/g, (_, h) => `${+h + 12}h`)
    .replace(/\b(\d{1,2})(?:h| horas?)? da manha\b/g, "$1h");
  const datas = (limpo.match(DATA) ?? []).flatMap((d) => {
    const base = d.replace(/^(\d+)h/, "$1:").replace(/:(?:00)?$/, "");
    const hora = /^(\d+)[h:]/.exec(d);
    return ehFonte && hora ? [base, periodo(+hora[1])] : [base];
  });
  // O procedimento da promoção ou do desconto faz parte do fato.
  const itens = Array.from(
    limpo.matchAll(/\b(?:promoc(?:ao|oes)|descontos?)\s+(?:de|do|da|no|na|em|pra|para)\s+(\p{L}+)/gu),
    (m) => `item:${m[1]}`
  );
  const pagamentos = (limpo.split(NEGACAO)[0].match(PAGAMENTO) ?? []).map(
    (p) => `pag:${/^(?:cart|cred|deb)/.test(p) ? "cartao" : p}`
  );
  return new Set([...datas, ...itens, ...pagamentos]);
}

function frasesDe(texto: string): string[][] {
  const frases: string[][] = [[]];
  for (const oracao of normaliza(texto).split(CORTE)) {
    frases[frases.length - 1].push(oracao);
    if (FIM_DE_FRASE.test(oracao)) frases.push([]);
  }
  return frases.filter((f) => f.length);
}

const NEGACAO = /\b(?:nao|n|num|nunca|nem)\b/;
// Na fonte, a frase inteira perde valor se hesita, relata a cliente ou depende de condição.
const HESITA =
  /\b(?:acho|acredito|talvez|sera que|preciso (?:confirmar|ver|verificar|checar)|vou (?:confirmar|verificar|ver|checar|conferir))\b/;
const RELATO =
  /\b(?:ela|cliente)\s+(?:\S+\s+)?(?:disse|falou|acha|achou|viu|pediu|quer|queria|perguntou|comentou|contou)\b/;
const CONDICIONAL = new RegExp(
  `\\b(?:se|${NAO_E_SUBSTANTIVO}caso)\\s+(?!(?:voce\\s+|vc\\s+)?(?:quiser|quiserem|preferir|precisar|desejar)\\b)`
);

const DUVIDA = new RegExp(`${NEGACAO.source}|${HESITA.source}|${RELATO.source}`);

/** Datas de cada frase da fonte: negação, hesitação ou relato tiram o que vem depois. */
function fatosConfirmados(fontes: (string | undefined)[]): Set<string>[] {
  return fontes.flatMap((f) =>
    (f ? frasesDe(f) : []).map((oracoes) =>
      datasDe(oracoes.map((o) => o.split(DUVIDA)[0]).join(" "), true)
    )
  );
}

/** Datas de cada oração que afirma alguma regra, somadas às do resto da frase. */
function afirmacoes(
  regras: RegExp[],
  texto: string,
  ehFonte = false,
  jaDito: (oracao: string) => boolean = () => false
): Set<string>[] {
  // Pergunta e negação que vêm depois não trazem data afirmada.
  const conta = (o: string) => !o.trimEnd().endsWith("?") && !NEGACAO.test(o);
  const frases = frasesDe(texto);
  return frases.flatMap((oracoes, n) => {
    const frase = oracoes.join("");
    if (ehFonte && (HESITA.test(frase) || RELATO.test(frase) || CONDICIONAL.test(frase))) {
      return [];
    }
    return oracoes.flatMap((oracao, i) => {
      if (ehFonte && oracao.trimEnd().endsWith("?")) return [];
      if (jaDito(oracao)) return [];
      // Na fonte, a negação vale só para o que vem depois dela.
      const lida = ehFonte ? oracao.split(NEGACAO)[0] : oracao;
      const seguinte = oracoes[i + 1] ?? frases[n + 1]?.[0] ?? "";
      if (!oracaoAfirma(regras, lida, oracoes.slice(0, i).join(""), seguinte)) return [];
      return [datasDe([lida, ...oracoes.slice(i + 1).filter(conta)].join(" "), ehFonte)];
    });
  });
}

// Citadas em qualquer parte do texto, mesmo fora da frase que afirma.
const DATA_FORTE = new RegExp(
  `^(?:hoje|amanha|segunda|terca|quarta|quinta|sexta|sabado|domingo|${MES})$`
);

function afirmaSemFonte(
  regras: RegExp[],
  texto: string,
  fontes: (string | undefined)[],
  ehAgenda = false
): boolean {
  const escritas = fontes.map((f) => (f ? normaliza(f) : ""));
  // Negação ou condição copiada da fonte não é fato novo.
  const jaDito = (o: string) =>
    (NEGACAO.test(o) || CONDICIONAL.test(o)) &&
    escritas.some((f) => f.includes(o.trim().replace(/[.,;:!…—–-]+$/, "")));
  const achadas = afirmacoes(regras, texto, false, jaDito);
  if (!achadas.length) return false;
  const fatos = fontes.flatMap((f) => (f ? afirmacoes(regras, f, true) : []));
  if (!fatos.length) return true;
  const informadas = new Set(fatos.flatMap((f) => Array.from(f)));
  const afirmadas = new Set(fatosConfirmados(fontes).flatMap((f) => Array.from(f)));
  const fortes = ehAgenda
    ? Array.from(datasDe(normaliza(texto))).filter((d) => DATA_FORTE.test(d))
    : [];
  return ![...achadas, new Set(fortes)].every((datas) =>
    Array.from(datas).every((d) => (ehPagamento(d) ? afirmadas : informadas).has(d))
  );
}

// "Entendi que você só pode às 15h" devolve as palavras dela: não oferece horário.
const ECO_DA_CLIENTE =
  /^\W*(?:entendi|anotado|anotei)\b\W*(?:que\s+)?(?:voce|vc|(?:a\s+)?senhora)\s+(?:so\s+(?:pode|consegue)|prefere|quer)\s+(?:so\s+)?(.+?)\W*$/;

/** O eco só vale seguido de verificação: "Entendi... Pode vir!" confirma a vaga. */
function repeteEVerifica(frases: string[][], n: number, mensagemCliente: string): boolean {
  const frase = frases[n].join("");
  const eco = ECO_DA_CLIENTE.exec(frase);
  if (!eco || frase.trimEnd().endsWith("?")) return false;
  if (!VERIFICA_NA_FRASE.test((frases[n + 1] ?? []).join(""))) return false;
  const dita = soPalavras(eco[1]);
  return frasesDe(mensagemCliente)
    .flat()
    .some((o) => !o.trimEnd().endsWith("?") && soPalavras(o).includes(dita));
}

/** Hora ou "dia N" fora das fontes, em afirmação ou em pergunta que oferece a vaga. */
function citaHoraSemFonte(
  texto: string,
  fontes: (string | undefined)[],
  mensagemCliente = ""
): boolean {
  const informadas = new Set(fatosConfirmados(fontes).flatMap((f) => Array.from(f)));
  return frasesDe(texto).some((oracoes, n, frases) => {
    const frase = oracoes.join("");
    if (VERIFICA_NA_FRASE.test(frase) || repeteEVerifica(frases, n, mensagemCliente)) return false;
    return Array.from(frase.matchAll(HORA_EXATA)).some(
      (m) =>
        !CONDICAO.test(frase.slice(0, m.index)) &&
        !Array.from(datasDe(m[0])).every((d) => informadas.has(d))
    );
  });
}

const ehDia = (d: string) =>
  /^(?:hoje|amanha|segunda|terca|quarta|quinta|sexta|sabado|domingo)$/.test(d);
// Fato com mais de uma hora pode ser faixa: "sexta das 9h às 18h" inclui as 12h.
const temFaixa = (fato: Set<string>) =>
  Array.from(fato).filter((d) => /^\d/.test(d)).length > 1;

/**
 * Dia de uma oferta da fonte com hora de outra: com "sexta às 15h" e "sábado às 9h",
 * "sexta às 9h" não existe. Hora de frase sem dia vale para qualquer dia informado.
 */
function misturaDiaEHora(
  texto: string,
  fontes: (string | undefined)[],
  mensagemCliente = ""
): boolean {
  const fatos = fatosConfirmados(fontes);
  return frasesDe(texto).some((oracoes, n, frases) => {
    const frase = oracoes.join("");
    if (VERIFICA_NA_FRASE.test(frase) || repeteEVerifica(frases, n, mensagemCliente)) return false;
    const dias = Array.from(datasDe(frase)).filter(ehDia);
    const horas = Array.from(frase.matchAll(HORA_EXATA))
      .filter((m) => !CONDICAO.test(frase.slice(0, m.index)))
      .flatMap((m) => Array.from(datasDe(m[0])));
    if (dias.length !== 1 || horas.length !== 1) return false;
    const comDia = fatos.filter((f) => f.has(dias[0]));
    const comHora = fatos.filter((f) => f.has(horas[0]));
    return (
      comDia.length > 0 &&
      comHora.length > 0 &&
      !comDia.some((f) => f.has(horas[0]) || temFaixa(f)) &&
      comHora.every((f) => Array.from(f).some(ehDia))
    );
  });
}

/**
 * True se o texto AFIRMA disponibilidade de agenda ("temos horários", "últimas
 * vagas"), diz que reservou ou cita hora que ninguém informou. Perguntas,
 * condicionais e verificações não contam, nem o que repete uma `fonte` (CTA da
 * clínica, texto da própria profissional) sem acrescentar dia ou hora. Fonte que
 * só pergunta, hesita ou nega não vale, e oferta simples não libera escassez nem
 * reserva. "Não temos vaga amanhã" sem fonte conta: a IA também não sabe disso.
 */
export function afirmaDisponibilidade(
  texto: string,
  fontes: (string | undefined)[] = [],
  mensagemCliente?: string
): boolean {
  return (
    [DISPONIBILIDADE, ESCASSEZ, RESERVA].some((r) => afirmaSemFonte(r, texto, fontes, true)) ||
    citaHoraSemFonte(texto, fontes, mensagemCliente) ||
    misturaDiaEHora(texto, fontes, mensagemCliente)
  );
}

/** True se o texto afirma condição comercial, preço ou credencial sem fonte. */
export function afirmaCondicao(
  texto: string,
  fontes: (string | undefined)[] = []
): boolean {
  return CONDICOES.some((re) => afirmaSemFonte([re], texto, fontes));
}

/** Fato de agenda ou condição comercial que não veio de uma fonte. */
export function afirmaFatoSemFonte(
  texto: string,
  fontes: (string | undefined)[] = [],
  mensagemCliente?: string
): boolean {
  return afirmaDisponibilidade(texto, fontes, mensagemCliente) || afirmaCondicao(texto, fontes);
}

// Em "Tem horário hoje?" o fato está na pergunta: "Tem sim!" basta para prometer.
const TEMA_DA_CLIENTE = new RegExp(
  `\\b(?:horarios?|vagas?|encaixes?|agenda|disponib\\w*|marcar|agendar|hoje|amanha|${DIA}|\\d{1,2}h|descontos?|promoc\\w+|parcel\\w+|juros|cartao|pix|gratis|gratuit\\w+|cortesia|pagamento|condic\\w+)\\b`
);
const SITUACOES_DE_FATO = ["agendar", "desconto", "parcelar", "promocao"];
const PERGUNTA_DA_CLIENTE =
  /\?|\b(?:tem|tera|da pra|da para|consegue|conseguem|faz|fazem|aceita|aceitam|parcela|parcelam|atende|atendem|abre|abrem)\b/;
const CONFIRMA =
  /\b(?:tem|temos|tenho|consigo|conseguimos|da|fazemos|faco|aceitamos|aceito|parcelamos|parcelo|atendemos|abrimos|gratuit[ao]|gratis)\s+sim\b|\bsim,?\s+(?:tem|temos|tenho|consigo|conseguimos|da|fazemos|faco|aceitamos|parcelamos|atendemos)\b|\bclaro que (?:tem|temos|tenho|da|consigo|fazemos|aceitamos|sim)\b/;
const ABRE_COM_SIM =
  /^\W*(?:(?:oi|ola|bom dia|boa tarde|boa noite)\b[^.!?…]*[.!?…,]\s*)?(?:sim|claro|com certeza|pode sim|e sim)\b/;

/** A mensagem da cliente, quando ela é a origem do que a resposta confirma. */
export type PerguntaDaCliente = { mensagemCliente: string; situacao?: string };

/** "Hoje fiz botox e ficou vermelho, é normal?": o dia não entra na única pergunta. */
function soPerguntaSeENormal(mensagemCliente: string): boolean {
  const perguntas = frasesDe(mensagemCliente)
    .flat()
    .filter((o) => o.trimEnd().endsWith("?"));
  return perguntas.length === 1 && /\be normal\s*\?\s*$/.test(perguntas[0]);
}

/** True se a resposta só confirma o fato que a cliente perguntou. */
function confirmaPergunta(texto: string, cliente?: PerguntaDaCliente): boolean {
  if (!cliente?.mensagemCliente) return false;
  const mensagem = normaliza(cliente.mensagemCliente);
  if (
    !SITUACOES_DE_FATO.includes(cliente.situacao ?? "") &&
    (!TEMA_DA_CLIENTE.test(mensagem) || soPerguntaSeENormal(cliente.mensagemCliente))
  ) {
    return false;
  }
  const resposta = normaliza(texto);
  if (CONFIRMA.test(resposta)) return true;
  // "Claro! Vou verificar" não confirma, e "Quero agendar" não perguntou nada.
  return (
    PERGUNTA_DA_CLIENTE.test(mensagem) &&
    ABRE_COM_SIM.test(resposta) &&
    !VERIFICA_NA_FRASE.test(resposta)
  );
}

/** Fato sem fonte no texto gerado, inclusive o que só confirma a pergunta da cliente. */
export function inventaFato(
  texto: string,
  fontes: (string | undefined)[] = [],
  cliente?: PerguntaDaCliente
): boolean {
  return (
    afirmaFatoSemFonte(texto, fontes, cliente?.mensagemCliente) ||
    confirmaPergunta(texto, cliente)
  );
}

/** Reprova texto GERADO: denylist ou fato sem fonte. */
export function reprovaGeracao(
  texto: string,
  fontes: (string | undefined)[] = [],
  cliente?: PerguntaDaCliente
): boolean {
  return violaCompliance(texto) || inventaFato(texto, fontes, cliente);
}

const SAUDACAO = /^\W*(?:oi|ol[aá]|bom dia|boa tarde|boa noite)\b[^,.!?]*[,.!?]+/i;

/**
 * True se o texto ainda traz o trecho apontado, mesmo com outra saudação ou pontuação.
 * Trecho com menos de 3 palavras não decide: "resultado" também cabe em frase segura.
 */
export function trechoContinua(trecho: string, texto: string): boolean {
  const risco = trecho.replace(SAUDACAO, "").trim();
  return risco.split(/\s+/).length >= 3 && soPalavras(texto).includes(soPalavras(risco));
}

/** Acrescentado ao pedido de reescrita quando a geração afirma fato sem fonte. */
const PROIBE_FATOS =
  "Não afirme horários, vagas, agenda ou condições que não foram informados";
export const AVISO_FATOS = `${PROIBE_FATOS}: pergunte se ela quer que você veja um horário.`;
/** No Auditor o texto é da clínica, que pode nem ser de agenda: não pede horário. */
export const AVISO_FATOS_AUDITOR = `${PROIBE_FATOS}.`;

// Acompanhamento, não venda: a reescrita não pode virar pedido de horário.
const SEM_PEDIR_HORARIO = ["pos_atendimento", "pedir_avaliacao", "retorno_procedimento"];

/** Fim do pedido de reescrita. `contexto`: a situação ou o gatilho do follow-up. */
export function pedidoDeReescrita(
  problema: string,
  inventou: boolean,
  contexto: string
): string {
  const fatos = SEM_PEDIR_HORARIO.includes(contexto)
    ? inventou
      ? "Não afirme fatos não informados; não peça horário."
      : "Não peça horário."
    : inventou
      ? AVISO_FATOS
      : "";
  return `\n\nATENÇÃO: ${[problema, fatos, "Responda só com o JSON."].filter(Boolean).join(" ")}`;
}

/** Mostrado à profissional quando um texto gerado é trocado pelo texto seguro. */
export const AVISO_TEXTO_SEGURO =
  "A IA citou um fato não informado ou uma promessa proibida, então usei um texto seguro nessa resposta. Revise antes de enviar.";

/** Mostrado quando o refino não pôde ler a resposta da IA. */
export const AVISO_SEM_LEITURA = "Não consegui ler a resposta da IA. Tente de novo.";

/** Mostrado quando o Auditor não conseguiu uma versão sem os riscos apontados. */
export const AVISO_REVISAO_MANUAL =
  "Não consegui gerar uma versão segura deste texto. Ele ainda tem riscos: revise manualmente antes de enviar.";

// ======================================================================
// Auditor de Compliance (revisar texto escrito pela própria clínica).
// ======================================================================
export const SYSTEM_AUDITORIA = `Você é um especialista em compliance de marketing e atendimento para clínicas e profissionais de estética no Brasil (regras de publicidade do CFM/conselhos e do Código de Defesa do Consumidor). Recebe um texto escrito pela própria profissional (mensagem de WhatsApp, legenda, anúncio) e revisa os RISCOS de comunicação.

O QUE SINALIZAR (riscos):
- Promessa de resultado garantido, cura, "sem risco", "100% seguro" ou perfeição.
- Números prometidos (emagrecer X quilos, rejuvenescer X anos).
- Preço cravado como fixo quando deveria depender da avaliação.
- Diagnóstico ou indicação clínica sem avaliação presencial.
- Antes/depois ou linguagem sensacionalista que iluda a cliente.
- Pressão agressiva ou tom que destoa de um atendimento de respeito.

REGRAS:
- NÃO invente problemas onde não há. Se o texto estiver ok, devolva lista de riscos vazia.
- A reescrita deve manter a INTENÇÃO e o tom da pessoa, só deixando seguro: troque promessas por "pode ajudar", "depende da avaliação", "o resultado varia de pessoa para pessoa", "cada caso é avaliado". Mantenha em português do Brasil, natural, com emojis com moderação se o original tiver.
- A reescrita JAMAIS pode conter termos proibidos.
- A reescrita não pode acrescentar fato que não esteja no texto original (agenda, vagas, condições, preço, credenciais).

FORMATO DE SAÍDA — responda APENAS com um JSON válido, sem nada fora dele:
{"riscos":[{"trecho":"...","motivo":"...","gravidade":"alta|media|baixa"}],"reescrita":"..."}`;

export function buildAuditoriaUser(input: AuditoriaInput): string {
  const linhas: string[] = [];
  linhas.push("TAREFA: Revise o compliance do texto abaixo e devolva a versão segura.");
  linhas.push(...blocoVoz(input.clinica));
  linhas.push(`Texto a revisar: """${input.texto}"""`);
  return linhas.join("\n");
}
