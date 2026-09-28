"""Browser QA of this local application only. No external site automation."""
import json,time,sys,traceback,os,hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];QA=ROOT/'qa/v5';QA.mkdir(exist_ok=True)
def main():
 results=[]
 with sync_playwright() as pw:
  cases=[('chromium-desktop','chromium',{'viewport':{'width':1440,'height':1000}},'Cosmic_Atlas_Standalone.html'),('chromium-mobile','chromium',{'viewport':{'width':390,'height':844},'device_scale_factor':2,'is_mobile':True,'has_touch':True,'reduced_motion':'reduce'},'Cosmic_Atlas_Standalone.html'),('chromium-development','chromium',{'viewport':{'width':1440,'height':1000}},'development.html'),('firefox-desktop','firefox',{'viewport':{'width':1440,'height':1000}},'Cosmic_Atlas_Standalone.html')]
  for name,engine,options,filename in cases:
   print('START '+name,flush=True)
   result={'case':name,'artifact_sha256':hashlib.sha256((ROOT/'dist'/filename).read_bytes()).hexdigest(),'checks':{},'errors':[]};browser=None
   try:
    kwargs={'headless':True}
    cache=Path(os.environ.get('LOCALAPPDATA',''))/'ms-playwright'
    if not Path(getattr(pw,engine).executable_path).exists():
     candidates=list(cache.glob('chromium_headless_shell-*/chrome-headless-shell-win64/chrome-headless-shell.exe' if engine=='chromium' else 'firefox-*/firefox/firefox.exe'))
     if candidates:kwargs['executable_path']=str(sorted(candidates)[-1])
    if engine=='chromium':kwargs['args']=['--use-angle=swiftshader','--enable-unsafe-swiftshader']
    browser=getattr(pw,engine).launch(**kwargs);result['browser_version']=browser.version;context=browser.new_context(**options);context.set_offline(True);page=context.new_page();page.on('pageerror',lambda e:result['errors'].append(str(e)))
    network=[];page.on('request',lambda r:network.append(r.url) if r.url.startswith(('http:','https:')) else None)
    t=time.perf_counter();page.goto((ROOT/'dist'/filename).as_uri());page.evaluate('window.atlasReady');page.wait_for_timeout(1000);result['startup_ms']=(time.perf_counter()-t)*1000
    result['checks']['webgl']=page.evaluate('typeof gl!=="undefined" && !!gl && gl.getError()===0');result['renderer']=page.evaluate('gl.getParameter(gl.RENDERER)');result['checks']['programs']=page.evaluate('[particleProg,lineProg,cmbProg].every(p=>gl.getProgramParameter(p,gl.LINK_STATUS))')
    result['checks']['workbench']=page.locator('.science-workbench').count()==1
    assert result['checks']['workbench'],'Application bootstrap incomplete'
    result['checks']['import_trust_boundary']=page.evaluate('''async()=>{
      await importCatalogText(JSON.stringify({records:[
        {id:"untrusted-tier",ra_deg:12,dec_deg:34,distance_ly:42,tier:"observational",measurement_eligible:true,color:{invalid:true}},
        {id:"untrusted-zero",ra_deg:0,dec_deg:0,distance_ly:0,tier:"reference"}
      ]}),"import trust fixture");
      const item=importedCatalogRecords[0], reference=importedCatalogRecords[1], exported=exportRecord(item), rgb=hexToRgb(item.color);
      return item.dataClass==="external" && item.measurementEligible===false &&
        !physicalMeasurementAllowed(item) && exported.tier==="external" &&
        exported.measurement_eligible===false &&
        exported.source_claims.tier==="observational" &&
        exported.source_claims.measurement_eligible===true && rgb.every(Number.isFinite) &&
        reference.dataClass==="external" && reference.angularOnly &&
        !physicalMeasurementAllowed(reference);
    }''')
    result['checks']['failed_import_is_atomic']=page.evaluate('''async()=>{
      const oldRecords=importedCatalogRecords, oldBundle=importedCatalogBundle, oldSource=importedSourceMetadata;
      const oldBuilder=window.buildBufferBundle;
      window.buildBufferBundle=()=>{throw new Error("simulated buffer allocation failure")};
      try { await importCatalogText(JSON.stringify({source:"failed replacement",records:[{id:"replacement",ra_deg:1,dec_deg:2}]}),"atomicity fixture"); }
      catch(e) {}
      finally { window.buildBufferBundle=oldBuilder; }
      return importedCatalogRecords===oldRecords && importedCatalogBundle===oldBundle && importedSourceMetadata===oldSource;
    }''')
    print('BOOTSTRAP '+name+str(result),flush=True)
    result['datasets']=[]
    tiers=['gaia_5k.json','gaia_20k.json','gaia_50k.json'] if name in ['chromium-desktop','firefox-desktop'] else (['gaia_5k.json','gaia_50k.json'] if name=='chromium-mobile' else ['gaia_5k.json'])
    for tier in tiers:
     f=ROOT/'data/generated'/tier
     if not f.exists():continue
     print('IMPORT '+tier,flush=True)
     expected=json.loads(f.read_text(encoding='utf-8'))['record_count'];page.evaluate('importMetrics.count=0');page.locator('#catalog-file-input').set_input_files(str(f));page.wait_for_function('(n)=>importMetrics.count===n',arg=expected,timeout=90000);metrics=page.evaluate('({...importMetrics})');page.evaluate('frameDurations.length=0');page.wait_for_timeout(2000)
     perf=page.evaluate('''()=>{const t=performance.now();const filtered=importedCatalogRecords.filter(x=>matchesCatalogFilter(x,{...catalogFilter,snrMin:20}));const filterMs=performance.now()-t;const p=performance.now();pickAt(500,400);const pickMs=performance.now()-p;const q=performance.now();pickAt(501,400);const cachedPickMs=performance.now()-q;const ds=frameDurations.slice(-60).filter(x=>x>0);return {filterMs,pickMs,cachedPickMs,meanFPS:1000/(ds.reduce((a,b)=>a+b,0)/ds.length),worstFrameMs:Math.max(...ds),heapBytes:performance.memory?.usedJSHeapSize??null,plottedCMD:cmdPoints.length};}''')
     result['datasets'].append({'tier':tier,**metrics,**perf})
    result['checks']['metadata_roundtrip']=page.evaluate('JSON.stringify(exportRecord(importedCatalogRecords[0]).raw_source_fields)===JSON.stringify(importedCatalogRecords[0].raw.raw_source_fields)')
    result['checks']['epoch']=page.evaluate('''()=>{const x=importedCatalogRecords.find(x=>Number.isFinite(x.pmra)&&x.pmra!==0),a=x.ra;setDisplayEpoch(2036);const changed=x.ra!==a;const sourcePreserved=exportRecord(x).ra_deg===x.raw.ra_deg;setDisplayEpoch(null);return changed&&sourcePreserved&&x.ra===a;}''')
    page.locator('#object-search').fill('Gaia');page.wait_for_timeout(150);result['checks']['search']=page.locator('.search-item').count()>0;page.locator('#object-search').fill('')
    result['checks']['filter']=page.evaluate('''()=>{document.getElementById('filter-source').value='Gaia';document.getElementById('filter-snrMin').value='20';applyScientificFilters();const ok=visibleScientificRecords().every(x=>x.parallaxSnr>=20 && x.source.includes('Gaia'));document.getElementById('filter-source').value='';document.getElementById('filter-snrMin').value='';applyScientificFilters();return ok;}''')
    result['checks']['table']=page.evaluate('populateDataTable(""); document.querySelectorAll("#data-table-body tr").length===100')
    result['checks']['measurement']=page.evaluate('spatialSeparationLy({ra:0,dec:0,distLy:10,angularOnly:true},{ra:1,dec:0,distLy:10})===null')
    result['checks']['tour']=page.evaluate('showTourStep(0); document.getElementById("tour-panel").classList.contains("open")');page.evaluate('document.getElementById("tour-panel").classList.remove("open")')
    result['checks']['no_external_network']=not network;result['external_requests']=network
    page.screenshot(path=str(QA/(name+'.png')),full_page=True)
    result['checks']['no_page_errors']=not result['errors'];result['passed']=all(result['checks'].values())
   except Exception as e:result['passed']=False;result['exception']=str(e);result['traceback']=traceback.format_exc()
   finally:
    if browser:browser.close()
   results.append(result);(QA/'browser.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(result),flush=True)
 return all(r['passed'] for r in results)
if __name__=='__main__':sys.exit(0 if main() else 1)
