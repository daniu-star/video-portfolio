#!/usr/bin/env python3
"""Download/ingest OSM roads, preserve WGS84 coordinates, write self-contained JS.

CLI:
  python tools/导入贵州开放路网.py --input /path/to/guizhou-latest-free.gpkg.zip
  python tools/导入贵州开放路网.py --input /path/to/roads.geojson
  python tools/导入贵州开放路网.py --overpass

Roads are not automatically routable; topology and vehicle access need independent checking.
License: OpenStreetMap contributors, ODbL 1.0, share-alike/database attribution applies.
"""
import argparse, datetime, hashlib, json, pathlib, sys, urllib.request, urllib.parse, zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'assets/data/offline_roads.js'
BBOX=(105.37,25.33,107.08,26.08)
RAIL={'rail','light_rail','tram','subway','narrow_gauge'}
ALLOWED={'motorway','motorway_link','trunk','trunk_link','primary','primary_link','secondary','secondary_link','tertiary','tertiary_link','residential','unclassified','service'}
RANK={'motorway':0,'motorway_link':1,'trunk':2,'trunk_link':3,'primary':4,'primary_link':5,'secondary':6,'secondary_link':7,'tertiary':8,'tertiary_link':9,'unclassified':10,'residential':11,'service':12}

def in_bbox(line):return any(BBOX[0]<=a<=BBOX[2] and BBOX[1]<=b<=BBOX[3] for a,b in line)
def slim(coords,max_points=120):
  """Cap segment length for browser speed, keeping endpoints, and never invent coordinates."""
  pts=[[round(float(p[0]),6),round(float(p[1]),6)] for p in coords if len(p)>=2]
  if len(pts)>max_points:pts=[pts[round(i*(len(pts)-1)/(max_points-1))] for i in range(max_points)]
  return pts

def add(lines,tags,geom,osm_id):
  highway=str(next((v for v in (tags.get('highway'),tags.get('fclass'),tags.get('type')) if v is not None and str(v).lower() not in ('nan','none','')), '')).lower()
  railway=str(tags.get('railway') or '').lower()
  if highway not in ALLOWED and railway not in RAIL:return
  if geom['type']=='LineString':series=[geom['coordinates']]
  elif geom['type']=='MultiLineString':series=geom['coordinates']
  else:return
  for seq,coords in enumerate(series):
    coords=slim(coords)
    if len(coords)>=2 and in_bbox(coords):lines.append({'osm_id':str(osm_id)+'_'+str(seq),'name':str(tags.get('name') or tags.get('name:zh') or ''),'ref':str(tags.get('ref') or ''),'highway':highway if highway in ALLOWED else '', 'railway':railway if railway in RAIL else '', 'geometry':coords})

def ingest_geojson(path):
  data=json.loads(path.read_text('utf-8'));lines=[]
  for i,f in enumerate(data.get('features',[])):
    p=f.get('properties') or {};g=f.get('geometry') or {}
    if 'type'in g:add(lines,p,g,p.get('osm_id',i))
  return lines

def ingest_gpkg(path):
  try:import pyogrio
  except ImportError:sys.exit('读取 GeoPackage 需先安装 pyogrio：pip install pyogrio')
  # Geofabrik distribution often names its line layer gis_osm_roads_free_1.
  src=str(path)
  if path.suffix=='.zip':
    with zipfile.ZipFile(path) as z:gpkg=next((x for x in z.namelist() if x.endswith('.gpkg')),None)
    if not gpkg:sys.exit('ZIP 中没有 GeoPackage 文件')
    src='/vsizip/'+str(path)+'/'+gpkg
  layers=pyogrio.list_layers(src)[:,0].tolist()
  use=[name for name in layers if 'roads' in name.lower() or 'railways' in name.lower()]
  if not use:sys.exit('数据包中未找到道路或铁路图层，可先转换为 GeoJSON 再导入；图层：'+', '.join(layers))
  lines=[]
  for layer in use:
    df=pyogrio.read_dataframe(src,layer=layer,bbox=BBOX)
    if df.crs and df.crs.to_epsg()!=4326:df=df.to_crs('EPSG:4326')
    for i,row in df.iterrows():
      geom=row.geometry
      if geom is None:continue
      tags={k:row.get(k) for k in ('fclass','highway','railway','name','ref')}
      if 'railways' in layer.lower() and not tags.get('railway'):tags['railway']=str(tags.get('fclass') or 'rail')
      if 'railways' in layer.lower():tags['highway']=''
      add(lines,tags,geom,row.get('osm_id',i))
  return lines

def ingest_overpass():
  # Three smaller requests avoid one oversized API response; results may be incomplete.
  cells=[(25.33,105.37,25.80,106.01),(25.33,106.01,25.85,106.67),(25.33,106.67,26.08,107.08)]
  lines=[]
  for south,west,north,east in cells:
    classes='|'.join(ALLOWED)
    query=f'[out:json][timeout:80];way["highway"~"^({classes})$"]({south},{west},{north},{east});out geom;'
    req=urllib.request.Request('https://overpass-api.de/api/interpreter',data=urllib.parse.urlencode({'data':query}).encode(),headers={'User-Agent':'Guizhou-Dual-Project-Research/14 (open-data education)','Content-Type':'application/x-www-form-urlencoded'})
    with urllib.request.urlopen(req,timeout=110) as response:result=json.load(response)
    for el in result.get('elements',[]):
      coords=[[point['lon'],point['lat']] for point in el.get('geometry',[]) if 'lon'in point and 'lat'in point]
      if len(coords)>1:add(lines,el.get('tags') or {},{'type':'LineString','coordinates':coords},el.get('id',''))
    query_rail=f'[out:json][timeout:80];way["railway"~"^(rail|light_rail|tram|subway|narrow_gauge)$"]({south},{west},{north},{east});out geom;'
    rq=urllib.request.Request('https://overpass-api.de/api/interpreter',data=urllib.parse.urlencode({'data':query_rail}).encode(),headers={'User-Agent':'Guizhou-Dual-Project-Research/15 (open-data education)','Content-Type':'application/x-www-form-urlencoded'})
    try:
      with urllib.request.urlopen(rq,timeout=110) as response:rail_result=json.load(response)
      for el in rail_result.get('elements',[]):
        coords=[[pt['lon'],pt['lat']] for pt in el.get('geometry',[]) if 'lon' in pt and 'lat' in pt]
        if len(coords)>1:add(lines,el.get('tags') or {},{'type':'LineString','coordinates':coords},el.get('id',''))
    except Exception as exc:print('铁路数据子区未成功：'+str(exc),file=sys.stderr)
    print(f'子区域请求完成：当前 {len(lines)} 条道路／铁路线段')
  return lines

def build(lines,source,source_hash):
  if not lines:sys.exit('没有道路与铁路数据，未覆盖原本的文件')
  # Deduplicate line fragments; prioritize important public roads.
  distinct={}
  for road in lines:distinct[(road['osm_id'],road['highway'],tuple(map(tuple,road['geometry'])))]=road
  lines=sorted(distinct.values(),key=lambda x:(RANK.get(x['highway'],99), x['osm_id']))
  railways=[x for x in lines if x.get('railway') in RAIL]
  lines=[x for x in lines if x['highway'] in ALLOWED]
  # Main renderer caps at 1600 segments; preserve density in that first slice.
  result={'status':'osm-odbl','source':'© OpenStreetMap contributors, ODbL 1.0','source_url':'https://www.openstreetmap.org/copyright','extracted_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_file':source,'sha256':source_hash,'bbox':list(BBOX),'data_meaning':'OSM road centre-line segments, NOT a routed FAST-Huajiang itinerary','lines':lines,'railways':railways}
  OUTPUT.write_text('window.SpatialApp=window.SpatialApp||{};window.SpatialApp.OpenRoads='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n','utf-8')
  (OUTPUT.parent/'offline_roads_provenance.json').write_text(json.dumps({k:v for k,v in result.items() if k not in ('lines','railways')}|{'count':len(lines),'railway_count':len(railways)},indent=2,ensure_ascii=False),'utf-8')
  print(f'写入 {len(lines)} 条开放道路及 {len(railways)} 条铁路折线，文件 {OUTPUT.stat().st_size//1024} KB。请保留 © OpenStreetMap contributors / ODbL 署名。')

def main():
  ap=argparse.ArgumentParser();ap.add_argument('--input',type=pathlib.Path);ap.add_argument('--overpass',action='store_true');a=ap.parse_args()
  if bool(a.input)==bool(a.overpass):ap.error('必须选择 --input <本地GeoJSON/GPKG文件> 或 --overpass')
  if a.input:
    if not a.input.is_file():sys.exit('找不到文件：'+str(a.input))
    hash=hashlib.sha256(a.input.read_bytes()).hexdigest()
    lines=ingest_geojson(a.input) if a.input.suffix.lower() in ('.geojson','.json') else ingest_gpkg(a.input)
    build(lines,str(a.input),hash)
  else:
    try:lines=ingest_overpass()
    except Exception as exc:sys.exit('开放路网下载失败；没有改动原地图：'+str(exc))
    build(lines,'OpenStreetMap Overpass','response-stream')
if __name__=='__main__':main()
