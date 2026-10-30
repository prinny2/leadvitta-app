# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

> **Authoritative rulebook:** `AGENTS.md` wins on agent roles/deployment/safety
> where the two overlap; this file is the day-to-day guide.

## ⚠️ This app is LIVE and billing in production

> **Production host = one fixed-price VPS** (relaunch, 2026-10-28). Vercel and
> Z-API subscriptions are **cancelled**; the GCP billing account of `leadvitta-app`
> is **closed** (Cloud Run is gone; Firebase stays on the free **Spark** plan as the
> data layer). Deploy = `.github/workflows/deploy-vps.yml` → Docker + Caddy on the
> VPS (AWS EC2 t3.micro, us-east-2, `3.12.9.125`, free-plan credits until
> 2027-04-28); runbook in `deploy/vps/README.md`. **Clerk is not configured** on the
> relaunch → login runs on the Firebase Auth fallback (dual-mode code kept intact).
> **Never re-enable usage-billed hosting**
> (Cloud Run, Vercel Pro, Firebase Blaze, EC2/App Runner) without a hard budget cap.
> Vercel/Cloud Run/Z-API/Clerk appear below only as **legacy** paths still in code.

LeadBellus is LIVE and **charges real customers via Stripe**. Treat every change
as a production change. Do not assume "it's done" without live verification
(curl the route, check the Stripe dashboard, check Firestore).

## What this app is

**LeadBellus** — a Brazilian (PT-BR) SaaS micro-app that helps **aesthetic
clinics and beauty professionals** respond better on WhatsApp. It turns an
incoming client message into **3 strategic response variants** — display labels
**Suave / Consultiva / Fechamento**, but the **technical keys** (what the API
returns and `RespostaTripla` in `lib/types.ts` exposes) are
**`curta` / `consultiva` / `persuasiva`** — with AI compliance guardrails (no
guaranteed results, no fixed pricing, no medical diagnoses). It also generates objection
rebuttals, follow-ups, and sales scripts, and logs every response with
intent/sentiment/score.

Business model: monthly subscriptions — **Start R$97 / Pro R$197 / Premium R$347**
(source of truth: `lib/billing.ts`). Only **Start** is currently sellable
(`disponivel: true`); Pro/Premium show "Em breve" until their `STRIPE_PRICE_ID_*`
env vars are set.

## Tech stack

- **Next.js 15 (App Router)** + **React 19** + **TypeScript (strict)** +
  **TailwindCSS 3.4**.
- **AI:** provider chain **OpenAI → Anthropic → Gemini** (`lib/ai/provider.ts`
  `DEFAULT_PROVIDER_CHAIN`); each provider is skipped when its key is missing.
  Defaults: `gpt-4o-mini`, `claude-haiku-4-5`, and `GEMINI_MODEL` as a
  comma-separated list that falls back when a model is overloaded. All calls are
  server-side with timeout/retry; Anthropic uses ephemeral prompt caching.
  Live 2026-10-30: OpenAI + Gemini configured, Anthropic not.
- **Auth + data:** login runs on **Firebase Auth** in production (Clerk keys are
  not set on the relaunch); the dual-mode Clerk code stays intact (see "Current
  Authentication"). **Cloud Firestore** is the data store; Firebase Admin SDK
  for server-side webhook writes.
- **Billing:** Stripe (subscription mode), reconciled into Firestore via webhook.
- **Integrations:** WhatsApp code targets **Z-API** (`lib/whatsapp-zapi.ts`,
  `ZAPI_INSTANCE_ID` / `ZAPI_TOKEN`), but the subscription is **cancelled** —
  live `GET /api/health` shows `whatsapp: false`. The Meta WhatsApp Cloud API
  path and Zapier are **legacy**.
- **Ops alerts** (`lib/ops-notify.ts`: signup, checkout, payment, waitlist): sent
  by **e-mail via Resend** (`RESEND_API_KEY`, to `OPS_EMAIL_TO`, default
  `suporte@leadbellus.com.br`) and/or WhatsApp (Z-API + `OPS_WHATSAPP_NUMBER`).
  Each channel is used when configured; `/api/health` → `ops_email` / `ops_whatsapp`.
- **Deploy:** one fixed-price **VPS** — Docker (Node 20, `output: "standalone"`)
  behind Caddy, shipped by `.github/workflows/deploy-vps.yml` on push to `main`.
  Runbook: `deploy/vps/README.md`. `cloudbuild.yaml` is the legacy Cloud Run path.
- **Analytics:** GA4 via `NEXT_PUBLIC_GA4_ID` (see `lib/config.ts` `isGA4Configured`
  and `components/Analytics.tsx`). It only loads when the variable is set at build
  time (GitHub Variables for the VPS build).

> **Use Node 20** to match the Dockerfile. If the VM ships Node 22:
> `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 20`.

## Demo mode (the default with no secrets)

With **zero env vars**, the app fully runs: login is skipped, data lives in
browser `localStorage` (`re_clinica`, `re_historico`), and AI responses are
mocked from `lib/ai/mock.ts`. This is the default on a fresh checkout / Cloud VM
and is the easiest way to develop UI and AI-shaped features. "Real" mode
activates feature-by-feature as the corresponding env vars are set (see
`lib/config.ts` feature flags).

## Directory layout

```
app/                         # Next.js App Router (route groups in parens)
  (marketing)/page.tsx        # Landing page  → /
  (auth)/login | signup       # /login, /signup
  auth/callback/route.ts      # OAuth callback
  (app)/                      # Protected app (auth + onboarding gate)
    dashboard | gerador | objecoes | follow-up | scripts |
    historico | onboarding | configuracoes
  api/
    health, config            # GET  health check / feature flags
    generate, follow-up       # POST AI generation (rate-limited, CORS-checked)
    stripe/checkout, webhook   # POST checkout session / Stripe webhook
    zapier/lead               # POST inbound lead
    whatsapp/webhook          # GET verify + POST inbound messages
components/                   # React components (+ components/ui primitives)
lib/
  types.ts                    # Clinica, RespostaTripla, GerarInput, HistoricoItem…
  config.ts                   # isFirebaseConfigured / isOpenAIConfigured / … flags
  billing.ts                  # Stripe plan config (start/pro/premium)
  store.ts                    # data abstraction: Firestore OR localStorage
  api-security.ts             # CORS/origin check, rate limit, body parse, jsonNoStore
  whatsapp.ts, whatsapp-zapi.ts, whatsapp-types.ts, ops-notify.ts  # WhatsApp facade + Z-API client + ops alerts
  ai/ provider.ts prompts.ts mock.ts   # OpenAI>Anthropic orchestration + compliance denylist
  firebase/ client.ts admin.ts middleware.ts
  stripe/server.ts
data/                        # PT-BR content: procedimentos, objecoes, followups, scripts, tons…
firestore.rules, firestore.indexes.json, firebase.json, .firebaserc
Dockerfile                   # production image (VPS); cloudbuild.yaml = legacy Cloud Run
deploy/vps/                  # VPS compose, Caddyfile, app.env template, runbook
.env.local.example           # env var template (source of truth for var names)
```

## Data model (Firestore)

- **`clinicas/{uid}`** — clinic "DNA" per owner (name, city, procedures, tone,
  formality, CTA, `onboarded`). The `billing` sub-object is **server-only**
  (written by the Stripe webhook via Admin SDK); clients cannot write it.
- **`historico/{id}`** — generated responses (`user_id`, `tipo`, `contexto`,
  `respostas[]`, `created_at`, `favorito`, plus NLP `intent`/`sentiment`/`score`).
  Compound index on `(user_id ASC, created_at DESC)` powers the history query.
- `store.ts` transparently falls back to `localStorage` when Firebase is not
  configured. Firestore rules isolate each user to their own clinic + history.

## Dev commands

There is **no lint script**; do not invent one. Available scripts: `dev`, `build`,
`start`, `test`, `test:watch`, `test:coverage` (Vitest, 418 tests in 37 files, all mocked —
no network or keys needed).

```bash
npm install
npm run dev            # http://localhost:3000 (HMR)
npm run build          # production build (.next/standalone)
npm run start          # serve the build
curl http://localhost:3000/api/health      # smoke check → {"status":"ok",...}

# Core flow in demo mode (no AI keys → "mock": true):
curl -sS -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"mensagemCliente":"Olá, quanto custa o botox?"}' | jq .mock
```

Container parity with production (serves on `:8080` via `node server.js`):

```bash
docker build -t leadbellus . && docker run --rm -p 8080:8080 leadbellus
```

## Deploy

**Production = VPS** (AWS EC2 t3.micro, `3.12.9.125`, Docker + Caddy). A push to
`main` runs `.github/workflows/deploy-vps.yml`: it builds the image in CI (with
`NEXT_PUBLIC_*` from GitHub **Variables** — they are build-time), ships it over
SSH and restarts the stack. Runtime secrets live only in `/opt/leadbellus/app.env`
on the server (template: `deploy/vps/app.env.example`); adding or changing one
means editing that file on the VPS and restarting — see `deploy/vps/README.md`.
After deploy, validate `GET https://www.leadbellus.com.br/api/health`.

Legacy, not running: Vercel (cancelled) and Cloud Run (`cloudbuild.yaml`; GCP
billing closed).

Public webhooks (`/api/stripe/webhook`, `/api/whatsapp/webhook`) must point at
`https://www.leadbellus.com.br`.

## Domains & DNS

- The canonical public host is **`www.leadbellus.com.br`**; the apex
  `leadbellus.com.br` 301-redirects to it (Caddy on the VPS). DNS is at
  **Registro.br**. Point `NEXT_PUBLIC_SITE_URL`, OAuth authorized domains, and
  Stripe/WhatsApp webhooks at `https://www.leadbellus.com.br`.
- Public contact e-mail is `suporte@leadbellus.com.br` (`lib/empresa.ts`). As of
  2026-10-30 the domain has **no MX records**, so that address does not receive
  mail until a mailbox or forwarder is set up at Registro.br.
- ⛔ **Never use `leadvitta.com`.** Despite the repo/GCP project being named
  `leadvitta-app`, the domain `leadvitta.com` is **not** this app — it resolves
  to a parked HostGator placeholder page. Do not point DNS, `NEXT_PUBLIC_SITE_URL`,
  webhooks, OAuth domains, or any user-facing link at it.

## Environment variables

Copy `.env.local.example` → `.env.local`; it is the source of truth for names.
Groups: **Firebase** (`NEXT_PUBLIC_FIREBASE_*` + Admin `FIREBASE_SERVICE_ACCOUNT_JSON`
or `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` or
`FIREBASE_PROJECT_ID`/`FIREBASE_CLIENT_EMAIL`/`FIREBASE_PRIVATE_KEY`),
**AI** (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `AI_MODEL`,
`GEMINI_MODEL`),
**Stripe** (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CHECKOUT_MODE`,
`STRIPE_PRICE_ID_{START,PRO,PREMIUM}`),
**Ops alerts** (`RESEND_API_KEY`, `OPS_EMAIL_TO`, `OPS_EMAIL_FROM`,
`OPS_WHATSAPP_NUMBER`; see `isOpsEmailConfigured` / `isOpsWhatsAppConfigured`),
**WhatsApp via Z-API** (`ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_SECURITY_TOKEN`;
off in production), optional **Clerk** (off in production), and optional
analytics (`NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`), plus
`NEXT_PUBLIC_SITE_URL`. The Meta WhatsApp Cloud API vars (`WHATSAPP_*`) and
Zapier vars (`ZAPIER_*`) are **legacy**.

> `NEXT_PUBLIC_*` are **build-time** — changing them means updating the GitHub
> Variable and re-running the deploy workflow, not just editing `app.env`.

## Conventions & hard rules (from AGENTS.md)

- **Never commit secrets** (not in code, chat, or `cloudbuild.yaml`). Local
  secrets live outside the repo; production secrets live only in
  `/opt/leadbellus/app.env` on the VPS (and deploy SSH keys in GitHub Secrets).
- **Deploy host = the fixed-price VPS** (since the 2026-10-28 relaunch). If you
  change the production host, do it deliberately and update this file,
  `AGENTS.md` and `deploy/vps/README.md` together. **No Auth0** — `feat/auth0`
  is intentionally parked; don't add `AUTH0_*`, Auth0 deps, or new `/auth/*`
  routes without a dedicated migration.
- Each agent works on its **own branch**; never commit directly to the branch
  that deploys.
- New API routes should follow the `lib/api-security.ts` pattern: origin check +
  rate limit + `jsonNoStore`, and (for authenticated routes) Firebase ID-token
  verification like the Stripe checkout route.
- New observable/UI content goes in `data/` (PT-BR); AI guardrails (compliance
  denylist) live in `lib/ai/prompts.ts`.


## Current Authentication (updated 2026-10-30)

**Production login = Firebase Auth** — the relaunch on the VPS has no Clerk keys
(live `/api/health`: `clerk: false`), so every Clerk branch below is dormant.
Clerk was the public auth from 2026-07-01 (PR #98 `fbf64dc`) until the relaunch;
setting the Clerk keys again turns it back on:

- `middleware.ts` imports `clerkMiddleware` from `@clerk/nextjs/server` (active
  when `isClerkServerConfigured` is true; falls back to Firebase cookie guard
  otherwise).
- Login/Signup pages render `<SignIn>` / `<SignUp>` from `@clerk/nextjs` when
  Clerk is configured.
- `app/layout.tsx` wraps the app in `<ClerkProvider>` when
  `isClerkClientConfigured`.
- **Firebase = internal session bridge + data layer**: after Clerk login,
  `FirebaseSessionSync` calls `/api/auth/firebase-token` to mint a Firebase
  custom token so Firestore rules and billing flows still work.
- Firestore remains the data backend.

See `docs/clerk-auth-migration.md` for full history and architecture.

**Hard rules:**
- Webhooks (`/api/stripe/webhook`, `/api/whatsapp/webhook`, `/api/clerk/webhook`) must remain completely public (outside `auth.protect()`).
- Do **not** set `ENABLE_API_PROXY=true` — it breaks the Clerk→Firebase bridge.
- Current dual-mode design (Clerk when configured, Firebase fallback otherwise) must be preserved.

## Service roles & agent lanes (added 2026-09-26)

- The app is a **modular monolith**: one build, deployable as `web` (default,
  what the VPS runs) or as `ai` / `billing` / `whatsapp` / `growth` via `SERVICE_ROLE`.
  Gate lives in `middleware.ts` → `lib/service-role.ts`; catalog in
  `services.yaml`; design + extraction order in `docs/architecture/services.md`.
  `docker-compose.yml` runs all five + Firebase emulators.
- Every new `/api/*` route goes in exactly one role; the test suite fails on
  overlap.
- Tool ownership (Claude Code vs Codex vs Xcode) is in `docs/agents/tool-roles.md`.
  Claude Code owns architecture/infra/billing/auth/webhooks; Codex owns scoped
  single-issue work; Xcode owns native Apple targets only.
