import { NextResponse, type NextRequest } from "next/server";
import { isFirebaseConfigured } from "@/lib/config";

// "/onboarding" é PÚBLICO de propósito: é o funil de captação de clínicas
// (sem login) — não entra aqui.
const ROTAS_PROTEGIDAS = [
  "/dashboard",
  "/conversas",
  "/gerador",
  "/objecoes",
  "/follow-up",
  "/scripts",
  "/historico",
  "/configuracoes",
];

export function updateSession(request: NextRequest) {
  if (!isFirebaseConfigured) return NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;
  const protegida = ROTAS_PROTEGIDAS.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
  if (!protegida) return NextResponse.next({ request });

  const autenticado = !!request.cookies.get("firebase_auth");
  if (!autenticado) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    url.search = "";
    url.searchParams.set("entrar", "1");
    url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
