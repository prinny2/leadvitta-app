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
- **Firebase Auth é o auth oficial do v1.** Não adicionar `AUTH0_*`, dependência do Auth0 ou rotas `/auth/*` sem uma migração dedicada.
- ⛔ Segredos: nunca em commit/chat/`cloudbuild.yaml`. Local → `C:\Users\vpaes\Credenciais\`; produção → Secret Manager.
- `NEXT_PUBLIC_*` é build-time: mudar exige rebuild (`gcloud builds submit`), não só `services update`.

## Projeto

- App Next.js 15 (App Router) com TypeScript e TailwindCSS.
- O app roda sem chaves em modo demonstração; nesse modo, os dados ficam no navegador.
- Use Node 20 para manter paridade com o `Dockerfile`.
- Checkout, webhook Stripe, Firestore e Zapier autenticado ainda se apoiam na identidade do Firebase no v1.

## Comandos locais

```bash
npm install
npm run dev
npm run build
npm run start
```

- Desenvolvimento local: `http://localhost:3000`
- Smoke check local ou em produção: `curl http://localhost:3000/api/health`

## Ambiente

- Copie `.env.local.example` para `.env.local`.
- Variáveis `NEXT_PUBLIC_*` precisam existir no momento do build em produção.
- Principais grupos de env vars usados pelo repo: Firebase (`NEXT_PUBLIC_FIREBASE_*` + credenciais Admin), IA (`OPENAI_API_KEY`/`ANTHROPIC_API_KEY`), Stripe, WhatsApp Cloud API, Zapier e analytics opcionais (`NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`).

## Deploy

- Build/deploy no Cloud Run via Cloud Build:

```bash
gcloud builds submit --config cloudbuild.yaml
```

- Configure segredos e env vars do serviço fora do `cloudbuild.yaml`, por exemplo:

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

- Ainda não existe script de `lint` ou `test` no `package.json`; não documentar comandos de validação além de `npm run build` e do health check até isso existir.

## Cursor Cloud specific instructions

### Serviço local

Monólito Next.js — **um único processo** cobre UI e APIs. Não há Postgres/Redis/Firebase emulador no repo.

| Comando | Porta | Uso |
|---|---|---|
| `npm run dev` | 3000 | Desenvolvimento (HMR) |
| `npm run start` | 3000 | Servir build de produção |
| `docker run -p 8080:8080 leadbellus` | 8080 | Paridade com Cloud Run |

### Node.js

A VM pode vir com Node 22; o `Dockerfile` usa **Node 20**. Antes de `dev`/`build`, use:

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 20
```

(`nvm install 20` na primeira sessão, se necessário.)

### Modo demonstração (padrão na Cloud VM)

Sem segredos o app funciona: login dispensado, dados em `localStorage`, IA mockada.

```bash
cp .env.local.example .env.local   # se ainda não existir
```

### Validar mudanças

Não há `lint` nem `test`. Use:

```bash
npm run build
curl http://localhost:3000/api/health
```

Para o fluxo central (gerador de respostas) em demo:

```bash
curl -sS -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"mensagemCliente":"Olá, quanto custa o botox?"}' | jq .mock
# esperado: true (sem chaves de IA)
```

### Dev server em background

Use tmux (não `block_until_ms: 0` solto):

```bash
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s nextjs-dev-server -c /workspace
tmux -f /exec-daemon/tmux.portal.conf send-keys -t nextjs-dev-server:0.0 \
  'export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 20 && npm run dev' C-m
```

### Integrações externas (fora do escopo local mínimo)

Firebase, Stripe, WhatsApp e Zapier são serviços cloud — não sobem localmente. Para E2E completo de billing/auth, o agente precisa de segredos do usuário; para features de UI/IA em demo, **só o Next.js basta**.
