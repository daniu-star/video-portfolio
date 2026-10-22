import {flourishEmbed} from "./flourish.js";
/* PAGE-08 V4.0 — an extended playable, evidence-based pixel maze. All four choices are normative
   design scenarios, never claimed as measured causal outcomes or performance scores. */
const STATIONS=[
 {id:'course',label:'课程',seal:'课',color:'#b85b3c',pos:[5,3],question:'课程应该留下什么？',desc:'教育价值不能只靠课程名称证明。选择你希望优先建立的过程性证据。',choices:[
  {title:'长期调查项目',sub:'用真实议题把采访、资料研究和作品修订串起来',out:'开设跨学期调查项目，归档选题、采访问答、事实来源与修订记录。',guard:'真实田野项目需要师资与信源保护机制；一次项目不代表所有学生能力。'},
  {title:'课程过程档案',sub:'为每门核心课程建立可核验的学习增值证据',out:'建立课程过程档案，保存初稿、核验记录、反馈与二次提交。',guard:'过程材料会增加评估负担，应设置抽样审核与隐私保护。'}]},
 {id:'ability',label:'能力',seal:'能',color:'#4d7972',pos:[19,3],question:'哪种能力值得显影？',desc:'1,959次能力提及中，前台技能1,467次；核心能力492次。选择如何使训练成果可见。',choices:[
  {title:'事实核查作品集',sub:'将来源追溯、证据强度和修正过程作为评价对象',out:'建立事实核查作品集，以可追溯证据链与勘误记录评价表现。',guard:'核查质量需要人工复核，不能由作品数量代替。'},
  {title:'伦理判断工作坊',sub:'训练不确定情境下的公共责任与取舍能力',out:'采用真实但脱敏的伦理案例进行多轮讨论、决策记录与事后复盘。',guard:'伦理情境不存在唯一标准答案，评价须允许合理分歧。'}]},
 {id:'career',label:'职业',seal:'业',color:'#8c7950',pos:[5,13],question:'就业以外，如何观察教育结果？',desc:'就业结果是真实压力，却不应成为衡量培养过程的唯一终点。',choices:[
  {title:'毕业生长期追踪',sub:'持续了解职业发展，避免一次性就业率结算',out:'建立自愿参与的长期毕业生追踪，关注就业、迁移与继续学习。',guard:'自愿追踪会有失访偏差，不应将样本路径推广为总体命运。'},
  {title:'跨岗位实践地图',sub:'记录采访、研究与核查能力在不同岗位的迁移',out:'以真实实践日志记录核心能力如何进入媒体、公共事务与组织沟通等场景。',guard:'迁移路径是个案证据，并不保证所有毕业生可获得同类岗位。'}]},
 {id:'public',label:'公共',seal:'公',color:'#6e6c81',pos:[19,13],question:'怎样让公共责任可以查证？',desc:'公共价值既能成为支持的理由，也能成为追责的标准。',choices:[
  {title:'公共议题回应机制',sub:'让作品接受真实受众、议题相关方的质询',out:'在课程项目中加入公共议题回应、受众反馈与可公开的纠错机制。',guard:'受众反馈不等于公共价值本身，需防止流量指标替代公共利益。'},
  {title:'透明伦理与勘误日志',sub:'让核验责任和风险处理过程成为可讨论证据',out:'建立可脱敏的伦理取舍与勘误日志，复盘决策依据及可能遗漏。',guard:'公开过程必须先评估受访者安全、个人隐私与其他伤害风险。'}]}
];
// These are data-literacy questions, not judgements of a reader's values.
const CHECKS={
 course:{prompt:'课程档案可以证明什么？',items:['有完整课程档案，就能证明所有毕业生就业更好','课程档案可以留下学习与修订过程的证据，但不能直接证明就业成效','作品点赞越多，课程培养效果就越好'],correct:1,why:'过程档案让学习过程可追溯；就业成效仍需专门的追踪与评估。'},
 ability:{prompt:'在1,959次能力提及中，前台技能与核心能力的数量分别是多少？',items:['前台1,467次、核心492次','前台492次、核心1,467次','各占一半'],correct:0,why:'前台技能1,467次，核心能力492次。这是评论中被提及的频数，而不是实际能力的重要程度。'},
 career:{prompt:'696篇笔记的起点—评论框架配对，可以支持哪种结论？',items:['能直接计算毕业生真实就业率','证明每条讨论都从课程转向就业','可以比较被分析笔记的主导框架与评论区主导框架，但不代表实际就业结果'],correct:2,why:'框架配对比较讨论重点，不等于追踪就业状况；起点未识别的材料也不能当作已知迁移。'},
 public:{prompt:'当评论以公共价值为依据时，哪种解释更符合研究边界？',items:['所有批评都意味着否定公共价值','支持与批评可能都诉诸公共责任，但不能把共现比例直接当作全民态度','点赞越多，就越符合公共利益'],correct:1,why:'公共价值可以成为认可和追责的共同依据；平台评论及共现计数不能代表所有公众。'}
};
const NOTE_TEMPLATES=[
 {id:'note-1',title:'能力可见性',text:'研究编码中共1,959次能力提及：前台技能1,467次，核心能力492次。',ref:'能力提及编码汇总'},
 {id:'note-2',title:'明确判断的稀少',text:'只有57次提及明确说明能力属性：前台52次，核心5次。',ref:'能力属性明确性检验'},
 {id:'note-3',title:'AI替代话语',text:'9次明确的AI可替代判断全部落在前台技能组。它们是评论判断，并非技术替代试验。',ref:'能力属性分类归档'},
 {id:'note-4',title:'就业框架边界',text:'696篇配对笔记中，评论区就业框架主导的有285篇。对起点未识别的笔记，不能推断明确的议题迁移。',ref:'笔记—评论框架配对矩阵'}
];
const WIDTH=25,HEIGHT=17,START=[1,1],EXIT=[23,15];
function mazeData(){
 const grid=Array.from({length:HEIGHT},()=>Array(WIDTH).fill(1));let seed=2061;
 const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const stack=[[1,1]];grid[1][1]=0;
 while(stack.length){const [x,y]=stack[stack.length-1];let next=[[2,0],[-2,0],[0,2],[0,-2]].map(([dx,dy])=>[x+dx,y+dy,dx,dy]).filter(([nx,ny])=>nx>0&&nx<WIDTH-1&&ny>0&&ny<HEIGHT-1&&grid[ny][nx]===1);
  if(!next.length){stack.pop();continue}
  const [nx,ny,dx,dy]=next[Math.floor(rnd()*next.length)];grid[y+dy/2][x+dx/2]=0;grid[ny][nx]=0;stack.push([nx,ny]);
 }
 // Short connecting passages and loops make the investigation discoverable rather than punitive.
 for(const [x,y] of [[4,5],[12,3],[8,7],[18,7],[6,11],[12,13],[20,11],[16,5],[12,9]])if(x>0&&x<WIDTH-1&&y>0&&y<HEIGHT-1)grid[y][x]=0;
 return grid;
}
const GRID=mazeData();
function shortest(start,goal){const k=(x,y)=>`${x},${y}`;const queue=[start],came=new Map([[k(...start),null]]);let at=0;
 while(at<queue.length){const [x,y]=queue[at++];if(x===goal[0]&&y===goal[1])break;
  for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){const nx=x+dx,ny=y+dy,key=k(nx,ny);if(nx<0||ny<0||nx>=WIDTH||ny>=HEIGHT||GRID[ny][nx]||came.has(key))continue;came.set(key,[x,y]);queue.push([nx,ny]);}}
 let now=goal;if(!came.has(k(...goal)))return [];const out=[];while(now){out.unshift(now);now=came.get(k(...now))}return out;
}
// Side quests are placed only on walkable cells. Each gives a verified research footnote.
const NOTE_ANCHORS=[[9,1],[3,7],[21,9],[13,15]];
const NOTES=[];NOTE_TEMPLATES.forEach((n,i)=>{
 const [ax,ay]=NOTE_ANCHORS[i];const spots=[];
 for(let y=1;y<HEIGHT-1;y++)for(let x=1;x<WIDTH-1;x++){
  if(GRID[y][x]===0 && !(x===START[0]&&y===START[1]) && !(x===EXIT[0]&&y===EXIT[1]) && !STATIONS.some(s=>s.pos[0]===x&&s.pos[1]===y))spots.push([x,y]);
 }
 spots.sort((a,b)=>(Math.abs(a[0]-ax)+Math.abs(a[1]-ay))-(Math.abs(b[0]-ax)+Math.abs(b[1]-ay)));
 const chosen=spots.find(p=>!NOTE_TEMPLATES.slice(0,i).some((_,j)=>NOTES[j]?.pos[0]===p[0]&&NOTES[j]?.pos[1]===p[1]));
 NOTES.push({...n,pos:chosen});
});
if([...STATIONS.map(s=>s.pos),EXIT].some(p=>shortest(START,p).length===0))throw Error('第八页迷宫必须全部可达');
export function mazeSection(){return `<div class="rm39-archive" id="rm39-archive">
 <header class="rm39-cover"><div class="rm39-index"><span>卷八 · 制度回应</span><strong>08</strong><h2>价值重塑</h2><p>新闻传播教育的<br>可证成路径</p><i>研究发现不是方案效果预测。</i></div><div class="rm39-cover-copy"><span class="rm39-topline">一场关于新闻教育的制度设计实验</span><h2>教育的价值，<br>如何穿过<strong>证明的迷宫？</strong></h2><p>走进培养迷宫，追问新闻教育的四个出口。</p><div class="rm39-hero-links"><a href="#rm39-game">进入像素迷宫 ↓</a><a href="#rm39-research">先看研究证据 ↗</a></div></div><div class="rm39-cover-art" aria-label="装饰性像素档案，非真实校园或历史记录"><div class="rm39-pixel-illustration"><span class="rm39-sign">资料室</span><i class="rm39-illustration-door"></i><b class="rm39-illustration-man"></b></div><span class="rm39-photo-mark">像素艺术 · 概念视觉</span></div></header>
 <section class="rm39-preface"><p><span>调查手记</span>这不是一场计分游戏。迷宫四个据点对应论文提出的培养证据链；每到一处，你要在两条可讨论的制度路径之间作出选择。最后得到的不是标准答案，而是一份带有证据和代价说明的改革草案。</p><div class="rm39-figures"><span>前台技能提及 <b>1,467</b></span><span>核心能力提及 <b>492</b></span><span>明确能力属性判断 <b>57</b></span></div></section>
 <section id="rm39-game" class="rm39-game-section" aria-labelledby="rm39-game-title"><div class="rm39-section-title"><span>互动调查 · 01</span><h2 id="rm39-game-title">迷宫里的四份培养档案</h2><p>过四关，取印记，抵达出口。</p></div>
 <div class="rm39-game-frame"><div class="rm39-maze-main"><div class="rm39-game-meta"><span class="rm39-live-dot"></span><strong>档案迷宫 / 制度实验</strong><span id="rm39-step-count">已走 0 步</span><span id="rm40-objective">目标：找到课程档案</span><button type="button" id="rm39-map-hint" aria-pressed="false">路径 H</button></div>
 <div class="rm40-toolbar" role="toolbar" aria-label="迷宫游戏工具栏">
  <button type="button" id="rm40-brief">任务与操作说明 <kbd>?</kbd></button>
  <button type="button" id="rm40-notebook">研究手记 <kbd>J</kbd> <span id="rm40-note-count">0/4</span></button>
  <button type="button" id="rm40-map-toggle" aria-pressed="true">小地图 <kbd>M</kbd></button>
  <button type="button" id="rm40-pause" aria-pressed="false">暂停 <kbd>P</kbd></button>
  <button type="button" data-pixel-audio-toggle aria-pressed="false">♫ 开启配乐</button><button type="button" id="rm40-audio" aria-pressed="false">音效：关</button>
  <label>寻路速度 <select id="rm40-speed" aria-label="自动寻路速度"><option value="210">慢速</option><option value="115" selected>正常</option><option value="50">快速</option></select></label>
 </div><div class="rm39-canvas-shell"><canvas id="rm39-canvas" width="800" height="544" tabindex="0" aria-label="二维像素迷宫，按方向键移动，遇到四处档案据点可以选择培养路径"></canvas><div id="rm39-encounter" class="rm39-encounter" hidden role="dialog" aria-modal="false" aria-labelledby="rm39-encounter-title"></div><div class="rm40-map-overlay" id="rm40-map-overlay"><canvas id="rm40-minimap" width="200" height="136" aria-label="迷宫小地图，显示目前位置、尚未访问的关卡和手记"></canvas><small>红：人物 · 金：任务 · 绿：完成 · 蓝：研究手记</small></div>
 <div class="rm39-game-toast" id="rm39-game-toast" aria-live="polite">档案室已开启。寻找四枚线索印记。</div>
 <div class="rm40-game-overlay" id="rm40-game-overlay" hidden role="dialog" aria-modal="false" aria-labelledby="rm40-overlay-title"></div></div>
 <div class="rm39-control-row"><div class="rm39-dpad" aria-label="方向移动按钮"><button type="button" data-move="up" aria-label="向上">↑</button><div><button type="button" data-move="left" aria-label="向左">←</button><button type="button" data-move="down" aria-label="向下">↓</button><button type="button" data-move="right" aria-label="向右">→</button></div></div><div class="rm39-ctrl-desc"><span>目标：带着四份档案走到出口</span><small>点击地图可自动寻路。无法操作键盘时，用左侧方向按钮。</small></div><div class="rm40-quick-actions"><button id="rm39-guide" type="button">导航到主线 <kbd>N</kbd></button><button id="rm40-guide-note" type="button">导航到研究手记</button><button id="rm40-step-back" type="button">撤回一步 <kbd>Z</kbd></button></div></div></div>
 <aside class="rm39-game-panel"><div class="rm39-progress-label"><span>档案印记</span><strong id="rm39-progress">0 / 4</strong></div><div class="rm40-hud-progress"><div id="rm40-progress-bar" style="width:0%"></div></div><div class="rm39-seals">${STATIONS.map(s=>`<div class="rm39-seal" data-seal="${s.id}"><span style="--seal:${s.color}">${s.seal}</span><div><strong>${s.label}</strong><small>尚未翻阅</small></div><button type="button" data-reopen-station="${s.id}" aria-label="复核${s.label}档案选择">复核</button></div>`).join('')}</div><div class="rm40-side-quests"><strong>附加调查 · 研究手记</strong><span id="rm40-note-side">0 / 4 已收集</span><p>蓝色线索可选收集。</p></div>
 <div class="rm40-save-row"><button type="button" id="rm40-save">保存进度</button><button type="button" id="rm40-load">读取进度</button><button type="button" id="rm40-clear-save">清除存档</button></div>
 <div class="rm39-case-note" id="rm39-case-note"><span>手记 · 001</span><p>找到一处发光的档案台，按下方向键靠近它。四条改革路径没有预先规定的分数高低。</p></div><button type="button" id="rm39-restart">重新探索 ↺</button><p class="rm39-panel-bottom">关卡的答题反馈用于辨析证据，不评价你的价值立场。存档只保存在当前浏览器本地；游戏不上传读者答案。</p></aside></div>
 </section>
 <section class="rm39-after" id="rm39-plan"><div class="rm39-section-title"><span>互动调查 · 02</span><h2>四份档案，如何组成一份改革草案？</h2><p>通关后复核选择，带走方案。</p></div><div id="rm39-planned" class="rm39-planned"></div><div id="rm39-report" class="rm39-report" aria-live="polite"></div></section>
 <section class="rm39-research" id="rm39-research"><div class="rm39-section-title"><span>真实证据 · Flourish 图表</span><h2>游戏之外，回到研究样本。</h2><p>1,959次能力提及中，前台技能为1,467次，核心能力为492次。图表表示评论中的能力表征，不测量教育改革方案的实际成效。</p></div><div class="rm39-research-grid"><div class="rm39-research-stats"><div class="rm39-real-bar"><span>前台技能 · 1,467次</span><div><i style="width:74.9%"></i></div><b>74.9%</b></div><div class="rm39-real-bar rm39-green"><span>核心能力 · 492次</span><div><i style="width:25.1%"></i></div><b>25.1%</b></div><p>只有57次提及明确说明了能力属性，其中前台52次、核心5次。数字仅对应语料中的编码提及。</p><a download href="./data/figures/ability_hierarchy.csv">下载能力层级汇总 CSV ↓</a></div><div class="rm39-flourish-panel"><h3>把评论中的能力结构展开看看</h3><p>本地能力结构图，点击即可探索。</p><button type="button" id="rm39-open-flourish">展开能力结构图 ↓</button><div id="rm39-flourish-slot"></div><a href="https://public.flourish.studio/visualisation/30501030/" target="_blank" rel="noopener noreferrer">在 Flourish 单独查看 ↗</a></div></div></section>
 <footer class="rm39-end"><p>就业不是教育的唯一判决。<br><em>可讨论、可修正、可追溯的训练过程，才是证明得以开始的地方。</em></p><a href="#/methods">阅读论文方法与研究边界 →</a><small>来源：研究归档与论文的制度回应讨论；游戏规则为编辑设计，不作为经验统计结果。</small></footer>
 </div>`}

export function mountRebuildMaze(root){
 const shell=root.querySelector('#rm39-archive');if(!shell)return ()=>{};
 const canvas=shell.querySelector('#rm39-canvas'),ctx=canvas.getContext('2d',{alpha:false});ctx.imageSmoothingEnabled=false;
 const $=sel=>shell.querySelector(sel);let player=[...START],walked=0,visited=new Set(),choices=new Map(),modal=null,route=[],timer=null,hints=false,gameDone=false,disposed=false,frames=0;
 const foundNotes=new Set(),history=[],noteByKey=new Map(NOTES.map(n=>[n.pos.join(','),n]));
 let paused=false,overlayMode='',quizIndex=null,quizAnswered=false,soundOn=false,audioCtx=null;
 const STORE_KEY='archive-rebuild-maze-v40-progress';
 const clock=()=>new Date().toLocaleString('zh-CN',{hour12:false});
 function beep(hz=540){if(!soundOn)return;try{audioCtx ||=new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='square';o.frequency.value=hz;g.gain.setValueAtTime(.028,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.09);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.095)}catch(_){soundOn=false}}
 function showOverlay(mode){stopPath();overlayMode=mode;const el=$('#rm40-game-overlay');el.hidden=false;el.innerHTML=overlayBody(mode)}
 function hideOverlay(){overlayMode='';$('#rm40-game-overlay').hidden=true;$('#rm40-game-overlay').innerHTML='';if(!paused)canvas.focus({preventScroll:true})}
 function overlayBody(mode){
 const heading=mode==='help'?'任务手册与操作说明':mode==='notes'?'已取得的研究手记':'游戏已暂停';
 let body='';
 if(mode==='help')body=`<p>你是一个调查者，需要走访四个培养档案台。每站先回答一题研究边界辨析，再选择一项制度路径。收齐四枚印记后，沿路前往右下角出口，生成改革草案。</p><div class="rm40-help-grid"><div><b>移动</b><span>↑ ↓ ← → 或 W A S D；点击浅色地面自动寻路</span></div><div><b>线索</b><span>H 路径提示 · N 下一站 · M 小地图 · J 研究手记</span></div><div><b>控制</b><span>P 暂停 · Z 撤回一步 · Esc 关闭面板</span></div><div><b>通关</b><span>四个主线关卡都完成。蓝色研究手记为可选任务</span></div></div><p class="rm40-boundary">注意：游戏中的培养设计属于情境推演；任何方案都不能根据评论数量直接推断政策效果。</p>`;
 else if(mode==='notes')body=`<p>研究手记：${foundNotes.size}/4。蓝色线索可选收集，以下只展示已经找到的材料。</p><div class="rm40-note-list">${NOTES.map(n=>`<article class="${foundNotes.has(n.id)?'found':''}"><b>${foundNotes.has(n.id)?n.title:'尚未找到的资料'}</b><p>${foundNotes.has(n.id)?n.text:'请在地图中寻找蓝色档案标记。'}</p>${foundNotes.has(n.id)?`<small>来源：${n.ref}</small>`:''}</article>`).join('')}</div>`;
 else body=`<p>角色和自动寻路已暂停。重新开始不会清除已经取得的印记。你也可以先查看任务手册。</p>`;
 return `<div class="rm40-overlay-paper"><header><span>档案室 · 游戏工具</span><button type="button" data-rm40-close aria-label="关闭面板">×</button></header><h3 id="rm40-overlay-title">${heading}</h3>${body}<footer><button type="button" data-rm40-close>${mode==='pause'?'继续探索':'返回地图'}</button>${mode==='pause'?'<button type="button" data-rm40-help>查看操作说明</button>':''}</footer></div>`;
 }
 function updateHud(){const n=nextStation();$('#rm40-objective').textContent=n?`下一站：${n.label} · 距离 ${Math.max(0,shortest(player,n.pos).length-1)} 格`:`目标：前往出口 · ${Math.max(0,shortest(player,EXIT).length-1)} 格`;
 $('#rm40-note-count').textContent=`${foundNotes.size}/4`;$('#rm40-note-side').textContent=`${foundNotes.size} / 4 已收集`;$('#rm40-progress-bar').style.width=(visited.size/4*100)+'%';drawMini();}
 function drawMini(){const c=$('#rm40-minimap');if(!c)return;const xctx=c.getContext('2d',{alpha:false}),scale=8;xctx.fillStyle='#1e292a';xctx.fillRect(0,0,200,136);for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){xctx.fillStyle=GRID[y][x]?'#394849':'#cdbb9d';xctx.fillRect(x*scale,y*scale,scale,scale)}
 NOTES.forEach(n=>{if(!foundNotes.has(n.id)){xctx.fillStyle='#65a9be';xctx.fillRect(n.pos[0]*scale+1,n.pos[1]*scale+1,6,6)}});
 STATIONS.forEach(s=>{xctx.fillStyle=visited.has(s.id)?'#6fa17e':'#dfb56a';xctx.fillRect(s.pos[0]*scale,s.pos[1]*scale,8,8)});
 xctx.fillStyle='#a85a49';xctx.fillRect(player[0]*scale,player[1]*scale,8,8);xctx.strokeStyle='#fff4e0';xctx.lineWidth=1.5;xctx.strokeRect(player[0]*scale,player[1]*scale,8,8);
 }
 function saveGame(){try{localStorage.setItem(STORE_KEY,JSON.stringify({version:40,player,walked,visited:[...visited],choices:[...choices].map(([id,c])=>[id,STATIONS.find(s=>s.id===id)?.choices.indexOf(c)]),notes:[...foundNotes],gameDone}));putToast('进度已保存到本浏览器。不会上传到服务器。');return true}catch(_){putToast('浏览器不允许本地保存；当前游戏仍可继续。');return false}}
 function loadGame(){try{let raw;try{raw=localStorage.getItem(STORE_KEY)}catch(_){putToast('当前浏览器禁止读取本地存档，现有进度不会丢失。');return false}if(!raw){putToast('此浏览器还没有游戏存档。');return false}const v=JSON.parse(raw);if(v.version!==40||!Array.isArray(v.player)||GRID[v.player[1]]?.[v.player[0]]!==0)throw Error('invalid');stopPath();player=[...v.player];walked=Number(v.walked)||0;visited.clear();choices.clear();foundNotes.clear();for(const id of v.visited||[])if(STATIONS.some(s=>s.id===id))visited.add(id);for(const [id,i] of v.choices||[]){const s=STATIONS.find(s=>s.id===id);if(s?.choices[i])choices.set(id,s.choices[i])}for(const id of v.notes||[])if(NOTES.some(n=>n.id===id))foundNotes.add(id);gameDone=Boolean(v.gameDone)&&visited.size===4;$('#rm39-step-count').textContent=`已走 ${walked} 步`;hideOverlay();$('#rm39-encounter').hidden=true;modal=null;renderPlan();paint();updateHud();putToast('已读取本浏览器的游戏进度。');return true}catch(_){putToast('存档无法读取或版本不匹配，当前进度未更改。');return false}}

 function putToast(message){$('#rm39-game-toast').textContent=message}
 function nextStation(){return STATIONS.filter(s=>!visited.has(s.id)).sort((a,b)=>shortest(player,a.pos).length-shortest(player,b.pos).length)[0]}
 const pixel=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 function paint(){if(disposed)return;frames++;const tile=32;
  const target=nextStation()?.pos||EXIT,highlight=hints?new Set(shortest(player,target).map(([x,y])=>`${x},${y}`)):new Set();
  pixel(0,0,800,544,'#1c2528');
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
   const X=x*tile,Y=y*tile;let wall=GRID[y][x];
   if(wall){pixel(X,Y,32,32,(x+y)%3===0?'#29383c':'#334549');pixel(X+2,Y+2,28,3,'#516367');pixel(X+2,Y+20,28,2,'#1d3034');pixel(X+8,Y+9,15,9,'#3c5153');}
   else{pixel(X,Y,32,32,(x*y)%4===0?'#cfbea0':'#dbccae');pixel(X+2,Y+2,3,3,'#c7b494');pixel(X+22,Y+22,4,3,'#c7b99c');if(highlight.has(`${x},${y}`))pixel(X+12,Y+12,8,8,'#b45839');}
  }
  // Runes are stationery in an archive, not real evidence or collected user metadata.
  STATIONS.forEach(s=>{const [x,y]=s.pos,X=x*tile,Y=y*tile,found=visited.has(s.id),bob=(frames%2)*2;
   pixel(X+5,Y+3,22,26,found?'#7b7864':'#ad6c45');pixel(X+8,Y+6,16,19,found?'#d4c7ad':'#ecd6ac');pixel(X+10,Y+7,12,3,s.color);
   pixel(X+12,Y+13+bob,8,7,found?'#5b756a':'#972f26');pixel(X+7,Y+26,18,3,'#594c41');
   ctx.fillStyle=found?'#526b5a':'#402d27';ctx.font='bold 13px serif';ctx.textAlign='center';ctx.fillText(s.seal,X+16,Y+23);
  });
  NOTES.forEach(n=>{if(foundNotes.has(n.id))return;const [x,y]=n.pos;const X=x*tile,Y=y*tile;pixel(X+5,Y+8,22,17,'#457a8f');pixel(X+7,Y+10,18,13,'#c7e0d9');pixel(X+11,Y+13,10,3,'#487f90');pixel(X+11,Y+18,7,2,'#487f90')});
  const [ex,ey]=EXIT,x=ex*tile,y=ey*tile;
  pixel(x+4,y+2,24,28,gameDone?'#70947f':visited.size===4?'#5b9469':'#5a504b');pixel(x+8,y+6,16,24,'#28332f');pixel(x+21,y+18,3,3,'#edd29d');pixel(x+6,y+1,20,4,'#b38b56');
  const [px,py]=player,X=px*tile,Y=py*tile;
  pixel(X+12,Y+3,10,5,'#2a272b');pixel(X+11,Y+8,12,10,'#d59e79');pixel(X+10,Y+18,14,10,'#8d4432');pixel(X+8,Y+19,3,8,'#47616c');pixel(X+11,Y+28,4,3,'#342b2b');pixel(X+20,Y+28,4,3,'#342b2b');pixel(X+14,Y+13,2,2,'#302322');pixel(X+21,Y+13,2,2,'#302322');
 }
 function renderPlan(){const p=$('#rm39-planned');p.innerHTML=STATIONS.map((s,i)=>{const c=choices.get(s.id);return `<article class="rm39-plan-card ${c?'filled':''}"><span>档案 0${i+1} / ${s.label}</span><h3>${c?c.title:'尚未取得'}</h3><p>${c?c.out:'在像素迷宫中找到这份档案，选择一条制度路径。'}</p>${c?`<details><summary>它仍有什么代价？</summary><p>${c.guard}</p></details>`:''}</article>`}).join('');
  $('#rm39-progress').textContent=`${visited.size} / 4`;updateHud();
  shell.querySelectorAll('[data-seal]').forEach(el=>{const yes=visited.has(el.dataset.seal);el.classList.toggle('taken',yes);el.querySelector('small').textContent=yes?'档案已归入卷宗':'尚未翻阅'});
  const report=$('#rm39-report');if(gameDone){report.innerHTML=`<div class="rm39-report-final"><span>通关档案 · 已生成</span><h3>你的培养方案已经完成初稿。</h3><p>你取得了四枚档案印记，并把它们连接为「课程—能力—职业—公共责任」的改革线索。下面的组合是编辑式情境推演，不是效果预测，也不意味着其他路径无效。</p><div><button id="rm39-download" type="button">保存我的改革草案 .md ↓</button><button id="rm40-review" type="button">返回迷宫复核选择 ↶</button><button id="rm39-replay" type="button">重新探索另一条路径 ↺</button></div></div>`;}else{report.innerHTML=`<p>目前取得 ${visited.size} / 4 份档案。${visited.size===4?'四份证据已齐备，请去迷宫右下角的出口提交方案。':'继续探索，完成全部四个关卡后抵达出口，生成改革方案。'}</p>`;}
 }
 function closeModal(){modal=null;$('#rm39-encounter').hidden=true;canvas.focus({preventScroll:true});}
 function stationEncounter(s){modal=s;route=[];stopPath();quizIndex=null;quizAnswered=false;showStationQuiz(s);putToast(`发现「${s.label}」档案。先完成证据辨析，再设计培养路径。`)}
 function showStationQuiz(s){const q=CHECKS[s.id],el=$('#rm39-encounter');el.hidden=false;el.innerHTML=`<div class="rm39-dialog-title"><span>第 ${STATIONS.indexOf(s)+1} 站 · 研究辨析</span><button type="button" data-maze-close aria-label="关闭档案">×</button></div><h3 id="rm39-encounter-title">${q.prompt}</h3><p>选择最有研究依据的解释。答错也不会扣分，可读完证据说明再进入制度选择。</p><div class="rm40-quiz-options">${q.items.map((c,i)=>`<button type="button" data-quiz-index="${i}"><span>${['A','B','C'][i]}</span>${c}</button>`).join('')}</div><div id="rm40-quiz-feedback" aria-live="polite"></div>`;}
 function showStationChoices(s){const el=$('#rm39-encounter');el.hidden=false;el.innerHTML=`<div class="rm39-dialog-title"><span>第 ${STATIONS.indexOf(s)+1} 站 · 制度设计</span><button type="button" data-maze-close aria-label="关闭档案">×</button></div><h3 id="rm39-encounter-title">${s.question}</h3><p>${s.desc}</p><div class="rm39-options">${s.choices.map((c,i)=>`<button type="button" data-station-choice="${i}"><b>${i===0?'A':'B'} · ${c.title}</b><small>${c.sub}</small><small class="rm40-choice-warning">制度代价：${c.guard}</small></button>`).join('')}</div><p class="rm39-dialog-note">两条路径是可讨论的改革方案，不作虚构的“绩效打分”。稍后仍可返回并调整选择。</p>`;}
 function gameWin(){gameDone=true;putToast('四份档案已归档：方案草案完成。');renderPlan();document.getElementById('rm39-plan')?.scrollIntoView({behavior:'smooth',block:'start'});}
 function arrive(){const note=noteByKey.get(player.join(','));if(note&&!foundNotes.has(note.id)){foundNotes.add(note.id);putToast(`发现研究手记「${note.title}」，按 J 查看全文。`);beep(740);updateHud();}
 const s=STATIONS.find(s=>s.pos[0]===player[0]&&s.pos[1]===player[1]&&!visited.has(s.id));if(s){stationEncounter(s);return true}if(player[0]===EXIT[0]&&player[1]===EXIT[1]){if(visited.size===4)gameWin();else putToast(`出口还缺 ${4-visited.size} 份档案。请继续寻找。`);return true}return false}
 function step(dx,dy){if(modal||gameDone||paused||overlayMode)return false;const [x,y]=player,nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=WIDTH||ny>=HEIGHT||GRID[ny][nx]){putToast('前方是墙壁，试试另一条路。');return false}history.push([...player]);if(history.length>500)history.shift();player=[nx,ny];walked++;$('#rm39-step-count').textContent=`已走 ${walked} 步`;paint();updateHud();arrive();return true}
 function stopPath(){if(timer){clearInterval(timer);timer=null}route=[]}
 function autoTo(cell){if(modal||gameDone||paused||overlayMode)return;stopPath();const path=shortest(player,cell);if(path.length<=1){arrive();return}route=path.slice(1);timer=setInterval(()=>{const next=route.shift();if(!next){stopPath();return}const [dx,dy]=[next[0]-player[0],next[1]-player[1]];step(dx,dy);if(modal||gameDone||route.length===0)stopPath()},Number($('#rm40-speed').value)||115)}
 function replay(){stopPath();player=[...START];walked=0;visited.clear();choices.clear();foundNotes.clear();history.length=0;gameDone=false;paused=false;hideOverlay();modal=null;$('#rm39-encounter').hidden=true;$('#rm39-step-count').textContent='已走 0 步';putToast('新的卷宗已开启。所有选择已重置。');renderPlan();paint();updateHud()}
 const moves={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
 function click(e){const b=e.target.closest('button');if(!b||!shell.contains(b))return;
  if(b.dataset.move){stopPath();step(...moves[b.dataset.move]);canvas.focus({preventScroll:true});return}
  if(b.id==='rm39-map-hint'){hints=!hints;b.setAttribute('aria-pressed',String(hints));b.textContent=hints?'隐藏路径 H':'显示路径 H';paint();return}
  if(b.id==='rm39-guide'){const target=nextStation()?.pos||EXIT;autoTo(target);return}
  if(b.id==='rm40-guide-note'){const n=NOTES.filter(n=>!foundNotes.has(n.id)).sort((a,b)=>shortest(player,a.pos).length-shortest(player,b.pos).length)[0];if(n)autoTo(n.pos);else putToast('四份可选研究手记都已找到。');return}
  if(b.id==='rm40-step-back'){if(!history.length){putToast('没有可以撤回的移动。');return}stopPath();player=history.pop();walked=Math.max(0,walked-1);$('#rm39-step-count').textContent=`已走 ${walked} 步`;putToast('已撤回一步。已取得的材料不会丢失。');paint();updateHud();return}
  if(b.id==='rm40-brief'||b.hasAttribute('data-rm40-help')){paused=false;$('#rm40-pause').textContent='暂停 P';$('#rm40-pause').setAttribute('aria-pressed','false');showOverlay('help');return}
  if(b.id==='rm40-notebook'){showOverlay('notes');return}
  if(b.id==='rm40-map-toggle'){const el=$('#rm40-map-overlay');el.hidden=!el.hidden;b.setAttribute('aria-pressed',String(!el.hidden));return}
  if(b.id==='rm40-pause'){paused=!paused;b.textContent=paused?'继续 P':'暂停 P';b.setAttribute('aria-pressed',String(paused));if(paused)showOverlay('pause');else hideOverlay();return}
  if(b.hasAttribute('data-rm40-close')){if(paused){paused=false;$('#rm40-pause').textContent='暂停 P';$('#rm40-pause').setAttribute('aria-pressed','false')}hideOverlay();return}
  if(b.id==='rm40-audio'){soundOn=!soundOn;b.textContent=soundOn?'音效：开':'音效：关';b.setAttribute('aria-pressed',String(soundOn));if(soundOn)beep(630);return}
  if(b.id==='rm40-save'){saveGame();return}
  if(b.id==='rm40-load'){loadGame();return}
  if(b.id==='rm40-clear-save'){try{localStorage.removeItem(STORE_KEY);putToast('本地存档已清除。当前探索进度不受影响。')}catch(_){putToast('无法清理存档。')}return}
  if(b.id==='rm40-review'){gameDone=false;$('#rm39-game').scrollIntoView({behavior:'smooth'});putToast('现在可以点击右侧已取得的印记，调整选择。');renderPlan();return}
  if(b.dataset.reopenStation){const s=STATIONS.find(s=>s.id===b.dataset.reopenStation);if(s){modal=s;showStationChoices(s)}return}
  if(b.hasAttribute('data-quiz-index')&&modal){const i=Number(b.dataset.quizIndex),q=CHECKS[modal.id];quizIndex=i;quizAnswered=true;$('#rm40-quiz-feedback').innerHTML=`<div class="rm40-quiz-explanation ${i===q.correct?'correct':'careful'}"><b>${i===q.correct?'这是一种有依据的解释':'这个解释超出了现有证据'}</b><p>${q.why}</p><button type="button" data-quiz-continue>继续设计培养路径 →</button></div>`;shell.querySelectorAll('[data-quiz-index]').forEach(e=>{e.disabled=true;e.classList.toggle('chosen',Number(e.dataset.quizIndex)===i)});beep(i===q.correct?720:360);return}
  if(b.hasAttribute('data-quiz-continue')&&modal){showStationChoices(modal);return}
  if(b.id==='rm39-restart'||b.id==='rm39-replay'){replay();return}
  if(b.hasAttribute('data-maze-close')){closeModal();return}
  if(b.hasAttribute('data-station-choice')&&modal){const c=modal.choices[Number(b.dataset.stationChoice)];choices.set(modal.id,c);visited.add(modal.id);beep(670);putToast(`取得「${modal.label}」档案印记。${4-visited.size?`还剩 ${4-visited.size} 处。`:'四枚已齐，前往右下角出口！'}`);$('#rm39-case-note').innerHTML=`<span>新取得的档案 · ${modal.label}</span><p>${c.out}</p>`;closeModal();renderPlan();paint();updateHud();return}
  if(b.id==='rm39-open-flourish'){const slot=$('#rm39-flourish-slot');if(slot.querySelector('.v49-rebuilt')){slot.innerHTML='';b.textContent='展开能力结构图 ↓'}else{slot.innerHTML=flourishEmbed('ability');b.textContent='收起能力结构图 ↑'}return}
  if(b.id==='rm39-download'){const lines=['# 我的新闻传播教育重构草案','','> 交互游戏生成的规范性方案草案，不是政策效果预测。','',...STATIONS.flatMap((s,i)=>{const c=choices.get(s.id);return [`## ${i+1}. ${s.label}：${c.title}`,`- 制度行动：${c.out}`,`- 待评估的代价：${c.guard}`,'']}),'## 数据与边界','- 1,959次能力提及：前台技能1,467次、核心能力492次。','- 仅57次明确能力属性判断：前台52次、核心5次。','- 上述数据是社会平台评论中的表征，不是教育方案成效的因果评估。',`- 已收集研究手记：${foundNotes.size}/4。`,...NOTES.filter(n=>foundNotes.has(n.id)).map(n=>`- ${n.title}：${n.text}`),'- 来源：新闻传播教育合法性研究终版归档；Flourish层级图30501030。'];const blob=new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='我的教育重构草案.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return}
 }
 function key(e){if(!shell.isConnected||e.defaultPrevented)return;const tgt=e.target;if(e.code==='Escape'&&overlayMode){e.preventDefault();if(paused){paused=false;$('#rm40-pause').textContent='暂停 P';$('#rm40-pause').setAttribute('aria-pressed','false')}hideOverlay();return}
  if(tgt.matches('input,textarea,select')||tgt.closest('[role="dialog"]'))return;
  if(modal)return;
  const map={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
  const dir=map[e.code];const rect=canvas.getBoundingClientRect();const inView=rect.bottom>100&&rect.top<window.innerHeight-70;
  if(dir&&inView){e.preventDefault();stopPath();step(...moves[dir]);canvas.focus({preventScroll:true})}
  if(e.code==='KeyH'&&inView){e.preventDefault();$('#rm39-map-hint').click()}
  const actions={KeyN:'rm39-guide',KeyJ:'rm40-notebook',KeyM:'rm40-map-toggle',KeyP:'rm40-pause',KeyZ:'rm40-step-back',Slash:'rm40-brief'};if(inView&&actions[e.code]&&!e.ctrlKey){e.preventDefault();document.getElementById(actions[e.code])?.click()}
 }
 function canvasClick(e){if(modal||gameDone||paused||overlayMode)return;const r=canvas.getBoundingClientRect();const x=Math.floor((e.clientX-r.left)/r.width*WIDTH),y=Math.floor((e.clientY-r.top)/r.height*HEIGHT);if(!GRID[y]?.[x])autoTo([x,y]);else putToast('点选浅色的可通行地面，或使用方向按钮。')}
 shell.addEventListener('click',click);canvas.addEventListener('click',canvasClick);window.addEventListener('keydown',key);renderPlan();paint();updateHud();putToast('按「任务与操作说明」阅读目标。四个主线任务加四份可选研究手记。');
 return ()=>{disposed=true;stopPath();shell.removeEventListener('click',click);canvas.removeEventListener('click',canvasClick);window.removeEventListener('keydown',key)};
}
// Exposed for source-level tests without affecting production execution.
export const mazeAudit={width:WIDTH,height:HEIGHT,stationPositions:STATIONS.map(s=>s.pos),grid:GRID,start:START,exit:EXIT,shortest,notes:NOTES,checks:CHECKS};
