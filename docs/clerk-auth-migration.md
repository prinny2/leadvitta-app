# Clerk Auth Migration Plan — LeadBellus

**Status (2026-07-02): ✅ EXECUTADA — mergeada na `main` (PR #98, commit `fbf64dc`, 2026-07-01) e LIVE em produção.**

Evidência (2026-07-02): login em `www.leadbellus.com.br` serve ClerkJS v6 via `clerk.leadbellus.com.br`
(pk_live); `/api/config` retorna `clerk_enabled:true` + `clerk_server_enabled:true`.

Arquitetura implementada (claims #82–#85 no blackboard do cockpit):
- **Clerk = auth público** (login/signup, middleware `clerkMiddleware` protege só rotas do app).
- **Firebase = ponte interna + data layer**: `/api/auth/firebase-token` emite custom token
  (Clerk → Firebase) e `FirebaseSessionSync` mantém a sessão; Firestore continua o banco.
- **Webhooks continuam públicos** (`/api/stripe/webhook`, `/api/whatsapp/webhook`, `/api/clerk/webhook`).
- ⚠️ **NÃO setar `ENABLE_API_PROXY=true`** — quebra `/api/auth/firebase-token` (envs Clerk só na Vercel).

> O plano abaixo fica como **registro histórico** dos pré-requisitos que guiaram a migração
> (útil como referência do que foi feito e por quê).

---

**Status original (pre-PR #98):** Planned / Not started.  
**Post-migration reality (2026-07-01):** Clerk = public auth; Firebase = internal bridge + data layer.  
**Risk if misconfigured:** Webhooks broken, auth failures on checkout/API, identity loss, launch blocker.

## Current State (Truth — post-migration)

- `package.json`: `@clerk/nextjs` installed (`^7.5.12`)
- `middleware.ts`: imports `clerkMiddleware` from `@clerk/nextjs/server` (active
  when `isClerkServerConfigured`; falls back to Firebase cookie guard otherwise)
- Login / Signup: `<SignIn>` / `<SignUp>` from `@clerk/nextjs` (when configured)
- `app/layout.tsx`: wraps app in `<ClerkProvider>` when `isClerkClientConfigured`
- Clerk→Firebase bridge: `FirebaseSessionSync` calls `/api/auth/firebase-token`
  to mint a Firebase custom token after Clerk login
- Server-side: `app/api/clerk/webhook/route.ts` handles Clerk webhooks
- Firebase remains the data store (Firestore rules, clinica docs keyed by UID).

> **Pre-migration state** (kept for historical reference): Firebase Auth only,
> `<VisualAuthPanel>`, `firebaseIdToken` sent from client, `verifyFirebaseIdToken`
> on server. The checklist below documents the prerequisites that guided the
> migration.

## Hard Requirements for Any Clerk Migration

**1. Public webhooks MUST stay public (no auth middleware)**

- `/api/stripe/webhook`
- `/api/whatsapp/webhook`
- Any future inbound providers

In Clerk terms: use `publicRoutes` or explicit exclusion **before** `auth.protect()` / `clerkMiddleware`.

Breaking webhooks = no Stripe billing, no WhatsApp leads.

**2. Identity mapping (Clerk ↔ Firebase / Firestore)**

Current flow often uses the Firebase UID to:

- Write to Firestore per-clinica
- Associate WhatsApp numbers (`clinica/whatsapp` route)
- Billing / Stripe customer links
- Ownership of leads / conversas

Options (choose one + implement):

A. Dual write period: after Clerk login, also ensure a Firebase custom token or link the accounts.
B. Primary Clerk: store Clerk `user.id` (or `externalId`) in the clinica doc. Update all queries and security rules.
C. Keep Firebase Auth for data layer, use Clerk only for login (more complex).

**3. Replace firebaseIdToken everywhere**

Call sites (client):
- `app/(app)/gerador/page.tsx`
- `app/(app)/conversas/[id]/page.tsx`
- `app/(app)/configuracoes/page.tsx`
- `components/checkout-button.tsx`
- `components/plan-checkout-button.tsx`
- `components/billing-portal-button.tsx`

Server verifiers:
- `app/api/generate/route.ts`
- `app/api/conversas/reply/route.ts`
- `app/api/stripe/checkout/route.ts`
- `app/api/stripe/portal/route.ts`
- `app/api/clinica/whatsapp/route.ts`

Migration pattern (Clerk):
- Client: `const { getToken } = useAuth(); const token = await getToken();`
- Server: `const { userId } = auth();` or verify Clerk JWT with `clerkClient`.

Tests that hardcode `firebaseIdToken` will need updates.

**4. Middleware change**

Current:
```ts
return await updateSession(request);  // firebase cookie logic
```

Future Clerk (with exceptions):
```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublic = createRouteMatcher([
  '/api/stripe/webhook',
  '/api/whatsapp/webhook',
  // login, signup, landing, health, etc.
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublic(req)) {
    auth.protect();
  }
});
```

Also update `config.matcher`.

**5. Login / Signup / Layout / Provider**

- Replace VisualAuthPanel with `<SignIn />` / `<SignUp />`
- Wrap root or (app) layout with `<ClerkProvider>`
- Update redirect URLs (`NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` etc.)
- Handle post-signup onboarding that currently relies on Firebase user.

**6. Environment & Vercel**

Only after code is ready:
- `vercel integration add clerk` (optional, for secret provisioning)
- Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Update authorized domains in Clerk dashboard for leadbellus.com.br

**7. Rollout strategy (recommended)**

1. Feature branch: `feat/auth-clerk`
2. Implement dual support or full switch + tests.
3. Keep Firebase as data layer or migrate data.
4. Extensive smoke on webhooks + checkout + protected pages.
5. Update all docs (README, CLAUDE.md, COORDINATION) only after merge.
6. Blackboard claim + pilot explicit GO before any production change.

## Do NOT Do (anti-patterns)

- ~~`npm install @clerk/nextjs` on main without plan.~~ (Done via PR #98.)
- ~~`vercel integration add clerk` before webhooks and token paths are handled.~~ (Done.)
- Assuming `auth.protect()` can be global (it will break inbound webhooks).
- Setting `ENABLE_API_PROXY=true` — it routes `/api/auth/firebase-token` to Cloud Run which lacks Clerk env vars.

## Next Steps (historical — pre-PR #98)

- Open dedicated claim + branch.
- Map every `verifyFirebaseIdToken` call + Firestore write that assumes UID.
- Prototype the middleware exclusion + one API (e.g. generate) first.
- Update visual auth + login page.
- Add Clerk to package.json **only** on that branch.

---

**This document is the single source of truth for the migration prerequisites.**  
Keep it updated. Update blackboard when work starts.

Current date context: 2026-07-01

---

## Full Migration Checklist (Faça Tudo - Preparation Complete)

### Phase 0 — Preparation (DONE in this pass)
- [x] Docs corrected (README, COORDINATION*, .env.example)
- [x] This plan document created with requirements
- [x] Claim #78 + D-007 recorded in cockpit blackboard
- [x] All firebaseIdToken call sites mapped (see below)
- [x] Webhook public paths identified

### Phase 1 — Branch & Scaffold (when started)
- [ ] Create branch `feat/auth-clerk` from clean main
- [ ] Add Clerk as dev dependency first? (No — add only when ready to wire)
- [ ] Update .env.local.example with real Clerk placeholders (already partially done)
- [ ] Add ClerkProvider wrapper (plan where)

### Phase 2 — Middleware & Public Routes (CRITICAL)
- [ ] Rewrite middleware.ts to use clerkMiddleware
- [ ] Define public routes matcher including:
  - `/api/stripe/webhook`
  - `/api/whatsapp/webhook`
  - `/api/health`
  - `/api/config`
  - Landing pages, login, signup, demo
- [ ] Keep or port the canonical host redirect logic
- [ ] Test that webhooks still receive unsigned POSTs

### Phase 3 — Identity & Token Replacement
Client callers to convert `firebaseIdToken`:
1. `app/(app)/gerador/page.tsx`
2. `app/(app)/conversas/[id]/page.tsx`
3. `app/(app)/configuracoes/page.tsx`
4. `components/checkout-button.tsx`
5. `components/plan-checkout-button.tsx`
6. `components/billing-portal-button.tsx`

Server verifiers to convert:
1. `app/api/generate/route.ts`
2. `app/api/conversas/reply/route.ts`
3. `app/api/stripe/checkout/route.ts`
4. `app/api/stripe/portal/route.ts`
5. `app/api/clinica/whatsapp/route.ts`

Shared:
- `lib/firebase/admin.ts` → create parallel `lib/clerk/verify.ts` or use `@clerk/nextjs` server helpers
- `lib/store.ts` — heavy Firebase currentUser usage (may need session sync layer)

### Phase 4 — Auth UI Migration
- [ ] Replace VisualAuthPanel usage in login & signup pages with Clerk <SignIn/> / <SignUp/>
- [ ] Move logic from visual-auth-panel.tsx or deprecate
- [ ] Handle post-signup (onboarding=1, plan selection) with Clerk afterSignUpUrl

### Phase 5 — Data Layer / Firestore
- Decide primary identity:
  - Option A: Keep Firebase UID as canonical, link Clerk user via custom claims or metadata
  - Option B: Use Clerk user.id as primary key in Firestore docs (bigger change to rules + all queries)
- Update any server admin operations that rely on decoded Firebase token uid

### Phase 6 — Tests & Smoke
- Update tests that stub `verifyFirebaseIdToken`
- Add Clerk-specific test mocks
- Full smoke: login → gerador → checkout → billing portal → WhatsApp number link → webhook deliveries

### Phase 7 — Docs & Launch
- Update README, CLAUDE.md, COORDINATION to "Clerk migrated"
- Update blackboard claim as DONE only after production smoke + pilot sign-off
- Rotate any old Firebase web keys if desired (they are public-ish)

### Files that will almost certainly change (high confidence)
- middleware.ts
- lib/firebase/admin.ts + client.ts
- components/visual-auth-panel.tsx
- app/(auth)/login/page.tsx + signup/page.tsx
- app/(app)/gerador/page.tsx
- app/(app)/conversas/[id]/page.tsx
- app/(app)/configuracoes/page.tsx
- app/api/generate/route.ts
- app/api/conversas/reply/route.ts
- app/api/stripe/* (checkout + portal + webhook)
- app/api/clinica/whatsapp/route.ts
- lib/store.ts
- Multiple test files

### Webhook Public Routes (must never be protected by auth middleware)
- /api/stripe/webhook
- /api/whatsapp/webhook

---

**Status as of PR #98 merge (2026-07-01):** Migration executed. Clerk is installed,
configured, and live in production. The checklist above is kept as a historical
record of what was planned and implemented. Firebase flows remain working as the
internal bridge + data layer.