# LeadBellus Ads Command Center

Last consolidated by: Codex
Last review: 2026-06-20
Status: ready for Google Ads Editor import review, paused by default

This file is the source of truth for the first Google Ads launch. Treat the Gemini/Grok result files as inputs, not as launch instructions. If another file conflicts with this one, follow this file.

## Launch Decision

- Campaign type: Search only.
- First launch: no Display, no remarketing, no custom health/interest audiences.
- Offer: `5 respostas gratis`, `sem cartao`.
- Product promise: help clinics generate WhatsApp response suggestions to review, adjust, copy, and send.
- Campaign must stay paused until signup and checkout/start conversion tracking is confirmed inside Google Ads.

## Do Not Use

- `7 dias gratis`
- `garantia de 7 dias`
- `15x`
- `agenda sozinho`
- `agenda cheia`
- fake testimonials, fake names, fake photos, fake star ratings, or unverified proof
- medical/aesthetic outcome promises
- guaranteed revenue, booking, or conversion promises

## Import These Files

Use Google Ads Editor. Click `Get recent changes` before importing anything.

1. `ads/google_ads_editor/01_search_keywords.csv`
   - 39 keyword rows.
   - 4 ad groups: `Respostas WhatsApp`, `Objecoes E Preco`, `Automacao E IA`, `Roteiros E Conversao`.
   - Campaign and ad groups import as `Paused`.
   - Budget placeholder: R$50/day.

2. `ads/google_ads_editor/02_responsive_search_ads.csv`
   - 4 paused responsive search ads.
   - 10-12 headlines per ad group.
   - 4 descriptions per ad group.
   - All RSA text is within Google headline/description limits.

3. `ads/google_ads_editor/03_negative_keywords.csv`
   - 43 campaign-level negatives.
   - Filters procedure shoppers, jobs, courses, generic free downloads, medical treatment searches, and unsafe WhatsApp/mod terms.

4. `ads/google_ads_editor/04_assets_manual.csv`
   - Sitelinks, callouts, and structured snippets.
   - Add manually if Google Ads Editor does not map asset columns cleanly.

5. `ads/google_ads_editor/05_launch_checklist.md`
   - Final human review list before posting changes.

## Manual Review In Editor

Before posting changes:

- Confirm campaign status is `Paused`.
- Confirm all ad groups are `Paused`.
- Confirm campaign type is Search.
- Confirm Display Network is off.
- Confirm location is Brazil or the chosen starting states.
- Confirm language is Portuguese.
- Confirm daily budget is R$30-R$50 before enabling.
- Confirm final URLs open and keep UTMs.
- Confirm no policy warning is ignored without reading it.
- Confirm primary conversion is signup or checkout/start, not page view.

## First 48 Hours

Check every 12 hours:

- disapproved ads/assets
- search terms
- CTR by ad group
- CPC average
- signup starts
- checkout starts
- simulator use

Add negatives immediately for:

- people looking for procedures, prices, before/after, medicine, treatment, or diagnosis
- jobs, salary, courses, and internships
- free PDF/download/template-only intent
- generic automated scheduling intent that is not looking for response/copy support

## Delegation

- Codex owns this file and the import CSVs.
- Gemini can run mobile/visual/policy QA and write findings in `ads/agent_briefs/GEMINI_VISUAL_QA_RESULT.md`.
- Grok can suggest market keywords, negatives, and copy in `ads/agent_briefs/GROK_MARKET_SCAN_RESULT.md`.
- Gemini and Grok should not edit `app/`, `components/`, `lib/`, `.next`, or the Google Ads CSVs while Codex is preparing import files.

## Official References

- Google Ads Editor CSV import: https://support.google.com/google-ads/editor/answer/56368
- Responsive search ad text limits: https://support.google.com/google-ads/answer/7684791
- Healthcare and medicines policy: https://support.google.com/adspolicy/answer/176031
- Health in personalized advertising: https://support.google.com/adspolicy/answer/16701855
