import { enforceRateLimit, jsonNoStore, readJsonBody, rejectCrossOriginRequest } from "@/lib/api-security";
import { ga4ValueFromCents } from "@/lib/analytics/ga4-server";
import { isStripeConfigured } from "@/lib/config";
import { getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";

// Volta do Checkout: o browser só tem o session_id. Esta rota devolve se a
// sessão foi paga e quanto (já com cupom), para o Purchase do Meta Pixel levar
// o valor real. Não expõe e-mail, cliente nem assinatura.
const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

export async function POST(request: Request) {
  const originError = rejectCrossOriginRequest(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(request, {
    bucket: "stripe-session",
    limit: 20,
    windowMs: 10 * 60_000,
  });
  if (rateLimitError) return rateLimitError;

  const parsed = await readJsonBody<{ sessionId?: unknown }>(request, 1_000);
  if (parsed.error) return parsed.error;

  const sessionId = parsed.data?.sessionId;
  if (typeof sessionId !== "string" || !SESSION_ID.test(sessionId)) {
    return jsonNoStore({ error: "session_id inválido." }, { status: 400 });
  }

  if (!isStripeConfigured) {
    return jsonNoStore({ error: "Stripe não configurado." }, { status: 503 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const paid = session.status === "complete" && session.payment_status === "paid";
    return jsonNoStore({
      paid,
      value: paid ? ga4ValueFromCents(session.amount_total) : undefined,
      currency: (session.currency || "brl").toUpperCase(),
      plan: session.metadata?.plan,
    });
  } catch {
    return jsonNoStore({ error: "Sessão não encontrada." }, { status: 404 });
  }
}
