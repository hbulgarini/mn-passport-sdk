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

- **FS-0.1 · T3 — CI activation** (#50 ·
  [PR #4](https://github.com/hbulgarini/mn-passport-sdk/pull/4), merged
  2026/07/29) — the full gate (lint, format, build, test), the
  `gitignore-backstop` job, Node driven from `.nvmrc`, actions pinned by
  commit SHA. **FS-0.1 complete: issue #50 tranches 1–3 merged.**

## In progress

- **FS-0.2 · T1 — artefact ingestion + binding pin** (#50, reused for M0
  foundations) — `scripts/build-acc-artefact.mjs` compiles the prototype
  ACC (`compact` CLI, ~30 s, 12 provable circuits) into the gitignored
  artefact directory; the committed manifest pins the deterministic facts
  (source hash, toolchain, circuit table, and `keyLocation`s) and
  `BINDING_VERSION 0.0.0-prototype.1` `[PROVISIONAL]` — **including
  committed per-file content hashes** (**ADR 0004**: compilation is
  deterministic; ADR 0003's non-reproducibility finding was a false
  positive in our own drift check, since corrected). `--check` recompiles
  and must reproduce the committed pin; mutation-tested. Upstream
  [passport#116](https://github.com/midnightntwrk/passport/issues/116) was filed on the false finding — a full replacement
  body is drafted (the versioning-ownership decision: contract repository
  vs SDK release, with pros and cons) for the human to post. Branch `feat/fs-0.2-t1-artefact`.

## Backlog

- **FS-0.2 · T1.5 — multi-version binding registry** (#50) — spec D-8,
  raised at T1 review: the committed registry of all supported binding
  versions (`acc-versions.generated.json`), per-version artefact layout,
  the script's `--pin`/`--check <version>` modes, and `resolveBinding` —
  each account pins its version at deploy; the upgrade path is a roadmap
  §8 item (spec D-8, OQ-7); split out of T1 by the 600-line hard budget.
  Waiting on T1 merge.
- **FS-0.2 · T2 — typed deploy caller** (#50) — the deploy (constructor)
  caller over the generated module plus the pure commitment circuits;
  `assertBindingCompatible` over the supported set (D-8). Waiting on T1.5.
- **FS-0.2 · T3 — loader integrity** (#50) — `loadArtefact` verifying the
  committed hashes (ADR 0004); `ZkArtifactIntegrityError`. Waiting on T2.
- **FS-0.2 · claim-name caller** (#50) — **blocked**: the prototype has no
  name circuit and the C2 name-service artefact does not exist yet (spec
  OQ-4, human decision 2026/07/29). Resumes when the contract team
  publishes C2.
- **FS-0.3–FS-0.8** (`#TBD`) — authored specs in
  [`docs/roadmap/specs/M0-Foundations/`](./docs/roadmap/specs/M0-Foundations/);
  not planned — each still needs its GitHub issue (no issue, no plan).
