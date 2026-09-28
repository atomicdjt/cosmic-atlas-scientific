# Cosmic Atlas Scientific — technical review guide 5.1, revision 2

Status: `5.1.0` release review guide, based on v5.0.1 main. Guide date: 2026-09-28. No independent expert endorsement is claimed. Build identity is visible in the catalog summary and `qa/v5/build.json`; artifact hash and measured conditions are in `READINESS_REPORT_5.1.md` and `qa/readiness/`.

## Verified inventory and selection

Counts and byte hashes were checked against the local normalized files, not inferred from UI point density. `qa/readiness/catalog-inventory.json` and the generated manifest bind the counts to exact inputs.

| Dataset | Rows | Angular-only | Selection / interpretation |
|---|---:|---:|---|
| Curated core | 21 | 0 | 13 observational / literature adopted, 1 reference origin, 6 context landmarks, 1 cosmology surface; distinct classes, not 21 measured point sources |
| Gaia DR3 embedded tier | 5,000 | 0 | First 5k rows of the same brightness-ordered query |
| Gaia DR3 optional tier | 20,000 | 0 | First 20k rows of the same query; overlaps 5k |
| Gaia DR3 largest supplied tier | 50,000 | 0 | Positive parallax and error; parallax_over_error >=10; G <=15; RUWE <1.4; ORDER BY G, source_id |
| BSC5 conversion | 9,096 | 9,096 | All supplied conversion rows with usable directions; no precision distance adopted from legacy parallaxes |
| OpenNGC | 14,027 | 6,663 | Supplied NGC/addendum normalization; radial values use documented source/comoving basis |

The Gaia tiers are nested, never summed. Cross-catalog rows are not deduplicated celestial objects. The query is brightness/quality selected and not volume complete. Inspect `data/raw/gaia_50k.adql`, exact saved responses, acquisition and generated manifests. This candidate does not change catalog bytes, query, cosmological parameters or adopted physical assumptions.

## Scientific interpretation contract

Directions are ICRS degrees; Gaia DR3 astrometry has reference epoch J2016.0 ([ESA DR3 contents](https://www.cosmos.esa.int/web/gaia/dr3)). Display coordinates are Sol-centered with nonlinear radial compression. Screen separations are not physical distances. Camera-radius telemetry describes navigation and its model mapping; it is not a selected object's measured redshift or age. Point colors follow photometry/source styling and are not a trust legend.

Imports, including the embedded transport path, remain external/unverified and ineligible for physical-measurement operations regardless of file-supplied tier/eligibility. Source claims are preserved in raw provenance and exports. Explicit angular-only status overrides supplied distance; shell radii are display parameters, never measured radial coordinates. Re-importing an export does not promote trust.

Positive, high-S/N inverse-parallax distances are approximations. No posterior distance model, parallax zero-point correction, extinction correction, full covariance, cross-catalog merge or new astrometric claim was added. Missing uncertainty is not zero uncertainty. RUWE is a quality indicator with context-dependent interpretation, not universal certification. The uncorrected color–absolute-magnitude diagram applies its documented S/N/RUWE conditions and limited plot range; overlapping points remain accessible through search and table.

Epoch display uses the existing linear tangent proper-motion approximation within +/-100 years. Unsupported rows retain source coordinates; canonical export coordinates stay at source epoch, and displayed positions are separately named. Coordinate aliases now retain normalized source coordinates through epoch reset/export. No perspective acceleration, orbital motion or covariance propagation is asserted.

Core distances remain literature-adopted snapshots. Betelgeuse retains its qualified legacy display distance and is excluded from physical separation. Measurements reject imported/unverified, angular-only, context/model/procedural and incompatible distance-kind endpoints. The origin and all-sky surface lack a unique sky direction. See `V5_METHODOLOGY.md` and `V5_REFERENCES.md` for original sources and regression fixtures.

The flat explanatory LCDM model retains H0=67.4 km/s/Mpc, Omega_m=0.315, Omega_r=0.000092 and Omega_Lambda=0.684908; the CMB surface at z=1089 has a synthetic texture. This is not a Planck likelihood, temperature map, complete neutrino model or survey reconstruction. Comoving distance, lookback time and luminosity/angular-diameter distance are not interchangeable.

## Engineering evidence and review conditions

Run `python scripts/run_qa.py`, `python tests/browser_qa.py`, and `python tests/readiness_qa.py`. Static/scientific tests check baseline integrity, numeric fixtures, schema, source hashes, deterministic builds and offline policy. Browser regressions exercise cancellation during validation, superseding jobs, late duplicate failure, worker/fallback parity, allocation rollback, epoch aliases, focus/inert behavior and picking after resizing. These are automated behavior checks, not WCAG conformance or assistive-technology certification. Modal behavior follows the [W3C APG dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

The performance harness is `tests/benchmark_readiness.py`. It uses genuine 5k/20k/50k tiers, fixed initial camera, reduced motion, 1440x1000 DPR1, S/N20 filtering, a 1s settle and 4s frame sample. Chromium uses explicit SwiftShader; Firefox reports its ANGLE/AMD renderer. Import time, cold/cached pick, full filter interaction, cached table, frame quantiles/stalls and coarse heap where available are environment-specific. Timer gaps include browser scheduling, file input and GC; GPU upload reports CPU submission, not GPU completion. Before/after samples and limitations belong together. No sustained thermal, physical phone, Safari or long-duration memory guarantee is implied.

Cancelled/failed imports preserve the active records, source metadata and GPU bundle; no partial catalog is published to the UI. Worker messages are bounded to three pending 1,000-row batches; render arrays transfer without a second typed-array copy. Source records/raw fields remain lossless. Fallback JSON.parse is synchronous and cannot be interrupted mid-parse; later validation yields and can be cancelled. Safety limits are 100k rows and 256 MiB of file input (string inputs use a 256-million-code-unit cap). Rendering adaptation shrinks points and canvas resolution; it never drops records or export metadata. Cold/moving picks remain O(n). Context loss reports a reload instruction; automatic resource restoration remains open work.

## Provenance, rights and external gates

Retain ESA/Gaia/DPAC and relevant Gaia processing-paper acknowledgements. BSC5/Hoffleit & Warren attribution is separate from the MIT-licensed conversion. OpenNGC-derived data retain CC-BY-SA-4.0, attribution and modification notices. Original Cosmic Atlas application code and project documentation are MIT-licensed; this does not extend those terms to bundled data or third-party material. Exact saved license texts, retrieval history and raw checksums are in `data/raw/` and `V5_DATA_AND_LICENSES.md`. No independent scientific endorsement is claimed. Outreach is not part of this review package.

## Focused reviewer questions

**Astrometry:** Are inverse-parallax labels, uncertainty caveats and quality-selection wording adequate for educational exploration? Do the accepted alias/source-epoch semantics preserve the intended ICRS quantities? Which additional systematics should be disclosed before precision use? Is the Betelgeuse measurement exclusion adequately visible?

**Cosmology:** Are navigation-radius telemetry and observed versus model-derived quantities sufficiently distinct? Is the explanatory last-scattering surface and simplified LCDM treatment qualified clearly enough? Are OpenNGC comoving labels sufficient to prevent local/comoving distance conflation?

**Scientific visualization:** Does nonlinear compression remain clear at first use? Can source class, basis, epoch and uncertainty be found without relying on color? Does adaptive resolution preserve interpretability at high density? Are the search/table/inspection paths adequate when points overlap or a canvas is unusable?

**Human accessibility / hardware:** Test real keyboard/screen-reader navigation (NVDA/JAWS/VoiceOver/TalkBack), browser zoom/reflow, contrast and target sizes, physical iOS/Android/Safari, touch selection, context loss, long sessions and thermal behavior. Automated emulation and desktop checks do not close these gates.
