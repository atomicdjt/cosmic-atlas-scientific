import json,time,os,argparse,hashlib,platform
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--label',required=True);p.add_argument('--output',required=True);p.add_argument('--artifact',default=str(ROOT/"dist/Cosmic_Atlas_Standalone.html"));a=p.parse_args();artifact=Path(a.artifact).resolve()
results=[]
with sync_playwright() as pw:
 for engine in ['chromium','firefox']:
  cache=Path(os.environ['LOCALAPPDATA'])/'ms-playwright'
  candidates=sorted(cache.glob('chromium_headless_shell-*/chrome-headless-shell-win64/chrome-headless-shell.exe' if engine=='chromium' else 'firefox-*/firefox/firefox.exe'))
  kw={'headless':True}
  if candidates:kw['executable_path']=str(candidates[-1])
  if engine=='chromium':kw['args']=['--use-angle=swiftshader','--enable-unsafe-swiftshader']
  b=getattr(pw,engine).launch(**kw)
  for tier in [5,20,50]:
   ctx=b.new_context(viewport={'width':1440,'height':1000},device_scale_factor=1,reduced_motion='reduce');page=ctx.new_page();errors=[];net=[]
   page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:net.append(r.url) if r.url.startswith(('http:','https:')) else None)
   start=time.perf_counter();page.goto(artifact.as_uri());page.evaluate('window.atlasReady');startup=(time.perf_counter()-start)*1000
   page.evaluate('simSpeed=0')
   page.evaluate('window.jitter=[];window.tick=performance.now();window.probe=setInterval(()=>{const n=performance.now();jitter.push(n-tick);tick=n},20)')
   page.locator('#catalog-file-input').set_input_files(str(ROOT/f'data/generated/gaia_{tier}k.json'))
   page.wait_for_function('(n)=>importMetrics.count===n',arg=tier*1000,timeout=180000)
   import_jitter=page.evaluate('clearInterval(probe);({maxTimerGapMs:Math.max(...jitter),timerSamples:jitter.length})')
   page.wait_for_timeout(500)
   metrics=page.evaluate('''()=>{const rendererInfo=gl.getExtension('WEBGL_debug_renderer_info'); const out={...importMetrics,renderer:rendererInfo?gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)}; let t=performance.now();pickSignature='';pickAt(500,400);out.firstPickMs=performance.now()-t;t=performance.now();pickAt(501,400);out.cachedPickMs=performance.now()-t;t=performance.now();document.getElementById('filter-snrMin').value='20';applyScientificFilters();out.filterInteractionMs=performance.now()-t;t=performance.now();populateDataTable('');out.firstOpenTableMs=performance.now()-t;t=performance.now();populateDataTable('');out.tableMs=performance.now()-t;out.heapBytes=performance.memory?.usedJSHeapSize??null;out.renderDetail=typeof denseRenderDetail==='undefined'?null:{...denseRenderDetail};return out;}''')
   page.wait_for_timeout(1000)
   page.evaluate('frameDurations.length=0')
   page.wait_for_timeout(4000)
   frames=page.evaluate('''()=>{const v=frameDurations.filter(x=>x>0).sort((a,b)=>a-b);const q=p=>v[Math.min(v.length-1,Math.floor((v.length-1)*p))];return {samples:v.length,p50:q(.5),p95:q(.95),p99:q(.99),max:v.at(-1),mean:v.reduce((a,b)=>a+b,0)/v.length,stallsOver100ms:v.filter(x=>x>100).length};}''')
   r={'label':a.label,'engine':engine,'browserVersion':b.version,'tier':tier,'startupMs':startup,**metrics,'importResponsiveness':import_jitter,'frames':frames,'errors':errors,'externalRequests':net};results.append(r);Path(a.output).write_text(json.dumps({'partial':True,'results':results},indent=2));print(json.dumps(r),flush=True);ctx.close()
  b.close()
Path(a.output).write_text(json.dumps({'platform':platform.platform(),'viewport':'1440x1000 DPR1; reduced motion; fixed initial camera; 1s settle then 4s frames after S/N20 filter; 20ms timer during import','standaloneSha256':hashlib.sha256(artifact.read_bytes()).hexdigest(),'results':results},indent=2)+'\n')
