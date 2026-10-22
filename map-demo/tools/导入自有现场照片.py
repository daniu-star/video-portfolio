#!/usr/bin/env python3
"""导入研究团队自有/已获明确再分发授权的照片；严格以目录标注为区域级照片，不自动标为单栋精确摄影。"""
from pathlib import Path
from PIL import Image,ImageOps
import json,re,hashlib
root=Path(__file__).resolve().parents[1]
incoming=root/'incoming_photos';approved=root/'assets/media/approved';approved.mkdir(parents=True,exist_ok=True)
source=root/'database/offline_photo_sources.json'
manifest=json.loads(source.read_text('utf-8'))
tags={'fast':'中国天眼景区','huajiang':'花江峡谷大桥','yundu':'云渡服务区','keli':'科力寨','xiaohuajiang':'小花江村','town':'平塘天文小镇'}
count=0
for tag,label in tags.items():
 folder=incoming/tag
 if not folder.exists():continue
 for file in sorted(folder.iterdir()):
  if file.suffix.lower() not in ('.jpg','.jpeg','.png','.webp'):continue
  if file.stat().st_size<2000:continue
  name=re.sub(r'[^a-zA-Z0-9_-]','_',file.stem)[:45]
  id=f'field_{tag}_{name}'
  out=approved/(id+'.jpg')
  try:
   with Image.open(file) as im:
    im=ImageOps.exif_transpose(im).convert('RGB'); im.thumbnail((1800,1300));im.save(out,'JPEG',quality=87,optimize=True)
  except Exception as ex:
   print('跳过无法识别图像：',file,ex);continue
  rel=out.relative_to(root).as_posix()
  # 非法获得或未获传播许可的照片不要放入 incoming_photos
  row={'site':tag,'id':id,'file':file.name,'local':rel,'title':label+' · 田野影像 '+name,
       'creator':'研究团队（请在发布前核对摄影者）','date':'待核实','license':'团队自有或已获许可（发布前核查）',
       'page':'','scope':'归属'+label+'片区；具体建筑和摄影位置尚待逐一复核','exact':False,
       'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}
  manifest['photos']=[x for x in manifest['photos'] if x['id']!=id]+[row]
  count+=1
source.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),'utf-8')
catalog={}
for row in manifest['photos']:
 catalog.setdefault(row['site'],[]).append({'id':row['id'],'path':row['local'],'title':row['title'],'creator':row['creator'],
     'date':row['date'],'license':row['license'],'source':row.get('page',''),'scope':row['scope'],'exact':row['exact']})
(root/'assets/data/local_photo_catalog.js').write_text('window.SpatialApp=window.SpatialApp||{};window.SpatialApp.LocalPhotoCatalog='+json.dumps(catalog,ensure_ascii=False)+';\n','utf-8')
print('本次成功导入',count,'张；请核验作品著作权与地点位置，并在数据库清单中补充拍摄者/日期。')
