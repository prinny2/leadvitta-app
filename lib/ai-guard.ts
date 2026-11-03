/**
 * Teto diário de chamadas de IA (o custo é por chamada). Contadores em memória,
 * por processo — a VPS roda um só; reiniciar zera. Dia = meia-noite de São Paulo.
 * Ajustável por env no app.env da VPS:
 *   AI_ANON_DAILY_LIMIT=30     sem login, por IP (4G usa IP compartilhado), todas as rotas
 *   AI_USER_DAILY_LIMIT=300    por conta (vale também para pagante: anti-abuso)
 *   AI_GLOBAL_DAILY_LIMIT=3000 total do processo; ao bater, loga e recusa todos
 */
import { jsonNoStore, getClientIp } from "@/lib/api-security";

type AiDailyLimitOptions = { uid?: string | null; paid?: boolean };

const counters = new Map<string, number>();
const globalCounters = new Map<string, number>();
const globalWarnings = new Set<string>();
const SAO_PAULO_OFFSET_MS = 3 * 60 * 60 * 1000;

function positiveLimit(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function saoPauloDay(now: number) {
  return new Date(now - SAO_PAULO_OFFSET_MS).toISOString().slice(0, 10);
}

function secondsUntilSaoPauloMidnight(now: number, day: string) {
  const [year, month, date] = day.split("-").map(Number);
  const nextMidnightUtc = Date.UTC(year, month - 1, date + 1) + SAO_PAULO_OFFSET_MS;
  return Math.max(1, Math.ceil((nextMidnightUtc - now) / 1000));
}

function prunePreviousDays(day: string) {
  for (const key of counters.keys()) {
    if (!key.startsWith(`${day}:`)) counters.delete(key);
  }
  for (const key of globalCounters.keys()) {
    if (key !== day) globalCounters.delete(key);
  }
  for (const key of globalWarnings) {
    if (key !== day) globalWarnings.delete(key);
  }
}

export function enforceAiDailyLimit(
  request: Request,
  { uid }: AiDailyLimitOptions = {}
) {
  const now = Date.now();
  const day = saoPauloDay(now);
  prunePreviousDays(day);

  const globalLimit = positiveLimit("AI_GLOBAL_DAILY_LIMIT", 3000);
  const globalCount = globalCounters.get(day) ?? 0;
  if (globalCount >= globalLimit) {
    if (!globalWarnings.has(day)) {
      console.error("[ai-guard] limite global diário atingido");
      globalWarnings.add(day);
    }
    return rejection(now, day);
  }

  const identity = uid ? `uid:${uid}` : `ip:${getClientIp(request)}`;
  const limit = uid
    ? positiveLimit("AI_USER_DAILY_LIMIT", 300)
    : positiveLimit("AI_ANON_DAILY_LIMIT", 30);
  const key = `${day}:${identity}`;
  const count = counters.get(key) ?? 0;
  if (count >= limit) return rejection(now, day);

  counters.set(key, count + 1);
  globalCounters.set(day, globalCount + 1);
  return null;
}

function rejection(now: number, day: string) {
  return jsonNoStore(
    {
      error: "Limite diário de respostas atingido. Tente de novo amanhã.",
      dailyLimit: true,
    },
    {
      status: 429,
      headers: { "Retry-After": String(secondsUntilSaoPauloMidnight(now, day)) },
    }
  );
}

export function __resetAiGuardForTests() {
  counters.clear();
  globalCounters.clear();
  globalWarnings.clear();
}
