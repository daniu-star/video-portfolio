/* Read open Mapzen/Tilezen Terrarium elevation pixels directly; no developer keys.
   External CORS or network failures are reported explicitly and do NOT alter the simulated scene. */
(function(NS){'use strict';
const SITES={fast:[25.6528077,106.8566259],huajiang:[25.704722,105.588056]},Z=12;
const tilexy=(lat,lon)=>{const r=Math.PI/180*lat,n=2**Z;return{x:(lon+180)/360*n,y:(1-Math.asinh(Math.tan(r))/Math.PI)/2*n}};
const pos=(site,p)=>{const [lat,lon]=SITES[site];return [lat+p[2]/111320,lon+p[0]/(111320*Math.cos(lat*Math.PI/180))]};
const tileUrl=(x,y)=>`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${x}/${y}.png`;
const status=(msg,loading=false)=>{const e=document.getElementById('terrainTruth');if(!e)return;e.querySelector('.terrain-message').textContent=msg;const b=e.querySelector('button');if(b){b.disabled=loading;b.textContent=loading?'下载中…':'重试获取高程'}};
const image=async(url)=>{const img=new Image();img.crossOrigin='anonymous';return await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('瓦片请求超时')),12000);img.onload=()=>{clearTimeout(timer);const cv=document.createElement('canvas');cv.width=img.naturalWidth;cv.height=img.naturalHeight;const c=cv.getContext('2d',{willReadFrequently:true});try{c.drawImage(img,0,0);const d=c.getImageData(0,0,cv.width,cv.height).data;resolve({d,w:cv.width,h:cv.height})}catch(e){reject(Error('外部瓦片跨域访问受限；可使用离线导入脚本'))}};img.onerror=()=>{clearTimeout(timer);reject(Error('公共高程服务器未能返回瓦片'))};img.src=url})};
const DEM={running:false,loaded:!!NS.TerrainStatus?.real,
 async load(){if(this.running||this.loaded)return;this.running=true;status('正在下载公开高程 · 不需要任何地图密钥…',true);
 const old={fast:NS.DB.terrain.fast,huajiang:NS.DB.terrain.huajiang};
 try{
  const jobs=[],tiles=new Set(),maps={};for(const site of ['fast','huajiang']){
   const g=old[site];maps[site]=g.samples.map(p=>{const [lat,lon]=pos(site,p),{x,y}=tilexy(lat,lon),tx=Math.floor(x),ty=Math.floor(y);tiles.add(tx+','+ty);return {x,y,tx,ty}})
  }
  const cache={};await Promise.all([...tiles].map(async k=>{const [tx,ty]=k.split(',').map(Number);cache[k]=await image(tileUrl(tx,ty))}))
  const result={};for(const site of ['fast','huajiang']){
   const g=old[site],raw=maps[site].map(p=>{const tile=cache[p.tx+','+p.ty],ix=Math.min(tile.w-1,Math.max(0,Math.floor((p.x-p.tx)*tile.w))),iy=Math.min(tile.h-1,Math.max(0,Math.floor((p.y-p.ty)*tile.h))),i=(iy*tile.w+ix)*4,d=tile.d;return d[i]*256+d[i+1]+d[i+2]/256-32768});
   const mid=Math.floor(raw.length/2),anchor=site==='fast'?-75:-80,offset=anchor-raw[mid];
   result[site]={n:g.n,samples:g.samples.map((v,i)=>[v[0],Math.round((raw[i]+offset)*100)/100,v[2]]),data_status:'OPEN_ELEVATION_OFFSET',source:'Mapzen/Tilezen AWS公开高程瓦片',source_url:'https://registry.opendata.aws/terrain-tiles/',notice:'真实高程相对差值；与原模型统一垂直平移，工程结构仍是示意',center_ground_m:raw[mid],vertical_offset_m:offset};
  }
  Object.assign(NS.DB.terrain,result);NS.TerrainStatus.real=true;NS.TerrainStatus.provenance='Mapzen/Tilezen AWS公开高程瓦片';this.loaded=true;
  status('已载入公开高程 · 桥梁建筑仍为概念模型');const e=document.getElementById('terrainTruth');e.querySelector('button').hidden=true;
  NS.App?.engine?.render();
 }catch(err){status('地形仍为模拟：'+err.message);console.info('[公开地形]',err.message)}finally{this.running=false}
 }
};
NS.PublicElevation=DEM;
function init(){const box=document.getElementById('terrainTruth');if(!box)return;box.innerHTML='';const msg=document.createElement('span');msg.className='terrain-message';msg.textContent=DEM.loaded?'已导入公开地形（模型未配准）':'模拟地形 · 可免密钥获取公开高程';box.appendChild(msg);if(!DEM.loaded){const b=document.createElement('button');b.type='button';b.textContent='获取公开地形';b.addEventListener('click',()=>DEM.load());box.appendChild(b)}box.style.pointerEvents='auto';}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window.SpatialApp=window.SpatialApp||{});
