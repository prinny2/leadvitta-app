---
title: BLACKBOARD — LeadBellus
tags: [leadbellus, fonte-de-verdade, blackboard]
updated: 2026-06-17
cssclass: dashboard
---

# 🧪 BLACKBOARD — LeadBellus (fonte de verdade)

> [!abstract] O que é isto
> Arquivo de coordenação (Obsidian-ready). Leio no começo de cada sessão e atualizo
> conforme trabalho. Versionado no git = memória durável. Sem isso, agentes diferentes
> mexem em cópias diferentes e a linha se perde.

_Última atualização: 2026-06-17_

---

## ⚠️ VERDADE DE NOME / DOMÍNIO (nunca mais errar)

> [!danger] Nunca apontar nada para `leadvitta.com`

```
┌─────────────────────────────────────────────────────────────────┐
│  O PRODUTO SE CHAMA  ▸  LeadBellus                                │
├─────────────────────────────────────────────────────────────────┤
│  ✅ leadbellus.com.br        = O APP REAL (host canônico + www)   │
│  ❌ leadvitta.com            = HostGator PARQUEADO. NÃO é o app.   │
│                               DNS aponta pra lá → dá confusão,    │
│                               isso é "normal", só não usar.       │
│  ℹ️ projeto GCP / repo                                            │
│     "leadvitta-app"          = só o NOME de criação. O produto    │
│                               continua sendo LeadBellus.          │
└─────────────────────────────────────────────────────────────────┘
```

Regra: `NEXT_PUBLIC_SITE_URL`, OAuth domains, webhooks Stripe/WhatsApp → tudo em
`leadbellus.com.br`. **Nunca** apontar nada para `leadvitta.com`.

---

## 🗺️ As 3 frentes (Next.js) — qual é a real

| Frente | O que é | Sinais |
|---|---|---|
| `leadbellus-zapi-deploy` | **candidata a REAL** | tem `.vercel` + `.env.local`; plano diz "rode a partir daqui" |
| `leadbellus-main-hotfix` | cópia de trabalho | tem BLACKBOARD/DECISIONS |
| `leadvitta-app` (ESTE repo) | frente Next.js (PR #34) | é onde esta sessão tem acesso |
| `leadvitta-nlp` | microserviço NLP separado (FastAPI/Cloud Run) | **não** é a frente |

⚠️ **Split-brain a resolver:** o plano antigo fala em **Vercel**, mas `CLAUDE.md`
deste repo é explícito: **deploy oficial = Cloud Run, "No Vercel"**. Decidir UMA
casa antes de configurar env vars, senão configura num lugar e o tráfego sai de outro.

---

## 💳 Billing (Stripe LIVE) — já conferido

`lib/billing.ts` usa **97 / 197 / 347** → bate com os preços live do Stripe. ✅
(CLAUDE.md menciona 197/297/397 — desatualizado; ignorar ou recriar preços.)

| Plano | Valor | Price ID (live) |
|---|---|---|
| Start | R$97 | `price_1Tj5ihRTJ7iCFKxknWoEhpka` |
| Pro | R$197 | `price_1Tj5j8RTJ7iCFKxkiXFVTyx1` |
| Premium | R$347 | `price_1Tj5jNRTJ7iCFKxkNGRYD3It` |

Setar `STRIPE_PRICE_ID_PRO/PREMIUM` também tira o selo "Em breve" e libera os 3 planos.

---

## ✅ FEITO
- [x] `npm run build` passa limpo neste branch (2026-06-17) → deploy-ready.
- [x] Verdade de nome/domínio documentada (acima).
- [x] Preços Stripe live criados e batendo com `billing.ts`.

## ⛏️ FALTA (precisa de acesso a painel externo — não dá pelo sandbox)
1. **Stripe env no runtime** (sem rebuild):
   `gcloud run services update leadbellus --region southamerica-east1 --set-env-vars STRIPE_PRICE_ID_START=...,STRIPE_PRICE_ID_PRO=...,STRIPE_PRICE_ID_PREMIUM=...,STRIPE_CHECKOUT_MODE=subscription`
   → `STRIPE_CHECKOUT_MODE=subscription` é **obrigatório** (preços recorrentes).
2. **Domínio** (rebuild, build-time):
   `gcloud builds submit --config cloudbuild.yaml --substitutions _NEXT_PUBLIC_SITE_URL=https://leadbellus.com.br`
3. **Firebase Console** → Auth → Authorized domains: add `leadbellus.com.br` + `www`.
4. **Stripe Dashboard** → Webhook `https://leadbellus.com.br/api/stripe/webhook` → copiar signing secret → `STRIPE_WEBHOOK_SECRET`.
5. **Z-API** → `NEXT_PUBLIC_SITE_URL=https://leadbellus.com.br node scripts/setup-zapi-webhook.mjs`.

Depois de cada passo: `curl https://leadbellus.com.br/api/health` → `{"status":"ok"}` + 1 checkout de teste real.

---

## 🛠️ Regra de ouro (uma ferramenta por tarefa)
- **Claude** → arquitetura, decisões, blackboard, código sensível (pagamento). Maestro.
- **Codex** → implementação pesada dentro de UM repo só.
- **Gemini** → volume + coisas de Google Cloud.
- **Grok** → perguntas rápidas, rascunho.
- ❌ Nunca dois agentes no mesmo arquivo ao mesmo tempo (é a origem do caos).

## 🎨 Preferência do dono (permanente)
Arquitetura / sistemas / matemática **SEMPRE com diagrama de sistema** (estrutura,
fluxo, relação) — não imagem decorativa. Liderar com o diagrama, não com texto.
