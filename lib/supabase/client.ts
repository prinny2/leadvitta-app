import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "@/lib/config";

/**
 * Cliente Supabase para uso no navegador (client components).
 * Só chame quando `isSupabaseConfigured` for verdadeiro.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl as string, supabaseAnonKey as string);
}
