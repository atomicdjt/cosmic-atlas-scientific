# Data and release scripts

All v4 scripts use the Python standard library only.

- `catalog_common.py` — coordinate parsing, Planck-like cosmology helper, validation, payload writer.
- `fetch_gaia_dr3.py` — ESA Gaia Archive TAP/ADQL -> `cosmic-atlas.catalog.v1` physical records.
- `fetch_bsc5.py` — compact BSC5 JSON conversion -> angular-only bright-star records.
- `fetch_openngc.py` — OpenNGC CSV -> redshift-derived physical or angular-only records.
- `merge_catalogs.py` — deterministic ID-based merge of normalized catalogs.
- `validate_catalog.py` — dependency-free schema/semantic checks.
- `build_standalone.py` — copies source to standalone distribution and records static integrity checks/SHA-256.
- `run_qa.py` — release QA orchestrator.

Network acquisition scripts are intentionally separate from the standalone application. The released HTML performs no background data fetches.
