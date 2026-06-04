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
