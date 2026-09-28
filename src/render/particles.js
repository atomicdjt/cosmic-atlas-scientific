const denseRenderDetail = {pointCap:4, resolutionScale:1, mode:"full", lastUpdate:0};
function updateRenderDetail(now) {
  if(now-denseRenderDetail.lastUpdate<1000) return;
  denseRenderDetail.lastUpdate=now;
  const dense=layers.imported && importedCatalogBundle.count>20000;
  const frames=frameDurations.slice(-60).filter(x=>x>0 && x<500);
  const mean=frames.reduce((a,b)=>a+b,0)/Math.max(1,frames.length);
  if(!dense){denseRenderDetail.pointCap=4;denseRenderDetail.resolutionScale=1;denseRenderDetail.mode="full";}
  else if(frames.length>=20 && mean>28){denseRenderDetail.pointCap=2;denseRenderDetail.resolutionScale=0.75;denseRenderDetail.mode="adaptive";}
  else if(mean<19){denseRenderDetail.pointCap=4;denseRenderDetail.resolutionScale=1;denseRenderDetail.mode="full";}
  const label=document.getElementById("render-detail-status");
  if(label)label.textContent=denseRenderDetail.mode==="adaptive" ? "Adaptive detail: smaller points / 75% canvas resolution. All records retained and selectable." : "Full detail: all filtered catalog rows rendered. Point colors encode photometry, not trust.";
}
function drawBufferBundle(bundle) {
  gl.uniform1f(
    pLoc.uMaxPointSize,
    bundle === importedCatalogBundle ? (bundle.count > 20000 ? denseRenderDetail.pointCap : 8) : 20,
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, bundle.vboPos);
  gl.enableVertexAttribArray(pLoc.pos);
  gl.vertexAttribPointer(pLoc.pos, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, bundle.vboCol);
  gl.enableVertexAttribArray(pLoc.col);
  gl.vertexAttribPointer(pLoc.col, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, bundle.vboSize);
  gl.enableVertexAttribArray(pLoc.size);
  gl.vertexAttribPointer(pLoc.size, 1, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.POINTS, 0, bundle.count);
}
