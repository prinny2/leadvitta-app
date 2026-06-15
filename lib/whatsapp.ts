// Registry de provedores de WhatsApp. A escolha é EXPLÍCITA por env
// WHATSAPP_PROVIDER ("dialog360"); sem env, dialog360.
import { dialog360Provider } from "@/lib/whatsapp-dialog360";
import type { WhatsAppProvider, WhatsAppResult } from "@/lib/whatsapp-types";

export type { WhatsAppProvider, WhatsAppResult, InboundMessage } from "@/lib/whatsapp-types";

export function getWhatsAppProvider(): WhatsAppProvider {
  // Atualmente apenas o 360dialog (Meta Cloud API) é suportado nativamente.
  return dialog360Provider;
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
