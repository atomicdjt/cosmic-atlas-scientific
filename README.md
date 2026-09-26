# Cosmic Atlas Scientific v4

**Release:** 4.0.0  
**Build:** `CA-SCI-4.0-2026-09-26`  
**Primary artifact:** `standalone/Cosmic_Atlas_Scientific_v4.html`

Cosmic Atlas Scientific is a zero-dependency, offline-capable WebGL visualization that moves continuously from the Solar neighborhood to the cosmic microwave background scale while keeping **observational records, model-derived quantities, and illustrative procedural geometry explicitly separated**.

## What v4 adds

- Importable scientific catalog layer (`cosmic-atlas.catalog.v1`) with up to 50,000 in-memory records per load.
- Physical-distance and **angular-only** record semantics. Angular-only sources are placed on a display shell and excluded from 3-D separation claims.
- Curated core records with provenance, distance basis, uncertainty text, ICRS coordinates, derived Galactic coordinates, and observed/model velocity-redshift distinctions.
- Local JSON import, merged CSV/JSON export, searchable data table, canvas snapshot, guided tour, catalog-only mode, and two-point angular/3-D measurement.
- Deterministic procedural context (seeded generation), corrected Sun/Galactic-centre geometry, high-DPI rendering, touch/pinch controls, reduced-motion support, keyboard navigation, and explicit WebGL shader/program diagnostics.
- Reproducible ingestion scripts for **Gaia DR3**, **BSC5**, and **OpenNGC**, plus validation and merge utilities.

## Quick start

Open `standalone/Cosmic_Atlas_Scientific_v4.html` in a modern browser. No web server, package install, or network connection is required for the embedded release.

Optional external catalogs can be generated with the scripts and loaded from the UI:

```bash
python scripts/fetch_gaia_dr3.py --limit 20000 --max-g 12 --min-parallax-snr 10 -o data/gaia_dr3_subset.json
python scripts/fetch_bsc5.py -o data/bsc5_angular.json
python scripts/fetch_openngc.py -o data/openngc_catalog.json
python scripts/merge_catalogs.py data/gaia_dr3_subset.json data/openngc_catalog.json -o data/merged_catalog.json
python scripts/validate_catalog.py data/merged_catalog.json
```

Then choose **Import catalog JSON** inside the application.

## Scientific boundaries

This release is a **scientific/educational visualization**, not a replacement for Gaia Archive, SIMBAD, TOPCAT, Aladin, ESASky, or a survey-analysis environment.

The application distinguishes:

1. **Reference** — defined observer/origin information.
2. **Observational** — curated catalog/literature-grounded core records.
3. **Imported** — user-loaded normalized catalog records.
4. **Context** — approximate landmarks used to orient the viewer.
5. **Model** — quantities/surfaces derived from the adopted cosmology.

Milky Way particle texture, Local Group texture, macrostructure markers, cosmic-web filaments, and the CMB color texture are illustrative procedural context. They are not represented as survey reconstructions.

## Why Gaia DR3 is not embedded in the shipped HTML

The build runtime used for this release could not reliably reach the Gaia TAP bulk-query service. The release therefore does **not** substitute another catalog and label it “Gaia.” `scripts/fetch_gaia_dr3.py` contains the reproducible ADQL/TAP pipeline intended for a normal networked environment, Codex, or Work. Once run, its JSON output can be loaded into v4 without changing the renderer.

## Repository map

- `standalone/` — immutable, portable release artifact.
- `src/` — editable v4 source used to build the standalone artifact.
- `data/` — canonical embedded catalog, schema, provenance manifest, and import example.
- `scripts/` — catalog acquisition, normalization, merging, validation, and release build utilities.
- `docs/` — scientific methodology, schema documentation, data-source policy, and future architecture.
- `qa/` — release validation outputs and limitations.
- `tests/` — dependency-free regression/static tests.

See `docs/FUTURE_REPOSITORY_LAYOUT.md` for the recommended multi-file architecture for a future Codex-managed repository.

## Core references

- Gaia DR3 archive/documentation: https://gea.esac.esa.int/archive/documentation/GDR3/
- SIMBAD/CDS: https://simbad.cds.unistra.fr/
- Planck 2018 cosmological parameters: https://arxiv.org/abs/1807.06209
- HEASARC BSC5P: https://heasarc.gsfc.nasa.gov/W3Browse/star-catalog/bsc5p.html
- OpenNGC: https://github.com/mattiaverga/OpenNGC

## Attribution and redistribution

Catalogs retain their own attribution/citation/licensing requirements. See `docs/DATA_SOURCES_AND_ATTRIBUTION.md` and `data/source_manifest.json` before redistributing derived catalog bundles.
