"use client";

import { MessageCircle } from "lucide-react";
import { trackEvent } from "@/components/Analytics";

const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");

const MENSAGEM = "Oi! Vi a página do setup de WhatsApp e quero saber como funciona para a minha clínica.";

/** Abre a conversa com o texto pronto. Sem número configurado, não renderiza. */
export function SetupWhatsappCta({ origem, label }: { origem: string; label: string }) {
  if (!WHATSAPP_NUMBER) return null;

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MENSAGEM)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("contact_whatsapp", { source: `setup_${origem}` })}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1FA855] px-6 py-3 text-center text-base font-semibold text-white transition hover:brightness-110"
    >
      <MessageCircle size={20} aria-hidden />
      {label}
    </a>
  );
}
