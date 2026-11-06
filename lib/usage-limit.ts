import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { trialDaysLeft, trialStartMs } from "@/lib/free-limit";

/** Status de assinatura que contam como "pagante" (acesso ilimitado). */
const PAID_STATUSES = new Set(["active", "trialing", "past_due"]);

export type LimitCheck = {
  allowed: boolean;
  paid: boolean;
  used: number;
  /** Dias de teste grátis que restam (Infinity se pagante). */
  remaining: number;
  /** True quando esta chamada consumiu (reservou) um slot grátis. */
  reserved: boolean;
};

/**
 * Reserva uma geração do teste grátis de forma ATÔMICA (server-side).
 * - Pagante (billing.status ativo) → ilimitado, não reserva nada.
 * - Grátis → checa o prazo de 7 dias e, na MESMA transação, incrementa o
 *   contador e marca o início do teste na primeira geração. Conta antiga, que já
 *   tinha usado as 5 respostas, ganha os 7 dias a partir da próxima geração.
 * - Sem Admin SDK (ex.: ambiente sem credencial) falha ABERTO — não bloqueia.
 *
 * Reserva ANTES de gerar; se a geração falhar, chame `releaseGeneration` para
 * devolver o slot (assim só sucesso consome grátis).
 */
export async function reserveGeneration(uid: string): Promise<LimitCheck> {
  const db = getFirebaseAdminDb();
  if (!db) {
    return { allowed: true, paid: true, used: 0, remaining: Number.POSITIVE_INFINITY, reserved: false };
  }

  const ref = db.collection("clinicas").doc(uid);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() ?? {} : {};
    const status = data?.billing?.status;
    const paid = typeof status === "string" && PAID_STATUSES.has(status);

    if (paid) {
      return { allowed: true, paid: true, used: 0, remaining: Number.POSITIVE_INFINITY, reserved: false };
    }

    const used = Number(data?.usage?.free_generations ?? 0);
    const startedAt = data?.usage?.trial_started_at;
    const nowMs = Date.now();
    const remaining = trialDaysLeft(startedAt, nowMs);
    if (remaining <= 0) {
      return { allowed: false, paid: false, used, remaining: 0, reserved: false };
    }

    tx.set(
      ref,
      {
        usage: {
          free_generations: FieldValue.increment(1),
          ...(trialStartMs(startedAt) === null
            ? { trial_started_at: new Date(nowMs).toISOString() }
            : {}),
        },
        updated_at: new Date(nowMs).toISOString(),
      },
      { merge: true }
    );
    return { allowed: true, paid: false, used, remaining, reserved: true };
  });
}

/**
 * Devolve um slot grátis reservado por `reserveGeneration` quando a geração
 * falhou (assim erro de IA não "gasta" uma grátis do usuário). Falha silenciosa.
 */
export async function releaseGeneration(uid: string): Promise<void> {
  const db = getFirebaseAdminDb();
  if (!db) return;
  try {
    await db.collection("clinicas").doc(uid).set(
      {
        usage: { free_generations: FieldValue.increment(-1) },
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("[usage-limit] falha ao liberar slot grátis", err);
  }
}
