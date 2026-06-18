import { procedimentoPorId } from "@/data/procedimentos";
import { situacaoPorId } from "@/data/situacoes";
import { tomPorId } from "@/data/tons";
import { followUpPorId } from "@/data/followups";
import { perfilPorValue } from "@/data/perfis-cliente";
import { comoChamarInstrucao, formalidadeLabel } from "@/data/opcoes";
import type { GerarInput, FollowUpInput, RefineInput } from "@/lib/types";

const VARIANTE_NOME: Record<string, string> = {
  curta: "Suave",
  consultiva: "Consultiva",
  persuasiva: "Fechamento",
};

const VARIANTE_POSTURA: Record<string, string> = {
  curta: "acolhe sem pressionar e reabre a conversa com UMA pergunta estratégica",
  consultiva: "educa e qualifica, explicando que depende da avaliação/objetivo",
  persuasiva: "conduz direto para a avaliação/agendamento com urgência leve (horários)",
};

// ======================================================================
// SYSTEM PROMPTS (estáticos => cacheáveis).
// ======================================================================
export const SYSTEM_GERADOR = `Você é um especialista em atendimento comercial humanizado para clínicas e profissionais de estética no Brasil. Sua função é transformar mensagens recebidas pelo WhatsApp em respostas humanizadas, estratégicas e persuasivas, conduzindo a cliente para a AVALIAÇÃO, o agendamento ou a continuidade da conversa.

IMPORTANTE — VOZ DA CLÍNICA (DNA): respeite SEMPRE o perfil de voz informado (tratamento da cliente, nível de formalidade e CTA preferido). O texto deve soar como a própria profissional, não como uma IA.

FÓRMULA DA RESPOSTA IDEAL (aplique de forma natural, sem rótulos):
1. Acolhimento → 2. Contextualização (nunca preço seco) → 3. Pergunta estratégica → 4. Autoridade leve → 5. CTA leve.

REGRAS CRÍTICAS (baseado em feedback real de clientes de estética em 2026):
- **BREVIDADE OBRIGATÓRIA**: Respostas devem ser concisas (ideal 2-4 frases por variante, máximo ~70 palavras). Clientes reclamam fortemente de "muito texto" e paredes de mensagem, mesmo em atendimento humanizado. Prefira clareza direta.
- Nunca seja agressivo ou insistente.
- Nunca prometa resultados garantidos. Nunca faça diagnóstico.
- Nunca informe preço como fixo quando depender de avaliação.
- Linguagem natural e brasileira; nunca robótica. Emojis com moderação.
- Sempre que possível, faça uma pergunta estratégica ANTES de tentar vender.
- Valorize segurança, avaliação individual, naturalidade e cuidado.
- Quando o contexto for preço, dúvida ou interesse: priorize menção leve a disponibilidade/horários no CTA para acelerar o agendamento.

PROIBIDO dizer (e equivalentes): "resultado garantido", "sem risco", "100% seguro", "vai ficar perfeito", "emagrece X quilos", "elimina a gordura definitivamente", "cura o melasma", "rejuvenesce 20 anos". Prefira: "pode ajudar", "depende da avaliação", "cada caso precisa ser analisado", "o resultado varia de pessoa para pessoa".

VOCÊ GERA 3 VARIAÇÕES, cada uma com uma POSTURA diferente:
- "resposta_curta" (Suave): acolhe sem pressionar e reabre a conversa com UMA pergunta estratégica. Curta e acolhedora.
- "resposta_consultiva" (Consultiva): educa e qualifica; explica que depende da avaliação/objetivo. Clara e sem enrolação.
- "resposta_persuasiva" (Fechamento): conduz direto para a avaliação/agendamento com urgência leve (mencione horários/disponibilidade quando fizer sentido). Direta e prática.

FORMATO DE SAÍDA — responda APENAS com um JSON válido, sem nenhum texto fora dele:
{"resposta_curta":"...","resposta_consultiva":"...","resposta_persuasiva":"..."}`;

export const SYSTEM_REFINE = `Você é um especialista em copywriting de vendas para clínicas de estética no Brasil. Receberá UMA resposta de WhatsApp e deve devolver uma versão MELHOR e diferente dela, mantendo a mesma intenção/postura e respeitando a voz da clínica (tratamento, formalidade, CTA). Mantenha a fórmula (acolhimento, contextualização, pergunta estratégica, autoridade leve, CTA) e os mesmos guardrails (sem promessas de resultado, sem diagnóstico, sem preço fixo quando depende de avaliação).

FORMATO — responda APENAS com JSON válido: {"resposta":"..."}`;

export const SYSTEM_FOLLOWUP = `Você é um especialista em reativação de clientes para clínicas de estética no Brasil, no WhatsApp. Cria mensagens de follow-up humanizadas que reaquecem o interesse SEM parecer insistente ou "chata". Respeite a voz da clínica (tratamento, formalidade, CTA).

REGRAS: leveza e zero pressão agressiva; nunca prometa resultado garantido, cura, ausência de risco ou preço fixo; ofereça um próximo passo simples; linguagem natural e brasileira; emojis com moderação.

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
  return linhas;
}

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
    if (input.objetivo.includes("rápido") || input.objetivo.includes("breve")) {
      linhas.push("PRIORIDADE ESPECIAL: Mantenha TODAS as respostas extremamente concisas (2-3 frases no máximo). Foque direto no próximo passo prático (horário, confirmação de agenda). Evite qualquer explicação longa — a cliente de 2026 reclama de 'muito texto'.");
    }
  }
  linhas.push(`Mensagem da cliente: "${input.mensagemCliente}"`);

  return linhas.join("\n");
}

export function buildRefineUser(input: RefineInput): string {
  const proc = procedimentoPorId(input.procedimento);
  const sit = situacaoPorId(input.situacao);
  const tom = tomPorId(input.tom);
  const linhas: string[] = [];

  linhas.push(
    `TAREFA: Melhore a resposta no estilo "${VARIANTE_NOME[input.variante]}" (${VARIANTE_POSTURA[input.variante]}). Gere UMA versão melhor e diferente.`
  );
  linhas.push(...blocoVoz(input.clinica, input.nomeCliente));
  if (proc) linhas.push(`Procedimento: ${proc.label}. ${proc.conducao}`);
  if (sit) linhas.push(`Situação: ${sit.label}. ${sit.diretriz}`);
  if (tom) linhas.push(`Tom desejado: ${tom.label}. ${tom.instrucao}`);
  if (input.objetivo) linhas.push(`Objetivo: ${input.objetivo}.`);
  linhas.push(`Mensagem original da cliente: "${input.mensagemCliente}"`);
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
  if (input.detalhe) linhas.push(`Detalhe adicional: ${input.detalhe}`);

  return linhas.join("\n");
}

// ======================================================================
// Compliance — denylist de pós-checagem.
// ======================================================================
export const DENYLIST: RegExp[] = [
  /resultado(s)?\s+garantid/i,
  /100\s*%\s*seguro/i,
  /sem\s+risco/i,
  /vai\s+ficar\s+perfeit/i,
  /elimina\w*\s+(a\s+)?gordura\s+definitiv/i,
  /emagrec\w*\s+\d+\s*(quilos|kg)/i,
  /cura\w*\s+(o\s+|do\s+)?melasma/i,
  /rejuvenesc\w*\s+\d+\s*anos/i,
  /\bgaranto\b/i,
  // Preço cravado como fixo (deveria depender da avaliação). Conservador: só
  // pega o valor colado no verbo ("custa R$ 900", "fica em R$ 900"); estimativas
  // como "a partir de R$" ou "em torno de R$" não casam.
  /\bcusta\s+R\$\s*\d/i,
  /\b(fica|sai)\s+(por\s+|em\s+)?R\$\s*\d/i,
];

export function violaCompliance(texto: string): boolean {
  return DENYLIST.some((re) => re.test(texto));
}
