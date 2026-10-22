/* V7 P2 - a deliberately simulated, site-local tour, not GNSS or navigation data. */
(function(NS){'use strict';
const M=NS.Math3D;
// The central deck uses the V6 model's y=650 and the conceptual road's east-west orientation.
// Approach ramps are educational staging geometry, not a claim about the as-built carriageway.
const HUAJIANG={
 id:'huajiang_bridge_demo',site:'huajiang',roadId:'la_s57',title:'驶过花江峡谷大桥',
 status:'SIMULATED',source:'V6 场景控制点 + V7 P2 人工校准概念桥面',
 notice:'路线、坡度、车道和驾驶镜头均为概念模拟；非真实导航、实测轨迹或实时路况。驾驶为自动沿线播放，不提供自由操纵。',
 points:[
 {x:-2140,y:777,z:-60},{x:-1890,y:728,z:-47},{x:-1660,y:684,z:-31},{x:-1450,y:650,z:-15},
 {x:-1080,y:650,z:-7},{x:-710,y:650,z:0},{x:-350,y:650,z:0},{x:0,y:650,z:0},
 {x:350,y:650,z:0},{x:710,y:650,z:0},{x:1080,y:650,z:5},{x:1450,y:650,z:10},
 {x:1640,y:692,z:39},{x:1830,y:774,z:95}
 ],
 checkpoints:[
 {at:0,title:'01 · 从概念引桥驶近',text:'从虚拟起点进入桥梁场景。起点并非可供现实导航的高速停车位置。'},
 {at:.19,title:'02 · 抵近桥头',text:'镜头由山地道路转向主桥。道路中心线与引桥坡度均为场景演示。'},
 {at:.32,title:'03 · 看见主塔',text:'主桥跨径约 1420 米。屏幕里桥塔、拉索的位置仍属于演示建模。'},
 {at:.49,title:'04 · 越过峡谷',text:'桥面距水面约 625 米是工程指标；当前峡谷三维地形不具备实测高程精度。'},
 {at:.67,title:'05 · 另一侧的视角',text:'两岸村寨的观看位置、文旅业态与日常出行体验存在差异。'},
 {at:.84,title:'06 · 离开桥面',text:'通行带来新的交通联系，也需要关注连接主路与村庄的不同条件。'},
 {at:.985,title:'07 · 概念终点',text:'旅程抵达虚拟安全终点。接下来可以继续探索小花江、科力寨与桥梁档案。'}
 ]
};
const len=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
function sampler(raw){
 const p=raw.points, lengths=[],prefix=[0];let total=0;
 for(let i=1;i<p.length;i++){const l=len(p[i-1],p[i]);lengths.push(l);total+=l;prefix.push(total)}
 function at(q){const d=M.clamp(q,0,1)*total;let i=lengths.findIndex((l,j)=>d<=prefix[j+1]);if(i<0)i=lengths.length-1;
 const t=M.clamp((d-prefix[i])/(lengths[i]||1),0,1),a=p[i],b=p[i+1],pos={x:M.lerp(a.x,b.x,t),y:M.lerp(a.y,b.y,t),z:M.lerp(a.z,b.z,t)};
 const a2=p[Math.max(0,i-1)],b2=p[Math.min(p.length-1,i+2)];
 // Smooth direction at kinks: interpolate the neighbouring segment directions.
 const va=M.norm({x:b.x-a2.x,y:b.y-a2.y,z:b.z-a2.z}),vb=M.norm({x:b2.x-a.x,y:b2.y-a.y,z:b2.z-a.z});
 const forward=M.norm({x:M.lerp(va.x,vb.x,t),y:M.lerp(va.y,vb.y,t),z:M.lerp(va.z,vb.z,t)});
 const side=M.norm({x:-forward.z,y:0,z:forward.x});return{position:pos,forward,side,index:i,progress:M.clamp(q,0,1)};
 }
 return {...raw,length:total,at};
}
NS.DriveRoutes={bridge:sampler(HUAJIANG),forRoad:(site,id)=>site==='huajiang'&&id==='la_s57'?NS.DriveRoutes.bridge:null};
})(window.SpatialApp=window.SpatialApp||{});
