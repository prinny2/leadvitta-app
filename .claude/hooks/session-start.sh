#!/bin/bash
# SessionStart hook for LeadBellus (Claude Code on the web).
# Installs dependencies so `npm run build` and the /api/health smoke check work
# out of the box. Runs synchronously: the session starts only after deps exist.
#
# Note: the web VM ships Node 22 while the Dockerfile uses Node 20. Next.js 15
# builds fine on Node 22; production parity is still enforced by the Dockerfile.
set -euo pipefail

# Only run in the remote (web) environment.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
cd "$PROJECT_DIR"

# `npm install` (not `npm ci`) so the cached container layer is reused on
# resume; idempotent if node_modules already exists.
echo "[session-start] npm install (Node $(node -v))..." >&2
npm install --no-fund --no-audit >&2

echo "[session-start] done." >&2
