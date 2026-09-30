# v6 data, engines, attribution and external pipelines

## Actual dependencies and assets

| Component | Use / version | Provenance and rights |
|---|---|---|
| NASA/JPL Horizons DE441 | Build-time geometric vectors; actual JSON response signature API 1.2 | Exact raw responses, query URLs/settings, retrieval timestamps and SHA-256 in `data/ephemeris/raw` and manifest; attribute NASA/JPL Solar System Dynamics |
| astropy-healpix 2.0.1 | Build-time HEALPix RING tile assignment/centers | BSD-licensed Python package, installed separately, not vendored into the browser |
| Astropy 8.0.1 | Build/reference dependency, units and coordinate infrastructure | BSD package; no runtime/browser bundle |
| PyERFA 2.0.1.5 | Independent geocentric UTC/TT/TDB reference fixtures | BSD package based on ERFA/SOFA; not a browser pointing engine |
| Gaia DR3 | Existing genuine nested 5k/20k/50k snapshot | Existing ESA/Gaia/DPAC attribution, exact ADQL, acquisition and normalization hashes unchanged |
| SPICE, Astronomy Engine, SOFA browser, WASM | Evaluated; not executed or bundled | No claims of using these engines or redistributing their code/kernels |

`data/scientific_result_schema.json` specifies the common scientificMetadata
envelope carried by ephemeris, time, simulation-quality and mission exports.
Native schemas retain more detailed state/result fields. The envelope names
category, source, epoch, scale, frame/origin, units, method, assumptions,
uncertainty and valid range. Missing uncertainty remains null. Runtime imports
do not become trusted by claiming source authority or supplying a valid hash.

The ephemeris asset is 3,528,379 bytes. Its hash and all 18 response hashes
(nine sampled-state and nine held-out-midpoint queries) are in
`data/ephemeris/manifest.json`. Reproduce with:

```text
python scripts/ephemeris_pipeline.py --offline
python scripts/build_v5.py
```

Network acquisition is a development operation. Without `--offline`, existing
responses are reused; `--refresh` explicitly creates a new source acquisition,
which may differ as the service changes. The API documentation currently
describes version 1.3; actual retrieved response signatures are 1.2 and the parser
pins that observed format. Unexpected signatures fail rather than being guessed.

For attribution use NASA/JPL Solar System Dynamics, Horizons geometric state
vectors, downloaded 2026-09-30, [SSD acknowledgement guidance](https://ssd.jpl.nasa.gov/about/).
Numeric ephemeris outputs remain separate upstream scientific data, not project
MIT code. No endorsement is implied. No images, NASA/JPL logos, third-party
SPICE Toolkit source or SPK files are redistributed. The
[NAIF rules](https://naif.jpl.nasa.gov/naif/rules.html) were reviewed while comparing
SPICE alternatives; they are not substituted for Horizons data provenance.
Original application code/docs retain MIT. Gaia/BSC5/OpenNGC terms and notices
in `V5_DATA_AND_LICENSES.md` remain applicable and unchanged.

## Catalog pack reproduction

```text
pip install -r requirements-science.txt
python scripts/acquire_v5.py --offline
python scripts/normalize_snapshots.py
python scripts/build_catalog_pack.py data/generated/gaia_50k.json work/gaia-50k-pack --order 3
```

The genuine 50k pack has 768 nonempty RING order-3 tiles (nside=8). The embedded
5k catalog remains a normal compact import; it is not relabelled HEALPix.
Source query, release, generated date and raw fields survive the pack transform.
Its manifest binds the exact parent normalized catalog hash. HEALPix divides
the sky; it does not make this selected brightness/quality sample a complete
Gaia survey. Packs are generated locally/CI rather than committing another
copy of the entire 50k catalog. Rebuilding fixed inputs gives identical bytes.

The runtime loader supports orders 0–5, explicit caps and source preserving
NDJSON. Clustered catalogs must use sufficient order to satisfy the 4 MiB/5000
rows per tile limits; the builder rejects oversized tiles with an instruction
to increase order. Directory selection support varies by browser; ordinary
multiple-file selection is also available. No network storage/IndexedDB is
required. See `V6_ARCHITECTURE.md` for progressive publication and budgets.

## Terrain external-data pipeline gate

No DEM or imagery is shipped. NASA/USGS/mission products differ in body-fixed
frames, projections, datums, coverage, resolution, no-data conventions and
product terms; none was ingested and validated in this pass. The validator
accepts only `cosmic-atlas.terrain-asset.v1` metadata with source, body,
projection, datum, resolutionMeters, noDataPolicy (null/mask/sentinel), sentinel
value where applicable, retrievedAt, license/licenseUrl, sha256 and an explicit
redistributionReviewed flag. This flag records adapter review, not authority.

A future ingestion must obtain and preserve the original product/label and
terms, hash raw bytes, decode its actual projection/datum, preserve no-data
masks, document resampling and derived resolution, check independent geodetic
control points and poles/seams, and hash every derived tile. It must pass
boundary/no-data fixtures before a grid loader/terrain renderer can be exposed.
The current validator explicitly returns 'grid ingestion not implemented'.
