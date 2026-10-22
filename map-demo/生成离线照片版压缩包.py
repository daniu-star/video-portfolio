#!/usr/bin/env python3
"""在用户本机将已导入的真实照片和整个网站封装成可搬迁的 ZIP。"""
from pathlib import Path
import zipfile,json,hashlib
from PIL import Image
root=Path(__file__).resolve().parent
photos=[]
for p in sorted((root/'assets/media/approved').rglob('*')):
 if not p.is_file() or p.suffix.lower() not in ('.jpg','.jpeg','.png','.webp'):continue
 try:
  with Image.open(p) as im: im.verify()
  photos.append({'name':str(p.relative_to(root)), 'size':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
 except Exception as e: print('图片损坏（已忽略）：',p,e)
print('本机可用的真实照片文件数：',len(photos))
if not photos:
 print('未发现真实照片。请先将获得授权的实拍文件放在 incoming_photos 对应目录，运行「导入自有现场照片」脚本。')
else:
 (root/'database/local_media_integrity.json').write_text(json.dumps({'images':photos},ensure_ascii=False,indent=2),'utf-8')
zip_path=root.parent/('贵州双工程交互地图_本地照片已入库_'+str(len(photos))+'张.zip')
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
 for p in root.rglob('*'):
  if p.is_file() and '.DS_Store' not in str(p) and '__pycache__' not in str(p):
   z.write(p,arcname='Map demo/'+p.relative_to(root).as_posix())
print('已生成：',zip_path)
