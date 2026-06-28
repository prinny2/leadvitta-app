import { isOpsNotifyConfigured, opsNotifyPhone } from "@/lib/config";
import { sendWhatsAppText } from "@/lib/whatsapp";

export type OpsNotifyResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "failed"; status?: number };

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

function formatOpsMessage(
  event: string,
  payload: Record<string, unknown>,
): string {
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

/** Alerta operacional via Z-API (substitui Zapier). Fire-and-forget no caller. */
export async function sendOpsNotify(
  event: string,
  payload: Record<string, unknown>,
): Promise<OpsNotifyResult> {
  if (!isOpsNotifyConfigured || !opsNotifyPhone) {
    return { sent: false, reason: "not_configured" };
  }

  try {
    const result = await sendWhatsAppText(
      opsNotifyPhone,
      formatOpsMessage(event, payload),
    );
    if (!result.ok) {
      console.warn("[ops-notify] Z-API status", result.status, result.data);
      return { sent: false, reason: "failed", status: result.status };
    }
    return { sent: true };
  } catch (err) {
    console.warn("[ops-notify] falha ao enviar", err);
    return { sent: false, reason: "failed" };
  }
}
