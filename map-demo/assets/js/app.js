(function(NS){'use strict';const DB=NS.DB,S=NS.state;
const App={
 init(){
  this.engine=new NS.Engine(document.getElementById('worldCanvas'));
  document.body.classList.add('cinema-focus','v26-cinematic-default');
  NS.UI.init();document.body.dataset.theme=S.theme;document.body.classList.add('is-prologue');
  this.storyTimer=null;
  document.getElementById('exploreStart').addEventListener('click',()=>this.startBuildingExplore());
  document.getElementById('cinemaViewToggle')?.addEventListener('click',()=>this.toggleCinematic());
  const enter=document.getElementById('enterMapBtn');
  if(enter)enter.addEventListener('click',()=>this.enterMap());
  document.getElementById('worldCanvas').addEventListener('dblclick',()=>{if(S.entered&&!NS.Drive.active)this.engine.fly(this.siteCamera(S.site))});
  // V15: first render is the bridge, not the former empty regional overview.
  this.setSite('huajiang',false);
  NS.setState({entered:true,site:'huajiang',selected:'bridge_core',timeline:.99,mode:'infrastructure'});
  this.engine.cam=JSON.parse(JSON.stringify(this.cinemaCamera('huajiang')));
  document.body.dataset.site='huajiang';
  document.body.classList.remove('is-prologue','is-entering');
  document.body.classList.add('is-map-entered','v15-direct-entry');
  document.getElementById('prologue').hidden=true;
  NS.UI.renderRail();NS.UI.renderTimeline();NS.UI.renderMiniMap();NS.UI.renderInspector();NS.UI.renderHud();
  // Guidance is available on demand; never obscure the initial bridge with a dialog.
  
 },
 cinemaCamera(site){
  if(site==='fast')return{yaw:-.44,pitch:.52,distance:1950,target:{x:0,y:45,z:0}};
  if(site==='huajiang')return{yaw:.44,pitch:.44,distance:3200,target:{x:0,y:560,z:0}};
  return this.siteCamera(site)
 },
 toggleCinematic(){
  // Film-grade renderer remains on. The button restores the wide composed shot.
  document.body.classList.add('cinema-focus');const on=true;
  const btn=document.getElementById('cinemaViewToggle');if(btn){btn.setAttribute('aria-pressed',String(on));btn.textContent='◉ 重置电影镜头'}
  if(on){NS.UI.hideNodeLegend?.();this.engine.fly(this.cinemaCamera(S.site),1.25)}
  else this.engine.fly(this.siteCamera(S.site),1.2);
 },
 prologueCamera(){return{yaw:-.58,pitch:.78,distance:6500,target:{x:0,y:80,z:0}}},
 enterMap(){
  if(S.entered)return;
  const startButton=document.getElementById('enterMapBtn');if(startButton){startButton.disabled=true;startButton.querySelector('span').textContent='地图正在打开…'}
  NS.setState({entered:true,site:'huajiang',selected:'bridge_core',selectedFeature:null,mode:'infrastructure',timeline:.99});
  document.body.classList.add('is-entering');
  this.engine.temporalPulse(.72,.9);
  this.engine.fly(this.siteCamera('huajiang'),1.2);
  setTimeout(()=>{document.body.classList.remove('is-prologue','is-entering');document.body.classList.add('is-map-entered');NS.UI.renderRail();NS.UI.renderTimeline();NS.UI.renderMiniMap();NS.UI.renderInspector();NS.UI.renderHud();NS.UI.toast('已进入花江峡谷大桥 · 可点击桥梁、建筑或体验驾驶');NS.Journey?.firstVisit()},1120);
 },
 siteCamera(site){
  if(site==='fast')return{yaw:-.63,pitch:.63,distance:4250,target:{x:0,y:65,z:0}};
  if(site==='huajiang')return{yaw:.53,pitch:.57,distance:4500,target:{x:0,y:410,z:0}};
  return{yaw:-.36,pitch:.58,distance:3750,target:{x:0,y:-40,z:0}}
 },
 setSite(site,fly=true){
  document.body.dataset.site=site;
  if(NS.Drive?.active)NS.Drive.exit();
  const selected=site==='fast'?'fast_core':site==='huajiang'?'bridge_core':null;
  NS.setState({site,selected,selectedFeature:null,hoveredFeature:null,mode:site==='overview'?'infrastructure':S.mode==='radiation'&&site!=='fast'?'infrastructure':S.mode,measure:null,selectionEpoch:S.selectionEpoch+1});
  const sel=document.getElementById('siteSelect');if(sel)sel.value=site;
  if(fly&&S.entered)this.engine.fly(document.body.classList.contains('cinema-focus')?this.cinemaCamera(site):this.siteCamera(site),site==='fast'?1.5:1.4);
  NS.UI.renderRail();NS.UI.renderTimeline();NS.UI.renderMiniMap();NS.UI.renderInspector();NS.UI.renderHud();
  if(selected)NS.UI.showNodeLegend(selected,true); else NS.UI.hideNodeLegend();
  if(S.entered)NS.UI.toast('场景切换 · '+(DB.sites[site]?.name||site));
 },
 selectNode(id,{focus=true,legend=true}={}){
  const n=DB.nodes[id];if(!n)return;
  NS.setState({selected:id,selectedFeature:null,inspectorTab:'overview',selectionEpoch:S.selectionEpoch+1});
  if(legend)NS.UI.showNodeLegend(id,true);
  if(innerWidth<=600)NS.Journey?.expandInspector();
  if(id==='yundu'||id==='hj_hotel'){if(S.timeline<.92){NS.setState({timeline:.98,timelinePulse:S.timelinePulse+1});NS.UI.renderTimeline();}}if(focus)this.focusNode(id);
 },
 selectSpatialFeature(featureId){
  const feature=DB.features[featureId];if(!feature||!S.entered||feature.site_id!==S.site)return;
  if(S.story){clearTimeout(this.storyTimer);NS.setState({story:false})}
  if(feature.object_type==='node')return this.selectNode(feature.object_id);
  NS.setState({selected:null,selectedFeature:featureId,hoveredFeature:null,selectionEpoch:S.selectionEpoch+1});
  NS.UI.hideNodeLegend();NS.FeaturePanel.open(featureId);
 },
 focusFeature(featureId){
  const f=DB.features[featureId];if(!f)return;
  if(f.object_type==='building'){
   const b=DB.buildings[f.object_id];if(!b)return;
   if(S.timeline<(b.phase_start||0)+.06){NS.setState({timeline:Math.min(1,(b.phase_start||0)+.16),timelinePulse:S.timelinePulse+1});NS.UI.renderTimeline()}
   this.engine.fly({yaw:-.55,pitch:.53,distance:Math.max(1700,Math.min(2700,b.width*6)),target:{x:b.scene_x,y:b.scene_y+b.height*.35,z:b.scene_z}},1.35);
  }else if(f.object_type==='road'){
   const pts=DB.roadPoints[f.object_id]||[];if(!pts.length)return;const q=pts[Math.floor(pts.length/2)];
   this.engine.fly({yaw:this.engine.cam.yaw,pitch:.55,distance:1250,target:{x:q.scene_x,y:q.scene_y,z:q.scene_z}},1.1);
  }
 },
 startBuildingExplore(){
  this.setSite('huajiang',false);
  NS.setState({timeline:.99,timelinePulse:S.timelinePulse+1});NS.UI.renderTimeline();this.selectSpatialFeature('building:b_yundu_main');this.focusFeature('building:b_yundu_main');
  NS.UI.toast('探索开始 · 现在可以直接点击地图中的建筑及道路');
 },
 focusNode(id){
  const n=DB.nodes[id];if(!n)return;let distance=1100;
  if(['tourism_cluster','village','service_area'].includes(n.category))distance=1700;
  if(n.id==='fast_core')distance=1900;
  if(n.id==='fast_town')distance=3600;
  if(n.id==='bridge_core')distance=2800;
  if(n.id==='xiaohuajiang_village'||n.id==='keli_village')distance=2100;
  const yawHint=n.id.startsWith('xh_')||n.id==='xiaohuajiang_village'?2.32:n.id.startsWith('keli')?-.72:this.engine.cam.yaw-.08;
  this.engine.fly({yaw:yawHint,pitch:.49,distance,target:{x:n.scene_x,y:n.scene_y+55,z:n.scene_z}},1.18);
 },
 measure(type){
  if(S.site!=='huajiang')this.setSite('huajiang');NS.setState({measure:type,mode:'structure'});NS.UI.renderRail();
  const hud=document.getElementById('measureHud');document.getElementById('measureValue').textContent=type==='625'?'625 m':'1420 m';document.getElementById('measureLabel').textContent=type==='625'?'桥面至水面高差':'主桥跨径 · 主塔间距';hud.classList.add('is-visible');clearTimeout(this.mt);this.mt=setTimeout(()=>hud.classList.remove('is-visible'),4400);
  this.engine.temporalPulse(S.timeline,.5);this.engine.fly(type==='625'?{yaw:.08,pitch:.34,distance:2750,target:{x:0,y:300,z:0}}:{yaw:.2,pitch:.51,distance:3550,target:{x:0,y:650,z:0}},1.25)
 },
 playQuiet(){if(S.site!=='fast')this.setSite('fast');NS.setState({showQuiet:true,mode:'radiation'});NS.UI.renderRail();this.engine.fly({yaw:-.72,pitch:.82,distance:7200,target:{x:0,y:90,z:0}},1.55);NS.UI.toast('电磁宁静区 · 5 / 10 / 30 km 空间场')},
 startTimelineFocus(){NS.UI.toast('时间引擎已激活 · 任意拖动都会触发空间变化')},
 onTimelineScrub(v,prev){this.engine.temporalPulse(v,Math.abs(v-prev));},
 toggleStory(){if(NS.Drive?.active)return;if(S.story){clearTimeout(this.storyTimer);NS.setState({story:false});NS.UI.toast('故事播放已暂停');return}NS.setState({story:true,storyIndex:0});this.playStoryChapter(0)},
 playStoryChapter(i){
  const ch=DB.stories[i];if(!ch){NS.setState({story:false});return}
  NS.setState({storyIndex:i});this.setSite(ch.site_id,false);const a=ch.action||{};
  if(a.mode)NS.setState({mode:a.mode});if(a.quiet)NS.setState({showQuiet:true});if(a.measure)NS.setState({measure:a.measure});
  if(a.selected)this.selectNode(a.selected,{focus:false,legend:true});
  if(typeof a.timeline==='number'){NS.setState({timeline:a.timeline,timelinePulse:S.timelinePulse+1});this.engine.temporalPulse(a.timeline,.8)}
  const target=a.selected&&DB.nodes[a.selected]?{x:DB.nodes[a.selected].scene_x,y:DB.nodes[a.selected].scene_y+50,z:DB.nodes[a.selected].scene_z}:ch.site_id==='fast'?{x:2500,y:180,z:1800}:ch.site_id==='huajiang'?{x:80,y:350,z:0}:{x:0,y:0,z:0};
  this.engine.fly({...ch.camera,target},1.7);document.getElementById('hudTitle').textContent=ch.title;document.getElementById('hudSub').textContent=ch.subtitle;NS.UI.renderRail();NS.UI.renderTimeline();NS.UI.renderInspector();
  clearTimeout(this.storyTimer);this.storyTimer=setTimeout(()=>{if(NS.state.story)this.playStoryChapter(i+1)},5600)
 }
};NS.App=App;addEventListener('DOMContentLoaded',()=>App.init())
})(window.SpatialApp=window.SpatialApp||{});
