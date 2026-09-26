# Cosmic Atlas Scientific v4 — QA report

**Release:** 4.0.0  
**Build ID:** `CA-SCI-4.0-2026-09-26`  
**Validation date:** 2026-09-26

## Release artifact

- Standalone HTML: `standalone/Cosmic_Atlas_Scientific_v4.html`
- Size: 127,949 bytes
- SHA-256: `6fb8b0bc99f1eba486056e1d0b9e19c7c81cc6ab2d010bc15dbb3dd4158cc101`
- External JavaScript dependencies: **0**
- External stylesheet dependencies: **0**
- Runtime `fetch()` calls: **0**
- `Math.random()` calls: **0**
- DOM IDs: **83 / 83 unique**
- Unresolved literal `getElementById()` references: **0**
- Inline JavaScript syntax: **PASS** (`node --check`)

## Automated regression tests

`python -m unittest discover -s tests -v`

**13 / 13 passed.** Covered:

- HMS -> RA conversion
- DMS -> declination conversion
- inverse-parallax conversion regression
- Planck-like CMB comoving-distance regression window
- 3C 273 redshift-distance scale regression
- angular-only schema acceptance
- missing-distance semantic rejection
- example import-catalog validation
- unique DOM IDs
- literal DOM reference resolution
- offline dependency policy
- deterministic RNG policy
- presence of scientific guardrails/schema/tour features

## Catalog validation

- `data/curated_observational_import.json`: **13 physical observational records; 0 validation errors**.
- `data/example_import_catalog.json`: **6 physical records; 0 validation errors**.
- Exact internal embedded source data are preserved separately in `data/embedded_core_catalog.json` and `.csv`.

## Scientific regression values

The dependency-free cosmology helper evaluates approximately:

- `z = 0.158339` -> **2.209 Gly** comoving (release model)
- `z = 1` -> **11.092 Gly** comoving
- `z = 1089` -> **45.219 Gly** comoving

These values are regression checks for the release implementation, not a claim that the simplified parameterization supersedes a dedicated cosmology package.

## Browser/WebGL smoke test

**NOT PASSED / ENVIRONMENT-BLOCKED.**

A headless Chromium attempt was made with SwiftShader/WebGL flags. The container's Chromium could not initialize an allowed GL/ANGLE backend and the process timed out. `qa/chromium.log` records the GL initialization errors. No successful GPU-rendered browser screenshot was produced in this environment.

This limitation is deliberately reported rather than converted into a false pass. A future CI pipeline should run Playwright/Chromium on a WebGL-capable runner and capture desktop/mobile screenshots.

## Network ingestion tests

Gaia/BSC5/OpenNGC fetch scripts compile successfully. Bulk network acquisition is **not counted as runtime-tested here** because the container's outbound access to astronomy archive endpoints is restricted/inconsistent. The Gaia release is therefore not embedded or misrepresented. Run the acquisition scripts in Work/Codex/a normal networked development environment and commit query/config/checksum metadata with generated data products.

## Remaining release risks

1. Browser GPU behavior should be smoke-tested on actual Android Chrome, desktop Chrome/Edge/Firefox/Safari as applicable.
2. 20k–50k imported-catalog performance should be measured on representative mobile hardware.
3. Imported catalog object picking above 5,000 rows is intentionally limited pending spatial/GPU picking.
4. Full Gaia astrometric covariance and probabilistic distance inference are not implemented.
5. Procedural large-scale structure remains illustrative; it is not SDSS/DESI reconstruction data.

## QA verdict

**PASS for source/static/scientific-regression packaging with one explicitly unresolved environment-dependent gate: real WebGL browser smoke testing.**
