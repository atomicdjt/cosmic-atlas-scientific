# Scientific Platform v6 architecture

This branch extends the offline atlas with bounded scientific tools while preserving the v5 distinction among observed catalog records, adopted literature values, model output, and procedural context.

## Simulation laboratory

The laboratory state schema is `cosmic-atlas.nbody.v1`. Its units are AU, solar masses and Julian days, using `G = 2.959122082855911e-4 AU^3 / (solar mass day^2)`. The implementation is a pairwise velocity-Verlet integrator with optional Plummer-style softening. It exposes total energy, momentum and centre of mass so a user can assess numerical drift. The bundled presets are defined pedagogical initial conditions, not SPICE/JPL ephemerides. Collisions, relativity, tidal physics, radiation pressure and stellar evolution are outside the model.

## Time, frames and observer orientation

Internal astronomical time helpers use Julian Date and Julian years. Catalog exchange directions remain ICRS. The current observer utility is a mean-sidereal approximate ICRS-to-horizontal transform, intentionally labelled as such. It omits Earth-orientation parameters, precession/nutation, aberration, polar motion, refraction and a local horizon model; it is not suitable for telescope pointing. A future precision adapter must pin its engine/version and include independent fixtures before becoming the default.

## Missions

Mission scenarios use `cosmic-atlas.mission.v1`. The currently interactive estimate is only the textbook, coplanar, circular two-body Hohmann transfer. It is not Lambert targeting, a launch window, low-thrust optimisation, an encounter design, or a navigation solution. Build-time Horizons/SPICE-derived source data may be added only with raw-query/source-response provenance and independent validation.

## Catalog packs and terrain

`data/catalog_packs.json` declares what is actually embedded and what is merely a future local-pack contract. The embedded Gaia sample is not labelled HEALPix. A real tiled pack must record its HEALPix scheme/order, source release, selection query, artifact hash, build tool version and per-tile counts.

`data/terrain_bodies.json` is body/ellipsoid metadata. Terrain height grids, imagery and map projections are separate assets with their source, datum, resolution, no-data policy, licensing, and hash; no terrain is bundled merely by providing the ellipsoid helper.

## Reproducibility on Windows

`.gitattributes` forces normalized LF source text and preserves `data/raw`, historical evidence and distribution artifacts as bytes. Run the QA command from a fresh checkout to verify source snapshots rather than relying on a pre-existing Windows worktree whose text files may have been checked out with an older `core.autocrlf` policy.
