# Artes sociais — campanha "A conversa que trava"

Criativos de Instagram, WhatsApp e Facebook. Plano de campanha, legendas e
estrutura de mídia paga em `docs/marketing/campanha-social-set-out-2026.md`.

Servidos publicamente em `https://www.leadbellus.com.br/social/<arquivo>.jpg`, que
é como `data/social-posts.ts` os referencia no cron de publicação.

## Por que JPEG

A API de publicação do Instagram (`POST /{ig-user-id}/media`, usada por
`lib/social/meta-publisher.ts`) **só aceita JPEG** na `image_url`. PNG falha na
criação do container. O feed também valida proporção entre 4:5 e 1.91:1 — por
isso **arte 9:16 (stories) nunca pode ir no `imagemUrl`** de um post do cron.

| Arquivo | Dimensão | Proporção | Vale no cron? |
|---|---|---|---|
| `ig-01-feed-quanto-custa.jpg` | 1080×1350 | 4:5 | ✅ |
| `ig-02-feed-tres-respostas.jpg` | 1080×1350 | 4:5 | ✅ |
| `ig-03-carrossel-1-capa.jpg` | 1080×1350 | 4:5 | ✅ |
| `ig-04-carrossel-2-preco.jpg` | 1080×1350 | 4:5 | ✅ |
| `ig-05-carrossel-3-achou-caro.jpg` | 1080×1350 | 4:5 | ✅ |
| `ig-06-carrossel-4-sumiu.jpg` | 1080×1350 | 4:5 | ✅ |
| `ig-07-carrossel-5-cta.jpg` | 1080×1350 | 4:5 | ✅ |
| `ig-08-story-cliente-sumiu.jpg` | 1080×1920 | 9:16 | ❌ stories/reels, manual |
| `ig-09-story-oferta.jpg` | 1080×1920 | 9:16 | ❌ stories/reels, manual |
| `wa-01-status-preco.jpg` | 1080×1920 | 9:16 | ❌ status do WhatsApp, manual |
| `wa-02-canal-achou-caro.jpg` | 1080×1080 | 1:1 | ✅ |
| `fb-01-anuncio-1200x628.jpg` | 1200×628 | 1.91:1 | ✅ (feed FB / Meta Ads) |
| `fb-02-anuncio-1080x1080.jpg` | 1080×1080 | 1:1 | ✅ |
| `fb-03-capa-1640x624.jpg` | 1640×624 | — | ❌ capa da Página, manual |

Os cards `ig-03` … `ig-07` formam **um carrossel de 5 cards** quando publicados
juntos (manualmente — o publisher do cron envia só uma imagem por post), mas
cada um também funciona como post avulso.

## Como regerar

As artes não são editadas à mão: saem de HTML versionado em
`scripts/social-art/`, com a paleta navy/gold, o símbolo vetorial e a Fraunces de
`components/brand/lead-bellus-logo.tsx` — a mesma identidade da landing page.

```bash
npm i --no-save playwright-core     # não é dependência do app
node scripts/social-art/render.mjs  # regrava public/social/*.jpg
```

Para mudar um texto ou criar uma peça nova, edite
`scripts/social-art/boards.html` (cada `.board[data-id]` vira um arquivo com o
nome do `data-id`) ou `scripts/social-art/style.css`, e rode o comando de novo.

## Antes de publicar qualquer copy nova

Passe o texto pela mesma checagem de compliance que o produto aplica —
`denylistHits()` em `lib/ai/prompts.ts`. Sem promessa de resultado, sem preço
fechado de procedimento, sem depoimento não autorizado.
