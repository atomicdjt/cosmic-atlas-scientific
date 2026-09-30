from pathlib import Path
import os,json,hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];result={'scales':[],'errors':[]}
with sync_playwright() as pw:
 candidates=sorted((Path(os.environ.get('LOCALAPPDATA',''))/'ms-playwright').glob('firefox-*/firefox/firefox.exe'));kw={'headless':os.environ.get('COSMIC_ATLAS_FIREFOX_HEADLESS','1')!='0'}
 if candidates:kw['executable_path']=str(candidates[-1])
 browser=pw.firefox.launch(**kw);ctx=browser.new_context(viewport={'width':1280,'height':900},reduced_motion='reduce');page=ctx.new_page();page.on('pageerror',lambda e:result['errors'].append(str(e)));page.goto((R/'dist/Cosmic_Atlas_Standalone.html').as_uri());page.evaluate('window.atlasReady')
 for i in range(6):
  page.locator('.scale-btn').nth(i).click();page.wait_for_timeout(800);result['scales'].append(page.evaluate('({scale:currentScale,name:selectedItem.name,cameraDistance:camera.dist,glError:gl.getError(),motionFinished:!camera.animating})'))
 page.screenshot(path=str(R/'qa/v5/cmb-scale.png'));browser.close()
result['standalone_sha256']=hashlib.sha256((R/'dist/Cosmic_Atlas_Standalone.html').read_bytes()).hexdigest();result['passed']=not result['errors'] and all(x['glError']==0 and x['motionFinished'] for x in result['scales']);(R/'qa/v5/scales.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));raise SystemExit(0 if result['passed'] else 1)
