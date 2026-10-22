import {escapeHTML as esc,fmt} from "./charts.js";
import {sceneMarkup,mountScenes} from "./scenes-v2.js";
import {startAmbient,toggleMuted,isMuted,stopAmbient} from "./audio-v2.js";
import {employmentSection,mountEmployment} from "./employment.js";
import {publicSection,mountPublic} from "./public-value.js";
import {abilitySection,mountAbility} from "./ability.js";
import {networkArchive,mountNetworkArchive} from "./network-archive-v35.js";
import {mazeSection,mountRebuildMaze} from "./rebuild-maze-v40.js";

function photo(assets,key,alt,className=""){
  const item=assets?.[key];
  if(!item?.src)return `<div class="art-not-ready ${className}" role="note">视觉素材正在制作，尚未作为成品发布。</div>`;
  return `<figure class="cinema-photo ${className}" data-photo-key="${key}"><div class="photo-depth"><img src="${esc(item.src)}" ${item.mobile?`srcset="${esc(item.mobile)} 800w, ${esc(item.src)} 1600w" sizes="(max-width:700px) 100vw, 90vw"`:""} alt="${esc(alt)}" loading="lazy" decoding="async" width="${item.width}" height="${item.height}"></div><span class="photo-light" aria-hidden="true"></span><figcaption>生成意象，不对应真实研究参与者</figcaption></figure>`;
}
function inlineEvidence(key,d){
  const c=d.comments.find(c=>c.id===d.quotes[key]);
  const n=d.notes.find(n=>n.id===c.note);
  return `<details class="inline-evidence"><summary>把这句话放回完整语境</summary><blockquote>${esc(c.text)}</blockquote><p class="evidence-meta">匿名评论 ${c.id} · ${fmt(c.likes)}赞，原始库快照${c.date?" · "+c.date:" · 日期未记录"}</p><p class="evidence-meta">所属笔记：${esc(n?.title||"标题未恢复")}</p><a href="#/lab?q=${esc(c.note)}">查看这篇笔记的相关讨论</a></details>`;
}
const coverVoices = [
  {key:"respect",label:"求职",title:"一次求职，为什么指向整个专业？",excerpt:"最尊重新传之人",route:"begin"},
  {key:"ai",label:"能力",title:"AI介入一项任务，就等于替代一个专业吗？",excerpt:"我大学主攻文案，出来发现文案用不着，ai就行。",route:"ability"},
  {key:"public_support",label:"价值",title:"什么样的新闻实践，仍值得人们期待？",excerpt:"他说这些过程需要记录",route:"public"}
];
// PAGE-01 / V3.1 — non-fiction archive cover; other routes intentionally untouched.
export function cinemaCover(data){
 const d=data.narrative, months=data.summary.months||[];
 const voices=[
   {key:'respect',editorial:'一句反讽，怎样落在一个专业身上',route:'begin',slice:90},
   {key:'ai',editorial:'一项技能，被当作整个专业的前途',route:'ability',slice:100},
   {key:'public_support',editorial:'为什么还有人坚持记录现实',route:'public',slice:110}
 ].map((v,i)=>{
   const id=d.quotes[v.key],c=d.comments.find(x=>x.id===id),n=d.notes.find(x=>x.id===c?.note);
   return {...v,i,id,c,n};
 }).filter(v=>v.c);
 const fragments=voices.map(v=>`<article class="folio-voice folio-voice-${v.i+1} reveal-on-read">
   <div class="folio-voice-edge" aria-hidden="true"></div>
   <div class="folio-voice-top"><span>匿名记录 ${String(v.i+1).padStart(2,'0')}</span><span>${esc(v.id)}</span></div>
   <blockquote>${esc(v.c.text.length>v.slice?v.c.text.slice(0,v.slice)+'…':v.c.text)}</blockquote>
   <p class="folio-voice-note">${esc(v.editorial)}</p>
   <details class="folio-full"><summary>核对原文与笔记语境 <span aria-hidden="true">↗</span></summary>
      <div class="folio-full-body"><p>${esc(v.c.text)}</p><small>匿名评论 ${esc(v.id)} · ${esc(v.c.date||'日期未记录')}<br>所属笔记：${esc(v.n?.title||'标题未恢复')}</small>
      <a href="#/story?section=${v.route}">进入相关调查章节 →</a></div>
   </details>
 </article>`).join('');
 const first=voices.find(x=>x.key==='respect');
 return `<article class="archive-v3" id="archive-v3" aria-labelledby="v3-title">
   <nav class="v3-topline" aria-label="争议档案主导航"><a class="v3-brand" href="#/overview">争议档案<span class="v3-brandline">一份关于新闻传播教育的社会调查</span></a><div class="v3-topnav">
    <a class="current" href="#archive-v3">卷首</a><a href="#v3-voices">公众声音</a><a href="#v3-sample">研究样本</a><a href="#v3-time">日期分布</a><a href="#/story">进入正文 ↗</a>
   </div></nav>
   <section class="v42-cinema-stage" aria-label="档案电影式卷首">
     <div class="v42-film-grain" aria-hidden="true"></div>
     <div class="v42-film-top"><span>案卷 001 / 新闻传播教育</span><span>研究快照 · 社会调查</span></div>
     <div class="v42-masthead"><div class="v42-seal" aria-hidden="true">调查<br>卷宗</div>
       <p class="v42-strap">新闻传播教育，接受社会的追问</p>
       <h1 id="v3-title">争议档案</h1>
       <p class="v42-ink-subtitle">当专业不再自明</p>
       <p class="v42-deck">学什么。凭什么。往哪里去？<br>30,541条评论，一场专业价值之争。</p>
       <div class="v42-film-actions"><a href="#v3-voices" class="v42-primary">打开档案 <span aria-hidden="true">↓</span></a><a href="#/story">进入调查正文 ↗</a><button class="v43-replay" type="button" data-ink-replay title="重现墨迹落笔">重现落墨 ↻</button></div>
     </div>
     <div class="v42-photo-credit">概念影像 / AI辅助创作，不是历史照片</div>
     <div class="v42-quiet-tag" aria-hidden="true">争论未止<br>档案待阅</div>
     <div class="v42-film-foot"><span>21,779 条语义有效评论</span><span>2,134 篇笔记</span><span>09 份调查卷宗</span><span class="v42-scroll-hint">向下翻阅　↓</span></div>
   </section>
   <aside class="gg46-tour-cta" aria-label="新增互动求职游戏"><div><span class="gg46-tour-tag">NEW · SECOND CHAPTER</span><strong>重生之我是新传生</strong><p>十二次相遇，三重处境。先求职，再看证据。</p></div><a href="#/story?section=employment&play=1">进入像素毕业季 →</a></aside>
   <nav class="v42-chapters" aria-label="九章导览">
     <a href="#v3-voices"><span>01</span>争议现场</a><a href="#/story?section=employment"><span>02</span>就业结算</a><a href="#/story?section=public"><span>03</span>公共价值</a><a href="#/story?section=ability"><span>04</span>能力可见性</a><a href="#/story?section=network"><span>05</span>非对称证明</a><a href="#/evidence"><span>06</span>评论档案</a><a href="#/lab"><span>07</span>数据实验室</a><a href="#/story?section=rebuild"><span>08</span>教育重构</a><a href="#/methods"><span>09</span>结语与回声</a>
   </nav>
   <section id="v3-voices" class="v3-voices-section" aria-labelledby="v3-voices-title">
     <div class="v3-section-head"><div><span class="v3-ordinal">档案页 001—003</span><h2 id="v3-voices-title">争议现场</h2></div><p>匿名引文 · 点击核对全文</p></div>
     <div class="v3-voices-deck">${fragments}</div>
     <aside class="v3-voices-aside"><span>编辑旁注</span><p>失望与期待，指向同一专业。</p><p>个案并非总体。</p></aside>
   </section>
   <section id="v3-sample" class="v3-sample-section" aria-labelledby="v3-sample-title">
     <div class="v3-section-head"><div><span class="v3-ordinal">调查记录 / 样本说明</span><h2 id="v3-sample-title">调查样本</h2></div><p>由个案，进入样本。</p></div>
     <div class="v3-sample-ledger">
       <div><span>01 / 笔记记录</span><strong>2,134</strong><p>篇相关笔记记录，不能全部视作拥有完整正文。</p></div>
       <div><span>02 / 原始评论</span><strong>30,541</strong><p>条评论及回复，含一级评论19,653条与回复10,888条。</p></div>
       <div><span>03 / 研究语料</span><strong>21,779</strong><p>条语义有效评论，用于后续内容分析。</p></div>
     </div>
     <div class="v3-method-note">目的性样本，不能外推社会总体。<a href="#/methods">研究方法与边界 ↗</a></div>
   </section>
   <section id="v3-time" class="v3-time-section" aria-labelledby="v3-time-title">
      <div class="v3-time-header"><span class="v3-ordinal">研究材料的时间截面</span><h2 id="v3-time-title">记录的时间分布</h2><p>有日期的采集记录，不是平台总热度。</p></div>
      <div class="v3-time-paper">
        <div class="v3-time-control"><div><span>有日期原始评论 · 合计22,824条</span><strong id="v3-chart-state">查看前48个有记录的月份</strong></div><div class="v3-time-buttons"><button type="button" data-month-play>播放逐月显影 ▶</button><button type="button" data-month-reset>重置 ↺</button></div></div>
        <div class="v3-chart-wrapper" data-month-chart role="img" aria-label="有日期原始评论的月份分布，可通过时间滑杆与播放控件逐月查看"></div>
        <div class="v3-time-slider"><label for="v3-month-slider">逐月翻阅</label><input id="v3-month-slider" type="range" min="1" max="${months.length}" value="${months.length}" step="1"><output id="v3-month-output">${esc(months[months.length-1]?.month||'')}</output></div>
        <div class="v3-chart-caption"><span>来源：原始采集库日期字段；48个有记录的月份，合计22,824条。</span><span>未列出的月份不补零、不连接为连续趋势。</span>
        <a href="./data/figures/archive_v3_dated_months.csv" download>下载图表数据 ↓</a></div>
        <div class="v3-flourish-note">图表已在本地运行。Flourish 编辑工程仅供核对。
        <a href="https://app.flourish.studio/visualisation/30640372/edit" target="_blank" rel="noopener noreferrer">打开 Flourish 编辑工程 ↗</a></div>
      </div>
   </section>
   <section class="v3-next-section" aria-label="进入后续调查">
      <div class="v3-next-label">档案翻页 / 第二卷</div><div class="v3-next-main"><h2>是谁在为教育<br><em>标定价值？</em></h2><a class="v47-enter-next" data-v47-curtain href="#/story?section=employment&play=1"><span class="v47-enter-pulse" aria-hidden="true">✦</span><span>点击进入第二卷 · 就业结算</span><span aria-hidden="true">→</span></a><p class="v47-next-caption">帷幕之后，是一场毕业求职。</p></div><div class="v3-next-aside">第二卷 · 就业结算<br>互动故事与真实数据</div>
   </section>
   <footer class="v3-footer"><span>《争议档案》· 新闻传播教育社会评价研究</span><a href="#/methods">研究方法</a><button type="button" id="cover-motion-toggle">${document.body.classList.contains('motion-paused')?'开启动效':'暂停动效'}</button><span>毛湛文 · 陈俊良</span></footer>
  </article>`;
}
export function mountCover(root,data){
  const shell=root.querySelector('#archive-v3');if(!shell)return ()=>{};
  const months=data.summary.months||[],chart=shell.querySelector('[data-month-chart]'),range=shell.querySelector('#v3-month-slider'),out=shell.querySelector('#v3-month-output'),state=shell.querySelector('#v3-chart-state'),play=shell.querySelector('[data-month-play]');
  let current=months.length,timer=null,autoPlayed=false;
  const max=Math.max(1,...months.map(d=>d.count));
  // SVG is an explicitly labelled local interactive fallback; Flourish source project is separate.
  chart.innerHTML=`<div class="v3-chart-ylabel">条 / 月</div><div class="v3-chart-grid">${months.map((m,i)=>`<button type="button" class="v3-chart-column" data-month-index="${i}" style="--h:${(m.count/max*100).toFixed(2)}%" title="${m.month}：${m.count}条有日期原始评论" aria-label="${m.month}：${m.count}条"><span class="v3-chart-bar"></span></button>`).join('')}</div><div class="v3-chart-axis"><span>${months[0]?.month||''}</span><span>有记录的月份（不补零）</span><span>${months[months.length-1]?.month||''}</span></div>`;
  const update=(n)=>{current=Math.min(months.length,Math.max(1,n));range.value=String(current);out.textContent=months[current-1]?.month||'';state.textContent=`已显影 ${current} / ${months.length} 个月份 · 最近记录 ${months[current-1]?.month||''}：${(months[current-1]?.count||0).toLocaleString('zh-CN')} 条`;
    shell.querySelectorAll('.v3-chart-column').forEach((el,i)=>{el.classList.toggle('visible',i<current);el.classList.toggle('last-visible',i===current-1);});};
  const stop=()=>{if(timer!==null)clearInterval(timer);timer=null;play.textContent='播放逐月显影 ▶';play.setAttribute('aria-pressed','false')};
  const start=()=>{stop();if(document.body.classList.contains('motion-paused')){state.textContent='动效已暂停，可拖动滑杆逐月查看';return}update(1);play.textContent='暂停播放 Ⅱ';play.setAttribute('aria-pressed','true');timer=setInterval(()=>{if(current>=months.length){stop();return}update(current+1)},170)};
  const onClick=e=>{if(e.target.closest('[data-month-play]')){timer===null?start():stop();return}if(e.target.closest('[data-month-reset]')){stop();update(months.length);return}const col=e.target.closest('[data-month-index]');if(col){stop();update(Number(col.dataset.monthIndex)+1);return}const motion=e.target.closest('#cover-motion-toggle');if(motion){document.querySelector('#motion-toggle')?.click();const paused=document.body.classList.contains('motion-paused');motion.textContent=paused?'开启动效':'暂停动效';if(paused)stop();}};
  const onInput=()=>{stop();update(Number(range.value))};
  shell.addEventListener('click',onClick);range.addEventListener('input',onInput);update(months.length);
  let ob=null;if('IntersectionObserver'in window){ob=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('is-revealed')}),{threshold:.10});shell.querySelectorAll('.reveal-on-read').forEach(x=>ob.observe(x));}else shell.querySelectorAll('.reveal-on-read').forEach(x=>x.classList.add('is-revealed'));
  let chartObserver=null; if('IntersectionObserver'in window){chartObserver=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting&&!autoPlayed){autoPlayed=true;if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.body.classList.contains('motion-paused'))start()}}},{threshold:[.25,.45]});chartObserver.observe(shell.querySelector('.v3-time-paper'));}
  return ()=>{stop();ob?.disconnect();chartObserver?.disconnect();shell.removeEventListener('click',onClick);range.removeEventListener('input',onInput)};
}
export function cinemaStory(data){
  const d=data.narrative,a=data.assets,registry=data.sceneRegistry;
  const q=(key)=>inlineEvidence(key,d);
  return `<article class="cinema-story">
    <div class="reading-progress" aria-hidden="true"><i id="reading-progress-bar"></i></div>
    <header class="reader-header"><a href="#/overview" aria-label="返回故事封面">新闻学还能学吗？</a><div><button id="reader-audio" aria-pressed="${!isMuted()}">${isMuted()?"开启环境音":"关闭环境音"}</button><button id="reader-motion">${document.body.classList.contains("motion-paused")?"开启动画":"暂停动画"}</button><a href="#/methods">来源</a></div></header>
    <section class="story-prologue reading-section" id="begin">
      <p class="opening-context">2026年，一则求职笔记。</p>
      <h1>一份简历，<br>指向整个专业。</h1>
      <div class="reading-copy"><p>一名新闻学应届毕业生，在专业对口岗位的求职中屡屡受挫。她有两段传统媒体实习经历。转投餐饮服务工作后，却又因新闻学专业背景遭拒。</p><p>这段经历被写成一篇小红书笔记。评论区里，有人留下了一句话。</p></div>
      <blockquote class="voice-large">“最尊重新传之人”</blockquote><div class="voice-credit">匿名评论 C19986 · 原始库快照 3,435赞</div>
      ${q("respect")}
      <div class="reading-copy continuation"><p>一句反讽，把求职困境变成对教育的质询。</p><p>调查追问：人们凭什么判断新闻传播教育？</p></div>
      <div class="sample-transition" aria-label="研究样本范围">
        <div class="sample-transition-heading"><span>从个案走向样本</span><p>一个人的经历，是进入故事的切口；研究的结论，来自更大的平台样本。</p></div>
        <div class="sample-ribbon"><div class="sample-figure"><span>研究笔记</span><b>2,134</b><small>篇笔记</small></div><div class="sample-figure"><span>原始采集</span><b>30,541</b><small>条评论及回复</small></div><div class="sample-figure"><span>语义分析</span><b>21,779</b><small>条语义有效评论</small></div></div>
        <div class="sample-analysis-track" role="img" aria-label="在30,541条原始评论中，有21,779条进入语义有效评论样本，约占71.3%"><div class="sample-track-labels"><span>原始评论中进入语义分析的比例</span><strong>71.3%</strong></div><div class="sample-track"><i></i></div></div>
        <div class="sample-citation">数据：小红书研究采集快照｜处理：清洗与语义有效性判定｜<a href="#/methods">核对方法与统计口径 ↗</a></div>
      </div>
    </section>
    <section class="reading-section paper-tone" id="attention">
      <div class="reading-copy"><p class="section-overline">声音，怎样聚到一起</p><h2>并不是每一场讨论，<br>都有同样的回声。</h2><p>八篇笔记，八条讨论轨迹。</p></div>
      ${sceneMarkup("race",d,registry)}
      <div class="reading-copy"><p>竞速呈现采集量，不是舆论支持率。</p><p class="quiet-source">这组原始库补充包含${fmt(d.race.eligibleComments)}条有日期评论、${fmt(d.race.eligibleNotes)}篇笔记。日期缺失记录不进入竞速，未采集到的讨论不作推断。</p></div>
    </section>
    ${employmentSection(d)}
    ${photo(a,"workbench","夜间的内容制作与核查工作台，纸张、录音工具与灯光。生成意象。","workbench-interlude")}
    ${abilitySection(d)}
    ${photo(a,"field","一位不可识别的采访者在普通街道观察记录，背影构图。生成意象。","field-interlude")}
    ${publicSection(d)}
    <section class="reading-section network-tone na-v35-reading" id="network">${networkArchive(d)}</section>
    <section class="reading-section path-tone rm39-host" id="rebuild">${mazeSection()}</section>
    <section class="cinema-ending" id="ending">${photo(a,"dawn","清晨的校园通道通向光线和树木。生成意象。")}<div class="ending-copy"><h2>新闻学还能学吗？</h2><p>这个问题，也许需要从<br>“它最后换来了什么”，<br>走向“它究竟让人学会了什么”。</p><div class="ending-links"><a href="#/evidence?topic=paper">回到真实评论</a><a href="#/lab">继续查证数据</a><a href="#/methods">翻阅尾卷：方法与回声</a></div><small>毛湛文 · 陈俊良<br>基于终版论文与平台目的性样本，不代表社会总体态度。<br>本文不替代个人升学或职业决策。</small></div></section>
  </article>`;
}
export function mountCinema(root,data){
  const disposeScenes=mountScenes(root);
  const disposeEmployment=mountEmployment(root,data.narrative);
  const disposePublic=mountPublic(root,data.narrative);
  const disposeAbility=mountAbility(root,data.narrative);
  const disposeNetwork=mountNetworkArchive(root,data.narrative);
  const disposeRebuild=mountRebuildMaze(root);let frame;
  const progress=()=>{
    cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
      const range=document.documentElement.scrollHeight-innerHeight;
      const bar=root.querySelector("#reading-progress-bar");if(bar)bar.style.width=(range>0?Math.min(100,scrollY/range*100):0)+"%";
    });
  };
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("has-entered")});
  },{threshold:.3});
  root.querySelectorAll(".training-path,.cinema-photo,.sample-transition").forEach(el=>observer.observe(el));
  const button=root.querySelector("#reader-motion");
  const toggle=()=>{document.querySelector("#motion-toggle")?.click();button.textContent=document.body.classList.contains("motion-paused")?"开启动画":"暂停动画"};
  const audioButton=root.querySelector("#reader-audio");
  const audioToggle=async()=>{await startAmbient();const muted=toggleMuted();if(!muted&&window.AtlasPixelAudio?.status().enabled)window.AtlasPixelAudio.setEnabled(false);audioButton.textContent=muted?"开启环境音":"关闭环境音";audioButton.setAttribute("aria-pressed",String(!muted))};
  let pointerFrame;
  const pointer={x:.5,y:.5};
  const cover=root.querySelector(".cinema-cover");
  const updatePointer=()=>{
    cancelAnimationFrame(pointerFrame);
    pointerFrame=requestAnimationFrame(()=>{
      root.style.setProperty("--pointer-x",pointer.x.toFixed(3));
      root.style.setProperty("--pointer-y",pointer.y.toFixed(3));
    });
  };
  const coverMove=e=>{
    if(document.body.classList.contains("motion-paused"))return;
    const r=cover?.getBoundingClientRect();if(!r)return;
    pointer.x=(e.clientX-r.left)/r.width-.5+.5;
    pointer.y=(e.clientY-r.top)/r.height-.5+.5;updatePointer();
  };
  const coverLeave=()=>{pointer.x=.5;pointer.y=.5;updatePointer()};
  const scrollParallax=()=>{
    cancelAnimationFrame(pointerFrame);
    pointerFrame=requestAnimationFrame(()=>{
      const y=Math.min(1,Math.max(-1,scrollY/Math.max(1,innerHeight)));
      root.style.setProperty("--scroll-parallax",y.toFixed(3));
      root.querySelectorAll(".cinema-photo").forEach((el,i)=>{
        const r=el.getBoundingClientRect(),center=(r.top+r.height/2-innerHeight/2)/innerHeight;
        el.style.setProperty("--photo-shift",Math.max(-.08,Math.min(.08,-center*.045+(i%2?.012:-.012))));
      });
    });
  };
  button?.addEventListener("click",toggle);audioButton?.addEventListener("click",audioToggle);window.addEventListener("scroll",progress,{passive:true});window.addEventListener("scroll",scrollParallax,{passive:true});cover?.addEventListener("pointermove",coverMove);cover?.addEventListener("pointerleave",coverLeave);progress();scrollParallax();
  return ()=>{disposeScenes();disposeEmployment();disposePublic();disposeAbility();disposeNetwork();disposeRebuild();stopAmbient();observer.disconnect();cancelAnimationFrame(frame);cancelAnimationFrame(pointerFrame);button?.removeEventListener("click",toggle);audioButton?.removeEventListener("click",audioToggle);window.removeEventListener("scroll",progress);window.removeEventListener("scroll",scrollParallax);cover?.removeEventListener("pointermove",coverMove);cover?.removeEventListener("pointerleave",coverLeave)};
}
