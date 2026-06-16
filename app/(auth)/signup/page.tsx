"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { parseBillingPlan } from "@/lib/billing";
import { VisualAuthPanel } from "@/components/visual-auth-panel";
import { Card, CardBody } from "@/components/ui/card";

function SignupInner() {
  const params = useSearchParams();
  const plan = parseBillingPlan(params.get("plan"));
  const checkoutAfter = params.get("next") === "checkout";

  return (
    <Card className="w-full max-w-md">
      <CardBody className="p-6 sm:p-8">
        <VisualAuthPanel
          mode="signup"
          plan={plan ?? undefined}
          checkoutAfter={checkoutAfter}
          next="/dashboard"
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
