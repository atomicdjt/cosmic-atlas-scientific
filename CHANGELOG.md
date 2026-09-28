# Cosmic Atlas Scientific 5.0.1

Build: CA-SCI-5.0.1-2026-09-28.

Patch release: imported runtime catalogs are always marked external/unverified and cannot enable scientific measurements through file-supplied tier or eligibility fields. Imported source claims remain available in exported provenance. The catalog replacement path validates rendering values before use and stages GPU buffers before replacing live state, so a malformed or failed import preserves the active catalog and render state.

v5 preserves the v4 visual identity, seeded procedural context, curated landmarks and offline design while adding reproducible real catalogs and a maintainable generated-source workflow.

- 52 source modules plus HTML shell and CSS; deterministic standalone and development builds.
- Genuine Gaia DR3 5k embedded offline; optional 20k/50k, full BSC5 and OpenNGC bundles with raw snapshots and manifests.
- Explicit angular-only override, high-S/N parallax inference, retained quality/provenance fields, no zero-coercion of missing coordinates, unsafe numeric-ID rejection, atomic duplicate-ID failure.
- Scientific filters shared across atlas, search, table, diagram and exports; 100-row table pages and sorting.
- Linked uncorrected Gaia color–magnitude diagram and bounded linear proper-motion epoch display.
- Stable angular/3D calculations, context/model and incompatible-distance safeguards, optional radial-only uncertainty.
- Inline worker parsing, chunked normalization, density-dependent point sizes, scale-gated outer context, throttled telemetry, dense-catalog blur removal and on-demand screen-grid picking.
- Mobile touch paths retained, larger targets, focus indicators, keyboard-search/table paths and dialog focus containment.
- Wolfram numerical fixtures, Consensus/Scite literature audit, schema and catalog QA, browser tests, screenshots, and measured performance.

Scientific limitations: no full covariance, extinction or zero-point correction, probabilistic distance inference, relativistic/perspective epoch propagation, orbit prediction or survey reconstruction. The CMB texture remains synthetic. The curated core is an adopted literature snapshot, not an exhaustive current catalog audit. Betelgeuse is visibly qualified and excluded from physical separation.

Engineering limits: classic source modules still share lexical state; first picking after a view change is O(n); raw metadata increases memory use; JSON parsing/structured transfer can still cause startup stalls; physical phone/Safari QA is not claimed; GPU upload timings are CPU submission timings. See the completion report and `qa/v5/browser.json` for measured device-specific limits.
