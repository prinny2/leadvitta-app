import { NextResponse } from "next/server";
import { gerarRespostas, refinarResposta } from "@/lib/ai/provider";
import type { GerarInput, RefineInput } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Partial<GerarInput & RefineInput & { acao?: string }>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  // Ação: "Melhorar essa resposta" (refina uma variante).
  if (body?.acao === "refinar") {
    if (!body.respostaAtual || !body.variante) {
      return NextResponse.json(
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
    return NextResponse.json(r);
  }

  if (!body?.mensagemCliente || !String(body.mensagemCliente).trim()) {
    return NextResponse.json(
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

  return NextResponse.json(result);
}
