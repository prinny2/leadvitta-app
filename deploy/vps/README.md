# LeadBellus no VPS (preço fixo, sem Vercel/Cloud Run)

Arquitetura: **1 VPS** (Docker: app Next.js + Caddy com HTTPS automático) ·
**Firebase no plano Spark** (login + Firestore, sem conta de faturamento →
não gera cobrança, só para na cota diária) · **Stripe** (cobrança) · **GitHub Actions** (build + deploy a cada push na `main`).

Custo de infra = mensalidade fixa do VPS. Nada escala sozinho, nada cobra por uso.

## 1. Contratar o VPS

- Ubuntu **24.04**, **x86_64/amd64**, ≥ **1 GB RAM** (2 GB confortável), datacenter **São Paulo**.
- Em produção hoje: **AWS EC2 t3.micro, us-east-2 (Ohio), IP fixo `3.12.9.125`**, conta no
  plano gratuito (créditos de US$100, sem cobrança no cartão) até **28/04/2027** — o plano
  gratuito trava a região em Ohio e bloqueia o Lightsail. O setup rodou como *user data*.
  Acesso de console: EC2 → Instâncias → leadbellus → Conectar → EC2 Instance Connect.
- Preço **fixo mensal** (VPS nacional, ou **AWS Lightsail** em `sa-east-1`).
  Evite EC2/App Runner/Amplify/Cloud Run — cobram por uso.
- Anote o **IP público** (no Lightsail, anexe um *Static IP*).
- **Lightsail:** em *Networking → IPv4 Firewall* adicione **HTTPS (TCP 443)** — o
  padrão só libera 22 e 80. Crie também um alerta em *AWS Budgets* (ex.: US$15/mês).

## 2. Preparar o servidor

No seu computador:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/leadbellus_deploy -N "" -C leadbellus-deploy
scp deploy/vps/bootstrap.sh root@IP:/root/
ssh root@IP "bash /root/bootstrap.sh '$(cat ~/.ssh/leadbellus_deploy.pub)'"
```

(No Lightsail o usuário inicial é `ubuntu`: use `ubuntu@IP` e `sudo bash`.)

Depois preencha os segredos no servidor (modelo: [`app.env.example`](app.env.example)):

```bash
ssh root@IP
nano /opt/leadbellus/app.env   # chmod 600 já aplicado pelo bootstrap
```

## 3. Configurar o GitHub

Repo → **Settings → Secrets and variables → Actions**

**Secrets**

| Nome | Valor |
|---|---|
| `VPS_HOST` | IP do VPS |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | conteúdo de `~/.ssh/leadbellus_deploy` (a chave **privada**) |

**Variables** (públicas, entram no build): `NEXT_PUBLIC_SITE_URL=https://www.leadbellus.com.br`,
`NEXT_PUBLIC_FIREBASE_API_KEY` (os outros `NEXT_PUBLIC_FIREBASE_*` têm default em `lib/config.ts`),
`NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_WHATSAPP_NUMBER`
— lista completa em [`.github/workflows/deploy-vps.yml`](../../.github/workflows/deploy-vps.yml).
Por último: **`VPS_ENABLED=true`** (liga o workflow).

Rode **Actions → Deploy VPS → Run workflow**. Ele termina verde quando
`/api/health` responde dentro do servidor.

## 4. DNS no Registro.br

Hoje o domínio está delegado para `ns1/ns2.vercel-dns.com` — com a Vercel
cancelada **ninguém responde** por ele (site e, se houver, e-mail do domínio fora do ar).
**Feito em 28/10/2026:** DNS do Registro.br + modo avançado.

1. registro.br → **Painel** → `leadbellus.com.br` → **DNS** → **Alterar servidores DNS**
   → **Utilizar os servidores DNS do Registro.br** → Salvar.
2. Em **Editar zona** (libera depois da troca), crie:

| Tipo | Nome | Valor |
|---|---|---|
| A | `leadbellus.com.br` | IP do VPS |
| A | `www` | IP do VPS |
| MX/TXT | e-mail e verificações | recrie se o domínio tinha e-mail ou verificação (Google, Meta) |

O Caddy emite o HTTPS sozinho assim que o DNS propagar.

## 5. Apontar webhooks para o novo host

- **Stripe** → Developers → Webhooks: edite o endpoint antigo (`…run.app`) para
  `https://www.leadbellus.com.br/api/stripe/webhook` (mesmos 4 eventos). Se criar um
  novo, copie o `whsec_` novo para `STRIPE_WEBHOOK_SECRET` no `app.env`.
- Use sempre o **www** — o apex redireciona (308) e webhook não segue redirect.

## 6. Conferir

```bash
curl https://www.leadbellus.com.br/api/health
```

Login (Firebase) → onboarding → gerador → checkout Start → Stripe *Recent deliveries* = 200
→ Firestore `clinicas/{uid}.billing.status = active`.

## Login

O relançamento roda **sem Clerk**: sem `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`/`CLERK_SECRET_KEY` o
app usa o Firebase Auth (e-mail/senha + Google). Contas criadas via Clerk (jul–out/2026) ficam
com os dados em `clinicas/{id_do_clerk}` e precisam criar conta nova. **Antes de desligar,
confirme no Stripe que não há assinatura ativa** cujo `metadata.firebase_uid` comece com
`user_` (ID do Clerk): o `lib/stripe/billing-sync.ts` roteia por esse UID, então um assinante
assim seguiria cobrado sem acesso — migre `clinicas/{uid}` + metadata juntos ou mantenha o
Clerk. (Relançamento de 28/10/2026: confirmado sem assinantes ativos.) Para religar o Clerk:
chaves no `app.env` + Variable no GitHub + CNAMEs do Clerk no Registro.br.

## Travas de custo (não pular)

- **Firebase:** manter no **Spark**. Não religar faturamento no projeto `leadvitta-app`.
- **OpenAI / Anthropic:** definir limite mensal de gasto no painel de cada um.
- **Gemini:** não configurar (`GEMINI_API_KEY` vazia) — cobrava na conta GCP.
- **WhatsApp:** desligado. Se reativar o Z-API, o parser já ignora grupos,
  canais, listas e mensagens do próprio número.

## Operação

```bash
ssh deploy@IP
cd /opt/leadbellus
docker compose ps
docker compose logs -f app
docker compose up -d --force-recreate app   # depois de editar app.env (restart NÃO relê o env_file)
docker images leadbellus              # o deploy guarda a imagem atual + a anterior
echo IMAGE_TAG=<sha-anterior> > .env && docker compose up -d   # rollback
```
