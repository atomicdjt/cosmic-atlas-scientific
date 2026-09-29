function renderObserverEstimate() {
  const output = document.getElementById("observer-output");
  const ra = Number(document.getElementById("observer-ra")?.value), dec = Number(document.getElementById("observer-dec")?.value);
  const latitude = Number(document.getElementById("observer-lat")?.value), longitude = Number(document.getElementById("observer-lon")?.value);
  const horizontal = icrsToHorizontalApprox(ra, dec, isoToJulianDate(new Date().toISOString()), { latitudeDeg: latitude, longitudeDeg: longitude });
  if (output) output.textContent = horizontal ? `Approximate current horizontal direction: altitude ${horizontal.altitudeDeg.toFixed(2)}°, azimuth ${horizontal.azimuthDeg.toFixed(2)}° (${horizontal.method}; no refraction, precession/nutation, aberration or local horizon model).` : "Enter finite ICRS RA/Dec and a valid observer latitude/longitude.";
}
document.getElementById("observer-update-btn")?.addEventListener("click", renderObserverEstimate);
