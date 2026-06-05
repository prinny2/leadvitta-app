# LeadBellus

Micro-SaaS para clínicas e profissionais de estética responderem melhor no
WhatsApp: gera respostas estratégicas, quebra objeções, faz follow-up e conduz a
cliente até o agendamento com guardrails de compliance.

Stack: **Next.js App Router + TypeScript + TailwindCSS + Firebase + OpenAI/Anthropic + Stripe + Zapier + Vercel**.

## Rodar local

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Sem chaves, o app roda em **modo demonstração**:
login dispensado, dados no `localStorage` e respostas mockadas.

## Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha conforme o ambiente.

### Firebase

No Firebase Console:

1. Crie um projeto e um Web App.
2. Habilite **Authentication** com Email/Senha e, se quiser, Google.
3. Habilite **Firestore Database**.
4. Copie as variáveis `NEXT_PUBLIC_FIREBASE_*` do SDK setup.
5. Para APIs server-side, crie uma service account e configure uma destas opções:
   - `FIREBASE_SERVICE_ACCOUNT_JSON`
   - `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`
   - ou `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.

Sem Firebase Admin, login client-side ainda funciona, mas Stripe webhooks não
conseguem atualizar Firestore e `/api/zapier/lead` rejeita envio autenticado.

### IA

Configure pelo menos uma chave:

```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
AI_MODEL=gpt-4o-mini
```

Sem chaves, o app mantém o modo demonstração com exemplos.

### Stripe

Crie produtos/preços no Stripe e configure:

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CHECKOUT_MODE=payment
STRIPE_PRICE_ID_START=
STRIPE_PRICE_ID_PRO=
STRIPE_PRICE_ID_PREMIUM=
```

O checkout é iniciado em `POST /api/stripe/checkout`. O webhook público fica em:

```text
https://SEU-DOMINIO/api/stripe/webhook
```

Eventos tratados:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Quando houver Firebase Admin, o webhook grava eventos em `stripe_events` e atualiza
`clinicas/{uid}.billing`. Também envia eventos ao Zapier quando configurado.

### Zapier

No Zapier, crie um Zap com **Webhooks by Zapier -> Catch Hook** e configure:

```env
ZAPIER_WEBHOOK_URL=
ZAPIER_SHARED_SECRET=
```

O app envia eventos de signup, checkout iniciado e checkout concluído. O segredo
opcional vai dentro do payload para filtros/validações no Zap.

## Deploy na Vercel

1. Importe o repositório na Vercel.
2. Configure todas as env vars em **Project Settings -> Environment Variables**.
3. Defina `NEXT_PUBLIC_SITE_URL=https://SEU-DOMINIO`.
4. Rode um redeploy depois de mudar qualquer `NEXT_PUBLIC_*`, porque essas vars
   entram no build.
5. Cadastre o webhook do Stripe apontando para `/api/stripe/webhook`.
6. No Firebase Auth, adicione o domínio Vercel/domínio próprio aos domínios autorizados.

## Rotas principais

- `/` marketing
- `/login` e `/signup` Firebase Auth
- `/dashboard`, `/gerador`, `/objecoes`, `/follow-up`, `/scripts`, `/historico`, `/configuracoes`
- `/api/generate` e `/api/follow-up` IA
- `/api/stripe/checkout` e `/api/stripe/webhook`
- `/api/zapier/lead`
- `/api/health`
