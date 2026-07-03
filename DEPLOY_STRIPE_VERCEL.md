# DEPLOY_STRIPE_VERCEL.md — Checkout recorrente + Webhook (arquitetura híbrida)

> Última revisão: 2026-07-02. Fonte da verdade de estado vivo: **COORDINATION.md**.
> Fonte única de planos/preços na UI: **lib/billing.ts**. Não comitar segredos.

> ## ⚠️ ATUALIZAÇÃO 2026-07-02 — produção NÃO está mais no modo híbrido descrito abaixo
>
> Desde o merge da migração Clerk (PR #98, `fbf64dc`, 2026-07-01), a produção roda **full-Vercel**:
>
> - **`/api/*` executa NA VERCEL** (sem proxy). `ENABLE_API_PROXY` **não** está setado — e **NÃO deve ser
>   setado**: ligá-lo mandaria `/api/auth/firebase-token` (ponte Clerk→Firebase) para o Cloud Run, que
>   **não tem** as envs do Clerk → login quebra (audit 2026-07-02, blackboard claim #92).
> - **Segredos de runtime** (`STRIPE_*`, `FIREBASE_*`, `CLERK_*`, `ZAPI_*`, `GA4_API_SECRET`) vivem na
>   **Vercel**. Evidência live: `/api/config` retorna `clerk_server_enabled:true`, `firebase_admin_enabled:true`,
>   `ga4_server_enabled:true`, `zapi_enabled:true`.
> - **Auth público = Clerk** (`clerk.leadbellus.com.br`, pk_live). Firebase segue como ponte interna
>   (custom token via `/api/auth/firebase-token`) + data layer Firestore. Ver `docs/clerk-auth-migration.md`.
> - **Supabase (espelho): projeto vivo = `imlroxezgshrybizdnyy`** (embutido no bundle de prod). O schema
>   de 2026-06-28 foi aplicado no `jaxpniltorjryfibnfkg`, que o código não lê (envs `leadbellusreal_*`) —
>   rodar `supabase/schema.sql` no projeto vivo antes de confiar no espelho.
> - Cloud Run = **legacy/backup**. As seções §0–§6 abaixo descrevem o modo híbrido (proxy ligado) e valem
>   **apenas** se esse modo voltar a ser ativado deliberadamente. No modo atual, leia "Cloud Run" como
>   "runtime da Vercel" ao aplicar §4–§7 (whsec/envs na Vercel; webhook em `www`, nunca apex).

## 0. A verdade da arquitetura (leia primeiro — quase tudo aqui depende disso)

LeadBellus é **híbrido**:

- **Vercel** (`www.leadbellus.com.br`) serve **apenas o frontend** e as variáveis
  `NEXT_PUBLIC_*` **embutidas no build**.
- **TODAS** as rotas `/api/*` são reescritas (proxy server-side) para o **Cloud Run**
  em `https://leadbellus-87102725202.southamerica-east1.run.app`.

Motivo no código (`next.config.mjs:10-11,51-61`):

```js
const enableApiProxy = process.env.ENABLE_API_PROXY === "true";
// rewrites().beforeFiles: { source: "/api/:path*", destination: `${apiProxyOrigin}/api/:path*` }
```

O proxy é **opt-in**: na Vercel de produção defina **`ENABLE_API_PROXY=true` no build**
(sem isso, `/api/*` roda na edge da Vercel **sem** os segredos do Cloud Run). O rewrite
dispara em `beforeFiles`, **antes** dos handlers em `app/api/`.

**Consequência que muda tudo:**
`app/api/stripe/checkout/route.ts` e `app/api/stripe/webhook/route.ts`
**NUNCA executam na Vercel** — rodam no **Cloud Run**, lendo `process.env.STRIPE_*` /
`FIREBASE_*` **do ambiente do Cloud Run**, não da Vercel.

> **Regra de ouro:** todo segredo de **runtime** de `/api/*` (`STRIPE_*`, `FIREBASE_*`,
> `OPENAI/ANTHROPIC`, `ZAPI_*`) vai no **Cloud Run** (Secret Manager). Na **Vercel** só
> ficam `NEXT_PUBLIC_*` (build-time) e as vars de proxy. Segredo de Stripe/Firebase setado
> **só na Vercel é INERTE** — o cliente paga e a conta nunca ativa.

## 1. Onde cada variável vive

| Variável | Vercel (build) | Cloud Run (runtime) | Observação |
|---|:--:|:--:|---|
| `STRIPE_SECRET_KEY` | ❌ | ✅ | checkout + webhook (`config.ts:53`). |
| `STRIPE_WEBHOOK_SECRET` | ❌ | ✅ | `constructEvent` (`webhook/route.ts`). **Erro clássico: pôr na Vercel.** |
| `STRIPE_CHECKOUT_MODE` | ❌ | ✅ | `=subscription` (default do código é `payment`, `billing.ts:102-106`). |
| `STRIPE_PRICE_ID_START` | ❌ | ✅ | `isStripeConfigured` (`config.ts:54`). |
| `STRIPE_PRICE_ID_PRO` | ❌ | ✅ | manter **VAZIO** até liberar Pro. |
| `STRIPE_PRICE_ID_PREMIUM` | ❌ | ✅ | manter **VAZIO** até liberar Premium. |
| `STRIPE_PRICE_ID_*_ANNUAL` | ❌ | ✅ | checkout anual (`lib/billing.ts`). |
| `STRIPE_ALLOWED_PRICE_IDS` | ❌ | ✅ | opcional; guard extra (`lib/stripe/price-guard.ts`). |
| `FIREBASE_SERVICE_ACCOUNT_JSON` / `_BASE64` | ❌ | ✅ | Admin SDK; prefira service account anexada (ADC) e deixe vazio. |
| `FIREBASE_PROJECT_ID` / `_CLIENT_EMAIL` / `_PRIVATE_KEY` | ❌ | ✅ | Admin (server). **Não confundir** `FIREBASE_PROJECT_ID` com `NEXT_PUBLIC_FIREBASE_PROJECT_ID`. |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` | ❌ | ✅ | IA primária + fallbacks. |
| `ZAPI_INSTANCE_ID` / `ZAPI_TOKEN` / `ZAPI_CLIENT_TOKEN` | ❌ | ✅ | envio outbound Z-API. |
| `ZAPI_SECURITY_TOKEN` | ❌ | ✅ | valida inbound `/api/whatsapp/webhook`. Sem ele em prod → **403** e mensagens caem. |
| `ZAPIER_WEBHOOK_URL` / `ZAPIER_SHARED_SECRET` | ❌ | ✅ | integração Zapier. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | ✅ | **única var nos dois lados**: bundle Vercel (`config.ts:48`) **e** URLs success/cancel do Stripe no Cloud Run. |
| `NEXT_PUBLIC_FIREBASE_*` (6 vars) | ✅ | ❌ | config cliente, baked no build (`config.ts:5-10`). **Rebuild** p/ mudar. |
| `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_META_PIXEL_ID` | ✅ | ❌ | analytics baked no build. Pixel hoje vazio. |
| `ENABLE_API_PROXY` | ✅ **obrigatório** (`=true`) | **não setar** | opt-in explícito (`next.config.mjs:10` — **não** usa `VERCEL=1`). Sem `true`, `/api/*` roda na edge Vercel sem segredos. **No Cloud Run = loop.** |
| `API_PROXY_ORIGIN` | build-only | **não setar** | **nunca** apontar p/ `leadbellus.com.br` → `next.config.mjs:13-17` **quebra o build**. Deixe vazio (default Cloud Run) ou a URL `.run.app`. |

> `NEXT_PUBLIC_*` são **build-time** — mudar exige **rebuild** da Vercel, não só redeploy.
> `STRIPE_*`/`FIREBASE_*`/`ZAPI_*` são **runtime no Cloud Run** — valem na próxima invocação.

## 2. Conta Stripe e preços (LIVE)

- ✅ **DECISÃO 18/jun/2026 — conta de produção = `acct_1TemHuRTJ7iCFKxk` ("LeadBellus")**.
  Ela está **ativada** (charges/payouts ON, banco Inter 7545, identidade verificada, nome de negócio
  já "LeadBellus", descritivo de fatura "LEADBELLUS") e tem os produtos Start/Pro/Premium em LIVE,
  com preços **mensais e anuais**. A antiga `acct_1TeQMX...` ("LeadCare") está **aposentada** — não usar.
  Atenção: o Stripe MCP conecta na `acct_1TemHu`, então dá pra gerir essa conta via API (criar preços etc.).
- Price IDs LIVE (conta LeadBellus): mensal `price_1Tj5ih...`(start) / `price_1Tj5j8...`(pro) / `price_1Tj5jN...`(premium);
  anual `price_1TjhRn...`(start) / `price_1TjhS6...`(pro) / `price_1TjhS7...`(premium). Price IDs e acct IDs **não são segredos**.
- Modo: **`subscription`** (`STRIPE_CHECKOUT_MODE=subscription`); usado em `checkout/route.ts`.
- Hoje **só o Start é vendável**; Pro/Premium ficam "Em breve" (deixe os Price IDs vazios).

> ⚠️ **Divergência de preço a resolver antes de vender:** `lib/billing.ts` mostra
> **R$97/197/347** (`priceLabel`, fonte única da UI), mas docs antigos (GO_LIVE_BILLING/
> LAUNCH_NOW) dizem R$197/297/397. Reconcilie os `priceLabel` com o valor real dos Price IDs
> na conta **`acct_1TemHu` (LeadBellus)** **antes** de cobrar — risco de confiança/compliance.

## 3. Configurar segredos no Cloud Run (NÃO na Vercel)

```bash
gcloud run services update leadbellus --region southamerica-east1 \
  --update-env-vars STRIPE_CHECKOUT_MODE=subscription,STRIPE_PRICE_ID_START=price_1Tj5ih... \
  --set-secrets STRIPE_SECRET_KEY=stripe-secret-key:latest,STRIPE_WEBHOOK_SECRET=stripe-webhook-secret:latest
# FIREBASE_*: prefira ADC (service account anexada ao serviço) — sem JSON em env.
# Validar:
gcloud run services describe leadbellus --region southamerica-east1
```

Na **Vercel**, configure apenas `NEXT_PUBLIC_*` + domínio (e, se quiser, `API_PROXY_ORIGIN`
explícito = a URL `.run.app`). Lembre: mudar `NEXT_PUBLIC_*` exige **novo build** na Vercel.

## 4. Webhook do Stripe — endpoint e segredo

**Recomendado: apontar o endpoint DIRETO para o Cloud Run**, pulando o proxy da Vercel:

```
https://leadbellus-87102725202.southamerica-east1.run.app/api/stripe/webhook
```

- O `STRIPE_WEBHOOK_SECRET` vive **onde o handler roda** (hoje: **Vercel**; no modo híbrido: Cloud Run) —
  é lá que o `constructEvent` roda (`webhook/route.ts` lê `rawBody = await request.text()` e verifica com
  o `whsec`). O `whsec` precisa ser **o signing secret desse endpoint** registrado em
  **`acct_1TemHuRTJ7iCFKxk` (LeadBellus)** — a `acct_1TeQMX...` está aposentada (D-004).
- Por que direto no Cloud Run (zero desvantagem): o handler roda no Cloud Run de qualquer
  forma; ir direto remove o edge proxy, os limites 4,5MB/120s, qualquer normalização futura de
  header/body, **e** a armadilha do apex.

**Armadilha do apex (307):** `leadbellus.com.br` (apex) faz **307 → www**, e o **Stripe não
segue redirect**. Se mantiver o endpoint no domínio Vercel por branding, use **`www`** (nunca
o apex) — e **ainda assim** ponha o `whsec` no Cloud Run.

**Eventos a assinar:** `checkout.session.completed`, `customer.subscription.created`,
`customer.subscription.updated`, `customer.subscription.deleted` — esses 4 o handler reconcilia
em `clinicas/{uid}.billing` via Admin SDK (escrita **server-only**). `invoice.payment_succeeded`/
`invoice.payment_failed` são **opcionais** (apenas registrados em `stripe_events`, sem ação).

## 5. Diagnóstico (tabela ancorada no código)

| Sintoma | Causa provável | Onde olhar / corrigir |
|---|---|---|
| Webhook **400** "No signatures found"/"signature mismatch" | `STRIPE_WEBHOOK_SECRET` errado/ausente **no Cloud Run** (ou whsec de outro endpoint) | `webhook/route.ts:122,142`; `gcloud run services describe leadbellus`. **Não** é problema de bytes do proxy. |
| Webhook nunca chega / entregas falham no Stripe | endpoint registrado no **apex** (307→www, Stripe não segue) | repointar p/ a URL `.run.app` ou `www`. |
| Cliente paga e conta **não ativa** | segredos Stripe/Firebase setados **só na Vercel** (inertes) | mover `STRIPE_*`/`FIREBASE_*` p/ Cloud Run. |
| Checkout **503** | `STRIPE_PRICE_ID_<PLANO>` ausente ou Stripe não configurado no Cloud Run | `checkout/route.ts:57-76`; `config.ts:53-56`. |
| Checkout **400** "Plano inválido" / "ainda não disponível" | `plan` ≠ start/pro/premium, ou Price ID do plano vazio (`disponivel=false`) | `checkout/route.ts:45-56`; `billing.ts:56,74`. |
| `/api/config` mostra `stripe_enabled=false` | env do **Cloud Run** (o `/api/config` no domínio é respondido pelo Cloud Run via proxy) | corrigir env no Cloud Run, não na Vercel. |
| Build da Vercel **falha** ("API proxy loop") | `API_PROXY_ORIGIN` aponta p/ `leadbellus.com.br` | `next.config.mjs:13-17`; deixar vazio ou usar `.run.app`. |
| Mudei `NEXT_PUBLIC_*` e nada mudou | é **build-time**; precisa rebuild na Vercel | redeploy não basta — refazer o build. |

## 6. WhatsApp (Z-API) — config do webhook inbound

Provedor **Z-API only** (número **+55 91 8515-6690**). Painel Z-API → Webhooks:

- **Ao receber** (`ReceivedMessage`):
  `https://leadbellus-87102725202.southamerica-east1.run.app/api/whatsapp/webhook?token=<ZAPI_SECURITY_TOKEN>`
- **Receber status da mensagem** e **todos os demais campos**: **DEIXAR VAZIO**
  (`route.ts` só processa inbound de mensagem; o resto é no-op).
- `ZAPI_SECURITY_TOKEN` deve existir no **runtime do Cloud Run** e ser **igual** ao `?token=`.
  Token ausente/errado ⇒ **403** e 100% das mensagens inbound caem (fail-closed). Auto-resposta
  só dispara para clínica com `billing.status` em `active|paid|trialing`.

Registro alternativo via script (passe a URL Cloud Run para evitar o hop de proxy):

```bash
node scripts/setup-zapi-webhook.mjs \
  https://leadbellus-87102725202.southamerica-east1.run.app/api/whatsapp/webhook
# o script anexa ?token automaticamente. Sem argv[2] ele usa NEXT_PUBLIC_SITE_URL (= www), que proxia.
```

## 7. Aceitação

1. `curl -L https://www.leadbellus.com.br/api/config` → `stripe_enabled`, `firebase_admin_enabled`,
   `ai_enabled` = `true`, `whatsapp_provider:"zapi"` (respondido pelo Cloud Run via proxy).
2. Stripe **"Send test webhook"** no endpoint `.run.app` → **200 `{"received":true}`**.
   (400 = whsec/endpoint divergente no Cloud Run, não bytes do proxy.)
3. Checkout real do **Start** conclui e `clinicas/{uid}.billing` é gravado pelo webhook (Admin SDK);
   o usuário volta para `/configuracoes?checkout=sucesso`.
4. WhatsApp: `node scripts/simulate-whatsapp-webhook.mjs` → **200**; sem token → **403**.

## 8. Pendências de produto / decisão

- **Pro/Premium**: `disponivel` (`billing.ts:56,74`) depende de env **server-only**, invisível ao
  cliente → o botão "Assinar Pro/Premium" **nunca renderiza** na UI (só "Em breve"). É intencional
  no lançamento (só Start), mas **contraria** o aceite "checkout abre para Pro/Premium". Para abrir
  os três, é preciso expor a disponibilidade ao cliente (flag `NEXT_PUBLIC_*` ou via `/api/config`).
- **Preço**: `lib/billing.ts` R$97/197/347 vs docs R$197/297/397 — reconciliar com os valores
  reais na conta `acct_1TemHu` (LeadBellus) antes de vender (fonte única = `lib/billing.ts`).
- **Prod canônica (2026-06-30):** Vercel (`www.leadbellus.com.br`) é o host público; Cloud Run é o
  **API tier** (`/api/*` via proxy + webhooks diretos `.run.app`). Não há conflito pendente.

## 9. Docs relacionados (estado)

- ✅ Canônicos: **COORDINATION.md** (estado vivo), **README §Deploy/§Stripe/§WhatsApp** (Z-API only,
  webhook na URL `.run.app`), **GO_LIVE_BILLING.md** (segredos no Cloud Run), este arquivo.
- ✅ Corrigido (2026-07-01): `ENABLE_API_PROXY=true` obrigatório na Vercel (não `VERCEL=1`);
  COORDINATION.md, LAUNCH_NOW.md e README §WhatsApp reconciliados com Z-API como único provedor.
  **← válido só no modo híbrido; desde 2026-07-02 o proxy fica DESLIGADO (ver atualização no topo).**
