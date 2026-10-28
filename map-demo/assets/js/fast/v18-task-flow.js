/* V18 / step 2: evidence -> decision -> result, resumable task drafts.
 * Integrates with V16's existing 3D educational viewer without altering the historical data. */
(function(NS){'use strict';
const G=NS.FastGame,R=NS.LearningRecords;
if(!G||!R)return;
const $=id=>document.getElementById(id);
const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const REQUIRED={site:[0,1,2],surface:[0,1],quality:[1,2],observation:[0,1],spectrum:[0,1,2],validation:[0,1,2],structure:[0,1,2],assembly:[0,1],weather:[0,1,2],diagnosis:[0,1,2],maintenance:[0,1,2],explain:[0,1],livemap:[0,1,2],consult:[0,1,2],memory:[0,1,2],visit:[0,1,2],quiet:[0,1,2],sciencepublic:[0,1,2]};
const BRIEF={site:'检查已经选定的台址，找到支持建设的三个条件。',surface:'检查局部反射面与馈源的位置关系，完成一次模拟校验。',quality:'对照异常读数与复核程序，决定如何保留工程记录。',observation:'让反射面和馈源完成教学协同，准备模拟采样。',spectrum:'对比三段合成数据，挑出需要复测的信号。',validation:'根据观测、干扰和复测证据填写科研记录。',structure:'检查索网、面板和支撑系统的连接关系。',assembly:'调整两项教学参数，并提交局部装配复核。',weather:'识别现场警报和作业权限，决定是否继续施工。',diagnosis:'查看三个设备记录，确定需要进一步复核的异常。',maintenance:'对照安全与排期信息，安排设备维护。',explain:'从建设和运行记录中找到持续维护的原因。',livemap:'标记居住、生产和出行三个关注点。',consult:'阅读三项社区关切，整理需要进一步核实的问题。',memory:'区分已核实的历史节点和仍待调查的地方经验。',visit:'认识三个管理分区，规划符合现场规定的参观方式。',quiet:'切换不同干扰情境，观察模拟信号的变化。',sciencepublic:'查看科学、历史与地方生活资料，写一句自己的导览。'};
const HANDOFF={site:'地形、山体和运输条件已形成一份台址观察记录。接下来检查望远镜的工作结构。',surface:'协同校验值已保存。下一步需要判断工程测量异常能否被直接忽略。',quality:'你保留了复核记录。这三份材料组成建设时期的科研档案。',observation:'模拟指向已校验。下一步需要辨认收到的数据是否值得进一步研究。',spectrum:'候选信号已标记为“待复核”。下一步核查重复性与干扰来源。',validation:'研究日志保留了不确定性，运行时期的科研任务完成。',structure:'结构关系已记录。接下来针对一块面板进行模拟测量。',assembly:'装配校验结果已形成记录。下一步面对现场异常时需要依据它作出判断。',weather:'安全处置已归档，建设时期的工程工作完成。',diagnosis:'设备异常被标记。下一步需要协调维护窗口。',maintenance:'维护计划已保留。下一步向公众解释为什么建成后仍需要维护。',explain:'你完成了从建造到维护的工程说明。',livemap:'三个生活空间已成为待核实的关注点。下一步参加社区交流。',consult:'你的公共问题清单已保存。下一步区分历史事实和未证实的个人经历。',memory:'建设期疑问进入档案，运行期仍须依据可靠资料逐一核实。',visit:'参观分区已核对。下一步测试为什么要保护射电环境。',quiet:'干扰比较结果已保存。下一步把科学与地方生活合并为导览内容。',sciencepublic:'导览说明已保存，你完成了本段公众体验。'};
const intTypes=new Set(['sync','assembly']);
R.fastDrafts=R.fastDrafts&&typeof R.fastDrafts==='object'?R.fastDrafts:{};
const save=()=>NS.saveLearningRecords?.();
const getDraft=()=>R.fastDrafts[G.group];
function draft(){R.fastDrafts[G.group]={index:G.index,id:G.mission?.id,phase:G.phase,visited:[...G.visited],selected:G.selected,sliders:{...G.sliders},note:G.noteValue||'',sceneMoved:!!G.sceneMoved,signals:[...G.signals],traces:[...G.traces],scenario:G.scenario,notice:G.notice||'',choice:G.pendingChoice??null,at:Date.now()};save()}
function reset(){G.visited=new Set();G.selected='';G.sliders={left:30,right:70};G.phase='collect';G.noteValue='';G.sceneMoved=false;G.signals=new Set();G.traces=new Set();G.scenario=0;G.notice='';G.pendingChoice=null;}
function restore(){const d=getDraft();reset();if(!d||d.id!==G.mission?.id||d.index!==G.index)return;
 G.phase=['collect','decision','feedback'].includes(d.phase)?d.phase:'collect';G.visited=new Set((d.visited||[]).filter(x=>Number.isInteger(x)||x==='bench'));G.selected=d.selected||'';G.sliders={left:Number(d.sliders?.left??30),right:Number(d.sliders?.right??70)};G.noteValue=String(d.note||'').slice(0,280);G.sceneMoved=!!d.sceneMoved;G.signals=new Set(d.signals||[]);G.traces=new Set(d.traces||[]);G.scenario=Number(d.scenario)||0;G.notice=d.notice||'';G.pendingChoice=d.choice??null;}
function required(){return REQUIRED[G.mission?.id]||G.mission?.evidence?.map((_,i)=>i)||[]}
function lacking(){const m=G.mission,missing=[];if(!m)return missing;
 const unseen=required().filter(i=>!G.visited.has(i));if(unseen.length)missing.push('检查 '+unseen.map(i=>m.evidence[i].name).join('、'));
 if(intTypes.has(m.type)&&!G.visited.has('bench'))missing.push('提交一次有效的模拟测量');
 if(m.id==='site'||m.id==='structure'){if(!G.sceneMoved)missing.push('转动模型，换一个角度观察');}
 if(m.type==='spectrum'&&G.traces.size<2)missing.push('在波形台点击至少两组数据进行比较');
 if(m.type==='signal'&&G.signals.size<2)missing.push('切换并比较至少两种无线电情境');
 if(m.id==='sciencepublic'&&(G.noteValue||'').trim().length<12)missing.push('写下一句至少12字的导览说明');
 return missing;
}
function record(){const m=G.mission;const option=m.options[G.pendingChoice];return {id:m.id,title:m.title,decision:option.name,feedback:option.feedback,evidence:required().map(i=>m.evidence[i].name),note:(G.noteValue||'').trim().slice(0,280),output:{sliders:intTypes.has(m.type)?{...G.sliders}:null,sceneMoved:!!G.sceneMoved,signalCases:[...G.signals],traces:[...G.traces],handoff:HANDOFF[m.id]},at:new Date().toISOString(),schema:18}}
const oStart=G.start,oClose=G.close,oHome=G.act;
G.start=function(){this.lastOutcome='';this.index=Math.min(this.progress.length,this.tasks.length);this.screen=this.index===this.tasks.length?'result':'play';restore();this.syncEra();this.render(true)};
G.setEra=function(era){if(!['construction','operation'].includes(era))return;this.era=era;this.screen='choose';this.syncEra();this.render(true)};
G.close=function(){if(this.active&&this.screen==='play')draft();oClose.call(this)};
G.act=function(action,id){if(action==='role'||action==='era'||action==='home'||action==='exit'||action==='restart'||action==='other-era'||action==='start'||action==='peek'){
  if(this.screen==='play')draft();
  if(action==='restart'){delete R.fastDrafts[this.group];delete R.fast[this.group];save();this.start();return;}
  if(action==='other-era'){this.era=this.era==='construction'?'operation':'construction';this.start();return;}
  if(action==='home'){this.screen='choose';this.render(true);return;}
  if(action==='start'){this.start();return;}
  if(action==='exit'){this.close();return;}
  if(action==='role'&&['research','build','public'].includes(id)){this.role=id;this.render(true);return;}
  if(action==='era'&&['construction','operation'].includes(id)){this.era=id;this.render(true);return;}
  if(action==='peek'){this.peek();return;}
 }
 if(this.screen!=='play'||!this.mission)return;
 const m=this.mission;
 if(action==='look-left'||action==='look-right'){
  this.yaw+=action==='look-right'?.38:-.38;this.sceneMoved=true;this.notice='已换角度观察。';draft();this.render();return;
 }
 if(action==='inspect'&&m.evidence[Number(id)]){this.visited.add(Number(id));this.selected=String(id);this.notice=m.evidence[Number(id)].detail;draft();this.render();return;}
 if(action==='measure'){
  const good=Math.abs(this.sliders.left-62)<=9&&Math.abs(this.sliders.right-58)<=9;
  if(good){this.visited.add('bench');this.notice='模拟测量合格，两个教学参数已记录。'}else{this.visited.delete('bench');this.notice='模拟测量尚未合格。继续调整两项参数后重新校验。'}draft();this.render();return;
 }
 if(action==='trace'&&['A','B','C'].includes(id)){this.traces.add(id);this.selectedTrace=id;this.notice=`已对照合成数据 ${id}，这只表示初步观察。`;draft();this.render();return;}
 if(action==='signal-scenario'&&['0','1','2'].includes(id)){this.scenario=Number(id);this.signals.add(Number(id));this.notice=['已切换至弱干扰参考情境。','已切换至较强干扰情境，请观察波形变化。','已切换至另一种干扰情境，强度只是教学示意。'][this.scenario];draft();this.render();return;}
 if(action==='check'){
  const missing=lacking();if(missing.length){this.notice='尚需完成：'+missing[0];draft();this.render();return;}
  this.phase='decision';this.notice='证据已齐。现在根据本次观察作出判断。';draft();this.render(true);return;
 }
 if(action==='back-evidence'){this.phase='collect';this.notice='已返回观察记录，证据仍然保留。';draft();this.render(true);return;}
 if(action==='option'&&this.phase==='decision'){
  const i=Number(id),option=m.options[i];if(!option)return;
  if(lacking().length){this.phase='collect';this.notice='操作条件已变化，请重新完成测量或补充证据。';draft();this.render(true);return;}
  if(!option.good){this.notice='还需核实：'+option.feedback;draft();this.render();return;}
  this.pendingChoice=i;this.phase='feedback';this.notice='';draft();this.render(true);return;
 }
 if(action==='next'&&this.phase==='feedback'){
  const rec=record();if(!R.fast[this.group])R.fast[this.group]=[];
  // Idempotent on stale/double clicks, especially after refresh.
  if(!R.fast[this.group].some(x=>x.id===rec.id))R.fast[this.group].push(rec);
  this.lastOutcome=HANDOFF[m.id]||'';delete R.fastDrafts[this.group];save();this.index=Math.min(R.fast[this.group].length,this.tasks.length);
  this.screen=this.index===this.tasks.length?'result':'play';reset();this.render(true);return;
 }
};
const baseScene=G.scene;
G.scene=function(m){let markup=baseScene.call(this,m);
 // Remove duplicate floating evidence buttons: all evidence appears in a single clear, keyboard-friendly list.
 markup=markup.replace('<div class="fa-hotspots" id="fastHotspots"></div>','<div class="fa-hotspots" id="fastHotspots" aria-hidden="true"></div>');
 return markup;
};
G.tool=function(m){const a=this.sliders.left,b=this.sliders.right;const calibrated=this.visited.has('bench');
 if(intTypes.has(m.type))return `<section class="v18-lab"><h3>${m.type==='assembly'?'局部装配测量':'反射面与馈源协同'}</h3><p>调整两项教学参数。绿色范围为校验参考，不代表真实工程控制值。</p><label>反射面 / 面板位置 <output id="faLeft">${a}</output><input type="range" min="0" max="100" step="1" value="${a}" data-fast-value="left" aria-label="反射面或面板教学参数"></label><label>馈源 / 索网协同 <output id="faRight">${b}</output><input type="range" min="0" max="100" step="1" value="${b}" data-fast-value="right" aria-label="馈源或索网教学参数"></label><div class="v18-lab-meta">参考范围：53—71、49—67 · 当前模拟偏差 <b id="faError">${Math.round(Math.abs(a-62)*.7+Math.abs(b-58)*.8)}</b></div><button class="v18-secondary" data-fast-action="measure">${calibrated?'✓ 重新校验':'提交模拟校验'}</button></section>`;
 if(m.type==='spectrum'){const selected=this.selectedTrace||'A';return `<section class="v18-lab"><h3>比较三组合成数据</h3><p>分别查看至少两组。重复峰值只说明值得复测，不能直接宣布发现。</p><div class="v18-signal-picks">${['A','B','C'].map(k=>`<button data-fast-action="trace" data-id="${k}" class="${selected===k?'is-active':''}">${this.traces.has(k)?'✓ ':''}数据${k}</button>`).join('')}</div><svg viewBox="0 0 350 90" role="img" aria-label="${selected}组教学合成信号图"><path d="M8 80H342 M8 44H342" stroke="#50798b" fill="none"/>${selected==='A'?'<path d="M8 54L20 45 32 61 44 50 55 58 68 39 81 54 94 59 107 45 122 57 138 45 148 54 169 48 183 61 200 46 216 56 235 42 250 60 271 49 293 58 320 45 342 55"/>':selected==='B'?'<path d="M8 60H50L60 16 70 60H126L136 16 146 60H201L211 16 221 60H275L285 16 295 60H342"/>':'<path d="M8 57H105L110 24 115 57H127L133 25 139 57H150L156 25 162 57H173L179 25 185 57H342"/>'}</svg><small>教学波形 · ${selected==='A'?'不规则波动':selected==='B'?'可疑重复峰值':'局部密集干扰'} · 非FAST实测</small></section>`;}
 if(m.type==='signal'){
  const vals=[[25,32,22,30,26,29],[32,68,44,74,54,64],[43,55,76,46,70,52]][this.scenario||0];
  return `<section class="v18-lab"><h3>改变干扰条件</h3><p>切换无线电情境，观察示意变化。查看资料不会改变环境。</p><div class="v18-signal-picks">${['弱干扰','较强干扰','不同频段干扰'].map((t,i)=>`<button data-fast-action="signal-scenario" data-id="${i}" class="${this.scenario===i?'is-active':''}">${this.signals.has(i)?'✓ ':''}${t}</button>`).join('')}</div><div class="v18-bars" aria-label="选中情境下的模拟噪声强度">${vals.map(v=>`<span style="height:${v}%"></span>`).join('')}</div><small>仅用于比较变化趋势，无实际射频物理单位。</small></section>`;
 }
 if(m.type==='zones')return `<section class="v18-lab"><h3>保护区分级示意</h3><div class="v18-zone-row"><span>核心区</span><span>中间区</span><span>边远区</span></div><small>图示仅帮助理解分级概念，不代表真实边界和进出许可。</small></section>`;
 return '';
};
function introFromPrior(){const arr=G.progress;if(!G.index||!arr[G.index-1])return '';
 const r=arr[G.index-1];const summary=(r.evidence||[]).slice(0,2).join('、');const values=r.output?.sliders?`；模拟校验值 ${r.output.sliders.left} / ${r.output.sliders.right}`:'';return `<div class="v18-handoff"><strong>接续上一步</strong><p>已记录「${h(r.title)}」${summary?'，使用过'+h(summary):''}${values}。现在依据这份记录继续调查。</p></div>`;}
function evidence(m){return `<div class="v18-evidence-list">${m.evidence.map((e,i)=>`<button type="button" data-fast-action="inspect" data-id="${i}" class="${G.visited.has(i)?'is-done':''}" aria-pressed="${G.visited.has(i)}"><span>${G.visited.has(i)?'✓':'+'}</span><b>${h(e.name)}</b></button>`).join('')}</div>${G.selected!==''&&m.evidence[Number(G.selected)]?`<div class="v18-evidence-detail" role="status">${h(m.evidence[Number(G.selected)].detail)}</div>`:''}`;}
G.play=function(){const m=this.mission;if(!m)return this.result();const n=this.index+1;const phase=this.phase||'collect',remaining=lacking(),p=this.progress[this.index-1];
 const phaseNav=`<nav class="v18-phases" aria-label="任务流程"><span class="${phase==='collect'?'is-current':''}">1 观察</span><span class="${phase==='decision'?'is-current':''}">2 判断</span><span class="${phase==='feedback'?'is-current':''}">3 结果</span></nav>`;
 if(phase==='feedback'){
  const o=m.options[this.pendingChoice]||m.options.find(x=>x.good);return `<section class="v18-feedback"><div class="v18-stepcount">${this.role==='research'?'科研人员':this.role==='build'?'建设与运维人员':'普通公众'} · ${this.era==='construction'?'建设时代':'运行时代'} · 第${n}/3项</div>${phaseNav}<div class="v18-feedback-icon" aria-hidden="true">✓</div><h2>这一步已完成</h2><p class="v18-feedback-main">${h(o.feedback)}</p><div class="v18-outcome"><small>你留下的成果</small><strong>${h(m.title)}</strong><p>使用证据：${h(required().map(i=>m.evidence[i].name).join('、'))}</p>${intTypes.has(m.type)?`<p>模拟校验：${this.sliders.left} / ${this.sliders.right}</p>`:''}${this.noteValue?`<p>个人说明：${h(this.noteValue)}</p>`:''}</div><div class="v18-forward"><small>接下来</small><p>${h(HANDOFF[m.id]||'进入下一项工作。')}</p></div><button class="v18-primary" data-fast-action="next">${n===3?'完成本时期并查看档案':'保存成果，继续下一项'} →</button><p class="v18-muted">退出也会保留这一页，历史事实不会因选择而改变。</p></section>`;
 }
 const prompt=BRIEF[m.id]||m.prompt;
 const task=`<div class="v18-stepcount">${this.role==='research'?'科研人员':this.role==='build'?'建设与运维人员':'普通公众'} · ${this.era==='construction'?'建设时代':'运行时代'} · 第${n}/3项</div>${phaseNav}<h2>${h(m.title)}</h2>${introFromPrior()}<p class="v18-brief">${h(prompt)}</p>`;
 const side=phase==='collect'?`<div class="v18-panel-top"><strong>需要观察的证据</strong><small>${required().filter(i=>this.visited.has(i)).length} / ${required().length}</small></div>${evidence(m)}${m.id==='sciencepublic'?`<label class="v18-note">写一句导览说明 <textarea id="fastPublicNote" maxlength="280" placeholder="用自己的话说明天眼的科学价值与周边生活">${h(this.noteValue||'')}</textarea></label>`:''}<div class="v18-check"><button class="v18-primary" data-fast-action="check">${remaining.length?'检查完成情况':'证据已齐，进入判断'} →</button><small>${remaining.length?'还需：'+h(remaining[0]):'所需操作已完成。'}</small></div>`:
 `<div class="v18-panel-top"><strong>根据证据作出判断</strong><small>步骤 2 / 3</small></div><div class="v18-evidence-detail">已核查：${h(required().map(i=>m.evidence[i].name).join('、'))}</div><div class="v18-choices">${m.options.map((o,i)=>`<button type="button" data-fast-action="option" data-id="${i}">${h(o.name)} <span>→</span></button>`).join('')}</div><button class="v18-secondary" data-fast-action="back-evidence">← 回看证据</button>`;
 return `<div class="v18-layout"><main class="v18-main">${task}${phase==='collect'?`${this.scene(m)}${m.id==='site'||m.id==='structure'?`<div class="v18-scene-prompt">${this.sceneMoved?'✓ 已从不同角度观察':'请转动模型，从另一侧看看结构。'}</div>`:''}${this.tool(m)}`:`<div class="v18-review"><strong>本次观察已记录</strong><p>${h(required().map(i=>m.evidence[i].name).join('、'))}</p>${m.type==='sync'||m.type==='assembly'?`<span>模拟校验值 ${this.sliders.left} / ${this.sliders.right}</span>`:''}</div>`}<details class="v18-sources"><summary>查看事实边界与资料来源</summary><p>${h(m.fact)}</p><p><a href="https://english.nao.cas.cn/Research2015/Facilities2015/Telescopes2015/202009/t20200914_243043.html" target="_blank" rel="noopener">FAST技术资料 ↗</a></p></details></main><aside class="v18-panel" aria-label="当前操作">${side}${this.notice?`<p class="v18-notice" role="status" aria-live="polite">${h(this.notice)}</p>`:''}<div class="v18-panel-bottom"><button data-fast-action="home">暂停并返回角色选择</button><span>操作自动保存在此浏览器</span></div></aside></div>`;
};
G.result=function(){const a=this.progress,b=R.fast[this.role+'.'+(this.era==='construction'?'operation':'construction')]||[];
return `<section class="fa-result v18-result"><span class="fa-eyebrow">${this.role==='research'?'科研人员':this.role==='build'?'建设与运维人员':'普通公众'} · ${this.era==='construction'?'建设时代':'运行时代'}</span><h2>这段时期的三项任务已完成</h2><p>你留下了可回看的观察、判断和模拟记录。下面列出每一步使用了哪些证据。</p><div class="fa-result-list">${a.map((rec,i)=>`<article><small>第${i+1}项 · ${h(rec.title)}</small><strong>${h(rec.decision)}</strong><p>证据：${h((rec.evidence||[]).join('、'))}</p>${rec.output?.sliders?`<p>模拟校验：${rec.output.sliders.left} / ${rec.output.sliders.right}</p>`:''}${rec.output?.traces?.length?`<p>已比较数据：${h(rec.output.traces.join('、'))}</p>`:''}${rec.output?.signalCases?.length?`<p>已比较情境：${h(rec.output.signalCases.map(v=>['弱干扰','较强干扰','不同频段'][v]).join('、'))}</p>`:''}${rec.note?`<p>个人导览：${h(rec.note)}</p>`:''}<p>${h(rec.output?.handoff||'')}</p></article>`).join('')}</div><div class="fa-cta"><div><b>另一个时期</b><span>该时期已有 ${b.length}/3 项记录，可以继续体验不同时间的工程与生活。</span></div><button data-fast-action="other-era">查看另一个时期 →</button></div><div class="fa-result-actions"><button data-fast-action="home">更换身份</button><button data-fast-action="exit">保存并返回地图</button><button data-fast-action="restart">重做这个时期</button></div><p class="fa-truth">所有记录保存在当前浏览器；模拟参数、合成数据和教学人物不构成FAST实测或真实事件。</p></section>`;
};
G.render=function(toTop=false){if(!this.active)return;
 const root=$('fastGameMain');const prevTop=root.scrollTop,prevFocus=document.activeElement,action=prevFocus?.dataset?.fastAction,id=prevFocus?.dataset?.id;const chapter=this.screen==='choose'?'角色选择':this.screen==='result'?'角色档案':this.screen==='play'?this.mission?.tag||'任务进行中':'任务';
 $('fastGameChapter').textContent=chapter;
 const completed=Object.values(R.fast).reduce((n,v)=>n+(Array.isArray(v)?v.length:0),0);$('fastGameScore').textContent=`${completed} / 18 项已归档`;
 root.innerHTML=this.screen==='choose'?this.choose():this.screen==='result'?this.result():this.play();root.scrollTop=toTop?0:prevTop;
 this.updateIndicators();
 if(!toTop&&action){const selector=`[data-fast-action="${CSS.escape(action)}"]${id!==undefined?'[data-id="'+CSS.escape(id)+'"]':''}`;root.querySelector(selector)?.focus({preventScroll:true});}
};
// Input mutations persist as drafts; calibration no longer survives a changed setting.
const patchInput=e=>{if(!G.active||G.screen!=='play')return;if(e.target?.dataset?.fastValue){G.visited.delete('bench');draft()}if(e.target?.id==='fastPublicNote'){G.noteValue=e.target.value;draft()}};
function attach(){const el=$('fastGameMain');if(!el)return;el.addEventListener('input',patchInput);
 let start=null;
 el.addEventListener('pointerdown',e=>{if(e.target.id==='fastScene')start={x:e.clientX,y:e.clientY};});
 el.addEventListener('pointerup',e=>{if(start&&G.screen==='play'&&G.active&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>12){G.sceneMoved=true;draft();G.render()}start=null;});
 el.addEventListener('pointercancel',()=>start=null);
 const oldResume=G.resume;G.resume=function(){oldResume.call(this);if(this.screen==='play')draft()};
 const oldOpen=G.open;G.open=function(){oldOpen.call(this)};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach);else attach();
})(window.SpatialApp=window.SpatialApp||{});
