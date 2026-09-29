import json,subprocess,hashlib,unittest,sys,os
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
  # Verify the immutable baseline Git object; an older Windows checkout may
  # have converted its working copy before .gitattributes was introduced.
  blob=subprocess.check_output(['git','show','HEAD:standalone/Cosmic_Atlas_Scientific_v4.html'],cwd=ROOT)
  self.assertEqual(hashlib.sha256(blob).hexdigest(),'6fb8b0bc99f1eba486056e1d0b9e19c7c81cc6ab2d010bc15dbb3dd4158cc101')
  self.assertEqual(subprocess.run(['git','diff','--quiet','--','standalone/Cosmic_Atlas_Scientific_v4.html'],cwd=ROOT).returncode,0)
 def test_catalogs(self):
  import jsonschema
  schema=json.loads((ROOT/'data/catalog_schema.json').read_text());jsonschema.Draft202012Validator.check_schema(schema);v=jsonschema.Draft202012Validator(schema)
  paths=sorted((ROOT/'data/generated').glob('*.json'))
  if os.environ.get('COSMIC_ATLAS_VALIDATE_FULL_CATALOGS')!='1': paths=[p for p in paths if p.name=='gaia_5k.json']
  self.assertTrue(paths)
  for p in paths:
   data=json.loads(p.read_text(encoding='utf-8'));v.validate(data)
   self.assertEqual(len({x['id'] for x in data['records']}),len(data['records']))
   for r in data['records']:self.assertEqual(validate_record(r),[],str(p)+str(r.get('id')))
 def test_tier_nesting(self):
  paths=[ROOT/f'data/generated/gaia_{n}k.json' for n in [5,20,50]]
  if not all(p.exists() for p in paths): self.skipTest('optional full Gaia tiers are absent from lightweight checkout')
  tiers=[json.loads(p.read_text())['records'] for p in paths]
  self.assertEqual(tiers[0],tiers[2][:5000]);self.assertEqual(tiers[1],tiers[2][:20000])
 def test_generated_hashes(self):
  checked=0
  for entry in json.loads((ROOT/'data/generated_manifest.json').read_text()):
   path=ROOT/entry['file']
   if os.environ.get('COSMIC_ATLAS_VALIDATE_FULL_CATALOGS')!='1' and path.name!='gaia_5k.json': continue
   if not path.exists(): continue
   if os.environ.get('COSMIC_ATLAS_VALIDATE_FULL_CATALOGS')=='1': data=path.read_bytes()
   else:
    data=subprocess.check_output(['git','show','HEAD:'+entry['file']],cwd=ROOT)
    self.assertEqual(subprocess.run(['git','diff','--quiet','--',entry['file']],cwd=ROOT).returncode,0)
   self.assertEqual(hashlib.sha256(data).hexdigest(),entry['sha256']);checked+=1
  self.assertGreater(checked,0)
 def test_schema_null_distance_rejected(self):
  import jsonschema
  v=jsonschema.Draft202012Validator(json.loads((ROOT/'data/catalog_schema.json').read_text()))
  for r in [{'id':'bad','ra_deg':0,'dec_deg':0,'distance_ly':None},{'id':'bad','ra_deg':0,'dec_deg':0,'distance_ly':10,'angular_only':True}]:
   self.assertTrue(list(v.iter_errors({'schema':'cosmic-atlas.catalog.v1','records':[r]})))
if __name__=='__main__':unittest.main()
