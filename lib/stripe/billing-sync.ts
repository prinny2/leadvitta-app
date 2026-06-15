import type Stripe from "stripe";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

export type ClinicBilling = {
  plan?: string;
  status?: string;
  stripe_customer_id?: string;
  stripe_checkout_session_id?: string;
  stripe_subscription_id?: string;
  current_period_end?: string;
  updated_at?: string;
  linked_from_email?: string;
};

export function normalizeBillingEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function applyClinicBilling(
  firebaseUid: string,
  billing: ClinicBilling
): Promise<void> {
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

/** Guarda cobrança por e-mail quando o checkout foi guest (sem firebase_uid). */
export async function saveBillingPending(
  email: string,
  billing: ClinicBilling
): Promise<void> {
  const db = getFirebaseAdminDb();
  if (!db) return;
  const key = normalizeBillingEmail(email);
  if (!key) return;

  await db.collection("billing_pending").doc(key).set(
    {
      ...billing,
      email: key,
      updated_at: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Liga assinatura Stripe pendente (mesmo e-mail do checkout) à conta Firebase.
 * Idempotente — seguro chamar após signup/login.
 */
export async function reconcileBillingForUser(
  firebaseUid: string,
  email?: string | null
): Promise<{ linked: boolean; reason?: string }> {
  const db = getFirebaseAdminDb();
  if (!db) return { linked: false, reason: "sem_db" };
  if (!firebaseUid) return { linked: false, reason: "sem_uid" };

  const clinicaRef = db.collection("clinicas").doc(firebaseUid);
  const clinicaSnap = await clinicaRef.get();
  const existing = clinicaSnap.data()?.billing as ClinicBilling | undefined;

  if (existing?.stripe_subscription_id || existing?.stripe_customer_id) {
    return { linked: false, reason: "ja_tem_billing" };
  }

  const normalized = email ? normalizeBillingEmail(email) : "";
  if (!normalized) return { linked: false, reason: "sem_email" };

  const pendingSnap = await db.collection("billing_pending").doc(normalized).get();
  if (!pendingSnap.exists) {
    return { linked: false, reason: "sem_pendencia" };
  }

  const pending = pendingSnap.data() as ClinicBilling;
  await applyClinicBilling(firebaseUid, {
    ...pending,
    linked_from_email: normalized,
  });
  await pendingSnap.ref.delete();

  return { linked: true };
}

function subscriptionBilling(subscription: Stripe.Subscription): ClinicBilling {
  return {
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
  };
}

export async function resolveSubscriptionEmail(
  subscription: Stripe.Subscription,
  stripe: Stripe
): Promise<string | undefined> {
  const fromMeta = subscription.metadata?.firebase_email?.trim();
  if (fromMeta) return normalizeBillingEmail(fromMeta);

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;
  if (!customerId) return undefined;

  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return undefined;
  return customer.email ? normalizeBillingEmail(customer.email) : undefined;
}

/** Atualiza clínica ou billing_pending conforme uid/e-mail da assinatura. */
export async function syncSubscriptionBilling(
  subscription: Stripe.Subscription,
  stripe: Stripe
): Promise<"clinica" | "pending" | "skipped"> {
  const billing = subscriptionBilling(subscription);
  const firebaseUid = subscription.metadata?.firebase_uid?.trim();

  if (firebaseUid) {
    await applyClinicBilling(firebaseUid, billing);
    return "clinica";
  }

  const email = await resolveSubscriptionEmail(subscription, stripe);
  if (email) {
    await saveBillingPending(email, billing);
    return "pending";
  }

  console.warn(
    "[billing-sync] subscription sem firebase_uid nem e-mail",
    subscription.id
  );
  return "skipped";
}