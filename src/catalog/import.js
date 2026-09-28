let importedSourceMetadata = null;
const importMetrics = {};
const fileInput = document.getElementById("catalog-file-input");
document.getElementById("import-catalog-btn").onclick = () => fileInput.click();
function parseCatalogText(text) {
  return new Promise((resolve, reject) => {
    if (!window.Worker) {
      try {
        resolve(JSON.parse(text));
      } catch (e) {
        reject(e);
      }
      return;
    }
    const url = URL.createObjectURL(
        new Blob(
          [
            "onmessage=e=>{try{postMessage({data:JSON.parse(e.data)})}catch(x){postMessage({error:x.message})}}",
          ],
          { type: "text/javascript" },
        ),
      ),
      worker = new Worker(url);
    URL.revokeObjectURL(url);
    worker.onmessage = (e) => {
      worker.terminate();
      e.data.error ? reject(new Error(e.data.error)) : resolve(e.data.data);
    };
    worker.onerror = (e) => {
      worker.terminate();
      reject(new Error(e.message));
    };
    worker.postMessage(text);
  });
}
async function importCatalogText(text, name = "catalog") {
  const start = performance.now(),
    parsed = await parseCatalogText(text);
  importMetrics.parseMs = performance.now() - start;
  const rows = Array.isArray(parsed) ? parsed : parsed.records;
  if (!Array.isArray(rows) || !rows.length)
    throw new Error("A nonempty records array is required.");
  if (rows.length > 100000)
    throw new Error("At most 100,000 records per import; split into tiers.");
  const normalized = [],
    ids = new Set();
  let rejected = 0;
  const t = performance.now();
  for (let i = 0; i < rows.length; i++) {
    if (!rows[i] || typeof rows[i] !== "object") {
      rejected++;
      continue;
    }
    const rec = normalizeImportedRecord(rows[i], i);
    if (rec) {
      if (ids.has(rec.id)) throw new Error("Duplicate catalog ID: " + rec.id);
      ids.add(rec.id);
      normalized.push(rec);
    } else rejected++;
    if (i && i % 1000 === 0)
      await new Promise((resolve) => setTimeout(resolve, 0));
  }
  if (!normalized.length) throw new Error("No valid sky positions.");
  importMetrics.normalizeMs = performance.now() - t;
  const nextSourceMetadata = Array.isArray(parsed)
    ? null
    : Object.fromEntries(
        Object.entries(parsed).filter(([k]) => k !== "records"),
      );
  const upload = performance.now();
  // Build the replacement GPU buffers before changing any live catalog state.
  // Invalid input or an allocation failure therefore leaves the previous import
  // and its render bundle intact.
  const nextBundle = createImportedCatalogBundle(normalized);
  importMetrics.gpuUploadSubmissionMs = performance.now() - upload;
  importedCatalogRecords = normalized;
  importedSourceMetadata = nextSourceMetadata;
  displayEpoch = null;
  catalogRevision++;
  replaceImportedCatalogBundle(nextBundle, normalized.length);
  updateCatalogSummary();
  populateDataTable(dataSearch.value);
  drawCMD();
  importMetrics.totalMs = performance.now() - start;
  importMetrics.count = normalized.length;
  document.getElementById("catalog-import-status").textContent =
    `Loaded ${normalized.length.toLocaleString()} records from ${name}; ${rejected} rejected. Missing or low-quality parallax distances remain angular-only. Source metadata retained.`;
  return { ...importMetrics, rejected };
}
fileInput.onchange = async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const status = document.getElementById("catalog-import-status");
  status.textContent = "Reading and validating catalog…";
  try {
    await importCatalogText(await file.text(), file.name);
  } catch (e) {
    status.textContent = "Import failed: " + e.message;
  } finally {
    fileInput.value = "";
  }
};
