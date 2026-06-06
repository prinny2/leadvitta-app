"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import type { BillingPlan } from "@/lib/billing";
import { trackEvent } from "./Analytics";

type PlanCTAProps = {
  plan: BillingPlan;
  className?: string;
  children: React.ReactNode;
};

/**
 * CTA de plano para a landing (página pública).
 *
 * Regra de funil — evita assinatura órfã no Stripe:
 *  - sem Firebase configurado  => modo demonstração, manda pro app;
 *  - visitante DESLOGADO        => vai pro /signup levando o plano escolhido
 *    (o checkout precisa de firebase_uid pra mapear o pagamento à conta);
 *  - usuário LOGADO             => abre o Stripe Checkout direto.
 */
export function PlanCTA({ plan, className, children }: PlanCTAProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleClick() {
    setErro("");
    trackEvent("initiate_checkout", { plan });

    if (!isFirebaseConfigured) {
      router.push("/dashboard");
      return;
    }

    const user = getFirebaseAuth().currentUser;
    if (!user) {
      router.push(`/signup?plan=${plan}`);
      return;
    }

    setLoading(true);
    try {
      const firebaseIdToken = await user.getIdToken();
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plan,
          firebaseIdToken,
          customerEmail: user.email,
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
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={className}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {children}
      </button>
      {erro ? <p className="mt-2 text-xs text-red-600">{erro}</p> : null}
    </>
  );
}
