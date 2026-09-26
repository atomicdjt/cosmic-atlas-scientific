#!/usr/bin/env python3
"""Build/copy the v4 standalone artifact and emit deterministic integrity metadata."""
from __future__ import annotations
import argparse, hashlib, json, re, shutil, subprocess
from pathlib import Path

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--source', default='src/Cosmic_Atlas_v4_source.html')
    ap.add_argument('--output', default='standalone/Cosmic_Atlas_Scientific_v4.html')
    ap.add_argument('--manifest', default='qa/build_manifest.json')
    args = ap.parse_args()

    src, out = Path(args.source), Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, out)
    s = out.read_text(encoding='utf-8')

    ids = re.findall(r'\bid=["\']([^"\']+)["\']', s)
    refs = re.findall(r"getElementById\(['\"]([^'\"]+)['\"]\)", s)
    scripts = '\n'.join(re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>', s, re.S))
    tmp = Path(args.manifest).with_suffix('.inline.js')
    tmp.parent.mkdir(parents=True, exist_ok=True)
    tmp.write_text(scripts, encoding='utf-8')

    node_ok = None
    node_msg = 'node unavailable'
    try:
        cp = subprocess.run(['node', '--check', str(tmp)], capture_output=True, text=True)
        node_ok = cp.returncode == 0
        node_msg = (cp.stderr or cp.stdout).strip()
    except FileNotFoundError:
        pass

    duplicate_ids = sorted({x for x in ids if ids.count(x) > 1})
    manifest = {
        'file': str(out),
        'bytes': out.stat().st_size,
        'sha256': hashlib.sha256(out.read_bytes()).hexdigest(),
        'dom_ids': len(ids),
        'unique_dom_ids': len(set(ids)),
        'duplicate_ids': duplicate_ids,
        'unresolved_getElementById': sorted(set(refs) - set(ids)),
        'external_script_tags': len(re.findall(r'<script[^>]+src=', s, re.I)),
        'stylesheet_links': len(re.findall(r'<link[^>]+stylesheet', s, re.I)),
        'network_fetch_calls': len(re.findall(r'\bfetch\s*\(', s)),
        'math_random_calls': s.count('Math.random'),
        'node_syntax_ok': node_ok,
        'node_message': node_msg,
    }
    Path(args.manifest).write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    try:
        tmp.unlink()
    except FileNotFoundError:
        pass
    print(json.dumps(manifest, indent=2))
    ok = not manifest['duplicate_ids'] and not manifest['unresolved_getElementById'] and node_ok is not False
    raise SystemExit(0 if ok else 1)

if __name__ == '__main__':
    main()
