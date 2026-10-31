"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import type { BillingPlan } from "@/lib/billing";
import { Button, type ButtonProps } from "@/components/ui/button";
import { getGaClientId, trackEvent } from "./Analytics";

type CheckoutButtonProps = Omit<ButtonProps, "onClick"> & {
  plan: BillingPlan;
};

export function CheckoutButton({
  plan,
  children,
  disabled,
  ...props
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function iniciarCheckout() {
    setLoading(true);
    setErro("");

    try {
      trackEvent("checkout_click", { plan });
      const user = isFirebaseConfigured ? getFirebaseAuth().currentUser : null;
      const firebaseIdToken = user ? await user.getIdToken() : undefined;

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plan,
          firebaseIdToken: firebaseIdToken ?? undefined,
          customerEmail: user?.email,
          gaClientId: getGaClientId(),
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Não foi possível abrir o checkout.");
      }

      window.location.assign(data.url);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao iniciar checkout.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={iniciarCheckout}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
        {children}
      </Button>
      {erro && <p className="text-xs font-medium text-red-300" role="alert">{erro}</p>}
    </div>
  );
}
