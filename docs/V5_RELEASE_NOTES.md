# Cosmic Atlas Scientific 5.0.0

Build: CA-SCI-5.0-2026-09-26.

v5 preserves the v4 visual identity, seeded procedural context, curated landmarks and offline design while adding reproducible real catalogs and a maintainable generated-source workflow.

- 52 source modules plus HTML shell and CSS; deterministic standalone and development builds.
- Genuine Gaia DR3 5k embedded offline; optional 20k/50k, full BSC5 and OpenNGC bundles with raw snapshots and manifests.
- Explicit angular-only override, high-S/N parallax inference, retained quality/provenance fields, no zero-coercion of missing coordinates, unsafe numeric-ID rejection, atomic duplicate-ID and GPU-buffer failure handling.
- Runtime imports remain external/unverified and measurement-ineligible regardless of file-supplied tier or eligibility claims; malformed colors fall back safely.
- Scientific filters shared across atlas, search, table, diagram and exports; 100-row table pages and sorting.
- Linked uncorrected Gaia color–magnitude diagram and bounded linear proper-motion epoch display.
- Stable angular/3D calculations, context/model and incompatible-distance safeguards, optional radial-only uncertainty.
- Inline worker parsing, chunked normalization, density-dependent point sizes, scale-gated outer context, throttled telemetry, dense-catalog blur removal and on-demand screen-grid picking.
- Mobile touch paths retained, larger targets, focus indicators, keyboard-search/table paths and dialog focus containment.
- Wolfram numerical fixtures, Consensus/Scite literature audit, schema and catalog QA, browser tests, screenshots, and measured performance.

Scientific limitations: no full covariance, extinction or zero-point correction, probabilistic distance inference, relativistic/perspective epoch propagation, orbit prediction or survey reconstruction. The CMB texture remains synthetic. The curated core is an adopted literature snapshot, not an exhaustive current catalog audit. Betelgeuse is visibly qualified and excluded from physical separation.

Engineering limits: classic source modules still share lexical state; first picking after a view change is O(n); raw metadata increases memory use; JSON parsing/structured transfer can still cause startup stalls; physical phone/Safari QA is not claimed; GPU upload timings are CPU submission timings. See the completion report and `qa/v5/browser.json` for measured device-specific limits.
