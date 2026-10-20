# Scientific reviewer quickstart — Cosmic Atlas

**Release distinction:** The latest formal release is [v5.1.0](https://github.com/atomicdjt/cosmic-atlas-scientific/releases/latest). The `main` branch contains **unreleased v6 development**. Do not cite v6 numerical results as independently validated deployed capabilities.

## Inspect the local visual workspace

Open `dist/Cosmic_Atlas_Standalone.html` from a checkout or use the tagged release package for the corresponding version. A standards-compliant browser with WebGL support is required. The embedded starter catalog comprises 5,000 Gaia DR3 records; additional tiers require explicit local loading.

[Atlas QA screenshot (development)](../qa/v6/chromium-atlas.png) · [Scientific workspace QA screenshot (development)](../qa/v6/chromium-workspace.png) · [Mobile workspace QA screenshot (development)](../qa/v6/mobile-workspace.png).

Screenshots are stored **QA artifacts from a development run**, not evidence of current cloud deployment or measurements on a physical device.

## Reproduce bounded computation

From a checkout with project requirements installed:

```bash
python -m pip install -r requirements-dev.txt -r requirements-science.txt
python scripts/build_v5.py
python scripts/ephemeris_pipeline.py --offline
node tests/v6_numerics.cjs
python scripts/run_qa.py
```

For the browser suites:

```bash
python -m playwright install chromium firefox
python tests/browser_qa.py
python tests/readiness_qa.py
python tests/v6_browser_qa.py
```

Compare exact fixtures and accepted tolerances in [numerical validation](V6_NUMERICAL_VALIDATION.md), [v6 methods](V6_METHODOLOGY.md), and the recorded [v6 numerical JSON](../qa/v6/numerics.json).

### What the reported numbers do (and do not) mean

The versioned validation record reports 26,280 held-out interpolation-midpoint comparisons for nine Horizons/DE441 targets, with maximum positional discrepancy around 0.07837 km. These are **interpolation discrepancies against sampled source responses**, not a continuous error bound, independent JPL validation, or ephemeris uncertainty.

The Newtonian simulator omits many real forces; zero-revolution Lambert exploration is not flight-certified; Gaia/HEALPix packs are subsets and imported datasets remain unverified; terrain is metadata only. Read the [full limitations](V6_LIMITATIONS.md) before reporting performance or scientific accuracy. No expert endorsement, mobile-device certification, or new v6 release is claimed.

Use [catalog attribution](V6_DATA_AND_PROVENANCE.md) and [licenses](../LICENSE_SCOPE.md) when reusing derived scientific material.
