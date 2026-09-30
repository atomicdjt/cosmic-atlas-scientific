# Cosmic Atlas Scientific v6

A provenance-aware offline astronomy atlas combining catalog observations, literature-adopted measurements, numerical cosmology, and explicitly identified procedural context. The v6 development engine adds offline JPL Horizons/DE441 state queries, validated numerical simulation and Lambert transfer exploration, and functional local HEALPix catalog packs. The published v5.1.0 release remains frozen; this development identity is not a new formal release.

Open **`dist/Cosmic_Atlas_Standalone.html`** directly in a browser. It includes a genuine **5,000-record Gaia DR3 catalog** and the preserved curated core. No server, package installation, account, API key or network is required. Optional **20k and 50k Gaia**, **9,096-row BSC5**, and **14,027-row OpenNGC** catalogs are included in the full release package and can be imported locally.

Open **Scientific workspace** in the main navigation for Ephemeris, Simulate, Missions and Local catalogs. Query 2026–2027 geometric ICRF/TDB states, export provenance, propagate a separately labelled Newtonian model, or compute a bounded zero-revolution transfer/grid. Terrain is metadata only and observer pointing remains approximate.

Use the left panel's scientific workbench for source/tier/class, photometry, distance and astrometric-quality filters. The data table has 100-row pages; select a source to inspect its provenance. The color–magnitude diagram links to atlas selection. Epoch display is a bounded linear proper-motion approximation; exports retain source-epoch coordinates. Keyboard `/` opens search, `D` opens the table, `T` starts the tour, `R` resets and Escape closes panels.

## Build and verify

```text
python scripts/build_v5.py
pip install -r requirements-dev.txt -r requirements-science.txt
python scripts/run_qa.py
python -m playwright install chromium firefox
python tests/browser_qa.py
python tests/readiness_qa.py
python tests/v6_browser_qa.py
```

Build tools are Python and Node; these are not runtime dependencies. Install development dependencies only when running QA. Source snapshots are included; regenerate larger catalogs offline with `python scripts/acquire_v5.py --offline` followed by `python scripts/normalize_snapshots.py`. The lightweight Git checkout includes Gaia 5k; the full release ZIP includes all normalized tiers. A normal `python scripts/run_qa.py` validates the embedded tier; CI also sets `COSMIC_ATLAS_VALIDATE_FULL_CATALOGS=1` after materializing the optional tiers.

## What changed

The new engine is implemented and independently fixture-tested:

- Nine Horizons/DE441 target states sampled every six hours, with barycentric/heliocentric/geocentric queries, Hermite position/velocity interpolation, raw-query/hash provenance and strict supported epochs.
- Explicit UTC/TT/TDB helper with caller-supplied leap-second offset and approximate TT→TDB; geometric frame/origin contracts remain distinct from observer pointing.
- Velocity-Verlet conservation diagnostics (energy, angular/linear momentum, inertial COM residual), corrected step bookkeeping, malformed-input refusal and analytical convergence tests.
- Zero-revolution short/long-way Lambert, departure C3 and arrival v∞, cancellable worker launch-window grids and source-preserving scientific exports.
- Genuine HEALPix RING local NDJSON packs: deterministic builder, local streaming/hash verification, bounded cache/cone loading, cancellation, progressive GPU publication and existing table/search/filter/export integration.

Build a real local pack (the 5k embedded tier stays available):

```text
python scripts/acquire_v5.py --offline
python scripts/normalize_snapshots.py
python scripts/build_catalog_pack.py data/generated/gaia_50k.json work/gaia-50k-pack --order 3
```

Choose its manifest and tiles in **Scientific workspace → Local catalogs**.
The 50k source creates 768 order-3 RING tiles; the browser loads a selected
cone rather than parsing the full pack. Imported records remain external/unverified.
Fixed source responses reproduce the ephemeris with
`python scripts/ephemeris_pipeline.py --offline`; this never needs network access.

Read [v6 capability map](docs/SCIENTIFIC_PLATFORM_V6.md),
[methods](docs/V6_METHODOLOGY.md), [architecture](docs/V6_ARCHITECTURE.md),
[data and rights](docs/V6_DATA_AND_PROVENANCE.md),
[numerical validation](docs/V6_NUMERICAL_VALIDATION.md),
[measured performance](docs/V6_PERFORMANCE.md) and
[limitations](docs/V6_LIMITATIONS.md). No SPICE runtime, SOFA-grade pointing,
complete Gaia survey, DEM, operational navigation or expert endorsement is claimed.

## Repository map

```text
src/app/             shell, constants and render loop
src/astronomy/       coordinates, units, uncertainty, epochs and measurements
src/cosmology/       documented LCDM integration and lookup
src/catalog/         normalization, filters, provenance, storage, import/export
src/render/          buffers, viewport, particles, lines, CMB and context
src/shaders/         GLSL programs
src/interaction/     camera, touch, keyboard and screen-space picking
src/ui/              inspector, table, filters/diagram, tour and accessibility
src/styles/          editable CSS
data/raw/            exact source responses, query and upstream licenses
data/generated/      normalized catalog tiers
scripts/             acquisition, normalization, build and QA
tests/               scientific, pipeline/schema and browser tests
docs/V5_*.md         architecture, methodology, references, licensing and release notes
qa/v5/               baseline capture, connector evidence, test reports and screenshots
dist/                generated standalone and modular development edition
standalone/          untouched historical v4 HTML
```

## Scientific boundaries

Missing distances stay angular-only. The display shell never becomes a physical distance. Gaia inverse-parallax distances are approximations with explicit quality selection, not Bayesian estimates. RUWE is not a universal good/bad classifier. No full covariance, extinction correction or precision astrometric propagation is claimed. CMB texture and procedural cosmic structure remain illustrations. Catalog rows across sources are not deduplicated celestial objects.

The standalone has no analytics or database dependency. Performance varies by GPU, viewport, browser and catalog. Headless mobile emulation is not certification on a physical phone. See the completion report and measured browser results before making performance claims.

## Provenance and rights

The new numeric ephemeris outputs retain NASA/JPL SSD attribution and are not relicensed as project code. Build-time Astropy/ERFA dependencies are installed separately; no third-party engine is vendored into the browser. Original Cosmic Atlas application code and project documentation are MIT-licensed; see `LICENSE` and `LICENSE_SCOPE.md`. This does not relicense bundled astronomical data or third-party materials. Credit ESA/Gaia/DPAC, the Gaia Collaboration and processing teams; retain BSC5/Hoffleit & Warren and conversion attribution; and keep OpenNGC-derived data under CC-BY-SA-4.0. See `docs/V5_DATA_AND_LICENSES.md` and `CITATION.cff` for details.

The original v4 source and release evidence remain tagged **`v4.0.0-baseline`**. The 5.1.0 release preserves those historical tags. The historical v4 README is retained as `docs/releases/README_v4.md`.
