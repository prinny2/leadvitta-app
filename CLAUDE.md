# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

> **Authoritative rulebook:** if an `AGENTS.md` is present, it wins on agent
> roles/deployment/safety where the two overlap. ⚠️ Note: `AGENTS.md` and
> `ESTADO.md` are **referenced but not committed in this checkout** — treat this
> CLAUDE.md as the de-facto guide unless those files actually exist. The live
> workspace project-state file lives at `C:\Users\vpaes\status.md`.

## ⚠️ This app is LIVE and billing in production

> **Production host = Vercel** (as of 2026-06-19). The live site
> `https://www.leadbellus.com.br` is served by Vercel (project `vini1/leadvitta-app`,
> `Server: Vercel`). Cloud Run still exists but only handles redirects + legacy
> webhooks. The "Cloud Run only / No Vercel" wording further down is **superseded** —
> kept for historical context.

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
- **AI:** OpenAI (`gpt-4o-mini` default) with **Anthropic Claude fallback**
  (`claude-haiku-4-5`). All calls are server-side with timeout/retry; Anthropic
  uses ephemeral prompt caching.
- **Auth + data:** **Clerk** is the public auth (login/signup, since 2026-07-01,
  PR #98); Firebase provides the internal session bridge (custom token via
  `/api/auth/firebase-token`) and **Cloud Firestore** remains the data store;
  Firebase Admin SDK for server-side webhook writes.
- **Billing:** Stripe (subscription mode), reconciled into Firestore via webhook.
- **Integrations:** **WhatsApp via Z-API** (`ZAPI_INSTANCE_ID` / `ZAPI_TOKEN`;
  see `lib/whatsapp-zapi.ts`, `lib/whatsapp-types.ts` where `getWhatsAppProvider().name ===
  "zapi"`). Z-API **also replaced Zapier** for operational alerts
  (`lib/ops-notify.ts`). The old Meta WhatsApp Cloud API path is **legacy** — not
  the active provider. Verified live 2026-06-23: `GET /api/health` →
  `whatsapp_provider: "zapi"`.
- **Deploy:** **Production runs on Vercel** (`vini1/leadvitta-app`); env vars are
  baked at build time there. The Cloud Run path — Docker (Node 20,
  `output: "standalone"`) → Cloud Build → Cloud Run (region `southamerica-east1`,
  service `leadbellus`) — is **legacy** (redirects + old webhooks only); the
  Dockerfile/`cloudbuild.yaml` are kept for it.
- **Analytics:** GA4 via NEXT_PUBLIC_GA4_ID (see `lib/config.ts` `isGA4Configured` and `components/Analytics.tsx`). No longer a hardcoded fallback — only loads when the env var is explicitly set on Vercel.

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
Dockerfile, cloudbuild.yaml  # Cloud Run build/deploy
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

There is **no `lint` script** — do not invent one. Available scripts: `dev`,
`build`, `start`, `test`, `test:watch`, `test:coverage`.

```bash
npm install
npm run dev            # http://localhost:3000 (HMR)
npm run build          # production build (.next/standalone)
npm run start          # serve the build
npm test               # Vitest (~275 tests, all mocked — no network or keys needed)
curl http://localhost:3000/api/health      # smoke check → {"status":"ok",...}

# Core flow in demo mode (no AI keys → "mock": true):
curl -sS -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"mensagemCliente":"Olá, quanto custa o botox?"}' | jq .mock
```

Container parity with Cloud Run (serves on `:8080` via `node server.js`):

```bash
docker build -t leadbellus . && docker run --rm -p 8080:8080 leadbellus
```

## Workflow tips

- **No `make`.** There is no `Makefile`. Use `npm run build` and `npm test` instead.
- **Sync before PR.** Always run `git fetch origin main && git merge origin/main`
  before opening a pull request to avoid last-minute merge sessions.
- **Name your branch/session.** Descriptive branch names make `/chronicle` queries
  useful later; NULL summaries make history nearly untraceable.
- **CI failures on docs-only branches** are often transient — try re-running the
  check before writing a fix loop.

## Deploy

**Production = Vercel** (project `vini1/leadvitta-app`). Pushing to the deploy
branch builds & deploys on Vercel; `NEXT_PUBLIC_*` are **build-time**, so changing
them needs a new Vercel build. After deploy, validate `GET /api/health` on the
live host.

**Legacy Cloud Run path** (redirects + old webhooks only):

```bash
gcloud builds submit --config cloudbuild.yaml
gcloud run services update <SERVICE> --region <REGION> --set-env-vars NEXT_PUBLIC_SITE_URL=https://<HOST>
gcloud run services update <SERVICE> --region <REGION> --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest
```

Public webhooks (`/api/stripe/webhook`, `/api/whatsapp/webhook`) must point at the
**active production host** (Vercel).

## Domains & DNS

- The canonical public host is **`leadbellus.com.br`** (+ `www`), served by
  **Vercel**. Point `NEXT_PUBLIC_SITE_URL`, OAuth authorized domains, and
  Stripe/WhatsApp webhooks at it (or at the active Vercel production URL).
- ⛔ **Never use `leadvitta.com`.** Despite the repo/GCP project being named
  `leadvitta-app`, the domain `leadvitta.com` is **not** this app — it resolves
  to a parked HostGator placeholder page. Do not point DNS, `NEXT_PUBLIC_SITE_URL`,
  webhooks, OAuth domains, or any user-facing link at it.

## Environment variables

Copy `.env.local.example` → `.env.local`; it is the source of truth for names.
Groups: **Firebase** (`NEXT_PUBLIC_FIREBASE_*` + Admin `FIREBASE_SERVICE_ACCOUNT_JSON`
or `FIREBASE_PROJECT_ID`/`FIREBASE_CLIENT_EMAIL`/`FIREBASE_PRIVATE_KEY`),
**AI** (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `AI_MODEL`),
**Stripe** (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CHECKOUT_MODE`,
`STRIPE_PRICE_ID_{START,PRO,PREMIUM}`),
**WhatsApp via Z-API** (`ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_SECURITY_TOKEN`;
see `lib/config.ts` `isZApiConfigured`), **Ops Alerts** (`OPS_WHATSAPP_NUMBER`;
see `isOpsNotifyConfigured`). The Meta WhatsApp Cloud API vars
(`WHATSAPP_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID`/`WHATSAPP_VERIFY_TOKEN`/`WHATSAPP_APP_SECRET`)
and Zapier vars (`ZAPIER_*`) are **legacy** — Z-API is the active provider
(`.env.local.example` remains the source of truth for current names),
and optional analytics (`NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`),
plus `NEXT_PUBLIC_SITE_URL`.

> `NEXT_PUBLIC_*` are **build-time** — changing them requires a rebuild
> (`gcloud builds submit`), not just `services update`.

## Conventions & hard rules (from AGENTS.md)

- **Never commit secrets** (not in code, chat, or `cloudbuild.yaml`). Local
  secrets live outside the repo; production secrets live in Secret Manager.
- **Deploy host = Vercel** (current production, as of 2026-06-19). This rule
  historically said "Cloud Run only / No Vercel" after a Vercel domain
  split-brain; production has since moved (back) to Vercel. If you change the
  production host, do it deliberately and update this file + `status.md`
  together. **No Auth0** — `feat/auth0` is intentionally parked; Firebase
  Auth is the official v1 auth. Don't add `AUTH0_*`, Auth0 deps, or new
  `/auth/*` routes without a dedicated migration.
- Each agent works on its **own branch**; never commit directly to the branch
  that deploys.
- New API routes should follow the `lib/api-security.ts` pattern: origin check +
  rate limit + `jsonNoStore`, and (for authenticated routes) Firebase ID-token
  verification like the Stripe checkout route.
- New observable/UI content goes in `data/` (PT-BR); AI guardrails (compliance
  denylist) live in `lib/ai/prompts.ts`.

## Git workflow for this task

Develop on branch `claude/claude-md-docs-yydjie`, commit with clear messages,
push with `git push -u origin claude/claude-md-docs-yydjie`, and open a draft PR.

## Current Authentication (as of 2026-07-01 — IMPORTANT)

**This checkout uses Firebase Auth (client-side), NOT Clerk.**

- `middleware.ts` → `lib/firebase/middleware.ts` (simple cookie `firebase_auth` guard for protected routes)
- Login/Signup pages use `<VisualAuthPanel>` (Firebase)
- Most protected flows pass `firebaseIdToken = await user.getIdToken()` from client to APIs
- Server verifies with `verifyFirebaseIdToken` (lib/firebase/admin.ts)
- Firebase is also the data backend (Firestore)

**Clerk (@clerk/nextjs) is a PLANNED migration only.**

See:
- `docs/clerk-auth-migration.md` (full plan + checklist + all files that touch tokens)
- Blackboard claim #78 + Decision D-007

**Hard rules:**
- Never run `npm install @clerk/nextjs` or `vercel integration add clerk` on main.
- Webhooks (`/api/stripe/webhook`, `/api/whatsapp/webhook`) must remain completely public.
- Any real Clerk work must happen on a dedicated branch after the prerequisites in the plan are implemented.
- Current Firebase flows must stay working until the migration branch is proven.
