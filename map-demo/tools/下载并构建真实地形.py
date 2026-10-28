#!/usr/bin/env python3
"""在可联网的用户电脑下载 Mapzen AWS Terrarium 高程瓦片，双线性插值后输出离线真实高程 JS。
坐标为 WGS84，网格局部 X=东 Z=北。保留原数据库；只替换地形 Y，其他建筑/路网不做实测配准。
无网络或下载失败时保持原场景与原地形文件，不生成伪DEM。可通过 --test-offline 验证算法。
"""
from __future__ import annotations
import argparse, hashlib, json, math, time, sys, tempfile
from pathlib import Path
from io import BytesIO
from urllib.request import Request,urlopen
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
SOURCE='https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
COORDS={'fast':{'lat':25.6528077,'lon':106.8566259},'huajiang':{'lat':25.704722,'lon':105.588056}}

def tilexy(lat,lon,z):
 lat=math.radians(max(-85.05,min(85.05,lat)));n=2**z
 return (lon+180)/360*n,(1-math.asinh(math.tan(lat))/math.pi)/2*n

def tile_rgb_height(pixel):
 r,g,b=pixel
 return r*256+g+b/256-32768

def sample(tiles,lat,lon,z):
 tx,ty=tilexy(lat,lon,z);tX,tY=int(tx),int(ty);size=256
 px=(tx-tX)*size;py=(ty-tY)*size
 ix,iy=math.floor(px),math.floor(py);dx,dy=px-ix,py-iy
 def color(x,y):
  ox,oy=divmod(x,size);px0=oy
  oy2,py0=divmod(y,size)
  t=tiles.get((tX+ox,tY+oy2));
  if t is None:raise RuntimeError('瓦片边界缺失，下载不完整')
  return tile_rgb_height(t.getpixel((px0,py0)))
 a=color(ix,iy);b=color(ix+1,iy);c=color(ix,iy+1);d=color(ix+1,iy+1)
 return a*(1-dx)*(1-dy)+b*dx*(1-dy)+c*(1-dx)*dy+d*dx*dy

def main():
 ap=argparse.ArgumentParser()
 ap.add_argument('--zoom',type=int,choices=[11,12,13,14],default=13)
 ap.add_argument('--grid',type=int,choices=[97,129,145,161,193],default=145)
 ap.add_argument('--test-offline',action='store_true')
 args=ap.parse_args()
 if args.test_offline:
  with tempfile.TemporaryDirectory() as td:
   im=Image.new('RGB',(256,256),(129,80,0));tx,ty=tilexy(25.65,106.85,12)
   tiles={(int(tx)+xx,int(ty)+yy):im for xx in range(2) for yy in range(2)}
   assert abs(sample(tiles,25.65,106.85,12)-(129*256+80-32768))<.1
   assert tile_rgb_height((128,0,0))==0
  print('DEM Tilexy、Terrarium 解码与双线性插值测试通过。未获取真实地形。');return
 import requests
 seed=json.loads((ROOT/'database/seed_data.json').read_text('utf-8'))
 cache=ROOT/'assets/data/terrain_cache';cache.mkdir(exist_ok=True,parents=True)
 session=requests.Session();session.headers.update({'User-Agent':'Guizhou-Fieldwork-Terrain/2.0 educational noncommercial'})
 grids={};source_records=[]
 for site in ('fast','huajiang'):
  rows=[r for r in seed['terrain_samples'] if r['site_id']==site]
  if not rows:raise ValueError(f'{site}: 缺少原始网格')
  x0,x1=min(r['scene_x'] for r in rows),max(r['scene_x'] for r in rows)
  z0,z1=min(r['scene_z'] for r in rows),max(r['scene_z'] for r in rows)
  co=COORDS[site];lat,lon=co['lat'],co['lon'];n=args.grid
  coords=[(lat+((z0+(z1-z0)*gz/(n-1))/111320),lon+(x0+(x1-x0)*gx/(n-1))/(111320*math.cos(math.radians(lat)))) for gz in range(n) for gx in range(n)]
  # collect four neighboring tiles per bilinear sample, dedup and fetch only needed tiles
  required=set()
  for a,b in coords:
   tx,ty=tilexy(a,b,args.zoom);ix,iy=math.floor(tx*256),math.floor(ty*256)
   for xx in [ix,ix+1]:
    for yy in [iy,iy+1]:required.add((xx//256,yy//256))
  tiles={}
  for x,y in sorted(required):
   name=f'{args.zoom}_{x}_{y}.png';path=cache/name;url=SOURCE.format(z=args.zoom,x=x,y=y)
   if not path.exists():
    resp=session.get(url,timeout=25);resp.raise_for_status()
    if not resp.content.startswith(b'\x89PNG'):raise RuntimeError('远端没有返回 PNG 高程瓦片: '+url)
    path.write_bytes(resp.content)
   data=path.read_bytes();tiles[x,y]=Image.open(BytesIO(data)).convert('RGB')
   source_records.append({'site':site,'url':url,'sha256':hashlib.sha256(data).hexdigest(),'cache_file':name})
  heights=[sample(tiles,a,b,args.zoom) for a,b in coords]
  ci=(n//2)*n+n//2;center=heights[ci]
  orig=min(rows,key=lambda r:abs(r['scene_x'])+abs(r['scene_z']))['elevation']
  # existing scene originally uses relative Y based on original center. Retain its datum for compatibility.
  original_y=float(orig)
  offset=original_y-center
  samples=[[round(x0+(x1-x0)*gx/(n-1),3),round(heights[gz*n+gx]+offset,3),round(z0+(z1-z0)*gz/(n-1),3)] for gz in range(n) for gx in range(n)]
  grids[site]={'n':n,'samples':samples,'data_status':'MAPZEN_TERRARIUM_GEOREFERENCED_VERTICAL_SHIFT','center_lat':lat,'center_lon':lon,'dem_center_m':round(center,3),'scene_y_offset_m':round(offset,3),'min_dem_m':round(min(heights),3),'max_dem_m':round(max(heights),3),'sample_spacing_m':round((x1-x0)/(n-1),2),'axis':'scene_x=east, scene_z=north','note':'相对高差来自公开高程瓦片；统一垂直平移保持旧场景坐标，桥梁/建筑/道路未测绘配准。'}
  print(site,f'{n}x{n}',f'高程 {min(heights):.1f}—{max(heights):.1f}m','瓦片',len(tiles))
 out={'source':'Mapzen/Tilezen Terrain Tiles on AWS Open Data','source_url':'https://registry.opendata.aws/terrain-tiles/','access_date':time.strftime('%Y-%m-%d'),'zoom':args.zoom,'grid_size':n,'attribution':'Mapzen/Tilezen，原始来源包含 SRTM 等；见 docs/DEM_真实高程集成说明.md','grids':grids,'source_tiles':source_records}
 target=ROOT/'assets/data/real_elevation.js';temp=target.with_suffix('.js.tmp');temp.write_text('window.SPATIAL_REAL_ELEVATION='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n','utf-8');temp.replace(target)
 print('真实高程文件写入:',target,'全部瓦片来源与哈希已记录。')
if __name__=='__main__':
 try:main()
 except Exception as exc:print('未生成真实高程，原工程文件未修改：',exc,file=sys.stderr);sys.exit(2)
