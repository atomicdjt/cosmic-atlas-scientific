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
  const pairs = [
    ["magMax", x.photG ?? finiteNumber(x.raw?.vmag), "<"],
    ["colorMin", x.bpRp, ">"],
    ["colorMax", x.bpRp, "<"],
    [
      "distanceMax",
      x.angularOnly ? null : (x.physicalDistanceLy ?? x.distLy),
      "<",
    ],
    ["parallaxMin", x.parallaxMas, ">"],
    ["snrMin", x.parallaxSnr, ">"],
    ["ruweMax", x.ruwe, "<"],
    ["redshiftMin", x.zObs, ">"],
    ["uncertaintyMax", x.distanceSigmaLy, "<"],
  ];
  for (const [key, value, op] of pairs)
    if (
      f[key] !== null &&
      (!Number.isFinite(value) ||
        (op === "<" ? value > f[key] : value < f[key]))
    )
      return false;
  return true;
}
function filteredImportedRecords(records = importedCatalogRecords) {
  return records.filter((x) => matchesCatalogFilter(x));
}
function visibleScientificRecords() {
  return allScientificRecords().filter((x) => matchesCatalogFilter(x));
}
function exportRecord(x) {
  return {
    ...(x.raw || {}),
    id: x.raw?.id ?? x.externalId ?? x.id,
    name: x.name,
    tier: x.dataClass,
    ra_deg: x.raw?.ra_deg ?? x.ra,
    dec_deg: x.raw?.dec_deg ?? x.dec,
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
