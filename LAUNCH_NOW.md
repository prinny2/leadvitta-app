> ⚠️ DESATUALIZADO — fonte da verdade: **ESTADO.md**

# LeadBellus — Checklist de Lançamento MVP

> Reescrito em **2026-06-09** com base em verificação ao vivo (ver `ESTADO.md`, fonte da verdade).
> Deploy é **Cloud Run** (projeto `leadvitta-app`, serviço `leadbellus`, região `southamerica-east1`). Vercel é leftover — não usar.

## ✅ Feito e VERIFICADO (não refazer)

- [x] App **LIVE e cobrando**: https://leadbellus-87102725202.southamerica-east1.run.app (`/api/health` ok)
- [x] IA gerando de verdade (OpenAI `gpt-4o-mini` primária + Anthropic fallback, ambas as chaves válidas)
- [x] Stripe LIVE: 3 planos mensais (Start R$197 · Pro R$297 · Premium R$397), checkout abre sessão `cs_live_…`
- [x] Webhook Stripe registrado + `whsec` real no serviço (4 eventos) — o buraco "paga e não entra" está fechado
- [x] Firebase Admin no Cloud Run (grava `clinicas/{uid}.billing` via webhook)
- [x] Hardening de API em produção (origin check, rate limit, limite de payload)
- [x] Tracking no front: `sign_up`, `initiate_checkout`, `purchase`
- [x] Landing v1.4 (visual premium) + funil: deslogado → `/signup?plan=X` → checkout
- [x] Git alinhado com produção (PR #16 aberta e mergeável)

## 🚀 Falta pro lançamento (nesta ordem)

1. [ ] **Pagamento teste ponta-a-ponta** (~30 min, dá pra fazer agora)
   - Criar cupom 100% off no painel Stripe (`allow_promotion_codes` já está ligado)
   - Signup real → escolher plano → concluir checkout com o cupom
   - Conferir: webhook **Recent deliveries = 200** · Firestore `clinicas/{uid}.billing.status = active`
2. [ ] **Merge da PR #16** (https://github.com/prinny2/leadvitta-app/pull/16)
3. [ ] **Renomear conta Stripe** "LeadCare" → "LeadBellus" (Settings → Business → Public details) — é o nome que a clínica vê na fatura/extrato
4. [ ] **Domínio `leadbellus.com.br`** — 4 registros DNS no Registro.br (Firebase Hosting → Cloud Run). _Opcional pro lançamento: o `.run.app` já vende._
5. [ ] **Falar com 1 clínica.** O único item que move MRR. Todo o resto desta página é suporte a este.

## 🔜 Depois do lançamento (não bloqueia)

- WhatsApp integrado (WIP do Codex — mover pra branch própria; decisão direta vs. Núcleo pendente)
- Portal de assinatura Stripe (cancelar/trocar cartão) — backlog do Codex no `AGENTS.md`
- Desconectar integração GitHub↔Vercel (ruído de deploy paralelo)
- GA4 / Meta Pixel validados com o Eduardo quando houver tráfego

## Diagnóstico rápido (Cloud Run)

| Sintoma                                | Causa provável                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Checkout retorna 503                   | Env `STRIPE_*` ausente no serviço (`gcloud run services update --set-secrets/--update-env-vars`) |
| Checkout retorna 401                   | Usuário sem login — esperado; o front manda pro `/signup`                                        |
| Checkout retorna 403                   | Chamada sem `Origin`/`Referer` válido (proteção do `api-security`)                               |
| Webhook retorna 400                    | `STRIPE_WEBHOOK_SECRET` errado (whsec de teste ≠ de produção)                                    |
| Paga mas conta não ativa               | Firebase Admin sem credencial — conferir `firebase_admin_enabled` em `GET /api/config`           |
| Mudou `NEXT_PUBLIC_*` e nada aconteceu | É build-time: precisa de `gcloud builds submit`, não só `services update`                        |

---

> O gargalo agora é **distribuição**, não código. Checklist técnico restante cabe numa tarde.
