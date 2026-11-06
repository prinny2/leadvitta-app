import { jsonNoStore, enforceRateLimit, readJsonBody, rejectCrossOriginRequest } from "@/lib/api-security";
import { gerarFollowUp } from "@/lib/ai/provider";
import type { FollowUpInput } from "@/lib/types";
import { verifyFirebaseIdToken, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { reserveGeneration, releaseGeneration } from "@/lib/usage-limit";
import { TRIAL_ENDED_MESSAGE } from "@/lib/free-limit";
import { enforceAiDailyLimit } from "@/lib/ai-guard";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const originError = rejectCrossOriginRequest(req);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(req, {
    bucket: "api-follow-up",
    limit: 20,
    windowMs: 60_000,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const parsed = await readJsonBody<Partial<FollowUpInput> & { firebaseIdToken?: string }>(req, 16_384);
    if (parsed.error) return parsed.error;

    const body = parsed.data ?? {};

    if (!body?.gatilho) {
      return jsonNoStore(
        { error: "Escolha há quanto tempo a cliente sumiu." },
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
        error: TRIAL_ENDED_MESSAGE,
        limitReached: true,
        freeRemaining: 0,
      }, { status: 402 });
    }

    const dailyLimit = enforceAiDailyLimit(req, { uid: decoded?.uid, paid: limit?.paid });
    if (dailyLimit) {
      if (decoded?.uid && limit?.reserved) await releaseGeneration(decoded.uid);
      return dailyLimit;
    }

    let result;
    try {
      result = await gerarFollowUp({
        gatilho: body.gatilho,
        contexto: body.contexto ?? "",
        detalhe: body.detalhe ?? "",
        procedimento: body.procedimento ?? "",
        tom: body.tom ?? "acolhedor",
        nomeCliente: body.nomeCliente,
        clinica: body.clinica,
      });
    } catch (err) {
      if (decoded?.uid && limit?.reserved) await releaseGeneration(decoded.uid);
      throw err;
    }

    const freeRemaining = limit?.reserved ? limit.remaining : undefined;
    return jsonNoStore(freeRemaining === undefined ? result : { ...result, freeRemaining });
  } catch (err: unknown) {
    console.error("[api/follow-up] erro fatal:", err);
    return jsonNoStore(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
