// Saneamento da classificação (NLP) de mensagens de leads.
//
// Tanto o classificador via LLM (lib/ai/provider.ts) quanto o serviço de ML
// externo (lib/ai/nlp-service.ts) podem devolver intent/sentiment/score fora do
// vocabulário ou da faixa esperada. Esses valores vão pro Firestore e pro
// ranking do inbox, então precisam ser saneados antes de persistir (senão
// corrompem a triagem de leads). Manter aqui evita import circular entre
// provider.ts e nlp-service.ts.

export const INTENTS_VALIDOS = new Set([
  "pergunta_preco",
  "agendamento",
  "duvida_tecnica",
  "objecao",
  "demonstra_interesse",
  "desistencia",
  "outro",
]);

export function clampScore(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function validarIntent(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim().toLowerCase();
  return INTENTS_VALIDOS.has(s) ? s : undefined;
}

export function validarSentiment(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const m = v.trim().match(/^([1-5])\s*stars?$/i);
  return m ? `${m[1]} stars` : undefined;
}
