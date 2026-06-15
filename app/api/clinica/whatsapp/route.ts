import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { reivindicarNumero, liberarNumero } from "@/lib/numeros";
import { enforceRateLimit, rejectCrossOriginRequest } from "@/lib/api-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Conecta um número de WhatsApp à clínica logada, com unicidade garantida
 * (um número pertence a no máximo uma conta). É por aqui que o fluxo do
 * 360dialog (embedded signup) vai gravar o número da clínica no futuro.
 * Body: { numero, firebaseIdToken }
 */
export async function POST(req: Request) {
  const originError = rejectCrossOriginRequest(req);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(req, {
    bucket: "clinica-whatsapp",
    limit: 20,
    windowMs: 10 * 60_000,
  });
  if (rateLimitError) return rateLimitError;

  let body: { numero?: string; firebaseIdToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const decoded = await verifyFirebaseIdToken(body.firebaseIdToken);
  if (!decoded) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Número vazio = desconectar (libera o número no mapa canônico).
  const bruto = (body.numero ?? "").trim();
  const r = bruto
    ? await reivindicarNumero(decoded.uid, bruto)
    : await liberarNumero(decoded.uid);
  if (r.ok) return NextResponse.json({ ok: true, numero: r.numero });
  if (r.motivo === "em_uso") {
    return NextResponse.json(
      { error: "Esse número já está conectado a outra conta." },
      { status: 409 }
    );
  }
  if (r.motivo === "vazio") {
    return NextResponse.json({ error: "Informe um número válido." }, { status: 400 });
  }
  return NextResponse.json(
    { error: "Não foi possível salvar o número agora." },
    { status: 500 }
  );
}
