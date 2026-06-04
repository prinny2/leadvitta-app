"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getClinica } from "@/lib/store";

/**
 * Redireciona para /onboarding enquanto o DNA da Clínica não estiver concluído.
 * A própria página /onboarding é isenta para evitar loop.
 */
export function OnboardingGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname.startsWith("/onboarding")) return;
    let active = true;
    getClinica().then((c) => {
      if (active && !c.onboarded) router.replace("/onboarding");
    });
    return () => {
      active = false;
    };
  }, [pathname, router]);

  return null;
}
