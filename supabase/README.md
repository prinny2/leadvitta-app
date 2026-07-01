# Supabase schema rollout

This folder contains two Supabase tracks:

- `schema.sql`: the current runtime schema used by the Firebase/Supabase mirror.
- `migrations/20260701_supabase_production_canonical_schema.sql`: the canonical
  Supabase-first production target for a later cutover.

Do not apply the canonical migration directly to the current production database
without a backup and a rehearsal in a fresh Supabase project or database branch.
It is additive, but the app is not cut over to those tables yet.

## Current runtime truth

The app still writes operational data through Firebase and mirrors selected data
to Supabase tables such as:

- `app_clinicas`
- `app_historico_respostas`
- `app_waitlist`

Stripe billing sync is still backed by server-side Firebase/Firestore code. The
canonical `profiles`, `subscriptions`, `messages`, `patients`, `appointments`,
`usage`, `webhook_events`, and `audit_logs` tables are the target structure for a
clean Supabase-first version.

## Safe rollout order

1. Create a new Supabase project or disposable database branch.
2. Apply the canonical migration there first.
3. Seed a small clinic, patient, message, subscription, and webhook event.
4. Validate RLS with anon/authenticated users and service-role backend writes.
5. Write a backfill from Firebase/current `app_*` mirrors into the canonical
   tables.
6. Update app code and generated TypeScript types to use the canonical tables.
7. Run app build/tests and a Stripe webhook replay in the staging project.
8. Only then plan a production cutover window.

## Notes

- The `subscription_plan` enum includes `start` because LeadBellus currently sells
  the Start plan.
- The `subscription_status` enum includes Stripe states beyond the first draft:
  `incomplete_expired`, `unpaid`, and `paused`.
- `webhook_events` and `audit_logs` intentionally have RLS enabled without public
  policies. Use service-role backend code only.
- The `patients` phone uniqueness is partial, so blank phone records do not block
  multiple imported leads during cleanup/backfill.
