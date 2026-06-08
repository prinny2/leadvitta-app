import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { aiModel, isAnthropicConfigured, isOpenAIConfigured } from "@/lib/config";
import {
  SYSTEM_GERADOR,
  SYSTEM_REFINE,
  SYSTEM_FOLLOWUP,
  SYSTEM_CLASSIFIER,
  buildGeradorUser,
  buildRefineUser,
  buildFollowupUser,
  violaCompliance,
} from "@/lib/ai/prompts";
import { mockGerador, mockRefine, mockFollowup } from "@/lib/ai/mock";
import type {
  GerarInput,
  FollowUpInput,
  RefineInput,
  RespostaTripla,
} from "@/lib/types";

// Clients
let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;

function getAnthropic() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

function getOpenAI() {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

/** 
 * Executa uma Promise com timeout.
 */
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`API Timeout após ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/** 
 * Tenta converter texto em JSON de forma resiliente.
 */
function parseJson<T>(text: string): T | null {
  if (!text) return null;

  // 1. Tenta o parse direto
  try {
    return JSON.parse(text) as T;
  } catch {
    /* continua para limpeza */
  }

  // 2. Extrai o conteúdo entre a primeira { e a última }
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  
  const jsonString = match[0];
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.warn("[parseJson] Falha no parse. Tentando limpeza pesada...", e);
    try {
      // Remove quebras de linha que costumam quebrar o parse se estiverem fora de strings
      // (Esta limpeza é básica; LLMs às vezes mandam JSONs muito malformados)
      const cleaned = jsonString.replace(/\n/g, " ").replace(/\r/g, " ");
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }
}

/** 
 * Chama a IA disponível (OpenAI > Anthropic) e devolve o texto.
 * Implementa timeout e fallback automático.
 */
async function callAI(system: string, user: string, retries = 1): Promise<string> {
  const TIMEOUT_MS = 20000;

  const tryOpenAI = async () => {
    if (!isOpenAIConfigured) return null;
    try {
      const resp = await withTimeout(
        getOpenAI().chat.completions.create({
          model: aiModel,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.7,
          max_tokens: 1024,
          response_format: { type: "json_object" }
        }),
        TIMEOUT_MS
      );
      return resp.choices?.[0]?.message?.content || null;
    } catch (err: any) {
      console.warn("[callAI] OpenAI falhou:", err?.message || err);
      return null;
    }
  };

  const tryAnthropic = async () => {
    if (!isAnthropicConfigured) return null;
    const fallbackModel = aiModel.startsWith("gpt") ? "claude-haiku-4-5" : aiModel;
    try {
      const resp = await withTimeout(
        getAnthropic().messages.create({
          model: fallbackModel,
          max_tokens: 1024,
          temperature: 0.7,
          system: [
            { type: "text", text: system, cache_control: { type: "ephemeral" } },
          ],
          messages: [{ role: "user", content: user }],
        }),
        TIMEOUT_MS
      );
      return resp.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("")
        .trim();
    } catch (err: any) {
      console.warn("[callAI] Anthropic falhou:", err?.message || err);
      return null;
    }
  };

  // Tenta as APIs em sequência
  let content = await tryOpenAI();
  if (!content) {
    content = await tryAnthropic();
  }

  if (content) return content;

  // Se ambos falharem, tenta novamente se houver retries
  if (retries > 0) {
    console.warn(`[callAI] Ambas APIs falharam. Tentando novamente... (${retries} restantes)`);
    await new Promise(r => setTimeout(r, 1000));
    return callAI(system, user, retries - 1);
  }

  throw new Error("Não foi possível obter resposta das APIs de IA.");
}

type GeradorJson = {
  resposta_curta?: string;
  resposta_consultiva?: string;
  resposta_persuasiva?: string;
  intent?: string;
  sentiment?: string;
  score?: number;
};

export type GerarResultado = {
  respostas: RespostaTripla;
  mock: boolean;
  aviso?: string;
  intent?: string;
  sentiment?: string;
  score?: number;
};

/** 
 * Classifica a mensagem do lead (NLP).
 */
export async function classificarMensagem(
  texto: string
): Promise<Partial<GerarResultado>> {
  if (!isOpenAIConfigured && !isAnthropicConfigured) return {};

  try {
    const raw = await callAI(SYSTEM_CLASSIFIER, `MENSAGEM: "${texto}"`);
    const parsed = parseJson<GeradorJson>(raw);
    if (!parsed) return {};
    return {
      intent: parsed.intent,
      sentiment: parsed.sentiment,
      score: parsed.score,
    };
  } catch (err) {
    console.error("[classificarMensagem] erro:", err);
    return {};
  }
}

export async function gerarRespostas(
  input: GerarInput
): Promise<GerarResultado> {
  if (!isOpenAIConfigured && !isAnthropicConfigured) {
    return { respostas: mockGerador(input), mock: true };
  }

  const user = buildGeradorUser(input);

  try {
    // Chama o gerador e o classificador em paralelo para performance.
    const [raw, nlp] = await Promise.all([
      callAI(SYSTEM_GERADOR, user),
      classificarMensagem(input.mensagemCliente),
    ]);

    let parsed = parseJson<GeradorJson>(raw);

    if (!parsed) {
      const retryRaw = await callAI(
        SYSTEM_GERADOR,
        user + "\n\nIMPORTANTE: responda APENAS com o JSON pedido, nada além disso."
      );
      parsed = parseJson<GeradorJson>(retryRaw);
    }

    if (!parsed) {
      return {
        respostas: mockGerador(input),
        mock: false,
        aviso: "Não consegui interpretar a resposta da IA; mostrando um exemplo.",
        ...nlp,
      };
    }

    let respostas: RespostaTripla = {
      curta: parsed.resposta_curta?.trim() ?? "",
      consultiva: parsed.resposta_consultiva?.trim() ?? "",
      persuasiva: parsed.resposta_persuasiva?.trim() ?? "",
    };

    const violou = [respostas.curta, respostas.consultiva, respostas.persuasiva].some(
      violaCompliance
    );
    if (violou) {
      const revisaoRaw = await callAI(
        SYSTEM_GERADOR,
        user +
          "\n\nATENÇÃO: a resposta anterior usou termos proibidos (promessa de resultado, cura, ausência de risco ou preço fixo). Reescreva as 3 respostas evitando QUALQUER promessa desse tipo. Responda só com o JSON."
      );
      const rev = parseJson<GeradorJson>(revisaoRaw);
      if (rev) {
        respostas = {
          curta: rev.resposta_curta?.trim() || respostas.curta,
          consultiva: rev.resposta_consultiva?.trim() || respostas.consultiva,
          persuasiva: rev.resposta_persuasiva?.trim() || respostas.persuasiva,
        };
      }
    }

    return { respostas, mock: false, ...nlp };
  } catch (err) {
    console.error("[gerarRespostas] erro na IA:", err);
    return {
      respostas: mockGerador(input),
      mock: true,
      aviso: "Não foi possível falar com a IA agora. Mostrando um exemplo.",
    };
  }
}

export type RefineResultado = { texto: string; mock: boolean; aviso?: string };

export async function refinarResposta(
  input: RefineInput
): Promise<RefineResultado> {
  if (!isOpenAIConfigured && !isAnthropicConfigured) {
    return { texto: mockRefine(input), mock: true };
  }
  try {
    const raw = await callAI(SYSTEM_REFINE, buildRefineUser(input));
    const parsed = parseJson<{ resposta?: string }>(raw);
    let texto = parsed?.resposta?.trim();
    if (texto && violaCompliance(texto)) {
      const rev = await callAI(
        SYSTEM_REFINE,
        buildRefineUser(input) +
          "\n\nATENÇÃO: evite QUALQUER promessa de resultado/cura/ausência de risco ou preço fixo. Responda só com o JSON."
      );
      texto = parseJson<{ resposta?: string }>(rev)?.resposta?.trim() || texto;
    }
    if (!texto) return { texto: mockRefine(input), mock: false };
    return { texto, mock: false };
  } catch (err) {
    console.error("[refinarResposta] erro na IA:", err);
    return { texto: mockRefine(input), mock: true };
  }
}

export type FollowUpResultado = {
  mensagens: string[];
  mock: boolean;
  aviso?: string;
};

export async function gerarFollowUp(
  input: FollowUpInput
): Promise<FollowUpResultado> {
  if (!isOpenAIConfigured && !isAnthropicConfigured) {
    return { mensagens: mockFollowup(input), mock: true };
  }

  const user = buildFollowupUser(input);

  try {
    let raw = await callAI(SYSTEM_FOLLOWUP, user);
    let parsed = parseJson<{ mensagens?: string[] }>(raw);

    if (!parsed?.mensagens) {
      raw = await callAI(
        SYSTEM_FOLLOWUP,
        user + "\n\nIMPORTANTE: responda APENAS com o JSON pedido."
      );
      parsed = parseJson<{ mensagens?: string[] }>(raw);
    }

    const mensagens = (parsed?.mensagens ?? [])
      .map((m) => String(m).trim())
      .filter(Boolean);

    if (mensagens.length === 0) {
      return { mensagens: mockFollowup(input), mock: false };
    }
    return { mensagens, mock: false };
  } catch (err) {
    console.error("[gerarFollowUp] erro na IA:", err);
    return {
      mensagens: mockFollowup(input),
      mock: true,
      aviso:
        "Não foi possível falar com a IA agora. Mostrando um exemplo.",
    };
  }
}
