#!/usr/bin/env node

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
  console.error("[secret-guard] Bloqueado: nao consegui ler o evento do hook.");
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

function isRealEnvFile(filePath) {
  const normalized = normalizePath(filePath);
  const fileName = normalized.split("/").pop() || "";

  if (!fileName.startsWith(".env")) {
    return false;
  }

  return !/\.(example|sample|template)$/i.test(fileName);
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

const secretPatterns = [
  {
    label: "OpenAI API key",
    regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
  },
  {
    label: "Anthropic API key",
    regex: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/,
  },
  {
    label: "Stripe live secret key",
    regex: /\b(?:sk|rk)_live_[A-Za-z0-9]{16,}\b/,
  },
  {
    label: "Stripe webhook secret",
    regex: /\bwhsec_[A-Za-z0-9]{16,}\b/,
  },
  {
    label: "Google API key",
    regex: /\bAIza[0-9A-Za-z_-]{30,}\b/,
  },
  {
    label: "GitHub token",
    regex: /\b(?:(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{50,})\b/,
  },
  {
    label: "Slack token",
    regex: /\bxox[abpors]-[A-Za-z0-9-]{20,}\b/,
  },
  {
    label: "Meta/Facebook access token",
    regex: /\b(?:EAAG|EAA|AQ\.)[A-Za-z0-9_.-]{20,}\b/,
  },
  {
    label: "private key",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |)?PRIVATE KEY-----/,
  },
];

const envTargets = collectTargetPaths().filter(isRealEnvFile);
if (envTargets.length > 0) {
  console.error(
    [
      "[secret-guard] Bloqueado: tentativa de editar arquivo de ambiente real.",
      `Arquivo: ${envTargets[0]}`,
      "Use o painel seguro do provedor para secrets. No repo, edite apenas arquivos .env*.example sem valores reais.",
    ].join("\n"),
  );
  process.exit(2);
}

const detectedLabels = new Set();
for (const text of collectNewText()) {
  for (const pattern of secretPatterns) {
    if (pattern.regex.test(text)) {
      detectedLabels.add(pattern.label);
    }
  }
}

if (detectedLabels.size > 0) {
  console.error(
    [
      "[secret-guard] Bloqueado: o conteudo novo parece conter segredo.",
      `Detectado: ${Array.from(detectedLabels).join(", ")}`,
      "Nao cole chaves, tokens ou secrets no repo. Use o gerenciador de secrets da Vercel/Firebase/Stripe/etc.",
    ].join("\n"),
  );
  process.exit(2);
}

process.exit(0);
