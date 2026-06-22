# LeadBellus Ads Agent Roles

Use this file to coordinate Codex, Gemini, and Grok during the Search Ads launch.

## Fixed Decisions

- GA4 Measurement ID stays `G-223KR63TS8`.
- Firebase web config stays pointed to project `leadvitta-app`.
- `leadvitta-app.firebaseapp.com` is the Firebase Auth domain and should not be replaced just because preview blocks external URLs.
- Google Ads imports stay paused until conversion tracking is confirmed in the Ads account.

## Codex

Codex owns repo changes and operational integration:

- update Ads import CSVs under `ads/google_ads_editor/`;
- keep tracking IDs and public Firebase config stable in code;
- check CSV shape, character limits, and git status;
- implement landing/tracking/auth fixes only when needed;
- avoid editing generated agent result files except to add coordination docs.

## Gemini

Gemini owns visual and compliance QA:

- mobile screenshots and layout checks;
- CTA visibility above the fold;
- copy consistency, especially `5 respostas gratis`;
- contrast, sticky CTA behavior, footer/legal visibility;
- policy red flags in visual claims, testimonials, images, and UI.

Gemini should write findings to `ads/agent_briefs/GEMINI_VISUAL_QA_RESULT.md`.

## Grok

Grok owns market and keyword research:

- high-intent keyword ideas;
- negative keyword filters;
- responsive search ad headline and description alternatives;
- search-term themes to monitor in the first 48 hours;
- competitor/market angle checks without changing product code.

Grok should write findings to `ads/agent_briefs/GROK_MARKET_SCAN_RESULT.md`.
Keep Grok updated whenever campaign, positioning, keyword, negative keyword,
offer, or ad-copy decisions change. New Ads work should either update the Grok
result file or add a short handoff note that tells Grok what changed and what
needs fresh market/keyword review.

## Launch Loop

1. Grok expands keyword/copy inputs.
2. Gemini validates landing page and policy risk.
3. Codex converts approved inputs into importable files.
4. Human reviews in Google Ads Editor.
5. Campaign stays paused until signup and checkout conversions are verified.
