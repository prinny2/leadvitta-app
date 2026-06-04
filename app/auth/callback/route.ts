import { NextResponse } from "next/server";

// Firebase usa signInWithPopup — não há callback de OAuth.
// Rota mantida para compatibilidade com links antigos.
export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const next = searchParams.get("next") || "/dashboard";
  return NextResponse.redirect(`${origin}${next}`);
}
