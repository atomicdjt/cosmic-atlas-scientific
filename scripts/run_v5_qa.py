"""Run v5 build, scientific, pipeline, schema and reproducibility checks."""
import subprocess,sys,json,hashlib
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[1]
def write_lf(path,text):
 with Path(path).open('w',encoding='utf-8',newline='\n') as output: output.write(text)
def main():
 commands=[[sys.executable,'scripts/build_v5.py'],['node','tests/scientific.cjs'],['node','tests/v6_numerics.cjs'],[sys.executable,'-m','unittest','discover','-s','tests','-v'],[sys.executable,'-m','compileall','-q','scripts']]
 if '--browser' in sys.argv:commands.append([sys.executable,'tests/browser_qa.py'])
 results=[]
 for cmd in commands:
  p=subprocess.run(cmd,cwd=ROOT,capture_output=True,text=True,encoding='utf-8',errors='replace');results.append({'command':cmd,'returncode':p.returncode,'stdout':p.stdout,'stderr':p.stderr});print('PASS' if p.returncode==0 else 'FAIL',' '.join(cmd),flush=True)
 result={'release':(ROOT/'VERSION').read_text().strip(),'generated_at':datetime.now(timezone.utc).isoformat(),'standalone_sha256':hashlib.sha256((ROOT/'dist/Cosmic_Atlas_Standalone.html').read_bytes()).hexdigest(),'passed':all(r['returncode']==0 for r in results),'steps':results}
 write_lf(ROOT/'qa/v5/validation_results.json',json.dumps(result,indent=2)+'\n');return result['passed']
if __name__=='__main__':sys.exit(0 if main() else 1)
