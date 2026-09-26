#!/usr/bin/env python3
"""Run release QA and write qa/validation_results.json."""
from __future__ import annotations
import json, subprocess, sys
from datetime import datetime, timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def run(cmd):
    p=subprocess.run(cmd,cwd=ROOT,capture_output=True,text=True)
    return {'command':' '.join(cmd),'returncode':p.returncode,'stdout':p.stdout.strip(),'stderr':p.stderr.strip()}

def main():
    steps=[
      run([sys.executable,'scripts/build_standalone.py']),
      run([sys.executable,'scripts/validate_catalog.py','data/example_import_catalog.json']),
      run([sys.executable,'-m','unittest','discover','-s','tests','-v']),
      run([sys.executable,'-m','py_compile','scripts/catalog_common.py','scripts/fetch_gaia_dr3.py','scripts/fetch_bsc5.py','scripts/fetch_openngc.py','scripts/merge_catalogs.py','scripts/validate_catalog.py','scripts/build_standalone.py'])
    ]
    ok=all(s['returncode']==0 for s in steps)
    manifest=json.loads((ROOT/'qa/build_manifest.json').read_text()) if (ROOT/'qa/build_manifest.json').exists() else None
    out={'release':'4.0.0','build_id':'CA-SCI-4.0-2026-09-26','generated_at':datetime.now(timezone.utc).replace(microsecond=0).isoformat(),'passed':ok,'build_manifest':manifest,'steps':steps,'browser_smoke':{'status':'environment-blocked','detail':'Container Chromium could not initialize a usable GL/ANGLE backend; see qa/chromium.log. This is not counted as a passed runtime GPU test.'}}
    (ROOT/'qa/validation_results.json').write_text(json.dumps(out,indent=2)+'\n')
    print(json.dumps({'passed':ok,'steps':[(s['command'],s['returncode']) for s in steps]},indent=2))
    raise SystemExit(0 if ok else 1)
if __name__=='__main__': main()
