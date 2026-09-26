#!/usr/bin/env python3
import json, math, sys, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from catalog_common import parse_hms_ra, parse_dms_dec, inverse_parallax_distance_ly, comoving_distance_ly, validate_record

class PipelineTests(unittest.TestCase):
    def test_ra(self):
        self.assertAlmostEqual(parse_hms_ra('06h 45m 08.9s'),101.2870833,places=5)
        self.assertAlmostEqual(parse_hms_ra('00:40:24.0'),10.1,places=5)
    def test_dec(self):
        self.assertAlmostEqual(parse_dms_dec('-16° 42′ 58″'),-16.7161111,places=5)
    def test_parallax(self):
        self.assertAlmostEqual(inverse_parallax_distance_ly(1000),3.261563777,places=8)
    def test_planck_like_cmb_distance(self):
        # Regression window, not an assertion that the simplified model is exact cosmological truth.
        gly=comoving_distance_ly(1089)/1e9
        self.assertGreater(gly,45.0); self.assertLess(gly,45.5)
    def test_3c273_scale(self):
        gly=comoving_distance_ly(0.158339)/1e9
        self.assertGreater(gly,2.0); self.assertLess(gly,2.4)
    def test_angular_only_valid(self):
        self.assertEqual(validate_record({'id':'x','ra_deg':1,'dec_deg':2,'angular_only':True}),[])
    def test_missing_distance_invalid(self):
        self.assertTrue(validate_record({'id':'x','ra_deg':1,'dec_deg':2}))
    def test_example_catalog(self):
        data=json.loads((ROOT/'data/example_import_catalog.json').read_text())
        self.assertGreaterEqual(len(data['records']),5)
        for r in data['records']: self.assertEqual(validate_record(r),[])

if __name__=='__main__': unittest.main()
