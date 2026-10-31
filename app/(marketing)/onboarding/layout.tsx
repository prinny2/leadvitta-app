import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

// Etapa do funil (página client): fora do índice, com título próprio.
export const metadata: Metadata = pageMetadata({
  path: "/onboarding",
  title: "Teste grátis — LeadBellus",
  description: "Teste o LeadBellus grátis: veja como responder a uma cliente que perguntou o preço.",
  index: false,
});

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
