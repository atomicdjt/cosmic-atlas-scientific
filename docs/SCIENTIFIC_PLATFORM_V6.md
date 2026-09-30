# Scientific platform v6 capability map

Status: implemented development engine, based on main 62f202c. The formal
v5.1.0 release remains published and frozen. The 6.0.0 build identity does not
assert a new formal release or scientific certification.

| Subsystem | Current implementation | Boundary |
|---|---|---|
| Ephemerides | Nine DE441/Horizons targets, six-hour offline state asset, cubic Hermite, barycentric/relative states | 2026–2027 only; geometric ICRF/TDB; explicit planet-system barycenters; no extrapolation or browser SPICE |
| Time/frames | Explicit scale/origin/units, UTC→TT with caller offset, approximate TT→TDB and ERFA fixtures | No leap-second instant, UT1/EOP or precision apparent/topocentric pointing |
| Simulation | Fixed-step Verlet, strict input/budget checks, corrected step count, conservation residuals, convergence tests, worker propagation | Newtonian small systems; source initial state becomes separate numerical model |
| Missions | Validated zero-revolution short/long Lambert, C3/v∞, worker sampled grid and exports; original Hohmann retained | No flight dynamics, capture/launch certification, multi-revolution or singular endpoints |
| Catalogs | Real HEALPix RING builder and local streaming/hash-verifying cone loader, bounded retained cache, progressive atlas publication | 50k genuine source tested; not full Gaia; loaded-cone search/export; external/unverified trust |
| Terrain | Ellipsoid and external asset provenance validator | No elevation-grid ingestion, DEM/imagery or terrain renderer |
| Product | Main-navigation scientific workspace, AU orbital plots, numerical outputs, export and provenance | 2D projection; no full 3D solar-system/terrain scene |

Architecture decisions, worker/cancellation contracts and scientific/data boundaries:

- [V6_ARCHITECTURE.md](V6_ARCHITECTURE.md)
- [V6_METHODOLOGY.md](V6_METHODOLOGY.md)
- [V6_DATA_AND_PROVENANCE.md](V6_DATA_AND_PROVENANCE.md)
- [V6_NUMERICAL_VALIDATION.md](V6_NUMERICAL_VALIDATION.md)
- [V6_LIMITATIONS.md](V6_LIMITATIONS.md)

Existing v5.1 filters, source-preserving imports/exports, measurement safeguards,
canonical source epochs, accessibility improvements, offline operation and
seeded procedural layers remain. Raw scientific snapshots and historical
release artifacts are byte-preserved. Windows/source LF policy includes exact
Horizons raw responses under a separate -text rule.
