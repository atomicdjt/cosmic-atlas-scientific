// Incremental screen index for settled views. A moving view uses a direct scan;
// it never returns candidates from an obsolete camera, layer, epoch or filter.
class ScreenGrid {
  constructor(cellSize = 56) { this.cellSize = cellSize; this.cells = new Map(); }
  add(item, p) {
    if (!p) return;
    const key = Math.floor(p[0]/this.cellSize) + "," + Math.floor(p[1]/this.cellSize);
    if (!this.cells.has(key)) this.cells.set(key, []);
    this.cells.get(key).push({item,p});
  }
  build(records, project) { this.cells.clear(); for (const item of records) this.add(item, project(item.pos)); }
  nearest(x,y,radius=28) {
    let best=null,d=radius*radius;
    const cx=Math.floor(x/this.cellSize),cy=Math.floor(y/this.cellSize);
    const span=Math.ceil(radius/this.cellSize);
    for(let a=cx-span;a<=cx+span;a++) for(let b=cy-span;b<=cy+span;b++)
      for(const e of this.cells.get(a+","+b)||[]) {
        const dd=(x-e.p[0])**2+(y-e.p[1])**2;
        if(dd<d){d=dd;best=e.item;}
      }
    return best;
  }
}
let pickGrid = new ScreenGrid(), pickSignature = "";
let pendingPickBuild = null, settledSignature = "", settledSince = 0;
function currentPickSignature() {
  return Array.from(matMVP).join(",") + ":" + cssViewportWidth + ":" + cssViewportHeight +
    ":" + catalogRevision + ":" + JSON.stringify(layers) + ":" + JSON.stringify(catalogFilter);
}
function pickLayerVisible(i) {
  return i.imported ? layers.imported : ["context","model"].includes(i.dataClass) ? layers.context : layers.catalog;
}
function updatePickIndex(now) {
  const sig = currentPickSignature();
  if (sig === pickSignature) return;
  if (sig !== settledSignature) {
    settledSignature=sig; settledSince=now; pendingPickBuild=null; return;
  }
  if(now-settledSince<120) return;
  if(!pendingPickBuild) pendingPickBuild={sig,grid:new ScreenGrid(), records:visibleScientificRecords(),
    cursor:0,matrix:new Float32Array(matMVP),width:cssViewportWidth,height:cssViewportHeight};
  const job=pendingPickBuild, deadline=performance.now()+3;
  do {
    const end=Math.min(job.cursor+256,job.records.length);
    while(job.cursor<end){const item=job.records[job.cursor++];
      if(pickLayerVisible(item))job.grid.add(item,projectToScreen(item.pos,job.matrix,job.width,job.height));}
  } while(job.cursor<job.records.length && performance.now()<deadline);
  if(job.cursor===job.records.length){pickGrid=job.grid;pickSignature=job.sig;pendingPickBuild=null;}
}
let lastDirectPick = null;
function pickAt(x,y) {
  const sig=currentPickSignature();
  if(lastDirectPick?.sig===sig && (lastDirectPick.x-x)**2+(lastDirectPick.y-y)**2<=28*28) {
    let best=null,d=28*28;
    for(const e of lastDirectPick.nearby){const dd=(x-e.p[0])**2+(y-e.p[1])**2;if(dd<d){d=dd;best=e.item;}}
    return best;
  }
  if(sig===pickSignature) return pickGrid.nearest(x,y);
  // Avoid a whole-catalog grid allocation on the first interaction.
  let best=null,d=28*28; const nearby=[];
  for(const item of visibleScientificRecords()) {
    if(!pickLayerVisible(item))continue;
    const p=projectToScreen(item.pos);if(!p)continue;
    const dd=(x-p[0])**2+(y-p[1])**2;
    if(dd<=56*56)nearby.push({item,p});
    if(dd<d){d=dd;best=item;}
  }
  lastDirectPick={sig,x,y,item:best,nearby};
  return best;
}
