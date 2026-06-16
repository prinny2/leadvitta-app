"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { parseBillingPlan } from "@/lib/billing";
import { VisualAuthPanel } from "@/components/visual-auth-panel";
import { Card, CardBody } from "@/components/ui/card";
import { trackEvent } from "@/components/Analytics";

function SignupInner() {
  const params = useSearchParams();
  const plan = parseBillingPlan(params.get("plan"));
  const checkoutAfter = params.get("next") === "checkout";
  const checkoutSucesso = params.get("checkout") === "sucesso";
  const sessionId = params.get("session_id");

  // Guest checkout: o pagamento acontece antes da conta existir e o Stripe
  // devolve aqui. Dispara o purchase (como /configuracoes faz pós-login).
  useEffect(() => {
    if (checkoutSucesso) {
      trackEvent("purchase", { stripe_session_id: sessionId });
    }
  }, [checkoutSucesso, sessionId]);

  return (
    <Card className="w-full max-w-md">
      <CardBody className="p-6 sm:p-8">
        {checkoutSucesso && (
          <div className="mb-5 rounded-2xl border border-gold-500/30 bg-gold-500/10 px-4 py-3">
            <p className="text-sm font-semibold text-gold-300">
              Pagamento confirmado! 🎉
            </p>
            <p className="mt-1 text-xs leading-relaxed text-champagne-300">
              Crie sua conta com o <strong>mesmo e-mail</strong> usado no
              pagamento para liberar o acesso.
            </p>
          </div>
        )}
        <VisualAuthPanel
          mode="signup"
          plan={plan ?? undefined}
          checkoutAfter={checkoutAfter}
          next="/dashboard"
          compact
        />
      </CardBody>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}
