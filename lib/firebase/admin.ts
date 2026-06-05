import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App | null = null;

function parseServiceAccount(): ServiceAccount | null {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const rawBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;

  if (rawJson || rawBase64) {
    try {
      const raw = rawJson ?? Buffer.from(rawBase64 ?? "", "base64").toString("utf8");
      const parsed = JSON.parse(raw) as ServiceAccount & { private_key?: string };
      return {
        ...parsed,
        privateKey: parsed.privateKey ?? parsed.private_key,
      };
    } catch (e) {
      console.error(
        "[firebase/admin] FIREBASE_SERVICE_ACCOUNT_JSON inválido:",
        e instanceof Error ? e.message : e
      );
      return null;
    }
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) return null;

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

export function isFirebaseAdminConfigured(): boolean {
  return !!parseServiceAccount();
}

export function getFirebaseAdminApp(): App | null {
  if (adminApp) return adminApp;
  const serviceAccount = parseServiceAccount();
  if (!serviceAccount) return null;

  adminApp = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: cert(serviceAccount) });
  return adminApp;
}

export function getFirebaseAdminDb() {
  const app = getFirebaseAdminApp();
  return app ? getFirestore(app) : null;
}

export async function verifyFirebaseIdToken(
  idToken?: string
): Promise<DecodedIdToken | null> {
  if (!idToken) return null;
  const app = getFirebaseAdminApp();
  if (!app) return null;

  try {
    return await getAuth(app).verifyIdToken(idToken);
  } catch {
    return null;
  }
}
