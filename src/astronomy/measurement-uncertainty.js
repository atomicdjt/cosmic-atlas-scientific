function measurementUncertaintyText(a, b) {
  if (!physicalMeasurementAllowed(a) || !physicalMeasurementAllowed(b))
    return "";
  const sa = a.distanceSigmaLy,
    sb = b.distanceSigmaLy;
  if (!Number.isFinite(sa) || !Number.isFinite(sb))
    return "<br>Combined uncertainty: unavailable.";
  const da = a.physicalDistanceLy ?? a.distLy,
    db = b.physicalDistanceLy ?? b.distLy;
  const sep = spatialSeparationLy(a, b);
  if (!sep) return "";
  const c = Math.cos((angularSeparationDeg(a, b) * Math.PI) / 180);
  const sigma = Math.hypot(
    ((da - db * c) / sep) * sa,
    ((db - da * c) / sep) * sb,
  );
  return `<br>Formal radial-only σ ≈ ${formatDistance(sigma)}; independent errors, no angular covariance or systematics.`;
}
