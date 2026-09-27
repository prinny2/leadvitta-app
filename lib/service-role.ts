// Papel de serviço (SERVICE_ROLE) — permite implantar o MESMO build como
// vários serviços independentes ("modular monolith" pronto pra split).
//
//   SERVICE_ROLE=web      → tudo (comportamento atual, default)
//   SERVICE_ROLE=ai       → só rotas de geração/IA
//   SERVICE_ROLE=billing  → só Stripe/Clerk/billing
//   SERVICE_ROLE=whatsapp → só webhooks/Z-API
//   SERVICE_ROLE=growth   → waitlist, notificações, Zapier, social
//
// Um papel que não seja `web` responde 404 para qualquer caminho fora da sua
// lista (inclusive páginas), então cada deploy expõe apenas a sua superfície.
// O catálogo humano/máquina está em `services.yaml` e `docs/architecture/services.md`.

export const SERVICE_ROLES = [
  "web",
  "ai",
  "billing",
  "whatsapp",
  "growth",
] as const;

export type ServiceRole = (typeof SERVICE_ROLES)[number];

/** Rotas que TODO serviço expõe (probes e flags de readiness). */
const SHARED_ROUTES = ["/api/health", "/api/config"] as const;

/** Prefixos de caminho servidos por cada papel (além das SHARED_ROUTES). */
export const SERVICE_ROUTE_PREFIXES: Record<
  Exclude<ServiceRole, "web">,
  readonly string[]
> = {
  ai: [
    "/api/generate",
    "/api/conversas/reply",
    "/api/follow-up",
    "/api/compliance",
    "/api/lead-intelligence",
  ],
  billing: [
    "/api/stripe/checkout",
    "/api/stripe/portal",
    "/api/stripe/webhook",
    "/api/billing/reconcile",
    "/api/clerk/webhook",
    "/api/auth/firebase-token",
  ],
  whatsapp: ["/api/whatsapp/webhook", "/api/clinica/whatsapp"],
  growth: [
    "/api/waitlist",
    "/api/notify/signup",
    "/api/zapier/lead",
    "/api/marketing/social-post",
  ],
};

export function isServiceRole(value: unknown): value is ServiceRole {
  return (
    typeof value === "string" &&
    (SERVICE_ROLES as readonly string[]).includes(value)
  );
}

/** Lê SERVICE_ROLE do ambiente; valores desconhecidos caem em `web`. */
export function getServiceRole(
  env: Record<string, string | undefined> = process.env
): ServiceRole {
  const raw = env.SERVICE_ROLE?.trim().toLowerCase();
  return isServiceRole(raw) ? raw : "web";
}

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** True se o caminho deve ser atendido pelo serviço com este papel. */
export function isPathServedByRole(role: ServiceRole, pathname: string) {
  if (role === "web") return true;
  if (SHARED_ROUTES.some((route) => matchesPrefix(pathname, route))) {
    return true;
  }
  return SERVICE_ROUTE_PREFIXES[role].some((prefix) =>
    matchesPrefix(pathname, prefix)
  );
}

/** Rotas de API expostas por um papel (`web` = união de todas). */
export function listRoutesForRole(role: ServiceRole): readonly string[] {
  if (role === "web") {
    return [...SHARED_ROUTES, ...Object.values(SERVICE_ROUTE_PREFIXES).flat()];
  }
  return [...SHARED_ROUTES, ...SERVICE_ROUTE_PREFIXES[role]];
}
