"use client";

import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/components/Analytics";

// Mesmo número público do botão flutuante (components/whatsapp-cta.tsx).
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");

const MENSAGEM = "Oi! Vi no site a implantação da LeadBellus e quero saber como funciona para o meu negócio.";

/** Botão "Quero a implantação": abre o WhatsApp comercial com a mensagem pronta. */
export function ImplantacaoCta({ style, className }: { style?: React.CSSProperties; className?: string }) {
  const href = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MENSAGEM)}`
    : "mailto:suporte@leadbellus.com.br?subject=Implanta%C3%A7%C3%A3o%20LeadBellus";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
      onClick={() => trackEvent("contact_whatsapp", { source: "implantacao" })}
    >
      Quero a implantação <ArrowRight size={17} aria-hidden="true" />
    </a>
  );
}
