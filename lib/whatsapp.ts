// Registry de provedores de WhatsApp. A escolha é por env WHATSAPP_PROVIDER
// ("twilio" | "dialog360"); sem env, usa 360dialog se configurado, senão Twilio.
import { twilioProvider } from "@/lib/whatsapp-twilio";
import { dialog360Provider } from "@/lib/whatsapp-dialog360";
import type { WhatsAppProvider, WhatsAppResult } from "@/lib/whatsapp-types";

export type { WhatsAppProvider, WhatsAppResult, InboundMessage } from "@/lib/whatsapp-types";

export function getWhatsAppProvider(): WhatsAppProvider {
  const pref = (process.env.WHATSAPP_PROVIDER || "").toLowerCase();
  if (pref === "dialog360" || pref === "360dialog") return dialog360Provider;
  if (pref === "twilio") return twilioProvider;
  // Auto: prioriza 360dialog quando há chave; senão Twilio.
  if (dialog360Provider.isConfigured()) return dialog360Provider;
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
