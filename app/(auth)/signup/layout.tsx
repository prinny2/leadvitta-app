import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

// A página é client component; o metadata dela mora aqui.
export const metadata: Metadata = pageMetadata({
  path: "/signup",
  title: "Criar conta — LeadBellus",
  description: "Crie sua conta LeadBellus.",
  index: false,
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
