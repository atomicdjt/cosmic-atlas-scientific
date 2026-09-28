# Developing and reproducing v5

The v4 ZIP, original manifests and original README are historical evidence. `v4.0.0-baseline` identifies the untouched 36-file release. Do not edit `src/Cosmic_Atlas_v4_source.html` or `standalone/Cosmic_Atlas_Scientific_v4.html` when changing v5.

Edit modules listed in `src/modules.json`, `src/app/shell.html`, and `src/styles/app.css`. The order is intentional because these classic scripts share lexical state. Run `python scripts/build_v5.py`, then `python scripts/run_qa.py`. A future ES-module migration needs explicit interfaces and regression checks; simply reordering files is unsafe.

The original ingestion entry points remain for compatibility. The release pipeline is `scripts/acquire_v5.py` followed by `scripts/normalize_snapshots.py`. Use `--offline` on acquisition to reproduce from the preserved raw responses. Acquisition without that flag can replace local data with a newer upstream response. Normalized catalog `generated_at` values are taken from the saved source retrieval times in `data/acquisition_manifest.json`; generated JSON uses LF endings on every platform. Re-running offline normalization against the same raw snapshots and manifest produces byte-identical catalog inputs and HTML builds.

For browser QA, install the Python development requirements and Playwright Chromium and Firefox binaries, then run `tests/browser_qa.py`, `tests/interaction_qa.py`, and `tests/scales_qa.py`. `tests/hosted_qa.py` additionally checks the deployed URL. Browser scripts produce new evidence and screenshots; preserve release evidence before rerunning. Performance numbers are environment-specific and the browser reports identify the tested HTML hash.

The full release contains all normalized catalogs. Git stores raw snapshots and Gaia 5k; regenerate the larger normalized files locally. Gaia tiers are nested prefixes of a single brightness-ordered 50k sample. Importing a tier replaces the current imported catalog; it does not turn matching records across catalogs into a deduplicated survey.

`scripts/package_v5.py --output <empty-directory>` creates a source snapshot, repository history bundle, standalone HTML, complete release ZIP, completion report and SHA-256 checksums. Pass `--ci-report <json>` with the verified final-head GitHub run list. The package's root manifests are generated for v5; original v4 manifests live under `historical/` and describe the historical ZIP layout.

The original application code and documentation are licensed under MIT; third-party astronomy data retain their respective upstream terms. OpenNGC-derived records retain their upstream share-alike attribution. The static demonstration contains the same offline standalone, without analytics or a hosted database.

Next engineering priorities are sustained real-device performance and accessibility testing, transfer-efficient catalog storage, explicit module interfaces, and carefully validated full-covariance or posterior-distance workflows. Extend scientific claims only when their supporting evidence is available.
