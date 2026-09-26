# Data sources, attribution, and redistribution

This document separates **scientific provenance** from **software packaging**. Upstream catalog data remain subject to their own acknowledgement, citation, and licensing expectations.

## Gaia DR3

- Archive: https://gea.esac.esa.int/archive/
- DR3 documentation: https://gea.esac.esa.int/archive/documentation/GDR3/
- Main source table documentation: https://gea.esac.esa.int/archive/documentation/GDR3/Gaia_archive/chap_datamodel/sec_dm_main_source_catalogue/ssec_dm_gaia_source.html

`scripts/fetch_gaia_dr3.py` queries `gaiadr3.gaia_source` through TAP. The v4 distribution does **not** embed a bulk Gaia extract because the release build runtime could not establish reliable TAP transport. A future generated data product must retain the query and use the official Gaia acknowledgement/citation guidance.

## SIMBAD / CDS

- Service: https://simbad.cds.unistra.fr/
- Data model/provenance guidance: https://simbad.cds.unistra.fr/Pages/guide/ch15.htx

The curated core uses SIMBAD as a gateway to positions/identifiers and cites underlying bibliography where practical. SIMBAD itself should not be treated as the original source of every measurement.

## Yale Bright Star Catalogue (BSC5)

- HEASARC BSC5P reference: https://heasarc.gsfc.nasa.gov/W3Browse/star-catalog/bsc5p.html
- JSON conversion used by the ingestion utility: https://github.com/brettonw/YaleBrightStarCatalog

The compact `bsc5-short.json` conversion is normalized as **angular-only** because the compact representation does not carry the distance information needed for defensible 3-D placement.

## OpenNGC

- Repository: https://github.com/mattiaverga/OpenNGC
- License declared by the project: CC-BY-SA-4.0

OpenNGC aggregates information from multiple astronomical databases and provides per-row source metadata. `fetch_openngc.py` preserves the row `Sources` field. If a positive redshift exceeds the configured cosmology threshold, the utility may calculate a model comoving distance; otherwise the object remains angular-only.

## Planck 2018 cosmology

- Reference: https://arxiv.org/abs/1807.06209

Release defaults use a Planck-2018-like flat ΛCDM model (`H0=67.4`, `Omega_m=0.315`) for explanatory cosmological quantities and redshift-derived comoving distance.

## Literature distances in the curated core

The embedded core also contains explicitly named literature distances for selected objects where parallax/redshift is not the appropriate estimator. Those references are stored with individual records in `data/embedded_core_catalog.json` and displayed by the inspector.

## Redistribution rule of thumb

When publishing a future repo or hosted dataset:

1. Preserve `source`, `source_ref`, and `source_url` fields.
2. Preserve catalog-level acknowledgements in the README/site.
3. Do not remove OpenNGC's share-alike obligations from redistributed OpenNGC-derived data.
4. Preserve the Gaia query, release, and required acknowledgement/citations for any generated Gaia subset.
5. Distinguish model-derived distance from measured/catalog distance.
