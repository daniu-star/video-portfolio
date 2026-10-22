/* V5.0 original chip score: standalone audio files generated for this project.
   No audio, melody, game asset or sound recording from 元气骑士 is bundled.
   Opt-in playback; respects the browser's audio gesture policy and reduced-motion setting. */
(function(){'use strict';
 if(window.AtlasPixelAudio)return;
 const scenes={journey:{name:'毕业季 · 城市小调',path:'./assets/music/journey.mp3'},maze:{name:'教育迷宫 · 夜行曲',path:'./assets/music/maze.mp3'}};
 const clips=Object.fromEntries(Object.entries(scenes).map(([id,s])=>{const a=new Audio(s.path);a.preload='none';a.loop=true;a.volume=0;return [id,a]}));
 const DBKEY='archive-pixel-music-v50';const isReduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 let state={enabled:false,volume:.55,scene:'journey'},initialized=false,active=null,crossFade=null,ctx=null,lastCue=0,lastVisible=false;
 try{const saved=JSON.parse(localStorage.getItem(DBKEY)||'{}');if(Number.isFinite(saved.volume))state.volume=Math.min(1,Math.max(0,saved.volume));if(saved.scene in scenes)state.scene=saved.scene;}catch(_){}
 const safeSave=()=>{try{localStorage.setItem(DBKEY,JSON.stringify({volume:state.volume,scene:state.scene}));}catch(_){}};
 function visibleRatio(el){if(!el)return 0;const r=el.getBoundingClientRect(),w=innerWidth,h=innerHeight;const area=Math.max(0,Math.min(w,r.right)-Math.max(0,r.left))*Math.max(0,Math.min(h,r.bottom)-Math.max(0,r.top));return area/Math.max(1,Math.min(r.width,w)*Math.min(r.height,h));}
 function visibleScene(){let job=document.querySelector('#em-pixel-game'),maze=document.querySelector('#rm39-game');if(visibleRatio(job)>.12)return 'journey';if(visibleRatio(maze)>.12)return 'maze';return null;}
 function showingDialogue(){return !!document.querySelector('.gg46-dialogue:not([hidden]), .gg46-help:not([hidden]), #rm39-encounter:not([hidden]), #rm40-game-overlay:not([hidden])');}
 function targetVolume(){return state.volume*.65*(showingDialogue()?.31:1);}
 function ramp(el,to,duration=500){if(crossFade)cancelAnimationFrame(crossFade);const begin=performance.now(),from=el.volume;const tick=now=>{const k=Math.min(1,(now-begin)/duration);el.volume=Math.max(0,Math.min(1,from+(to-from)*(1-(1-k)*(1-k))));if(k<1)crossFade=requestAnimationFrame(tick);else crossFade=null;};crossFade=requestAnimationFrame(tick);}
 async function sync(gesture=false){const scene=visibleScene();lastVisible=!!scene;
   if(!state.enabled || !scene || document.hidden){for(const a of Object.values(clips)){a.pause();a.volume=0;}active=null;render();return;}
   state.scene=scene;const a=clips[scene];
   for(const [id,other] of Object.entries(clips))if(id!==scene){other.pause();other.volume=0;}
   if(a.paused){try{await a.play();}catch(err){
     state.enabled=false;active=null;for(const other of Object.values(clips))other.pause();
     render('浏览器需要你点击开启音乐');return;
   }}
   active=scene;ramp(a,targetVolume(),isReduced()?100:480);render();
 }
 function render(message=''){
   const name=active?scenes[active].name:visibleScene()?scenes[visibleScene()].name:'滑到游戏后播放';
   document.querySelectorAll('[data-pixel-audio-toggle]').forEach(btn=>{btn.setAttribute('aria-pressed',String(state.enabled));btn.textContent=state.enabled?'♫ 配乐：开':'♫ 开启配乐';btn.title=state.enabled?'关闭原创8-bit配乐':'开启原创8-bit配乐';});
   document.querySelectorAll('[data-pixel-audio-volume]').forEach(el=>{el.value=String(Math.round(state.volume*100));el.setAttribute('aria-valuetext',Math.round(state.volume*100)+'%');});
   document.querySelectorAll('[data-pixel-audio-status]').forEach(el=>{el.textContent=message||name;});
   const float=document.querySelector('#pixel-audio-dock');if(float){float.classList.toggle('is-visible',!!visibleScene());float.classList.toggle('is-on',state.enabled);}
 }
 function beep(type='choose'){
   if(!state.enabled || !lastVisible)return;
   try{ctx ||=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume().catch(()=>{});
     const at=ctx.currentTime,notes={choose:[[587,0],[783,.07]],dialog:[[440,0],[523,.10]],collect:[[523,0],[659,.12],[880,.24]],victory:[[392,0],[523,.11],[659,.23],[1047,.36]],error:[[220,0]],step:[[330,0]]}[type]||[[550,0]];
     for(const [hz,delay] of notes){const osc=ctx.createOscillator(),gain=ctx.createGain(),s=at+delay;osc.type='square';osc.frequency.setValueAtTime(hz,s);gain.gain.setValueAtTime(.0001,s);gain.gain.linearRampToValueAtTime(.016*state.volume,s+.007);gain.gain.exponentialRampToValueAtTime(.0001,s+.13);osc.connect(gain).connect(ctx.destination);osc.start(s);osc.stop(s+.145);}
   }catch(_){}
 }
 function setEnabled(value){state.enabled=!!value;
   if(state.enabled){window.dispatchEvent(new CustomEvent('atlas:pixel-music',{detail:{enabled:true}}));}
   else{for(const a of Object.values(clips)){a.pause();a.volume=0;}active=null;}
   sync(true);render();return state.enabled;
 }
 function setVolume(v){state.volume=Math.min(1,Math.max(0,Number(v)||0));safeSave();if(active){clips[active].volume=targetVolume();}render();}
 // Capturing focus & route changes is only for scene selection, never implicit consent.
 let frame=0;const refresh=()=>{if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=0;
   const found=visibleScene();if((found||null)!==(active||null))sync();else if(active)clips[active].volume=targetVolume();render();
 });};
 function init(){if(initialized)return;initialized=true;
   const dock=document.createElement('div');dock.id='pixel-audio-dock';dock.className='pixel-audio-dock';dock.setAttribute('role','group');dock.setAttribute('aria-label','像素游戏音乐控制');
   dock.innerHTML='<div class="pixel-audio-face"><span class="pixel-audio-indicator" aria-hidden="true">♫</span><div class="pixel-audio-copy"><b>像素游戏唱片机</b><small data-pixel-audio-status>滑到游戏后播放</small></div><button type="button" data-pixel-audio-toggle aria-pressed="false">♫ 开启配乐</button><button type="button" class="pixel-audio-expand" data-pixel-audio-expand aria-label="展开音量控制" aria-expanded="false">⌄</button></div><label class="pixel-audio-level">音量 <input type="range" data-pixel-audio-volume aria-label="游戏音乐音量" min="0" max="100" step="5" value="55"><span>0–100</span></label><small class="pixel-audio-credit">原创 8-bit 配乐 · 本地播放 · 无需网络</small>';
   document.body.appendChild(dock);
   document.addEventListener('click',e=>{
      const expand=e.target.closest('[data-pixel-audio-expand]');if(expand){const x=dock.classList.toggle('is-expanded');expand.setAttribute('aria-expanded',String(x));expand.textContent=x?'⌃':'⌄';return;}
      const btn=e.target.closest('[data-pixel-audio-toggle]');if(btn){e.preventDefault();setEnabled(!state.enabled);return;}
      if(!state.enabled)return;
      const t=e.target.closest('button');if(!t)return;
      if(t.matches('[data-gg47-role],[data-gg46-option],[data-quiz-index],[data-station-choice]'))beep('choose');
      else if(t.matches('[data-gg46="record"]'))beep(t.textContent.includes('收下')?'collect':'dialog');
      else if(t.matches('[data-gg46-npc],[data-gg46="interact"]'))beep('dialog');
      else if(t.matches('[data-gg46="export"],#rm39-download'))beep('victory');
      else if(t.matches('[data-quiz-continue],#rm40-notebook'))beep('dialog');
      if(t.closest('#em-pixel-game,#rm39-archive'))requestAnimationFrame(()=>{if(active)clips[active].volume=targetVolume();});
   },true);
   document.addEventListener('input',e=>{if(e.target.matches('[data-pixel-audio-volume]'))setVolume(e.target.value/100);});
   let lastState='';const observer=new MutationObserver(()=>{const now=showingDialogue()?'dialogue':'explore';if(now!==lastState){lastState=now;if(active)ramp(clips[active],targetVolume(),190);}});
   observer.observe(document.querySelector('#main')||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
   window.addEventListener('scroll',refresh,{passive:true});window.addEventListener('hashchange',()=>setTimeout(refresh,180));window.addEventListener('resize',refresh);document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const a of Object.values(clips))a.pause();active=null;render();}else refresh();});
   render();setTimeout(refresh,200);
 }
 window.AtlasPixelAudio={init,setEnabled,setVolume,refresh,sync,beep,status:()=>({...state,playing:!!active,scene:active}),tracks:scenes,debug:()=>Object.fromEntries(Object.entries(clips).map(([k,a])=>[k,{paused:a.paused,time:a.currentTime,volume:a.volume,readyState:a.readyState}]))};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
