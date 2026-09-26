# Scientific methodology and limitations — v5

## Evidence and distance semantics

Reference, observational, imported, context, model and procedural categories remain distinct. Import is a transport mechanism, not a certificate of observational validity. An imported record's supplied tier survives normalization. The display radius compresses physical scale and must never be used as a physical metric.

`angular_only: true` overrides any supplied radial distance. Null/empty coordinates do not become zero. A missing distance may be inferred from parallax only when parallax and its formal error are positive, S/N is at least 10, and RUWE is at most 1.4 when supplied. Missing RUWE does not certify a good astrometric fit. A source-adopted explicit distance retains its documented basis; it is not silently replaced by parallax inversion.

Physical separation rejects angular-only, contextual, model and procedural endpoints, incompatible comoving versus local distance types, and the legacy disputed Betelgeuse display distance. The observer origin and an all-sky CMB surface have no unique sky direction. Angular separation uses atan2 of vector cross-product norm and dot product for small-angle stability. The physical distance formula uses a stable half-angle form. Optional formal uncertainty assumes independent radial errors and omits angular covariance, systematics and correlated distance errors.

## Gaia selection and photometry

The archive query selects the brightest 50,000 sources with G ≤15, positive parallax/error, parallax_over_error ≥10 and RUWE <1.4, ordered by G then source_id. The exact query is `data/raw/gaia_50k.adql`. Smaller tiers are prefixes of this same parent retrieval. They are nested subsets, not additional independent observations. The sample is magnitude- and quality-selected, not volume complete. Binary/crowded populations can be preferentially removed.

Distances use d(pc)=1000/π(mas), with formal σd=d·σπ/π. No Gaia parallax zero-point correction, covariance model, extinction correction or Bayesian prior is applied. Source IDs are strings; astrometric errors, proper motion/errors, epoch, photometry, radial velocity/error, RUWE and raw source fields are preserved.

The diagram uses M_G=G+5 log10(π_mas)−10 and observed BP−RP, restricted to the same inverse-parallax quality rule. It is a color–magnitude diagram without extinction correction, not a temperature–luminosity HR calibration. The plotted domain is BP−RP −1…5 and M_G −10…20; out-of-domain and missing-photometry records remain in the catalog.

## Coordinates and epoch

ICRS is a reference system, not an epoch. Gaia DR3 astrometry refers to J2016.0; a J2000 coordinate convention must not be substituted for this epoch. BSC5 legacy FK5/J2000 directions are approximate visualization inputs, not a precision frame conversion. BSC proper motions are preserved in raw fields without silently assuming the Gaia convention.

Optional epoch display uses a linear tangent-vector update with Gaia μ_alpha*=dα/dt·cosδ and μ_delta, then normalizes the direction vector. This handles polar directions without dividing by cosδ. It is restricted to ±100 years of each record's epoch. It omits perspective acceleration, radial-motion effects, orbital motion, observer aberration and full covariance. Unsupported records retain source positions. Original export coordinates are unchanged; displayed epoch coordinates are separately named.

## Cosmology

The retained explanatory model is flat, with H0=67.4 km/s/Mpc, Ωm=0.315, Ωr=0.000092 and ΩΛ=0.684908. It is Planck-2018-like, not a complete Planck likelihood or neutrino treatment. A 4,096-sample log(1+z) lookup provides comoving distances and lookback times. Parsecs/light-years and Hubble-time constants are now consistent with the independent fixtures. Present-day comoving, luminosity, angular-diameter and lookback quantities are not interchangeable. Only the quantities actually implemented are displayed.

The CMB surface uses z=1089 as an explanatory last-scattering approximation. Its synthetic texture remains explicitly illustrative, never a Planck temperature map. Procedural filaments and galaxy textures remain illustrative. OpenNGC redshift-derived distances are a distinct comoving basis and do not convert its catalog into a complete galaxy survey.

## Curated landmarks

The original 21-record core contains 13 observational records, one reference origin, six contextual landmarks and one model surface. Core values remain the documented v4 literature snapshot except for improved labels/eligibility. Orion's 414±7 pc, Galactic-center 8178±13(stat)±22(sys) pc, and LMC 49.59±0.09(stat)±0.54(sys) kpc were checked against the cited papers. These are adopted literature results, not new measurements or guarantees of the latest consensus.

Betelgeuse's retained legacy inverse-parallax display distance is not a consensus precision distance: later seismic and radio results differ. It is excluded from physical separation. The remaining curated stellar/galaxy values retain their original bibliographic provenance; this release does not claim a complete contemporary remeasurement or exhaustive literature review of every number.

See `V5_REFERENCES.md`, the numeric fixture file, and the external evidence records in `qa/v5/` for the audit trail.
