# LeadBellus Google Ads Import Pack

Created: 2026-06-20
Updated: 2026-06-21 with automated pack generation.

Start here before importing: `../ADS_COMMAND_CENTER.md`.

This pack is intentionally separate from the landing page work. It prepares a Search-only launch that can be reviewed in Google Ads Editor before publishing.

## Regenerate

Run this from the project root whenever campaign copy, keywords, negatives, budget, UTM structure, or GA4 conversion needs change:

```bash
npm run ads:generate
```

The generator validates responsive search ad limits before writing the CSVs, then creates the import files plus GA4 conversion docs (`07_ga4_conversions.md`). This is the central automation for Ads + GA4 in Google Ads Editor.

## Files

- `01_search_keywords.csv`: campaign, ad groups, phrase/exact keywords.
- `02_responsive_search_ads.csv`: responsive search ads with 10-12 headlines and 4 descriptions per ad group.
- `03_negative_keywords.csv`: campaign-level negative keywords.
- `04_assets_manual.csv`: sitelinks, callouts, and structured snippet values to add manually or map in Editor.
- `05_launch_checklist.md`: what to check before posting changes.
- `06_automation_rules.md`: rules to configure in Google Ads after conversion tracking is confirmed.
- `07_ga4_conversions.md`: full instructions to link GA4 property `G-223KR63TS8` and import conversions (sign_up, begin_checkout, purchase, generate) for bidding/optimization.

## Campaign Structure

- `Respostas WhatsApp`: core WhatsApp response intent.
- `Objecoes E Preco`: price objections and discount conversations.
- `Automacao E IA`: software/AI discovery intent.
- `Roteiros E Conversao`: Grok-expanded scripts, templates, and conversion keywords.

## How To Import (Ads Structure)

1. Open Google Ads Editor.
2. Click `Get recent changes` first.
3. Use `Account > Import > From file...` or `Paste text`.
4. Import one CSV at a time (start with 01_search_keywords.csv).
5. Review column mappings.
6. Keep all imported changes as `Paused`.
7. Review policy warnings before posting.

## GA4 + Conversions (separate from structure import)

After structure import:
- Follow `07_ga4_conversions.md` exactly.
- Link GA4 property and import the listed conversions.
- Set the primary conversion (purchase) for the campaign bidding.
- This enables GA4-driven optimization and automated rules.

Google's own Editor flow supports CSV import, header review, import, and keeping/rejecting proposed changes. See:

- https://support.google.com/google-ads/editor/answer/30564
- https://support.google.com/google-ads/answer/10702525

## Launch Guardrails

- Search only. No Display. No remarketing in this first launch.
- Do not use fake testimonials, names, photos, star ratings, or unverified claims.
- Do not use "7 dias gratis", "agenda sozinho", "15x", or guaranteed revenue language.
- Use the campaign URL with UTMs:
  `https://leadbellus.com.br/campanha/whatsapp-estetica?utm_source=google&utm_medium=cpc&utm_campaign=br_search_whatsapp_estetica&utm_content={creative}&utm_term={keyword}`

## Delegation Boundaries

Gemini and Grok should not edit files in `app/`, `components/`, `lib/`, or `.next` while this pack is being reviewed. Their tasks are written in `../agent_briefs/`.

See `../agent_briefs/AGENT_ROLES.md` for the operating split between Codex, Gemini, and Grok.
