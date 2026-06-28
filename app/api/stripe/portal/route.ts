import {
  enforceRateLimit,
  jsonNoStore,
  readJsonBody,
  rejectCrossOriginRequest,
} from "@/lib/api-security";
import {
  getFirebaseAdminDb,
  verifyFirebaseIdToken,
} from "@/lib/firebase/admin";
import { getStripe } from "@/lib/stripe/server";
import { siteUrl } from "@/lib/config";

export const runtime = "nodejs";

type PortalBody = {
  firebaseIdToken?: string;
};

function getBaseUrl(request: Request) {
  return (
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    siteUrl
  ).replace(/\/$/, "");
}

export async function POST(request: Request) {
  const originError = rejectCrossOriginRequest(request);
  if (originError) return originError;

  const rateLimitError = enforceRateLimit(request, {
    bucket: "stripe-portal",
    limit: 10,
    windowMs: 10 * 60_000,
  });
  if (rateLimitError) return rateLimitError;

  const parsed = await readJsonBody<PortalBody>(request, 4_096);
  if (parsed.error) return parsed.error;

  const db = getFirebaseAdminDb();
  if (!db) {
    console.error("[stripe.portal] Firebase Admin não configurado.");
    return jsonNoStore(
      { error: "Portal indisponível no momento. Fale com o suporte." },
      { status: 503 },
    );
  }

  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    console.error("[stripe.portal] Stripe não configurado neste ambiente.");
    return jsonNoStore(
      { error: "Portal indisponível no momento. Fale com o suporte." },
      { status: 503 },
    );
  }

  const decodedToken = await verifyFirebaseIdToken(
    parsed.data?.firebaseIdToken,
  );
  if (!decodedToken?.uid) {
    return jsonNoStore(
      { error: "Faça login antes de gerenciar sua assinatura." },
      { status: 401 },
    );
  }

  const clinicaSnap = await db
    .collection("clinicas")
    .doc(decodedToken.uid)
    .get();
  const stripeCustomerId = clinicaSnap.data()?.billing?.stripe_customer_id;

  if (typeof stripeCustomerId !== "string" || !stripeCustomerId.trim()) {
    return jsonNoStore(
      {
        error: "Ainda não encontramos uma assinatura ativa para esta conta.",
      },
      { status: 404 },
    );
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${getBaseUrl(request)}/configuracoes`,
    });

    return jsonNoStore({ url: session.url });
  } catch (error) {
    console.error("[stripe.portal] erro ao criar sessão", error);
    return jsonNoStore(
      { error: "Não foi possível abrir o portal de assinatura." },
      { status: 500 },
    );
  }
}
