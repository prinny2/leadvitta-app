#!/usr/bin/env node
/**
 * LeadBellus pre-flight: env example sync, doc truth, firestore contracts.
 * Exit 1 if any critical check fails; warnings do not fail.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const critical = [];
const warnings = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function warn(msg) {
  warnings.push(msg);
  console.warn(`[preflight:warn] ${msg}`);
}

function crit(msg) {
  critical.push(msg);
  console.error(`[preflight:crit] ${msg}`);
}

function ok(msg) {
  console.log(`[preflight:ok] ${msg}`);
}

/** Parse KEY= lines from .env.local.example (ignore comments/blanks). */
function parseEnvExampleKeys(content) {
  const keys = new Set();
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
    if (m) keys.add(m[1]);
  }
  return keys;
}

function walkFiles(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", "coverage", ".git"].includes(entry.name)) continue;
      walkFiles(full, exts, out);
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

function collectEnvRefsFromSources() {
  const dirs = ["lib", path.join("app", "api")];
  const files = dirs.flatMap((d) => walkFiles(path.join(root, d), [".ts", ".tsx", ".mjs", ".js"]));
  const refs = new Set();
  const re = /process\.env\.([A-Z][A-Z0-9_]*)/g;
  for (const file of files) {
    const rel = path.relative(root, file).replaceAll(path.sep, "/");
    const text = fs.readFileSync(file, "utf8");
    let m;
    while ((m = re.exec(text)) !== null) {
      refs.add(m[1]);
    }
  }
  return refs;
}

/** Vars referenced in app code but optional / infra — exclude from missing-key warnings. */
const ENV_REF_EXCLUDE = new Set([
  "NODE_ENV",
  "K_SERVICE",
  "GOOGLE_CLOUD_PROJECT",
  "GCLOUD_PROJECT",
  "VERCEL",
  "VERCEL_ENV",
  "CI",
]);

// --- 1. Parse .env.local.example ---
const examplePath = ".env.local.example";
if (!exists(examplePath)) {
  crit(`${examplePath} not found`);
} else {
  const exampleKeys = parseEnvExampleKeys(read(examplePath));
  ok(`${examplePath}: ${exampleKeys.size} keys documented`);

  // --- 2. Diff with .env.local (warn only) ---
  const localPath = ".env.local";
  if (exists(localPath)) {
    const localKeys = parseEnvExampleKeys(read(localPath));
    const missingInLocal = [...exampleKeys].filter((k) => !localKeys.has(k));
    const extraInLocal = [...localKeys].filter((k) => !exampleKeys.has(k));
    if (missingInLocal.length || extraInLocal.length) {
      warn(
        `.env.local key drift: ${missingInLocal.length} missing from local, ${extraInLocal.length} extra in local (not failing)`
      );
    } else {
      ok(".env.local keys match example");
    }
  } else {
    warn(".env.local not found (demo mode OK)");
  }

  // --- 3. Scan lib/ + app/api/ for process.env refs ---
  const codeRefs = collectEnvRefsFromSources();
  const missingInExample = [...codeRefs]
    .filter((k) => !ENV_REF_EXCLUDE.has(k) && !exampleKeys.has(k))
    .sort();
  if (missingInExample.length) {
    warn(
      `App references env vars not in ${examplePath}: ${missingInExample.join(", ")}`
    );
  } else {
    ok("All scanned process.env refs documented in example (or excluded)");
  }
}

// --- 4. No active Auth0 in app/, lib/, middleware.ts ---
const auth0Targets = [
  ...walkFiles(path.join(root, "app"), [".ts", ".tsx"]),
  ...walkFiles(path.join(root, "lib"), [".ts", ".tsx"]),
  path.join(root, "middleware.ts"),
].filter((f) => fs.existsSync(f));

const auth0Patterns = [
  /\bAUTH0_/,
  /from\s+["']@auth0\//,
  /from\s+["']auth0/,
  /\bauth0\b/i,
];

for (const file of auth0Targets) {
  const rel = path.relative(root, file).replaceAll(path.sep, "/");
  const text = fs.readFileSync(file, "utf8");
  for (const pat of auth0Patterns) {
    if (pat.test(text)) {
      // Allow comments mentioning Auth0 as parked
      const lines = text.split(/\r?\n/);
      const bad = lines.filter((line) => {
        if (!pat.test(line)) return false;
        const t = line.trim();
        if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return false;
        if (/feat\/auth0|parado|parked|não|nao|not used/i.test(line)) return false;
        return true;
      });
      if (bad.length) {
        warn(`Possible active Auth0 reference in ${rel}`);
      }
    }
  }
}
ok("Auth0 scan complete (warnings only)");

// --- 5. README + COORDINATION: Twilio not primary WhatsApp ---
const twilioPrimaryPatterns = [
  /Twilio é o caminho/i,
  /WHATSAPP_PROVIDER\s*=\s*twilio/i,
  /fique no Twilio/i,
  /WHATSAPP_PROVIDER.*twilio.*dialog360/i,
];

for (const doc of ["README.md", "COORDINATION.md"]) {
  if (!exists(doc)) continue;
  const text = read(doc);
  for (const pat of twilioPrimaryPatterns) {
    if (pat.test(text)) {
      crit(`${doc} presents Twilio as primary WhatsApp provider (pattern: ${pat})`);
    }
  }
}
ok("Doc Twilio-primary scan done");

// --- 6. next.config.mjs ENABLE_API_PROXY opt-in (not VERCEL===1) ---
const nextConfig = read("next.config.mjs");
if (!/ENABLE_API_PROXY\s*===\s*["']true["']/.test(nextConfig)) {
  crit("next.config.mjs must gate proxy on ENABLE_API_PROXY === \"true\"");
} else if (/VERCEL\s*===?\s*["']?1["']?/.test(nextConfig) && /enableApiProxy/.test(nextConfig)) {
  crit("next.config.mjs must not auto-enable proxy via VERCEL=1");
} else {
  ok("next.config.mjs uses ENABLE_API_PROXY opt-in");
}

// --- 7. Run check-firestore-contracts.mjs ---
const firestoreScript = path.join(root, "scripts", "check-firestore-contracts.mjs");
if (!fs.existsSync(firestoreScript)) {
  crit("scripts/check-firestore-contracts.mjs not found");
} else {
  console.log("[preflight] running npm run firebase:check ...");
  const result = spawnSync(process.execPath, [firestoreScript], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    crit("firebase:check (check-firestore-contracts.mjs) failed");
  } else {
    ok("firebase:check passed");
  }
}

// --- Summary ---
console.log("");
console.log("=== LeadBellus preflight summary ===");
console.log(`Critical: ${critical.length}`);
console.log(`Warnings: ${warnings.length}`);
if (critical.length) {
  for (const c of critical) console.error(`  ✗ ${c}`);
}
if (warnings.length) {
  for (const w of warnings) console.warn(`  ! ${w}`);
}

process.exit(critical.length > 0 ? 1 : 0);
