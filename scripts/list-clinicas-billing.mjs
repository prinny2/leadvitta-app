#!/usr/bin/env node
import { config } from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.local") });

const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON ausente");
if (!getApps().length) initializeApp({ credential: cert(JSON.parse(json)) });

const db = getFirestore();
const snap = await db.collection("clinicas").limit(20).get();
for (const doc of snap.docs) {
  const d = doc.data();
  console.log(
    JSON.stringify({
      id: doc.id,
      nome: d.nome_clinica,
      whatsapp: d.whatsapp || "",
      billing_status: d.billing?.status || null,
    }),
  );
}
