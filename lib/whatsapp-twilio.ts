// Provedor Twilio WhatsApp.
// Credenciais via env:
//   TWILIO_ACCOUNT_SID / TWILIO_API_KEY_SID / TWILIO_API_KEY_SECRET
//   TWILIO_WHATSAPP_FROM ("whatsapp:+14155238886")
//   TWILIO_AUTH_TOKEN (valida o X-Twilio-Signature do webhook)
import crypto from "crypto";
import type {
  WhatsAppProvider,
  WhatsAppResult,
  InboundMessage,
} from "@/lib/whatsapp-types";

function stripPrefix(n: string): string {
  return n.replace(/^whatsapp:/, "").replace(/^\+/, "");
}

/** Base64(HMAC-SHA1(authToken, url + params ordenados concatenados)). */
function validateTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys.map((k) => k + params[k]).join("");
  const expected = crypto
    .createHmac("sha1", authToken)
    .update(url + paramString, "utf8")
    .digest("base64");
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export const twilioProvider: WhatsAppProvider = {
  name: "twilio",

  isConfigured() {
    return (
      !!process.env.TWILIO_ACCOUNT_SID &&
      !!process.env.TWILIO_API_KEY_SID &&
      !!process.env.TWILIO_API_KEY_SECRET &&
      !!process.env.TWILIO_WHATSAPP_FROM
    );
  },

  async validateWebhook(req, rawBody) {
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    // Fail-closed em produção: sem token não há como provar a origem do POST,
    // então recusamos (impede mensagens forjadas). Em dev, libera o teste local.
    if (!authToken) return process.env.NODE_ENV !== "production";

    const signature = req.headers.get("x-twilio-signature") || "";
    if (!signature) return false;

    const params: Record<string, string> = {};
    new URLSearchParams(rawBody).forEach((v, k) => {
      params[k] = v;
    });

    // O Twilio assina a URL EXATA configurada no console. Atrás de proxy
    // (Vercel/Cloud Run) o req.url tem host interno, então reconstruímos pelo
    // x-forwarded-* e aceitamos se QUALQUER candidato validar (www vs apex,
    // domínio custom vs *.run.app — basta um casar com o que foi configurado).
    const reqUrl = new URL(req.url);
    const fwdProto = req.headers.get("x-forwarded-proto") || "https";
    const fwdHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const candidatos = new Set<string>();
    if (fwdHost) {
      candidatos.add(`${fwdProto}://${fwdHost}${reqUrl.pathname}${reqUrl.search}`);
    }
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      candidatos.add(
        `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}${reqUrl.pathname}${reqUrl.search}`
      );
    }
    candidatos.add(reqUrl.href);

    for (const url of candidatos) {
      if (validateTwilioSignature(authToken, url, params, signature)) return true;
    }
    return false;
  },

  parseInbound(rawBody) {
    const params = new URLSearchParams(rawBody);
    const from = params.get("From") ?? "";
    const to = params.get("To") ?? "";
    const text = params.get("Body") ?? "";
    if (!from || !text) return null;
    const msg: InboundMessage = {
      from: stripPrefix(from),
      to: stripPrefix(to),
      text,
      providerMessageId: params.get("MessageSid") ?? undefined,
      contactName: params.get("ProfileName") ?? undefined,
    };
    return msg;
  },

  async sendText(to, body): Promise<WhatsAppResult> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKeySid = process.env.TWILIO_API_KEY_SID;
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
    const from = process.env.TWILIO_WHATSAPP_FROM;

    if (!accountSid || !apiKeySid || !apiKeySecret || !from) {
      return {
        ok: false,
        status: 0,
        data: { error: "Twilio não configurado." },
      };
    }

    const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:+${stripPrefix(to)}`;
    const params = new URLSearchParams({ From: from, To: toFormatted, Body: body });
    const credentials = Buffer.from(`${apiKeySid}:${apiKeySecret}`).toString("base64");
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  },

  async sendImage(): Promise<WhatsAppResult> {
    return { ok: false, status: 501, data: { error: "sendImage não implementado para Twilio." } };
  },

  async sendButtons(): Promise<WhatsAppResult> {
    return { ok: false, status: 501, data: { error: "sendButtons não implementado para Twilio." } };
  },
};
