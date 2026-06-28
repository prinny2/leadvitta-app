"use client";

import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { enableWebPush, type EnableReason } from "@/lib/firebase/messaging";
import { saveFcmToken } from "@/lib/store";

const MOTIVOS: Record<EnableReason, string> = {
  firebase_off: "Notificações indisponíveis neste ambiente.",
  sem_vapid_key: "Falta configurar a chave de notificações (VAPID).",
  nao_suportado: "Seu navegador não suporta notificações push.",
  permissao_negada:
    "Permissão negada. Habilite as notificações nas configurações do navegador.",
  sem_token: "Não foi possível gerar o token deste dispositivo.",
  erro: "Algo deu errado ao ativar. Tente novamente.",
};

export function NotificacoesToggle() {
  const [estado, setEstado] = useState<"idle" | "loading" | "ok" | "erro">(
    "idle",
  );
  const [msg, setMsg] = useState("");

  async function ativar() {
    setEstado("loading");
    setMsg("");
    const r = await enableWebPush();
    if (r.ok && r.token) {
      try {
        await saveFcmToken(r.token);
      } catch {
        // O token foi gerado; falha ao salvar não impede o uso imediato.
      }
      setEstado("ok");
      return;
    }
    setEstado("erro");
    setMsg(MOTIVOS[r.reason ?? "erro"]);
  }

  return (
    <Card>
      <CardBody className="space-y-3">
        <CardTitle className="flex items-center gap-2">
          <Bell size={18} className="text-brand-500" /> Notificações
        </CardTitle>
        <p className="text-sm text-muted">
          Receba um aviso no navegador quando algo importante acontecer — mesmo
          com a aba do LeadBellus fechada.
        </p>

        {estado === "ok" ? (
          <p className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
            <Check size={16} /> Notificações ativadas neste dispositivo.
          </p>
        ) : (
          <Button
            onClick={ativar}
            disabled={estado === "loading"}
            variant="outline"
          >
            {estado === "loading" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Bell size={16} />
            )}
            Ativar notificações
          </Button>
        )}

        {estado === "erro" && msg && (
          <p className="text-sm text-red-600">{msg}</p>
        )}
      </CardBody>
    </Card>
  );
}
