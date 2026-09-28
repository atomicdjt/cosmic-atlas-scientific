function resetView() {
  flyToScale(38.0, [0, 0, 0]);
  camera.targetTheta = 0.8;
  camera.targetPhi = 0.35;
  currentScale = 0;
  scaleBtns.forEach((b, idx) => b.classList.toggle("active", idx === 0));
  showInspector(CELESTIAL_CATALOG[0]);
}

document.getElementById("reset-view-btn").addEventListener("click", resetView);

document.getElementById("measure-a-btn").addEventListener("click", () => {
  measureA = selectedItem;
  updateMeasurement();
});
document.getElementById("measure-b-btn").addEventListener("click", () => {
  measureB = selectedItem;
  updateMeasurement();
});
document.getElementById("measure-clear-btn").addEventListener("click", () => {
  measureA = null;
  measureB = null;
  updateMeasurement();
});

const scienceModal = document.getElementById("science-modal-backdrop");
function openScienceModal() {
  openAtlasDialog(scienceModal, document.getElementById("science-modal-close"));
}
function closeScienceModal() {
  closeAtlasDialog(scienceModal);
}
document
  .getElementById("science-info-btn")
  .addEventListener("click", openScienceModal);
document
  .getElementById("science-modal-close")
  .addEventListener("click", closeScienceModal);
scienceModal.addEventListener("click", (e) => {
  if (e.target === scienceModal) closeScienceModal();
});

const catalogCounts = CELESTIAL_CATALOG.reduce((acc, x) => {
  acc[x.dataClass] = (acc[x.dataClass] || 0) + 1;
  return acc;
}, {});
function updateCatalogSummary() {
  document.getElementById("catalog-summary").innerHTML =
    `<span class="quality-dot"></span><strong>${catalogCounts.observational || 0}</strong> curated observational records • <strong>${importedCatalogRecords.length}</strong> imported records • <strong>${catalogCounts.context || 0}</strong> context landmarks • <strong>${catalogCounts.model || 0}</strong> model surface • ${RELEASE_MANIFEST.buildId}`;
}
updateCatalogSummary();

function setCheckbox(id, checked) {
  const el = document.getElementById(id);
  el.checked = checked;
  el.dispatchEvent(new Event("change"));
}
document.getElementById("catalog-only-btn").addEventListener("click", () => {
  setCheckbox("layer-catalog", true);
  setCheckbox("layer-imported", true);
  setCheckbox("layer-context", false);
  setCheckbox("layer-stars", false);
  setCheckbox("layer-galaxy", false);
  setCheckbox("layer-localgroup", false);
  setCheckbox("layer-filaments", false);
  setCheckbox("layer-cmb", false);
  setCheckbox("layer-grid", true);
});
document.getElementById("restore-layers-btn").addEventListener("click", () => {
  [
    "layer-catalog",
    "layer-imported",
    "layer-context",
    "layer-stars",
    "layer-galaxy",
    "layer-localgroup",
    "layer-filaments",
    "layer-cmb",
    "layer-grid",
  ].forEach((id) => setCheckbox(id, true));
});
