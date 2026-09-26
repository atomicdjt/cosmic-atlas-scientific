#!/usr/bin/env python3
"""Fetch and normalize the Yale Bright Star Catalogue JSON conversion.

BSC5-short supplies sky coordinates, V magnitude, common/Bayer/constellation
labels and approximate temperature, but not a trustworthy physical distance in
this compact conversion. Records are therefore deliberately emitted as
angular-only and rendered by Cosmic Atlas on a non-physical display shell.
"""
from __future__ import annotations
import argparse, json
from catalog_common import fetch_bytes, parse_hms_ra, parse_dms_dec, safe_float, write_payload

URL='https://raw.githubusercontent.com/brettonw/YaleBrightStarCatalog/master/bsc5-short.json'
HEASARC='https://heasarc.gsfc.nasa.gov/W3Browse/star-catalog/bsc5p.html'

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('-o','--output',default='data/bsc5_angular.json'); ap.add_argument('--max-vmag',type=float,default=6.5); ap.add_argument('--limit',type=int,default=0); ap.add_argument('--url',default=URL); args=ap.parse_args()
    src=json.loads(fetch_bytes(args.url).decode('utf-8'))
    recs=[]
    for x in src:
        v=safe_float(x.get('V'))
        if v is None or v>args.max_vmag: continue
        try: ra=parse_hms_ra(x['RA']); dec=parse_dms_dec(x['Dec'])
        except Exception: continue
        hr=str(x.get('HR','')).strip(); name=(x.get('N') or '').strip() or f"HR {hr}"
        label=' '.join(q for q in [(x.get('B') or '').strip(),(x.get('C') or '').strip()] if q)
        recs.append({
            'id':f'bsc5-hr-{hr}','source_id':hr,'name':name,'designation':label or f'HR {hr}','tag':'Bright Star Catalogue',
            'type':'Bright star / angular catalog record','ra_deg':ra,'dec_deg':dec,'distance_ly':None,'angular_only':True,'display_shell_ly':1000,
            'vmag':v,'temperature_k':safe_float(x.get('K')),'source':'Yale Bright Star Catalogue, 5th Revised Ed. (JSON conversion)',
            'source_ref':'Hoffleit & Warren 1991; BSC5 / HR','source_url':HEASARC,
            'distance_basis':'No radial distance in bsc5-short; angular-only display shell, excluded from 3-D measurement.',
            'description':f"BSC5 HR {hr}" + (f"; {label}" if label else '')
        })
        if args.limit and len(recs)>=args.limit: break
    write_payload(args.output,recs,{'catalog':'BSC5','access_url':args.url,'authoritative_reference':HEASARC,'notes':'Angular-only normalization of the compact JSON conversion.'},filters={'max_vmag':args.max_vmag,'limit':args.limit})
    print(json.dumps({'output':args.output,'records':len(recs)},indent=2))
if __name__=='__main__': main()
