import { enforceRateLimit, jsonNoStore, readJsonBody, rejectCrossOriginRequest } from "@/lib/api-security";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { parseBillingPlan } from "@/lib/billing";
import { sendOpsNotify } from "@/lib/ops-notify";

export const runtime = "nodejs";

type WaitlistBody = { email?: unknown; plan?: unknown };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Lista de espera dos planos "Em breve" (Pro/Premium).
 * Grava em `waitlist` via Admin SDK (coleção só-servidor; o catch-all das
 * regras nega acesso de cliente).
 */
export async function POST(request: Request) {
  const originError = rejectCrossOriginRequest(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(request, {
    bucket: "waitlist",
    limit: 10,
    windowMs: 10 * 60_000,
  });
  if (rateLimitError) return rateLimitError;

  const parsed = await readJsonBody<WaitlistBody>(request, 2_048);
  if (parsed.error) return parsed.error;

  const email = typeof parsed.data?.email === "string" ? parsed.data.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return jsonNoStore({ error: "Informe um e-mail válido." }, { status: 400 });
  }
  const plan = parseBillingPlan(parsed.data?.plan) ?? "pro";

  const db = getFirebaseAdminDb();
  if (!db) {
    return jsonNoStore({ error: "Indisponível no momento." }, { status: 503 });
  }

  // Doc id determinístico por (plano, email) → inscrição duplicada é idempotente.
  const id = `${plan}__${email.replace(/[^\w.@+-]/g, "_")}`;
  await db.collection("waitlist").doc(id).set(
    {
      email,
      plan,
      created_at: new Date().toISOString(),
    },
    { merge: true }
  );

  await sendOpsNotify("waitlist.joined", { email, plan }).catch(() => {});

  return jsonNoStore({ ok: true });
}
