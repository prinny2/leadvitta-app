import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/** Quantas respostas grátis cada pessoa pode gerar antes de precisar assinar. */
export const FREE_GENERATION_LIMIT = 5;

/** Status de assinatura que contam como "pagante" (acesso ilimitado). */
const PAID_STATUSES = new Set(["active", "trialing", "past_due"]);

export type LimitCheck = {
  allowed: boolean;
  paid: boolean;
  used: number;
  /** Quantas grátis ainda restam (Infinity se pagante). */
  remaining: number;
};

/**
 * Verifica o limite do plano grátis para um usuário (server-side).
 * - Pagante (billing.status ativo) → ilimitado.
 * - Grátis → até FREE_GENERATION_LIMIT gerações.
 * Sem Admin SDK (ex.: ambiente sem credencial) falha ABERTO — não bloqueia.
 */
export async function checkGenerationLimit(uid: string): Promise<LimitCheck> {
  const db = getFirebaseAdminDb();
  if (!db) {
    return { allowed: true, paid: true, used: 0, remaining: Number.POSITIVE_INFINITY };
  }

  const snap = await db.collection("clinicas").doc(uid).get();
  const data = snap.exists ? snap.data() ?? {} : {};
  const status = data?.billing?.status;
  const paid = typeof status === "string" && PAID_STATUSES.has(status);

  if (paid) {
    return { allowed: true, paid: true, used: 0, remaining: Number.POSITIVE_INFINITY };
  }

  const used = Number(data?.usage?.free_generations ?? 0);
  const remaining = Math.max(0, FREE_GENERATION_LIMIT - used);
  return { allowed: remaining > 0, paid: false, used, remaining };
}

/**
 * Incrementa o contador de gerações grátis. Chamar só após uma geração bem
 * sucedida e só para usuário grátis. Falha silenciosa (não derruba a geração).
 */
export async function incrementFreeUsage(uid: string): Promise<void> {
  const db = getFirebaseAdminDb();
  if (!db) return;
  try {
    await db.collection("clinicas").doc(uid).set(
      {
        usage: { free_generations: FieldValue.increment(1) },
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("[usage-limit] falha ao incrementar uso grátis", err);
  }
}
