/* V19 step three: role-specific field actions, time-dependent concept model and
   concrete carry-over records. All incidents, measurements and characters in
   this layer are explicitly fictional teaching simulations. */
(function(NS){'use strict';
const G=NS.FastGame, R=NS.LearningRecords;
if(!G||!R)return;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={research:'科研人员',build:'工程建设者',public:'周边居民'};
const THREAD={
 research:{construction:'工程委托 · 留下可供调试使用的测量档案',operation:'运行委托 · 根据早期工程档案检查模拟观测'},
 build:{construction:'工程委托 · 记录重要部件的装配与复核',operation:'运维委托 · 使用建造档案判断维护重点'},
 public:{construction:'社区委托 · 保存道路、生产和居住的待核实问题',operation:'社区委托 · 将旧问题带入今天的科普与交流'}
};
const STORY={
 site:{who:'项目调查组',why:'台址已经选定。建设人员需要一份能看懂的地形观察记录。',do:'转动模型，并检查洼地、山体和施工通道。',get:'台址观察卡',kind:'sites',items:[['basin','洼地','利用天然地形容纳巨型反射面'],['ridge','山体','部分方向的山地有助于削弱地面干扰'],['road','施工通道','大型构件运输仍需工程组织']]},
 surface:{who:'结构设计组',why:'地形调查已完成。现在需要理解反射面与馈源怎样配合工作。',do:'调整两个模拟值，让模型中的馈源偏移减小并完成校验。',get:'联动校验记录',kind:'calibration'},
 quality:{who:'工程测量组',why:'协同记录已经产生。一条检测异常需要得到独立复核。',do:'对比两次检测结果，标记需要复核的一项。',get:'异常复核单',kind:'compare',items:[['normal','记录A','初次测量与复测基本一致'],['variance','记录B','两次结果不同，需要核对条件']]},
 observation:{who:'观测小组',why:'装置已经通过验收，接下来需要准备一次合成信号观测。',do:'调节模拟反射面与馈源，并核对建设期留下的校验记录。',get:'观测准备单',kind:'calibration',carry:true},
 spectrum:{who:'数据分析组',why:'模拟指向已经确认。三段合成数据中可能有值得复测的结构。',do:'实际切换数据A、B、C，并标出需要复测的一组。',get:'候选信号卡',kind:'candidate'},
 validation:{who:'研究负责人',why:'你标出了一段候选信号，但一次异常还不能视为天文发现。',do:'逐项核查观测、干扰与复测要求。',get:'科研复核日志',kind:'checklist',items:[['schedule','观测时段','检查是否存在仅出现于单一时段的效应'],['interf','地面干扰','排查设备和其他射频源'],['repeat','独立复测','安排复测并保留不确定性']]},
 structure:{who:'施工班组',why:'工地即将进入结构安装阶段，先认识哪些部件负责什么工作。',do:'逐件选择索网、反射面板与馈源索系，查看模型逐步搭建。',get:'构件检查单',kind:'parts',items:[['cable','索网','承担可调支撑作用'],['panel','反射面板','构成射电波反射工作面'],['feed','馈源索系','服务于馈源位置控制']]},
 assembly:{who:'测量班组',why:'结构已经识读。安装后的定位状态还需要有测量记录。',do:'调整局部装配示意参数，完成一次测量。',get:'装配测量单',kind:'calibration'},
 weather:{who:'现场协调员',why:'模拟检测值波动，现场要求明确标记风险后再讨论下一步。',do:'辨别异常来自哪个环节，并保留报告渠道。',get:'安全处理单',kind:'compare',items:[['clock','工期信息','当前任务存在排期压力'],['alarm','异常警报','专业人员尚未核实警报原因'],['report','报告渠道','需由具有职责的现场人员决定后续作业']]},
 diagnosis:{who:'运维班组',why:'装置长期运行，控制系统的一项反馈偏差需要核对。',do:'查看部件状态，找出需要复测的驱动器反馈。',get:'设备巡检单',kind:'compare',items:[['cable','索网状态','模拟状态保持稳定'],['drive','驱动器反馈','模拟误差异常，需要复核'],['feed','馈源舱数据','目前只有一个时点，需结合趋势']] ,carry:true},
 maintenance:{who:'运维协调员',why:'巡检提示有待复核项目，需要在安全与科研排期之间安排工作。',do:'查看风险与观测排期，选取有依据的维护窗口。',get:'维护协调单',kind:'schedule',items:[['now','正在观测','需要与科研方沟通安排'],['review','拟定窗口','满足沟通与风险评估后安排'],['later','延后检查','可能增加未核实风险']]},
 explain:{who:'研学访客',why:'学生看到完整天眼，以为工程建成之后就不用再检查。',do:'从模型中找出建设与持续运行都需要的两类工作。',get:'工程讲述卡',kind:'parts',items:[['panel','反射面','需要持续检查与调整'],['cable','索网与支撑','需要长期监测'],['feed','馈源系统','运行需要位置与状态管理']]},
 livemap:{who:'社区记录员',why:'工程建设时期，一户人家的生活关切可能与科研建设重点不同。',do:'在示意地图记录居住、生产和日常通行三处空间。',get:'生活空间记录',kind:'places',items:[['home','居住','家庭与邻里往来'],['field','生产','耕作及就业安排'],['path','道路','上学、就医等日常通行']]},
 consult:{who:'社区讨论主持人',why:'生活空间已有记录，需要把个人关心的问题变成可向主管部门咨询的事项。',do:'选择两个关心的议题，生成咨询清单。',get:'社区问题清单',kind:'concerns',items:[['road','出行','询问道路和通行信息'],['home','生活','核实居住与生产安排'],['science','科研保护','了解无线电管理的具体要求']]},
 memory:{who:'社区档案记录员',why:'工程逐步落成，历史节点能确定，但每户家庭的经历需要更多证据。',do:'区分已经公开核实的工程节点与仍待调查的生活问题。',get:'待核实档案',kind:'sort',items:[['fact','工程节点','2011开工、2016落成为可核查历史节点'],['question','生活经历','具体家庭情况应留给采访及正式资料核实']]},
 visit:{who:'科普接待员',why:'参观者希望靠近工程。2019年保护办法明确了分区管理。',do:'依次查看三个区域，确认开放路线需要另行核实。',get:'参观规则记录',kind:'zones',items:[['inner','核心区','半径5公里，保护要求严格'],['middle','中间区','5—10公里环带，按活动核查规则'],['outer','边远区','10—30公里环带，同样有管理要求']],carry:true},
 quiet:{who:'科普讲解员',why:'有人疑惑为什么科学观测需要限制部分无线电活动。',do:'切换至少两种模拟干扰环境并比较图形。',get:'电磁环境对照卡',kind:'radio'},
 sciencepublic:{who:'社区讲解志愿者',why:'游客只注意到了“世界第一”，你希望介绍科学，也不忽略附近的人。',do:'查看科学事实和地方问题，写一句不虚构个人经历的讲解。',get:'科普导览卡',kind:'story',carry:true}
};
// A compact narrative cross-role bulletin. It is a teaching exchange, never a claim
// that the virtual roles represent actual interviewees.
const SHARED={research:'研究组提供：大窝凼的地形条件与设备协同记录。',build:'建设组提供：安装与长期维护需要可复查的测量资料。',public:'社区记录提供：通行、生产与生活诉求需要逐项核实。'};
R.fastV19=R.fastV19&&typeof R.fastV19==='object'?R.fastV19:{};
function key(){return G.group+'.'+G.index}
function read(){return R.fastV19[key()]||{done:[],focus:'',archive:false}}
function saveState(p){R.fastV19[key()]=p;NS.saveLearningRecords?.()}
function getPrior(){const list=R.fast[G.role+'.construction']||[];return list.filter(x=>x&&x.id).map(x=>({id:x.id,title:x.title,output:x.output||{}}));}
function artifact(){const list=getPrior();if(!list.length)return null;
 if(G.role==='research')return list.find(x=>x.id==='surface')||list.find(x=>x.id==='site')||list[0];
 if(G.role==='build')return list.find(x=>x.id==='assembly')||list.find(x=>x.id==='structure')||list[0];
 return list.find(x=>x.id==='consult')||list.find(x=>x.id==='livemap')||list[0];
}
function archiveText(){const r=artifact();if(!r)return '本次使用教学档案样本。你可以先玩建设期，取得自己的记录。';
 if(r.output.sliders)return `你在建设期「${r.title}」留下教学参数 ${r.output.sliders.left} / ${r.output.sliders.right}。当前工作需要回看测量条件。`;
 const items=r.output.v19?.labels||r.output.v19?.done||r.output.handoff;
 return `你在建设期完成「${r.title}」，记录了${Array.isArray(items)?items.join('、'):items||'现场观察'}。当前需要重新核查这些信息。`;
}
function actionReady(m){const cfg=STORY[m.id];if(!cfg)return true;const a=read();if(cfg.kind==='calibration')return G.visited.has('bench') && (!cfg.carry||a.archive);
 if(cfg.kind==='candidate')return a.focus==='B'&&G.traces?.has('B')&&G.traces?.size>=2;
 if(cfg.kind==='radio')return G.signals?.size>=2;
 if(cfg.kind==='story')return (G.noteValue||'').trim().length>=12&&(!cfg.carry||a.archive);
 const count=cfg.kind==='sort'?2:cfg.kind==='compare'?2:cfg.kind==='schedule'?2:cfg.kind==='concerns'?2:cfg.kind==='parts'&&m.id==='explain'?2:(cfg.items?.length||0);
 return a.done.length>=count && (!cfg.carry||a.archive);
}
function exchange(){const others=['research','build','public'].filter(k=>k!==G.role);const reports=others.map(k=>({role:k,records:(R.fast[k+'.'+G.era]||[]).filter(x=>x?.id)})).filter(x=>x.records.length);if(!reports.length)return '';return `<details class="v19-cross-role"><summary>查看其他角色已交付的资料（${reports.length}组）</summary>${reports.map(x=>`<p><strong>${esc(names[x.role])}</strong> ${esc(x.records.map(r=>r.output?.v19?.product||r.title).join('、'))}</p>`).join('')}<small>这些记录来自你在当前浏览器中完成的角色任务，未完成的角色不会被虚构为已经发言。</small></details>`}
function archivePanel(m){if(!STORY[m.id].carry||G.era!=='operation')return '';
 const state=read();return `<div class="v19-archive"><div><small>上一时代的工作档案</small><p>${esc(archiveText())}</p></div><button type="button" data-fast-action="v19-archive" ${state.archive?'disabled':''}>${state.archive?'✓ 已核对':'打开并核对'}</button></div>`;
}
function widget(m){const cfg=STORY[m.id],s=read();if(!cfg)return '';
 if(cfg.kind==='calibration')return `<div class="v19-action-intro"><strong>你要完成的操作</strong><p>拖动下方两项参数，观察三维模型中馈源与反射面之间的偏移，然后提交模拟测量。</p></div>${archivePanel(m)}`;
 if(cfg.kind==='candidate')return `<section class="v19-work"><strong>标记你要复测的合成数据</strong><p>在下方数据台切换各组波形后，选择要放入候选日志的一组。</p><div class="v19-action-grid">${['A','B','C'].map(x=>`<button data-fast-action="v19-focus" data-id="${x}" class="${s.focus===x?'selected':''}">数据 ${x}${s.focus===x?' · 已标记':''}</button>`).join('')}</div></section>`;
 if(cfg.kind==='radio')return `<div class="v19-action-intro"><strong>切换实际模拟情境</strong><p>下方噪声图只受情境选择影响。比较两种环境后再解释保护意义。</p></div>`;
 if(cfg.kind==='story')return `<div class="v19-action-intro"><strong>完成一段公众导览</strong><p>你需要让科学知识与地方生活同时被看见，避免把未经核实的故事当作采访事实。</p></div>${archivePanel(m)}`;
 const list=cfg.items||[];
 let explanation='';
 if(cfg.kind==='parts')explanation='点击部件，模型会逐一显示相应结构。';
 else if(cfg.kind==='places'||cfg.kind==='sites'||cfg.kind==='zones')explanation='选择空间中的位置，查看它与你的任务有什么关系。';
 else if(cfg.kind==='concerns')explanation='从不同关切中选出两项，形成可以继续核实的问题。';
 else if(cfg.kind==='sort')explanation='把已知事实与待核实的问题分别记入档案。';
 else if(cfg.kind==='schedule')explanation='比较排期和复核条件，选出两项需要协调的信息。';
 else explanation='比较不同线索，找到需要继续检查的内容。';
 return `<section class="v19-work"><div class="v19-work-head"><strong>${esc(cfg.do)}</strong><span>${s.done.length}/${cfg.kind==='sort'||cfg.kind==='compare'||cfg.kind==='schedule'||cfg.kind==='concerns'?2:cfg.kind==='parts'&&m.id==='explain'?2:list.length}</span></div><p>${explanation}</p><div class="v19-action-grid ${['sites','places','zones','parts'].includes(cfg.kind)?'is-spatial':''}">${list.map(([id,label,detail])=>`<button type="button" class="${s.done.includes(id)?'selected':''}" data-fast-action="v19-pick" data-id="${id}"><span>${s.done.includes(id)?'✓':'◎'}</span><b>${esc(label)}</b><small>${s.done.includes(id)?esc(detail):'点击现场观察'}</small></button>`).join('')}</div>${s.done.length?`<div class="v19-action-output">已记录 ${esc(s.done.map(id=>list.find(x=>x[0]===id)?.[1]||id).join('、'))}</div>`:''}</section>${archivePanel(m)}`;
}
const oldAct=G.act.bind(G),oldPlay=G.play.bind(G),oldTool=G.tool.bind(G),oldResult=G.result.bind(G),oldPaint=G.paint.bind(G);
G.tool=function(m){const cfg=STORY[m.id];if(!cfg)return oldTool(m);
 if(cfg.kind==='calibration'||cfg.kind==='candidate'||cfg.kind==='radio')return widget(m)+oldTool(m);
 return widget(m);
};
G.play=function(){const m=this.mission;if(!m)return oldPlay();const cfg=STORY[m.id];let markup=oldPlay();if(!cfg)return markup;
 if((this.phase||'collect')==='collect'){
  const lead=`<section class="v19-brief"><div class="v19-who">${esc(cfg.who)} · ${esc(THREAD[this.role][this.era])}</div><p>${esc(cfg.why)}</p><strong>现在请你：${esc(cfg.do)}</strong></section>`;
  markup=markup.replace('<p class="v18-brief">',lead+'<p class="v18-brief v19-legacy-brief" hidden>');
  markup=markup.replace('<div class="v18-panel-top"><strong>需要观察的证据</strong>',`<div class="v19-exchange" role="note">${esc(SHARED[this.role])}</div>${exchange()}<div class="v18-panel-top"><strong>查看证据，补充你的现场记录</strong>`);
  markup=markup.replace('所需操作已完成。','检查完成后再作判断。');
 }else if(this.phase==='decision'){
  markup=markup.replace('<div class="v18-panel-top"><strong>根据证据作出判断</strong>','<div class="v18-panel-top"><strong>根据刚才的操作作出判断</strong>');
 }else if(this.phase==='feedback'){
  const p=read();const list=(cfg.items||[]).filter(x=>p.done.includes(x[0])).map(x=>x[1]);
  const out=`<div class="v19-product"><b>新获得的成果 · ${esc(cfg.get)}</b><p>${esc(list.join('、')||(cfg.kind==='candidate'?'候选数据 '+(p.focus||'未标记'):cfg.kind==='calibration'?'模拟测量记录':cfg.kind==='radio'?'干扰情境对照':'个人观察记录'))}</p>${cfg.carry?`<p>已核对建设期档案：${p.archive?'是':'否'}</p>`:''}</div>`;
  markup=markup.replace('<div class="v18-forward">',out+'<div class="v18-forward">');
 }
 return markup;
};
G.act=function(action,id){
 if(action==='v19-archive'&&this.screen==='play'){const state=read();state.archive=true;saveState(state);this.notice='早期记录已纳入当前工作。';this.render();return}
 if(action==='v19-pick'&&this.screen==='play'){
  const cfg=STORY[this.mission.id],item=cfg?.items?.find(x=>x[0]===id);if(!item)return;
  const s=read();if(!s.done.includes(id))s.done.push(id);s.focus=id;saveState(s);this.notice=`已记下“${item[1]}”，${item[2]}`;this.paint();this.render();return;
 }
 if(action==='v19-focus'&&this.screen==='play'){const state=read();state.focus=id;saveState(state);this.notice=id==='B'?'已标记B组为待复测候选，请注意它尚不能证明真实发现。':'已选择'+id+'组，继续查看波形并比较。';this.render();return}
 if(action==='check'&&this.screen==='play'&&this.phase==='collect'&&!actionReady(this.mission)){
  const cfg=STORY[this.mission.id];this.notice=cfg.carry&&G.era==='operation'&&!read().archive?'请先打开并核对建设期档案。':cfg.kind==='calibration'?'请先完成模拟测量。':cfg.kind==='candidate'?'请比较两组波形，并标记需要复核的一组。':cfg.kind==='radio'?'请切换两种模拟环境。':cfg.kind==='story'?'请先完成导览说明。':'请先在当前操作区完成现场观察。';this.render();return;
 }
 if(action==='next'&&this.screen==='play'&&this.phase==='feedback'){
  const m=this.mission,cfg=STORY[m.id],st=read(),prevGroup=this.group,prevIndex=this.index;
  const labels=(cfg.items||[]).filter(x=>st.done.includes(x[0])).map(x=>x[1]);
  oldAct(action,id);
  const rec=(R.fast[prevGroup]||[]).find(x=>x.id===m.id);
  if(rec){rec.output=rec.output||{};rec.output.v19={kind:cfg.kind,done:st.done,labels,focus:st.focus,archiveChecked:!!st.archive,product:cfg.get};NS.saveLearningRecords?.()}
  delete R.fastV19[prevGroup+'.'+prevIndex];NS.saveLearningRecords?.();return;
 }
 if(action==='restart'&&this.screen!=='play'){
  Object.keys(R.fastV19).filter(k=>k.startsWith(this.group+'.')).forEach(k=>delete R.fastV19[k]);NS.saveLearningRecords?.();
 }
 oldAct(action,id);
};
G.result=function(){const raw=oldResult();return raw.replace('<h2>这段时期的三项任务已完成</h2>',`<h2>${esc(names[this.role])}的${this.era==='construction'?'建设':'运行'}档案</h2><p class="v19-result-lead">本次完成三份不同用途的成果。${esc(THREAD[this.role][this.era])}。</p>`).replace(/<article><small>第(\d+)项 · ([^<]+)<\/small>/g,'<article><small>第$1份成果 · $2</small>');};
// Time-aware educational model. It deliberately is not a georeferenced
// historical reconstruction. Construction is incomplete in every construction
// mission; operation uses the completed outline with movable concept feed.
G.paint=function(){
 if(!this.active||this.screen!=='play')return;
 const can=$('fastScene');if(!can)return;const w=Math.max(230,can.clientWidth),h=Math.max(210,can.clientHeight),d=Math.min(2,window.devicePixelRatio||1);can.width=Math.floor(w*d);can.height=Math.floor(h*d);
 const c=can.getContext('2d');if(!c)return;c.scale(d,d);
 const grd=c.createLinearGradient(0,0,w,h);grd.addColorStop(0,'#08182b');grd.addColorStop(1,'#153749');c.fillStyle=grd;c.fillRect(0,0,w,h);
 const s=Math.sin(this.yaw),co=Math.cos(this.yaw),sp=Math.sin(this.pitch),cp=Math.cos(this.pitch),scale=Math.min(w/560,h/390)*this.zoom;
 const p=(x,y,z)=>{const xx=x*co-z*s,zz=x*s+z*co;return{x:w*.50+xx*scale,y:h*.54-(y*cp-zz*sp)*scale}};
 const line=(arr,color,lw=1,dash=[])=>{c.beginPath();arr.forEach((pt,i)=>{const a=p(...pt);i?c.lineTo(a.x,a.y):c.moveTo(a.x,a.y)});c.setLineDash(dash);c.strokeStyle=color;c.lineWidth=lw;c.stroke();c.setLineDash([])};
 const construction=this.era==='construction',idx=this.index,st=read(),ratio=construction?(this.role==='build'&&idx===0?.08+.12*st.done.length:([.02,.32,.70][idx]||.02)):1;
 // An expressive basin cross-section: contour rings are not surveyed terrain.
 for(let z=-220;z<=220;z+=25){const pts=[];for(let x=-260;x<=260;x+=14){let v=10+Math.sin(x/90+z/65)*8-43*Math.exp(-(x*x+z*z)/16000);pts.push([x,v,z])}line(pts,'#538b8050',1)}
 for(let k=0;k<7;k++){const rad=90+k*21,ring=[];for(let j=0;j<=70;j++){const a=j/70*Math.PI*2;ring.push([rad*Math.cos(a),5+25*(rad/230)**2,rad*Math.sin(a)])}line(ring,'#538c83'+(k<3?'a0':'60'),1.3)}
 // Scaffold framework appears during construction; exact project geometry is abstract.
 if(construction){for(let i=-2;i<=2;i++){line([[i*43,-15,-135],[i*43,38,-135]],'#edbc8180',1.4,[4,4]);line([[-110,38,i*45],[110,38,i*45]],'#b9956870',1.1,[3,5])}}
 if(ratio>.1){const sections=Math.max(2,Math.floor(18*ratio));for(let j=0;j<9;j++){
  const rr=120*j/8,ring=[];for(let i=0;i<=sections;i++){const a=i/18*Math.PI*2;ring.push([rr*Math.cos(a),-34+50*(rr/120)**2,rr*Math.sin(a)])}
  line(ring,construction?'#c4d1b2aa':'#d3e5e7b0',1.5);
 }for(let k=0;k<sections;k++){const a=k*Math.PI*2/18,radial=[];for(let j=0;j<=8;j++){const rr=120*j/8;radial.push([rr*Math.cos(a),-34+50*(rr/120)**2,rr*Math.sin(a)])}line(radial,'#c8d8cf80',1)} }
 if(ratio>.25){for(const [x,z] of [[-150,-130],[150,-130],[-150,130],[150,130]]){line([[x,0,z],[x,70,z]],'#e3ceb4',2.5);line([[x,70,z],[0,44,0]],'#ddb98099',1)}}
 const ax=(this.sliders.right-58)*.36,ay=(this.sliders.left-62)*.24,focus=p(ax,52+ay,0);c.fillStyle='#f6cf87';c.beginPath();c.arc(focus.x,focus.y,ratio===.02?0:5,0,Math.PI*2);c.fill();
 if(['sync','assembly'].includes(this.mission.type)&&ratio>.1){const tgt=p(0,-34,0);c.beginPath();c.moveTo(focus.x,focus.y);c.lineTo(tgt.x,tgt.y);c.setLineDash([5,5]);c.strokeStyle='#f8d994';c.lineWidth=2;c.stroke();c.setLineDash([])}
 // Tool-specific geometric overlays; active selections correspond to controls.
 const cfg=STORY[this.mission.id],state=read();
 if(cfg?.kind==='places'||cfg?.kind==='sites'||cfg?.kind==='zones'){
  const points=cfg.kind==='zones'?[[-65,10,10],[40,12,-78],[95,12,62]]:cfg.kind==='sites'?[[-2,-37,0],[165,40,90],[-195,15,-135]]:[[120,20,75],[-90,15,-115],[190,20,-60]];
  cfg.items.forEach(([id,label],i)=>{const q=p(...points[i]);c.beginPath();c.arc(q.x,q.y,state.done.includes(id)?10:7,0,Math.PI*2);c.fillStyle=state.done.includes(id)?'#81e2c5':'#f2c684';c.fill();c.font='12px sans-serif';c.fillStyle='#f9faf5';c.fillText(label,q.x+12,q.y-8)});
 }
 if(cfg?.kind==='parts'){const map={cable:[-170,65,-110],panel:[70,-8,70],feed:[0,50,0]};cfg.items.forEach(([id,label])=>{if(!state.done.includes(id))return;const q=p(...(map[id]||[0,0,0]));c.beginPath();c.arc(q.x,q.y,13,0,Math.PI*2);c.strokeStyle='#83f1d0';c.lineWidth=3;c.stroke();c.fillStyle='#e6fff4';c.font='12px sans-serif';c.fillText(label,q.x+13,q.y-9)})}
 c.fillStyle='#bfe6dd';c.font='12px sans-serif';c.fillText(construction?(['2011 · 台址与施工准备示意','建设期 · 局部结构安装示意','建设期 · 多部件安装示意'][idx]):'运行期 · 完整装置教学示意',14,h-33);
 c.fillStyle='#8caeb8';c.font='11px sans-serif';c.fillText('交互概念模型 · 非史实建模 / 非测绘',14,h-15);
 // Do not display duplicate clickable hotspots; the focused task controls
 // below the model serve as the accessible spatial interaction.
 const hot=$('fastHotspots');if(hot)hot.replaceChildren();
};
// When a role or time is switched the existing draft is loaded by V18.
// v19 action records are kept separately so refreshing preserves a pending field exercise.
NS.FastV19={STORY,THREAD,artifact,actionReady,read};
})(window.SpatialApp=window.SpatialApp||{});
