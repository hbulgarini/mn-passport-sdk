# Midnight Passport SDK

The developer SDK for **Midnight Passport** — the user-facing identity and
wallet layer for the Midnight network. The SDK is the primary programmatic
surface for a user's **Account Custody Contract (ACC)**: onboarding,
authentication, scoped grants, recovery, storage, proving, and the dApp
connector all resolve to authorised interactions with that on-chain account.

> **Status:** planning / spec, with a reduced **beta (v1)** defined. This
> repository will host the SDK packages as they are built.

## Documentation

The design lives in [`docs/`](./docs):

- [`sdk-requirements.md`](./docs/sdk-requirements.md) — what the SDK must do, and why.
- [`architecture.md`](./docs/architecture.md) — how it's built: layered core, seams, adapters, worked examples.
- [`development-workflow.md`](./docs/development-workflow.md) — the `mn-skills-*` skills that drive development, spec orchestration, and PR / issue traceability.
- [`beta-scope.md`](./docs/beta-scope.md) — the reduced first version.

Component (`[C…]`) and promise (`[P…]`) references in these docs point to the
Midnight Passport **planning workspace**
([midnightntwrk/passport → `docs/plans`](https://github.com/midnightntwrk/passport/tree/main/docs/plans)),
where the component canvases and promises are maintained.

## Packages (planned)

Published under the `@midnight-ntwrk/` scope:

- `mn-passport-core` — kernel, flows, and seam interfaces (wallet / agent side).
- `mn-passport-protocol` — shared C23 wire types (dApp ↔ wallet).
- `mn-passport-contract` — typed ACC bindings over the externally-owned contract artefact.
- `mn-passport-connect` — the thin dApp-side connector.
- `mn-passport-adapter-*` — platform (browser, node) and seam adapters (signer, prover, storage, …).

## Development

Development is spec-driven and harness-assisted — see
[`docs/development-workflow.md`](./docs/development-workflow.md). Every spec is
planned into small, reviewable PRs anchored to a GitHub issue; progress and
backlog will be tracked in `STATE.md` once development starts.
