import Anthropic from "@anthropic-ai/sdk";
import { aiModel, isAnthropicConfigured } from "@/lib/config";
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

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

/** Chama o Claude com prompt caching no system (estático) e devolve o texto. */
async function callClaude(system: string, user: string): Promise<string> {
  const resp = await getClient().messages.create({
    model: aiModel,
    max_tokens: 1024,
    temperature: 0.7,
    system: [
      { type: "text", text: system, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: user }],
  });
  return resp.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
}

function parseJson<T>(text: string): T | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
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
  if (!isAnthropicConfigured) {
    return { respostas: mockGerador(input), mock: true };
  }

  const user = buildGeradorUser(input);

  try {
    let raw = await callClaude(SYSTEM_GERADOR, user);
    let parsed = parseJson<GeradorJson>(raw);

    if (!parsed) {
      raw = await callClaude(
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
      const revisaoRaw = await callClaude(
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
        "Não foi possível falar com a IA agora (verifique a ANTHROPIC_API_KEY). Mostrando um exemplo.",
    };
  }
}

export type RefineResultado = { texto: string; mock: boolean; aviso?: string };

export async function refinarResposta(
  input: RefineInput
): Promise<RefineResultado> {
  if (!isAnthropicConfigured) {
    return { texto: mockRefine(input), mock: true };
  }
  try {
    const raw = await callClaude(SYSTEM_REFINE, buildRefineUser(input));
    const parsed = parseJson<{ resposta?: string }>(raw);
    let texto = parsed?.resposta?.trim();
    if (texto && violaCompliance(texto)) {
      const rev = await callClaude(
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
  if (!isAnthropicConfigured) {
    return { mensagens: mockFollowup(input), mock: true };
  }

  const user = buildFollowupUser(input);

  try {
    let raw = await callClaude(SYSTEM_FOLLOWUP, user);
    let parsed = parseJson<{ mensagens?: string[] }>(raw);

    if (!parsed?.mensagens) {
      raw = await callClaude(
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
        "Não foi possível falar com a IA agora (verifique a ANTHROPIC_API_KEY). Mostrando um exemplo.",
    };
  }
}
