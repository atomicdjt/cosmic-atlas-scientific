const catalogFilter = {
  query: "",
  source: "",
  tier: "",
  type: "",
  magMax: null,
  colorMin: null,
  colorMax: null,
  distanceMax: null,
  parallaxMin: null,
  snrMin: null,
  ruweMax: null,
  redshiftMin: null,
  uncertaintyMax: null,
  rvOnly: false,
};
let catalogRevision = 0,
  displayEpoch = null;
function matchesCatalogFilter(x, f = catalogFilter) {
  if (
    f.query &&
    ![x.name, x.id, x.externalId, x.type, x.source, x.sourceRef]
      .join(" ")
      .toLowerCase()
      .includes(f.query.toLowerCase())
  )
    return false;
  if (
    f.source &&
    !(x.source || "").toLowerCase().includes(f.source.toLowerCase())
  )
    return false;
  if (f.tier && x.dataClass !== f.tier) return false;
  if (f.type && !x.type.toLowerCase().includes(f.type.toLowerCase()))
    return false;
  if (f.rvOnly && !Number.isFinite(x.rv)) return false;
  if (f.magMax !== null) { const v = x.photG ?? finiteNumber(x.raw?.vmag); if (!Number.isFinite(v) || v > f.magMax) return false; }
  if (f.colorMin !== null) { const v = x.bpRp; if (!Number.isFinite(v) || v < f.colorMin) return false; }
  if (f.colorMax !== null) { const v = x.bpRp; if (!Number.isFinite(v) || v > f.colorMax) return false; }
  if (f.distanceMax !== null) { const v = x.angularOnly ? null : (x.physicalDistanceLy ?? x.distLy); if (!Number.isFinite(v) || v > f.distanceMax) return false; }
  if (f.parallaxMin !== null) { const v = x.parallaxMas; if (!Number.isFinite(v) || v < f.parallaxMin) return false; }
  if (f.snrMin !== null) { const v = x.parallaxSnr; if (!Number.isFinite(v) || v < f.snrMin) return false; }
  if (f.ruweMax !== null) { const v = x.ruwe; if (!Number.isFinite(v) || v > f.ruweMax) return false; }
  if (f.redshiftMin !== null) { const v = x.zObs; if (!Number.isFinite(v) || v < f.redshiftMin) return false; }
  if (f.uncertaintyMax !== null) { const v = x.distanceSigmaLy; if (!Number.isFinite(v) || v > f.uncertaintyMax) return false; }
  return true;
}
function filteredImportedRecords(records = importedCatalogRecords) {
  return records === importedCatalogRecords
    ? visibleScientificRecords().filter(x => x.imported)
    : records.filter(x => matchesCatalogFilter(x));
}
let visibleCatalogCache = {key:null, records:[]};
function visibleScientificRecords() {
  const key = catalogRevision + ":" + JSON.stringify(catalogFilter);
  if (key !== visibleCatalogCache.key) visibleCatalogCache = {
    key, records:allScientificRecords().filter(x => matchesCatalogFilter(x)) };
  return visibleCatalogCache.records;
}
function exportRecord(x) {
  return {
    ...(x.raw || {}),
    id: x.raw?.id ?? x.externalId ?? x.id,
    name: x.name,
    tier: x.dataClass,
    ra_deg: x.raw?.ra_deg ?? x.sourceRa ?? x.ra,
    dec_deg: x.raw?.dec_deg ?? x.sourceDec ?? x.dec,
    distance_ly: x.angularOnly ? null : (x.physicalDistanceLy ?? x.distLy),
    angular_only: !!x.angularOnly,
    distance_kind:
      x.distanceKind ??
      (x.id === "quasar_3c273" ? "comoving" : "source_adopted"),
    distance_uncertainty: x.distUnc,
    source_distance_uncertainty: x.raw?.distance_uncertainty ?? null,
    source_distance_basis: x.raw?.distance_basis ?? null,
    measurement_eligible: physicalMeasurementAllowed(x),
    distance_basis: x.distanceBasis,
    redshift: x.zObs,
    radial_velocity_kms: x.rv,
    source: x.source,
    source_ref: x.sourceRef,
    source_url: x.sourceUrl,
    ...(x.imported
      ? {
          source_claims: {
            tier:
              x.raw?.source_claims?.tier ??
              x.raw?.source_claimed_tier ??
              x.raw?.tier ??
              null,
            measurement_eligible:
              x.raw?.source_claims?.measurement_eligible ??
              x.raw?.source_claimed_measurement_eligible ??
              x.raw?.measurement_eligible ??
              null,
          },
        }
      : {}),
    ...(x.angularOnly ? { display_shell_ly: x.displayShellLy } : {}),
    ...(x.displayEpoch !== null && x.displayEpoch !== undefined
      ? {
          display_epoch: x.displayEpoch,
          display_ra_deg: x.ra,
          display_dec_deg: x.dec,
          display_epoch_method:
            "linear tangent motion; not canonical source coordinates",
        }
      : {}),
  };
}
