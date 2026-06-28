// Cliente do microserviço leadvitta-nlp (FastAPI, modelos de ML reais:
// mDeBERTa zero-shot + BERT de sentimento). Quando NLP_SERVICE_URL está
// configurada, classificarMensagem (lib/ai/provider.ts) prefere este serviço
// para intent/sentiment e cai no classificador LLM em qualquer falha.

import { nlpServiceUrl } from "@/lib/config";
import {
  clampScore,
  validarIntent,
  validarSentiment,
} from "@/lib/ai/nlp-validation";

export type NlpClassification = {
  intent?: string;
  sentiment?: string;
  score?: number;
};

// Roda DENTRO de gerarRespostas (síncrono p/ o usuário), então o timeout precisa
// ser curto: há fallback LLM rápido, e 8s de cold start do FastAPI penalizaria a
// geração inteira. 4s cobre o caminho quente sem pendurar a resposta.
const TIMEOUT_MS = Number(process.env.NLP_SERVICE_TIMEOUT_MS) || 4000;

// Labels do leadvitta-nlp (INTENCOES em service/main.py) -> enum do app.
const INTENT_MAP: Record<string, string> = {
  "pergunta de preço": "pergunta_preco",
  "achou caro ou objeção": "objecao",
  "pediu desconto": "objecao",
  "quer agendar": "agendamento",
  "dúvida sobre o procedimento": "duvida_tecnica",
  "demonstra interesse": "demonstra_interesse",
  "vai pensar ou sem interesse": "desistencia",
};

// O serviço NLP só devolve confiança (0-1), não um score de prioridade 0-100.
// Derivamos a prioridade do lead da intenção (base) ajustada pelo sentimento.
const SCORE_BASE: Record<string, number> = {
  agendamento: 85,
  demonstra_interesse: 75,
  pergunta_preco: 60,
  duvida_tecnica: 55,
  objecao: 45,
  desistencia: 20,
  outro: 40,
};

function scoreFromNlp(
  intent: string | undefined,
  sentiment: string | undefined,
): number | undefined {
  if (!intent) return undefined;
  const base = SCORE_BASE[intent] ?? SCORE_BASE.outro;
  const stars = sentiment ? Number(sentiment.charAt(0)) : 3;
  // (estrelas - 3) * 5 => ajuste de -10 a +10.
  return clampScore(base + (stars - 3) * 5);
}

type AnalisarResponse = { intencao?: unknown; sentimento?: unknown };

/**
 * Classifica a mensagem via leadvitta-nlp. Devolve null em qualquer falha
 * (serviço offline, timeout/cold start, JSON inválido) para o chamador cair no
 * fallback LLM.
 */
export async function classificarViaNlpService(
  texto: string,
): Promise<NlpClassification | null> {
  if (!nlpServiceUrl) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(`${nlpServiceUrl}/analisar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto }),
      signal: controller.signal,
    });
    if (!resp.ok) return null;

    const data = (await resp.json()) as AnalisarResponse;
    const rawIntent =
      typeof data.intencao === "string"
        ? data.intencao.trim().toLowerCase()
        : "";
    const intent = validarIntent(INTENT_MAP[rawIntent]);
    const sentiment = validarSentiment(data.sentimento);
    const score = scoreFromNlp(intent, sentiment);

    // score é derivado de intent, então basta checar intent + sentiment.
    if (!intent && !sentiment) return null;
    return { intent, sentiment, score };
  } catch (err) {
    console.warn(
      "[nlp-service] falhou, usando fallback:",
      err instanceof Error ? err.message : err,
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}
