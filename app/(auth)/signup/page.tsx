"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { parseBillingPlan } from "@/lib/billing";
import { VisualAuthPanel } from "@/components/visual-auth-panel";
import { Card, CardBody } from "@/components/ui/card";
import { trackEvent } from "@/components/Analytics";
import { buildPurchaseEventParams } from "@/lib/analytics-purchase";

function SignupInner() {
  const params = useSearchParams();
  const plan = parseBillingPlan(params.get("plan"));
  const rawNext = params.get("next");
  const checkoutAfter = rawNext === "checkout";
  // Deep-link do middleware (?next=/rota): só caminhos internos, senão /dashboard.
  const nextPath =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/dashboard";
  const checkoutSucesso = params.get("checkout") === "sucesso";
  const sessionId = params.get("session_id");
  const purchasePlan = params.get("plan");
  const purchaseInterval = params.get("interval");

  // Guest checkout: o pagamento acontece antes da conta existir e o Stripe
  // devolve aqui. Dispara o purchase (como /configuracoes faz pós-login),
  // uma única vez por session_id — refresh/revisita da URL não reconta.
  useEffect(() => {
    if (!checkoutSucesso) return;
    const key = `lb_purchase_${sessionId ?? "sem_sessao"}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      // localStorage indisponível: dispara mesmo assim
    }
    trackEvent(
      "purchase",
      buildPurchaseEventParams({
        stripeSessionId: sessionId,
        plan: purchasePlan,
        interval: purchaseInterval,
      })
    );
  }, [checkoutSucesso, sessionId, purchasePlan, purchaseInterval]);

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
          next={nextPath}
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
