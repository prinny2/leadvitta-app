import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
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

export type { AppHistoricoResposta, AppWaitlist } from './types';

/**
 * Server-side upsert for historico (used by API routes).
 * Prefers firestore_id for stable matching.
 */
export async function upsertHistorico(item: {
  firestore_id?: string;
  firebase_uid: string;
  tipo: string;
  contexto: any;
  respostas: any;
  favorito?: boolean;
  intent?: string | null;
  sentiment?: string | null;
  score?: number | null;
}) {
  if (!supabaseServer) return { ok: false, reason: 'no-supabase' };

  try {
    const { error } = await supabaseServer
      .from('app_historico_respostas')
      .upsert(
        {
          firestore_id: item.firestore_id,
          firebase_uid: item.firebase_uid,
          tipo: item.tipo,
          contexto: item.contexto,
          respostas: item.respostas,
          favorito: item.favorito ?? false,
          intent: item.intent ?? null,
          sentiment: item.sentiment ?? null,
          score: item.score ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'firestore_id' }
      );

    if (error) throw error;
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}

/**
 * Server-side upsert for waitlist (additive mirror).
 */
export async function upsertWaitlist(item: { email: string; plan: 'pro' | 'premium' }) {
  if (!supabaseServer) return { ok: false, reason: 'no-supabase' };

  try {
    const { error } = await supabaseServer
      .from('app_waitlist')
      .upsert(
        {
          email: item.email,
          plan: item.plan,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );

    if (error) throw error;
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}
