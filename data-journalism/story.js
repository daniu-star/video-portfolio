import {escapeHTML as esc,fmt} from "./charts.js";
import {flourishEmbed} from "./flourish.js";

const storyQuotes = [
  {key:"respect",title:"一次求职，为什么成了对整个专业的追问？",excerpt:"最尊重新传之人",description:"论文从一位新闻学应届毕业生的求职经历写起：对口岗位受挫，转向餐饮工作后，再次因专业背景遭拒。评论区用一句反讽，回应这份尴尬。",next:"从这个个案，走向样本中的评价结构。",route:"employment"},
  {key:"ai",title:"被替代的，是一个任务，还是整个专业？",excerpt:"我大学主攻文案，出来发现文案用不着，ai就行。",description:"这句话来自一段更长的评论。作者同时谈到技术训练、工作负荷、社会交往与不同职业出路。只留下“AI就行”，会丢失这段经验的复杂性。",next:"先读完整的话，再判断它能说明什么。",route:"ability"},
  {key:"public_support",title:"如果时代需要好记者，为什么仍然质疑新闻学？",excerpt:"他说这些过程需要记录",description:"一条评论讲述纪录片工作者深入偏远地区的经历。在这里，新闻的价值不是一个抽象标签，而是有人愿意记录容易被忽略的生活。",next:"但同样的公共价值，也会被用来追责。",route:"public"}
];
const outer = [
  {name:"平台运营与商业传播",value:743,color:"#dbb87f"},
  {name:"基础内容生产",value:724,color:"#b98358"},
  {name:"五类核心能力合计",value:492,color:"#77b9bd"}
];
function arc(cx,cy,r1,r2,start,end){
  const point=(r,a)=>[cx+r*Math.sin(a),cy-r*Math.cos(a)].join(",");
  return `M${point(r2,start)} A${r2},${r2} 0 ${end-start>Math.PI?1:0},1 ${point(r2,end)} L${point(r1,end)} A${r1},${r1} 0 ${end-start>Math.PI?1:0},0 ${point(r1,start)}Z`;
}
export function abilityRing(){
  let acc=0;
  const pieces=outer.map((d,i)=>{
    const start=acc/1959*Math.PI*2;acc+=d.value;const end=acc/1959*Math.PI*2;
    return `<path d="${arc(280,245,147,207,start+.008,end-.008)}" fill="${d.color}" tabindex="0" role="button" data-ring="${i}" aria-label="${d.name}，${d.value}次"><title>${d.name}：${d.value}次，${(d.value/1959*100).toFixed(1)}%</title></path>`;
  });
  return `<svg viewBox="0 0 560 505" class="ability-ring" role="group" aria-label="能力提及两层旭日图，内环为前台与核心，外环为已披露能力类别">
    <path d="${arc(280,245,119,143,.008,1467/1959*Math.PI*2-.008)}" fill="#b08a58"/>
    <path d="${arc(280,245,119,143,1467/1959*Math.PI*2+.008,Math.PI*2-.008)}" fill="#548f95"/>
    ${pieces.join("")}<text x="280" y="236" text-anchor="middle" class="ring-total">1,959</text><text x="280" y="269" text-anchor="middle" class="ring-sub">次显性能力提及</text>
    <text x="280" y="486" text-anchor="middle" class="ring-sub">内环 / 能力组　外环 / 已披露类别</text>
  </svg>`;
}
function openingContent(index,data){
  const q=storyQuotes[index],record=data.commentsById.get(data.summary.quotes[q.key]);
  return `<div class="scene-caption"><span>评论现场</span><span>${String(index+1).padStart(2,"0")} / 03</span></div>
    <button class="scene-quote" data-comment="${record.id}" aria-label="阅读这条评论全文">“${esc(q.excerpt)}”</button>
    <div class="scene-source"><span>匿名评论 ${record.id}</span><span>${fmt(record.likes)}赞 · 原始快照</span></div>
    <div class="scene-context"><h2>${q.title}</h2><p>${q.description}</p>
    <button class="scene-read" data-comment="${record.id}">把这句话放回原文 <span aria-hidden="true">＋</span></button></div>`;
}
export function narrativeOverview(data){
  return `<div class="story-page">
  <section class="story-opening" aria-labelledby="story-title">
    <div class="opening-title"><span class="story-byline">毛湛文 · 陈俊良 / 新闻传播教育研究</span>
      <h1 id="story-title">新闻学<br>还能学吗？</h1>
      <p class="opening-deck">这个问题，<br>不只发生在填报志愿的那一刻。</p>
      <a class="story-begin" href="#story-crossroads" data-story-scroll="story-crossroads">从一条评论往下读 <span aria-hidden="true">↓</span></a>
      <a class="story-skip" href="#/lab">已有问题？直接查数据</a>
    </div>
    <div class="opening-scene"><div id="scene-content">${openingContent(0,data)}</div>
      <div class="scene-controls"><span>换一个声音，换一把评价的尺。</span><div>${storyQuotes.map((q,i)=>`<button data-scene="${i}" aria-pressed="${i===0}" class="${i===0?"active":""}" aria-label="阅读${["求职经历","技术替代","公共价值"][i]}评论">${["求职","技术","理想"][i]}</button>`).join("")}</div></div>
    </div>
    <div class="opening-foot"><span>基于2,134篇笔记与30,541条评论</span><span>真实评论 · 论文发现 · 不是总体民调</span></div>
  </section>
  <section class="story-crossroads" id="story-crossroads">
    <div class="story-section-number">第一幕 / 你会先问什么</div>
    <h2>同一个专业，<br>放在不同的尺子上。</h2>
    <p>选择一个问题。不是投票，也没有“正确立场”——只是从不同入口，看看研究里出现了什么。</p>
    <div class="question-paths">
      <button data-question="employment"><span>如果你在找工作</span><strong>毕业以后，<br>能做什么？</strong><small>看就业如何成为评价出口</small></button>
      <button data-question="ability"><span>如果你在学一项技能</span><strong>AI都能写了，<br>还要学什么？</strong><small>看前台技能与核心能力</small></button>
      <button data-question="public"><span>如果你仍然期待新闻</span><strong>需要好记者，<br>为什么不信任新闻学？</strong><small>看公共价值的两面</small></button>
    </div>
    <div id="question-answer" class="question-answer" aria-live="polite"><span class="answer-invitation">点选上面的一个问题，展开第一条证据。</span></div>
  </section>
  <section class="story-chapter employment-chapter" id="story-employment">
    <div class="story-section-number">第二幕 / 讨论往哪里去</div>
    <div class="story-spread"><div class="story-narration"><h2>谈的是课程，<br>问的却是工作。</h2><p>笔记原本可以谈知识、训练、报考或公共价值。到了评论区，不少讨论重新回到更直观的结果：岗位、收入与前景。</p><p>这就是论文所说的<strong>“下游结算”</strong>：从培养链条的结果端，反向裁定整个教育过程。</p><a href="#/findings/employment" class="story-inline-link">进入完整证据</a></div>
    <div class="story-chart"><div class="chart-caption">评论区最终由什么框架主导？<span>符合条件的696篇笔记</span></div>
      <div class="narrative-ranking">${[["就业职业",40.9],["课程知识",22],["AI平台",12.1],["无单一主导",13.2],["能力训练",5.5],["升学报考",4],["公共价值",1.7],["专业身份",.6]].sort((a,b)=>b[1]-a[1]).map(([label,value],i)=>`<button data-frame="${label}" class="rank-line ${i===0?"rank-focus":""}" aria-label="${label}，${value}%"><span>${label}</span><i style="--share:${value/45*100}%"></i><b>${value}%</b></button>`).join("")}</div>
      <p class="chart-footnote">单位：笔记占比。点选条形查看分母和解释；不把它当作全体用户的态度比例。</p><div class="frame-reading" id="frame-reading" aria-live="polite">就业职业占40.9%，但并没有覆盖全部讨论。</div>
    </div></div>
  </section>
  <section class="story-chapter ability-chapter" id="story-ability">
    <div class="story-section-number">第三幕 / 被看见，不等于被理解</div>
    <div class="story-spread"><div class="story-chart ring-stage"><div class="chart-caption">一个专业，被哪些能力代表？<span>点击扇区，展开类别</span></div>${flourishEmbed("ability")}<details class="local-chart-backup"><summary>查看本地交互备份与精确计数</summary>${abilityRing()}
      <div class="ring-legend">${outer.map((r,i)=>`<button data-ring="${i}"><i style="background:${r.color}"></i>${r.name}<b>${r.value}</b></button>`).join("")}</div>
      <div id="ring-reading" class="ring-reading" aria-live="polite">前台能力合计1,467次，占74.9%；核心能力合计492次，占25.1%。</div>
      <p class="chart-footnote">计数为能力提及，不是评论或用户。核心五类的细分量未在正文披露，因此仍合并展示。</p></details>
    </div><div class="story-narration"><h2>写作与运营<br>站在灯光下。<br><em>核查与判断呢？</em></h2><p>当专业被压缩成几项容易命名的技能，人们也更容易把技术对这些任务的介入，理解成对整个专业的替代。</p><p>这里有更隐蔽的一层：1,959次能力提及中，1,902次并未说明能力的属性。被谈论，并不意味着被认定为教育的独特成果。</p>
      <button class="story-inline-link" id="attribute-reveal" aria-expanded="false">看看剩下的57次判断</button>
      <div class="attribute-reveal" id="attribute-detail" hidden>${[["可跨职业迁移",19],["大学教育通用",16],["AI可替代",9],["新闻专业独特",8],["AI辅助强化",5]].map(([label,v])=>`<div><span>${label}</span><b>${v}</b><i style="width:${v/19*100}%"></i></div>`).join("")}<p>只有8次明确指向“新闻专业独特”，不是全部57次。</p></div>
    </div></div>
  </section>
  <section class="story-chapter public-chapter" id="story-public">
    <div class="story-section-number">第四幕 / 理想也会成为追责的理由</div>
    <h2>“需要好记者”与“不信任新闻”，<br>可能来自同一份期待。</h2>
    <div class="testimony-duet">${[["public_support","有人看见记录的必要","他说这些过程需要记录"],["public_criticism","有人追问承诺的落差","如果新闻能做到“不简单的断章取义是基本素养”的话，新闻专业就不会这么没有市场了"]].map(([key,label,text])=>{const c=data.commentsById.get(data.summary.quotes[key]);return `<article><span>${label}</span><blockquote>“${esc(text)}”</blockquote><button data-comment="${c.id}">读完整评论 / ${c.id}</button></article>`}).join("")}</div>
    <div class="public-resolution"><p>公共价值没有消失。争夺恰恰在于：<br><strong>谁能证明，它已经在实践中得到实现？</strong></p><a class="button ghost" href="#/findings/network">继续：为什么否定与肯定如此不对称</a></div>
  </section>
  <section class="story-outro"><span class="story-section-number">尾声 / 回到教育内部</span><h2>不只告诉别人，<br>这个专业值得学。<br>还要让人看见，<br>价值如何形成。</h2><div class="outro-links"><a href="#/rebuild">打开培养证据链</a><a href="#/evidence">回到真实评论</a><a href="#/methods">核对方法与边界</a></div><p>本文研究平台样本中的评价结构，不代替个人的升学或职业决策。<br>论文作者：毛湛文、陈俊良。所有引文可进入原文档案核对。</p></section>
  <nav class="story-chapters-nav" aria-label="叙事章节"><a href="#story-crossroads" data-story-scroll="story-crossroads">选择问题</a><a href="#story-employment" data-story-scroll="story-employment">就业</a><a href="#story-ability" data-story-scroll="story-ability">能力</a><a href="#story-public" data-story-scroll="story-public">价值</a><a href="#/lab">查数据</a></nav>
  </div>`;
}

export function mountStory(root,data){
  const answers={
    employment:{number:"40.9%",text:"在696篇符合分析条件的笔记中，40.9%的评论区以就业职业为主导。它说明样本内的议题重心，不等于40.9%的用户反对新闻学。",target:"story-employment"},
    ability:{number:"74.9%",text:"在1,959次显性能力提及中，74.9%指向内容生产和平台运营等前台能力。这里衡量的是能力的可见性，不是AI实际替代率。",target:"story-ability"},
    public:{number:"双向",text:"公共价值既被用于辩护，也被用于追责。两条评论可以援引相近的价值语言，却对新闻实践作出不同判断。",target:"story-public"}
  };
  const click=e=>{
    const b=e.target.closest("button,a");if(!b)return;
    if(b.dataset.storyScroll){e.preventDefault();document.getElementById(b.dataset.storyScroll)?.scrollIntoView({behavior:document.body.classList.contains("motion-paused")?"instant":"smooth"});return}
    if(b.hasAttribute("data-scene")){
      root.querySelector("#scene-content").innerHTML=openingContent(Number(b.dataset.scene),data);
      root.querySelectorAll("[data-scene]").forEach(x=>{x.classList.toggle("active",x===b);x.setAttribute("aria-pressed",String(x===b))});
    }
    if(b.dataset.question){
      const a=answers[b.dataset.question];
      root.querySelectorAll("[data-question]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
      root.querySelector("#question-answer").innerHTML=`<strong>${a.number}</strong><p>${a.text}</p><a data-story-scroll="${a.target}" href="#${a.target}">往下看这组证据 ↓</a>`;
    }
    if(b.dataset.frame){
      root.querySelectorAll("[data-frame]").forEach(x=>x.classList.toggle("rank-focus",x===b));
      root.querySelector("#frame-reading").textContent=`${b.dataset.frame}：${b.querySelector("b").textContent}。分母是696篇符合条件的笔记，不是30,541条评论。${b.dataset.frame==="无单一主导"?"未能识别为一个主导框架，并非没有内容。":""}`;
    }
    if(b.hasAttribute("data-ring")){
      const i=Number(b.dataset.ring),d=outer[i];
      root.querySelectorAll(".ability-ring [data-ring]").forEach(x=>x.classList.toggle("ring-selected",Number(x.dataset.ring)===i));
      root.querySelector("#ring-reading").textContent=`${d.name}：${d.value}次，占全部能力提及${(d.value/1959*100).toFixed(1)}%。${i===2?"包括采访与信源、信息整理、事实核查、社会解释、伦理责任五类，未虚构内部比例。":"属于前台能力组；频繁被提及，不等于被认定为新闻专业独特能力。"}`;
    }
    if(b.id==="attribute-reveal"){
      const panel=root.querySelector("#attribute-detail");panel.hidden=!panel.hidden;
      b.setAttribute("aria-expanded",String(!panel.hidden));b.textContent=panel.hidden?"看看剩下的57次判断":"收起属性判断";
    }
  };
  root.addEventListener("click",click);
  const key=e=>{if(e.target.matches(".ability-ring [data-ring]")&&["Enter"," "].includes(e.key)){e.preventDefault();const d=outer[Number(e.target.dataset.ring)];root.querySelector("#ring-reading").textContent=`${d.name}：${d.value}次，占${(d.value/1959*100).toFixed(1)}%。`}};
  // SVG paths are not buttons in the DOM, so route pointer interaction explicitly.
  const svgClick=e=>{const p=e.target.closest(".ability-ring [data-ring]");if(p)root.querySelector(`.ring-legend [data-ring="${p.dataset.ring}"]`).click()};
  root.addEventListener("keydown",key);root.addEventListener("click",svgClick);
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){
      entry.target.classList.add("scene-entered");
      root.querySelectorAll(".story-chapters-nav [data-story-scroll]").forEach(a=>a.classList.toggle("current",a.dataset.storyScroll===entry.target.id));
    }
  },{threshold:.14});
  root.querySelectorAll("section[id]").forEach(s=>observer.observe(s));
  return ()=>{root.removeEventListener("click",click);root.removeEventListener("click",svgClick);root.removeEventListener("keydown",key);observer.disconnect()};
}
