# Cosmic Atlas Scientific v5 — completion report

Release 5.0.0, build CA-SCI-5.0-2026-09-26. Work completed from the supplied v4 package, preserving its scientific visualization identity and offline runtime. The result is a provenance-aware visualization, not a precision astrometry or survey-reduction platform.

## v5.0.1 patch release

Release 5.0.1, build CA-SCI-5.0.1-2026-09-28, packages the standalone at commit `9d16f2a0a391b3fc4813d7b62ef7d2aed9f0872c` plus this release-metadata update. It corrects the runtime-import trust boundary: imported rows remain external/unverified and measurement-ineligible regardless of supplied claims, while those claims are retained as exported provenance. It also validates rendering values before use and prepares GPU replacement buffers before swapping live catalog state, so failed imports retain the active catalog/render state. The original 5.0.0 evidence below remains historical evidence for its artifact and is not presented as verification of the patch artifact.

## 1. Baseline and final structure

All 36 original SHA-256 manifest entries matched. The prescribed untouched `python scripts/run_qa.py` passed, including 13 original Python tests. Baseline evidence is in `qa/v5/baseline-integrity.json` and `baseline-validation-results.json`. The baseline was committed as `e3bad5ceb863090210a8c8a851374d5eca21c9ba` and tagged `v4.0.0-baseline` before v5 edits. The original archive, manifests, source HTML and standalone remain available. The v4 standalone hash remains `6fb8b0bc99f1eba486056e1d0b9e19c7c81cc6ab2d010bc15dbb3dd4158cc101`.

```text
src/{app,astronomy,cosmology,catalog,render,shaders,interaction,ui,styles}/
src/modules.json                       ordered build inputs
data/raw/                              exact acquired source snapshots, query, licenses
data/generated/                        Gaia 5k/20k/50k, BSC5, OpenNGC
data/{catalog_schema,source_manifest,acquisition_manifest,generated_manifest}.json
scripts/                               acquisition, normalization, build, QA, packaging
tests/                                 scientific, pipeline, schema, browser, interaction
docs/V5_*.md                           current architecture, methods, sources and handoff
qa/v5/                                 baseline, numerical, browser, hosted and CI evidence
dist/Cosmic_Atlas_Standalone.html        canonical generated offline distribution
dist/development.html                  modular development edition
hosted/                                matching static deployment
historical/                            original v4 ZIP/manifests and Git history bundle
standalone/                            untouched v4 standalone
.github/workflows/qa.yml                Linux scientific/build CI
```

## 2. Architecture

The 52 ordered classic JavaScript modules separate scientific functions, catalog handling, WebGL rendering, interaction and UI. HTML shell and CSS are editable source files. Python produces deterministic standalone output from fixed normalized inputs; development HTML loads the same ordered modules. No CDN, external stylesheet, runtime API, database, analytics, package installation or server is required to open the standalone.

The design deliberately preserves the v4 renderer and shared lexical state. It is a practical modularization, not a claim that every component now has an isolated ES-module interface. GPU buffers use typed arrays. Inline Blob-worker JSON parsing, 1,000-record normalization chunks, on-demand screen-grid picking, point-size limits, scale-dependent context, throttled HUD updates and disabling backdrop blur for dense catalogs improve behavior. First picking after view changes remains O(n).

## 3. Scientific and interaction improvements

Explicit angular-only status overrides accidental radial fields. Missing coordinates no longer coerce to zero. Distance inference requires positive parallax with formal uncertainty and SNR at least 10; RUWE is guarded where supplied. Unsafe numeric identifiers are rejected rather than rounded. Original source fields, uncertainties, quality indicators and provenance survive normalization and export.

Angular separation uses stable vector cross/dot geometry. Physical separation rejects angular-only, contextual/model, incompatible comoving/local and ineligible records. Betelgeuse's legacy low-SNR display distance is visibly qualified and excluded from physical separation. The observer and all-sky model are not assigned a unique sky direction. Display shells cannot become exported physical distances.

Shared scientific filters drive the atlas, search, paginated/sortable table, diagram and exports. They cover provenance/tier, class, text, photometry, distance, parallax quality, RUWE, redshift, uncertainty and radial velocity. A linked uncorrected Gaia color–magnitude diagram and bounded linear proper-motion display were added. Epoch offsets are limited to ±100 years; source-epoch coordinates remain canonical in exports. Focus indicators, dialog focus containment, touch paths, larger mobile controls and reduced-motion behavior are retained or improved.

## 4–7. Materialized data, counts, query and retrieval

| Dataset | Rows | Angular-only | Interpretation |
|---|---:|---:|---|
| Gaia DR3 5k | 5,000 | 0 | Embedded; prefix of selected 50k |
| Gaia DR3 20k | 20,000 | 0 | Optional prefix of selected 50k |
| Gaia DR3 50k | 50,000 | 0 | Full retrieved brightness-ordered sample |
| BSC5 conversion snapshot | 9,096 | 9,096 | Full retrieved conversion; not a claim of the 9,110-entry HEASARC edition |
| OpenNGC + addendum | 14,027 | 6,663 | Other 7,364 use redshift-derived comoving distances |
| Inherited curated core | 21 | Mixed semantics | 13 observational, 1 reference, 6 context, 1 model |

The three Gaia tiers overlap; do not sum them. The 50k Gaia, BSC5 and OpenNGC snapshots contain 73,123 catalog rows, not 73,123 deduplicated celestial objects. The optional 100k tier was not materialized: 50k already exposed meaningful software-rendering and transfer limits.

Gaia source: `gaiadr3.gaia_source`, TAP endpoint `https://gea.esac.esa.int/tap-server/tap/sync`. Exact saved query in `data/raw/gaia_50k.adql`:

```sql
SELECT TOP 50000 source_id, designation, ra, dec, ra_error, dec_error,
parallax, parallax_error, pmra, pmdec, pmra_error, pmdec_error,
radial_velocity, radial_velocity_error, phot_g_mean_mag, phot_bp_mean_mag,
phot_rp_mean_mag, bp_rp, ruwe, ref_epoch, astrometric_params_solved,
visibility_periods_used
FROM gaiadr3.gaia_source
WHERE parallax > 0 AND parallax_error > 0 AND parallax_over_error >= 10
AND phot_g_mean_mag <= 15 AND ruwe < 1.4
ORDER BY phot_g_mean_mag ASC, source_id ASC
```

Recorded Gaia retrieval start: 2026-09-26 20:50:48.947062 UTC. BSC5: 20:51:47.234902 UTC; OpenNGC NGC.csv: 20:51:47.505345 UTC; addendum: 20:51:47.734534 UTC on the same date. Exact URLs, timestamps, response hashes and byte counts are in `data/acquisition_manifest.json`. Selection is magnitude- and quality-limited, not volume-complete or an unbiased Galactic sample.

Gaia field uncertainties and quality indicators are retained. Inverse-parallax distance is explicitly approximate; there is no zero-point correction or posterior-distance inference. BSC5 raw parallax is arcseconds and is converted to mas, but missing formal errors prevent distance inference; ambiguous legacy proper-motion conventions are not silently interpreted as Gaia fields. OpenNGC retains all raw fields and CC-BY-SA-4.0 attribution. Reproduction from included raw responses works offline; rebuilding HTML is byte-identical for fixed normalized inputs. Regenerating normalized metadata can update generation timestamps.

## 8. Checksums

Standalone: **9,298,746 bytes**, SHA-256:
`f003f97370d7c8e05c3330045081f12d3234b957bb354664b1648c8e1521d185`.

| Normalized file | SHA-256 |
|---|---|
| gaia_5k.json | `f15b855a5f415a2e566e98ebe45bd94b27b6cdac63fa1de20437220ea8abbb28` |
| gaia_20k.json | `f52e8973884751020574e1e472f8cb4029e1579a83c6de24416f3f81e183bb03` |
| gaia_50k.json | `1595070ef53d88bae847fa390460ddfa65ede8a9114d0f280e0d4ff40f82fe0d` |
| bsc5.json | `75c2ee8e0381bd1ffbc20ff2701fc5b6c63ec237654ef2143e12b3492736f265` |
| openngc.json | `4ecd293bf80d1f6b10d1fe5e050cf5f09675421a1175e8c70e390226c3606d83` |

Raw Gaia CSV: `1465834bf489c978d40c167fb966346fcfb1d51fb0011c4f37ecead83875052d`.
Every release payload file is covered by the generated root manifests. `SHA256SUMS.txt` beside the deliverables hashes the complete ZIP, standalone and completion report. The manifest excludes itself to avoid circular hashes; the checksum list includes the JSON manifest.

## 9–10. Literature and Scite findings

Consensus was used to discover and fetch relevant paper records. Primary-source checks covered Planck 2018/PR4, Hogg distance definitions, Gaia DR3 epoch, Lindegren's parallax bias, Bailer-Jones distance inference, RUWE qualification, BSC5 units and selected landmark distances. The full source-linked ledger is `docs/V5_REFERENCES.md`; retained connector responses are in `qa/v5/`.

Scite returned later citation contexts qualifying asymmetric distance intervals, uncertain distances of bright evolved stars and sensitivity to Galactic priors for weak parallaxes. Its metadata reported one contrasting citation for the distance paper, but the targeted contrasting search returned none. Neither result proves the method disputed or undisputed. Citation graphs were truncated, some edges had no snippets, and questionable chronology in excerpts was not used as sole numerical evidence. RUWE <1.4 is a sample selection criterion, not a universal scientific validity boundary. The audit is targeted, not exhaustive. The inherited curated core is an adopted literature snapshot; not every landmark was revalidated against every current publication.

## 11. Independent numerical validation

Wolfram Language independently evaluated the documented ΛCDM integrals and vector calculations. Internal regressions agree within recorded tolerances (comoving distance relative 3e-5, lookback relative 5e-5, angular values 1e-8 degrees):

| Input | Independent comoving distance (ly) | Independent lookback time (yr) |
|---|---:|---:|
| z=0.158339 | 2,209,025,954.776923 | 2,052,673,596.826742 |
| z=1 | 11,092,369,597.366245 | 7,949,945,524.668449 |
| z=1089 | 45,218,866,181.355774 | 13,790,320,753.096798 |

Other checks: Sirius Galactic coordinates l=227.23025077711668°, b=−8.890342476529936°; Sirius–Vega separation 157.85950086881016°; 100 mas gives 32.61563777 ly; orthogonal 3/4-ly vectors separate by 5 ly. These extra digits identify regression constants, not observational precision. Fixtures: `tests/fixtures/independent-numerics.json`. Agreement validates the implementation of the chosen model, not the uniqueness of its assumptions.

## 12–13. Automated and browser/WebGL results

`python scripts/run_qa.py` passed: 32 JavaScript scientific/data tests, 19 Python tests, deterministic rebuild, syntax/DOM/runtime-policy checks, full catalog/schema validation and Python compilation. The Python suite includes the 13 baseline tests. Local Windows evidence is `qa/v5/validation_results.json`; exact final-head Linux CI evidence is appended at packaging.

Four browser scenarios passed all their recorded checks: Chromium desktop, Chromium mobile emulation, Chromium modular development edition, and Firefox desktop. All offline scenarios made no external network requests and reported no page errors. WebGL initialized and programs linked. Search, filters, table, epochs, provenance round trip, angular measurement guards and tour paths passed. Additional interaction QA passed 17 checks, including actual JSON download/schema validation, BSC5/OpenNGC imports, atomic duplicate rejection, injection/URL guards, paging, inspector selection, mobile panel and resize. All six scale buttons completed their transitions with WebGL error 0. Hosted QA returned HTTP 200, loaded 5,000 records and WebGL, and verified byte identity with the offline HTML.

Screenshots and machine-readable reports are included. Automated accessibility paths passed; an independent assistive-technology audit was not performed. Real Safari/iOS and physical-phone QA are not claimed.

## 14–15. Measured performance and device findings

Measurements below come from `qa/v5/browser.json`. Import timing includes parse/transfer, chunked normalization and CPU buffer-submission work. FPS is a brief approximately two-second post-import sample, not a sustained benchmark or universal performance guarantee.

| Browser environment | Rows | Import ms | Filter ms | First pick ms | Cached pick ms | Mean FPS | Worst frame ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| Chromium desktop, software rendering | 5,000 | 241.4 | 7.5 | 12.2 | 0.1 | 38.3 | 133.3 |
| Chromium desktop, software rendering | 20,000 | 932.7 | 11.9 | 24.4 | 0.1 | 30.5 | 366.6 |
| Chromium desktop, software rendering | 50,000 | 2,420.9 | 30.9 | 49.3 | 0.1 | 20.5 | 766.6 |
| Chromium mobile emulation | 5,000 | 217.6 | 5.8 | 7.7 | 0.0 | 60.0 | 16.8 |
| Chromium mobile emulation | 50,000 | 2,056.3 | 29.9 | 45.0 | 0.0 | 33.3 | 333.2 |
| Firefox desktop, ANGLE/D3D path | 5,000 | 253.0 | 5.0 | 6.0 | 0.0 | 144.0 | 7.0 |
| Firefox desktop, ANGLE/D3D path | 20,000 | 1,003.0 | 19.0 | 16.0 | 1.0 | 144.0 | 7.0 |
| Firefox desktop, ANGLE/D3D path | 50,000 | 2,516.0 | 45.0 | 37.0 | 0.0 | 144.0 | 7.0 |

Startup: Chromium desktop 1,614.6 ms; mobile 1,439.7 ms; development edition 1,833.1 ms; Firefox 1,787.9 ms. Chromium explicitly used SwiftShader in the harness. Firefox exposed an ANGLE AMD/Radeon description with a privacy qualifier; this does not independently establish the exact physical GPU model. Mobile was a 390×844 emulated viewport, requested DPR 2, application cap 1.5. It is not evidence from a physical phone.

Chromium's coarse reported JS heap was roughly 39.6 MB desktop and 68 MB mobile, while Firefox did not expose that metric. These values exclude GPU/process memory and are not dependable peak-memory measurements. GPU upload timings are CPU submission timings, not GPU timestamps. Dense-catalog blur removal and particle-size control prevented the earlier severe software-rendering behavior, but the final 766.6 ms worst desktop frame and 20.5 FPS still represent a material limitation. Fast filtering does not establish smooth navigation on every device.

## 16–17. Remaining limits and precise service constraints

Scientific: no full astrometric covariance, parallax zero-point correction, extinction correction, posterior-distance inference, cross-catalog deduplication, perspective/relativistic epoch propagation, orbit prediction or observational CMB reconstruction. OpenNGC redshift distances inherit peculiar-velocity/model uncertainty, especially nearby. Proper-motion display is a tangent-vector approximation. Radial-only uncertainty is not full 3D uncertainty. Procedural structure and CMB texture remain labeled illustrations.

Engineering: classic modules retain shared state; on-demand first picking is O(n); raw metadata and verbose JSON raise transfer/memory costs; worker parsing still incurs structured-clone transfer; import and software-rendered frames can stall; the 100k import cap is a safeguard, not a tested 100k performance claim. Browser evidence covers the available Windows Chromium/Firefox setup, not Safari or physical mobile hardware. The complete standalone is about 9.3 MB because it embeds real observations and provenance.

External constraints: Gaia TAP retrieval succeeded. GitHub, Wolfram, Consensus and Scite operated successfully within the coverage limits above. The Vercel MCP deployment operation returned `Tool deploy_to_vercel not found`; authenticated Vercel CLI deployment succeeded and the read connector confirmed readiness. The initial OpenNGC license path returned 404; the correct `LICENSES/CC-BY-SA-4.0.txt` was retrieved and preserved. The Gaia acknowledgement page returned HTTP 451, so the documentation uses a clearly paraphrased acknowledgement and accessible official DR3 source links, not a fabricated verbatim quotation. No missing credentials blocked completion. PostHog, Supabase and Figma were unnecessary for this scope and were not made runtime dependencies.

## 18–22. Artifacts, deployment and repository

The final identity appendix gives absolute deliverable paths, commit, tag and exact-head CI links. The source snapshot includes data and evidence; its Git bundle preserves recoverable history. The full ZIP contains all three Gaia tiers, BSC5, OpenNGC, raw responses, licenses, query/manifests, schemas, source, build/test scripts, documentation, baseline artifacts and QA screenshots. See `docs/V5_MIGRATION.md` for reproduction and development steps. Software licensing remains the supplied `LICENSE_SCOPE.md`; the private repository does not assert a new blanket open-source license.

Live public demo: https://cosmic-atlas-scientific.vercel.app

Immutable deployment: https://cosmic-atlas-scientific-13dpqfl12-atomicdjts-projects.vercel.app

Vercel project: `prj_zNLd833awlhqWqEz2deW4tqsdQjM`; deployment: `dpl_81WLMUQYrt1UpdceE19n36FxqB54`; status READY, target production. Vercel treated the new project's first CLI deployment as production automatically. Deployment metadata points to implementation commit `46dc8e5e2d9aaf355c0234163c0e4b5061935217`; final commits add evidence, manifests, documentation and packaging without changing the tested HTML. `qa/v5/hosted.json` verifies the served artifact hash. Hosting is optional and has no role in offline execution.

## 23. Most useful next steps

1. Test sustained navigation, thermal behavior, peak memory and accessibility on physical phones and Safari; prioritize the measured software-rendering stalls before increasing catalog size.
2. Replace verbose working copies and structured-clone transfer with a validated compact/transferable representation while retaining lossless provenance in the source/export layer.
3. Introduce explicit module interfaces and independent rendering/catalog lifecycle tests before a broader architectural change.
4. Add versioned posterior distances, extinction and full covariance only with documented scientific models and independent verification; commission an astronomer review of the curated core.
5. The original application and documentation license scope is resolved under MIT. Continue preserving upstream data attribution and share-alike obligations when redistributing catalog data.

The available implementation, acquisition, numerical verification, local tests, browser QA, static deployment and release packaging have been completed. Human scientific review, physical-device certification, PR approval and merge are separate states and are not claimed here.
