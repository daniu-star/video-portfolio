import {escapeHTML as esc,fmt} from './charts.js';
import {publicGame,mountPublicGame} from './participatory-v3.js';
import {flourishEmbed} from './flourish.js';

const PUBLIC_OBJECTS=[
  {id:'专业',k:'对象·专业',lead:'当判断指向「专业」',sub:'公共价值能支持专业的社会意义，也会反过来要求专业兑现承诺。'},
  {id:'职业',k:'对象·职业',lead:'当判断指向「职业」',sub:'对于新闻工作是否值得继续，公共责任既是动力，也可能成为质问的依据。'},
  {id:'行业',k:'对象·行业',lead:'当判断指向「行业」',sub:'当讨论聚焦行业表现，公共承诺更频繁地被用来审视现实落差。'},
  {id:'能力',k:'对象·能力',lead:'当判断指向「能力」',sub:'核查、判断与社会解释等能力，与公共责任之间有更直接的连接。'},
  {id:'知识',k:'对象·知识',lead:'当判断指向「知识」',sub:'专业知识在讨论中也会被放到公共责任的尺度下评判。'},
  {id:'学科',k:'对象·学科',lead:'当判断指向「学科」',sub:'学科的理论价值并不自动转化为公众对现实新闻工作的认可。'},
  {id:'课程',k:'对象·课程',lead:'当判断指向「课程」',sub:'这一组记录较少，仅说明样本中的观察结果，不作稳定性推断。'},
  {id:'未明确',k:'对象·未明确',lead:'当评价对象未被指明',sub:'这些评论援引了公共价值，但编码未识别出清晰评价对象，不强行归入专业或行业。'}
];
const pullQuote={support:'他说这些过程需要记录',criticism:'如果新闻能做到“不简单的断章取义是基本素养”的话，新闻专业就不会这么没有市场了'};

function quotePanel(d,key,side){
  const record=d.comments.find(c=>c.id===d.quotes[key]);
  if(!record)return '<p>暂未找到对应原始评论。</p>';
  const notep=d.notes.find(n=>n.id===record.note);
  const support=side==='support';
  return `<article class="pv-witness pv-witness-${side}" data-pv-witness="${side}">
      <div class="pv-witness-top"><span class="pv-witness-index">${support?'01':'02'}</span><span>${support?'以公共理想支持':'以现实落差追责'}</span><span class="pv-witness-mark" aria-hidden="true">${support?'↗':'↘'}</span></div>
      <div class="pv-witness-body"><span class="pv-speaker-rule" aria-hidden="true"></span><blockquote>“${esc(pullQuote[side])}”</blockquote>
        <p>${support?'报道价值被安放在真实的人与被忽略的生活之中。':'专业判断被放回新闻实践：有没有认真求证，而不是断章取义？'}</p></div>
      <div class="pv-witness-footer"><span>匿名评论 <strong>${esc(record.id)}</strong></span><button type="button" class="pv-expand" data-pv-expand="${side}" aria-expanded="false" aria-controls="pv-full-${side}">展开评论原文 <span aria-hidden="true">＋</span></button></div>
      <div class="pv-full" id="pv-full-${side}" hidden><p class="pv-full-label">原文核对</p><blockquote>${esc(record.text)}</blockquote><div class="pv-full-meta">${esc(record.date||'日期未记录')} · ${fmt(record.likes)}赞（采集快照） · 所属笔记 ${esc(notep?.id||record.note)}</div><a href="#/lab?q=${encodeURIComponent(record.note)}">查看所属笔记及相关评论 ↗</a></div>
    </article>`;
}
function getRows(d){
 const edges=d.network?.edges||[];
 return PUBLIC_OBJECTS.map(item=>{
  const e=edges.find(r=>r.source===item.k&&r.target==='依据·公共价值');
  if(!e)return null;
  return {...item,n:e.n,pos:e.positive,neg:e.negative,neutral:e.neutral,unknown:e.unknown,
    pct:e.positive+e.negative?e.positive/(e.positive+e.negative)*100:0};
 }).filter(Boolean);
}
function plot(rows,idx){
 const r=rows[idx]||rows[0];if(!r)return '';
 const max=Math.max(1,r.pos+r.neg),positive=r.pos/max*100,negative=r.neg/max*100;
 return `<div class="pv-chart-reading" aria-live="polite"><p class="pv-chart-lead">${esc(r.lead)}</p><h3>${esc(r.id)} <span>× 公共价值</span></h3><p class="pv-chart-sub">${esc(r.sub)}</p></div>
    <div class="pv-chart-stage" role="img" aria-label="${esc(r.id)}与公共价值共现记录中，认可${r.pos}条、否定${r.neg}条、中性${r.neutral}条、无法判断${r.unknown}条。">
      <div class="pv-chart-captions"><span>否定 ${fmt(r.neg)} 条</span><span>认可 ${fmt(r.pos)} 条</span></div>
      <div class="pv-divergence"><div class="pv-negative-half"><div style="width:${negative.toFixed(3)}%" class="pv-negative-fill"></div></div><span class="pv-centerline" aria-hidden="true"></span><div class="pv-positive-half"><div style="width:${positive.toFixed(3)}%" class="pv-positive-fill"></div></div></div>
      <div class="pv-percentages"><div><strong>${(100-r.pct).toFixed(1)}<small>%</small></strong><span>明确立场中的否定</span></div><div><strong>${r.pct.toFixed(1)}<small>%</small></strong><span>明确立场中的认可</span></div></div>
    </div>
    <div class="pv-chart-footer"><div><span class="pv-small-number">${fmt(r.n)}</span> 条共现编码记录</div><p>另有 ${fmt(r.neutral)} 条中性、${fmt(r.unknown)} 条无法判断；上述百分比的分母为 ${fmt(r.pos+r.neg)} 条明确认可或否定记录。</p></div>`;
}
export function publicSection(d){
 const rows=getRows(d);const count=rows.reduce((n,r)=>n+r.n,0);
 return `<section class="reading-section public-tone pv-section" id="public" aria-labelledby="pv-title">
  <header class="pv-intro pv-enter pv-v3-intro">
    <div class="pv-v3-rail"><strong>03</strong><span>公共价值</span><small>第三份调查档案</small><i aria-hidden="true"></i></div>
    <div class="pv-v3-heading"><p class="pv-ordinal">同一标准 · 两种判断</p><h2 id="pv-title">人们仍然期待新闻。<br><em>也正因如此，</em><br>才会质问它。</h2><div class="pv-opening"><p>同一份期待，也能生出两种判断。</p><span class="pv-down">向下阅读证词 <b aria-hidden="true">↓</b></span></div></div>
    <figure class="pv-v3-photo"><img src="./assets/archive-v3/public-street-scene.webp" alt="AI辅助创作的公共街头概念图像，非真实报道照片" loading="lazy"><figcaption>街头与公共生活 / AI辅助概念影像</figcaption></figure>
    <span class="pv-v3-pencil" aria-hidden="true">谁来证明<br>那份承诺？</span>
  </header>
  <div class="pv-promise pv-enter"><span class="pv-promise-side">一种共同的要求</span><div class="pv-promise-main"><p>新闻不只是生产内容。</p><strong>它还应当记录事实、理解社会，并对公共生活负责。</strong></div><span class="pv-promise-foot">以下是两条独立评论的不同评价路径</span></div>
  <div class="pv-duet-head pv-enter"><div><span class="pv-caption">从同一标准出发</span><h3>理想是依据。<br>落差也是证据。</h3></div><p>两份证词，同一把公共尺度。</p></div>
  <div class="pv-v3-testimony-rule"><span>证词 A</span><strong>仍然有人相信：新闻值得有人去做。</strong></div><div class="pv-duet pv-enter">${quotePanel(d,'public_support','support')}<div class="pv-middle-rule" aria-hidden="true"><span>同一份公共期待</span></div>${quotePanel(d,'public_criticism','criticism')}</div>
  <div class="pv-bridge pv-enter"><span class="pv-bridge-index">问题不在于谁更有理想</span><p>真正的分歧，在于<strong>公共责任如何被兑现，又该由谁证明。</strong></p><span class="pv-bridge-line" aria-hidden="true"></span></div>
  ${publicGame(d)}
  <div class="pv-evidence-layout pv-enter" id="pv-explore">
    <div class="pv-evidence-head"><span class="pv-caption">从两条评论走向编码数据</span><h3>当讨论对象改变，<br>这把尺子会怎样倾斜？</h3><p>切换对象，看认可与否定如何分布。</p><div class="pv-object-list" role="group" aria-label="选择评价对象">${rows.map((r,i)=>`<button type="button" class="pv-object ${i===0?'active':''}" data-pv-object="${i}" aria-pressed="${i===0}"><span>${esc(r.id)}</span><i aria-hidden="true">↗</i></button>`).join('')}</div></div>
    <div class="pv-evidence-chart"><div class="pv-chart-top"><span>评价对象 × 公共价值</span><span>选择左侧分类进行比较</span></div><div class="pv-plot" id="pv-plot">${plot(rows,0)}</div><div class="pv-chart-source">数据：终版论文第四节（四）及本站聚合编码关系表。每组计数仅对应该“对象—依据”共现关系；不同组可能涉及相同评论，不宜相加为独立人数。<a href="./data/figures/v2/public-value-evidence.csv" download>下载关系数据 ↓</a></div></div>
  </div>
  <details class="pv-v3-flourish-more"><summary>核对九组典型评价关系 <span> ↗</span></summary><div class="v49-pv-relation-offline">${flourishEmbed('relations')}</div></details>
  <aside class="pv-v3-flourish-status"><div><span>数据核对</span><h3>八类对象，使用同一套判断依据。</h3><p>选择对象，下方图表即时变化。</p></div><a href="https://app.flourish.studio/visualisation/30640740/edit" target="_blank" rel="noopener noreferrer">查看图表工程 ↗</a></aside>
  <footer class="pv-ending pv-enter"><span class="pv-caption">从宣称到实践</span><p>公共性不是免检证明。<br>它必须在<strong>采访、核查与判断中兑现。</strong></p><a href="#/story?section=network">继续阅读：为何证明如此不对称 <span aria-hidden="true">↗</span></a></footer>
</section>`;
}
export function mountPublic(root,d){
 const scope=root.querySelector('.pv-section');if(!scope)return ()=>{};
 const rows=getRows(d);
 const disposeGame=mountPublicGame(scope,d);
 const click=e=>{
  const expand=e.target.closest('[data-pv-expand]');
  if(expand){const side=expand.dataset.pvExpand,details=scope.querySelector(`#pv-full-${side}`);if(!details)return;
   const shown=expand.getAttribute('aria-expanded')==='true';expand.setAttribute('aria-expanded',String(!shown));details.hidden=shown;
   expand.innerHTML=`${shown?'展开评论原文 <span aria-hidden="true">＋</span>':'收起评论原文 <span aria-hidden="true">－</span>'}`;return;}
  const btn=e.target.closest('[data-pv-object]');if(!btn)return;
  const idx=Number(btn.dataset.pvObject);if(!Number.isInteger(idx)||!rows[idx])return;
  scope.querySelectorAll('[data-pv-object]').forEach(x=>{x.classList.toggle('active',x===btn);x.setAttribute('aria-pressed',String(x===btn));});
  const plotTarget=scope.querySelector('#pv-plot');plotTarget.innerHTML=plot(rows,idx);plotTarget.classList.remove('pv-changed');void plotTarget.offsetWidth;plotTarget.classList.add('pv-changed');
 };
 scope.addEventListener('click',click);
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('pv-visible')}),{threshold:.1,rootMargin:'0px 0px -5% 0px'});
 scope.querySelectorAll('.pv-enter').forEach(el=>observer.observe(el));
 return ()=>{disposeGame();scope.removeEventListener('click',click);observer.disconnect()};
}
