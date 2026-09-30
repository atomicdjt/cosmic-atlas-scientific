const scientificWorkspace=document.createElement("dialog");
scientificWorkspace.className="scientific-workspace interactive";
scientificWorkspace.setAttribute("aria-labelledby","platform-title");
scientificWorkspace.innerHTML=`
  <div class="platform-heading"><div><h2 id="platform-title">Scientific workspace</h2><p>Source-derived states · numerical models · explicit validity and provenance</p></div><button id="platform-close" type="button">Close</button></div>
  <nav class="platform-tabs" aria-label="Scientific tools">
    <button type="button" data-platform="ephemeris" aria-pressed="true">Ephemeris</button>
    <button type="button" data-platform="simulation" aria-pressed="false">Simulate</button>
    <button type="button" data-platform="missions" aria-pressed="false">Missions</button>
    <button type="button" data-platform="packs" aria-pressed="false">Local catalogs</button>
  </nav>
  <section data-platform-panel="ephemeris">
    <p><strong>NASA/JPL Horizons · DE441 · geometric ICRF states.</strong> Local six-hour samples, 2026-01-01 to 2028-01-01 TDB. Cubic Hermite interpolation; extrapolation refused. Sample/interpolation error does not describe source uncertainty.</p>
    <div class="platform-fields"><label>Epoch (JD TDB)<input id="eph-jd" type="number" step="0.125" value="2461313.5"></label><label>Target<select id="eph-target"></select></label><label>Origin<select id="eph-center"><option value="10">Heliocentric (Sun center)</option><option value="0">Solar-system barycenter</option><option value="399">Geocentric (Earth center)</option></select></label><label>Plot radius (AU)<input id="eph-radius" type="number" min="0.1" max="50" value="2"></label></div>
    <button id="eph-query" type="button">Query state</button><button id="eph-export" type="button">Export state and provenance</button>
    <p>Orbit view: heliocentric ICRF X-Y projection. The numerical state below uses the selected output origin.</p>
    <canvas id="eph-plot" width="720" height="440" role="img" aria-label="Heliocentric ICRF X-Y orbital projection in AU; numerical state is in the adjacent output"></canvas>
    <pre id="eph-output" tabindex="0" aria-live="polite"></pre>
    <details><summary>Explicit UTC conversion</summary><p>Supply the applicable TAI−UTC offset. No automatic future leap-second assumption. TT→TDB is a two-term approximation; UTC leap-second instants are unsupported.</p><div class="platform-fields"><label>UTC ISO timestamp (Z)<input id="time-utc" value="2026-09-30T00:00:00Z"></label><label>TAI−UTC (seconds, verify independently)<input id="time-offset" type="number" value="37"></label></div><button id="time-convert" type="button">Convert and use approximate JD TDB</button><pre id="time-output" aria-live="polite"></pre></details>
  </section>
  <section data-platform-panel="simulation" hidden>
    <p><strong>Numerically propagated Newtonian model.</strong> Initial states may come from Horizons; the propagated trajectory is a separate Sun–Earth–Mars model with rounded adopted mass ratios. No Moon, relativity, collisions or encounter design. Fixed-step velocity-Verlet; quality depends on timestep and regime.</p>
    <div class="platform-fields"><label>Step (days)<input id="sim-step" type="number" min="0.001" max="5" step="0.01" value="0.25"></label><label>Duration (days; ≤100k steps)<input id="sim-duration" type="number" min="0.1" max="1000" value="90"></label></div>
    <button id="sim-seed" type="button">Seed from selected Horizons epoch</button><button id="sim-propagate" type="button">Propagate in worker</button><button id="sim-cancel" type="button">Cancel propagation</button><button id="sim-export" type="button">Export state and quality</button>
    <p>Model view: solar-system-barycentric ICRF X-Y projection. Straight connectors show endpoint displacement, not the integrated path.</p>
    <canvas id="sim-plot" width="720" height="440" role="img" aria-label="Model ICRF X-Y projection in AU, with source initial points and propagated endpoints"></canvas><pre id="sim-output" tabindex="0" aria-live="polite"></pre>
  </section>
  <section data-platform-panel="missions" hidden>
    <p><strong>Patched-conic exploration, zero-revolution Lambert.</strong> Geometric source-derived endpoints; Sun-only coast. Departure C3=v∞²; arrival v∞ is not capture delta-v. No operational navigation, launch certification or multirevolution/collinear solution.</p>
    <div class="platform-fields"><label>Departure target<select id="lambert-origin"></select></label><label>Arrival target<select id="lambert-target"></select></label><label>Departure (JD TDB)<input id="lambert-jd" type="number" value="2461131.5"></label><label>Flight time (days)<input id="lambert-duration" type="number" min="1" value="250"></label><label>Transfer arc<select id="lambert-way"><option value="short">Short way</option><option value="long">Long way</option></select></label></div>
    <button id="lambert-solve" type="button">Solve transfer</button><button id="lambert-export" type="button">Export transfer</button><pre id="lambert-output" tabindex="0" aria-live="polite"></pre>
    <h3>Launch-window grid</h3><p>Departure span and flight-time interval are sampled on a 25×25 grid. Failed/unsupported cells remain missing; the lowest sampled C3 is not an optimized launch date.</p>
    <div class="platform-fields"><label>Departure span (days)<input id="grid-span" type="number" min="1" max="365" value="120"></label><label>Minimum flight time (days)<input id="grid-min" type="number" min="1" value="100"></label><label>Maximum flight time (days)<input id="grid-max" type="number" min="1" value="400"></label></div>
    <button id="grid-run" type="button">Compute grid in worker</button><button id="grid-cancel" type="button">Cancel grid</button><button id="grid-export" type="button">Export grid with failed-cell reasons</button>
    <canvas id="grid-plot" width="720" height="440" role="img" aria-label="Departure JD TDB versus flight days: log-scaled departure C3; gray indicates missing or unsupported cells"></canvas><pre id="grid-output" tabindex="0" aria-live="polite"></pre>
  </section>
  <section data-platform-panel="packs" hidden>
    <p><strong>Offline HEALPix RING pack.</strong> Select manifest.json and its NDJSON tiles together, or choose a pack folder. No server or network requests. The selected cone replaces the imported catalog progressively with verified tiles. Source records remain external/unverified; exports preserve source claims. Wider cones are refused if they exceed 20k retained rows or 32 MiB of retained source bytes.</p>
    <label>Pack files<input id="pack-files" type="file" multiple accept=".json,.ndjson"></label><label>Pack folder<input id="pack-folder" type="file" webkitdirectory multiple></label>
    <div class="platform-fields"><label>ICRS cone RA (deg)<input id="pack-ra" type="number" value="100"></label><label>ICRS cone Dec (deg)<input id="pack-dec" type="number" min="-90" max="90" value="0"></label><label>Cone radius (deg)<input id="pack-radius" type="number" min="0.1" max="90" value="15"></label></div>
    <button id="pack-load" type="button">Load cone into atlas</button><button id="pack-camera" type="button">Use camera direction</button><button id="pack-cancel" type="button">Cancel loading</button>
    <label><input id="pack-follow" type="checkbox"> Follow settled camera direction (Sol-centered views only)</label>
    <pre id="pack-output" tabindex="0" aria-live="polite">Build a pack with scripts/build_catalog_pack.py, then select its files locally.</pre>
    <p>Search, table, filters and exports operate on the loaded cone, not the full pack. A blank cone preserves the previous import with an explicit status. A cancelled/failed progressive load retains the last verified published subset. Cache budgets do not bound browser/GPU memory exactly; one ≤4 MiB tile is parsed at a time in a worker. Catalog epoch display is independent of tile selection, which uses source directions.</p>
  </section>`;
document.body.append(scientificWorkspace);
const platformButton=document.createElement("button");platformButton.id="scientific-workspace-btn";
platformButton.type="button";platformButton.className="platform-launch";platformButton.textContent="Scientific workspace";
document.querySelector(".scales-nav").prepend(platformButton);
platformButton.onclick=()=>{scientificWorkspace.showModal();document.getElementById("platform-close").focus();};
document.getElementById("platform-close").onclick=()=>scientificWorkspace.close();
scientificWorkspace.addEventListener("close",()=>platformButton.focus());
for (const button of scientificWorkspace.querySelectorAll("[data-platform]")) button.onclick=()=>{
  for (const b of scientificWorkspace.querySelectorAll("[data-platform]")) b.setAttribute("aria-pressed",String(b===button));
  for (const panel of scientificWorkspace.querySelectorAll("[data-platform-panel]")) panel.hidden=panel.dataset.platformPanel!==button.dataset.platform;
};
const ephColors={"10":"#ffd166","199":"#bbbbbb","299":"#e6c58c","399":"#69b7ff","4":"#ff8a65","5":"#e5b888","6":"#ddca91","7":"#7edce4","8":"#6785fa"};
function platformNumber(id) {const value=document.getElementById(id).value;if(!value.trim())throw new Error("A value is required: "+id);const number=Number(value);if(!Number.isFinite(number))throw new Error("Finite value required: "+id);return number;}
function platformAction(id,output,fn) {let revision=0;document.getElementById(id).onclick=async()=>{const job=++revision;try{await fn();}catch(error){if(job===revision)document.getElementById(output).textContent=error.name+": "+error.message;}};}
function platformJson(id,value) {document.getElementById(id).textContent=JSON.stringify(value,null,2);}
function plotOrbits(id,points,radius,trails=[]) {
  if (!Number.isFinite(radius)||radius<=0||radius>100) throw new Error("Plot radius must be 0–100 AU.");
  const plot=document.getElementById(id),ctx=plot.getContext("2d"),w=plot.width,h=plot.height;
  ctx.fillStyle="#08101f";ctx.fillRect(0,0,w,h);const scale=Math.min(w,h)*0.43/radius;
  ctx.strokeStyle="#334155";ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);ctx.stroke();
  const xy=p=>[w/2+p[0]*scale,h/2-p[1]*scale];
  for(const trail of trails){ctx.strokeStyle=trail.color;ctx.beginPath();trail.points.forEach((p,i)=>{const v=xy(p);i?ctx.lineTo(...v):ctx.moveTo(...v);});ctx.stroke();}
  ctx.font="12px sans-serif";for (const point of points){const [x,y]=xy(point.positionAu);if(x<0||x>w||y<0||y>h)continue;
    ctx.fillStyle=point.color||ephColors[point.id]||"#ffffff";ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();ctx.fillText(point.name,x+7,y-7);}
  ctx.fillStyle="#cbd5e1";ctx.fillText(`ICRF X-Y projection · ±${radius} AU · equal axis scale · Z omitted`,12,h-12);
}
const assetForOptions=embeddedEphemeris();
for (const id of ["eph-target","lambert-origin","lambert-target"]) {
  const select=document.getElementById(id);
  for (const [target,body] of Object.entries(assetForOptions.bodies)) {
    if (id.startsWith("lambert")&&target==="10")continue;
    const option=document.createElement("option");option.value=target;option.textContent=body.name;select.append(option);
  }
  select.value=id==="lambert-target"?"4":"399";
}
let platformEphemerisResult=null,platformMissionResult=null,platformGridResult=null,platformSimulationResult=null;
function queryPlatformEphemeris() {
  const asset=embeddedEphemeris(),jd=platformNumber("eph-jd"),target=document.getElementById("eph-target").value;
  platformEphemerisResult=ephemerisState(asset,target,jd,document.getElementById("eph-center").value);
  const points=Object.keys(asset.bodies).map(id=>({id,...ephemerisState(asset,id,jd,"10")}));
  const start=Math.max(asset.validRangeJd[0],jd-90),trail=[];
  for(let t=start;t<=jd;t+=0.5)trail.push(ephemerisState(asset,target,t,"10").positionAu);
  plotOrbits("eph-plot",points,platformNumber("eph-radius"),[{color:ephColors[target],points:trail}]);
  platformJson("eph-output",platformEphemerisResult);
}
platformAction("eph-query","eph-output",queryPlatformEphemeris);
platformAction("eph-export","eph-output",()=>{if(!platformEphemerisResult)throw new Error("Query a state first.");downloadBlob("ephemeris-state.json","application/json",JSON.stringify(platformEphemerisResult,null,2));});
platformAction("time-convert","time-output",()=>{const result=utcToTimeScales(document.getElementById("time-utc").value,platformNumber("time-offset"));platformJson("time-output",result);document.getElementById("eph-jd").value=result.jdTdb;});

let simulationJobController=null,missionGridController=null;
function seedPlatformSimulation() {
  const asset=embeddedEphemeris(),jd=platformNumber("eph-jd"),step=platformNumber("sim-step");
  const masses={"10":1,"399":3.0034896e-6,"4":3.22715e-7};
  const sourceStates=Object.keys(masses).map(id=>ephemerisState(asset,id,jd,"0"));
  const state=createSimulationState(sourceStates.map(s=>({id:s.target,name:s.name,massSolar:masses[s.target],
    positionAu:s.positionAu,velocityAuDay:s.velocityAuDay,provenance:s.provenance})),{timeJd:jd,stepDays:step});
  state.category="source-derived initial state with approximate adopted model masses";
  state.frame="ICRF";state.origin="solar-system barycenter";state.timeScale="TDB";
  state.sourceProvenance={sourceStates,massCategory:"rounded adopted Sun/Earth/Mars-system mass ratios; not a calibrated DE441 dynamical model"};
  platformSimulationResult={state,quality:simulationQuality(state,simulationDiagnostics(state),jd)};
  plotOrbits("sim-plot",state.bodies,2);platformJson("sim-output",platformSimulationResult.quality);
}
platformAction("sim-seed","sim-output",()=>{simulationJobController?.abort();seedPlatformSimulation();});
platformAction("sim-propagate","sim-output",async()=>{
  if(!platformSimulationResult)seedPlatformSimulation();simulationJobController?.abort();
  const controller=new AbortController();simulationJobController=controller;
  const initial=platformSimulationResult.state,step=platformNumber("sim-step");
  if(step<=0)throw new Error("Positive timestep required.");
  const result=await runScientificJob("simulation",{state:{...initial,stepDays:step},durationDays:platformNumber("sim-duration")},
    {signal:controller.signal,onProgress:p=>{document.getElementById("sim-output").textContent=`Propagating: ${(100*p).toFixed(0)}%`;}});
  if(simulationJobController!==controller)return;
  result.state.frame=initial.frame;result.state.timeScale=initial.timeScale;result.state.origin=initial.origin;
  platformSimulationResult=result;plotOrbits("sim-plot",result.state.bodies,2,
    initial.bodies.map((b,i)=>({color:ephColors[b.id],points:[b.positionAu,result.state.bodies[i].positionAu]})));
  platformJson("sim-output",{...result.quality,frame:result.state.frame,timeScale:result.state.timeScale,
    plot:"straight connectors show displacement, not the integrated path",source:result.state.sourceProvenance});
});
document.getElementById("sim-cancel").onclick=()=>simulationJobController?.abort();
platformAction("sim-export","sim-output",()=>{if(!platformSimulationResult)throw new Error("Seed a simulation first.");downloadBlob("simulation-state.json","application/json",JSON.stringify(platformSimulationResult,null,2));});
function platformMissionInputs(){return {departure:document.getElementById("lambert-origin").value,arrival:document.getElementById("lambert-target").value,
  jd:platformNumber("lambert-jd"),duration:platformNumber("lambert-duration"),options:{longWay:document.getElementById("lambert-way").value==="long"}};}
platformAction("lambert-solve","lambert-output",()=>{const m=platformMissionInputs();platformMissionResult=missionFromEphemeris(embeddedEphemeris(),m.departure,m.arrival,m.jd,m.jd+m.duration,m.options);platformJson("lambert-output",platformMissionResult);});
platformAction("lambert-export","lambert-output",()=>{if(!platformMissionResult)throw new Error("Solve a transfer first.");downloadBlob("lambert-transfer.json","application/json",JSON.stringify(platformMissionResult,null,2));});
function drawMissionGrid(result) {
  const c=document.getElementById("grid-plot"),ctx=c.getContext("2d"),n=result.departures.length,m=result.durations.length;
  const valid=[];for(let i=0;i<result.grid.length;i+=4)if(Number.isFinite(result.grid[i+2]))valid.push({index:i,c3:result.grid[i+2]});
  valid.sort((a,b)=>a.c3-b.c3);const min=valid[0]?.c3,max=valid.at(-1)?.c3;
  ctx.fillStyle="#08101f";ctx.fillRect(0,0,c.width,c.height);
  const width=(c.width-100)/n,height=(c.height-80)/m;
  for(let x=0;x<n;x++)for(let y=0;y<m;y++){
    const value=result.grid[(x*m+y)*4+2],fraction=Number.isFinite(value)?(Math.log1p(value)-Math.log1p(min))/(Math.log1p(max)-Math.log1p(min)||1):null;
    ctx.fillStyle=fraction===null?"#475569":`hsl(${240*(1-fraction)} 80% 55%)`;ctx.fillRect(70+x*width,20+(m-y-1)*height,width+1,height+1);
  }
  ctx.fillStyle="#e2e8f0";ctx.font="12px sans-serif";ctx.fillText(`Departure JD TDB ${result.departures[0]} → ${result.departures.at(-1)}`,70,c.height-28);
  ctx.fillText(`Flight days ${result.durations[0]} → ${result.durations.at(-1)} (upward)`,70,c.height-10);
  ctx.fillText(`C3 km²/s²: blue ${min?.toFixed(2)??"missing"} → red ${max?.toFixed(2)??"missing"}; log scale`,70,12);
  const best=valid[0];platformJson("grid-output",{cells:n*m,validCells:valid.length,failedCells:result.failures.length,
    lowestSampled:best?{departureJdTdb:result.grid[best.index],flightDays:result.grid[best.index+1],c3Km2S2:best.c3,arrivalVInfinityKmS:result.grid[best.index+3]}:null,
    method:result.category,source:result.source,warning:"Sampled patched-conic grid; not a certified or optimized launch window."});
}
platformAction("grid-run","grid-output",async()=>{
  missionGridController?.abort();const controller=new AbortController();missionGridController=controller;
  const m=platformMissionInputs(),span=platformNumber("grid-span"),min=platformNumber("grid-min"),max=platformNumber("grid-max");
  if(!(span>0&&span<=365&&min>0&&max>min))throw new Error("Invalid grid interval.");
  const departures=Array.from({length:25},(_,i)=>m.jd+i*span/24),durations=Array.from({length:25},(_,i)=>min+i*(max-min)/24);
  const result=await runScientificJob("mission-grid",{asset:embeddedEphemeris(),departure:m.departure,arrival:m.arrival,departures,durations,options:m.options},
    {signal:controller.signal,onProgress:p=>{document.getElementById("grid-output").textContent=`Computing: ${(p*100).toFixed(0)}%`;}});
  if(missionGridController!==controller)return;
  platformGridResult={...result,departure:m.departure,arrival:m.arrival,options:m.options,
    scientificMetadata:{category:"numerically computed",source:{engine:result.source,assetSha256:embeddedEphemeris().assetSha256},
      epoch:departures[0],timeScale:"TDB",frame:"heliocentric ICRF",units:{c3:"km²/s²",arrivalVInfinity:"km/s",time:"days"},
      method:"sampled zero-revolution universal-variable Lambert grid",assumptions:["Sun-only patched-conic coast","Missing cells carry failure reasons"],
      uncertainty:null,validRange:embeddedEphemeris().validRangeJd.slice()},
    ephemerisVersions:Object.fromEntries(Object.entries(embeddedEphemeris().bodies).map(([id,b])=>[id,b.sourceVersion])),
    limitations:["Sun-only coast; no launch vehicle or capture delta-v","Only zero-revolution transfer arcs","Unsupported cells remain missing"]};drawMissionGrid(result);
});
document.getElementById("grid-cancel").onclick=()=>missionGridController?.abort();
platformAction("grid-export","grid-output",()=>{if(!platformGridResult)throw new Error("Compute a grid first.");downloadBlob("mission-grid.json","application/json",JSON.stringify({...platformGridResult,grid:Array.from(platformGridResult.grid)},null,2));});

let activeLocalPack=null,localPackJob=0,lastPackCamera="",lastPackCameraTime=0,observedPackCamera="",observedPackCameraSince=0;
async function openLocalPackFiles(files) {
  const manifestFile=files.find(f=>f.name==="manifest.json");if(!manifestFile||manifestFile.size>4*1024*1024)throw new Error("Select a pack manifest.json (≤4 MiB) and all its tiles.");
  const manifest=JSON.parse(await manifestFile.text()),pack=new LocalCatalogPack(manifest,files);
  activeLocalPack?.cancel();activeLocalPack=pack;localPackJob++;
  platformJson("pack-output",{pack:manifest.id,scheme:manifest.scheme,order:manifest.order,rows:manifest.recordCount,tiles:manifest.tiles.length,
    sourceHash:manifest.sourceSha256,source:manifest.sourceMetadata});
}
for(const id of ["pack-files","pack-folder"])document.getElementById(id).onchange=async e=>{try{await openLocalPackFiles(Array.from(e.target.files));}catch(error){document.getElementById("pack-output").textContent=error.message;}};
async function loadLocalPackCone() {
  if(!activeLocalPack)throw new Error("Choose pack files first.");
  const pack=activeLocalPack,job=++localPackJob;cancelCatalogImport();
  const ra=platformNumber("pack-ra"),dec=platformNumber("pack-dec"),radius=platformNumber("pack-radius");
  const started=performance.now();
  const result=await pack.selectCone(ra,dec,radius,async progress=>{
    if(job!==localPackJob||progress.signal.aborted)throw abortImportError();
    document.getElementById("pack-output").textContent=`Verified ${progress.loaded}/${progress.total} tiles; ${progress.records.length} cone rows. Retained ${progress.cachedRows} rows / ${progress.cachedBytes} source bytes.`;
    if(progress.records.length && (progress.loaded%8===0||progress.loaded===progress.total)){
      const abort=()=>cancelCatalogImport();progress.signal.addEventListener("abort",abort,{once:true});
      try{await importCatalogText(JSON.stringify({schema:"cosmic-atlas.catalog.v1",source:pack.manifest.sourceMetadata,
        localPack:{id:pack.manifest.id,sourceSha256:pack.manifest.sourceSha256,scheme:pack.manifest.scheme,order:pack.manifest.order,
          cone:{raDeg:ra,decDeg:dec,radiusDeg:radius},verifiedTiles:progress.loaded,totalTiles:progress.total,
          complete:progress.loaded===progress.total},records:progress.records}),"verified local HEALPix cone");}
      finally{progress.signal.removeEventListener("abort",abort);}
    }
  });
  if(job!==localPackJob)return;
  platformJson("pack-output",{pack:pack.manifest.id,cone:{ra,dec,radius},rows:result.records.length,tiles:result.loaded,
    elapsedMs:performance.now()-started,retainedSourceBytes:result.cachedBytes,retainedRows:result.cachedRows,
    status:result.records.length?"Verified cone published; external/unverified trust retained.":"Empty cone; previous imported catalog retained."});
}
platformAction("pack-load","pack-output",loadLocalPackCone);
document.getElementById("pack-cancel").onclick=()=>{localPackJob++;activeLocalPack?.cancel();cancelCatalogImport();document.getElementById("pack-output").textContent="Cancelled; last verified published catalog retained.";};
function useCameraPackDirection() {
  if(Math.hypot(...camera.lookTarget)>1e-6)throw new Error("Camera cone requires a Sol-centered view; reset atlas first.");
  const v=[-Math.cos(camera.phi)*Math.sin(camera.theta),-Math.sin(camera.phi),-Math.cos(camera.phi)*Math.cos(camera.theta)];
  document.getElementById("pack-ra").value=(Math.atan2(v[2],v[0])*180/Math.PI+360)%360;
  document.getElementById("pack-dec").value=Math.asin(v[1])*180/Math.PI;
}
platformAction("pack-camera","pack-output",useCameraPackDirection);
function localPackCameraTick(now) {
  if(!activeLocalPack||!document.getElementById("pack-follow").checked)return;
  const signature=[camera.theta.toFixed(3),camera.phi.toFixed(3),camera.dist.toFixed(1)].join(":");
  if(signature!==observedPackCamera){observedPackCamera=signature;observedPackCameraSince=now;return;}
  if(now-observedPackCameraSince<350||now-lastPackCameraTime<1500||signature===lastPackCamera||camera.animating||isDragging||Math.hypot(...camera.lookTarget)>1e-6)return;
  lastPackCamera=signature;lastPackCameraTime=now;
  try{useCameraPackDirection();loadLocalPackCone().catch(error=>{if(error.name!=="AbortError")document.getElementById("pack-output").textContent=error.message;});}catch(error){document.getElementById("pack-output").textContent=error.message;}
}
// Font metrics and wrapped navigation vary by browser; keep scientific context
// below the actual header rather than assuming a fixed header height.
function positionAtlasOrientationNote() {
  const note=document.getElementById("orientation-note"),bar=document.querySelector(".top-bar");
  const floor=innerWidth<=900?140:innerWidth<=1100?100:96;
  note.style.top=`${Math.max(floor,bar.getBoundingClientRect().bottom+8)}px`;
}
const platformHeaderObserver=new ResizeObserver(positionAtlasOrientationNote);
platformHeaderObserver.observe(document.querySelector(".top-bar"));
window.addEventListener("resize",positionAtlasOrientationNote);
positionAtlasOrientationNote();
queryPlatformEphemeris();
