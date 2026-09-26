# LeadBellus — service architecture (modular monolith, split-ready)

**Status:** one Next.js 15 build, deployable as one process (`SERVICE_ROLE=web`,
production on Vercel today) **or** as five independent services that share the
same image and differ only by `SERVICE_ROLE`. Route ownership is enforced at
runtime in `middleware.ts` via `lib/service-role.ts`; the machine-readable
catalog is `services.yaml`.

## Why this shape

- Stripe, Z-API and Clerk webhooks must keep stable URLs. Gating by role lets
  each webhook live on its own deploy without moving code or changing paths.
- Firestore is the source of truth and every service talks to it through the
  Admin SDK, so there is no shared database to untangle first.
- A wrong `SERVICE_ROLE` degrades to `web` (full monolith), never to "nothing".

## Services

| Role | Surface (`/api/...`) | Owns (data) | Scale profile |
|---|---|---|---|
| `web` | everything (pages + all APIs) | — | current Vercel deploy |
| `ai` | `generate`, `conversas/reply`, `follow-up`, `compliance`, `lead-intelligence` | `historico`, Supabase `app_historico_respostas` | LLM-latency bound, horizontal |
| `billing` | `stripe/{checkout,portal,webhook}`, `billing/reconcile`, `clerk/webhook`, `auth/firebase-token` | `clinicas.plano`, Stripe ids | low traffic, single-writer |
| `whatsapp` | `whatsapp/webhook`, `clinica/whatsapp` | `conversas` | bursty inbound |
| `growth` | `waitlist`, `notify/signup`, `zapier/lead`, `marketing/social-post` | Supabase `app_waitlist` | tiny |

Every role also serves `/api/health` (reports `service_role`) and `/api/config`.
Any other path returns `404 {"error":"not_served_by_this_service"}` before auth
runs.

## Contracts between services

Services do **not** call each other over HTTP today. They coordinate through
data:

- `billing` writes `clinicas/{id}.plano`; `ai` reads it via `lib/usage-limit.ts`
  to enforce the paywall.
- `whatsapp` writes `conversas`; `ai` (`/api/conversas/reply`) reads them.
- `growth` writes `app_waitlist`; nothing reads it in-app.

If a synchronous call becomes necessary (e.g. `whatsapp` asking `ai` for a
reply), add it as an internal route under the *callee's* role and authenticate
with a shared `INTERNAL_API_SECRET` header via `lib/api-security.ts`.

## Running it

Local, all five + Firebase emulators (Docker required):

```bash
docker compose up --build
curl -s localhost:3001/api/health | jq .service_role   # "ai"
curl -s -o /dev/null -w '%{http_code}\n' localhost:3001/   # 404
```

Single role without Docker:

```bash
SERVICE_ROLE=billing npm run dev
```

Deploying a role on Vercel or Cloud Run is the existing pipeline plus one env
var (`SERVICE_ROLE`). Point the Stripe/Z-API/Clerk webhook URLs at the matching
deploy.

## Extraction order (when one deploy is not enough)

1. `growth` — no auth, no money, no customer-facing latency.
2. `whatsapp` — isolates inbound bursts from the UI; register the new URL at Z-API.
3. `ai` — the only CPU/latency hot path; scales independently of pages.
4. `billing` — last, because Stripe webhook URL changes need care (idempotency
   is already in `lib/stripe/billing-sync.ts`).

`web` keeps serving pages. Once a role is deployed on its own, set the `web`
deploy's rewrite for those paths (or leave them: `web` still answers, the
middleware gate only restricts non-web roles).

## Rules for contributors and agents

- A new `/api/*` route **must** be added to exactly one role in
  `lib/service-role.ts`; `tests/lib/service-role.test.ts` fails on overlap.
- Keep `services.yaml` in sync (it is documentation; the code is the source of
  truth).
- Do not import `lib/stripe/*` from `ai`-owned code or `lib/ai/*` from
  `billing`-owned code. Cross-role needs go through Firestore or an internal
  route as above.
