import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET = verificação do webhook. A Meta chama UMA vez quando você configura o webhook
// no painel (WhatsApp -> Configuration -> Webhook). Tem que devolver o hub.challenge
// se o verify_token bater com o WHATSAPP_VERIFY_TOKEN do env.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("forbidden", { status: 403 });
}

// POST = mensagens recebidas. A Meta envia os eventos (mensagens das clientes) aqui.
export async function POST(req: Request) {
  const raw = await req.text();

  // Valida a assinatura do Meta (X-Hub-Signature-256) quando WHATSAPP_APP_SECRET existe.
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (appSecret) {
    const sig = req.headers.get("x-hub-signature-256") || "";
    if (!sig) {
      console.warn("[whatsapp] assinatura ausente no webhook");
      return new NextResponse("signature missing", { status: 401 });
    }

    const hmac = crypto.createHmac("sha256", appSecret);
    const digest = "sha256=" + hmac.update(raw).digest("hex");
    
    // timingSafeEqual requer buffers de mesmo tamanho.
    try {
      const sigBuffer = Buffer.from(sig);
      const digestBuffer = Buffer.from(digest);
      if (sigBuffer.length !== digestBuffer.length || !crypto.timingSafeEqual(sigBuffer, digestBuffer)) {
        console.warn("[whatsapp] assinatura inválida no webhook");
        return new NextResponse("invalid signature", { status: 401 });
      }
    } catch (e) {
      console.error("[whatsapp] erro ao validar assinatura:", e);
      return new NextResponse("signature validation error", { status: 500 });
    }
  }

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const msg = value?.messages?.[0];
    if (msg) {
      const from: string = msg.from; // número da cliente (E.164 sem '+')
      const text: string = msg.text?.body ?? `[${msg.type}]`;
      console.log("[whatsapp] recebida de", from, ":", text);

      // PRÓXIMO PASSO (atendente IA): gerar resposta no tom da clínica e responder:
      //   import { gerarRespostas } from "@/lib/ai/provider";
      //   import { sendWhatsAppText } from "@/lib/whatsapp";
      //   const r = await gerarRespostas({ ...contextoDaClinica, mensagemCliente: text });
      //   await sendWhatsAppText(from, r.respostas.consultiva);
      // (precisa mapear qual clínica é dona deste número — multi-tenant.)
    }
  } catch (e) {
    console.error("[whatsapp] erro no webhook:", e);
  }

  // Responder 200 rápido sempre — senão a Meta re-tenta e duplica.
  return NextResponse.json({ ok: true });
}
