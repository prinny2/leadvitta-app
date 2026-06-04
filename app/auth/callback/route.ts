import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  if (code && isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("Erro no callback do Auth:", error.message);
        return NextResponse.redirect(`${origin}/login?erro=${encodeURIComponent("Erro ao verificar o login. Tente novamente.")}`);
      }
    } catch (err) {
      console.error("Exceção inesperada no callback do Auth:", err);
      return NextResponse.redirect(`${origin}/login?erro=${encodeURIComponent("Ocorreu um erro inesperado. Tente novamente.")}`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
