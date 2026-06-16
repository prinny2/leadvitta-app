"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getClinica } from "@/lib/store";

/**
 * Redireciona para /configuracoes enquanto o DNA da Clínica não estiver concluído.
 */
export function OnboardingGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname.startsWith("/configuracoes")) return;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search);
      if (q.get("plan") || q.get("checkout")) return;
    }
    let active = true;
    getClinica().then((c) => {
      if (active && !c.onboarded) router.replace("/configuracoes");
    });
    return () => {
      active = false;
    };
  }, [pathname, router]);

  return null;
}
