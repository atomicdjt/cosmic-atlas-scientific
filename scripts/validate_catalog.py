#!/usr/bin/env python3
"""Validate normalized catalog JSON without third-party packages."""
from __future__ import annotations
import argparse, json
from pathlib import Path
from catalog_common import validate_record

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('catalog'); args=ap.parse_args()
    p=json.loads(Path(args.catalog).read_text(encoding='utf-8')); rows=p if isinstance(p,list) else p.get('records',[])
    ids=set(); errors=[]; angular=physical=0
    for i,r in enumerate(rows):
        probs=validate_record(r)
        rid=str(r.get('id',''))
        if rid in ids: probs.append('duplicate id')
        ids.add(rid)
        angular += int(bool(r.get('angular_only'))); physical += int(r.get('distance_ly') not in (None,''))
        if probs: errors.append({'index':i,'id':rid,'problems':probs})
    report={'catalog':args.catalog,'records':len(rows),'physical_distance_records':physical,'angular_only_records':angular,'errors':len(errors),'error_examples':errors[:50]}
    print(json.dumps(report,indent=2))
    raise SystemExit(1 if errors else 0)
if __name__=='__main__': main()
