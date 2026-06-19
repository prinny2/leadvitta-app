# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

> **Authoritative rulebook:** if an `AGENTS.md` is present, it wins on agent
> roles/deployment/safety where the two overlap. ⚠️ Note: `ESTADO.md` is
> **referenced but not committed in this checkout**; `AGENTS.md` IS present and
> authoritative. The live
> workspace project-state file lives at `C:\Users\vpaes\status.md`.

## ⚠️ This app is LIVE and billing in production

> **Architecture = HYBRID (Vercel frontend + Cloud Run API).** The live site
> `https://www.leadbellus.com.br` is served by **Vercel** (project `vini1/leadvitta-app`),
> which builds the Next.js frontend and bakes `NEXT_PUBLIC_*`. But **every `/api/*` route
> is proxied server-side to Cloud Run** (`next.config.mjs` turns the proxy ON whenever
> `VERCEL=1`, which is always true on Vercel), so Stripe checkout/webhook, WhatsApp webhook
> and `/api/config` **execute on Cloud Run — never on Vercel**. **Runtime secrets
> (`STRIPE_*`, `FIREBASE_*`, `OPENAI`/`ANTHROPIC`, `ZAPI_*`) must live on Cloud Run** — a
> Stripe/Firebase secret set only on Vercel is **inert** (customer pays, account never
> activates). Both layers are production; **neither is legacy**. Authoritative deploy/secret
> map: **`DEPLOY_STRIPE_VERCEL.md`**.

LeadBellus is LIVE and **charges real customers via Stripe**. Treat every change
as a production change. Do not assume "it's done" without live verification
(curl the route, check the Stripe dashboard, check Firestore).

## What this app is

**LeadBellus** — a Brazilian (PT-BR) SaaS micro-app that helps **aesthetic
clinics and beauty professionals** respond better on WhatsApp. It turns an
incoming client message into **3 strategic response variants**
(Suave / Consultiva / Fechamento) with AI compliance guardrails (no guaranteed
results, no fixed pricing, no medical diagnoses). It also generates objection
rebuttals, follow-ups, and sales scripts, and logs every response with
intent/sentiment/score.

Business model: monthly subscriptions — **Start R$97 / Pro R$197 / Premium R$347**
(source of truth: `lib/billing.ts`). Only **Start** is currently sellable
(`disponivel: true`); Pro/Premium show "Em breve" until their `STRIPE_PRICE_ID_*`
env vars are set.

## Tech stack

- **Next.js 15 (App Router)** + **React 19** + **TypeScript (strict)** +
  **TailwindCSS 3.4**.
- **AI:** 3-tier server-side chain **OpenAI → Anthropic → Gemini** (`lib/ai/provider.ts`).
  OpenAI (`gpt-4o-mini` default), Anthropic Claude fallback (`claude-haiku-4-5`, ephemeral
  prompt caching), then Gemini (`@google/genai`, `gemini-2.5-flash` default). All with
  timeout/retry. Gemini activates when `GEMINI_API_KEY`/`GOOGLE_API_KEY` is set.
- **Auth + data:** Firebase Auth (email/password + Google) and Cloud Firestore;
  Firebase Admin SDK for server-side webhook writes.
- **Billing:** Stripe (subscription mode), reconciled into Firestore via webhook.
- **Integrations:** WhatsApp Cloud API (Meta) and Zapier.
- **Deploy (hybrid):** **Vercel** (`vini1/leadvitta-app`) builds & serves the frontend
  and bakes `NEXT_PUBLIC_*` at build time. **All `/api/*` is proxied to Cloud Run** —
  Docker (Node 20, `output: "standalone"`) → Cloud Build → Cloud Run (region
  `southamerica-east1`, service `leadbellus`) — which runs the **live API** and holds the
  **runtime secrets**. Both are production; neither is legacy. See `DEPLOY_STRIPE_VERCEL.md`.
- **Analytics gotcha:** `components/Analytics.tsx` hardcodes a GA4 fallback
  `G-223KR63TS8` (`NEXT_PUBLIC_GA4_ID || "G-223KR63TS8"`), so the tag loads even
  without the env var. To point analytics elsewhere you must change that fallback
  or set `NEXT_PUBLIC_GA4_ID`.

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
  whatsapp.ts, zapier.ts      # external API clients
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

**Validation: there IS a Vitest suite** (`tests/`, ~17 files) plus verification
scripts. There is no `lint` script. Scripts: `dev`, `build`, `start`, `test`
(`vitest run`), `test:watch`, `test:coverage`, `firebase:check`,
`firebase:emulator:check`, `firebase:verify`, `whatsapp:simulate`.
Run `npm test` before declaring a change done.

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

Container parity with Cloud Run (serves on `:8080` via `node server.js`):

```bash
docker build -t leadbellus . && docker run --rm -p 8080:8080 leadbellus
```

## Deploy (hybrid — see `DEPLOY_STRIPE_VERCEL.md` for the full map)

**Frontend → Vercel** (project `vini1/leadvitta-app`). Merging to `main` builds &
deploys on Vercel; `NEXT_PUBLIC_*` are **build-time**, so changing them needs a new
Vercel build. **API → Cloud Run**: all `/api/*` is proxied there, so it holds the
**runtime secrets** (`STRIPE_*`, `FIREBASE_*`, `ZAPI_*`, AI keys) — set them on Cloud
Run, **not Vercel**:

```bash
gcloud run services update leadbellus --region southamerica-east1 \
  --update-env-vars STRIPE_CHECKOUT_MODE=subscription,STRIPE_PRICE_ID_START=price_… \
  --set-secrets STRIPE_SECRET_KEY=stripe-secret-key:latest,STRIPE_WEBHOOK_SECRET=stripe-webhook-secret:latest
gcloud run services describe leadbellus --region southamerica-east1   # validate
```

Public webhooks run on Cloud Run: register the Stripe/WhatsApp endpoints **directly on
the `…run.app` URL** (skips the Vercel proxy and the apex-307 trap). Validate the live
stack with `curl -L https://www.leadbellus.com.br/api/config` (answered by Cloud Run
via the proxy).

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
**AI** (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` or `GOOGLE_API_KEY`,
`AI_MODEL`, `GEMINI_MODEL`),
**Stripe** (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CHECKOUT_MODE`,
`STRIPE_PRICE_ID_{START,PRO,PREMIUM}`),
**WhatsApp** (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`,
`WHATSAPP_APP_SECRET`), **Zapier** (`ZAPIER_WEBHOOK_URL`, `ZAPIER_SHARED_SECRET`),
and optional analytics (`NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`),
plus `NEXT_PUBLIC_SITE_URL`.

> `NEXT_PUBLIC_*` are **build-time** — changing them requires a rebuild
> (`gcloud builds submit`), not just `services update`.

## Conventions & hard rules (from AGENTS.md)

- **Never commit secrets** (not in code, chat, or `cloudbuild.yaml`). Local
  secrets live outside the repo; production secrets live in Secret Manager.
- **Deploy = hybrid: Vercel (frontend) + Cloud Run (API).** All `/api/*` is proxied to
  Cloud Run, so **runtime secrets go on Cloud Run, never Vercel** (a Stripe secret set
  only on Vercel is inert). Earlier docs claimed "Cloud Run only / No Vercel" **or**
  "Vercel only / Cloud Run is legacy" — **both are wrong**; it's both hosts, split by
  layer. Authoritative map: `DEPLOY_STRIPE_VERCEL.md`. If you change hosting, do it
  deliberately and update this file + `status.md` together. **No Auth0** — `feat/auth0`
  is intentionally parked; Firebase
  Auth is the official v1 auth. Don't add `AUTH0_*`, Auth0 deps, or new
  `/auth/*` routes without a dedicated migration.
- Each agent works on its **own branch**; never commit directly to the branch
  that deploys.
- New API routes should follow the `lib/api-security.ts` pattern: origin check +
  rate limit + `jsonNoStore`, and (for authenticated routes) Firebase ID-token
  verification like the Stripe checkout route.
- New observable/UI content goes in `data/` (PT-BR); AI guardrails (compliance
  denylist) live in `lib/ai/prompts.ts`.
- Each task runs on its **own branch** off the deploy branch; commit with clear
  messages and open a PR — never push straight to the branch that deploys.
