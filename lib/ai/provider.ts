import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { aiModel, isAnthropicConfigured, isOpenAIConfigured } from "@/lib/config";
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
 * Chama a IA disponível (OpenAI > Anthropic) e devolve o texto.
 */
async function callAI(system: string, user: string, retries = 1): Promise<string> {
  const TIMEOUT_MS = 15000;

  try {
    // 1. Tenta OpenAI primeiro, se configurado
    if (isOpenAIConfigured) {
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
        return resp.choices[0].message.content || "";
      } catch (err) {
        console.warn("[callAI] OpenAI falhou. Tentando fallback para Anthropic se possível...", err);
        if (!isAnthropicConfigured) throw err;
      }
    }

    // 2. Tenta Anthropic (como primário ou fallback)
    if (isAnthropicConfigured) {
      // Ajusta o modelo caso o atual seja exclusivo da OpenAI
      const fallbackModel = aiModel.startsWith("gpt") ? "claude-haiku-4-5" : aiModel;
      
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
    }

    throw new Error("Nenhuma IA configurada (OpenAI ou Anthropic).");
  } catch (err) {
    if (retries > 0) {
      console.warn(`[callAI] Tentando novamente... (Restam ${retries} tentativas)`);
      return callAI(system, user, retries - 1);
    }
    throw err;
  }
}

function parseJson<T>(text: string): T | null {
  // Tenta extrair qualquer coisa que se pareça com um bloco JSON.
  // Resolve marcações Markdown indesejadas que LLMs frequentemente enviam.
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  
  let jsonString = match[0];
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.warn("[parseJson] Falha no parse primário. Tentando limpar o JSON...", e);
    // Tenta limpar quebras de linha que possam quebrar o parse
    try {
      jsonString = jsonString.replace(/\n/g, " ");
      return JSON.parse(jsonString) as T;
    } catch {
      return null;
    }
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
  if (!isOpenAIConfigured && !isAnthropicConfigured) {
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
