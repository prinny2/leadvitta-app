// Web Push (Firebase Cloud Messaging) — lado do cliente.
// Tudo aqui roda só no browser. A chave VAPID usada é a PÚBLICA
// (NEXT_PUBLIC_FIREBASE_VAPID_KEY); a privada fica no Firebase, não no código.

import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  type MessagePayload,
} from "firebase/messaging";
import { getFirebaseApp } from "@/lib/firebase/client";
import { firebaseConfig, firebaseVapidKey, isFirebaseConfigured } from "@/lib/config";

export type EnableReason =
  | "firebase_off"
  | "sem_vapid_key"
  | "nao_suportado"
  | "permissao_negada"
  | "sem_token"
  | "erro";

export type EnableResult = { ok: boolean; token?: string; reason?: EnableReason };

/** Monta a URL do service worker com a config pública na query string. */
export function swUrlWithConfig(
  config: typeof firebaseConfig = firebaseConfig
): string {
  const params = new URLSearchParams({
    apiKey: config.apiKey ?? "",
    authDomain: config.authDomain ?? "",
    projectId: config.projectId ?? "",
    messagingSenderId: config.messagingSenderId ?? "",
    appId: config.appId ?? "",
  });
  return `/firebase-messaging-sw.js?${params.toString()}`;
}

/** True quando o browser suporta Web Push + FCM. */
export async function isWebPushSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return false;
  try {
    return await isSupported();
  } catch {
    return false;
  }
}

/**
 * Pede permissão, registra o service worker e obtém o token FCM do dispositivo.
 * Não persiste nada — quem chama decide onde salvar (ex.: store.saveFcmToken).
 */
export async function enableWebPush(): Promise<EnableResult> {
  if (!isFirebaseConfigured) return { ok: false, reason: "firebase_off" };
  if (!firebaseVapidKey) return { ok: false, reason: "sem_vapid_key" };
  if (!(await isWebPushSupported())) return { ok: false, reason: "nao_suportado" };

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return { ok: false, reason: "permissao_negada" };

    const registration = await navigator.serviceWorker.register(
      swUrlWithConfig(),
      { scope: "/" }
    );

    const messaging = getMessaging(getFirebaseApp());
    const token = await getToken(messaging, {
      vapidKey: firebaseVapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) return { ok: false, reason: "sem_token" };
    return { ok: true, token };
  } catch (err) {
    console.warn("[messaging] falha ao habilitar Web Push:", err instanceof Error ? err.message : err);
    return { ok: false, reason: "erro" };
  }
}

/** Escuta mensagens com a aba aberta (primeiro plano). Retorna um unsubscribe. */
export async function onForegroundMessage(
  cb: (payload: MessagePayload) => void
): Promise<() => void> {
  if (!(await isWebPushSupported())) return () => {};
  const messaging = getMessaging(getFirebaseApp());
  return onMessage(messaging, cb);
}
