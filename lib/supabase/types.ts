export type AppHistoricoResposta = {
  id?: string;
  firestore_id?: string;   // Firestore doc ID (stable identifier for upserts + client updates)
  firebase_uid: string;
  tipo: string;
  contexto: Record<string, unknown>;
  respostas: any[];
  favorito: boolean;
  intent?: string | null;
  sentiment?: string | null;
  score?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type AppClinica = {
  id?: string;
  firebase_uid: string;
  nome_clinica: string;
  cidade?: string;
  tom_padrao?: string;
  procedimentos?: string[];
  formalidade?: number;
  como_chamar?: string;
  cta_preferido?: string;
  onboarded?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type AppWaitlist = {
  id?: string;
  email: string;
  plan: 'pro' | 'premium';
  created_at?: string;
  updated_at?: string;
};
