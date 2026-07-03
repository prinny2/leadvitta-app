import {
  enforceRateLimit,
  getBearerToken,
  jsonNoStore,
  rejectCrossOriginRequest,
} from "@/lib/api-security";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { reconcileBillingForUser } from "@/lib/stripe/billing-sync";

export const runtime = "nodejs";

/** Liga checkout guest (mesmo e-mail) à clínica após signup/login. */
export async function POST(request: Request) {
  const originError = rejectCrossOriginRequest(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(request, {
    bucket: "billing-reconcile",
    limit: 20,
    windowMs: 10 * 60_000,
  });
  if (rateLimitError) return rateLimitError;

  const decoded = await verifyFirebaseIdToken(getBearerToken(request));
  if (!decoded?.uid) {
    return jsonNoStore({ error: "Faça login para vincular a assinatura." }, { status: 401 });
  }

  const result = await reconcileBillingForUser(decoded.uid, decoded.email);
  return jsonNoStore({ ok: true, ...result });
}