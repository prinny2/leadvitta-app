import {
  isOpsEmailConfigured,
  isOpsWhatsAppConfigured,
  opsEmailFrom,
  opsNotifyEmail,
  opsNotifyPhone,
  resendApiKey,
} from "@/lib/config";
import { sendWhatsAppText } from "@/lib/whatsapp";

export type OpsNotifyResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "failed"; status?: number };

type ChannelResult = { ok: boolean; status?: number };

const EMAIL_TIMEOUT_MS = 8000;

const EVENT_LABELS: Record<string, string> = {
  "signup.created": "Nova conta",
  "checkout.started": "Checkout iniciado",
  "stripe.checkout.completed": "Pagamento confirmado",
  "waitlist.joined": "Lista de espera",
};

function eventLabel(event: string): string {
  return EVENT_LABELS[event] || event;
}

function line(key: string, value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  return `${key}: ${String(value)}`;
}

function formatOpsMessage(event: string, payload: Record<string, unknown>): string {
  const rows = [
    `🔔 LeadBellus · ${eventLabel(event)}`,
    line("📧 E-mail", payload.email),
    line("📦 Plano", payload.plan),
    line("👤 UID", payload.firebase_uid),
    line("💳 Sessão", payload.stripe_session_id),
    line("🧾 Assinatura", payload.stripe_subscription_id),
    line("✅ Pagamento", payload.payment_status),
    line("📊 Status", payload.status),
    `⏱ ${new Date().toLocaleString("pt-BR", { timeZone: "America/Belem" })}`,
  ].filter((r): r is string => !!r);

  return rows.join("\n");
}

async function sendViaWhatsApp(message: string): Promise<ChannelResult> {
  const result = await sendWhatsAppText(opsNotifyPhone, message);
  if (!result.ok) console.warn("[ops-notify] Z-API status", result.status, result.data);
  return { ok: result.ok, status: result.status };
}

/** E-mail via API HTTP do Resend (sem SDK). */
async function sendViaEmail(subject: string, message: string): Promise<ChannelResult> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: opsEmailFrom,
      to: [opsNotifyEmail],
      subject,
      text: message,
    }),
    signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
  });
  if (!res.ok) {
    console.warn("[ops-notify] Resend status", res.status, await res.text().catch(() => ""));
  }
  return { ok: res.ok, status: res.status };
}

/**
 * Alerta operacional (signup, checkout, pagamento, lista de espera) por
 * WhatsApp (Z-API) e/ou e-mail (Resend) — cada canal só quando configurado.
 * `sent: true` se ao menos um canal entregou. Fire-and-forget no caller.
 */
export async function sendOpsNotify(
  event: string,
  payload: Record<string, unknown>
): Promise<OpsNotifyResult> {
  const message = formatOpsMessage(event, payload);
  const channels: Promise<ChannelResult>[] = [];
  if (isOpsWhatsAppConfigured && opsNotifyPhone) channels.push(sendViaWhatsApp(message));
  if (isOpsEmailConfigured) {
    channels.push(sendViaEmail(`LeadBellus · ${eventLabel(event)}`, message));
  }
  if (channels.length === 0) return { sent: false, reason: "not_configured" };

  const settled = await Promise.allSettled(channels);
  const results = settled.map((s): ChannelResult => {
    if (s.status === "fulfilled") return s.value;
    console.warn("[ops-notify] falha ao enviar", s.reason);
    return { ok: false };
  });
  if (results.some((r) => r.ok)) return { sent: true };

  const status = results.find((r) => r.status !== undefined)?.status;
  return status === undefined
    ? { sent: false, reason: "failed" }
    : { sent: false, reason: "failed", status };
}
