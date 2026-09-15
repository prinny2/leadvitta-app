"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  signInWithCustomToken,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  isClerkClientConfigured,
  isFirebaseConfigured,
} from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { reconcileBillingClient } from "@/lib/billing-client";

function setFirebaseAuthCookie(enabled: boolean) {
  document.cookie = enabled
    ? "firebase_auth=1; path=/; SameSite=Lax; max-age=604800"
    : "firebase_auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

export function FirebaseSessionSync() {
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (!isClerkClientConfigured || !isFirebaseConfigured || !isLoaded) return;

    let cancelled = false;

    async function syncFirebaseSession() {
      const firebaseAuth = getFirebaseAuth();

      if (!userId) {
        if (firebaseAuth.currentUser) {
          await firebaseSignOut(firebaseAuth).catch(() => null);
        }
        setFirebaseAuthCookie(false);
        return;
      }

      if (firebaseAuth.currentUser?.uid === userId) {
        setFirebaseAuthCookie(true);
        return;
      }

      const response = await fetch("/api/auth/firebase-token", {
        method: "POST",
        headers: { "content-type": "application/json" },
      });
      const data = (await response.json().catch(() => ({}))) as {
        token?: string;
        error?: string;
      };

      if (!response.ok || !data.token) {
        throw new Error(data.error || "Não foi possível sincronizar a sessão.");
      }

      if (cancelled) return;
      const credential = await signInWithCustomToken(firebaseAuth, data.token);
      if (cancelled) return;
      setFirebaseAuthCookie(true);

      // Quem pagou como visitante (checkout sem login) fica em
      // `billing_pending/{email}` até alguém ligar ao uid. Na rota Clerk esse
      // era o único ponto onde ninguém chamava o reconcile — a pessoa pagava,
      // criava a conta e continuava no plano grátis.
      const idToken = await credential.user.getIdToken().catch(() => null);
      if (idToken && !cancelled) await reconcileBillingClient(idToken);
    }

    syncFirebaseSession().catch((error) => {
      console.error(
        "[auth] falha ao sincronizar Clerk com Firebase:",
        error instanceof Error ? error.message : error
      );
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, userId]);

  return null;
}
