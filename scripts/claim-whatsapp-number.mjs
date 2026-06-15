#!/usr/bin/env node
/**
 * Reivindica um número no mapa canônico (Admin SDK).
 * Uso: node scripts/claim-whatsapp-number.mjs <clinicaUid> <numero>
 */
import { config } from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.local") });

const clinicaId = process.argv[2];
const numeroBruto = process.argv[3];

function onlyDigits(n) {
  return String(n || "").replace(/\D/g, "");
}

function initAdmin() {
  if (getApps().length) return getFirestore();
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON ausente em .env.local");
  const sa = JSON.parse(json);
  initializeApp({ credential: cert(sa) });
  return getFirestore();
}

async function main() {
  const numero = onlyDigits(numeroBruto);
  if (!clinicaId || !numero) {
    console.error("Uso: node scripts/claim-whatsapp-number.mjs <clinicaUid> <numero>");
    process.exit(1);
  }

  const db = initAdmin();
  const mapRef = db.collection("numeros_whatsapp").doc(numero);
  const clinicaRef = db.collection("clinicas").doc(clinicaId);

  await db.runTransaction(async (tx) => {
    const [mapSnap, clinicaSnap] = await Promise.all([tx.get(mapRef), tx.get(clinicaRef)]);
    if (!clinicaSnap.exists) throw new Error(`clinica ${clinicaId} não existe`);
    if (mapSnap.exists && mapSnap.data()?.clinica_id !== clinicaId) {
      throw new Error(`número ${numero} já pertence a ${mapSnap.data()?.clinica_id}`);
    }
    const antigo = onlyDigits(clinicaSnap.data()?.whatsapp);
    if (antigo && antigo !== numero) {
      tx.delete(db.collection("numeros_whatsapp").doc(antigo));
    }
    tx.set(mapRef, { clinica_id: clinicaId, claimed_at: new Date().toISOString() });
    tx.set(clinicaRef, { whatsapp: numero }, { merge: true });
  });

  console.log(`OK: ${numero} → clinica ${clinicaId}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});