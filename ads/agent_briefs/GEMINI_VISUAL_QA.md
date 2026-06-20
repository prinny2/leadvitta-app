# Gemini Task - Visual QA Only

Owner: Gemini

Do not edit code. Do not run build. Do not touch `.next`.

## Scope

Review the current landing and campaign pages visually after the latest deploy or local preview is provided:

- `https://leadbellus.com.br`
- `https://leadbellus.com.br/campanha/whatsapp-estetica`

## Viewports

- 360 x 740
- 375 x 812
- 390 x 844
- 768 x 1024
- 1366 x 768

## What To Check

- Text clipping or overlap.
- CTA visibility above the fold.
- "5 respostas gratis" consistency.
- No "7 dias gratis".
- No fake testimonial names/photos/stars.
- Section "situacoes comuns" reads naturally and does not look defensive.
- Mobile sticky CTA does not cover footer or legal links.
- Gold text contrast on dark and light backgrounds.

## Output

Write results to:

`ads/agent_briefs/GEMINI_VISUAL_QA_RESULT.md`

Use this format:

- Status: pass / needs changes
- Screens checked:
- Findings:
- Exact section/file if code change is needed:
- Screenshot filenames or links:

Do not change files outside `ads/agent_briefs/`.
