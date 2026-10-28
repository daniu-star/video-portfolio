/* V29 grounded game entry markers. All overlays track their own engineering landmark. */
(function(NS){'use strict';
const $=id=>document.getElementById(id);
const PORTALS={fast: {x:0,y:92,z:0},huajiang:{x:0,y:680,z:0}};
const OVERVIEW={fast:{x:1010,y:85,z:-675},huajiang:{x:-1050,y:115,z:665}};
let last=0;
function launch(kind){
  if(NS.Drive?.active||NS.Boat?.active||NS.FastGame?.active||NS.RelationGame?.openState)return;
  if(kind==='fast'){
    if(NS.state.site!=='fast')NS.App.setSite('fast',false);
    NS.FastGame.open();
  }else{
    if(NS.state.site!=='huajiang')NS.App.setSite('huajiang',false);
    NS.Drive.prepare(NS.DriveRoutes.bridge);
  }
}
function update(t){
  requestAnimationFrame(update);
  if(t-last<90)return;last=t;
  const engine=NS.App?.engine,site=NS.state?.site;
  if(!engine)return;
  const blocked=!NS.state?.entered||!!NS.Drive?.active||!!NS.Boat?.active||!!NS.FastGame?.active||!!NS.RelationGame?.openState||!!NS.GameHub?.openState||document.body.classList.contains('v17-touring');
  for(const kind of ['fast','huajiang']){
    const btn=$('v29Portal'+(kind==='fast'?'Fast':'Bridge'));
    if(!btn)continue;
    const show=!blocked&&(site==='overview'||site===kind);
    const point=site==='overview'?OVERVIEW[kind]:PORTALS[kind];
    const p=show?engine.proj(point):null;
    const valid=!!(p&&p.z>0&&p.x>65&&p.x<engine.w-65&&p.y>120&&p.y<engine.h-98);
    btn.hidden=!valid;if(!valid)continue;
    btn.style.left=p.x+'px';btn.style.top=(p.y-18)+'px';
    btn.dataset.overview=site==='overview'?'true':'false';
  }
}
function init(){
 for(const kind of ['fast','huajiang']){
  const btn=$('v29Portal'+(kind==='fast'?'Fast':'Bridge'));
  btn?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();launch(kind)});
 }
 requestAnimationFrame(update);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window.SpatialApp=window.SpatialApp||{});
