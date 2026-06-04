import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  aiModel,
  openAIModel,
  isAnthropicConfigured,
  isOpenAIConfigured,
} from "@/lib/config";
import {
  SYSTEM_GERADOR,
  SYSTEM_REFINE,
  SYSTEM_FOLLOWUP,
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

const TIMEOUT_MS = 25000; // 25 segundos

let anthropicClient: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

/** Chama o Claude com prompt caching no system (estático) e devolve o texto. */
async function callClaude(system: string, user: string): Promise<string> {
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  try {
    const resp = await getAnthropic().messages.create(
      {
        model: aiModel,
        max_tokens: 1024,
        temperature: 0.7,
        system: [
          { type: "text", text: system, cache_control: { type: "ephemeral" } },
        ],
        messages: [{ role: "user", content: user }],
      },
      { signal }
    );
    return resp.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Anthropic: tempo esgotado (timeout).");
    }
    if (err.status === 401) {
      throw new Error("Anthropic: chave de API inválida.");
    }
    if (err.status === 429) {
      throw new Error("Anthropic: limite de requisições excedido (rate limit).");
    }
    throw err;
  }
}

/** Chama a OpenAI (GPT-4o) e devolve o texto. */
async function callOpenAI(system: string, user: string): Promise<string> {
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  try {
    const resp = await getOpenAI().chat.completions.create(
      {
        model: openAIModel,
        max_tokens: 1024,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      },
      { signal }
    );
    return resp.choices[0]?.message?.content || "";
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("OpenAI: tempo esgotado (timeout).");
    }
    if (err.status === 401) {
      throw new Error("OpenAI: chave de API inválida.");
    }
    if (err.status === 429) {
      throw new Error("OpenAI: limite de requisições excedido (rate limit).");
    }
    throw err;
  }
}

/** 
 * Tenta chamar a IA configurada. Se falhar, tenta a outra (fallback). 
 */
async function callAI(system: string, user: string): Promise<string> {
  // Ordem de preferência: Anthropic -> OpenAI
  if (isAnthropicConfigured) {
    try {
      return await callClaude(system, user);
    } catch (err: any) {
      console.warn("[callAI] Anthropic falhou, tentando OpenAI...", err.message);
      if (isOpenAIConfigured) {
        return await callOpenAI(system, user);
      }
      throw err;
    }
  }

  if (isOpenAIConfigured) {
    return await callOpenAI(system, user);
  }

  throw new Error("Nenhum provedor de IA configurado.");
}

function parseJson<T>(text: string): T | null {
  if (!text) return null;
  
  // Limpa possíveis wrappers de markdown
  let clean = text.trim();
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
  }

  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) return null;
  
  try {
    return JSON.parse(match[0]) as T;
  } catch (err) {
    console.error("[parseJson] erro ao parsear JSON:", err);
    return null;
  }
}

type GeradorJson = {
  resposta_curta?: string;
  resposta_consultiva?: string;
  resposta_persuasiva?: string;
};

export type GerarResultado = {
  respostas: RespostaTripla;
  mock: boolean;
  aviso?: string;
};

export async function gerarRespostas(
  input: GerarInput
): Promise<GerarResultado> {
  if (!isAnthropicConfigured && !isOpenAIConfigured) {
    return { respostas: mockGerador(input), mock: true };
  }

  const user = buildGeradorUser(input);

  try {
    let raw = await callAI(SYSTEM_GERADOR, user);
    let parsed = parseJson<GeradorJson>(raw);

    if (!parsed) {
      raw = await callAI(
        SYSTEM_GERADOR,
        user + "\n\nIMPORTANTE: responda APENAS com o JSON pedido, nada além disso."
      );
      parsed = parseJson<GeradorJson>(raw);
    }

    if (!parsed) {
      return {
        respostas: mockGerador(input),
        mock: false,
        aviso: "Não consegui interpretar a resposta da IA; mostrando um exemplo.",
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

    return { respostas, mock: false };
  } catch (err) {
    console.error("[gerarRespostas] erro na IA:", err);
    return {
      respostas: mockGerador(input),
      mock: true,
      aviso:
        "Não foi possível falar com a IA agora. Mostrando um exemplo.",
    };
  }
}

export type RefineResultado = { texto: string; mock: boolean; aviso?: string };

export async function refinarResposta(
  input: RefineInput
): Promise<RefineResultado> {
  if (!isAnthropicConfigured && !isOpenAIConfigured) {
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
  if (!isAnthropicConfigured && !isOpenAIConfigured) {
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
