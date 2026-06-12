// Provedor 360dialog (WhatsApp Business API / Cloud API via BSP).
// STUB funcional: já fala o formato real do Cloud API, mas a ativação por clínica
// (cada canal tem sua D360-API-KEY) é finalizada quando a conta Partner existir.
//
// Env (Fase 1 — 1 canal de teste):
//   D360_API_KEY        -> chave do canal (por clínica, no futuro)
//   D360_BASE_URL       -> default https://waba-v2.360dialog.io
//   D360_WEBHOOK_TOKEN  -> opcional: valida ?token=... no webhook
import type {
  WhatsAppProvider,
  WhatsAppResult,
  InboundMessage,
} from "@/lib/whatsapp-types";

function stripPrefix(n: string): string {
  return n.replace(/^whatsapp:/, "").replace(/^\+/, "");
}

const BASE = () => process.env.D360_BASE_URL || "https://waba-v2.360dialog.io";

export const dialog360Provider: WhatsAppProvider = {
  name: "dialog360",

  isConfigured() {
    return !!process.env.D360_API_KEY;
  },

  async validateWebhook(req) {
    const expected = process.env.D360_WEBHOOK_TOKEN;
    // Fail-closed em produção: exige o token (configurado como ?token=... na URL
    // do webhook no painel do 360dialog). Em dev, libera o teste local.
    if (!expected) return process.env.NODE_ENV !== "production";
    const url = new URL(req.url);
    const got = url.searchParams.get("token") || req.headers.get("x-d360-token") || "";
    return got === expected;
  },

  // Formato do WhatsApp Cloud API: entry[].changes[].value.messages[]
  parseInbound(rawBody) {
    try {
      const payload = JSON.parse(rawBody);
      const value = payload?.entry?.[0]?.changes?.[0]?.value;
      const message = value?.messages?.[0];
      if (!message) return null;
      const text =
        message.text?.body ??
        message.button?.text ??
        message.interactive?.list_reply?.title ??
        message.interactive?.button_reply?.title ??
        "";
      if (!text) return null;
      const contact = value?.contacts?.[0];
      const msg: InboundMessage = {
        from: stripPrefix(message.from ?? ""),
        to: stripPrefix(value?.metadata?.display_phone_number ?? ""),
        text,
        providerMessageId: message.id,
        contactName: contact?.profile?.name,
      };
      return msg.from && msg.text ? msg : null;
    } catch {
      return null;
    }
  },

  async sendText(to, body, opts): Promise<WhatsAppResult> {
    const apiKey = opts?.channelApiKey || process.env.D360_API_KEY;
    if (!apiKey) {
      return { ok: false, status: 0, data: { error: "360dialog não configurado (D360_API_KEY)." } };
    }
    const res = await fetch(`${BASE()}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "D360-API-KEY": apiKey },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: stripPrefix(to),
        type: "text",
        text: { body },
      }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  },
};
