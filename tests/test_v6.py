import hashlib,json,subprocess,sys,tempfile,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from ephemeris_pipeline import parse_response
from build_catalog_pack import build_pack

class V6Tests(unittest.TestCase):
    def test_ephemeris_raw_hashes(self):
        m=json.loads((ROOT/'data/ephemeris/manifest.json').read_text(encoding='utf-8'))
        self.assertEqual(m['sha256'],hashlib.sha256((ROOT/m['asset']).read_bytes()).hexdigest())
        for source in m['sources']:
            self.assertEqual(source['sha256'],hashlib.sha256((ROOT/source['file']).read_bytes()).hexdigest())
            self.assertEqual(source['parameters']['TIME_TYPE'],"'TDB'")
            self.assertEqual(source['parameters']['VEC_CORR'],"'NONE'")
    def test_ephemeris_reproducible_offline(self):
        paths=[ROOT/'data/ephemeris/manifest.json',ROOT/'data/ephemeris/solar-system-2026-2027.json']
        before=[p.read_bytes() for p in paths]
        subprocess.run([sys.executable,'scripts/ephemeris_pipeline.py','--offline'],cwd=ROOT,check=True,capture_output=True)
        self.assertEqual(before,[p.read_bytes() for p in paths])
    def test_bad_response_contract(self):
        payload=json.loads((ROOT/'data/ephemeris/raw/399-states.json').read_text(encoding='utf-8'))
        for old,new in [('Reference frame : ICRF','Reference frame : B1950'),('Output units    : AU-D','Output units    : KM-S'),('Earth (399)','Earth (3)')]:
            with self.assertRaises(ValueError):parse_response({**payload,'result':payload['result'].replace(old,new)},'399')
        with self.assertRaises(ValueError):parse_response({'error':'unavailable'},'399')
    def test_pack_exact_rows_hashes_and_determinism(self):
        with tempfile.TemporaryDirectory() as temp:
            source=ROOT/'data/generated/gaia_5k.json';a=Path(temp)/'a';b=Path(temp)/'b'
            ma=build_pack(source,a,3);mb=build_pack(source,b,3);self.assertEqual(ma,mb)
            self.assertEqual((a/'manifest.json').read_bytes(),(b/'manifest.json').read_bytes())
            restored=[]
            for tile in ma['tiles']:
                blob=(a/tile['file']).read_bytes();self.assertEqual(blob,(b/tile['file']).read_bytes())
                self.assertEqual(hashlib.sha256(blob).hexdigest(),tile['sha256'])
                rows=[json.loads(line) for line in blob.splitlines()];self.assertEqual(len(rows),tile['rowCount']);restored.extend(rows)
            original=json.loads(source.read_text(encoding='utf-8'))['records']
            self.assertEqual(sorted(restored,key=lambda r:r['id']),sorted(original,key=lambda r:r['id']))
    def test_healpix_analytic_order_zero_centers(self):
        # Known RING geometry: equatorial pixels 4/5/6/7 at 0/90/180/270°.
        # Avoid the equator's pixel-boundary ambiguity at order >0.
        with tempfile.TemporaryDirectory() as temp:
            path=Path(temp)/'source.json'
            path.write_text(json.dumps({'records':[{'id':str(i),'ra_deg':ra,'dec_deg':0,'angular_only':True} for i,ra in enumerate([0,90,180,270])]}))
            m=build_pack(path,Path(temp)/'pack',0);self.assertEqual([t['id'] for t in m['tiles']],[4,5,6,7])
            for t,ra in zip(m['tiles'],[0,90,180,270]):self.assertAlmostEqual(t['centerRaDeg'],ra);self.assertAlmostEqual(t['centerDecDeg'],0)
    def test_pack_rejects_bad_directions_and_duplicate_ids(self):
        with tempfile.TemporaryDirectory() as temp:
            source=Path(temp)/'bad.json'
            for rows in [[{'id':'x','ra_deg':None,'dec_deg':0}],[{'id':'x','ra_deg':0,'dec_deg':91}],
                         [{'id':'x','ra_deg':0,'dec_deg':0}]*2]:
                source.write_text(json.dumps({'records':rows}))
                with self.assertRaises(ValueError):build_pack(source,Path(temp)/'pack',3)
    def test_scientific_result_schema(self):
        import jsonschema
        schema=json.loads((ROOT/'data/scientific_result_schema.json').read_text(encoding='utf-8'))
        jsonschema.Draft202012Validator.check_schema(schema)
        jsonschema.validate({'category':'numerically computed','source':None,'epoch':2461313.5,'timeScale':'TDB',
          'frame':'ICRF','units':{'position':'AU'},'method':'cubic Hermite','assumptions':[],
          'uncertainty':None,'validRange':[2461041.5,2461771.5]},schema)
        with self.assertRaises(jsonschema.ValidationError):jsonschema.validate({'category':'authoritative'},schema)

if __name__=='__main__':unittest.main()
