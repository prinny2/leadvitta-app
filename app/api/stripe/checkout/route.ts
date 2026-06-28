import { enforceRateLimit, jsonNoStore, readJsonBody, rejectCrossOriginRequest } from "@/lib/api-security";
import Stripe from "stripe";
import { ga4ValueFromCents, sendGa4Event } from "@/lib/analytics/ga4-server";
import type { BillingInterval, BillingPlanConfig } from "@/lib/billing";
import {
  getBillingPlan,
  getStripeCheckoutMode,
  parseBillingPlan,
} from "@/lib/billing";
import { isStripeConfigured, siteUrl } from "@/lib/config";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { isAllowedStripePriceId } from "@/lib/stripe/price-guard";
import { getStripe } from "@/lib/stripe/server";
import { sendOpsNotify } from "@/lib/ops-notify";

export const runtime = "nodejs";

type CheckoutBody = {
  plan?: unknown;
  interval?: unknown;
  firebaseIdToken?: string;
  customerEmail?: string;
  gaClientId?: string;
};

function getBaseUrl(request: Request) {
  return (
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    siteUrl
  ).replace(/\/$/, "");
}

function getCheckoutDescription(
  planConfig: BillingPlanConfig,
  interval: BillingInterval
) {
  const billingLabel = interval === "annual" ? "anual" : "mensal";
  return `LeadBellus ${planConfig.label} ${billingLabel}: ${planConfig.tagline}`;
}

function getCheckoutCustomText(
  planConfig: BillingPlanConfig,
  interval: BillingInterval
): Stripe.Checkout.SessionCreateParams.CustomText {
  const billingLabel = interval === "annual" ? "anual" : "mensal";
  return {
    submit: {
      message: `Assinatura ${planConfig.label} ${billingLabel}. Use o mesmo e-mail do pagamento para liberar sua conta LeadBellus.`,
    },
    after_submit: {
      message:
        "Pagamento recebido. Vamos te levar de volta ao LeadBellus para finalizar o acesso e configurar sua clínica.",
    },
  };
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
  const interval: BillingInterval =
    body.interval === "annual" ? "annual" : "monthly";
  const priceId =
    interval === "annual" ? planConfig.priceIdAnnual : planConfig.priceId;
  if (!priceId) {
    const envSuffix = interval === "annual" ? "_ANNUAL" : "";
    console.error(
      `[stripe.checkout] STRIPE_PRICE_ID_${plan.toUpperCase()}${envSuffix} não configurado.`
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

  if (!isAllowedStripePriceId(priceId)) {
    console.error(
      `[stripe.checkout] Price ID fora da allowlist LeadBellus: ${priceId}.`
    );
    return jsonNoStore(
      { error: "Checkout em manutenção. Fale com o suporte para ativar." },
      { status: 503 }
    );
  }

  const decodedToken = await verifyFirebaseIdToken(body.firebaseIdToken);
  const customerEmail =
    decodedToken?.email ||
    (typeof body.customerEmail === "string" ? body.customerEmail : undefined);
  const firebaseUid = decodedToken?.uid;
  const gaClientId =
    typeof body.gaClientId === "string" ? body.gaClientId.trim().slice(0, 64) : "";
  const metadata = {
    app: "leadbellus",
    plan,
    billing_interval: interval,
    stripe_price_id: priceId,
    firebase_uid: firebaseUid ?? "",
    firebase_email: customerEmail ?? "",
    ga_client_id: gaClientId,
  };

  const checkoutMode = getStripeCheckoutMode();
  const baseUrl = getBaseUrl(request);
  const successPath = firebaseUid
    ? "/configuracoes?checkout=sucesso&session_id={CHECKOUT_SESSION_ID}"
    : "/signup?checkout=sucesso&session_id={CHECKOUT_SESSION_ID}";
  const cancelPath = firebaseUid
    ? "/configuracoes?checkout=cancelado"
    : "/#demo";
  const checkoutDescription = getCheckoutDescription(planConfig, interval);
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: checkoutMode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}${successPath}`,
    cancel_url: `${baseUrl}${cancelPath}`,
    allow_promotion_codes: true,
    client_reference_id: firebaseUid,
    customer_email: customerEmail,
    custom_text: getCheckoutCustomText(planConfig, interval),
    locale: "pt-BR",
    metadata,
    phone_number_collection: { enabled: true },
    wallet_options: { link: { display: "never" } },
  };

  if (checkoutMode === "subscription") {
    params.subscription_data = { metadata, description: checkoutDescription };
    // Cupom de 100% (total R$0) não precisa de cartão — tira a fricção do checkout grátis.
    params.payment_method_collection = "if_required";
  } else {
    params.payment_intent_data = { metadata, description: checkoutDescription };
  }

  try {
    const session = await getStripe().checkout.sessions.create(params);
    await sendGa4Event({
      name: "begin_checkout",
      clientId: gaClientId,
      userId: firebaseUid,
      params: {
        currency: (session.currency || "BRL").toUpperCase(),
        value: ga4ValueFromCents(session.amount_total) ?? planConfig.price,
        checkout_mode: checkoutMode,
        checkout_session_id: session.id,
        plan,
        billing_interval: interval,
        items: [
          {
            item_id: priceId,
            item_name: `LeadBellus ${planConfig.label}`,
            item_category: "subscription",
            quantity: 1,
            price: ga4ValueFromCents(session.amount_total) ?? planConfig.price,
          },
        ],
      },
    });
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
