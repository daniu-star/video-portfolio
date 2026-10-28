/* V17 step 1: one clear entry and a short, reversible first-map experience.
 * Leaves the six FAST stories and engineering simulations unchanged for later phases.
 */
(function(NS){'use strict';
const $=id=>document.getElementById(id);
const KEY='guizhou-v17-entry-v1';
const safeGet=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}};
const safeSet=obj=>{try{localStorage.setItem(KEY,JSON.stringify(obj))}catch(_){}};
const guide={
 state:{stage:'welcome',done:false,seen2011:false,seen2016:false,observed:false},
 openState:false,lastFocus:null,dragStart:null,
 init(){
  const prior=safeGet();if(prior&&typeof prior==='object')this.state={...this.state,...prior};
  document.body.classList.add('v17-entry');
  const dock=document.createElement('nav');dock.id='v17Dock';dock.setAttribute('aria-label','主要导航');dock.innerHTML=`<button type="button" data-v17-nav="explore" class="v17-dock-primary">开始探索</button><button type="button" data-v17-nav="map">看地图</button><button type="button" data-v17-nav="archive">我的发现</button>`;
  document.body.appendChild(dock);
  const panel=document.createElement('section');panel.id='v17Intro';panel.className='v17-intro';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-labelledby','v17IntroTitle');panel.setAttribute('aria-modal','false');document.body.appendChild(panel);
  const shade=document.createElement('div');shade.id='v22WelcomeShade';shade.className='v22-welcome-shade';shade.hidden=true;shade.setAttribute('aria-hidden','true');document.body.appendChild(shade);
  shade.addEventListener('click',()=>{if(this.openState&&this.state.stage==='welcome')this.finish(true)});
  const records=document.createElement('section');records.id='v17Archive';records.className='v17-archive';records.hidden=true;records.setAttribute('role','dialog');records.setAttribute('aria-modal','true');records.setAttribute('aria-labelledby','v17ArchiveTitle');document.body.appendChild(records);
  dock.addEventListener('click',e=>{const b=e.target.closest('[data-v17-nav]');if(!b)return;const action=b.dataset.v17Nav;
   if(action==='explore'){this.close();NS.GameHub.open()}
   if(action==='map'){this.close();this.closeArchive();NS.GameHub.close();NS.UI.toast('地图可拖动查看。点击地点了解资料，或用时间轴比较前后。')}
   if(action==='archive'){this.close();NS.GameHub.close();this.openArchive()}
  });
  panel.addEventListener('click',e=>{const btn=e.target.closest('[data-v17-action]');if(btn)this.action(btn.dataset.v17Action)});
  records.addEventListener('click',e=>{const b=e.target.closest('[data-v17-record]');if(!b)return;if(b.dataset.v17Record==='close')this.closeArchive();if(b.dataset.v17Record==='games'){this.closeArchive();NS.GameHub.open()}});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-v17-hub]');if(!b)return;const kind=b.dataset.v17Hub;NS.GameHub.close();if(kind==='intro')this.open('welcome');if(kind==='fast'){this.launchFast()}if(kind==='map'){this.close();NS.UI.toast('你可以旋转地图、点击地点、移动时间轴。')}});
  const canvas=$('worldCanvas');
  canvas?.addEventListener('pointerdown',e=>{if(this.openState&&this.state.stage==='observe')this.dragStart={x:e.clientX,y:e.clientY}}, {passive:true});
  canvas?.addEventListener('pointerup',e=>{if(!this.dragStart)return;const distance=Math.hypot(e.clientX-this.dragStart.x,e.clientY-this.dragStart.y);this.dragStart=null;if(this.openState&&this.state.stage==='observe'&&distance>16){this.state.observed=true;this.persist();this.render()}} ,{passive:true});
  document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(!records.hidden){this.closeArchive();return}if(this.openState){this.state.stage==='welcome'?this.finish(true):this.close();return}});
  document.addEventListener('keydown',e=>{if(e.key!=='Tab'||!this.openState||this.state.stage!=='welcome')return;
   const items=[...panel.querySelectorAll('button:not([disabled])')];if(!items.length)return;
   const first=items[0],last=items[items.length-1];
   if(e.shiftKey&&(document.activeElement===first||!panel.contains(document.activeElement))){e.preventDefault();last.focus()}
   else if(!e.shiftKey&&(document.activeElement===last||!panel.contains(document.activeElement))){e.preventDefault();first.focus()}
  });
  this.replaceHub();
  // V16 enters the map immediately, so its old guide never appeared.
  if(!this.state.done){this.open(this.state.stage==='welcome'?'welcome':this.state.stage)};
 },
 persist(){safeSet(this.state)},
 timeline(t){NS.setState({timeline:t,timelinePulse:(NS.state.timelinePulse||0)+1});NS.UI.renderTimeline();NS.App.engine?.temporalPulse?.(t,.45)},
 enterFast(){if(NS.state.site!=='fast')NS.App.setSite('fast');NS.UI.hideNodeLegend?.();this.timeline(.26);this.focusTour();},
 focusTour(){const narrow=innerWidth<=700;NS.App.engine?.fly?.({yaw:-.63,pitch:.78,distance:narrow?5000:7800,target:{x:0,y:narrow?-780:-120,z:0}},1.0)},
 open(stage='welcome'){
  if(NS.FastGame?.active||NS.Drive?.active||NS.PixelTruck?.openState)return;
  this.closeArchive();this.lastFocus=document.activeElement;this.openState=true;this.state.stage=stage;
  if(['observe','compare','result'].includes(stage))this.enterFast();
  if(stage==='compare'&&this.state.seen2016)this.timeline(.68);
  document.body.classList.add('v17-touring');this.persist();this.render();
 },
 close(){this.dragStart=null;this.openState=false;$('v17Intro').hidden=true;document.body.classList.remove('v17-touring','v22-welcome-open');$('v22WelcomeShade').hidden=true;if(this.lastFocus?.isConnected&&this.lastFocus!==$('v17Intro'))this.lastFocus.focus?.({preventScroll:true})},
 finish(skipped=false){this.state.done=true;this.state.stage=skipped?'welcome':'result';this.persist();this.close()},
 action(a){
  if(a==='skip'){this.finish(true);NS.UI.toast('已进入自由地图。点击上方“开始探索”可以选择游戏。');return}
  if(a==='start'){this.state.observed=false;this.enterFast();this.state.stage='observe';this.persist();this.render();return}
  if(a==='rotate'){
   const engine=NS.App.engine,cam=engine.cam||NS.App.siteCamera('fast');
   const next={yaw:(cam.yaw||0)+.55,pitch:Math.max(.38,cam.pitch||.58),distance:cam.distance||12000,target:{...cam.target}};
   engine.fly(next,.8);this.state.observed=true;this.persist();this.render();return;
  }
  if(a==='compare'){if(!this.state.observed)return;this.state.stage='compare';this.state.seen2011=true;this.state.seen2016=false;this.timeline(.26);this.persist();this.render();return}
  if(a==='2011'){this.state.seen2011=true;this.timeline(.26);this.persist();this.render();return}
  if(a==='2016'){this.state.seen2016=true;this.timeline(.68);this.persist();this.render();return}
  if(a==='result'){if(!this.state.seen2011||!this.state.seen2016)return;this.state.stage='result';this.persist();this.render();return}
  if(a==='back-observe'){this.state.stage='observe';this.timeline(.26);this.persist();this.render();return}
  if(a==='back-compare'){this.state.stage='compare';this.timeline(.68);this.persist();this.render();return}
  if(a==='map'){this.finish(true);return}
  if(a==='play'){this.finish();this.launchFast();return}
  if(a==='finish'){this.finish();NS.GameHub.open();return}
 },
 launchFast(){this.close();if(NS.state.site!=='fast')NS.App.setSite('fast');NS.FastGame.open()},
 render(){if(!this.openState)return;const {stage,observed,seen2011,seen2016}=this.state;const panel=$('v17Intro');panel.hidden=false;
  const centered=stage==='welcome';panel.classList.toggle('v22-welcome',centered);panel.setAttribute('aria-modal',centered?'true':'false');document.body.classList.toggle('v22-welcome-open',centered);$('v22WelcomeShade').hidden=!centered;
  const prog=stage==='welcome'?0:stage==='observe'?1:stage==='compare'?2:3;
  const head=`<div class="v17-tour-top"><span>第一次探索 <b>${prog?prog+'/3':'· 从这里开始'}</b></span><button data-v17-action="skip" type="button" aria-label="退出引导，自由查看地图">跳过引导 ×</button></div>`;
  let content='';
  if(stage==='welcome')content=`<div class="v17-kicker">贵州 · 三维互动地图</div><h2 id="v17IntroTitle">从这里认识贵州大国工程</h2><p class="v17-description">先看天眼所在的山地，再比较工程建设前后。</p><div class="v17-tour-actions"><button class="v17-action-main" data-v17-action="start">跟我看看天眼 <span aria-hidden="true">→</span></button><button class="v17-action-light" data-v17-action="map">自己看地图</button></div><p class="v17-footnote">无需登录。地图使用教学模型，原始采样数据已保留。</p>`;
  if(stage==='observe')content=`<div class="v17-kicker">观察地点 · 贵州平塘</div><h2 id="v17IntroTitle">转一转，看看山窝</h2><p class="v17-description">拖动地图，从另一侧看看天眼周围的山地。</p><div class="v17-observation"><span class="v17-dot ${observed?'is-done':''}">${observed?'✓':'1'}</span><span>${observed?'已换角度观察':'请尝试拖动3D画面'}</span></div><div class="v17-tour-actions"><button class="v17-action-main" data-v17-action="compare" ${observed?'':'disabled'}>${observed?'下一步 · 看时间变化':'观察后可继续'} <span aria-hidden="true">→</span></button><button class="v17-action-light" data-v17-action="rotate">帮我换个角度</button></div><p class="v17-footnote">画面中的山体为示意形态，不是实地测绘结果。</p>`;
  if(stage==='compare')content=`<div class="v17-kicker">时间对照 · 中国天眼</div><h2 id="v17IntroTitle">同一地点，两个年份</h2><p class="v17-description">分别点击年份，看看工程从开工到落成的变化。</p><div class="v17-year-options"><button type="button" data-v17-action="2011" class="${seen2011?'selected':''}"><strong>2011年</strong><small>开始建设</small>${seen2011?'<em>✓ 已看</em>':''}</button><button type="button" data-v17-action="2016" class="${seen2016?'selected':''}"><strong>2016年</strong><small>工程落成</small>${seen2016?'<em>✓ 已看</em>':''}</button></div><div class="v17-tour-actions"><button class="v17-action-main" data-v17-action="result" ${seen2011&&seen2016?'':'disabled'}>查看我的观察 <span aria-hidden="true">→</span></button><button class="v17-action-light" data-v17-action="back-observe">返回上一步</button></div><p class="v17-footnote">年份来自工程历史；画面变化是简化动画。</p>`;
  if(stage==='result')content=`<div class="v17-kicker">你的第一次发现</div><h2 id="v17IntroTitle">天眼经历了建设过程</h2><div class="v17-finding"><b>2011 → 2016</b><span>中国天眼从开工建设走向工程落成。</span></div><p class="v17-description">你观察了地点，也切换了年份。接下来选择施工人员、科学家或游客，沿山路和五位NPC交谈。</p><div class="v17-tour-actions"><button class="v17-action-main" data-v17-action="play">开始像素山路冒险 <span aria-hidden="true">→</span></button><button class="v17-action-light" data-v17-action="finish">看看其他路线</button></div><p class="v17-footnote">引导完成。可继续探索三种角色的任务。</p>`;
  panel.innerHTML=head+`<div class="v17-tour-body">${content}</div><div class="v17-tour-progress" aria-label="引导进度">${[1,2,3].map(i=>`<i class="${i<=prog?'is-current':''}"></i>`).join('')}</div>`;
  const main=panel.querySelector('.v17-action-main');if(main&&!main.disabled)main.focus({preventScroll:true});
 },
 replaceHub(){const hub=NS.GameHub;
  hub.render=function(){const r=NS.LearningRecords||{fast:{},bridge:{seen:[]},truck:{complete:[]}},fast=NS.ProgressV33?.completedPixelCount?.()||0,bridge=(r.bridge?.seen||[]).length,road=NS.RelationGame?.completedCount?.()||0;
   $('gameHub').innerHTML=`<div class="v17-game-sheet"><div class="v17-game-head"><div><span>选择一次探索</span><h2>你想先了解哪项工程？</h2></div><button data-hub-action="close" type="button">关闭 ×</button></div><div class="v17-featured"><span class="v17-mini-label">推荐从这里开始</span><h3>中国天眼</h3><p>选施工人员、科学家或游客，走一条像素山路，每站和NPC交谈。</p><button class="v17-featured-btn" data-v17-hub="intro" type="button">先看地图入门 →</button><button data-v17-hub="fast" class="v17-link-btn" type="button">直接玩像素冒险</button></div><div class="v17-other-games"><button type="button" data-hub-action="bridge"><strong>花江峡谷大桥</strong><small>跟车过桥，观察桥体与峡谷</small><span>开始观察 →</span></button><button type="button" data-hub-action="casebook"><strong>贵州工程调查局</strong><small>从天眼与大桥的资料中核验证据</small><span>开始调查 →</span></button></div><button class="v17-open-archive" type="button" data-v17-hub="map">也可以先自由看地图</button><p class="v17-hub-footer">本机记录：天眼像素角色可分别存档 · 大桥 ${bridge} 处 · 工程调查 ${NS.RelationGame?.completedCount?.()||0} 份。场景以教学模拟为主，不能用于实地导航。</p></div>`;
  };
  // The original floating game launch remains available programmatically, but its duplicate visual surface is removed.
 },
 openArchive(){const box=$('v17Archive');const R=NS.LearningRecords||{fast:{},bridge:{seen:[]},truck:{complete:[]}},fast=Array.from({length:NS.ProgressV33?.completedPixelCount?.()||0}),b=R.bridge?.seen?.length||0,r=NS.RelationGame?.completedCount?.()||0;
  const finding=this.state.done&&this.state.seen2016?'你在地图上比较了中国天眼2011年开工与2016年落成的两个状态。':'还没有完成地图入门观察。';
  box.innerHTML=`<div class="v17-archive-sheet"><header><div><small>本机保存 · 学习记录</small><h2 id="v17ArchiveTitle">我的发现</h2></div><button type="button" data-v17-record="close">关闭 ×</button></header><article class="v17-archive-highlight"><span>地图观察</span><p>${finding}</p></article><div class="v17-archive-counts"><div><b>${fast.length}</b><span>天眼任务</span></div><div><b>${b}</b><span>桥梁观察</span></div><div><b>${r}</b><span>工程调查</span></div></div><p class="v17-archive-text">记录保存在本机，可随时继续探索。</p><button class="v22-resource-link" type="button" data-v22-resource="open">查看原始地形与配置状态</button><button class="v17-action-main" type="button" data-v17-record="games">继续探索 →</button></div>`;
  box.hidden=false;box.querySelector('button')?.focus();
 },
 closeArchive(){$('v17Archive').hidden=true}
};
NS.V17Entry=guide;
document.addEventListener('DOMContentLoaded',()=>guide.init());
})(window.SpatialApp=window.SpatialApp||{});
