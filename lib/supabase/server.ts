import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseAnonKey } from "@/lib/config";

/**
 * Cliente Supabase para uso no servidor (Server Components, Route Handlers).
 * No Next 15 `cookies()` é assíncrono.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl as string, supabaseAnonKey as string, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Chamado a partir de um Server Component — o middleware cuida do refresh.
        }
      },
    },
  });
}
