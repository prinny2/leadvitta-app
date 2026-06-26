---

name: new-api-route

description: Cria uma rota de API nova no LeadBellus seguindo o padrao obrigatorio de lib/api-security.ts (origin check + rate limit + jsonNoStore) e, se autenticada, verificacao de Firebase ID-token. Use ao adicionar qualquer rota em app/api/**.

---


# /new-api-route — Scaffold de rota segura (LeadBellus)


Toda rota nova em `app/api/**` DEVE seguir o padrao do repo. Esta skill torna o caminho

correto o caminho padrao, em vez de re-derivar a seguranca toda vez (e errar).


## Antes de escrever — leia o padrao real

Sempre abra estes arquivos primeiro e copie o estilo atual (assinaturas podem ter mudado):

- `lib/api-security.ts` — helpers de origin/CORS, rate limit, parse de body, `jsonNoStore`.

- A rota de **checkout do Stripe** (`app/api/stripe/checkout`) — modelo de rota **autenticada**

  com verificacao de Firebase ID-token.

- `lib/firebase/admin.ts` / `lib/firebase/middleware.ts` — verificacao de token server-side.


## Pergunte (ou infira do pedido)

1. **Metodo + caminho**: ex. `POST /api/<nome>`.

2. **Autenticada?** Se sim, exige Firebase ID-token valido.

3. **Publica/cross-origin?** (ex.: webhook de terceiro) — webhooks validam **assinatura**, nao origin.

4. **Escreve no Firestore?** Se mexe em `billing`, e **server-only via Admin SDK** (nunca pelo cliente).


## Esqueleto (adapte aos helpers REAIS de lib/api-security.ts)


```ts

// app/api/<nome>/route.ts

import { NextRequest } from "next/server";

// importe os helpers que existem hoje em lib/api-security.ts (nomes podem variar):

import { checkOrigin, rateLimit, parseJsonBody, jsonNoStore } from "@/lib/api-security";

// para rota autenticada:

// import { requireFirebaseUser } from "@/lib/firebase/middleware";


export async function POST(req: NextRequest) {

  // 1) origin / CORS

  const origin = checkOrigin(req);

  if (!origin.ok) return jsonNoStore({ error: "origin" }, { status: 403 });


  // 2) rate limit

  const rl = await rateLimit(req);

  if (!rl.ok) return jsonNoStore({ error: "rate_limited" }, { status: 429 });


  // 3) auth (so se for rota autenticada)

  // const user = await requireFirebaseUser(req);

  // if (!user) return jsonNoStore({ error: "unauthorized" }, { status: 401 });


  // 4) body

  const body = await parseJsonBody(req);

  if (!body.ok) return jsonNoStore({ error: "bad_request" }, { status: 400 });


  // 5) logica... (escrita sensivel = Admin SDK server-only)


  // 6) sempre jsonNoStore em resposta sensivel (evita cache/vazamento)

  return jsonNoStore({ ok: true });

}

```


## Para WEBHOOKS (Stripe/WhatsApp), em vez de origin check:

- Leia o **raw body** e valide a **assinatura** (`STRIPE_WEBHOOK_SECRET` / app secret do Meta)

  ANTES de processar. Modelo: `app/api/stripe/webhook` + `lib/stripe/server.ts`.


## Depois de criar

- Garanta `jsonNoStore` em toda resposta sensivel.

- Rode o type-check (o hook ja roda em edits .ts/.tsx) e `npm run build`.

- Considere rodar o subagente **payments-api-reviewer** antes do PR se a rota toca pagamento/auth.

- Atualize a "Directory layout" do `CLAUDE.md` se for uma rota nova relevante.
