function updateMeasurement() {
  const out = document.getElementById("measure-output");
  if (!measureA && !measureB) {
    out.innerHTML =
      "Choose a target, set A, then choose another target and set B.";
    return;
  }
  if (!measureA || !measureB) {
    const x = measureA || measureB;
    out.innerHTML = `<strong>${measureA ? "A" : "B"}:</strong> ${escapeHtml(x.name)}<br>Set the other endpoint to calculate angular and 3D separation.`;
    return;
  }
  const directionDefined = ![measureA, measureB].some(
    (x) => x.id === "sol" || x.id === "cmb_horizon",
  );
  const ang = directionDefined
    ? angularSeparationDeg(measureA, measureB)
    : null;
  const sep = spatialSeparationLy(measureA, measureB);
  const caution =
    measureA.dataClass === "context" ||
    measureB.dataClass === "context" ||
    measureA.dataClass === "model" ||
    measureB.dataClass === "model"
      ? '<br><span style="color:var(--accent-gold)">Caution: at least one endpoint is contextual/model-derived, so the 3D separation is illustrative.</span>'
      : "";
  const spatialText =
    sep == null
      ? "unavailable (angular-only, context/model, or incompatible distance basis)"
      : formatDistance(sep);
  const angularNote =
    measureA.angularOnly || measureB.angularOnly
      ? '<br><span style="color:var(--accent-gold)">Angular-only records have no claimed radial distance; the display shell is excluded from 3-D measurement.</span>'
      : "";
  out.innerHTML = `<strong>A:</strong> ${escapeHtml(measureA.name)}<br><strong>B:</strong> ${escapeHtml(measureB.name)}<br><strong>Angular separation:</strong> ${ang === null ? "unavailable (origin or all-sky surface)" : ang.toFixed(3) + "°"}<br><strong>3D separation (compatible adopted distances):</strong> ${spatialText}${measurementUncertaintyText(measureA, measureB)}${caution}${angularNote}`;
}
