/* V23 · FAST 2D pixel walking adventure. Original story and fictional NPCs.
 * Project data remain untouched. Characters and dialogue are fictional teaching composites.
 * Each station requires clicking an NPC, reading two short lines, and answering a question.
 */
(function(NS){'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const profiles={
 builder:{title:'施工人员',year:'建设时期 · 2011—2016',label:'把图纸变成工程',accent:'#eac481',color:'#efad5b',intro:'你是新到大窝凼的施工队员。沿着山路找到现场师傅，完成五项建设准备。',name:'阿勇',job:'施工队学徒',sprite:'worker'},
 scientist:{title:'科学家',year:'运行时期 · 2020年后',label:'从信号中寻找证据',accent:'#83dcd2',color:'#82cbd1',intro:'你刚加入观测团队。去科研站报到，沿途认识射电观测的基本工作。',name:'小岚',job:'青年研究员',sprite:'scientist'},
 visitor:{title:'游客',year:'科普参观 · 2020年后',label:'沿着山路读懂天眼',accent:'#d8a5ef',color:'#e1a2d6',intro:'你第一次来平塘。跟着路上的讲解员与居民，理解天眼和这里的生活。',name:'小禾',job:'初次参观者',sprite:'visitor'}
};
// All dialogue is written for the game, not quoted interviews. Time-dependent regulations appear only after 2019.
const stories={
 builder:[
 {npc:'测绘员 林师傅',kind:'surveyor',place:'山路入口',lines:['喂，新来的！先别急着往里走。','你看这片山窝，修这么大的望远镜，得先搞明白地形。'],q:'为什么要先测绘大窝凼的地形？',opts:['确定洼地形状，为工程设计提供依据','因为山里没有其他施工工作','只要山窝够大，就能直接开工'],good:0,why:'天然洼地为选址提供条件，但仍需调查地形、地质与建设条件。',token:'地形测绘记录'},
 {npc:'地质员 周工',kind:'engineer',place:'山坡勘察点',lines:['脚下这片岩层，要一段一段查。','看起来结实，不等于可以跳过地质勘察。'],q:'发现局部岩层情况不明时，你会怎么办？',opts:['按原方案直接施工','记录疑点，交给专业人员复核','让其他工友猜一个结果'],good:1,why:'地质不确定性需要专业调查，未经确认不能作为安全施工依据。',token:'地质复核单'},
 {npc:'索网班长 老杨',kind:'worker',place:'钢索作业区',lines:['你来得正好，我们正核对索网构件。','这么大的装置，任何一处连接都要按要求检查。'],q:'安装索网构件前最该先核对什么？',opts:['构件编号、技术要求和安装检查记录','外观颜色好不好看','能不能一次把所有钢索拉紧'],good:0,why:'索网承担关键结构功能，构件和安装质量须按专业技术规程检验。',token:'索网核验卡'},
 {npc:'安全员 陈姐',kind:'safety',place:'施工平台',lines:['先把工具放稳。今天风比刚才大。','现场条件变了，就要重新评估作业风险。'],q:'风况超出作业要求时，应该怎么做？',opts:['赶工完成后再检查','按安全规程暂停相关高风险作业并复核','让没有培训的人替班'],good:1,why:'安全优先，实际作业应执行现场气象条件和专项施工规范。',token:'安全确认单'},
 {npc:'总装协调员 何工',kind:'engineer',place:'天眼施工终点',lines:['走到这里，你已经看见不少建设环节了。','最后一道题，考考你怎样理解这项工程。'],q:'2016年FAST落成后，下一步还需要什么？',opts:['无需调试，直接把所有数据当作科学发现','继续开展设备调试与性能验证','将反射面整体转向不同方向'],good:1,why:'FAST于2016年落成后进入调试阶段，2020年通过国家验收。',token:'建设任务结业记录'}
 ],
 scientist:[
 {npc:'值班研究员 郑老师',kind:'scientist',place:'科研站入口',lines:['欢迎。今天先不碰正式观测计划。','我想看看你是否清楚这面“大锅”在接收什么。'],q:'FAST主要接收的是什么信号？',opts:['来自天体的无线电波','从望远镜发射出的可见光','游客手机发出的导航指令'],good:0,why:'FAST是一台射电望远镜，接收天体的无线电辐射进行研究。',token:'射电入门笔记'},
 {npc:'设备工程师 孙工',kind:'engineer',place:'控制室外',lines:['你看反射面上的小单元。','它们和馈源系统配合，才能完成不同方向的观测。'],q:'FAST是怎样配合观测方向工作的？',opts:['把整个500米反射面像普通碟子那样转动','通过主动反射面和馈源系统的协调控制','只靠摄像机对准星空'],good:1,why:'FAST使用主动反射面与馈源舱系统协同工作，整体反射面不会作为一个大碟转动。',token:'反射面工作图'},
 {npc:'电磁保护巡查员 吴姐',kind:'ranger',place:'宁静区宣教点',lines:['你带的无线设备，进入不同区域前先核对管理要求。','别小看一点干扰，对微弱信号的观测很重要。'],q:'为什么要管理天眼周围的无线电发射活动？',opts:['让山里始终没有任何声音','降低人为无线电干扰，保护观测环境','让所有游客无法看见望远镜'],good:1,why:'电磁波宁静区依法分级保护，具体设备限制与区域管理应遵守现行规定。',token:'电磁环境检查表'},
 {npc:'数据分析师 罗博士',kind:'scientist',place:'数据分析室',lines:['屏幕上的波峰很漂亮，可先别兴奋。','它有规律，不代表一定来自天体。'],q:'看到周期性信号时，下一步最合理的做法是？',opts:['立刻公布新的天体发现','先排查干扰并安排重复观测','删除所有异常信号'],good:1,why:'候选信号需要排除仪器与人为干扰，并结合复测、分析和同行核验。',token:'候选信号复核单'},
 {npc:'课题负责人 方老师',kind:'scientist',place:'观测任务终点',lines:['你的记录我看了，思路不错。','科学研究最怕急着下结论。最后这一关你自己决定。'],q:'一份可靠的观测结论最需要什么？',opts:['可靠的数据、可复核的方法和清楚的证据链','越轰动的新闻标题越好','只要一个人相信即可'],good:0,why:'观测结果需要可检验的证据与规范的分析程序。',token:'科研观测入门徽章'}
 ],
 visitor:[
 {npc:'游客中心小罗',kind:'guide',place:'天眼小镇入口',lines:['你好，第一次来？欢迎！','先问你个简单的，你知道山里的“大锅”到底是干什么的吗？'],q:'中国天眼主要用来做什么？',opts:['用望远镜接收宇宙中的无线电波','向宇宙发射手机信号','用来监控周边居民的生活'],good:0,why:'FAST是一座大型射电天文设施，主要用于天文学研究。',token:'参观路线卡'},
 {npc:'讲解员 小张',kind:'guide',place:'科普长廊',lines:['不少人看到“大锅”，就想找个地方站到锅底拍照。','但科研设施有专门的安全和管理要求。'],q:'想近距离了解天眼，正确做法是什么？',opts:['按开放参观规定选择指定路线和展项','自己翻过围栏进入科研区','无人值守时放飞无人机航拍'],good:0,why:'观众应依照景区和科研设施公布的参观规定活动。教学地图不提供实际通行许可。',token:'合规参观提示'},
 {npc:'无线电科普员 阿敏',kind:'ranger',place:'电磁保护提示点',lines:['有个疑问你可能也想过。','为什么有的区域连手机都要特别管理？'],q:'保护区对部分电子设备提出限制，主要为了什么？',opts:['保持所有游客的手机电池满电','减少可能影响望远镜的无线电干扰','让照片看起来更复古'],good:1,why:'2019年保护办法对不同区域的无线电发射设备实行分级管理。实际参观时需遵守当前规定。',token:'电磁宁静知识卡'},
 {npc:'村民 阿田',kind:'resident',place:'山边生活观察点',lines:['你们来这儿看天眼，我就在附近生活。','有了新机会，日常安排也有要慢慢适应的地方。'],q:'想了解天眼对当地生活的影响，应怎样做？',opts:['只看游客数量就能概括所有人','听不同居民的经历，并核查居住、出行与经营变化','把每个人的经历都写成同一个故事'],good:1,why:'大型工程影响因人而异，需要尊重具体生活经验。此NPC为虚构教学人物，并非真实访谈引语。',token:'地方生活观察记'},
 {npc:'纪念馆志愿者 宁宁',kind:'guide',place:'科普旅程终点',lines:['走完这段路，你看到了天眼，也听到了附近人的故事。','回头想想，今天哪件事最值得带走？'],q:'怎样完整理解“中国天眼”？',opts:['只记住“世界第一”四个字','只关心景区消费','同时理解科学原理、建设劳动与周边生活'],good:2,why:'技术知识、建设经历和地方生活共同构成理解这项工程的线索。',token:'天眼探索完成章'}
 ]
};
const key='guizhou_fast_pixel_v23';const read=()=>{try{const d=JSON.parse(localStorage.getItem(key)||'{}');return d&&typeof d==='object'?d:{}}catch(_){return {}}};const save=d=>{try{localStorage.setItem(key,JSON.stringify(d))}catch(_){}};
const game={active:false,role:null,step:0,phase:'choice',line:0,notice:'',tokens:[],avatarX:72,moveTo:72,cameraX:0,clock:0,prev:0,raf:0,speech:'',jump:0,
 init(){const e=document.createElement('section');e.id='v23FastPixel';e.className='v23-pixel-game';e.hidden=true;e.setAttribute('role','dialog');e.setAttribute('aria-modal','true');e.setAttribute('aria-label','中国天眼像素剧情冒险');
 e.innerHTML='<header class="v23-top"><div><span class="v23-kicker">黔境 · 像素冒险</span><h2>沿着山路去天眼</h2></div><div class="v23-top-right"><span id="v23StageLabel">选择身份</span><button type="button" id="v23Exit">× 退出</button></div></header><div id="v23GamePanel" class="v23-panel"></div>';
 document.body.appendChild(e);$('v23Exit').addEventListener('click',()=>this.close());e.addEventListener('click',ev=>{const b=ev.target.closest('[data-px]');if(b)this.action(b.dataset.px,b.dataset.id)});
 e.addEventListener('keydown',ev=>{if(ev.key==='Escape'){ev.stopPropagation();this.close()}else if(['Enter',' '].includes(ev.key)&&ev.target.id==='v23PixelCanvas'){ev.preventDefault();this.action('npc')}});
 const legacy=NS.FastGame;this.original=legacy;if(legacy){legacy.open=()=>this.open();legacy.start=()=>this.open();legacy.active=false;legacy.portal&&(()=>{const old=legacy.portal.bind(legacy);legacy.portal=()=>{old();const q=$('fastQuickStart'),p=$('fastPulse');if(q)q.querySelector('small')?.replaceChildren(document.createTextNode('三种角色 · 点击NPC · 15段对话'));if(p){const sm=p.querySelector('small');if(sm)sm.textContent='施工 / 科学 / 游客 · 像素道路冒险'}}})();}
 document.querySelectorAll('.v23-pixel-game').forEach(x=>x.hidden=true);
 },
 open(){if(NS.Drive?.active||NS.PixelTruck?.openState)return;if(!NS.state?.entered){NS.App.enterMap();setTimeout(()=>this.open(),350);return}if(NS.state.site!=='fast')NS.App.setSite('fast');this.active=true;if(this.original)this.original.active=true;this.role=null;this.phase='choice';this.prev=0;this.clock=0;$('v23FastPixel').hidden=false;document.body.classList.add('v23-pixel-active','is-fast-playing');this.render();this.loop(performance.now());$('v23Exit')?.focus({preventScroll:true})},
 close(){this.active=false;if(this.original)this.original.active=false;cancelAnimationFrame(this.raf);$('v23FastPixel').hidden=true;document.body.classList.remove('v23-pixel-active','is-fast-playing');this.original?.portal?.()},
 choose(role){if(!profiles[role])return;this.role=role;const s=read()[role];this.step=Math.max(0,Math.min(4,Number(s?.completed)||0));this.tokens=Array.isArray(s?.tokens)?s.tokens.slice(0,5):[];this.phase=(Number(s?.completed)>=5?'ending':'ready');this.line=0;this.notice='';this.avatarX=72+this.step*430;this.moveTo=this.avatarX;this.render()},
 current(){return stories[this.role]?.[this.step]},
 action(a,id){if(a==='role'){this.choose(id);return}if(a==='back'){this.role=null;this.phase='choice';this.render();return}if(a==='restart'){const d=read();delete d[this.role];save(d);this.choose(this.role);return}
 if(!this.role)return;
 if(a==='walk'&&this.phase==='ready'){this.phase='moving';this.moveTo=265+this.step*430;this.render();return}
 if(a==='npc'&&this.phase==='encounter'){this.phase='talk';this.line=0;this.render();return}
 if(a==='next-line'&&this.phase==='talk'){if(this.line===0){this.line=1;this.render()}else{this.phase='question';this.render()}return}
 if(a==='answer'&&this.phase==='question'){const story=this.current(),n=Number(id);if(!Number.isInteger(n)||n<0||n>=story.opts.length)return;if(n===story.good){this.phase='success';this.notice='';this.tokens[this.step]=story.token;const d=read();d[this.role]={completed:Math.min(5,this.step+1),tokens:this.tokens,updated:new Date().toISOString()};save(d)}else{this.notice='再想想。'+story.why}this.render();return}
 if(a==='continue'&&this.phase==='success'){if(this.step>=4){this.phase='ending';this.render()}else{this.step++;this.phase='ready';this.line=0;this.notice='';this.moveTo=this.avatarX;this.render()}return}
 },
 render(){const root=$('v23GamePanel');if(!root)return;const p=this.role?profiles[this.role]:null;
 if(!p){$('v23StageLabel').textContent='选择身份';root.innerHTML='<section class="v23-choose"><div class="v23-intro"><span>一条路 · 三段不同的经历</span><h3>今天，你准备以什么身份前往中国天眼？</h3><p>沿路遇见五位NPC，点击交谈并回答问题，一站一站走到终点。所有人物对白均为原创教学情境。</p></div><div class="v23-roles">'+Object.entries(profiles).map(([id,r])=>{const old=read()[id];return `<button type="button" data-px="role" data-id="${id}" class="v23-role v23-role-${id}"><span class="v23-role-icon" aria-hidden="true">${{builder:'▣',scientist:'✦',visitor:'⌂'}[id]}</span><b>${r.title}</b><small>${r.year}</small><span>${r.label}</span><em>${old?.completed?'已到第'+Math.min(5,old.completed+1)+'站 · 继续':'从山路起点出发'} →</em></button>`}).join('')+'</div><div class="v23-honesty">地形为像素教学场景，非实地路线；NPC均为虚构角色。可随时退出，已通过的站点会保存在本机。</div></section>';return}
 $('v23StageLabel').textContent=`${p.title} · 第 ${Math.min(5,this.step+1)} / 5 站`;
 root.innerHTML=`<div class="v23-game-layout"><div class="v23-world-wrap"><div class="v23-stagebar"><div><b>${p.name}</b><span>${p.job}　·　${p.year}</span></div><div class="v23-tokens">${Array.from({length:5},(_,i)=>`<span class="${this.tokens[i]?'filled':''}" title="${esc(this.tokens[i]||'未解锁')}">${this.tokens[i]?'★':'◇'}</span>`).join('')}</div></div><div class="v23-canvas-wrap"><canvas id="v23PixelCanvas" width="640" height="360" tabindex="0" role="button" aria-label="像素山路。抵达NPC后，点击NPC开启对话"></canvas><div class="v23-canvas-hint" id="v23CanvasHint">${this.phase==='moving'?'沿着山路前进…':this.phase==='encounter'?'点击面前的NPC，开始交谈':this.phase==='ready'?'按下方按钮，走向下一位NPC':this.phase==='success'?'任务完成 · 收好线索':this.phase==='ending'?'旅程完成':'与NPC交谈中'}</div></div><div class="v23-locations">${stories[this.role].map((s,i)=>`<span class="${i===this.step?'current':i<this.step?'passed':''}">${i+1} ${s.place}</span>`).join('')}</div></div><aside class="v23-story" id="v23Story"><div class="v23-story-top"><span>当前任务</span><button data-px="back" type="button">更换角色</button></div>${this.storyHTML()}<div class="v23-story-foot">原创教学角色与对话 · 非真实采访录音或原话</div></aside></div>`;
 const canvas=$('v23PixelCanvas');canvas.addEventListener('click',ev=>{if(this.phase!=='encounter')return;const r=canvas.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*640,y=(ev.clientY-r.top)/r.height*360;const npcX=318+this.step*430-this.cameraX;if(x>=npcX-36&&x<=npcX+42&&y>=170&&y<=315)this.action('npc')});this.draw();},
 storyHTML(){const s=this.current(),p=profiles[this.role];if(this.phase==='ending')return `<div class="v23-story-body"><div class="v23-portrait">★</div><h3>山路走到了尽头</h3><p>你完成了${this.tokens.length}站任务，带走了${this.tokens.length}张知识卡。你看见了${p.title==='施工人员'?'地形、结构与安全':p.title==='科学家'?'观测、干扰与复核':'科学设施、参观规则与周边生活'}。</p><div class="v23-reward">${this.tokens.map(t=>`<span>✦ ${esc(t)}</span>`).join('')}</div><button data-px="restart" class="v23-main-btn">重新体验</button><button data-px="back" class="v23-soft-btn">换个身份再走一次</button></div>`;
 let body=`<div class="v23-story-body"><div class="v23-chapter">第 ${this.step+1} 站 / ${esc(s.place)}</div>`;
 if(this.phase==='ready')body+=`<h3>${esc(p.intro.split('。')[0])}。</h3><p>下一位NPC正在前面等你。走到他身边，再点击交谈。</p><button class="v23-main-btn" data-px="walk">▶ 向前走</button>`;
 if(this.phase==='moving')body+=`<h3>沿山路前进</h3><p>前面的路通向${esc(s.place)}。</p><div class="v23-loading">● ● ●</div>`;
 if(this.phase==='encounter')body+=`<div class="v23-npc-row"><div class="v23-mini-avatar">◈</div><div><small>遇见NPC</small><h3>${esc(s.npc)}</h3></div></div><p>他好像有话想对你说。</p><button class="v23-main-btn" data-px="npc">与${esc(s.npc)}交谈</button>`;
 if(this.phase==='talk')body+=`<div class="v23-npc-row"><div class="v23-mini-avatar">◈</div><div><small>NPC 正在说话</small><h3>${esc(s.npc)}</h3></div></div><blockquote class="v23-dialogue">“${esc(s.lines[this.line])}”</blockquote><button class="v23-main-btn" data-px="next-line">${this.line?'我明白了，继续':'接着听'} ▸</button>`;
 if(this.phase==='question')body+=`<div class="v23-npc-row"><div class="v23-mini-avatar">?</div><div><small>${esc(s.npc)} 向你提问</small><h3>想一想</h3></div></div><p class="v23-question">${esc(s.q)}</p><div class="v23-answers">${s.opts.map((o,i)=>`<button data-px="answer" data-id="${i}"><span>${'ABC'[i]}</span>${esc(o)}</button>`).join('')}</div>${this.notice?`<p class="v23-error" role="status">${esc(this.notice)}</p>`:''}`;
 if(this.phase==='success')body+=`<div class="v23-good">✓ 回答正确 · 获得线索</div><h3>${esc(s.token)}</h3><p>${esc(s.why)}</p><button class="v23-main-btn" data-px="continue">${this.step===4?'查看旅程成果':'继续向下一站'} →</button>`;
 return body+'</div>'},
 loop(time){if(!this.active)return;let dt=Math.min(.05,(time-(this.prev||time))/1000);this.prev=time;this.clock+=dt;if(this.phase==='moving'){this.avatarX=Math.min(this.avatarX+dt*240,this.moveTo);if(this.avatarX>=this.moveTo){this.phase='encounter';this.render()}}this.draw();this.raf=requestAnimationFrame(t=>this.loop(t))},
 draw(){const cv=$('v23PixelCanvas');if(!cv||!this.role||!this.active)return;const ctx=cv.getContext('2d');if(!ctx)return;ctx.imageSmoothingEnabled=false;const W=640,H=360;const cam=Math.max(0,Math.min(1580,this.avatarX-130));this.cameraX=cam;
 const rect=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h))};const p=profiles[this.role],work=this.role==='builder';
 rect(0,0,W,H,work?'#719aa5':'#6c9fae');for(let i=0;i<45;i++){rect((i*149)%W,(i*37)%150,2,2,'#c9e7db66')}
 rect(0,158,W,110,'#709e87');
 // distant mountains and clouds parallax, not a geographic reconstruction
 for(let i=-2;i<10;i++){const bx=i*155-(cam*.15%155),peak=70+(i*17%56);ctx.fillStyle='#4b8291';ctx.beginPath();ctx.moveTo(bx,210);ctx.lineTo(bx+75,peak);ctx.lineTo(bx+164,210);ctx.fill();ctx.fillStyle='#3c7181';ctx.beginPath();ctx.moveTo(bx+95,210);ctx.lineTo(bx+156,peak+35);ctx.lineTo(bx+230,210);ctx.fill()}
 // FAST telescope in distance, only complete in operation era
 const dx=500+(2000-cam)*.065;ctx.fillStyle='#264c5f';ctx.beginPath();ctx.ellipse(dx,166,100,42,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d4d9bf';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(dx,154,87,28,0,0,Math.PI);ctx.stroke();if(!work){for(let j=-3;j<=3;j++){ctx.beginPath();ctx.moveTo(dx+j*22,151);ctx.lineTo(dx+j*15,181);ctx.strokeStyle='#b9d8d1';ctx.lineWidth=1.5;ctx.stroke()}rect(dx-4,109,8,22,'#e4be81');rect(dx-12,102,24,7,'#dcd3a7')}else{rect(dx-44,150,9,44,'#c7a879');rect(dx+40,150,9,44,'#c7a879')}
 // ground, vegetation, blocky shadows
 rect(0,213,W,147,'#48705e');rect(0,227,W,15,'#6e9870');rect(0,251,W,90,'#bb9870');rect(0,255,W,5,'#e1bf85');rect(0,322,W,7,'#956b50');
 for(let i=0;i<75;i++){const x=((i*127-cam*.8)%1650+1650)%1650;if(x>=W+30)continue;let y=223+(i%4)*4;rect(x,y,13,5,'#315d50');rect(x+3,y-8,7,10,'#397e63');rect(x+6,y-19,2,14,'#685e48')}
 for(let i=0;i<17;i++){const x=i*163-cam*.72;if(x< -30||x>W+30)continue;rect(x,333,44,6,'#816950');rect(x+9,347,22,4,'#816950')}
 // roadside guide sign
 for(let i=0;i<5;i++){const x=120+i*430-cam;if(x<-60||x>W+50)continue;rect(x,216,3,40,'#604c42');rect(x-14,199,43,21,i<=this.step?'#2a6662':'#3a555d');rect(x-12,201,39,17,'#d5ccaa');ctx.fillStyle='#203f49';ctx.font='bold 12px monospace';ctx.fillText('0'+(i+1),x-4,214)}
 const npcX=318+this.step*430-cam;
 if(this.phase!=='ending'){this.pixelPerson(ctx,npcX,251,'npc',p.color,Math.sin(this.clock*2)>0,this.current().kind);if(['encounter','talk','question'].includes(this.phase)){rect(npcX-30,174,68,22,'#172f3d');ctx.fillStyle='#ffe0a1';ctx.font='bold 13px sans-serif';ctx.fillText(this.phase==='encounter'?'点击交谈':this.current().npc.split(' ')[0],npcX-25,190)}}
 const aX=this.avatarX-cam;this.pixelPerson(ctx,aX,258,'hero',p.color,this.phase==='moving'&&Math.sin(this.clock*13)>0);
 rect(0,347,W,13,'#293f43');ctx.fillStyle='#fbdd9c';ctx.font='bold 11px sans-serif';ctx.fillText('天眼山路 · '+p.year+' · 教学场景',12,356);
 },
 pixelPerson(ctx,x,y,type,color,walking,kind='guide'){ctx.save();ctx.translate(Math.round(x),Math.round(y+(walking?2:0)));ctx.imageSmoothingEnabled=false;const R=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(a,b,w,h)};
 const npcColors={surveyor:'#d8bb75',engineer:'#9abfbb',worker:'#d99b5c',safety:'#e5b07e',scientist:'#e5edf1',ranger:'#5db4a0',guide:'#e6aa77',resident:'#b8a27b'};const jacket=type==='hero'?color:(npcColors[kind]||'#ceab83');R(-10,-48,21,7,type==='hero'?'#c5a05f':kind==='worker'?'#db9c45':'#445e66');R(-8,-42,17,16,'#edb88a');R(-12,-45,24,5,type==='hero'?'#d6ad6d':kind==='worker'?'#f1b85e':'#5f767d');R(-2,-36,3,3,'#39444e');R(-9,-26,21,22,jacket);R(-16,-21,8,14,jacket);R(11,-21,7,14,jacket);R(-9,-4,8,19,'#253b51');R(3,-4,8,19,'#253b51');R(-11,14,10,5,'#23313c');R(4,14,10,5,'#23313c');if(type==='hero'&&this.role==='scientist'){R(-9,-25,4,22,'#e7ece5');R(8,-25,4,22,'#e7ece5')}if(type==='hero'&&this.role==='visitor'){R(-14,-9,7,13,'#986777')}if(type==='npc'){if(kind==='scientist'){R(-10,-25,5,19,'#f4f5ef');R(8,-25,5,19,'#f4f5ef');R(-7,-35,7,2,'#364e5b')}if(kind==='guide')R(-13,-17,27,4,'#d95e5e');if(kind==='safety'||kind==='ranger')R(8,-20,5,6,'#e2d06c');if(kind==='surveyor')R(8,-34,3,25,'#4f7582');if(kind==='engineer')R(-1,-22,4,15,'#e4d6a6');if(kind==='resident')R(-11,-50,24,4,'#b49561')}ctx.restore()}
};
NS.FastPixelV23=game;document.addEventListener('DOMContentLoaded',()=>game.init());
})(window.SpatialApp=window.SpatialApp||{});
