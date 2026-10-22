/* V3.3 · 参与式调查组件：由既有矩阵计算，不上传或保存读者回答。 */
import {escapeHTML as esc} from './charts.js';

const FRAME_ORDER=['课程知识','能力训练','AI平台','就业职业','公共价值','专业身份','升学报考','未识别'];
const short=s=>s==='AI平台'?'AI与平台':s;
const fmt=n=>Number(n).toLocaleString('zh-CN');
const pct=(a,b)=>b?(a/b*100).toFixed(1):'0.0';
const publicOrder=['专业','职业','行业','能力','知识','学科','课程','未明确'];
const publicNotes={
  '专业':'在评价专业时，公共价值既是一份肯定，也是对培养结果的质询。',
  '职业':'职业是否值得继续，与劳动的公共责任被一同衡量。',
  '行业':'行业现实与公共承诺之间的距离，可能强化批评。',
  '能力':'这一组共现记录较少，不能把较高比例直接推广至所有评论。',
  '知识':'对于知识的判断，并不等同于对整个专业的判断。',
  '学科':'理论的公共意义与现实新闻实践的表现并不完全相同。',
  '课程':'这一组样本很小，比例容易波动，优先查看原始计数。',
  '未明确':'编码没有识别清楚评价对象，不能把它推断为其他类别。'
};

export function employmentGame(d){
  return `<section class="participatory participatory-em" id="em-reader-lab" aria-labelledby="em-reader-title">
    <div class="pp-eyebrow"><span>参与调查 · 档案练习 02-A</span><span>操作约 30 秒 / 不保存答案</span></div>
    <div class="pp-head"><div><h3 id="em-reader-title">假如这篇笔记进入评论区，<br><em>话题会落到哪里？</em></h3><p>先作出一个猜测，再揭开真实框架配对。这里没有对人的评判，只有关于样本分布的观察。</p></div><div class="pp-side-note" aria-hidden="true">先推测，<br>再核对。</div></div>
    <div class="pp-workspace pp-em-grid">
      <div class="pp-input-paper"><span class="pp-index">第一步 / 选择笔记起点</span><label for="pp-em-origin">选择一组笔记的起点议题</label><select id="pp-em-origin" class="pp-select">${FRAME_ORDER.map(f=>`<option value="${esc(f)}">${esc(short(f))}</option>`).join('')}</select><p class="pp-micro">这里汇总的是同类笔记，而非某篇虚构个案。</p><span class="pp-index pp-second">第二步 / 猜评论区主导议题</span><div class="pp-choice-grid" role="group" aria-label="选择你猜测的评论区主导框架">${FRAME_ORDER.map(f=>`<button type="button" class="pp-choice" data-pp-em-guess="${esc(f)}" aria-pressed="false">${esc(short(f))}</button>`).join('')}</div><button class="pp-primary" type="button" data-pp-em-reveal disabled>打开配对档案 <span aria-hidden="true">↗</span></button></div>
      <div class="pp-result-paper"><div class="pp-result-top"><span>档案回执 · 696篇配对样本</span><span class="pp-stamp" aria-hidden="true">未经揭示</span></div><div data-pp-em-result aria-live="polite"><div class="pp-blank"><b>？</b><p>先选起点议题，再猜评论区最常谈什么。</p><span>揭晓后查看各类终点的实际篇数。</span></div></div></div>
    </div>
    <div class="pp-foot"><span>口径：笔记起点与评论区主导框架的横截面配对，绝非同一话题随时间演变。</span><button type="button" data-pp-em-scroll>直接核对全部47条流向 ↓</button></div>
  </section>`;
}

export function mountEmploymentGame(scope,d){
  const host=scope.querySelector('.participatory-em');if(!host)return ()=>{};
  const select=host.querySelector('#pp-em-origin'), guesses=[...host.querySelectorAll('[data-pp-em-guess]')];
  const reveal=host.querySelector('[data-pp-em-reveal]'), result=host.querySelector('[data-pp-em-result]'), stamp=host.querySelector('.pp-stamp');
  let prediction=null;const inspected=new Set();
  const reset=()=>{prediction=null;guesses.forEach(b=>{b.setAttribute('aria-pressed','false');b.classList.remove('is-selected')});reveal.disabled=true;reveal.textContent='打开配对档案 ↗';stamp.textContent='未经揭示';stamp.classList.remove('is-revealed');result.innerHTML='<div class="pp-blank"><b>？</b><p>档案尚未揭开。</p><span>请选择上方任一终点，再点击“揭开”。</span></div>'};
  const onChange=e=>{if(e.target===select)reset()};
  const onClick=e=>{
    const guess=e.target.closest('[data-pp-em-guess]');
    if(guess&&host.contains(guess)){prediction=guess.dataset.ppEmGuess;guesses.forEach(b=>{let on=b===guess;b.setAttribute('aria-pressed',String(on));b.classList.toggle('is-selected',on)});reveal.disabled=false;return}
    if(e.target.closest('[data-pp-em-reveal]')){
      if(!prediction)return;
      const origin=select.value, pairs=d.flows.filter(f=>f.source===origin);
      const total=pairs.reduce((n,f)=>n+f.value,0), byTarget=FRAME_ORDER.map(target=>({target,n:pairs.find(f=>f.target===target)?.value||0})).sort((a,b)=>b.n-a.n);
      const top=byTarget[0], predicted=byTarget.find(x=>x.target===prediction), job=byTarget.find(x=>x.target==='就业职业');
      inspected.add(origin);stamp.textContent='已揭示';stamp.classList.add('is-revealed');
      result.innerHTML=`<div class="pp-revealed"><p class="pp-result-lead">起点「${esc(short(origin))}」共有 <b>${fmt(total)}</b> 篇笔记</p><h4>最多的评论区终点：<em>${esc(short(top.target))}</em></h4><p class="pp-result-compare">你预测的是「${esc(short(prediction))}」：${fmt(predicted.n)} 篇（${pct(predicted.n,total)}%）。${prediction===top.target?'这与你看到的最高频终点一致。':'实际最高频终点为「'+esc(short(top.target))+'」。'}${top.n===byTarget[1]?.n?'（最高频存在并列。）':''}</p>
      <div class="pp-hbars">${byTarget.filter(x=>x.n).map(x=>`<div class="pp-hrow"><span>${esc(short(x.target))}</span><div class="pp-htrack"><i style="--pp-r:${pct(x.n,total)}%" class="${x.target==='就业职业'?'is-job':''}"></i></div><strong>${x.n} <small>篇</small></strong></div>`).join('')}</div><p class="pp-result-footnote">其中以就业为终点的有${fmt(job.n)}篇（${pct(job.n,total)}%）。「未识别」保持原分类，不强行解释其内容。</p><div class="pp-result-actions"><button data-pp-em-again type="button">换个起点继续调查 ↻</button><span>已经观察 ${inspected.size} / ${FRAME_ORDER.length} 类起点</span></div></div>`;
      reveal.disabled=true;
    }
    if(e.target.closest('[data-pp-em-scroll]')){scope.querySelector('#em-explore')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return}
    if(e.target.closest('[data-pp-em-again]')){const next=FRAME_ORDER[(FRAME_ORDER.indexOf(select.value)+1)%FRAME_ORDER.length];select.value=next;reset();select.focus()}
  };
  host.addEventListener('click',onClick);host.addEventListener('change',onChange);
  return ()=>{host.removeEventListener('click',onClick);host.removeEventListener('change',onChange)};
}

export function publicGame(d){
  const objects=publicOrder.filter(id=>(d.network?.edges||[]).some(r=>r.source==='对象·'+id&&r.target==='依据·公共价值'));
  return `<section class="participatory participatory-pv" id="pv-reader-lab" aria-labelledby="pv-reader-title">
   <div class="pp-eyebrow"><span>参与调查 · 档案练习 03-A</span><span>先估计，再比较 / 不保存答案</span></div>
   <div class="pp-head"><div><h3 id="pv-reader-title">同一条“公共责任”的尺度，<br><em>会偏向肯定还是质询？</em></h3><p>请选择评价对象。先猜测：在明确表达认可或否定的相关记录中，认可所占的比例是多少？</p></div><div class="pp-side-note pp-side-note-green" aria-hidden="true">你会<br>如何估计？</div></div>
   <div class="pp-workspace pp-pv-grid"><div class="pp-input-paper"><span class="pp-index">第一步 / 改变评价对象</span><div class="pp-tabs" role="group" aria-label="选择进行公共价值判读的评价对象">${objects.map((s,i)=>`<button type="button" class="pp-tab ${i===0?'is-selected':''}" data-pp-pv-object="${esc(s)}" aria-pressed="${i===0}">${esc(s)}</button>`).join('')}</div><span class="pp-index pp-second">第二步 / 留下一次推测</span><label class="pp-slider-label" for="pp-pv-guess">你认为明确立场中，有多少比例是认可？ <output id="pp-pv-value" for="pp-pv-guess">50%</output></label><input class="pp-range" id="pp-pv-guess" type="range" min="0" max="100" step="5" value="50" aria-label="预测的认可比例"><div class="pp-slider-caps"><span>全部否定</span><span>各占一半</span><span>全部认可</span></div><button class="pp-primary" type="button" data-pp-pv-reveal>揭开统计记录 <span aria-hidden="true">↗</span></button></div>
   <div class="pp-result-paper"><div class="pp-result-top"><span>调查核对 · 对象 × 公共价值</span><span class="pp-stamp" aria-hidden="true">等待读取</span></div><div data-pp-pv-result aria-live="polite"><div class="pp-blank"><b>？</b><p>你估计的比例可能与实际分布相近，也可能有差距。</p><span>这只是一个引导读者辨认“分母”的练习，不是态度测试。</span></div></div></div></div>
   <div class="pp-foot"><span>百分比仅对该对象下的明确认可／否定记录计算；不代表所有平台用户或公众。</span><button type="button" data-pp-pv-scroll>继续查看完整评价对象图 ↓</button></div>
  </section>`;
}

export function mountPublicGame(scope,d){
  const host=scope.querySelector('.participatory-pv');if(!host)return ()=>{};
  const btns=[...host.querySelectorAll('[data-pp-pv-object]')],range=host.querySelector('#pp-pv-guess'),out=host.querySelector('#pp-pv-value'),result=host.querySelector('[data-pp-pv-result]'),stamp=host.querySelector('.pp-stamp');
  let object=btns[0]?.dataset.ppPvObject||'专业';
  const drawBlank=()=>{stamp.textContent='等待读取';stamp.classList.remove('is-revealed');result.innerHTML='<div class="pp-blank"><b>？</b><p>档案尚未展开。请留下你的估计。</p><span>我们比较的是同一依据下、不同评价对象的记录。</span></div>'};
  const onInput=()=>{out.value=range.value+'%';out.textContent=range.value+'%'};
  const onClick=e=>{
    const b=e.target.closest('[data-pp-pv-object]');if(b&&host.contains(b)){object=b.dataset.ppPvObject;btns.forEach(x=>{const is=x===b;x.classList.toggle('is-selected',is);x.setAttribute('aria-pressed',String(is))});drawBlank();return}
    if(e.target.closest('[data-pp-pv-reveal]')){
      const edge=d.network.edges.find(r=>r.source==='对象·'+object&&r.target==='依据·公共价值');if(!edge)return;
      const total=edge.positive+edge.negative,rate=total?edge.positive/total*100:0,guess=Number(range.value);stamp.textContent='已核对';stamp.classList.add('is-revealed');
      result.innerHTML=`<div class="pp-revealed pp-pv-reveal"><p class="pp-result-lead">${esc(object)} × 公共价值：<b>${fmt(edge.n)}</b> 条共现记录</p><h4>明确立场的认可比例 <em>${rate.toFixed(1)}%</em></h4><div class="pp-percent-ruler"><i style="width:${rate.toFixed(2)}%"></i><span style="left:${guess}%" title="你的估计"></span></div><div class="pp-ruler-labels"><span><i></i> 实际认可：${rate.toFixed(1)}%</span><span>│ 你的估计：${guess}%</span></div><p class="pp-result-compare">认可 <strong>${fmt(edge.positive)}</strong> 条；否定 <strong>${fmt(edge.negative)}</strong> 条。另有中性 ${fmt(edge.neutral)} 条、无法判断 ${fmt(edge.unknown)} 条，未纳入此比例分母（${fmt(total)} 条）。</p><p class="pp-result-footnote">${esc(publicNotes[object]||'')}${edge.n<70?' 请特别注意该组样本数较小。':''}</p><div class="pp-result-actions"><button type="button" data-pp-pv-source>到完整统计图核对 →</button><span>你与记录相差 ${Math.abs(guess-rate).toFixed(1)} 个百分点</span></div></div>`;
      // 与原来的八组对象切换图联动，不复制第二份独立统计模型。
      const linked=[...scope.querySelectorAll('[data-pv-object]')].find(x=>x.textContent.trim()===object);linked?.click();return;
    }
    if(e.target.closest('[data-pp-pv-source],[data-pp-pv-scroll]'))scope.querySelector('#pv-explore')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  };
  host.addEventListener('click',onClick);host.addEventListener('input',onInput);return ()=>{host.removeEventListener('click',onClick);host.removeEventListener('input',onInput)};
}
