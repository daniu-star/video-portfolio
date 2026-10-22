from pathlib import Path
from collections import Counter
import json,re,subprocess,hashlib
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text('utf-8')
js=(ROOT/'assets/js/ux/pixel-truck.js').read_text('utf-8')
css=(ROOT/'assets/css/v11-pixel.css').read_text('utf-8')
checks=[]
def check(name,ok):
 checks.append(dict(check=name,pass_=bool(ok)));print(('✔' if ok else '✗'),name)
for p in [ROOT/'assets/js/ux/pixel-truck.js',ROOT/'assets/js/geo/geo-provider.js',ROOT/'assets/js/ui/feature-panel.js']:
 proc=subprocess.run(['node','--check',str(p)],capture_output=True,text=True);check('JavaScript语法: '+p.name,proc.returncode==0)
ids=re.findall(r'\bid="([^"]+)"',html)
for n in ['pixelTruckGame','pixelGameTitle','pixelWorld','pixelMapMarkers','pixelMapViewport','pixelMapContent','pixelPhotoDialog','pixelLocalPreview','pixelGo','pixelReverse','pixelReset','pixelZoomIn','pixelZoomOut','pixelPhotoClose','pixelMediaStatus','photoLoadState','photoActual']:
 check('交互 DOM 唯一: '+n,ids.count(n)==1)
for k in ['g552','s315','UNKNOWN','openPhoto','pause','zoomBy','previewFiles','auditPhotos']:
 check('像素游戏关键机制: '+k,k in js)
check('居中定位CSS', 'translate(-50%,-50%)' in css)
check('响应式页面CSS','@media(max-width:650px)' in css)
check('地标全量点击事件',"b.addEventListener('click',()=>this.openPhoto(n))" in js)
check('照片不再反复读取缺失文件','PackagedPhotoPaths' in (ROOT/'assets/js/geo/geo-provider.js').read_text('utf-8'))
check('地理错误路段明示', '待核实' in js and '未核验' in html)
check('不使用远程照片直链',not bool(re.search(r'img\.src\s*=\s*["\']https?://',js)))
check('地图库被正确引入','local_photo_catalog.js' in html)
check('V11新样式链接存在','assets/css/v11-pixel.css' in html)
photo_assets=[];errors=[]
for p in (ROOT/'assets/media/approved').rglob('*'):
 if p.is_file() and p.suffix.lower() in {'.png','.jpg','.jpeg','.webp'}:
  try:
   with Image.open(p) as im:im.verify()
   photo_assets.append(dict(path=str(p.relative_to(ROOT)),bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
  except Exception as ex:errors.append(f'{p}: {ex}')
check('已存在影像无损坏',not errors)
print('实际照片文件:',len(photo_assets),'图片总字节',sum(p['bytes'] for p in photo_assets))
report={'checks':checks,'pass':sum(x['pass_'] for x in checks),'total':len(checks),'actual_local_photos':len(photo_assets),'assets':photo_assets,'errors':errors,'browser_e2e_executed':False,'note':'此环境浏览器本地HTTP导航受到策略阻止；不将源码检查伪称浏览器渲染测试。'}
(ROOT/'qa/v11_status.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
raise SystemExit(0 if report['pass']==report['total'] else 1)
