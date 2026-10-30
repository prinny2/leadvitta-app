// Seleção de provedor. Z-API permanece como padrão legado; Cloud API é opt-in.
import { zapiProvider } from "@/lib/whatsapp-zapi";
import { metaCloudProvider } from "@/lib/whatsapp-meta-cloud";
import type {
  WhatsAppProvider,
  WhatsAppResult,
  WhatsAppSendOptions,
} from "@/lib/whatsapp-types";

export type {
  WhatsAppProvider,
  WhatsAppResult,
  WhatsAppSendOptions,
  InboundMessage,
} from "@/lib/whatsapp-types";

function activeProvider(): WhatsAppProvider {
  const selected = process.env.WHATSAPP_PROVIDER?.trim().toLowerCase();
  if (!selected || selected === "zapi") return zapiProvider;
  if (selected === "meta-cloud") return metaCloudProvider;
  throw new Error(`WHATSAPP_PROVIDER não suportado: ${selected}`);
}

export function getWhatsAppProvider(): WhatsAppProvider {
  return activeProvider();
}

/** True quando o provedor selecionado tem as credenciais necessárias. */
export function isWhatsappConfigured(): boolean {
  return activeProvider().isConfigured();
}

export async function sendWhatsAppText(
  to: string,
  body: string,
  opts?: WhatsAppSendOptions
): Promise<WhatsAppResult> {
  return activeProvider().sendText(to, body, opts);
}
