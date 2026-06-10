import { jsonNoStore, enforceRateLimit, readJsonBody, rejectCrossOriginRequest } from "@/lib/api-security";
import { gerarRespostas, refinarResposta } from "@/lib/ai/provider";
import type { GerarInput, RefineInput } from "@/lib/types";

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

    return jsonNoStore(result);
  } catch (err: unknown) {
    console.error("[api/generate] erro fatal:", err);
    return jsonNoStore(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
