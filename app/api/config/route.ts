import { jsonNoStore } from "@/lib/api-security";
import { isStripeConfigured, isFirebaseConfigured, isOpenAIConfigured, isAnthropicConfigured } from "@/lib/config";
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
    ai_providers: {
      openai: isOpenAIConfigured,
      anthropic: isAnthropicConfigured,
    }
  });
}
