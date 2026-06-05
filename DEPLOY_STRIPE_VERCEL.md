# LeadVitta — Deploy Cloud Run + Stripe

Checklist operacional para colocar a cobrança recorrente no ar no Google Cloud Run.

## 1. Status do código

- Checkout Stripe: `app/api/stripe/checkout/route.ts`
- Webhook Stripe: `app/api/stripe/webhook/route.ts`
- Planos habilitados no billing: `start`, `pro`, `premium`
- Modo recomendado: `subscription`

## 2. Planos e preços

| Plano | Valor mensal | Variável |
|---|---:|---|
| Start | R$197/mês | `STRIPE_PRICE_ID_START` |
| Pro | R$297/mês | `STRIPE_PRICE_ID_PRO` |
| Premium | R$397/mês | `STRIPE_PRICE_ID_PREMIUM` |

## 3. Variáveis obrigatórias no Cloud Run

Configurar via:

`gcloud run services update NOME-DO-SERVICO --set-env-vars KEY=VALUE`

ou usando o Secret Manager do GCP para dados sensíveis.

```env
STRIPE_SECRET_KEY=sk_live_ou_sk_test
STRIPE_WEBHOOK_SECRET=whsec_do_endpoint
STRIPE_CHECKOUT_MODE=subscription

STRIPE_PRICE_ID_START=price_do_plano_start
STRIPE_PRICE_ID_PRO=price_do_plano_pro
STRIPE_PRICE_ID_PREMIUM=price_do_plano_premium

NEXT_PUBLIC_SITE_URL=https://seu-servico.run.app
```

Depois de configurar as variáveis, fazer **Redeploy** via `gcloud builds submit --config cloudbuild.yaml`.

## 4. Webhook na Stripe

Criar endpoint em:

`Stripe -> Developers -> Webhooks -> Add endpoint`

URL:

```txt
https://seu-servico.run.app/api/stripe/webhook
```

Eventos mínimos:

```txt
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
```

Copiar o segredo do endpoint e configurar no Cloud Run como `STRIPE_WEBHOOK_SECRET`.

## 5. Teste de produção controlado

1. Acessar o site em produção.
2. Fazer login.
3. Ir para configurações/assinatura.
4. Clicar em um plano.
5. Confirmar que abre o Checkout da Stripe.
6. Concluir uma compra controlada ou usar ambiente test.
7. Confirmar retorno para `/configuracoes?checkout=sucesso&session_id=...`.
8. Verificar na Stripe se o webhook retornou `200`.
9. Verificar no Firebase/Firestore se o billing da clínica foi atualizado.

## 6. Diagnóstico rápido

| Sintoma | Causa provável |
|---|---|
| Checkout retorna 503 | Variável Stripe ausente no Cloud Run |
| Checkout retorna 400 plano inválido | Botão enviando plano diferente de `start`, `pro`, `premium` |
| Webhook retorna 400 | `STRIPE_WEBHOOK_SECRET` errado ou endpoint diferente |
| Webhook retorna 404 | Deploy não subiu ou rota incorreta |
| Compra aparece na Stripe mas app não atualiza | Firebase Admin/env vars ausentes ou erro no handler |

## 7. Próximo gargalo real

Depois que checkout e webhook estiverem `200`, parar de mexer em preço/código e validar com clínica real.

Sequência recomendada:

1. Cloud Run funcionando.
2. Checkout abrindo.
3. Webhook Stripe `200`.
4. Clínica piloto usando.
5. NLP/score como diferencial do plano Premium.
