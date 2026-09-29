// Observer calculations are intentionally labelled approximate until the
// optional Astronomy Engine adapter is present. They are useful for a sky-view
// orientation, not a replacement for IAU/SOFA-grade astrometry.
function normalizeLongitudeDeg(longitudeDeg) {
  return ((longitudeDeg + 180) % 360 + 360) % 360 - 180;
}

function validateObserver(observer) {
  if (!observer || !isFiniteAstronomyNumber(observer.latitudeDeg) || !isFiniteAstronomyNumber(observer.longitudeDeg)) return null;
  if (Math.abs(observer.latitudeDeg) > 90 || Math.abs(observer.longitudeDeg) > 180) return null;
  return {
    latitudeDeg: observer.latitudeDeg,
    longitudeDeg: normalizeLongitudeDeg(observer.longitudeDeg),
    elevationMeters: isFiniteAstronomyNumber(observer.elevationMeters) ? observer.elevationMeters : 0,
  };
}

function greenwichMeanSiderealDeg(jd) {
  const t = (jd - J2000_JD) / 36525;
  return ((280.46061837 + 360.98564736629 * (jd - J2000_JD) + 0.000387933 * t * t - t * t * t / 38710000) % 360 + 360) % 360;
}

function icrsToHorizontalApprox(raDeg, decDeg, jd, observer) {
  const site = validateObserver(observer);
  if (!site || !isFiniteAstronomyNumber(raDeg) || !isFiniteAstronomyNumber(decDeg) || !isFiniteAstronomyNumber(jd)) return null;
  const hourAngle = ((greenwichMeanSiderealDeg(jd) + site.longitudeDeg - raDeg + 540) % 360 - 180) * Math.PI / 180;
  const lat = site.latitudeDeg * Math.PI / 180;
  const dec = decDeg * Math.PI / 180;
  const altitude = Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(hourAngle));
  const azimuth = Math.atan2(-Math.sin(hourAngle) * Math.cos(dec), Math.sin(dec) * Math.cos(lat) - Math.cos(dec) * Math.sin(lat) * Math.cos(hourAngle));
  return { altitudeDeg: altitude * 180 / Math.PI, azimuthDeg: (azimuth * 180 / Math.PI + 360) % 360, method: "mean-sidereal approximate" };
}
