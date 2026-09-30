"use client";

import dynamic from "next/dynamic";
import { LoadingRespostas } from "@/components/loading-respostas";

const LandingWhatsAppDemo = dynamic(
  () =>
    import("@/components/landing-whatsapp-demo").then(
      (mod) => mod.LandingWhatsAppDemo
    ),
  {
    ssr: false,
    loading: () => <LoadingRespostas etapas={["Carregando a demo…"]} />,
  }
);

export function DeferredLandingWhatsAppDemo() {
  return <LandingWhatsAppDemo />;
}
