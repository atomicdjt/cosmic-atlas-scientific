import json,subprocess,hashlib,unittest,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from catalog_common import validate_record
class V5Tests(unittest.TestCase):
 def test_reproducible_build(self):
  subprocess.run([sys.executable,'scripts/build_v5.py'],cwd=ROOT,check=True,capture_output=True)
  a=(ROOT/'dist/Cosmic_Atlas_Standalone.html').read_bytes()
  subprocess.run([sys.executable,'scripts/build_v5.py'],cwd=ROOT,check=True,capture_output=True)
  self.assertEqual(a,(ROOT/'dist/Cosmic_Atlas_Standalone.html').read_bytes())
 def test_baseline_untouched(self):
  self.assertEqual(hashlib.sha256((ROOT/'standalone/Cosmic_Atlas_Scientific_v4.html').read_bytes()).hexdigest(),'6fb8b0bc99f1eba486056e1d0b9e19c7c81cc6ab2d010bc15dbb3dd4158cc101')
 def test_catalogs(self):
  import jsonschema
  schema=json.loads((ROOT/'data/catalog_schema.json').read_text());jsonschema.Draft202012Validator.check_schema(schema);v=jsonschema.Draft202012Validator(schema)
  for p in (ROOT/'data/generated').glob('*.json'):
   data=json.loads(p.read_text(encoding='utf-8'));v.validate(data)
   self.assertEqual(len({x['id'] for x in data['records']}),len(data['records']))
   for r in data['records']:self.assertEqual(validate_record(r),[],str(p)+str(r.get('id')))
 def test_tier_nesting(self):
  tiers=[json.loads((ROOT/f'data/generated/gaia_{n}k.json').read_text())['records'] for n in [5,20,50]]
  self.assertEqual(tiers[0],tiers[2][:5000]);self.assertEqual(tiers[1],tiers[2][:20000])
 def test_generated_hashes(self):
  for entry in json.loads((ROOT/'data/generated_manifest.json').read_text()):self.assertEqual(hashlib.sha256((ROOT/entry['file']).read_bytes()).hexdigest(),entry['sha256'])
 def test_schema_null_distance_rejected(self):
  import jsonschema
  v=jsonschema.Draft202012Validator(json.loads((ROOT/'data/catalog_schema.json').read_text()))
  for r in [{'id':'bad','ra_deg':0,'dec_deg':0,'distance_ly':None},{'id':'bad','ra_deg':0,'dec_deg':0,'distance_ly':10,'angular_only':True}]:
   self.assertTrue(list(v.iter_errors({'schema':'cosmic-atlas.catalog.v1','records':[r]})))
if __name__=='__main__':unittest.main()
