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

> [!danger] As TRÊS "leadvitta" — não confundir (é a origem da confusão)

```
┌──────────────────────────────────────────────────────────────────────┐
│  O PRODUTO SE CHAMA  ▸  LeadBellus                                     │
│  O CLIENTE VÊ        ▸  https://leadbellus.com.br   ✅                 │
├──────────────────────────────────────────────────────────────────────┤
│ 1) leadvitta.com          → domínio PARQUEADO na HostGator. ❌         │
│                             NÃO é o app. NADA no código aponta pra ele.│
│                             Só atrapalha se alguém digitar à mão.      │
│ 2) leadvitta-app          → ID do projeto Google/Firebase E nome do   │
│                             projeto Vercel. INTERNO, cliente NUNCA vê. │
│                             Aparece em .firebaserc / cloudbuild /      │
│                             scripts = CORRETO. ⛔ NÃO trocar (ID GCP   │
│                             é imutável; trocar = projeto novo).        │
│ 3) leadvitta-app.web.app  → URL feia de fallback do Firebase Hosting.  │
│                             Funciona, mas o cliente entra pelo domínio │
│                             bonito, não por essa.                      │
└──────────────────────────────────────────────────────────────────────┘
```

Regra: `NEXT_PUBLIC_SITE_URL`, OAuth domains, webhooks Stripe/WhatsApp → tudo em
`leadbellus.com.br`. **Nunca** apontar nada para `leadvitta.com`.
"leadvitta" só sobra nos bastidores (nome de projeto + URL de fallback) — não vaza
pro cliente, e renomear não vale o risco antes de lançar.

---

## 🗺️ As 3 frentes (Next.js) — qual é a real

| Frente | O que é | Sinais |
|---|---|---|
| `leadbellus-zapi-deploy` | **candidata a REAL** | tem `.vercel` + `.env.local`; plano diz "rode a partir daqui" |
| `leadbellus-main-hotfix` | cópia de trabalho | tem BLACKBOARD/DECISIONS |
| `leadvitta-app` (ESTE repo) | frente Next.js (PR #34) | é onde esta sessão tem acesso |
| `leadvitta-nlp` | microserviço NLP separado (FastAPI/Cloud Run) | **não** é a frente |

### 🏠 DECISÃO DE CASA (resolvido — fim do split-brain)

```
  CASA OFICIAL DA FRENTE  ▸  VERCEL
  ├─ leadbellus.com.br + www JÁ servem produção REAL no Vercel (time vini1,
  │  projeto leadvitta-app). Demo OFF, 22 env vars de produção setadas.
  ├─ CI confirma: Vercel deploya este repo a cada push (READY no PR #53).
  └─ Env vars (Stripe price IDs, STRIPE_CHECKOUT_MODE=subscription,
     NEXT_PUBLIC_SITE_URL) → setar no painel do VERCEL, não no gcloud.

  CLOUD RUN  ▸  fica para o backend `nucleo` (Python, já tem Dockerfile/$300).

  ⚠️ DESLIGAR a 2ª produção: hoje há DUAS no ar (Vercel + Firebase Hosting
     leadvitta-app.web.app). Manter Vercel, parar o Firebase Hosting pra
     não ter tráfego saindo de dois lugares.
```

> [!warning] `CLAUDE.md` está DESATUALIZADO: diz "No Vercel / Cloud Run only".
> A realidade live é Vercel para a frente. Atualizar o CLAUDE.md depois do lançamento.

**Checklist de domínio (painel Vercel):**
1. Vercel → Settings → Domains: `leadbellus.com.br` = **Primary** (e `www` → redirect pra ela).
2. Garantir que `leadvitta.com` **não** está listado em Domains.
3. HostGator: `leadvitta.com` fica parqueado quieto (ou 301 → leadbellus.com.br, opcional).
4. Firebase Console → Hosting: desativar/parar o site `leadvitta-app.web.app` (a 2ª produção).

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
