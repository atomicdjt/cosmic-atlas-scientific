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
  for x in json.loads((ROOT/'qa/readiness/catalog-inventory.json').read_text()):
   data=(ROOT/x['file']).read_bytes();self.assertEqual(x['sha256'],hashlib.sha256(data).hexdigest())
   self.assertEqual(x['records'],len(json.loads(data)['records']))
