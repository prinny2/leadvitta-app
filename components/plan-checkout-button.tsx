"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/config";
import type { User } from "firebase/auth";
import type { BillingInterval, BillingPlan } from "@/lib/billing";
import { getGaClientId, trackEvent } from "@/components/Analytics";

type PlanCheckoutButtonProps = {
  plan: BillingPlan;
  interval?: BillingInterval;
  className?: string;
  children: React.ReactNode;
};

/** Cookie da sessão (login Firebase ou ponte Clerk→Firebase). */
function hasFirebaseSession() {
  return typeof document !== "undefined" && document.cookie.includes("firebase_auth=1");
}

/**
 * Firebase (Auth + store) só carrega para quem tem sessão: este botão aparece na
 * landing, e baixar o SDK no clique de um visitante atrasava o checkout em ~1 s
 * no celular sem servir para nada (sem sessão, `currentUser` é sempre null logo
 * após iniciar o Firebase, porque a sessão é restaurada de forma assíncrona).
 */
function loadAuthStore() {
  return import("@/lib/store");
}

/** Aquecer o chunk no toque/foco, só para quem está logado. */
function warmAuthStore() {
  if (isFirebaseConfigured && hasFirebaseSession()) void loadAuthStore();
}

/** Abre Stripe Checkout — sem exigir login; o Stripe coleta o e-mail. */
export function PlanCheckoutButton({
  plan,
  interval = "monthly",
  className,
  children,
}: PlanCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleClick() {
    setErro("");
    trackEvent("select_plan", { plan, interval });

    if (!isFirebaseConfigured) {
      window.location.assign("/dashboard");
      return;
    }

    setLoading(true);
    try {
      trackEvent("checkout_click", { plan, interval });
      // Com Clerk, `currentUser` fica null até a ponte Clerk→Firebase terminar.
      // Se há sessão (cookie da ponte), espera o usuário pra mandar o uid — senão
      // quem já está logado cai no checkout de visitante e volta pro /signup.
      // Sem sessão, nada de Firebase: o checkout sai direto como visitante.
      let user: User | null = null;
      if (hasFirebaseSession()) {
        const { waitForAuthUser } = await loadAuthStore();
        user = await waitForAuthUser();
      }
      const firebaseIdToken = user ? await user.getIdToken() : undefined;

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plan,
          interval,
          firebaseIdToken,
          customerEmail: user?.email,
          gaClientId: getGaClientId(),
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Não foi possível abrir o pagamento.");
      }

      window.location.assign(data.url);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao abrir pagamento.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        onPointerDown={warmAuthStore}
        onFocus={warmAuthStore}
        disabled={loading}
        className={className}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {children}
      </button>
      {erro ? <p className="mt-2 text-xs font-medium text-red-300" role="alert">{erro}</p> : null}
    </>
  );
}
