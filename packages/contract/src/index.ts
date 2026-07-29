// FS-0.2: the binding axis — the committed multi-version registry of the
// externally-owned ACC artefact (architecture §4.6, §8 decision 2; spec
// §4.1/D-8). The resolution surface (resolveBinding, detectDeployedVersion)
// lands in T1.5b; typed callers in T2; loader integrity in T3.
export {
  ACC_REGISTRY,
  type AccBinding,
  type AccRegistry,
  type CircuitHashes,
  type CircuitPin,
} from './manifest.generated.js';
