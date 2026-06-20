# LeadBellus Google Ads Import Pack

Created: 2026-06-20

This pack is intentionally separate from the landing page work. It prepares a Search-only launch that can be reviewed in Google Ads Editor before publishing.

## Files

- `01_search_keywords.csv`: campaign, ad groups, phrase/exact keywords.
- `02_responsive_search_ads.csv`: responsive search ads with 10-12 headlines and 4 descriptions per ad group.
- `03_negative_keywords.csv`: campaign-level negative keywords.
- `04_assets_manual.csv`: sitelinks, callouts, and structured snippet values to add manually or map in Editor.
- `05_launch_checklist.md`: what to check before posting changes.

## How To Import

1. Open Google Ads Editor.
2. Click `Get recent changes` first.
3. Use `Account > Import > From file...` or `Paste text`.
4. Import one CSV at a time.
5. Review column mappings. If Editor marks a column as `Not importing`, map it manually.
6. Keep all imported changes as `Paused` until conversion tracking is confirmed.
7. Review policy warnings before posting.

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
