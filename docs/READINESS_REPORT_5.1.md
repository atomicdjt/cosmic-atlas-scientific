# Cosmic Atlas Scientific 5.1.0 — release readiness evidence

Prepared `5.1.0` from branch `improve/review-readiness-v5.1`, based on v5.0.1 main (`8ddf104da2626733e4d15e9696f4e99340ea0eb6`). This report records local build, browser, readiness and performance evidence for the release candidate; hosted CI, merge, tag and deployment are verified separately against their final hosted records.

The previously released v4 baseline, v5.0.0 and v5.0.1 remain intact. The 5.1.0 release uses the same supplied catalogs, source snapshots and scientific assumptions. `hosted/` is the production standalone deployment payload, updated as part of this release.

## Product changes and purpose

- Cancellable imports from File or text, with reading/parsing, row-validation and upload status. Newest job wins; failed/cancelled jobs preserve the prior catalog/source/buffers and successful imports clear obsolete imported selections.
- Worker normalization uses the same pure functions as the main-thread fallback. Three pending batches of 1,000 records bound queued structured clones; numeric position/color/size buffers transfer directly. WebGL consumes typed arrays without a duplicate typed-array conversion. Raw scientific records and source claims remain intact.
- Numeric filters avoid per-record temporary arrays. Filter results and table ordering are cached. Closed tables/diagrams defer expensive work. Filter and epoch buffer replacements stage before committing; simulated allocation failures preserve prior state.
- Cold picking scans without allocating a whole grid, caches a local neighborhood, and builds settled-view grids incrementally. Camera, catalog, filters, layer state, epoch and viewport are in the invalidation contract.
- Dense rendering adjusts point footprint / canvas resolution and retains every filtered record and export field. Persistent orientation explains nonlinear scale and mixed data classes; inspector detail exposes source epoch, distance kind, formal uncertainty, parallax and RUWE with missing-value caveats.
- Browser zoom is enabled. Dialogs isolate background content, contain focus and return focus to visible controls, including mobile sidebars. Reduced-motion preference changes take effect during the session.
- VERSION plus fixed build inputs determine visible identity. Standalone/development identities agree. Static offline policy, current QA metadata, source documentation, citation metadata and the versioned technical review guide were updated together.

No catalog rows, source snapshots, cosmological parameters, physical assumptions, posterior distances, extinction corrections or cross-catalog identity merges were added or altered.

## Validation and artifact identity

Standalone `dist/Cosmic_Atlas_Standalone.html`: 9,318,151 bytes. Build ID: `CA-SCI-5.1.0-b56863604d12`.

SHA-256: `bcccbc9cf2daf276d06c0dd9954df134399fc1e22bfcec3fd347c7138366f6e3`. `hosted/index.html` has the same SHA-256.

- `python scripts/run_qa.py`: PASS on 5.1.0 — deterministic build/syntax/DOM/offline checks; 32 scientific Node checks; 22 Python tests covering pipeline/schema/source manifests/baseline integrity/reproducibility; Python script compilation. Results are in `qa/v5/validation_results.json` and `qa/v5/build.json`.
- `python tests/browser_qa.py`: PASS on the 5.1.0 standalone — Chromium desktop, Chromium mobile emulation, modular development edition, Firefox desktop. Browser contexts explicitly offline; no HTTP(S) runtime requests or page errors recorded. Imported raw-source round trips, scientific guards, table/search/filter/epoch paths passed. Results and artifact hash are in `qa/v5/browser.json`.
- `python tests/readiness_qa.py`: PASS on 5.1.0 — Chromium, Firefox, 390x844 mobile emulation; 29 checks per configuration including cancellation during validation, superseding jobs, late duplicate failure, fallback parity/cancellation, allocation rollback, alias epoch/export, stale selections, keyboard modal flow, live reduced-motion changes and independent reference-grid picking after resize. Results are in `qa/readiness/behavior.json`.
- `python tests/benchmark_readiness.py --label before --artifact <exact base standalone> --output qa/readiness/performance-before.json` and `python tests/benchmark_readiness.py --label after --output qa/readiness/performance-after.json`: both six-case runs passed with no page errors or external requests. Before artifact SHA-256: `e987d72c10c5c91c7a3f29cc45ad592693d627d29cc2b151c5fbc26b14a6c8d8`. Command provenance is in `qa/readiness/commands.json`; final result data are in `performance-before.json` and `performance-after.json`. The initial Firefox 50k startup crash from an earlier attempt is retained in `benchmark-attempt-1.*` and is not part of the successful final run.

Offline confirmation combines static checks and actual file:// browser operation with offline contexts. Source-document links remain deliberate user actions. Development/test tools are not runtime dependencies. Build reproducibility is verified by two byte-identical builds in the Python suite. The v4 standalone hash remains `6fb8b0bc99f1eba486056e1d0b9e19c7c81cc6ab2d010bc15dbb3dd4158cc101`.

## Before / after measurements

Windows-10-10.0.19045-SP0. Chromium 151.0.7922.34 used explicit ANGLE/Vulkan SwiftShader software rendering. Firefox 153.0 reported `ANGLE (AMD, Radeon R9 200 Series Direct3D11 vs_5_0 ps_5_0), or similar`; this browser-reported string is not independent hardware identification. Both used 1440x1000 CSS pixels, DPR1, reduced motion, fixed initial camera, genuine 5k/20k/50k files, S/N20 filtering, 1s settle and 4s frame samples. Runs were sequential. Each row is a short sample, not a statistical estimate or sustained/thermal guarantee. Startup includes embedded 5k loading; cold pick explicitly invalidates the grid; cached pick uses an adjacent point. Filter timing includes buffer submission/UI work; first table timing includes any deferred initial sort, and cached table timing is the next refresh of the same selection. A closed diagram now defers drawing, so this measures the default closed-workbench workflow rather than an open-diagram workload.

| Browser / rows | Startup ms before → after | Import ms before → after | Cold pick ms before → after | Cached adjacent pick ms before → after | Filter interaction ms before → after | First table refresh ms before → after | Cached table ms before → after |
|---|---:|---:|---:|---:|---:|---:|---:|
| chromium / 5k | 795.8 → 593.4 | 140.7 → 154.7 | 11.0 → 3.4 | 0.1 → 0.0 | 50.5 → 13.6 | 8.5 → 9.9 | 8.7 → 2.7 |
| chromium / 20k | 672.6 → 654.9 | 1739.9 → 1612.0 | 17.8 → 7.5 | 0.1 → 0.1 | 152.7 → 32.5 | 67.8 → 48.1 | 56.6 → 3.6 |
| chromium / 50k | 661.7 → 819.7 | 3531.3 → 2594.4 | 33.2 → 16.6 | 0.1 → 0.2 | 319.1 → 69.5 | 166.7 → 121.9 | 188.0 → 3.2 |
| firefox / 5k | 3035.5 → 877.4 | 302.0 → 349.0 | 6.0 → 2.0 | 0.0 → 0.0 | 39.0 → 7.0 | 15.0 → 13.0 | 15.0 → 2.0 |
| firefox / 20k | 849.4 → 663.6 | 1398.0 → 971.0 | 19.0 → 6.0 | 0.0 → 0.0 | 200.0 → 15.0 | 123.0 → 115.0 | 122.0 → 3.0 |
| firefox / 50k | 829.9 → 645.7 | 2827.0 → 2294.0 | 42.0 → 10.0 | 1.0 → 0.0 | 523.0 → 30.0 | 320.0 → 319.0 | 291.0 → 2.0 |


| Browser / rows | p50 ms before → after | p95 ms before → after | p99 ms before → after | Max ms before → after | >100 ms stalls before → after | Samples before → after |
|---|---:|---:|---:|---:|---:|---:|
| chromium / 5k | 16.7 → 16.7 | 49.9 → 33.4 | 50.0 → 50.0 | 50.0 → 50.1 | 0.0 → 0.0 | 171.0 → 178.0 |
| chromium / 20k | 33.3 → 33.3 | 50.0 → 50.0 | 66.6 → 66.7 | 66.7 → 66.8 | 0.0 → 0.0 | 130.0 → 133.0 |
| chromium / 50k | 33.4 → 33.3 | 83.3 → 83.3 | 100.1 → 83.3 | 783.2 → 83.4 | 2.0 → 0.0 | 93.0 → 106.0 |
| firefox / 5k | 6.9 → 6.9 | 7.0 → 7.0 | 7.0 → 7.0 | 13.9 → 7.0 | 0.0 → 0.0 | 578.0 → 579.0 |
| firefox / 20k | 6.9 → 6.9 | 13.9 → 7.0 | 13.9 → 7.0 | 20.8 → 7.0 | 0.0 → 0.0 | 541.0 → 577.0 |
| firefox / 50k | 6.9 → 6.9 | 7.0 → 7.0 | 7.0 → 7.0 | 13.9 → 13.9 | 0.0 → 0.0 | 573.0 → 576.0 |


| Browser / rows | Largest 20 ms timer gap during import, ms before → after | Coarse JS heap MB before → after |
|---|---:|---:|
| chromium / 5k | 27.8 → 28.0 | 81.4 → 50.4 |
| chromium / 20k | 1285.2 → 986.2 | 123.0 → 91.7 |
| chromium / 50k | 1059.9 → 1353.2 | 269.0 → 188.0 |
| firefox / 5k | 63.0 → 42.0 | unavailable → unavailable |
| firefox / 20k | 439.0 → 65.0 | unavailable → unavailable |
| firefox / 50k | 676.0 → 63.0 | unavailable → unavailable |


Import totals include staging and commit work and differ from complete file-selection-to-ready wall time. The 20ms timer probe spans file input and import, includes scheduler/GC effects, and is not a pure JS task-duration profiler. CPU upload submission timing does not establish GPU completion. Heap readings are coarse, may vary with GC and exclude worker/GPU/process memory; Firefox does not expose the same heap API. One earlier benchmark attempt crashed the Firefox target during startup of the 50k case, before its import. The failed log and artifact identity are retained in `qa/readiness/benchmark-attempt-1.*`. A subsequent full six-case run passed; the cause of the crash is not established. Short frame intervals can conceal pauses outside the sampled window. No broad browser, physical-device or universal FPS claim is justified.

## Remaining gates and limitations

Independent astrometry, cosmology and scientific-visualization review remains open; focused questions are in `TECHNICAL_REVIEW_5.1.md`. Scientific assumptions and existing caveats remain: inverse-parallax approximation, no zero-point/extinction/covariance/posterior treatment, bounded linear epoch display, selected rather than complete surveys, literature snapshot core, qualified Betelgeuse exclusion, illustrative CMB/procedural geometry and distinct local/comoving distance semantics.

Original application code and project documentation use MIT under the root `LICENSE` and scope note. Existing Gaia/BSC5/OpenNGC attribution and dataset terms remain separate. The browser/device evidence below does not claim independent astronomy review, screen-reader certification, or physical phone/Safari validation. No expert contact is represented by this report.

Physical iOS/Android/Safari, real screen readers, human accessibility/contrast/reflow evaluation, touch selection, sustained memory/thermal testing and independent scientific acceptance are unverified. WebGL remains required for application bootstrap; no non-WebGL fallback or automatic context-resource restoration is claimed. Cold/moving picking remains O(n); closed-panel optimizations do not remove the cost of opening a full diagram/sort. The Worker-less JSON parser is synchronous and cannot be cancelled mid-parse; validation can be cancelled at yields. Upload/commit are synchronous. Limits are 100k rows and 256 MiB file input (string cap uses code units).

The evidence supports a material improvement in failure containment, scientific discoverability and keyboard operation, and environment-specific responsiveness improvements shown above. Review readiness is stronger because semantics, provenance, questions and reproducible evidence are consolidated. It does not establish scientific endorsement, WCAG conformance, or physical-device certification.

## Exact changed files

The complete repository-relative change list and per-file SHA-256 values are in [`qa/readiness/changed-files.json`](../qa/readiness/changed-files.json). The manifest is compared with the stated base commit and omits only itself to avoid a self-referential hash. This release-readiness artifact is a review overlay, not a full data release; unchanged source datasets and the frozen historical standalone remain in the project.
- `src/app/shell.html`
- `src/catalog/filtering.js`
- `src/catalog/gpu-upload.js`
- `src/catalog/import.js`
- `src/catalog/normalize.js`
- `src/catalog/render-data.js`
- `src/interaction/keyboard.js`
- `src/interaction/spatial-index.js`
- `src/modules.json`
- `src/render/buffers.js`
- `src/render/particles.js`
- `src/render/viewport.js`
- `src/styles/app.css`
- `src/ui/accessibility.js`
- `src/ui/data-table.js`
- `src/ui/overview.js`
- `src/ui/provenance.js`
- `src/ui/science-workbench.js`
- `src/ui/search.js`
- `tests/benchmark_readiness.py`
- `tests/browser_qa.py`
- `tests/readiness_qa.py`
- `tests/test_readiness.py`
