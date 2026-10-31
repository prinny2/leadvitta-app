import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import { firebaseConfig } from "@/lib/config";

// Emulador local: exige NODE_ENV=development E o flag explícito. O Next
// substitui process.env.NODE_ENV estaticamente no build, então em produção
// todo este caminho vira código morto e sai do bundle.
const useEmulator =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

const EMULATOR_HOST = "127.0.0.1";
const AUTH_EMULATOR_PORT = 9099;
const FIRESTORE_EMULATOR_PORT = 8080;

// Fast Refresh reexecuta este módulo, e connect*Emulator lança se rodar duas
// vezes na mesma instância — por isso o registro vive no globalThis.
const emulatorState = ((
  globalThis as typeof globalThis & {
    __leadbellusEmulator?: { auth: boolean; firestore: boolean };
  }
).__leadbellusEmulator ??= { auth: false, firestore: false });

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!_app) _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getFirebaseApp());
  if (useEmulator && !emulatorState.auth) {
    connectAuthEmulator(_auth, `http://${EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`, {
      disableWarnings: true,
    });
    emulatorState.auth = true;
  }
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (!_db) _db = getFirestore(getFirebaseApp());
  if (useEmulator && !emulatorState.firestore) {
    connectFirestoreEmulator(_db, EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
    emulatorState.firestore = true;
  }
  return _db;
}
