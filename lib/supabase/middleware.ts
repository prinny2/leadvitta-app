import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  supabaseUrl,
  supabaseAnonKey,
  isSupabaseConfigured,
} from "@/lib/config";

const ROTAS_PROTEGIDAS = [
  "/dashboard",
  "/gerador",
  "/objecoes",
  "/follow-up",
  "/scripts",
  "/historico",
  "/configuracoes",
];

/**
 * Atualiza a sessão do Supabase em cada request e protege as rotas do app.
 * Em modo demonstração (sem Supabase) deixa tudo passar.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl as string,
    supabaseAnonKey as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const protegida = ROTAS_PROTEGIDAS.some((p) => path.startsWith(p));

  if (!user && protegida) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
