import { jsonNoStore } from "@/lib/api-security";
import {
  isAnyAIConfigured,
  isAnthropicConfigured,
  isFirebaseConfigured,
  isGeminiConfigured,
  isOpenAIConfigured,
  isStripeConfigured,
  isZApiConfigured,
  isZapierConfigured,
} from "@/lib/config";
import { getWhatsAppProvider } from "@/lib/whatsapp";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

/**
 * Endpoint para expor capacidades do backend para a UI com segurança.
 * Não vaza segredos, apenas booleanos indicando o que está ativo.
 */
export async function GET() {
  return jsonNoStore({
    stripe_enabled: isStripeConfigured,
    firebase_enabled: isFirebaseConfigured,
    firebase_admin_enabled: isFirebaseAdminConfigured(),
    ai_enabled: isAnyAIConfigured,
    ai_providers: {
      openai: isOpenAIConfigured,
      anthropic: isAnthropicConfigured,
      gemini: isGeminiConfigured,
    },
    zapier_enabled: isZapierConfigured,
    zapi_enabled: isZApiConfigured,
    whatsapp_provider: getWhatsAppProvider().name,
  });
}
