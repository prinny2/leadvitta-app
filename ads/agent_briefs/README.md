# Agent Delegation - Ads Workstream

Goal: split work so other agents do not edit the same app files or run competing builds.

Rules for Gemini and Grok:

- Do not edit `app/`, `components/`, `lib/`, `.next`, `package.json`, or `package-lock.json`.
- Do not run `npm run build` while another agent is validating the repo.
- Put outputs in this folder only.
- If a finding requires code changes, write it as a recommendation with file/section, not a patch.

## Assignments

- Gemini: visual QA and landing-page screenshot review. See `GEMINI_VISUAL_QA.md`.
- Grok: market/search-term expansion and copy review. See `GROK_MARKET_SCAN.md`.
