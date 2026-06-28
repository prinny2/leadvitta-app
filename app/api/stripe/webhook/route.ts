import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import {
  applyClinicBilling,
  saveBillingPending,
  syncSubscriptionBilling,
  type ClinicBilling,
} from "@/lib/stripe/billing-sync";
import { getStripe } from "@/lib/stripe/server";
import { sendOpsNotify } from "@/lib/ops-notify";

export const runtime = "nodejs";

/**
 * Reivindica o evento de forma idempotente. Retorna false se ele JÁ foi
 * processado — o Stripe entrega at-least-once e reentrega em retries. O
 * processed=true só é gravado no finishStripeEvent, depois do handler rodar com
 * sucesso: se o processamento falhar, o evento fica "não processado" e o retry
 * reprocessa (não perde ativação). Sem Admin SDK / sem runTransaction, falha
 * aberto (processa) — a assinatura já foi validada antes de chegar aqui.
 */
async function claimStripeEvent(event: Stripe.Event): Promise<boolean> {
  const db = getFirebaseAdminDb();
  if (!db) return true;

  const ref = db.collection("stripe_events").doc(event.id);
  try {
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists && snap.get("processed") === true) return false;
      tx.set(
        ref,
        {
          type: event.type,
          livemode: event.livemode,
          created: event.created,
          processed: false,
          received_at: new Date().toISOString(),
        },
        { merge: true },
      );
      return true;
    });
  } catch (err) {
    console.error("[stripe.webhook] falha ao reivindicar evento", err);
    return true;
  }
}

async function finishStripeEvent(event: Stripe.Event) {
  const db = getFirebaseAdminDb();
  if (!db) return;
  await db.collection("stripe_events").doc(event.id).set(
    {
      type: event.type,
      livemode: event.livemode,
      created: event.created,
      processed: true,
      processed_at: new Date().toISOString(),
    },
    { merge: true },
  );
}

async function resolveCheckoutStatus(
  session: Stripe.Checkout.Session,
): Promise<string> {
  const subRef = session.subscription;
  const subId = typeof subRef === "string" ? subRef : subRef?.id;
  if (subId) {
    const sub = await getStripe().subscriptions.retrieve(subId);
    return sub.status;
  }
  return session.payment_status || "paid";
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const firebaseUid =
    session.metadata?.firebase_uid || session.client_reference_id || undefined;
  const plan = session.metadata?.plan;
  const email =
    session.customer_details?.email ||
    session.customer_email ||
    session.metadata?.firebase_email ||
    undefined;

  const billing: ClinicBilling = {
    plan,
    status: await resolveCheckoutStatus(session),
    stripe_customer_id:
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id,
    stripe_checkout_session_id: session.id,
    stripe_subscription_id:
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id,
  };

  if (firebaseUid) {
    await applyClinicBilling(firebaseUid, billing);
  } else if (email) {
    await saveBillingPending(email, billing);
  }

  await sendOpsNotify("stripe.checkout.completed", {
    plan,
    stripe_session_id: session.id,
    stripe_customer_id:
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id,
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
  const firebaseUid = subscription.metadata?.firebase_uid?.trim() || undefined;
  await syncSubscriptionBilling(subscription, getStripe());

  await sendOpsNotify(`stripe.subscription.${subscription.status}`, {
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
  if (!(await claimStripeEvent(event))) {
    console.log(
      `[stripe.webhook] evento ${event.id} já processado — ignorando replay.`,
    );
    return;
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
      break;
    default:
      break;
  }

  await finishStripeEvent(event);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET não configurado." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Header stripe-signature ausente." },
      { status: 400 },
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
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
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
