(function(NS){'use strict';
const M=NS.Math3D,DB=NS.DB,S=NS.state;
class Engine{
 constructor(canvas){
  this.c=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.dpr=Math.min(2,devicePixelRatio||1);
  this.cam=JSON.parse(JSON.stringify(S.camera));this.targetCam=null;this.mouse={down:false,x:0,y:0,moved:false};this.time=0;this.nodeScreens=[];this.buildingScreens=[];this.roadScreens=[];this.hovered=null;this.timelineShock=0;this.temporalWave=0;this.temporalDirection=1;this.lastPulse=S.timelinePulse;this.lastInteraction=performance.now();
  this.bind();this.resize();NS.onState((s,p)=>{if('timelinePulse' in p){this.timelineShock=1;this.lastPulse=p.timelinePulse}});requestAnimationFrame(t=>this.loop(t));
 }
 bind(){
  addEventListener('resize',()=>this.resize());
  this.c.addEventListener('pointerdown',e=>{if(NS.Drive?.active)return;this.lastInteraction=performance.now();this.mouse.down=true;this.mouse.x=e.clientX;this.mouse.y=e.clientY;this.mouse.moved=false;this.c.setPointerCapture(e.pointerId)});
  this.c.addEventListener('pointermove',e=>{if(NS.Drive?.active)return;const dx=e.clientX-this.mouse.x,dy=e.clientY-this.mouse.y;if(this.mouse.down){if(Math.abs(dx)+Math.abs(dy)>3)this.mouse.moved=true;this.cam.yaw-=dx*.006;this.cam.pitch=M.clamp(this.cam.pitch+dy*.004,.18,1.38);this.mouse.x=e.clientX;this.mouse.y=e.clientY}else this.hover(e)});
  this.c.addEventListener('pointerup',e=>{this.mouse.down=false;try{this.c.releasePointerCapture(e.pointerId)}catch(_){}});
  this.c.addEventListener('wheel',e=>{if(NS.Drive?.active){e.preventDefault();return}this.lastInteraction=performance.now();e.preventDefault();this.cam.distance=M.clamp(this.cam.distance*Math.exp(e.deltaY*.001),520,22000)},{passive:false});
  this.c.addEventListener('click',e=>{if(NS.Drive?.active)return;if(!this.mouse.moved)this.pick(e)});
 }
 resize(){const r=this.c.getBoundingClientRect();this.w=Math.max(1,r.width);this.h=Math.max(1,r.height);this.c.width=Math.round(this.w*this.dpr);this.c.height=Math.round(this.h*this.dpr);this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0)}
 temporalPulse(v,delta=.2){this.timelineShock=1;this.temporalWave=1;this.temporalDirection=v>=(this._lastTimeline??v)?1:-1;this._lastTimeline=v;const kick=M.clamp(delta*180,8,65);this.cam.target.y+=this.temporalDirection*kick;this.lastInteraction=performance.now()}
 fly(cam,duration=1.35){this.lastInteraction=performance.now();this.targetCam={from:JSON.parse(JSON.stringify(this.cam)),to:{...cam,target:{...cam.target}},t:0,d:duration}}
 update(dt){
  if(NS.Drive?.active){NS.Drive.advance(dt);return;}
  if(this.targetCam){this.targetCam.t+=dt;const q=M.ease(Math.min(1,this.targetCam.t/this.targetCam.d)),a=this.targetCam.from,b=this.targetCam.to;['yaw','pitch','distance'].forEach(k=>this.cam[k]=M.lerp(a[k],b[k],q));['x','y','z'].forEach(k=>this.cam.target[k]=M.lerp(a.target[k],b.target[k],q));if(q>=1)this.targetCam=null}
  this.timelineShock=Math.max(0,this.timelineShock-dt*1.8);this.temporalWave=Math.max(0,this.temporalWave-dt*1.35);if(!this.targetCam&&S.entered&&performance.now()-this.lastInteraction>6500){this.cam.yaw+=dt*.006*Math.sin(this.time*.18);this.cam.pitch+=dt*.0015*Math.sin(this.time*.11)}
 }
 loop(ts){const dt=Math.min(.05,(ts-(this.last||ts))/1000);this.last=ts;this.time+=dt;if(!NS.FastGame?.active){this.update(dt);this.render()}requestAnimationFrame(t=>this.loop(t))}
 theme(){return DB.themes[S.theme]||DB.themes.nebula}
 timeline(){if(S.site==='overview'){const a=DB.timelineState('fast',S.timeline),b=DB.timelineState('huajiang',S.timeline);return{year_label:`${a.year_label} / ${b.year_label}`,title:'双区域演化',subtitle:'道路与基础设施同步变化',infrastructure:(a.infrastructure+b.infrastructure)/2,roads:(a.roads+b.roads)/2,buildings:(a.buildings+b.buildings)/2,flow:(a.flow+b.flow)/2,atmosphere:(a.atmosphere+b.atmosphere)/2}}return DB.timelineState(S.site,S.timeline)}
 clear(){
  const ctx=this.ctx,T=this.theme(),tl=this.timeline(),g=ctx.createLinearGradient(0,0,this.w,this.h);g.addColorStop(0,T.gradient[0]);g.addColorStop(.42,M.mix(T.gradient[0],T.gradient[1],.68));g.addColorStop(.74,M.mix('#02050c',T.gradient[2]||T.palette.accent,.18+tl.atmosphere*.1));g.addColorStop(1,T.gradient[T.gradient.length-1]);ctx.fillStyle=g;ctx.fillRect(0,0,this.w,this.h);
  const radial=ctx.createRadialGradient(this.w*.35,this.h*.24,0,this.w*.35,this.h*.24,Math.max(this.w,this.h)*.7);radial.addColorStop(0,M.rgba(T.palette.accent,.09+.09*tl.atmosphere));radial.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=radial;ctx.fillRect(0,0,this.w,this.h);
  // cinematic stars / atmospheric points
  ctx.save();ctx.globalAlpha=.13+.12*tl.atmosphere;ctx.fillStyle='#fff';for(let i=0;i<42;i++){const x=(i*137.7+Math.sin(i*9.1)*231)%this.w,y=(i*83.3+Math.cos(i*2.3)*171)%Math.max(80,this.h*.58);ctx.fillRect(x,y,1+(i%7===0),1)}ctx.restore();
  if(this.timelineShock>0){ctx.save();ctx.globalAlpha=this.timelineShock*.11;ctx.fillStyle=T.palette.accent;ctx.fillRect(0,0,this.w,this.h);ctx.restore()}if(this.temporalWave>0){const r=(1-this.temporalWave)*Math.hypot(this.w,this.h)*.72+40;ctx.save();ctx.globalAlpha=this.temporalWave*.48;ctx.strokeStyle=T.palette.hot;ctx.lineWidth=1.5+this.temporalWave*2;ctx.shadowColor=T.palette.accent;ctx.shadowBlur=24;ctx.beginPath();ctx.ellipse(this.w*.5,this.h*.72,r,r*.28,0,0,Math.PI*2);ctx.stroke();ctx.restore()}
 }
 proj(p){return M.project(p,this.cam,this.w,this.h)}
 // Canvas compatibility adapter: approximate visible projected shapes, not 3D ray casting.
 hull(points){const a=points.filter(Boolean).map(p=>({x:p.x,y:p.y,z:p.z})).sort((p,q)=>p.x-q.x||p.y-q.y);if(a.length<3)return[];const cross=(o,p,q)=>(p.x-o.x)*(q.y-o.y)-(p.y-o.y)*(q.x-o.x),lo=[],up=[];for(const p of a){while(lo.length>1&&cross(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}for(let i=a.length-1;i>=0;i--){const p=a[i];while(up.length>1&&cross(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}lo.pop();up.pop();return lo.concat(up)}
 buildingShape(b,growth){const a=b.rotation||0,h=Math.max(1,b.height*growth),corners=[];for(const y of [b.scene_y,b.scene_y+h])for(const xx of [-.5,.5])for(const zz of [-.5,.5]){const o=M.rotateXZ(b.width*xx,b.depth*zz,a);corners.push(this.proj({x:b.scene_x+o.x,y,z:b.scene_z+o.z}))}if(corners.some(p=>!p))return null;const hull=this.hull(corners);if(hull.length<3)return null;return{polygon:hull,depth:Math.min(...corners.map(p=>p.z)),id:'building:'+b.id}}
 drawFeatureOutline(f,color){if(!f||!f.polygon)return;const ctx=this.ctx;ctx.save();ctx.beginPath();f.polygon.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.shadowColor=color;ctx.shadowBlur=15;ctx.stroke();ctx.fillStyle='rgba(255,255,255,.04)';ctx.fill();ctx.restore()}

 line(points,style,width=1,dash=[]){const ps=points.map(p=>this.proj(p)).filter(Boolean);if(ps.length<2)return;const ctx=this.ctx;ctx.save();ctx.beginPath();ctx.moveTo(ps[0].x,ps[0].y);for(let i=1;i<ps.length;i++)ctx.lineTo(ps[i].x,ps[i].y);ctx.strokeStyle=style;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.restore()}
 poly(points,fill,stroke,width=1){const ps=points.map(p=>this.proj(p));if(ps.some(x=>!x))return;const ctx=this.ctx;ctx.beginPath();ctx.moveTo(ps[0].x,ps[0].y);for(let i=1;i<ps.length;i++)ctx.lineTo(ps[i].x,ps[i].y);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}}
 circle3(center,r,y,color,width=1,alpha=1,segments=96){const pts=[];for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;pts.push({x:center.x+Math.cos(a)*r,y,z:center.z+Math.sin(a)*r})}this.ctx.save();this.ctx.globalAlpha=alpha;this.line(pts,color,width);this.ctx.restore()}
 terrainHeight(site,x,z){const t=DB.terrain[site];if(!t||!t.n)return 0;const N=t.n,sm=t.samples;let best=sm[0],bd=Infinity;const span=Math.max(1,N-1),minX=sm[0][0],maxX=sm[N-1][0],minZ=sm[0][2],maxZ=sm[(N-1)*N][2];const gx=Math.round(M.clamp((x-minX)/(maxX-minX),0,1)*span),gz=Math.round(M.clamp((z-minZ)/(maxZ-minZ),0,1)*span);const p=sm[gz*N+gx];return p?p[1]:0}
 renderTerrain(site){
  if(site==='overview')return this.renderOverviewTerrain();const t=DB.terrain[site];if(!t)return;const N=t.n,sm=t.samples,T=this.theme(),ctx=this.ctx,tl=this.timeline();const step=this.cam.distance>5200?4:this.cam.distance>3300?3:2,quads=[];
  for(let z=0;z<N-step;z+=step){for(let x=0;x<N-step;x+=step){const ids=[z*N+x,z*N+x+step,(z+step)*N+x+step,(z+step)*N+x],pts=ids.map(i=>({x:sm[i][0],y:sm[i][1],z:sm[i][2]})),pr=pts.map(p=>this.proj(p));if(pr.some(p=>!p))continue;const dep=pr.reduce((s,p)=>s+p.z,0)/4,h=pts.reduce((s,p)=>s+p.y,0)/4;quads.push({pts,dep,h})}}
  quads.sort((a,b)=>b.dep-a.dep);for(const q of quads){const n=M.clamp((q.h+260)/1150,0,1),base=M.mix(T.palette.terrainLow,T.palette.terrainHigh,n);ctx.globalAlpha=.83+.1*tl.atmosphere;this.poly(q.pts,base,null)}ctx.globalAlpha=1;
  const gridStep=Math.max(4,step*2);for(let z=0;z<N;z+=gridStep){const pts=[];for(let x=0;x<N;x+=step)pts.push({x:sm[z*N+x][0],y:sm[z*N+x][1]+3,z:sm[z*N+x][2]});this.line(pts,M.rgba(T.palette.accent,.075),.65)}
  for(let x=0;x<N;x+=gridStep){const pts=[];for(let z=0;z<N;z+=step)pts.push({x:sm[z*N+x][0],y:sm[z*N+x][1]+3,z:sm[z*N+x][2]});this.line(pts,'rgba(255,255,255,.035)',.55)}
  if(site==='huajiang')this.renderRiver();
 }
 renderOverviewTerrain(){
  // Deliberately illustrative relief (not DEM). Offline DEM import is a separate step.
  const ctx=this.ctx,T=this.theme();
  const rings=[],step=135;
  const h=(x,z)=>{
   const ridge=(Math.sin(x*.00215+Math.cos(z*.0019)*1.15)+Math.cos(z*.0034-x*.0012))*.5;
   const fine=Math.cos(x*.0056-z*.0017)*Math.sin(z*.0067+x*.0013);
   return -120+158*ridge+79*fine+75*Math.exp(-Math.pow((x-860)/960,2)-Math.pow((z+690)/820,2));
  };
  for(let z=-1890;z<=1890;z+=step){const row=[];for(let x=-2700;x<=2700;x+=step)row.push({x,y:h(x,z),z});rings.push(row)}
  const quads=[];
  for(let r=0;r<rings.length-1;r++)for(let c=0;c<rings[r].length-1;c++){
   const q=[rings[r][c],rings[r][c+1],rings[r+1][c+1],rings[r+1][c]];
   const p=q.map(k=>this.proj(k));if(p.some(k=>!k))continue;
   const shade=.54+Math.max(-.2,Math.min(.22,(q[0].y-q[1].y)*.003+(q[0].y-q[3].y)*.002));
   const height=Math.max(0,Math.min(1,((q[0].y+q[1].y+q[2].y+q[3].y)/4+280)/540));
   const color=M.mix('#163e59','#669a9e',Math.max(0,Math.min(1,height*.5+shade*.38)));
   quads.push({q,color,depth:p.reduce((sum,k)=>sum+k.z,0)/4});
  }
  quads.sort((a,b)=>b.depth-a.depth);for(const e of quads)this.poly(e.q,e.color,'rgba(150,213,222,.06)',.35);
  // Exaggerated topographic contour traces emphasize relief. They are decorative, NOT survey contours.
  for(let r=2;r<rings.length-2;r+=3){const line=rings[r].map(p=>({x:p.x,y:p.y+4,z:p.z}));this.line(line,'rgba(169,224,230,.16)',.62)}
  for(let c=2;c<rings[0].length-2;c+=5){const line=rings.map(row=>({x:row[c].x,y:row[c].y+4,z:row[c].z}));this.line(line,'rgba(212,242,234,.11)',.56)}
 }
 renderRiver(){const T=this.theme(),pts=[];for(let z=-2600;z<=2600;z+=120){const x=120*Math.sin(z*.002)+35*Math.sin(z*.009),y=-70+12*Math.sin(z*.004);pts.push({x,y,z})}for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],w=52+22*Math.sin(i*.55);this.poly([{x:a.x-w,y:a.y,z:a.z},{x:a.x+w,y:a.y,z:a.z},{x:b.x+w,y:b.y,z:b.z},{x:b.x-w,y:b.y,z:b.z}],M.rgba(T.palette.hot,.16),M.rgba(T.palette.accent,.14),.5)}this.line(pts,M.rgba(T.palette.accent,.42),1.1)}
 boxRot(b,color,heightScale=1,roof=true){
  const h=Math.max(1,b.height*heightScale),w=b.width/2,d=b.depth/2,a=b.rotation||0,y=b.scene_y;const base=[[-w,-d],[w,-d],[w,d],[-w,d]].map(([x,z])=>{const r=M.rotateXZ(x,z,a);return{x:b.scene_x+r.x,y,z:b.scene_z+r.z}});const top=base.map(p=>({...p,y:y+h}));const faces=[];for(let i=0;i<4;i++){const j=(i+1)%4,poly=[base[i],base[j],top[j],top[i]],pr=poly.map(p=>this.proj(p)).filter(Boolean);if(pr.length===4)faces.push({poly,dep:pr.reduce((s,p)=>s+p.z,0)/4,shade:.72+i*.07})}faces.sort((x,y)=>y.dep-x.dep);faces.forEach(f=>this.poly(f.poly,M.mix('#050812',color,f.shade),M.rgba(color,.15),.5));this.poly(top,M.mix(color,'#ffffff',.18),M.rgba('#ffffff',.08),.5);
  if(roof&&['gable','pitched'].includes(b.roof_type)){const leftMid={x:(top[0].x+top[3].x)/2,y:y+h+b.depth*.22,z:(top[0].z+top[3].z)/2},rightMid={x:(top[1].x+top[2].x)/2,y:y+h+b.depth*.22,z:(top[1].z+top[2].z)/2};this.poly([top[0],top[1],rightMid,leftMid],M.mix(color,'#fff',.28));this.poly([top[3],top[2],rightMid,leftMid],M.mix('#421b18',color,.34))}
 }
 renderWinged(b,growth,col){const a=b.rotation||0;const main={...b,width:b.width*.66,depth:b.depth*.66,height:b.height};this.boxRot(main,col,growth,false);for(const side of [-1,1]){const off=M.rotateXZ(side*b.width*.31,0,a),wing={...b,scene_x:b.scene_x+off.x,scene_z:b.scene_z+off.z,width:b.width*.36,depth:b.depth*.86,height:b.height*.58,rotation:a+side*.18};this.boxRot(wing,M.mix(col,'#ffffff',.08),growth,true)}const crown={x:b.scene_x,y:b.scene_y+b.height*growth+5,z:b.scene_z};this.circle3(crown,b.width*.36,crown.y,M.rgba(col,.7),1.3,.75,34)}
 renderTerraced(b,growth,col){for(let i=0;i<3;i++){const off=M.rotateXZ(0,(i-1)*b.depth*.27,b.rotation||0),q={...b,scene_x:b.scene_x+off.x,scene_z:b.scene_z+off.z,width:b.width*(1-i*.11),depth:b.depth*.43,height:b.height*(.72+i*.14),scene_y:b.scene_y+i*4};this.boxRot(q,M.mix(col,'#ffffff',i*.045),growth,true)}}
 renderCurvedHall(b,growth,col){this.boxRot({...b,height:b.height*.72},col,growth,false);const h=b.scene_y+b.height*.72*growth;for(let i=0;i<=8;i++){const q=i/8,xx=(q-.5)*b.width*.92,off=M.rotateXZ(xx,0,b.rotation||0),r=b.depth*.47*Math.sin(q*Math.PI);this.circle3({x:b.scene_x+off.x,z:b.scene_z+off.z},Math.max(3,r),h+Math.sin(q*Math.PI)*b.height*.16*growth,M.rgba(col,.42),.8,.7,18)}}
 renderConstruction(b,growth,col){this.boxRot({...b,height:b.height*.6},M.rgba(col,.4),growth,false);const h=b.height*growth;for(let y=0;y<h;y+=10){this.line([{x:b.scene_x-b.width*.6,y:b.scene_y+y,z:b.scene_z-b.depth*.6},{x:b.scene_x+b.width*.6,y:b.scene_y+y,z:b.scene_z-b.depth*.6}],M.rgba('#ffcc78',.42),.65)}for(const x of [-.55,.55])for(const z of [-.55,.55])this.line([{x:b.scene_x+b.width*x,y:b.scene_y,z:b.scene_z+b.depth*z},{x:b.scene_x+b.width*x,y:b.scene_y+h,z:b.scene_z+b.depth*z}],M.rgba('#ffcc78',.38),.7)}
 renderVillageCompound(b,growth,col){this.boxRot(b,col,growth,true);if(b.width>22){const a=b.rotation||0,o=M.rotateXZ(b.width*.38,b.depth*.34,a),annex={...b,scene_x:b.scene_x+o.x,scene_z:b.scene_z+o.z,width:b.width*.42,depth:b.depth*.52,height:b.height*.58,rotation:a+.12};this.boxRot(annex,M.mix(col,'#6e5847',.22),growth,true)}}
 renderBuildings(site){
  if(site==='overview')return;this.buildingScreens=[];const T=this.theme(),tl=this.timeline(),all=DB.buildingsBySite[site]||[],draw=[];for(const b of all){const threshold=b.phase_start||0;if(S.timeline<threshold-.08)continue;const raw=M.clamp((S.timeline-threshold+.08)/.18,0,1),growth=M.smooth(raw)*M.clamp(tl.buildings+.35,0,1.15),p=this.proj({x:b.scene_x,y:b.scene_y+b.height*.5*growth,z:b.scene_z});if(!p)continue;draw.push({b,depth:p.z,growth})}draw.sort((a,b)=>b.depth-a.depth);
  for(const {b,growth} of draw){if(this.cam.distance<6400&&growth>.25){const shape=this.buildingShape(b,growth);if(shape)this.buildingScreens.push(shape)}const isVillage=b.building_type==='village_house',base=isVillage?T.palette.village:T.palette.building;let col=base;if(b.facade_style&&b.facade_style.includes('glass'))col=M.mix(base,T.palette.accent,.38);if(b.building_type==='container_shop')col=M.mix(T.palette.hot,'#ffffff',.08);if(b.building_type==='restaurant')col=M.mix(base,'#d39a61',.25);if(b.building_type==='homestay')col=M.mix(base,'#d5b78e',.18);if(b.building_type==='tower'){this.renderTower(b,growth,col);continue}if(b.building_type==='canopy_street'){this.renderCanopyStreet(b,growth);continue}if(b.building_type==='dome'){this.renderDome(b,growth,col);continue}if(b.roof_type==='winged'){this.renderWinged(b,growth,col);continue}if(b.roof_type==='terraced'){this.renderTerraced(b,growth,col);continue}if(b.roof_type==='curved'){this.renderCurvedHall(b,growth,col);continue}if(b.building_type==='homestay_construction'){this.renderConstruction(b,growth,col);continue}if(['village_house','homestay','restaurant'].includes(b.building_type)){this.renderVillageCompound(b,growth,col);continue}this.boxRot(b,col,growth,true);
   if(growth>.7&&b.floors>2&&this.cam.distance<3700){for(let f=1;f<Math.min(b.floors,7);f++){const y=b.scene_y+b.height*growth*f/Math.min(b.floors,7);this.line([{x:b.scene_x-b.width*.44,y,z:b.scene_z-b.depth*.51},{x:b.scene_x+b.width*.44,y,z:b.scene_z-b.depth*.51}],M.rgba('#ffffff',.08),.4)}}
  }
  const chosen=this.buildingScreens.find(f=>f.id===S.selectedFeature),hot=this.buildingScreens.find(f=>f.id===S.hoveredFeature);
  if(hot&&hot!==chosen)this.drawFeatureOutline(hot,M.rgba(T.palette.accent,.7));
  if(chosen)this.drawFeatureOutline(chosen,T.palette.hot);
 }
 renderTower(b,growth,col){const h=b.height*growth,segments=16;for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2,aa=(i+1)/segments*Math.PI*2,r=b.width*.22;const q=[{x:b.scene_x+Math.cos(a)*r,y:b.scene_y,z:b.scene_z+Math.sin(a)*r},{x:b.scene_x+Math.cos(aa)*r,y:b.scene_y,z:b.scene_z+Math.sin(aa)*r},{x:b.scene_x+Math.cos(aa)*r*.72,y:b.scene_y+h,z:b.scene_z+Math.sin(aa)*r*.72},{x:b.scene_x+Math.cos(a)*r*.72,y:b.scene_y+h,z:b.scene_z+Math.sin(a)*r*.72}];this.poly(q,M.rgba(col,.58),M.rgba(col,.2),.5)}if(growth>.7){this.circle3({x:b.scene_x,z:b.scene_z},b.width*.42,b.scene_y+h*.82,col,2,.65,32);this.circle3({x:b.scene_x,z:b.scene_z},b.width*.31,b.scene_y+h,col,2,.7,32)}}
 renderDome(b,growth,col){const levels=7;for(let j=0;j<levels;j++){const q=j/(levels-1),r=b.width*.5*Math.cos(q*Math.PI*.48),y=b.scene_y+b.height*growth*Math.sin(q*Math.PI*.5);this.circle3({x:b.scene_x,z:b.scene_z},r,y,M.rgba(col,.5+.2*q),1,.75,28)}}
 renderCanopyStreet(b,growth){const T=this.theme(),a=b.rotation||0,len=b.width,w=b.depth*.5;for(let i=0;i<=26;i++){const q=i/26,x=(q-.5)*len,r=M.rotateXZ(x,0,a),c={x:b.scene_x+r.x,y:b.scene_y+b.height*growth,z:b.scene_z+r.z},side=M.rotateXZ(0,w,a);this.line([{x:c.x-side.x,y:b.scene_y,z:c.z-side.z},{x:c.x-side.x,y:c.y,z:c.z-side.z},{x:c.x+side.x,y:c.y,z:c.z+side.z},{x:c.x+side.x,y:b.scene_y,z:c.z+side.z}],M.rgba(T.palette.accent,.28),.7)}const r1=M.rotateXZ(-len*.5,0,a),r2=M.rotateXZ(len*.5,0,a);this.line([{x:b.scene_x+r1.x,y:b.scene_y+b.height*growth,z:b.scene_z+r1.z},{x:b.scene_x+r2.x,y:b.scene_y+b.height*growth,z:b.scene_z+r2.z}],T.palette.accent,2)}
 renderRoads3D(site){
  this.roadScreens=[];const roads=DB.roadsBySite[site]||[],T=this.theme(),tl=this.timeline();for(const r of roads){if(S.timeline<(r.phase_start||0)-.12&&site!=='overview')continue;const growth=site==='overview'?tl.roads:M.clamp((S.timeline-(r.phase_start||0)+.12)/.24,0,1)*M.clamp(tl.roads+.3,0,1.2),src=(DB.roadPoints[r.id]||[]),count=Math.max(2,Math.ceil(src.length*M.clamp(.18+growth,.18,1))),pts=src.slice(0,count).map(p=>({x:p.scene_x,y:p.scene_y+5,z:p.scene_z}));if(pts.length<2)continue;const screenPts=pts.map(p=>this.proj(p));if(screenPts.every(Boolean))this.roadScreens.push({id:'road:'+r.id,points:screenPts,width:r.width||10,depth:Math.min(...screenPts.map(p=>p.z))});const w=(r.width||10)*.5*Math.max(.3,growth),isHigh=r.road_class==='expressway';
   for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,px=-dz/l*w,pz=dx/l*w;const top=[{x:a.x+px,y:a.y,z:a.z+pz},{x:a.x-px,y:a.y,z:a.z-pz},{x:b.x-px,y:b.y,z:b.z-pz},{x:b.x+px,y:b.y,z:b.z+pz}];this.poly(top,M.rgba(isHigh?'#3f6376':'#385465',.96),M.rgba('#bee5ef',.56),.85);const side=6+(isHigh?7:2);this.poly([top[1],top[2],{...top[2],y:top[2].y-side},{...top[1],y:top[1].y-side}],M.rgba('#02040a',.76));
    const mid=[{x:(a.x+b.x)/2,y:(a.y+b.y)/2+1,z:(a.z+b.z)/2}];if(i%2===0)this.line([a,b],M.rgba('#eaf6f7',isHigh?.88:.65),isHigh?1.45:1.0,[6,9]);
   }
   // lane/traffic particles always visible, density follows timeline
   const density=Math.max(2,Math.round((isHigh?14:6)*(.22+tl.flow*.9)));for(let k=0;k<density;k++){const q=(this.time*(isHigh?.035:.052)*(0.35+tl.flow)+k/density)%1,p=M.pointOnPolyline(pts,q),sp=this.proj(p);if(sp){this.ctx.save();this.ctx.fillStyle=k%3===0?T.palette.hot:T.palette.accent;this.ctx.globalAlpha=.28+.55*tl.flow;this.ctx.shadowColor=this.ctx.fillStyle;this.ctx.shadowBlur=9+8*tl.flow;this.ctx.beginPath();this.ctx.arc(sp.x,sp.y,isHigh?1.8:1.35,0,7);this.ctx.fill();this.ctx.restore()}}
  }
 }
 renderTransportAssets(site){const T=this.theme(),tl=this.timeline(),assets=DB.transportAssetsBySite[site]||[];if(this.cam.distance>5200&&site!=='overview')return;for(const a of assets){if(S.timeline<(a.phase_start||0)-.04)continue;const p={x:a.scene_x,y:a.scene_y,z:a.scene_z},s=this.proj(p);if(!s||s.scale<.08)continue;const sc=Math.min(1.5,Math.max(.5,a.scale||1));if(a.asset_type==='street_light'){this.line([p,{...p,y:p.y+18*sc}],M.rgba(T.palette.road,.42),.6);const q=this.proj({...p,y:p.y+18*sc});if(q){this.ctx.save();this.ctx.fillStyle=T.palette.accent;this.ctx.globalAlpha=.25+.35*tl.flow;this.ctx.shadowColor=T.palette.accent;this.ctx.shadowBlur=12;this.ctx.beginPath();this.ctx.arc(q.x,q.y,1.5,0,7);this.ctx.fill();this.ctx.restore()}}else if(a.asset_type==='toll_gantry'){this.line([{x:p.x-36,y:p.y,z:p.z},{x:p.x-36,y:p.y+26,z:p.z},{x:p.x+36,y:p.y+26,z:p.z},{x:p.x+36,y:p.y,z:p.z}],T.palette.hot,2)}else if(a.asset_type==='tunnel_portal'){this.circle3({x:p.x,z:p.z},32,p.y,T.palette.accent,2,.45,24)}else{this.ctx.save();this.ctx.fillStyle=M.rgba(T.palette.road,.28);this.ctx.fillRect(s.x-1,s.y-1,2,2);this.ctx.restore()}}
 }
 renderDish(progress){const T=this.theme(),r=250,seg=44,rings=11;for(let j=1;j<=rings;j++){const rr=r*j/rings*progress,y=-35+150*Math.pow(rr/r,2);this.circle3({x:0,z:0},rr,y,M.rgba('#dbe8ee',.26+.22*j/rings),.75,.85,seg)}for(let i=0;i<24;i++){const a=i/24*Math.PI*2,pts=[];for(let j=0;j<=rings;j++){const rr=r*j/rings*progress;pts.push({x:Math.cos(a)*rr,y:-35+150*Math.pow(rr/r,2),z:Math.sin(a)*rr})}this.line(pts,M.rgba(T.palette.accent,.24),.55)}if(progress>.72){const y=140;this.line([{x:-310,y:270,z:-260},{x:0,y,z:0},{x:310,y:270,z:260}],M.rgba('#ffffff',.28),1);this.circle3({x:0,z:0},26,y,T.palette.hot,2,.8,28)}}
 renderQuiet(){if(!S.showQuiet&&S.mode!=='radiation')return;const T=this.theme(),base=525;[5,10,30].forEach((km,i)=>{const pulse=1+Math.sin(this.time*1.2-i*.7)*.016,r=base*(i===0?1:i===1?1.8:3.05)*pulse;this.circle3({x:0,z:0},r,105+i*10,[T.palette.accent,T.palette.hot,'#ffffff'][i],2-i*.25,.38-i*.05,88);this.circle3({x:0,z:0},r*.985,107+i*10,T.palette.accent,.7,.14,88)})}
 renderBridge(progress){
  const T=this.theme(),deckY=650,span=1420,towerX=span/2,full=2890;const deckP=M.clamp((progress-.34)/.4,0,1),towerP=M.clamp((progress-.18)/.3,0,1),cableP=M.clamp((progress-.55)/.33,0,1);
  const start=-full/2,end=start+full*deckP;this.line([{x:start,y:deckY,z:0},{x:end,y:deckY,z:0}],M.mix(T.palette.road,'#ffffff',.2),10);this.line([{x:start,y:deckY+6,z:-16},{x:end,y:deckY+6,z:-16}],T.palette.accent,1.1);this.line([{x:start,y:deckY+6,z:16},{x:end,y:deckY+6,z:16}],T.palette.hot,1.1);
  [-towerX,towerX].forEach(x=>{const h=285*towerP;for(const z of [-54,54])this.line([{x,y:deckY-35,z},{x,y:deckY+h,z}],M.rgba('#eef5f8',.76),8);this.line([{x,y:deckY+h*.58,z:-54},{x,y:deckY+h*.58,z:54}],M.rgba(T.palette.accent,.5),5);this.line([{x,y:deckY+h,z:-54},{x,y:deckY+h,z:54}],M.rgba('#fff',.58),5)});
  if(cableP>0){for(const z of [-64,64]){const pts=[];for(let i=0;i<=80;i++){const q=i/80,x=M.lerp(-towerX,towerX,q),s=(x/towerX),y=deckY+105+185*(s*s);pts.push({x,y,z})}const n=Math.floor(pts.length*cableP);this.line(pts.slice(0,Math.max(2,n)),T.palette.hot,2.3);for(let i=5;i<n-3;i+=5){const p=pts[i];this.line([{x:p.x,y:deckY+8,z:p.z},{x:p.x,y:p.y,z:p.z}],M.rgba(T.palette.accent,.32),.7)}}}
  if(S.measure==='625'){this.line([{x:0,y:deckY,z:0},{x:0,y:25,z:0}],T.palette.accent,2,[8,6])}if(S.measure==='1420'){this.line([{x:-towerX,y:deckY+330,z:0},{x:towerX,y:deckY+330,z:0}],T.palette.hot,2,[8,5])}
 }
 renderRelationFlows(site){const tl=this.timeline();if(!['flow','infrastructure','timeline'].includes(S.mode)&&tl.flow<.42)return;const T=this.theme(),rels=DB.relationsBySite[site]||[];for(const rel of rels){const a=DB.nodes[rel.from_node],b=DB.nodes[rel.to_node];if(!a||!b)continue;const pts=[];for(let i=0;i<=20;i++){const q=i/20;pts.push({x:M.lerp(a.scene_x,b.scene_x,q),y:M.lerp(a.scene_y,b.scene_y,q)+Math.sin(Math.PI*q)*(rel.relation_type.includes('visitor')?55:85),z:M.lerp(a.scene_z,b.scene_z,q)})}this.line(pts,M.rgba(T.palette.accent,.12+.13*tl.flow),.7,[3,6]);const n=Math.max(1,Math.round(1+rel.weight*3*tl.flow));for(let k=0;k<n;k++){const p=M.pointOnPolyline(pts,(this.time*(.035+.04*tl.flow)+k/n)%1),s=this.proj(p);if(s){this.ctx.save();this.ctx.fillStyle=k%2?T.palette.hot:T.palette.accent;this.ctx.globalAlpha=.5+.38*tl.flow;this.ctx.shadowColor=this.ctx.fillStyle;this.ctx.shadowBlur=16;this.ctx.beginPath();this.ctx.arc(s.x,s.y,2.2,0,7);this.ctx.fill();this.ctx.restore()}}}}
 renderTemporalTrails(site){if(this.temporalWave<=0)return;const T=this.theme(),tl=this.timeline(),roads=(DB.roadsBySite[site]||[]).slice(0,6);this.ctx.save();this.ctx.globalCompositeOperation='screen';for(let ri=0;ri<roads.length;ri++){const pts=(DB.roadPoints[roads[ri].id]||[]).map(p=>({x:p.scene_x,y:p.scene_y+13,z:p.scene_z}));if(pts.length<2)continue;const reveal=M.clamp(1-this.temporalWave+ri*.08,0,1),n=Math.max(2,Math.floor(pts.length*reveal));this.ctx.globalAlpha=this.temporalWave*(.12+.1*tl.flow);this.line(pts.slice(0,n),ri%2?T.palette.hot:T.palette.accent,1.2+this.temporalWave*2)}this.ctx.restore()}
 renderNodes(site){
  const T=this.theme(),nodes=DB.nodesBySite[site]||[];this.nodeScreens=[];for(const n of nodes){const s=this.proj({x:n.scene_x,y:n.scene_y+18,z:n.scene_z});if(!s)continue;const selected=S.selected===n.id,hover=S.hovered===n.id,major=['science','bridge','tourism_cluster','service_area','village','landmark','visitor_center'].includes(n.category);if(!major&&this.cam.distance>3000)continue;const r=selected?7:hover?6:major?4.8:3.2,fill=n.data_status==='VERIFIED'?T.palette.accent:T.palette.hot;this.ctx.save();this.ctx.fillStyle=fill;this.ctx.globalAlpha=n.data_status==='VERIFIED'?.95:.75;this.ctx.shadowColor=fill;this.ctx.shadowBlur=selected?25:major?14:8;this.ctx.beginPath();this.ctx.arc(s.x,s.y,r,0,7);this.ctx.fill();this.ctx.globalAlpha=selected?.42:.18;this.ctx.beginPath();this.ctx.arc(s.x,s.y,r+7+Math.sin(this.time*2+n.scene_x)*2,0,7);this.ctx.strokeStyle=fill;this.ctx.lineWidth=1;this.ctx.stroke();this.ctx.restore();if(S.showLabels&&(selected||hover||major&&this.cam.distance<4100)){this.ctx.save();this.ctx.font=selected?'600 12px sans-serif':'11px sans-serif';this.ctx.fillStyle='rgba(255,255,255,.88)';this.ctx.shadowColor='#000';this.ctx.shadowBlur=6;this.ctx.fillText(n.name,s.x+12,s.y+4);this.ctx.restore()}this.nodeScreens.push({id:n.id,x:s.x,y:s.y,r:Math.max(16,r+10),depth:s.z})}
 }
 renderSceneTelemetry(){const tl=this.timeline(),T=this.theme(),ctx=this.ctx;ctx.save();ctx.globalAlpha=.78;ctx.font='9px ui-monospace';ctx.fillStyle=M.rgba(T.palette.accent,.72);const lines=[`${tl.year_label} · ${tl.title}`,`工程 ${(tl.infrastructure*100|0)}%  道路 ${(tl.roads*100|0)}%  建筑 ${(tl.buildings*100|0)}%  流动 ${(tl.flow*100|0)}%`,S.site==='fast'?`${(DB.buildingsBySite.fast||[]).length} 处建筑 · 电磁宁静区分级示意`:S.site==='huajiang'?`${(DB.buildingsBySite.huajiang||[]).length} 处建筑 · 概念高速公路 · 科力寨`:`区域交通联系 · 六安高速等`];lines.forEach((x,i)=>ctx.fillText(x,22,this.h-130+i*14));ctx.restore()}
 renderOverview(){
  this.renderOverviewTerrain();
  this.renderRegionalLinks();
  const T=this.theme();
  const anchors=NS.GeoAnchors||{};
  for(const [key,color] of [['fast',T.palette.accent],['huajiang',T.palette.hot]]){
   const a=anchors[key];if(a){const loc=this.geoOverview(a.lon,a.lat);this.drawBeacon({...loc,y:90},a.name,a.code,color)}
  }
  this.renderNodes('overview');
 }
 // Only render road centre-lines when a real OpenStreetMap extract has been imported.
 // Do not draw a made-up FAST-to-Huajiang highway while that extract is missing.
 geoOverview(lon,lat){
  // Regional coordinates are deliberately compressed and skewed for the 3D display;
  // road geometry itself comes unchanged from its source longitude/latitude.
  return {x:(lon-106.223)*1600,y:56,z:(106.223-lon)*986+(lat-25.68)*1050};
 }
 renderRegionalLinks(){
  const data=NS.OpenRoads;
  const real=data?.status==='osm-odbl'&&Array.isArray(data.lines)&&data.lines.length>0;
  if(!real){this.renderIllustrativeLocalRoads();return;}
  const ctx=this.ctx;
  const weights={motorway:3.7,motorway_link:2.4,trunk:2.8,trunk_link:2,primary:2.25,primary_link:1.4,secondary:1.65,secondary_link:1.2,tertiary:1.05,tertiary_link:.8,unclassified:.72,residential:.65,service:.5};
  const shades={motorway:'#ffe39e',trunk:'#e4bb83',primary:'#b0eef5',secondary:'#73cbdc',tertiary:'#6b9fb2'};
  if(this._osmSorted?.source!==data){
   // Balance source segments by road importance and location rather than cutting all local roads.
   const sorted=[...data.lines].sort((a,b)=>(weights[b.highway]||.5)-(weights[a.highway]||.5));
   const primary=sorted.slice(0,1250);
   const local=sorted.slice(1250).filter((_,i)=>i%Math.max(1,Math.ceil((sorted.length-1250)/420))===0).slice(0,420);
   this._osmSorted={source:data,lines:primary.concat(local)};
  }
  const paint=(road,rail=false)=>{
   const pts=(road.geometry||[]).map(p=>this.proj(this.geoOverview(p[0],p[1]))).filter(Boolean);
   if(pts.length<2)return;
   ctx.save();ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);
   const weight=rail?1.9:(weights[road.highway]||.6);
   ctx.lineWidth=rail?weight+2:weight+1.2;ctx.strokeStyle=rail?'#072b39':'#173b49';ctx.globalAlpha=.85;ctx.stroke();
   ctx.strokeStyle=rail?'#f8e6ce':(shades[road.highway]||'#6aa5b4');ctx.lineWidth=weight;ctx.globalAlpha=rail?.91:.85;
   if(rail)ctx.setLineDash([4,3]);else if(weight>3){ctx.shadowBlur=5;ctx.shadowColor=ctx.strokeStyle}
   ctx.stroke();ctx.restore();
  };
  for(const road of this._osmSorted.lines)paint(road);
  for(const rail of (data.railways||[]).slice(0,340))paint(rail,true);
  const placed=[];
  for(const road of data.lines){const tag=(road.ref||road.name||'').trim();if(!tag||!(road.ref||/高速|国道|省道/.test(tag)))continue;
   const seq=road.geometry||[];if(seq.length<2)continue;const c=seq[Math.floor(seq.length/2)],pt=this.proj(this.geoOverview(c[0],c[1]));
   if(!pt||pt.x<15||pt.x>this.w-50||pt.y<100||pt.y>this.h-140||placed.some(q=>Math.hypot(q.x-pt.x,q.y-pt.y)<106))continue;
   placed.push(pt);ctx.save();ctx.font='bold 11px sans-serif';ctx.fillStyle='#fff1cf';ctx.lineWidth=3;ctx.strokeStyle='#12364a';ctx.strokeText(tag.slice(0,18),pt.x+4,pt.y-6);ctx.fillText(tag.slice(0,18),pt.x+4,pt.y-6);ctx.restore();if(placed.length>=17)break;
  }
 }
 renderIllustrativeLocalRoads(){
  // These are pre-existing artistic model roads, NOT OSM geography. A subtle double-cluster
  // reference display prevents an empty overview without inventing a connecting highway.
  const clusters=[{site:'fast',cx:980,cz:-650,ox:2550,oz:1850,scale:.19,color:'#8cdbe0'},
   {site:'huajiang',cx:-1050,cz:650,ox:0,oz:0,scale:.25,color:'#e8cfac'}];
  const ctx=this.ctx;
  for(const cfg of clusters){
   const roads=(DB.roadsBySite[cfg.site]||[]);
   for(const r of roads){const pts=(DB.roadPoints[r.id]||[]).map(q=>({x:cfg.cx+(q.scene_x-cfg.ox)*cfg.scale,y:115,z:cfg.cz+(q.scene_z-cfg.oz)*cfg.scale}));
    if(pts.length<2)continue;
    ctx.save();ctx.globalAlpha=r.road_class==='expressway'?.66:.4;
    this.line(pts,'#0b2637',r.road_class==='expressway'?5:3);
    this.line(pts,cfg.color,r.road_class==='expressway'?2.3:1.25,[r.road_class==='expressway'?9:5,7]);ctx.restore();
   }
   const center=this.proj({x:cfg.cx,y:180,z:cfg.cz-410});
   if(center){ctx.save();ctx.font='bold 11px sans-serif';ctx.fillStyle='#def9f8';ctx.shadowColor='#092d3d';ctx.shadowBlur=5;ctx.fillText(cfg.site==='fast'?'天眼片区 · 概念道路':'花江片区 · 概念道路',center.x-65,center.y);ctx.restore()}
  }
 }

 drawBeacon(p,name,code,color){const s=this.proj(p);if(!s)return;const ctx=this.ctx;ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=22;ctx.beginPath();ctx.arc(s.x,s.y,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.globalAlpha=.32;ctx.beginPath();ctx.arc(s.x,s.y,17+Math.sin(this.time*2)*3,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;ctx.font='10px ui-monospace';ctx.fillText(code,s.x+18,s.y-4);ctx.font='12px sans-serif';ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillText(name,s.x+18,s.y+12);ctx.restore()}
 render(){
  this.clear();const site=S.site,tl=this.timeline();
  if(site==='overview'){this.buildingScreens=[];this.renderOverview();this.renderSceneTelemetry();return}
  this.renderTerrain(site);this.renderRoads3D(site);this.renderTransportAssets(site);this.renderBuildings(site);
  if(site==='fast'){this.renderDish(tl.infrastructure);this.renderQuiet()}else if(site==='huajiang'){this.renderBridge(tl.infrastructure)}
  if(NS.Drive?.active){this.renderDriveRoad();return;}
  this.renderRelationFlows(site);this.renderTemporalTrails(site);this.renderNodes(site);this.renderSceneTelemetry();
 }
 renderDriveRoad(){
  const ctrl=NS.Drive,route=ctrl.route;if(!route)return;
  const T=this.theme(),ctx=this.ctx,p=ctrl.progress;
  // Subdivided local mesh is critical: a single long polyline disappears when its
  // near endpoint is behind a first-person camera. Here we only draw visible quads.
  const left=[],right=[],center=[];
  for(let i=0;i<=300;i++){
   const u=i/300,fr=route.at(u),at=fr.position,side=fr.side,width=19;
   left.push({x:at.x-side.x*width,y:at.y+3,z:at.z-side.z*width});
   right.push({x:at.x+side.x*width,y:at.y+3,z:at.z+side.z*width});
   center.push({x:at.x,y:at.y+4,z:at.z});
  }
  // Draw only sections in front of pose; distant sections are desaturated to keep
  // the moving path readable without claiming surveyed road dimensions.
  const eye=this.cam.pose?.eye;
  for(let i=299;i>=0;i--){const aa=this.proj(left[i]),bb=this.proj(right[i]),cc=this.proj(right[i+1]),dd=this.proj(left[i+1]);
   if(!aa||!bb||!cc||!dd)continue;
   const middle=(i+.5)/300,dist=Math.abs(middle-p);
   if(dist>.54)continue;
   ctx.save();ctx.globalAlpha=.95;this.poly([left[i],right[i],right[i+1],left[i+1]],dist<.18?'#293743':'#1a2731',M.rgba('#b7efff',.17),.55);ctx.restore();
  }
  for(let i=0;i<300;i+=2){const a=this.proj(center[i]),b=this.proj(center[Math.min(300,i+1)]);
   if(!a||!b)continue;ctx.save();ctx.strokeStyle='rgba(240,247,231,.7)';ctx.lineWidth=Math.max(.7,Math.min(5,a.scale*.65));ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore()}
  // The two side lines are cinematic safety cues, not exact roadside barriers.
  for(const side of [left,right]){
   for(let i=0;i<300;i+=3){const a=this.proj(side[i]),b=this.proj(side[Math.min(i+3,300)]);if(!a||!b)continue;ctx.save();ctx.strokeStyle='rgba(151,222,233,.78)';ctx.lineWidth=1.45;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore()}
  }
  if(['follow','cinematic'].includes(ctrl.mode))this.drawVehicle(ctrl.pose().frame);
 }
 drawVehicle(fr){
  const p=fr.position,f=fr.forward,s=fr.side,offset=NS.Drive?.laneOffset||0;
  const at=(lat,lng,y)=>({x:p.x+s.x*(lat+offset)+f.x*lng,y:p.y+f.y*lng+y,z:p.z+s.z*(lat+offset)+f.z*lng});
  // 全车模型：底盘、前后保险杠、车门、车窗、前后挡风玻璃、四车轮与灯组，均为教育模拟通用车型。
  const a=at(-9,-16,5),b=at(9,-16,5),c=at(9,17,5),d=at(-9,17,5),
        ar=at(-9,-16,11),br=at(9,-16,11),cr=at(9,17,11),dr=at(-9,17,11),
        rl=at(-7,-5,19),rr=at(7,-5,19),fl=at(-7,9,18),frt=at(7,9,18);
  this.poly([a,b,c,d],'#0d2433','#a5e1fa',1.5);
  // 尾部完整实体面，补上第三人称视角中最重要的车厢轮廓。
  this.poly([a,b,br,ar],'#225a77','#a5e1fa',1.8);
  this.poly([at(-7,-16.1,7),at(7,-16.1,7),at(7,-16.1,10),at(-7,-16.1,10)],'#14354c','#95cede',.8);
  this.line([at(-8,-16.2,6),at(8,-16.2,6)],'#b9e1ec',2.2);
  this.poly([a,d,dr,ar],'#17688c','#82bbd8',.8);this.poly([b,c,cr,br],'#17688c','#82bbd8',.8);
  this.poly([ar,br,rr,rl],'#204b61','#bde8fa',1);this.poly([rl,rr,frt,fl],'#1b4255','#e0f4fd',1.3);
  this.poly([fl,frt,cr,dr],'#2f7990','#bde2f1',1);
  this.poly([at(-7,8,17),at(7,8,17),at(7,12,10),at(-7,12,10)],'#16445e','#b9f4ff',1);
  this.poly([ar,rl,rr,br],'#235a76','#d9f2fa',1);
  this.poly([at(-6,-9,12),at(6,-9,12),at(6,-5,18),at(-6,-5,18)],'#103850','#83c1dd',1.2);
  this.poly([dr,fl,rl,ar],'#0b2e46','#7daaca',1);this.poly([cr,br,rr,frt],'#0b2e46','#7daaca',1);
  this.line([at(-9,-2,12),at(9,-2,12)],'#a9e2ef',1.5);
  // 车轮的轮胎轮廓：车轮平面由行车方向与垂直方向张成
  for(const l of [-9.6,9.6])for(const z of [-10,10]){
    const wheel=[];for(let k=0;k<=14;k++){const t=k/14*Math.PI*2;wheel.push(at(l,z+4.2*Math.cos(t),5+4.2*Math.sin(t)))}
    this.poly(wheel,'#071219','#8ab9c4',1.4);
    this.circle3(at(l,z,5),1,5,'#0b2531',1,.2,12);
  }
  this.poly([at(-7.4,17.2,8),at(-4.4,17.3,8),at(-4.4,17.3,10),at(-7.4,17.2,10)],'#fdf9d8');
  this.poly([at(4.4,17.3,8),at(7.4,17.2,8),at(7.4,17.2,10),at(4.4,17.3,10)],'#fdf9d8');
  this.poly([at(-8,-16.8,8),at(-4.4,-16.8,8),at(-4.4,-16.8,10),at(-8,-16.8,10)],'#ed4854');
  this.poly([at(4.4,-16.8,8),at(8,-16.8,8),at(8,-16.8,10),at(4.4,-16.8,10)],'#ed4854');
  this.poly([at(-3,-16.85,6),at(3,-16.85,6),at(3,-16.85,9),at(-3,-16.85,9)],'#071927','#a4dce6',.8);
 }
 pointInPoly(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside}return inside}
 distanceToRoad(x,y,line){let best=Infinity;for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i],dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;if(!len)continue;const t=M.clamp(((x-a.x)*dx+(y-a.y)*dy)/len,0,1),d=Math.hypot(x-a.x-t*dx,y-a.y-t*dy);best=Math.min(best,d)}return best}
 pickObjectAt(x,y){
  // Node markers retain exact-point priority; avoid stealing large building surfaces.
  const nodes=this.nodeScreens.filter(n=>Math.hypot(n.x-x,n.y-y)<Math.min(13,n.r)).sort((a,b)=>a.depth-b.depth);
  if(nodes.length)return{type:'node',id:nodes[0].id};
  const buildings=this.buildingScreens.filter(f=>this.pointInPoly(x,y,f.polygon)).sort((a,b)=>a.depth-b.depth);
  if(buildings.length)return{type:'feature',id:buildings[0].id};
  const roads=this.roadScreens.map(r=>({r,d:this.distanceToRoad(x,y,r.points)})).filter(x=>x.d<=Math.max(7,Math.min(13,x.r.width*.35))).sort((a,b)=>a.d-b.d||a.r.depth-b.r.depth);
  if(roads.length)return{type:'feature',id:roads[0].r.id};
  // Fallback for node markers with large minimum touch target.
  const near=this.nodeScreens.filter(n=>Math.hypot(n.x-x,n.y-y)<n.r).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y));
  return near.length?{type:'node',id:near[0].id}:null;
 }
 objectFromEvent(e){const r=this.c.getBoundingClientRect();return this.pickObjectAt(e.clientX-r.left,e.clientY-r.top)}
 hover(e){if(!S.entered||NS.Drive?.active)return;const obj=this.objectFromEvent(e),id=obj&&obj.type==='feature'?obj.id:null,node=obj&&obj.type==='node'?obj.id:null;if(id!==S.hoveredFeature||node!==S.hovered){NS.setState({hoveredFeature:id,hovered:node});this.c.style.cursor=obj?'pointer':'grab'}}
 pick(e){if(!S.entered||NS.Drive?.active)return;const obj=this.objectFromEvent(e);if(!obj)return;if(obj.type==='node')NS.App.selectNode(obj.id,{focus:true,legend:true});else NS.App.selectSpatialFeature(obj.id)}
}
NS.Engine=Engine;
})(window.SpatialApp=window.SpatialApp||{});
