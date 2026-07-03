// Detecta o que está configurado para alternar entre "modo real" e
// "modo demonstração" (sem nenhuma chave o app ainda roda).

// Config do Firebase web é PÚBLICA por design (vai no bundle do cliente), mas
// a API key deve vir do ambiente para não ficar committed no repo.
// Os identificadores abaixo são públicos por design (aparecem no bundle do
// cliente de qualquer app Firebase). Os fallbacks hardcoded garantem que
// produção continua funcionando mesmo se as NEXT_PUBLIC_FIREBASE_* não
// estiverem setadas na Vercel — apenas a apiKey é obrigatória via env.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "leadvitta-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "leadvitta-app",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "leadvitta-app.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "87102725202",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:87102725202:web:e48089af9c157b31b5d38b",
};

/** True quando há projeto Firebase configurado (login + banco). */
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

/** Chave pública do Clerk para a sessão do navegador. */
export const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() || "";

/** True quando a UI pode usar Clerk no cliente. */
export const isClerkClientConfigured = !!clerkPublishableKey;

/** True quando middleware/server actions podem validar sessão Clerk. */
export const isClerkServerConfigured =
  isClerkClientConfigured && !!process.env.CLERK_SECRET_KEY?.trim();

/** Chave pública VAPID para Web Push (FCM). Pública por design — vai no frontend. */
export const firebaseVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/** True quando o Web Push está pronto pra uso (Firebase + chave VAPID pública). */
export const isWebPushConfigured = isFirebaseConfigured && !!firebaseVapidKey;

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

/** URL do microserviço leadvitta-nlp (classificação por ML). Apenas no servidor. */
export const nlpServiceUrl = process.env.NLP_SERVICE_URL?.trim() || "";

/** True quando o serviço externo de NLP (leadvitta-nlp) está configurado. */
export const isNlpServiceConfigured = !!nlpServiceUrl;

/** Measurement ID público do GA4 para o bundle client. Sem fallback hardcoded. */
export const publicGa4MeasurementId =
  process.env.NEXT_PUBLIC_GA4_ID?.trim() || "";

/** Measurement ID usado pelo servidor; pode usar env server-only ou a pública. */
export const ga4MeasurementId =
  process.env.GA4_MEASUREMENT_ID?.trim() || publicGa4MeasurementId;

/** True quando a tag GA4 client-side deve carregar. */
export const isGA4Configured = !!publicGa4MeasurementId;

/** Secret do Measurement Protocol. Nunca use NEXT_PUBLIC_. */
export const ga4ApiSecret = process.env.GA4_API_SECRET?.trim() || "";

/** True quando o espelho server-side do GA4 está pronto. */
export const isGa4ServerConfigured = !!ga4MeasurementId && !!ga4ApiSecret;

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

/** Número que recebe alertas operacionais (signup, checkout, waitlist). Só dígitos. */
export const opsNotifyPhone = (
  process.env.OPS_WHATSAPP_NUMBER || ""
).replace(/\D/g, "");

/** True quando Z-API + número de alerta estão configurados. */
export const isOpsNotifyConfigured =
  !!process.env.ZAPI_INSTANCE_ID?.trim() &&
  !!process.env.ZAPI_TOKEN?.trim() &&
  !!opsNotifyPhone;

/** True quando o WhatsApp (Z-API) está configurado. */
export const isZApiConfigured =
  !!process.env.ZAPI_INSTANCE_ID?.trim() && !!process.env.ZAPI_TOKEN?.trim();

/** Alias legado — sempre Z-API. */
export const isWhatsappConfigured = isZApiConfigured;
