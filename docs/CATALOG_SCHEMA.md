# Catalog schema: `cosmic-atlas.catalog.v1`

The application accepts either a JSON array of records or an object containing a `records` array. The preferred portable form is:

```json
{
  "schema": "cosmic-atlas.catalog.v1",
  "source": {"catalog": "Example"},
  "records": []
}
```

The machine-readable JSON Schema is `data/catalog_schema.json`.

## Required record fields

| Field | Type | Meaning |
|---|---|---|
| `id` | string/integer | Stable source-local identifier. |
| `ra_deg` | number | ICRS right ascension in degrees, normalized to `[0, 360)`. |
| `dec_deg` | number | ICRS declination in degrees, `[-90, 90]`. |

A record must also provide either a positive `distance_ly` **or** `angular_only: true`.

## Physical-distance records

Recommended fields:

```json
{
  "id": "gaia-dr3-123",
  "name": "Gaia DR3 123",
  "ra_deg": 123.45,
  "dec_deg": -12.3,
  "distance_ly": 42.1,
  "angular_only": false,
  "parallax_mas": 77.47,
  "parallax_error_mas": 0.08,
  "pmra_masyr": 12.1,
  "pmdec_masyr": -5.2,
  "radial_velocity_kms": 18.4,
  "phot_g_mean_mag": 8.7,
  "bp_rp": 1.02,
  "source": "Gaia DR3 / ESA Gaia Archive",
  "source_ref": "gaiadr3.gaia_source",
  "distance_basis": "Inverse parallax with configured S/N cut"
}
```

## Angular-only records

Use this when sky position is known but radial distance is absent or deliberately not adopted:

```json
{
  "id": "bsc5-hr-2491",
  "name": "Sirius",
  "ra_deg": 101.287083,
  "dec_deg": -16.716111,
  "distance_ly": null,
  "angular_only": true,
  "display_shell_ly": 1000,
  "vmag": -1.46,
  "source": "BSC5",
  "distance_basis": "No radial distance in this source normalization"
}
```

`display_shell_ly` controls only where the point is visible in the logarithmic renderer. It is **not exported or displayed as a physical distance**, and angular-only points are excluded from 3-D separation calculations.

## Recognized optional fields

- identity: `source_id`, `designation`, `name`, `tag`, `type`, `description`
- radial: `distance_ly`, `distance_uncertainty`, `distance_basis`, `redshift`, `radial_velocity_kms`
- astrometry: `parallax_mas`, `parallax_error_mas`, `pmra_masyr`, `pmdec_masyr`
- photometry: `phot_g_mean_mag`, `bp_rp`, `vmag`, `temperature_k`
- provenance: `source`, `source_ref`, `source_url`
- visualization: `color`, `display_shell_ly`

Additional fields are permitted so upstream catalog columns can survive normalization.

## Import behavior

- Every runtime-imported record is normalized as external and unverified. File-supplied `tier` and `measurement_eligible` values remain provenance claims and cannot promote the record into physical-measurement operations; exports retain those original claims under `source_claims`.
- Zero distance is reserved for the curated observer reference; an imported row claiming `tier: "reference"` with `distance_ly: 0` is treated as angular-only.
- Invalid or non-hex imported colors use the photometry-derived fallback rather than reaching the renderer.
- Replacement GPU buffers are prepared before swapping imported catalog state; a failed preparation preserves the previous import.
- Invalid RA/Dec records are rejected.
- RA is normalized modulo 360.
- If `distance_ly` is absent but positive `parallax_mas` is present, the browser derives an inverse-parallax display distance.
- If neither physical distance nor usable parallax is present, the record is accepted as angular-only and placed on `display_shell_ly` (default 1,000 ly).
- v4 loads at most 50,000 rows from a single JSON import to bound mobile memory usage.
- Large imports remain GPU-buffered; object click-picking intentionally limits brute-force hit testing when the imported set exceeds 5,000 rows.
