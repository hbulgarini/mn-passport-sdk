// FS-0.2: the binding axis goes live here — the committed pin of the
// externally-owned ACC artefact (architecture §4.6, §8 decision 2). Typed
// callers land in T2; integrity errors in T3.
export {
  ACC_MANIFEST,
  BINDING_VERSION,
  type AccManifest,
  type CircuitPin,
} from './manifest.generated.js';
