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
- **Auth:** Firebase Auth (e-mail/senha + Google). **Billing:** Stripe LIVE com webhook configurado.
- **IA:** cadeia de fallback OpenAI → Anthropic → Gemini.
- **WhatsApp:** envio validado em produção via **Z-API** (instância LeadBellus conectada/PAID, número +55 91 8515-6690). Auto-resposta (webhook) em rollout.


## Rodar local

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Sem chaves, o app roda em **modo demonstração**:
login dispensado, dados no `localStorage` e respostas mockadas.

## Estratégia de autenticação (v1)

- **Firebase Auth** é a autenticação oficial do produto no v1.
- `/login` e `/signup` usam Firebase Auth com Email/Senha e Google opcional.
- Rotas server-side autenticadas validam **Firebase ID token**.
- Billing, Firestore e eventos autenticados do Zapier continuam vinculados à
  identidade atual do Firebase.
- **Auth0 não faz parte do fluxo atual**.

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
```

### WhatsApp (Multi-provedor)

O app suporta múltiplos provedores. Defina `WHATSAPP_PROVIDER` como `twilio`, `dialog360` ou `zapi`.

#### Z-API (Recomendado para mensagens ricas)
```env
WHATSAPP_PROVIDER=zapi
ZAPI_INSTANCE_ID=
ZAPI_TOKEN=
ZAPI_CLIENT_TOKEN=
ZAPI_SECURITY_TOKEN=
```
Para configurar os webhooks automaticamente na Z-API, rode:
```bash
node scripts/setup-zapi-webhook.mjs
```

#### 360dialog
```env
WHATSAPP_PROVIDER=dialog360
D360_API_KEY=
D360_WEBHOOK_TOKEN=
```

#### Twilio
```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=
TWILIO_API_KEY_SID=
TWILIO_API_KEY_SECRET=
TWILIO_WHATSAPP_FROM=
TWILIO_AUTH_TOKEN=
```

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

## Rotas principais

- `/` marketing
- `/login`, `/dashboard`, `/gerador`, `/historico`, `/configuracoes`
- `/api/generate` IA
- `/api/stripe/webhook`
- `/api/whatsapp/webhook`
- `/api/health`
- `/api/config` (Status de capacidades ativas)
