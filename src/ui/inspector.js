function showInspector(item) {
  selectedItem = item;
  document.getElementById("inspect-tag").innerText = item.tag;
  document.getElementById("inspect-name").innerText = item.name;
  document.getElementById("inspect-desc").innerText = item.desc;
  document.getElementById("spec-dist").innerText = item.angularOnly
    ? "angular-only (display shell)"
    : formatDistance(item.physicalDistanceLy ?? item.distLy);
  document.getElementById("spec-dist-unc").innerText = item.distUnc || "—";
  document.getElementById("spec-ra").innerText =
    item.raText || `${item.ra.toFixed(6)}°`;
  document.getElementById("spec-dec").innerText =
    item.decText || `${item.dec.toFixed(6)}°`;
  const gal = icrsToGalactic(item.ra, item.dec);
  document.getElementById("spec-galactic").innerText =
    item.id === "sol" || item.id === "cmb_horizon"
      ? "— (no unique sky direction)"
      : `l=${gal.l.toFixed(3)}° / b=${gal.b.toFixed(3)}°`;
  document.getElementById("spec-status").innerText = item.imported
    ? "Imported / runtime catalog"
    : item.dataClass === "observational"
      ? "Curated scientific core"
      : item.dataClass === "reference"
        ? "Defined reference"
        : item.dataClass === "model"
          ? "Model-derived"
          : "Context only";
  document.getElementById("spec-z").innerText = formatObservedMotion(item);
  const modelZ = item.angularOnly
    ? null
    : item.id === "cmb_horizon"
      ? CMB_REDSHIFT
      : distToRedshift(item.physicalDistanceLy ?? item.distLy);
  document.getElementById("spec-model-z").innerText = item.angularOnly
    ? "— (no radial distance)"
    : (item.physicalDistanceLy ?? item.distLy) < 1e7
      ? "local / ≈0"
      : modelZ >= 1000
        ? modelZ.toExponential(2)
        : modelZ.toFixed(5);
  document.getElementById("spec-type").innerText = item.type;
  document.getElementById("spec-lookback").innerText = item.angularOnly
    ? "— (angular-only)"
    : formatLookback(distToLookback(item.physicalDistanceLy ?? item.distLy));
  document.getElementById("inspect-tag").style.color = item.color;
  updateProvenance(item);
  document.getElementById("inspect-desc").textContent += item.refEpoch
    ? ` Reference epoch: J${item.refEpoch}; displayed epoch: J${item.displayEpoch ?? item.refEpoch}.`
    : "";
  drawCMD();

  if (window.innerWidth <= 900 && item.id !== "sol") {
    document.querySelector(".right-sidebar").classList.add("mobile-open");
    document.querySelector(".left-sidebar").classList.remove("mobile-open");
    syncMobilePanelAria?.();
  }
}

document.getElementById("btn-focus-target").addEventListener("click", () => {
  if (!selectedItem) return;
  const targetPos = selectedItem.pos;
  const distLy = selectedItem.distLy;
  const targetDist = Math.max(15.0, distToSceneRadius(distLy) * 0.25);
  flyToScale(targetDist, targetPos);
});
