# FS-0.2 — ACC contract binding over the external artefact

> **Status:** draft · 2026/07/29 · authored by `mn-passport-skills:spec-author` (dry run)
> **Milestone:** M0 — Foundations ([`roadmap.md`](../../roadmap.md) §2).
> **Brief:** [`M0-foundations.md`](../../milestones/M0-foundations.md) § FS-0.2.
> **Backing:** [`sdk-requirements.md`](../../../sdk-requirements.md) §1.1,
> [`architecture.md`](../../../architecture.md) §4.4 and §4.6 (+ §8 decision 2),
> [`provider-integration.md`](../../../provider-integration.md) §5.1 and §6, and
> [`beta-scope.md`](../../../beta-scope.md) §3.
> **GitHub issue:** [midnightntwrk/passport#50](https://github.com/midnightntwrk/passport/issues/50)
> (reused from FS-0.1 by human decision, 2026/07/29 — one issue anchors M0's
> foundations work; OQ-1 resolved).

## 1. Objective

Make `@midnight-ntwrk/mn-passport-contract` a typed, version-pinned,
integrity-checked binding over the **externally-owned ACC artefact** — the
contract team's published build — so the SDK consumes the ACC without ever
owning or compiling it (architecture §8 decision 2). The ACC is the seat of
the account (requirements §1.1); this package is how every other package
reaches it.

Contributes the "`contract` builds" half of the M0 exit, and the **binding
version pin** the milestone names (roadmap §2 M0).

## 2. Scope

### In (brief, expanded)

- **Artefact ingestion** — `mn-passport-contract` wraps the published ACC
  build: the compiled contract module, the ZKIR, the verifier key, and the
  **`keyLocation`** references the proving & settlement service resolves
  prover keys by (brief; provider-integration §5.1, §6).
- **Typed circuit callers for the circuits beta needs** — **deploy ACC**
  only (human decision, 2026/07/29: the prototype has no name-claim circuit,
  so the claim-name caller **waits for the real C2 artefact** rather than
  binding a stand-in — resolves OQ-4). Recon facts the binding reflects:
  the ACC has **no deploy circuit** — deployment is the Compact
  **constructor** (`initial_device_commitment, recovery_commitment`), with
  the exported pure commitment circuits used to derive its arguments.
- **The pinned binding version** — one exact ACC artefact version, exported as
  the binding axis (`BINDING_VERSION`, reserved by FS-0.1 D-4), plus the
  connect-time version guard the compatibility contract requires (architecture
  §4.6, §8 decision 2).
- **Drift / integrity detection** — per
  [ADR 0004](../../../adr/0004-artefact-hashes-committed-compiler-deterministic.md):
  compilation is **deterministic** for a given source and toolchain (an
  earlier non-reproducibility finding, ADR 0003, was a false positive in
  our own drift check), so the committed manifest carries **per-file
  content hashes** of every consumed byte — re-derivable by anyone via
  recompile. A stale, swapped, or tampered artefact **fails loudly**
  (`ZkArtifactIntegrityError`, T3), and `--check` recompiles and compares.
  The hashes stay SDK-derived and `[PROVISIONAL]` until the contract team
  publishes official ones ([passport#116](https://github.com/midnightntwrk/passport/issues/116)).

### Out

- **dApp-contract bindings** (brief) — the deposit bindings `connect` rides
  are post-beta with the deposit mechanism itself (beta-scope §4).
- **ACC circuits beyond onboarding** (brief) — grants, devices, recovery, and
  deposit circuits arrive with their features.
- **Challenge construction** — `SHA-256(account ‖ circuit tag ‖ args ‖
  auth_nonce)` and `auth_nonce` reads belong to FS-1.1 (M1 brief); FS-0.2 only
  exposes the typed callers and circuit identity FS-1.1 builds on.
- **Prover keys in the package** — prover keys are fetched by the enclave from
  the public artefact host via `keyLocation`, never shipped from the device or
  bundled in the SDK (provider-integration §5.1 hardening 2, §6).
- **Compiling the contract in the shipped surface** — never; the SDK
  consumes the published build (architecture §8 decision 2). The dev-only
  prototype compile (`build:artefact`, D-6) exists precisely until that
  build is published; its output is gitignored and never packaged.

## 3. Decisions

| # | Decision | Rationale | Source |
|---|---|---|---|
| D-1 | The ACC artefact is **externally owned and versioned**; this package holds only typed bindings over the published build (compiled module, ZK assets, generated types). | Decouples SDK releases from contract recompilation and insulates the SDK from toolchain instability, which the contract team manages. | architecture §8 decision 2, §4.4 |
| D-2 | The artefact bundle carries **`keyLocation` strings, not prover keys** — the device resolves ZKIR/verifier key to build preimages; the enclave fetches and caches the 10–80 MB prover key itself. | Uploading prover keys per proof is the main mobile cost, and the keys are public. | provider-integration §5.1, §6 |
| D-3 | **One exact pinned artefact version**, exported as `BINDING_VERSION`, guarded at connect time against the deployed ACC (an SDK version resolves against a supported ACC version range). | The binding axis must never be conflated with the wire axis; the guard is the compatibility contract. | architecture §4.6, §8 decision 2 |
| D-4 | **Integrity by committed content hash** (ADR 0004): the manifest commits per-file hashes of every consumed artefact byte, alongside the source hash, toolchain, and circuit table. Any mismatch surfaces `ZkArtifactIntegrityError` before proving is attempted; `--check` recompiles and must reproduce the committed pin exactly. | Compilation is deterministic, so committed hashes are independently re-derivable — the strongest available pin until official published hashes replace ours ([passport#116](https://github.com/midnightntwrk/passport/issues/116)). | ADR 0004; provider-integration §5.1; brief |
| D-5 | Typed callers cover **deploy only** — the claim-name caller is deferred until the C2 artefact exists (human decision 2026/07/29, OQ-4). Deploy is the Compact **constructor**, so the caller shapes constructor arguments rather than a circuit call. | Beta's onboarding slice; a stand-in binding would freestyle an interface the docs have not set. | beta-scope §2 item 1, §3; brief; OQ-4 |
| D-6 | Development starts against the **prototype ACC** (`experiments/account-custody-prototype`), swapped for the contract team's published artefact when the gate opens — same binding surface, different pin. | The gate blocks integration, not the SDK-side build. | brief; roadmap §4; provider-integration §10 |
| D-7 | Package dependencies: no workspace package (FS-0.1 D-2); `midnight-js` is the one permitted external runtime dependency. | `contract` is a foundation package both `core` and `connect` may link; it must stay kernel-free. | architecture §4.4, §4.6 (container view) |
| D-8 | **The binding is a registry, not a single pin** (added 2026/07/29 at T1 review): `packages/contract/acc-versions.generated.json` commits every **supported** binding version — per-version source hash, toolchain, `keyLocation`s, and content hashes — with a `current` pointer; `manifest.generated.ts` is derived from it. Artefacts live per version (`artefact/<version>/`), and `assertBindingCompatible` checks the deployed ACC against the supported *set*. Adding a version appends an entry; retiring one is a reviewed deletion. | An SDK version must resolve against a supported ACC version **range**, not one hardcoded pin — older deployed contracts stay usable across artefact bumps; this is also the structure the `deps` watcher's compatibility matrix reads. | architecture §8 decision 2, §4.6; development-workflow §2 (deps); human finding at T1 review |

## 4. Surface and interfaces

> Indicative shapes, per architecture §4.6's convention — finalised at
> implementation within these constraints.

```ts
// ── the binding axis (architecture §4.6) ──
export const BINDING_VERSION: string;          // the exact pinned ACC artefact version

// ── the artefact (brief: circuit + ZKIR + verifier key + keyLocation) ──
export interface AccArtefact {
  version: string;                             // must equal BINDING_VERSION
  contractModule: unknown;                     // the compiled ACC (contract team's build)
  circuits: Record<CircuitName, {
    zkir: Uint8Array;
    verifierKey: Uint8Array;
    keyLocation: string;    // extension-free base; resolvers add layout + suffix (§5.1, §6)
  }>;
}
export type CircuitName = keyof typeof ACC_MANIFEST.circuits;   // the artefact inventory

export function loadArtefact(source: ArtefactSource): Promise<AccArtefact>;
// throws ZkArtifactIntegrityError on any hash/version mismatch (D-4)

export class ZkArtifactIntegrityError extends Error { /* circuit, expected, actual */ }

// ── typed circuit callers (deploy + name claim) ──
export function buildDeployArgs(args: {
  deviceCommitment: bigint;      // via derive_device_commitment (pure)
  recoveryCommitment: bigint;    // via derive_recovery_commitment (pure)
}): AccConstructorArgs;          // deploy = the Compact constructor (D-5)
// claimName waits for the C2 artefact (OQ-4); FS-1.1 turns typed calls
// into challenges + preimages

// ── the connect-time guard (architecture §8 decision 2) ──
export function assertBindingCompatible(deployedAccVersion: string): void;
// throws when the deployed ACC is outside the supported range
```

## 5. Flow

1. **Load** — `loadArtefact` reads the pinned artefact (bundled or fetched;
   OQ-2 decides the host), checks every circuit's content hash against the pin,
   and rejects with `ZkArtifactIntegrityError` on drift (D-4).
2. **Bind** — consumers get typed callers whose ZK-config references (ZKIR,
   verifier key, `keyLocation`) come from the verified artefact.
3. **Guard** — at connect time, `assertBindingCompatible` checks the deployed
   ACC's version against `BINDING_VERSION`'s supported range (D-3).

Neither the provider nor the proving & settlement service is called in this
spec. The `keyLocation` strings this package carries are consumed later by
`adapter-prover-remote` (FS-1.4) per provider-integration §3 steps 5–7 — the
enclave, not the device, resolves the prover key.

## 6. Dependencies

**Internal:** FS-0.1 (the workspace and the `contract` skeleton). Downstream,
this spec feeds FS-0.5 (ZK config + `keyLocation` for the local prove e2e),
FS-1.1 (call construction over the typed callers), and FS-1.4 (`keyLocation`
for remote proving), and the M2 connect work reads the deployed ACC it binds.

**External gate:** the **contract team** — a compiled/deployed ACC artefact
plus the name service (roadmap §4). **Mockable now:** development starts
against the prototype ACC (`experiments/account-custody-prototype`, D-6); the
pin swaps when the published artefact lands. The name-claim caller may also
need the C2 name-service artefact (OQ-4).

**Toolchain:** the Compact CLI to compile the prototype artefact locally
(`mn-passport-skills:devenv` gates this); `midnight-js` pinned per the 7-day
cooldown and exact-pin rules (development-workflow §2 deps).

## 7. Acceptance criteria

From the brief, made observable:

1. **Resolves the ACC artefact** — `loadArtefact` returns a verified
   `AccArtefact` for the pinned version wherever the artefact exists (built
   locally for the prototype; from the published bytes later — ADR 0003). On
   a clean checkout without the artefact, the binding surface still builds
   and the artefact-dependent tests skip loudly.
2. **Exposes the typed deploy caller** — it compiles against the generated
   types, and a consumer (the FS-0.1 wiring smoke test, extended) constructs
   the constructor arguments with typed inputs. (Claim-name: deferred, OQ-4.)
3. **Fails loudly on drift** — corrupt one verifier key (or bump the artefact
   version without moving the pin): `loadArtefact` rejects with
   `ZkArtifactIntegrityError` naming the circuit; nothing downstream runs.
4. **The binding axis is live** — `BINDING_VERSION` matches the pinned
   artefact, and `assertBindingCompatible` rejects a version outside the
   supported range.
5. The dependency-boundary rules still hold (`contract` gains no workspace
   dependency), and the tranche PRs pass the CI gate.

## 8. Verify plan

What `mn-passport-skills:verify` drives (brief):

- **Compile the ACC artefact** — build the prototype ACC with the Compact CLI
  (devenv confirms the toolchain) and run `loadArtefact` against the output.
- **Type-check the binding** — the typed callers against the generated types;
  a deliberate wrong-arg call must fail to compile.
- **Force a key mismatch** — mutate a verifier key byte; confirm
  `ZkArtifactIntegrityError` fires and names the circuit; revert.
- **Version guard** — feed `assertBindingCompatible` an out-of-range version;
  confirm rejection.
- **Mocks:** the prototype ACC artefact stands in for the contract team's
  published build (D-6) — recorded as `[PROVISIONAL]` in the verify register
  until the real artefact is pinned.

## 9. Proposed tranches

The brief's three, sized — a proposal for `spec-driver`, not the final gated
plan (estimates exclude generated code and fixtures):

| # | Tranche (brief) | Contents | Estimate |
|---|---|---|---|
| T1 | **Artefact ingestion + ZK-config wiring + version pin** | `AccArtefact`, `loadArtefact`, `BINDING_VERSION`, the prototype-artefact fixture wiring | ~8 files, ≤ 300 net lines |
| T1.5 | **Multi-version binding registry** (D-8; split out of T1 — the hard budget) | `acc-versions.generated.json`, per-version artefact layout (`artefact/<version>/`), script rework (`--pin <version>`, `--check [version]`), manifest derived from the registry, test updates | ~5 files, ≤ 200 net lines |
| T2 | **Typed deploy caller** (claim-name deferred, OQ-4) | `buildDeployArgs`, pure-commitment re-exports, generated-type mapping, `assertBindingCompatible` over the supported set (D-8), wiring-smoke extension | ~6 files, ≤ 250 net lines |
| T3 | **Drift / integrity check** | `loadArtefact` verifying the committed hashes (ADR 0004), `ZkArtifactIntegrityError`, `assertBindingCompatible`, mismatch tests | ~5 files, ≤ 200 net lines |

## 10. Respecting the normative MUSTs

| MUST | Status in FS-0.2 |
|---|---|
| Ceremony gate (requirements §2.2) | Not touched — no witness handling here; binds the kernel (FS-0.3) and flows (M1). |
| Encrypt the proof preimage to the enclave (§2.5) | Supported structurally — this package carries `keyLocation` and ZK-config only; preimage sealing lives with the kernel and the prover seam (FS-0.3, FS-0.5, FS-1.4). Nothing here handles a cleartext witness. |
| Deposit, not address (§3.12) | Not touched — deposit bindings are explicitly out (beta-scope §4). |
| `connect` never links `core` (architecture §4.4) | Preserved — `contract` stays a foundation package with no workspace dependencies (D-7), so `connect` may link it without reaching `core`. |
| Two version axes (§4.6) | **Actively encoded** — `BINDING_VERSION` + the connect-time guard are this spec's deliverable; the wire axis stays in `protocol`, untouched. |

## 11. Open questions

| # | Question | Route |
|---|---|---|
| OQ-1 | ~~GitHub issue~~ **Resolved 2026/07/29: #50, reused from FS-0.1** (one issue for M0 foundations). | Closed |
| OQ-2 | **The artefact host** (brief) — where the published build (prover/verifier keys + ZKIR) is served, and its integrity/versioning scheme. Also an open item on the provider side (provider-integration §9). | Contract team + service — now tracked as [passport#116](https://github.com/midnightntwrk/passport/issues/116); `doc-sync` when fixed |
| OQ-3 | **The exact ACC version pinned for beta** (brief) — unknowable until the contract team publishes; the prototype pin is `[PROVISIONAL]`. | Verify register; re-pin when [passport#116](https://github.com/midnightntwrk/passport/issues/116) delivers the published artefact |
| OQ-4 | ~~Name-claim location~~ **Resolved 2026/07/29: a separate contract, and no artefact exists yet.** The prototype ACC has no name circuit; the nearest implementation is the demo-grade `identity_registry.compact` in `demo/mn-passport-foundations`. Human decision: FS-0.2 binds **deploy only**; the claim-name caller is deferred until the contract team publishes the C2 artefact (backlogged with that reason, never silently dropped). | Closed; claim-name → backlog |
| OQ-5 | **Do the published builds include generated TypeScript types** (architecture §8 decision 2 says "generated types"), and are they stable enough to re-export as the caller types? | Confirm with the contract team at T2 |
| OQ-6 | ~~Compiler non-reproducibility~~ **Corrected 2026/07/29 (ADR 0004): compilation is deterministic** — the finding behind [passport#116](https://github.com/midnightntwrk/passport/issues/116) was a false positive (formatting artefact in our drift check); a full replacement body reframing #116 as the versioning-ownership decision (contract repository vs SDK release) is drafted. Remaining open validation: **cross-machine** reproducibility (verified on one machine only) — confirmed cheaply the first time a second machine runs `pnpm run build:artefact --check`. | Verify register; amend #116 (human) |
