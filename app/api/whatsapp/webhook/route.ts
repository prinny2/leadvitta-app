import { NextResponse, after } from "next/server";
import crypto from "crypto";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { gerarRespostas } from "@/lib/ai/provider";
import { sendWhatsAppText } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Status de billing que liberam a auto-resposta.
const STATUS_ATIVOS = new Set(["active", "paid", "trialing"]);

/**
 * Valida o header X-Twilio-Signature.
 * Algoritmo: Base64(HMAC-SHA1(authToken, url + sorted_params_concatenated))
 */
function validateTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys.map((k) => k + params[k]).join("");
  const validationString = url + paramString;

  const expected = crypto
    .createHmac("sha1", authToken)
    .update(validationString, "utf8")
    .digest("base64");

  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

/** Processa a mensagem fora do caminho HTTP para não atrasar o ACK 200 ao Twilio. */
async function processarMensagem(from: string, to: string, text: string) {
  if (!text) {
    console.warn("[whatsapp] mensagem sem texto — ignorando.");
    return;
  }

  const db = getFirebaseAdminDb();
  if (!db) {
    console.warn("[whatsapp] Firestore Admin não configurado — ignorando.");
    return;
  }

  // Remove o prefixo "whatsapp:" do número para lookup no Firestore.
  // Ex.: "whatsapp:+5591985156690" → "5591985156690"
  const displayPhoneNumber = to.replace(/^whatsapp:\+?/, "");

  const snapshot = await db
    .collection("clinicas")
    .where("whatsapp", "==", displayPhoneNumber)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.warn(`[whatsapp] nenhuma clínica para o número ${displayPhoneNumber}.`);
    return;
  }

  const clinica = snapshot.docs[0].data() as Record<string, any>;
  const clinicaId = snapshot.docs[0].id;

  if (!STATUS_ATIVOS.has(clinica.billing?.status)) {
    console.warn(
      `[whatsapp] clínica ${clinicaId} sem plano ativo (status=${clinica.billing?.status}).`
    );
    return;
  }

  const nlp = await gerarRespostas({
    modo: "gerar",
    objetivo: "responder à dúvida do cliente via WhatsApp de forma consultiva e empática",
    nomeCliente: "Cliente",
    mensagemCliente: text,
    procedimento: "geral",
    situacao: "pergunta_geral",
    tom: clinica.tom_padrao || "acolhedor",
    clinica: {
      nome_clinica: clinica.nome_clinica || "LeadBellus",
      formalidade: clinica.formalidade ?? 50,
      como_chamar: clinica.como_chamar || "nenhum",
      cta_preferido: clinica.cta_preferido || "agendar uma avaliação",
    },
  });

  const respostaFinal = nlp.respostas.consultiva;

  // "from" é o número do cliente (quem enviou) — é para quem respondemos.
  const envio = await sendWhatsAppText(from, respostaFinal);
  if (!envio.ok) {
    console.error(
      `[whatsapp] falha ao enviar para ${from}: status=${envio.status}`,
      envio.data
    );
  }

  await db.collection("historico").add({
    user_id: clinicaId,
    tipo: "gerador",
    contexto: {
      canal: "whatsapp",
      de: from,
      mensagemCliente: text,
      entregue: envio.ok,
    },
    respostas: [respostaFinal],
    favorito: false,
    created_at: new Date().toISOString(),
    intent: nlp.intent ?? null,
    sentiment: nlp.sentiment ?? null,
    score: nlp.score ?? null,
  });

  console.log(
    `[whatsapp] resposta ${envio.ok ? "enviada" : "FALHOU"} para ${from} (clínica ${clinicaId}).`
  );
}

// Twilio não usa GET/hub.challenge — apenas POST.
export async function POST(req: Request) {
  const raw = await req.text();

  // Valida assinatura Twilio quando AUTH TOKEN está configurado.
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (authToken) {
    const signature = req.headers.get("x-twilio-signature") || "";
    // Usa o host real que Twilio chamou (X-Forwarded-Host via Firebase Hosting / Cloud Run).
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const fullUrl = host
      ? `${proto}://${host}/api/whatsapp/webhook`
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/whatsapp/webhook`;

    // Reconstrói os params do body para validação.
    const params: Record<string, string> = {};
    new URLSearchParams(raw).forEach((v, k) => { params[k] = v; });

    if (signature && !validateTwilioSignature(authToken, fullUrl, params, signature)) {
      console.warn("[whatsapp] assinatura Twilio inválida.");
      return new NextResponse("invalid signature", { status: 403 });
    }
  }

  const params = new URLSearchParams(raw);
  const from = params.get("From") ?? "";  // "whatsapp:+5591985156690"
  const to = params.get("To") ?? "";      // "whatsapp:+14155238886" (seu número Twilio)
  const body = params.get("Body") ?? "";

  if (from && body) {
    after(() =>
      processarMensagem(from, to, body).catch((e) =>
        console.error("[whatsapp] erro no processamento:", e)
      )
    );
  }

  // Twilio espera um 200 vazio (ou TwiML) — resposta JSON é ignorada por ele.
  return new NextResponse("", { status: 200 });
}
