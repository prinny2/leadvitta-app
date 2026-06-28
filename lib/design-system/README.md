# Design System — LeadBellus

Fundação visual do produto. O objetivo é ter **uma única fonte de verdade**
para tokens (cores, tipografia, raios, sombras, movimento) e um **kit de
primitivas** reutilizáveis, evitando hex espalhado e estilos divergentes.

## Estrutura

| Arquivo                       | Papel                                                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `lib/design-system/tokens.ts` | Tokens tipados (paleta, tipografia, raios, sombras, keyframes, animação). **Fonte única de verdade.**                   |
| `tailwind.config.ts`          | Consome `tokens` em `theme.extend` e gera as classes utilitárias.                                                       |
| `app/globals.css`             | Estilos base + utilitários compostos (`.bg-hero`, `.glass-card`, `.text-gold-gradient`, …) construídos sobre os tokens. |
| `components/ui/*`             | Primitivas de UI (`Button`, `Card`, `Input`, `Badge`, …).                                                               |
| `components/ui/index.ts`      | Barrel para importar o kit: `import { Button, Badge } from "@/components/ui";`                                          |

## Tokens

```ts
import { tokens, palette } from "@/lib/design-system/tokens";
```

### Paleta

| Escala          | Uso                                                 |
| --------------- | --------------------------------------------------- |
| `nude`          | Creme quente — fundos (hero, cards).                |
| `brand`         | Verde-escuro da marca — superfícies premium, texto. |
| `gold`          | Dourado — CTAs, destaques, conversão.               |
| `lavender`      | Champagne — texto sobre fundo escuro.               |
| `pain`          | Coral — gancho de dor / perda.                      |
| `ink` / `muted` | Tinta de texto e cinza neutro de apoio.             |

Cada escala vai de `50` (claro) a `900` (escuro). Use sempre as classes do
Tailwind (`bg-brand-500`, `text-gold-700`) — **não** escreva hex de marca à mão.

### Tipografia, raios, sombras, movimento

- **Fontes:** `font-sans` (Inter) e `font-serif` (Fraunces), injetadas via
  `next/font` em `app/layout.tsx`.
- **Raios:** escala padrão do Tailwind + `rounded-2xl` (1rem) e `rounded-3xl`
  (1.5rem).
- **Sombras:** `shadow-soft`, `shadow-card`, `shadow-cta` (tonalizadas de verde
  ou dourado, nunca cinza genérico).
- **Animações:** `animate-fade-in`, `animate-float`, `animate-float-delayed`.

## Kit de primitivas

```tsx
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Badge,
  Input,
} from "@/components/ui";
```

- **`Button`** — variantes `cta | primary | secondary | outline | ghost`,
  tamanhos `sm | md | lg`.
- **`Badge`** — selo/pílula, variantes `pain | brand | gold | neutral`
  (substitui o utilitário `.badge-pain`).
- **`Card` / `CardBody` / `CardTitle`** — superfície base.
- **`Input` / `Textarea` / `Label` / `Select`** — formulários.
- **`Tabs`** — navegação por abas.
- **`StatCard`** — métrica do cockpit (tons `brand | gold | pain`).

## Como mudar o visual

1. Para ajustar **cor/tipografia/sombra/movimento**, edite
   `lib/design-system/tokens.ts`. A mudança propaga via Tailwind para todo o app.
2. Para adicionar uma **nova primitiva**, crie em `components/ui/<nome>.tsx`,
   componha com `cn()` + classes de token, e exporte no barrel `index.ts`.
3. Para um **utilitário composto** (gradiente, glass, etc.), adicione em
   `app/globals.css` usando classes de token via `@apply`.

> Regra: nenhuma cor de marca em hex literal dentro de componentes. Se precisar
> de um valor novo, adicione-o aos tokens primeiro.
