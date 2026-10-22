from pathlib import Path
from html.parser import HTMLParser
import subprocess,json,re,zipfile,sys
root=Path(__file__).resolve().parents[2]
class P(HTMLParser):
 def __init__(self): super().__init__();self.ids=set();self.assets=[];self.images=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if d.get('id'):self.ids.add(d['id'])
  if tag=='img':self.images.append(d)
  if tag in ('link','script'):
   v=d.get('src') or d.get('href')
   if v and not v.startswith(('http','//','data:','#')):self.assets.append(v)
html=(root/'index.html').read_text('utf-8');h=P();h.feed(html)
checks=[]
def check(name, condition):checks.append({'name':name,'pass':bool(condition)})
for file in h.assets:check('存在页面资源：'+file,(root/file).is_file())
for x in ['photoModal','photoOpen','journeyPhotoBtn','geoShowPhoto','pixelPhotoDialog','featurePhotoImport','photoLocalFile','pixelLocalPreview']:
 check('已撤除空照片入口：'+x, x not in html)
for x in ['pixelPlaceDialog','pixelPlaceClose','pixelPlaceTitle','pixelPlaceIntro','pixelPlaceEvidence','pixelPlaceRoad','pixelPlaceType','pixelPlaceLocate']:
 check('有效地点档案组件：'+x,x in h.ids)
check('无需远程照片',not any((x.get('src','').startswith(('http','//'))) for x in h.images))
check('首次体验改为货车探索', 'data-journey="pixel"' in html and 'data-journey="photos"' not in html)
js=list((root/'assets/js').rglob('*.js'))
for f in js:
 r=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
 check('脚本语法：'+str(f.relative_to(root)),r.returncode==0)
full='\n'.join(f.read_text('utf-8') for f in js)
for t in ['PhotoVault','showPhoto(',"'photoModal'",'openPhoto(', 'auditPhotos(', 'local_photo_catalog.js','packaged_photos.js']:
 check('运行脚本没有废弃功能：'+t,t not in full)
for x in ['fast_core','bridge_core','yundu','keli_village','xiaohuajiang_village']:
 check('可导航地点名称配置：'+x,x in (root/'assets/js/ux/pixel-truck.js').read_text('utf-8'))
check('正式脚本无已删除照片 JS 引用','photo-vault.js' not in html)
passed=sum(x['pass'] for x in checks)
result={'total':len(checks),'passed':passed,'failed':len(checks)-passed,'details':checks}
(root/'qa/v13/validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
print(f'{passed}/{len(checks)}', 'PASS' if passed==len(checks) else 'FAIL')
for x in checks:
 if not x['pass']:print('FAILED:',x['name'])
exit(0 if passed==len(checks) else 1)
