// Mapa canônico de números de WhatsApp (servidor, Admin SDK).
// numeros_whatsapp/{digitos} -> { clinica_id }. Garante que um número pertence
// a NO MÁXIMO uma clínica (fecha o "sequestro de número" entre clínicas) e é a
// única forma de o webhook descobrir de quem é a mensagem.
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { numeroDigits, candidatosNumero } from "@/lib/utils";

export type ClaimResult =
  | { ok: true; numero: string }
  | { ok: false; motivo: "vazio" | "em_uso" | "sem_db" };

/** A clínica reivindica um número. Falha se já pertence a OUTRA clínica. */
export async function reivindicarNumero(
  clinicaId: string,
  numeroBruto: string,
): Promise<ClaimResult> {
  const db = getFirebaseAdminDb();
  if (!db) return { ok: false, motivo: "sem_db" };
  const numero = numeroDigits(numeroBruto);
  if (!numero) return { ok: false, motivo: "vazio" };

  return db.runTransaction(async (tx) => {
    const mapRef = db.collection("numeros_whatsapp").doc(numero);
    const clinicaRef = db.collection("clinicas").doc(clinicaId);
    const [mapSnap, clinicaSnap] = await Promise.all([
      tx.get(mapRef),
      tx.get(clinicaRef),
    ]);

    if (mapSnap.exists && mapSnap.data()?.clinica_id !== clinicaId) {
      return { ok: false as const, motivo: "em_uso" as const };
    }

    // Libera o número antigo desta clínica, se mudou.
    const numeroAntigo = numeroDigits(
      clinicaSnap.data()?.whatsapp as string | undefined,
    );
    if (numeroAntigo && numeroAntigo !== numero) {
      tx.delete(db.collection("numeros_whatsapp").doc(numeroAntigo));
    }

    tx.set(mapRef, {
      clinica_id: clinicaId,
      claimed_at: new Date().toISOString(),
    });
    tx.set(clinicaRef, { whatsapp: numero }, { merge: true });
    return { ok: true as const, numero };
  });
}

/** Desconecta o número atual da clínica (limpa o mapa e o campo). */
export async function liberarNumero(clinicaId: string): Promise<ClaimResult> {
  const db = getFirebaseAdminDb();
  if (!db) return { ok: false, motivo: "sem_db" };

  return db.runTransaction(async (tx) => {
    const clinicaRef = db.collection("clinicas").doc(clinicaId);
    const clinicaSnap = await tx.get(clinicaRef);
    const numeroAtual = numeroDigits(
      clinicaSnap.data()?.whatsapp as string | undefined,
    );
    if (numeroAtual) {
      tx.delete(db.collection("numeros_whatsapp").doc(numeroAtual));
    }
    tx.set(clinicaRef, { whatsapp: "" }, { merge: true });
    return { ok: true as const, numero: "" };
  });
}

/** Descobre a clínica dona de um número (tenta variantes de DDI). */
export async function resolverClinicaPorNumero(
  numeroBruto: string,
): Promise<string | null> {
  const db = getFirebaseAdminDb();
  if (!db) return null;
  for (const cand of candidatosNumero(numeroBruto)) {
    const snap = await db.collection("numeros_whatsapp").doc(cand).get();
    if (snap.exists) return (snap.data()?.clinica_id as string) ?? null;
  }
  return null;
}
