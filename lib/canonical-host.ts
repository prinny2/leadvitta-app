/** Host canônico de produção (Vercel + domínio real). */
export const CANONICAL_HOST = "www.leadbellus.com.br";

const LEGACY_HOST_SUFFIXES = [
  ".run.app",
  ".web.app",
  ".firebaseapp.com",
] as const;

/** Rotas de API que continuam respondendo em hosts legados (webhooks / health). */
const LEGACY_API_PREFIXES = [
  "/api/stripe/webhook",
  "/api/whatsapp/webhook",
  "/api/health",
] as const;

function getCanonicalOrigin(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const parsed = new URL(configured);
    if (parsed.hostname === "leadbellus.com.br") {
      return "https://www.leadbellus.com.br";
    }
    if (parsed.hostname) return parsed.origin.replace(/\/$/, "");
  } catch {
    /* fallback abaixo */
  }
  return `https://${CANONICAL_HOST}`;
}

export function isLegacyPublicHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === CANONICAL_HOST || host === "leadbellus.com.br") return false;
  if (host === "localhost" || host.endsWith(".localhost")) return false;
  return LEGACY_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

export function shouldKeepLegacyApiRoute(pathname: string): boolean {
  return LEGACY_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function buildCanonicalRedirectUrl(
  pathname: string,
  search: string,
): URL {
  const target = new URL(pathname + search, getCanonicalOrigin());
  return target;
}
