import { type NextRequest, NextResponse } from "next/server";
import {
  buildCanonicalRedirectUrl,
  isLegacyPublicHost,
  shouldKeepLegacyApiRoute,
} from "@/lib/canonical-host";
import { updateSession } from "@/lib/firebase/middleware";

export async function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname;
  const pathname = request.nextUrl.pathname;

  if (isLegacyPublicHost(hostname) && !shouldKeepLegacyApiRoute(pathname)) {
    const target = buildCanonicalRedirectUrl(
      pathname,
      request.nextUrl.search,
    );
    return NextResponse.redirect(target, 308);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    // Tudo, menos arquivos estáticos e imagens.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
