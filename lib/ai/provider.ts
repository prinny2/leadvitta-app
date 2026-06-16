import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import {
  anthropicModel,
  geminiModel,
  isAnthropicConfigured,
  isAnyAIConfigured,
  isGeminiConfigured,
  isOpenAIConfigured,
  openaiModel,
} from "@/lib/config";
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
let geminiClient: GoogleGenAI | null = null;

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

function getGemini() {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    });
  }
  return geminiClient;
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
 * Chama a IA disponível (OpenAI > Anthropic > Gemini) e devolve o texto.
 * Implementa timeout e fallback automático.
 */
async function callAI(system: string, user: string, retries = 1): Promise<string> {
  const TIMEOUT_MS = 20000;

  const tryOpenAI = async () => {
    if (!isOpenAIConfigured) return null;
    try {
      const resp = await withTimeout(
        getOpenAI().chat.completions.create({
          model: openaiModel,
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
    try {
      const resp = await withTimeout(
        getAnthropic().messages.create({
          model: anthropicModel,
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

  const tryGemini = async () => {
    if (!isGeminiConfigured) return null;
    try {
      const resp = await withTimeout(
        getGemini().models.generateContent({
          model: geminiModel,
          contents: user,
          config: {
            systemInstruction: system,
            temperature: 0.7,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        }),
        TIMEOUT_MS
      );
      return resp.text?.trim() || null;
    } catch (err: any) {
      console.warn("[callAI] Gemini falhou:", err?.message || err);
      return null;
    }
  };

  const providers = [tryOpenAI, tryAnthropic, tryGemini];
  for (const provider of providers) {
    const content = await provider();
    if (content?.trim()) {
      return content.trim();
    }
  }

  // Se todos falharem, tenta novamente se houver retries
  if (retries > 0) {
    console.warn(`[callAI] Provedores de IA falharam. Tentando novamente... (${retries} restantes)`);
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

// ----- Validação da classificação (NLP) -----
// O LLM pode devolver score fora de 0-100, string, ou intent/sentiment fora do
// vocabulário. Esses valores vão pro Firestore e pro ranking do inbox, então
// precisam ser saneados antes de persistir (senão corrompem a triagem de leads).
const INTENTS_VALIDOS = new Set([
  "pergunta_preco",
  "agendamento",
  "duvida_tecnica",
  "objecao",
  "demonstra_interesse",
  "desistencia",
  "outro",
]);

function clampScore(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function validarIntent(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim().toLowerCase();
  return INTENTS_VALIDOS.has(s) ? s : undefined;
}

function validarSentiment(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const m = v.trim().match(/^([1-5])\s*stars?$/i);
  return m ? `${m[1]} stars` : undefined;
}

/**
 * Garante que NENHUMA das 3 respostas viole a denylist: se alguma violar, pede
 * UMA reescrita, RE-VALIDA o resultado e — como última linha de defesa — troca
 * qualquer campo que ainda viole (ou venha vazio) pelo texto seguro do mock
 * (compliant por construção). Nunca devolve texto proibido para a cliente.
 */
async function garantirCompliance(
  respostas: RespostaTripla,
  user: string,
  input: GerarInput
): Promise<RespostaTripla> {
  const algumViola = (r: RespostaTripla) =>
    violaCompliance(r.curta) ||
    violaCompliance(r.consultiva) ||
    violaCompliance(r.persuasiva);

  if (!algumViola(respostas)) return respostas;

  try {
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
  } catch (err) {
    console.warn("[gerarRespostas] reescrita de compliance falhou:", err);
  }

  const seguro = mockGerador(input);
  const safe = (t: string, v: keyof RespostaTripla) =>
    t && !violaCompliance(t) ? t : seguro[v];
  return {
    curta: safe(respostas.curta, "curta"),
    consultiva: safe(respostas.consultiva, "consultiva"),
    persuasiva: safe(respostas.persuasiva, "persuasiva"),
  };
}

/**
 * Classifica a mensagem do lead (NLP).
 */
export async function classificarMensagem(
  texto: string
): Promise<Partial<GerarResultado>> {
  if (!isAnyAIConfigured) return {};

  try {
    const raw = await callAI(SYSTEM_CLASSIFIER, `MENSAGEM: "${texto}"`);
    const parsed = parseJson<GeradorJson>(raw);
    if (!parsed) return {};
    return {
      intent: validarIntent(parsed.intent),
      sentiment: validarSentiment(parsed.sentiment),
      score: clampScore(parsed.score),
    };
  } catch (err) {
    console.error("[classificarMensagem] erro:", err);
    return {};
  }
}

export async function gerarRespostas(
  input: GerarInput
): Promise<GerarResultado> {
  if (!isAnyAIConfigured) {
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

    const respostas = await garantirCompliance(
      {
        curta: parsed.resposta_curta?.trim() ?? "",
        consultiva: parsed.resposta_consultiva?.trim() ?? "",
        persuasiva: parsed.resposta_persuasiva?.trim() ?? "",
      },
      user,
      input
    );

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
  if (!isAnyAIConfigured) {
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
  if (!isAnyAIConfigured) {
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

    let mensagens = (parsed?.mensagens ?? [])
      .map((m) => String(m).trim())
      .filter(Boolean);

    if (mensagens.length === 0) {
      return { mensagens: mockFollowup(input), mock: false };
    }

    // Compliance: o follow-up também não pode prometer resultado/cura/preço fixo.
    if (mensagens.some(violaCompliance)) {
      // Preserva as mensagens que já passam — uma reescrita curta não pode
      // descartar mensagens compliant que vieram na primeira geração.
      const compliantOriginais = mensagens.filter((m) => !violaCompliance(m));
      let reescritas: string[] = [];
      try {
        const revRaw = await callAI(
          SYSTEM_FOLLOWUP,
          user +
            "\n\nATENÇÃO: a resposta anterior usou termos proibidos. Reescreva as 3 mensagens sem QUALQUER promessa de resultado, cura, ausência de risco ou preço fixo. Responda só com o JSON."
        );
        reescritas = (parseJson<{ mensagens?: string[] }>(revRaw)?.mensagens ?? [])
          .map((m) => String(m).trim())
          .filter((m) => m && !violaCompliance(m));
      } catch (err) {
        console.warn("[gerarFollowUp] reescrita de compliance falhou:", err);
      }
      // Reescritas compliant primeiro, completadas pelas originais que já passavam
      // (sem duplicar). Se nada sobrar compliant, usa o mock seguro.
      mensagens = Array.from(new Set([...reescritas, ...compliantOriginais]));
      if (mensagens.length === 0) {
        mensagens = mockFollowup(input);
      }
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
