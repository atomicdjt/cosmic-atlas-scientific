> **v5 entry point:** see the root README and `docs/V5_MIGRATION.md`. The release pipeline uses `scripts/acquire_v5.py`, `scripts/normalize_snapshots.py`, `scripts/build_v5.py`, and `scripts/run_qa.py`. The text below describes the preserved v4 utilities. Real v5 Gaia, BSC5 and OpenNGC snapshots are recorded in the v5 manifests.

# Data directory

`embedded_core_catalog.json` and `embedded_core_catalog.csv` preserve the canonical internal records embedded in the v4 release. `curated_observational_import.json` is the same observational subset normalized to the public import schema. They preserve the evidence tiers used by the UI: reference, observational, context, and model.

`catalog_schema.json` defines the interchange format accepted by **Import catalog JSON**. A record may have a real `distance_ly`, or it may set `angular_only: true`. Angular-only records are rendered on a clearly non-physical `display_shell_ly` and are excluded from 3-D separation claims.

`example_import_catalog.json` is a small import-ready example. The ingestion scripts produce the same schema.

`source_manifest.json` records upstream provenance and the important negative fact that bulk Gaia DR3 is **not embedded** in this release because the build environment could not reliably reach Gaia TAP. The Gaia ingestion script is included for a networked future build.
