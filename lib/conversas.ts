// Lógica de conversas do lado do SERVIDOR (Admin SDK — ignora as regras).
// Usada pelo webhook (grava mensagem recebida + resposta) e pela API de resposta.
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { numeroDigits } from "@/lib/utils";
import type { Prioridade } from "@/lib/types";

export { numeroDigits as soDigitos } from "@/lib/utils";

/** Mesmo critério dos selos do dashboard: 🔥 >70 · 🌤️ >40 · ❄️ resto. */
export function prioridadeDoScore(score?: number | null): Prioridade {
  if (typeof score !== "number") return "morno";
  if (score > 70) return "quente";
  if (score > 40) return "morno";
  return "frio";
}

/** Id determinístico: 1 conversa por (clínica, número). */
export function conversaId(clinicaId: string, numero: string): string {
  return `${clinicaId}__${numeroDigits(numero)}`;
}

/**
 * Idempotência: reserva o processamento de uma mensagem do provedor.
 * Retorna true se é a 1ª vez (prossiga); false se já foi processada (retry).
 */
export async function reservarProcessamento(
  providerMessageId?: string
): Promise<boolean> {
  if (!providerMessageId) return true; // sem id não dá pra deduplicar
  const db = getFirebaseAdminDb();
  if (!db) return true;
  const ref = db
    .collection("mensagens_processadas")
    .doc(providerMessageId.replace(/[^\w-]/g, "_"));
  try {
    await ref.create({ em: new Date().toISOString() });
    return true;
  } catch {
    return false; // já existe → retry duplicado
  }
}

/**
 * Devolve a reserva quando o processamento FALHOU (crash, roteamento sem
 * clínica). Sem isso, o retry do provedor seria tratado como duplicata e a
 * mensagem se perderia pra sempre.
 */
export async function liberarProcessamento(
  providerMessageId?: string
): Promise<void> {
  if (!providerMessageId) return;
  const db = getFirebaseAdminDb();
  if (!db) return;
  await db
    .collection("mensagens_processadas")
    .doc(providerMessageId.replace(/[^\w-]/g, "_"))
    .delete()
    .catch((err) => {
      console.warn("[conversas] falha ao liberar processamento:", err instanceof Error ? err.message : err);
    });
}

type InboundParams = {
  clinicaId: string;
  from: string;
  text: string;
  contactName?: string;
  intent?: string | null;
  sentiment?: string | null;
  score?: number | null;
  providerMessageId?: string;
};

/** Registra a mensagem RECEBIDA: upsert dos metadados + append na thread. */
export async function registrarMensagemRecebida(
  p: InboundParams
): Promise<string | null> {
  const db = getFirebaseAdminDb();
  if (!db) return null;

  const numero = numeroDigits(p.from);
  const id = conversaId(p.clinicaId, numero);
  const agora = new Date().toISOString();
  const ref = db.collection("conversas").doc(id);
  const snap = await ref.get();
  const novo = !snap.exists;
  const score = typeof p.score === "number" ? p.score : undefined;

  await ref.set(
    {
      clinica_id: p.clinicaId,
      cliente_numero: numero,
      ...(p.contactName ? { cliente_nome: p.contactName } : {}),
      ultima_mensagem: p.text.slice(0, 500),
      ultima_atividade: agora,
      nao_lida: true,
      ...(score !== undefined
        ? { score, prioridade: prioridadeDoScore(score) }
        : {}),
      ...(p.intent ? { intent: p.intent } : {}),
      ...(p.sentiment ? { sentiment: p.sentiment } : {}),
      ...(novo ? { created_at: agora, arquivada: false } : {}),
    },
    { merge: true }
  );

  // Id determinístico pelo providerMessageId: se a reserva foi devolvida após
  // um crash e o provedor reentregar, o set() sobrescreve a MESMA linha em vez
  // de duplicar a mensagem na thread.
  const dadosMensagem = {
    clinica_id: p.clinicaId,
    direcao: "in",
    texto: p.text,
    em: agora,
    ...(p.providerMessageId ? { provider_message_id: p.providerMessageId } : {}),
  };
  const mensagens = ref.collection("mensagens");
  if (p.providerMessageId) {
    await mensagens.doc(p.providerMessageId.replace(/[^\w-]/g, "_")).set(dadosMensagem);
  } else {
    await mensagens.add(dadosMensagem);
  }

  return id;
}

/**
 * Registra a mensagem ENVIADA pela clínica.
 * marcarLida=true (resposta MANUAL) zera o "não lida"; auto-resposta não zera,
 * pra a conversa continuar na triagem até um humano abrir.
 */
export async function registrarMensagemEnviada(
  clinicaId: string,
  numero: string,
  texto: string,
  opts?: { marcarLida?: boolean }
): Promise<void> {
  const db = getFirebaseAdminDb();
  if (!db) return;

  const num = numeroDigits(numero);
  const id = conversaId(clinicaId, num);
  const agora = new Date().toISOString();
  const ref = db.collection("conversas").doc(id);

  await ref.set(
    {
      clinica_id: clinicaId,
      cliente_numero: num,
      ultima_mensagem: texto.slice(0, 500),
      ultima_atividade: agora,
      ...(opts?.marcarLida ? { nao_lida: false } : {}),
    },
    { merge: true }
  );

  await ref.collection("mensagens").add({
    clinica_id: clinicaId,
    direcao: "out",
    texto,
    em: agora,
  });
}

/** Marca que a auto-resposta falhou, pra destacar no inbox que precisa atenção. */
export async function marcarPrecisaAtencao(
  clinicaId: string,
  numero: string
): Promise<void> {
  const db = getFirebaseAdminDb();
  if (!db) return;
  const id = conversaId(clinicaId, numeroDigits(numero));
  await db.collection("conversas").doc(id).set({ precisa_atencao: true }, { merge: true });
}

/** Lê o dono e o número de uma conversa (para checar posse na API de resposta). */
export async function getConversaServidor(
  id: string
): Promise<{ clinica_id: string; cliente_numero: string } | null> {
  const db = getFirebaseAdminDb();
  if (!db) return null;
  const snap = await db.collection("conversas").doc(id).get();
  if (!snap.exists) return null;
  const d = snap.data() as { clinica_id?: string; cliente_numero?: string };
  if (!d.clinica_id || !d.cliente_numero) return null;
  return { clinica_id: d.clinica_id, cliente_numero: d.cliente_numero };
}

/** Chave do canal de WhatsApp da clínica (Z-API). */
export async function getCanalClinica(
  clinicaId: string
): Promise<string | undefined> {
  const db = getFirebaseAdminDb();
  if (!db) return undefined;
  const snap = await db.collection("clinicas").doc(clinicaId).get();
  return (snap.data()?.whatsapp_channel_key as string | undefined) || undefined;
}
