import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Config mockável (Web Push depende de flags e da chave VAPID).
const cfg = vi.hoisted(() => ({
  isFirebaseConfigured: false,
  firebaseVapidKey: undefined as string | undefined,
  firebaseConfig: {
    apiKey: "k",
    authDomain: "d.firebaseapp.com",
    projectId: "proj",
    storageBucket: "b",
    messagingSenderId: "123",
    appId: "app:1",
  },
}));

vi.mock("@/lib/config", () => cfg);
vi.mock("@/lib/firebase/client", () => ({ getFirebaseApp: () => ({}) }));
vi.mock("firebase/messaging", () => ({
  getMessaging: vi.fn(),
  getToken: vi.fn(),
  onMessage: vi.fn(),
  isSupported: vi.fn().mockResolvedValue(false),
}));

import {
  swUrlWithConfig,
  enableWebPush,
  isWebPushSupported,
} from "@/lib/firebase/messaging";

beforeEach(() => {
  cfg.isFirebaseConfigured = false;
  cfg.firebaseVapidKey = undefined;
});
afterEach(() => vi.restoreAllMocks());

describe("swUrlWithConfig", () => {
  it("monta a URL do SW com a config pública na query string", () => {
    const url = swUrlWithConfig();
    expect(url.startsWith("/firebase-messaging-sw.js?")).toBe(true);
    const qs = new URLSearchParams(url.split("?")[1]);
    expect(qs.get("apiKey")).toBe("k");
    expect(qs.get("projectId")).toBe("proj");
    expect(qs.get("messagingSenderId")).toBe("123");
    expect(qs.get("appId")).toBe("app:1");
    // Não vaza storageBucket (não é necessário no SW de messaging).
    expect(qs.has("storageBucket")).toBe(false);
  });

  it("lida com campos ausentes sem quebrar", () => {
    const url = swUrlWithConfig({
      apiKey: undefined,
      authDomain: undefined,
      projectId: "p2",
      storageBucket: undefined,
      messagingSenderId: undefined,
      appId: undefined,
    });
    const qs = new URLSearchParams(url.split("?")[1]);
    expect(qs.get("apiKey")).toBe("");
    expect(qs.get("projectId")).toBe("p2");
  });
});

describe("isWebPushSupported", () => {
  it("é false em ambiente sem window (SSR/node)", async () => {
    expect(await isWebPushSupported()).toBe(false);
  });
});

describe("enableWebPush — guardas", () => {
  it("retorna firebase_off quando o Firebase não está configurado", async () => {
    cfg.isFirebaseConfigured = false;
    expect(await enableWebPush()).toEqual({
      ok: false,
      reason: "firebase_off",
    });
  });

  it("retorna sem_vapid_key quando falta a chave pública", async () => {
    cfg.isFirebaseConfigured = true;
    cfg.firebaseVapidKey = undefined;
    expect(await enableWebPush()).toEqual({
      ok: false,
      reason: "sem_vapid_key",
    });
  });

  it("retorna nao_suportado quando o ambiente não suporta push", async () => {
    cfg.isFirebaseConfigured = true;
    cfg.firebaseVapidKey = "BVAPID";
    // Em node não há window/navigator → isWebPushSupported() é false.
    expect(await enableWebPush()).toEqual({
      ok: false,
      reason: "nao_suportado",
    });
  });
});
