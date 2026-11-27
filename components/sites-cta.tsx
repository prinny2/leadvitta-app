"use client";

import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/components/Analytics";

// Mesmo número público do botão flutuante (components/whatsapp-cta.tsx).
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");

const MENSAGEM = "Oi! Vi a página do site-catálogo da LeadBellus e quero um para a minha loja.";

/**
 * Botão do site-catálogo (/sites): abre o WhatsApp comercial com a mensagem
 * pronta. Mesmo padrão de components/implantacao-cta.tsx; `posicao` só separa
 * os cliques por lugar da página no GA4.
 */
export function SitesCta({
  posicao,
  label = "Quero meu site-catálogo",
  style,
  className,
}: {
  posicao: string;
  label?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const href = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MENSAGEM)}`
    : "mailto:suporte@leadbellus.com.br?subject=Site-cat%C3%A1logo%20para%20loja";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
      onClick={() => trackEvent("contact_whatsapp", { source: "sites", posicao })}
    >
      {label} <ArrowRight size={17} aria-hidden="true" />
    </a>
  );
}
