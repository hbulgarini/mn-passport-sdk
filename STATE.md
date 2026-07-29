# STATE — Midnight Passport SDK

> The committed record of SDK development, maintained by
> `mn-passport-skills:spec-driver` per [`docs/development-workflow.md`](./docs/development-workflow.md) §3.
> Every entry carries its GitHub issue
> ([midnightntwrk/passport](https://github.com/midnightntwrk/passport/issues)).
> Last updated: 2026/07/29.

## Done

- **Workflow wiring** (#50) — the `mn-passport-skills` plugin (renamed from
  `mn-skills`), the CI gate, `STATE.md`, and the `.mn-passport-skills/`
  gitignore entry, landed directly on `main` in `c7c9b9b` (2026/07/29) ahead
  of the FS-0.1 tranches; T3 adds the CI backstop on top.
- **FS-0.1 · T1 — workspace root** (#50 ·
  [PR #2](https://github.com/hbulgarini/mn-passport-sdk/pull/2), merged
  2026/07/29) — pnpm workspaces (spec D-9, pnpm@10.33.0 via corepack), the
  strict base `tsconfig`, Prettier, the Node 22 baseline, root scripts, and
  the exact-pinned committed lockfile; the CI gate and cooldown script speak
  pnpm.

## In progress

- **FS-0.1 · T2 — package skeletons + dependency-boundary lint** (#50) —
  the seven `packages/*` skeletons (`export {}` entrypoints, workspace
  edges exactly the architecture §4.4 graph), the import-level boundary
  lint (`pnpm lint`), the manifest-level graph test with transitive
  `connect → core` closure, the wiring smoke test, and the `.npmrc`
  supply-chain posture (`save-exact`, `ignore-scripts` — resolving two
  register entries). Branch `feat/fs-0.1-t2-skeletons`.

## Backlog

- **FS-0.1 · T3 — CI activation** (#50) — extend `pr-checks.yml`: run build +
  test in the format-lint job, add the gitignore backstop
  (`.mn-passport-skills/` never tracked). Reduced from the spec's original T3:
  the plugin rename, `STATE.md`, and `.gitignore` already landed on `main`
  (2026/07/29). Waiting on T2 merge.
- **FS-0.2–FS-0.8** (`#TBD`) — authored specs in
  [`docs/roadmap/specs/M0-Foundations/`](./docs/roadmap/specs/M0-Foundations/);
  not planned — each still needs its GitHub issue (no issue, no plan).
