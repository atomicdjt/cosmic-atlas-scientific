"""Deterministic, dependency-free build. Original v4 files are never inputs modified here."""
from pathlib import Path
import json,hashlib,re,subprocess
ROOT=Path(__file__).resolve().parents[1]
def write_lf(path,text):
    with Path(path).open('w',encoding='utf-8',newline='\n') as output: output.write(text)
def build():
    names=json.loads((ROOT/'src/modules.json').read_text())
    chunks=[(ROOT/'src'/n).read_text(encoding='utf-8') for n in names]
    version=(ROOT/'VERSION').read_text().strip()
    ephemeris=json.loads((ROOT/'data/ephemeris/solar-system-2026-2027.json').read_text(encoding='utf-8'))
    ephemeris['assetSha256']=hashlib.sha256((ROOT/'data/ephemeris/solar-system-2026-2027.json').read_bytes()).hexdigest()
    ephemeris_json=json.dumps(ephemeris,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    fingerprint=hashlib.sha256(('\n'.join(chunks)+(ROOT/'src/styles/app.css').read_text(encoding='utf-8')+(ROOT/'src/app/shell.html').read_text(encoding='utf-8')+(ROOT/'data/generated/gaia_5k.json').read_text(encoding='utf-8')+version+ephemeris_json).encode()).hexdigest()[:12]
    identity='CA-SCI-'+version+'-'+fingerprint
    js='\n'.join(chunks).replace('{{VERSION}}',version).replace('{{BUILD_ID}}',identity)
    css=(ROOT/'src/styles/app.css').read_text(encoding='utf-8')
    shell=(ROOT/'src/app/shell.html').read_text(encoding='utf-8')
    shell=shell.replace('<script>\n{{JS}}\n</script>','<script type="application/json" id="embedded-ephemeris">'+ephemeris_json+'</script>\n<script>\n{{JS}}\n</script>')
    embedded=ROOT/'data/generated/gaia_5k.json'
    boot=''
    if embedded.exists():
        data=json.dumps(json.loads(embedded.read_text(encoding='utf-8')),ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
        boot='<script type="application/json" id="embedded-gaia">'+data+'</script><script>window.atlasReady=importCatalogText(document.getElementById("embedded-gaia").textContent,"embedded Gaia DR3 5k").catch(e=>{document.getElementById("catalog-import-status").textContent=e.message;throw e;});</script>'
    html=shell.replace('{{CSS}}',css).replace('{{JS}}',js).replace('</body>',boot+'</body>')
    out=ROOT/'dist';out.mkdir(exist_ok=True)
    (out/'Cosmic_Atlas_Standalone.html').write_text(html,encoding='utf-8',newline='\n')
    # Modular development edition uses ordered classic scripts to retain v4 lexical semantics.
    dev=shell.replace('<style>\n{{CSS}}\n</style>','<link rel="stylesheet" href="../src/styles/app.css">').replace('<script>\n{{JS}}\n</script>','\n'.join('<script src="../src/'+n+'"></script>' for n in names))
    dev=dev.replace('<body>', '<body><script>window.atlasBuildIdentity='+json.dumps({'version':version,'buildId':identity})+';</script>')
    (out/'development.html').write_text(dev.replace('</body>',boot+'</body>'),encoding='utf-8',newline='\n')
    temp=ROOT/'qa/v5/syntax.tmp';temp.write_text(js,encoding='utf-8')
    # Node requires a JS extension on Windows.
    check=out/'syntax-check.js';check.write_text(js,encoding='utf-8')
    p=subprocess.run(['node','--check',str(check)],capture_output=True,text=True);check.unlink();temp.unlink()
    ids=re.findall(r'\bid=["\']([^"\']+)["\']',html)
    refs=re.findall(r'getElementById\(["\']([^"\']+)["\']\)',html)
    errors=[]
    if p.returncode: errors.append(p.stderr)
    if len(ids)!=len(set(ids)): errors.append('duplicate DOM ids')
    if set(refs)-set(ids): errors.append('unresolved DOM ids: '+str(set(refs)-set(ids)))
    for pattern in [r'<script[^>]+src=',r'<link[^>]+stylesheet',r'\bfetch\s*\(',r'Math\.random\s*\(',r'\bXMLHttpRequest\b',r'\bWebSocket\b',r'\bEventSource\b',r'\bsendBeacon\s*\(',r'\bimportScripts\s*\(',r'@import\s',r'url\(["\']?https?']:
        if re.search(pattern,html,re.I): errors.append('offline/determinism violation: '+pattern)
    result={'version':version,'buildId':identity,'modules':len(names),'bytes':len(html.encode()),'sha256':hashlib.sha256(html.encode()).hexdigest(),'errors':errors,'passed':not errors}
    write_lf(ROOT/'qa/v5/build.json',json.dumps(result,indent=2)+'\n')
    print(json.dumps(result));return result
if __name__=='__main__': raise SystemExit(0 if build()['passed'] else 1)
