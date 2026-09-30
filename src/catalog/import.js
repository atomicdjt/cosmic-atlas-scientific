let importedSourceMetadata = null;
const importMetrics = {};
const fileInput = document.getElementById("catalog-file-input");
const importStatus = document.getElementById("catalog-import-status");
const cancelImportButton = document.getElementById("cancel-import-btn");
let activeImport = null;
function abortImportError() { return new DOMException("Import cancelled; active catalog preserved.", "AbortError"); }
function cancelCatalogImport() { activeImport?.controller.abort(); }
cancelImportButton.onclick = cancelCatalogImport;
document.getElementById("import-catalog-btn").onclick = () => fileInput.click();
function reportImportProgress(job, phase, completed = 0, total = 0) {
  if (activeImport !== job) return;
  importStatus.textContent = `${phase}${total ? `: ${completed.toLocaleString()} / ${total.toLocaleString()} rows` : "…"}. Active catalog remains available.`;
  job.phase = phase;
}
// One normalizer supplies both execution paths; imported source claims never grant trust.
function catalogWorkerSource() {
  const functions = [finiteNumber, parallaxDistance, distToSceneRadius,
    astronomicalToCartesian, formatDistance, hexToRgb, colorFromBpRp,
    pointSizeFromMagnitude, normalizeImportedRecord, matchesCatalogFilter,
    prepareCatalogRenderData];
  return `const LY_PER_PC=${LY_PER_PC}; const MODEL_MAX_LY=${MODEL_MAX_LY};
` +
    functions.map(f => f.toString()).join("\n") + `

    onmessage=async e=>{try{
      const started=performance.now();
      postMessage({phase:'Reading / parsing'});
      const text=typeof e.data.input==='string'?e.data.input:await e.data.input.text();
      const parsed=JSON.parse(text), rows=Array.isArray(parsed)?parsed:parsed.records;
      const parseMs=performance.now()-started;
      if(!Array.isArray(rows)||!rows.length)throw new Error('A nonempty records array is required.');
      if(rows.length>100000)throw new Error('At most 100,000 records per import; split into tiers.');
      const normalized=[],ids=new Set();let rejected=0;const t=performance.now();
      let inFlight=0,resume=null;self.onmessage=()=>{inFlight--;if(resume){const next=resume;resume=null;next();}};
      for(let i=0;i<rows.length;i+=1000){
        const batch=[];
        for(let j=i;j<Math.min(i+1000,rows.length);j++){
          const raw=rows[j];const rec=raw&&typeof raw==='object'&&!Array.isArray(raw)?normalizeImportedRecord(raw,j):null;
          if(!rec){rejected++;continue;}
          if(ids.has(rec.id))throw new Error('Duplicate catalog ID: '+rec.id);
          ids.add(rec.id);normalized.push(rec);batch.push(rec);
        }
        if(inFlight>=3)await new Promise(resolve=>{resume=resolve});
        inFlight++;postMessage({batch,completed:Math.min(i+1000,rows.length),total:rows.length});
        // At most three record batches wait for main-thread acknowledgement.
      }
      if(!normalized.length)throw new Error('No valid sky positions.');
      const normalizeMs=performance.now()-t;
      postMessage({phase:'Preparing render buffers'});
      const render=prepareCatalogRenderData(normalized,e.data.filter);
      const source=Array.isArray(parsed)?null:Object.fromEntries(Object.entries(parsed).filter(([k])=>k!=='records'));
      postMessage({done:true,render,source,rejected,parseMs,normalizeMs},
        [render.positions.buffer,render.colors.buffer,render.sizes.buffer]);
    }catch(error){postMessage({error:error.message})}};`;
}
async function stageCatalogImport(input, job, filter) {
  if (!window.Worker) {
    reportImportProgress(job, "Reading / parsing");
    const t = performance.now();
    const parsed = JSON.parse(typeof input === "string" ? input : await input.text());
    const parseMs = performance.now() - t;
    const rows = Array.isArray(parsed) ? parsed : parsed.records;
    if (!Array.isArray(rows) || !rows.length) throw new Error("A nonempty records array is required.");
    if (rows.length > 100000) throw new Error("At most 100,000 records per import; split into tiers.");
    const normalized = [], ids = new Set(); let rejected = 0;
    const start = performance.now();
    for (let i = 0; i < rows.length; i += 1000) {
      if (job.controller.signal.aborted) throw abortImportError();
      for (let j = i; j < Math.min(i + 1000, rows.length); j++) {
        const raw = rows[j];
        const rec = raw && typeof raw === "object" && !Array.isArray(raw) ? normalizeImportedRecord(raw, j) : null;
        if (!rec) { rejected++; continue; }
        if (ids.has(rec.id)) throw new Error("Duplicate catalog ID: " + rec.id);
        ids.add(rec.id); normalized.push(rec);
      }
      reportImportProgress(job, "Validating", Math.min(i + 1000, rows.length), rows.length);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    if (!normalized.length) throw new Error("No valid sky positions.");
    return { normalized, render: prepareCatalogRenderData(normalized, filter),
      source: Array.isArray(parsed) ? null : Object.fromEntries(Object.entries(parsed).filter(([k]) => k !== "records")),
      rejected, parseMs, normalizeMs: performance.now() - start, execution: "main-thread fallback" };
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([catalogWorkerSource()], {type:"text/javascript"}));
    let worker;
    try { worker = new Worker(url); } catch (error) { URL.revokeObjectURL(url); reject(error); return; }
    const normalized = [];
    const cleanup = () => { worker.terminate(); URL.revokeObjectURL(url); job.controller.signal.removeEventListener("abort", abort); };
    const abort = () => { cleanup(); reject(abortImportError()); };
    job.controller.signal.addEventListener("abort", abort, {once:true});
    worker.onerror = e => { cleanup(); reject(new Error(e.message)); };
    worker.onmessage = e => {
      const data = e.data;
      if (data.error) { cleanup(); reject(new Error(data.error)); }
      else if (data.done) { cleanup(); resolve({...data, normalized, execution:"worker / transferable buffers"}); }
      else if (data.batch) {
        for (const rec of data.batch) { Object.freeze(rec.raw); normalized.push(rec); }
        reportImportProgress(job, "Validating", data.completed, data.total);
        worker.postMessage({accepted:true});
      } else reportImportProgress(job, data.phase);
    };
    worker.postMessage({input, filter});
  });
}
async function importCatalogText(input, name = "catalog") {
  if (typeof input === "string" ? input.length > 256 * 1024 * 1024 : input.size > 256 * 1024 * 1024)
    throw new Error("Catalog input exceeds the 256 MiB safety limit; split into tiers.");
  cancelCatalogImport();
  const job = {controller:new AbortController()}; activeImport = job;
  cancelImportButton.hidden = false;
  const start = performance.now(), filter = {...catalogFilter};
  try {
    const staged = await stageCatalogImport(input, job, filter);
    if (job.controller.signal.aborted || activeImport !== job) throw abortImportError();
    reportImportProgress(job, "Uploading render buffers");
    const upload = performance.now();
    // If filters changed during validation, use the current filter at atomic commit.
    const render = JSON.stringify(filter) === JSON.stringify(catalogFilter) ? staged.render : null;
    const nextBundle = createImportedCatalogBundle(staged.normalized, render);
    const gpuUploadSubmissionMs = performance.now() - upload;
    importedCatalogRecords = staged.normalized;
    importedSourceMetadata = staged.source;
    displayEpoch = null; catalogRevision++;
    replaceImportedCatalogBundle(nextBundle, importedCatalogRecords.length);
    // Old selection/measurement references cannot survive a catalog replacement.
    if (selectedItem?.imported) showInspector(CELESTIAL_CATALOG[0]);
    if (measureA?.imported) measureA = null;
    if (measureB?.imported) measureB = null;
    updateMeasurement(); updateCatalogSummary();
    if (dataModal.classList.contains("open")) populateDataTable(dataSearch.value);
    drawCMD();
    Object.assign(importMetrics, {parseMs:staged.parseMs, normalizeMs:staged.normalizeMs,
      gpuUploadSubmissionMs, totalMs:performance.now()-start, count:importedCatalogRecords.length,
      rejected:staged.rejected, execution:staged.execution,
      renderBytes:render ? render.positions.byteLength+render.colors.byteLength+render.sizes.byteLength : null});
    importStatus.textContent = `Loaded ${importMetrics.count.toLocaleString()} external / unverified records from ${name}; ${staged.rejected} rejected. Physical measurements disabled. Source metadata retained.`;
    return {...importMetrics};
  } catch (error) {
    if (activeImport === job) importStatus.textContent = error.name === "AbortError" ? error.message : "Import failed; active catalog preserved: " + error.message;
    throw error;
  } finally {
    if (activeImport === job) { activeImport = null; cancelImportButton.hidden = true; }
  }
}
fileInput.onchange = async () => {
  const file = fileInput.files?.[0]; if (!file) return;
  if(typeof activeLocalPack!=="undefined"){activeLocalPack?.cancel();localPackJob++;}
  // Pass the File into the worker; avoid a main-thread text copy before parsing.
  try { await importCatalogText(file, file.name); } catch (_) { /* status is reported by the job */ }
  finally { fileInput.value = ""; }
};
