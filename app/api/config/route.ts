import { jsonNoStore } from "@/lib/api-security";
import {
  isAnyAIConfigured,
  isAnthropicConfigured,
  isFirebaseConfigured,
  isGa4ServerConfigured,
  isGeminiConfigured,
  isNlpServiceConfigured,
  isOpenAIConfigured,
  isStripeConfigured,
  isZApiConfigured,
  isOpsNotifyConfigured,
  openaiModel,
  anthropicModel,
  geminiModel,
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
    ai_models: {
      openai: openaiModel,
      anthropic: anthropicModel,
      gemini: geminiModel,
    },
    nlp_enabled: isNlpServiceConfigured,
    ga4_server_enabled: isGa4ServerConfigured,
    ops_notify_enabled: isOpsNotifyConfigured,
    zapi_enabled: isZApiConfigured,
    whatsapp_provider: getWhatsAppProvider().name,
  });
}
