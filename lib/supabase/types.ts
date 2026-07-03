import type { Clinica, TipoHistorico } from "@/lib/types";

export type AppHistoricoResposta = {
  id?: string;
  firestore_id?: string;   // Firestore doc ID (stable identifier for upserts + client updates)
  firebase_uid: string;
  tipo: TipoHistorico;
  contexto: Record<string, unknown>;
  respostas: string[];
  favorito?: boolean;
  intent?: string | null;
  sentiment?: string | null;
  score?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type AppClinica = Omit<
  Partial<Clinica>,
  "whatsapp" | "whatsapp_channel_key" | "zapi_instance_id" | "zapi_token" | "zapi_client_token"
> & {
  id?: string;
  firebase_uid: string;
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
