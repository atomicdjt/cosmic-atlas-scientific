const RELEASE_MANIFEST = Object.freeze({
  product: "Cosmic Atlas Scientific",
  version: window.atlasBuildIdentity?.version || "{{VERSION}}",
  buildId: window.atlasBuildIdentity?.buildId || "{{BUILD_ID}}",
  releaseDate: null,
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
