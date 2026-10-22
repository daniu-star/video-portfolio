import {flourishEmbed} from "./flourish.js";
/* PAGE05 V3.5: editorial evidence experiment based exclusively on archived object × basis co-occurrence data. */
import {escapeHTML as esc,fmt} from './charts.js';
import {evidenceDesk,mountEvidenceDesk} from './evidence-desk-v36.js';

const highlighted=[
 {object:'专业',basis:'公共价值',kind:'认可',pct:51.2},
 {object:'职业',basis:'公共价值',kind:'认可',pct:50.6},
 {object:'专业',basis:'身份情感',kind:'认可',pct:50.5},
 {object:'课程',basis:'专业知识与理论',kind:'认可',pct:50.5},
 {object:'行业',basis:'反讽或梗',kind:'否定',pct:87.1},
 {object:'学科',basis:'无依据断言',kind:'否定',pct:81.5},
 {object:'课程',basis:'反讽或梗',kind:'否定',pct:79.6},
 {object:'行业',basis:'实习就业经历',kind:'否定',pct:75.9},
 {object:'职业',basis:'反讽或梗',kind:'否定',pct:75.4}
];
const groupName=id=>id.replace(/^对象·|^依据·/,'');
const share=(a,b)=>a+b?100*a/(a+b):null;
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const numbers=(edge)=>({positive:edge.positive,negative:edge.negative,other:edge.n-edge.positive-edge.negative});
const key=(o,b)=>`${o}|${b}`;
export function networkArchive(d){
 const n=d.network;const objs=n.nodes.filter(x=>x.group==='评价对象').map(x=>x.name),bases=n.nodes.filter(x=>x.group==='评价依据').map(x=>x.name);
 const index=new Map(n.edges.map(e=>[key(groupName(e.source),groupName(e.target)),e]));
 if(index.size!==80||objs.length!==8||bases.length!==10)throw new Error('PAGE05: source-backed 8 × 10 relationship matrix missing');
 const defaultEdge=index.get(key('专业','公共价值'));
 const td=(o,b)=>{const e=index.get(key(o,b));const s=share(e.positive,e.negative);
   const strength=clamp(Math.sqrt(e.n)/Math.sqrt(2914),.12,1).toFixed(3);
   const polarity=s===null?'unknown':s>=55?'positive':s<=45?'negative':'mixed';
   return `<button type="button" class="na-v35-cell" data-na-cell="${esc(o)}|${esc(b)}" data-polarity="${polarity}" data-selected="${o==='专业'&&b==='公共价值'?'true':'false'}" style="--density:${strength}" aria-label="${esc(o)}与${esc(b)}，共现${e.n}条，点击查看构成" title="${esc(o)} × ${esc(b)}：${e.n}条"><span></span></button>`};
 return `<div class="na-v35" id="na-v35-shell" data-network-archive>
 <section class="na-v35-hero" aria-labelledby="na-v35-h2"><aside class="na-v35-spine"><span class="na-v35-serial">05</span><b>非对称证明</b><small>社会评价 · 档案卷宗</small><p>观点不只分歧于结论。<br>人们也在争夺：<br>什么能够构成证据？</p><div class="na-v35-seal">评价的尺度<br>正在争夺</div></aside><div class="na-v35-headcopy"><p class="na-v35-flag">第五卷 / 证据如何获得说服力</p><h2 id="na-v35-h2">同一个专业，<br>为何会得到<span>不同的判决</span>？</h2><p class="na-v35-deck">有人以就业衡量它，有人援引社会责任；有人从个人经历出发，有人用一句反讽作结。争议不只是赞成与否定——更在于什么能被当作判断的依据。</p><div class="na-v35-pull">请暂时放下自己的判断，<br>先翻开一份论据。</div><button type="button" class="na-v35-jump" data-na-to-game>进入证据审理现场 ↓</button></div><div class="na-v35-photo"><img src="./assets/archive-v3/public-street-scene.webp" alt="AI辅助概念视觉：黑白公共场景拼贴，非真实研究现场" loading="lazy"><div class="na-v35-photo-paper">同样一句“新闻学”，<br>每个人问的，<br>却可能不是同一件事。</div><small>公共场景概念拼贴 · 非新闻证据</small></div></section>
 ${evidenceDesk(d)}
 <section class="na-v35-game" id="na-v35-game" aria-labelledby="na-v35-game-title"><div class="na-v35-section-head"><span class="na-v35-section-number">02 / 预判档案</span><h3 id="na-v35-game-title">你会凭什么，<br>判断一门专业？</h3><p>选对象、选依据，揭开判断。</p></div>
  <div class="na-v35-lab"><div class="na-v35-lab-controls"><label for="na-v35-object">① 你要评价的是</label><select id="na-v35-object" aria-label="选择评价对象">${objs.map(o=>`<option value="${esc(o)}" ${o==='专业'?'selected':''}>${esc(o)}</option>`).join('')}</select><label for="na-v35-basis">② 你最先考虑什么依据</label><select id="na-v35-basis" aria-label="选择评价依据">${bases.map(b=>`<option value="${esc(b)}" ${b==='公共价值'?'selected':''}>${esc(b)}</option>`).join('')}</select><div class="na-v35-guess"><strong>③ 你猜：两种明确立场中，哪种更多？</strong><div role="group" aria-label="猜测评价方向"><button type="button" data-na-guess="认可" aria-pressed="false">认可更多</button><button type="button" data-na-guess="否定" aria-pressed="false">否定更多</button><button type="button" data-na-guess="相近" aria-pressed="false">两者相近</button></div></div><button type="button" class="na-v35-unseal" data-na-reveal disabled>揭开这组关系的档案 →</button><p class="na-v35-experiment-note">读者选择仅在浏览器当前页面中计算，不提交、不保存，也不构成调查样本。</p></div>
  <div class="na-v35-lab-paper"><div class="na-v35-paper-top"><span>归档条目 / 对象 × 依据</span><span>样本快照</span></div><h4 id="na-v35-pair-title">专业 × 公共价值</h4><p class="na-v35-cover" id="na-v35-cover">这份档案已备妥。请先作出预测，再拆封阅读。</p><div class="na-v35-result" id="na-v35-result" hidden aria-live="polite"></div><div class="na-v35-lab-footer"><button type="button" data-na-keep disabled>将该关系夹入对照档案 ＋</button><button type="button" data-na-reset>重新选择 ↺</button></div></div></div>
 </section>
 <section class="na-v35-map" id="na-v35-map" aria-labelledby="na-v35-map-heading"><div class="na-v35-map-header"><div><span class="na-v35-section-number">03 / 关系底图</span><h3 id="na-v35-map-heading">一张由<span>80条聚合关系</span>组成的证据地图。</h3></div><p>点格子，查篇数与方向。</p></div><div class="na-v35-matrix"><div class="na-v35-axislabel">纵轴 / 评价对象</div><div class="na-v35-axis-labels"><span></span>${bases.map((b,i)=>`<span title="${esc(b)}">${esc(b)}</span>`).join('')}</div>${objs.map(o=>`<div class="na-v35-matrix-row"><strong>${esc(o)}</strong>${bases.map(b=>td(o,b)).join('')}</div>`).join('')}</div><div class="na-v35-matrix-legend"><span><i class="positive"></i>认可较多</span><span><i class="negative"></i>否定较多</span><span><i class="mixed"></i>两者接近</span><span>格子颜色较淡：共现数较少</span></div>
 <div class="na-v35-map-inspector"><div><span>已选关系</span><h4 id="na-v35-inspector-title">专业 × 公共价值</h4><p id="na-v35-inspector-summary">点击矩阵任一单元格切换观察对象。</p></div><div class="na-v35-mini-bars" id="na-v35-inspector-bars">${makeBars(defaultEdge)}</div><button type="button" data-na-to-lab>带入上方实验 ↑</button></div>
 </section>
 <section class="na-v35-comp" aria-labelledby="na-v35-comp-heading"><div class="na-v35-comp-header"><span class="na-v35-section-number">04 / 并置观察</span><h3 id="na-v35-comp-heading">如果换一种尺度，<br>判断会发生什么变化？</h3><p>最多并置三组证据。</p></div><div id="na-v35-tray" class="na-v35-tray" aria-live="polite"><p>档案夹尚空。先挑一组关系。</p></div><button type="button" data-na-clear-tray>清空对照档案</button></section>
 <section class="na-v35-findings"><div class="na-v35-findings-note"><span class="na-v35-section-number">05 / 研究者旁注</span><h3>怀疑有多重入口，<br>证明却往往需要多条证据。</h3><p>根据论文正文披露的60组对象—依据关系，否定达到70%以上的有13组，而认可达到这一比例的有1组。否定与认可使用的依据都不单一，但集中程度不同。</p><p>这里比较的是证明门槛，不裁决谁更正确。</p></div><div class="na-v35-finding-figures"><div><span>超过70%的关系数</span><div class="na-v35-compared"><b>13</b><span>否定占优</span><i>∶</i><b>1</b><span>认可占优</span></div><small>正文筛选的60组关系 · 70%阈值</small></div><div class="na-v35-entropy"><span>评价依据的标准化熵</span><div><label>否定 <strong>0.944</strong></label><i style="--w:94.4%"></i><label>认可 <strong>0.901</strong></label><i style="--w:90.1%"></i></div><small>更高代表依据分布更分散；不是判断是否正确的分数</small></div></div></section>
 <section class="na-v35-flourish"><div><span class="na-v35-section-number">06 / 动态图表与资料来源</span><h3>离开这张纸，<br>把证据放回关系图。</h3><p>九组典型关系。直接筛选认可与否定，比较不同依据的判断差异。</p><div class="na-v35-source-links"><a href="https://public.flourish.studio/visualisation/30501758/" target="_blank" rel="noopener noreferrer">在 Flourish 中探索九组关系 ↗</a><a href="./data/figures/v2/network-edges.csv" download>下载80条归档关系 CSV ↓</a><a href="#/methods">阅读研究方法与边界 ↗</a></div></div><div class="na-v35-flourish-panel"><h4>九组关系 · 离线交互</h4><p>直接打开，不必联网。</p><button type="button" data-na-flourish aria-controls="na-v35-iframe" aria-expanded="false">打开九组关系图 →</button><div id="na-v35-iframe" hidden>${flourishEmbed("relations")}</div><small>注意：在线图表对应九组论文披露关系，不等同于本页80条归档聚合关系。</small></div></section>
 <section class="na-v35-outro"><span>第五卷 · 暂结</span><blockquote>很多争论看似在问“新闻学好不好”，<br>真正交锋的，却是“<em>什么才算值得相信的证据</em>”。</blockquote><p>回到评论，逐条查证。</p><div><a href="#/evidence">翻阅原始评论档案 →</a><a href="#/rebuild">继续：教育的制度回应 →</a></div></section>
 <footer class="na-v35-footnote">资料：终版论文第四节及复现归档。80条共现边来自归档补充；论文正文筛选的60组与九组已披露典型关系分别标明。以上为样本描述，不代表小红书平台或公众整体。</footer>
 </div>`;
}
function makeBars(edge){if(!edge)return '';const n=numbers(edge);const total=edge.n||1;
 return `<div class="na-v35-bars-track" role="img" aria-label="认可${n.positive}、否定${n.negative}、其他${n.other}，共${edge.n}条"><i style="width:${100*n.positive/total}%;background:#587b70"></i><i style="width:${100*n.negative/total}%;background:#a44d3b"></i><i style="width:${100*n.other/total}%;background:#b4a796"></i></div><div class="na-v35-bars-legend"><span>认可 ${fmt(n.positive)}</span><span>否定 ${fmt(n.negative)}</span><span>其他 ${fmt(n.other)}</span></div>`;
}
export function mountNetworkArchive(root,data){
 const shell=root.querySelector('#na-v35-shell');if(!shell)return ()=>{};
 const disposeDesk=mountEvidenceDesk(root,data);
 const edges=new Map(data.network.edges.map(e=>[key(groupName(e.source),groupName(e.target)),e]));
 const selectO=shell.querySelector('#na-v35-object'),selectB=shell.querySelector('#na-v35-basis');
 const title=shell.querySelector('#na-v35-pair-title'),cover=shell.querySelector('#na-v35-cover'),result=shell.querySelector('#na-v35-result');
 const revealBtn=shell.querySelector('[data-na-reveal]'),saveBtn=shell.querySelector('[data-na-keep]'),tray=shell.querySelector('#na-v35-tray');
 let guess='',shown='',selected='专业|公共价值',saved=[];
 const chosen=()=>key(selectO.value,selectB.value);
 function clearReveal(){shown='';guess='';result.hidden=true;result.innerHTML='';cover.hidden=false;cover.textContent='这份档案已备妥。请先作出预测，再拆封阅读。';revealBtn.disabled=true;saveBtn.disabled=true;shell.querySelectorAll('[data-na-guess]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')});title.textContent=`${selectO.value} × ${selectB.value}`;}
 function selectPair(k){const [o,b]=k.split('|');if(!edges.has(k))return;selectO.value=o;selectB.value=b;clearReveal();selected=k;const e=edges.get(k);shell.querySelectorAll('[data-na-cell]').forEach(el=>el.dataset.selected=String(el.dataset.naCell===k));shell.querySelector('#na-v35-inspector-title').textContent=`${o} × ${b}`;shell.querySelector('#na-v35-inspector-summary').textContent=`归档共现 ${fmt(e.n)} 条；认可 ${fmt(e.positive)}，否定 ${fmt(e.negative)}。`;
 shell.querySelector('#na-v35-inspector-bars').innerHTML=makeBars(e);}
 function chooseGuess(value){guess=value;revealBtn.disabled=false;shell.querySelectorAll('[data-na-guess]').forEach(b=>{b.classList.toggle('active',b.dataset.naGuess===guess);b.setAttribute('aria-pressed',String(b.dataset.naGuess===guess))});}
 function reveal(){const k=chosen(),e=edges.get(k);if(!guess||!e)return;const p=share(e.positive,e.negative),gap=p==null?0:Math.abs(p-50),actual=p==null?'无法比较':gap<5?'相近':p>50?'认可':'否定';const others=e.neutral+e.unknown;
 cover.hidden=true;result.hidden=false;shown=k;saveBtn.disabled=false;
 const disclosed=highlighted.find(t=>key(t.object,t.basis)===k);
 result.innerHTML=`<span class="na-v35-revealed-tag">档案拆封 · ${esc(k.replace('|',' × '))}</span><div class="na-v35-stamp-result"><strong>${fmt(e.n)}</strong><small>条共现编码记录</small></div>${makeBars(e)}<div class="na-v35-clear-sample">其中 ${fmt(e.positive+e.negative)} 条具有认可或否定的明确方向；另外 ${fmt(others)} 条为中性或无法判断。</div><div class="na-v35-judgement">你预测的是<strong>${esc(guess)}</strong>；本组明确方向中，<strong>${actual==='无法比较'?'没有足够记录可判':(actual==='相近'?'两者相近':actual==='认可'?'认可较多':'否定较多')+'（认可占'+(p??0).toFixed(1)+'%）'}</strong>。${actual==='无法比较'?'':`这只是研究中编码方向的比例，而非对专业价值的裁决。`}</div>${disclosed?`<p class="na-v35-paper-remark">论文披露案例：${esc(disclosed.kind)} ${disclosed.pct.toFixed(1)}%；该比例按论文报告的明确方向口径计算。</p>`:''}`;
 // The 5-point threshold describes the reader interaction only, not a statistical significance test.
 }
 function renderTray(){if(!saved.length){tray.innerHTML='<p>档案夹尚空。先挑一组关系。</p>';return}tray.innerHTML=saved.map((k,i)=>{const e=edges.get(k),n=numbers(e);const p=share(e.positive,e.negative);
 return `<article><div><span>比较材料 0${i+1}</span><button type="button" data-na-remove="${esc(k)}" aria-label="移除${esc(k.replace('|','与'))}">移除 ×</button></div><h4>${esc(k.replace('|',' × '))}</h4><strong>${fmt(e.n)} <small>条共现记录</small></strong>${makeBars(e)}<p>${p==null?'无明确认可或否定':`在${fmt(n.positive+n.negative)}条明确方向中，认可占${p.toFixed(1)}%。`}</p></article>`}).join('');}
 const onClick=e=>{if(e.target.closest('[data-na-to-game]')){shell.querySelector('#ed36-stage').scrollIntoView({behavior:document.body.classList.contains('motion-paused')?'auto':'smooth',block:'start'});return}
 const cell=e.target.closest('[data-na-cell]');if(cell){selectPair(cell.dataset.naCell);return}
 const g=e.target.closest('[data-na-guess]');if(g){chooseGuess(g.dataset.naGuess);return}
 if(e.target.closest('[data-na-reveal]')){reveal();return}
 if(e.target.closest('[data-na-keep]')){if(!shown)return;if(saved.includes(shown))return;saved.push(shown);saved=saved.slice(-3);renderTray();return}
 const remove=e.target.closest('[data-na-remove]');if(remove){saved=saved.filter(k=>k!==remove.dataset.naRemove);renderTray();return}
 if(e.target.closest('[data-na-clear-tray]')){saved=[];renderTray();return}
 if(e.target.closest('[data-na-reset]')){clearReveal();return}
 if(e.target.closest('[data-na-to-lab]')){const [o,b]=selected.split('|');selectO.value=o;selectB.value=b;clearReveal();shell.querySelector('#na-v35-game').scrollIntoView({behavior:document.body.classList.contains('motion-paused')?'auto':'smooth',block:'start'});return}
 const flour=e.target.closest('[data-na-flourish]');if(flour){const div=shell.querySelector('#na-v35-iframe');div.hidden=!div.hidden;const on=!div.hidden;flour.setAttribute('aria-expanded',String(on));flour.textContent=on?'收起关系图 ↑':'打开九组关系图 →';return}
 };
 const onChange=()=>{selected=chosen();selectPair(selected)};
 shell.addEventListener('click',onClick);selectO.addEventListener('change',onChange);selectB.addEventListener('change',onChange);
 const deskFind=(ev)=>{const {object,basis}=ev.detail||{}; if(object&&basis){selectPair(key(object,basis));}};
 shell.addEventListener('na-v36-find',deskFind);
 return ()=>{disposeDesk();shell.removeEventListener('na-v36-find',deskFind);shell.removeEventListener('click',onClick);selectO.removeEventListener('change',onChange);selectB.removeEventListener('change',onChange)};
}
