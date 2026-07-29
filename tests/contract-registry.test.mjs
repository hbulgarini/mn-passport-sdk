// Guards the FS-0.2 §4.1 multi-version binding registry data (D-8; ADR
// 0004): the committed registry must be well-formed, the TypeScript mirror
// must agree with the canonical JSON, and every locally built artefact
// version must match its committed hashes byte-for-byte. The resolution
// surface (resolveBinding, detectDeployedVersion) is T1.5b's; loader-level
// verification and ZkArtifactIntegrityError are T3's.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

const { ACC_REGISTRY } = await import(
  new URL('../packages/contract/dist/index.js', import.meta.url).href
);
const registryJsonUrl = new URL(
  '../packages/contract/acc-versions.generated.json',
  import.meta.url,
);
const SUPPORTED = Object.keys(ACC_REGISTRY.versions);

test('the registry is well-formed and current is a supported version', () => {
  assert.ok(SUPPORTED.length >= 1, 'the registry must hold at least one version');
  assert.ok(SUPPORTED.includes(ACC_REGISTRY.current), 'current must be a supported version');
  assert.equal(
    ACC_REGISTRY.versions[ACC_REGISTRY.current].provisional,
    true,
    'the prototype-era current pin must declare itself provisional',
  );
  for (const [version, binding] of Object.entries(ACC_REGISTRY.versions)) {
    assert.equal(typeof binding.provisional, 'boolean', `${version} must record its pin status`);
    assert.ok(
      binding.source.path.endsWith('account.compact'),
      `${version}: source must be the ACC`,
    );
    assert.match(binding.source.sha256, /^[0-9a-f]{64}$/);
    for (const field of ['cliVersion', 'compilerVersion', 'languageVersion', 'runtimeVersion']) {
      assert.ok(binding.toolchain[field], `${version}: toolchain.${field} must be recorded`);
    }
  }
});

test('the TypeScript mirror must agree with the canonical registry JSON', () => {
  const { $generatedBy, schemaVersion, ...json } = JSON.parse(
    readFileSync(registryJsonUrl, 'utf8'),
  );
  assert.equal($generatedBy, 'scripts/build-acc-artefact.mjs', 'the JSON must carry provenance');
  assert.equal(schemaVersion, 1, 'the JSON must carry its schema version');
  assert.deepEqual(
    json,
    structuredClone(ACC_REGISTRY),
    'manifest.generated.ts must mirror acc-versions.generated.json exactly',
  );
});

test('every version pins its full circuit inventory under its own keyLocations', () => {
  for (const [version, binding] of Object.entries(ACC_REGISTRY.versions)) {
    const pins = Object.entries(binding.circuits);
    const provable = pins.filter(([, pin]) => pin.proof);
    assert.equal(pins.length, 15, `${version} must pin 15 circuits (12 provable + 3 pure)`);
    assert.equal(provable.length, 12, `${version} must pin 12 provable circuits`);
    for (const [name, pin] of pins) {
      if (pin.proof) {
        assert.equal(
          pin.keyLocation,
          `acc/${version}/${name}`,
          `${version}/${name}: keyLocation must be the extension-free, version-scoped reference`,
        );
        for (const part of ['zkir', 'bzkir', 'verifierKey', 'proverKey']) {
          assert.match(
            pin.hashes?.[part] ?? '',
            /^[0-9a-f]{64}$/,
            `${version}/${name}: the ${part} hash must be committed`,
          );
        }
      } else {
        assert.equal(pin.keyLocation, undefined, `${name} is pure — it must carry no keyLocation`);
        assert.equal(pin.hashes, undefined, `${name} is pure — it must carry no hashes`);
      }
    }
  }
});

test('the commitment pure circuits the deploy caller needs must be present', () => {
  for (const name of ['derive_device_commitment', 'derive_recovery_commitment']) {
    const pin = ACC_REGISTRY.versions[ACC_REGISTRY.current].circuits[name];
    assert.ok(pin, `${name} must be in the current binding`);
    assert.equal(pin.pure, true, `${name} must be pure`);
  }
});

test('every locally built artefact version must match its committed hashes', (t) => {
  let verified = 0;
  for (const [version, binding] of Object.entries(ACC_REGISTRY.versions)) {
    const dir = new URL(`../packages/contract/artefact/${version}/`, import.meta.url);
    if (!existsSync(dir)) continue;
    verified += 1;
    const check = (/** @type {string} */ rel, /** @type {string} */ expected) => {
      const actual = createHash('sha256')
        .update(readFileSync(new URL(rel, dir)))
        .digest('hex');
      assert.equal(actual, expected, `${version}/${rel} must match its committed hash`);
    };
    for (const [name, pin] of Object.entries(binding.circuits)) {
      if (!pin.proof || !pin.hashes) continue;
      check(`zkir/${name}.zkir`, pin.hashes.zkir);
      check(`zkir/${name}.bzkir`, pin.hashes.bzkir);
      check(`keys/${name}.verifier`, pin.hashes.verifierKey);
      check(`keys/${name}.prover`, pin.hashes.proverKey);
    }
    for (const [rel, expected] of Object.entries(binding.moduleHashes)) check(rel, expected);
  }
  if (verified === 0) {
    t.skip(
      'no artefact built locally — run `pnpm run build:artefact` (needs compact + ../passport)',
    );
  }
});
