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

- **FS-0.1 · T2 — package skeletons + dependency-boundary lint** (#50 ·
  [PR #3](https://github.com/hbulgarini/mn-passport-sdk/pull/3), merged
  2026/07/29) — the seven `packages/*` skeletons, two-layer boundary
  enforcement over one shared graph module (import-level lint including
  dynamic `import()` and `core` platform-neutrality; manifest + tsconfig
  test with transitive `connect → core` closure), the wiring smoke test,
  and the `.npmrc` posture (`save-exact`, `ignore-scripts`).

## In progress

- **FS-0.1 · T3 — CI activation** (#50) — `pr-checks.yml` now runs lint,
  format, build, and test in a dedicated job, adds the `gitignore-backstop`
  job (no register path tracked, ignore rule effective), drives Node from
  `.nvmrc` (`node-version-file`), and pins both actions by commit SHA —
  resolving three register entries on their recorded T3 trigger and
  narrowing a fourth (the Node patch pin remains open). Watchers confirmed
  per acceptance §7.4: the plugin's skills drove the whole spec; the
  `deps` drift check ran (two deliberate major holds recorded); the
  `devenv` doctor is green on toolchain and debts repo, with the Compact
  CLI and proof server absent — open in the verify register, first needed
  by FS-0.2/FS-0.5. Finishes FS-0.1. Branch `feat/fs-0.1-t3-ci`.

## Backlog

- **FS-0.2–FS-0.8** (`#TBD`) — authored specs in
  [`docs/roadmap/specs/M0-Foundations/`](./docs/roadmap/specs/M0-Foundations/);
  not planned — each still needs its GitHub issue (no issue, no plan).
