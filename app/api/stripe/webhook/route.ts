import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getStripe } from "@/lib/stripe/server";
import { sendZapierEvent } from "@/lib/zapier";

export const runtime = "nodejs";

async function markStripeEvent(event: Stripe.Event) {
  const db = getFirebaseAdminDb();
  if (!db) return;

  await db.collection("stripe_events").doc(event.id).set(
    {
      type: event.type,
      livemode: event.livemode,
      created: event.created,
      received_at: new Date().toISOString(),
    },
    { merge: true }
  );
}

async function updateClinicBilling(
  firebaseUid: string | undefined,
  billing: Record<string, unknown>
) {
  const db = getFirebaseAdminDb();
  if (!db || !firebaseUid) return;

  await db.collection("clinicas").doc(firebaseUid).set(
    {
      billing: {
        ...billing,
        updated_at: new Date().toISOString(),
      },
    },
    { merge: true }
  );
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const firebaseUid =
    session.metadata?.firebase_uid || session.client_reference_id || undefined;
  const plan = session.metadata?.plan;

  await updateClinicBilling(firebaseUid, {
    plan,
    status: session.payment_status,
    stripe_customer_id:
      typeof session.customer === "string" ? session.customer : session.customer?.id,
    stripe_checkout_session_id: session.id,
    stripe_subscription_id:
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id,
  });

  await sendZapierEvent("stripe.checkout.completed", {
    plan,
    stripe_session_id: session.id,
    stripe_customer_id:
      typeof session.customer === "string" ? session.customer : session.customer?.id,
    stripe_subscription_id:
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id,
    payment_status: session.payment_status,
    firebase_uid: firebaseUid,
    email: session.customer_details?.email || session.customer_email,
  });
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const firebaseUid = subscription.metadata?.firebase_uid || undefined;

  await updateClinicBilling(firebaseUid, {
    plan: subscription.metadata?.plan,
    status: subscription.status,
    stripe_customer_id:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    stripe_subscription_id: subscription.id,
    current_period_end: subscription.items.data[0]?.current_period_end
      ? new Date(
          subscription.items.data[0].current_period_end * 1000
        ).toISOString()
      : undefined,
  });

  await sendZapierEvent(`stripe.${subscription.object}.${subscription.status}`, {
    plan: subscription.metadata?.plan,
    stripe_customer_id:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    firebase_uid: firebaseUid,
  });
}

async function handleStripeEvent(event: Stripe.Event) {
  await markStripeEvent(event);

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
      break;
    default:
      break;
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET não configurado." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Header stripe-signature ausente." },
      { status: 400 }
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Assinatura inválida.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (err) {
    console.error("[stripe.webhook] erro ao processar evento", err);
    return NextResponse.json(
      { error: "Erro ao processar evento Stripe." },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
