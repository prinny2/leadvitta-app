# LeadBellus — Checklist de Lançamento MVP

Status: **pronto para configuração de produção**.

---

## 1. Stripe — Criar planos

- [ ] Criar produto **Start** no Stripe → R$197/mês (recorrente)
- [ ] Criar produto **Pro** no Stripe → R$297/mês (recorrente)
- [ ] Criar produto **Premium** no Stripe → R$397/mês (recorrente)
- [ ] Anotar os `price_id` de cada plano

## 2. Stripe — Webhook

- [ ] Criar endpoint em **Developers → Webhooks → Add endpoint**
- [ ] URL: `https://SEU-DOMINIO/api/stripe/webhook`
- [ ] Eventos mínimos:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] Copiar o `whsec_...` do endpoint

## 3. Firebase

- [ ] Criar projeto no Firebase Console (ou usar existente)
- [ ] Ativar **Authentication** (Email/Senha + Google)
- [ ] Ativar **Firestore Database**
- [ ] Criar service account para Firebase Admin
- [ ] Adicionar domínio Vercel aos domínios autorizados no Firebase Auth

## 4. Vercel — Environment Variables

Configurar em **Project → Settings → Environment Variables**:

```env
NEXT_PUBLIC_SITE_URL=https://seu-dominio.vercel.app

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (webhook precisa para atualizar Firestore)
# Use FIREBASE_SERVICE_ACCOUNT_JSON para JSON inline (uma linha)
# Use FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 se o host não aceita multiline (ex: Vercel)
FIREBASE_SERVICE_ACCOUNT_JSON=   # ou FIREBASE_SERVICE_ACCOUNT_JSON_BASE64

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CHECKOUT_MODE=subscription
STRIPE_PRICE_ID_START=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_PREMIUM=price_...

# IA
OPENAI_API_KEY=
AI_MODEL=gpt-4o-mini
```

- [ ] Salvar todas as variáveis
- [ ] Fazer **Redeploy** após salvar (obrigatório para `NEXT_PUBLIC_*`)

## 5. Teste de produção controlado

- [ ] Acessar o site em produção
- [ ] Fazer login (signup + email/senha)
- [ ] Ir para `/configuracoes` → clicar em um plano
- [ ] Confirmar que abre o Checkout da Stripe
- [ ] Concluir compra (usar modo teste ou compra controlada)
- [ ] Confirmar retorno para `/configuracoes?checkout=sucesso&session_id=...`
- [ ] Verificar na Stripe se o webhook retornou `200`
- [ ] Verificar no Firestore se `clinicas/{uid}.billing` foi atualizado

## 6. Pós-validação

- [ ] Confirmar que **todos os testes acima passaram com chaves `sk_test`**
- [ ] ⚠️ **Só mude para `sk_live` quando todos os cenários de teste estiverem OK** — chaves live cobram dinheiro real
- [ ] Atualizar `STRIPE_SECRET_KEY` para `sk_live_...`
- [ ] Atualizar webhook secret para o de produção
- [ ] Fazer **Redeploy** na Vercel
- [ ] Testar com clínica piloto real
- [ ] WhatsApp manual (copiar/colar) já funciona — integração completa pode ficar para depois

## Diagnóstico rápido

| Sintoma | Causa provável |
|---|---|
| Checkout retorna 503 | Variável Stripe ausente na Vercel |
| Checkout retorna 400 plano inválido | Botão enviando plano diferente de `start`, `pro`, `premium` |
| Webhook retorna 400 | `STRIPE_WEBHOOK_SECRET` errado |
| Webhook retorna 404 | Deploy não subiu ou rota incorreta |
| App não atualiza após compra | Firebase Admin não configurado |

---

> O gargalo agora é **configurar produção e testar checkout**, não construir mais código.
