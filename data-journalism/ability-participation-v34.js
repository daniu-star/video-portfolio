import {flourishEmbed} from "./flourish.js";
/* V3.4 / PAGE04 — archival participatory investigation. Illustration is conceptual; all counts derived from frozen summary. */
import {escapeHTML as esc} from './charts.js';

const units=[
  {label:'采访与信源关系',micro:'谁愿意说话，谁没有机会开口？',title:'把声音带到纸面之前',explain:'采访不是把现成文字搬进稿件。信源关系与提问方法决定哪些经验有机会成为事实材料。',object:'线索便签',code:'01'},
  {label:'信息搜集与整理',micro:'散落材料，如何被组织起来？',title:'从杂乱信息中建立线索',explain:'搜集与整理让材料可以相互参照。资料本身并不自动构成报道的解释。',object:'材料索引',code:'02'},
  {label:'事实核查与证据',micro:'一句话，能够找到什么依据？',title:'给每一个断言留下证据位置',explain:'数字、引述和时间需要相互印证。核查与证据判断往往隐没在最后呈现的完整句子里。',object:'核查记录',code:'03'},
  {label:'社会解释与议题发现',micro:'哪些事实值得被连接？',title:'从事件通向结构',explain:'将零散遭遇置于制度与社会关系中，才能使报道不止于发生了什么。',object:'议题图谱',code:'04'},
  {label:'伦理责任与公共判断',micro:'不该发表什么，同样重要吗？',title:'有些决定不会留在成品上',explain:'取舍、保护和避免伤害也是报道的劳动。伦理判断越有效，有时越难在成品中被直接识别。',object:'伦理备忘',code:'05'}
];
export function abilityParticipation(d){
  const front=d.ability.filter(r=>r[0]==='前台能力').reduce((a,r)=>a+Number(r[2]),0);
  const core=d.ability.filter(r=>r[0]==='核心能力').reduce((a,r)=>a+Number(r[2]),0);
  if(front!==1467||core!==492)throw new Error('PAGE04 可见性分组统计不一致');
  return `<div class="ab-v34" id="ab-v34-experience">
  <section class="ab-v34-hero" aria-labelledby="ab-heading">
    <div class="ab-v34-side"><span class="ab-v34-volume">卷宗 / 04</span><span class="ab-v34-sidelabel">新闻劳动·研究档案</span><p>我们习惯评价一篇报道的成品，却很少看见它形成的过程。</p><div class="ab-v34-mark" aria-hidden="true">工作底稿<br>待核查</div></div>
    <div class="ab-v34-title"><p class="ab-v34-kicker">第四章 · 专业能力的可见性悖论</p><h2 id="ab-heading">一篇新闻背后，<br>有多少<span>看不见的劳动</span>？</h2><p class="ab-v34-deck">当写作、运营、内容生产成为公众最容易辨认的专业面孔，采访、核查、解释与伦理判断又在哪里？</p><div class="ab-v34-cue">向下翻阅，拆开这份“新闻成品” <span aria-hidden="true">↓</span></div></div>
    <figure class="ab-v34-photo"><img src="./assets/cinema-v2/workbench.webp" alt="AI辅助概念影像：桌面上铺着未完成的记录、录音设备与电脑，表现新闻生产过程" loading="lazy"><figcaption>新闻生产工作台 · AI辅助概念视觉，非研究现场影像</figcaption><span class="ab-v34-stamp" aria-hidden="true">内部工序<br>尚未公开</span></figure>
  </section>
  <section class="ab-v34-game" aria-labelledby="ab-v34-game-heading"><div class="ab-v34-headline"><div><span>档案实验 01 / 揭开生产过程</span><h3 id="ab-v34-game-heading">如果只看到成品，<br>我们遗漏了什么？</h3></div><p>点击底稿，揭开生产环节（概念演示）。</p></div>
   <div class="ab-v34-lab-grid">
    <div class="ab-v34-manuscript" data-v34-manuscript style="--revealed:0"><div class="ab-v34-paper-label">概念样稿 / 用于交互演示</div><div class="ab-v34-article"><span>概念稿 · 新闻成品</span><h4>一篇报道，<br>如何成为事实？</h4><p>写出来的只是最后一页。真正的劳动，藏在成稿之前。</p></div><div class="ab-v34-layer-curtain" aria-hidden="true"><span>揭开底稿，看见劳动</span></div><div class="ab-v34-ledger"><span>翻开的底稿</span><strong id="ab-v34-count">0 / 5</strong></div><div class="ab-v34-traces" id="ab-v34-traces" aria-live="polite">五份底稿待查。点击右侧工序，从任意一份开始。</div></div>
    <div class="ab-v34-game-panel"><div class="ab-v34-control-head"><strong>翻开一份工作底稿</strong><span>可按任意顺序阅读</span></div><div class="ab-v34-tabs" role="group" aria-label="新闻生产过程五份底稿">${units.map((u,i)=>`<button type="button" data-v34-layer="${i}" aria-pressed="false"><span>${u.code}</span><b>${u.label}</b><i aria-hidden="true">＋</i></button>`).join('')}</div><div class="ab-v34-reveal" id="ab-v34-reveal" aria-live="polite"><span>未打开的证据袋</span><h4>先点一份底稿。</h4><p>成品之外，还有采访、核查和责任判断。</p></div><div class="ab-v34-game-foot"><button type="button" data-v34-reset>合上全部底稿 ↺</button><span id="ab-v34-finish">已翻开 0 份</span></div></div>
   </div><div class="ab-v34-editor-note">编辑提示｜这些环节属于新闻生产的分析性拆解。当前研究归档只有“五类核心能力共492次”的聚合数量，不具备将492次拆分给每一工序的依据。</div>
  </section>
  <section class="ab-v34-guess" aria-labelledby="ab-v34-guess-title"><div class="ab-v34-guess-copy"><span>档案实验 02 / 估计可见性</span><h3 id="ab-v34-guess-title">哪些劳动，<br>最常被提起？</h3><p>猜一猜：前台技能占1,959次能力提及的多少？</p><div class="ab-v34-guess-small">这不是能力重要性的投票，也不是AI实际替代率。</div></div><div class="ab-v34-guess-tool"><label for="ab-v34-guess-slider">你的估计 <output id="ab-v34-guess-output" for="ab-v34-guess-slider">50%</output></label><input type="range" id="ab-v34-guess-slider" min="0" max="100" step="1" value="50"><div class="ab-v34-guess-scale"><span>0%</span><span>50%</span><span>100%</span></div><button type="button" data-v34-guess>揭开统计档案 <span aria-hidden="true">→</span></button><div class="ab-v34-guess-result" id="ab-v34-guess-result" hidden aria-live="polite"></div></div></section>
  <section class="ab-v34-flourish" aria-labelledby="ab-v34-flourish-heading"><div class="ab-v34-flourish-head"><span>数据图谱 / 可离线探索</span><h3 id="ab-v34-flourish-heading">谁的劳动，更容易被看见？</h3><p>1,959次能力提及，前台占1,467次。核心五类仅公布合计，不虚拆。</p></div><div class="ab-v34-flourish-grid"><div class="ab-v34-flourish-fallback"><span>能力提及 · 现场核对</span><div class="ab-v34-mini-data"><label>平台运营与商业传播 <b>743</b></label><i style="width:${(743/1959*100).toFixed(2)}%"></i><label>基础内容生产 <b>724</b></label><i style="width:${(724/1959*100).toFixed(2)}%"></i><label>五类核心能力合计 <b>492</b></label><i class="core" style="width:${(492/1959*100).toFixed(2)}%"></i></div><small>单位：能力提及次数。三个数值合计1,959。</small></div><div class="ab-v34-flourish-action v49-direct-ability">${flourishEmbed("ability")}</div></div><div class="ab-v34-flourish-source">来源：冻结能力编码汇总。上方为本地可交互图，全部数值可在<a href="./data/figures/ability_hierarchy.csv" download>汇总文件</a>中核对。</div></section>
  </div>`;
}
export function mountAbilityParticipation(root){
  const shell=root.querySelector('#ab-v34-experience');if(!shell)return ()=>{};
  let opened=new Set();const count=shell.querySelector('#ab-v34-count'),fin=shell.querySelector('#ab-v34-finish'),trace=shell.querySelector('#ab-v34-traces'),panel=shell.querySelector('#ab-v34-reveal'),manuscript=shell.querySelector('[data-v34-manuscript]');
  const draw=(i)=>{const x=units[i];opened.add(i);manuscript.style.setProperty('--revealed',opened.size);
    shell.querySelectorAll('[data-v34-layer]').forEach((el,n)=>{el.classList.toggle('visited',opened.has(n));el.classList.toggle('selected',i===n);el.setAttribute('aria-pressed',String(i===n))});
    count.textContent=`${opened.size} / 5`;fin.textContent=opened.size===5?'五份底稿均已翻开':`已翻开 ${opened.size} 份`;
    trace.innerHTML=[...opened].sort().map(n=>`<span>${esc(units[n].object)}</span>`).join('');
    panel.innerHTML=`<span>第${x.code}份底稿 / ${esc(x.object)}</span><h4>${esc(x.title)}</h4><strong>${esc(x.micro)}</strong><p>${esc(x.explain)}</p>${opened.size===5?'<div class="ab-v34-all-done">五份底稿已全部翻开。接下来，看看公众谈论这些劳动时，究竟最常提起什么。</div>':''}`;
  };
  const onClick=(e)=>{const tab=e.target.closest('[data-v34-layer]');if(tab){draw(Number(tab.dataset.v34Layer));return;}
    if(e.target.closest('[data-v34-reset]')){opened.clear();manuscript.style.setProperty('--revealed',0);count.textContent='0 / 5';fin.textContent='已翻开 0 份';trace.textContent='五份底稿待查。点击右侧工序，从任意一份开始。';panel.innerHTML='<span>未打开的证据袋</span><h4>先点一份底稿。</h4><p>成品之外，还有采访、核查和责任判断。</p>';shell.querySelectorAll('[data-v34-layer]').forEach(b=>{b.classList.remove('selected','visited');b.setAttribute('aria-pressed','false')});return;}
    if(e.target.closest('[data-v34-guess]')){const v=Number(shell.querySelector('#ab-v34-guess-slider').value),truth=1467/1959*100,dir=v<truth?'低于':v>truth?'高于':'接近';const result=shell.querySelector('#ab-v34-guess-result');result.hidden=false;result.innerHTML=`<div><span>你的估计</span><strong>${v}%</strong></div><div><span>实际提及占比</span><strong>74.9%</strong></div><p>你的估计${dir}实际占比 ${Math.abs(v-truth).toFixed(1)} 个百分点。前台技能被提及1,467次；核心能力492次。<a href="#ab-observe" data-v34-scroll="ab-observe">继续比较属性判断 ↗</a></p>`;return;}
    const jump=e.target.closest('[data-v34-scroll]');if(jump){e.preventDefault();root.querySelector('#'+jump.dataset.v34Scroll)?.scrollIntoView({behavior:document.body.classList.contains('motion-paused')?'auto':'smooth',block:'start'});}
  };
  const slider=shell.querySelector('#ab-v34-guess-slider');const update=()=>shell.querySelector('#ab-v34-guess-output').textContent=`${slider.value}%`;
  shell.addEventListener('click',onClick);slider.addEventListener('input',update);
  return ()=>{shell.removeEventListener('click',onClick);slider.removeEventListener('input',update)};
}
