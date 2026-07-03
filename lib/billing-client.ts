/** Liga checkout guest (mesmo e-mail) à clínica após signup/login. Idempotente. */
export async function reconcileBillingClient(idToken: string): Promise<void> {
  await fetch("/api/billing/reconcile", {
    method: "POST",
    headers: { authorization: `Bearer ${idToken}` },
  }).catch((err) => {
    console.warn("[billing-client] reconcile falhou:", err instanceof Error ? err.message : err);
  });
}