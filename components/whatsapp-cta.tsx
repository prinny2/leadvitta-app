"use client";

import { MessageCircle } from "lucide-react";
import { trackEvent } from "@/components/Analytics";

// Número público de atendimento comercial (só dígitos, com DDI).
// Sem env => o botão simplesmente não renderiza (mesmo padrão dos feature flags).
const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
).replace(/\D/g, "");

const DEFAULT_MESSAGE =
  "Oi! Vi o LeadBellus e quero saber como ele ajuda minha clínica a responder melhor no WhatsApp.";

/**
 * Botão flutuante "falar no WhatsApp" da landing.
 * Fecha o ciclo dos anúncios click-to-WhatsApp: quem chega pela LP também
 * consegue falar com a gente pelo mesmo canal que o produto atende.
 */
export function WhatsAppCta() {
  if (!WHATSAPP_NUMBER) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o LeadBellus no WhatsApp"
      onClick={() => trackEvent("contact_whatsapp", { source: "landing_float" })}
      className="wa-cta"
      style={{
        position: "fixed",
        right: "16px",
        bottom: "calc(88px + env(safe-area-inset-bottom))",
        zIndex: 59,
        width: "54px",
        height: "54px",
        borderRadius: "50%",
        background: "#1FA855",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 14px 34px rgba(31,168,85,0.4)",
        textDecoration: "none",
      }}
    >
      <MessageCircle size={26} />
      <style>{`
        .wa-cta { transition: transform .2s ease; }
        .wa-cta:hover { transform: translateY(-2px) scale(1.05); }
        @media (min-width: 768px) { .wa-cta { bottom: 24px !important; } }
        @media (prefers-reduced-motion: reduce) { .wa-cta { transition: none; } }
      `}</style>
    </a>
  );
}
