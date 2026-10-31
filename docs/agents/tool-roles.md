# Tool roles — Claude Code, Codex, Xcode (no overlap)

Three tools touch this developer's machine. Each one owns a lane; a task is
routed by the table below and **only one tool works a branch at a time**.

## Lanes

| Tool | Owns | Never does |
|---|---|---|
| **Claude Code** (`claude`) | Architecture, multi-file refactors, infra/deploy, security, docs, service extraction, anything touching money or auth flows, final PR merge prep | Native Apple builds |
| **Codex** (`codex`, reads `AGENTS.md`) | Scoped single-issue implementation, unit tests, perf tweaks, PR review comments, mechanical migrations | Deploy/env changes, Stripe/Clerk/webhook code, repo-wide refactors |
| **Xcode** | Native Apple targets only: `~/voice-agent` macOS app wrapper, any future iOS client (`apps/ios/`) | Web code in this repo |

## Routing rule (decide in this order)

1. Does it compile with `xcodebuild`? → **Xcode**. Otherwise never Xcode.
2. Does it touch `lib/stripe`, `lib/billing*`, `middleware.ts`, `app/api/*/webhook`,
   `vercel.json`, `Dockerfile`, `cloudbuild.yaml`, env vars, or more than ~5
   files? → **Claude Code**.
3. Is there one issue, one route/component, one test file? → **Codex**.
4. Unsure → **Claude Code** plans, then hands Codex a scoped task.

## No-overlap mechanics

- **Branch prefix = owner.** `claude/*` (Claude Code), `codex/*` (Codex),
  `xcode/*` (Xcode). `copilot/*` and `vercel/*` are bots; humans and agents
  don't push to them.
- **One worktree per tool.** Claude Code runs in `.claude/worktrees/<name>`;
  Codex runs in its own clone or worktree under `~/Documents/Codex/`. Neither
  edits the main checkout at `~/leadvitta-app`.
- **Whoever opened the PR owns it.** The other tool may review (comments only),
  never push to that branch.
- **Route ownership.** New `/api/*` routes go in exactly one `SERVICE_ROLE`
  (`lib/service-role.ts`); the test suite fails on overlap, so two tools cannot
  silently claim the same surface.
- **Merge is human.** `main` is protected; the owner merges with
  `gh pr merge <n> --squash --admin`.

## Xcode prerequisite on this Mac

`xcode-select -p` currently points at CommandLineTools, so `xcodebuild` and
`simctl` fail. Fix once (needs password):

```bash
sudo xcode-select -s /Applications/Xcode.app
```

## Codex config that matters

`~/.codex/config.toml` already has `sandbox_mode = "workspace-write"` and
`~/leadvitta-app` trusted. Codex reads `AGENTS.md` at the repo root; the
"Agent lanes" section there mirrors this file. Keep both in sync.
