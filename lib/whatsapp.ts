// Integração com a WhatsApp Cloud API (Meta).
// Credenciais via env (NUNCA commitar — vão no .env.local / Cloud Run):
//   WHATSAPP_TOKEN            -> token com permissão `whatsapp_business_messaging`
//                               (NÃO é o token do CAPI/pixel — esse é só pra eventos de anúncio)
//   WHATSAPP_PHONE_NUMBER_ID  -> ID do número (Meta -> WhatsApp -> API Setup)
//   WHATSAPP_VERIFY_TOKEN     -> string que VOCÊ inventa, usada pra verificar o webhook

const GRAPH = "https://graph.facebook.com/v21.0";

/** True quando o envio de WhatsApp está configurado. */
export function isWhatsappConfigured(): boolean {
  return !!process.env.WHATSAPP_TOKEN && !!process.env.WHATSAPP_PHONE_NUMBER_ID;
}

export type WhatsAppResult = { ok: boolean; status: number; data: unknown };

/**
 * Envia uma mensagem de texto simples.
 * @param to   número no formato E.164 SEM o '+', ex.: "5591985156690"
 * @param body texto da mensagem
 */
export async function sendWhatsAppText(to: string, body: string): Promise<WhatsAppResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    return {
      ok: false,
      status: 0,
      data: { error: "WhatsApp não configurado (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID ausentes)." },
    };
  }
  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body },
    }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
