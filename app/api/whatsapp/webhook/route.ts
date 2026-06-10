import { NextResponse, after } from "next/server";
import crypto from "crypto";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { gerarRespostas } from "@/lib/ai/provider";
import { sendWhatsAppText } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET = verificação do webhook. A Meta chama UMA vez ao configurar o webhook.
// Devolve o hub.challenge se o verify_token bater com WHATSAPP_VERIFY_TOKEN.
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

// Status de billing que liberam a auto-resposta. O checkout grava "paid"
// (payment_status) e os eventos de subscription gravam "active"/"trialing"
// — aceitar só "active" deixaria de fora quem acabou de pagar.
const STATUS_ATIVOS = new Set(["active", "paid", "trialing"]);

// Processa a mensagem FORA do caminho da resposta HTTP (ver POST). Nunca lança:
// loga e retorna, pra não derrubar o ack de 200 pra Meta.
async function processarMensagem(value: any, msg: any) {
  const from: string = msg.from; // número da cliente (E.164 sem '+')
  const text: string = msg.text?.body ?? "";
  const displayPhoneNumber: string | undefined =
    value?.metadata?.display_phone_number;

  // Guarda: sem número de destino ou sem texto, não há o que fazer.
  if (!displayPhoneNumber || !text) {
    console.warn("[whatsapp] sem display_phone_number ou texto — ignorando.");
    return;
  }

  const db = getFirebaseAdminDb();
  if (!db) {
    console.warn("[whatsapp] Firestore Admin não configurado — ignorando.");
    return;
  }

  // Acha a clínica dona deste número. O DNA guarda o número no campo root
  // `whatsapp` (ver lib/types.ts / saveClinica em lib/store.ts).
  // Modelo: 1 número de WhatsApp por clínica.
  const snapshot = await db
    .collection("clinicas")
    .where("whatsapp", "==", displayPhoneNumber)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.warn(
      `[whatsapp] nenhuma clínica para o número ${displayPhoneNumber}.`
    );
    return;
  }

  const clinica = snapshot.docs[0].data() as Record<string, any>;
  const clinicaId = snapshot.docs[0].id;

  // Billing: aceita os status que significam pago/ativo (ver STATUS_ATIVOS).
  if (!STATUS_ATIVOS.has(clinica.billing?.status)) {
    console.warn(
      `[whatsapp] clínica ${clinicaId} sem plano ativo (status=${clinica.billing?.status}).`
    );
    return;
  }

  // Gera a resposta com o DNA REAL da clínica (campos root do documento).
  const nlp = await gerarRespostas({
    modo: "gerar",
    objetivo:
      "responder à dúvida do cliente via WhatsApp de forma consultiva e empática",
    nomeCliente: value?.contacts?.[0]?.profile?.name || "Cliente",
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

  // Envia e registra o resultado (sendWhatsAppText não lança; devolve {ok}).
  const envio = await sendWhatsAppText(from, respostaFinal);
  if (!envio.ok) {
    console.error(
      `[whatsapp] falha ao enviar para ${from}: status=${envio.status}`,
      envio.data
    );
  }

  // Salva no MESMO histórico que a página /historico lê: coleção top-level
  // `historico`, com user_id = id da clínica e created_at em ISO (como o
  // resto do app — ver lib/store.ts). `entregue` marca se o envio funcionou.
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

// POST = mensagens recebidas. Valida a assinatura, responde 200 NA HORA e
// processa em background com after() — senão a Meta re-tenta e a cliente
// recebe a resposta duplicada.
export async function POST(req: Request) {
  const raw = await req.text();

  // Valida a assinatura do Meta (X-Hub-Signature-256) quando há WHATSAPP_APP_SECRET.
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (appSecret) {
    const sig = req.headers.get("x-hub-signature-256") || "";
    const expected =
      "sha256=" + crypto.createHmac("sha256", appSecret).update(raw).digest("hex");
    const valid =
      sig.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!valid) {
      console.warn("[whatsapp] assinatura inválida no webhook.");
      return new NextResponse("invalid signature", { status: 403 });
    }
  }

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }

  const value = body?.entry?.[0]?.changes?.[0]?.value;
  const msg = value?.messages?.[0];

  if (msg?.type === "text") {
    // Ack imediato pra Meta; o trabalho pesado (IA + envio + Firestore) roda
    // depois da resposta, fora do caminho crítico.
    after(() =>
      processarMensagem(value, msg).catch((e) =>
        console.error("[whatsapp] erro no processamento:", e)
      )
    );
  } else if (msg) {
    console.log(`[whatsapp] tipo de mensagem não-texto ignorado: ${msg.type}`);
  }

  // Responder 200 rápido SEMPRE — senão a Meta re-tenta e duplica.
  return NextResponse.json({ ok: true });
}
