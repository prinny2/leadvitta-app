# Analytics & Google Ads — estado do lançamento

**Atualizado:** 2026-06-23  
**Decisão:** conversões Google Ads via **import GA4** (sem tag AW- no código).

## IDs ativos

| Serviço | ID | Onde |
|---------|-----|------|
| GA4 (medição) | `G-223KR63TS8` | `components/Analytics.tsx` + Vercel `NEXT_PUBLIC_GA4_ID` |
| Meta Pixel | `917448661312985` | `NEXT_PUBLIC_META_PIXEL_ID` |
| Google Ads | — | **Não** no código — importar do GA4 no painel |

## Eventos que disparam no site

| Evento GA4 | Origem | Uso Ads |
|------------|--------|---------|
| `sign_up` | cadastro email/Google | **Principal** (CTA "Testar grátis") |
| `purchase` | checkout Stripe sucesso | Secundária (assinatura paga) |
| `initiate_checkout` | botões checkout | Funil |
| `select_plan` | escolha de plano | Funil |
| `waitlist_join` | lista de espera Pro/Premium | Opcional |

`purchase` envia `value`, `currency: BRL`, `transaction_id` (session_id Stripe) e `plan` — habilita ROAS no Ads após import.

## Passos manuais (só admin Google — ~2 min)

### A) Vincular GA4 → Google Ads

GA4 Admin → Vinculações de produtos → Vínculos do Google Ads → Vincular → conta Ads → Personalized advertising → Enviar.

### B) Marcar key events no GA4

Admin → Eventos de chave: `sign_up`, `purchase` (e opcionais do funil).

### C) Importar no Google Ads

Metas → Conversões → + Nova → Importar → Google Analytics 4 (Web) → `sign_up` + `purchase`.

### D) Conversão principal

- Principal: `sign_up`
- Secundária: `purchase`

## Código (branch `fix/analytics-ga4-purchase-roas`)

- Removida tag fantasma `G-LNBEL8GQ11` (formato GA4, não AW-).
- `lib/analytics-purchase.ts` — valor BRL + transaction_id no `purchase`.
- Checkout success URL inclui `plan` e `interval` para valor correto.

## Puxar números (pendente conexão)

Nenhuma API de leitura GA4/Ads ligada ainda. Opções:

1. **Windsor.ai** — API key GA4 + Google Ads
2. **Extensão Chrome DevTools MCP** — offline (desabilitada no Grok)
3. **GA MCP OAuth** — não configurado

Até conectar: painéis GA4/Ads manualmente.

## Deploy

Mudanças de analytics são seguras isoladas (sem tocar whatsapp-zapi / design-sync). Deploy produção após merge desta branch.