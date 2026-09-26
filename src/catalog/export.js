function allScientificRecords() {
  return [...CELESTIAL_CATALOG, ...importedCatalogRecords];
}
function downloadBlob(filename, type, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function exportPayload() {
  return {
    schema: "cosmic-atlas.catalog.v1",
    manifest: RELEASE_MANIFEST,
    source: importedSourceMetadata,
    filters: { ...catalogFilter },
    records: visibleScientificRecords().map(exportRecord),
  };
}
document.getElementById("export-json-btn").onclick = () =>
  downloadBlob(
    "cosmic_atlas_v5_filtered.json",
    "application/json",
    JSON.stringify(exportPayload(), null, 2),
  );
document.getElementById("export-csv-btn").onclick = () => {
  const records = exportPayload().records,
    columns = [...new Set(records.flatMap((x) => Object.keys(x)))].sort(),
    quote = (x) =>
      '"' +
      String(
        x == null ? "" : typeof x === "object" ? JSON.stringify(x) : x,
      ).replace(/"/g, '""') +
      '"';
  downloadBlob(
    "cosmic_atlas_v5_filtered.csv",
    "text/csv",
    [
      columns.map(quote).join(","),
      ...records.map((x) => columns.map((k) => quote(x[k])).join(",")),
    ].join("\r\n"),
  );
};
