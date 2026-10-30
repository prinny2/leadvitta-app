import { NextResponse, after } from "next/server";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getWhatsAppProvider } from "@/lib/whatsapp";
import type { InboundMessage } from "@/lib/whatsapp-types";
import { resolverClinicaPorNumero } from "@/lib/numeros";
import {
  registrarMensagemRecebida,
  marcarPrecisaAtencao,
  reservarProcessamento,
  liberarProcessamento,
} from "@/lib/conversas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Guarda a mensagem para revisão humana sem enviar uma resposta automática. */
async function processarMensagem(msg: InboundMessage) {
  if (!msg.text) return;

  const db = getFirebaseAdminDb();
  if (!db) {
    console.warn("[whatsapp] Firestore Admin não configurado — ignorando.");
    return;
  }

  // Idempotência: ignora reentregas do provedor (não duplica msg nem auto-resposta).
  if (!(await reservarProcessamento(msg.providerMessageId))) {
    console.log(`[whatsapp] mensagem ${msg.providerMessageId} já processada — ignorando retry.`);
    return;
  }

  // Descobre a clínica pelo número que RECEBEU, via mapa canônico (único/verificado).
  // Falha de roteamento devolve a reserva: um retry futuro ainda pode processar.
  const clinicaId = await resolverClinicaPorNumero(msg.to);
  if (!clinicaId) {
    console.warn(`[whatsapp] nenhuma clínica conectada ao número ${msg.to}.`);
    await liberarProcessamento(msg.providerMessageId);
    return;
  }
  const clinicaSnap = await db.collection("clinicas").doc(clinicaId).get();
  if (!clinicaSnap.exists) {
    await liberarProcessamento(msg.providerMessageId);
    return;
  }

  await registrarMensagemRecebida({
    clinicaId,
    from: msg.from,
    text: msg.text,
    contactName: msg.contactName,
    providerMessageId: msg.providerMessageId,
  });
  await marcarPrecisaAtencao(clinicaId, msg.from);
  console.log(`[whatsapp] mensagem ${msg.providerMessageId || "sem-id"} registrada para revisão humana.`);
}

export async function GET(req: Request) {
  const provider = getWhatsAppProvider();
  if (provider.name === "meta-cloud") {
    const challenge = provider.webhookChallenge?.(req);
    if (!challenge) return new NextResponse("invalid verification token", { status: 403 });
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("ok", { status: 200 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const provider = getWhatsAppProvider();

  const valido = await provider.validateWebhook(req, raw);
  if (!valido) {
    console.warn(`[whatsapp] webhook recusado (provider=${provider.name}).`);
    return new NextResponse("invalid signature", { status: 403 });
  }

  const inbound = provider.parseInbound(raw, req);
  const messages = !inbound ? [] : Array.isArray(inbound) ? inbound : [inbound];
  if (messages.length) {
    after(() => Promise.all(messages.map((msg) =>
      processarMensagem(msg).catch(async (e) => {
        console.error("[whatsapp] erro no processamento:", e);
        // Crash após a reserva: devolve, senão o retry vira "duplicata" e a
        // mensagem se perde (o provedor já recebeu 200).
        await liberarProcessamento(msg.providerMessageId);
      })
    )));
  }

  // Provedores esperam 200 rápido.
  return new NextResponse("", { status: 200 });
}
