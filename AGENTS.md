# AGENTS.md

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
- Se publicar em Vercel, configure as env vars no painel, faca redeploy apos mudar `NEXT_PUBLIC_*` e cadastre os webhooks publicos em `/api/stripe/webhook` e `/api/whatsapp/webhook`.

## TODO

- Ainda nao existe script de `lint` ou `test` no `package.json`; nao documentar comandos de validacao alem de `npm run build` e do health check ate isso existir.
