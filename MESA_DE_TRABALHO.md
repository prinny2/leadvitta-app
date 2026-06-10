> ⚠️ DESATUALIZADO — fonte da verdade: **ESTADO.md**

> ⚠️ DESATUALIZADO — fonte da verdade: ESTADO.md

# 🛠️ Mesa de Trabalho — LeadBellus

> Doc **operacional** do dia a dia (dev + ads). A estratégia/visão de longo prazo fica no vault Obsidian (`PLANO MASTER Monetização`).
> Última atualização: **2026-06-05**

---

## 1. O que é (em 3 linhas)

Micro-SaaS para **clínicas de estética**. Gera respostas de WhatsApp em 3 variantes (curta / consultiva / fechamento), quebra de objeções, follow-up e scripts — com **IA (Claude)** e guardrails de compliance. É a **cara/nicho de estética do Núcleo**. Oferta: _"experimenta; gostou, fica"_.

---

## 2. Status — o que tem ✅ e o que falta ❌

**✅ Pronto e funcionando:**
- Landing page · Auth (Firebase email/senha + Google + **modo demo** sem login)
- Onboarding (wizard 5 passos = DNA da clínica)
- **Gerador IA** (3 variantes, refino, cache de prompt, denylist de compliance)
- Objeções · Follow-up · Scripts · Histórico/favoritos · Configurações
- Deploy no **Cloud Run** (Dockerfile multi-stage, `output: standalone`, porta 8080)

**❌ Falta (e por que importa):**

| Falta | Por que importa |
|---|---|
| **Tracking** | **Meta Pixel em espera** (depende do Eduardo) → JÁ PREENCHIDO no `.env.local` (`NEXT_PUBLIC_META_PIXEL_ID`). **GA4** é independente do pixel/Eduardo e pode entrar sozinho, mas com **tráfego ~zero hoje rende pouco**. |
| **Billing / Stripe** | Preço é só UI; **sem checkout não há MRR**. Chaves vazias no `.env.local`. |
| **WhatsApp real** | Hoje é copia-e-cola. Decidir: integração direta ou fundir com o atendente do Núcleo. |
| **Ops** | `/api/health` ✅ (feito) · `cloudbuild.yaml` ✅ (feito) · falta domínio próprio + monitoramento. |
| Painel admin · CRM/leads · automações | Fase posterior. |

---

## 3. Stack & Recursos (tudo num lugar)

| Camada | Tecnologia / Serviço | Observação |
|---|---|---|
| **App** | Next.js 15 (App Router) + React 19 + TypeScript + TailwindCSS | — |
| **IA** | Anthropic Claude | env `AI_MODEL` (default `claude-haiku-4-5`; subir p/ `claude-sonnet-4-6` em qualidade) |
| **Dados/Auth** | Firebase (Firestore + Auth email/Google) | tabelas: `clinicas`, `historico` |
| **Deploy** | Docker (`node:20-slim`, standalone) → Google Cloud Run | porta 8080, `node server.js` |
| **Repo** | `prinny2/leadbellus-app` · branch `main` | pasta local: `Saas estética` (Desktop) |
| **Notebook** | `notebook_nlp_leadbellus.ipynb` (Colab) | intent + sentimento PT-BR |

**Contas/serviços necessários:** Google Cloud (Cloud Run) · Firebase (leadvitta-app) · Anthropic · Meta Business/Ads _(Eduardo)_ · Google Analytics _(Eduardo)_ · Stripe _(futuro)_.

**Variáveis de ambiente:**
- Hoje: `OPENAI_API_KEY` · `AI_MODEL` · `NEXT_PUBLIC_FIREBASE_*` · `NEXT_PUBLIC_SITE_URL` · `NEXT_PUBLIC_META_PIXEL_ID`
- Futuras: `NEXT_PUBLIC_GA4_ID` · `META_CAPI_ACCESS_TOKEN` · `STRIPE_*`

> 🔐 **Credenciais SEMPRE em `C:\Users\vpaes\Credenciais\` — NUNCA no repo/chat/cloud.** Chave exposta = revogar.

---

## 4. Onde roda o quê

| Ambiente | Para quê | Detalhe |
|---|---|---|
| **LOCAL** (sua máquina) | **Desenvolver e testar** | `npm run dev` → `localhost:3000`. Mexe em código, prompts, libs de conteúdo (`data/`), UI. Usa `.env.local`. Modo demo funciona sem chaves (dados ficam no navegador). |
| **CLOUD RUN** | **Produção** (usuários reais) | Container porta 8080. É pra **onde o Eduardo manda o tráfego dos anúncios** → o **pixel precisa estar LIVE aqui**. Segredos via Cloud Run (não no `.env`). |
| **FIREBASE** | Banco + Auth | Roda na **nuvem do Firebase (Google)**. Local e Cloud Run falam com o **mesmo projeto** (`leadvitta-app`). |
| **ANTHROPIC** | API de IA | Externa; chamada feita pelo **servidor** (local ou Cloud Run), **nunca pelo browser**. |

---

## 5. Divisão de trabalho

**Vinícius — dev + produto:**
- Código · IA/prompts · Firebase · deploy Cloud Run
- Implementar os **eventos de tracking** que o Eduardo pedir
- Billing/Stripe · WhatsApp · roadmap de produto

**Eduardo — ads + mensuração:**
- Meta Ads + **Meta Pixel** (cria o pixel no Meta Business → passa o `PIXEL_ID`)
- **GA4** (cria a propriedade → passa o `MEASUREMENT_ID`)
- Campanhas · criativos · públicos · otimização por conversão
- Define **quais eventos medir** (PageView, Lead, InitiateCheckout, Purchase)

**Interface entre vocês:**
`Eduardo entrega os IDs` → `Vinícius pluga (env vars + layout.tsx + eventos nos pontos certos)` → `Eduardo valida no Meta Events Manager / GA4`.

---

## 6. Fluxo de desenvolvimento (loop)

1. Editar código **localmente**
2. `npm run dev` → testar em `localhost:3000`
3. Commit (`main` ou feature branch)
4. **Deploy no Cloud Run** via `cloudbuild.yaml` (`gcloud builds submit --config cloudbuild.yaml`)
5. Validar na **URL de produção** (inclui `GET /api/health`)
6. Conferir eventos no **Meta Events Manager / GA4** (com o Eduardo)

---

## 7. Roadmap (amarrado ao gargalo: DISTRIBUIÇÃO / MRR)

1. **Tracking (higiene, não urgente com tráfego zero).** Meta Pixel **JÁ PREENCHIDO** no `.env.local`. Falta disparar `sign_up` no onboarding e `initiate_checkout` no Stripe.
2. **Funil claro.** landing → signup → onboarding → 1ª resposta gerada ("aha"). Garantir CTA e captura de lead.
3. **Billing (Stripe).** Checkout do plano mensal + webhook → ativa assinatura.
4. **WhatsApp / decisão Núcleo.** Conectar ao atendente FastAPI do Núcleo OU integração direta.
5. **Ops.** `/api/health` ✅ · `cloudbuild.yaml` ✅ · falta domínio próprio + monitoramento/logs.

---

## 8. Pendências / Decisões em aberto

- **Preço inconsistente:** landing `R$197/R$299`, oferta `R$397/mês`, rodapé `"a partir de R$49"`. → **Alinhar um número** (o Eduardo precisa disso pro anúncio).
- **Nome:** `package.json` já é `leadbellus`.
- **LeadBellus vs Núcleo:** fundir ou separar? (decisão estratégica)
- **`NEXT_PUBLIC_SITE_URL`** precisa apontar pra **URL real do Cloud Run** (OAuth/redirects).
- **Segredos no Cloud Run:** configurar uma vez via `gcloud run services update <SERVICE> --set-env-vars ...` (ou `--set-secrets` com Secret Manager). **Nunca** no `cloudbuild.yaml`.

---

## 9. Preencher (placeholders)

- URL de produção do Cloud Run: `https://__________.run.app`
- GCP project ID: `leadvitta-app`
- Região / Artifact Registry repo (`cloudbuild.yaml`): `_REGION=southamerica-east1` · `_REPO=leadbellus`
- Preço final do plano: `R$ ______ /mês`
