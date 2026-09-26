const RELEASE_MANIFEST = Object.freeze({
  product: "Cosmic Atlas Scientific",
  version: "5.0.0",
  buildId: "CA-SCI-5.0-2026-09-26",
  releaseDate: "2026-09-26",
  coordinateFrame: "ICRS directions; Sol-centered display coordinates",
  cosmology: {
    model: "flat Planck-2018-like ΛCDM",
    H0_km_s_Mpc: 67.4,
    omega_m: 0.315,
  },
  coreCatalog: {
    source: "Curated literature/SIMBAD scientific core",
    role: "physically placed reference set",
  },
  importSchema: "cosmic-atlas.catalog.v1",
  proceduralPolicy:
    "Procedural geometry is explicitly contextual and never presented as survey reconstruction.",
});
