const workbench = document.createElement("details");
workbench.className = "science-workbench interactive";
workbench.innerHTML =
  '<summary>Scientific filters & color–magnitude diagram</summary><div class="workbench-fields"></div><p id="filter-summary" role="status"></p><p>Numeric filters exclude missing values. Export uses the filtered subset. Procedural layers are illustrative.</p><label>Display epoch (Julian year) <input id="display-epoch" type="number" placeholder="source epoch"></label><button id="apply-epoch" type="button">Apply epoch</button><button id="reset-epoch" type="button">Source epoch</button><p>Linear tangent proper motion within ±100 years of source epoch. No perspective acceleration, orbit or covariance model. Export preserves source coordinates.</p><canvas id="cmd-canvas" width="600" height="360" aria-label="Uncorrected Gaia color–absolute magnitude diagram; use catalog search for keyboard selection" role="img"></canvas><p id="cmd-summary"></p>';
document.querySelector(".left-sidebar").append(workbench);
const fields = workbench.querySelector(".workbench-fields");
const defs = [
  ["query", "Search", "text"],
  ["source", "Catalog source", "text"],
  ["tier", "Data tier", "select"],
  ["type", "Object class", "text"],
  ["magMax", "Maximum G / V magnitude", "number"],
  ["colorMin", "Minimum BP−RP", "number"],
  ["colorMax", "Maximum BP−RP", "number"],
  ["distanceMax", "Maximum distance (ly)", "number"],
  ["parallaxMin", "Minimum parallax (mas)", "number"],
  ["snrMin", "Minimum parallax S/N", "number"],
  ["ruweMax", "Maximum RUWE", "number"],
  ["redshiftMin", "Minimum observed z", "number"],
  ["uncertaintyMax", "Maximum formal distance σ (ly)", "number"],
];
for (const [key, label, type] of defs) {
  const l = document.createElement("label");
  l.textContent = label;
  const el = document.createElement(type === "select" ? "select" : "input");
  el.id = "filter-" + key;
  if (type === "select") {
    for (const value of [
      "",
      "observational",
      "external",
      "reference",
      "context",
      "model",
      "procedural",
    ]) {
      const o = document.createElement("option");
      o.value = value;
      o.textContent = value || "All tiers";
      el.append(o);
    }
  } else {
    el.type = type;
    if (type === "number") el.step = "any";
  }
  l.append(el);
  fields.append(l);
}
const rvLabel = document.createElement("label");
rvLabel.innerHTML =
  '<input type="checkbox" id="filter-rv"> Radial velocity available';
fields.append(rvLabel);
let filterTimer;
fields.oninput = () => {
  clearTimeout(filterTimer);
  filterTimer = setTimeout(applyScientificFilters, 120);
};
function applyScientificFilters() {
  for (const [key, , type] of defs) {
    const el = document.getElementById("filter-" + key);
    catalogFilter[key] =
      type === "number"
        ? el.value === ""
          ? null
          : Number(el.value)
        : el.value;
  }
  catalogFilter.rvOnly = document.getElementById("filter-rv").checked;
  catalogRevision++;
  rebuildImportedCatalogBundle();
  rebuildCoreFilteredBundles();
  tablePage = 0;
  populateDataTable(dataSearch.value);
  drawCMD();
  document.getElementById("filter-summary").textContent =
    visibleScientificRecords().length.toLocaleString() + " records match";
}
function rebuildCoreFilteredBundles() {
  deleteBufferBundle(observedCatalogBundle);
  deleteBufferBundle(contextCatalogBundle);
  observedCatalogBundle = buildCatalogTierBundle(
    (x) =>
      matchesCatalogFilter(x) &&
      ["observational", "reference"].includes(x.dataClass),
  );
  contextCatalogBundle = buildCatalogTierBundle(
    (x) =>
      matchesCatalogFilter(x) && ["context", "model"].includes(x.dataClass),
  );
}
function setDisplayEpoch(epoch) {
  displayEpoch = Number.isFinite(epoch) ? epoch : null;
  let changed = 0;
  for (const x of importedCatalogRecords) {
    const raw = x.raw,
      p =
        displayEpoch === null
          ? { ra_deg: raw.ra_deg, dec_deg: raw.dec_deg }
          : propagateEpoch(raw, displayEpoch);
    x.displayEpoch = p && displayEpoch !== null ? displayEpoch : null;
    x.ra = p?.ra_deg ?? raw.ra_deg;
    x.dec = p?.dec_deg ?? raw.dec_deg;
    x.raText = x.ra.toFixed(6) + "°";
    x.decText = x.dec.toFixed(6) + "°";
    x.pos = astronomicalToCartesian(x.ra, x.dec, x.distLy);
    if (p) changed++;
  }
  catalogRevision++;
  rebuildImportedCatalogBundle();
  populateDataTable(dataSearch.value);
  if (selectedItem) showInspector(selectedItem);
  document.getElementById("filter-summary").textContent =
    `Epoch applied to ${changed} records; unsupported records retain source positions.`;
}
document.getElementById("apply-epoch").onclick = () => {
  const v = finiteNumber(document.getElementById("display-epoch").value);
  if (Number.isFinite(v)) setDisplayEpoch(v);
};
document.getElementById("reset-epoch").onclick = () => setDisplayEpoch(null);
let cmdPoints = [];
function drawCMD() {
  const c = document.getElementById("cmd-canvas");
  if (!c) return;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#07101c";
  ctx.fillRect(0, 0, 600, 360);
  ctx.fillStyle = "#b8cbdf";
  ctx.font = "14px sans-serif";
  ctx.fillText("BP−RP: −1 to 5 (observed)", 160, 345);
  ctx.fillText("M_G: −10 to 20", 5, 18);
  ctx.strokeStyle = "#39516a";
  ctx.strokeRect(45, 25, 535, 295);
  cmdPoints = [];
  for (const x of filteredImportedRecords()) {
    const m = absoluteG(x);
    if (m === null || !Number.isFinite(x.bpRp)) continue;
    const px = 45 + ((x.bpRp + 1) / 6) * 535,
      py = 25 + ((m + 10) / 30) * 295;
    if (px < 45 || px > 580 || py < 25 || py > 320) continue;
    cmdPoints.push({ x, px, py });
    ctx.fillStyle = x.color;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(px, py, 2, 2);
  }
  ctx.globalAlpha = 1;
  const chosen = cmdPoints.find((p) => p.x === selectedItem);
  if (chosen) {
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.arc(chosen.px, chosen.py, 6, 0, 7);
    ctx.stroke();
  }
  document.getElementById("cmd-summary").textContent =
    `${cmdPoints.length.toLocaleString()} plotted; M_G = G + 5 log10(π_mas) − 10; S/N ≥10, RUWE ≤1.4 when available. No extinction/zero-point correction. Click a point or use catalog search to inspect.`;
}
document.getElementById("cmd-canvas").onclick = (e) => {
  const r = e.currentTarget.getBoundingClientRect(),
    x = ((e.clientX - r.left) * 600) / r.width,
    y = ((e.clientY - r.top) * 360) / r.height;
  let best = null,
    d = 12;
  for (const p of cmdPoints) {
    const dd = Math.hypot(x - p.px, y - p.py);
    if (dd < d) {
      best = p.x;
      d = dd;
    }
  }
  if (best) {
    showInspector(best);
    flyToScale(Math.max(15, distToSceneRadius(best.distLy) * 0.25), best.pos);
  }
};
const paging = document.createElement("div");
paging.className = "table-paging";
paging.innerHTML =
  '<button id="table-prev" type="button">Previous page</button><button id="table-next" type="button">Next page</button><label>Sort <select id="table-sort"><option value="name">Name</option><option value="source">Source</option><option value="ra">RA</option><option value="dec">Dec</option><option value="parallaxSnr">Parallax S/N</option></select></label><button id="table-direction" type="button">Reverse order</button>';
document.getElementById("data-modal-summary").after(paging);
document.getElementById("table-prev").onclick = () => {
  tablePage--;
  populateDataTable(dataSearch.value);
};
document.getElementById("table-next").onclick = () => {
  tablePage++;
  populateDataTable(dataSearch.value);
};
document.getElementById("table-sort").onchange = (e) => {
  tableSort = e.target.value;
  populateDataTable(dataSearch.value);
};
document.getElementById("table-direction").onclick = () => {
  tableDescending = !tableDescending;
  populateDataTable(dataSearch.value);
};
drawCMD();
