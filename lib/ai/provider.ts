import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import {
  anthropicModel,
  geminiModel,
  isAnthropicConfigured,
  isAnyAIConfigured,
  isGeminiConfigured,
  isNlpServiceConfigured,
  isOpenAIConfigured,
  openaiModel,
} from "@/lib/config";
import {
  clampScore,
  validarIntent,
  validarSentiment,
} from "@/lib/ai/nlp-validation";
import { classificarViaNlpService } from "@/lib/ai/nlp-service";
import {
  SYSTEM_GERADOR,
  SYSTEM_REFINE,
  SYSTEM_FOLLOWUP,
  SYSTEM_CLASSIFIER,
  SYSTEM_AUDITORIA,
  buildGeradorUser,
  buildRefineUser,
  buildFollowupUser,
  buildAuditoriaUser,
  violaCompliance,
  denylistHits,
} from "@/lib/ai/prompts";
import {
  mockGerador,
  mockRefine,
  mockFollowup,
  softenText,
} from "@/lib/ai/mock";
import type {
  AIProviderId,
  GerarInput,
  FollowUpInput,
  RefineInput,
  RespostaTripla,
  AuditoriaInput,
  AuditoriaResultado,
  AuditoriaRisco,
  AuditoriaStatus,
} from "@/lib/types";

const DEFAULT_PROVIDER_CHAIN: AIProviderId[] = [
  "openai",
  "anthropic",
  "gemini",
];

type CallAIOptions = {
  providers?: AIProviderId[];
};

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
  return Promise.race([promise, timeoutPromise]).finally(() =>
    clearTimeout(timer),
  );
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
 * Chama a IA disponível e devolve o texto.
 * Implementa timeout e fallback automático na ordem de `providers`.
 */
async function callAI(
  system: string,
  user: string,
  retries = 1,
  options?: CallAIOptions,
): Promise<string> {
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
          response_format: { type: "json_object" },
        }),
        TIMEOUT_MS,
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
            {
              type: "text",
              text: system,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [{ role: "user", content: user }],
        }),
        TIMEOUT_MS,
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
        TIMEOUT_MS,
      );
      return resp.text?.trim() || null;
    } catch (err: any) {
      console.warn("[callAI] Gemini falhou:", err?.message || err);
      return null;
    }
  };

  const chain = options?.providers ?? DEFAULT_PROVIDER_CHAIN;
  const providerFns = {
    openai: tryOpenAI,
    anthropic: tryAnthropic,
    gemini: tryGemini,
  } satisfies Record<AIProviderId, () => Promise<string | null>>;

  for (const id of chain) {
    const content = await providerFns[id]();
    if (content?.trim()) {
      return content.trim();
    }
  }

  // Se todos falharem, tenta novamente se houver retries
  if (retries > 0) {
    console.warn(
      `[callAI] Provedores de IA falharam. Tentando novamente... (${retries} restantes)`,
    );
    await new Promise((r) => setTimeout(r, 1000));
    return callAI(system, user, retries - 1, options);
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
 * Garante que NENHUMA das 3 respostas viole a denylist: se alguma violar, pede
 * UMA reescrita, RE-VALIDA o resultado e — como última linha de defesa — troca
 * qualquer campo que ainda viole (ou venha vazio) pelo texto seguro do mock
 * (compliant por construção). Nunca devolve texto proibido para a cliente.
 */
async function garantirCompliance(
  respostas: RespostaTripla,
  user: string,
  input: GerarInput,
  callOptions?: CallAIOptions,
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
        "\n\nATENÇÃO: a resposta anterior usou termos proibidos (promessa de resultado, cura, ausência de risco ou preço fixo). Reescreva as 3 respostas evitando QUALQUER promessa desse tipo. Responda só com o JSON.",
      1,
      callOptions,
    );
    const rev = parseJson<GeradorJson>(revisaoRaw);
    if (rev) {
      // Só adota a reescrita nos campos que ORIGINALMENTE violavam — um campo que
      // já passava não pode ser sobrescrito (e depois virar mock) por causa de uma
      // reescrita ruim de OUTRO campo.
      respostas = {
        curta: violaCompliance(respostas.curta)
          ? rev.resposta_curta?.trim() || respostas.curta
          : respostas.curta,
        consultiva: violaCompliance(respostas.consultiva)
          ? rev.resposta_consultiva?.trim() || respostas.consultiva
          : respostas.consultiva,
        persuasiva: violaCompliance(respostas.persuasiva)
          ? rev.resposta_persuasiva?.trim() || respostas.persuasiva
          : respostas.persuasiva,
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
  texto: string,
  options?: CallAIOptions,
): Promise<Partial<GerarResultado>> {
  // Prefere o serviço de ML externo (leadvitta-nlp) quando configurado; só cai
  // no classificador LLM se ele falhar ou não devolver intenção válida.
  if (isNlpServiceConfigured) {
    const nlp = await classificarViaNlpService(texto);
    if (nlp?.intent) return nlp;
  }

  if (!isAnyAIConfigured) return {};

  try {
    const raw = await callAI(
      SYSTEM_CLASSIFIER,
      `MENSAGEM: "${texto}"`,
      1,
      options,
    );
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
  input: GerarInput,
): Promise<GerarResultado> {
  if (!isAnyAIConfigured) {
    return { respostas: mockGerador(input), mock: true };
  }

  const user = buildGeradorUser(input);
  const callOptions: CallAIOptions | undefined = input.providerChain
    ? { providers: input.providerChain }
    : undefined;

  try {
    // Chama o gerador e o classificador em paralelo para performance.
    const [raw, nlp] = await Promise.all([
      callAI(SYSTEM_GERADOR, user, 1, callOptions),
      classificarMensagem(input.mensagemCliente, callOptions),
    ]);

    let parsed = parseJson<GeradorJson>(raw);

    if (!parsed) {
      const retryRaw = await callAI(
        SYSTEM_GERADOR,
        user +
          "\n\nIMPORTANTE: responda APENAS com o JSON pedido, nada além disso.",
        1,
        callOptions,
      );
      parsed = parseJson<GeradorJson>(retryRaw);
    }

    if (!parsed) {
      return {
        respostas: mockGerador(input),
        mock: false,
        aviso:
          "Não consegui interpretar a resposta da IA; mostrando um exemplo.",
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
      input,
      callOptions,
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
  input: RefineInput,
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
          "\n\nATENÇÃO: evite QUALQUER promessa de resultado/cura/ausência de risco ou preço fixo. Responda só com o JSON.",
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
  input: FollowUpInput,
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
        user + "\n\nIMPORTANTE: responda APENAS com o JSON pedido.",
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
            "\n\nATENÇÃO: a resposta anterior usou termos proibidos. Reescreva as 3 mensagens sem QUALQUER promessa de resultado, cura, ausência de risco ou preço fixo. Responda só com o JSON.",
        );
        reescritas = (
          parseJson<{ mensagens?: string[] }>(revRaw)?.mensagens ?? []
        )
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
      aviso: "Não foi possível falar com a IA agora. Mostrando um exemplo.",
    };
  }
}

/**
 * Auditor de Compliance: revisa um texto escrito pela própria clínica, aponta os
 * riscos (promessa de resultado, preço fixo, cura, etc.) e devolve uma versão
 * segura. Combina uma checagem determinística (denylist) com a IA, e garante que
 * a reescrita NUNCA contenha termo proibido (softenText como última defesa).
 */
export async function auditarCompliance(
  input: AuditoriaInput,
): Promise<AuditoriaResultado> {
  const texto = (input.texto ?? "").trim();

  // Riscos determinísticos da denylist — confiáveis mesmo sem IA.
  const deterministicos = denylistHits(texto);

  const statusDe = (riscos: AuditoriaRisco[]): AuditoriaStatus => {
    if (riscos.some((r) => r.gravidade === "alta")) return "risco";
    if (riscos.length > 0) return "ajustes";
    return "ok";
  };

  // Garante que a reescrita nunca devolve termo proibido.
  const reescritaSegura = (t: string) =>
    violaCompliance(t) ? softenText(t) : t;

  // Sem IA (modo demo): denylist + reescrita determinística.
  if (!isAnyAIConfigured) {
    return {
      status: statusDe(deterministicos),
      riscos: deterministicos,
      reescrita: deterministicos.length ? softenText(texto) : texto,
      mock: true,
    };
  }

  const callOptions: CallAIOptions | undefined = input.providerChain
    ? { providers: input.providerChain }
    : undefined;

  try {
    const raw = await callAI(
      SYSTEM_AUDITORIA,
      buildAuditoriaUser({ ...input, texto }),
      1,
      callOptions,
    );
    const parsed = parseJson<{ riscos?: AuditoriaRisco[]; reescrita?: string }>(
      raw,
    );

    const gravidadesValidas = ["alta", "media", "baixa"] as const;
    const aiRiscos: AuditoriaRisco[] = Array.isArray(parsed?.riscos)
      ? parsed!.riscos
          .map((r) => ({
            trecho: String(r?.trecho ?? "").trim(),
            motivo: String(r?.motivo ?? "").trim(),
            gravidade: gravidadesValidas.includes(r?.gravidade as never)
              ? (r.gravidade as AuditoriaRisco["gravidade"])
              : "media",
          }))
          .filter((r) => r.motivo)
      : [];

    // Determinísticos primeiro; junta os da IA sem duplicar trecho.
    const vistos = new Set(deterministicos.map((r) => r.trecho.toLowerCase()));
    const riscos: AuditoriaRisco[] = [...deterministicos];
    for (const r of aiRiscos) {
      const chave = r.trecho.toLowerCase();
      if (chave && vistos.has(chave)) continue;
      if (chave) vistos.add(chave);
      riscos.push(r);
    }

    const reescritaBruta = parsed?.reescrita?.trim();
    const reescrita = reescritaSegura(reescritaBruta || texto);

    return { status: statusDe(riscos), riscos, reescrita, mock: false };
  } catch (err) {
    console.error("[auditarCompliance] erro na IA:", err);
    return {
      status: statusDe(deterministicos),
      riscos: deterministicos,
      reescrita: deterministicos.length ? softenText(texto) : texto,
      mock: true,
      aviso:
        "Não foi possível falar com a IA agora. Mostrando a checagem automática.",
    };
  }
}
