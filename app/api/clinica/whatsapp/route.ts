import { NextResponse } from "next/server";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { reivindicarNumero, liberarNumero } from "@/lib/numeros";
import { enforceRateLimit, readJsonBody, rejectCrossOriginRequest } from "@/lib/api-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Conecta um número de WhatsApp à clínica logada, com unicidade garantida
 * (um número pertence a no máximo uma conta). É por aqui que o fluxo do
 * Z-API: grava o número da clínica no mapa canônico (numeros_whatsapp).
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

  type WhatsAppBody = {
    numero?: string;
    zapi_instance_id?: string;
    zapi_token?: string;
    zapi_client_token?: string;
    firebaseIdToken?: string;
  };
  const parsed = await readJsonBody<WhatsAppBody>(req, 4_096);
  if (parsed.error) return parsed.error;
  const body = parsed.data ?? {};

  const decoded = await verifyFirebaseIdToken(body.firebaseIdToken);
  if (!decoded) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const bruto = (body.numero ?? "").trim();
  const zapiInstance = (body.zapi_instance_id ?? "").trim();
  const zapiToken = (body.zapi_token ?? "").trim();
  const zapiClient = (body.zapi_client_token ?? "").trim();

  // Update number claim
  const r = bruto
    ? await reivindicarNumero(decoded.uid, bruto)
    : await liberarNumero(decoded.uid);

  if (!r.ok) {
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

  // Save ZAPI creds and number to clinica (server only for secrets ideally)
  const db = getFirebaseAdminDb();
  if (db) {
    const update: any = { whatsapp: r.numero || "" };
    if (zapiInstance) update.zapi_instance_id = zapiInstance;
    if (zapiToken) update.zapi_token = zapiToken;
    if (zapiClient) update.zapi_client_token = zapiClient;
    await db.collection("clinicas").doc(decoded.uid).set(update, { merge: true });
  }

  // AUTOMATION: if ZAPI creds provided, auto-configure the webhook for this clinic's instance
  if (zapiInstance && zapiToken && r.numero) {
    try {
      await setupZapiWebhookForInstance(zapiInstance, zapiToken, zapiClient);
      console.log(`[zapi-auto] webhook configurado para instância ${zapiInstance}`);
    } catch (e) {
      console.error("[zapi-auto] falha ao configurar webhook:", e);
      // Não falha o save do número, o usuário pode configurar manualmente
    }
  }

  return NextResponse.json({ ok: true, numero: r.numero });
}

async function setupZapiWebhookForInstance(
  instance: string,
  token: string,
  clientToken?: string
) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.leadbellus.com.br";
  let webhookUrl = `${site}/api/whatsapp/webhook`;

  const security = process.env.ZAPI_SECURITY_TOKEN;
  if (security) {
    const u = new URL(webhookUrl);
    u.searchParams.set("token", security);
    webhookUrl = u.toString();
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (clientToken) headers["Client-Token"] = clientToken;

  const endpoints = ["update-webhook-received", "update-every-webhooks"];
  const methods = ["PUT", "POST"];

  for (const ep of endpoints) {
    for (const m of methods) {
      const res = await fetch(
        `https://api.z-api.io/instances/${instance}/token/${token}/${ep}`,
        {
          method: m,
          headers,
          body: JSON.stringify({ value: webhookUrl }),
        }
      );
      if (res.ok) return; // success
    }
  }
  throw new Error("Nenhum endpoint Z-API aceitou o webhook");
}
