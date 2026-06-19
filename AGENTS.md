# AGENTS.md

Grounded workflow notes for agents working in this repo. When docs conflict,
prefer the code in `package.json`, `next.config.mjs`, `lib/`, and `scripts/`.

## Verified Commands

```bash
npm install
npm run dev
npm run build
npm run start
npm test
npm run test:watch
npm run test:coverage
npm run firebase:check
npm run firebase:verify
npm run firebase:emulator:check
npm run whatsapp:simulate -- --text "Oi, queria saber sobre botox"
node scripts/setup-zapi-webhook.mjs https://leadbellus-87102725202.southamerica-east1.run.app/api/whatsapp/webhook
pwsh -File scripts/deploy-cloudrun.ps1
```

- `npm run firebase:verify` passes static checks without Java; the emulator step
  is skipped unless Java/JDK 21+ is available in `PATH`.
- `npm run whatsapp:simulate` targets
  `http://localhost:3000/api/whatsapp/webhook` by default and supports
  `--zapi-security-token`.

## Deploy Workflow

- The current code path is hybrid: Vercel serves
  `https://www.leadbellus.com.br`, and `/api/*` is proxied to Cloud Run when
  `VERCEL=1` or `ENABLE_API_PROXY=true` (`next.config.mjs`).
- Never point `API_PROXY_ORIGIN` at `leadbellus.com.br`; it must stay on the
  Cloud Run `.run.app` origin to avoid an API proxy loop.
- `NEXT_PUBLIC_*` vars are build-time. Rebuild Vercel or rebuild the Docker
  image after changing them.
- Runtime secrets and server env (`STRIPE_*`, `FIREBASE_*`, `OPENAI_*`,
  `ANTHROPIC_*`, `GEMINI_*`, `ZAPI_*`) belong on Cloud Run / Secret Manager,
  not only in Vercel.
- Manual Cloud Run build path stays available via `cloudbuild.yaml`:

```bash
gcloud builds submit --config cloudbuild.yaml --substitutions=...
gcloud run services update leadbellus --region southamerica-east1 --set-secrets ... --update-env-vars ...
```

## Billing And WhatsApp Notes

- `lib/billing.ts` is the pricing source of truth: Start `R$97`, Pro `R$197`,
  Premium `R$347`.
- Billing code reads both monthly and annual Stripe env vars:
  `STRIPE_PRICE_ID_{START,PRO,PREMIUM}` and
  `STRIPE_PRICE_ID_{START,PRO,PREMIUM}_ANNUAL`.
- Current app code is Z-API based (`lib/whatsapp*.ts`, `.env.local.example`,
  `scripts/setup-zapi-webhook.mjs`).

## TODO

- Sync broader docs that still mention Twilio/360dialog or omit the annual
  Stripe price env vars before treating them as authoritative.
