/* V24 双工程调查局。原创证据组合小游戏。所有材料均为事实概述或明确标示的研究议题。
   玩家选择两条互相补充的证据再作推理，历史事实不因玩家选择而改变。 */
(function(NS){'use strict';
const KEY='guizhou-casebook-v24', $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cases=[
 {title:'为什么都建在山里？',subtitle:'两个工程利用了不同的地形条件。',goal:'找出各自的地形线索，解释两处工程的选址条件。',
  cards:[['f','天眼', '平塘大窝凼', '喀斯特洼地为500米反射面提供自然地形条件。'],['b','大桥','花江大峡谷','峡谷两侧地形造成交通绕行，需要跨越深谷。'],['x','天眼','平原草地','FAST建设时完全不需要考虑地形。'],['y','大桥','天然平路','花江大桥原本就是一条没有高差的地面道路。']],
  wanted:['f','b'],answer:'天眼利用洼地条件布置大型射电望远镜；大桥跨越峡谷改善干线交通。两者都依赖特定地形，但工程功能不同。',next:'工程建成，还需要哪些技术支撑？'},
 {title:'同样是大工程，靠什么工作？',subtitle:'辨认两种工程最重要的工作原理。',goal:'各选一张技术证据，说明装置如何实现其核心功能。',
  cards:[['f','天眼','反射面与馈源','FAST依靠反射面与馈源系统协同接收射电信号。'],['b','大桥','悬索桥承力','桥面荷载通过吊索、主缆传递到主塔和锚碇。'],['x','天眼','光学折射镜','FAST依靠可见光透镜放大星星的图像。'],['y','大桥','栏杆承重','桥梁全部重量都由栏杆直接承担。']],
  wanted:['f','b'],answer:'FAST的目标是观测来自宇宙的射电信号；悬索桥通过结构受力系统实现远距离跨越。工程技术需要与目标相匹配。',next:'工程如何改变周围人的生活？'},
 {title:'工程建成后，附近的人会怎样？',subtitle:'从工程成就回到日常生活。',goal:'找到一条保护或管理要求，再找到一条地方交通线索。',
  cards:[['f','天眼','电磁环境保护','射电观测需要重视电磁干扰，对周边活动设有保护管理要求。'],['b','大桥','村寨接驳条件','大桥改善干线交通，村寨内部道路还需单独调查。'],['x','天眼','设备随意使用','为方便游客，科研核心区应当允许随意发射无线信号。'],['y','大桥','村路同步升级','高速公路一通车，所有村内步道就会自动升级。']],
  wanted:['f','b'],answer:'一个工程的运行条件会影响周边空间使用；另一项工程的干线效率也不等于每条地方道路同步改善。需要分别观察具体的人和道路。',next:'你已经完成三份证据对照。'}
];
const escSvg=`<svg viewBox="0 0 660 260" aria-hidden="true" class="casebook-scene" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="caseSky" x2="0" y2="1"><stop stop-color="#174455"/><stop offset="1" stop-color="#86acaf"/></linearGradient><linearGradient id="caseHill" x2="0" y2="1"><stop stop-color="#6e9882"/><stop offset="1" stop-color="#244e48"/></linearGradient></defs><rect width="660" height="260" fill="url(#caseSky)"/><path d="M0 108 L84 48 162 124 254 59 331 132 395 76 471 122 578 48 660 108V260H0" fill="#4b756e"/><path d="M0 172L110 91 222 181 337 118 441 187 576 103 660 146V260H0" fill="url(#caseHill)"/><path d="M0 207Q120 169 212 199L283 239 339 214Q405 168 478 189L660 241V260H0" fill="#1a383b"/><g transform="translate(174 170)"><ellipse rx="95" ry="42" fill="#8daba7" stroke="#dbede5" stroke-width="5"/><ellipse rx="80" ry="33" fill="#234d60" stroke="#b3d5d5" stroke-width="2"/><path d="M-72 -9Q0 39 72 -9M-55 -24Q0 20 55 -24" fill="none" stroke="#8bcbce" stroke-width="1.8"/><path d="M0 -1V-73M-17 -5L0 -72 17 -5" stroke="#f0e5b3" stroke-width="3" fill="none"/><circle cy="-73" r="8" fill="#f0da91"/></g><g transform="translate(447 150)"><path d="M-112 72L112 72" stroke="#c8dedf" stroke-width="15"/><path d="M-100 71V-24M100 71V-24" stroke="#e3eddd" stroke-width="11"/><path d="M-100 -24Q0 118 100 -24" stroke="#f0cf8d" stroke-width="5" fill="none"/><path d="M-85 -3V70M-58 17V70M-29 32V70M0 40V70M29 32V70M58 17V70M85 -3V70" stroke="#e8dac1" stroke-width="2"/></g><rect x="15" y="14" width="170" height="29" rx="8" fill="#102d37" opacity=".85"/><text x="28" y="34" fill="#d3efdc" font-size="15" font-family="sans-serif">中国天眼 · 大窝凼</text><rect x="445" y="14" width="198" height="29" rx="8" fill="#102d37" opacity=".85"/><text x="457" y="34" fill="#f7e5c9" font-size="15" font-family="sans-serif">花江峡谷大桥</text></svg>`;
const Game={openState:false,phase:'select',step:0,picked:[],message:'',lastFocus:null,done:[],
 load(){try{const r=JSON.parse(localStorage.getItem(KEY)||'null');if(r&&Array.isArray(r.done))this.done=r.done.filter(x=>Number.isInteger(x)&&x>=0&&x<3)}catch(_){ }},
 completedCount(){return this.done.length},
 save(){try{localStorage.setItem(KEY,JSON.stringify({version:1,done:this.done,updatedAt:new Date().toISOString()}))}catch(_){ }},
 open(){if(NS.FastGame?.active||NS.Drive?.active)return;this.lastFocus=document.activeElement;this.openState=true;this.step=Math.min(3,this.done.length);this.phase=this.step>=3?'complete':'select';this.picked=[];this.message='';$('casebookGame').hidden=false;document.body.classList.add('casebook-open');$('casebookGame').scrollTop=0;this.render();$('casebookExit')?.focus({preventScroll:true})},
 close(){this.openState=false;$('casebookGame').hidden=true;document.body.classList.remove('casebook-open');this.lastFocus?.focus?.({preventScroll:true})},
 choose(id){if(this.phase!=='select')return;const i=this.picked.indexOf(id);if(i>=0)this.picked.splice(i,1);else{if(this.picked.length>=2)this.picked.shift();this.picked.push(id)}this.message='';this.render();const target=[...document.querySelectorAll('#casebookGame [data-case=choose]')].find(b=>b.dataset.id===id);target?.focus({preventScroll:true})},
 verify(){if(this.picked.length!==2)return;const puzzle=cases[this.step];if(puzzle.wanted.every(x=>this.picked.includes(x))){this.phase='solved';this.message='证据已经匹配。请阅读推理结果。';if(!this.done.includes(this.step)){this.done.push(this.step);this.save()}}else{this.message='这两张证据无法解释本案。看看它们是否分别来自天眼和大桥，再试一次。'}this.render()},
 advance(){this.step=Math.min(3,this.step+1);this.phase=this.step===3?'complete':'select';this.picked=[];this.message='';this.render()},
 render(){if(!this.openState)return;const host=$('casebookGame');const cur=cases[this.step];
 const body=this.phase==='complete'?`<div class="casebook-end"><h3>三份档案已归档</h3><p>你发现了两项工程的共同点，也区分了它们的技术目标和周边影响。</p><div class="casebook-summary">${cases.map((c,i)=>`<p><b>0${i+1} · ${esc(c.title)}</b><span>${esc(c.answer)}</span></p>`).join('')}</div><button data-case="restart">重新核查证据</button></div>`:
 `<div class="casebook-goal"><span class="casebook-eyebrow">档案 ${this.step+1} / 3</span><h3>${esc(cur.title)}</h3><p>${esc(cur.goal)}</p></div>
 ${this.phase==='solved'?`<section class="casebook-solved"><b>✓ 调查结论</b><p>${esc(cur.answer)}</p><small>${esc(cur.next)}</small><button data-case="continue">${this.step===2?'查看完整调查档案':'开启下一份档案'} →</button></section>`:
 `<div class="casebook-evidence" aria-label="可选择的证据卡">${cur.cards.map(([id,site,title,desc])=>`<button data-case="choose" data-id="${id}" class="casebook-card ${this.picked.includes(id)?'selected':''}" aria-pressed="${this.picked.includes(id)}"><small>${site} · 资料卡</small><b>${esc(title)}</b><span>${esc(desc)}</span><i>${this.picked.includes(id)?'✓ 已选':'点击选取'}</i></button>`).join('')}</div><div class="casebook-actions"><span>已选择 ${this.picked.length} / 2 张证据</span><button data-case="verify" ${this.picked.length===2?'':'disabled'}>核验这两张证据</button></div><p class="casebook-notice" role="status">${esc(this.message)}</p>`}`;
 host.innerHTML=`<div class="casebook-shell"><header><div><small>GUIZHOU / FIELD INVESTIGATION</small><h2>贵州工程调查局</h2><p>比较两地，拼出工程背后的线索</p></div><button id="casebookExit" data-case="exit">✕ 返回地图</button></header>${escSvg}<div class="casebook-progress">${cases.map((_,i)=>`<span class="${this.done.includes(i)?'done':i===this.step?'current':''}">${i+1}</span>`).join('')}</div>${body}<footer>教学推理游戏。证据取自公开工程资料及田野研究关注的问题，画面与对话属于示意；不显示实际道路连接。</footer></div>`;
 },
 init(){this.load();const node=$('casebookGame');if(!node)return;node.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-case=verify]:not(:disabled)')){e.target.click();e.preventDefault()}});node.addEventListener('click',e=>{const b=e.target.closest('button[data-case]');if(!b)return;const act=b.dataset.case;if(act==='exit')this.close();else if(act==='choose')this.choose(b.dataset.id);else if(act==='verify')this.verify();else if(act==='continue')this.advance();else if(act==='restart'){this.done=[];this.save();this.step=0;this.phase='select';this.picked=[];this.render()}});
  const open=()=>this.open();$('pixelQuickOpen')?.addEventListener('click',open);$('pixelGameLaunch')?.addEventListener('click',open);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.openState){this.close();e.preventDefault()}});
 }
};
NS.RelationGame=Game;document.addEventListener('DOMContentLoaded',()=>Game.init());
})(window.SpatialApp=window.SpatialApp||{});
