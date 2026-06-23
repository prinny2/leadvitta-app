#!/usr/bin/env node

// Bloqueia `git push` que cairia em `main` — a branch que faz deploy automatico
// na Vercel (= cobra clientes reais). Regra do CLAUDE.md/AGENTS.md:
// "cada agente trabalha na propria branch; nunca commitar direto na branch que faz deploy".
// Fluxo correto: push na feature branch -> PR -> merge em main pelo GitHub.
// Pushes em feature branches passam normalmente.

const DEPLOY_BRANCH = "main";

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
  // Em duvida sobre o evento, nao bloqueia comandos de shell.
  process.exit(0);
}

const input = event.tool_input || {};
const command = String(input.command || "");

// So nos importam comandos git push.
if (!/\bgit\b[\s\S]*\bpush\b/.test(command)) {
  process.exit(0);
}

function block(reason) {
  console.error(
    [
      "[deploy-branch-guard] Bloqueado: push que cairia em `main` (deploy automatico na Vercel).",
      reason,
      "Faca push na sua feature branch e abra um PR; o merge em main acontece pelo GitHub.",
      "Se for deploy deliberado, rode o push manualmente fora do agente ou ajuste .claude/settings.json.",
    ].join("\n"),
  );
  process.exit(2);
}

// Caso 1: refspec explicito mencionando a deploy branch.
//   git push origin main | git push origin HEAD:main | git push origin feat:main | git push -f origin main
const pushSegment = command.slice(command.search(/\bpush\b/));
if (new RegExp(`(^|[\\s:/])${DEPLOY_BRANCH}(\\b|$)`).test(pushSegment)) {
  block(`O comando referencia a branch de deploy "${DEPLOY_BRANCH}".`);
}

// Caso 2: push "pelado" (sem branch explicita) estando com a deploy branch em checkout.
//   git push | git push origin | git push -u origin
const looksBare = /\bpush\b\s*(?:(?:-[\w-]+|--[\w-]+(?:=\S+)?)\s*)*(?:origin\s*)?(?:(?:-[\w-]+|--[\w-]+(?:=\S+)?)\s*)*$/.test(
  pushSegment.trim(),
);
if (looksBare) {
  let currentBranch = "";
  try {
    const { execSync } = await import("node:child_process");
    const cwd = process.env.CLAUDE_PROJECT_DIR || event.cwd || process.cwd();
    currentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    currentBranch = "";
  }

  if (currentBranch === DEPLOY_BRANCH) {
    block(`Voce esta na branch "${DEPLOY_BRANCH}" e um push pelado iria direto pro deploy.`);
  }
}

process.exit(0);
