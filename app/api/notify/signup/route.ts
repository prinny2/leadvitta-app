import { enforceRateLimit, jsonNoStore, readJsonBody, rejectCrossOriginRequest } from "@/lib/api-security";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { sendOpsNotify } from "@/lib/ops-notify";

export const runtime = "nodejs";

type SignupBody = {
  event?: string;
  plan?: string;
};

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : undefined;
}

/** Alerta Z-API após signup (substitui /api/zapier/lead). */
export async function POST(request: Request) {
  const originError = rejectCrossOriginRequest(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(request, {
    bucket: "notify-signup",
    limit: 12,
    windowMs: 10 * 60_000,
  });
  if (rateLimitError) return rateLimitError;

  const decodedToken = await verifyFirebaseIdToken(getBearerToken(request));
  if (!decodedToken) {
    return jsonNoStore(
      { error: "Firebase Admin/ID token obrigatório." },
      { status: 401 }
    );
  }

  const parsed = await readJsonBody<SignupBody>(request, 4_096);
  if (parsed.error) return parsed.error;

  const body = parsed.data ?? {};
  const event = body.event || "signup.created";
  const result = await sendOpsNotify(event, {
    firebase_uid: decodedToken.uid,
    email: decodedToken.email,
    plan: body.plan,
  });

  return jsonNoStore({ ok: result.sent, result });
}