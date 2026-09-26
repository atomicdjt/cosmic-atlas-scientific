"""Acquire exact upstream bytes, then run the existing ingestion paths against local snapshots."""
from pathlib import Path
import urllib.request,urllib.parse,json,hashlib,sys,subprocess,time,traceback
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from catalog_common import safe_float,write_payload,LY_PER_PC
def main():
    raw=ROOT/'data/raw';raw.mkdir(exist_ok=True);out=ROOT/'data/generated';out.mkdir(exist_ok=True)
    manifest={'pipeline_version':'5.0.0','retrieved_at':datetime.now(timezone.utc).isoformat(),'sources':[]}
    fields='source_id, designation, ra, dec, ra_error, dec_error, parallax, parallax_error, pmra, pmdec, pmra_error, pmdec_error, radial_velocity, radial_velocity_error, phot_g_mean_mag, phot_bp_mean_mag, phot_rp_mean_mag, bp_rp, ruwe, ref_epoch, astrometric_params_solved, visibility_periods_used'
    q=f'SELECT TOP 50000 {fields} FROM gaiadr3.gaia_source WHERE parallax > 0 AND parallax_error > 0 AND parallax_over_error >= 10 AND phot_g_mean_mag <= 15 AND ruwe < 1.4 ORDER BY phot_g_mean_mag ASC, source_id ASC'
    (raw/'gaia_50k.adql').write_text(q+'\n')
    requests=[('gaia_50k.csv','https://gea.esac.esa.int/tap-server/tap/sync',urllib.parse.urlencode({'REQUEST':'doQuery','LANG':'ADQL','FORMAT':'csv','QUERY':q}).encode()),('bsc5.json','https://raw.githubusercontent.com/brettonw/YaleBrightStarCatalog/master/bsc5.json',None),('NGC.csv','https://raw.githubusercontent.com/mattiaverga/OpenNGC/master/database_files/NGC.csv',None),('addendum.csv','https://raw.githubusercontent.com/mattiaverga/OpenNGC/master/database_files/addendum.csv',None),('OpenNGC-LICENSE','https://raw.githubusercontent.com/mattiaverga/OpenNGC/master/LICENSE',None)]
    offline='--offline' in sys.argv
    if offline:manifest=json.loads((ROOT/'data/acquisition_manifest.json').read_text())
    for name,url,body in ([] if offline else requests):
        entry={'file':'data/raw/'+name,'url':url,'retrieved_at':datetime.now(timezone.utc).isoformat()}
        try:
            req=urllib.request.Request(url,data=body,headers={'User-Agent':'CosmicAtlasDataPipeline/5.0'})
            with urllib.request.urlopen(req,timeout=60) as resp: data=resp.read()
            (raw/name).write_bytes(data);entry.update(status='retrieved',bytes=len(data),sha256=hashlib.sha256(data).hexdigest())
        except Exception as e: entry.update(status='blocked',error=str(e))
        manifest['sources'].append(entry);print(json.dumps(entry),flush=True)
        (ROOT/'data/acquisition_manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    if (raw/'gaia_50k.csv').exists():
        import csv
        rows=list(csv.DictReader((raw/'gaia_50k.csv').open(encoding='utf-8-sig',newline='')))
        assert len(rows)>0 and 'source_id' in rows[0], 'Unexpected Gaia response'
        records=[]
        for row in rows:
            p,pe=safe_float(row['parallax']),safe_float(row['parallax_error'])
            assert p and pe and p/pe>=9.999, 'Gaia selection violation'
            sid=row['source_id'];d=1000/p*LY_PER_PC
            r={'id':'gaia-dr3-'+sid,'source_id':sid,'name':row['designation'],'designation':row['designation'],'tier':'observational','type':'Star','ra_deg':float(row['ra']),'dec_deg':float(row['dec']),'distance_ly':d,'angular_only':False,'distance_kind':'parallax_approximation','distance_sigma_ly':d*pe/p,'distance_basis':'Inverse parallax approximation; S/N >=10, RUWE <1.4; no zero-point correction or extinction correction.','source':'Gaia DR3','source_ref':'gaiadr3.gaia_source; Gaia Collaboration 2023','source_url':'https://gea.esac.esa.int/archive/documentation/GDR3/','raw_source_fields':row}
            mapping={'ra_error':'ra_error_mas','dec_error':'dec_error_mas','parallax':'parallax_mas','parallax_error':'parallax_error_mas','pmra':'pmra_masyr','pmdec':'pmdec_masyr','pmra_error':'pmra_error_masyr','pmdec_error':'pmdec_error_masyr','radial_velocity':'radial_velocity_kms','radial_velocity_error':'radial_velocity_error_kms'}
            for f in fields.split(', '):
                if f not in ['source_id','designation','ra','dec']:r[mapping.get(f,f)]=safe_float(row[f])
            records.append(r)
        assert len({r['id'] for r in records})==len(records)
        for n in [5000,20000,50000]:
            if len(records)<n:continue
            write_payload(out/f'gaia_{n//1000}k.json',records[:n],{'catalog':'Gaia DR3','release':'DR3','endpoint':requests[0][1],'query_adql':q,'tier_selection':f'First {n} rows of ordered 50k parent query','retrieved_at':manifest['sources'][0]['retrieved_at'],'raw_sha256':manifest['sources'][0].get('sha256'),'selection_effects':'Magnitude-limited brightest sources passing parallax S/N and RUWE cuts; not volume complete; binaries/crowded fields can be excluded.'},pipeline_version='5.0.0',generated_at=manifest['sources'][0]['retrieved_at'])
    if (raw/'NGC.csv').exists() and (raw/'addendum.csv').exists():
        subprocess.run([sys.executable,str(ROOT/'scripts/fetch_openngc.py'),'--base-url',raw.as_uri(),'-o',str(out/'openngc.json')],check=True)
    if (raw/'bsc5.json').exists():
        data=json.loads((raw/'bsc5.json').read_text());print('BSC full sample:',str(data[0])[:1800],flush=True)
    print('Acquisition finished',flush=True)
if __name__=='__main__':main()
