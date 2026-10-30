import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  InboundMessage,
  WhatsAppProvider,
  WhatsAppResult,
} from "@/lib/whatsapp-types";

const ACCESS_TOKEN = () => process.env.WHATSAPP_CLOUD_ACCESS_TOKEN?.trim();
const PHONE_NUMBER_ID = () => process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID?.trim();
const DISPLAY_PHONE_NUMBER = () => digits(process.env.WHATSAPP_CLOUD_DISPLAY_PHONE_NUMBER);
const APP_SECRET = () => process.env.WHATSAPP_CLOUD_APP_SECRET?.trim();
const VERIFY_TOKEN = () => process.env.WHATSAPP_CLOUD_VERIFY_TOKEN?.trim();
const API_VERSION = () => process.env.WHATSAPP_CLOUD_API_VERSION?.trim();

function digits(value: unknown): string {
  return String(value ?? "").replace(/\D/g, "");
}

function apiUrl(path: string): string | null {
  const version = API_VERSION();
  if (!version || !/^v\d+\.\d+$/.test(version)) return null;
  return `https://graph.facebook.com/${version}/${path}`;
}

async function readResponse(res: Response): Promise<unknown> {
  return res.json().catch(() => ({}));
}

function errorResult(message: string, status = 0): WhatsAppResult {
  return { ok: false, status, data: { error: message } };
}

/** WhatsApp Business Cloud API da Meta para um número configurado no servidor. */
export const metaCloudProvider: WhatsAppProvider = {
  name: "meta-cloud",

  isConfigured() {
    return !!(
      ACCESS_TOKEN() &&
      PHONE_NUMBER_ID() &&
      DISPLAY_PHONE_NUMBER() &&
      APP_SECRET() &&
      VERIFY_TOKEN() &&
      API_VERSION() &&
      /^v\d+\.\d+$/.test(API_VERSION() || "")
    );
  },

  webhookChallenge(req) {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode !== "subscribe" || !VERIFY_TOKEN() || token !== VERIFY_TOKEN() || !challenge) {
      return null;
    }
    return challenge;
  },

  async validateWebhook(req, rawBody) {
    const secret = APP_SECRET();
    const signature = req.headers.get("x-hub-signature-256") || "";
    const match = /^sha256=([a-f\d]{64})$/i.exec(signature);
    if (!secret || !match) return false;

    const expected = createHmac("sha256", secret).update(rawBody).digest();
    const received = Buffer.from(match[1], "hex");
    return received.length === expected.length && timingSafeEqual(received, expected);
  },

  parseInbound(rawBody) {
    try {
      const payload = JSON.parse(rawBody);
      if (payload.object !== "whatsapp_business_account" || !Array.isArray(payload.entry)) return null;
      const configuredPhoneNumberId = PHONE_NUMBER_ID();
      if (!configuredPhoneNumberId) return null;
      const messages: InboundMessage[] = [];

      for (const entry of payload.entry) {
        for (const change of entry?.changes ?? []) {
          const value = change?.value;
          const phoneNumberId = String(value?.metadata?.phone_number_id ?? "");
          const displayPhone = digits(value?.metadata?.display_phone_number);
          if (phoneNumberId !== configuredPhoneNumberId || !Array.isArray(value?.messages)) continue;

          for (const message of value.messages) {
            if (!message?.id || !message?.from) continue;
            const contact = (value.contacts ?? []).find((item: any) => item?.wa_id === message.from);
            const text = message.type === "text" && message.text?.body
              ? String(message.text.body)
              : `[A cliente enviou ${String(message.type || "uma mensagem")} pelo WhatsApp. Abra a conversa no aplicativo para visualizar.]`;
            messages.push({
              from: digits(message.from),
              to: displayPhone,
              text,
              providerMessageId: String(message.id),
              contactName: contact?.profile?.name ? String(contact.profile.name) : undefined,
            });
          }
        }
      }
      return messages.length ? messages : null;
    } catch {
      return null;
    }
  },

  async sendText(to, body): Promise<WhatsAppResult> {
    const token = ACCESS_TOKEN();
    const phoneNumberId = PHONE_NUMBER_ID();
    const url = phoneNumberId ? apiUrl(`${encodeURIComponent(phoneNumberId)}/messages`) : null;
    if (!token || !url) return errorResult("WhatsApp Cloud API não configurada.");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: digits(to),
        type: "text",
        text: { body, preview_url: false },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    return { ok: res.ok, status: res.status, data: await readResponse(res) };
  },

  async sendImage(to, imageUrl, caption): Promise<WhatsAppResult> {
    const token = ACCESS_TOKEN();
    const phoneNumberId = PHONE_NUMBER_ID();
    const url = phoneNumberId ? apiUrl(`${encodeURIComponent(phoneNumberId)}/messages`) : null;
    if (!token || !url) return errorResult("WhatsApp Cloud API não configurada.");

    const image: Record<string, string> = { link: imageUrl };
    if (caption) image.caption = caption;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", to: digits(to), type: "image", image }),
      signal: AbortSignal.timeout(15_000),
    });
    return { ok: res.ok, status: res.status, data: await readResponse(res) };
  },

  async sendButtons(to, body, buttons): Promise<WhatsAppResult> {
    const token = ACCESS_TOKEN();
    const phoneNumberId = PHONE_NUMBER_ID();
    const url = phoneNumberId ? apiUrl(`${encodeURIComponent(phoneNumberId)}/messages`) : null;
    if (!token || !url) return errorResult("WhatsApp Cloud API não configurada.");
    if (buttons.length < 1 || buttons.length > 3) {
      return errorResult("A Cloud API aceita de 1 a 3 botões de resposta rápida.", 400);
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: digits(to),
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: body },
          action: {
            buttons: buttons.map((button) => ({
              type: "reply",
              reply: { id: button.id, title: button.label.slice(0, 20) },
            })),
          },
        },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    return { ok: res.ok, status: res.status, data: await readResponse(res) };
  },
};
