function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
const dataModal = document.getElementById("data-modal-backdrop"),
  dataSearch = document.getElementById("data-table-search");
let tablePage = 0,
  tableSort = "name",
  tableDescending = false;
let tableCache = {key:null, records:[]};
function populateDataTable(query = "") {
  const q = query.toLowerCase().trim(),
    key = [catalogRevision, JSON.stringify(catalogFilter), q, tableSort, tableDescending].join(":"),
    all = key === tableCache.key ? tableCache.records : visibleScientificRecords().filter(
      (x) =>
        !q ||
        [x.name, x.id, x.externalId, x.type, x.source]
          .join(" ")
          .toLowerCase()
          .includes(q),
    );
  if (key !== tableCache.key) all.sort((a, b) => {
    const aa = a[tableSort],
      bb = b[tableSort],
      v =
        typeof aa === "number" && typeof bb === "number"
          ? aa - bb
          : String(aa ?? "").localeCompare(String(bb ?? ""));
    return tableDescending ? -v : v;
  });
  tableCache = {key, records:all};
  tablePage = Math.max(0, Math.min(tablePage, Math.ceil(all.length / 100) - 1));
  const rows = all.slice(tablePage * 100, (tablePage + 1) * 100);
  document.getElementById("data-modal-summary").textContent =
    `${all.length.toLocaleString()} matching records • page ${tablePage + 1}/${Math.max(1, Math.ceil(all.length / 100))} • 100 rows per page. Select a name for provenance and uncertainty.`;
  document.getElementById("table-prev").disabled = tablePage === 0;
  document.getElementById("table-next").disabled = (tablePage + 1) * 100 >= all.length;
  document.getElementById("data-table-body").innerHTML = rows
    .map(
      (x) =>
        `<tr><td><button type="button" data-record-id="${escapeHtml(x.id)}">${escapeHtml(x.name)}</button><small>${escapeHtml(x.externalId ?? x.id)}</small></td><td>${escapeHtml(tierLabel(x))}</td><td>${escapeHtml(x.angularOnly ? "angular-only" : formatDistance(x.physicalDistanceLy ?? x.distLy))}<small>${escapeHtml(x.distUnc ?? "")}</small></td><td>${x.ra.toFixed(4)}°</td><td>${x.dec.toFixed(4)}°</td><td>${escapeHtml(x.source)}<small>${escapeHtml(x.distanceBasis)}</small></td></tr>`,
    )
    .join("");
  document.querySelectorAll("#data-table-body button").forEach(
    (el) =>
      (el.onclick = () => {
        const x = rows.find((x) => x.id === el.dataset.recordId);
        showInspector(x);
        flyToScale(Math.max(15, distToSceneRadius(x.distLy) * 0.25), x.pos);
        closeAtlasDialog(dataModal);
      }),
  );
}
document.getElementById("data-table-btn").onclick = () => {
  populateDataTable(dataSearch.value);
  openAtlasDialog(dataModal, dataSearch);
};
document.getElementById("data-modal-close").onclick = () =>
  closeAtlasDialog(dataModal);
dataModal.onclick = (e) => {
  if (e.target === dataModal) closeAtlasDialog(dataModal);
};
dataSearch.oninput = () => {
  tablePage = 0;
  populateDataTable(dataSearch.value);
};
document.getElementById("snapshot-btn").onclick = () =>
  requestAnimationFrame(() =>
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "cosmic_atlas_v5.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, "image/png"),
  );
