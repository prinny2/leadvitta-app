import { isSupabaseConfigured } from "@/lib/config";
import { Info } from "lucide-react";

/**
 * Aviso de modo demonstração (quando não há Supabase configurado).
 * Nesse modo os dados ficam salvos só no navegador.
 */
export function DemoBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="flex items-start gap-2 border-b border-lavender-200 bg-lavender-50 px-4 py-2 text-xs text-lavender-700 sm:px-6">
      <Info size={15} className="mt-0.5 shrink-0" />
      <span>
        <strong>Modo demonstração:</strong> sem login e com dados salvos só neste
        navegador. Configure o Supabase e a chave da IA (veja o README) para
        ativar login, salvamento na nuvem e respostas reais.
      </span>
    </div>
  );
}
