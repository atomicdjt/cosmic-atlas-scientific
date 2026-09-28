function colorFromBpRp(bpRp) {
  const x = finiteNumber(bpRp);
  if (!Number.isFinite(x)) return "#8ff4ff";
  if (x < 0.0) return "#8bb8ff";
  if (x < 0.5) return "#b8d6ff";
  if (x < 1.0) return "#fff3d0";
  if (x < 1.7) return "#ffd08b";
  if (x < 2.5) return "#ff9b62";
  return "#ff6b55";
}

function pointSizeFromMagnitude(mag) {
  const g = finiteNumber(mag);
  if (!Number.isFinite(g)) return 2.8;
  return Math.max(1.5, Math.min(7.0, 6.2 - 0.32 * g));
}

function normalizeImportedRecord(raw, idx) {
  if ([raw.id,raw.source_id].some(v=>typeof v==='number'&&!Number.isSafeInteger(v))) return null;
  let ra = finiteNumber(raw.ra_deg ?? raw.ra ?? raw.RA_ICRS);
  const dec = finiteNumber(raw.dec_deg ?? raw.dec ?? raw.DE_ICRS);
  let distLy = finiteNumber(raw.distance_ly ?? raw.distLy);
  const parallax = finiteNumber(raw.parallax_mas ?? raw.parallax ?? raw.Plx);
  const quality = parallaxDistance(raw);
  const inferred =
    !Number.isFinite(distLy) && quality !== null && raw.angular_only !== true;
  if (inferred) distLy = quality.distanceLy;
  if (!Number.isFinite(ra) || !Number.isFinite(dec) || dec < -90 || dec > 90)
    return null;
  ra = ((ra % 360) + 360) % 360;
  const hasPhysicalDistance =
    raw.angular_only !== true &&
    Number.isFinite(distLy) &&
    distLy > 0;
  const angularOnly = !hasPhysicalDistance;
  // Angular-only records are placed on a user/source supplied visualization shell.
  // This shell is never treated as a measured distance and is excluded from 3-D claims.
  const displayShellLy = Math.max(1, Number(raw.display_shell_ly) || 1000);
  const renderDistLy = hasPhysicalDistance ? distLy : displayShellLy;
  const perr = finiteNumber(
    raw.parallax_error_mas ?? raw.parallax_error ?? raw.e_Plx,
  );
  const snr =
    Number.isFinite(parallax) && Number.isFinite(perr) && perr > 0
      ? parallax / perr
      : null;
  const sourceId = String(
    raw.source_id ?? raw.id ?? raw.designation ?? `import-${idx + 1}`,
  );
  const name = String(
    raw.name ??
      raw.proper_name ??
      raw.designation ??
      `Catalog source ${sourceId}`,
  );
  const source = String(
    raw.source ?? raw.catalog ?? "Imported scientific catalog",
  );
  const color =
    typeof raw.color === "string" && /^#[0-9a-f]{6}$/i.test(raw.color)
      ? raw.color
      : colorFromBpRp(raw.bp_rp);
  const item = {
    id: `ext:${String(raw.id ?? sourceId)}`,
    raw: Object.freeze(raw),
    distanceKind:
      raw.distance_kind ??
      (inferred ? "parallax_approximation" : "source_adopted"),
    distanceSigmaLy: finiteNumber(raw.distance_sigma_ly),
    ruwe: finiteNumber(raw.ruwe),
    refEpoch: finiteNumber(raw.ref_epoch),
    parallaxSnr: snr,
    externalId: sourceId,
    // Imported provenance is user-controlled. A file cannot promote its own
    // records into the curated scientific measurement set.
    measurementEligible: false,
    name,
    tag: String(
      raw.tag ??
        (angularOnly
          ? "Imported Angular Catalog Record"
          : "Imported Catalog Record"),
    ),
    dataClass: "external",
    distLy: renderDistLy,
    physicalDistanceLy: hasPhysicalDistance ? distLy : null,
    angularOnly,
    displayShellLy: angularOnly ? displayShellLy : null,
    distUnc: angularOnly
      ? "No physical distance supplied; radial position is a display shell only."
      : snr !== null && Number.isFinite(parallax) && parallax > 0
        ? `Parallax S/N ${snr.toFixed(1)}; formal σπ=${perr} mas`
        : String(raw.distance_uncertainty ?? "See source catalog"),
    ra,
    dec,
    raText: `${ra.toFixed(6)}°`,
    decText: `${dec.toFixed(6)}°`,
    type: String(raw.type ?? raw.object_type ?? "Catalog source"),
    desc: String(
      raw.description ?? `Imported record ${sourceId} from ${source}.`,
    ),
    color,
    size: pointSizeFromMagnitude(
      raw.phot_g_mean_mag ?? raw.vmag ?? raw.magnitude,
    ),
    zObs: raw.redshift == null ? null : Number(raw.redshift),
    rv:
      raw.radial_velocity_kms == null
        ? raw.radial_velocity == null
          ? null
          : Number(raw.radial_velocity)
        : Number(raw.radial_velocity_kms),
    source,
    record: String(raw.record ?? raw.designation ?? sourceId),
    sourceRef: String(raw.source_ref ?? raw.release ?? raw.bibcode ?? ""),
    sourceUrl: String(raw.source_url ?? ""),
    distanceBasis: angularOnly
      ? `Angular-only observation; rendered on an arbitrary ${formatDistance(displayShellLy)} display shell. No physical radial distance is asserted.`
      : String(
          raw.distance_basis ??
            (inferred
              ? "Inverse-parallax approximation; S/N >=10 and RUWE <=1.4 when available; no zero-point correction."
              : "Imported source-adopted distance."),
        ),
    imported: true,
    photG: raw.phot_g_mean_mag == null ? null : Number(raw.phot_g_mean_mag),
    bpRp: raw.bp_rp == null ? null : Number(raw.bp_rp),
    parallaxMas: Number.isFinite(parallax) ? parallax : null,
    parallaxErrorMas: Number.isFinite(perr) ? perr : null,
    pmra:
      raw.pmra_masyr == null
        ? raw.pmra == null
          ? null
          : Number(raw.pmra)
        : Number(raw.pmra_masyr),
    pmdec:
      raw.pmdec_masyr == null
        ? raw.pmdec == null
          ? null
          : Number(raw.pmdec)
        : Number(raw.pmdec_masyr),
  };
  item.pos = astronomicalToCartesian(item.ra, item.dec, item.distLy);
  return item;
}
