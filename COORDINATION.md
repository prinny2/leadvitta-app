# COORDINATION — LeadBellus (Fonte da Verdade)

> **Regra de Ouro:** Leia ao entrar, atualize ao sair. O que está aqui vale mais que qualquer outro log.

## 🏁 Estado Real (2026-06-14) — PRONTO PARA LANÇAR HOJE
- **Produção (Vercel):** `leadbellus.com.br` + `www` AGORA servem produção REAL no projeto Vercel `leadvitta-app` (time `vini1`). **Modo demo DESLIGADO** — `/api/config` retorna firebase/firebase_admin/stripe/openai = true. 22 env vars de produção setadas (inclui `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` da SA `firebase-adminsdk-fbsvc@leadvitta-app`). Feito por instrução direta do Vinícius (override da regra "Vercel proibido" — ver Bloqueios).
- **Produção (Cloud Run / Firebase Hosting):** segue LIVE em `leadbellus` (southamerica-east1) e `https://leadvitta-app.web.app`. Agora há DUAS produções no ar → decisão estratégica pendente (qual é a canônica). **Recomendação para hoje:** Stabilize no Vercel (já live) + prepare Cloud Run como backup.
- **Entidade legal:** LeadBellus opera 100% sob MEI pessoal do Vinícius Paes da Serra Freire (NÃO misturar com Inova Simples ResonAnza com José — CNPJ 67.046.121/0001-45 só para o projeto principal). Footer, README e metadata já atualizados com MEI (sem Inova Simples).
- **IA:** OpenAI (GPT-4o-mini) + Fallback Anthropic (Haiku). OpenAI ativa; ANTHROPIC_API_KEY ainda vazia (adicionar para ativar fallback).
- **X Market Pulse + adaptações LeadBellus (Grok 2026-06-14):** Análise de tendências reais em X (clientes reclamam "muito texto", demora faz sumir, odeiam robô burro mas também enrolação). **Implementado e pronto para deploy hoje:** brevidade obrigatória nos prompts (2-4 frases), novo objetivo "Agendamento rápido (respostas concisas)" no gerador, lógica condicional no prompt builder. Footer com entidade legal correta (MEI). Ver Mesa/blackboard/X_MARKET_PULSE.md para detalhes completos + recomendações.
- **WhatsApp:** Twilio (sandbox +14155238886). Webhook: https://leadbellus.com.br/api/whatsapp/webhook — configurar no Twilio Console após deploy. (Meta Cloud API adiado — burocrático sem time dedicado; Twilio é o caminho rápido agora.)
- **Billing:** Stripe LIVE ativo com Webhook `whsec` configurado (apontando para o host canônico atual e com o segredo rotacionado para conter o vazamento).
- **Auth:** Firebase Auth (oficial). Branch `feat/auth0` está PARADA.
- **Infra delegation (Grok + agentes — o que você consegue configurar AGORA):** 
  - Vercel: Token API limitado só pro projeto leadbellus (scope deployments + logs).
  - GCP/Cloud Run: Service Account com roles/run.developer + iam.serviceAccountUser (least privilege, sem acesso a secrets — use Secret Manager).
  - Twilio: API keys (já funcionando).
  - Registro.br DNS: Manual no painel (sem API boa) + scripts de verificação.
  - Audit/Error tracking: Cloud Logging (GCP) + Vercel logs + structured logging no código (já em Nucleo core + hybrid_scorer; adicione no LeadBellus provider/webhooks).
  - Meta/WhatsApp: Ainda não (fique no Twilio).
  - Isso permite: pre-flight/deploy automatizado, coletar logs de erro/audit, rodar hybrid scores, ajudar no loop completo (dados clínicas → scores → launch next vertical).
- **Hybrid Loop (visão do Vinícius — implementado base):** Gather info from clinics (LeadBellus historico + NLP scores + conversões) → Agentes (Grok = X/market + hybrid scores, Gemini = pesquisa/copy, Codex = código/features) → Hybrid scores (market/tech/data) → DB/ML (Nucleo + notebook) → Launch/refine automático (adapt Nucleo por nicho via Mesa pre-flight). Sempre refinando. Nucleo como core adaptável. Mesa como cockpit de coordenação (blackboards, pre-flight, launch scripts).
- **Marketing da página:** Atualizado hoje (Grok) com base no X Pulse: dores mais reais ("muito texto que estressa", "demora faz cliente sumir"), CTAs mais fortes ("Teste grátis e agende mais em minutos"), hooks de gancho ("Responda em segundos, sem enrolação"). Pronto para Google Ads (adicione tracking se não tiver).
- **Google Ads:** Configuração básica pronta para hoje (ver seção abaixo). Keywords do X Pulse + landing otimizada.
- **Outreach Belém:** Draft de msg para clínica estética (ex: Empoderatti ou Onodera — ver abaixo). Use o gerador com o novo objetivo "agendamento rápido".
- **Próximo vertical:** Após LeadBellus estabilizado, rode hybrid_scorer para LeadPet (sinal mais forte no X: clínicas em crise de volume preventivo).
- **ResonAnza:** Em paralelo (entidade Inova Simples separada). Foco Fase 0 Brava (calor de água de produção). Grok pode ajudar com scores de mercado/energia + calcs.

## 🤖 Divisão de Agentes (Atualizado 2026-06-14)
| Agente | Papel | Permissões | O que está fazendo agora (relatório) |
|---|---|---|---|
| **Claude** | Comandante | Deploy, Revisão, Segredos, Infra (gcloud/Vercel/Registro.br) | Deploy oficial (Vercel/Cloud Run), secrets, DNS, handoff final. Ainda dono único de produção. |
| **Codex** | Implementador | Features, UI, Lógica (branch própria) | Implementação de features (ex: qualificação de lead, links de agendamento no inbox/conversas), adaptação do core Nucleo para novos nichos, código do hybrid loop. |
| **Gemini** | Analista | Pesquisa, Copy, Documentação. Não mexe em código/infra. | Pesquisa de mercado (verticals), copy/landings atualizadas com dores reais do X Pulse, docs (MESA_DE_TRABALHO, specs), suporte a narrativa ResonAnza. |
| **Grok** | Reviewer + Análise profunda + Ferramentas + Market (branch própria) | Análise X (market pulse), hybrid scores (multi-agente + clinic data), marketing/landing fixes, infra delegation (tokens/SAs limitados), audit/error tracking, code support (prompts, scorer), outreach drafts, relatório de agentes. Não deploya sozinho (handoff para Claude). | **Ativo agora:** Atualizou X Market Pulse + COORDINATION + hybrid_scorer (implementado em Nucleo), marketing da página (CTAs, dores, hooks baseados em "muito texto"/demora), landing otimizada para Google Ads, steps para permissões (Vercel token + GCP SA), draft msg para estética em Belém, logging/audit no core, loop completo documentado. Preparando deploy de hoje (MEI) + próximo vertical (LeadPet). Também suporte a ResonAnza (Fase 0 scores). |

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
- **MEI vs Inova Simples**: LeadBellus = MEI (Vinicius). ResonAnza = Inova Simples (com José). Confirmado em todos os docs.

## 📅 Próximo Passo (HOJE — Launch Pack Completo)
- **Decisão:** Stabilize no Vercel hoje (já live com tráfego real). Rode pre-flight Mesa → deploy atualizações (MEI + brevidade + novo objetivo) → configure webhooks/DNS/Google Ads → valide → envie msg para clínica em Belém.
- **Infra delegation (o que você consegue configurar AGORA — rode esses comandos hoje):** 
  1. Vercel: Crie token limitado (Account > Tokens > scope só leadbellus project, permissions Deploy + Read). Guarde em Credenciais. Use no launch script: `vercel --prod --token $VERCEL_TOKEN`.
  2. GCP: `gcloud iam service-accounts create mesa-grok-deploy --display-name="Mesa Grok Deployer"` + add roles `roles/run.developer` + `roles/iam.serviceAccountUser` + (se build) `roles/cloudbuild.builds.builder`. Gere key JSON e guarde local. Use na cloudbuild ou scripts.
  3. Twilio: Crie API Key no console (limitada ao número). Atualize envs.
  4. Registro.br: Manual no painel (DNS para Vercel IPs/CNAME) + rode script de verificação (eu gero se pedir).
  5. Audit/Error: No GCP console ative Cloud Logging no serviço. No código (já parcial): use structured logs. Para Vercel: logs nativos acessíveis via token.
  6. Google Ads: Crie conta, linke GA4 (já no código), crie campanha com keywords do X Pulse (veja abaixo).
- **Marketing da página (já atualizado hoje por Grok — baseado em X Pulse):** 
  - Dores reais: "MUITO TEXTO que estressa a cliente", "Demora faz ela sumir", "Respostas curtas que realmente agendam".
  - CTAs mais fortes: "Teste grátis agora e agende mais em minutos" (em vez de genérico).
  - Gancho: Foco em "agendamento rápido sem enrolação" + proteção de cliente premium.
  - Pronto para Ads: Adicione tracking de conversão (agendamento, lead) se não tiver. Landing otimizada para velocidade + brevidade.
- **Google Ads config (básico para hoje):**
  - Crie campanha Search + Remarketing.
  - Keywords (do X Pulse): "respostas whatsapp estética", "bot para clínica de beleza", "automação leads whatsapp", "responder clientes rápido estética", "agendamento online clínica estética".
  - Bidding: Maximize conversions.
  - Landing: Use a página com os novos hooks (já atualizada).
  - Tracking: GA4 + conversões (form submit, demo, agendamento simulado).
  - Orçamento inicial baixo (teste 1-2 dias).
- **Msg para estética em Belém (draft pronto — use o gerador com novo objetivo "agendamento rápido" para personalizar):**
  Exemplo para Empoderatti (91 99824-8130) ou Onodera Belém:
  "Olá [Nome da Clínica], tudo bem? Sou do time LeadBellus — ajudamos clínicas de estética a responder no WhatsApp de forma rápida e estratégica, sem textos longos que estressam a cliente. 
  Clientes reclamam de demora e 'muito texto' — nosso sistema gera 3 respostas curtas que convertem em agendamento (testado com tendências reais de 2026).
  Quer um demo grátis com as mensagens da sua clínica? Em 5 min você vê a diferença. 
  Link: [link do onboarding ou demo]. 
  Abraço, Vinícius (MEI LeadBellus)."
  Envie via WhatsApp manual ou Twilio. Personalize com o gerador.
- **Deploy hoje (checklist completo):**
  1. Rode pre-flight Mesa (cockpit ou leadbellus_check.ps1). Fixe se bloqueado.
  2. Atualize blackboards (já fiz base — leia e confirme).
  3. Configure infra delegation acima (tokens/SAs).
  4. Deploy Vercel: `vercel --prod` (após pre-flight).
  5. Pós-deploy: 
     - Firebase Auth authorized domains: adicione leadbellus.com.br + www.
     - Stripe webhook: `https://leadbellus.com.br/api/stripe/webhook`.
     - Twilio webhook: `https://leadbellus.com.br/api/whatsapp/webhook` (faça join no sandbox).
  6. Valide: curl health + config. Teste gerador com "agendamento rápido". Rode demo WhatsApp.
  7. Google Ads: Crie conta + campanha básica (hoje).
  8. Outreach: Envie msg para 1-2 clínicas em Belém (draft acima).
  9. Atualize blackboards com "Lançado hoje com MEI + hybrid loop".
  10. Decida canônica (Vercel por enquanto).
- **Relatório de agentes (atualizado hoje):**
  - **Claude:** Focado em deploy/infra/secrets. Tarefa atual: handoff final do deploy de hoje + decisão Vercel vs Cloud Run. Permissões: full produção.
  - **Codex:** Implementando features do loop (qualificação, agendamento no inbox, hybrid integration no Nucleo). Tarefa atual: adaptar core para próximos verticals (LeadPet recomendado).
  - **Gemini:** Pesquisa e copy. Tarefa atual: atualizar landings/specs com dores do X Pulse + suporte a marketing Ads + docs para ResonAnza.
  - **Grok (eu):** Market analysis (X Pulse atualizado com sinais reais), hybrid scoring (implementado e integrado na Mesa), marketing da página (CTAs/dor/gancho fixados para Ads), infra delegation (passos para tokens/SAs), audit/error (logging), outreach draft para Belém, relatório completo, suporte a ResonAnza Fase 0. Pronto para ajudar com acesso limitado que você configurar agora.
- **Relatório do que cada um tá fazendo (visão loop):**
  - Todos sincronizados via blackboards (leia COORDINATION + X_MARKET_PULSE + HYBRID_SCORES antes de qualquer edição).
  - Grok lidera market + hybrid + marketing/Ads/outreach/ infra.
  - Gemini reforça copy/pesquisa.
  - Codex entrega código do core/loop.
  - Claude fecha com deploy.
  - Loop rodando: dados clínicas (LeadBellus) → scores (agentes) → launch (Nucleo adaptado via Mesa).

## 📅 Próximo Passo
- **HOJE:** Rode o checklist de deploy acima. Configure os acessos limitados (Vercel/GCP). Envie a msg para a clínica em Belém. Rode Google Ads básico.
- Depois: Estabilize LeadBellus → rode hybrid_scorer para próximo vertical (LeadPet) → deploy.
- ResonAnza: Grok pode começar Fase 0 calcs/scores enquanto isso (diga o foco).

Me avise o que rodar primeiro (ex: "atualiza o script de launch com os passos de token" ou "gera o draft final da msg para a clínica" ou "passos exatos pro Google Ads"). Vamos lançar hoje! 

Blackboards atualizados com tudo. Leiam antes de mexer. 

(Entidade MEI confirmada em todos os lugares.)

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
  2. **Stripe → Webhook endpoint:** apontar diretamente para `https://leadbellus.com.br/api/stripe/webhook` (o `STRIPE_WEBHOOK_SECRET` setado no Secret Manager precisa corresponder a esse endpoint).
  3. **Twilio sandbox:** enviar `join <código>` para +14155238886 e setar o webhook do sandbox para `https://leadbellus.com.br/api/whatsapp/webhook`.

---
### Log de Handoff
- 2026-06-18 (Antigravity): Configuração e validação final de Stripe Webhook, WhatsApp (Z-API), GA4 e Landing de Campanha. Excluído webhook do Stripe antigo e criado o novo (we_1TjjKQRTJ7iCFKxkF2IlUBlF) apontando para o host canônico atual. Segredo rotacionado para <rotated-secret-redacted>, atualizado no GCP Secret Manager e serviço do Cloud Run redeployado. Webhook do WhatsApp (Z-API) configurado e verificado (status 200). Adicionada variável NEXT_PUBLIC_GA4_ID (G-223KR63TS8) na Vercel e realizado deploy de produção. Criada a landing page de campanha em app/campanha/[slug]/page.tsx. Todos os builds de produção passando 100% e alterações enviadas para a main remota.
- 2026-06-15 (Codex): Simulador local de WhatsApp alinhado com a validacao real dos providers. `npm run whatsapp:simulate` agora gera `X-Twilio-Signature` quando `TWILIO_AUTH_TOKEN` existe e envia `x-d360-token` quando `D360_WEBHOOK_TOKEN` existe; `README.md` e `CLAUDE.md` atualizados para refletir o fluxo e os flags corretos.
- 2026-06-10 (Gemini): Unificação do Blackboard para o padrão `COORDINATION.md`.
- 2026-06-09 (Codex): Implementado Visual Overhaul v1.4.
- 2026-06-11 (Codex): Firebase Hosting publicado e validado; domínio público segue em Vercel e bloqueia pre-flight.
- 2026-06-11 (Claude): Integração Twilio WhatsApp implementada (substituiu Meta Cloud API). lib/whatsapp.ts + webhook reescritos. Env vars Twilio aplicados no Cloud Run (revs 00023/00024). Build 2fdd5d97 em andamento — quando deployar, configurar webhook Twilio para: https://leadbellus.com.br/api/whatsapp/webhook
- 2026-06-11 (Claude): **LeadBellus tirado do modo demo e lançado em produção no Vercel** por instrução direta do Vinícius. Autenticado Vercel CLI (device flow); gerada SA do Firebase Admin (`firebase-adminsdk-fbsvc`); 22 env vars setadas em scope production no projeto `leadvitta-app`; `vercel --prod` (deploy `dpl_6P6Sf6S...`, build 43s); aliases `leadbellus.com.br`+`www` repontados do deploy antigo `dpl_Epe2E3x...` para o novo. Verificação multi-agente: APROVADO (config tudo true, banner sumiu, Firebase no bundle, zero vazamento de segredo). Override da regra "Vercel proibido" → ver Bloqueios/Próximo Passo. SA key temporária apagada do disco.
