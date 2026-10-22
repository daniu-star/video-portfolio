#!/usr/bin/env python3
"""可选联网离线构建：从 OSM Overpass 的指定贵州区域取得高速/主干线，保留 ODbL 来源；不抓取高德/Google。"""
import pathlib,urllib.request,urllib.parse,json,datetime
root=pathlib.Path(__file__).resolve().parents[1]
# 粗范围：两工程所在黔西南/黔南南部；这不是精确推荐行车路线。
query='[out:json][timeout:80];(way["highway"~"^(motorway|trunk|primary|secondary)$"](25.45,105.35,25.95,107.15););out geom;'
url='https://overpass.kumi.systems/api/interpreter'
req=urllib.request.Request(url,data=urllib.parse.urlencode({'data':query}).encode('utf-8'),headers={'User-Agent':'GuizhouSpatialResearchOffline/1.0','Content-Type':'application/x-www-form-urlencoded'})
print('正在请求 OSM 区域道路，来源是 OpenStreetMap/Overpass，非高德/谷歌；大范围可能限流。')
try:
 with urllib.request.urlopen(req,timeout=100) as resp:data=json.loads(resp.read(12000000))
except Exception as e:raise SystemExit('下载未成功，原演示道路保持不变：'+str(e))
lines=[]
for w in data.get('elements',[]):
 g=w.get('geometry') or []
 if len(g)<2:continue
 coords=[[round(p['lon'],6),round(p['lat'],6)] for p in g if 'lon'in p and 'lat'in p]
 if len(coords)<2:continue
 tags=w.get('tags',{})
 lines.append({'osm_id':w.get('id'),'name':tags.get('name') or '未命名干线','highway':tags.get('highway'),'ref':tags.get('ref',''),'geometry':coords})
result={'status':'osm-odbl','source':'© OpenStreetMap contributors, ODbL 1.0','source_url':'https://www.openstreetmap.org/copyright','date':datetime.date.today().isoformat(),'bbox':[105.35,25.45,107.15,25.95],'lines':lines}
if not lines:raise SystemExit('未返回有效道路，未覆盖原项目文件')
p=root/'assets/data/offline_roads.js';p.write_text('window.SpatialApp=window.SpatialApp||{};window.SpatialApp.OpenRoads='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n','utf-8')
(root/'assets/data/offline_roads_provenance.json').write_text(json.dumps({k:v for k,v in result.items() if k!='lines'}|{'road_count':len(lines)},ensure_ascii=False,indent=2),'utf-8')
print('已导入',len(lines),'条道路（不是导航路径，离线保存，无需前端联网）；须展示 OSM/ODbL 署名。')
