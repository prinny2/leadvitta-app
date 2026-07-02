import { auth, currentUser } from "@clerk/nextjs/server";
import {
  enforceRateLimit,
  jsonNoStore,
  rejectCrossOriginRequest,
} from "@/lib/api-security";
import { isClerkServerConfigured, isFirebaseConfigured } from "@/lib/config";
import {
  createFirebaseCustomToken,
  isFirebaseAdminConfigured,
} from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const originError = rejectCrossOriginRequest(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(request, {
    bucket: "auth-firebase-token",
    limit: 30,
    windowMs: 60_000,
  });
  if (rateLimitError) return rateLimitError;

  if (!isClerkServerConfigured || !isFirebaseConfigured) {
    return jsonNoStore(
      { error: "Autenticação Clerk/Firebase não configurada." },
      { status: 503 }
    );
  }

  if (!isFirebaseAdminConfigured()) {
    return jsonNoStore(
      { error: "Firebase Admin não configurado." },
      { status: 503 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return jsonNoStore({ error: "Não autenticado." }, { status: 401 });
  }

  if (userId.length > 128) {
    return jsonNoStore(
      { error: "Identificador de usuário inválido." },
      { status: 400 }
    );
  }

  const user = await currentUser().catch(() => null);
  const email = user?.primaryEmailAddress?.emailAddress;
  const token = await createFirebaseCustomToken(userId, {
    provider: "clerk",
    clerk_user_id: userId,
    ...(email ? { email } : {}),
  });

  if (!token) {
    return jsonNoStore(
      { error: "Não foi possível abrir a sessão Firebase." },
      { status: 503 }
    );
  }

  return jsonNoStore({ token, uid: userId });
}
