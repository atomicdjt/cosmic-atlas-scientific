# Audit and implementation plan

Base: main 62f202c; frozen v5.1.0 tag preserved. Audited tracked file inventory,
history and foundation commit 10726d8, release methodology/licensing/schema,
all new scientific modules, rendering, import workers, and QA entry points.
Baseline static/scientific QA: 39 Node assertions, 22 Python tests pass.
Browser baseline is recorded separately, including existing harness failures.

Complete: embedded Gaia, source-preserving transactional import/export,
filters/search/table, epoch safeguards, offline deterministic build, v5.1 QA.
Partial: Verlet (step count reset, weak malformed-input checks, missing angular
momentum diagnostics), observer (mean-sidereal approximation), Hohmann.
Contract only: catalog packs, terrain. Missing: ephemeris assets, Lambert.
Unsuitable without additional data/validation: precision pointing, operational
navigation, full mission certification, production terrain fabricated from metadata.

1. Pin raw Horizons geometric ICRF barycentric vectors and held-out midpoint
   queries; build a bounded six-hour Hermite asset, refuse extrapolation, embed
   offline, provide explicit TDB/frame/source metadata and relative states.
2. Keep approximate observer mode; add explicit UTC/TT/TDB contracts with
   caller-supplied leap-second offset and documented approximate TT-TDB.
3. Retain symplectic Verlet for small non-collision systems; correct bookkeeping,
   fail on invalid/coincident inputs, add conservation/convergence diagnostics.
4. Add bracketed zero-revolution universal-variable Lambert, validate analytical
   and published cases, cancellable worker grid with C3/v-infinity provenance.
5. Build real HEALPix RING NDJSON packs with astropy-healpix at build time;
   local-file streaming worker, verified hashes, conservative source caps,
   cancellable viewport requests, bounded cache and progressive GPU publication.
6. Expose scientific tools in a visible workspace with orbit plots, result export,
   numerical quality and precise limitations. Preserve baseline atlas semantics.
7. Add independent fixtures, browser/regression/benchmark evidence, documents,
   hosted CI, coherent commits and PR; merge only all checks green. No release.
