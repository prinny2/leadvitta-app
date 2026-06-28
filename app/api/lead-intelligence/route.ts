import {
  jsonNoStore,
  enforceRateLimit,
  readJsonBody,
  rejectCrossOriginRequest,
} from "@/lib/api-security";
import { isOpenAIConfigured, isAnthropicConfigured } from "@/lib/config";

export const runtime = "nodejs";

export interface LeadIntelligenceResult {
  score: number;
  temperatura: "quente" | "morno" | "frio";
  perfil: string;
  abordagem: string;
  gatilho: string;
  eixos: {
    urgencia: number;
    intencao: number;
    confianca: number;
    receptividade: number;
    maturidade: number;
  };
  intent: string;
  sentiment: "positivo" | "neutro" | "negativo";
  mock?: boolean;
}

function mockAnalysis(msg: string): LeadIntelligenceResult {
  const m = msg.toLowerCase();

  const hasPreco = /prec|valor|quanto|caro|barato|parcela|invest/.test(m);
  const hasMedo = /medo|dor|doi|dói|machuca|receio|medo/.test(m);
  const hasAgendar = /agendar|marcar|quando|horário|horario|disponib/.test(m);
  const hasConfia =
    /indica|resultado|antes.*depois|foto|garantia|confio|funciona/.test(m);
  const hasPosVenda = /volta|retorno|resultado.*sumiu|durou|duração/.test(m);
  const hasInterest = /quero|gostaria|interesse|informaç|me conta|me fala/.test(
    m,
  );

  let score = 52;
  let urgencia = 40,
    intencao = 50,
    confianca = 55,
    receptividade = 60,
    maturidade = 45;
  let perfil =
    "Lead em fase de consideração, avaliando opções antes de decidir.";
  let abordagem =
    "Use tom consultivo. Mostre diferenciais antes de falar em valor.";
  let gatilho =
    "Ofereça uma avaliação gratuita para reduzir a barreira de entrada.";
  let intent = "informacao";
  let sentiment: "positivo" | "neutro" | "negativo" = "neutro";

  if (hasPreco) {
    score = 58;
    urgencia = 55;
    intencao = 65;
    confianca = 40;
    receptividade = 50;
    maturidade = 60;
    perfil =
      "Cliente sensível a preço. Precisa de justificativa de valor antes de qualquer número.";
    abordagem =
      "Não revele valores imediatamente. Primeiro entenda o objetivo, depois apresente o investimento como solução.";
    gatilho =
      "Mencionar parcelamento e custo-benefício a longo prazo pode reduzir resistência de preço.";
    intent = "preco";
    sentiment = "neutro";
  }
  if (hasMedo) {
    score = 44;
    urgencia = 35;
    intencao = 55;
    confianca = 25;
    receptividade = 45;
    maturidade = 35;
    perfil =
      "Lead com barreira emocional. O medo é o principal obstáculo — não o preço.";
    abordagem =
      "Acolha o sentimento antes de argumentar. Use depoimentos e explique o processo com calma.";
    gatilho =
      "Convide para uma avaliação presencial sem compromisso para quebrar o medo com presença.";
    intent = "medo";
    sentiment = "negativo";
  }
  if (hasAgendar) {
    score = 82;
    urgencia = 85;
    intencao = 88;
    confianca = 70;
    receptividade = 80;
    maturidade = 78;
    perfil =
      "Lead quente — já decidiu pelo procedimento, está escolhendo quando e onde fazer.";
    abordagem =
      "Responda rápido. Ofereça 2 opções de horário e confirme em seguida. Não deixe esfriar.";
    gatilho =
      "Crie urgência com disponibilidade limitada. 'Tenho horário amanhã às 14h ou quinta às 10h.'";
    intent = "agendamento";
    sentiment = "positivo";
  }
  if (hasConfia) {
    score = 63;
    urgencia = 45;
    intencao = 60;
    confianca = 35;
    receptividade = 65;
    maturidade = 55;
    perfil =
      "Lead em fase de pesquisa de credibilidade. Quer prova antes de avançar.";
    abordagem =
      "Envie portfólio, depoimentos reais e resultados de procedimentos similares ao interesse dela.";
    gatilho =
      "Antes/depois de clientes com perfil similar aceleram a decisão mais que qualquer argumento.";
    intent = "confianca";
    sentiment = "neutro";
  }
  if (hasPosVenda) {
    score = 71;
    urgencia = 60;
    intencao = 70;
    confianca = 65;
    receptividade = 75;
    maturidade = 68;
    perfil =
      "Ex-cliente ativo — alta probabilidade de retorno. Já conhece e confiou na clínica.";
    abordagem =
      "Trate como VIP. Reconheça a relação anterior e apresente manutenção como continuidade natural.";
    gatilho =
      "Ofereça desconto exclusivo de fidelidade ou pacote de manutenção com condições especiais.";
    intent = "retorno";
    sentiment = "positivo";
  }
  if (hasInterest && !hasPreco && !hasMedo && !hasAgendar) {
    score = 67;
    urgencia = 50;
    intencao = 72;
    confianca = 60;
    receptividade = 78;
    maturidade = 58;
    perfil =
      "Lead com interesse genuíno. Aberta ao diálogo — bom momento para qualificar.";
    abordagem =
      "Faça perguntas para entender o objetivo dela. Quanto mais ela falar, mais qualificada fica.";
    gatilho =
      "Uma pergunta como 'O que te motivou a buscar isso agora?' revela o gatilho real da decisão.";
    intent = "interesse";
    sentiment = "positivo";
  }

  const temperatura: "quente" | "morno" | "frio" =
    score >= 72 ? "quente" : score >= 50 ? "morno" : "frio";

  return {
    score,
    temperatura,
    perfil,
    abordagem,
    gatilho,
    eixos: { urgencia, intencao, confianca, receptividade, maturidade },
    intent,
    sentiment,
    mock: true,
  };
}

function isValidAnalysis(value: unknown): value is LeadIntelligenceResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.score !== "number") return false;
  const eixos = v.eixos;
  if (typeof eixos !== "object" || eixos === null) return false;
  const e = eixos as Record<string, unknown>;
  return (
    typeof e.urgencia === "number" &&
    typeof e.intencao === "number" &&
    typeof e.confianca === "number" &&
    typeof e.receptividade === "number" &&
    typeof e.maturidade === "number"
  );
}

async function aiAnalysis(msg: string): Promise<LeadIntelligenceResult> {
  const systemPrompt = `Você é um especialista em vendas para clínicas de estética brasileiras.
Analise a mensagem de um potencial cliente e retorne JSON com esta estrutura exata:
{
  "score": número de 0 a 100 indicando probabilidade de conversão,
  "temperatura": "quente" | "morno" | "frio",
  "perfil": "descrição do perfil psicológico do lead em 1 frase",
  "abordagem": "estratégia recomendada para responder em 1-2 frases",
  "gatilho": "gatilho específico para avançar a venda em 1 frase",
  "eixos": {
    "urgencia": 0-100,
    "intencao": 0-100,
    "confianca": 0-100,
    "receptividade": 0-100,
    "maturidade": 0-100
  },
  "intent": "preco" | "agendamento" | "medo" | "confianca" | "retorno" | "interesse" | "informacao",
  "sentiment": "positivo" | "neutro" | "negativo"
}
Responda APENAS com o JSON, sem explicações.`;

  const userMsg = `Mensagem do lead: "${msg}"`;

  if (isOpenAIConfigured) {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await client.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMsg },
      ],
      response_format: { type: "json_object" },
      max_tokens: 400,
    });
    const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
    return isValidAnalysis(parsed) ? parsed : mockAnalysis(msg);
  }

  if (isAnthropicConfigured) {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      messages: [{ role: "user", content: `${systemPrompt}\n\n${userMsg}` }],
    });
    const text = res.content[0].type === "text" ? res.content[0].text : "{}";
    const match = text.match(/\{[\s\S]+\}/);
    const parsed = JSON.parse(match?.[0] ?? "{}");
    return isValidAnalysis(parsed) ? parsed : mockAnalysis(msg);
  }

  return mockAnalysis(msg);
}

export async function POST(req: Request) {
  const originError = rejectCrossOriginRequest(req);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(req, {
    bucket: "lead-intelligence",
    limit: 20,
    windowMs: 60_000,
  });
  if (rateLimitError) return rateLimitError;

  const parsed = await readJsonBody<{ mensagem: string }>(req, 4096);
  if (parsed.error) return parsed.error;

  const mensagem = parsed.data?.mensagem?.trim() ?? "";
  if (!mensagem)
    return jsonNoStore({ error: "Mensagem obrigatória." }, { status: 400 });
  if (mensagem.length < 5)
    return jsonNoStore({ error: "Mensagem muito curta." }, { status: 400 });

  try {
    const result =
      isOpenAIConfigured || isAnthropicConfigured
        ? await aiAnalysis(mensagem)
        : mockAnalysis(mensagem);
    return jsonNoStore(result);
  } catch {
    return jsonNoStore(mockAnalysis(mensagem));
  }
}
