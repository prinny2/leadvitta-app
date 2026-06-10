import { NextResponse } from "next/server";
import crypto from "crypto";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { gerarRespostas } from "@/lib/ai/provider";
import { sendWhatsAppText } from "@/lib/whatsapp";

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

    if (msg?.type === "text") {
      const from: string = msg.from; // número da cliente (E.164 sem '+')
      const text: string = msg.text?.body;
      const displayPhoneNumber = value?.metadata?.display_phone_number;

      console.log(`[whatsapp] recebida de ${from} para ${displayPhoneNumber}: ${text}`);

      // 1. Localiza a clínica pelo número de telefone (multi-tenant)
      const db = getFirebaseAdminDb();
      if (!db) throw new Error("Firestore Admin não configurado.");

      const snapshot = await db
        .collection("clinicas")
        .where("config.whatsapp_numero", "==", displayPhoneNumber)
        .limit(1)
        .get();

      if (snapshot.empty) {
        console.warn(`[whatsapp] nenhuma clínica encontrada para o número ${displayPhoneNumber}`);
        return NextResponse.json({ ok: true });
      }

      const clinicaData = snapshot.docs[0].data();
      const clinicaId = snapshot.docs[0].id;

      // 2. Verifica se a clínica tem plano ativo
      if (clinicaData.billing?.status !== "active") {
        console.warn(`[whatsapp] clínica ${clinicaId} está com billing inativo.`);
        return NextResponse.json({ ok: true });
      }

      // 3. Gera resposta via IA com o DNA da clínica
      const nlp = await gerarRespostas({
        modo: "gerar",
        objetivo: "responder à dúvida do cliente via WhatsApp de forma consultiva e empática",
        nomeCliente: value?.contacts?.[0]?.profile?.name || "Cliente",
        mensagemCliente: text,
        procedimento: "geral", // Idealmente extrair do texto
        situacao: "pergunta_geral",
        tom: clinicaData.config?.tom || "acolhedor",
        clinica: {
          nome_clinica: clinicaData.nome || "LeadBellus",
          formalidade: clinicaData.config?.formalidade ?? 50,
          como_chamar: clinicaData.config?.como_chamar || "nenhum",
          cta_preferido: clinicaData.config?.cta_preferido || "agendar uma avaliação",
        },
      });

      // 4. Responde no WhatsApp (usa a variante consultiva como padrão para o bot)
      const respostaFinal = nlp.respostas.consultiva;
      await sendWhatsAppText(from, respostaFinal);

      // 5. Salva no histórico da clínica
      await db.collection("clinicas").doc(clinicaId).collection("historico").add({
        tipo: "whatsapp",
        origem: "cliente",
        de: from,
        texto: text,
        resposta: respostaFinal,
        timestamp: new Date(),
        nlp: {
          intent: nlp.intent,
          sentiment: nlp.sentiment,
          score: nlp.score,
        },
      });

      console.log(`[whatsapp] resposta enviada para ${from} (Clínica: ${clinicaId})`);
    }
  } catch (e) {
    console.error("[whatsapp] erro no processamento:", e);
  }

  // Responder 200 rápido sempre — senão a Meta re-tenta e duplica.
  return NextResponse.json({ ok: true });
}
