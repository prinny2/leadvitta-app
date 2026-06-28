import { spawnSync } from "node:child_process";

function run(command, args, opts = {}) {
  return spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  });
}

function hasJava() {
  const result = spawnSync("java", ["-version"], {
    stdio: "ignore",
    shell: process.platform === "win32",
  });
  return !result.error && result.status === 0;
}

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const requireEmulator = process.env.REQUIRE_FIREBASE_EMULATOR === "1";

const staticCheck = run(npmCmd, ["run", "firebase:check"]);
if (staticCheck.error) {
  console.error(`[firebase:verify] ${staticCheck.error.message}`);
  process.exit(1);
}
if (staticCheck.status !== 0) process.exit(staticCheck.status ?? 1);

if (!hasJava()) {
  const message = [
    "[firebase:verify] Static Firebase checks passed.",
    "[firebase:verify] Firestore emulator check skipped: Java is not available in PATH.",
    "[firebase:verify] Install JRE/JDK 21+ and run npm run firebase:emulator:check.",
  ].join("\n");
  if (requireEmulator) {
    console.error(
      `${message}\n[firebase:verify] REQUIRE_FIREBASE_EMULATOR=1 makes this required.`,
    );
    process.exit(1);
  }
  console.warn(message);
  process.exit(0);
}

const emulatorCheck = run(npmCmd, ["run", "firebase:emulator:check"]);
if (emulatorCheck.error) {
  console.error(`[firebase:verify] ${emulatorCheck.error.message}`);
  process.exit(1);
}
process.exit(emulatorCheck.status ?? 1);
