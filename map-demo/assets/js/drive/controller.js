/* V7 P2 - route-locked cockpit touring controller, one camera owner at a time. */
(function(NS){'use strict';
const M=NS.Math3D,S=NS.state,DB=NS.DB;
const MODES=['cockpit','passenger','follow','cinematic'];
const Drive={
 phase:'idle',route:null,progress:0,mode:'cockpit',paused:false,duration:72,timeScale:1,lookOffset:0,lookHold:0,laneOffset:0,scenic:false,scenicBefore:false,
 snapshot:null,chapter:-1,renderStamp:0,physics:null,manual:false,wet:false,input:{gas:false,brake:false,left:false,right:false},warp:2.4,
 get active(){return this.phase==='active'||this.phase==='complete'},
 available(roadId){return !!NS.DriveRoutes.forRoad(S.site,roadId)},
 prepare(route=NS.DriveRoutes.bridge){
  if(!S.entered)return;
  NS.V17Entry?.close?.(); // dismiss first-visit overlay before the driving prep
  if(this.phase!=='idle')this.exit();
  if(!route||route.site!=='huajiang')return;
  this.route=route;this.phase='prepare';this.progress=0;this.mode='cockpit';this.chapter=-1;
  NS.DriveUI.showPrepare(route, DB.timelineState('huajiang',S.timeline));
 },
 start(mode='cockpit'){
  if(this.phase!=='prepare'||!this.route)return false;
  this.snapshot={site:S.site,timeline:S.timeline,mode:S.mode,selected:S.selected,selectedFeature:S.selectedFeature,
   hoveredFeature:S.hoveredFeature,measure:S.measure,story:S.story,inspectorTab:S.inspectorTab,
   camera:JSON.parse(JSON.stringify(NS.App.engine.cam)),targetCam:NS.App.engine.targetCam?JSON.parse(JSON.stringify(NS.App.engine.targetCam)):null,
   panelOpen:document.getElementById('featurePanel').classList.contains('is-open'), legendOpen:document.getElementById('nodeLegend').classList.contains('is-visible')};
  clearTimeout(NS.App.storyTimer);if(S.site!=='huajiang')NS.App.setSite('huajiang',false);NS.setState({story:false,driveStatus:'active',timeline:Math.max(.96,S.timeline),measure:null,hoveredFeature:null});
  if(NS.FeaturePanel)NS.FeaturePanel.hide();NS.UI.hideNodeLegend();
  const dataModal=document.getElementById('dataModal');dataModal.classList.remove('is-open');
  this.phase='active';this.progress=0;this.paused=false;this.timeScale=1;this.mode=MODES.includes(mode)?mode:'cockpit';this.chapter=-1;this.lookOffset=0;this.lookHold=0;this.laneOffset=0;this.scenic=false;this.manual=false;this.wet=false;this.input={gas:false,brake:false,left:false,right:false};this.physics=new NS.VehiclePhysicsV31();
  NS.App.engine.targetCam=null;this.applyCamera();document.body.classList.add('is-driving');
  NS.DriveUI.showActive(this.route);this.updateUI(true);return true;
 },
 advance(dt){
  if(!this.active)return;
  const p=this.physics;
  if(this.phase==='active'&&!this.paused&&p){
    // The time multiplier is explicit: the authored route is intentionally long.
    // Use fixed integration substeps; never pass a variable frame delta straight to a spring.
    const total=Math.min(.05,Math.max(0,dt))*this.warp*this.timeScale;
    const steps=Math.max(1,Math.ceil(total/.012));
    for(let i=0;i<steps;i++){
      const h=total/steps,gas=this.input.gas,brake=this.input.brake;
      const target=this.wet?14:19.5;
      const ctrl=this.manual?{throttle:gas?1:0,brake:brake?1:0,steer:(this.input.right?1:0)-(this.input.left?1:0)}:
        {throttle:brake?0:(gas?1:Math.max(0,Math.min(.85,(target-p.speed)*.35+.16))),
         brake:brake?1:Math.max(0,Math.min(.6,(p.speed-target)*.33)),
         steer:(this.input.right?1:0)-(this.input.left?1:0)};
      const d=p.step(h,ctrl,this.route,this.progress,this.wet?'wet':'dry')||0;
      this.progress=M.clamp(this.progress+d/this.route.length,0,1);
      this.laneOffset=p.lateral;
      if(this.progress>=1){this.phase='complete';this.paused=true;NS.DriveUI.showFinish();break}
    }
  }
  this.lookHold=Math.max(0,this.lookHold-dt);
  if(!this.lookHold)this.lookOffset*=Math.max(0,1-dt*1.8);
  this.applyCamera(dt);
  this.renderStamp+=dt;
  if(this.renderStamp>.085){this.renderStamp=0;this.updateUI()}
 },
 pose(){
  const frame=this.route.at(this.progress),p=frame.position,f=frame.forward,side=frame.side;
  const phys=this.physics;
  const heave=phys?phys.heave:0,pitch=phys?phys.pitch:0;
  const offset=(a,b,c)=>({x:p.x+f.x*a+side.x*(b+this.laneOffset),y:p.y+f.y*a+c+heave,z:p.z+f.z*a+side.z*(b+this.laneOffset)});
  let eye,look;
  if(this.mode==='cockpit'){eye=offset(3,-3.5,7.4);look=offset(115,-3.5+this.lookOffset*33,8.7+pitch*55)}
  else if(this.mode==='passenger'){eye=offset(-1,4.4,7.8);look=offset(115,3+this.lookOffset*28,8.6)}
  else if(this.mode==='follow'){eye=offset(-85,0,38);look=offset(52,0,10)}
  else{eye=offset(-99,102,81);look=offset(48,0,10)}
  return{eye,look,frame};
 },
 applyCamera(dt=0){
  if(!this.active)return;
  const {eye,look}=this.pose(),prev=NS.App.engine.cam.pose;
  if(prev&&dt>0){const t=1-Math.exp(-Math.min(.05,dt)*(this.mode==='cockpit'?18:6));
   for(const k of ['x','y','z']){eye[k]=M.lerp(prev.eye[k],eye[k],t);look[k]=M.lerp(prev.look[k],look[k],t)}}
  NS.App.engine.cam.pose={eye,look};
 },
 setManual(on){if(!this.active)return;this.manual=!!on;this.updateUI(true)},
 setWeather(wet){if(!this.active)return;this.wet=!!wet;this.updateUI(true)},
 inputControl(kind,on){if(!this.active||!(kind in this.input))return;
   this.input[kind]=!!on;if(on&&kind==='gas')this.manual=true;this.updateUI(true)},
 setMode(mode){if(!this.active||!MODES.includes(mode))return;this.mode=mode;this.applyCamera();this.updateUI(true)},
 togglePause(){if(this.phase!=='active')return;this.paused=!this.paused;this.updateUI(true)},
 setScale(value){if(!this.active)return;this.timeScale=[.65,1,1.65].includes(value)?value:1;this.updateUI(true)},
 seek(p){if(!this.active)return;this.progress=M.clamp(Number(p)||0,0,1);if(this.physics){this.physics.reset();this.physics.distance=this.route.length*this.progress;this.physics.speed=0;this.laneOffset=0;this.input={gas:false,brake:false,left:false,right:false}}this.chapter=-1;if(this.phase==='complete'&&this.progress<1){this.phase='active';this.paused=true;NS.DriveUI.hideFinish()}this.applyCamera();this.updateUI(true)},
 replay(){if(!this.active)return;this.phase='active';this.progress=0;if(this.physics){this.physics.reset();this.laneOffset=0;this.input={gas:false,brake:false,left:false,right:false}}this.paused=false;this.chapter=-1;NS.DriveUI.hideFinish();this.applyCamera();this.updateUI(true)},
 updateUI(force=false){if(!this.active)return;let index=0;for(let i=0;i<this.route.checkpoints.length;i++)if(this.progress>=this.route.checkpoints[i].at)index=i;
  if(force||index!==this.chapter){this.chapter=index;NS.DriveUI.chapter(this.route.checkpoints[index]);}
  NS.DriveUI.progress(this.progress,this.mode,this.paused,this.timeScale);NS.DriveUI.physics?.(this);
 },
 changeLane(dir){if(!this.active)return;this.laneOffset=M.clamp(this.laneOffset+dir*7,-7,7);this.applyCamera();this.updateUI(true);const t=document.getElementById('driveLaneState');if(t)t.textContent=this.laneOffset===0?'行驶在中间位置':this.laneOffset<0?'左侧模拟车道':'右侧模拟车道'},
 scenicStop(){if(!this.active)return;this.scenic=!this.scenic;if(this.scenic){this.scenicBefore=this.paused;this.paused=true;this.setMode('cinematic')}else{this.paused=this.scenicBefore;this.setMode('cockpit')}this.updateUI(true);const b=document.getElementById('driveScenicStop');if(b)b.textContent=this.scenic?'▶ 继续播放':'◉ 暂停画面'},
 horn(){if(!this.active)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;const a=new Audio(),o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.value=220;o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.0001,a.currentTime);g.gain.linearRampToValueAtTime(.07,a.currentTime+.04);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.26);o.start();o.stop(a.currentTime+.27);o.onended=()=>a.close()}catch(_){ }},
 glance(direction){if(!this.active)return;this.lookOffset=M.clamp(direction*.95,-1,1);this.lookHold=2.1;this.applyCamera();const hint=document.getElementById('driveLookHint');if(hint)hint.textContent=direction<0?'正在看左侧 · 稍后自动回正':'正在看右侧 · 稍后自动回正'},
 exit(){
  if(this.phase==='idle')return;
  const snapshot=this.snapshot;this.snapshot=null;this.phase='idle';this.route=null;this.progress=0;this.chapter=-1;this.laneOffset=0;this.physics=null;this.scenic=false;
  document.body.classList.remove('is-driving');NS.DriveUI.hide();
  NS.App.engine.cam.pose=null;
  NS.App.engine.lastInteraction=performance.now(); // prevent idle orbit from drifting restored camera immediately after exit
  if(snapshot){
   NS.App.engine.cam=JSON.parse(JSON.stringify(snapshot.camera));NS.App.engine.targetCam=null;
   NS.setState({driveStatus:null,site:snapshot.site,timeline:snapshot.timeline,mode:snapshot.mode,
     selected:snapshot.selected,selectedFeature:snapshot.selectedFeature,hoveredFeature:snapshot.hoveredFeature,
     measure:snapshot.measure,story:false,inspectorTab:snapshot.inspectorTab,selectionEpoch:S.selectionEpoch+1});
   const select=document.getElementById('siteSelect');if(select)select.value=snapshot.site;
   NS.UI.renderRail();NS.UI.renderTimeline();NS.UI.renderMiniMap();NS.UI.renderInspector();NS.UI.renderHud();
   if(snapshot.panelOpen&&snapshot.selectedFeature)NS.FeaturePanel.render();
   if(snapshot.legendOpen&&snapshot.selected)NS.UI.showNodeLegend(snapshot.selected,false);
  }else NS.setState({driveStatus:null});
 },
 cancelPrepare(){if(this.phase==='prepare'){this.phase='idle';this.route=null;NS.DriveUI.hide()}},
 onKey(e){
  if(this.phase==='idle')return false;
  const tag=document.activeElement?.tagName;
  if(['INPUT','TEXTAREA','SELECT'].includes(tag)&&e.key!=='Escape')return false;
  if(e.key==='Escape'){this.active?this.exit():this.cancelPrepare();return true}
  if(!this.active)return false;
  if(e.code==='Space'){if(e.type==='keydown'&&!e.repeat)this.togglePause();return true}
  if(/^[1-4]$/.test(e.key)){if(e.type==='keydown'&&!e.repeat)this.setMode(MODES[Number(e.key)-1]);return true}
  const k=e.key.toLowerCase(),map={'w':'gas','arrowup':'gas','s':'brake','arrowdown':'brake','a':'left','arrowleft':'left','d':'right','arrowright':'right'};
  if(map[k]){this.inputControl(map[k],e.type==='keydown');return true}
  if(k==='q'||k==='e'){if(e.type==='keydown')this.glance(k==='q'?-1:1);return true}
  if(k==='p'){if(e.type==='keydown'&&!e.repeat)this.setManual(!this.manual);return true}
  return false;
 }
};
NS.Drive=Drive;
for(const type of ['keydown','keyup'])document.addEventListener(type,e=>{if(Drive.onKey(e)){e.preventDefault();e.stopImmediatePropagation()}},true);
addEventListener('blur',()=>{if(Drive.active){for(const k of Object.keys(Drive.input))Drive.input[k]=false}});
})(window.SpatialApp=window.SpatialApp||{});
