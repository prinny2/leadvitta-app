# AGENTS.md

> Fonte da verdade do estado do projeto: **`ESTADO.md`** (local, fora do git).
> O app está **LIVE e cobrando** no Cloud Run. Trate toda mudança como mudança em produção.

## Divisão de trabalho entre agentes (Codex / Gemini / Claude)

| Agente | Papel | Pode |
|---|---|---|
| **Claude** | Integração crítica (billing/deploy), revisão de PR, verificação ao vivo | Único que roda `gcloud builds submit` / `gcloud run` |
| **Codex** | Features isoladas em branch própria (ex.: `feat/stripe-portal`) | Código + PR. **Não deploya, não mexe em env/segredos** |
| **Gemini** | Pesquisa (WhatsApp API, concorrência), copy/conteúdo | Texto/markdown. **Não toca código nem infra** |

### Backlog atual (ordem)
1. **Codex** → `feat/stripe-portal`: rota `POST /api/stripe/portal` (Stripe Billing Portal session, exige Firebase ID token igual ao checkout) + botão "Gerenciar assinatura" em Configurações. Seguir o padrão de `lib/api-security.ts` (origin check + rate limit + `jsonNoStore`).
2. **Gemini** → pesquisa: WhatsApp Cloud API oficial vs. Z-API vs. fundir com atendente do Núcleo (custos, prazo, risco de ban). Entregar markdown comparativo. + Rascunho de e-mail de boas-vindas pós-pagamento e script de abordagem para a 1ª clínica.
3. **Claude** → revisar/mergear PRs, deploy, pagamento teste ponta-a-ponta, DNS `leadbellus.com.br`.

### Regras de execução (armadilhas já pagas com horas)
- **Só Claude deploya.** "Está pronto" sem verificação ao vivo (curl na rota, painel Stripe, Firestore) **não vale**.
- Cada agente trabalha em **branch própria**; nunca commitar direto na branch que deploya.
- ⛔ **Vercel**: NÃO usar (deploy leftover, split-brain de domínio). Deploy é **Cloud Run**.
- ⛔ **Auth0**: branch `feat/auth0` está parada de propósito. Não retomar nem deployar.
- ⛔ Segredos: nunca em commit/chat/`cloudbuild.yaml`. Local → `C:\Users\vpaes\Credenciais\`; produção → Secret Manager.
- `NEXT_PUBLIC_*` é build-time: mudar exige rebuild (`gcloud builds submit`), não só `services update`.

## Projeto

- App Next.js 15 (App Router) com TypeScript e TailwindCSS.
- O app roda sem chaves em modo demonstracao; nesse modo, os dados ficam no navegador.
- Use Node 20 para manter paridade com o `Dockerfile`.

## Comandos locais

```bash
npm install
npm run dev
npm run build
npm run start
```

- Desenvolvimento local: `http://localhost:3000`
- Smoke check local ou em producao: `curl http://localhost:3000/api/health`

## Ambiente

- Copie `.env.local.example` para `.env.local`.
- Variaveis `NEXT_PUBLIC_*` precisam existir no momento do build em producao.
- Principais grupos de env usados pelo repo: Firebase (`NEXT_PUBLIC_FIREBASE_*` + credenciais Admin), IA (`OPENAI_API_KEY`/`ANTHROPIC_API_KEY`), Stripe, WhatsApp Cloud API, Zapier e analytics opcionais (`NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`).

## Deploy

- Build/deploy no Cloud Run via Cloud Build:

```bash
gcloud builds submit --config cloudbuild.yaml
```

- Configure segredos e env vars do servico fora do `cloudbuild.yaml`, por exemplo:

```bash
gcloud run services update <SERVICE> --region <REGION> --set-env-vars NEXT_PUBLIC_SITE_URL=https://<HOST>
```

- Para chaves server-side no Cloud Run, use `--set-secrets` no mesmo update, por exemplo:

```bash
gcloud run services update <SERVICE> --region <REGION> --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest
```

- Build/container local com o `Dockerfile`:

```bash
docker build -t leadbellus .
docker run --rm -p 8080:8080 leadbellus
```

- A imagem final sobe o app em `PORT=8080` com `node server.js`.
- Smoke check do container local: `curl http://localhost:8080/api/health`
- Depois de cada deploy, valide `GET /api/health`.
- ⛔ Não publicar em Vercel (ver regras acima) — o deploy oficial é Cloud Run; webhooks públicos ficam em `/api/stripe/webhook` e `/api/whatsapp/webhook` na URL do Cloud Run.

## TODO

- Ainda nao existe script de `lint` ou `test` no `package.json`; nao documentar comandos de validacao alem de `npm run build` e do health check ate isso existir.
