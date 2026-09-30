"""Behavioral readiness checks; no external services, assistive-technology claims or new runtime deps."""
import json,os,sys,hashlib,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
QA=ROOT/'qa/readiness';QA.mkdir(exist_ok=True)
def main():
 results=[]
 with sync_playwright() as pw:
  for name,engine,viewport in [('chromium','chromium',{'width':1440,'height':1000}),('firefox','firefox',{'width':1440,'height':1000}),('mobile-emulation','chromium',{'width':390,'height':844})]:
   kwargs={'headless':engine!='firefox' or os.environ.get('COSMIC_ATLAS_FIREFOX_HEADLESS','1')!='0'};cache=Path(os.environ.get('LOCALAPPDATA',''))/'ms-playwright'
   candidates=sorted(cache.glob('chromium_headless_shell-*/chrome-headless-shell-win64/chrome-headless-shell.exe' if engine=='chromium' else 'firefox-*/firefox/firefox.exe'))
   if candidates:kwargs['executable_path']=str(candidates[-1])
   if engine=='chromium':kwargs['args']=['--use-angle=swiftshader','--enable-unsafe-swiftshader']
   b=getattr(pw,engine).launch(**kwargs);ctx=b.new_context(viewport=viewport,reduced_motion='reduce');ctx.set_offline(True);page=ctx.new_page();errors=[];network=[];checks={}
   page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda req:network.append(req.url) if req.url.startswith(('http:','https:')) else None)
   def check(label,script):
    checks[label]=page.evaluate(script)
    assert checks[label],label
   try:
    page.goto((ROOT/'dist/Cosmic_Atlas_Standalone.html').as_uri());page.evaluate('window.atlasReady');page.evaluate('simSpeed=0')
    check('build_identity',"RELEASE_MANIFEST.version==='6.0.0' && !RELEASE_MANIFEST.buildId.includes('{{')")
    check('adaptive_detail_retains_all_records',"""async()=>{await importCatalogText(JSON.stringify({records:Array.from({length:21001},(_,i)=>({id:'dense'+i,ra_deg:i%360,dec_deg:10,raw_source_fields:{sequence:i}}))}));const original=JSON.stringify(exportRecord(importedCatalogRecords[0])),count=importedCatalogBundle.count;frameDurations.splice(0,frameDurations.length,...Array(60).fill(40));denseRenderDetail.lastUpdate=0;updateRenderDetail(performance.now()+2000);const data=prepareCatalogRenderData(importedCatalogRecords);return denseRenderDetail.mode==='adaptive' && denseRenderDetail.resolutionScale===0.75 && importedCatalogRecords.length===21001 && importedCatalogBundle.count===count && count===21001 && data.count===21001 && data.positions instanceof Float32Array && data.colors instanceof Float32Array && data.sizes instanceof Float32Array && JSON.stringify(exportRecord(importedCatalogRecords[0]))===original;}""")
    check('orientation_and_zoom',"document.querySelector('meta[name=viewport]').content==='width=device-width, initial-scale=1.0' && document.getElementById('orientation-note').textContent.includes('nonlinear') && document.getElementById('orientation-note').getBoundingClientRect().top<window.innerHeight && document.getElementById('orientation-note').getBoundingClientRect().top>=document.querySelector('.top-bar').getBoundingClientRect().bottom")
    page.keyboard.press('d');checks['dialog_initial_focus']=page.locator('#data-table-search').evaluate('(el)=>el===document.activeElement');assert checks['dialog_initial_focus']
    check('background_inert',"canvas.inert && document.querySelector('.hud-layer').inert")
    page.locator('#data-modal-close').focus();page.keyboard.press('Shift+Tab')
    check('dialog_reverse_wrap',"dataModal.contains(document.activeElement) && document.activeElement.id==='table-direction'")
    page.keyboard.press('Tab');check('dialog_forward_wrap',"document.activeElement.id==='data-modal-close'")
    page.keyboard.press('Escape');check('dialog_close_restores_focus',"!dataModal.classList.contains('open') && !canvas.inert && document.activeElement.id===(window.innerWidth<=900?'toggle-telemetry-btn':'data-table-btn')")
    page.evaluate("document.getElementById('science-info-btn').focus();openScienceModal()")
    page.keyboard.press('Escape');check('methodology_focus_return',"document.activeElement.id===(window.innerWidth<=900?'toggle-telemetry-btn':'science-info-btn') && !scienceModal.classList.contains('open')")
    check('alias_source_epoch_and_export','''async()=>{await importCatalogText(JSON.stringify({records:[{id:'alias',ra:20,dec:30,distance_ly:100,ref_epoch:2016,pmra_masyr:200,pmdec_masyr:100,tier:'observational',measurement_eligible:true}]}));const x=importedCatalogRecords[0];setDisplayEpoch(2036);const exported=exportRecord(x);const moved=x.ra!==20;setDisplayEpoch(null);return moved && exported.ra_deg===20 && exported.dec_deg===30 && x.ra===20 && x.dec===30 && !physicalMeasurementAllowed(x) && exported.source_claims.measurement_eligible===true;}''')
    check('late_duplicate_keeps_catalog','''async()=>{const records=importedCatalogRecords,bundle=importedCatalogBundle;const rows=Array.from({length:2500},(_,i)=>({id:'r'+i,ra_deg:i%360,dec_deg:20}));rows.push(rows[0]);try{await importCatalogText(JSON.stringify({records:rows}));return false}catch(e){return importedCatalogRecords===records && importedCatalogBundle===bundle && e.message.includes('Duplicate')}}''')
    # Capture cancellation during active normalization, not merely before work starts.
    page.evaluate("window.oldRecords=importedCatalogRecords;window.oldBundle=importedCatalogBundle;window.pending=importCatalogText(JSON.stringify({records:Array.from({length:50000},(_,i)=>({id:'cancel'+i,ra_deg:i%360,dec_deg:10}))})).then(()=>window.cancelResult='committed',e=>window.cancelResult=e.name);void 0")
    page.wait_for_function("importStatus.textContent.includes('Validating')",timeout=30000);page.evaluate('cancelCatalogImport()');page.wait_for_function("window.cancelResult!==undefined")
    check('cancel_during_validation_is_atomic',"cancelResult==='AbortError' && importedCatalogRecords===oldRecords && importedCatalogBundle===oldBundle && cancelImportButton.hidden")
    check('newest_import_wins','''async()=>{const first=importCatalogText(JSON.stringify({records:Array.from({length:10000},(_,i)=>({id:'old'+i,ra_deg:1,dec_deg:2}))})).catch(e=>e.name);await importCatalogText(JSON.stringify({records:[{id:'newest',ra_deg:0,dec_deg:0}]}));return await first==='AbortError' && importedCatalogRecords.length===1 && importedCatalogRecords[0].externalId==='newest';}''')
    check('fallback_cancel_is_atomic','''async()=>{const original=window.Worker,records=importedCatalogRecords,bundle=importedCatalogBundle;window.Worker=undefined;try{const p=importCatalogText(JSON.stringify({records:Array.from({length:10000},(_,i)=>({id:'fallback'+i,ra_deg:1,dec_deg:2}))}));setTimeout(cancelCatalogImport,0);try{await p;return false}catch(e){return e.name==='AbortError' && records===importedCatalogRecords && bundle===importedCatalogBundle}}finally{window.Worker=original}}''')
    check('fallback_worker_equivalence','''async()=>{const text=JSON.stringify({records:[{id:'fallback',ra_deg:12,dec_deg:30,parallax_mas:20,parallax_error_mas:1,ref_epoch:2016,raw_source_fields:{nested:{value:'unchanged'}}}]});await importCatalogText(text);const expected=JSON.stringify(exportRecord(importedCatalogRecords[0]));const Worker=window.Worker;window.Worker=undefined;try{await importCatalogText(text);return JSON.stringify(exportRecord(importedCatalogRecords[0]))===expected && importMetrics.execution==='main-thread fallback'}finally{window.Worker=Worker}}''')
    check('failed_filter_preserves_view','''()=>{const old=JSON.stringify(catalogFilter),bundle=importedCatalogBundle,obs=observedCatalogBundle,revision=catalogRevision;const build=window.buildBufferBundle;let calls=0;window.buildBufferBundle=(...args)=>{if(++calls===3)throw new Error('allocation test');return build(...args)};document.getElementById('filter-snrMin').value='1000';try{applyScientificFilters();return false}catch(e){return JSON.stringify(catalogFilter)===old && importedCatalogBundle===bundle && observedCatalogBundle===obs && catalogRevision===revision}finally{window.buildBufferBundle=build}}''')
    check('failed_epoch_preserves_records','''()=>{const old=JSON.stringify(exportRecord(importedCatalogRecords[0])),bundle=importedCatalogBundle,epoch=displayEpoch;const build=window.buildBufferBundle;window.buildBufferBundle=()=>{throw new Error('allocation test')};try{setDisplayEpoch(2020);return false}catch(e){return old===JSON.stringify(exportRecord(importedCatalogRecords[0])) && bundle===importedCatalogBundle && epoch===displayEpoch}finally{window.buildBufferBundle=build}}''')
    check('stale_selection_cleared','''async()=>{showInspector(importedCatalogRecords[0]);await importCatalogText(JSON.stringify({records:[{id:'replacement',ra_deg:4,dec_deg:5}]}));return !selectedItem.imported && document.getElementById('inspect-name').textContent===CELESTIAL_CATALOG[0].name;}''')
    page.locator('#object-search').fill('replacement');page.locator('.search-item').first.focus();page.keyboard.press('Enter')
    check('keyboard_search_restores_focus',"document.activeElement===searchInput && selectedItem.externalId==='replacement' && document.getElementById('inspect-name').getAttribute('aria-live')==='polite'")
    check('reduced_motion_snaps_camera',"()=>{flyToScale(100,[0,0,0]);return reduceMotion && camera.animProgress===1}")
    page.wait_for_timeout(80);check('reduced_motion_reaches_target',"camera.dist===100 && !camera.animating")
    page.emulate_media(reduced_motion='no-preference');page.wait_for_function('!reduceMotion');check('motion_preference_updates_live',"!reduceMotion")
    page.emulate_media(reduced_motion='reduce');page.wait_for_function('reduceMotion');check('motion_preference_resets_live',"reduceMotion")

    page.wait_for_timeout(1000)
    check('incremental_pick_matches_reference','''()=>{const reference=new ScreenGrid();reference.build(visibleScientificRecords().filter(pickLayerVisible),projectToScreen);for(let x=0;x<cssViewportWidth;x+=70)for(let y=0;y<cssViewportHeight;y+=70)if(reference.nearest(x,y)!==pickAt(x,y))return false;return pickSignature===currentPickSignature();}''')
    check('cold_pick_neighborhood_equivalence',"""()=>{pickSignature='';const ref=new ScreenGrid();ref.build(visibleScientificRecords().filter(pickLayerVisible),projectToScreen);const x=cssViewportWidth/2,y=cssViewportHeight/2;pickAt(x,y);for(const [dx,dy] of [[1,0],[-27,0],[0,27],[19,19]])if(pickAt(x+dx,y+dy)!==ref.nearest(x+dx,y+dy))return false;return true;}""")
    page.set_viewport_size({'width':900,'height':700});page.wait_for_timeout(500)
    check('resize_pick_invalidation','''()=>{const reference=new ScreenGrid();reference.build(visibleScientificRecords().filter(pickLayerVisible),projectToScreen);for(let x=0;x<900;x+=80)for(let y=0;y<700;y+=80)if(reference.nearest(x,y)!==pickAt(x,y))return false;return true;}''')
    page.evaluate("workbench.open=true");page.wait_for_timeout(100);check('diagram_accessible_description',"document.getElementById('cmd-canvas').getAttribute('aria-label').includes('catalog search') && document.getElementById('cmd-summary').textContent.includes('No extinction')")
    checks['no_page_errors']=not errors;checks['no_external_requests']=not network;assert all(checks.values())
    page.screenshot(path=str(QA/(name+'.png')),full_page=True)
   except Exception as e:checks['exception']=str(e);checks['traceback']=traceback.format_exc()
   result={'case':name,'browserVersion':b.version,'checks':checks,'errors':errors,'externalRequests':network,'passed':all(v is True for v in checks.values())};results.append(result);print(json.dumps(result),flush=True);b.close()
 (QA/'behavior.json').write_text(json.dumps({'artifactSha256':hashlib.sha256((ROOT/'dist/Cosmic_Atlas_Standalone.html').read_bytes()).hexdigest(),'results':results},indent=2)+'\n')
 return all(x['passed'] for x in results)
if __name__=='__main__':sys.exit(0 if main() else 1)
