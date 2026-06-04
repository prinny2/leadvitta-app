import { NextResponse } from "next/server";
import { gerarFollowUp } from "@/lib/ai/provider";
import type { FollowUpInput } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let body: Partial<FollowUpInput>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
    }

    if (!body?.gatilho) {
      return NextResponse.json(
        { error: "Escolha há quanto tempo a cliente sumiu." },
        { status: 400 }
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

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[api/follow-up] erro fatal:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
