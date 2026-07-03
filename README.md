# LeadBellus

Micro-SaaS para clínicas e profissionais de estética responderem melhor no
WhatsApp: gera respostas estratégicas, quebra objeções, faz follow-up e conduz a
cliente até o agendamento com guardrails de compliance.

**Empresa (LeadBellus):** Vinicius Paes da Serra Freire (MEI)  
**Fundador:** Vinicius Paes da Serra Freire  
**Contato:** vpaes.freire02@gmail.com

**Nota:** A Inova Simples (RESONANZA INOVA SIMPLES I S, CNPJ 67.046.121/0001-45) é exclusiva para o projeto ResonAnza (com José). O LeadBellus opera sob o MEI pessoal.

Stack: **Next.js App Router + TypeScript + TailwindCSS + Clerk + Firebase/Firestore + OpenAI/Anthropic/Gemini + Stripe + Zapier + Vercel (produção) + Cloud Run (legado/backup)**.

## Status (produção) — atualizado 2026-07-03

- **LIVE:** `https://leadbellus.com.br` em arquitetura **full-Vercel** — Vercel serve o frontend e executa `/api/*`; Cloud Run fica como legado/backup. `ENABLE_API_PROXY` deve permanecer desligado.
- **Auth:** Clerk para login/cadastro com ponte Firebase interna. **Billing:** Stripe LIVE com webhook configurado.
- **IA:** cadeia de fallback OpenAI → Anthropic → Gemini.
- **WhatsApp:** envio validado em produção via **Z-API** (instância LeadBellus conectada/PAID, número +55 91 8515-6690). Auto-resposta (webhook) em rollout.


## Rodar local

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Sem chaves, o app roda em **modo demonstração**:
login dispensado, dados no `localStorage` e respostas mockadas.

## Estratégia de autenticação (atual)

- **Clerk** é a sessão pública oficial do produto.
- `/login` e `/signup` usam os componentes Clerk.
- Após login Clerk, o app cria uma sessão Firebase interna por custom token para
  preservar Firestore, checkout e APIs que ainda validam **Firebase ID token**.
- Webhooks públicos (`/api/stripe/webhook`, `/api/whatsapp/webhook` e Clerk) não
  ficam atrás de `auth.protect()`.
- **Auth0 não faz parte do fluxo atual**.

## Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha conforme o ambiente.

### Clerk

No Clerk Dashboard:

1. Crie/configure a aplicação de produção.
2. Configure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` e `CLERK_SECRET_KEY`.
3. Crie webhook para `POST /api/clerk/webhook` com evento `user.created` e salve
   o segredo em `CLERK_WEBHOOK_SIGNING_SECRET`.

### Firebase

No Firebase Console:

1. Crie um projeto e um Web App.
2. Habilite **Authentication** e **Firestore Database**.
3. Copie as variáveis `NEXT_PUBLIC_FIREBASE_*`.
4. Para APIs server-side, configure Firebase Admin; ele cria os custom tokens da
   ponte Clerk -> Firebase.

### IA

Configure pelo menos uma chave:

```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
# Modelos opcionais
OPENAI_MODEL=gpt-4o
ANTHROPIC_MODEL=claude-haiku-4-5
GEMINI_MODEL=gemini-2.5-flash
```

O backend tenta os provedores na ordem: **OpenAI -> Anthropic -> Gemini**.

### Stripe (ADR-001)

A configuração de webhooks deve seguir o **ADR-001**:

- **URL:** `https://www.leadbellus.com.br/api/stripe/webhook` (host canônico atual; `.run.app` só no modo híbrido/legado).
- **Modo:** Snapshot (Instantâneo).
- **Eventos:** `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_START=
STRIPE_PRICE_ID_PRO=
STRIPE_PRICE_ID_PREMIUM=
STRIPE_PRICE_ID_START_ANNUAL=
STRIPE_PRICE_ID_PRO_ANNUAL=
STRIPE_PRICE_ID_PREMIUM_ANNUAL=
# Opcional: guard extra no checkout (comma-separated price_...)
STRIPE_ALLOWED_PRICE_IDS=
```

### WhatsApp (Z-API — único provedor)

```env
ZAPI_INSTANCE_ID=
ZAPI_TOKEN=
ZAPI_CLIENT_TOKEN=
ZAPI_SECURITY_TOKEN=
```

Para configurar os webhooks automaticamente na Z-API:

```bash
node scripts/setup-zapi-webhook.mjs \
  https://www.leadbellus.com.br/api/whatsapp/webhook
```

Webhook inbound recomendado: host canônico **`www.leadbellus.com.br`** com `?token=<ZAPI_SECURITY_TOKEN>`; use `.run.app` apenas no modo híbrido/legado.
Ver **DEPLOY_STRIPE_VERCEL.md** §6.

### Zapier

```env
ZAPIER_WEBHOOK_URL=
ZAPIER_SHARED_SECRET=
```

## Deploy (Vercel atual)

- **Vercel:** Serve o frontend, domínio principal (`leadbellus.com.br`) e handlers `app/api/*`.
- **Cloud Run:** Legado/backup. Use apenas se o modo híbrido/proxy for reativado deliberadamente.

1. Mantenha `ENABLE_API_PROXY=false`/ausente em produção para preservar a ponte Clerk -> Firebase.
2. Refaça o build sempre que mudar qualquer `NEXT_PUBLIC_*`.
3. Valide `GET /api/health` e `GET /api/config` após o deploy.

## Testes

Testes unitários com **Vitest** cobrem a lógica pura (sem rede): geração de
prompts, guardrails de compliance, parsing de respostas da IA, segurança das
APIs (rate limit, CORS, validação de payload), billing, ativação de billing via
webhook do Stripe, flags de configuração e os catálogos de dados.

```bash
npm test            # roda toda a suíte uma vez
npm run test:watch  # modo watch durante o desenvolvimento
npm run test:coverage  # relatório de cobertura (texto + HTML em ./coverage)
```

Os testes ficam em `tests/`, espelhando a estrutura de `lib/`, `data/` e
`app/api/`. Os SDKs externos (OpenAI/Anthropic/Stripe), o Firestore Admin e
`fetch` são mockados — nenhum teste faz chamada de rede real nem precisa de
chaves.

## Rotas principais

- `/` marketing
- `/login`, `/dashboard`, `/gerador`, `/historico`, `/configuracoes`
- `/api/generate` IA
- `/api/stripe/webhook`
- `/api/whatsapp/webhook`
- `/api/health`
- `/api/config` (Status de capacidades ativas)
