// Abstração de dados do lado do cliente.
// - Com Supabase configurado: lê/escreve nas tabelas (RLS isola por usuário).
// - Sem Supabase (modo demonstração): usa o localStorage do navegador.

import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { clinicaVazia, type Clinica, type HistoricoItem } from "@/lib/types";

const LS_CLINICA = "re_clinica";
const LS_HISTORICO = "re_historico";

// ---------------- Clínica (configurações / DNA) ----------------
export async function getClinica(): Promise<Clinica> {
  if (isSupabaseConfigured) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return clinicaVazia;
    const { data } = await supabase
      .from("clinicas")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (!data) return clinicaVazia;
    return {
      nome_clinica: data.nome_clinica ?? "",
      cidade: data.cidade ?? "",
      whatsapp: data.whatsapp ?? "",
      tom_padrao: data.tom_padrao ?? "acolhedor",
      procedimentos: data.procedimentos ?? [],
      formalidade: data.formalidade ?? 40,
      como_chamar: data.como_chamar ?? "linda",
      cta_preferido: data.cta_preferido ?? "marcar uma avaliação",
      onboarded: data.onboarded ?? false,
    };
  }
  if (typeof window === "undefined") return clinicaVazia;
  const raw = window.localStorage.getItem(LS_CLINICA);
  return raw ? { ...clinicaVazia, ...JSON.parse(raw) } : clinicaVazia;
}

export async function saveClinica(c: Clinica): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");
    const { error } = await supabase.from("clinicas").upsert({
      id: user.id,
      ...c,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return;
  }
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_CLINICA, JSON.stringify(c));
}

// ---------------- Histórico ----------------
export async function listHistorico(): Promise<HistoricoItem[]> {
  if (isSupabaseConfigured) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from("historico_respostas")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);
    return (data ?? []) as HistoricoItem[];
  }
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LS_HISTORICO);
  return raw ? (JSON.parse(raw) as HistoricoItem[]) : [];
}

export async function addHistorico(
  item: Pick<HistoricoItem, "tipo" | "contexto" | "respostas">
): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("historico_respostas").insert({
      user_id: user.id,
      tipo: item.tipo,
      contexto: item.contexto,
      respostas: item.respostas,
    });
    return;
  }
  if (typeof window === "undefined") return;
  const list = await listHistorico();
  const novo: HistoricoItem = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now()),
    created_at: new Date().toISOString(),
    favorito: false,
    ...item,
  };
  const atualizado = [novo, ...list].slice(0, 200);
  window.localStorage.setItem(LS_HISTORICO, JSON.stringify(atualizado));
}

export async function toggleFavorito(
  id: string,
  favorito: boolean
): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("historico_respostas")
      .update({ favorito })
      .eq("id", id)
      .eq("user_id", user.id);
    return;
  }
  if (typeof window === "undefined") return;
  const list = await listHistorico();
  const atualizado = list.map((i) => (i.id === id ? { ...i, favorito } : i));
  window.localStorage.setItem(LS_HISTORICO, JSON.stringify(atualizado));
}
