"""Package verified v5 snapshots with checksums and the full Git history.

Does not acquire data, alter source files, or publish anything. Output must be empty.
"""
import argparse
import hashlib
import json
import shutil
import subprocess
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = 'f003f97370d7c8e05c3330045081f12d3234b957bb354664b1648c8e1521d185'
SKIP = {'.git', '.vercel', '__pycache__', 'node_modules'}

def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args], text=True).strip()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--ci-report', required=True, type=Path)
    args = parser.parse_args()
    out = args.output.resolve()
    if out == ROOT or ROOT in out.parents:
        raise SystemExit('Output must be outside the source tree')
    if out.exists() and any(out.iterdir()):
        raise SystemExit('Output directory must be empty')
    if git('status', '--porcelain'):
        raise SystemExit('Commit source changes before packaging')
    head = git('rev-parse', 'HEAD')
    if git('rev-parse', 'v5.0.0^{commit}') != head:
        raise SystemExit('v5.0.0 must identify the packaged HEAD')
    ci = json.loads(args.ci_report.read_text(encoding='utf-8-sig'))
    runs = [r for r in ci if r['headSha'] == head]
    if not runs or any(r['conclusion'] != 'success' for r in runs):
        raise SystemExit('Final-head CI evidence must contain successful completed runs')
    if digest(ROOT / 'dist/Cosmic_Atlas_Standalone.html') != EXPECTED:
        raise SystemExit('Standalone differs from the browser-verified release')
    for name in ['validation_results', 'interaction', 'scales', 'hosted']:
        evidence = json.loads((ROOT / f'qa/v5/{name}.json').read_text())
        if not evidence['passed'] or evidence['standalone_sha256'] != EXPECTED:
            raise SystemExit(f'Unverified artifact in {name}')
    browsers = json.loads((ROOT / 'qa/v5/browser.json').read_text())
    for case in browsers:
        if not all(case['checks'].values()) or case['errors']:
            raise SystemExit('Browser QA failed')
    for entry in json.loads((ROOT / 'data/generated_manifest.json').read_text()):
        if digest(ROOT / entry['file']) != entry['sha256']:
            raise SystemExit('Normalized catalog checksum mismatch')
    for entry in json.loads((ROOT / 'data/acquisition_manifest.json').read_text())['sources']:
        if entry.get('status') == 'retrieved' and digest(ROOT / entry['file']) != entry['sha256']:
            raise SystemExit('Raw snapshot checksum mismatch')
    out.mkdir(parents=True, exist_ok=True)
    stage = out / 'cosmic-atlas-scientific'
    shutil.copytree(ROOT, stage, ignore=lambda directory, names: [n for n in names if n in SKIP or n.endswith(('.pyc', '.tmp'))])
    (stage / 'qa/v5/final-ci.json').write_text(json.dumps(runs, indent=2) + '\n', encoding='utf-8')
    state = {'head': head, 'branch': git('branch', '--show-current'), 'tag': 'v5.0.0', 'baseline': git('rev-parse', 'v4.0.0-baseline'), 'working_tree_clean': True}
    (stage / 'qa/v5/git-state.json').write_text(json.dumps(state, indent=2) + '\n', encoding='utf-8')
    bundle = stage / 'historical/cosmic-atlas-history.bundle'
    git('bundle', 'create', str(bundle), '--all')
    git('bundle', 'verify', str(bundle))
    report = (ROOT / 'docs/V5_COMPLETION_REPORT.md').read_text(encoding='utf-8')
    report += '\n## Final release identity\n\n'
    report += f'- Branch: `{state["branch"]}`; tag: `v5.0.0`; commit: `{head}`.\n'
    report += '- Repository: https://github.com/atomicdjt/cosmic-atlas-scientific (private).\n- Pull request: https://github.com/atomicdjt/cosmic-atlas-scientific/pull/1 (open; no merge or human review claimed).\n'
    report += '- Release: https://github.com/atomicdjt/cosmic-atlas-scientific/releases/tag/v5.0.0 (upload/publication status must be checked at that URL).\n'
    for run in runs:
        report += f'- Exact-head CI: [{run["databaseId"]}]({run["url"]}) — {run["conclusion"]}.\n'
    report += f'\nStandalone: `{out / "Cosmic_Atlas_Standalone.html"}`\n\nModular source: `{stage / "src"}`\n\nFull release: `{out / "Cosmic_Atlas_v5_Release.zip"}`\n\nReport: `{out / "COMPLETION_REPORT.md"}`\n'
    report += '\nThe source snapshot omits the working `.git` directory. Its `historical/cosmic-atlas-history.bundle` preserves branches, commits and tags; restore with `git clone historical/cosmic-atlas-history.bundle restored-repository`, then select the v5 branch. The snapshot includes normalized data omitted from the lightweight Git checkout.\n'
    (stage / 'COMPLETION_REPORT.md').write_text(report, encoding='utf-8')
    files = [{'path': p.relative_to(stage).as_posix(), 'bytes': p.stat().st_size, 'sha256': digest(p)} for p in sorted(stage.rglob('*')) if p.is_file()]
    manifest = {'release': '5.0.0', 'build_id': 'CA-SCI-5.0-2026-09-26', 'packaged_at': datetime.now(timezone.utc).isoformat(), 'git': state, 'standalone_sha256': EXPECTED, 'files': files, 'exclusions': ['release_manifest.json (self)', 'MANIFEST.sha256 (self and manifest metadata)']}
    (stage / 'release_manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    lines = [f'{entry["sha256"]}  {entry["path"]}' for entry in files]
    lines.append(f'{digest(stage / "release_manifest.json")}  release_manifest.json')
    (stage / 'MANIFEST.sha256').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    archive = out / 'Cosmic_Atlas_v5_Release.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for p in sorted(stage.rglob('*')):
            if p.is_file():
                info = zipfile.ZipInfo('Cosmic_Atlas_v5_Release/' + p.relative_to(stage).as_posix(), date_time=(2026, 9, 26, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                z.writestr(info, p.read_bytes())
    with zipfile.ZipFile(archive) as z:
        if z.testzip() is not None:
            raise SystemExit('ZIP integrity failed')
        for entry in files:
            data = z.read('Cosmic_Atlas_v5_Release/' + entry['path'])
            if hashlib.sha256(data).hexdigest() != entry['sha256']:
                raise SystemExit('Archived content mismatch')
    shutil.copy2(stage / 'dist/Cosmic_Atlas_Standalone.html', out / 'Cosmic_Atlas_Standalone.html')
    shutil.copy2(stage / 'COMPLETION_REPORT.md', out / 'COMPLETION_REPORT.md')
    outer = [p for p in sorted(out.iterdir()) if p.is_file()]
    (out / 'SHA256SUMS.txt').write_text('\n'.join(f'{digest(p)}  {p.name}' for p in outer) + '\n', encoding='utf-8')
    print(json.dumps({'files': len(files), 'zip_bytes': archive.stat().st_size, 'zip_sha256': digest(archive), 'commit': head, 'output': str(out)}, indent=2))

if __name__ == '__main__':
    main()
