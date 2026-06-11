// Integração Twilio WhatsApp.
// Credenciais via env (NUNCA commitar — vão no .env.local / Cloud Run):
//   TWILIO_ACCOUNT_SID      -> Account SID (começa com AC...)
//   TWILIO_API_KEY_SID      -> API Key SID (começa com SK...)
//   TWILIO_API_KEY_SECRET   -> API Key Secret
//   TWILIO_WHATSAPP_FROM    -> número Twilio no formato "whatsapp:+14155238886"

/** True quando o envio de WhatsApp está configurado. */
export function isWhatsappConfigured(): boolean {
  return (
    !!process.env.TWILIO_ACCOUNT_SID &&
    !!process.env.TWILIO_API_KEY_SID &&
    !!process.env.TWILIO_API_KEY_SECRET &&
    !!process.env.TWILIO_WHATSAPP_FROM
  );
}

export type WhatsAppResult = { ok: boolean; status: number; data: unknown };

/**
 * Envia uma mensagem de texto via Twilio WhatsApp.
 * @param to   número do destinatário com prefixo, ex.: "whatsapp:+5591985156690"
 *             ou apenas E.164 "5591985156690" (o prefixo é adicionado aqui)
 * @param body texto da mensagem
 */
export async function sendWhatsAppText(to: string, body: string): Promise<WhatsAppResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !apiKeySid || !apiKeySecret || !from) {
    return {
      ok: false,
      status: 0,
      data: { error: "Twilio não configurado (TWILIO_ACCOUNT_SID / TWILIO_API_KEY_SID / TWILIO_API_KEY_SECRET / TWILIO_WHATSAPP_FROM ausentes)." },
    };
  }

  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:+${to}`;

  const params = new URLSearchParams({
    From: from,
    To: toFormatted,
    Body: body,
  });

  // API Key authentication: username = API Key SID (SK...), password = API Key Secret.
  const credentials = Buffer.from(`${apiKeySid}:${apiKeySecret}`).toString("base64");
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
