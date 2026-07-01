# LeadBellus

Micro-SaaS para clínicas e profissionais de estética responderem melhor no
WhatsApp: gera respostas estratégicas, quebra objeções, faz follow-up e conduz a
cliente até o agendamento com guardrails de compliance.

**Empresa (LeadBellus):** Vinicius Paes da Serra Freire (MEI)  
**Fundador:** Vinicius Paes da Serra Freire  
**Contato:** vpaes.freire02@gmail.com

**Nota:** A Inova Simples (RESONANZA INOVA SIMPLES I S, CNPJ 67.046.121/0001-45) é exclusiva para o projeto ResonAnza (com José). O LeadBellus opera sob o MEI pessoal.

Stack: **Next.js App Router + TypeScript + TailwindCSS + Firebase Auth/Firestore + OpenAI/Anthropic/Gemini + Stripe + Zapier + Cloud Run/Vercel (Híbrido)**.

## Status (produção) — atualizado 2026-06-15

- **LIVE:** `https://leadbellus.com.br` em arquitetura **híbrida** — Vercel serve o frontend, Cloud Run processa `/api/*` (proxy). Modo demonstração desligado (config Firebase real no bundle).
- **Auth:** Firebase Auth (client) + cookie-based guard no middleware. **Clerk está em planejamento** (migração futura, não aplicado neste checkout). **Auth0** não faz parte do fluxo (`feat/auth0` parado).
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

- **Firebase Auth** (client-side via `firebase` + `getFirebaseAuth()`) + proteção leve por cookie (`firebase_auth`) no `middleware.ts` (ver `lib/firebase/middleware.ts`).
- `/login` e `/signup` usam `VisualAuthPanel` (Firebase).
- Muitas rotas internas e APIs de negócio recebem `firebaseIdToken` (do `user.getIdToken()`) e o verificam server-side (`verifyFirebaseIdToken`).
- Firebase também é usado para Firestore.
- **Clerk (@clerk/nextjs)**: **planejado como migração futura**. Não instalado nem integrado neste checkout. Qualquer migração deve ser feita em branch separado e deve:
  - Manter webhooks públicos (Stripe, Z-API) sem proteção de auth middleware.
  - Mapear identidade (Clerk user → Firestore/UID ou custom claims).
  - Adaptar todos os callers de `firebaseIdToken`.
- **Auth0** (`feat/auth0`) está intencionalmente parado — não confundir com Clerk.

## Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha conforme o ambiente.

### Firebase

No Firebase Console:

1. Crie um projeto e um Web App.
2. Habilite **Authentication** e **Firestore Database**.
3. Copie as variáveis `NEXT_PUBLIC_FIREBASE_*`.
4. Para APIs server-side, prefira a identidade do próprio serviço no Cloud Run (ADC).

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

- **URL:** `https://leadbellus-87102725202.southamerica-east1.run.app/api/stripe/webhook` (Cloud Run direto).
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
  https://leadbellus-87102725202.southamerica-east1.run.app/api/whatsapp/webhook
```

Webhook inbound recomendado: URL **direta** do Cloud Run (`.run.app`) com `?token=<ZAPI_SECURITY_TOKEN>`.
Ver **DEPLOY_STRIPE_VERCEL.md** §6.

### Zapier

```env
ZAPIER_WEBHOOK_URL=
ZAPIER_SHARED_SECRET=
```

## Deploy (Arquitetura Híbrida)

- **Vercel:** Serve o frontend e domínio principal (`leadbellus.com.br`).
- **Cloud Run:** Processa todas as rotas `/api/*` via proxy, gerencia segredos e integrações pesadas.

1. Configure `ENABLE_API_PROXY=true` e `API_PROXY_ORIGIN` na Vercel apontando para o Cloud Run.
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
