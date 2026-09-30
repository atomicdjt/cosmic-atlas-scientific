# v6 numerical validation

Independent comparisons test the chosen numerical methods, not scientific certification. Raw fixtures and tolerances are versioned.

## Ephemeris residuals

Cubic Hermite is evaluated in the JavaScript runtime against separately acquired Horizons midpoint responses for every interval, all nine targets. The held-out responses are not interpolation inputs. Each target contributes 2920 midpoint states, for 26,280 comparisons. The acceptance gates are position <1 km and velocity <0.0001 km/s; malformed contracts, missing targets and range violations are rejected.

| Target | Source | Max midpoint position discrepancy, km | Max velocity discrepancy, km/s |
|---|---|---:|---:|
| Sun (10) | DE441 | 1.51064151e-08 | 3.03883966e-14 |
| Mercury center (199) | DE441 | 0.0783695351 | 3.54292157e-08 |
| Venus center (299) | DE441 | 0.000710494798 | 5.05916767e-11 |
| Earth center (399) | DE441 | 0.000355482336 | 2.12743108e-10 |
| Mars barycenter (4) | DE441 | 3.40420438e-05 | 1.44467004e-11 |
| Jupiter barycenter (5) | DE441 | 4.36906684e-07 | 3.36496033e-11 |
| Saturn barycenter (6) | DE441 | 5.63717973e-07 | 5.74436191e-11 |
| Uranus barycenter (7) | DE441 | 1.66485132e-06 | 1.54065707e-10 |
| Neptune barycenter (8) | DE441 | 2.13007792e-06 | 1.93000468e-10 |

Overall: 0.0783695351 km and 3.54292157e-08 km/s. Exact nodes/terminal endpoints, relative-state subtraction, conventional ICRF axis order and missing origin direction are also tested.

Midpoint tests are not a continuous worst-case bound. DE441 source uncertainty is not supplied as a universal number and remains null; the measured residual is an interpolation discrepancy only.

## Time and coordinates

`tests/fixtures/v6-reference.json` stores PyERFA 2.0.1.5 dtf2d/utctai/taitt/dtdb geocentric fixtures for 2026-01-01, 2026-09-30 and 2027-12-31. TT tolerance is 1e-9 day; approximate geocentric TDB differs by <150 microseconds in these cases. This includes double-JD quantization and does not claim SOFA-grade time transformation across the entire supported range. Explicit Z timestamps/offsets, invalid calendar dates, pre-1972 rate-offset UTC, leap-second instants and unsupported dates are tested.

The existing mean-sidereal algorithm is checked against ERFA gmst82 at three UT1 epochs within 3e-7 degrees. Feeding browser UTC as UT1 remains an approximation; this fixture does not validate precision pointing, Earth orientation or omitted precession/nutation/aberration/refraction. V5 ICRS/Galactic/epoch/measurement fixtures remain active.

## Simulation convergence and conservation

An equal-mass circular binary has analytically known angular frequency sqrt(2G). At 80 days the secondary-position errors with 2/1/0.5-day steps are 0.0004588472452 / 0.0001147538279 / 0.00002869108805 AU. Both halving ratios exceed 3.8, consistent with second-order convergence. Angular-momentum relative drift, momentum absolute drift and COM residual are each constrained below 1e-12 in this reference case.

Accumulated step count, duration budgets, duplicate IDs, invalid masses, nonfinite inputs and coincident unsoftened bodies are regression tested. Browser workers exercise cancellation and 360/4000-step three-body runs with measured wall time and energy drift. Conservation diagnostics are not a JPL trajectory comparison.

## Lambert and mission fixtures

Analytical unit-radius quarter-circle (short way) and three-quarter-circle (long way) cases recover endpoint velocities within 1e-10 in normalized units. A hyperbolic short-flight solution is independently propagated with an RK4 test integrator, endpoint position tolerance 1e-7; no production Verlet or Lambert code supplies that reference propagation.

The published CelesTrak/Vallado `test_universal`, LONG/HIGH/nrev=0 fixture is pinned to commit 49df0479c950917c0a2c5ac31f2db6477bba57f6. With RE=6378.1363 km, mu=398600.4415 km³/s² and 92854.234 seconds, departure/arrival velocities agree within 2e-7 km/s. [Pinned primary reference](https://github.com/CelesTrak/fundamentals-of-astrodynamics/blob/49df0479c950917c0a2c5ac31f2db6477bba57f6/software/python/tests/astro/iod/test_lambert.py). Only numerical fixture values/source metadata were retained; upstream code was not copied into the implementation.

Zero/negative duration, invalid mu/vector shapes, central/collinear singularities, unsupported epoch ranges, C3=v∞² and grid missing-cell semantics are tested. No flight dynamics or mission certification is inferred.

## Catalog and terrain contracts

Known order-zero RING equatorial centers/IDs (4–7 at RA 0/90/180/270 degrees), deterministic builds, exact source-row reconstruction, per-tile hashes/counts, duplicate/missing positions and conservative spherical-cap cone selection are tested. Browser tests use a genuine Gaia 50k pack with 768 order-3 tiles, verify hashes, exercise cancellation, external/unverified trust, source preservation, over-budget refusal and cache eviction.

Terrain tests ensure ellipsoid input bounds and provenance-contract completeness without claiming any elevation grid exists. Missing scientific uncertainty and unsupported terrain remain missing.

## Executable evidence

```text
python scripts/ephemeris_pipeline.py --offline
node tests/scientific.cjs
node tests/v6_numerics.cjs
python scripts/run_qa.py
python tests/browser_qa.py
python tests/readiness_qa.py
python tests/interaction_qa.py
python tests/scales_qa.py
python tests/v6_browser_qa.py
python tests/benchmark_readiness.py --label v6-engine-final --output qa/v6/catalog-performance.json
```

`run_qa.py` includes 39 existing scientific groups, 17 new numerical groups, 30 Python tests, deterministic builds and script compilation. Set COSMIC_ATLAS_VALIDATE_FULL_CATALOGS=1 after materializing optional tiers. Browser suites cover 72 baseline checks, 87 readiness checks, 17 interaction checks, six scale transitions and 57 new workspace/worker/local-pack checks; final artifact hashes and exact browser results are in their QA JSON files.

Original clean baseline: 23 Python tests ran, 22 passed and one optional-tier nesting test skipped before materialization; 39 scientific groups passed. The original mobile browser harness failed by clicking controls in a hidden sidebar. It now opens the sidebar before interacting. `qa/v6/baseline-*` preserves that evidence.

Hosted CI runs scientific/full-catalog QA and offline browser suites in separate jobs, including a locally generated 50k pack. Linux Firefox uses headed execution under Xvfb with Mesa software graphics (`COSMIC_ATLAS_FIREFOX_HEADLESS=0`, `LIBGL_ALWAYS_SOFTWARE=1`); local Windows measurements use headless browsers. See [Playwright Linux CI guidance](https://playwright.dev/python/docs/ci). A first hosted run failed because Linux headless Firefox could not create WebGL; the harness now supplies a virtual display rather than skipping Firefox or its assertions. Hosted results and merge state are recorded in the PR, separately from these local numerical checks. Physical devices, Safari, real screen readers and independent scientific acceptance remain unverified.
