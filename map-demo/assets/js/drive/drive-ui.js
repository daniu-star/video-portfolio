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
  $('#v31Cruise').addEventListener('click',()=>NS.Drive.setManual(!NS.Drive.manual));
  $('#v31Weather').addEventListener('click',()=>NS.Drive.setWeather(!NS.Drive.wet));
  for(const [id,key] of [['v31Throttle','gas'],['v31Brake','brake'],['v31SteerLeft','left'],['v31SteerRight','right']]){
   const el=$('#'+id);el.style.touchAction='none';
   el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);NS.Drive.inputControl(key,true)});
   for(const ev of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(ev,()=>NS.Drive.inputControl(key,false));
  }

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
  $('#driveLaneState').textContent='模拟视角';$('#driveScenicStop').textContent='◉ 暂停画面';
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
 physics(drive){
  const d=drive.physics?.diagnostics();if(!d)return;
  $('#v31Speed').textContent=String(Math.round(d.speedKmh));
  $('#v31Grade').textContent=`坡度 ${d.gradePct>=0?'+':''}${d.gradePct.toFixed(1)}%`;
  $('#v31LatG').textContent=`横向 ${d.lateralG.toFixed(2)} g`;
  $('#v31Travel').textContent=`已行驶 ${Math.round(drive.route.length*drive.progress)} m`;
  $('#v31Cruise').textContent=drive.manual?'手动驾驶':'自动巡航';
  $('#v31Cruise').setAttribute('aria-pressed',String(!drive.manual));
  $('#v31Weather').textContent=drive.wet?'湿滑路面':'干燥路面';
  $('#v31Weather').setAttribute('aria-pressed',String(drive.wet));
  $('#v31DriveHint').textContent=d.edge?'已接近道路边界，模拟系统限制侧向偏移':
   drive.manual?'W/油门加速 · S/刹车减速 · A/D有限转向':'自动维持教学巡航速度，按 W 切换手动';
  const cockpit=$('#driveHud');cockpit.style.setProperty('--v31-pitch',(d.pitch*15).toFixed(3)+'deg');
  cockpit.style.setProperty('--v31-roll',(d.roll*20).toFixed(3)+'deg');
 },
 hide(){
  $('#drivePrepare').hidden=true;$('#driveHud').hidden=true;$('#driveFinish').hidden=true;
  document.body.removeAttribute('data-drive-view');
 }
};
NS.DriveUI=UI;addEventListener('DOMContentLoaded',()=>UI.init());
})(window.SpatialApp=window.SpatialApp||{});
