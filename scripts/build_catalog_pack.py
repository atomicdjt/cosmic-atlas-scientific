"""Create a deterministic HEALPix RING local NDJSON pack from a normalized catalog.

Build dependency only: astropy-healpix. Runtime requires only locally chosen Files.
"""
import argparse, hashlib, json, math
from pathlib import Path

def build_pack(source, output, order=3):
    import astropy_healpix
    import astropy.units as u
    from astropy_healpix import HEALPix
    if not isinstance(order,int) or not 0<=order<=5: raise ValueError('Order must be 0–5')
    source=Path(source); output=Path(output)
    raw=source.read_bytes(); catalog=json.loads(raw); rows=catalog['records']
    if not rows: raise ValueError('Nonempty catalog required')
    hp=HEALPix(nside=2**order, order='ring', frame='icrs')
    bins={}; ids=set()
    for row in rows:
        if not isinstance(row.get('id'),str) or row['id'] in ids: raise ValueError('Unique string IDs required')
        ids.add(row['id']);ra=row.get('ra_deg');dec=row.get('dec_deg')
        if isinstance(ra,bool) or isinstance(dec,bool) or not isinstance(ra,(int,float)) or not isinstance(dec,(int,float)) or not math.isfinite(ra) or not math.isfinite(dec) or not -90<=dec<=90:
            raise ValueError('Finite ICRS degrees required')
        tile=int(hp.lonlat_to_healpix((ra%360)*u.deg,dec*u.deg))
        bins.setdefault(tile,[]).append(row)
    output.mkdir(parents=True,exist_ok=True); tiles=[]
    for tile,records in sorted(bins.items()):
        # Source-preserving rows; each line is bounded independently at runtime.
        records.sort(key=lambda row:row['id'])
        payload=(''.join(json.dumps(row,ensure_ascii=False,separators=(',',':'),allow_nan=False)+'\n' for row in records)).encode()
        lon,lat=hp.healpix_to_lonlat(tile);ra=lon.to_value(u.deg);dec=lat.to_value(u.deg)
        vec=lambda a,d:[math.cos(math.radians(d))*math.cos(math.radians(a)),math.cos(math.radians(d))*math.sin(math.radians(a)),math.sin(math.radians(d))]
        center=vec(ra,dec)
        # Actual source bounding cap, not an assumed pixel radius. Conservative
        # for every catalog row even at HEALPix face boundaries and poles.
        radius=max(math.degrees(math.atan2(math.sqrt(sum(x*x for x in [
            center[1]*v[2]-center[2]*v[1],center[2]*v[0]-center[0]*v[2],center[0]*v[1]-center[1]*v[0]])),sum(a*b for a,b in zip(center,v))))
            for v in (vec(row['ra_deg'],row['dec_deg']) for row in records))+1e-9
        if len(records)>5000 or len(payload)>4*1024*1024: raise ValueError('Tile exceeds browser limits; increase HEALPix order')
        name=f'ring-{order}-{tile}.ndjson';(output/name).write_bytes(payload)
        tiles.append({'id':tile,'file':name,'rowCount':len(records),'bytes':len(payload),
                      'sha256':hashlib.sha256(payload).hexdigest(),'centerRaDeg':float(ra),
                      'centerDecDeg':float(dec),'sourceCapRadiusDeg':min(180,radius)})
    manifest={'schema':'cosmic-atlas.local-pack.v1','id':source.stem+'-ring-'+str(order),
              'frame':'ICRS','scheme':'HEALPix RING','order':order,'nside':2**order,
              'recordCount':len(rows),'sourceSha256':hashlib.sha256(raw).hexdigest(),
              'sourceMetadata':{k:v for k,v in catalog.items() if k!='records'},
              'builder':{'name':'build_catalog_pack','version':'1.0.0','astropyHealpix':astropy_healpix.__version__},
              'category':'source-derived local catalog; runtime trust remains external/unverified',
              'selection':'Inherited source metadata/query; no added scientific quality selection',
              'tiles':tiles}
    (output/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2,allow_nan=False)+'\n',encoding='utf-8',newline='\n')
    return manifest

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('output');p.add_argument('--order',type=int,default=3);a=p.parse_args()
    m=build_pack(a.source,a.output,a.order);print(json.dumps({'rows':m['recordCount'],'tiles':len(m['tiles']),'scheme':m['scheme']}))
