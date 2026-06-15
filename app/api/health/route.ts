import { NextResponse } from "next/server";
import {
  isAnyAIConfigured,
  isAnthropicConfigured,
  isFirebaseConfigured,
  isGeminiConfigured,
  isOpenAIConfigured,
  isStripeConfigured,
  isWhatsappConfigured,
} from "@/lib/config";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "leadbellus",
    time: new Date().toISOString(),
    readiness: {
      ai: isAnyAIConfigured,
      firebase: isFirebaseConfigured,
      firebase_admin: isFirebaseAdminConfigured(),
      stripe: isStripeConfigured,
      whatsapp: isWhatsappConfigured,
    },
    ai_providers: {
      openai: isOpenAIConfigured,
      anthropic: isAnthropicConfigured,
      gemini: isGeminiConfigured,
    },
  });
}
