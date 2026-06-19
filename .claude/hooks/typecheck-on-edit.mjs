#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";

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
  console.error("[typecheck-on-edit] Nao consegui ler o evento do hook.");
  process.exit(2);
}

const input = event.tool_input || {};
const filePath = String(input.file_path || input.path || "");
const normalizedPath = filePath.replace(/\\/g, "/");

if (
  !/\.(ts|tsx)$/i.test(normalizedPath) ||
  normalizedPath.includes("/node_modules/") ||
  normalizedPath.includes("/.next/")
) {
  process.exit(0);
}

const projectDir =
  process.env.CLAUDE_PROJECT_DIR ||
  event.cwd ||
  path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");

const result = spawnSync("npx", ["tsc", "--noEmit", "--pretty", "false"], {
  cwd: projectDir,
  encoding: "utf8",
  shell: process.platform === "win32",
  timeout: 120000,
});

if (result.error) {
  const reason =
    result.error.code === "ETIMEDOUT"
      ? "timeout depois de 120s"
      : result.error.message;
  console.error(`[typecheck-on-edit] TypeScript nao concluiu: ${reason}`);
  process.exit(2);
}

if (result.status !== 0) {
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  const excerpt = output.split(/\r?\n/).slice(-80).join("\n");
  console.error(
    [
      `[typecheck-on-edit] TypeScript falhou depois de editar ${normalizedPath}.`,
      "Corrija antes de push/deploy.",
      "",
      excerpt,
    ].join("\n"),
  );
  process.exit(2);
}

process.exit(0);
