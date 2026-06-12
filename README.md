# LeadBellus

Micro-SaaS para clínicas e profissionais de estética responderem melhor no
WhatsApp: gera respostas estratégicas, quebra objeções, faz follow-up e conduz a
cliente até o agendamento com guardrails de compliance.

Stack: **Next.js App Router + TypeScript + TailwindCSS + Firebase Auth/Firestore + OpenAI/Anthropic + Stripe + Zapier + Cloud Run**.

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
- **Auth0 não faz parte do fluxo atual**. Só deve voltar em uma migração
  dedicada se houver necessidade real de SSO/organizações ou identidade
  compartilhada entre múltiplos apps.

## Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha conforme o ambiente.

### Firebase

No Firebase Console:

1. Crie um projeto e um Web App.
2. Habilite **Authentication** com Email/Senha e, se quiser, Google.
3. Habilite **Firestore Database**.
4. Copie as variáveis `NEXT_PUBLIC_FIREBASE_*` do SDK setup.
5. Para APIs server-side, prefira a identidade do próprio serviço no Cloud Run
   (ADC). Fora do GCP, use uma destas opções:
   - `FIREBASE_SERVICE_ACCOUNT_JSON`
   - `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`
   - ou `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.

Sem Firebase Admin, login client-side ainda funciona, mas Stripe webhooks não
conseguem atualizar Firestore e `/api/zapier/lead` rejeita envio autenticado.

### Validação Firebase

Antes de abrir PR ou publicar mudanças que toquem Auth, Firestore, billing ou
rotas server-side, rode:

```bash
npm run firebase:verify
```

Esse comando sempre valida contratos estáticos de Firebase: `firebase.json`,
`firestore.rules`, `firestore.indexes.json`, queries do app, inicialização do
Admin SDK, `/api/config` e rotas que exigem Firebase ID token.

Para validar as rules dinamicamente no Firestore emulator, instale JRE/JDK 17+
e rode:

```bash
npm run firebase:emulator:check
```

No CI, o workflow `Firebase Verify` instala Java 17 e roda `firebase:verify` com
`REQUIRE_FIREBASE_EMULATOR=1`, então o emulator é obrigatório no GitHub Actions.

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
STRIPE_CHECKOUT_MODE=subscription
STRIPE_PRICE_ID_START=
STRIPE_PRICE_ID_PRO=
STRIPE_PRICE_ID_PREMIUM=
```

Oferta atual do app: **Start R$97/mês** disponível para checkout. Pro e Premium
aparecem como lista de espera; seus Price IDs só precisam estar ativos quando
esses planos forem abertos para venda.

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

#### Teste sem WhatsApp real

Você consegue simular uma mensagem recebida sem Meta/WhatsApp real usando o
script local:

```bash
npm run dev
npm run whatsapp:simulate -- --text "Oi, queria saber sobre botox"
```

O simulador faz `POST` para `http://localhost:3000/api/whatsapp/webhook` com um
payload compatível com a WhatsApp Cloud API. Ele também lê `.env.local`; se
`WHATSAPP_APP_SECRET` existir, assina o payload com `X-Hub-Signature-256`.

Para testar o fluxo completo de IA + histórico, o Firestore precisa ter uma
clínica com:

- `whatsapp` igual ao número usado no simulador (`--to`, padrão `5591999999999`)
- `billing.status` igual a `active`, `paid` ou `trialing`

Sem `WHATSAPP_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID`, o app não envia mensagem real,
mas ainda dá para validar o parse do webhook, a geração da resposta e a tentativa
de registro no histórico. Para testar apenas IA, use `POST /api/generate`.

### Zapier

No Zapier, crie um Zap com **Webhooks by Zapier -> Catch Hook** e configure:

```env
ZAPIER_WEBHOOK_URL=
ZAPIER_SHARED_SECRET=
```

O app envia eventos de signup, checkout iniciado e checkout concluído. O segredo
opcional vai dentro do payload para filtros/validações no Zap.

## Deploy no Cloud Run

1. Use `gcloud builds submit --config cloudbuild.yaml`.
2. Configure segredos e env vars server-side no serviço do Cloud Run e/ou no
   Secret Manager.
3. Defina `NEXT_PUBLIC_SITE_URL=https://SEU-HOST` antes do build.
4. Refaça o build/deploy sempre que mudar qualquer `NEXT_PUBLIC_*`, porque essas
   vars entram no bundle.
5. Cadastre o webhook do Stripe apontando para `/api/stripe/webhook`.
6. No Firebase Auth, adicione a URL do Cloud Run e qualquer domínio próprio aos
   domínios autorizados.
7. Valide `GET /api/health` depois de cada deploy.

> O deploy oficial é **Cloud Run**. Não use Vercel como ambiente ativo deste app.

## Rotas principais

- `/` marketing
- `/login` e `/signup` via Firebase Auth
- `/dashboard`, `/gerador`, `/objecoes`, `/follow-up`, `/scripts`, `/historico`, `/configuracoes`
- `/api/generate` e `/api/follow-up` IA
- `/api/stripe/checkout` e `/api/stripe/webhook`
- `/api/zapier/lead`
- `/api/whatsapp/webhook`
- `/api/health`
