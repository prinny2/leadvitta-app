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
    const expected =
      "sha256=" + crypto.createHmac("sha256", appSecret).update(raw).digest("hex");
    const valid =
      sig.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!valid) {
      console.warn("[whatsapp] assinatura inválida no webhook");
      return new NextResponse("invalid signature", { status: 403 });
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
