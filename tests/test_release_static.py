#!/usr/bin/env python3
import re, unittest
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'standalone/Cosmic_Atlas_Scientific_v4.html'

class StaticReleaseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.s=HTML.read_text(encoding='utf-8')
    def test_unique_ids(self):
        ids=re.findall(r'\bid=["\']([^"\']+)["\']',self.s); self.assertFalse([k for k,v in Counter(ids).items() if v>1])
    def test_dom_refs_resolve(self):
        ids=set(re.findall(r'\bid=["\']([^"\']+)["\']', self.s))
        refs=set(re.findall(r"getElementById\(['\"]([^'\"]+)['\"]\)", self.s))
        self.assertFalse(refs-ids)
    def test_offline_dependencies(self):
        self.assertNotRegex(self.s,r'<script[^>]+src='); self.assertNotRegex(self.s,r'<link[^>]+stylesheet'); self.assertNotRegex(self.s,r'\bfetch\s*\(')
    def test_deterministic(self): self.assertNotIn('Math.random',self.s)
    def test_scientific_guards(self):
        for token in ['angularOnly','distanceBasis','procedural','cosmic-atlas.catalog.v1','Imported Scientific Catalog','Guided tour']:
            self.assertIn(token,self.s)

if __name__=='__main__': unittest.main()
