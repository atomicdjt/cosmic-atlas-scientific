function propagateEpoch(raw, epoch) {
  const t = finiteNumber(raw.ref_epoch),
    pmra = finiteNumber(raw.pmra_masyr),
    pmdec = finiteNumber(raw.pmdec_masyr);
  if (
    !Number.isFinite(t) ||
    !Number.isFinite(pmra) ||
    !Number.isFinite(pmdec) ||
    Math.abs(epoch - t) > 100
  )
    return null;
  const a = (raw.ra_deg * Math.PI) / 180,
    d = (raw.dec_deg * Math.PI) / 180,
    k = ((epoch - t) * Math.PI) / (180 * 3600000);
  // Tangent-vector linear propagation, including Gaia mu_alpha* convention; stable at poles.
  const v = [
    Math.cos(d) * Math.cos(a) -
      k * (pmra * Math.sin(a) + pmdec * Math.sin(d) * Math.cos(a)),
    Math.cos(d) * Math.sin(a) +
      k * (pmra * Math.cos(a) - pmdec * Math.sin(d) * Math.sin(a)),
    Math.sin(d) + k * pmdec * Math.cos(d),
  ];
  const norm = Math.hypot(...v);
  return {
    ra_deg: ((Math.atan2(v[1], v[0]) * 180) / Math.PI + 360) % 360,
    dec_deg: (Math.asin(v[2] / norm) * 180) / Math.PI,
  };
}
