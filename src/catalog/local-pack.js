// Local Files only. Cache limits cover retained source bytes/rows, not total JS heap.
function validateLocalPack(m) {
  if (!m || m.schema!=="cosmic-atlas.local-pack.v1" || m.frame!=="ICRS" || m.scheme!=="HEALPix RING" ||
      !Number.isInteger(m.order) || m.order<0 || m.order>5 || m.nside!==2**m.order ||
      !Number.isInteger(m.recordCount) || m.recordCount<1 || m.recordCount>10000000 ||
      !/^[a-f0-9]{64}$/.test(m.sourceSha256) || !m.sourceMetadata || !m.builder ||
      !Array.isArray(m.tiles) || !m.tiles.length || m.tiles.length>12*m.nside*m.nside)
    throw new Error("Unsupported local HEALPix pack manifest.");
  const ids=new Set(), names=new Set();let count=0;
  for (const t of m.tiles) {
    if (!Number.isInteger(t.id) || t.id<0 || t.id>=12*m.nside*m.nside || ids.has(t.id) || names.has(t.file) ||
        t.file!==`ring-${m.order}-${t.id}.ndjson` || !/^[a-f0-9]{64}$/.test(t.sha256) ||
        !Number.isInteger(t.rowCount) || t.rowCount<1 || t.rowCount>5000 ||
        !Number.isInteger(t.bytes) || t.bytes<1 || t.bytes>4*1024*1024 ||
        ![t.centerRaDeg,t.centerDecDeg,t.sourceCapRadiusDeg].every(Number.isFinite) ||
        t.centerRaDeg<0 || t.centerRaDeg>=360 || Math.abs(t.centerDecDeg)>90 || t.sourceCapRadiusDeg<0 || t.sourceCapRadiusDeg>180)
      throw new Error("Invalid or oversized HEALPix tile metadata.");
    ids.add(t.id);names.add(t.file);count+=t.rowCount;
  }
  if (count!==m.recordCount) throw new Error("Pack row counts disagree.");
  return m;
}
function localPackTilesForCone(manifest,ra,dec,radius) {
  if (![ra,dec,radius].every(Number.isFinite) || Math.abs(dec)>90 || radius<=0 || radius>180)
    throw new Error("Invalid ICRS cone.");
  return manifest.tiles.map(t=>({tile:t, separation:angularSeparationDeg({ra,dec},{ra:t.centerRaDeg,dec:t.centerDecDeg})}))
    .filter(x=>x.separation<=radius+x.tile.sourceCapRadiusDeg+1e-8)
    .sort((a,b)=>a.separation-b.separation || a.tile.id-b.tile.id).map(x=>x.tile);
}
function localTileWorkerSource() {
  return `onmessage=async e=>{try{
    const {file,tile}=e.data;
    if(file.size!==tile.bytes || file.size>4*1024*1024)throw new Error('Tile byte count/limit mismatch');
    const reader=file.stream().getReader(),decoder=new TextDecoder('utf-8',{fatal:true});
    let pending='',records=[];const ids=new Set();
    const line=text=>{if(text.length>65536)throw new Error('Tile line exceeds 64 KiB');
      if(!text)return;const row=JSON.parse(text);
      if(!row || typeof row.id!=='string'||ids.has(row.id))throw new Error('Duplicate/invalid tile row');
      ids.add(row.id);records.push(row);if(records.length>tile.rowCount)throw new Error('Excess tile rows');};
    while(true){const {value,done}=await reader.read();if(done)break;
      pending+=decoder.decode(value,{stream:true});const lines=pending.split('\\n');pending=lines.pop();
      for(const text of lines)line(text);if(pending.length>65536)throw new Error('Tile line exceeds 64 KiB');}
    pending+=decoder.decode();if(pending)line(pending);
    if(records.length!==tile.rowCount)throw new Error('Tile row count mismatch');
    const bytes=await file.arrayBuffer();
    const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
    if(digest!==tile.sha256)throw new Error('Tile SHA-256 mismatch');
    postMessage({records});
  }catch(error){postMessage({error:error.message})}};`;
}
function readLocalTile(file,tile,signal) {
  if (signal.aborted) return Promise.reject(abortImportError());
  if (!window.Worker || !crypto.subtle) return Promise.reject(new Error("Local packs require Workers and Web Crypto in this browser."));
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(new Blob([localTileWorkerSource()],{type:"text/javascript"}));
    let worker;
    try {worker=new Worker(url);} catch(error) {URL.revokeObjectURL(url);reject(error);return;}
    const cleanup=()=>{worker.terminate();URL.revokeObjectURL(url);signal.removeEventListener("abort",abort);};
    const abort=()=>{cleanup();reject(abortImportError());};signal.addEventListener("abort",abort,{once:true});
    worker.onmessage=e=>{cleanup();e.data.error?reject(new Error(e.data.error)):resolve(e.data.records);};
    worker.onerror=e=>{cleanup();reject(new Error(e.message));};worker.postMessage({file,tile});
  });
}
class LocalCatalogPack {
  constructor(manifest,files,options={}) {
    this.manifest=validateLocalPack(manifest);this.files=new Map();
    for (const file of files) {
      if (this.files.has(file.name)) throw new Error("Ambiguous duplicate local filename.");
      this.files.set(file.name,file);
    }
    for (const tile of manifest.tiles) if (!this.files.has(tile.file)) throw new Error("Missing local tile: "+tile.file);
    this.cache=new Map();this.cachedBytes=0;this.cachedRows=0;this.controller=null;
    this.maxBytes=options.maxBytes??32*1024*1024;this.maxRows=options.maxRows??20000;
    if (!Number.isInteger(this.maxBytes)||this.maxBytes<1||this.maxBytes>32*1024*1024 || !Number.isInteger(this.maxRows)||this.maxRows<1||this.maxRows>20000) throw new Error("Invalid local pack cache limits.");
  }
  cancel() {this.controller?.abort();}
  async selectCone(ra,dec,radius,onProgress) {
    this.cancel();const controller=new AbortController();this.controller=controller;
    const tiles=localPackTilesForCone(this.manifest,ra,dec,radius);
    const bytes=tiles.reduce((n,t)=>n+t.bytes,0),rows=tiles.reduce((n,t)=>n+t.rowCount,0);
    if (bytes>this.maxBytes || rows>this.maxRows) throw new Error("Cone exceeds 32 MiB / 20k retained-row budget; narrow the cone.");
    // Evict before loading; cancelled jobs leave the previous published catalog intact.
    const wanted=new Set(tiles.map(t=>t.id));
    for (const [id,entry] of this.cache) if (!wanted.has(id)) {
      this.cachedBytes-=entry.bytes;this.cachedRows-=entry.records.length;this.cache.delete(id);
    }
    const records=[],ids=new Set();let loaded=0;
    for (const tile of tiles) {
      if (controller.signal.aborted) throw abortImportError();
      let entry=this.cache.get(tile.id);
      if (!entry) {
        const parsed=await readLocalTile(this.files.get(tile.file),tile,controller.signal);
        if (controller.signal.aborted) throw abortImportError();
        for (const row of parsed) {
          if (!Number.isFinite(row.ra_deg) || !Number.isFinite(row.dec_deg) || Math.abs(row.dec_deg)>90)
            throw new Error("Tile requires explicit finite source ICRS directions.");
          const normalized=normalizeImportedRecord(row,0);
          if (!normalized || angularSeparationDeg({ra:normalized.sourceRa,dec:normalized.sourceDec},
              {ra:tile.centerRaDeg,dec:tile.centerDecDeg})>tile.sourceCapRadiusDeg+1e-7) throw new Error("Tile direction/cap mismatch.");
        }
        entry={records:parsed,bytes:tile.bytes};
        this.cache.set(tile.id,entry);this.cachedBytes+=tile.bytes;this.cachedRows+=parsed.length;
      }
      for (const row of entry.records) {
        if (ids.has(row.id)) throw new Error("Duplicate ID across local tiles.");ids.add(row.id);
        if (angularSeparationDeg({ra:row.ra_deg,dec:row.dec_deg},{ra,dec})<=radius) records.push(row);
      }
      loaded++;
      if (onProgress) await onProgress({loaded,total:tiles.length,records:records.slice(),cachedBytes:this.cachedBytes,
        cachedRows:this.cachedRows,signal:controller.signal});
    }
    if (controller.signal.aborted) throw abortImportError();
    return {records,loaded,tiles:tiles.length,cachedBytes:this.cachedBytes,cachedRows:this.cachedRows};
  }
}
