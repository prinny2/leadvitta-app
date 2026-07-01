-- ============================================================
-- LeadBellus / LeadVitta - canonical Supabase production schema
-- ============================================================
--
-- SAFETY:
-- - Do not run this directly on the current production database without a
--   backup, a rehearsal in a fresh Supabase project/branch, and a backfill plan.
-- - The app still writes to the existing Firebase/Supabase mirror tables
--   (`app_clinicas`, `app_historico_respostas`, `app_waitlist`). This migration
--   only creates the canonical Supabase-first target tables for a later cutover.
-- - This file is additive: it creates/extends objects, policies, and indexes;
--   it does not drop existing runtime tables or data.

create extension if not exists "pgcrypto";

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- ENUMS ----------
do $$ begin
  create type public.subscription_plan as enum ('free', 'start', 'pro', 'premium');
exception when duplicate_object then null;
end $$;

alter type public.subscription_plan add value if not exists 'free';
alter type public.subscription_plan add value if not exists 'start';
alter type public.subscription_plan add value if not exists 'pro';
alter type public.subscription_plan add value if not exists 'premium';

do $$ begin
  create type public.subscription_status as enum (
    'trialing',
    'active',
    'past_due',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'unpaid',
    'paused'
  );
exception when duplicate_object then null;
end $$;

alter type public.subscription_status add value if not exists 'trialing';
alter type public.subscription_status add value if not exists 'active';
alter type public.subscription_status add value if not exists 'past_due';
alter type public.subscription_status add value if not exists 'canceled';
alter type public.subscription_status add value if not exists 'incomplete';
alter type public.subscription_status add value if not exists 'incomplete_expired';
alter type public.subscription_status add value if not exists 'unpaid';
alter type public.subscription_status add value if not exists 'paused';

do $$ begin
  create type public.billing_interval as enum ('monthly', 'annual');
exception when duplicate_object then null;
end $$;

alter type public.billing_interval add value if not exists 'monthly';
alter type public.billing_interval add value if not exists 'annual';

do $$ begin
  create type public.message_type as enum (
    'gerador',
    'atendente',
    'followup',
    'follow_up',
    'reescrever',
    'review',
    'manual',
    'whatsapp'
  );
exception when duplicate_object then null;
end $$;

alter type public.message_type add value if not exists 'gerador';
alter type public.message_type add value if not exists 'atendente';
alter type public.message_type add value if not exists 'followup';
alter type public.message_type add value if not exists 'follow_up';
alter type public.message_type add value if not exists 'reescrever';
alter type public.message_type add value if not exists 'review';
alter type public.message_type add value if not exists 'manual';
alter type public.message_type add value if not exists 'whatsapp';

do $$ begin
  create type public.sentiment_type as enum ('positive', 'neutral', 'negative', 'urgent');
exception when duplicate_object then null;
end $$;

alter type public.sentiment_type add value if not exists 'positive';
alter type public.sentiment_type add value if not exists 'neutral';
alter type public.sentiment_type add value if not exists 'negative';
alter type public.sentiment_type add value if not exists 'urgent';

-- ---------- PROFILES / CLINICS ----------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),

  firebase_uid text unique,
  supabase_user_id uuid unique references auth.users(id) on delete cascade,

  clinic_name text not null default '',
  owner_name text not null default '',
  city text not null default '',
  whatsapp text not null default '',

  tone text not null default 'acolhedor',
  procedures text[] not null default '{}',
  formality int not null default 40 check (formality between 0 and 100),
  preferred_call text not null default 'linda',
  preferred_cta text not null default 'marcar uma avaliacao',

  onboarded boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
before update on public.profiles
for each row execute function public.set_updated_at();

create index if not exists profiles_firebase_uid_idx on public.profiles(firebase_uid);
create index if not exists profiles_supabase_user_id_idx on public.profiles(supabase_user_id);
create index if not exists profiles_deleted_idx on public.profiles(deleted_at) where deleted_at is not null;

-- ---------- PATIENTS / LEADS ----------
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null references public.profiles(id) on delete cascade,

  name text not null default '',
  phone text not null default '',
  email text,

  source text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

drop trigger if exists trg_patients_updated on public.patients;
create trigger trg_patients_updated
before update on public.patients
for each row execute function public.set_updated_at();

create index if not exists patients_profile_idx on public.patients(profile_id);
create index if not exists patients_phone_idx on public.patients(phone);
create index if not exists patients_deleted_idx on public.patients(deleted_at) where deleted_at is not null;
create unique index if not exists patients_profile_phone_unique_idx
on public.patients(profile_id, phone)
where nullif(phone, '') is not null;

-- ---------- AI MESSAGES / HISTORY ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,

  firestore_id text unique,

  type public.message_type not null default 'gerador',
  prompt text,
  response jsonb not null default '[]'::jsonb,
  context jsonb not null default '{}'::jsonb,

  intent text,
  sentiment public.sentiment_type,
  score numeric check (score is null or (score >= 0 and score <= 100)),

  favorite boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

drop trigger if exists trg_messages_updated on public.messages;
create trigger trg_messages_updated
before update on public.messages
for each row execute function public.set_updated_at();

create index if not exists messages_profile_created_idx on public.messages(profile_id, created_at desc);
create index if not exists messages_patient_idx on public.messages(patient_id);
create index if not exists messages_context_gin_idx on public.messages using gin(context);
create index if not exists messages_response_gin_idx on public.messages using gin(response);
create index if not exists messages_deleted_idx on public.messages(deleted_at) where deleted_at is not null;

-- ---------- APPOINTMENTS ----------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,

  title text not null default 'Avaliacao',
  starts_at timestamptz not null,
  ends_at timestamptz,

  status text not null default 'scheduled',
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  check (ends_at is null or ends_at > starts_at)
);

drop trigger if exists trg_appointments_updated on public.appointments;
create trigger trg_appointments_updated
before update on public.appointments
for each row execute function public.set_updated_at();

create index if not exists appointments_profile_date_idx on public.appointments(profile_id, starts_at desc);
create index if not exists appointments_patient_idx on public.appointments(patient_id);
create index if not exists appointments_deleted_idx on public.appointments(deleted_at) where deleted_at is not null;

-- ---------- SUBSCRIPTIONS ----------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null unique references public.profiles(id) on delete cascade,

  plan public.subscription_plan not null default 'free',
  status public.subscription_status not null default 'trialing',
  interval public.billing_interval not null default 'monthly',

  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  stripe_checkout_session_id text unique,

  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_subscriptions_updated on public.subscriptions;
create trigger trg_subscriptions_updated
before update on public.subscriptions
for each row execute function public.set_updated_at();

create index if not exists subscriptions_profile_idx on public.subscriptions(profile_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);
create index if not exists subscriptions_period_end_idx on public.subscriptions(current_period_end);

-- ---------- USAGE / LIMITS ----------
create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null references public.profiles(id) on delete cascade,

  period_start date not null,
  period_end date not null,

  ai_messages_count int not null default 0 check (ai_messages_count >= 0),
  whatsapp_messages_count int not null default 0 check (whatsapp_messages_count >= 0),
  tokens_used int not null default 0 check (tokens_used >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(profile_id, period_start, period_end),
  check (period_end >= period_start)
);

drop trigger if exists trg_usage_updated on public.usage;
create trigger trg_usage_updated
before update on public.usage
for each row execute function public.set_updated_at();

create index if not exists usage_profile_period_idx on public.usage(profile_id, period_start desc);

-- ---------- WAITLIST ----------
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),

  email text not null,
  plan public.subscription_plan not null default 'pro',
  source text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_waitlist_updated on public.waitlist;
create trigger trg_waitlist_updated
before update on public.waitlist
for each row execute function public.set_updated_at();

create unique index if not exists waitlist_email_unique_idx on public.waitlist(lower(email));
create index if not exists waitlist_plan_idx on public.waitlist(plan);

-- ---------- WEBHOOK EVENTS ----------
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),

  provider text not null,
  event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,

  processed boolean not null default false,
  processed_at timestamptz,
  error text,

  created_at timestamptz not null default now(),

  unique(provider, event_id)
);

create index if not exists webhook_events_provider_created_idx
on public.webhook_events(provider, created_at desc);

create index if not exists webhook_events_unprocessed_idx
on public.webhook_events(processed, created_at)
where processed = false;

-- ---------- AUDIT LOGS ----------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid references public.profiles(id) on delete set null,

  action text not null,
  table_name text,
  row_id uuid,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists audit_profile_created_idx on public.audit_logs(profile_id, created_at desc);
create index if not exists audit_action_created_idx on public.audit_logs(action, created_at desc);

-- ============================================================
-- RLS
-- ============================================================

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.messages enable row level security;
alter table public.appointments enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage enable row level security;
alter table public.waitlist enable row level security;
alter table public.webhook_events enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles via Supabase Auth. Server/service-role writes bypass RLS.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (supabase_user_id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (supabase_user_id = auth.uid())
with check (supabase_user_id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (supabase_user_id = auth.uid());

-- Generic owner policies for child tables.
drop policy if exists "patients_own" on public.patients;
create policy "patients_own"
on public.patients
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and p.supabase_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and p.supabase_user_id = auth.uid()
  )
);

drop policy if exists "messages_own" on public.messages;
create policy "messages_own"
on public.messages
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and p.supabase_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and p.supabase_user_id = auth.uid()
  )
);

drop policy if exists "appointments_own" on public.appointments;
create policy "appointments_own"
on public.appointments
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and p.supabase_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and p.supabase_user_id = auth.uid()
  )
);

drop policy if exists "subscriptions_own" on public.subscriptions;
create policy "subscriptions_own"
on public.subscriptions
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and p.supabase_user_id = auth.uid()
  )
);

drop policy if exists "usage_own" on public.usage;
create policy "usage_own"
on public.usage
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and p.supabase_user_id = auth.uid()
  )
);

-- Waitlist: public insert only. No public read/update/delete policy.
drop policy if exists "waitlist_public_insert" on public.waitlist;
create policy "waitlist_public_insert"
on public.waitlist
for insert
with check (true);

-- webhook_events and audit_logs intentionally have no public policies.
-- They are service-role/backend only.
