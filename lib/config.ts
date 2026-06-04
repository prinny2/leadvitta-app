// Detecta o que está configurado para alternar entre "modo real" e
// "modo demonstração" (sem nenhuma chave o app ainda roda).

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True quando há projeto Supabase configurado (login + banco). */
export const isSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  supabaseUrl.startsWith("http");

/** True quando há chave da Anthropic (apenas no servidor). */
export const isAnthropicConfigured = !!process.env.ANTHROPIC_API_KEY;

/** True quando há chave da OpenAI (apenas no servidor). */
export const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;

/** Modelo padrão da IA. */
export const aiModel = process.env.AI_MODEL || "claude-3-5-sonnet-20241022";
export const openAIModel = process.env.OPENAI_MODEL || "gpt-4o";

/** URL pública do site (redirecionamento de OAuth). */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
