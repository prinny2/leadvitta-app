import { enforceRateLimit, getBearerToken, jsonNoStore, readJsonBody, rejectCrossOriginRequest } from "@/lib/api-security";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { sendOpsNotify } from "@/lib/ops-notify";

export const runtime = "nodejs";

type LeadBody = {
  event?: string;
  plan?: string;
};

export async function POST(request: Request) {
  const originError = rejectCrossOriginRequest(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(request, {
    bucket: "zapier-lead",
    limit: 12,
    windowMs: 10 * 60_000,
  });
  if (rateLimitError) return rateLimitError;

  const decodedToken = await verifyFirebaseIdToken(getBearerToken(request));
  if (!decodedToken) {
    return jsonNoStore(
      { error: "Firebase Admin/ID token obrigatório para enviar lead." },
      { status: 401 }
    );
  }

  const parsed = await readJsonBody<LeadBody>(request, 4_096);
  if (parsed.error) return parsed.error;

  const body = parsed.data ?? {};
  const event = body.event || "lead.created";
  const result = await sendOpsNotify(event, {
    firebase_uid: decodedToken.uid,
    email: decodedToken.email,
    plan: body.plan,
  });

  return jsonNoStore({ ok: result.sent, result });
}
