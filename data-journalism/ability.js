import {abilityParticipation,mountAbilityParticipation} from './ability-participation-v34.js';
/* PAGE-04 — source-backed ability visibility narrative. No aggregate is treated as a participant count. */
import {escapeHTML as esc,fmt} from './charts.js';

const viewLabels=['谁首先被看见','多少判断说得明确','判断落向哪里'];
const attributes=['跨职业迁移','大学通用','AI可替代','新闻专业独特','AI辅助强化'];
const colors=['#d6b17a','#9dbdb2','#bf8672','#719992','#b3a6c6'];
function extract(d){
  const front=d.ability.filter(r=>r[0]==='前台能力');
  const frontTotal=front.reduce((a,r)=>a+Number(r[2]),0);
  const core=d.ability.filter(r=>r[0]==='核心能力').reduce((a,r)=>a+Number(r[2]),0);
  const total=frontTotal+core;
  const attr=new Map(d.attributes.map(r=>[r[0],Number(r[1])]));
  const explicit=[...attr.values()].reduce((a,b)=>a+b,0);
  // 52/5 is the published foreground/core cross-tab: the two groups partition the 57 explicit judgments.
  const frontExplicit=52,coreExplicit=5;
  const odds=(frontExplicit/(frontTotal-frontExplicit))/(coreExplicit/(core-coreExplicit));
  const ai=attr.get('AI可替代')||0;
  if(total!==1959||frontTotal!==1467||core!==492||explicit!==57||ai!==9||
     frontExplicit+coreExplicit!==explicit||Math.abs(odds-3.58)>.02){
    throw new Error('能力章节统计与来源版本不符，拒绝渲染预设结论');
  }
  return {front,frontTotal,core,total,attr,explicit,unspecified:total-explicit,frontExplicit,coreExplicit,ai,odds};
}
const percent=(a,b)=>(100*a/b).toFixed(1);
function showStage(s,i){
  if(i===0){return `<div class="ab-stage-stage ab-stage-visibility">
    <div class="ab-chart-head"><span>按能力被提及的次数分组</span><strong>n = ${fmt(s.total)}</strong></div>
    <div class="ab-major"><strong>${percent(s.frontTotal,s.total)}<small>%</small></strong><p>最先进入公众视野的，<br>往往是<strong>前台技能。</strong></p></div>
    <div class="ab-longbar" role="img" aria-label="前台能力${s.frontTotal}次，占${percent(s.frontTotal,s.total)}%；核心能力${s.core}次，占${percent(s.core,s.total)}%"><span style="width:${percent(s.frontTotal,s.total)}%" class="ab-fill-front"></span><span style="width:${percent(s.core,s.total)}%" class="ab-fill-core"></span></div>
    <div class="ab-bar-key"><div><i class="ab-dot-front"></i><span>前台技能</span><b>${fmt(s.frontTotal)}</b></div><div><i class="ab-dot-core"></i><span>核心能力</span><b>${fmt(s.core)}</b></div></div>
    <div class="ab-mini-bars" aria-label="前台两类能力的具体次数">${s.front.map(r=>`<div class="ab-mini-row"><span>${esc(r[1])}</span><div><i style="width:${percent(r[2],s.frontTotal)}%"></i></div><b>${fmt(r[2])}</b></div>`).join('')}</div>
    <p class="ab-board-note">核心能力由五类合并为 492 次；这一归档没有披露各子类单独数量，不进行推算。</p>
  </div>`;}
  if(i===1){return `<div class="ab-stage-stage ab-stage-unknown">
    <div class="ab-chart-head"><span>是否对能力属性作出明确判断</span><strong>n = ${fmt(s.total)}</strong></div>
    <div class="ab-major"><strong>${percent(s.unspecified,s.total)}<small>%</small></strong><p>谈起一项能力，<br>却<strong>没有说明它属于谁。</strong></p></div>
    <div class="ab-longbar ab-statusbar" role="img" aria-label="${s.unspecified}次未明确判断能力属性；${s.explicit}次明确判断，分别占${percent(s.unspecified,s.total)}%和${percent(s.explicit,s.total)}%"><span class="ab-fill-unspecified" style="width:${percent(s.unspecified,s.total)}%"></span><span class="ab-fill-explicit" style="width:${percent(s.explicit,s.total)}%"></span></div>
    <div class="ab-stat-pair"><div><small>没有明确属性</small><strong>${fmt(s.unspecified)}</strong><span>${percent(s.unspecified,s.total)}%</span></div><div><small>明确说明属性</small><strong>${fmt(s.explicit)}</strong><span>${percent(s.explicit,s.total)}%</span></div></div>
    <p class="ab-board-note">“未明确”表示评论没有给出能力属性判断，并不意味着否认能力的存在或价值。</p>
  </div>`;}
  return `<div class="ab-stage-stage ab-stage-attribution">
    <div class="ab-chart-head"><span>明确属性判断出现在哪一组能力上</span><strong>n = ${fmt(s.total)}</strong></div>
    <div class="ab-major"><strong>${s.odds.toFixed(2)}<small>倍</small></strong><p>前台技能被明确归类的<strong>优势比</strong><br>约为核心能力的 3.58 倍。</p></div>
    <div class="ab-compare-head">同一尺度：各自组内被明确判断的比例</div>
    <div class="ab-rate-row"><div><span>前台技能</span><b>${s.frontExplicit} / ${fmt(s.frontTotal)}</b></div><div class="ab-rate-track"><i class="ab-rate-front" style="width:${percent(s.frontExplicit,s.frontTotal)}%"></i></div><em>${(s.frontExplicit/s.frontTotal*100).toFixed(2)}%</em></div>
    <div class="ab-rate-row"><div><span>核心能力</span><b>${s.coreExplicit} / ${fmt(s.core)}</b></div><div class="ab-rate-track"><i class="ab-rate-core" style="width:${percent(s.coreExplicit,s.core)}%"></i></div><em>${(s.coreExplicit/s.core*100).toFixed(2)}%</em></div>
    <p class="ab-board-note">Fisher 精确检验 p = 0.0028。这里衡量的是评论中“是否作出明确判断”，不是专业能力的真实质量或人工智能的替代概率。</p>
  </div>`;
}
function quote(d){
  const id=d.quotes.ai,comment=d.comments.find(c=>c.id===id);
  if(!comment)return `<p>对应匿名评论未包含在本次研究归档中。</p>`;
  const note=d.notes.find(n=>n.id===comment.note);
  return `<div class="ab-quote-inner"><div class="ab-quote-meta"><span>一条评论里的职业焦虑</span><span>匿名评论 ${esc(comment.id)}</span></div>
    <blockquote>“我大学主攻文案，出来发现文案用不着，AI就行。”</blockquote>
    <p>这条评论将学过的文案技能、求职经验与技术替代联系在一起，却无法回答采访、核查与公共判断能否被取代。</p>
    <button type="button" data-ab-original aria-expanded="false" aria-controls="ab-quote-original">核对评论全文 <span aria-hidden="true">＋</span></button>
    <div class="ab-quote-original" id="ab-quote-original" hidden><p>${esc(comment.text)}</p><small>采集快照 ${fmt(comment.likes)} 赞 · 所属笔记 ${esc(note?.id||comment.note)} · ${esc(comment.date||'日期未记录')}</small><a href="#/lab?q=${encodeURIComponent(comment.note)}">查看所属笔记 ↗</a></div>
  </div>`;
}
export function abilitySection(d){
  const s=extract(d);
  return `<section class="reading-section ab-section ab-v34-root" id="ability" aria-labelledby="ab-heading" data-ab-step="0">
   ${abilityParticipation(d)}
   <div class="ab-main" id="ab-observe">
    <div class="ab-steps" aria-label="能力可见性的三个研究证据">
      <article class="ab-step is-active" data-ab-observe="0"><span class="ab-num">01 / 被提及</span><h3>最响亮的声音，<br>在专业的前台。</h3><p>写作与运营，被反复看见。</p><button type="button" data-ab-select="0" aria-pressed="true">查看能力分布 <span aria-hidden="true">↗</span></button></article>
      <article class="ab-step" data-ab-observe="1"><span class="ab-num">02 / 被归属</span><h3>被谈论，<br>不等于被认出。</h3><p>${fmt(s.unspecified)} 次提及，没有交代能力归属。</p><button type="button" data-ab-select="1" aria-pressed="false">查看属性缺口 <span aria-hidden="true">↗</span></button></article>
      <article class="ab-step" data-ab-observe="2"><span class="ab-num">03 / 被判断</span><h3>容易被归类的技能，<br>也更易遭到替代质疑。</h3><p>9次AI可替代判断，全部指向前台。</p><button type="button" data-ab-select="2" aria-pressed="false">比较判断差异 <span aria-hidden="true">↗</span></button></article>
    </div>
    <div class="ab-board-column"><div class="ab-board" role="region" aria-label="能力可见性数据图表">
       <div class="ab-board-top"><div><span>能力如何被看见</span><strong id="ab-board-title">${viewLabels[0]}</strong></div><span class="ab-slide-indicator" id="ab-slide-indicator">01 / 03</span></div>
       <div class="ab-pips" role="group" aria-label="选择数据视角">${viewLabels.map((label,i)=>`<button type="button" data-ab-select="${i}" aria-label="第${i+1}步：${label}" aria-pressed="${i===0?'true':'false'}" class="${i===0?'active':''}">${String(i+1).padStart(2,'0')}</button>`).join('')}</div>
       <div class="ab-board-graphic" id="ab-board-graphic" aria-live="polite">${showStage(s,0)}</div>
       <div class="ab-board-footer"><span>研究样本 · 已编码能力提及</span><a href="#/methods">方法与边界 ↗</a></div>
     </div></div>
   </div>
   <section class="ab-attribute-detail" aria-labelledby="ab-attr-heading"><div class="ab-detail-head"><span>57 次明确判断的内部构成</span><h3 id="ab-attr-heading">被说清楚的，<br>究竟是什么？</h3><p>下面五类均是评论中的能力属性判断，合计 57 次。它们并不等于专业的客观能力结构。</p></div>
    <div class="ab-detail-chart"><div class="ab-attr-segments" role="img" aria-label="跨职业迁移19次，大学通用16次，AI可替代9次，新闻专业独特8次，AI辅助强化5次">${attributes.map((label,i)=>`<div style="width:${percent(s.attr.get(label),s.explicit)}%;background:${colors[i]}" title="${label} ${s.attr.get(label)}次"></div>`).join('')}</div>
     <div class="ab-attr-list">${attributes.map((label,i)=>`<div><i style="background:${colors[i]}"></i><span>${label}</span><b>${s.attr.get(label)} <small>次</small></b></div>`).join('')}</div>
     <p class="ab-detail-emphasis"><strong>${s.ai} / ${s.ai}</strong><span>所有明确的 AI 可替代判断，<br>都出现在前台技能组。</span></p>
    </div></section>
   <section class="ab-voice" aria-labelledby="ab-voice-heading"><div class="ab-voice-label" id="ab-voice-heading">从数字回到真实评论</div>${quote(d)}</section>
   <footer class="ab-conclusion"><span>教育必须回答的问题</span><h3>如果新闻教育只展示作品，<br>谁来证明作品背后的判断？</h3><p>采访如何建立信任，核查如何排除错误，社会解释怎样穿透表象，伦理抉择如何作出——要证明的，是能力如何形成。</p>
    <div class="ab-source"><p><b>数据：</b>终版论文《可见性悖论》章节及其能力编码汇总。<b>范围：</b>1,959 次显性能力提及；57 次明确属性判断。<b>处理：</b>前台两类与核心五类聚合，比例按各自注明的分母计算。不能从这些频次推断社会总体认知。</p><div><a href="./data/figures/v2/ability.csv" download>下载能力汇总 ↓</a><a href="./data/figures/v2/ability-judgments.csv" download>下载属性与分组统计 ↓</a><a href="#/methods">查看研究方法 ↗</a></div></div>
   </footer>
  </section>`;
}
export function mountAbility(root,d){
 const section=root.querySelector('.ab-section');if(!section)return ()=>{};
 const disposeParticipation=mountAbilityParticipation(root);
 const s=extract(d);let selected=0,manualTop=null;
 function select(index){
  if(index<0||index>2||index===selected)return;
  selected=index;section.dataset.abStep=String(index);
  section.querySelector('#ab-board-title').textContent=viewLabels[index];
  section.querySelector('#ab-slide-indicator').textContent=`${String(index+1).padStart(2,'0')} / 03`;
  const graphic=section.querySelector('#ab-board-graphic');graphic.innerHTML=showStage(s,index);
  graphic.classList.remove('ab-change');void graphic.offsetWidth;graphic.classList.add('ab-change');
  section.querySelectorAll('[data-ab-select]').forEach(b=>{const on=Number(b.dataset.abSelect)===index;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
  section.querySelectorAll('[data-ab-observe]').forEach(e=>e.classList.toggle('is-active',Number(e.dataset.abObserve)===index));
 }
 const click=e=>{
  const selectButton=e.target.closest('[data-ab-select]');if(selectButton&&section.contains(selectButton)){manualTop=window.scrollY;select(Number(selectButton.dataset.abSelect));return}
  const original=e.target.closest('[data-ab-original]');if(original&&section.contains(original)){
   const target=section.querySelector('#ab-quote-original'),open=original.getAttribute('aria-expanded')==='true';
   original.setAttribute('aria-expanded',String(!open));target.hidden=open;original.innerHTML=(!open?'收起评论全文 <span aria-hidden="true">－</span>':'核对评论全文 <span aria-hidden="true">＋</span>');
  }
 };
 const observe=section.querySelectorAll('[data-ab-observe]');
 const observer=new IntersectionObserver(()=>{
  if(manualTop!==null&&Math.abs(window.scrollY-manualTop)<105)return;manualTop=null;
  // A scroll-driven scene: the narrative step nearest the reading line controls the sticky chart.
  const line=window.innerHeight*.43;
  let best=null,dist=Infinity;
  for(const el of observe){const box=el.getBoundingClientRect();
    if(box.bottom<90||box.top>window.innerHeight*.85)continue;
    const distance=box.top<=line&&box.bottom>=line?0:Math.min(Math.abs(box.top-line),Math.abs(box.bottom-line));
    if(distance<dist){best=Number(el.dataset.abObserve);dist=distance}
  }
  if(best!=null)select(best);
 },{threshold:[0,.2,.4,.6,1],rootMargin:'-10% 0px -15% 0px'});
 observe.forEach(el=>observer.observe(el));
 const raf={id:0};
 const onScroll=()=>{if(manualTop!==null&&Math.abs(window.scrollY-manualTop)<105)return;manualTop=null;if(raf.id)return;raf.id=requestAnimationFrame(()=>{raf.id=0;const line=innerHeight*.43;
  let best=null,dist=Infinity;
  for(const el of observe){const box=el.getBoundingClientRect();if(box.bottom<90||box.top>innerHeight*.85)continue;
   const distance=box.top<=line&&box.bottom>=line?0:Math.min(Math.abs(box.top-line),Math.abs(box.bottom-line));
   if(distance<dist){best=Number(el.dataset.abObserve);dist=distance}
  }if(best!=null)select(best)
 })};
 // Keep explicit selection stable until reader scrolls into a different step.
 section.addEventListener('click',click);window.addEventListener('scroll',onScroll,{passive:true});
 return ()=>{disposeParticipation();section.removeEventListener('click',click);window.removeEventListener('scroll',onScroll);observer.disconnect();cancelAnimationFrame(raf.id)};
}
