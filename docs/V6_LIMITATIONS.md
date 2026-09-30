# v6 limitations and unresolved validation

- Ephemerides are bounded source-derived/interpolated DE441 states, inclusive
  2026-01-01 to 2028-01-01 TDB, nine named targets only. There is no browser SPICE
  execution, arbitrary kernel import, small-body ephemeris or extrapolation.
- Mars through Neptune represent planetary-system barycenters, not surface
  centers. Queries are geometric; no light-time, aberration, apparent-place,
  eclipse, topocentric precision or telescope-pointing solution is provided.
- Held-out midpoint residuals measure interpolation discrepancy, not source
  ephemeris uncertainty or a mathematical continuous error bound. Null uncertainty
  remains unknown, not zero. Future acquisition may change source bytes/version.
- UTC→TT needs an independently verified TAI−UTC offset. The UI's 37 seconds is
  editable, not a prediction of future leap seconds. TT→TDB is approximate over
  1900–2100, but the integer-offset UTC helper is restricted to 1972–2099 civil dates. Historical UTC rate offsets, leap-second instants, UT1 and precision Earth orientation are absent.
- The mean-sidereal observer direction remains approximate; no SOFA/ERFA runtime
  or precision frame bias/precession/nutation/refraction/aberration chain exists.
- Simulation is Newtonian velocity-Verlet, 1–64 bodies, bounded fixed steps.
  Rounded masses, omitted planets/Moon, relativity/forces/collisions and no
  adaptive close-encounter treatment prevent navigation-grade claims. Energy and
  momentum conservation do not prove accurate trajectory prediction.
- Lambert is bracketed zero-revolution two-body only. Singular/collinear and
  out-of-bracket cases fail explicitly. No multi-revolution, low-thrust, launch
  vehicle, planetary encounter/capture, pork-chop optimization or certification.
  The grid is a sampled patched-conic exploration, with missing cells explicit.
- Orbital views are 2D ICRF X-Y projections. Simulation connectors show endpoint
  displacement, not sampled integrated trajectories. A 3D solar-system scene,
  selectable simulation trails and terrain are future product work.
- HEALPix packs are genuine spherical infrastructure for selected catalogs,
  not a complete Gaia DR3 distribution. The practical measured case is 50k source
  rows/768 tiles. No million/billion-row throughput claim is made. Manifest,
  tile and retained-source/row budgets are strict; narrow over-budget cones.
- Camera-follow is angular cone selection for Sol-centered views, not exact
  nonlinear/translated-camera frustum coverage. Search/table/export cover the
  loaded cone. Imported records remain external/unverified. Cancelled or failed
  progressive loads retain their last verified published subset, not a full-pack
  atomic snapshot. Empty cones preserve the previous import with explicit status.
- Cache budgets bound source bytes/rows, not total process/worker/GPU memory.
  Hashing uses a bounded full-tile ArrayBuffer after streaming parse. Publication
  still serializes the ≤20k cone through the existing import path. No IndexedDB,
  persistent cache, WASM or unlimited memory claim is justified.
- Terrain remains ellipsoid/provenance metadata; no DEM ingestion or rendering.
- Physical devices, Safari, real assistive technologies, sustained thermal/load
  behavior and independent scientific expert acceptance remain unverified.
- All v5 limitations remain: selected surveys, inverse-parallax assumptions,
  no zero-point/extinction/posterior/covariance treatment, approximate epoch
  display, adopted landmark snapshots, illustrative CMB/procedural structures,
  WebGL requirement and no automatic graphics-context restoration.

These are explicit capability boundaries, not hidden substitutions. There is
no new formal v6 release or scientific-expert endorsement in this pass.
