// Detecta o que está configurado para alternar entre "modo real" e
// "modo demonstração" (sem nenhuma chave o app ainda roda).

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True quando há projeto Firebase configurado (login + banco). */
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

/** Chave pública VAPID para Web Push (FCM). Pública por design — vai no frontend. */
export const firebaseVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/** True quando há chave da Anthropic (apenas no servidor). */
export const isAnthropicConfigured = !!process.env.ANTHROPIC_API_KEY;

/** True quando há chave da OpenAI (apenas no servidor). */
export const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;

/** True quando há chave do Gemini/Google AI (apenas no servidor). */
export const isGeminiConfigured =
  !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_API_KEY;

/** True quando pelo menos um provedor real de IA está configurado. */
export const isAnyAIConfigured =
  isOpenAIConfigured || isAnthropicConfigured || isGeminiConfigured;

/** Modelo legado/compatível. Prefira os modelos específicos por provedor. */
export const aiModel = process.env.AI_MODEL || "gpt-4o-mini";

/** Modelos por provedor, para fallback sem colisão entre vendors. */
export const openaiModel =
  process.env.OPENAI_MODEL ||
  (aiModel.startsWith("gpt") || aiModel.startsWith("o") ? aiModel : "gpt-4o-mini");

export const anthropicModel =
  process.env.ANTHROPIC_MODEL ||
  (aiModel.startsWith("claude") ? aiModel : "claude-haiku-4-5");

export const geminiModel =
  process.env.GEMINI_MODEL ||
  (aiModel.startsWith("gemini") ? aiModel : "gemini-2.5-flash");

/** URL pública do site. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** True quando há Stripe configurado no servidor. */
export const isStripeConfigured =
  !!process.env.STRIPE_SECRET_KEY?.trim() &&
  (!!process.env.STRIPE_PRICE_ID_START ||
    !!process.env.STRIPE_PRICE_ID_PRO ||
    !!process.env.STRIPE_PRICE_ID_PREMIUM);

/** True quando há webhook do Zapier configurado no servidor. */
export const isZapierConfigured = !!process.env.ZAPIER_WEBHOOK_URL;

/** True quando o WhatsApp (Z-API) está configurado. */
export const isZApiConfigured =
  !!process.env.ZAPI_INSTANCE_ID?.trim() && !!process.env.ZAPI_TOKEN?.trim();

/** Alias legado — sempre Z-API. */
export const isWhatsappConfigured = isZApiConfigured;
