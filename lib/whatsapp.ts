// Registry de provedores de WhatsApp. A escolha é EXPLÍCITA por env
// WHATSAPP_PROVIDER ("dialog360" | "twilio"); sem env, dialog360.
// Sem auto-detecção por credenciais de propósito: comutar o provedor
// implicitamente derrubaria o parse/validação dos webhooks em silêncio.
import { dialog360Provider } from "@/lib/whatsapp-dialog360";
import { twilioProvider } from "@/lib/whatsapp-twilio";
import { zapiProvider } from "@/lib/whatsapp-zapi";
import type { WhatsAppProvider, WhatsAppResult } from "@/lib/whatsapp-types";

export type { WhatsAppProvider, WhatsAppResult, InboundMessage } from "@/lib/whatsapp-types";

export function getWhatsAppProvider(): WhatsAppProvider {
  const pref = (process.env.WHATSAPP_PROVIDER || "dialog360").toLowerCase();
  switch (pref) {
    case "dialog360":
    case "360dialog":
      return dialog360Provider;
    case "twilio":
      return twilioProvider;
    case "zapi":
      return zapiProvider;
    default:
      throw new Error(
        `WHATSAPP_PROVIDER inválido: "${pref}" (use "dialog360", "twilio" ou "zapi").`
      );
  }
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
