#!/usr/bin/env python3
"""无需高德/Google 密钥：下载公开 Mapzen/Tilezen Terrarium 瓦片，生成离线的场景高程数据。
只获取高程栅格，不把桥梁/道路/建筑声称为测绘数据；须遵守底层提供者版权要求。
"""
import argparse, hashlib, json, math, sys, time
from pathlib import Path
from io import BytesIO
ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
CENTERS = {'fast':(25.6528077,106.8566259),'huajiang':(25.704722,105.588056)}

def tilexy(lat,lon,z):
  lat=math.radians(max(-85.0511,min(85.0511,lat)))
  return ((lon+180)/360*(2**z),(1-math.asinh(math.tan(lat))/math.pi)/2*(2**z))

def meters_to_lon(m,lat):return m/(111320*math.cos(math.radians(lat)))
def meters_to_lat(m):return m/111320

def assemble(session, z, points, cache):
  from PIL import Image
  tiles={}; saved=[]
  for lat,lon in points:
    tx,ty=tilexy(lat,lon,z);key=(int(tx),int(ty))
    if key in tiles:continue
    path=cache/f'{z}_{key[0]}_{key[1]}.png';url=SOURCE.format(z=z,x=key[0],y=key[1])
    if not path.exists():
      last_error=None
      for attempt in range(3):
        try:
          resp=session.get(url, timeout=22,headers={'User-Agent':'GuizhouResearchTerrain/1.0 (educational cache; public data)'})
          resp.raise_for_status()
          if not resp.content.startswith(b'\x89PNG'):
            raise ValueError('返回内容不是 PNG 高程瓦片')
          path.write_bytes(resp.content);break
        except Exception as e:
          last_error=e;time.sleep(.5*(attempt+1))
      if not path.exists():raise RuntimeError(f'无法下载 {url}: {last_error}')
    tile=Image.open(path).convert('RGB');tiles[key]=tile
    saved.append({'url':url,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'file':path.name})
  return tiles,saved

def height(tiles,lat,lon,z):
  x,y=tilexy(lat,lon,z);ix,iy=int(x),int(y)
  pix=tiles[(ix,iy)];size=pix.width;px=min(size-1,max(0,int((x-ix)*size)));py=min(size-1,max(0,int((y-iy)*size)))
  r,g,b=pix.getpixel((px,py));return r*256+g+b/256-32768

def main():
  parser=argparse.ArgumentParser(description='下载无密钥开源高程瓦片，离线生成真实地形')
  parser.add_argument('--zoom',type=int,default=12,choices=[10,11,12,13])
  parser.add_argument('--test-offline',action='store_true',help='用合成瓦片做转换单元测试，绝不输出真实地形')
  args=parser.parse_args()
  if args.test_offline:
    from PIL import Image
    class MockSession:
      def get(self,url,**kwargs):
        class Response:
          content=bytes();status_code=200
          def raise_for_status(self):pass
        b=BytesIO();Image.new('RGB',(256,256),(132,55,0)).save(b,format='PNG');r=Response();r.content=b.getvalue();return r
    import tempfile
    with tempfile.TemporaryDirectory() as td:
      t,s=assemble(MockSession(),12,[(25.65,106.85)],Path(td));assert abs(height(t,25.65,106.85,12)-1079)<1
    print('高程解码、瓦片寻址单元测试通过；未获取真实高程。');return
  import requests
  seed=json.loads((ROOT/'database/seed_data.json').read_text('utf-8'))
  cache=ROOT/'assets/data/terrain_cache';cache.mkdir(parents=True,exist_ok=True)
  grids={};sources=[]
  for site in ('fast','huajiang'):
    lat0,lon0=CENTERS[site];rows=[r for r in seed['terrain_samples'] if r['site_id']==site];rows.sort(key=lambda x:(x['gz'],x['gx']))
    pts=[(lat0+meters_to_lat(v['scene_z']),lon0+meters_to_lon(v['scene_x'],lat0)) for v in rows]
    # 使用瓦片像素表示的地表高程；采样间距取场景现有网格，非原生 DEM 分辨率。
    with requests.Session() as s: tiles,saved=assemble(s,args.zoom,pts,cache)
    elev=[height(tiles,*p,args.zoom) for p in pts]
    center=min(range(len(rows)),key=lambda i:rows[i]['scene_x']**2+rows[i]['scene_z']**2)
    # 明确为模型配准偏移，不能把场景 y 值当作真实海拔。参照场景已有模型的相对视觉布局。
    anchor=(-75 if site=='fast' else -80)
    offset=anchor-elev[center]
    samples=[[r['scene_x'],round(h+offset,3),r['scene_z']] for r,h in zip(rows,elev)]
    grids[site]={'n':max(r['gx'] for r in rows)+1,'samples':samples,'data_status':'OPEN_ELEVATION_OFFSET',
      'latitude':lat0,'longitude':lon0,'terrain_center_m':round(elev[center],2),
      'scene_vertical_offset_m':round(offset,2), 'z_direction':'北','x_direction':'东',
      'notice':'高程为公开地形瓦片采样；经过统一垂直平移以适配原场景，场景中建筑及桥梁未测绘配准。'}
    sources.extend(saved)
    print(f'{site}：{len(rows)} 个地形采样点，源高程范围 {min(elev):.1f}—{max(elev):.1f} 米；瓦片 {len(saved)} 张。')
  out=ROOT/'assets/data/real_elevation.js';data={'source':'Mapzen/Tilezen Terrain Tiles (AWS Open Data)','source_url':'https://registry.opendata.aws/terrain-tiles/',
     'attribution':'© Mapzen 与各高程数据原始提供者。完整权利说明见 docs/地形数据来源与授权.md',
     'access_date':time.strftime('%Y-%m-%d'),'zoom':args.zoom,'grids':grids,'source_tiles':sources}
  out.write_text('window.SPATIAL_REAL_ELEVATION='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n','utf-8')
  print('成功写入',out,'。重新打开或刷新网页即可读取，无需在线 SDK。')
if __name__=='__main__':
 try:main()
 except Exception as e:
  print(f'地形下载未完成：{e}\n请检查网络是否可连接 AWS 公共数据服务器；旧场景会保留且标注为模拟地形。',file=sys.stderr);sys.exit(2)
