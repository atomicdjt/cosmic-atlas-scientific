function parallaxDistance(raw) {
  const p = finiteNumber(raw.parallax_mas ?? raw.parallax ?? raw.Plx);
  const e = finiteNumber(
    raw.parallax_error_mas ?? raw.parallax_error ?? raw.e_Plx,
  );
  const ruwe = finiteNumber(raw.ruwe);
  if (!(p > 0 && e > 0 && p / e >= 10) || (Number.isFinite(ruwe) && ruwe > 1.4))
    return null;
  return {
    distanceLy: (1000 / p) * LY_PER_PC,
    sigmaLy: ((1000 * e) / (p * p)) * LY_PER_PC,
    snr: p / e,
  };
}
