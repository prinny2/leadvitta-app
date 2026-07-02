-- ============================================================
-- RespondeEstética IA — schema + Row Level Security
-- Rode este arquivo no SQL Editor do seu projeto Supabase.
-- Pode rodar novamente com segurança (idempotente).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Perfil da clínica / DNA da Clínica (1 linha por usuário) ----------
create table if not exists public.clinicas (
  id            uuid primary key references auth.users (id) on delete cascade,
  nome_clinica  text not null default '',
  cidade        text not null default '',
  whatsapp      text not null default '',
  tom_padrao    text not null default 'acolhedor',
  procedimentos text[] not null default '{}',
  formalidade   int not null default 40,
  como_chamar   text not null default 'linda',
  cta_preferido text not null default 'marcar uma avaliação',
  onboarded     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Colunas novas (caso a tabela já exista de uma versão anterior):
alter table public.clinicas add column if not exists formalidade int not null default 40;
alter table public.clinicas add column if not exists como_chamar text not null default 'linda';
alter table public.clinicas add column if not exists cta_preferido text not null default 'marcar uma avaliação';
alter table public.clinicas add column if not exists onboarded boolean not null default false;

alter table public.clinicas enable row level security;

drop policy if exists "clinicas_select_own" on public.clinicas;
create policy "clinicas_select_own" on public.clinicas
  for select using (auth.uid() = id);

drop policy if exists "clinicas_insert_own" on public.clinicas;
create policy "clinicas_insert_own" on public.clinicas
  for insert with check (auth.uid() = id);

drop policy if exists "clinicas_update_own" on public.clinicas;
create policy "clinicas_update_own" on public.clinicas
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- Histórico de respostas geradas ----------
create table if not exists public.historico_respostas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  tipo       text not null default 'gerador',
  contexto   jsonb not null default '{}'::jsonb,
  respostas  jsonb not null default '[]'::jsonb,
  favorito   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.historico_respostas add column if not exists favorito boolean not null default false;

alter table public.historico_respostas enable row level security;

drop policy if exists "hist_select_own" on public.historico_respostas;
create policy "hist_select_own" on public.historico_respostas
  for select using (auth.uid() = user_id);

drop policy if exists "hist_insert_own" on public.historico_respostas;
create policy "hist_insert_own" on public.historico_respostas
  for insert with check (auth.uid() = user_id);

drop policy if exists "hist_update_own" on public.historico_respostas;
create policy "hist_update_own" on public.historico_respostas
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "hist_delete_own" on public.historico_respostas;
create policy "hist_delete_own" on public.historico_respostas
  for delete using (auth.uid() = user_id);

create index if not exists hist_user_created_idx
  on public.historico_respostas (user_id, created_at desc);

-- ============================================================
-- HÍBRIDO: Firebase é fonte da verdade.
-- Adiciona suporte a espelho aditivo usando firebase_uid + firestore_id.
-- Rode no SQL Editor do Supabase.
-- ============================================================

-- Adiciona colunas para espelho (idempotente)
alter table public.historico_respostas
  add column if not exists firestore_id text,
  add column if not exists firebase_uid text;

-- Índice único por firestore_id para permitir upsert estável a partir do client
create unique index if not exists hist_firestore_id_idx
  on public.historico_respostas (firestore_id)
  where firestore_id is not null;

create index if not exists hist_firebase_uid_idx
  on public.historico_respostas (firebase_uid, created_at desc);

-- Tabela app_historico_respostas (espelho separado, recomendado para Fase 1)
create table if not exists public.app_historico_respostas (
  id            uuid primary key default gen_random_uuid(),
  firestore_id  text unique,
  firebase_uid  text not null,
  tipo          text not null default 'gerador',
  contexto      jsonb not null default '{}'::jsonb,
  respostas     jsonb not null default '[]'::jsonb,
  favorito      boolean not null default false,
  intent        text,
  sentiment     text,
  score         numeric,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.app_historico_respostas enable row level security;

-- Exemplo de políticas (ajuste conforme necessário; atualmente espelho é best-effort)
drop policy if exists "app_hist_select_own" on public.app_historico_respostas;
create policy "app_hist_select_own" on public.app_historico_respostas
  for select using (auth.uid()::text = firebase_uid); -- remove public access; requires Supabase Auth if client reads are needed

drop policy if exists "app_hist_insert" on public.app_historico_respostas;
create policy "app_hist_insert" on public.app_historico_respostas
  for insert with check (false); -- server/service_role only (service_role bypasses RLS)

drop policy if exists "app_hist_update_own" on public.app_historico_respostas;
create policy "app_hist_update_own" on public.app_historico_respostas
  for update using (false) with check (false); -- server/service_role only (service_role bypasses RLS)

create unique index if not exists app_hist_firestore_id_idx
  on public.app_historico_respostas (firestore_id) where firestore_id is not null;

create index if not exists app_hist_firebase_created_idx
  on public.app_historico_respostas (firebase_uid, created_at desc);

-- Tabela app_waitlist (espelho)
create table if not exists public.app_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  plan text not null check (plan in ('pro','premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_waitlist enable row level security;

drop policy if exists "app_waitlist_insert_public" on public.app_waitlist;
create policy "app_waitlist_insert_public" on public.app_waitlist
  for insert with check (true);

-- Tabela app_clinicas (espelho opcional)
create table if not exists public.app_clinicas (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text unique not null,
  nome_clinica text,
  cidade text,
  tom_padrao text,
  procedimentos text[],
  formalidade int,
  como_chamar text,
  cta_preferido text,
  onboarded boolean,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.app_clinicas enable row level security;
