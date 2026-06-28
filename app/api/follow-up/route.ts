import {
  jsonNoStore,
  enforceRateLimit,
  readJsonBody,
  rejectCrossOriginRequest,
} from "@/lib/api-security";
import { gerarFollowUp } from "@/lib/ai/provider";
import type { FollowUpInput } from "@/lib/types";

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
    const parsed = await readJsonBody<Partial<FollowUpInput>>(req, 16_384);
    if (parsed.error) return parsed.error;

    const body = parsed.data ?? {};

    if (!body?.gatilho) {
      return jsonNoStore(
        { error: "Escolha há quanto tempo a cliente sumiu." },
        { status: 400 },
      );
    }

    const result = await gerarFollowUp({
      gatilho: body.gatilho,
      contexto: body.contexto ?? "",
      detalhe: body.detalhe ?? "",
      procedimento: body.procedimento ?? "",
      tom: body.tom ?? "acolhedor",
      nomeCliente: body.nomeCliente,
      clinica: body.clinica,
    });

    return jsonNoStore(result);
  } catch (err: unknown) {
    console.error("[api/follow-up] erro fatal:", err);
    return jsonNoStore({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
