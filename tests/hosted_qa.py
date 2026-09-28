from pathlib import Path
import json,hashlib,urllib.request,os
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];url='https://cosmic-atlas-scientific.vercel.app'
with urllib.request.urlopen(url,timeout=45) as response:body=response.read();status=response.status
result={'url':url,'status':status,'served_sha256':hashlib.sha256(body).hexdigest(),'standalone_sha256':hashlib.sha256((R/'dist/Cosmic_Atlas_Standalone.html').read_bytes()).hexdigest()};result['byte_identical']=result['served_sha256']==result['standalone_sha256']
with sync_playwright() as pw:
 exe=sorted((Path(os.environ['LOCALAPPDATA'])/'ms-playwright').glob('chromium_headless_shell-*/chrome-headless-shell-win64/chrome-headless-shell.exe'))[-1];browser=pw.chromium.launch(executable_path=str(exe),headless=True,args=['--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=browser.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(url);page.evaluate('window.atlasReady');result['loaded_records']=page.evaluate('importedCatalogRecords.length');result['webgl']=page.evaluate('gl.getError()===0');result['errors']=errors;page.screenshot(path=str(R/'qa/v5/hosted.png'));browser.close()
result['passed']=status==200 and result['byte_identical'] and result['loaded_records']==5000 and result['webgl'] and not result['errors'];(R/'qa/v5/hosted.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));raise SystemExit(0 if result['passed'] else 1)
