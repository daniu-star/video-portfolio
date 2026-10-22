/* UX repair: one first-visit decision, explicit paths, reversible dialogs, mobile tool access. */
(function(NS){'use strict';
const $=id=>document.getElementById(id);
const Journey={opened:false,lastFocus:null,
 init(){
  $('journeyGuideBtn').addEventListener('click',()=>this.open());
  $('visitorGuideClose').addEventListener('click',()=>this.close());
  $('visitorGuide').querySelectorAll('[data-journey]').forEach(btn=>btn.addEventListener('click',()=>this.choose(btn.dataset.journey)));
  $('mobileMoreBtn').addEventListener('click',()=>this.toggleMore());
  $('mobileMoreMenu').querySelectorAll('[data-more-action]').forEach(btn=>btn.addEventListener('click',()=>this.more(btn.dataset.moreAction)));
  $('inspectorToggle').addEventListener('click',()=>this.toggleInspector());
  document.addEventListener('keydown',e=>{
   if(e.key!=='Escape')return;
   if(! $('visitorGuide').hidden){e.preventDefault();e.stopPropagation();this.close();return;}
   if(!$('mobileMoreMenu').hidden){e.preventDefault();this.hideMore();}
  });
  // On narrow screens avoid a permanent inspector over the interactive scene.
  if(innerWidth<=600)this.collapseInspector();
  addEventListener('resize',()=>{if(innerWidth>600){document.body.classList.remove('inspector-collapsed');this.syncInspector()}}, {passive:true});
 },
 firstVisit(){
   try{if(sessionStorage.getItem('guizhou-journey-seen-v1'))return}catch(_){}
   this.open();
 },
 open(){
   if(!NS.state.entered||NS.Drive?.active||NS.FastGame?.active)return;
   this.lastFocus=document.activeElement;this.opened=true;
   this.hideMore();$('visitorGuide').hidden=false;
   document.body.classList.add('is-visitor-guide');$('visitorGuide').querySelector('.visitor-guide-card').focus();
   try{sessionStorage.setItem('guizhou-journey-seen-v1','1')}catch(_){}
 },
 close(){if(!$('visitorGuide').hidden){$('visitorGuide').hidden=true;document.body.classList.remove('is-visitor-guide');this.opened=false;if(this.lastFocus?.isConnected)this.lastFocus.focus({preventScroll:true})}},
 choose(kind){this.close();
  if(kind==='fast'){NS.App.setSite('fast');NS.FastGame.open();return}
  if(kind==='drive'){NS.App.setSite('huajiang');NS.Drive.prepare(NS.DriveRoutes.bridge);return}
  if(kind==='pixel'){NS.PixelTruck.open();return}
  NS.UI.toast('自由探索：选择场景，再点击地图建筑与地点。顶部「玩法指南」可随时重开。');
 },
 toggleMore(){const open=$('mobileMoreMenu').hidden;$('mobileMoreMenu').hidden=!open;$('mobileMoreBtn').setAttribute('aria-expanded',String(open));},
 hideMore(){$('mobileMoreMenu').hidden=true;$('mobileMoreBtn').setAttribute('aria-expanded','false')},
 more(action){this.hideMore();
  if(action==='story'){NS.App.toggleStory();NS.UI.toast(NS.state.story?'自动故事播放中：再次点击可暂停':'自动故事已暂停');return}
  if(action==='data'){NS.UI.openDatabase();return}
  if(action==='theme'){const names=['nebula','solar','aurora'],idx=names.indexOf(NS.state.theme),next=names[(idx+1)%names.length];NS.setState({theme:next});document.body.dataset.theme=next;NS.UI.renderTimeline();NS.UI.toast('视觉主题：'+NS.DB.themes[next].name);return}
  if(action==='help'){NS.Geo.showDialog('geoHelp');return}
 },
 syncInspector(){const collapsed=document.body.classList.contains('inspector-collapsed');$('inspectorToggle').setAttribute('aria-expanded',String(!collapsed));$('inspectorToggle').querySelector('span').textContent=collapsed?'展开地点资料':'收起资料面板'},
 collapseInspector(){document.body.classList.add('inspector-collapsed');this.syncInspector()},
 expandInspector(){document.body.classList.remove('inspector-collapsed');this.syncInspector()},
 toggleInspector(){document.body.classList.toggle('inspector-collapsed');this.syncInspector()}
};
NS.Journey=Journey;
document.addEventListener('DOMContentLoaded',()=>Journey.init());
})(window.SpatialApp=window.SpatialApp||{});
