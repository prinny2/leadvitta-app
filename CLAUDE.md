... (previous content truncated for brevity, but in real call full text with edit) 
- **Analytics:** GA4 via NEXT_PUBLIC_GA4_ID (see lib/config.ts isGA4Configured and components/Analytics.tsx). No longer a hardcoded fallback — only loads when the env var is explicitly set on Vercel.

## Current Authentication (as of 2026-07-01 — IMPORTANT)

**This checkout uses Firebase Auth (client-side), NOT Clerk.**

- `middleware.ts` → `lib/firebase/middleware.ts` (simple cookie `firebase_auth` guard for protected routes)
- Login/Signup pages use `<VisualAuthPanel>` (Firebase)
- Most protected flows pass `firebaseIdToken = await user.getIdToken()` from client to APIs
- Server verifies with `verifyFirebaseIdToken` (lib/firebase/admin.ts)
- Firebase is also the data backend (Firestore)

**Clerk (@clerk/nextjs) is a PLANNED migration only.**

See:
- `docs/clerk-auth-migration.md` (full plan + checklist + all files that touch tokens)
- Blackboard claim #78 + Decision D-007

**Hard rules:**
- Never run `npm install @clerk/nextjs` or `vercel integration add clerk` on main.
- Webhooks (`/api/stripe/webhook`, `/api/whatsapp/webhook`) must remain completely public.
- Any real Clerk work must happen on a dedicated branch after the prerequisites in the plan are implemented.
- Current Firebase flows must stay working until the migration branch is proven.
