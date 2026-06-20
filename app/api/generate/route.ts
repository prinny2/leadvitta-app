import { jsonNoStore, enforceRateLimit, readJsonBody, rejectCrossOriginRequest } from "@/lib/api-security";
import { gerarRespostas, refinarResposta } from "@/lib/ai/provider";
import type { GerarInput, RefineInput } from "@/lib/types";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { checkGenerationLimit, incrementFreeUsage } from "@/lib/usage-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const originError = rejectCrossOriginRequest(req);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(req, {
    bucket: "api-generate",
    limit: 30,
    windowMs: 60_000,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const parsed = await readJsonBody<
      Partial<GerarInput & RefineInput & { acao?: string }>
    >(req, 32_768);
    if (parsed.error) return parsed.error;

    const body = parsed.data ?? {};

    // Ação: "Melhorar essa resposta" (refina uma variante).
    if (body?.acao === "refinar") {
      if (!body.respostaAtual || !body.variante) {
        return jsonNoStore(
          { error: "Resposta atual e variante são obrigatórias." },
          { status: 400 }
        );
      }
      const r = await refinarResposta({
        variante: body.variante,
        respostaAtual: String(body.respostaAtual),
        procedimento: body.procedimento ?? "",
        situacao: body.situacao ?? "",
        tom: body.tom ?? "acolhedor",
        objetivo: body.objetivo ?? "",
        perfilCliente: body.perfilCliente,
        nomeCliente: body.nomeCliente,
        mensagemCliente: body.mensagemCliente ?? "",
        clinica: body.clinica,
      });
      return jsonNoStore(r);
    }

    if (!body?.mensagemCliente || !String(body.mensagemCliente).trim()) {
      return jsonNoStore(
        { error: "Informe a mensagem da cliente." },
        { status: 400 }
      );
    }

    // Plano grátis: usuário LOGADO grátis tem limite; pagante é ilimitado.
    // Sem token (ex.: demo pública da landing) não conta nem bloqueia.
    const token = (body as { firebaseIdToken?: string }).firebaseIdToken;
    const decoded = await verifyFirebaseIdToken(token);
    let limit = null as Awaited<ReturnType<typeof checkGenerationLimit>> | null;
    if (decoded?.uid) {
      limit = await checkGenerationLimit(decoded.uid);
      if (!limit.allowed) {
        return jsonNoStore(
          {
            error:
              "Você usou suas respostas grátis. Assine o Start pra continuar gerando respostas ilimitadas.",
            limitReached: true,
            freeRemaining: 0,
          },
          { status: 402 }
        );
      }
    }

    const result = await gerarRespostas({
      modo: body.modo === "reescrever" ? "reescrever" : "gerar",
      procedimento: body.procedimento ?? "",
      situacao: body.situacao ?? "",
      tom: body.tom ?? "acolhedor",
      objetivo: body.objetivo ?? "",
      perfilCliente: body.perfilCliente,
      oQueMelhorar: body.oQueMelhorar,
      nomeCliente: body.nomeCliente,
      mensagemCliente: String(body.mensagemCliente),
      clinica: body.clinica,
    });

    // Conta a geração grátis só após sucesso (pagante nunca conta).
    let freeRemaining: number | undefined;
    if (decoded?.uid && limit && !limit.paid) {
      await incrementFreeUsage(decoded.uid);
      freeRemaining = Math.max(0, limit.remaining - 1);
    }

    return jsonNoStore(
      freeRemaining === undefined ? result : { ...result, freeRemaining }
    );
  } catch (err: unknown) {
    console.error("[api/generate] erro fatal:", err);
    return jsonNoStore(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
