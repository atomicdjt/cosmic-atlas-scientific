"""Reproducible normalization of saved BSC5/OpenNGC source snapshots."""
import json,csv,sys,hashlib,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from catalog_common import parse_hms_ra,parse_dms_dec,safe_float,write_payload
def main():
 raw=ROOT/'data/raw';out=ROOT/'data/generated';records=[]
 acquisition=json.loads((ROOT/'data/acquisition_manifest.json').read_text(encoding='utf-8'))
 source_times={Path(x['file']).name:x['retrieved_at'] for x in acquisition['sources'] if x.get('status')=='retrieved' and x.get('retrieved_at')}
 def retrieved_at(name):
  if name not in source_times:raise ValueError(f'Missing retrieved_at for {name} in data/acquisition_manifest.json')
  return source_times[name]
 for r in json.loads((raw/'bsc5.json').read_text(encoding='utf-8')):
  try:ra,dec=parse_hms_ra(r['RA']),parse_dms_dec(r['Dec'])
  except (KeyError,ValueError):continue
  hr=str(r['HR']);p=safe_float(r.get('Parallax'))
  records.append({'id':'bsc5-hr-'+hr,'source_id':hr,'name':r.get('Name') or 'HR '+hr,'ra_deg':ra,'dec_deg':dec,'distance_ly':None,'angular_only':True,'tier':'observational','type':'Bright star','vmag':safe_float(r.get('Vmag')),'temperature_k':safe_float(r.get('K')),'spectral_type':r.get('SpectralCls'),'luminosity_class':r.get('LuminosityCls'),'parallax_mas':p*1000 if p is not None else None,'radial_velocity_kms':safe_float(r.get('RadVel')),'raw_source_fields':r,'source':'Yale Bright Star Catalogue 5 (full JSON conversion)','source_ref':'Hoffleit & Warren 1991; HR '+hr,'source_url':'https://heasarc.gsfc.nasa.gov/W3Browse/star-catalog/bsc5p.html','distance_basis':'Angular-only. Legacy parallax lacks a formal uncertainty in this conversion; no inverse distance adopted. Proper-motion values retained in raw upstream fields; no epoch propagation enabled.'})
 write_payload(out/'bsc5.json',records,{'catalog':'BSC5','url':'https://github.com/brettonw/YaleBrightStarCatalog','raw_file':'data/raw/bsc5.json','raw_sha256':hashlib.sha256((raw/'bsc5.json').read_bytes()).hexdigest(),'notes':'All available raw fields preserved. Legacy pmRA/pmDE convention not silently equated with Gaia mu_alpha*. Angular-only even when legacy parallax is positive.'},pipeline_version='5.0.0',generated_at=retrieved_at('bsc5.json'))
 p=out/'openngc.json';data=json.loads(p.read_text(encoding='utf-8'))
 source_rows={x['Name']:x for name in ['NGC.csv','addendum.csv'] for x in csv.DictReader((raw/name).open(encoding='utf-8-sig',newline=''),delimiter=';')}
 for r in data['records']:
  r['raw_source_fields']=source_rows[r['source_id']];r['tier']='observational';r['distance_kind']='angular_only' if r['angular_only'] else 'comoving'
 data['pipeline_version']='5.0.0';data['source']['raw_sources']=['data/raw/NGC.csv','data/raw/addendum.csv'];data['generated_at']=max(retrieved_at('NGC.csv'),retrieved_at('addendum.csv'));p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
 entries=[]
 for p in sorted(out.glob('*.json')):
  d=json.loads(p.read_text(encoding='utf-8'));p.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8',newline='\n');entries.append({'file':str(p.relative_to(ROOT)).replace('\\','/'),'records':len(d['records']),'angular_only':sum(r.get('angular_only',False) for r in d['records']),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size})
 (ROOT/'data/generated_manifest.json').write_text(json.dumps(entries,indent=2)+'\n',encoding='utf-8',newline='\n');print(json.dumps(entries,indent=2))
if __name__=='__main__':main()
