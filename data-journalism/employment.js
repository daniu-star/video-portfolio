// PAGE-02 | Employment frames. All displayed values are computed from the
// 696-note archived source→comment dominant-frame matrix, not simulated flows.
import {escapeHTML as esc,fmt} from "./charts.js";
import {employmentGame,mountEmploymentGame} from "./participatory-v3.js";

const orderLeft=["就业职业","课程知识","升学报考","AI平台","能力训练","公共价值","专业身份","未识别"];
const orderRight=["就业职业","课程知识","AI平台","能力训练","升学报考","公共价值","专业身份","未识别"];
const label={"AI平台":"AI与平台","未识别":"未识别"};
const name=s=>label[s]||s;
const share=(n,d)=>`${(n/d*100).toFixed(1)}%`;
const sum=(flows,k,v)=>flows.filter(f=>f[k]===v).reduce((n,f)=>n+f.value,0);

export function employmentDiagram(d){
  const left=new Map(),right=new Map();
  const xL=212,xR=983,yTop=68,gap=14,height=500,scale=height/d.total;
  let yl=yTop,yr=yTop;
  for(const n of orderLeft){const total=sum(d.flows,"source",n);left.set(n,{y:yl,height:total*scale,total,off:0});yl+=total*scale+gap}
  for(const n of orderRight){const total=sum(d.flows,"target",n);right.set(n,{y:yr,height:total*scale,total,off:0});yr+=total*scale+gap}
  const ribbons=d.flows.map((f,i)=>{
    const s=left.get(f.source),t=right.get(f.target),h=f.value*scale;
    const a=s.y+s.off,b=t.y+t.off;s.off+=h;t.off+=h;
    const path=`M${xL+9} ${a} C475 ${a},715 ${b},${xR} ${b} L${xR} ${b+h} C715 ${b+h},475 ${a+h},${xL+9} ${a+h}Z`;
    return `<path class="em-ribbon" d="${path}" data-em-link="${i}" data-em-src="${esc(f.source)}" data-em-dst="${esc(f.target)}" tabindex="0" role="button" aria-label="${esc(name(f.source))}到${esc(name(f.target))}：${f.value}篇"><title>${esc(name(f.source))} → ${esc(name(f.target))}：${f.value}篇</title></path>`;
  }).join("");
  const nodes=(map,x,textX,anchor,group)=>[...map].map(([n,r])=>{
    const y=r.y+r.height/2;
    return `<rect class="em-node ${n==='就业职业'?'em-node--job':''}" x="${x}" y="${r.y}" width="9" height="${Math.max(2,r.height)}" rx="1"/><text class="em-node-label" x="${textX}" y="${y+4}" text-anchor="${anchor}">${esc(name(n))}</text>${r.total>=30?`<text class="em-node-count" x="${textX}" y="${y+20}" text-anchor="${anchor}">${r.total}篇</text>`:""}`;
  }).join("");
  return `<svg class="em-flow-svg" viewBox="0 0 1200 680" role="group" aria-label="框架流向交互图：左侧是笔记原有框架，右侧是对应评论区主导框架，连线宽度代表笔记数量。">
   <text x="202" y="31" text-anchor="end" class="em-svg-axis">笔记起点</text><text x="1001" y="31" class="em-svg-axis">评论区终点</text>
   <g class="em-flow-links">${ribbons}</g>
   <g class="em-flow-nodes">${nodes(left,xL,195,'end','left')}${nodes(right,xR,1003,'start','right')}</g>
  </svg>`;
}

export function employmentSection(data){
  const d=data.migration;
  const start=sum(d.flows,"source","就业职业"),finish=sum(d.flows,"target","就业职业");
  const stayed=d.flows.find(f=>f.source==="就业职业"&&f.target==="就业职业")?.value||0;
  const movedIn=finish-stayed,unidentified=d.flows.find(f=>f.source==="未识别"&&f.target==="就业职业")?.value||0;
  const clearOther=movedIn-unidentified, movedOut=start-stayed;
  if(d.total!==696||finish!==285||start!==133||unidentified!==120)throw new Error("Employment migration data changed: review editorial counts");
  return `<section class="reading-section employment-section" id="employment" aria-labelledby="em-title" data-em-step-active="0">
   <div class="em-wrap">
    <header class="em-intro em-v3-intro">
      <div class="em-intro-aside"><span class="em-index">02</span><strong>就业结算</strong><span class="em-index-rule"></span><p>档案二<br>当培养的意义，被职业结果重新审视。</p><small>调查章节 / 696篇可配对笔记</small></div>
      <div class="em-intro-heading">
        <span class="em-v3-docket">档案摘录 · 对教育价值的一次现实结算</span>
        <h2 id="em-title">当专业的讨论，<br>最终被问成：<em>能找到工作吗？</em></h2>
        <p>696篇笔记，议题怎样转向就业？</p>
        <div class="em-v3-note"><span>研究追问</span><em>专业教育的价值，为什么需要在毕业后接受一次性结算？</em></div>
      </div>
      <figure class="em-v3-photo"><img src="./assets/archive-v3/employment-job-scene.webp" alt="AI辅助创作的求职场景概念拼贴，并非真实现场照片" loading="lazy"><figcaption>概念影像 / 非真实历史照片</figcaption></figure>
      <div class="em-v3-mark" aria-hidden="true">现实<br>结算</div>
    </header>
    ${window.GraduateGameV46?.render?.()||""}
    ${employmentGame(d)}
    <div class="em-v3-before-chart"><span>观察方法 / 不是时间演变</span><strong>同一篇笔记的两端：笔记谈什么，评论区最后围绕什么。</strong><p>同一批笔记的三种切面，非历时变化。</p></div>
    <div class="em-scroll" aria-label="随阅读展开的就业框架对比">
      <div class="em-step-column">
        <article class="em-scroll-step is-active" data-em-step="0"><span class="em-step-number">01</span><h3>问题原本不只关乎工作。</h3><p>在笔记自身的主导框架中，只有 <strong>${fmt(start)} 篇</strong>首先聚焦就业。课程、升学、平台技术以及尚未识别为特定框架的笔记，共同构成讨论起点。</p><button class="em-step-jump" data-em-jump="1">看看评论区如何变化 <span aria-hidden="true">↓</span></button></article>
        <article class="em-scroll-step" data-em-step="1"><span class="em-step-number">02</span><h3>到了评论区，就业成为最大的单一框架。</h3><p>终点以就业为主导的评论区增至 <strong>${fmt(finish)} 篇</strong>，占696篇笔记的 <strong>${share(finish,d.total)}</strong>。这是同一批笔记两端的框架对比，不是就业率，也不是读者态度投票。</p><button class="em-step-jump" data-em-jump="2">它们从哪里转来？ <span aria-hidden="true">↓</span></button></article>
        <article class="em-scroll-step" data-em-step="2"><span class="em-step-number">03</span><h3>不是所有“转入”，都有明确的原议题。</h3><p>就业终点中，<strong>${stayed} 篇</strong>起点也谈就业，<strong>${movedIn} 篇</strong>起点并非就业编码；但后者有 <strong>${unidentified} 篇</strong>起点“未识别”。能确认从其他明确框架转来的，是 <strong>${clearOther} 篇</strong>。</p><button class="em-step-jump" type="button" data-em-explore>亲自查看47条流向 <span aria-hidden="true">↘</span></button></article>
      </div>
      <div class="em-sticky"><div class="em-comparison">
        <div class="em-comparison-head"><div><span class="em-mini">同一批笔记，两次编码</span><h3>就业框架的前后差异</h3></div><span class="em-basis">n = ${d.total} 篇</span></div>
        <div class="em-comparison-chart">
          <div class="em-track-block"><div class="em-track-head"><span>笔记自身的主导议题</span><strong>${fmt(start)} <small>篇就业</small></strong></div><div class="em-track" role="img" aria-label="笔记原有就业职业框架133篇，其他明确框架253篇，未识别310篇"><i class="em-seg em-seg-job" style="width:${start/d.total*100}%"></i><i class="em-seg em-seg-other" style="width:${(d.total-start-310)/d.total*100}%"></i><i class="em-seg em-seg-unknown" style="width:${310/d.total*100}%"></i></div><span class="em-track-percent">${share(start,d.total)} 聚焦就业</span></div>
          <div class="em-transition-arrow" aria-hidden="true"><span>同一篇笔记</span><svg viewBox="0 0 24 46"><path d="M12 2v38m-7-8 7 8 7-8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg><span>比较评论区</span></div>
          <div class="em-track-block em-after"><div class="em-track-head"><span>评论区最终的主导议题</span><strong>${fmt(finish)} <small>篇就业</small></strong></div><div class="em-track" role="img" aria-label="评论区就业职业框架285篇，其他明确框架319篇，未识别92篇"><i class="em-seg em-seg-job" style="width:${finish/d.total*100}%"></i><i class="em-seg em-seg-other" style="width:${319/d.total*100}%"></i><i class="em-seg em-seg-unknown" style="width:${92/d.total*100}%"></i></div><span class="em-track-percent">${share(finish,d.total)} 聚焦就业</span></div>
        </div>
        <div class="em-track-key"><span><i class="em-key-job"></i>就业职业</span><span><i class="em-key-other"></i>其他明确框架</span><span><i class="em-key-unknown"></i>未识别</span></div>
        <div class="em-stage-callout" aria-live="polite"><strong data-em-stage-value>133篇</strong><p data-em-stage-caption>在笔记起点，就业不是唯一的核心议题。</p></div>
        <p class="em-chart-source">数据：696篇可配对笔记的框架编码矩阵｜单位：篇｜每列合计696</p>
      </div></div>
    </div>
    <section class="em-explorer" id="em-explore" aria-labelledby="em-explore-title">
      <div class="em-explore-head"><div><p class="em-eyebrow">框架流向 · 证据探索</p><h3 id="em-explore-title">哪一种讨论，流向了就业？</h3><p>连线宽度代表笔记数。点击核对。</p></div><div class="em-explore-stat"><b>${fmt(movedIn)}</b><span>篇终点为就业、<br>起点并非就业编码</span></div></div>
      <div class="v48-offline-note"><span class="v48-live-pill"><i></i> 离线图表 · 已就绪</span><p>全部47条流向已经载入。滚动显影；点击连线核对篇数。</p><button type="button" data-em-replay>重播流向动效 ↻</button></div>
      <div class="em-v3-local-heading"><span>主图 · 本地交互桑基图</span><strong>696篇笔记的两端，47条真实配对</strong><p>左为笔记，右为评论区；线宽表示篇数。不是时间轨迹。</p></div>
      <div class="em-explore-actions"><div class="em-view-switch" role="group" aria-label="框架流向重点"><button data-em-view="employment" aria-pressed="true" class="is-active">流向就业</button><button data-em-view="all" aria-pressed="false">全部流向</button><button data-em-view="out" aria-pressed="false">离开就业</button></div><label class="em-source-label">筛选笔记起点 <select id="em-source-filter" aria-label="筛选原始笔记框架"><option value="">所有起点</option>${orderLeft.map(n=>`<option value="${esc(n)}">${esc(name(n))}</option>`).join("")}</select></label><button class="em-reset" type="button" data-em-reset>重置</button></div>
      <div class="em-explore-visual" data-v48-flow-scene aria-label="离线可操作桑基图，滚动自动显影">${employmentDiagram(d)}</div>
      <p class="v48-flow-scale">读法：左侧「笔记起点」 → 右侧「评论区主导议题」　·　线宽＝笔记篇数。选择连线查看真实计数。</p>
      <details class="v48-flourish-optional"><summary>原图档案与图表版本 <span>来源链接 ↗</span></summary><div class="v48-flourish-inner"><p>本地已含47条流向。外部版本仅供核对。</p><a href="https://public.flourish.studio/visualisation/30509053/" target="_blank" rel="noopener noreferrer">核对 Flourish 原工程 ↗</a><p>本地桑基图已经包含全部47条可点选流向，离线也可筛选与核对。</p></div></details>
      <div class="em-explore-bottom"><div class="em-inspector" aria-live="polite"><span class="em-inspector-overline">当前聚焦</span><strong data-em-inspector-title>评论区以就业为主导：${finish}篇</strong><p data-em-inspector-copy>${stayed}篇起点也是就业；另外${movedIn}篇起点不是就业编码，其中${unidentified}篇起点未识别。不能把这些记录全部解释为明确议题的转向。</p></div><div class="em-flow-legend"><span><i></i>高亮：当前筛选的流向</span><span><i></i>淡化：其他流向</span><span>未识别 ≠ 没有讨论</span></div></div>
      <aside class="v49-em-annotation"><div><span>研究发现 / 下游结算</span><strong>从培养过程，跳到就业结果。</strong></div><p>从课程谈起，到就业结算。毕业后做什么，压过了怎样培养。</p><a href="#/methods">这696篇笔记如何筛选？ ↗</a></aside><div class="em-source-block"><p><strong>数据来源</strong>｜小红书目的性样本，经研究者框架编码形成的配对汇总；<strong>范围</strong>｜696篇可比较笔记；<strong>单位</strong>｜篇；<strong>处理</strong>｜47条非零起点—终点流向汇总。未识别框架保留，不推断具体含义。</p><div><a href="./data/figures/v2/migration.csv" download>下载原始汇总矩阵 ↗</a><a href="#/methods">研究方法与限制 ↗</a></div></div>
      <details class="em-a11y-table em-source-caveat"><summary>复现归档与论文正文的口径差异</summary><p>本图严格依据归档的696篇配对矩阵计算。归档说明指出，正文对部分迁移比例的解释与该矩阵并不一致；因此不将正文另述的49.1%套用到本图。具体判断需结合论文原文与归档汇总核查。</p></details>
      <details class="em-a11y-table"><summary>查看全部47条流向的文本数据</summary><div class="em-table-scroll"><table><thead><tr><th>笔记起点</th><th>评论区终点</th><th>篇数</th></tr></thead><tbody>${d.flows.map(f=>`<tr><td>${esc(name(f.source))}</td><td>${esc(name(f.target))}</td><td>${fmt(f.value)}</td></tr>`).join("")}</tbody></table></div></details>
    </section>
    <section class="em-closing"><div><p class="em-eyebrow">回到真实评论</p><blockquote>“学新传有口饭吃，那哪个专业没有这口饭”</blockquote><div class="em-quote-source">匿名评论 C17915 · 引文摘录，原文同时讨论文案、技术学习、工作负荷和职业选择</div><a href="#/evidence?comment=C17915">阅读完整匿名评论与上下文 ↗</a></div><div class="em-closing-thesis"><span>研究发现</span><h3>“下游结算”：<br>用就业结果，反向衡量培养过程。</h3><p>就业不是唯一尺度，却最容易成为判决。</p><p class="em-closing-note">这是一组议题框架的配对比较，不等于平台总体态度，也不能推断就业造成了评价方向变化。</p></div></section>
   </div>
  </section>`;
}

export function mountEmployment(root,data){
  const section=root.querySelector(".employment-section");
  if(!section)return ()=>{};
  const d=data.migration, svg=section.querySelector(".em-flow-svg");
  const disposeGame=mountEmploymentGame(section,d);
  const disposeGraduate=window.GraduateGameV46?.mount?.(section,d)||(()=>{});
  const lines=[...svg.querySelectorAll("[data-em-link]")];
  lines.forEach((r,i)=>r.style.setProperty("--v48-i",i));
  const filter=section.querySelector("#em-source-filter");
  const viewBtns=[...section.querySelectorAll("[data-em-view]")];
  const steps=[...section.querySelectorAll("[data-em-step]")];
  const value=section.querySelector("[data-em-stage-value]");
  const caption=section.querySelector("[data-em-stage-caption]");
  let mode="employment",origin="",focus=null,stage=0;
  const totals={};for(const n of orderLeft)totals[n]=sum(d.flows,"source",n);
  const setStage=n=>{
    stage=n;section.dataset.emStepActive=String(n);
    steps.forEach(el=>el.classList.toggle("is-active",Number(el.dataset.emStep)===n));
    const txt=[
      ["133篇 · 19.1%","笔记起点，就业并非唯一的主导议题。"],
      ["285篇 · 40.9%","到了评论区，就业成为最大的单一主导框架，较起点净增152篇。"],
      ["175篇，含120篇未识别起点","175篇起点不是就业编码；其中120篇的原议题未识别，不能全部认定为跨议题转入。"]
    ];value.textContent=txt[n][0];caption.textContent=txt[n][1];
  };
  const update=()=>{
    viewBtns.forEach(b=>{const yes=b.dataset.emView===mode;b.classList.toggle("is-active",yes);b.setAttribute("aria-pressed",String(yes))});
    lines.forEach(el=>{
      const f=d.flows[Number(el.dataset.emLink)];
      const matchesMode=mode==="all"||(mode==="employment"?f.target==="就业职业":f.source==="就业职业");
      const matchesOrigin=!origin||f.source===origin;
      const matchesFocus=focus===null||Number(el.dataset.emLink)===focus;
      const highlighted=matchesMode&&matchesOrigin&&matchesFocus;
      el.classList.toggle("is-highlight",highlighted);
      el.classList.toggle("is-dim",!highlighted);
      el.classList.toggle("is-job",f.target==="就业职业");
    });
    const title=section.querySelector("[data-em-inspector-title]");
    const copy=section.querySelector("[data-em-inspector-copy]");
    if(focus!==null){
      const f=d.flows[focus];title.textContent=`${name(f.source)} → ${name(f.target)}：${f.value}篇`;
      copy.textContent=`在起点编码为“${name(f.source)}”的${totals[f.source]}篇笔记中，这条流向占${share(f.value,totals[f.source])}。${f.source==="未识别"?'“未识别”表示未确定起点议题，不能推断它原来讨论什么。':''}`;
      return;
    }
    const selected=d.flows.filter(f=> (mode==="all"|| (mode==="employment"?f.target==="就业职业":f.source==="就业职业")) && (!origin||f.source===origin));
    const total=selected.reduce((a,f)=>a+f.value,0);
    if(origin){
      title.textContent=`${name(origin)}：当前显示${total}篇流向`;
      if(mode==="employment")copy.textContent=origin==="就业职业"?`就业起点共133篇，其中110篇的评论区仍以就业为主导。`:`以“${name(origin)}”为起点的${totals[origin]}篇笔记中，${total}篇最终评论区以就业为主导，占${share(total,totals[origin])}。${origin==="未识别"?'此类不能确认为从某个具体议题转入。':''}`;
      else copy.textContent=`显示起点为“${name(origin)}”且符合当前视图的${total}篇笔记。可点选一条连线查看详情。`;
    }else if(mode==="employment"){
      title.textContent="评论区以就业为主导：285篇";
      copy.textContent="110篇起点也为就业；175篇起点不是就业编码，其中120篇起点未识别。明确从其他已识别框架流入的有55篇。";
    }else if(mode==="out"){
      title.textContent="就业起点：133篇";
      copy.textContent="110篇终点仍为就业，23篇评论区转为其他框架（含未识别）。这里显示的是起点为就业的全部流向。";
    }else{
      title.textContent="完整的47条流向：696篇";
      copy.textContent="左右每一侧的框架计数均合计696篇。悬停或点击连线可查看配对数量，筛选不会修改原始数据。";
    }
  };
  const click=e=>{
    const button=e.target.closest?.("[data-em-view],[data-em-reset],[data-em-replay],[data-em-jump],[data-em-explore],[data-em-link]");if(!button||!section.contains(button))return;
    if(button.hasAttribute("data-em-view")){mode=button.dataset.emView;focus=null;update()}
    else if(button.hasAttribute("data-em-reset")){mode="employment";origin="";focus=null;filter.value="";update()}
    else if(button.hasAttribute("data-em-replay")){const scene=section.querySelector('[data-v48-flow-scene]');if(scene){scene.classList.remove('v48-flow-active');void scene.offsetWidth;scene.classList.add('v48-flow-active')}}
    else if(button.hasAttribute("data-em-jump")){const target=steps[Number(button.dataset.emJump)];target?.scrollIntoView({block:"center",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});setStage(Number(button.dataset.emJump))}
    else if(button.hasAttribute("data-em-explore")){section.querySelector("#em-explore")?.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"})}
    else if(button.hasAttribute("data-em-link")){focus=focus===Number(button.dataset.emLink)?null:Number(button.dataset.emLink);update()}
  };
  const change=e=>{if(e.target===filter){origin=filter.value;focus=null;update()}};
  const keydown=e=>{const link=e.target.closest?.("[data-em-link]");if(link&&(e.key==="Enter"||e.key===" ")){e.preventDefault();link.dispatchEvent(new MouseEvent("click",{bubbles:true}))}};
  const hover=e=>{const link=e.target.closest?.("[data-em-link]");if(!link)return;svg.classList.add("has-hover");svg.dataset.hoverIndex=link.dataset.emLink;};
  const leave=()=>{svg.classList.remove("has-hover");delete svg.dataset.hoverIndex};
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting);
    if(!visible.length)return;
    const mid=window.innerHeight*.46;
    visible.sort((a,b)=>Math.abs(a.boundingClientRect.top+a.boundingClientRect.height/2-mid)-Math.abs(b.boundingClientRect.top+b.boundingClientRect.height/2-mid));
    setStage(Number(visible[0].target.dataset.emStep));
  },{rootMargin:"-22% 0px -24% 0px",threshold:[0,.3,.6]});
  steps.forEach(el=>observer.observe(el));
  const flowScene=section.querySelector('[data-v48-flow-scene]');
  let flowObserver=null;
  if(flowScene){flowObserver=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting&&!flowScene.classList.contains('v48-flow-active'))flowScene.classList.add('v48-flow-active')}},{threshold:.16});flowObserver.observe(flowScene)}
  section.addEventListener("click",click);section.addEventListener("change",change);section.addEventListener("keydown",keydown);
  svg.addEventListener("pointerover",hover);svg.addEventListener("pointerout",leave);
  update();setStage(0);
  return ()=>{disposeGame();disposeGraduate();observer.disconnect();flowObserver?.disconnect();section.removeEventListener("click",click);section.removeEventListener("change",change);section.removeEventListener("keydown",keydown);svg.removeEventListener("pointerover",hover);svg.removeEventListener("pointerout",leave)};
}
