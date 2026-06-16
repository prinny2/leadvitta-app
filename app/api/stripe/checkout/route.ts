import { enforceRateLimit, jsonNoStore, readJsonBody, rejectCrossOriginRequest } from "@/lib/api-security";
import Stripe from "stripe";
import {
  getBillingPlan,
  getStripeCheckoutMode,
  parseBillingPlan,
} from "@/lib/billing";
import { isStripeConfigured, siteUrl } from "@/lib/config";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { getStripe } from "@/lib/stripe/server";
import { sendOpsNotify } from "@/lib/ops-notify";

export const runtime = "nodejs";

type CheckoutBody = {
  plan?: unknown;
  firebaseIdToken?: string;
  customerEmail?: string;
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
    bucket: "stripe-checkout",
    limit: 10,
    windowMs: 10 * 60_000,
  });
  if (rateLimitError) return rateLimitError;

  const parsed = await readJsonBody<CheckoutBody>(request, 8_192);
  if (parsed.error) return parsed.error;

  const body = parsed.data ?? {};

  const plan = parseBillingPlan(body.plan);
  if (!plan) {
    return jsonNoStore({ error: "Plano inválido." }, { status: 400 });
  }

  const planConfig = getBillingPlan(plan);
  if (!planConfig.disponivel) {
    return jsonNoStore(
      { error: "Esse plano ainda não está disponível — entre na lista de espera." },
      { status: 400 }
    );
  }
  if (!planConfig.priceId) {
    console.error(
      `[stripe.checkout] STRIPE_PRICE_ID_${plan.toUpperCase()} não configurado.`
    );
    return jsonNoStore(
      {
        error:
          "Checkout indisponível para este plano no momento. Fale com o suporte.",
      },
      { status: 503 }
    );
  }

  if (!isStripeConfigured) {
    console.error("[stripe.checkout] Stripe não configurado neste ambiente.");
    return jsonNoStore(
      { error: "Checkout indisponível no momento. Fale com o suporte." },
      { status: 503 }
    );
  }

  const decodedToken = await verifyFirebaseIdToken(body.firebaseIdToken);
  const customerEmail =
    decodedToken?.email ||
    (typeof body.customerEmail === "string" ? body.customerEmail : undefined);
  const firebaseUid = decodedToken?.uid;
  const metadata = {
    app: "leadbellus",
    plan,
    firebase_uid: firebaseUid ?? "",
    firebase_email: customerEmail ?? "",
  };

  const checkoutMode = getStripeCheckoutMode();
  const baseUrl = getBaseUrl(request);
  const successPath = firebaseUid
    ? "/configuracoes?checkout=sucesso&session_id={CHECKOUT_SESSION_ID}"
    : "/signup?checkout=sucesso&session_id={CHECKOUT_SESSION_ID}";
  const cancelPath = firebaseUid
    ? "/configuracoes?checkout=cancelado"
    : "/#demo";
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: checkoutMode,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${baseUrl}${successPath}`,
    cancel_url: `${baseUrl}${cancelPath}`,
    allow_promotion_codes: true,
    client_reference_id: firebaseUid,
    customer_email: customerEmail,
    metadata,
  };

  if (checkoutMode === "subscription") {
    params.subscription_data = { metadata };
  } else {
    params.payment_intent_data = { metadata };
  }

  try {
    const session = await getStripe().checkout.sessions.create(params);
    await sendOpsNotify("checkout.started", {
      plan,
      stripe_session_id: session.id,
      firebase_uid: firebaseUid,
      email: customerEmail,
    });

    return jsonNoStore({ url: session.url });
  } catch (err) {
    console.error("[stripe.checkout] erro ao criar sessão", err);
    return jsonNoStore(
      { error: "Não foi possível iniciar o checkout." },
      { status: 500 }
    );
  }
}
