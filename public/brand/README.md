# LeadBellus — pacote de marca (campanha Google Ads)

Identidade da campanha gerada a partir do handoff de design `_export.dc.html`
("Google ads campaign logos"). **Não substitui** a marca atual do app
(`app/icon.svg`, `public/favicon.ico`, `components/logo.tsx`) — é um conjunto
adicional para anúncios. Fonte vetorial reproduzível: `components/brand/lead-bellus-logo.tsx`.

## Identidade
- **Navy (ink):** `#07101e` · **Navy (gradiente fundo):** `linear-gradient(160deg,#0a1526,#06101c)`
- **Gold (accent):** `#C9A060`
- **Light (fundo):** `#FBF8F2` · **Light (texto):** `#F4EFE6`
- **Fonte do wordmark:** Fraunces 600, `letter-spacing: -0.01em` (`fonts/Fraunces.ttf`)
- **Símbolo:** balão de conversa (traço) + chama (preenchida)

## Arquivos
| Arquivo | Tamanho | Uso |
|---|---|---|
| `lb-1x1-navy.png` / `lb-1x1-light.png` | 1200×1200 | Logo **quadrado (1:1)** — Google Ads "Logo (1:1)", perfis, avatar |
| `lb-4x1-navy.png` / `lb-4x1-light.png` | 1200×300 | Logo **paisagem (4:1)** — Google Ads "Logo (paisagem)", cabeçalhos |
| `lb-icon-512.png` | 512×512 | Ícone de app (tile navy arredondado + símbolo gold) |
| `lb-favicon-48/32/16.png` | 48/32/16 | Favicons |
| `lb-symbol-gold.png` / `lb-symbol-navy.png` | símbolo | Marca isolada (sem wordmark) |
| `fonts/Fraunces.ttf` | — | Fonte do wordmark (OFL) |

> **navy** = versão para fundos escuros (símbolo+texto claros sobre navy).
> **light** = versão para fundos claros (traço navy, chama gold, texto navy).

## Google Ads — onde usar
- **Logo (1:1)** → `lb-1x1-*.png` · **Logo (paisagem/4:1)** → `lb-4x1-*.png`.
- Prefira a versão **navy** em criativos escuros e **light** em criativos claros.
- Para imagens de campanha use também os refs/criativos do bundle original.

## Em código (React)
```tsx
import { LeadBellusLogo, LeadBellusSymbol, LeadBellusAppIcon } from "@/components/brand/lead-bellus-logo";

<LeadBellusLogo variant="navy" symbolSize={48} wordSize={32} />   // lockup horizontal
<LeadBellusLogo variant="light" stack symbolSize={120} wordSize={60} /> // 1:1 empilhado
<LeadBellusAppIcon size={64} />                                    // ícone de app
<LeadBellusSymbol size={32} variant="light" />                    // só o símbolo
```

Para o wordmark bater com os PNGs, carregue **Fraunces** (via `fonts/Fraunces.ttf`
com `@font-face`, ou Google Fonts `Fraunces:opsz,wght@9..144,600`).
