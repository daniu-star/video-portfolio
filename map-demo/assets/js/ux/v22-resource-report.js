/* V22 data provenance: reports what was actually loaded, without implying real DEM exists. */
(function(NS){'use strict';
const $=id=>document.getElementById(id);
const format=n=>Number(n||0).toLocaleString('zh-CN');
let previousFocus=null;
function snapshot(){
 const db=NS.DB||{},terra=db.terrain||{};
 const samples=Object.values(terra).reduce((n,t)=>n+(t?.samples?.length||0),0);
 const terrainCount=Object.values(terra).filter(t=>t?.samples?.length).length;
 const offline=NS.OpenRoads||{},real=!!NS.TerrainStatus?.real;
 return {samples,terrainCount,buildings:Object.keys(db.buildings||{}).length,roads:Object.keys(db.roads||{}).length,
  real,roadLoaded:offline.status!=='missing'&&Array.isArray(offline.lines)&&offline.lines.length>0,
  roadFeatures:offline.lines?.length||0};
}
function close(){const box=$('v22Resources');if(box)box.hidden=true;if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});}
function show(){
 previousFocus=document.activeElement;
 let box=$('v22Resources');if(!box){box=document.createElement('section');box.id='v22Resources';box.className='v22-resources';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','v22ResourcesTitle');document.body.appendChild(box)}
 const s=snapshot();box.innerHTML=`<div class="v22-resource-dialog"><header><div><small>工程资源 · 当前加载状态</small><h2 id="v22ResourcesTitle">地形与数据来源</h2></div><button type="button" data-v22-close aria-label="关闭数据状态">关闭 ×</button></header>
 <p>原工程的地形采样、建筑、数据库、配置及导入工具均已保留。这里区分已经加载的数据与尚未提供的真实测绘资源。</p>
 <div class="v22-source-grid"><div><strong>${format(s.samples)}</strong><span>离线地形采样点 · ${format(s.terrainCount)}个区域</span></div><div><strong>${format(s.buildings)}</strong><span>三维建筑实例</span></div><div><strong>${format(s.roads)}</strong><span>道路对象</span></div><div><strong>${s.real?'已加载':'尚未导入'}</strong><span>公开真实高程（DEM）</span></div></div>
 <p>开放道路中心线：${s.roadLoaded?'已加载 '+format(s.roadFeatures)+' 条':'本地未导入'}。当前场景的模拟地形与真实高程不能混为一谈。你可以保留原有演示模式，或使用原工程工具导入经核实的数据。</p>
 <button class="v22-source-action" type="button" data-v22-close>返回我的发现</button></div>`;
 box.hidden=false;box.querySelector('button')?.focus({preventScroll:true});
}
document.addEventListener('click',e=>{
 const open=e.target.closest('[data-v22-resource="open"]');if(open){show();return;}
 if(e.target.closest('[data-v22-close]')||e.target.id==='v22Resources')close();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('v22Resources')&&!$('v22Resources').hidden){e.stopPropagation();close();}});
NS.ResourceReportV22={snapshot,show,close};
})(window.SpatialApp=window.SpatialApp||{});
