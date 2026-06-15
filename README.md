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

### WhatsApp

Para envio de mensagens e recebimento de webhooks da WhatsApp Cloud API, configure:

```env
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
```

O webhook público fica em:

```text
https://SEU-DOMINIO/api/whatsapp/webhook
```

Comportamento atual:

- `GET /api/whatsapp/webhook` valida o `hub.challenge` usando `WHATSAPP_VERIFY_TOKEN`
- `POST /api/whatsapp/webhook` valida `X-Hub-Signature-256` quando `WHATSAPP_APP_SECRET` existir
- as mensagens recebidas já são parseadas e registradas, prontas para a próxima etapa de resposta automática

### Zapier

No Zapier, crie um Zap com **Webhooks by Zapier -> Catch Hook** e configure:

```env
ZAPIER_WEBHOOK_URL=
ZAPIER_SHARED_SECRET=
```

O app envia eventos de signup, checkout iniciado e checkout concluído. O segredo
opcional vai dentro do payload para filtros/validações no Zap.

## Testes

Testes unitários com **Vitest** cobrem a lógica pura (sem rede): geração de
prompts, guardrails de compliance, parsing de respostas da IA, segurança das
APIs (rate limit, CORS, validação de payload), billing, flags de configuração e
os catálogos de dados.

```bash
npm test            # roda toda a suíte uma vez
npm run test:watch  # modo watch durante o desenvolvimento
npm run test:coverage  # relatório de cobertura (texto + HTML em ./coverage)
```

Os testes ficam em `tests/`, espelhando a estrutura de `lib/` e `data/`. Os SDKs
externos (OpenAI/Anthropic) e `fetch` são mockados — nenhum teste faz chamada de
rede real nem precisa de chaves.

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
- `/api/whatsapp/webhook`
- `/api/health`
