import { spawnSync } from "node:child_process";

function run(command, args, opts = {}) {
  return spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  });
}

const java = run("java", ["-version"]);
if (java.error || java.status !== 0) {
  console.error(
    [
      "[firebase:emulator:check] Java não está disponível no PATH.",
      "Instale um JRE/JDK 17+ e rode novamente:",
      "  npm run firebase:emulator:check",
      "",
      "Sem Java, o Firebase CLI não consegue iniciar o Firestore emulator",
      "para carregar e validar firestore.rules dinamicamente.",
    ].join("\n")
  );
  process.exit(1);
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const result = run(npx, [
  "--yes",
  "firebase-tools",
  "emulators:exec",
  "--non-interactive",
  "--only",
  "firestore",
  "--project",
  "demo-leadbellus",
  "node -e \"console.log('Firestore emulator rules loaded')\"",
]);

if (result.error) {
  console.error(`[firebase:emulator:check] ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
