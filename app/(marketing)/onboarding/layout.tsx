import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

// Etapa do funil (página client): fora do índice, com título próprio.
export const metadata: Metadata = pageMetadata({
  path: "/onboarding",
  title: "Teste grátis — LeadBellus",
  description: "Teste grátis: cole a mensagem da cliente e veja 3 respostas no tom da sua clínica.",
  index: false,
});

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
