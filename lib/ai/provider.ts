import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import {
  anthropicModel,
  geminiModels,
  isAnthropicConfigured,
  isAnyAIConfigured,
  isGeminiConfigured,
  isNlpServiceConfigured,
  isOpenAIConfigured,
  openaiModel,
} from "@/lib/config";
import { clampScore, validarIntent, validarSentiment } from "@/lib/ai/nlp-validation";
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
  reprovaGeracao,
  inventaFato,
  afirmaFatoSemFonte,
  denylistHits,
  pedidoDeReescrita,
  AVISO_FATOS_AUDITOR,
  AVISO_REVISAO_MANUAL,
  AVISO_SEM_LEITURA,
  AVISO_TEXTO_SEGURO,
} from "@/lib/ai/prompts";
import { mockGerador, mockNeutro, mockRefine, mockFollowup, softenText } from "@/lib/ai/mock";
import { openaiChatParams } from "@/lib/ai/openai-chat";
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
 * Chama a IA disponível e devolve o texto.
 * Implementa timeout e fallback automático na ordem de `providers`.
 */
async function callAI(
  system: string,
  user: string,
  retries = 1,
  options?: CallAIOptions
): Promise<string> {
  const TIMEOUT_MS = 20000;

  const tryOpenAI = async () => {
    if (!isOpenAIConfigured) return null;
    try {
      const resp = await withTimeout(
        getOpenAI().chat.completions.create({
          ...openaiChatParams(openaiModel, 1024),
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          response_format: { type: "json_object" },
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
    // Tenta cada modelo da lista: um 503/429 num modelo não derruba a chamada.
    for (const model of geminiModels) {
      try {
        const resp = await withTimeout(
          getGemini().models.generateContent({
            model,
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
        const text = resp.text?.trim();
        if (text) return text;
      } catch (err: any) {
        console.warn(`[callAI] Gemini ${model} falhou:`, err?.message || err);
      }
    }
    return null;
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
    console.warn(`[callAI] Provedores de IA falharam. Tentando novamente... (${retries} restantes)`);
    await new Promise(r => setTimeout(r, 1000));
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

/** De onde um fato de agenda pode vir: CTA da clínica e texto da profissional. */
function fontesDoFato(input: GerarInput | RefineInput): (string | undefined)[] {
  return [
    input.clinica?.cta_preferido,
    input.modo === "reescrever" ? input.mensagemCliente : undefined,
  ];
}

/** No reescrever a mensagem é da profissional: não há pergunta da cliente a confirmar. */
function perguntaDaCliente(input: GerarInput | RefineInput) {
  return input.modo === "reescrever" ? undefined : input;
}

/** No reescrever, o texto da profissional sem termos proibidos, se ele passar. */
function textoDaProfissional(input: GerarInput | RefineInput): string | undefined {
  if (input.modo !== "reescrever") return undefined;
  const texto = softenText(input.mensagemCliente);
  return texto && !reprovaGeracao(texto, fontesDoFato(input)) ? texto : undefined;
}

/**
 * Garante que NENHUMA das 3 respostas viole a denylist nem afirme fato sem fonte:
 * se alguma reprovar, pede UMA reescrita, RE-VALIDA o resultado e — como última
 * linha de defesa — troca qualquer campo que ainda reprove (ou venha vazio) pelo
 * texto da profissional, no reescrever, ou pelo texto neutro, avisando a troca.
 * Nunca devolve texto proibido para a cliente.
 */
async function garantirCompliance(
  respostas: RespostaTripla,
  user: string,
  input: GerarInput,
  callOptions?: CallAIOptions
): Promise<{ respostas: RespostaTripla; aviso?: string }> {
  const fontes = fontesDoFato(input);
  const cliente = perguntaDaCliente(input);
  const reprova = (t: string) => reprovaGeracao(t, fontes, cliente);
  const algumViola = (r: RespostaTripla) =>
    reprova(r.curta) || reprova(r.consultiva) || reprova(r.persuasiva);

  if (!algumViola(respostas)) return { respostas };

  const inventou = Object.values(respostas).some((t) => inventaFato(t, fontes, cliente));
  try {
    const revisaoRaw = await callAI(
      SYSTEM_GERADOR,
      user +
        pedidoDeReescrita(
          "a resposta anterior usou termos proibidos (promessa de resultado, cura, ausência de risco ou preço fixo) ou afirmou um fato sem fonte. Reescreva as 3 respostas evitando QUALQUER promessa desse tipo.",
          inventou,
          input.situacao
        ),
      1,
      callOptions
    );
    const rev = parseJson<GeradorJson>(revisaoRaw);
    if (rev) {
      // Só adota a reescrita nos campos que ORIGINALMENTE violavam — um campo que
      // já passava não pode ser sobrescrito (e depois virar mock) por causa de uma
      // reescrita ruim de OUTRO campo.
      respostas = {
        curta: reprova(respostas.curta)
          ? rev.resposta_curta?.trim() || respostas.curta
          : respostas.curta,
        consultiva: reprova(respostas.consultiva)
          ? rev.resposta_consultiva?.trim() || respostas.consultiva
          : respostas.consultiva,
        persuasiva: reprova(respostas.persuasiva)
          ? rev.resposta_persuasiva?.trim() || respostas.persuasiva
          : respostas.persuasiva,
      };
    }
  } catch (err) {
    console.warn("[gerarRespostas] reescrita de compliance falhou:", err);
  }

  const neutro = mockNeutro(input);
  const proprio = textoDaProfissional(input);
  let trocou = false;
  const safe = (t: string, v: keyof RespostaTripla) => {
    if (t && !reprova(t)) return t;
    trocou = true;
    return proprio ?? neutro[v];
  };
  const finais = {
    curta: safe(respostas.curta, "curta"),
    consultiva: safe(respostas.consultiva, "consultiva"),
    persuasiva: safe(respostas.persuasiva, "persuasiva"),
  };
  return { respostas: finais, aviso: trocou ? AVISO_TEXTO_SEGURO : undefined };
}

/**
 * Classifica a mensagem do lead (NLP).
 */
export async function classificarMensagem(
  texto: string,
  options?: CallAIOptions
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
      options
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
  input: GerarInput
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
        user + "\n\nIMPORTANTE: responda APENAS com o JSON pedido, nada além disso.",
        1,
        callOptions
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

    const { respostas, aviso } = await garantirCompliance(
      {
        curta: parsed.resposta_curta?.trim() ?? "",
        consultiva: parsed.resposta_consultiva?.trim() ?? "",
        persuasiva: parsed.resposta_persuasiva?.trim() ?? "",
      },
      user,
      input,
      callOptions
    );

    return { respostas, mock: false, aviso, ...nlp };
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
    const fontes = fontesDoFato(input);
    const cliente = perguntaDaCliente(input);
    const reprova = (t: string) => reprovaGeracao(t, fontes, cliente);
    if (texto && reprova(texto)) {
      try {
        const rev = await callAI(
          SYSTEM_REFINE,
          buildRefineUser(input) +
            pedidoDeReescrita(
              "evite QUALQUER promessa de resultado/cura/ausência de risco ou preço fixo.",
              inventaFato(texto, fontes, cliente),
              input.situacao
            )
        );
        texto = parseJson<{ resposta?: string }>(rev)?.resposta?.trim() || texto;
      } catch (err) {
        console.warn("[refinarResposta] reescrita de compliance falhou:", err);
      }
    }
    if (!texto || reprova(texto)) {
      // Melhor manter o que a profissional já tinha na tela do que trocar de assunto.
      const atual = reprova(input.respostaAtual) ? undefined : input.respostaAtual;
      return {
        texto: atual || textoDaProfissional(input) || mockNeutro(input)[input.variante],
        mock: false,
        aviso: texto ? AVISO_TEXTO_SEGURO : AVISO_SEM_LEITURA,
      };
    }
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

    // Compliance: o follow-up também não pode prometer resultado/cura/preço fixo
    // nem afirmar fato sem fonte (o detalhe é digitado pela profissional).
    const fontes = [input.clinica?.cta_preferido, input.detalhe];
    const reprova = (m: string) => reprovaGeracao(m, fontes);
    let aviso: string | undefined;
    if (mensagens.some(reprova)) {
      let reescritas: string[] = [];
      try {
        const revRaw = await callAI(
          SYSTEM_FOLLOWUP,
          user +
            pedidoDeReescrita(
              "a resposta anterior usou termos proibidos ou afirmou um fato sem fonte. Reescreva as 3 mensagens sem QUALQUER promessa de resultado, cura, ausência de risco ou preço fixo.",
              mensagens.some((m) => inventaFato(m, fontes)),
              input.gatilho
            )
        );
        reescritas = (parseJson<{ mensagens?: string[] }>(revRaw)?.mensagens ?? []).map(
          (m) => String(m).trim()
        );
      } catch (err) {
        console.warn("[gerarFollowUp] reescrita de compliance falhou:", err);
      }
      const aprovada = (m?: string) => !!m && !reprova(m);
      // Quem já passava fica na sua posição (a progressão vai da mais suave à mais
      // direta); só a reprovada troca pela reescrita, e as sobras completam a lista.
      const porPosicao = mensagens.map((m, i) => (reprova(m) ? reescritas[i] : m));
      mensagens = Array.from(
        new Set([...porPosicao, ...reescritas].filter(aprovada))
      ).slice(0, 3);
      // A tela promete 3 mensagens: o que faltar vem do mock seguro.
      if (mensagens.length < 3) {
        mensagens = Array.from(new Set([...mensagens, ...mockFollowup(input)])).slice(0, 3);
        aviso = AVISO_TEXTO_SEGURO;
      }
    }

    return { mensagens, mock: false, aviso };
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

/**
 * Auditor de Compliance: revisa um texto escrito pela própria clínica, aponta os
 * riscos (promessa de resultado, preço fixo, cura, etc.) e devolve uma versão
 * segura. Combina uma checagem determinística (denylist) com a IA, e garante que
 * a reescrita NUNCA contenha termo proibido (softenText como última defesa).
 */
export async function auditarCompliance(
  input: AuditoriaInput
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
  const reescritaSegura = (t: string) => (violaCompliance(t) ? softenText(t) : t);

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
      callOptions
    );
    const parsed = parseJson<{ riscos?: AuditoriaRisco[]; reescrita?: string }>(raw);

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

    // A reescrita é texto de IA: o que a clínica escreveu é fonte, o que a IA somou não.
    const fontes = [texto, input.clinica?.cta_preferido];
    const inventou = (t: string) => afirmaFatoSemFonte(t, fontes);
    let candidata = parsed?.reescrita?.trim();
    let semVersaoSegura = false;
    if (candidata && inventou(candidata)) {
      try {
        const rev = await callAI(
          SYSTEM_AUDITORIA,
          buildAuditoriaUser({ ...input, texto }) +
            `\n\nATENÇÃO: a reescrita anterior acrescentou fato que não está no texto original. ${AVISO_FATOS_AUDITOR} Responda só com o JSON.`,
          1,
          callOptions
        );
        candidata = parseJson<{ reescrita?: string }>(rev)?.reescrita?.trim() || candidata;
      } catch (err) {
        console.warn("[auditarCompliance] reescrita de fatos falhou:", err);
      }
      // Ainda somando fato: fica só o que a IA escreveu sem somar nada.
      if (inventou(candidata)) {
        candidata = candidata
          .split(/(?<=[.!?…])\s+/)
          .filter((frase) => !inventou(frase))
          .join(" ");
        if (!candidata) semVersaoSegura = true;
      }
    }
    const reescrita = semVersaoSegura ? softenText(texto) : reescritaSegura(candidata || texto);
    // Risco que só a IA viu continua no texto: não pode sair como versão segura.
    const aviso =
      semVersaoSegura || (riscos.length > 0 && reescrita === texto)
        ? AVISO_REVISAO_MANUAL
        : undefined;

    return { status: statusDe(riscos), riscos, reescrita, mock: false, ...(aviso && { aviso }) };
  } catch (err) {
    console.error("[auditarCompliance] erro na IA:", err);
    return {
      status: statusDe(deterministicos),
      riscos: deterministicos,
      reescrita: deterministicos.length ? softenText(texto) : texto,
      mock: true,
      aviso: "Não foi possível falar com a IA agora. Mostrando a checagem automática.",
    };
  }
}
