import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server";
import {
  buildCanonicalRedirectUrl,
  isLegacyPublicHost,
  shouldKeepLegacyApiRoute,
} from "@/lib/canonical-host";
import { updateSession } from "@/lib/firebase/middleware";
import { isClerkServerConfigured } from "@/lib/config";

const isProtectedAppRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/conversas(.*)",
  "/gerador(.*)",
  "/lead-intelligence(.*)",
  "/objecoes(.*)",
  "/follow-up(.*)",
  "/scripts(.*)",
  "/historico(.*)",
  "/configuracoes(.*)",
]);

function getCanonicalRedirect(request: NextRequest) {
  const hostname = request.nextUrl.hostname;
  const pathname = request.nextUrl.pathname;

  if (
    isLegacyPublicHost(hostname) &&
    !shouldKeepLegacyApiRoute(pathname)
  ) {
    const target = buildCanonicalRedirectUrl(
      request.nextUrl,
      pathname,
      request.nextUrl.search
    );
    return NextResponse.redirect(target, 308);
  }

  return null;
}

const clerkAuthMiddleware = clerkMiddleware(async (auth, request) => {
  const redirect = getCanonicalRedirect(request);
  if (redirect) return redirect;

  if (isProtectedAppRoute(request)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const redirect = getCanonicalRedirect(request);
  if (redirect) return redirect;

  if (isClerkServerConfigured) {
    return clerkAuthMiddleware(request, event);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    // Tudo, menos arquivos estáticos e imagens.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
