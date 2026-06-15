"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { parseBillingPlan } from "@/lib/billing";
import { VisualAuthPanel } from "@/components/visual-auth-panel";
import { Card, CardBody } from "@/components/ui/card";

function SignupInner() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = parseBillingPlan(params.get("plan"));
  const checkoutAfter = params.get("next") === "checkout";
  const [clinicName, setClinicName] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("lb_dna_draft");
      if (!raw) return;
      const draft = JSON.parse(raw) as { nome_clinica?: string };
      if (draft.nome_clinica) setClinicName(draft.nome_clinica);
    } catch {
      /* ignora */
    }
  }, []);

  if (!plan && !checkoutAfter) {
    router.replace("/onboarding");
    return null;
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardBody className="space-y-6 p-6 sm:p-8">
        <Link
          href="/onboarding?aba=planos"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft size={16} />
          Voltar ao funil
        </Link>
        <VisualAuthPanel
          mode="signup"
          plan={plan ?? "start"}
          checkoutAfter={checkoutAfter || !!plan}
          clinicName={clinicName}

          next="/onboarding"
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