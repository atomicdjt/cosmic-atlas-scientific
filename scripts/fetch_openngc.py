#!/usr/bin/env python3
"""Fetch OpenNGC and normalize records for Cosmic Atlas.

Positive cosmological redshifts above --min-cosmology-z are converted to a
Planck-like flat-LCDM comoving display distance. Other records stay angular-only
unless a future pipeline supplies an independent distance measurement.
"""
from __future__ import annotations
import argparse, csv, io, json
from catalog_common import fetch_bytes, parse_hms_ra, parse_dms_dec, safe_float, comoving_distance_ly, write_payload

BASE='https://raw.githubusercontent.com/mattiaverga/OpenNGC/master/database_files'
REPO='https://github.com/mattiaverga/OpenNGC'
GAL_TYPES={'G','GPair','GTrpl','GGroup','GCl','GPart','G?','QSO'}

def shell_for(t): return 5e7 if t in GAL_TYPES or t.startswith('G') else 1e4

def load(url):
    txt=fetch_bytes(url).decode('utf-8-sig')
    return list(csv.DictReader(io.StringIO(txt),delimiter=';'))

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('-o','--output',default='data/openngc_catalog.json'); ap.add_argument('--min-cosmology-z',type=float,default=0.01); ap.add_argument('--limit',type=int,default=0); ap.add_argument('--base-url',default=BASE); args=ap.parse_args()
    rows=load(args.base_url+'/NGC.csv')+load(args.base_url+'/addendum.csv'); out=[]
    for x in rows:
        try: ra=parse_hms_ra(x.get('RA','')); dec=parse_dms_dec(x.get('Dec',''))
        except Exception: continue
        z=safe_float(x.get('Redshift')); typ=(x.get('Type') or '').strip(); physical = z is not None and z>=args.min_cosmology_z
        dist=comoving_distance_ly(z) if physical else None
        common=(x.get('Common names') or '').split(',')[0].strip(); name=common or (x.get('Name') or '').strip()
        ids='; '.join(q for q in [x.get('M'),x.get('NGC'),x.get('IC'),x.get('Identifiers')] if q)
        rec={
            'id':f"openngc-{x.get('Name')}",'source_id':x.get('Name'),'name':name,'designation':x.get('Name'),'tag':'OpenNGC record','type':typ or 'OpenNGC object',
            'ra_deg':ra,'dec_deg':dec,'distance_ly':dist,'angular_only':not physical,'display_shell_ly':shell_for(typ),
            'redshift':z,'radial_velocity_kms':safe_float(x.get('RadVel')),'vmag':safe_float(x.get('V-Mag')),'bmag':safe_float(x.get('B-Mag')),
            'source':'OpenNGC','source_ref':(x.get('Sources') or 'OpenNGC consolidated source fields'),'source_url':REPO,
            'distance_basis':(f'Flat-LCDM comoving distance derived from catalog redshift z={z}; H0=67.4, Ωm=0.315.' if physical else 'Angular-only: no independent physical distance adopted in this pipeline.'),
            'description':'; '.join(q for q in [ids,common,x.get('Hubble')] if q)
        }
        out.append(rec)
        if args.limit and len(out)>=args.limit: break
    write_payload(args.output,out,{'catalog':'OpenNGC','repository':REPO,'license':'CC-BY-SA-4.0','notes':'OpenNGC consolidates public catalog sources; consult per-record Sources field.'},filters={'min_cosmology_z':args.min_cosmology_z,'limit':args.limit})
    print(json.dumps({'output':args.output,'records':len(out)},indent=2))
if __name__=='__main__': main()
