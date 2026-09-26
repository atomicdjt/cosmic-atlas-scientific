# Data products, attribution and licensing

## Materialized observations

The Gaia tiers contain 5,000 / 20,000 / 50,000 rows from one ordered DR3 query. They overlap completely at the smaller tiers; do not sum them. The release also contains 9,096 BSC5 conversion records and 14,027 OpenNGC records. Catalogs overlap astrophysically; the combined row count is not a deduplicated count of celestial objects.

The standalone embeds Gaia 5k and the original 21 curated/reference/context/model records. The other normalized JSON files can be imported offline. Source snapshots, the exact ADQL, retrieval timestamps, query endpoint, field selection and checksums are shipped. `data/acquisition_manifest.json` records initial transport results, including an initial OpenNGC license-path 404 subsequently resolved at `LICENSES/CC-BY-SA-4.0.txt`. `data/generated_manifest.json` records final normalized-file sizes, counts and SHA-256 values.

Gaia was retrieved from ESA's TAP endpoint on 2026-09-26. BSC5 and OpenNGC raw data were also retrieved that day. The GitHub source heads checked after retrieval were OpenNGC `da90466031b0372c896588b85be6016c617e205b` and BSC5 conversion `abffb3b7223ae37e879b0a3ff5b49ad06aed5576`. The raw-byte checksums are authoritative for this release; head inspection after download is not itself proof that a mutable URL could not have changed between requests.

## Reproduction

With supplied source snapshots, run:

```text
python scripts/acquire_v5.py --offline
python scripts/normalize_snapshots.py
python scripts/build_v5.py
python scripts/run_qa.py
```

For a fresh retrieval, omit `--offline`. A fresh retrieval can differ as upstream services change; it is a new data product with its own timestamp and hashes. Some legacy normalization timestamps reflect generation time. Preserve the supplied normalized files for byte-identical release rebuilding. The HTML build itself is deterministic for fixed inputs.

Gaia ADQL: `data/raw/gaia_50k.adql`. Raw Gaia response: `data/raw/gaia_50k.csv`. BSC5 full conversion snapshot: `data/raw/bsc5.json`. OpenNGC snapshots: `data/raw/NGC.csv` and `data/raw/addendum.csv`. `scripts/normalize_snapshots.py` augments the existing OpenNGC ingestion output with every upstream field and emits the full BSC5 conversion with angular-only distances. The original compact BSC5/DR3 scripts remain available for historical compatibility.

## Acknowledgements and rights

Gaia observations are credited to the European Space Agency Gaia mission and the Gaia Data Processing and Analysis Consortium (DPAC). DPAC funding is provided by national institutions, particularly those participating in the Gaia Multilateral Agreement. Cite the Gaia mission and DR3 summary papers, together with the relevant processing papers: [Gaia DR3 overview](https://www.cosmos.esa.int/web/gaia/data-release-3), [DR3 papers](https://www.cosmos.esa.int/web/gaia/dr3-papers), and [Gaia EDR3 astrometry](https://doi.org/10.1051/0004-6361/202039709). The official credits endpoint returned an access error during this audit; the acknowledgement is retained, not claimed to be a verbatim refreshed licensing statement.

BSC5: Hoffleit & Warren (1991), Bright Star Catalogue, 5th Revised Edition. The full JSON conversion by Bretton Wade is MIT-licensed; its license is saved in `data/raw/BSC5-conversion-LICENSE`. Catalog attribution remains separate from conversion-code licensing. This conversion has 9,096 rows and is not the HEASARC table with every later correction and added nonstellar entry.

OpenNGC-derived data are distributed under CC-BY-SA-4.0. Credit [OpenNGC and contributors](https://github.com/mattiaverga/OpenNGC), retain its source metadata, indicate Cosmic Atlas normalization and cosmology-derived distances as modifications, and retain the same license for this derived dataset. Full license: `data/raw/OpenNGC-LICENSE`. The OpenNGC project's software MIT license does not replace its database license.

No universal software license is retroactively asserted for the supplied Cosmic Atlas code. `LICENSE_SCOPE.md` remains the owner's licensing boundary. The source repository is private. A public source release should select an explicit code license separately from catalog terms. The hosted static demonstration does not change those rights.
