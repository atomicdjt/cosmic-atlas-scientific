# Scientific methodology

## 1. Scope

Cosmic Atlas Scientific v4 is designed to communicate astronomical scale while preserving a visible boundary between **measured/catalog data**, **literature-adopted values**, **cosmology-derived values**, and **illustrative geometry**. Its primary objective is not precision astrometric analysis; it is traceable scientific visualization.

## 2. Coordinate model

Catalog directions are stored as ICRS/J2000-equivalent right ascension and declination in decimal degrees. The viewer is Sol-centered. For a record with radial distance `d`, the atlas transforms `(RA, Dec, d)` into a 3-D Cartesian direction and then applies a nonlinear radial display mapping.

The nonlinear mapping deliberately compresses approximately 46 billion light-years into a navigable scene. **It changes radial scale, not sky direction.** Therefore visual Euclidean distances in renderer coordinates must not be interpreted as physical distances.

Galactic longitude/latitude shown in the inspector are derived from ICRS unit vectors using the standard modern equatorial-to-Galactic rotation matrix.

## 3. Radial-distance policy

### 3.1 Direct parallax

For nearby imported sources with positive parallax, the default Gaia ingestion script uses:

`d(pc) = 1000 / parallax(mas)`

and converts parsecs to light-years. This simple inversion is restricted by default to a configurable high parallax signal-to-noise threshold (`>=10`). Even then it is a **display-distance policy**, not a universal statistical distance estimator. Low-S/N or negative parallaxes require a probabilistic inference model or external distance catalogue.

### 3.2 Literature distances

For core objects where direct parallax or redshift is not the appropriate distance estimator, v4 adopts named literature values. The inspector exposes the source and distance basis rather than silently blending methods.

### 3.3 Redshift-derived comoving distance

For cosmological redshifts, v4 uses a flat Planck-2018-like ΛCDM model with:

- `H0 = 67.4 km s^-1 Mpc^-1`
- `Omega_m = 0.315`
- `Omega_r = 9.2e-5`
- `Omega_Lambda = 1 - Omega_m - Omega_r`

The line-of-sight comoving distance is evaluated numerically from

`D_C = (c/H0) ∫_0^z dz' / E(z')`

with

`E(z) = sqrt(Omega_r(1+z)^4 + Omega_m(1+z)^3 + Omega_Lambda)`.

This gives approximately 45.22 billion light-years to `z=1089` in the implementation. Redshift-derived distance is not used for Local Group objects because peculiar velocities can dominate the Hubble flow there.

## 4. Angular-only records

A major v4 design rule is that **missing radial distance is not repaired by inventing one**.

A normalized record may set `angular_only: true`. The renderer then places it on an explicitly arbitrary `display_shell_ly` solely to make the sky direction visible. The UI:

- labels its distance as angular-only,
- exposes the display-shell caveat,
- suppresses model redshift/lookback derived from that shell,
- and refuses to report a 3-D separation when either measurement endpoint is angular-only.

This makes BSC5-short and other direction-only imports useful without converting visualization geometry into a scientific claim.

## 5. Data/evidence tiers

### Reference
Defined coordinates or origin semantics (for example, Sol as the observer origin).

### Observational
Curated catalog/literature records with explicit source and distance basis.

### Imported
Runtime-loaded normalized catalog records. The import tier says where the record came from; it does not by itself certify every upstream measurement.

### Context
Approximate navigational landmarks. These are not precision centroids and should not be used for quantitative analysis.

### Model
Surfaces/values that depend on the configured cosmology, most notably the CMB last-scattering distance.

## 6. Procedural layers

The following layers are **illustrative**:

- local-star background particles when no external catalog replaces them,
- Milky Way particle texture,
- Local Group galaxy textures,
- large-scale filament particle network,
- macrostructure landmark geometry,
- CMB color/noise texture.

The procedural generator is seeded, so a given release is deterministic and screenshot/review results are reproducible. Deterministic does not mean observational.

## 7. CMB semantics

The CMB sphere is a cosmological model surface at approximately `z=1089`. Its radial placement is based on the release cosmology. The colored texture is synthetic and is **not Planck temperature-anisotropy data**.

## 8. Uncertainty

The curated core preserves human-readable uncertainty and distance-basis fields. Imported Gaia records retain parallax and parallax error, and the normalization describes the inverse-parallax assumption. v4 does not yet propagate all upstream covariance matrices through 3-D transformations; a research-grade astrometric mode should add full covariance propagation.

## 9. Two-point measurements

Angular separation uses the spherical cosine relation from the two ICRS directions. If both records have physical radial distances, approximate 3-D separation is computed by the law of cosines from the two radial distances and angular separation. Angular-only endpoints suppress the 3-D result.

## 10. Reproducibility

- The standalone file has no external JavaScript/CSS dependency and does not fetch network resources.
- Procedural geometry uses a seeded PRNG; `Math.random()` is absent.
- Ingestion scripts are standard-library Python and write versioned normalized JSON.
- `qa/build_manifest.json` records the release SHA-256 and static validation state.
- Upstream catalog access and attribution are described in `data/source_manifest.json`.

## 11. Known scientific limitations

- The embedded core is deliberately curated and small; it is not a complete sky survey.
- Direct inverse parallax is not a full Bayesian distance inference.
- Proper motion is stored/displayable metadata but the renderer does not currently propagate coordinates to arbitrary epochs.
- Relativistic corrections, extinction, selection functions, survey completeness, and covariance matrices are outside the current viewer scope.
- Contextual large-scale structure is not reconstructed from SDSS/DESI density fields.
- The visualization is not suitable for precision measurement from screen geometry.

## 12. Recommended path to research-grade expansion

1. Materialize a controlled Gaia DR3 subset with query text and checksum committed alongside the release.
2. Add epoch propagation and covariance-aware astrometry.
3. Add catalog-specific selection-function metadata.
4. Introduce survey-derived large-scale galaxy point layers rather than procedural filaments where licensing/data volume permit.
5. Split renderer, data model, cosmology, and UI into tested modules while retaining a generated single-file distribution.
