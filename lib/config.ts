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

/** True quando há chave da Anthropic (apenas no servidor). */
export const isAnthropicConfigured = !!process.env.ANTHROPIC_API_KEY;

/** True quando há chave da OpenAI (apenas no servidor). */
export const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;

/** Modelo padrão da IA. */
export const aiModel = process.env.AI_MODEL || (isOpenAIConfigured ? "gpt-4o-mini" : "claude-haiku-4-5");

/** URL pública do site. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
