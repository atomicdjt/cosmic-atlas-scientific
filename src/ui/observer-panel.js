function renderObserverEstimate() {
  const output = document.getElementById("observer-output");
  const ra = finiteNumber(document.getElementById("observer-ra")?.value), dec = finiteNumber(document.getElementById("observer-dec")?.value);
  const latitude = finiteNumber(document.getElementById("observer-lat")?.value), longitude = finiteNumber(document.getElementById("observer-lon")?.value);
  const horizontal = icrsToHorizontalApprox(ra, dec, isoToJulianDate(new Date().toISOString()), { latitudeDeg: latitude, longitudeDeg: longitude });
  if (output) output.textContent = horizontal ? `Approximate current horizontal direction: altitude ${horizontal.altitudeDeg.toFixed(2)}°, azimuth ${horizontal.azimuthDeg.toFixed(2)}° (${horizontal.method}; no refraction, precession/nutation, aberration or local horizon model).` : "Enter finite ICRS RA/Dec and a valid observer latitude/longitude.";
}
document.getElementById("observer-update-btn")?.addEventListener("click", renderObserverEstimate);
