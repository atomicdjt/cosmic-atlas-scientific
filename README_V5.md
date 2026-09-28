# Cosmic Atlas Scientific v5

A provenance-aware interactive scientific visualization combining astronomical catalog observations, literature-adopted measurements, numerical cosmology, and explicitly identified procedural context.

Open **`dist/Cosmic_Atlas_Standalone.html`** directly in a browser. It includes a genuine **5,000-record Gaia DR3 catalog** and the preserved curated core. No server, package installation, account, API key or network is required. Optional **20k and 50k Gaia**, **9,096-row BSC5**, and **14,027-row OpenNGC** catalogs are included in the full release package and can be imported locally.

Use the left panel's scientific workbench for source/tier/class, photometry, distance and astrometric-quality filters. The data table has 100-row pages; select a source to inspect its provenance. The color–magnitude diagram links to atlas selection. Epoch display is a bounded linear proper-motion approximation; exports retain source-epoch coordinates. Keyboard `/` opens search, `D` opens the table, `T` starts the tour, `R` resets and Escape closes panels.

## Build and verify

```text
python scripts/build_v5.py
pip install -r requirements-dev.txt
python scripts/run_qa.py
python -m playwright install chromium firefox
python tests/browser_qa.py
```

Build tools are Python and Node; these are not runtime dependencies. Install development dependencies only when running QA. Source snapshots are included; regenerate larger catalogs offline with `python scripts/acquire_v5.py --offline` followed by `python scripts/normalize_snapshots.py`. The lightweight Git checkout includes Gaia 5k; the full release ZIP includes all normalized tiers.

## What changed

52 maintained source modules replace the monolithic development path. Worker parsing, chunked normalization, scientific filters, source-preserving exports, guarded measurements, linked diagram, epoch display, screen-grid picking and dense-catalog rendering controls build on v4. Offline/static/scientific/catalog tests and real browser checks accompany the release.

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

Imported rows always remain in the external, unverified tier and are excluded from physical-measurement operations, even if a file supplies a curated tier or `measurement_eligible: true`. Source-supplied fields remain visible as source claims and in raw provenance; import does not certify them. Malformed colors use a derived fallback. Replacement render buffers are staged before the active import is swapped. Missing distances stay angular-only. The display shell never becomes a physical distance. Gaia inverse-parallax distances are approximations with explicit quality selection, not Bayesian estimates. RUWE is not a universal good/bad classifier. No full covariance, extinction correction or precision astrometric propagation is claimed. CMB texture and procedural cosmic structure remain illustrations. Catalog rows across sources are not deduplicated celestial objects.

The standalone has no analytics or database dependency. Performance varies by GPU, viewport, browser and catalog. Headless mobile emulation is not certification on a physical phone. See the completion report and measured browser results before making performance claims.

## Provenance and rights

Credit ESA/Gaia/DPAC, the Gaia Collaboration and processing teams; see [Gaia DR3 papers](https://www.cosmos.esa.int/web/gaia/dr3-papers). Retain BSC5/Hoffleit & Warren and conversion attribution. OpenNGC-derived data retain CC-BY-SA-4.0. See `docs/V5_DATA_AND_LICENSES.md`, `LICENSE_SCOPE.md`, and `CITATION.cff`. A universal open-source license for the supplied application code has not been asserted.

The original v4 source and release evidence remain tagged **`v4.0.0-baseline`**. v5 work is on **`refactor/modular-source-v5`**. The historical v4 README is retained as `docs/releases/README_v4.md`.
