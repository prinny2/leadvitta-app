import { NextResponse } from "next/server";
import { isStripeConfigured, isFirebaseConfigured, isOpenAIConfigured, isAnthropicConfigured } from "@/lib/config";

export const runtime = "nodejs";

/**
 * Endpoint para expor capacidades do backend para a UI com segurança.
 * Não vaza segredos, apenas booleanos indicando o que está ativo.
 */
export async function GET() {
  return NextResponse.json({
    stripe_enabled: isStripeConfigured,
    firebase_enabled: isFirebaseConfigured,
    ai_providers: {
      openai: isOpenAIConfigured,
      anthropic: isAnthropicConfigured,
    }
  });
}
