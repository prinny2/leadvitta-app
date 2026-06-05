import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getBillingPlan,
  getStripeCheckoutMode,
  parseBillingPlan,
} from "@/lib/billing";
import { siteUrl } from "@/lib/config";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { getStripe } from "@/lib/stripe/server";
import { sendZapierEvent } from "@/lib/zapier";

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
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const plan = parseBillingPlan(body.plan);
  if (!plan) {
    return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
  }

  const planConfig = getBillingPlan(plan);
  if (!planConfig.priceId) {
    return NextResponse.json(
      { error: `STRIPE_PRICE_ID_${plan.toUpperCase()} não configurado.` },
      { status: 503 }
    );
  }

  const decodedToken = await verifyFirebaseIdToken(body.firebaseIdToken);
  const customerEmail =
    decodedToken?.email ||
    (typeof body.customerEmail === "string" ? body.customerEmail : undefined);
  const firebaseUid = decodedToken?.uid;
  const metadata = {
    app: "leadvitta",
    plan,
    firebase_uid: firebaseUid ?? "",
    firebase_email: customerEmail ?? "",
  };

  const checkoutMode = getStripeCheckoutMode();
  const baseUrl = getBaseUrl(request);
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: checkoutMode,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${baseUrl}/configuracoes?checkout=sucesso&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/configuracoes?checkout=cancelado`,
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
    await sendZapierEvent("checkout.started", {
      plan,
      stripe_session_id: session.id,
      firebase_uid: firebaseUid,
      email: customerEmail,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe.checkout] erro ao criar sessão", err);
    return NextResponse.json(
      { error: "Não foi possível iniciar o checkout." },
      { status: 500 }
    );
  }
}
