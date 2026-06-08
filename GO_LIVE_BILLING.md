# 🚀 Go-Live do Billing (Stripe) — LeadBellus

> Checklist operacional pra ligar o faturamento de verdade. O **código já está pronto**
> (checkout, webhook, Firebase Admin, Zapier). O que falta é **credencial + configuração**.
> Última atualização: **2026-06-06**

## 🔐 Antes de tudo
- **NUNCA** cole `sk_live_...`, `whsec_...` ou o JSON do Firebase no chat, em commit ou no `cloudbuild.yaml`.
  Eles vão **só** pro `.env.local` (local) e pro **Secret Manager / env do Cloud Run** (produção).
- Chave exposta = **revogar imediatamente** no painel.
- As chaves que aparecem na doc do Stripe CLI (`sk_test_4eC39H...`) são exemplos públicos da Stripe, não servem.

---

## Dados fixos do projeto (já confirmados)
| Item | Valor |
|---|---|
| Conta Stripe | `acct_1TeQMX6Qz7MOnODL` (display ainda **"LeadCare"** — renomear) |
| Price IDs (LIVE, mensal) | Start `price_1TeqgV6Qz7MOnODLwa2ZFfTB` · Pro `price_1TeqgW6Qz7MOnODLcRx1XzGs` · Premium `price_1TeqgX6Qz7MOnODLYaqDreay` |
| Modo checkout | `subscription` |
| Deploy | **Cloud Run** (tem `cloudbuild.yaml` + `Dockerfile`; **não** é Vercel) |
| Serviço / Região | `leadbellus` / `southamerica-east1` |
| GCP Project | `leadvitta-app` (número `87102725202`) |
| Rota do webhook | `/api/stripe/webhook` |
| Eventos que o código trata | `checkout.session.completed`, `customer.subscription.created/updated/deleted` |

---

## ❌ O que falta (os 4 bloqueios)
1. `STRIPE_SECRET_KEY` (sk_live) — **vazio**
2. `STRIPE_WEBHOOK_SECRET` (whsec) — **vazio**
3. **Credenciais do Firebase Admin** — **ausentes** (sem isso o webhook NÃO grava a assinatura em `clinicas/{uid}.billing` → o cliente paga mas a conta nunca ativa)
4. Subir tudo isso na **produção (Cloud Run)** + ativar/renomear a conta Stripe

---

## Passo 1 — Ativar e renomear a conta Stripe
1. Painel → ativar a conta (dados de negócio/banco) se ainda pendente.
2. **Settings → Business → Public details**: renomear **"LeadCare" → "LeadBellus"**.

## Passo 2 — Pegar a `sk_live`
Painel → **Developers → API keys** → revelar **Secret key** (`sk_live_...`).
> Alternativa CLI: `stripe login` e depois `stripe config --list` mostra a chave persistida.

## Passo 3 — Criar o webhook de PRODUÇÃO (gera o `whsec`)
**Pelo painel (recomendado):**
1. **Developers → Webhooks → Add endpoint**
2. URL = `https://SUA-URL-DE-PRODUCAO/api/stripe/webhook`
   (a URL pública do Cloud Run `https://leadbellus-XXXX.run.app` ou o domínio `https://leadbellus.com.br`)
3. Eventos: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Criar → copiar o **Signing secret** (`whsec_...`).

**Alternativa por CLI:**
```bash
stripe post /v1/webhook_endpoints --live \
  -d url="https://SUA-URL-DE-PRODUCAO/api/stripe/webhook" \
  -d "enabled_events[]=checkout.session.completed" \
  -d "enabled_events[]=customer.subscription.created" \
  -d "enabled_events[]=customer.subscription.updated" \
  -d "enabled_events[]=customer.subscription.deleted"
# o "secret" (whsec_...) vem na resposta da criação — copie na hora.
```
> ⚠️ O `whsec` do `stripe listen` (teste local) **é diferente** do de produção. Não use o de teste no Cloud Run.

## Passo 4 — Credenciais do Firebase Admin
Firebase Console (projeto **leadvitta-app**) → **Project settings → Service accounts → Generate new private key** → baixa um JSON.
Esse JSON inteiro vira a variável `FIREBASE_SERVICE_ACCOUNT_JSON`.

## Passo 5 — Subir tudo no Cloud Run (via Secret Manager — recomendado)
```bash
# 1) criar os segredos (rode na pasta onde está o serviceAccount.json)
printf '%s' "sk_live_COLE_AQUI"  | gcloud secrets create stripe-secret-key      --data-file=- --project leadvitta-app
printf '%s' "whsec_COLE_AQUI"    | gcloud secrets create stripe-webhook-secret  --data-file=- --project leadvitta-app
gcloud secrets create firebase-service-account --data-file=serviceAccount.json  --project leadvitta-app

# 2) dar acesso de leitura à service account de runtime do Cloud Run
gcloud projects add-iam-policy-binding leadvitta-app \
  --member="serviceAccount:87102725202-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# 3) plugar segredos + envs no serviço (cria uma nova revisão automaticamente)
gcloud run services update leadbellus --region southamerica-east1 --project leadvitta-app \
  --set-secrets STRIPE_SECRET_KEY=stripe-secret-key:latest,STRIPE_WEBHOOK_SECRET=stripe-webhook-secret:latest,FIREBASE_SERVICE_ACCOUNT_JSON=firebase-service-account:latest \
  --update-env-vars STRIPE_CHECKOUT_MODE=subscription,STRIPE_PRICE_ID_START=price_1TeqgV6Qz7MOnODLwa2ZFfTB,STRIPE_PRICE_ID_PRO=price_1TeqgW6Qz7MOnODLcRx1XzGs,STRIPE_PRICE_ID_PREMIUM=price_1TeqgX6Qz7MOnODLYaqDreay
```
> 💡 `NEXT_PUBLIC_*` (ex.: `NEXT_PUBLIC_SITE_URL`, pixel, GA4) são **build-time** — mudar essas exige **rebuild** (`gcloud builds submit --config cloudbuild.yaml`), não só `services update`. As `STRIPE_*` e `FIREBASE_*` são server-side/runtime, então o `services update` acima já basta pra elas.

## Passo 6 — Verificar (sem deixar pra sorte)
1. **Developers → Webhooks → seu endpoint → Recent deliveries**: as entregas devem voltar **200**.
2. Fazer um checkout real (dá pra usar um **cupom 100% off** — `allow_promotion_codes` está ligado — pra não gastar).
3. Conferir no Firestore: `clinicas/{uid}.billing.status` deve virar `active`/`paid` e `stripe_subscription_id` preenchido.
   - Se a entrega der 200 mas o Firestore **não** atualizar → o Firebase Admin não está configurado (Passo 4).

---

## (Opcional) Testar local antes de produção
> Atenção: o `stripe listen` roda em **test mode** por padrão. Seus Price IDs são **LIVE** — em teste eles não existem.
> Pra testar local de verdade você precisa de Price IDs de **test mode** + `sk_test` no `.env.local`.

```bash
stripe login
npm run dev                                   # app em http://localhost:3000
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copie o whsec_... impresso → STRIPE_WEBHOOK_SECRET no .env.local (só vale enquanto o listen roda)
stripe trigger checkout.session.completed     # dispara um evento de teste
```

---

## Estado do `.env.local` (local, hoje)
| Var | Status |
|---|---|
| `STRIPE_PRICE_ID_START/PRO/PREMIUM` | ✅ preenchidos |
| `STRIPE_CHECKOUT_MODE` | ✅ `subscription` |
| `STRIPE_SECRET_KEY` | ❌ vazio |
| `STRIPE_WEBHOOK_SECRET` | ❌ vazio |
| `FIREBASE_SERVICE_ACCOUNT_JSON` (Admin) | ❌ ausente |
| Front Firebase (`NEXT_PUBLIC_FIREBASE_*`) | ✅ ok |
| IA | `OPENAI_API_KEY` ✅ (Anthropic vazio) |
