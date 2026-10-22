// V4.9: offline representations reconstructed from verified local CSV aggregations.
// These are original SVG/CSS/JS interactions, not copied Flourish code.
export const flourishFigures={
 ability:{id:'30501030',project:'https://public.flourish.studio/visualisation/30501030/',data:'./data/figures/ability_hierarchy.csv'},
 relations:{id:'30501758',project:'https://public.flourish.studio/visualisation/30501758/',data:'./data/figures/evidence_relations.csv'}
};
const abilityRows=[['平台运营与商业传播',743,'front'],['基础内容生产',724,'front'],['五类核心能力合计',492,'core']];
const relations=[
 ['专业','公共价值','认可',51.2],['职业','公共价值','认可',50.6],['专业','身份情感','认可',50.5],['课程','专业知识与理论','认可',50.5],
 ['行业','反讽或玩梗','否定',87.1],['学科','无依据断言','否定',81.5],['课程','反讽或玩梗','否定',79.6],['行业','实习就业经历','否定',75.9],['职业','反讽或玩梗','否定',75.4]
];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function ability(){return `<div class="v49-local-chart v49-ability-chart" data-v49-kind="ability"><p class="v49-chart-intro">提及的是什么，不等于专业价值只剩什么。</p><div class="v49-summary-line"><strong>1,467 <small>前台</small></strong><span>74.9%</span><strong>492 <small>核心</small></strong></div><div class="v49-parts"><i style="width:74.9%"></i><i class="core" style="width:25.1%"></i></div><div class="v49-ability-rows">${abilityRows.map(([label,n,group],i)=>`<button type="button" data-v49-row="${i}" data-v49-value="${esc(label)}：${n}次，占1,959次能力提及的${(n/1959*100).toFixed(1)}%"><span>${esc(label)}</span><span class="v49-mini-track"><i class="${group}" style="--bar:${(n/1959*100).toFixed(3)}%"></i></span><b>${n}</b></button>`).join('')}</div><div class="v49-local-read" aria-live="polite">点击任一分类查看比例。核心五类仅有合计数，未拆分。</div><p class="v49-source">来源：冻结能力编码汇总。单位：能力提及次数，n=1,959。</p></div>`}
function relationsView(){return `<div class="v49-local-chart v49-relations-chart" data-v49-kind="relations"><p class="v49-chart-intro">同样评价一个专业，凭什么判断，往往决定争论的方向。</p><div class="v49-filter-row"><button type="button" data-v49-filter="all" aria-pressed="true">全部九组</button><button type="button" data-v49-filter="认可" aria-pressed="false">认可</button><button type="button" data-v49-filter="否定" aria-pressed="false">否定</button></div><div class="v49-relations-rows">${relations.map(([obj,basis,dir,p],i)=>`<button type="button" class="v49-relation-row" data-v49-dir="${dir}" data-v49-row="${i}" data-v49-value="${obj} × ${basis}：${dir}比例${p}%（该关系内的明确立场，非所有评论）。"><span>${esc(obj)} × ${esc(basis)}</span><i class="v49-rel-track"><i class="${dir==='认可'?'positive':'negative'}" style="--bar:${p}%"></i></i><b>${p}%</b><small>${dir}</small></button>`).join('')}</div><div class="v49-local-read" aria-live="polite">点选关系查看方向和比例，筛选可以在离线状态下工作。</div><p class="v49-source">来源：论文披露九组典型关系。部分关系的分母不同，不相加为总样本。</p></div>`}
export function flourishEmbed(key){const f=flourishFigures[key];if(!f)return '';return `<figure class="flourish-figure v49-rebuilt" data-flourish-figure="${key}"><div class="flourish-figure-head"><span>${key==='ability'?'专业能力的可见结构':'价值判断的九组关系'}</span><button type="button" data-v49-replay>重现图表 ↻</button></div>${key==='ability'?ability():relationsView()}<figcaption>离线可操作 · HTML / CSS / JavaScript 绘制，非第三方 iframe。</figcaption><div class="flourish-figure-links"><a href="${f.data}" download>下载原始汇总数据</a><a href="${f.project}" target="_blank" rel="noopener noreferrer">核对 Flourish 原项目 ↗</a></div></figure>`}
export function setupFlourish(){
 document.addEventListener('click',e=>{
  const filter=e.target.closest('[data-v49-filter]');if(filter){const chart=filter.closest('.v49-local-chart'),selected=filter.dataset.v49Filter;chart.querySelectorAll('[data-v49-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===filter)));chart.querySelectorAll('.v49-relation-row').forEach(r=>r.hidden=selected!=='all'&&r.dataset.v49Dir!==selected);return;}
  const row=e.target.closest('.v49-local-chart [data-v49-value]');if(row){const chart=row.closest('.v49-local-chart');chart.querySelectorAll('[data-v49-value]').forEach(x=>x.classList.toggle('active',x===row));chart.querySelector('.v49-local-read').textContent=row.dataset.v49Value;return;}
  const replay=e.target.closest('[data-v49-replay]');if(replay){const chart=replay.closest('.v49-rebuilt');chart.classList.remove('v49-motion');void chart.offsetWidth;chart.classList.add('v49-motion');return;}
 });
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('v49-motion');io.unobserve(e.target)}}),{threshold:.23});
 const inspect=()=>document.querySelectorAll('.v49-rebuilt:not([data-v49-observed])').forEach(el=>{el.dataset.v49Observed='1';io.observe(el)});
 new MutationObserver(inspect).observe(document.querySelector('#main')||document.body,{subtree:true,childList:true});inspect();
}
