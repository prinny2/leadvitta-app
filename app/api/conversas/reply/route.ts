import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { getWhatsAppProvider } from "@/lib/whatsapp";
import {
  getConversaServidor,
  registrarMensagemEnviada,
  getCanalClinica,
} from "@/lib/conversas";
import { enforceRateLimit, rejectCrossOriginRequest } from "@/lib/api-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Envia uma resposta manual da clínica para a cliente, de dentro do inbox.
 * Body: { conversaId, texto, firebaseIdToken }
 * Segurança: só o dono da conversa (uid == clinica_id) pode responder.
 */
export async function POST(req: Request) {
  const originError = rejectCrossOriginRequest(req);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(req, {
    bucket: "conversas-reply",
    limit: 30,
    windowMs: 10 * 60_000,
  });
  if (rateLimitError) return rateLimitError;

  let body: { conversaId?: string; texto?: string; firebaseIdToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { conversaId, texto, firebaseIdToken } = body;
  if (!conversaId || !texto?.trim()) {
    return NextResponse.json(
      { error: "conversaId e texto são obrigatórios." },
      { status: 400 },
    );
  }

  const decoded = await verifyFirebaseIdToken(firebaseIdToken);
  if (!decoded) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const conversa = await getConversaServidor(conversaId);
  if (!conversa) {
    return NextResponse.json(
      { error: "Conversa não encontrada." },
      { status: 404 },
    );
  }
  if (conversa.clinica_id !== decoded.uid) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const channelApiKey = await getCanalClinica(decoded.uid);
  const envio = await getWhatsAppProvider().sendText(
    conversa.cliente_numero,
    texto.trim(),
    {
      channelApiKey,
    },
  );
  if (!envio.ok) {
    return NextResponse.json(
      { error: "Não foi possível enviar agora.", status: envio.status },
      { status: 502 },
    );
  }

  // Resposta manual da clínica zera o "não lida".
  await registrarMensagemEnviada(
    decoded.uid,
    conversa.cliente_numero,
    texto.trim(),
    {
      marcarLida: true,
    },
  );
  return NextResponse.json({ ok: true });
}
