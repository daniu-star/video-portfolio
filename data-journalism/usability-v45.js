/* V4.5: Anchors in a hash-router must scroll, not corrupt the route. */
(()=>{
 'use strict';
 // Give a directly-opened local index a stable SPA entry, without adding history.
 try{if(!location.hash)history.replaceState(null,'',location.pathname+location.search+'#/overview')}catch(_){}
 function jump(id){
  const el=document.getElementById(id);
  if(!el)return false;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const paused=document.body.classList.contains('motion-paused');
  el.scrollIntoView({behavior:reduced||paused?'instant':'smooth',block:'start'});
  return true;
 }
 document.addEventListener('click',event=>{
  const link=event.target.closest?.('a[href^="#"]');
  if(!link)return;
  const href=link.getAttribute('href')||'';
  if(!href || href==='#' || href.startsWith('#/'))return;
  const id=decodeURIComponent(href.slice(1));
  if(!document.getElementById(id))return;
  event.preventDefault();
  // Leave all existing chapter game handlers intact, but protect SPA from stray fragment navigation.
  requestAnimationFrame(()=>jump(id));
  // Explain the maze at point of first entry rather than hiding instructions in a toolbar.
  if(id==='rm39-game')setTimeout(()=>document.querySelector('#rm40-brief')?.click(),420);
 },true);
 const observer=new MutationObserver(()=>{
  const game=document.querySelector('#rm39-game');
  if(!game||game.querySelector('.rm45-onboarding'))return;
  const title=game.querySelector('.rm39-section-title');
  if(!title)return;
  const el=document.createElement('div');el.className='rm45-onboarding';
  el.innerHTML='<p><strong>游戏目标：</strong>走访课程、能力、职业、公共责任四站；每站先辨析证据，再选择一项培养方案。集齐四枚印记后前往出口，生成可下载的改革草案。<br><span>方向键 / WASD 移动；也可点击地图，或使用「导航到主线」。没有分数排名，研究不支持给制度方案打效果分。</span></p><button type="button" data-rm45-guide>先看操作手册 ↗</button>';
  title.insertAdjacentElement('afterend',el);
 });
 observer.observe(document.getElementById('main')||document.body,{childList:true,subtree:true});
 document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-rm45-guide]'))document.querySelector('#rm40-brief')?.click();
  if(e.target.closest?.('#rm40-brief,[data-rm45-guide]'))setTimeout(()=>{const overlay=document.querySelector('#rm40-game-overlay:not([hidden])');overlay?.scrollIntoView({behavior:'smooth',block:'center'})},120);
 });
})();
