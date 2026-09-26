# Codex / Work handoff brief

## Baseline

Treat **Cosmic Atlas Scientific v4.0.0 / `CA-SCI-4.0-2026-09-26`** as the frozen baseline. Start from `src/Cosmic_Atlas_v4_source.html`; use `standalone/Cosmic_Atlas_Scientific_v4.html` only as the portable distribution artifact.

Before changes:

```bash
python scripts/run_qa.py
```

The baseline should report all local QA steps passing. The browser GPU smoke test is intentionally marked environment-blocked in this build environment.

## Non-negotiable product invariants

1. Preserve an offline zero-dependency standalone build.
2. Never present procedural geometry as observational survey data.
3. Preserve provenance and distance-basis metadata through transformations.
4. Missing radial distance must remain explicit; never synthesize one without labeling it model/display-derived.
5. Angular-only records must not participate in 3-D physical-distance claims.
6. Catalog query text, release version, filters, attribution, and checksums should accompany generated datasets.
7. Preserve mobile touch navigation and keyboard/accessibility paths.

## First recommended Codex branch

`refactor/modular-source-v5`

Objectives:

- Extract pure scientific functions first (`coordinates`, `cosmology`, `measurement`, `normalization`).
- Add unit tests before moving renderer/UI code.
- Build `dist/Cosmic_Atlas_Standalone.html` from modules.
- Compare generated standalone behavior against v4 before adding features.

## First recommended Work task

Run `scripts/fetch_gaia_dr3.py` in an environment with reliable Gaia TAP access, store the exact ADQL and output checksum, validate the normalized JSON, then exercise the v4 importer with 5k/20k/50k record tiers and record mobile/browser performance.

## Scientific expansion backlog

- Gaia DR3 materialized subset with selection metadata and credits.
- Bayesian/curated distance product for lower-S/N parallaxes.
- Epoch propagation using proper motions and radial velocity.
- HR/color-magnitude linked view.
- RUWE/parallax-SNR/magnitude/object-class filters.
- OpenNGC/galaxy redshift layers with clear model-distance semantics.
- Survey-derived large-scale structure data in place of/alongside procedural filaments.
- Full covariance and uncertainty propagation for precision modes.

## Release discipline

Each future release should produce:

- standalone HTML,
- source tree,
- data manifest + schema,
- generated dataset checksums,
- query/config snapshot,
- automated QA JSON,
- human-readable release notes,
- browser screenshots from a WebGL-capable CI runner.
