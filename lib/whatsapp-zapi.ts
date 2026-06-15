// Provedor Z-API (WhatsApp via API Gateway — não-oficial).
// Env:
//   ZAPI_INSTANCE_ID / ZAPI_TOKEN — obrigatórios
//   ZAPI_CLIENT_TOKEN — header Client-Token nas chamadas à API
//   ZAPI_SECURITY_TOKEN — valida webhook (?token= ou x-zapi-token)
import type {
  WhatsAppProvider,
  WhatsAppResult,
  InboundMessage,
} from "@/lib/whatsapp-types";

function onlyDigits(n: string): string {
  return n.replace(/\D/g, "");
}

function baseUrl(): string | null {
  const id = process.env.ZAPI_INSTANCE_ID?.trim();
  const token = process.env.ZAPI_TOKEN?.trim();
  if (!id || !token) return null;
  return `https://api.z-api.io/instances/${id}/token/${token}`;
}

function apiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const client = process.env.ZAPI_CLIENT_TOKEN?.trim();
  if (client) headers["Client-Token"] = client;
  return headers;
}

function extractText(payload: Record<string, unknown>): string {
  const text = payload.text;
  if (text && typeof text === "object" && text !== null) {
    const msg = (text as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.body === "string") return payload.body;
  return "";
}

export const zapiProvider: WhatsAppProvider = {
  name: "zapi",

  isConfigured() {
    return !!baseUrl();
  },

  async validateWebhook(req) {
    const expected = process.env.ZAPI_SECURITY_TOKEN?.trim();
    if (!expected) return process.env.NODE_ENV !== "production";
    const url = new URL(req.url);
    const got =
      url.searchParams.get("token") ||
      req.headers.get("x-zapi-token") ||
      req.headers.get("z-api-token") ||
      "";
    return got === expected;
  },

  parseInbound(rawBody) {
    try {
      const payload = JSON.parse(rawBody) as Record<string, unknown>;
      const type = String(payload.type ?? payload.event ?? "").toLowerCase();
      if (type && !type.includes("received") && type !== "message") {
        return null;
      }

      const from = onlyDigits(String(payload.phone ?? payload.from ?? ""));
      const to = onlyDigits(
        String(payload.connectedPhone ?? payload.to ?? payload.receiverPhone ?? "")
      );
      const text = extractText(payload);
      if (!from || !text) return null;

      const msg: InboundMessage = {
        from,
        to,
        text,
        providerMessageId:
          typeof payload.messageId === "string"
            ? payload.messageId
            : typeof payload.id === "string"
              ? payload.id
              : undefined,
        contactName:
          typeof payload.senderName === "string"
            ? payload.senderName
            : typeof payload.chatName === "string"
              ? payload.chatName
              : undefined,
      };
      return msg;
    } catch {
      return null;
    }
  },

  async sendText(to, body): Promise<WhatsAppResult> {
    const url = baseUrl();
    if (!url) {
      return { ok: false, status: 0, data: { error: "Z-API não configurada (ZAPI_INSTANCE_ID/ZAPI_TOKEN)." } };
    }

    const phone = onlyDigits(to);
    const res = await fetch(`${url}/send-text`, {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({ phone, message: body }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  },
};