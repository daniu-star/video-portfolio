/* V7 P2 - a deliberately simulated, site-local tour, not GNSS or navigation data. */
(function(NS){'use strict';
const M=NS.Math3D;
// The central deck uses the V6 model's y=650 and the conceptual road's east-west orientation.
// Approach ramps are educational staging geometry, not a claim about the as-built carriageway.
const HUAJIANG={
 id:'huajiang_bridge_demo',site:'huajiang',roadId:'la_s57',title:'驶过花江峡谷大桥',
 status:'SIMULATED',source:'V6 场景控制点 + V7 P2 人工校准概念桥面',
 notice:'路线、坡度、车道和驾驶镜头均为概念模拟；非真实导航或实测轨迹。车辆采用简化纵向动力学与有限车道内操控，包含2.4倍教学时间。',
 points:[
 {x:-2140,y:687,z:-60},{x:-1890,y:674,z:-47},{x:-1660,y:660,z:-31},{x:-1450,y:650,z:-15},
 {x:-1080,y:650,z:-7},{x:-710,y:650,z:0},{x:-350,y:650,z:0},{x:0,y:650,z:0},
 {x:350,y:650,z:0},{x:710,y:650,z:0},{x:1080,y:650,z:5},{x:1450,y:650,z:10},
 {x:1640,y:657,z:39},{x:1830,y:666,z:95}
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
 const controls=raw.points,fine=[],prefix=[0];let total=0;
 // A C1 continuous centreline replaces the piecewise straight path.  Dense arc
 // length lookup makes progress proportional to distance instead of segment index.
 const hermite=(i,t)=>{
  const a=controls[i],b=controls[i+1];
  const prev=controls[Math.max(0,i-1)],next=controls[Math.min(controls.length-1,i+2)];
  const d=len(a,b),d0=len(prev,b)||d,d1=len(a,next)||d;
  const tangent0={x:(b.x-prev.x)*d/d0,y:(b.y-prev.y)*d/d0,z:(b.z-prev.z)*d/d0};
  const tangent1={x:(next.x-a.x)*d/d1,y:(next.y-a.y)*d/d1,z:(next.z-a.z)*d/d1};
  const t2=t*t,t3=t2*t,h0=2*t3-3*t2+1,h1=t3-2*t2+t,h2=-2*t3+3*t2,h3=t3-t2;
  return{x:a.x*h0+tangent0.x*h1+b.x*h2+tangent1.x*h3,
         y:a.y*h0+tangent0.y*h1+b.y*h2+tangent1.y*h3,
         z:a.z*h0+tangent0.z*h1+b.z*h2+tangent1.z*h3};
 };
 for(let i=0;i<controls.length-1;i++)for(let j=0;j<36;j++)fine.push(hermite(i,j/36));
 fine.push(controls[controls.length-1]);
 for(let i=1;i<fine.length;i++){total+=len(fine[i-1],fine[i]);prefix.push(total)}
 function at(q){
  const target=M.clamp(q,0,1)*total;
  let lo=0,hi=prefix.length-1;
  while(lo+1<hi){const mid=(lo+hi)>>1;if(prefix[mid]<target)lo=mid;else hi=mid}
  const seg=Math.min(fine.length-2,lo),span=prefix[seg+1]-prefix[seg]||1;
  const t=M.clamp((target-prefix[seg])/span,0,1),a=fine[seg],b=fine[seg+1];
  const pos={x:M.lerp(a.x,b.x,t),y:M.lerp(a.y,b.y,t),z:M.lerp(a.z,b.z,t)};
  const v0=fine[Math.max(0,seg-2)],v1=fine[Math.min(fine.length-1,seg+3)];
  const forward=M.norm({x:v1.x-v0.x,y:v1.y-v0.y,z:v1.z-v0.z});
  const side=M.norm({x:-forward.z,y:0,z:forward.x});
  return{position:pos,forward,side,index:seg,progress:M.clamp(q,0,1)};
 }
 return{...raw,length:total,at,interpolation:'cubic-Hermite-arc-length'};
}

NS.DriveRoutes={bridge:sampler(HUAJIANG),forRoad:(site,id)=>site==='huajiang'&&id==='la_s57'?NS.DriveRoutes.bridge:null};
})(window.SpatialApp=window.SpatialApp||{});
