"""Pinned Horizons -> offline Hermite asset. Network acquisition is explicit.

Rebuild from saved responses with --offline. Never contacts Horizons at runtime.
"""
import argparse, csv, hashlib, io, json, math, re, time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'data/ephemeris/raw'
START, STOP, CADENCE = 2461041.5, 2461771.5, 0.25
AU_KM = 149597870.7
TARGETS = {'10': 'Sun', '199': 'Mercury center', '299': 'Venus center',
           '399': 'Earth center', '4': 'Mars barycenter', '5': 'Jupiter barycenter',
           '6': 'Saturn barycenter', '7': 'Uranus barycenter', '8': 'Neptune barycenter'}

def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False)+'\n', encoding='utf-8', newline='\n')

def parse_response(payload, target):
    if payload.get('signature', {}).get('version') != '1.2':
        # Actual response API version is pinned independently of documentation.
        raise ValueError('Unexpected Horizons API response version')
    text = payload.get('result', '')
    for token in ['Reference frame : ICRF', 'Output units    : AU-D', 'GEOMETRIC cartesian states',
                  'Solar System Barycenter (0)', '$$SOE', '$$EOE']:
        if token not in text: raise ValueError('Missing Horizons contract: '+token)
    header = text.split('$$SOE')[0]
    if not re.search(r'Target body name:.*\('+re.escape(target)+r'\)', header):
        raise ValueError('Unexpected target')
    if not re.search(r'Start time.* TDB', header): raise ValueError('Expected TDB')
    source = re.search(r'Target body name:.*\{source: ([^}]+)\}', header)
    if not source: raise ValueError('Missing ephemeris version')
    rows = []
    for row in csv.reader(io.StringIO(text.split('$$SOE')[1].split('$$EOE')[0].strip())):
        values = [float(row[0])] + [float(v) for v in row[2:8]]
        if len(values) != 7 or not all(math.isfinite(x) for x in values): raise ValueError('Invalid state')
        rows.append(values)
    return rows, source.group(1)

def hermite(a, b, jd):
    h = b[0]-a[0]; u = (jd-a[0])/h
    p = [(2*u**3-3*u**2+1)*a[k]+(u**3-2*u**2+u)*h*a[k+3]
         +(-2*u**3+3*u**2)*b[k]+(u**3-u**2)*h*b[k+3] for k in range(1,4)]
    v = [((6*u*u-6*u)*a[k]+(3*u*u-4*u+1)*h*a[k+3]
          +(-6*u*u+6*u)*b[k]+(3*u*u-2*u)*h*b[k+3])/h for k in range(1,4)]
    return p, v

def acquire(target, heldout, offline, refresh=False):
    path = RAW / f'{target}-{"midpoints" if heldout else "states"}.json'
    start = START+CADENCE/2 if heldout else START
    stop = STOP-CADENCE/2 if heldout else STOP
    params = dict(format='json', COMMAND=f"'{target}'", CENTER="'500@0'", EPHEM_TYPE="'VECTORS'",
                  START_TIME=f"'JD{start}'", STOP_TIME=f"'JD{stop}'", STEP_SIZE="'6 h'",
                  OUT_UNITS="'AU-D'", REF_SYSTEM="'ICRF'", REF_PLANE="'FRAME'", TIME_TYPE="'TDB'",
                  VEC_TABLE="'2'", CSV_FORMAT="'YES'", VEC_CORR="'NONE'", OBJ_DATA="'NO'")
    query = 'https://ssd.jpl.nasa.gov/api/horizons.api?'+urlencode(params)
    metadata = path.with_suffix('.meta.json')
    if not offline and (refresh or not path.exists() or not metadata.exists()):
        RAW.mkdir(parents=True, exist_ok=True)
        for attempt in range(3):
            try:
                request=Request(query,headers={'User-Agent':'CosmicAtlasScientific/6.0 (+https://github.com/atomicdjt/cosmic-atlas-scientific/issues)'})
                with urlopen(request, timeout=60) as response: raw = response.read()
                parse_response(json.loads(raw), target)
                path.write_bytes(raw)
                write_json(metadata, {'query':query, 'parameters':params,
                                     'retrievedAt':datetime.now(timezone.utc).isoformat(),
                                     'sha256':hashlib.sha256(raw).hexdigest()})
                break
            except Exception:
                if attempt == 2: raise
                time.sleep(2**(attempt+1))
    raw = path.read_bytes(); meta = json.loads(metadata.read_text())
    if meta['query'] != query or meta['sha256'] != hashlib.sha256(raw).hexdigest(): raise ValueError('Raw query/hash mismatch')
    rows, source = parse_response(json.loads(raw), target)
    count = round((stop-start)/CADENCE)+1
    if len(rows) != count or any(abs(row[0]-(start+i*CADENCE))>1e-9 for i,row in enumerate(rows)):
        raise ValueError('Incomplete epoch grid')
    return rows, source, {'file':path.relative_to(ROOT).as_posix(), **meta}

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--offline',action='store_true'); parser.add_argument('--refresh',action='store_true'); args=parser.parse_args()
    if args.offline and args.refresh: parser.error('--offline and --refresh are mutually exclusive')
    bodies={}; validations={}; sources=[]
    for target,label in TARGETS.items():
        print('Horizons '+target+' '+label, flush=True)
        rows,version,meta=acquire(target,False,args.offline,args.refresh)
        refs,refversion,refmeta=acquire(target,True,args.offline,args.refresh)
        if version != refversion: raise ValueError('Mixed source versions')
        maxp=maxv=0
        for i,ref in enumerate(refs):
            p,v=hermite(rows[i],rows[i+1],ref[0])
            maxp=max(maxp,math.dist(p,ref[1:4])*AU_KM)
            maxv=max(maxv,math.dist(v,ref[4:7])*AU_KM/86400)
        if maxp>1 or maxv>0.0001: raise ValueError(f'Interpolation exceeds gate: {maxp} km, {maxv} km/s')
        bodies[target]={'name':label,'sourceVersion':version,'samples':rows}
        validations[target]={'heldoutEpochs':len(refs),'maxPositionErrorKm':maxp,'maxVelocityErrorKmS':maxv}
        sources.extend([meta,refmeta])
    asset={'schema':'cosmic-atlas.ephemeris.v1','source':'NASA/JPL Horizons',
           'sourceUrl':'https://ssd.jpl.nasa.gov/horizons/','frame':'ICRF','origin':'solar-system barycenter',
           'timeScale':'TDB','units':{'position':'AU','velocity':'AU/day'},'validRangeJd':[START,STOP],
           'cadenceDays':CADENCE,'interpolation':'cubic Hermite position and analytic derivative',
           'extrapolation':'refuse','category':'source-derived / interpolated',
           'uncertainty':None,'validation':validations,'bodies':bodies}
    output=ROOT/'data/ephemeris/solar-system-2026-2027.json'; write_json(output,asset)
    write_json(ROOT/'data/ephemeris/manifest.json',{'schema':'cosmic-atlas.ephemeris-provenance.v1',
        'builderVersion':'1.0.0','asset':output.relative_to(ROOT).as_posix(),
        'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'bytes':output.stat().st_size,
        'sources':sources,'validation':validations,'validationScope':'all interval midpoints, not a continuous bound',
        'rights':'NASA/JPL SSD public scientific numeric output; retain attribution; not relicensed as MIT',
        'attributionUrl':'https://ssd.jpl.nasa.gov/about/'})
    print(json.dumps(validations,indent=2))

if __name__=='__main__': main()
