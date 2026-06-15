# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

> **`AGENTS.md` is the authoritative rulebook** for agent roles, deployment, and
> safety constraints. This file summarizes the codebase; where the two overlap,
> AGENTS.md wins. The live project-state file is **`ESTADO.md`** (kept locally,
> outside git).

## ⚠️ This app is LIVE and billing in production

LeadBellus runs on **Google Cloud Run** and **charges real customers via
Stripe**. Treat every change as a production change. Do not assume "it's done"
without live verification (curl the route, check the Stripe dashboard, check
Firestore).

## What this app is

**LeadBellus** — a Brazilian (PT-BR) SaaS micro-app that helps **aesthetic
clinics and beauty professionals** respond better on WhatsApp. It turns an
incoming client message into **3 strategic response variants**
(Suave / Consultiva / Fechamento) with AI compliance guardrails (no guaranteed
results, no fixed pricing, no medical diagnoses). It also generates objection
rebuttals, follow-ups, and sales scripts, and logs every response with
intent/sentiment/score.

Business model: monthly subscriptions (Start R$197 / Pro R$297 / Premium R$397).

## Tech stack

- **Next.js 15 (App Router)** + **React 19** + **TypeScript (strict)** +
  **TailwindCSS 3.4**.
- **AI:** OpenAI (`gpt-4o-mini` default) with **Anthropic Claude fallback**
  (`claude-haiku-4-5`). All calls are server-side with timeout/retry; Anthropic
  uses ephemeral prompt caching.
- **Auth + data:** Firebase Auth (email/password + Google) and Cloud Firestore;
  Firebase Admin SDK for server-side webhook writes.
- **Billing:** Stripe (subscription mode), reconciled into Firestore via webhook.
- **Integrations:** WhatsApp Cloud API (Meta) and Zapier.
- **Deploy:** Docker (Node 20, `output: "standalone"`) → Cloud Build → Cloud Run
  (region `southamerica-east1`, service `leadbellus`). Firebase Hosting rewrites
  all traffic to the Cloud Run service.

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

There is **no `lint` or `test` script** — do not invent validation commands
beyond build + health check (per AGENTS.md). Available scripts: `dev`, `build`,
`start`.

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

## Deploy (Claude only — see AGENTS.md)

Only the Claude agent runs `gcloud`. Build & deploy:

```bash
gcloud builds submit --config cloudbuild.yaml
gcloud run services update <SERVICE> --region <REGION> --set-env-vars NEXT_PUBLIC_SITE_URL=https://<HOST>
gcloud run services update <SERVICE> --region <REGION> --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest
```

After every deploy, validate `GET /api/health`. Public webhooks live at
`/api/stripe/webhook` and `/api/whatsapp/webhook` on the Cloud Run URL.

## Environment variables

Copy `.env.local.example` → `.env.local`; it is the source of truth for names.
Groups: **Firebase** (`NEXT_PUBLIC_FIREBASE_*` + Admin `FIREBASE_SERVICE_ACCOUNT_JSON`
or `FIREBASE_PROJECT_ID`/`FIREBASE_CLIENT_EMAIL`/`FIREBASE_PRIVATE_KEY`),
**AI** (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `AI_MODEL`),
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
- **No Vercel** — official deploy is Cloud Run only (Vercel caused domain
  split-brain). **No Auth0** — `feat/auth0` is intentionally parked; Firebase
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
