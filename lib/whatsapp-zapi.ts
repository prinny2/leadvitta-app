import type {
  WhatsAppProvider,
  WhatsAppResult,
  InboundMessage,
} from "@/lib/whatsapp-types";
import { isProductionRuntime } from "@/lib/runtime";

function stripPrefix(n: string): string {
  return n.replace(/^whatsapp:/, "").replace(/^\+/, "");
}

const INSTANCE = () => process.env.ZAPI_INSTANCE_ID;
const TOKEN = () => process.env.ZAPI_TOKEN;
const CLIENT_TOKEN = () => process.env.ZAPI_CLIENT_TOKEN;

/**
 * Provedor Z-API (WhatsApp via API Gateway).
 * Documentação: https://developer.z-api.io/
 */
export const zapiProvider: WhatsAppProvider = {
  name: "zapi",

  isConfigured() {
    return !!INSTANCE() && !!TOKEN();
  },

  async validateWebhook(req) {
    const expected = process.env.ZAPI_SECURITY_TOKEN;
    // Z-API não impõe uma assinatura padrão no webhook, mas permite que o usuário
    // configure um token na URL (ex: /api/webhook/whatsapp?token=XYZ).
    // Sem token configurado: aberto só FORA de produção (dev/local). Em produção
    // — inclusive Cloud Run, onde NODE_ENV pode não ser "production" mas K_SERVICE
    // existe — fecha (fail-closed), senão o webhook público fica exposto.
    if (!expected) return !isProductionRuntime();

    const url = new URL(req.url);
    const got = url.searchParams.get("token") || req.headers.get("x-zapi-token") || "";
    return got === expected;
  },

  parseInbound(rawBody) {
    try {
      const payload = JSON.parse(rawBody);
      
      // Z-API envia diferentes tipos de eventos. O que nos interessa é "ReceivedMessage".
      if (payload.type !== "ReceivedMessage" || !payload.text?.message) {
        return null;
      }

      const msg: InboundMessage = {
        from: stripPrefix(payload.phone ?? ""),
        to: stripPrefix(payload.connectedPhone ?? ""),
        text: payload.text.message,
        providerMessageId: payload.messageId,
        contactName: payload.senderName || payload.chatName,
      };

      return msg.from && msg.text ? msg : null;
    } catch {
      return null;
    }
  },

  async sendText(to, body): Promise<WhatsAppResult> {
    const instance = INSTANCE();
    const token = TOKEN();
    
    if (!instance || !token) {
      return { ok: false, status: 0, data: { error: "Z-API não configurado (ZAPI_INSTANCE_ID/ZAPI_TOKEN)." } };
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Client-Token é opcional dependendo da configuração da instância no painel Z-API.
    const clientToken = CLIENT_TOKEN();
    if (clientToken) {
      headers["Client-Token"] = clientToken;
    }

    const res = await fetch(
      `https://api.z-api.io/instances/${instance}/token/${token}/send-text`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          phone: stripPrefix(to),
          message: body,
        }),
      }
    );

    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  },

  async sendImage(to, imageUrl, caption): Promise<WhatsAppResult> {
    const instance = INSTANCE();
    const token = TOKEN();
    if (!instance || !token) return { ok: false, status: 0, data: { error: "Z-API não configurado." } };

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (CLIENT_TOKEN()) headers["Client-Token"] = CLIENT_TOKEN()!;

    const res = await fetch(
      `https://api.z-api.io/instances/${instance}/token/${token}/send-image`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          phone: stripPrefix(to),
          image: imageUrl,
          caption,
        }),
      }
    );
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  },

  async sendButtons(to, body, buttons): Promise<WhatsAppResult> {
    const instance = INSTANCE();
    const token = TOKEN();
    if (!instance || !token) return { ok: false, status: 0, data: { error: "Z-API não configurado." } };

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (CLIENT_TOKEN()) headers["Client-Token"] = CLIENT_TOKEN()!;

    const res = await fetch(
      `https://api.z-api.io/instances/${instance}/token/${token}/send-button-list`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          phone: stripPrefix(to),
          message: body,
          buttonList: {
            buttons: buttons.map((b) => ({ id: b.id, label: b.label })),
          },
        }),
      }
    );
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  },
};
