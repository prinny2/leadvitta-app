---
name: prod-verify
description: Verificacao de producao do LeadBellus apos deploy ou mudanca sensivel — confirma que o app LIVE esta saudavel (health check no host real, feature flags, host/headers, lembretes de Stripe/Firestore). Use depois de subir algo ou antes de dizer "feito".
disable-model-invocation: true
---

# /prod-verify — Verificacao de producao (LeadBellus)

O CLAUDE.md repete: **nao assuma "feito" sem verificar ao vivo**. Esta skill executa
essa checagem. App LIVE cobra clientes reais via Stripe — leve a serio.

## Fatos fixos
- Host publico canonico: `https://www.leadbellus.com.br` (+ apex `leadbellus.com.br`).
- Producao roda na **Vercel** (`Server: Vercel` no header). Cloud Run = legado (redirects).
- ⛔ `leadvitta.com` NAO e este app (placeholder parqueado) — nunca verificar contra ele.

## Passos

1. **Health check no host LIVE** (nao localhost):
   ```bash
   curl -sS https://www.leadbellus.com.br/api/health
   ```
   Espera `{"status":"ok",...}`. Se nao-200 ou timeout → produção quebrada, pare e reporte.

2. **Confirme que e a Vercel servindo** (pega split-brain de host):
   ```bash
   curl -sIL https://www.leadbellus.com.br | grep -iE "^(server|x-vercel|location|http)"
   ```
   Espera `server: Vercel`. Apex deve resolver/redirecionar pro `www` certo.

3. **Feature flags / config** (o que esta "real" vs demo em prod):
   ```bash
   curl -sS https://www.leadbellus.com.br/api/config
   ```
   Confirme que as flags batem com o que o deploy deveria ter ligado (Firebase/OpenAI/Stripe).
   Lembre: `NEXT_PUBLIC_*` sao **build-time** — mudar exige rebuild na Vercel, nao so env update.

4. **Smoke do fluxo core** (geracao):
   ```bash
   curl -sS -X POST https://www.leadbellus.com.br/api/generate \
     -H "Content-Type: application/json" \
     -d '{"mensagemCliente":"Ola, quanto custa o botox?"}' | head -c 400
   ```
   Em prod com chaves, `mock` deve ser `false`. Cheque que a resposta respeita as guardrails
   (sem preco fixo / sem garantia / sem diagnostico).

5. **Webhooks apontando pro host ativo** (lembrete manual — confirmar nos paineis):
   - Stripe: webhook `/api/stripe/webhook` aponta pra Vercel? Ultimo evento entregue 200?
   - WhatsApp/Meta: webhook `/api/whatsapp/webhook` no host ativo?

6. **Checagens fora-do-codigo** (lembrete — abrir paineis):
   - **Stripe Dashboard**: assinatura/checkout recente reconciliou? Modo Live, nao Test.
   - **Firestore**: `clinicas/{uid}.billing` atualizado pelo webhook (server-only).

## Saida
Resuma cada passo como ✅/❌ com a evidencia (status code, header, trecho). Se qualquer
passo critico (1, 2, 4) falhar, declare **PRODUCAO COM PROBLEMA** no topo e o que investigar.
Nao declare "tudo certo" se algum passo nao foi efetivamente checado — diga o que ficou pendente.
