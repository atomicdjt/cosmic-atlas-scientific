let dialogState = null;
function openAtlasDialog(modal, first) {
  if (dialogState) closeAtlasDialog(dialogState.modal);
  const opener=document.activeElement===document.body ? document.getElementById(modal===dataModal ? "data-table-btn" : "science-info-btn") : document.activeElement;
  const background=[...document.body.children].filter(el=>el!==modal && !["SCRIPT","STYLE"].includes(el.tagName));
  const previous=background.map(el=>el.inert);
  modal.classList.add("open"); modal.setAttribute("aria-hidden","false");
  dialogState={modal,opener,background,previous};
  background.forEach(el=>{el.inert=true}); first.focus();
}
function closeAtlasDialog(modal) {
  modal.classList.remove("open"); modal.setAttribute("aria-hidden","true");
  if(dialogState?.modal!==modal)return;
  const state=dialogState;dialogState=null;
  state.background.forEach((el,i)=>{el.inert=state.previous[i]});
  const target=state.opener?.isConnected && state.opener.offsetParent!==null ? state.opener : document.getElementById("toggle-telemetry-btn");
  target.focus();
}
for(const modal of [dataModal,scienceModal]) {
  modal.setAttribute("aria-hidden","true");
  modal.addEventListener("keydown",e=>{
    if(e.key!=="Tab")return;
    const els=[...modal.querySelectorAll('button,input,select,a[href],[tabindex="0"]')]
      .filter(x=>x.offsetParent!==null && !x.disabled && !x.inert);
    if(!els.length)return;
    const first=els[0],last=els.at(-1);
    if(e.shiftKey && (document.activeElement===first || !modal.contains(document.activeElement))){e.preventDefault();last.focus();}
    else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
  });
}
document.getElementById("inspect-name").setAttribute("aria-live","polite");
searchInput.setAttribute("aria-label","Search catalog records by name, source or identifier");
canvas.setAttribute("aria-label","Cosmic Atlas sky visualization with nonlinear radial scale. Use catalog search and the paginated data table for all record selection and provenance.");
canvas.setAttribute("aria-describedby","catalog-summary");
for(const input of document.querySelectorAll('.switch input')) {
  const label=input.closest('.layer-item')?.querySelector('.layer-label')?.textContent || input.id.replace('layer-','')+' layer';
  input.setAttribute('aria-label',label);
}
window.matchMedia?.("(prefers-reduced-motion: reduce)").addEventListener("change",e=>{reduceMotion=e.matches});
canvas.addEventListener("webglcontextlost",e=>{
  e.preventDefault(); cancelCatalogImport();
  showRuntimeMessage("Graphics context lost","Reload the page to restore rendering. Export your catalog before reloading if possible.");
});

// The mobile header can wrap; keep first-use orientation below its actual bounds.
function positionAtlasOrientation() {
  const note=document.getElementById("orientation-note");
  note.style.top=window.innerWidth<=900 ? `${Math.ceil(document.querySelector(".top-bar").getBoundingClientRect().bottom+8)}px` : "";
}
window.addEventListener("resize",positionAtlasOrientation);
positionAtlasOrientation();
