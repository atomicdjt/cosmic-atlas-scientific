# Recommended future repository layout

v4 deliberately ships as a single-file application **and** as a structured source package. For the next Codex/Work phase, do not keep hand-editing one monolithic HTML file. Preserve the single-file build as a generated distribution target.

```text
cosmic-atlas/
├─ README.md
├─ LICENSE
├─ CITATION.cff
├─ CHANGELOG.md
├─ package.json                 # optional dev/build tooling only
├─ pyproject.toml               # catalog-pipeline/test tooling
├─ public/
│  └─ index.html                # generated or minimal shell
├─ src/
│  ├─ app/
│  │  ├─ bootstrap.js
│  │  ├─ state.js
│  │  └─ constants.js
│  ├─ astro/
│  │  ├─ coordinates.js        # ICRS/Galactic transforms
│  │  ├─ cosmology.js          # LCDM integration/lookups
│  │  ├─ distances.js
│  │  └─ measurement.js
│  ├─ data/
│  │  ├─ schema.js
│  │  ├─ normalize.js
│  │  ├─ provenance.js
│  │  └─ catalog-store.js
│  ├─ render/
│  │  ├─ webgl.js
│  │  ├─ shaders/
│  │  ├─ camera.js
│  │  ├─ particles.js
│  │  └─ picking.js            # migrate to GPU/spatial-index picking
│  ├─ ui/
│  │  ├─ inspector.js
│  │  ├─ layers.js
│  │  ├─ data-table.js
│  │  ├─ tour.js
│  │  └─ accessibility.js
│  └─ styles/
│     └─ app.css
├─ data/
│  ├─ core/
│  ├─ generated/               # .gitignore large generated extracts as appropriate
│  ├─ schema/
│  └─ manifests/
├─ pipeline/
│  ├─ gaia/
│  ├─ bsc5/
│  ├─ openngc/
│  ├─ merge.py
│  └─ validate.py
├─ tests/
│  ├─ unit/
│  ├─ fixtures/
│  ├─ browser/
│  └─ scientific-regression/
├─ docs/
│  ├─ methodology.md
│  ├─ data-provenance.md
│  ├─ architecture.md
│  └─ release-process.md
├─ dist/
│  └─ Cosmic_Atlas_Standalone.html   # generated zero-dependency release
└─ .github/workflows/
   ├─ test.yml
   ├─ data-validation.yml
   └─ release.yml
```

## Migration order

1. **Freeze v4** and tag it as a baseline.
2. Extract cosmology/coordinates/data normalization into pure modules with unit tests first.
3. Extract renderer and UI without changing behavior.
4. Add a deterministic build step that concatenates/inlines CSS, JS, shaders, and embedded core JSON into `dist/Cosmic_Atlas_Standalone.html`.
5. Add browser regression tests against both modular development build and standalone distribution.
6. Run Gaia/BSC5/OpenNGC pipeline as a separate reproducible data job, not as browser runtime networking.
7. Add checksums and source-query metadata to every generated dataset release.

## Highest-value later improvements

- Materialized Gaia DR3 dataset with reproducible ADQL query and checksum.
- Web Worker parsing for 50k+ imports.
- GPU or spatial-index picking instead of O(n) CPU screen projection.
- IndexedDB/local persistence for user-loaded catalogs.
- Epoch propagation for proper motion and uncertainty covariance.
- Color-magnitude / HR diagram linked brushing.
- Selection filters for magnitude, color, object class, distance, redshift, and quality metrics (RUWE/parallax S/N).
- Survey-derived galaxy point layers and redshift slices.
- Automated Playwright/browser screenshots on real WebGL-capable CI runners.
- PWA packaging while retaining the downloadable one-file build.

## Codex handoff principle

The generated single-file artifact is a **distribution format**, not the long-term source architecture. Codex should work primarily in the modular source tree and regenerate the standalone file in CI. This keeps the project's distinctive portability without sacrificing maintainability or testability.
