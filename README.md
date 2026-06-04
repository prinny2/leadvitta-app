# LeadVitta

Micro-SaaS que ajuda clínicas e profissionais de estética a **responderem melhor no
WhatsApp**: gera respostas estratégicas (curta / consultiva / persuasiva), quebra
objeções, faz follow-up e conduz a cliente até o agendamento — com guardrails de
compliance (nunca promete resultado garantido, não faz diagnóstico, não crava preço).

Stack: **Next.js (App Router) + TypeScript + TailwindCSS + Supabase + Anthropic (Claude)**.

---

## ⚡ Rodar agora (modo demonstração, sem nenhuma chave)

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Sem chaves, o app roda em **modo demonstração**:
- login dispensado;
- dados (clínica + histórico) salvos no **navegador** (localStorage);
- respostas são **exemplos** (seguem a fórmula, mas não usam IA real).

## 🚀 Modo completo (IA real + login + nuvem)

Crie um arquivo `.env.local` (copie de `.env.local.example`) e preencha:

```
ANTHROPIC_API_KEY=...           # https://console.anthropic.com -> API Keys
AI_MODEL=claude-haiku-4-5       # ou claude-sonnet-4-6 para mais qualidade
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 1. Supabase (login + banco)
1. Crie um projeto grátis em https://supabase.com.
2. Em **Project Settings → API**, copie a `URL` e a chave `anon public`.
3. Em **SQL Editor**, cole e rode o conteúdo de [`supabase/schema.sql`](supabase/schema.sql)
   (cria as tabelas `clinicas` e `historico_respostas` com RLS por usuário).
4. (Opcional) Para login mais rápido em testes: **Authentication → Providers → Email**
   e desative "Confirm email". Para "Continuar com Google": habilite o provedor Google
   e adicione `http://localhost:3000/auth/callback` nas URLs de redirect.

### 2. Anthropic (IA)
Crie uma API Key em https://console.anthropic.com e coloque em `ANTHROPIC_API_KEY`.

Reinicie o `npm run dev` após editar o `.env.local`.

## 🧠 Onde fica a inteligência
- `lib/ai/prompts.ts` — o "cérebro": fórmula de 5 partes, tons, guardrails, exemplos-ouro.
- `lib/ai/provider.ts` — chamada ao Claude (prompt caching, retry, revisão de compliance) + fallback de exemplo.
- `data/` — domínio completo: 16 situações, 8 tons, 16 procedimentos, objeções, follow-ups e scripts.

## 📦 Deploy (Vercel)
1. Suba o projeto para um repositório Git e importe na Vercel.
2. Configure as mesmas variáveis de ambiente do `.env.local`.
3. Ajuste `NEXT_PUBLIC_SITE_URL` para a URL de produção e adicione `https://SEU-DOMINIO/auth/callback`
   nas URLs de redirect do Supabase (e do Google, se usar).

## 🗺️ Estrutura
```
app/            # rotas (marketing / auth / app) + API (generate, follow-up)
components/     # UI + navegação
data/           # biblioteca de conteúdo de estética
lib/ai/         # prompts e provider da IA
lib/supabase/   # clientes SSR + middleware
lib/store.ts    # dados (Supabase OU localStorage no modo demo)
supabase/       # schema.sql (tabelas + RLS)
```

## Próximos passos (fora do MVP)
Integração com a API do WhatsApp, automações, CRM/painel de leads, métricas e
billing/assinatura (Stripe).
