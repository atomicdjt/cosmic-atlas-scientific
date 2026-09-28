import hashlib,json,re,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class ReadinessStaticTests(unittest.TestCase):
 def test_identity_and_runtime_policy(self):
  s=(ROOT/'dist/Cosmic_Atlas_Standalone.html').read_text(encoding='utf-8')
  self.assertNotIn('{{VERSION}}',s);self.assertNotIn('{{BUILD_ID}}',s)
  self.assertIn((ROOT/'VERSION').read_text().strip(),s)
  for pattern in [r'<script[^>]+src=',r'<link[^>]+stylesheet',r'\bfetch\s*\(',r'\bXMLHttpRequest\b',r'\bWebSocket\b',r'\bEventSource\b',r'\bsendBeacon\s*\(',r'\bimportScripts\s*\(']:self.assertNotRegex(s,pattern)
  self.assertNotIn('user-scalable=no',s)
 def test_build_manifest_identity(self):
  m=json.loads((ROOT/'qa/v5/build.json').read_text())
  self.assertEqual(m['version'],(ROOT/'VERSION').read_text().strip())
  self.assertEqual(m['sha256'],hashlib.sha256((ROOT/'dist/Cosmic_Atlas_Standalone.html').read_bytes()).hexdigest())
  self.assertEqual(m['modules'],len(json.loads((ROOT/'src/modules.json').read_text())))
 def test_catalog_inventory(self):
  acquisition=json.loads((ROOT/'data/acquisition_manifest.json').read_text())
  source_times={Path(x['file']).name:x['retrieved_at'] for x in acquisition['sources'] if x.get('status')=='retrieved' and x.get('retrieved_at')}
  expected_times={'bsc5.json':source_times['bsc5.json'],'gaia_5k.json':source_times['gaia_50k.csv'],'gaia_20k.json':source_times['gaia_50k.csv'],'gaia_50k.json':source_times['gaia_50k.csv'],'openngc.json':max(source_times['NGC.csv'],source_times['addendum.csv'])}
  for x in json.loads((ROOT/'qa/readiness/catalog-inventory.json').read_text()):
   data=(ROOT/x['file']).read_bytes();self.assertEqual(x['sha256'],hashlib.sha256(data).hexdigest())
   self.assertTrue(data.endswith(b'\n'));self.assertNotIn(b'\r',data)
   payload=json.loads(data);self.assertEqual(x['records'],len(payload['records']))
   self.assertEqual(payload['generated_at'],expected_times[Path(x['file']).name])
