/* V7 P4 · FAST radio quiet-zone interactive learning game. Educational simulation, not operational RF data. */
(function(NS){'use strict';
const $=id=>document.getElementById(id);
const FACT='https://www.cac.gov.cn/2025-02/26/c_1742272852825362.htm';
const LAW='https://www.zgzfcbp.cn/zffile/show-135008.html';
const CASES=[
 {radius:3,zone:'核心区 · 半径 0—5 km',title:'观景前的电子设备',scenario:'一位游客准备前往观测区域，想携带开启的手机进行直播。应怎样处理？',choices:['直接进入，关闭声音即可','按照现场规定存放设备，不擅自携带进入','让朋友带着手机，自己空手进入'],answer:1,explain:'核心区对擅自携带手机、无人机等无线电发射设备或产生电磁辐射的电子产品有明确限制。实际参观应遵守景区与科研保护要求。'},
 {radius:8,zone:'中间区 · 5—10 km',title:'在村镇设立无线电台站',scenario:'有人希望在距台址约 8 公里处设置无线电台站。下列哪种态度最符合保护要求？',choices:['只要不在 5 公里范围内就完全不受约束','事前核对频率、功率等限制并依法履行有关手续','所有设备不分频率、功率一律禁止'],answer:1,explain:'中间区实施差异化的电磁环境管理，部分频段和发射功率条件受到明确限制，不能理解为无条件开放或全面禁止。'},
 {radius:22,zone:'边远区 · 10—30 km',title:'规划可能产生无线电波的设施',scenario:'一项可能产生无线电波的建设计划位于距台址约 22 公里的位置。如何处理最审慎？',choices:['不经核验即可建设，因为距离足够远','先核对保护办法及主管部门要求，按规定完成协调审批','仅根据游戏里的圆环判断可否建设'],answer:1,explain:'边远区仍属于电磁波宁静区，涉及无线电设施的项目需要依据适用规定和具体参数判断；模拟圆环不能代替行政审批。'}
];
const DEVICES=[{id:'phone',icon:'▣',name:'手机热点',info:'示意：无线数据发射',wave:'29%'},{id:'drone',icon:'✣',name:'无人机遥控链路',info:'示意：遥控无线传输',wave:'61%'},{id:'station',icon:'⌁',name:'未经核验的发射设备',info:'示意：射频干扰来源',wave:'83%'}];
function safeStore(key,val){try{localStorage.setItem(key,JSON.stringify(val))}catch(_){}}
function safeRead(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(_){return null}}
function wavePath(kind){let d='';for(let i=0;i<=168;i++){
  const x=5+i*2.7, t=i/168;let y=60;
  if(kind===0){const pulse=Math.pow(Math.max(0,Math.cos(t*6*Math.PI)),28);y=63-42*pulse+4*Math.sin(i*1.7)}
  if(kind===1){y=60+19*Math.sin(t*50+Math.sin(t*17)*8)+9*Math.sin(t*137)}
  if(kind===2){y=60+22*Math.sin(t*7*Math.PI)+2*Math.sin(t*52)}
  d+=(i?'L':'M')+x.toFixed(1)+','+y.toFixed(1)+' ';
 }return d}
const WAVE_PATHS=[0,1,2].map(wavePath);
const Game={active:false,stage:-1,portalTimer:null,saved:null,lastFocus:null,originSite:'fast',devices:new Set(),caseIndex:0,caseFeedback:null,waveAnswer:null,completed:[false,false,false],attempts:0,
 init(){
  $('fastQuickStart').addEventListener('click',()=>this.open());$('fastPulse').addEventListener('click',()=>this.open());
  $('fastGameExit').addEventListener('click',()=>this.close());
  $('fastGameMain').addEventListener('click',e=>this.onClick(e));
  document.addEventListener('keydown',e=>{
   if(!this.active)return;
   if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.close();return}
   if(e.key==='Tab'){
    const nodes=[...$('fastGameShell').querySelectorAll('button:not(:disabled),a[href]')].filter(el=>el.getClientRects().length);
    if(!nodes.length)return;
    if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes[nodes.length-1].focus()}
    if(!e.shiftKey&&document.activeElement===nodes[nodes.length-1]){e.preventDefault();nodes[0].focus()}
   }
  });
  NS.onState((s,p)=>{if('site'in p){if(this.active&&s.site!=='fast')this.close(false);this.updatePortal()}});
  this.portalTimer=setInterval(()=>this.updatePortal(),280);this.updatePortal();
 },
 updatePortal(){const active=NS.state.entered&&NS.state.site==='fast'&&!this.active&&!NS.Drive?.active&&NS.Geo?.mode==='demo';
  $('fastQuickStart').hidden=!active;const saved=safeRead('guizhou-fast-game-v7p4');const caption=$('fastQuickStart').querySelector('small');if(caption)caption.textContent=saved?'已完成过挑战 · 再次探索三个关卡':'3 个关卡 · 电磁宁静区 / 科学探测';const pin=$('fastPulse');pin.hidden=!active;if(!active)return;
  const n=NS.DB.nodes.fast_core,eng=NS.App?.engine;if(!eng||!n)return;
  const p=eng.proj({x:n.scene_x,y:n.scene_y+120,z:n.scene_z});if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)){pin.hidden=true;return}
  pin.style.left=Math.max(15,Math.min(innerWidth-245,p.x+35))+'px';pin.style.top=Math.max(115,Math.min(innerHeight-200,p.y-55))+'px';
 },
 open(){
  if(NS.Drive?.active)return;
  if(!NS.state.entered){NS.App.enterMap();setTimeout(()=>this.open(),1280);return}
  if(this.active)return;
  this.originSite=NS.state.site;this.lastFocus=document.activeElement;
  if(NS.state.story){clearTimeout(NS.App.storyTimer);NS.setState({story:false})}
  if(NS.Geo?.mode==='demo'&&NS.state.site!=='fast')NS.App.setSite('fast');
  if(NS.Geo?.mode!=='demo')NS.Geo.focus('fast');
  this.active=true;this.stage=-1;this.devices=new Set(DEVICES.map(d=>d.id));this.caseIndex=0;this.caseFeedback=null;this.waveAnswer=null;this.completed=[false,false,false];this.attempts=0;
  $('fastGameShell').hidden=false;document.body.classList.add('is-fast-playing');this.render();this.updatePortal();$('fastGameExit').focus();
 },
 close(restoreFocus=true){if(!this.active)return;this.active=false;$('fastGameShell').hidden=true;document.body.classList.remove('is-fast-playing');this.updatePortal();
  if(restoreFocus&&this.lastFocus?.isConnected&&typeof this.lastFocus.focus==='function')this.lastFocus.focus({preventScroll:true});
 },
 next(){if(this.stage===-1)this.stage=0;else if(this.stage<3)this.stage+=1;this.caseFeedback=null;this.render()},
 onClick(e){const t=e.target.closest('button[data-action]');if(!t)return;const a=t.dataset.action;
  if(a==='begin'){this.next();return}
  if(a==='toggle'&&this.stage===0){const k=t.dataset.id;if(this.devices.has(k))this.devices.delete(k);else this.devices.add(k);this.render();return}
  if(a==='verify-quiet'&&this.stage===0){if(this.devices.size){this.attempts++;this.hint('还有 '+this.devices.size+' 项虚拟干扰源未关闭。请先检查三处发射装置。');return}
    this.completed[0]=true;this.stage=1;this.render();return}
  if(a==='pick'&&this.stage===1){if(this.caseFeedback)return;const n=Number(t.dataset.choice),ok=n===CASES[this.caseIndex].answer;
    if(!ok)this.attempts++;this.caseFeedback={correct:ok,choice:n};this.render();return}
  if(a==='retry-case'&&this.stage===1){this.caseFeedback=null;this.render();return}
  if(a==='advance-case'&&this.stage===1){this.caseFeedback=null;if(this.caseIndex<CASES.length-1){this.caseIndex++}else{this.completed[1]=true;this.stage=2}this.render();return}
  if(a==='wave'&&this.stage===2){this.waveAnswer=Number(t.dataset.wave);this.render();return}
  if(a==='check-wave'&&this.stage===2){if(this.waveAnswer===null){this.hint('请先点击一条波形记录，再提交你的判断。');return}
    if(this.waveAnswer!==0){this.attempts++;this.hint('这条波形缺少稳定的重复峰值。请比较三条记录，再找最有规律的候选。');return}
    this.completed[2]=true;this.stage=3;safeStore('guizhou-fast-game-v7p4',{completedAt:new Date().toISOString(),attempts:this.attempts});this.render();return}
  if(a==='replay'){this.stage=-1;this.devices=new Set(DEVICES.map(d=>d.id));this.caseIndex=0;this.caseFeedback=null;this.waveAnswer=null;this.completed=[false,false,false];this.attempts=0;this.render();return}
  if(a==='finish'){this.close();return}
 },
 hint(s){const el=$('fastGameHint');el.textContent=s;el.hidden=false;el.setAttribute('role','status')},
 header(){const n=Math.max(0,Math.min(3,this.stage));return `<div class="fast-game-progress" role="progressbar" aria-label="任务完成进度" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${n}"><span style="width:${n/3*100}%"></span></div><div class="fast-game-missions"><span class="${this.stage===0?'now':this.stage>0?'done':''}">01 · 寻找干扰</span><span class="${this.stage===1?'now':this.stage>1?'done':''}">02 · 判读宁静区</span><span class="${this.stage===2?'now':this.stage>2?'done':''}">03 · 识别候选</span></div>`},
 radar(){return `<div class="fast-radar" role="img" aria-label="5、10、30公里电磁波宁静区分级概念图，非真实地理测绘"><div class="fast-radar-ring outer"><small>30 km · 边远区</small></div><div class="fast-radar-ring mid"><small>10 km · 中间区</small></div><div class="fast-radar-ring inner"><small>5 km · 核心区</small></div><div class="fast-radar-center"><span>◎</span><b>FAST</b></div><div class="fast-radar-sweep"></div></div>`},
 intro(){const prev=safeRead('guizhou-fast-game-v7p4');return `<div class="fast-game-chapter"><span class="fast-kicker">MISSION ZERO · RADIO SILENCE</span><h2>你能守护一段<br><em>来自宇宙的微弱信号</em>吗？</h2><p class="fast-explain">进入 FAST 电磁宁静区的虚拟任务。排查无线电干扰、理解 5 / 10 / 30 公里分区规则，并在模拟观测记录里寻找值得进一步研究的信号。</p><div class="fast-fact-row"><span><b>3</b> 个关卡</span><span><b>5 / 10 / 30</b> km 分区</span><span><b>0</b> 实测射频数据</span></div><p class="fast-ethics">本游戏仅用于科普。地图圆环、信号波形与干扰强度均为教学示意；现实保护区限制以现行法规及现场管理为准。</p>${prev?`<p class="fast-history">✧ 此设备已完成过一次挑战，可重新体验全部关卡。</p>`:''}<button class="fast-game-primary" data-action="begin">开始信号守护任务 <span>→</span></button></div>`},
 quiet(){let noise=this.devices.size;return `<div class="fast-game-chapter"><span class="fast-kicker">CHAPTER 01 / RADIO NOISE</span><h2>先让接收环境安静下来</h2><p class="fast-explain">假设你正在演示区检查潜在的无线电干扰。点击下方三项虚拟发射源，将其全部关闭，再观察下方的噪声指示如何变化。</p><div class="fast-noise-meter"><div class="fast-noise-top"><strong>示意干扰等级</strong><span>${noise?'检测到 '+noise+' 处模拟源':'干扰源均已关闭'}</span></div><div class="fast-noise-bars" aria-label="教学用噪声等级 ${noise} / 3">${Array.from({length:12},(_,i)=>`<i class="${i<noise*4?'hot':''}" style="height:${12+(i*17%31)}px"></i>`).join('')}</div><small>相对刻度 · 不代表 FAST 真实噪声测量</small></div><div class="fast-device-grid">${DEVICES.map(d=>`<button data-action="toggle" data-id="${d.id}" aria-pressed="${this.devices.has(d.id)}" class="fast-device ${this.devices.has(d.id)?'is-on':''}"><span class="fast-device-icon">${d.icon}</span><b>${d.name}</b><small>${d.info}</small><strong>${this.devices.has(d.id)?'● 发射中 · 点击关闭':'✓ 已关闭 · 点击恢复'}</strong></button>`).join('')}</div><div id="fastGameHint" class="fast-game-inline-msg" role="status" hidden></div><button class="fast-game-primary" data-action="verify-quiet">确认环境检查 <span>→</span></button><p class="fast-evidence">知识提示：电磁环境保护需要对无线电发射设备和相关设施实施分级管理。这里的控制开关仅是可视化教学。</p></div>`},
 zones(){const c=CASES[this.caseIndex],correct=this.caseFeedback?.correct;return `<div class="fast-game-chapter"><span class="fast-kicker">CHAPTER 02 / QUIET ZONE · 场景 ${this.caseIndex+1} / 3</span><h2>把位置放进正确的规则里</h2><p class="fast-explain">依据 2019 年《贵州省500米口径球面射电望远镜电磁波宁静区保护办法》理解梯度管理。每次回答后会解释依据，答错可以重试。</p><div class="fast-zone-layout"><div class="fast-zone-map">${this.radar()}<span class="fast-zone-pin" style="--pin-r:${c.radius<=5?4:c.radius<=10?12:32}%">✦ <small>${c.radius}km 案例</small></span></div><div class="fast-zone-card"><strong>${c.zone}</strong><h3>${c.title}</h3><p>${c.scenario}</p><div class="fast-case-options">${c.choices.map((choice,i)=>`<button data-action="pick" data-choice="${i}" ${this.caseFeedback?'disabled':''} class="${this.caseFeedback?.choice===i?(correct?'is-right':'is-wrong'):''}"><span>${String.fromCharCode(65+i)}</span>${choice}</button>`).join('')}</div></div></div><div class="fast-zone-explain" aria-label="分区说明"><span>0—5km 核心区</span><span>5—10km 中间区</span><span>10—30km 边远区</span></div>${this.caseFeedback?`<div class="fast-feedback ${correct?'pass':'retry'}" role="status"><strong>${correct?'判断准确':'这一判断还不够严谨'}</strong><p>${correct?c.explain:'这类行为不能仅按距离直觉判断。请重新考虑制度限制与管理程序。'}</p><button data-action="${correct?'advance-case':'retry-case'}">${correct?(this.caseIndex===2?'进入信号识别关':'继续下一处情境'):'重新选择'} →</button></div>`:''}<p class="fast-evidence">分区半径来自法规；案例是为教学构造的情境，不代表真实项目审批结论。</p></div>`},
 signals(){return `<div class="fast-game-chapter"><span class="fast-kicker">CHAPTER 03 / SIGNAL DETECTION</span><h2>哪一条值得继续验证？</h2><p class="fast-explain">假设经过干扰检查，你得到三条<strong>完全虚构的示范波形</strong>。选择重复脉冲节律最明显的一条，作为后续分析的候选记录。规律性只是线索，不等于已经发现脉冲星。</p><div class="fast-wave-grid">${WAVE_PATHS.map((p,i)=>`<button data-action="wave" data-wave="${i}" aria-pressed="${this.waveAnswer===i}" class="fast-wave-card ${this.waveAnswer===i?'is-selected':''}"><header><span>RECORD ${String(i+1).padStart(2,'0')}</span><b>${this.waveAnswer===i?'✓ 已选择':'点击查看'}</b></header><svg viewBox="0 0 470 125" aria-hidden="true"><path class="gridline" d="M5 60H465 M5 28H465 M5 92H465"/><path class="curve" d="${p}"/></svg><small>${['候选记录 A','候选记录 B','候选记录 C'][i]} · 人工合成</small></button>`).join('')}</div><div id="fastGameHint" class="fast-game-inline-msg" role="status" hidden></div><button class="fast-game-primary" data-action="check-wave">提交候选记录 <span>→</span></button><p class="fast-evidence">科学说明：真实射电天文研究还要进行射频干扰排除、重复观测、信号处理与独立验证。本关不模拟真实观测分析过程。</p></div>`},
 finish(){return `<div class="fast-game-chapter fast-game-result"><div class="fast-game-badge">✧<span>FAST<br>SCIENCE</span></div><span class="fast-kicker">MISSION COMPLETE</span><h2>宁静守护者 · 挑战完成</h2><p class="fast-explain">你已排除虚拟干扰源、完成三个法规情境，并识别出一条应进一步核验的模拟脉冲候选。</p><div class="fast-fact-row"><span><b>3 / 3</b> 已完成任务</span><span><b>${this.attempts}</b> 次重试</span><span><b>0</b> 真实科研结论</span></div><p class="fast-ethics">真正的 FAST 观测成果取决于科研人员、精密设备和科学验证。游戏只能帮助认识其保护环境的重要性。</p><div class="fast-result-actions"><button class="fast-game-primary" data-action="finish">返回地图探索 <span>→</span></button><button class="fast-game-outline" data-action="replay">重新挑战 ↺</button></div></div>`},
 render(){if(!this.active)return;const labels=['任务准备','消除虚拟干扰','宁静区空间判读','虚拟波形辨认','任务完成'];$('fastGameChapter').textContent=labels[this.stage+1]||'任务准备';$('fastGameScore').textContent=this.completed.filter(Boolean).length+'/3 已完成';
  $('fastGameMain').innerHTML=`${this.header()}<div class="fast-game-two-col"><section class="fast-game-visual">${this.radar()}<p class="fast-visual-tag">RADIO QUIET ZONE / EDUCATIONAL MODEL</p><div class="fast-game-visual-info"><strong>世界级射电科学设施</strong><span>500 米口径球面射电望远镜 · 贵州平塘</span></div><div class="fast-game-source"><span>真实法规事实 / 示意交互分开标注</span><a href="${FACT}" target="_blank" rel="noopener noreferrer">查看公开报道 ↗</a><a href="${LAW}" target="_blank" rel="noopener noreferrer">查看保护办法 ↗</a></div></section><section class="fast-game-main-pane">${this.stage===-1?this.intro():this.stage===0?this.quiet():this.stage===1?this.zones():this.stage===2?this.signals():this.finish()}</section></div>`;
  const main=$('fastGameMain');main.scrollTop=0;const pane=main.querySelector('.fast-game-main-pane');if(pane)pane.scrollTop=0;
 }
};NS.FastGame=Game;document.addEventListener('DOMContentLoaded',()=>Game.init());
})(window.SpatialApp=window.SpatialApp||{});
