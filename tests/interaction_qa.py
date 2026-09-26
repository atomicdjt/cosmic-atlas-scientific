"""Additional visible UI, download, security and non-Gaia integration checks."""
from pathlib import Path
import json,os,hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks={};errors=[]
with sync_playwright() as pw:
 exe=sorted((Path(os.environ['LOCALAPPDATA'])/'ms-playwright').glob('chromium_headless_shell-*/chrome-headless-shell-win64/chrome-headless-shell.exe'))[-1]
 browser=pw.chromium.launch(executable_path=str(exe),headless=True,args=['--use-angle=swiftshader','--enable-unsafe-swiftshader']);ctx=browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True,reduced_motion='reduce');page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto((R/'dist/Cosmic_Atlas_Standalone.html').as_uri());page.evaluate('window.atlasReady')
 page.locator('#data-table-btn').click();checks['visible_table_open']=page.locator('#data-modal-backdrop').evaluate("e=>e.classList.contains('open')");page.locator('#table-next').click();checks['table_paging']='page 2/' in page.locator('#data-modal-summary').inner_text();page.locator('#data-table-body button').first.click();checks['row_inspection']=page.locator('#inspect-name').inner_text()!='Earth & Solar System'
 page.locator('.science-workbench summary').click();page.locator('#filter-source').fill('Gaia');page.wait_for_timeout(300)
 with page.expect_download() as download:page.locator('#export-json-btn').click()
 path=download.value.path();payload=json.loads(Path(path).read_text(encoding='utf-8'));checks['download_json']=len(payload['records'])==5000 and all(x['source']=='Gaia DR3' for x in payload['records'])
 import jsonschema
 jsonschema.Draft202012Validator(json.loads((R/'data/catalog_schema.json').read_text())).validate(payload);checks['export_schema']=True
 page.locator('#filter-source').fill('');page.wait_for_timeout(300)
 page.locator('.science-workbench').screenshot(path=str(R/'qa/v5/scientific-workbench.png'))
 for name,count in [('bsc5.json',9096),('openngc.json',14027)]:
  page.locator('#catalog-file-input').set_input_files(str(R/'data/generated'/name));page.wait_for_function('(n)=>importMetrics.count===n',arg=count,timeout=90000);checks[name+'_import']=True;checks[name+'_angular_safe']=page.evaluate('importedCatalogRecords.filter(x=>x.angularOnly).every(x=>exportRecord(x).distance_ly===null&&spatialSeparationLy(x,CELESTIAL_CATALOG[1])===null)')
 sample={'schema':'cosmic-atlas.catalog.v1','records':[{'id':'attack','name':'<img src=x onerror="window.injected=true">','ra_deg':1,'dec_deg':2,'angular_only':True,'source_url':'javascript:window.injected=true','custom_metadata':{'retained':1}}]}
 page.evaluate('(s)=>importCatalogText(s)',json.dumps(sample));page.locator('#object-search').fill('img');page.wait_for_timeout(100);checks['name_escaped']=page.locator('#search-results img').count()==0;page.evaluate('showInspector(importedCatalogRecords[0])');checks['url_scheme_guard']=page.locator('#prov-links a').count()==0;checks['no_injection']=page.evaluate('window.injected!==true')
 duplicate={'records':sample['records']*2};checks['duplicate_rejected_atomically']=page.evaluate('async s=>{try{await importCatalogText(s);return false;}catch(e){return importedCatalogRecords.length===1&&e.message.includes("Duplicate");}}',json.dumps(duplicate))
 checks['missing_fields_roundtrip']=page.evaluate('exportRecord(importedCatalogRecords[0]).custom_metadata.retained===1')
 page.set_viewport_size({'width':390,'height':844});page.locator('#toggle-inspector-btn').click();checks['mobile_panel']=page.locator('.right-sidebar').evaluate("e=>e.classList.contains('mobile-open')");checks['resize']=page.evaluate('canvas.width>0&&canvas.height>0')
 checks['no_page_errors']=not errors;browser.close()
out={'standalone_sha256':hashlib.sha256((R/'dist/Cosmic_Atlas_Standalone.html').read_bytes()).hexdigest(),'passed':all(checks.values()),'checks':checks,'errors':errors};(R/'qa/v5/interaction.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out));raise SystemExit(0 if out['passed'] else 1)
