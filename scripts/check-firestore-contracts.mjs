import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function fail(message) {
  console.error(`[firebase:check] ${message}`);
  process.exitCode = 1;
}

function hasIndex(indexes, collectionGroup, fields) {
  return indexes.some((idx) => {
    if (idx.collectionGroup !== collectionGroup) return false;
    const got = (idx.fields ?? []).map((f) => `${f.fieldPath}:${f.order ?? f.arrayConfig}`);
    return fields.every((field) => got.includes(field));
  });
}

function walkDirs(dir, visitor) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    visitor(full, entry.name);
    walkDirs(full, visitor);
  }
}

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

const rules = read("firestore.rules");
const store = read("lib/store.ts");
const firebaseJson = JSON.parse(read("firebase.json"));
const indexesJson = JSON.parse(read("firestore.indexes.json"));
const indexes = indexesJson.indexes ?? [];
const admin = read("lib/firebase/admin.ts");
const config = read("lib/config.ts");
const configRoute = read("app/api/config/route.ts");
const routeClinicaWhatsapp = read("app/api/clinica/whatsapp/route.ts");
const routeConversasReply = read("app/api/conversas/reply/route.ts");
const routeStripeCheckout = read("app/api/stripe/checkout/route.ts");
const routeZapierLead = read("app/api/zapier/lead/route.ts");
const routeWaitlist = read("app/api/waitlist/route.ts");

const forbiddenAppDirs = new Set(["dist", "build", "out"]);
walkDirs(path.join(root, "app"), (dir, name) => {
  if (forbiddenAppDirs.has(name)) {
    fail(`${rel(dir)} must not exist inside app/; Next treats nested page files as routes.`);
  }
});

if (firebaseJson.firestore?.rules !== "firestore.rules") {
  fail("firebase.json must deploy firestore.rules.");
}
if (firebaseJson.firestore?.indexes !== "firestore.indexes.json") {
  fail("firebase.json must deploy firestore.indexes.json.");
}
if (!Array.isArray(indexesJson.indexes)) {
  fail("firestore.indexes.json must expose an indexes array.");
}

const requiredIndexes = [
  {
    collectionGroup: "historico",
    fields: ["user_id:ASCENDING", "created_at:DESCENDING"],
    queryHint: "listHistorico() where(user_id == uid) + orderBy(created_at desc)",
  },
  {
    collectionGroup: "conversas",
    fields: ["clinica_id:ASCENDING", "ultima_atividade:DESCENDING"],
    queryHint: "listConversas() where(clinica_id == uid) + orderBy(ultima_atividade desc)",
  },
];

for (const idx of requiredIndexes) {
  if (!hasIndex(indexes, idx.collectionGroup, idx.fields)) {
    fail(`Missing Firestore index for ${idx.queryHint}.`);
  }
}

const requiredStoreSnippets = [
  ['collection(getFirebaseDb(), "historico")', "historico collection query"],
  ['where("user_id", "==", user.uid)', "historico owner filter"],
  ['orderBy("created_at", "desc")', "historico descending date order"],
  ['collection(getFirebaseDb(), "conversas")', "conversas collection query"],
  ['where("clinica_id", "==", user.uid)', "conversas owner filter"],
  ['orderBy("ultima_atividade", "desc")', "conversas descending activity order"],
  ['collection(getFirebaseDb(), "conversas", conversaId, "mensagens")', "mensagens subcollection query"],
  ['orderBy("em", "asc")', "mensagens chronological order"],
];

for (const [snippet, label] of requiredStoreSnippets) {
  if (!store.includes(snippet)) fail(`lib/store.ts no longer contains expected ${label}.`);
}

const requiredAdminSnippets = [
  ["FIREBASE_SERVICE_ACCOUNT_JSON", "supports service-account JSON env"],
  ["FIREBASE_SERVICE_ACCOUNT_JSON_BASE64", "supports base64 service-account env"],
  ['parsed.privateKey ?? parsed.private_key', "accepts privateKey and private_key service-account keys"],
  ['FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, "\\n")', "normalizes escaped private key newlines"],
  ["GOOGLE_CLOUD_PROJECT", "supports Google runtime project id"],
  ["GCLOUD_PROJECT", "supports legacy Google runtime project id"],
  ["process.env.K_SERVICE", "supports Cloud Run ADC-style initialization"],
  ["getApps().length ? getApps()[0] : initializeApp(options)", "reuses existing Admin SDK app"],
  ["getAuth(app).verifyIdToken(idToken)", "verifies Firebase Auth ID tokens"],
];

for (const [snippet, label] of requiredAdminSnippets) {
  if (!admin.includes(snippet)) fail(`lib/firebase/admin.ts no longer ${label}.`);
}

const requiredConfigSnippets = [
  ["NEXT_PUBLIC_FIREBASE_API_KEY", "reads public Firebase api key"],
  ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", "reads public Firebase project id"],
  ["!!firebaseConfig.apiKey && !!firebaseConfig.projectId", "only enables Firebase when api key and project id exist"],
];

for (const [snippet, label] of requiredConfigSnippets) {
  if (!config.includes(snippet)) fail(`lib/config.ts no longer ${label}.`);
}

const requiredConfigRouteSnippets = [
  ["firebase_enabled: isFirebaseConfigured", "reports Firebase client availability"],
  ["firebase_admin_enabled: isFirebaseAdminConfigured()", "reports Firebase Admin availability"],
  ["stripe_enabled: isStripeConfigured", "reports Stripe availability"],
];

for (const [snippet, label] of requiredConfigRouteSnippets) {
  if (!configRoute.includes(snippet)) fail(`app/api/config/route.ts no longer ${label}.`);
}

for (const secretName of [
  "FIREBASE_SERVICE_ACCOUNT_JSON",
  "FIREBASE_SERVICE_ACCOUNT_JSON_BASE64",
  "FIREBASE_PRIVATE_KEY",
  "STRIPE_SECRET_KEY",
]) {
  if (configRoute.includes(secretName)) {
    fail(`app/api/config/route.ts must not expose ${secretName}.`);
  }
}

const requiredRuleSnippets = [
  ['match /clinicas/{uid}', "clinicas owner document rules"],
  ['!("billing" in request.resource.data)', "client create cannot set billing"],
  ['request.resource.data.billing == resource.data.billing', "client update cannot change billing"],
  ['request.resource.data.whatsapp == resource.data.whatsapp', "client update cannot change whatsapp"],
  [
    'request.resource.data.whatsapp_channel_key == resource.data.whatsapp_channel_key',
    "client update cannot change whatsapp_channel_key",
  ],
  ['match /conversas/{convId}', "conversas rules"],
  [".hasOnly(['nao_lida', 'arquivada'])", "conversas update allowlist"],
  ['match /mensagens/{msgId}', "mensagens subcollection rules"],
  ['get(/databases/$(database)/documents/conversas/$(convId)).data.clinica_id == request.auth.uid', "mensagens parent-owner check"],
  ['match /numeros_whatsapp/{numero}', "numeros_whatsapp server-only rules"],
  ['match /mensagens_processadas/{id}', "mensagens_processadas server-only rules"],
  ['match /stripe_events/{eventId}', "stripe_events server-only rules"],
  ['match /waitlist/{entryId}', "waitlist server-only rules"],
  ['match /{document=**}', "deny-by-default catchall"],
];

for (const [snippet, label] of requiredRuleSnippets) {
  if (!rules.includes(snippet)) fail(`firestore.rules no longer contains expected ${label}.`);
}

for (const collection of ["numeros_whatsapp", "mensagens_processadas", "stripe_events", "waitlist"]) {
  const re = new RegExp(
    `match /${collection}/\\{[^}]+\\}\\s*\\{[\\s\\S]*?allow read, write: if false;`,
    "m"
  );
  if (!re.test(rules)) fail(`${collection} must remain read/write false for clients.`);
}

const requiredRouteContracts = [
  {
    file: "app/api/clinica/whatsapp/route.ts",
    source: routeClinicaWhatsapp,
    snippets: [
      ['import { verifyFirebaseIdToken }', "imports Firebase token verification"],
      ["verifyFirebaseIdToken(body.firebaseIdToken)", "verifies the request Firebase ID token"],
      ["decoded.uid", "uses authenticated uid for number ownership"],
    ],
  },
  {
    file: "app/api/conversas/reply/route.ts",
    source: routeConversasReply,
    snippets: [
      ['import { verifyFirebaseIdToken }', "imports Firebase token verification"],
      ["verifyFirebaseIdToken(firebaseIdToken)", "verifies the request Firebase ID token"],
      ["conversa.clinica_id !== decoded.uid", "blocks replies to conversations from another clinic"],
    ],
  },
  {
    file: "app/api/stripe/checkout/route.ts",
    source: routeStripeCheckout,
    snippets: [
      ['import { verifyFirebaseIdToken }', "imports Firebase token verification"],
      ["verifyFirebaseIdToken(body.firebaseIdToken)", "verifies Firebase ID token before checkout"],
      ["isFirebaseConfigured && !decodedToken?.uid", "requires login when Firebase is enabled"],
      ["client_reference_id: firebaseUid", "links Stripe checkout to Firebase uid"],
    ],
  },
  {
    file: "app/api/zapier/lead/route.ts",
    source: routeZapierLead,
    snippets: [
      ['import { verifyFirebaseIdToken }', "imports Firebase token verification"],
      ["verifyFirebaseIdToken(getBearerToken(request))", "verifies Bearer Firebase ID token"],
      ["firebase_uid: decodedToken.uid", "sends authenticated uid downstream"],
    ],
  },
  {
    file: "app/api/waitlist/route.ts",
    source: routeWaitlist,
    snippets: [
      ['getFirebaseAdminDb', "uses Admin SDK rather than client Firestore"],
      ['db.collection("waitlist").doc(id).set', "writes waitlist through server route"],
      ['enforceRateLimit(request', "rate-limits public waitlist writes"],
      ['rejectCrossOriginRequest(request)', "rejects cross-origin public waitlist writes"],
    ],
  },
];

for (const route of requiredRouteContracts) {
  for (const [snippet, label] of route.snippets) {
    if (!route.source.includes(snippet)) {
      fail(`${route.file} no longer ${label}.`);
    }
  }
}

if (!process.exitCode) {
  console.log("[firebase:check] Firebase rules/config/API contracts look consistent.");
}
