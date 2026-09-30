# v6 scientific engine architecture

This is a development implementation, not a new formal release. The published
v5.1.0 tag, release ZIP and historical sources are frozen. Main initially held
bounded foundations (audit base `62f202c`); this pass adds executable numerical
and data infrastructure. The standalone remains one deterministic HTML file.

## Ephemeris decision

| Approach evaluated | Strength | Decision |
|---|---|---|
| Browser SPICE/SPK | Direct kernel evaluation; flexible coverage | Deferred: introduces native/WASM integration, kernel readers, toolkit redistribution and maintenance obligations without a demonstrated need for this bounded product |
| Build-time SPICE/SPK | Reproducible authoritative state ingestion | Viable future adapter; no SPICE execution or kernel redistribution is claimed here |
| Build-time JPL Horizons | Geometric DE441 vectors with explicit settings; compact offline subset | Implemented: saved exact responses/queries, hashes, six-hour grid and independent off-grid queries |
| Astronomy Engine | Browser-oriented, MIT engine with broader date coverage | Evaluated, not bundled: bounded JPL-derived states better satisfy the selected provenance/accuracy goal; no Astronomy Engine accuracy claim |
| SOFA/ERFA browser transforms | Standards-based time/astrometry | ERFA used only to generate independent time fixtures; no runtime standards-grade pointing without Earth-orientation data and a validated adapter |

Horizons is queried sequentially at build/acquisition time. Its numeric responses
and retrieval metadata are retained in `data/ephemeris/raw`; the compiled asset
and manifest are reproducible offline. The ingestion tool checks target, API
response version, frame, origin, units, time scale and complete epoch grids.
Existing responses are reused; `--refresh` explicitly requests a new acquisition.
The tool supplies a product/contact User-Agent, bounded retries and backoff.
See the [SSD API service policy](https://ssd-api.jpl.nasa.gov/doc/).

The browser lazily caches the parsed asset (the workspace's initial plot requests
it at bootstrap), queries in constant time, and refuses unsupported targets or
epochs. Cubic Hermite interpolation uses sampled position and velocity; velocity
is the analytic derivative. Relative states subtract simultaneous barycentric
states. Direct geocentric directions are geometric, not apparent positions.

## Scientific workspace

A primary-navigation button opens a native modal dialog, with Ephemeris,
Simulate, Missions and Local catalogs panels. Native modal focus containment,
Escape and background isolation complement the existing v5 dialog paths.
Numerical outputs and provenance can be copied or exported. Canvas views have
text alternatives and equal-scale AU axes; orbit views are ICRF X-Y projections,
not full 3D/terrain scenes. The v5 WebGL atlas and all six scale controls remain.

## Computation and cancellation

The two-body sidebar lab remains lightweight and synchronous, bounded to 80
steps per update. Longer propagation and up to 4096 Lambert grid cells run in
Blob-backed local workers. Cancellation terminates the worker, releases the Blob
URL and prevents publishing unfinished scientific results. Grid numeric data
transfer as `Float64Array`; failed cells are NaN in memory, null in JSON exports,
with explicit failure reasons. Every result records method, frame/time, units,
source assumptions and status. Newest actions suppress obsolete error messages.

Velocity-Verlet remains appropriate for the declared small, fixed-step,
Newtonian, non-collision systems. Adding an adaptive solver without a validated
encounter regime would not improve this contract. The API rejects malformed
bodies, unsoftened coincident pairs, unsupported collision policies, overflow,
sub-resolution JD timesteps and over-budget durations. No silent truncation of
integration duration or removal of invalid bodies remains.

## Local catalog packs

`build_catalog_pack.py` uses **astropy-healpix 2.0.1** at build time. RING scheme,
ICRS, order/nside, source release/query metadata, input hash, builder version and
per-tile counts/byte hashes are recorded. NDJSON rows preserve all input fields.
The tool sorts source IDs deterministically. No synthetic rows fill sparse tiles.

The browser takes explicitly selected Files or a folder, not HTTP URLs. Manifest
validation rejects paths, duplicate filenames/IDs, inconsistent totals and
oversized tiles. Tile selection intersects an ICRS cone with each tile's actual
source bounding cap, then filters individual source directions exactly. Caps
are measured over all rows at build time; they do not assume a pixel-corner
radius. This works across RA wrap, poles and HEALPix face boundaries.

One tile streams through a worker at a time; UTF-8/NDJSON parsing checks line and
row limits. Web Crypto verifies its full byte hash before publication. Maximums:
4 MiB/tile, 5000 rows/tile, 64 KiB/line, order 0–5, 10 million declared rows, a
32 MiB retained-source-byte cache and 20k retained rows. Cones exceeding budgets
are refused, not silently clipped. Cache entries outside the requested cone's
tile set are evicted before loading. File references retain no parsed full pack.

Verified cone prefixes publish every eight tiles (and at completion) through
the established transactional worker import, transferable render buffers and
GPU staging. This preserves filters, search, table, picking, raw-source exports
and external/unverified trust. A failed publication retains the prior published
subset; cancellation retains the last verified subset. Empty cones explicitly
retain the previous import. Exports name the cone and progressive completeness.

Manual cone radius supplies angular scale; optional camera-follow requests
settled Sol-centered directions. This is angular viewport-oriented selection,
not an exact frustum intersection from a translated/nonlinear scene camera.
Table/search/export operate on the loaded cone. Persistent IndexedDB caching,
WASM and parallel tile workers were not added: the measured bounded local-file
workflow does not require them. Actual memory exceeds retained source bytes
because raw/normalized records, export text, worker clones and GPU data coexist.

## Terrain

Ellipsoid helpers and an external terrain provenance validator are implemented.
There is no elevation-grid ingestion or DEM rendering. See the external pipeline
gate in `V6_DATA_AND_PROVENANCE.md`; metadata validation never becomes a terrain
data claim.
