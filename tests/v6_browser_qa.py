"""Offline browser regressions/measurements for scientific workers and local packs."""
import argparse, hashlib, json, os, platform, sys, time, traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from build_catalog_pack import build_pack

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--pack',default=str(ROOT.parent/'gaia-50k-pack'));args=parser.parse_args()
    pack=Path(args.pack)
    if not (pack/'manifest.json').exists():build_pack(ROOT/'data/generated/gaia_50k.json',pack,3)
    manifest=json.loads((pack/'manifest.json').read_text(encoding='utf-8'))
    results=[]
    with sync_playwright() as pw:
        for name,engine,viewport in [('chromium','chromium',{'width':1440,'height':1000}),('firefox','firefox',{'width':1440,'height':1000}),('mobile','chromium',{'width':390,'height':844})]:
            kwargs={'headless':engine!='firefox' or os.environ.get('COSMIC_ATLAS_FIREFOX_HEADLESS','1')!='0'};cache=Path(os.environ.get('LOCALAPPDATA',''))/'ms-playwright'
            if not Path(getattr(pw,engine).executable_path).exists():
                candidates=sorted(cache.glob('chromium_headless_shell-*/chrome-headless-shell-win64/chrome-headless-shell.exe' if engine=='chromium' else 'firefox-*/firefox/firefox.exe'))
                if candidates:kwargs['executable_path']=str(candidates[-1])
            if engine=='chromium':kwargs['args']=['--use-angle=swiftshader','--enable-unsafe-swiftshader']
            browser=getattr(pw,engine).launch(**kwargs);ctx=browser.new_context(viewport=viewport,reduced_motion='reduce');ctx.set_offline(True)
            page=ctx.new_page();errors=[];network=[];checks={};metrics={}
            page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:network.append(r.url) if r.url.startswith(('http:','https:')) else None)
            def check(label,code):
                checks[label]=page.evaluate(code);assert checks[label],label;print(name+' PASS '+label,flush=True)
            try:
                start=time.perf_counter();page.goto((ROOT/'dist/Cosmic_Atlas_Standalone.html').as_uri());page.evaluate('window.atlasReady');metrics['embeddedStartupMs']=(time.perf_counter()-start)*1000
                page.evaluate('simSpeed=0');page.locator('#scientific-workspace-btn').click()
                check('workspace_accessibility',"scientificWorkspace.open && scientificWorkspace.matches(':modal') && document.activeElement.id==='platform-close'")
                page.locator('#eph-query').click();check('ephemeris_visible_provenance',"platformEphemerisResult.frame==='ICRF' && platformEphemerisResult.timeScale==='TDB' && platformEphemerisResult.provenance.assetSha256.length===64")
                check('range_refusal',"(()=>{try{ephemerisState(embeddedEphemeris(),'399',2460000);return false}catch(e){return e instanceof RangeError}})()")
                with page.expect_download() as download:page.locator('#eph-export').click()
                exported=json.loads(Path(download.value.path()).read_text(encoding='utf-8'));checks['state_export']=exported['provenance']['sourceVersion']=='DE441'
                import jsonschema
                jsonschema.validate(exported['scientificMetadata'],json.loads((ROOT/'data/scientific_result_schema.json').read_text(encoding='utf-8')));assert checks['state_export']
                page.locator('[data-platform="simulation"]').click();page.locator('#sim-seed').click();start=time.perf_counter();page.locator('#sim-propagate').click()
                page.wait_for_function("platformSimulationResult?.state.steps===360",timeout=60000)
                metrics['simulation360WallMs']=(time.perf_counter()-start)*1000
                check('simulation_worker_quality',"platformSimulationResult.quality.durationDays===90 && platformSimulationResult.state.category==='numerically integrated model' && Number.isFinite(platformSimulationResult.quality.angularMomentumRelativeDrift)")
                check('simulation_cancellation',"""async()=>{const controller=new AbortController(),prior=platformSimulationResult;const p=runScientificJob('simulation',{state:prior.state,durationDays:500},{signal:controller.signal});controller.abort();try{await p;return false}catch(e){return e.name==='AbortError' && platformSimulationResult===prior}}""")
                metrics.update(page.evaluate("""async()=>{const start=performance.now();const result=await runScientificJob('simulation',{state:platformSimulationResult.state,durationDays:1000});return {simulation4000WorkerWallMs:performance.now()-start,simulation4000EnergyRelativeDrift:result.quality.energyRelativeDrift};}"""))
                page.locator('[data-platform="missions"]').click();page.locator('#lambert-solve').click()
                check('lambert_visible_result',"platformMissionResult.c3Km2S2>=0 && platformMissionResult.transfer.revolutions===0")
                start=time.perf_counter();page.locator('#grid-run').click();page.wait_for_function('platformGridResult!==null',timeout=60000);metrics['grid625WallMs']=(time.perf_counter()-start)*1000
                check('grid_transferable_and_missing_cells',"platformGridResult.grid instanceof Float64Array && platformGridResult.grid.length===2500 && platformGridResult.failures.every(f=>Number.isNaN(platformGridResult.grid[f.index*4+2]))")
                check('grid_cancellation',"""async()=>{const c=new AbortController();const p=runScientificJob('mission-grid',{asset:embeddedEphemeris(),departure:'399',arrival:'4',departures:Array(64).fill(2461131.5),durations:Array(64).fill(250)},{signal:c.signal});c.abort();try{await p;return false}catch(e){return e.name==='AbortError'}}""")
                metrics.update(page.evaluate("""()=>{const a=embeddedEphemeris();let t=performance.now();for(let i=0;i<10000;i++)ephemerisState(a,'399',2461041.5+(i%2000)/4,'10');const ephemeris10000Ms=performance.now()-t;t=performance.now();for(let i=0;i<1000;i++)missionFromEphemeris(a,'399','4',2461131.5,2461381.5);const lambert1000Ms=performance.now()-t;return {ephemeris10000Ms,lambert1000Ms};}"""))
                page.locator('[data-platform="packs"]').click()
                page.locator('#pack-files').set_input_files([str(pack/'manifest.json')]+[str(pack/t['file']) for t in manifest['tiles']])
                page.wait_for_function('activeLocalPack!==null',timeout=60000)
                start=time.perf_counter();page.locator('#pack-load').click();page.wait_for_function("document.getElementById('pack-output').textContent.includes('Verified cone published')",timeout=120000);metrics['pack50kConeWallMs']=(time.perf_counter()-start)*1000
                metrics['pack']=page.evaluate('({sourceRows:activeLocalPack.manifest.recordCount,manifestTiles:activeLocalPack.manifest.tiles.length,cachedRows:activeLocalPack.cachedRows,cachedBytes:activeLocalPack.cachedBytes,publishedRows:importedCatalogRecords.length})')
                check('pack_trust_and_budgets',"activeLocalPack.cachedRows<=20000 && activeLocalPack.cachedBytes<=32*1024*1024 && importedCatalogRecords.every(r=>r.dataClass==='external' && !physicalMeasurementAllowed(r))")
                check('pack_source_preservation',"importedSourceMetadata.localPack.scheme==='HEALPix RING' && importedSourceMetadata.localPack.complete && exportRecord(importedCatalogRecords[0]).raw_source_fields!==undefined")
                check('pack_cone_matches_source_directions',"importedCatalogRecords.every(r=>angularSeparationDeg({ra:r.sourceRa,dec:r.sourceDec},{ra:100,dec:0})<=15)")
                check('overbudget_cone_refused_without_publication',"""async()=>{const old=importedCatalogRecords;try{await activeLocalPack.selectCone(0,0,180);return false}catch(e){return e.message.includes('budget') && old===importedCatalogRecords}}""")
                check('bad_hash_rejected',"""async()=>{const tile=activeLocalPack.manifest.tiles[0];try{await readLocalTile(activeLocalPack.files.get(tile.file),{...tile,sha256:'0'.repeat(64)},new AbortController().signal);return false}catch(e){return e.message.includes('SHA-256')}}""")
                check('streaming_reader_cancellation',"""async()=>{const tile=activeLocalPack.manifest.tiles[0],c=new AbortController();const p=readLocalTile(activeLocalPack.files.get(tile.file),tile,c.signal);c.abort();try{await p;return false}catch(e){return e.name==='AbortError'}}""")
                check('cache_eviction',"""async()=>{const before=new Set(activeLocalPack.cache.keys());await activeLocalPack.selectCone(280,30,5);return [...activeLocalPack.cache.keys()].some(k=>!before.has(k)) && activeLocalPack.cachedRows<=20000 && activeLocalPack.cachedBytes<=32*1024*1024}""")
                page.locator('#platform-close').click();check('workspace_focus_restore',"!scientificWorkspace.open && document.activeElement.id==='scientific-workspace-btn'")
                checks['offline_no_network']=not network;checks['no_page_errors']=not errors;assert checks['offline_no_network'] and checks['no_page_errors']
                page.screenshot(path=str(ROOT/f'qa/v6/{name}-atlas.png'),full_page=True)
                page.locator('#scientific-workspace-btn').click();page.locator('[data-platform="ephemeris"]').click();page.screenshot(path=str(ROOT/f'qa/v6/{name}-workspace.png'),full_page=True)
            except Exception:checks['exception']=traceback.format_exc();print(checks['exception'],flush=True)
            result={'case':name,'browserVersion':browser.version,'checks':checks,'metrics':metrics,'pageErrors':errors,'externalRequests':network,
                    'passed':bool(checks) and all(v is True for v in checks.values())};results.append(result);browser.close()
    report={'platform':platform.platform(),'artifactSha256':hashlib.sha256((ROOT/'dist/Cosmic_Atlas_Standalone.html').read_bytes()).hexdigest(),
            'packSourceSha256':manifest['sourceSha256'],'results':results,'passed':all(r['passed'] for r in results),
            'conditions':'Offline file://; Chromium SwiftShader; reduced motion; single samples, no thermal/device/heap certification'}
    (ROOT/'qa/v6/browser.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n');print(json.dumps(report));return report['passed']
if __name__=='__main__':sys.exit(0 if main() else 1)
