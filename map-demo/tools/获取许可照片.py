#!/usr/bin/env python3
"""从已逐条核对 CC 许可证的 Wikimedia Commons 文件导入本地，供离线演示。依赖 Python 标准库，Pillow 可选。"""
import pathlib,json,urllib.request,urllib.parse,hashlib,io,sys
root=pathlib.Path(__file__).resolve().parents[1]
manifest=json.loads((root/'database/offline_photo_sources.json').read_text('utf-8'))
out=root/'assets/media/approved';out.mkdir(parents=True,exist_ok=True)
results=[]
for p in manifest['photos']:
 path=root/p['local']
 if path.exists() and path.stat().st_size>30000:
  print('已有：',p['title']);results.append((p['id'],'existing'));continue
 url='https://commons.wikimedia.org/wiki/Special:Redirect/file/'+urllib.parse.quote(p['file'])+'?width=1280'
 try:
  request=urllib.request.Request(url,headers={'User-Agent':'GuizhouLocalExhibition/1.0 (research offline packaging; CC credit in manifest)'})
  with urllib.request.urlopen(request,timeout=24) as r:
   raw=r.read(14000000);ct=r.headers.get('Content-Type','')
  if len(raw)<30000 or not (raw.startswith(b'\xff\xd8') or raw.startswith(b'\x89PNG')):
   raise ValueError('不是有效图像，或返回了错误页面。类型：'+ct)
  try:
   from PIL import Image,ImageOps
   im=Image.open(io.BytesIO(raw));im=ImageOps.exif_transpose(im).convert('RGB');im.thumbnail((1440,1100));im.save(path,'JPEG',quality=86,optimize=True)
  except ImportError:
   if not raw.startswith(b'\xff\xd8'):raise RuntimeError('图片为 PNG，请先安装 Pillow：python -m pip install pillow')
   path.write_bytes(raw)
  digest=hashlib.sha256(path.read_bytes()).hexdigest();results.append((p['id'],'ok'))
  print('成功：',p['title'],path.stat().st_size,'字节',digest[:16]);p['sha256']=digest
 except Exception as e:
  print('失败：',p['title'],str(e)[:220]);results.append((p['id'],'failed'))
(root/'database/offline_photo_download_results.json').write_text(json.dumps({'results':results,'licenses':manifest['photos']},ensure_ascii=False,indent=2),'utf-8')
print('已完成',sum(v in ('ok','existing') for k,v in results),'/',len(results),'份；运行网页只读取本地文件。')
if all(v=='failed' for k,v in results):sys.exit(2)
