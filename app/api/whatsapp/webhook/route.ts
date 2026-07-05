import { NextResponse, after } from "next/server";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { gerarRespostas } from "@/lib/ai/provider";
import { getWhatsAppProvider } from "@/lib/whatsapp";
import type { InboundMessage } from "@/lib/whatsapp-types";
import { resolverClinicaPorNumero } from "@/lib/numeros";
import {
  registrarMensagemRecebida,
  registrarMensagemEnviada,
  marcarPrecisaAtencao,
  reservarProcessamento,
  liberarProcessamento,
} from "@/lib/conversas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Status de billing que liberam a auto-resposta.
const STATUS_ATIVOS = new Set(["active", "paid", "trialing"]);

/** Processa fora do caminho HTTP para não atrasar o ACK ao provedor. */
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
  const clinica = clinicaSnap.data() as Record<string, any>;
  const ativo = STATUS_ATIVOS.has(clinica.billing?.status);

  // Sem plano ativo: guarda a mensagem (aparece no inbox), mas não auto-responde.
  if (!ativo) {
    await registrarMensagemRecebida({
      clinicaId,
      from: msg.from,
      text: msg.text,
      contactName: msg.contactName,
      providerMessageId: msg.providerMessageId,
    });
    console.warn(
      `[whatsapp] clínica ${clinicaId} sem plano ativo (status=${clinica.billing?.status}) — só armazenado.`
    );
    return;
  }

  let nlp: Awaited<ReturnType<typeof gerarRespostas>> | null = null;
  try {
    nlp = await gerarRespostas({
      modo: "gerar",
      objetivo: "responder à dúvida do cliente via WhatsApp de forma consultiva e empática",
      nomeCliente: msg.contactName || "Cliente",
      mensagemCliente: msg.text,
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
  } catch (e) {
    console.error("[whatsapp] falha ao gerar resposta:", e);
  }

  await registrarMensagemRecebida({
    clinicaId,
    from: msg.from,
    text: msg.text,
    contactName: msg.contactName,
    providerMessageId: msg.providerMessageId,
    intent: nlp?.intent ?? null,
    sentiment: nlp?.sentiment ?? null,
    score: nlp?.score ?? null,
  });

  if (!nlp) {
    await marcarPrecisaAtencao(clinicaId, msg.from);
    return;
  }
  const respostaFinal = nlp.respostas.consultiva;

  const envio = await getWhatsAppProvider().sendText(msg.from, respostaFinal, {
    instanceId: clinica.zapi_instance_id,
    token: clinica.zapi_token,
    clientToken: clinica.zapi_client_token,
  });
  if (envio.ok) {
    // Auto-resposta NÃO marca como lida — fica na triagem até um humano abrir.
    await registrarMensagemEnviada(clinicaId, msg.from, respostaFinal, { marcarLida: false });
  } else {
    console.error(
      `[whatsapp] falha ao enviar para ${msg.from}: status=${envio.status}`,
      envio.data
    );
    await marcarPrecisaAtencao(clinicaId, msg.from);
  }

  // Espelho Supabase removido do hot path (custo por mensagem sem leitor);
  // o histórico do WhatsApp vive só no Firestore. A migração completa para
  // Supabase é obra de fundo separada.
  await db.collection("historico").add({
    user_id: clinicaId,
    tipo: "gerador",
    contexto: {
      canal: "whatsapp",
      de: msg.from,
      mensagemCliente: msg.text,
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
    `[whatsapp] resposta ${envio.ok ? "enviada" : "FALHOU"} para ${msg.from} (clínica ${clinicaId}).`
  );
}

// Z-API não usa handshake Meta; GET só confirma que o endpoint está vivo.
export async function GET() {
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

  const msg = provider.parseInbound(raw, req);
  if (msg) {
    after(() =>
      processarMensagem(msg).catch(async (e) => {
        console.error("[whatsapp] erro no processamento:", e);
        // Crash após a reserva: devolve, senão o retry vira "duplicata" e a
        // mensagem se perde (o provedor já recebeu 200).
        await liberarProcessamento(msg.providerMessageId);
      })
    );
  }

  // Provedores esperam 200 rápido.
  return new NextResponse("", { status: 200 });
}
