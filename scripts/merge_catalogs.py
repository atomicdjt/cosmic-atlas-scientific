#!/usr/bin/env python3
"""Merge one or more cosmic-atlas.catalog.v1 JSON files with deterministic de-duplication."""
from __future__ import annotations
import argparse, json
from pathlib import Path
from catalog_common import SCHEMA, validate_record, write_payload

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('inputs',nargs='+'); ap.add_argument('-o','--output',default='data/merged_catalog.json'); args=ap.parse_args()
    seen={}; rejected=[]
    for fn in args.inputs:
        p=json.loads(Path(fn).read_text(encoding='utf-8')); rows=p if isinstance(p,list) else p.get('records',[])
        for r in rows:
            problems=validate_record(r)
            if problems: rejected.append({'id':r.get('id'),'file':fn,'problems':problems}); continue
            seen.setdefault(str(r['id']),r)
    records=list(seen.values())
    write_payload(args.output,records,{'catalog':'Merged Cosmic Atlas catalog','inputs':args.inputs},rejected_count=len(rejected),rejected_examples=rejected[:50])
    print(json.dumps({'output':args.output,'records':len(records),'rejected':len(rejected)},indent=2))
if __name__=='__main__': main()
