# Alcance e tempo por seção (GA4)

Mede quantas pessoas chegam a cada seção da landing (`/`) e do onboarding
(`/onboarding`) e quanto tempo ficam nela. Vai **só para o GA4** (helper
`lib/analytics/ga4-event.ts`); o Meta Pixel não recebe, para não poluir a
otimização dos anúncios nem a cota de eventos personalizados.

Código: regras em `lib/analytics/section-tracking.ts` (testes em
`tests/lib/section-tracking.test.ts`), observador em
`components/section-tracker.tsx`. Cada seção medida tem
`data-track-section="<id>"`; os `id` de DOM e as âncoras (`#demo`, `#precos`…)
não mudaram. Sem `NEXT_PUBLIC_GA4_ID` (modo demo) nada é enviado.

## Eventos

| Evento | Parâmetros | Quando |
| --- | --- | --- |
| `section_view` | `content_type`, `content_id` | No máximo 1 vez por seção por visita à página, depois de 1 s seguido com a seção visível. |
| `section_time` | `content_type`, `content_id`, `value` (segundos inteiros), `transport_type: "beacon"` | 1 por seção **já vista** (com `section_view`) e `value ≥ 1`, quando a aba é escondida (`visibilitychange`/`pagehide`) ou a página desmonta (troca de rota). |

- **Visível** = a parte na tela cobre pelo menos min(50% da altura da seção,
  40% da altura da tela), com a aba visível.
- `section_time` soma só o tempo visível desde o último envio: quem sai da aba
  e volta não é contado duas vezes. Teto de 600 s por envio; arredondado para
  segundos.
- Quem só passa rolando (menos de 1 s seguido) não gera `section_time`: o
  tempo dessas passadas só entra se a pessoa depois chegar a ver a seção.
  Assim, quem tem `section_time` sempre tem `section_view`.
- `content_type` e `content_id` são parâmetros **predefinidos** do GA4: não
  precisam de dimensão personalizada. `value` alimenta a métrica
  `eventValue`.

## Seções

`content_type: "lp"` — landing, na ordem da página:

| `content_id` | Seção |
| --- | --- |
| `hero` | Topo: título, CTA "Colar mensagem e ver 3 respostas grátis" e animação |
| `demo` | Demo "Cole a mensagem. Veja 3 respostas." (`#demo`) |
| `como-funciona` | Três passos (`#como-funciona`) |
| `situacoes` | Chips de situações (preço, achou caro, desconto, medo, dor, sumiu) |
| `precos` | Plano Start + lista de espera Pro/Premium (`#precos`) |
| `confianca` | "Sua equipe no controle de cada mensagem" (4 cartões) |
| `faq` | Dúvidas (`#faq`) |
| `cta-final` | "Teste com a próxima mensagem que chegar." |
| `rodape` | Rodapé (chegou ao fim da página) |

`content_type: "onboarding"`:

| `content_id` | Bloco |
| --- | --- |
| `colar` | Caixa para colar a mensagem e testar (depois do resultado vira a linha "Mensagem: … · Trocar") |
| `respostas` | As 3 respostas geradas + caixa "E agora?" |
| `tom` | "No tom da sua clínica" (nome, como chamar, jeito de falar) — só aparece se a pessoa abrir |
| `planos` | Planos (Start + lista de espera) — só aparece quando os planos são abertos (`?plan=`, `?aba=planos`, `?checkout=cancelado`, testes esgotados ou "Ver planos"), então mede quem abriu os planos; com `?aba=planos` ou `?checkout=cancelado` vem **acima** de `colar` |

Duas seções podem contar ao mesmo tempo (ex.: o fim de uma e o começo da
outra), então somar o tempo de todas não dá o tempo na página.

## Como ler (GA4 Data API / Windsor.ai)

| O quê | Windsor | GA4 Data API |
| --- | --- | --- |
| Evento | `event_name` | `eventName` |
| Página | `content_type` | `contentType` |
| Seção | `content_id` | `contentId` |
| Vezes | `event_count` | `eventCount` |
| Pessoas | `active_users` | `activeUsers` |
| Segundos | `event_value` | `eventValue` |
| Caminho | `page_path` | `pagePath` |

- **Alcance por seção**: `event_name = section_view`, `active_users` por
  `content_type` + `content_id`. Para a %, dividir pelo `active_users` de
  `event_name = page_view` com `page_path = /` (LP) ou `/onboarding`
  (onboarding) — quem abriu a página.
- Não usar `hero`/`colar` como base: ficam abaixo do real (o rastreio começa
  quando o navegador folga, até ~2 s, e a seção precisa de 1 s seguido), então
  quem clica logo no CTA (`#demo`) ou chega por âncora (sitelink
  `/#precos`) não conta no `hero` e as outras seções passariam de 100%. No
  onboarding, `planos` pode vir antes de `colar`.
- **Tempo total**: `event_name = section_time`, `event_value` por seção.
- **Tempo médio de quem viu**: `event_value` de `section_time` ÷
  `active_users` de `section_view`, por seção (o tempo só vem de quem viu).

Limitações: o tempo antes do rastreio começar não entra (o `hero` fica um
pouco abaixo do real); envios na saída da página podem se perder em parte
(rede ruim, navegador fechado à força).
