/* V14 — three documented road sections, not a fictitious end-to-end navigation network. */
(function(NS){'use strict';
const $=id=>document.getElementById(id),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const P=(id,name,x,y,type,road,note,site)=>({id,name,x,y,type,road,note,site});
const FAST=P('fast','中国天眼',96,132,'place','平塘县克度镇','500米口径球面射电望远镜位于大窝凼；科研核心设施并非普通车辆可自由进入的区域。','fast');
const G552=P('g552','G552 国道',178,174,'road','G552 国道','公开规划提及中国天眼景区与天眼收费站方向的国道接入关系。');
const TOLL=P('toll','天眼收费站方向',280,201,'road','余安高速天眼收费站方向','景区规划给出接入方向；这里是公路科普章节，并非收费站精确坐标。');
const S315=P('s315','S315 省道',169,265,'road','S315 省道','公开规划提及中国天眼景区联系边阳收费站的省道方向。');
const BIANYANG=P('bianyang','边阳收费站方向',280,333,'road','S315 接入方向','景区规划说明边阳方向公路接续，本章节不提供导航轨迹。');
const BR=P('bridge','花江峡谷大桥',617,205,'place','六枝至安龙高速公路','世界级峡谷桥梁，2025年9月28日通车；桥梁所在公路是六枝至安龙高速。','huajiang');
const WEST=P('bridge_west','大桥一侧',515,238,'road','六枝至安龙高速公路','大桥所在高速的桥头方向教学节点，不表示实际收费站、互通或测绘位置。','huajiang');
const EAST=P('bridge_east','大桥另一侧',731,251,'road','六枝至安龙高速公路','大桥另一桥头方向；该像素地图将桥体与道路位置概括绘制。','huajiang');
const Y=P('yundu','云渡服务区',736,339,'scenic','花江峡谷大桥周边','桥旅融合相关服务空间。','yundu');
const K=P('keli','科力寨',531,342,'scenic','花江峡谷大桥周边村寨','田野研究所涉及的村寨，不能直接推断货车可以进入村内。','keli');
const X=P('xiao','小花江村',632,380,'scenic','花江峡谷大桥周边村寨','田野研究所涉及的地方社会和旅游业态。','xiaohuajiang');
const VIEW=P('fast_view','天眼景区观景方向',84,65,'scenic','平塘县中国天眼景区','公众访问应遵守景区电磁宁静区管理规定。','fast');
const routes={
 g552:{name:'G552 国道 · 天眼收费站方向',color:'#f4d48a',stops:[FAST,G552,TOLL],description:'中国天眼景区的国道接入方向；像素路形不是实测中心线。'},
 s315:{name:'S315 省道 · 边阳收费站方向',color:'#91e3e9',stops:[FAST,S315,BIANYANG],description:'中国天眼景区的省道接入方向；与 G552 为不同的道路观察章节。'},
 liuan:{name:'六枝至安龙高速 · 花江桥段',color:'#f2a8d6',stops:[WEST,BR,EAST],description:'花江峡谷大桥是六枝至安龙高速公路的控制性工程。'}
};
const everything=[FAST,G552,TOLL,S315,BIANYANG,BR,WEST,EAST,Y,K,X,VIEW];
const docs={fast:'https://www.most.gov.cn/dfkj/hb/zxdt/201609/t20160928_127978.html',bridge:'https://wap.sasac.gov.cn/n2588025/n2588124/c34629198/content.html',g552:'https://www.gzpt.gov.cn/IGI/upload/file/2025/06/11/U020250611624916265022.pdf',s315:'https://www.gzpt.gov.cn/IGI/upload/file/2025/06/11/U020250611624916265022.pdf'};
const Pixel={openState:false,routeId:null,direction:1,position:0,moving:false,paused:false,raf:0,zoom:1,found:new Set(),targetIndex:null,
 open(){if(!NS.state?.entered){NS.App.enterMap();setTimeout(()=>this.open(),1200);return}if(NS.Drive?.active)return;
  this.openState=true;this.routeId=null;this.position=0;this.direction=1;this.paused=false;this.moving=false;this.found.clear();this.zoom=1;
  $('pixelTruckGame').hidden=false;document.body.classList.add('pixel-is-open');this.render();$('pixelClose').focus({preventScroll:true});},
 close(){this.openState=false;this.moving=false;cancelAnimationFrame(this.raf);this.raf=0;this.closePlace();$('pixelTruckGame').hidden=true;document.body.classList.remove('pixel-is-open')},
 route(){return routes[this.routeId]},points(){const p=this.route()?.stops||[];return this.direction===1?p:[...p].reverse()},
 selectRoute(id){if(!routes[id])return;cancelAnimationFrame(this.raf);this.moving=false;this.paused=false;this.routeId=id;this.direction=1;this.position=0;this.render();this.message('已选择「'+routes[id].name+'」。点击任意发光地标查看资料，点击“驶向下一站”移动货车。');},
 message(s){$('pixelMessage').textContent=s},
 reverse(){if(!this.routeId)return this.message('请先选择公路章节。');cancelAnimationFrame(this.raf);this.moving=false;this.direction*=-1;this.position=0;this.render();this.message('已切换章节内返程，货车将从另一端逐站出发。')},
 transfer(){const next=this.routeId==='liuan'?'g552':'liuan';this.selectRoute(next);this.message('已切换到「'+routes[next].name+'」章节。中间的虚线代表游戏切换，不是已经核实的跨区公路；车辆不会沿虚线行驶。');},
 reset(){cancelAnimationFrame(this.raf);this.moving=false;this.paused=false;this.position=0;this.render();this.message('重新开始本章节；所有地标仍可自由点击。')},
 pause(){this.paused=!this.paused;if(!this.paused&&this.moving)this.animate();this.render();this.message(this.paused?'已暂停，地图地点仍可点击。':'已继续。')},
 zoomBy(delta){this.zoom=clamp(this.zoom+delta,1,1.55);$('pixelMapContent').style.transform=`scale(${this.zoom})`;this.message(this.zoom===1?'显示地图全貌。':'地图已放大，可继续选择地标。')},
 drive(){if(!this.routeId)return this.message('请先选择 G552、S315 或六安高速花江段。');if(this.paused)return this.message('请先点击“继续”。');if(this.moving)return;let end=this.points().length-1;if(this.position>=end)return this.message('本章节已完成！可点击“返程”或选择其他公路章节。');this.targetIndex=Math.min(end,Math.floor(this.position)+1);this.moving=true;this.animate();},
 animate(){if(!this.moving||!this.openState||this.paused)return;let prev=0;
  const frame=now=>{if(!this.openState||this.paused||!this.moving)return;const dt=prev?Math.min(60,now-prev):16;prev=now;this.position=Math.min(this.targetIndex,this.position+dt/1250);
  if(this.position>=this.targetIndex){this.position=this.targetIndex;this.moving=false;let s=this.points()[this.position];this.found.add(s.id);this.message('抵达「'+s.name+'」：点击地图标记查看相关道路和地方资料。')}
  this.draw();$('pixelProgress').textContent=Math.round(this.position/(this.points().length-1)*100)+'%';if(!this.moving)this.render();if(this.moving)this.raf=requestAnimationFrame(frame)};this.raf=requestAnimationFrame(frame)},
 nodes(){return everything},
 render(){if(!this.openState)return;document.querySelectorAll('[data-pixel-route]').forEach(btn=>{const on=btn.dataset.pixelRoute===this.routeId;btn.classList.toggle('is-selected',on);btn.setAttribute('aria-pressed',String(on))});
  $('pixelRoad').textContent=this.route()?.name||'选择公路章节';$('pixelProgress').textContent=this.route()?Math.round(this.position/(this.points().length-1)*100)+'%':'未出发';$('pixelPlace').textContent=this.route()?this.points()[Math.min(Math.floor(this.position),this.points().length-1)].name:'选择公路章节';$('pixelScore').textContent='已查看 '+this.found.size+' 处';$('pixelPause').textContent=this.paused?'▶ 继续':'Ⅱ 暂停';
  const holder=$('pixelMapMarkers');holder.replaceChildren();const selected=new Set(this.route()?.stops.map(p=>p.id)||[]);
  for(const p of this.nodes()){const b=document.createElement('button');b.type='button';b.className='pixel-marker '+p.type+(selected.has(p.id)?' is-route':'');b.style.left=p.x/8+'%';b.style.top=p.y/4.6+'%';b.setAttribute('aria-label','打开 '+p.name+' 的地点档案');b.innerHTML='<span class="pixel-pin" aria-hidden="true"></span><b></b>';b.querySelector('b').textContent=p.name;b.addEventListener('click',()=>this.openPlace(p));holder.appendChild(b)}
  const list=$('pixelStops');list.replaceChildren();let ordered=[...(this.route()?.stops||[]),...everything.filter(p=>!selected.has(p.id)&&p.type!=='road')];
  for(const p of ordered){const b=document.createElement('button');b.type='button';b.className='pixel-stop '+p.type+(selected.has(p.id)?' is-route':'');b.textContent=(selected.has(p.id)?'◆ ':'○ ')+p.name+'　›';b.addEventListener('click',()=>this.openPlace(p));list.appendChild(b)}
  $('pixelDataStatus').textContent=this.route()?this.route().description+'　地图中其他圆点为可独立探索的地点，不意味着车辆经过。':'可以通过中央的“切换道路章节”进入另一片区；虚线只是游戏切换路径，不是实际交通路线。';this.draw()},
 draw(){const c=$('pixelWorld'),ctx=c?.getContext('2d');if(!ctx)return;const w=800,h=460;ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,w,h);const R=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h)};
  // This entire pixel-art scene is a visual metaphor, NOT generated from OSM geometry.
  R(0,0,w,h,'#214856');for(let y=0;y<h;y+=24)R(0,y,w,2,'#2b5868');for(let x=0;x<w;x+=32)R(x,0,2,h,'#245060');
  for(let i=0;i<9;i++){const y=35+i*28;ctx.fillStyle=i%2?'#376b72':'#32606c';ctx.beginPath();ctx.moveTo(0,y);for(let x=0;x<=800;x+=24)ctx.lineTo(x,y+Math.sin(x/69+i)*18);ctx.lineTo(800,y+42);ctx.lineTo(0,y+42);ctx.fill()}
  // Left chapter: two separate roads out of FAST, no fictional connector between districts.
  const path=(arr,color,width)=>{ctx.beginPath();arr.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle='#173243';ctx.lineWidth=width+6;ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();ctx.strokeStyle='#f2e2af';ctx.lineWidth=1;ctx.setLineDash([9,13]);ctx.stroke();ctx.setLineDash([])};
  path([[96,132],[135,146],[178,174],[233,185],[280,201]],this.routeId==='g552'?'#ffcf82':'#6e9394',this.routeId==='g552'?10:5);
  path([[96,132],[138,211],[169,265],[222,294],[280,333]],this.routeId==='s315'?'#91e5ea':'#729c9a',this.routeId==='s315'?10:5);
  // A clearly marked GAME-CHAPTER transfer (not drivable) visually connects the two panels.
  // Never interpret this dotted connector as an OSM road or a validated itinerary.
  ctx.save();ctx.strokeStyle='#ffe5a8';ctx.globalAlpha=.85;ctx.lineWidth=4;ctx.setLineDash([4,9]);
  ctx.beginPath();ctx.moveTo(289,211);ctx.bezierCurveTo(326,170,364,163,402,214);ctx.bezierCurveTo(437,258,470,271,515,238);ctx.stroke();ctx.restore();
  R(302,139,124,19,'#123b4a');ctx.fillStyle='#f6edbf';ctx.font='bold 12px sans-serif';ctx.fillText('游戏章节切换 ⇄',311,153);
  // Right chapter: an independent locally documented road section; no continuous road is asserted.

  path([[515,238],[563,226],[617,205],[678,220],[731,251]],this.routeId==='liuan'?'#ffabd7':'#798c99',this.routeId==='liuan'?12:6);
  R(596,188,8,44,'#f5dca1');R(675,195,8,41,'#f5dca1');ctx.beginPath();ctx.moveTo(600,192);ctx.quadraticCurveTo(637,226,679,199);ctx.strokeStyle='#e9e3c5';ctx.lineWidth=3;ctx.stroke();
  // Pixel trees and hamlets, drawn only as visual atmosphere.
  for(let i=0;i<63;i++){const x=(i*137+71)%780,y=(i*79+47)%430;if((x>95&&x<300)||(x>504&&x<737)){R(x,y,3,9,'#305841');R(x-8,y-8,18,13,i%4?'#6fa17d':'#8eae81')}}
  for(const [x,y] of [[82,95],[246,265],[516,332],[711,337]]){R(x,y,21,14,'#e8bc85');R(x+4,y-9,13,9,'#c47c70');R(x+8,y+5,5,9,'#3a5264')}
  if(this.route()){const p=this.points(),idx=Math.min(p.length-2,Math.floor(this.position)),q=Math.min(1,this.position-idx),a=p[idx],b=p[idx+1];this.drawTruck(ctx,a.x+(b.x-a.x)*q,a.y+(b.y-a.y)*q,Math.atan2(b.y-a.y,b.x-a.x))}
  R(12,12,309,28,'#0a273a');ctx.fillStyle='#ffe4aa';ctx.font='bold 15px sans-serif';ctx.fillText('贵州双工程 · 三条公路独立章节',22,32);
  R(12,44,340,22,'#143849');ctx.fillStyle='#d3efed';ctx.font='12px sans-serif';ctx.fillText('公路线形为教学插画；虚线表示章节切换而非道路',20,59);
 },
 drawTruck(ctx,x,y,a){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle='#061c27';ctx.fillRect(-26,-18,54,34);ctx.fillStyle='#e9b66d';ctx.fillRect(-26,-14,38,27);ctx.fillStyle='#3ab8c2';ctx.fillRect(11,-12,17,23);ctx.fillStyle='#d9fcf6';ctx.fillRect(16,-8,9,7);ctx.fillStyle='#1c3641';for(const yy of [-19,14])for(const xx of [-17,13])ctx.fillRect(xx,yy,12,6);ctx.restore()},
 openPlace(s){this.found.add(s.id);$('pixelScore').textContent='已查看 '+this.found.size+' 处';$('pixelPlaceTitle').textContent=s.name;$('pixelPlaceIntro').textContent=s.note;$('pixelPlaceRoad').textContent=s.road||'片区';$('pixelPlaceType').textContent=s.type==='scenic'?'村寨与景点':s.type==='road'?'道路科普点':'基础设施';
  let href=docs[s.id]||(['bridge_west','bridge_east','yundu','keli','xiao'].includes(s.id)?docs.bridge:docs.g552);
  $('pixelPlaceEvidence').replaceChildren();const strong=document.createElement('strong');strong.textContent='资料与使用范围';const p=document.createElement('p');p.textContent='公路名称与工程事实见公开资料；像素地点和道路线形为示意绘画，不作为路线导航、通行许可或精确定位依据。';const a=document.createElement('a');a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.textContent='查阅相关公开资料 ↗';$('pixelPlaceEvidence').append(strong,p,a);
  const dest={fast:['fast','fast_core'],fast_view:['fast','fast_core'],bridge:['huajiang','bridge_core'],yundu:['huajiang','yundu'],keli:['huajiang','keli_village'],xiao:['huajiang','xiaohuajiang_village']};this.placeDestination=dest[s.id]||null;$('pixelPlaceLocate').hidden=!this.placeDestination;$('pixelPlaceDialog').hidden=false;$('pixelPlaceClose').focus({preventScroll:true})},
 closePlace(){$('pixelPlaceDialog').hidden=true}
};
function init(){if(!$('pixelTruckGame'))return;for(const [id,fn] of [['pixelClose',()=>Pixel.close()],['pixelQuickOpen',()=>Pixel.open()],['pixelPlaceClose',()=>Pixel.closePlace()],['pixelGo',()=>Pixel.drive()],['pixelPause',()=>Pixel.pause()],['pixelReverse',()=>Pixel.reverse()],['pixelReset',()=>Pixel.reset()],['pixelZoomIn',()=>Pixel.zoomBy(.15)],['pixelZoomOut',()=>Pixel.zoomBy(-.15)],['pixelTransfer',()=>Pixel.transfer()]])if($(id))$(id).addEventListener('click',fn);
 $('pixelPlaceLocate').addEventListener('click',()=>{if(!Pixel.placeDestination)return;const [site,node]=Pixel.placeDestination;Pixel.close();NS.App.setSite(site);NS.App.selectNode(node,{focus:true})});document.querySelectorAll('[data-pixel-route]').forEach(btn=>btn.addEventListener('click',()=>Pixel.selectRoute(btn.dataset.pixelRoute)));
 document.addEventListener('keydown',e=>{if(!Pixel.openState)return;if(e.key==='Escape'){if(!$('pixelPlaceDialog').hidden)Pixel.closePlace();else Pixel.close();return}if(!$('pixelPlaceDialog').hidden)return;if(e.key==='ArrowRight'){e.preventDefault();Pixel.drive()}if(e.key===' '){e.preventDefault();Pixel.pause()}})
}document.addEventListener('DOMContentLoaded',init);NS.PixelTruck=Pixel;
})(window.SpatialApp=window.SpatialApp||{});
