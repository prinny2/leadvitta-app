// WhatsApp via Z-API (único provedor em produção).
import { zapiProvider } from "@/lib/whatsapp-zapi";
import type { WhatsAppProvider, WhatsAppResult } from "@/lib/whatsapp-types";

export type {
  WhatsAppProvider,
  WhatsAppResult,
  InboundMessage,
} from "@/lib/whatsapp-types";

export function getWhatsAppProvider(): WhatsAppProvider {
  return zapiProvider;
}

/** True quando Z-API está configurada (ZAPI_INSTANCE_ID + ZAPI_TOKEN). */
export function isWhatsappConfigured(): boolean {
  return zapiProvider.isConfigured();
}

export async function sendWhatsAppText(
  to: string,
  body: string,
  opts?: { from?: string; channelApiKey?: string },
): Promise<WhatsAppResult> {
  return zapiProvider.sendText(to, body, opts);
}
