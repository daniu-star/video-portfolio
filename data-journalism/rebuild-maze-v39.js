/* PAGE-08 V3.9 — a playable, evidence-based pixel maze. All four choices are normative
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
if([...STATIONS.map(s=>s.pos),EXIT].some(p=>shortest(START,p).length===0))throw Error('第八页迷宫必须全部可达');
export function mazeSection(){return `<div class="rm39-archive" id="rm39-archive">
 <header class="rm39-cover"><div class="rm39-index"><span>卷八 · 制度回应</span><strong>08</strong><h2>价值重塑</h2><p>新闻传播教育的<br>可证成路径</p><i>研究发现不是方案效果预测。</i></div><div class="rm39-cover-copy"><span class="rm39-topline">一场关于新闻教育的制度设计实验</span><h2>教育的价值，<br>如何穿过<strong>证明的迷宫？</strong></h2><p>如果只以就业结果衡量教育，我们或许看见了终点，却看不见中间发生了什么。现在，进入一座需要亲自取证的迷宫：从课程出发，寻找能力、职业与公共责任之间可以核对的联系。</p><div class="rm39-hero-links"><a href="#rm39-game">进入像素迷宫 ↓</a><a href="#rm39-research">先看研究证据 ↗</a></div></div><div class="rm39-cover-art" aria-label="装饰性像素档案，非真实校园或历史记录"><div class="rm39-pixel-illustration"><span class="rm39-sign">资料室</span><i class="rm39-illustration-door"></i><b class="rm39-illustration-man"></b></div><span class="rm39-photo-mark">像素艺术 · 概念视觉</span></div></header>
 <section class="rm39-preface"><p><span>调查手记</span>这不是一场计分游戏。迷宫四个据点对应论文提出的培养证据链；每到一处，你要在两条可讨论的制度路径之间作出选择。最后得到的不是标准答案，而是一份带有证据和代价说明的改革草案。</p><div class="rm39-figures"><span>前台技能提及 <b>1,467</b></span><span>核心能力提及 <b>492</b></span><span>明确能力属性判断 <b>57</b></span></div></section>
 <section id="rm39-game" class="rm39-game-section" aria-labelledby="rm39-game-title"><div class="rm39-section-title"><span>互动调查 · 01</span><h2 id="rm39-game-title">迷宫里的四份培养档案</h2><p>方向键或 W A S D 移动；点击地图可自动寻路。收集四枚档案印记并抵达终点，形成你自己的改革方案。</p></div>
 <div class="rm39-game-frame"><div class="rm39-maze-main"><div class="rm39-game-meta"><span class="rm39-live-dot"></span><strong>档案迷宫 / 第一层</strong><span id="rm39-step-count">已走 0 步</span><button type="button" id="rm39-map-hint" aria-pressed="false">显示路径 H</button></div>
 <div class="rm39-canvas-shell"><canvas id="rm39-canvas" width="800" height="544" tabindex="0" aria-label="二维像素迷宫，按方向键移动，遇到四处档案据点可以选择培养路径"></canvas><div id="rm39-encounter" class="rm39-encounter" hidden role="dialog" aria-modal="false" aria-labelledby="rm39-encounter-title"></div><div class="rm39-game-toast" id="rm39-game-toast" aria-live="polite">档案室已开启。寻找四枚线索印记。</div></div>
 <div class="rm39-control-row"><div class="rm39-dpad" aria-label="方向移动按钮"><button type="button" data-move="up" aria-label="向上">↑</button><div><button type="button" data-move="left" aria-label="向左">←</button><button type="button" data-move="down" aria-label="向下">↓</button><button type="button" data-move="right" aria-label="向右">→</button></div></div><div class="rm39-ctrl-desc"><span>目标：带着四份档案走到出口</span><small>点击地图可自动寻路。无法操作键盘时，用左侧方向按钮。</small></div><button id="rm39-guide" type="button">自动走向下一线索 →</button></div></div>
 <aside class="rm39-game-panel"><div class="rm39-progress-label"><span>档案印记</span><strong id="rm39-progress">0 / 4</strong></div><div class="rm39-seals">${STATIONS.map(s=>`<div class="rm39-seal" data-seal="${s.id}"><span style="--seal:${s.color}">${s.seal}</span><div><strong>${s.label}</strong><small>尚未翻阅</small></div></div>`).join('')}</div><div class="rm39-case-note" id="rm39-case-note"><span>手记 · 001</span><p>找到一处发光的档案台，按下方向键靠近它。四条改革路径没有预先规定的分数高低。</p></div><button type="button" id="rm39-restart">重新探索 ↺</button><p class="rm39-panel-bottom">游戏选择是制度设计情境，不是已经实施的教育干预，更不能据此推断培养效果。</p></aside></div>
 </section>
 <section class="rm39-after" id="rm39-plan"><div class="rm39-section-title"><span>互动调查 · 02</span><h2>四份档案，如何组成一份改革草案？</h2><p>你的选择将在下方逐步显影；即使尚未通关，也可以阅读已经收集的制度线索。</p></div><div id="rm39-planned" class="rm39-planned"></div><div id="rm39-report" class="rm39-report" aria-live="polite"></div></section>
 <section class="rm39-research" id="rm39-research"><div class="rm39-section-title"><span>真实证据 · Flourish 图表</span><h2>游戏之外，回到研究样本。</h2><p>1,959次能力提及中，前台技能为1,467次，核心能力为492次。图表表示评论中的能力表征，不测量教育改革方案的实际成效。</p></div><div class="rm39-research-grid"><div class="rm39-research-stats"><div class="rm39-real-bar"><span>前台技能 · 1,467次</span><div><i style="width:74.9%"></i></div><b>74.9%</b></div><div class="rm39-real-bar rm39-green"><span>核心能力 · 492次</span><div><i style="width:25.1%"></i></div><b>25.1%</b></div><p>只有57次提及明确说明了能力属性，其中前台52次、核心5次。数字仅对应语料中的编码提及。</p><a download href="./data/figures/ability_hierarchy.csv">下载能力层级汇总 CSV ↓</a></div><div class="rm39-flourish-panel"><h3>把评论中的能力结构展开看看</h3><p>Flourish 已发布的层级图，可选择类别继续探索；联网后展开，不影响本地游戏。</p><button type="button" id="rm39-open-flourish">加载 Flourish 互动图表 ↓</button><div id="rm39-flourish-slot"></div><a href="https://public.flourish.studio/visualisation/30501030/" target="_blank" rel="noopener noreferrer">在 Flourish 单独查看 ↗</a></div></div></section>
 <footer class="rm39-end"><p>教育不能靠一次就业结果完成证明。<br><em>可讨论、可修正、可追溯的训练过程，才是证明得以开始的地方。</em></p><a href="#/methods">阅读论文方法与研究边界 →</a><small>来源：研究归档与论文的制度回应讨论；游戏规则为编辑设计，不作为经验统计结果。</small></footer>
 </div>`}

export function mountRebuildMaze(root){
 const shell=root.querySelector('#rm39-archive');if(!shell)return ()=>{};
 const canvas=shell.querySelector('#rm39-canvas'),ctx=canvas.getContext('2d',{alpha:false});ctx.imageSmoothingEnabled=false;
 const $=sel=>shell.querySelector(sel);let player=[...START],walked=0,visited=new Set(),choices=new Map(),modal=null,route=[],timer=null,hints=false,gameDone=false,disposed=false,frames=0;
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
  const [ex,ey]=EXIT,x=ex*tile,y=ey*tile;
  pixel(x+4,y+2,24,28,gameDone?'#70947f':visited.size===4?'#5b9469':'#5a504b');pixel(x+8,y+6,16,24,'#28332f');pixel(x+21,y+18,3,3,'#edd29d');pixel(x+6,y+1,20,4,'#b38b56');
  const [px,py]=player,X=px*tile,Y=py*tile;
  pixel(X+12,Y+3,10,5,'#2a272b');pixel(X+11,Y+8,12,10,'#d59e79');pixel(X+10,Y+18,14,10,'#8d4432');pixel(X+8,Y+19,3,8,'#47616c');pixel(X+11,Y+28,4,3,'#342b2b');pixel(X+20,Y+28,4,3,'#342b2b');pixel(X+14,Y+13,2,2,'#302322');pixel(X+21,Y+13,2,2,'#302322');
 }
 function renderPlan(){const p=$('#rm39-planned');p.innerHTML=STATIONS.map((s,i)=>{const c=choices.get(s.id);return `<article class="rm39-plan-card ${c?'filled':''}"><span>档案 0${i+1} / ${s.label}</span><h3>${c?c.title:'尚未取得'}</h3><p>${c?c.out:'在像素迷宫中找到这份档案，选择一条制度路径。'}</p>${c?`<details><summary>它仍有什么代价？</summary><p>${c.guard}</p></details>`:''}</article>`}).join('');
  $('#rm39-progress').textContent=`${visited.size} / 4`;
  shell.querySelectorAll('[data-seal]').forEach(el=>{const yes=visited.has(el.dataset.seal);el.classList.toggle('taken',yes);el.querySelector('small').textContent=yes?'档案已归入卷宗':'尚未翻阅'});
  const report=$('#rm39-report');if(gameDone){report.innerHTML=`<div class="rm39-report-final"><span>通关档案 · 已生成</span><h3>你的培养方案已经完成初稿。</h3><p>你取得了四枚档案印记，并把它们连接为「课程—能力—职业—公共责任」的改革线索。下面的组合是编辑式情境推演，不是效果预测，也不意味着其他路径无效。</p><div><button id="rm39-download" type="button">保存我的改革草案 .md ↓</button><button id="rm39-replay" type="button">重新探索另一条路径 ↺</button></div></div>`;}else{report.innerHTML=`<p>目前取得 ${visited.size} / 4 份档案。${visited.size===4?'四份证据已齐备，请去迷宫右下角的出口提交方案。':'继续探索，完成全部四个关卡后抵达出口，生成改革方案。'}</p>`;}
 }
 function closeModal(){modal=null;$('#rm39-encounter').hidden=true;canvas.focus({preventScroll:true});}
 function stationEncounter(s){modal=s;route=[];let el=$('#rm39-encounter');el.hidden=false;el.innerHTML=`<div class="rm39-dialog-title"><span>找到档案 · ${s.label}</span><button type="button" data-maze-close aria-label="关闭档案">×</button></div><h3 id="rm39-encounter-title">${s.question}</h3><p>${s.desc}</p><div class="rm39-options">${s.choices.map((c,i)=>`<button type="button" data-station-choice="${i}"><b>${i===0?'A':'B'} · ${c.title}</b><small>${c.sub}</small></button>`).join('')}</div><p class="rm39-dialog-note">两种路径各有价值与成本；这里不提供虚构的“成效得分”。</p>`;putToast(`发现「${s.label}」档案。请选择一条制度路径。`)}
 function gameWin(){gameDone=true;putToast('四份档案已归档：方案草案完成。');renderPlan();document.getElementById('rm39-plan')?.scrollIntoView({behavior:'smooth',block:'start'});}
 function arrive(){const s=STATIONS.find(s=>s.pos[0]===player[0]&&s.pos[1]===player[1]&&!visited.has(s.id));if(s){stationEncounter(s);return true}if(player[0]===EXIT[0]&&player[1]===EXIT[1]){if(visited.size===4)gameWin();else putToast(`出口还缺 ${4-visited.size} 份档案。请继续寻找。`);return true}return false}
 function step(dx,dy){if(modal||gameDone)return false;const [x,y]=player,nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=WIDTH||ny>=HEIGHT||GRID[ny][nx]){putToast('前方是墙壁，试试另一条路。');return false}player=[nx,ny];walked++;$('#rm39-step-count').textContent=`已走 ${walked} 步`;paint();arrive();return true}
 function stopPath(){if(timer){clearInterval(timer);timer=null}route=[]}
 function autoTo(cell){if(modal||gameDone)return;stopPath();const path=shortest(player,cell);if(path.length<=1){arrive();return}route=path.slice(1);timer=setInterval(()=>{const next=route.shift();if(!next){stopPath();return}const [dx,dy]=[next[0]-player[0],next[1]-player[1]];step(dx,dy);if(modal||gameDone||route.length===0)stopPath()},75)}
 function replay(){stopPath();player=[...START];walked=0;visited.clear();choices.clear();gameDone=false;modal=null;$('#rm39-encounter').hidden=true;$('#rm39-step-count').textContent='已走 0 步';putToast('新的卷宗已开启。所有选择已重置。');renderPlan();paint()}
 const moves={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
 function click(e){const b=e.target.closest('button');if(!b||!shell.contains(b))return;
  if(b.dataset.move){stopPath();step(...moves[b.dataset.move]);canvas.focus({preventScroll:true});return}
  if(b.id==='rm39-map-hint'){hints=!hints;b.setAttribute('aria-pressed',String(hints));b.textContent=hints?'隐藏路径 H':'显示路径 H';paint();return}
  if(b.id==='rm39-guide'){const target=nextStation()?.pos||EXIT;autoTo(target);return}
  if(b.id==='rm39-restart'||b.id==='rm39-replay'){replay();return}
  if(b.hasAttribute('data-maze-close')){closeModal();return}
  if(b.hasAttribute('data-station-choice')&&modal){const c=modal.choices[Number(b.dataset.stationChoice)];choices.set(modal.id,c);visited.add(modal.id);putToast(`取得「${modal.label}」档案印记。${4-visited.size?`还剩 ${4-visited.size} 处。`:'四枚已齐，前往右下角出口！'}`);$('#rm39-case-note').innerHTML=`<span>新取得的档案 · ${modal.label}</span><p>${c.out}</p>`;closeModal();renderPlan();paint();return}
  if(b.id==='rm39-open-flourish'){const slot=$('#rm39-flourish-slot');if(slot.querySelector('iframe')){slot.innerHTML='';b.textContent='加载 Flourish 互动图表 ↓'}else{slot.innerHTML=`<iframe loading="lazy" title="Flourish公开图表：被看见的能力，1959次提及" src="https://flo.uri.sh/visualisation/30501030/embed" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" referrerpolicy="no-referrer"></iframe>`;b.textContent='收起 Flourish 图表 ↑'}return}
  if(b.id==='rm39-download'){const lines=['# 我的新闻传播教育重构草案','','> 交互游戏生成的规范性方案草案，不是政策效果预测。','',...STATIONS.flatMap((s,i)=>{const c=choices.get(s.id);return [`## ${i+1}. ${s.label}：${c.title}`,`- 制度行动：${c.out}`,`- 待评估的代价：${c.guard}`,'']}),'## 数据与边界','- 1,959次能力提及：前台技能1,467次、核心能力492次。','- 仅57次明确能力属性判断：前台52次、核心5次。','- 上述数据是社会平台评论中的表征，不是教育方案成效的因果评估。','- 来源：新闻传播教育合法性研究终版归档；Flourish层级图30501030。'];const blob=new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='我的教育重构草案.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return}
 }
 function key(e){if(!shell.isConnected||e.defaultPrevented)return;const tgt=e.target;if(tgt.matches('input,textarea,select')||tgt.closest('[role="dialog"]'))return;
  if(modal)return;
  const map={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
  const dir=map[e.code];const rect=canvas.getBoundingClientRect();const inView=rect.bottom>100&&rect.top<window.innerHeight-70;
  if(dir&&inView){e.preventDefault();stopPath();step(...moves[dir]);canvas.focus({preventScroll:true})}
  if(e.code==='KeyH'&&inView){e.preventDefault();$('#rm39-map-hint').click()}
 }
 function canvasClick(e){if(modal||gameDone)return;const r=canvas.getBoundingClientRect();const x=Math.floor((e.clientX-r.left)/r.width*WIDTH),y=Math.floor((e.clientY-r.top)/r.height*HEIGHT);if(!GRID[y]?.[x])autoTo([x,y]);else putToast('点选浅色的可通行地面，或使用方向按钮。')}
 shell.addEventListener('click',click);canvas.addEventListener('click',canvasClick);window.addEventListener('keydown',key);renderPlan();paint();
 return ()=>{disposed=true;stopPath();shell.removeEventListener('click',click);canvas.removeEventListener('click',canvasClick);window.removeEventListener('keydown',key)};
}
// Exposed for source-level tests without affecting production execution.
export const mazeAudit={width:WIDTH,height:HEIGHT,stationPositions:STATIONS.map(s=>s.pos),grid:GRID,start:START,exit:EXIT,shortest};
