// Abstração de dados do lado do cliente.
// - Com Firebase configurado: lê/escreve no Firestore (regras isolam por usuário).
// - Sem Firebase (modo demonstração): usa o localStorage do navegador.

import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
} from "firebase/firestore";
import { clinicaVazia, type Clinica, type HistoricoItem } from "@/lib/types";

const LS_CLINICA = "re_clinica";
const LS_HISTORICO = "re_historico";

// ---------------- Clínica (configurações / DNA) ----------------
export async function getClinica(): Promise<Clinica> {
  if (isFirebaseConfigured) {
    const user = getFirebaseAuth().currentUser;
    if (!user) return clinicaVazia;
    const snap = await getDoc(doc(getFirebaseDb(), "clinicas", user.uid));
    if (!snap.exists()) return clinicaVazia;
    const d = snap.data();
    return {
      nome_clinica: d.nome_clinica ?? "",
      cidade: d.cidade ?? "",
      whatsapp: d.whatsapp ?? "",
      tom_padrao: d.tom_padrao ?? "acolhedor",
      procedimentos: d.procedimentos ?? [],
      formalidade: d.formalidade ?? 40,
      como_chamar: d.como_chamar ?? "linda",
      cta_preferido: d.cta_preferido ?? "marcar uma avaliação",
      onboarded: d.onboarded ?? false,
    };
  }
  if (typeof window === "undefined") return clinicaVazia;
  const raw = window.localStorage.getItem(LS_CLINICA);
  return raw ? { ...clinicaVazia, ...JSON.parse(raw) } : clinicaVazia;
}

export async function saveClinica(c: Clinica): Promise<void> {
  if (isFirebaseConfigured) {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new Error("Não autenticado");
    await setDoc(
      doc(getFirebaseDb(), "clinicas", user.uid),
      { ...c, updated_at: new Date().toISOString() },
      { merge: true }
    );
    return;
  }
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_CLINICA, JSON.stringify(c));
}

// ---------------- Histórico ----------------
export async function listHistorico(): Promise<HistoricoItem[]> {
  if (isFirebaseConfigured) {
    const user = getFirebaseAuth().currentUser;
    if (!user) return [];
    const q = query(
      collection(getFirebaseDb(), "historico"),
      where("user_id", "==", user.uid),
      orderBy("created_at", "desc"),
      limit(200)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as HistoricoItem));
  }
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LS_HISTORICO);
  return raw ? (JSON.parse(raw) as HistoricoItem[]) : [];
}

export async function addHistorico(
  item: Pick<HistoricoItem, "tipo" | "contexto" | "respostas" | "intent" | "sentiment" | "score">
): Promise<void> {
  if (isFirebaseConfigured) {
    const user = getFirebaseAuth().currentUser;
    if (!user) return;
    await addDoc(collection(getFirebaseDb(), "historico"), {
      user_id: user.uid,
      ...item,
      favorito: false,
      created_at: new Date().toISOString(),
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
  if (isFirebaseConfigured) {
    const user = getFirebaseAuth().currentUser;
    if (!user) return;
    await updateDoc(doc(getFirebaseDb(), "historico", id), { favorito });
    return;
  }
  if (typeof window === "undefined") return;
  const list = await listHistorico();
  const atualizado = list.map((i) => (i.id === id ? { ...i, favorito } : i));
  window.localStorage.setItem(LS_HISTORICO, JSON.stringify(atualizado));
}
