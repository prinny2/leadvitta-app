# LeadBellus

Micro-SaaS para clínicas e profissionais de estética responderem melhor no
WhatsApp: gera respostas estratégicas, quebra objeções, faz follow-up e conduz a
cliente até o agendamento com guardrails de compliance.

**Empresa (LeadBellus):** Vinicius Paes da Serra Freire (MEI)  
**Fundador:** Vinicius Paes da Serra Freire  
**Contato:** vpaes.freire02@gmail.com

**Nota:** A Inova Simples (RESONANZA INOVA SIMPLES I S, CNPJ 67.046.121/0001-45) é exclusiva para o projeto ResonAnza (com José). O LeadBellus opera sob o MEI pessoal.

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

Hoje o provedor padrão de WhatsApp é **Twilio**. Para envio de mensagens e
recebimento de webhooks, configure:

```env
TWILIO_ACCOUNT_SID=
TWILIO_API_KEY_SID=
TWILIO_API_KEY_SECRET=
TWILIO_WHATSAPP_FROM=
TWILIO_AUTH_TOKEN=
```

O webhook público fica em:

```text
https://SEU-DOMINIO/api/whatsapp/webhook
```

Comportamento atual:

- `GET /api/whatsapp/webhook` valida o challenge do provedor ativo quando
  configurado
- `POST /api/whatsapp/webhook` valida a assinatura do provedor ativo quando a
  chave correspondente existir
- as mensagens recebidas já são parseadas e registradas, prontas para a próxima etapa de resposta automática

#### Teste sem WhatsApp real

Você consegue simular uma mensagem recebida sem Meta/WhatsApp real usando o
script local:

```bash
npm run dev
npm run whatsapp:simulate -- --text "Oi, queria saber sobre botox"
```

O simulador faz `POST` para `http://localhost:3000/api/whatsapp/webhook` com um
payload compatível com o provedor ativo. Ele também lê `.env.local` e assina o
payload com a assinatura correta quando a validação do provedor estiver ativa:

- **Twilio:** usa `TWILIO_AUTH_TOKEN` para gerar `X-Twilio-Signature`
- **360dialog:** envia `D360_WEBHOOK_TOKEN` em `x-d360-token`
- `--app-secret` continua disponível para adicionar `X-Hub-Signature-256` se você quiser reproduzir esse header também

Para testar o fluxo completo de IA + histórico, o Firestore precisa ter uma
clínica com:

- `whatsapp` igual ao número usado no simulador (`--to`, padrão `5591999999999`)
- `billing.status` igual a `active`, `paid` ou `trialing`

Sem as credenciais do provedor ativo, o app não envia mensagem real, mas ainda
dá para validar o parse do webhook, a geração da resposta e a tentativa de
registro no histórico. Para testar apenas IA, use `POST /api/generate`.

### Zapier

No Zapier, crie um Zap com **Webhooks by Zapier -> Catch Hook** e configure:

```env
ZAPIER_WEBHOOK_URL=
ZAPIER_SHARED_SECRET=
```

O app envia eventos de signup, checkout iniciado e checkout concluído. O segredo
opcional vai dentro do payload para filtros/validações no Zap.

## Deploy

1. Consulte `COORDINATION.md` antes de mudar o destino público.
2. Refaça o build sempre que mudar qualquer `NEXT_PUBLIC_*`, porque essas vars
   entram no bundle.
3. Cadastre o webhook do Stripe apontando para `/api/stripe/webhook`.
4. No Firebase Auth, adicione os domínios públicos que estiverem ativos.
5. Valide `GET /api/health` depois de cada deploy.

> Vercel e Cloud Run podem coexistir enquanto a coordenação decidir; não parta
> do pressuposto de que só um deles está ativo.

## Rotas principais

- `/` marketing
- `/login` e `/signup` via Firebase Auth
- `/dashboard`, `/gerador`, `/objecoes`, `/follow-up`, `/scripts`, `/historico`, `/configuracoes`
- `/api/generate` e `/api/follow-up` IA
- `/api/stripe/checkout` e `/api/stripe/webhook`
- `/api/zapier/lead`
- `/api/whatsapp/webhook`
- `/api/health`
