# Changelog

## 2026-07-02

### Features

- Improved production sign-in and session handling so account access is more reliable across protected pages.
- Added Supabase mirroring for generated responses to support stronger reporting, recovery, and analytics.
- Added a safe, paused Google Ads Editor automation pack with GA4 conversion setup for campaign launches.
- Added server-side GA4 checkout tracking so subscription conversions are measured more reliably.
- Added Vercel Web Analytics for production traffic visibility.
- Added new campaign logo assets and launch branding for the Navy/Gold/Fraunces visual system.
- Refreshed the landing page with clearer editorial copy, broader audience positioning, and launch-ready campaign sections.
- Added a compliance auditor to help clinics review their text before using it with clients.
- Added support for more procedures, including criolipolysis, radiofrequency, and eyebrow micropigmentation.
- Improved the public simulator with AI fallback support and clearer demo limits, consent, and legal messaging.

### Bug Fixes

- Kept the landing hero inside the mobile viewport to avoid horizontal overflow.
- Improved the mobile footer call-to-action so it is easier to use on small screens.
- Fixed an analytics component syntax issue introduced during refactoring.
- Blocked Stripe checkout attempts that use prices not owned by LeadBellus.
- Fixed Firebase Admin dependency compatibility for server-side API routes.
- Kept Vercel API routes local so production routing remains stable.
- Fixed a paywall usage race condition and tightened Firestore usage rules.

### Chores

- Updated project documentation for Z-API WhatsApp, response variant keys, GA4 configuration, Clerk migration planning, and Cursor Cloud setup.
- Removed disconnected Google Ads and Meta tracking placeholders to prevent stray analytics tags.
- Centralized GA4 configuration so analytics only loads when explicitly configured.
- Added build and dependency housekeeping to reduce Vercel npm warning noise.
- Aligned the package name with the deployed app and infrastructure naming.
- Expanded automated test coverage for WhatsApp routing, free-tier gating, generation, Stripe checkout, Stripe webhooks, and GA4 server tracking.
- Refined campaign palette variables and mobile styling for launch readiness and performance.

### Breaking Changes

- None.
