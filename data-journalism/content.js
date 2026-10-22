import {fmt, escapeHTML as esc, bars, networkSVG, networkEdges} from "./charts.js";
import {flourishEmbed} from "./flourish.js";

export const chapters = [
  {id:"employment",title:"下游结算",rq:"RQ1",glyph:"◒",sub:"就业结果，如何反向审判整个培养过程？"},
  {id:"public",title:"公共价值",rq:"RQ1 / RQ3",glyph:"◐",sub:"同一套价值语言，为何既辩护又追责？"},
  {id:"ability",title:"可见性悖论",rq:"RQ2",glyph:"◉",sub:"被看见的技能，不等于被理解的专业。"},
  {id:"network",title:"非对称证明",rq:"RQ3",glyph:"⌘",sub:"否定有多重入口，肯定需要完整证据。"}
];
const findingTabs = id => `<nav class="tabs" aria-label="研究发现章节">${chapters.map(c=>`<a class="tab ${c.id===id?"active":""}" href="#/findings/${c.id}" ${c.id===id?'aria-current="page"':""}>${c.title}</a>`).join("")}</nav>`;
export const badge = (text="终版论文",type="paper")=>`<span class="source-badge ${type}">${text}</span>`;
export const source = (text,section) => `<div class="source-note">${text}${section?` · <button class="text-link" data-paper="${section}">查看论文原文</button>`:""}</div>`;
export const breadcrumb=(label,sub="")=>`<div class="breadcrumb"><a href="#/overview">研究档案</a><span>/</span><span>${label}</span>${sub?`<span>/</span><span>${sub}</span>`:""}</div>`;
export const pageHeader=(label,title,desc,tag=badge())=>`${breadcrumb(label)}<div class="page-header"><div><h1>${title}</h1><p>${desc}</p></div>${tag}</div>`;
export function quoteCard(c,n,{label="",excerpt=true}={}){
  if(!c)return "";
  return `<article class="quote-card"><div class="quote-top"><span><span class="anon-avatar" aria-hidden="true">匿</span>匿名评论 · ${esc(c.id)}</span><span>${esc(label|| (c.level===1?"一级评论":"回复"))}</span></div><blockquote class="${excerpt?"excerpt":""}">${esc(c.text||"（空文本记录）")}</blockquote><div class="quote-origin" title="${esc(n?.title)}">所属笔记 / ${esc(n?.title||"未恢复标题")}</div><div class="quote-footer"><span>♡ ${fmt(c.likes)} <span class="muted">赞 · 快照值</span></span><button data-comment="${c.id}">原文与讨论线程 <span aria-hidden="true">＋</span></button></div></article>`;
}
export function overview(data){
  const {summary:s,notes,commentsById,notesById}=data;
  const quote=commentsById.get(s.quotes.respect);
  return `<div class="page overview">
  <div class="overview-topline"><div class="page-kicker">平台争议中的专业合法性</div><span class="version">研究终版 / 交互档案</span></div>
  <section class="hero" aria-labelledby="overview-title">
    <div class="hero-copy"><p class="hero-eyebrow">一次关于教育价值的公共追问</p><h1 id="overview-title">新闻学<br>还能学吗<span class="question">？</span></h1>
    <p class="hero-summary">当就业前景、技术替代与公共期待交汇，<br>一个专业如何证明自身的价值？<br>从 30,541 条评论出发，进入争议背后的证据。</p>
    <div class="hero-buttons"><a class="button primary" href="#/findings/employment">进入研究发现</a><a class="text-link" href="#/lab">直接探索数据</a></div>
    <div class="hero-credit">毛湛文 · 陈俊良 &nbsp; / &nbsp; 新闻传播教育合法性研究</div></div>
    <div class="hero-art"><canvas id="note-field" aria-label="2,134篇样本笔记的空间索引，可用鼠标选取；键盘用户可通过数据实验室查看同样的笔记"></canvas><div class="orbit-label">2,134 篇笔记 / 争议的引力场</div><div class="field-tooltip"></div><div class="art-footer"><b>每个光点，对应一篇真实样本笔记</b>光点大小反映采集评论量；空间位置与轨道仅作视觉布局，不表示语义关系。</div></div>
  </section>
  <section class="stats-strip" aria-label="研究样本规模">
  ${[[s.paper.notes,"样本笔记","篇"],[s.paper.comments,"原始评论","条"],[s.paper.users,"参与用户","名"],[s.paper.semantic,"语义有效评论","条"]].map(([v,label,unit])=>`<div class="stat"><div class="stat-number">${fmt(v)}</div><span class="stat-label">${label}<span>${unit}</span></span></div>`).join("")}</section>
  <div class="overview-bottom"><div class="section-heading"><h2>四重错位，四个观察入口</h2><span>研究发现 / 选择章节深入</span></div>
  <div class="chapter-grid">${chapters.map(c=>`<a class="chapter-card" href="#/findings/${c.id}"><div class="chapter-meta"><span>${c.rq}</span><span class="chapter-glyph" aria-hidden="true">${c.glyph}</span></div><h3>${c.title}</h3><p>${c.sub}</p></a>`).join("")}</div>
  <div class="entry-row"><div class="preview-quote"><span class="inline-label">来自真实评论区</span><blockquote>“${esc(quote.text)}”</blockquote><small>匿名评论 ${quote.id} · 原始库 ${fmt(quote.likes)} 赞</small><button class="text-link" data-comment="${quote.id}" style="float:right">打开原始语境</button></div>
  <a class="entry-panel" href="#/evidence"><div><h3>不只有统计，还有具体的人声。</h3><p>读原文、看线程，理解同一专业<br>为何被置于不同的评价尺度之中。</p></div><span class="entry-symbol" aria-hidden="true">❞</span></a></div>
  ${source("样本规模依据终版论文；原始库笔记、评论与用户数核验一致。21,779 为论文语义有效语料，不是原始库条数。","design")}
  </div></div>`;
}
export function findings(id,data){
  if(!chapters.some(c=>c.id===id))id="employment";
  const s=data.summary;
  const q=(key,label)=>{const c=data.commentsById.get(s.quotes[key]);return quoteCard(c,data.notesById.get(c?.note),{label})};
  let body="";
  if(id==="employment")body=`
  <div class="finding-lead"><div><div class="page-kicker">就业前景至上</div><h2>讨论从教育出发，<br>却在就业结果中结算。</h2><p>课程是否有用、能力能否形成、专业是否值得学习——这些不同的问题，在评论区中不断被转换成同一个问题：毕业以后，能做什么？</p></div><div class="finding-figure"><div class="giant-number">40.9<small>%</small></div><div class="figure-label">符合框架分析条件的笔记中<br>评论区以就业职业为主导</div></div></div>
  <div class="panel"><div class="panel-heading"><h3>从培养过程，到结果审判</h3>${badge("概念路径 · 非流量图","")}</div><div class="flow-strip"><div class="flow-box"><b>课程与知识</b><small>原始讨论的多元起点</small></div><div class="flow-connector"></div><div class="flow-box"><b>评论区的转向</b><small>重新调用就业经验</small></div><div class="flow-connector"></div><div class="flow-box gold-box"><b>职业与市场结果</b><small>反向评判整个专业</small></div></div>
  <div class="split"><div><div class="dual-metric"><div><span class="duel-label">就业吸附系数均值</span><div class="value gold">+0.135</div><div class="caption">评论就业权重 − 笔记就业权重</div></div><div><span class="duel-label">转入就业框架</span><div class="value cyan">61.4<small>%</small></div><div class="caption">就业主导评论区中，来自其他框架</div></div></div></div>
  <p class="callout"><strong>不是“所有讨论都只谈就业”。</strong><br>在696篇满足条件的笔记中，就业框架表现出吸附效应，但仍存在课程、技术、公共价值等不同讨论路径。</p></div>${source("终版论文第四节（一）；框架分析 n=696。61.4%的分母仅为评论区最终以就业为主导的笔记，不是全部笔记。","employment")}</div>
  <div class="split wide"><section class="panel"><div class="panel-heading"><h3>评论区的主导框架</h3><small>占符合条件笔记的比例</small></div>${bars([["就业职业",40.9],["课程知识",22],["AI 平台",12.1],["能力训练",5.5],["升学报考",4],["公共价值",1.7],["专业身份",.6],["无单一主导",13.2]],45)}${source("分母 n=696；按论文已披露百分比绘制，显示值经四舍五入。","employment")}</section>
  <section class="panel"><div class="panel-heading"><h3>否定评价与哪些依据相关？</h3><small>模型优势比 OR</small></div><div class="model-row"><span>招聘、收入与市场结果<small>控制对象、评论层级与文本长度</small></span><strong>2.08</strong></div><div class="model-row"><span>反讽或玩梗<small>把复杂争议压缩为整体性裁定</small></span><strong>3.46</strong></div><div class="model-row"><span>市场结果 · 去除头部1%笔记</span><strong>1.91</strong></div><div class="model-row"><span>市场结果 · 去除头部5%笔记</span><strong>1.85</strong></div>${source("主模型基于16,533条方向明确评论，按笔记聚类。OR为优势比，不是概率倍数，也不表示因果关系。","employment")}</section></div>
  <div class="split">${q("irony","论文引述案例")}${q("respect","论文引述案例")}</div><div class="audit-box"><strong>保留来源差异：</strong>“酱香饼吃人才是新闻”在论文中为9,197赞，当前原始库为9,191赞。这里展示原始库快照；点赞仅代表互动可见性。</div>`;
  if(id==="public")body=`
  <div class="finding-lead"><div><div class="page-kicker">公共性专业价值的双向争夺</div><h2>同一种公共价值，<br>既是辩护，也是追责。</h2><p>真实性、社会责任与公共服务仍被承认。但当现实新闻实践没有兑现承诺，这套价值语言也会成为质疑专业合法性的依据。</p></div><div class="finding-figure"><div class="giant-number">双向</div><div class="figure-label">认同价值本身<br>不等于认同价值已被实现</div></div></div>
  <div class="split"><section class="panel"><div class="page-kicker">作为辩护依据</div><h3>“这些过程需要记录。”</h3><p>强调新闻职业的社会意义，为新闻传播教育提供可引用的正向理由。</p><div class="dual-metric"><div><span class="duel-label">认可评价 · OR</span><div class="value cyan">1.53</div><div class="caption">以公共价值为依据</div></div></div>${source("论文第四节（二）所报告模型结果。","public")}</section>
  <section class="panel"><div class="page-kicker">作为追责尺度</div><h3>承诺为何没有兑现？</h3><p>公共性也被用来审查新闻实践，专业宣称与实际表现的落差转化为否定证据。</p><div class="dual-metric"><div><span class="duel-label">否定评价 · OR</span><div class="value coral">1.72</div><div class="caption">同样以公共价值为依据</div></div></div>${source("这是另一评价方向的模型结果，不能把两项OR解释成互补概率。","public")}</section></div>
  <div class="panel"><div class="panel-heading"><h3>价值表达与互动可见性</h3><small>两阶段互动模型</small></div><div class="split"><div class="model-row"><span>至少获得1次点赞<small>第一阶段：是否发生互动</small></span><strong>2.07</strong></div><div class="model-row"><span>正值点赞数量<small>第二阶段：已有互动评论的强度</small></span><strong>1.70</strong></div></div>${source("左为优势比OR，右为发生率比IRR；来自论文报告，未重新拟合。可见性不等于赞同，更不能直接推出算法因果作用。","public")}</div>
  <div class="split">${q("public_support","公共价值的辩护")}${q("public_criticism","公共价值的追责")}</div>`;
  if(id==="ability")body=`
  <div class="finding-lead"><div><div class="page-kicker">能力表征与教育归属的错位</div><h2>越容易被看见，<br>越容易被认为可替代。</h2><p>写作、剪辑、运营构成了醒目的专业形象。采访、核查、社会解释等依赖长期训练的核心能力，却更少进入用户的显性讨论。</p></div><div class="finding-figure"><div class="giant-number">74.9<small>%</small></div><div class="figure-label">全部能力提及中<br>前台技能所占比例</div></div></div>
  <section class="panel"><div class="panel-heading"><h3>能力话语的可见性分布</h3><small>1,959段显性能力话语</small></div><div class="ability-band"><button data-ability="front" style="width:74.9%"><b>前台能力</b><small>1,467 / 74.9%</small></button><button data-ability="core" style="width:25.1%"><b>核心能力</b><small>492 / 25.1%</small></button></div><div id="ability-detail" class="callout"><strong>前台能力：</strong>平台运营与商业传播743次，基础内容生产724次。点击色带切换能力类别。</div>${source("统计单位是能力提及，不是独立用户或评论。核心能力五个子类未在正文分别披露数量，因此不虚构细分柱形图。","ability")}</section>
  <div class="split wide"><section class="panel"><div class="panel-heading"><h3>被提及，却很少被明确归类</h3><small>每格约代表1%的能力提及</small></div><div class="dot-matrix" aria-label="能力属性未说明97.1%，明确属性判断约2.9%">${Array.from({length:100},(_,i)=>`<i class="${i>96?"lit":""}"></i>`).join("")}</div><div class="dual-metric"><div><span class="duel-label">未说明能力属性</span><div class="value">1,902</div><div class="caption">占全部能力提及97.1%</div></div><div><span class="duel-label">明确属性判断</span><div class="value gold">57</div><div class="caption">仅占全部能力提及约2.9%</div></div></div>${source("方格为取整示意；准确计数分别为1,902与57。明确属性判断并不意味着都被认定为新闻专业独特能力。","ability")}</section>
  <section class="panel"><div class="panel-heading"><h3>57次明确判断如何分布？</h3><small>能力属性 / 次</small></div>${bars([["跨职业迁移",19],["大学通用",16],["AI 可替代",9],["专业独特",8],["AI 辅助强化",5]],20,"")}${source("五类属性合计57次；其中仅8次被明确判断为新闻专业独特能力。","ability")}</section></div>
  <div class="split"><section class="panel"><div class="page-kicker">人工智能替代焦虑</div><h3>9次“可由AI替代”判断，<br>全部指向前台技能。</h3><div class="dual-metric"><div><div class="value coral">7</div><div class="caption">基础内容生产</div></div><div><div class="value gold">2</div><div class="caption">平台运营与商业传播</div></div></div>${source("小样本描述，不代表AI对所有新闻岗位的实际替代率。前台技能获得明确属性判断的优势比约3.58。","ability")}</section>${q("ai","阅读完整评论，避免断章取义")}</div>`;
  if(id==="network")body=`
  <div class="finding-lead"><div><div class="page-kicker">专业合法性的非对称证明</div><h2>否定可以从一处开始，<br>肯定却要连接整个体系。</h2><p>同一专业同时面对就业、行业、技术与公共价值的检验。单一负面论据可能支撑整体否定，维护者则需要解释不同环节如何共同成立。</p></div><div class="finding-figure"><div class="giant-number">13<small>∶1</small></div><div class="figure-label">60组对象—依据关系中<br>超过70%否定／认可的关系数</div></div></div>
  <div class="panel"><div class="panel-heading"><h3>对象—依据：价值争夺的连接</h3><div class="network-mode" aria-label="网络方向筛选"><button class="active" data-network="all">全部</button><button data-network="认可">认可</button><button data-network="否定">否定</button></div></div><div id="network-view">${networkSVG()}</div><div class="legend"><span><i style="background:var(--cyan)"></i>报告的认可比例</span><span><i style="background:var(--coral)"></i>报告的否定比例</span><span>点击连线查看精确比例</span></div><div id="network-detail" class="network-detail"><strong>九组可追溯的关系，而非虚构完整网络。</strong>仅展示终版正文披露的9组对象—依据关系。连线等宽，未把百分比当作共现数量。</div>${source("第四节（四）；完整分析含60组关系。分母为各关系内的评价记录，不是全量30,541条评论。未披露的边不补造。","network")}</div>
  <div class="split"><section class="panel"><div class="panel-heading"><h3>理由分布：分散与集中</h3><small>标准化熵 / 越高越分散</small></div><div class="model-row"><span>否定评价依据</span><strong>0.944</strong></div><div class="model-row"><span>认可评价依据</span><strong>0.901</strong></div><div class="dual-metric"><div><span class="duel-label">认可前三依据占比</span><div class="value cyan">58.1<small>%</small></div></div><div><span class="duel-label">否定前三依据占比</span><div class="value coral">48.8<small>%</small></div></div></div>${source("两种立场都调用多样化理由；这里比较分布集中程度，而非给个体用户划分立场。","network")}</section>
  <section class="panel"><div class="panel-heading"><h3>回复仍谈同一对象，却换了依据</h3><small>高质量回复关系 n=2,253</small></div>${bars([["对象相同或相近",75.3],["首要依据一致",24.6]],100)}<p class="callout">讨论中的分歧不只来自“赞成还是反对”，也来自<strong>双方正在用不同的尺度评判同一个对象。</strong></p>${source("这是论文筛选后的2,253条高质量回复关系，不等于原始库全部回复。","network")}</section></div>
  <div class="split">${q("reply_shift","不同尺度的交锋")}<section class="panel"><div class="page-kicker">从析取式否定，到合取式肯定</div><h3>专业价值不能只靠<br>一条孤立的理由来证明。</h3><p>课程确有能力增值、能力能够进入职业实践、职业行动承担公共责任——这几条关系需要同时变得可见。</p><a href="#/rebuild" class="button">探索价值重塑路径</a>${source("论文对经验结果的理论解释，不是逻辑定律或因果估计。","network")}</section></div>`;
  if(id==="ability")body=body.replace('<section class="panel">',`${flourishEmbed("ability")}<section class="panel">`);
  if(id==="network")body=body.replace('<div class="panel">',`${flourishEmbed("relations")}<div class="panel">`);
  const next=chapters[(chapters.findIndex(c=>c.id===id)+1)%chapters.length];
  return `<div class="page">${pageHeader("四重错位","研究发现","从评价尺度、能力意象与互动关系，进入新闻传播教育的合法性争议。")}${findingTabs(id)}${body}<div class="chapter-navigation"><button class="text-link" data-paper="${id}">阅读本章论文原文</button><span>继续探索</span><a class="button ghost" href="#/findings/${next.id}">${next.title}</a></div></div>`;
}
export function evidencePage(data,state){
  const s=data.summary;
  return `<div class="page ea37-page">
  <div class="ea37-progress-rail" aria-hidden="true"><span>06 / 争议档案</span><i></i><span>评论证据</span></div>
  <header class="ea37-hero">
    <div class="ea37-hero-left"><p class="ea37-series">第六卷 · 原始材料查证室</p><div class="ea37-overline">声音有出处，判断有边界</div>
      <h1>请先读一条评论，<br><em>再决定你相信什么。</em></h1>
      <p class="ea37-hero-desc">读一句评论，先查它的来源。这里呈现的是可以逐条追索的匿名研究材料。</p>
      <div class="ea37-actions"><button type="button" class="ea37-ink-button" data-ea37-jump="investigate">打开调查桌 ↘</button><button type="button" class="ea37-text-button" data-ea37-jump="search">检索全部匿名记录 ↗</button></div>
      <div class="ea37-hero-scope">目的性平台样本 · 原始库快照 · 非实时、非随机抽样</div>
    </div>
    <div class="ea37-photo-assembly" aria-label="AI辅助概念影像，不代表真实历史现场"><div class="ea37-archive-image"></div><div class="ea37-photo-caption">文字是证据；图像仅用于表现调查档案的视觉气氛</div><div class="ea37-red-stamp" aria-hidden="true">有据<br>可循</div><div class="ea37-scribble" aria-hidden="true">不只看结果，还要回到语境。</div></div>
    <div class="ea37-hero-index"><span>馆藏快照</span><strong>${fmt(s.raw.comments)}</strong><span>条经过基本隐私处理的原始评论</span><small>其中论文核验引述案例 6 条 · 已恢复直接父评论关系 ${fmt(s.raw.restoredParents)} 条</small></div>
  </header>
  <section class="ea37-investigation" id="ea37-investigate" aria-labelledby="ea37-investigate-title">
    <div class="ea37-section-heading"><span class="ea37-number">I</span><div><p>先读材料 · 再查语境</p><h2 id="ea37-investigate-title">六份证词，等你打开。</h2></div><span class="ea37-faint-mark">逐条核对 / 论文引述</span></div>
    <p class="ea37-scene-intro">读原话，查笔记，并置比较。与语境，而不是替它们划分输赢。</p>
    <div class="ea37-investigation-grid">
      <div class="ea37-case-file">
        <nav id="ea37-case-tabs" class="ea37-case-tabs" aria-label="六份论文核验案例"></nav>
        <div id="ea37-case-content" class="ea37-case-content" aria-live="polite"></div>
      </div>
      <aside class="ea37-reading-desk" aria-label="证据并置调查工作台">
        <div class="ea37-desk-top"><b>证据对照台</b><button type="button" data-ea37-clear>清空对照</button></div>
        <p>选择两份评论，对照原文与语境。</p>
        <div id="ea37-desk-slots" class="ea37-desk-slots"></div>
        <div id="ea37-desk-findings" class="ea37-desk-findings" aria-live="polite">这里不计算「正确率」，也不把两则材料外推为总体立场。</div>
        <div class="ea37-desk-foot"><span id="ea37-reading-progress">调查进度 · 0 / 3</span><div id="ea37-progress-marks" aria-hidden="true"><i></i><i></i><i></i></div></div>
      </aside>
    </div>
  </section>
  <section class="ea37-search-section" id="ea37-search-area" aria-labelledby="ea37-search-title">
    <div class="ea37-section-heading"><span class="ea37-number">II</span><div><p>打开更多抽屉</p><h2 id="ea37-search-title">从具体字句，进入完整的匿名评论库。</h2></div></div>
    <div class="ea37-shelf-note"><span>关键词抽屉 / 非研究编码</span><p>下列分组按评论正文中的明确关键词检索。它不是 FASTopic 主题结果，也不是对用户的态度判定；一条评论可能进入多个抽屉。</p></div>
    <div class="filter-chips ea37-drawer-chips" aria-label="按关键词浏览匿名评论">${[["all","全部记录"],["paper","六份论文引述"],["employment","就业与职业"],["ai","AI 与技术"],["public","公共责任"],["education","课程与培养"]].map(([id,label])=>`<button class="chip ${state.topic===id?"active":""}" data-topic="${id}" aria-pressed="${state.topic===id}"><span class="ea37-chip-glyph">▤</span><span>${label}</span><small data-ea37-count="${id}"></small></button>`).join("")}</div>
    <div class="ea37-search-commands"><label class="search-wrap"><span class="ea37-input-label">在所有匿名档案中检索</span><input id="evidence-search" aria-label="搜索评论原文" placeholder="输入原文中的词、笔记题名或匿名档案编号…" value="${esc(state.q)}"></label><label class="ea37-sort-label">排序方式<select id="evidence-sort" aria-label="评论排序"><option value="curated">论文案例优先</option><option value="likes">点赞数从高到低</option><option value="date">记录日期从新到旧</option></select></label><button type="button" class="ea37-reset" data-reset>清除检索</button></div>
    <div class="ea37-results-head"><span>检索所得 · 匿名抄录</span><span>打开原文、核对线程，或添加到对照台</span></div>
    <div id="evidence-results"></div>
    ${source("原始库 comments 表；文字经基本脱敏，匿名编号不对应平台账号。原文仍可能被反向检索定位，请勿据此推断或公开个人身份。点赞为采集快照，不代表观点支持率。")}
  </section>
  <section class="ea37-limits" aria-labelledby="ea37-limits-title"><div class="ea37-limits-label">第三层：证据的边界</div><div><h2 id="ea37-limits-title">档案也有不能回答的问题。</h2><p>评论显示的是说话者留下的字句，不是其完整人生。原始快照只恢复了部分直接父子关系，其余回复最多能够定位到同一根线程，不能假造前后对话。笔记正文缺失时，也不能靠标题补出上下文。</p><div class="ea37-limits-links"><a href="#/methods">查看采集与匿名化方法 ↗</a><a href="#/lab">打开数据实验室 ↗</a><a href="https://public.flourish.studio/visualisation/30509053/" target="_blank" rel="noopener noreferrer">在 Flourish 查看框架流向 ↗</a></div><small>Flourish 图表基于696篇满足条件的笔记，和本页原始评论档案不是同一个统计分母。</small></div></section>
  </div>`;
}
export function labPage(data,state){
  const s=data.summary,raw=s.raw,paper=s.paper;
  return `<div class="page al38-page" id="al38-root">
  <div class="al38-topline"><span>调查工作室 / 第七份档案</span><span>样本经过选择，结论才有意义</span><span>07 — 09</span></div>
  <header class="al38-hero">
    <div class="al38-hero-copy"><div class="al38-part">07 <span>数据实验室</span></div><span class="al38-hero-meta">原始材料 · 统计口径 · 可复核的选择</span><h1>数据不是<br><em>天然的答案。</em></h1>
    <p class="al38-deck">我们如何从三万余条评论出发，决定哪些材料进入观察？每一次保留与排除，都会改变我们所能看见的讨论。</p>
    <div class="al38-hero-actions"><button type="button" class="al38-action-primary" data-al38-go="al38-bench">开始筛选实验 ↓</button><button type="button" class="al38-action-quiet" data-al38-go="al38-ledger">核对原始数据 ↗</button></div></div>
    <div class="al38-hero-image"><img src="./assets/archive-v3/lab-researcher-concept.jpg" alt="概念性拼贴：研究者面对多个屏幕整理材料，不是真实采集或研究现场照片"><div class="al38-image-label">图像为 AI 辅助概念插画，不是调查现场影像</div><span class="al38-image-mark">取样<br>并非<br>中立</span></div>
    <div class="al38-hero-caption">「当我们决定怎样阅读数据，我们也在决定什么会进入叙事。」</div>
  </header>
  <section class="al38-register" aria-label="样本来源基线"><div><small>原始笔记</small><strong>${fmt(raw.notes)}</strong><span>篇 · 记录</span></div><div><small>原始评论</small><strong>${fmt(raw.comments)}</strong><span>条 · 含回复</span></div><div><small>有发表日期</small><strong>${fmt(raw.datedComments)}</strong><span>条 · 非完整时序</span></div><div><small>语义有效语料</small><strong>${fmt(paper.semantic)}</strong><span>条 · 独立清洗口径</span></div></section>
  <section class="al38-workbench" id="al38-bench"><div class="al38-section-title"><span class="al38-index">01</span><div><small>读者实验：改变材料的边界</small><h2>同一份数据库，<br>你会留下哪些记录？</h2></div><p>改变筛选条件，观察样本变化；此实验不等于论文语义清洗。</p></div>
    <div class="al38-bench-grid"><div class="al38-filter-desk"><div class="al38-desk-heading"><strong>选择你的筛选条件</strong><span>可组合 · 可撤回</span></div>
      <fieldset class="al38-fieldset"><legend>一、评论层级</legend><div class="al38-choice-row"><button type="button" class="al38-choice active" data-al38-level="all" aria-pressed="true">全部评论</button><button type="button" class="al38-choice" data-al38-level="1" aria-pressed="false">只看一级评论</button><button type="button" class="al38-choice" data-al38-level="2" aria-pressed="false">只看回复</button></div></fieldset>
      <fieldset class="al38-fieldset"><legend>二、记录完整性</legend><div class="al38-check-group"><label class="al38-toggle"><input type="checkbox" id="al38-date-only"><span class="al38-toggle-track"></span><span>只保留有发表日期的评论<small>时间缺失的记录会被排除</small></span></label><label class="al38-toggle"><input type="checkbox" id="al38-text-only"><span class="al38-toggle-track"></span><span>只保留非空文本<small>只按正文是否非空判断，不等于语义有效</small></span></label></div></fieldset>
      <label class="al38-keyword-label" for="al38-keyword">三、试着指定一个话语词</label><div class="al38-query-row"><input id="al38-keyword" type="search" placeholder="如：就业、记者、人工智能" autocomplete="off" maxlength="50"><button type="button" data-al38-example="就业">就业</button><button type="button" data-al38-example="记者">记者</button><button type="button" data-al38-example="">清除</button></div><p class="al38-micro">按评论原文中的字面字符串匹配；不是主题模型分类，也不意味着出现某词就持有某种立场。</p>
      <div class="al38-desk-foot"><button class="al38-action-primary" type="button" data-al38-reset>恢复全部原始评论 ↺</button><button class="al38-text-action" type="button" data-al38-sync>将筛选条件带入下方档案表 ↓</button><button class="al38-text-action" type="button" data-al38-report>保存本次实验单 ↗</button></div>
    </div><div class="al38-live-sheet" aria-live="polite"><div class="al38-sheet-kicker">即时结果 · 当前观察窗口</div><div class="al38-live-number"><strong id="al38-current">30,541</strong><span>条记录</span></div><p id="al38-share">占30,541条原始评论的100.0%</p><div class="al38-retained"><div id="al38-retained-bar"></div></div>
     <div class="al38-origin-label">原始库 30,541条 <span>← 当前保留范围</span></div><div class="al38-composition"><div class="al38-composition-head">目前留下的记录，由谁构成？</div><div id="al38-composition-bar" class="al38-comp-bar"></div><div id="al38-comp-legend" class="al38-comp-legend"></div></div>
     <div class="al38-difference" id="al38-difference">尚未改变条件，所有评论都在观察窗口内。</div><div class="al38-non-equivalence"><b>请留意这个区别</b><p>本次筛选操作处理的是原始档案。研究论文的21,779条“语义有效评论”来自另一套清洗与判定过程，不能由这些按钮直接还原。</p></div>
    </div></div>
  </section>
  <section class="al38-time" id="al38-time"><div class="al38-section-title"><span class="al38-index">02</span><div><small>历时证据与缺失</small><h2>日期的空白，<br>也在改变图形。</h2></div><p>仅呈现样本中有日期的记录，不代表平台总体热度。</p></div>
    <div class="al38-time-header"><div><strong id="al38-month-title">2021-10</strong><span id="al38-month-count">该月有149条记录</span></div><div class="al38-time-controls"><button type="button" id="al38-play" aria-pressed="false">▶ 播放月份</button><button type="button" id="al38-time-reset">回到起点 ↺</button></div></div><div class="al38-chart-shell"><div id="al38-month-chart" class="al38-month-chart" role="group" aria-label="按发表月份统计的原始评论条数，可按筛选条件更新"></div><div class="al38-time-axis"><span>2021年10月</span><span>2026年7月</span></div><label class="al38-time-slider-label" for="al38-time-slider">翻阅有记录的月份 <output id="al38-time-progress">1 / 48</output></label><input type="range" id="al38-time-slider" min="0" max="47" step="1" value="0" aria-label="选择有记录的月份"></div>
    <div class="al38-time-foot"><p id="al38-dated-footnote"></p><button type="button" class="al38-text-action" data-al38-month-to-table>查看这个月的原始记录 ↗</button></div><details class="al38-flourish-notice"><summary>Flourish 图表工程与来源口径</summary><p>Flourish 月度柱形图项目 <a target="_blank" rel="noopener noreferrer" href="https://app.flourish.studio/visualisation/30640372/edit">30640372（制作端编辑链接）</a> 已创建并完成字段绑定及入场动画设置，尚未发布为公开嵌入。上方按筛选条件实时变化的交互图由本地代码驱动，不能称为已发布的 Flourish 图表。</p></details>
  </section>
  <section class="al38-voice" id="al38-voices"><div class="al38-section-title"><span class="al38-index">03</span><div><small>观察窗口之外的声音</small><h2>你的筛选，<br>会留下谁的声音？</h2></div><p>六份论文引文，检验你的筛选。</p></div><div id="al38-voice-grid" class="al38-voice-grid"></div><p class="al38-micro">此处仅显示六份论文引述案例是否符合当前筛选，不用它们的命中情况代表30,541条评论的总体立场。</p></section>
  <section class="al38-ledger" id="al38-ledger"><div class="al38-section-title"><span class="al38-index">04</span><div><small>原始记录与数据核对</small><h2>不要只相信图表。<br>回到每一条记录。</h2></div><p>按相同口径核对原始记录，支持检索与导出。</p></div>
    <div class="al38-ledger-toolbar"><div class="tabs" aria-label="数据表类型"><button class="tab ${state.mode==="comments"?"active":""}" data-mode="comments">评论表</button><button class="tab ${state.mode==="notes"?"active":""}" data-mode="notes">笔记表</button></div><button class="al38-action-primary" type="button" data-export="csv">导出筛选结果 CSV ↓</button></div>
    <div class="al38-original-toolbar"><label>在当前表中检索<input id="lab-search" aria-label="检索当前数据表" placeholder="评论正文、匿名编号、笔记标题" value="${esc(state.q)}"></label><label>评论层级<select id="lab-level"><option value="all">全部层级</option><option value="1">一级评论</option><option value="2">回复记录</option></select></label><label>发表月份<select id="lab-month"><option value="">所有月份</option><option value="unknown">日期未记录</option>${s.months.map(m=>`<option value="${m.month}">${m.month}</option>`).join("")}</select></label><button type="button" class="al38-outline" data-reset>清除表格筛选</button></div>
    <div id="lab-results"></div><div class="al38-ledger-boundary"><b>查证边界</b>所有评论编号均是匿名档案编号；点赞数来自采集快照。本文的样本是目的性采集，缺失数据、时间覆盖不均及未恢复的上下文均会影响观察结果。<a href="#/methods">阅读完整方法与边界 ↗</a></div>
  </section>
  <div class="al38-footer-strip">你调整的不是现实本身，而是从哪些材料出发理解现实。<span>争议档案 · 第七章</span></div>
 </div>`;
}

export const chainStages=[
  {title:"课程",sub:"打开培养黑箱",headline:"让训练过程留下证据。",description:"不只说明开了哪些课，还要解释课程如何改变学生处理事实、问题与责任的方式。",items:["采访：信源清单、遴选理由与交叉核验","写作与编辑：事实依据、论据强度与公共关联","智能传播：数据来源、模型使用与人工复核记录"]},
  {title:"能力",sub:"呈现专业增值",headline:"把核心能力变得可见。",description:"从作品是否完成，转向观察能力如何形成。让采访、核查、解释和伦理判断成为可以展示的学习成果。",items:["采访材料与信源处理说明","事实核查路径与证据比对记录","议题分析、伦理风险识别与判断说明"]},
  {title:"职业",sub:"连接实践场景",headline:"说明能力如何跨场景应用。",description:"职业去向越多元，越需要解释不同岗位共享的能力基础，而不是只用一次求职结果裁定教育价值。",items:["采访与信源能力介入公共事务","事实核查能力服务平台治理","社会解释与伦理判断进入组织沟通和技术应用"]},
  {title:"公共价值",sub:"让责任可以检验",headline:"从抽象宣称，到可复核的行动。",description:"把真实性与社会责任嵌入训练和评价，让教育价值在持续的选择、核验与自我修正中获得证明。",items:["业界导师评价与真实受众反馈","勘误修正记录与责任说明","课程、能力、职业与公共责任的持续反馈"]}
];
export function chainContent(index){
  const c=chainStages[index];
  return `<div><div class="page-kicker">${c.sub}</div><h3>${c.headline}</h3><p>${c.description}</p></div><ul class="evidence-list">${c.items.map(i=>`<li>${i}</li>`).join("")}</ul>`;
}
export function rebuildPage(){
  return `<div class="page">${pageHeader("价值重塑","从不可见，到可证成。","不止修补某门课程，而是重建课程、能力、职业与公共价值之间的可识别链条。")}
  <div class="rebuild-intro"><h2>教育的价值，<br>需要一条完整的证据链。</h2><p>“合取式肯定”不是要求单一环节承担全部证明，而是让培养过程、专业增值、职业实践与公共责任相互连接。下方把论文的改革讨论拆解为四个可探索的环节。</p></div>
  <div class="chain" aria-label="培养证据链">${chainStages.map((c,i)=>`<button class="${i===0?"active":""}" data-chain="${i}" aria-pressed="${i===0}"><span>培养链条 ${i+1} / 4</span><strong>${c.title}</strong><small>${c.sub}</small></button>`).join("")}</div>
  <section class="panel"><div id="chain-content" class="chain-content">${chainContent(0)}</div>${source("依据论文第五节归纳的改革路径，是研究建议，不是已实施项目或已验证成效。","rebuild")}</section>
  <div class="section-heading"><h2>三个彼此衔接的改革方向</h2><span>论文第五节</span></div><div class="path-grid"><article class="path-block"><h3>打开培养黑箱</h3><p>建立开放透明的培养链条。以过程性成果说明课程如何形成能力、能力如何进入实践。</p></article><article class="path-block"><h3>让公共价值进入训练</h3><p>把核查、伦理权衡与责任承担细化为可反复操练、可考核的专业动作。</p></article><article class="path-block"><h3>形成持续反馈</h3><p>连接院校、行业与社会评价。既避免唯就业指标，也不追逐每一次舆情热点。</p></article></div>
  <div class="callout"><strong>不是用一个新指标取代旧指标。</strong><br>面向未来的评价机制，应对就业环境与技术变化保持敏感，同时维护新闻传播教育的长期知识基础与公共责任。</div>
  <div class="chapter-navigation"><button class="text-link" data-paper="rebuild">阅读价值重塑章节原文</button><a href="#/findings/network" class="button ghost">回到非对称证明</a></div></div>`;
}
export function methodsPage(data){
  const s=data.summary;
  return `<div class="page">${pageHeader("方法与边界","证据从哪里来，能说明什么？","以可核对的来源、明确的分母和保留的限制，构成这个研究档案的基础。",badge("来源透明",""))}
  <div class="panel"><div class="page-kicker">唯一解释框架 · 用户指定终版</div><h2 style="font-family:var(--serif);font-size:27px">“新闻学还能学吗？”：<br>平台用户争议中的新闻传播教育合法性及价值重塑</h2><p>毛湛文 · 陈俊良</p><div class="drawer-toolbar"><button class="button small" data-paper="abstract">阅读摘要</button><button class="button small ghost" data-paper="design">研究设计原文</button><button class="button small ghost" data-paper="appendix">方法附录</button></div></div>
  <div class="method-grid"><section class="panel"><div class="panel-heading"><h3>从原始记录，到研究解释</h3><small>论文分析流程</small></div>
  ${[
    ["检索与数据治理","50个搜索词，14,789条命中记录，涉及6,799篇唯一笔记；页面访问、去重与关系核验后，2,134篇笔记进入分析库。"],
    ["主题发现","对语义有效评论进行FASTopic主题发现；比较不同主题数，并以替代模型和人工审读复核。"],
    ["结构化编码","区分评价对象、评价依据与方向；全量编码后，以3轮共760条分层样本进行人工审计。"],
    ["框架迁移","在696篇符合条件的笔记上，比较笔记与评论区的共享框架权重。"],
    ["符号网络与回复","关联对象和依据，比较理由分布；在可恢复上文的回复中观察评价尺度如何延续或转移。"]
  ].map(([h,p],i)=>`<div class="method-step"><span>${String(i+1).padStart(2,"0")}</span><div><h3>${h}</h3><p>${p}</p></div></div>`).join("")}${source("统计方法与参数以终版及其附录为准。网页没有重新训练主题模型、重新编码或重新拟合统计模型。","appendix")}</section>
  <section class="panel"><div class="panel-heading"><h3>论文与原始库核对</h3><small>不混用统计口径</small></div><table class="reconcile"><thead><tr><th>指标</th><th>论文</th><th>原始库</th></tr></thead><tbody>${[["笔记",2134,s.raw.notes],["原始评论",30541,s.raw.comments],["参与用户",22946,s.raw.uniqueAuthors],["一级评论",19653,s.raw.rootComments],["回复",10888,s.raw.replies],["语义有效评论",21779,null]].map(([l,p,r])=>`<tr><td>${l}</td><td>${fmt(p)}</td><td>${r===null?"无对应标记":fmt(r)}</td></tr>`).join("")}</tbody></table><div class="audit-box"><strong>已发现并保留差异</strong><br>案例评论“酱香饼吃人才是新闻”：论文9,197赞，原始库9,191赞。<br>原始库直接父评论可匹配${fmt(s.raw.restoredParents)}条回复；论文使用额外关系恢复流程。网页不把根线程关系冒充直接回复。</div><p class="source-note">原始库：<code>xhs_crawler/data/原始数据.db</code><br>网页快照生成：${new Date(s.builtAt).toLocaleDateString("zh-CN")}<br>评论发表日期：2021-10-27 至 2026-07-31（有日期记录）<br>网页是冻结快照，不会自动重新抓取小红书。</p></section></div>
  <section class="method-section"><h2>阅读这些结果前，请保留六条边界。</h2>
  ${[
    ["样本不是总体","语料来自关键词检索与可访问页面，受搜索排序、页面可见性和采集来源影响。它是目的性平台数字踪迹样本，不代表全部小红书用户、新闻传播学生或社会公众。"],
    ["原始评论不是语义有效评论","原始库30,541条评论中，论文最终判定21,779条语义有效。原始库没有终版语义标签，本站不提供伪造的“仅有效语料”开关，也不把简单关键词匹配当作论文模型分类。"],
    ["点赞不是赞同，相关不是因果","点赞与回复表示互动可见性。OR是优势比，不是概率倍数；IRR是发生率比。控制变量与稳健性分析也不能自动证明因果关系。"],
    ["图形没有补造未披露数字","研究发现图表按正文明确数值重绘。网络仅展示已披露的9组关系；核心能力的五个子类没有逐一虚构计数。首页光点一对一映射真实笔记，但空间位置、轨道与旋转不代表主题距离或时间演化。"],
    ["匿名化不等于绝对不可识别",`原始账号、头像、IP、原始ID与访问凭证不进入网页。正文中匹配到的@用户、电话、邮箱、链接和证件号码经过隐藏（${fmt(s.raw.redactedComments)}条评论发生处理）。自然语言仍可能透露身份线索，逐字引文也可能被搜索反查；进一步公开传播前应做人工伦理审查。`],
    ["缺失与线程关系如实呈现",`${fmt(s.raw.comments-s.raw.datedComments)}条评论日期缺失，${s.raw.missingLikes}条点赞数缺失，${s.raw.missingTitles}篇笔记标题未恢复。直接父评论与根线程使用不同标注；缺少上文时不会用其他评论补造对话。`]
  ].map(([title,text])=>`<details class="disclosure"><summary>${title}</summary><p>${text}</p></details>`).join("")}</section>
  <div class="method-section"><div class="section-heading"><h2>来源与可复算性</h2><button class="text-link" data-export="provenance">下载来源说明 JSON</button></div><p class="scope-note">论文文件：${esc(s.paperFile)}<br>数据构建脚本：<code>tools/build_data.py</code>（只读数据库）<br>原始ID与网页编号映射仅保留在本地 private 目录，不随网站发布。历史分析目录存在不同口径的中间结果，未作为终版图表数据来源。</p></div>
  </div>`;
}
