import {
  jsonNoStore,
  enforceRateLimit,
  readJsonBody,
  rejectCrossOriginRequest,
} from "@/lib/api-security";
import { auditarCompliance } from "@/lib/ai/provider";
import type { AuditoriaInput } from "@/lib/types";

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
    const parsed = await readJsonBody<Partial<AuditoriaInput>>(req, 16_384);
    if (parsed.error) return parsed.error;

    const body = parsed.data ?? {};
    const texto = String(body.texto ?? "").trim();

    if (!texto) {
      return jsonNoStore(
        { error: "Cole o texto que você quer revisar." },
        { status: 400 },
      );
    }

    const providerChain = Array.isArray(body.providerChain)
      ? body.providerChain.filter(
          (p): p is "openai" | "anthropic" | "gemini" =>
            p === "openai" || p === "anthropic" || p === "gemini",
        )
      : undefined;

    const result = await auditarCompliance({
      texto,
      clinica: body.clinica,
      providerChain: providerChain?.length ? providerChain : undefined,
    });

    return jsonNoStore(result);
  } catch (err: unknown) {
    console.error("[api/compliance] erro fatal:", err);
    return jsonNoStore({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
