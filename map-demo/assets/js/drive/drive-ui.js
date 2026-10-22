/* Stage 2 accessible, state-bound driving HUD (no external dependencies). */
(function(NS){'use strict';
const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={cockpit:'驾驶位',passenger:'乘客位',follow:'第三人称',cinematic:'电影镜头'};
const UI={
 init(){
  $('#driveQuickStart').addEventListener('click',()=>this.quickStart());
  $('#driveCancel').addEventListener('click',()=>NS.Drive.cancelPrepare());
  $('#driveConfirm').addEventListener('click',()=>NS.Drive.start($('#driveViewInitial').value));
  $('#driveExit').addEventListener('click',()=>NS.Drive.exit());
  $('#drivePause').addEventListener('click',()=>NS.Drive.togglePause());
  $('#driveRate').addEventListener('change',e=>NS.Drive.setScale(Number(e.target.value)));
  $('#driveProgress').addEventListener('input',e=>NS.Drive.seek(Number(e.target.value)/1000));
  $('#driveReplay').addEventListener('click',()=>NS.Drive.replay());
  $('#driveBack').addEventListener('click',()=>NS.Drive.exit());
  document.querySelectorAll('[data-drive-view]').forEach(b=>b.addEventListener('click',()=>NS.Drive.setMode(b.dataset.driveView)));
  $('#driveInfo').addEventListener('click',()=>{const el=$('#driveEvidence');el.hidden=!el.hidden;$('#driveInfo').setAttribute('aria-expanded',String(!el.hidden))});
  $('#driveLookLeft').addEventListener('click',()=>NS.Drive.glance(-1));
  $('#driveLookRight').addEventListener('click',()=>NS.Drive.glance(1));
  $('#driveLaneLeft').addEventListener('click',()=>NS.Drive.changeLane(-1));
  $('#driveLaneRight').addEventListener('click',()=>NS.Drive.changeLane(1));
  $('#driveScenicStop').addEventListener('click',()=>NS.Drive.scenicStop());
  $('#driveHorn').addEventListener('click',()=>NS.Drive.horn());
 },
 quickStart(){
  if(!NS.state.entered)return;
  // Preserve the previous site and camera until the user confirms the simulation.
  NS.Drive.prepare(NS.DriveRoutes.bridge);
 },
 showPrepare(route,period){
  $('#drivePrepRoute').textContent=route.title;
  $('#drivePrepPeriod').textContent=period.year_label+' · '+period.title;
  $('#drivePrepare').hidden=false;
  $('#driveHud').hidden=true;
  $('#driveFinish').hidden=true;
  $('#driveViewInitial').value='cockpit';
  $('#driveConfirm').focus();
 },
 showActive(route){
  $('#drivePrepare').hidden=true;
  $('#driveHud').hidden=false;
  $('#driveFinish').hidden=true;
  $('#driveRouteTitle').textContent=route.title;
  $('#driveLaneState').textContent='行驶在中间位置';$('#driveScenicStop').textContent='◉ 观景驻留';
  $('#driveEvidence').hidden=true;$('#driveInfo').setAttribute('aria-expanded','false');
 },
 showFinish(){
  $('#driveFinish').hidden=false;$('#driveReplay').focus();
 },
 hideFinish(){$('#driveFinish').hidden=true},
 chapter(cp){
  $('#driveChapter').textContent=cp.title;
  $('#driveNarration').textContent=cp.text;
  // The chapter is quiet and passive; users control playback and can pause to read.
 },
 progress(p,mode,paused,scale){
  $('#driveProgress').value=String(Math.round(p*1000));
  $('#drivePct').textContent=`${Math.round(p*100)}%`;
  $('#driveViewName').textContent=labels[mode]||mode;
  $('#drivePause').textContent=paused?'▶ 继续':'Ⅱ 暂停';
  $('#driveRate').value=String(scale);
  $('#driveProgress').setAttribute('aria-valuetext',`路线进度 ${Math.round(p*100)}%`);
  document.querySelectorAll('[data-drive-view]').forEach(b=>{
   const on=b.dataset.driveView===mode;b.classList.toggle('is-current',on);b.setAttribute('aria-pressed',String(on));
  });
  document.body.dataset.driveView=mode;
 },
 hide(){
  $('#drivePrepare').hidden=true;$('#driveHud').hidden=true;$('#driveFinish').hidden=true;
  document.body.removeAttribute('data-drive-view');
 }
};
NS.DriveUI=UI;addEventListener('DOMContentLoaded',()=>UI.init());
})(window.SpatialApp=window.SpatialApp||{});
