import "server-only";

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AppClinica, AppHistoricoResposta, AppWaitlist } from './types';

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  '';

let supabaseServer: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  // Server-side mirror client. Prefer service credentials so upserts are not blocked by RLS.
  supabaseServer = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
}

export { supabaseServer };

export type { AppClinica, AppHistoricoResposta, AppWaitlist } from './types';

function withoutUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

/**
 * Server-side upsert for clinic profile (additive mirror).
 * Firebase/Firestore remains the source of truth.
 */
export async function upsertClinica(item: AppClinica) {
  if (!supabaseServer) return { ok: false, reason: 'no-supabase' };

  try {
    const now = new Date().toISOString();
    const { error } = await supabaseServer
      .from('app_clinicas')
      .upsert(
        withoutUndefined({
          firebase_uid: item.firebase_uid,
          nome_clinica: item.nome_clinica,
          cidade: item.cidade,
          tom_padrao: item.tom_padrao,
          procedimentos: item.procedimentos,
          formalidade: item.formalidade,
          como_chamar: item.como_chamar,
          cta_preferido: item.cta_preferido,
          onboarded: item.onboarded,
          updated_at: now,
        }),
        { onConflict: 'firebase_uid' }
      );

    if (error) throw error;
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}

/**
 * Server-side write for historico (used by API routes).
 * Uses firestore_id for stable matching when one exists; otherwise inserts a
 * new generation row for analytics/history.
 */
export async function upsertHistorico(item: AppHistoricoResposta) {
  if (!supabaseServer) return { ok: false, reason: 'no-supabase' };

  try {
    const now = new Date().toISOString();
    const payload = withoutUndefined({
      firestore_id: item.firestore_id,
      firebase_uid: item.firebase_uid,
      tipo: item.tipo,
      contexto: item.contexto,
      respostas: item.respostas,
      favorito: item.favorito ?? false,
      intent: item.intent ?? null,
      sentiment: item.sentiment ?? null,
      score: item.score ?? null,
      created_at: item.created_at ?? now,
      updated_at: now,
    });

    const query = supabaseServer.from('app_historico_respostas');
    const { error } = item.firestore_id
      ? await query.upsert(payload, { onConflict: 'firestore_id' })
      : await query.insert(payload);

    if (error) throw error;
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}

/**
 * Server-side upsert for waitlist (additive mirror).
 */
export async function upsertWaitlist(item: AppWaitlist) {
  if (!supabaseServer) return { ok: false, reason: 'no-supabase' };

  try {
    const now = new Date().toISOString();
    const email = item.email.trim().toLowerCase();
    // `id` is a uuid with a DB default; the idempotency key is `email`, which
    // carries the unique index. Sending the e-mail as `id` failed with 22P02.
    const { error } = await supabaseServer
      .from('app_waitlist')
      .upsert(
        {
          email,
          plan: item.plan,
          created_at: item.created_at ?? now,
          updated_at: now,
        },
        { onConflict: 'email' }
      );

    if (error) throw error;
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}
