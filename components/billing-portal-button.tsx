"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function abrirPortal() {
    setErro("");

    if (!isFirebaseConfigured) {
      setErro("O portal fica disponível quando o login Firebase está ativo.");
      return;
    }

    const user = getFirebaseAuth().currentUser;
    if (!user) {
      setErro("Entre na sua conta para gerenciar a assinatura.");
      return;
    }

    setLoading(true);
    try {
      const firebaseIdToken = await user.getIdToken();
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firebaseIdToken }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Não foi possível abrir o portal.");
      }

      window.location.assign(data.url);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao abrir o portal de assinatura."
      );
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={abrirPortal}
        disabled={loading}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ExternalLink size={16} />
        )}
        Gerenciar assinatura
      </Button>
      {erro ? <p className="text-xs text-red-600">{erro}</p> : null}
    </div>
  );
}
