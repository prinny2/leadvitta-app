type ZapierResult =
  | { sent: true; status: number }
  | { sent: false; reason: "not_configured" | "failed"; status?: number };

export async function sendZapierEvent(
  event: string,
  payload: Record<string, unknown>
): Promise<ZapierResult> {
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
  if (!webhookUrl) return { sent: false, reason: "not_configured" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event,
        app: "leadvitta",
        sent_at: new Date().toISOString(),
        zapier_shared_secret: process.env.ZAPIER_SHARED_SECRET || undefined,
        ...payload,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn("[zapier] webhook retornou status", response.status);
      return { sent: false, reason: "failed", status: response.status };
    }

    return { sent: true, status: response.status };
  } catch (err) {
    console.warn("[zapier] falha ao enviar evento", err);
    return { sent: false, reason: "failed" };
  } finally {
    clearTimeout(timeout);
  }
}
