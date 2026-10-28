/* V24: perspective-based bridge engineering observation, 5 checkpoints.
 * Real-world chronology and routes remain fixed; scenario instructions are teaching simulations.
 * The simulation does not provide route navigation or vehicle handling. */
(function(NS){'use strict';
const $=id=>document.getElementById(id);
const escapeText=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bridgeTasks=[
 {at:.11,title:'从峡谷看高度',intro:'先从车内确认桥面，再切换远景观察峡谷底部。',views:[['cockpit','看桥面'],['cinematic','看峡谷']],question:'“世界第一高桥”的625米描述哪种距离？',choices:[['桥面与水面之间的垂直高差',true],['桥面所在位置的海拔高度',false]],why:'625米是桥面到水面的垂直高差，不等同于海拔。当前场景采用示意模型，测量应以工程资料为准。',record:'区别桥面高度与海拔',follow:'沿桥前进，继续辨认主跨。',measure:'625'},
 {at:.29,title:'主跨究竟有多长',intro:'跟车观察桥面，切换远景确认两座主塔之间的跨度。',views:[['follow','观察桥体'],['cinematic','观察主塔']],question:'主跨1420米与全桥2890米是什么关系？',choices:[['主跨是一段结构跨度，全桥包括其他桥段',true],['主跨就等于整座桥的长度',false]],why:'主跨1420米，桥梁全长2890米。主跨尺度与整座桥的长度需要分别理解。',record:'区分主跨与桥梁全长',follow:'观察吊索如何把荷载传递到主缆。',measure:'1420'},
 {at:.49,title:'吊索把重量传到哪里',intro:'切换跟车和远景视角，看看桥面、吊索与主缆的位置。',views:[['follow','观察桥面'],['cinematic','观察缆索']],question:'对于这种悬索桥，桥面荷载主要沿哪条结构路径传递？',choices:[['桥面 → 吊索 → 主缆 → 主塔与锚碇',true],['桥面完全依靠栏杆承受和传递荷载',false]],why:'吊索与主缆是悬索桥的关键承力构件，主缆向主塔与锚碇传递荷载。此模型仅用于识别结构关系。',record:'辨认悬索桥承力链条',follow:'施工阶段还需用监测控制形变与索力。'},
 {at:.69,title:'施工为什么要反复监测',intro:'从侧窗观察主塔一侧，再用远景查看主缆和钢桁梁的整体关系。',views:[['passenger','看塔与桥面'],['cinematic','看整体结构']],question:'吊装钢桁梁时，为什么需要监测索力、温度和位置？',choices:[['施工状态会变化，必须根据数据调整工序与精度',true],['大跨桥梁安装结束后无需监测结构状态',false]],why:'工程公开资料记录了温度、索力、倾角、定位等施工监测手段。模型中的数值并非真实监测值。',record:'了解施工监测的作用',follow:'继续观察桥梁与两岸村寨的关系。'},
 {at:.86,title:'过桥以后，谁的路改变了',intro:'用乘客视角观察两岸，再切换远景区分高速主线与村寨道路。',views:[['passenger','观察两岸'],['cinematic','观察干线与村寨']],question:'大桥通车能否证明周边所有村寨的日常出行同步改善？',choices:[['需分别调查高速接入、村内道路与实际出行',true],['只要主桥通车，所有村道必然同步改善',false]],why:'桥梁改善跨峡谷干线通行，但村寨接驳、生产与步行道路各有条件。',record:'区分干线与地方出行',follow:'完成五份工程观察档案，可以回到地图查看两岸。'}
];
const Stage4={bridge:{open:false,index:-1,seen:new Set(),phase:'observe',observed:new Set(),notice:'',answers:[]},truck:{route:null,cargo:false,checked:new Set(),phase:'cargo',notice:'',finished:false},
 init(){this.setupBridge()},
 bridgeDOM(){return $('v20BridgeMission')},
 setupBridge(){const d=NS.Drive;if(!d)return;
  const el=document.createElement('section');el.id='v20BridgeMission';el.className='v20-bridge-mission';el.hidden=true;el.setAttribute('role','region');el.setAttribute('aria-label','桥梁观察任务，右侧卡片不阻挡视角切换');$('driveHud').appendChild(el);
  el.addEventListener('click',e=>{const b=e.target.closest('button[data-v20]');if(!b)return;const action=b.dataset.v20,task=bridgeTasks[this.bridge.index];if(!task)return;
   if(action==='toggle-card'){el.classList.toggle('v23-collapsed');const toggle=el.querySelector('.v23-bridge-minimize');if(toggle)toggle.textContent=el.classList.contains('v23-collapsed')?'显示任务说明 ↓':'收起说明，看清桥面 ↑';return}
   if(action==='glance'){d.glance(b.dataset.side==='left'?-1:1);return}
   if(action==='view'){el.classList.remove('v23-collapsed');d.setMode(b.dataset.mode);this.bridge.observed.add(b.dataset.mode);this.bridge.notice='';this.renderBridge()}
   if(action==='decide'){if(this.bridge.observed.size<task.views.length)return;this.bridge.phase='decide';this.renderBridge()}
   if(action==='answer'){const ans=task.choices[Number(b.dataset.choice)];if(!ans)return;if(!ans[1]){this.bridge.notice='请回到两个视角比较后再判断。';this.renderBridge();return}this.bridge.phase='result';this.bridge.notice='';this.bridge.seen.add(this.bridge.index);this.bridge.answers.push({task:this.bridge.index,record:task.record,views:task.views.map(v=>v[0]),source:'教学模拟与公开资料'});
      const record=NS.LearningRecords?.bridge;if(record){record.seen=[...new Set([...(record.seen||[]),this.bridge.index])].sort();record.complete=record.seen.length===bridgeTasks.length;record.observations=this.bridge.answers.slice();NS.saveLearningRecords?.()}this.renderBridge()}
   if(action==='continue'){this.closeBridgeMission();if(d.phase==='active'){d.paused=false;d.updateUI(true)}}
  });
  const originalStart=d.start.bind(d),originalAdvance=d.advance.bind(d),originalSeek=d.seek.bind(d),originalExit=d.exit.bind(d),originalReplay=d.replay.bind(d),originalPause=d.togglePause.bind(d);
  d.start=(...args)=>{const r=originalStart(...args);if(r){this.bridge={open:false,index:-1,seen:new Set(),phase:'observe',observed:new Set(),notice:'',answers:[]};this.closeBridgeMission()}return r};
  // V33: checkpoints are *distance* boundaries, not estimates based on a fixed 72s movie.
  // Advance physics first, then stop exactly at the first as-yet-unobserved checkpoint crossed.
  d.advance=dt=>{
   if(this.bridge.open)return originalAdvance(0);
   if(d.phase!=='active'||d.paused)return originalAdvance(dt);
   const before=d.progress;
   originalAdvance(dt);
   const next=bridgeTasks.findIndex((task,i)=>!this.bridge.seen.has(i) && before<=task.at+1e-6 && d.progress>=task.at-1e-6);
   if(next>=0){d.progress=bridgeTasks[next].at;
    if(d.physics)d.physics.distance=d.progress*d.route.length;
    if(d.phase==='complete'){d.phase='active';NS.DriveUI.hideFinish()}
    this.openBridgeMission(next);
   }
  };
  d.seek=p=>{if(this.bridge.open)return;const next=bridgeTasks.findIndex((t,i)=>!this.bridge.seen.has(i));const cap=next>=0?bridgeTasks[next].at:1;originalSeek(Math.min(Math.max(0,Number(p)||0),cap));if(next>=0&&d.phase==='active'&&d.progress>=cap-1e-5)this.openBridgeMission(next)};
  d.togglePause=(...args)=>{if(this.bridge.open)return;return originalPause(...args)};
  d.exit=(...args)=>{this.closeBridgeMission();return originalExit(...args)};
  d.replay=(...args)=>{this.closeBridgeMission();this.bridge={open:false,index:-1,seen:new Set(),phase:'observe',observed:new Set(),notice:'',answers:[]};return originalReplay(...args)};
  // A stopped story panel is a simulated viewpoint pause, never a claim that vehicles may stop on the real bridge.
  const finish=$('driveFinish');finish?.insertAdjacentHTML('afterbegin','<p id="v20BridgeSummary" class="v20-result"></p>');
  const oldShowFinish=NS.DriveUI.showFinish.bind(NS.DriveUI);NS.DriveUI.showFinish=()=>{const output=$('v20BridgeSummary');if(output)output.textContent=`本次留下 ${this.bridge.answers.length}/${bridgeTasks.length} 张观察记录。`+ (this.bridge.answers.length===bridgeTasks.length?'你已比较工程高度、主跨与地方交通。':'可以重新体验补全观察。');oldShowFinish()};
 },
 openBridgeMission(index){const b=this.bridge;b.index=index;b.open=true;NS.setState({measure:bridgeTasks[index]?.measure||null});b.phase='observe';b.observed=new Set();b.notice='';NS.Drive.paused=true;NS.Drive.updateUI(true);this.bridgeDOM().classList.remove('v23-collapsed');this.renderBridge();this.bridgeDOM().hidden=false;this.bridgeDOM().querySelector('button[data-v20="view"]')?.focus({preventScroll:true})},
 closeBridgeMission(){this.bridge.open=false;this.bridgeDOM().hidden=true;NS.setState({measure:null})},
 renderBridge(){const b=this.bridge,t=bridgeTasks[b.index],el=this.bridgeDOM();if(!t||!el)return;let detail='';
  if(b.phase==='observe')detail=`<span class="v20-step-label">请亲手切换两个视角。已观察 ${b.observed.size}/${t.views.length}</span><div class="v20-mission-options">${t.views.map(([mode,label])=>`<button data-v20="view" data-mode="${mode}" class="${b.observed.has(mode)?'seen':''}">${b.observed.has(mode)?'✓ ':'◎ '}${escapeText(label)}</button>`).join('')}</div><button class="v20-primary" data-v20="decide" ${b.observed.size<t.views.length?'disabled':''}>完成观察，作出判断</button>`;
  else if(b.phase==='decide')detail=`<span class="v20-step-label">依据刚才两个视角，选择可信的解释。</span><p>${escapeText(t.question)}</p><div class="v20-mission-options">${t.choices.map((c,i)=>`<button data-v20="answer" data-choice="${i}">${escapeText(c[0])}</button>`).join('')}</div>`;
  else detail=`<div class="v20-result"><strong>✓ 已保存观察</strong><p>${escapeText(t.record)}</p><p>${escapeText(t.why)}</p></div><p>${escapeText(t.follow)}</p><button class="v20-primary" data-v20="continue">保存并继续路线 →</button>`;
  el.innerHTML=`<button class="v23-bridge-minimize" data-v20="toggle-card" type="button">收起说明，看清桥面 ↑</button><span class="v20-kicker">桥梁观察 ${b.index+1}/${bridgeTasks.length} · 教学暂停</span><div class="v20-progress">${bridgeTasks.map((_,i)=>`<span class="${i<b.index?'done':''}"></span>`).join('')}</div><h3>${escapeText(t.title)}</h3>${b.phase==='observe'?`<p>${escapeText(t.intro)}</p>`:''}${b.phase==='observe'?'<div class="v23-bridge-shortcut"><button data-v20="glance" data-side="left">← 向左看</button><button data-v20="glance" data-side="right">向右看 →</button></div><p class="v23-bridge-help">使用上方按钮或画面边缘的视角栏，画面可继续操作。</p>':''}${detail}<p class="v20-feedback" role="status">${escapeText(b.notice)}</p><p class="v20-sim-note">场景为教学模拟；真实桥梁上不得以游戏中的“暂停”行为作为停车依据。</p>`;
 },
};
NS.Stage4Journey=Stage4;
document.addEventListener('DOMContentLoaded',()=>Stage4.init());
})(window.SpatialApp=window.SpatialApp||{});
