from pathlib import Path
import subprocess,re,json
from PIL import Image
root=Path(__file__).resolve().parents[1]
js=list((root/'assets/js').rglob('*.js'))
checks=[]
for p in js:
 result=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
 checks.append({'name':'JavaScript:'+p.relative_to(root).as_posix(),'passed':result.returncode==0})
html=(root/'index.html').read_text()
for rel in re.findall(r'<script[^>]+src="([^"]+)"',html)+re.findall(r'<link[^>]+href="([^"]+\.css)"',html):
 checks.append({'name':'依赖:'+rel,'passed':(root/rel).is_file()})
fast=(root/'assets/js/fast/immersive-lab.js').read_text()
for label,key in [('可见教程','fast-aim-tutorial'),('方向增减','az-inc'),('信号强度','fastSignalPct'),('演示一步','aim-demo'),('采集按钮','fastCollect')]:
 checks.append({'name':label,'passed':key in fast})
entries=[]
for p in (root/'assets/media/approved').rglob('*'):
 if p.suffix.lower() not in ('.jpg','.jpeg','.png','.webp'):continue
 try:
  with Image.open(p) as im:im.verify()
  entries.append(p.relative_to(root).as_posix())
 except Exception:pass
paths=(root/'assets/data/packaged_photos.js').read_text()
checks.append({'name':'清单与真实照片数一致','passed':paths.count('assets/media/approved/')==len(entries)})
result={'version':'V12','note':'静态检查 + 独立逻辑检查，不等于浏览器端到端运行验收','passed':sum(x['passed'] for x in checks),'failed':sum(not x['passed'] for x in checks),'real_photos':len(entries),'checks':checks}
(root/'qa/v12_verify.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
print('checks',result['passed'],'/',len(checks),'actual photographs',len(entries));raise SystemExit(1 if result['failed'] else 0)
