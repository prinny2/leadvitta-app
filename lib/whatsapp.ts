// Registry de provedores de WhatsApp. A escolha é EXPLÍCITA por env
// WHATSAPP_PROVIDER ("twilio" | "dialog360"); sem env, Twilio.
// Sem auto-detecção por D360_API_KEY de propósito: durante a migração, setar a
// chave do 360dialog comutaria o parse/validação e derrubaria os webhooks do
// Twilio em silêncio.
import { twilioProvider } from "@/lib/whatsapp-twilio";
import { dialog360Provider } from "@/lib/whatsapp-dialog360";
import type { WhatsAppProvider, WhatsAppResult } from "@/lib/whatsapp-types";

export type { WhatsAppProvider, WhatsAppResult, InboundMessage } from "@/lib/whatsapp-types";

export function getWhatsAppProvider(): WhatsAppProvider {
  const pref = (process.env.WHATSAPP_PROVIDER || "").toLowerCase();
  if (pref === "dialog360" || pref === "360dialog") return dialog360Provider;
  return twilioProvider;
}

/** True quando o provedor ativo está configurado para enviar. */
export function isWhatsappConfigured(): boolean {
  return getWhatsAppProvider().isConfigured();
}

/**
 * Envia uma mensagem de texto pelo provedor ativo.
 * Mantido por compatibilidade com o código existente.
 */
export async function sendWhatsAppText(
  to: string,
  body: string,
  opts?: { from?: string; channelApiKey?: string }
): Promise<WhatsAppResult> {
  return getWhatsAppProvider().sendText(to, body, opts);
}
