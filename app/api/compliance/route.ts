import { jsonNoStore, enforceRateLimit, parseProviderChain, readJsonBody, rejectCrossOriginRequest } from "@/lib/api-security";
import { auditarCompliance } from "@/lib/ai/provider";
import type { AuditoriaInput } from "@/lib/types";
import { verifyFirebaseIdToken, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { reserveGeneration, releaseGeneration } from "@/lib/usage-limit";
import { enforceAiDailyLimit } from "@/lib/ai-guard";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const originError = rejectCrossOriginRequest(req);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(req, {
    bucket: "api-compliance",
    limit: 30,
    windowMs: 60_000,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const parsed = await readJsonBody<Partial<AuditoriaInput> & { firebaseIdToken?: string }>(req, 16_384);
    if (parsed.error) return parsed.error;

    const body = parsed.data ?? {};
    const texto = String(body.texto ?? "").trim();

    if (!texto) {
      return jsonNoStore(
        { error: "Cole o texto que você quer revisar." },
        { status: 400 }
      );
    }

    const token = body.firebaseIdToken;
    const decoded = await verifyFirebaseIdToken(token);
    if (token && !decoded?.uid && isFirebaseAdminConfigured()) {
      return jsonNoStore(
        { error: "Sessão expirada. Entre novamente para continuar.", reauth: true },
        { status: 401 }
      );
    }

    const limit = decoded?.uid ? await reserveGeneration(decoded.uid) : null;
    if (limit && !limit.allowed) {
      return jsonNoStore({
        error: "Você usou suas respostas grátis. Assine o Start pra continuar gerando respostas ilimitadas.",
        limitReached: true,
        freeRemaining: 0,
      }, { status: 402 });
    }

    const dailyLimit = enforceAiDailyLimit(req, { uid: decoded?.uid, paid: limit?.paid });
    if (dailyLimit) {
      if (decoded?.uid && limit?.reserved) await releaseGeneration(decoded.uid);
      return dailyLimit;
    }

    const providerChain = parseProviderChain(body.providerChain);

    let result;
    try {
      result = await auditarCompliance({
        texto,
        clinica: body.clinica,
        providerChain: providerChain?.length ? providerChain : undefined,
      });
    } catch (err) {
      if (decoded?.uid && limit?.reserved) await releaseGeneration(decoded.uid);
      throw err;
    }

    const freeRemaining = limit?.reserved ? Math.max(0, limit.remaining - 1) : undefined;
    return jsonNoStore(freeRemaining === undefined ? result : { ...result, freeRemaining });
  } catch (err: unknown) {
    console.error("[api/compliance] erro fatal:", err);
    return jsonNoStore({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
