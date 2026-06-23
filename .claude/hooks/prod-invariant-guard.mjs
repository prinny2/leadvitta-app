#!/usr/bin/env node

// Bloqueia reintroducao de invariantes proibidas no codigo/config:
//  - dominio parqueado leadvitta.com (NUNCA usar; leadvitta-app eh ok = nome do projeto GCP)
//  - Auth0 (feat/auth0 esta parado; Firebase Auth eh o oficial v1)
// Regras vivem em CLAUDE.md como prosa; este hook as torna mecanicas.
// Docs (*.md) e o proprio diretorio .claude/ sao isentos (podem citar os termos).

const chunks = [];

for await (const chunk of process.stdin) {
  chunks.push(chunk);
}

const rawInput = Buffer.concat(chunks).toString("utf8").trim();
if (!rawInput) {
  process.exit(0);
}

let event;
try {
  event = JSON.parse(rawInput);
} catch {
  console.error("[prod-invariant-guard] Bloqueado: nao consegui ler o evento do hook.");
  process.exit(2);
}

const input = event.tool_input || {};

function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  return value == null ? [] : [value];
}

function normalizePath(filePath) {
  return String(filePath || "").replace(/\\/g, "/");
}

function collectTargetPaths() {
  return asArray(input.file_path)
    .concat(asArray(input.path))
    .filter(Boolean)
    .map(normalizePath);
}

function collectNewText() {
  const texts = [];

  if (typeof input.content === "string") {
    texts.push(input.content);
  }
  if (typeof input.new_string === "string") {
    texts.push(input.new_string);
  }
  if (Array.isArray(input.edits)) {
    for (const edit of input.edits) {
      if (edit && typeof edit.new_string === "string") {
        texts.push(edit.new_string);
      }
    }
  }

  return texts;
}

const paths = collectTargetPaths();

// Isencao: documentacao e arquivos de configuracao do Claude podem citar os termos.
const isExempt = paths.some(
  (p) => /\.(md|mdx)$/i.test(p) || p.includes("/.claude/"),
);
if (isExempt) {
  process.exit(0);
}

const invariants = [
  {
    label: "dominio proibido leadvitta.com",
    // leadvitta.com (parqueado) — NAO confundir com leadvitta-app (projeto GCP legitimo).
    regex: /leadvitta\.com/i,
    hint: "Use leadbellus.com.br (host real na Vercel). leadvitta.com eh placeholder parqueado da HostGator.",
  },
  {
    label: "variavel de ambiente AUTH0_",
    regex: /\bAUTH0_[A-Z0-9_]+/,
    hint: "Auth0 esta parado (feat/auth0). Firebase Auth eh o auth oficial v1. Nao adicione AUTH0_*.",
  },
  {
    label: "dependencia Auth0 (@auth0/...)",
    regex: /@auth0\//,
    hint: "Nao adicione libs Auth0. Use Firebase Auth (lib/firebase/).",
  },
];

const newText = collectNewText().join("\n");
const violations = invariants.filter((inv) => inv.regex.test(newText));

if (violations.length > 0) {
  const lines = ["[prod-invariant-guard] Bloqueado: o conteudo novo viola invariante de producao."];
  for (const v of violations) {
    lines.push(`- ${v.label}: ${v.hint}`);
  }
  lines.push("Se for intencional (ex.: migracao deliberada), ajuste/skip este hook em .claude/settings.json.");
  console.error(lines.join("\n"));
  process.exit(2);
}

process.exit(0);
