import { jsonCacheable } from "@/lib/api-security";
import {
  isAnyAIConfigured,
  isAnthropicConfigured,
  isClerkClientConfigured,
  isClerkServerConfigured,
  isFirebaseConfigured,
  isGa4ServerConfigured,
  isGeminiConfigured,
  isNlpServiceConfigured,
  isOpenAIConfigured,
  isStripeConfigured,
  isZApiConfigured,
  isOpsNotifyConfigured,
} from "@/lib/config";
import { getWhatsAppProvider } from "@/lib/whatsapp";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";
// Sonda de capacidades: precisa refletir o ambiente por request e nunca rodar
// na pré-renderização do build (env malformada não pode derrubar o deploy).
export const dynamic = "force-dynamic";

/**
 * Endpoint para expor capacidades do backend para a UI com segurança.
 * Não vaza segredos, apenas booleanos indicando o que está ativo.
 */
export async function GET() {
  return jsonCacheable({
    stripe_enabled: isStripeConfigured,
    clerk_enabled: isClerkClientConfigured,
    clerk_server_enabled: isClerkServerConfigured,
    firebase_enabled: isFirebaseConfigured,
    firebase_admin_enabled: isFirebaseAdminConfigured(),
    ai_enabled: isAnyAIConfigured,
    ai_providers: {
      openai: isOpenAIConfigured,
      anthropic: isAnthropicConfigured,
      gemini: isGeminiConfigured,
    },
    nlp_enabled: isNlpServiceConfigured,
    ga4_server_enabled: isGa4ServerConfigured,
    ops_notify_enabled: isOpsNotifyConfigured,
    zapi_enabled: isZApiConfigured,
    whatsapp_provider: getWhatsAppProvider().name,
  });
}
