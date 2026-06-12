# COORDINATION — LeadBellus (Fonte da Verdade)

> **Regra de Ouro:** Leia ao entrar, atualize ao sair. O que está aqui vale mais que qualquer outro log.

## 🏁 Estado Real (2026-06-11)
- **Produção (Vercel):** `leadbellus.com.br` + `www` AGORA servem produção REAL no projeto Vercel `leadvitta-app` (time `vini1`), deploy `dpl_6P6Sf6SKz3eR6JaDFhreR2ckkEvU`. **Modo demo DESLIGADO** — `/api/config` retorna firebase/firebase_admin/stripe/openai = true. 22 env vars de produção setadas (inclui `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` da SA `firebase-adminsdk-fbsvc@leadvitta-app`). Feito por instrução direta do Vinícius (override da regra "Vercel proibido" — ver Bloqueios).
- **Produção (Cloud Run / Firebase Hosting):** segue LIVE em `leadbellus` (southamerica-east1) e `https://leadvitta-app.web.app`. Agora há DUAS produções no ar → decisão estratégica pendente (qual é a canônica).
- **IA:** OpenAI (GPT-4o-mini) + Fallback Anthropic (Haiku). OpenAI ativa; ANTHROPIC_API_KEY ainda vazia (adicionar para ativar fallback).
- **WhatsApp:** Twilio (sandbox +14155238886). Webhook: https://leadvitta-app.web.app/api/whatsapp/webhook — configurar no Twilio Console após deploy.
- **Billing:** Stripe LIVE ativo com Webhook `whsec` configurado.
- **Auth:** Firebase Auth (oficial). Branch `feat/auth0` está PARADA.

## 🤖 Divisão de Agentes
| Agente | Papel | Permissões |
|---|---|---|
| **Claude** | Comandante | Deploy, Revisão, Segredos, Infra (gcloud) |
| **Codex** | Implementador | Features, UI, Lógica (branch própria) |
| **Gemini** | Analista | Pesquisa, Copy, Documentação. Não mexe em código/infra. |

## 🛠️ Comandos de Verificação
- `npm run dev` (Local: 3000)
- `curl http://localhost:3000/api/health`
- `gcloud run services describe leadbellus`
- `curl https://leadvitta-app.web.app/api/config` deve mostrar Firebase/Stripe/IA ligados.
- `curl https://leadbellus.com.br/api/config` → agora retorna tudo `true` (produção real no Vercel).

## 🚨 Bloqueios & Armadilhas
- ⚠️ **Vercel** (regra revista 2026-06-11): a regra antiga era "proibido/aposentar". O Vinícius reverteu por instrução direta e o Vercel é hoje a produção que `leadbellus.com.br` serve. CONFLITO PENDENTE com o plano Cloud Run — **não desconectar nem desfazer sem decisão explícita do Vinícius**. Se a escolha for Vercel, aposentar Cloud Run; se for Cloud Run, repontar DNS e remover envs do Vercel.
- ⛔ **Auth0**: Não reativar sem decisão estratégica.
- ⛔ **Segredos**: Nunca commitar. Usar Secret Manager.
- ⛔ **Mesa/cockpit**: antes de editar arquivo compartilhado, respeitar `C:\Users\vpaes\Mesa\lock.py status`.

## 📅 Próximo Passo
- **DECISÃO (Vinícius):** definir produção canônica → Vercel (`leadbellus.com.br` já live) OU Cloud Run. Hoje as duas estão no ar.
- **Para o Vercel funcionar 100% (manuais, só o Vinícius/console):**
  1. **Firebase Auth → Authorized domains:** garantir `leadbellus.com.br` e `www.leadbellus.com.br` na lista (Console Firebase → Authentication → Settings) senão o login Google falha.
  2. **Stripe → Webhook endpoint:** apontar para `https://leadbellus.com.br/api/stripe/webhook` (o `STRIPE_WEBHOOK_SECRET` setado precisa corresponder a ESSE endpoint).
  3. **Twilio sandbox:** enviar `join <código>` para +14155238886 e setar o webhook do sandbox para `https://leadbellus.com.br/api/whatsapp/webhook`.

---
### Log de Handoff
- 2026-06-10 (Gemini): Unificação do Blackboard para o padrão `COORDINATION.md`.
- 2026-06-09 (Codex): Implementado Visual Overhaul v1.4.
- 2026-06-11 (Codex): Firebase Hosting publicado e validado; domínio público segue em Vercel e bloqueia pre-flight.
- 2026-06-11 (Claude): Integração Twilio WhatsApp implementada (substituiu Meta Cloud API). lib/whatsapp.ts + webhook reescritos. Env vars Twilio aplicados no Cloud Run (revs 00023/00024). Build 2fdd5d97 em andamento — quando deployar, configurar webhook Twilio para: https://leadvitta-app.web.app/api/whatsapp/webhook
- 2026-06-11 (Claude): **LeadBellus tirado do modo demo e lançado em produção no Vercel** por instrução direta do Vinícius. Autenticado Vercel CLI (device flow); gerada SA do Firebase Admin (`firebase-adminsdk-fbsvc`); 22 env vars setadas em scope production no projeto `leadvitta-app`; `vercel --prod` (deploy `dpl_6P6Sf6S...`, build 43s); aliases `leadbellus.com.br`+`www` repontados do deploy antigo `dpl_Epe2E3x...` para o novo. Verificação multi-agente: APROVADO (config tudo true, banner sumiu, Firebase no bundle, zero vazamento de segredo). Override da regra "Vercel proibido" → ver Bloqueios/Próximo Passo. SA key temporária apagada do disco.
