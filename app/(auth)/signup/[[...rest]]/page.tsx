"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { parseBillingPlan } from "@/lib/billing";
import { VisualAuthPanel } from "@/components/visual-auth-panel";
import { Card, CardBody } from "@/components/ui/card";
import { trackEvent } from "@/components/Analytics";
import { LegalConsentLinks } from "@/components/legal-consent-links";
import { isClerkClientConfigured } from "@/lib/config";

function SignupInner() {
  const params = useSearchParams();
  const plan = parseBillingPlan(params.get("plan"));
  const rawNext = params.get("next");
  const checkoutAfter = rawNext === "checkout";
  const checkoutSucesso = params.get("checkout") === "sucesso";
  const sessionId = params.get("session_id");
  const postCheckoutNext = `/configuracoes?checkout=sucesso${
    sessionId ? `&session_id=${encodeURIComponent(sessionId)}` : ""
  }&onboarding=1`;
  // Deep-link do middleware (?next=/rota): só caminhos internos, senão /dashboard.
  const nextPath =
    checkoutSucesso
      ? postCheckoutNext
      : rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/configuracoes?onboarding=1";
  const redirectAfterAuth =
    checkoutAfter && plan
      ? `/configuracoes?plan=${encodeURIComponent(plan)}&next=checkout`
      : nextPath;
  const signInParams = new URLSearchParams();
  if (plan) signInParams.set("plan", plan);
  if (checkoutAfter) signInParams.set("next", "checkout");
  const signInUrl = `/login${
    signInParams.size ? `?${signInParams.toString()}` : ""
  }`;

  // Guest checkout: o pagamento acontece antes da conta existir e o Stripe
  // devolve aqui. O purchase real vem do webhook assinado; aqui só marcamos
  // retorno de checkout uma única vez por session_id.
  useEffect(() => {
    if (!checkoutSucesso) return;
    const key = `lb_checkout_returned_${sessionId ?? "sem_sessao"}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      // localStorage indisponível: dispara mesmo assim
    }
    trackEvent("checkout_returned", { stripe_session_id: sessionId });
  }, [checkoutSucesso, sessionId]);

  return (
    <Card className="w-full max-w-md">
      <CardBody className="p-6 sm:p-8">
        {checkoutSucesso && (
          <div className="mb-5 rounded-2xl border border-gold-500/30 bg-gold-500/10 px-4 py-3">
            <p className="text-sm font-semibold text-gold-300">
              Pagamento recebido.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-champagne-300">
              Crie ou entre com o <strong>mesmo e-mail</strong> usado no
              pagamento. Assim o LeadBellus libera seu plano automaticamente.
            </p>
          </div>
        )}
        {isClerkClientConfigured ? (
          <SignUp
            routing="path"
            path="/signup"
            signInUrl={signInUrl}
            forceRedirectUrl={redirectAfterAuth}
            fallbackRedirectUrl={redirectAfterAuth}
          />
        ) : (
          <VisualAuthPanel
            mode="signup"
            plan={plan ?? undefined}
            checkoutAfter={checkoutAfter}
            next={redirectAfterAuth}
            compact
          />
        )}
        <LegalConsentLinks tone="light" className="mt-4" />
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
