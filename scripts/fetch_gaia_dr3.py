#!/usr/bin/env python3
"""Fetch an import-ready Gaia DR3 subset through ESA's TAP sync endpoint.

Example:
  python scripts/fetch_gaia_dr3.py --limit 20000 --max-g 12 --min-parallax-snr 10 -o data/gaia_dr3_subset.json

For inverse-parallax display distances this script defaults to a high S/N cut.
For precision distance inference, replace the inverse-parallax policy with an
appropriate probabilistic distance catalogue/model.
"""
from __future__ import annotations
import argparse, csv, io, json, urllib.parse, urllib.request
from catalog_common import inverse_parallax_distance_ly, safe_float, write_payload

ENDPOINT = "https://gea.esac.esa.int/tap-server/tap/sync"
DOC_URL = "https://gea.esac.esa.int/archive/documentation/GDR3/Gaia_archive/chap_datamodel/sec_dm_main_source_catalogue/ssec_dm_gaia_source.html"


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('-o','--output',default='data/gaia_dr3_subset.json')
    ap.add_argument('--limit',type=int,default=20000)
    ap.add_argument('--max-g',type=float,default=12.0)
    ap.add_argument('--min-parallax-snr',type=float,default=10.0)
    ap.add_argument('--endpoint',default=ENDPOINT)
    args=ap.parse_args()
    n=max(1,min(args.limit,200000))
    q=f"""SELECT TOP {n}
source_id, designation, ra, dec, parallax, parallax_error, pmra, pmdec,
radial_velocity, radial_velocity_error, phot_g_mean_mag, bp_rp, ruwe
FROM gaiadr3.gaia_source
WHERE parallax > 0
AND parallax_error > 0
AND parallax/parallax_error >= {args.min_parallax_snr}
AND phot_g_mean_mag <= {args.max_g}
ORDER BY phot_g_mean_mag ASC"""
    body=urllib.parse.urlencode({'REQUEST':'doQuery','LANG':'ADQL','FORMAT':'csv','QUERY':q}).encode()
    req=urllib.request.Request(args.endpoint,data=body,headers={'User-Agent':'CosmicAtlasDataPipeline/4.0'})
    with urllib.request.urlopen(req,timeout=180) as resp:
        text=resp.read().decode('utf-8-sig')
    rows=csv.DictReader(io.StringIO(text)); out=[]
    for row in rows:
        p=safe_float(row.get('parallax')); pe=safe_float(row.get('parallax_error'))
        d=inverse_parallax_distance_ly(p) if p else None
        if not d: continue
        sid=str(row['source_id'])
        out.append({
            'id':f'gaia-dr3-{sid}','source_id':sid,'designation':row.get('designation') or f'Gaia DR3 {sid}',
            'name':row.get('designation') or f'Gaia DR3 {sid}','tag':'Gaia DR3 source','type':'Gaia DR3 stellar/source record',
            'ra_deg':float(row['ra']),'dec_deg':float(row['dec']),'distance_ly':d,'angular_only':False,
            'distance_uncertainty':f"inverse parallax; π={p}±{pe} mas; S/N={(p/pe):.1f}",
            'parallax_mas':p,'parallax_error_mas':pe,'pmra_masyr':safe_float(row.get('pmra')),'pmdec_masyr':safe_float(row.get('pmdec')),
            'radial_velocity_kms':safe_float(row.get('radial_velocity')),'radial_velocity_error_kms':safe_float(row.get('radial_velocity_error')),
            'phot_g_mean_mag':safe_float(row.get('phot_g_mean_mag')),'bp_rp':safe_float(row.get('bp_rp')),'ruwe':safe_float(row.get('ruwe')),
            'source':'Gaia DR3 / ESA Gaia Archive','source_ref':'Gaia Collaboration et al. 2023; gaiadr3.gaia_source',
            'source_url':DOC_URL,'distance_basis':'Direct inverse-parallax display distance after configured parallax S/N cut.'
        })
    write_payload(args.output,out,{
        'catalog':'Gaia DR3','access':'ESA Gaia Archive TAP','endpoint':args.endpoint,'documentation':DOC_URL,
        'query_adql':q,'notes':'Use required Gaia/DPAC acknowledgement and citations when redistributing derived products.'
    }, filters={'max_g':args.max_g,'min_parallax_snr':args.min_parallax_snr,'limit':n})
    print(json.dumps({'output':args.output,'records':len(out)},indent=2))
if __name__=='__main__': main()
