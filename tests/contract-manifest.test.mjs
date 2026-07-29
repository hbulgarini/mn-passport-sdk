// Guards the FS-0.2 binding pin: the committed manifest must be well-formed
// and carry the artefact's per-file content hashes (ADR 0004 — compilation
// is deterministic, so the committed hashes are re-derivable from the
// pinned source and toolchain), and the local artefact directory (when
// present) must match those committed hashes byte-for-byte. Loader-level
// verification and ZkArtifactIntegrityError are T3's.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

const { ACC_MANIFEST, BINDING_VERSION } = await import(
  new URL('../packages/contract/dist/index.js', import.meta.url).href
);

test('the binding pin is set, provisional, and self-consistent', () => {
  assert.match(BINDING_VERSION, /^\d+\.\d+\.\d+/);
  assert.equal(ACC_MANIFEST.bindingVersion, BINDING_VERSION);
  assert.equal(ACC_MANIFEST.provisional, true, 'the prototype pin must declare itself provisional');
  assert.ok(
    ACC_MANIFEST.source.path.endsWith('account.compact'),
    'the pinned source must be the ACC',
  );
  assert.match(ACC_MANIFEST.source.sha256, /^[0-9a-f]{64}$/);
  for (const field of ['cliVersion', 'compilerVersion', 'languageVersion', 'runtimeVersion']) {
    assert.ok(ACC_MANIFEST.toolchain[field], `toolchain.${field} must be recorded`);
  }
});

test('every provable circuit must carry its keyLocation and content hashes', () => {
  const pins = Object.entries(ACC_MANIFEST.circuits);
  const provable = pins.filter(([, pin]) => pin.proof);
  assert.equal(pins.length, 15, 'the prototype ACC must pin 15 circuits (12 provable + 3 pure)');
  assert.equal(provable.length, 12, 'the prototype ACC must pin 12 provable circuits');
  for (const [name, pin] of pins) {
    if (pin.proof) {
      assert.equal(
        pin.keyLocation,
        `acc/${BINDING_VERSION}/${name}`,
        `${name}: keyLocation must be the extension-free, binding-versioned reference`,
      );
      for (const part of ['zkir', 'bzkir', 'verifierKey', 'proverKey']) {
        assert.match(
          pin.hashes?.[part] ?? '',
          /^[0-9a-f]{64}$/,
          `${name}: the ${part} hash must be committed`,
        );
      }
    } else {
      assert.equal(pin.keyLocation, undefined, `${name} is pure — it must carry no keyLocation`);
      assert.equal(pin.hashes, undefined, `${name} is pure — it must carry no hashes`);
    }
  }
  const moduleFiles = Object.keys(ACC_MANIFEST.moduleHashes);
  assert.ok(
    moduleFiles.includes('contract/index.js'),
    'the generated module must be hash-committed',
  );
});

test('the commitment pure circuits the deploy caller needs must be present', () => {
  for (const name of ['derive_device_commitment', 'derive_recovery_commitment']) {
    const pin = ACC_MANIFEST.circuits[name];
    assert.ok(pin, `${name} must be in the manifest`);
    assert.equal(pin.pure, true, `${name} must be pure`);
  }
});

test('the local artefact must match the committed hashes (skips when not built)', (t) => {
  const dir = new URL('../packages/contract/artefact/', import.meta.url);
  if (!existsSync(dir)) {
    t.skip(
      'artefact not built locally — run `pnpm run build:artefact` (needs compact + ../passport)',
    );
    return;
  }
  const check = (/** @type {string} */ rel, /** @type {string} */ expected) => {
    const actual = createHash('sha256')
      .update(readFileSync(new URL(rel, dir)))
      .digest('hex');
    assert.equal(actual, expected, `${rel} must match its committed hash`);
  };
  for (const [name, pin] of Object.entries(ACC_MANIFEST.circuits)) {
    if (!pin.proof || !pin.hashes) continue;
    check(`zkir/${name}.zkir`, pin.hashes.zkir);
    check(`zkir/${name}.bzkir`, pin.hashes.bzkir);
    check(`keys/${name}.verifier`, pin.hashes.verifierKey);
    check(`keys/${name}.prover`, pin.hashes.proverKey);
  }
  for (const [rel, expected] of Object.entries(ACC_MANIFEST.moduleHashes)) check(rel, expected);
});
