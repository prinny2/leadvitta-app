# AGENTS.md

This repo is **LeadBellus**, a single Next.js 15 (App Router) + TypeScript app.
See `README.md` and `CLAUDE.md` for product, architecture, env vars, and deploy
details. Standard dev commands live in `package.json` (`dev`, `build`, `start`,
`test`, `test:watch`, `test:coverage`).

## Cursor Cloud specific instructions

- **Demo mode is the default with no secrets.** With zero env vars the app runs
  fully: login is skipped where possible, data lives in browser `localStorage`,
  and AI responses are mocked (`lib/ai/mock.ts`). No API keys are needed to
  develop, test, build, or run.
- **Run dev:** `npm run dev` → http://localhost:3000 (HMR). Build: `npm run build`.
  Tests: `npm test` (Vitest, ~275 tests, all mocked — no network or keys needed).
  There is **no lint script**; do not invent one.
- **Smoke checks:** `GET /api/health` and `GET /api/config` return JSON readiness
  flags (all integrations report `false` in demo mode, except `firebase` which
  may report `true` from baked public defaults — this does not require secrets).
- **Exercising the core AI flow without auth:** the protected app routes under
  `app/(app)/*` (e.g. `/gerador`, `/dashboard`) redirect to `/login` when there
  is no real Firebase session. To test the "message → 3 response variants" core
  feature in the browser, use the public **`/demo`** page (the "Simulador rápido"
  reachable from the landing page "Demo" link), or hit the API directly:
  `curl -X POST localhost:3000/api/generate -H 'Content-Type: application/json' -d '{"mensagemCliente":"..."}'`
  (returns `respostas.{curta,consultiva,persuasiva}` and `"mock": true`).
- **Node version:** the production `Dockerfile` uses Node 20, but Node 22 (the VM
  default) builds, tests, and runs the app fine for development.
