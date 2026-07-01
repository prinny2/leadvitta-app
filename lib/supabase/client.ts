import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // We don't use Supabase Auth — Firebase is source
    },
  });
}

export { supabaseClient };

/**
 * Best-effort client-side mirror for historico.
 * Uses firestore_id as the conflict key so favorites and updates work reliably.
 */
export async function mirrorHistoricoClient(item: {
  firestore_id?: string;
  firebase_uid: string;
  tipo: string;
  contexto: any;
  respostas: any;
  favorito: boolean;
  intent?: string | null;
  sentiment?: string | null;
  score?: number | null;
  created_at?: string;
}) {
  if (!supabaseClient) return;

  try {
    const payload = {
      firestore_id: item.firestore_id,
      firebase_uid: item.firebase_uid,
      tipo: item.tipo,
      contexto: item.contexto,
      respostas: item.respostas,
      favorito: item.favorito ?? false,
      intent: item.intent ?? null,
      sentiment: item.sentiment ?? null,
      score: item.score ?? null,
      created_at: item.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Upsert on firestore_id so the row can be found later by client code (toggleFavorito etc.)
    await supabaseClient
      .from('app_historico_respostas')
      .upsert(payload, {
        onConflict: 'firestore_id',
      });
  } catch (err) {
    // Silent best-effort mirror
    console.debug('[supabase client] historico mirror skipped:', (err as Error)?.message);
  }
}
