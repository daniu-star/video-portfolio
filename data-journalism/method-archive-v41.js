import {flourishEmbed} from "./flourish.js";
import {employmentDiagram} from "./employment.js";
import {escapeHTML as escape, fmt} from './charts.js';

const stages=[
 {name:'检索与整理',mark:'01',title:'被采集的讨论，不等于全体的声音。',detail:'使用50个搜索词，形成6,799篇唯一命中笔记的发现框；进一步清理与核验后，2,134篇笔记进入分析库。',basis:'样本属于目的性平台数字踪迹，受搜索词、排序、页面可见性及采集条件影响。',href:'#/lab'},
 {name:'清洗与筛选',mark:'02',title:'原始记录不是直接可用于语义分析的句子。',detail:'原始快照包含30,541条评论及回复。研究进一步确定21,779条语义有效评论；本网站不把简单关键词匹配冒充终版语义筛选。',basis:'原始数据库没有逐条终版语义有效标签，不能通过网页筛选开关重新生成这一分析语料。',href:'#/lab'},
 {name:'主题与编码',mark:'03',title:'分类是被检验的研究判断，不是自然事实。',detail:'采用语义主题发现与结构化编码，分析评价对象、评价依据及方向；论文报告分层抽样的人工审计。',basis:'编码是依据预设定义形成的结果，不意味着每条评论都只有一种可能的解释。',href:'#/evidence'},
 {name:'关系与比较',mark:'04',title:'不同分析分母回答不同问题。',detail:'696篇符合条件的笔记用于框架比较；1,959次能力提及用于专业能力表征分析。它们不能顺次当作同一个样本被逐层删减。',basis:'框架对照、能力统计与全量原始评论的统计单位不同，跨图比较须交代分母。',href:'#/story?section=ability'},
 {name:'回到原话',mark:'05',title:'统计能够提示结构，不能替代原始语境。',detail:'关联真实匿名评论与所属笔记。缺少直接回复关系、标题或日期时如实记录，不从其他内容补造对话。',basis:'网页经过基本隐私处理，但逐字评论仍可能被搜索反查；公开传播前需要伦理复核。',href:'#/evidence'}
];
const checks=[
 {q:'30,541条评论能够代表社会总体对新闻传播教育的态度吗？',answer:'no',proof:'不能。样本来自特定检索词和可访问页面，是目的性平台踪迹，不是概率抽样；不能推广到全体公众。',evidence:'原始评论 30,541 条',boundary:'不能推断全社会支持率或民意趋势。'},
 {q:'1,467次前台技能提及，可以说明它们在讨论中比核心能力更常被提到吗？',answer:'yes',proof:'可以，前提是准确限定统计对象：在1,959次显性能力提及中，前台技能出现1,467次，核心能力492次。',evidence:'1,467 / 1,959 = 74.9%',boundary:'不能推出前台技能在真实新闻实践中比核心能力重要。'},
 {q:'9次明确的“AI可替代”判断，可以证明AI已经替代了整个新闻专业吗？',answer:'no',proof:'不能。9次是平台评论中的明确判断，而且都落在前台技能组；它们不是技术替代能力的实验测量。',evidence:'明确AI可替代判断 9 次',boundary:'不能推出新闻学科或所有岗位已经被AI替代。'},
 {q:'在696篇符合条件的笔记里，评论区与笔记的主要议题是否可以进行配对比较？',answer:'yes',proof:'可以。研究在696篇符合条件的笔记中比较笔记与评论区共享框架的相对权重。',evidence:'696篇笔记 · 47条聚合框架流向',boundary:'这种配对比较并不是舆论随历史时间变化的因果测量。'}
];
const findings=[
 {id:'employment',title:'职业结果成为显眼的裁决尺度',sub:'就业结算',text:'就业问题常将对课程和专业的讨论重新框定，但起点未识别的记录不得写成明确的议题迁移。',url:'#/story?section=employment'},
 {id:'public',title:'支持与失望可以共享公共期待',sub:'公共价值',text:'对新闻真实性、公共责任的期待，也可能成为对既有实践提出质疑的依据。',url:'#/story?section=public'},
 {id:'ability',title:'容易看见的，不等于专业性的全部',sub:'可见性悖论',text:'前台技能占显性能力提及74.9%，采访、核查与解释等核心能力在公众话语中更不显眼。',url:'#/story?section=ability'},
 {id:'network',title:'判断从来不是由一种理由独自支撑',sub:'非对称证明',text:'评价对象与判断依据的组合，会改变我们看到的认可、否定及其讨论结构。',url:'#/story?section=network'}
];
const voiceKeys=[['reply_shift','从“就业”到“理想”的反问'],['public_criticism','对新闻真实性的质询'],['public_support','为什么仍需要记录现实'],['ai','当写作遇到AI'],['irony','短句如何成为反讽'],['respect','尊重与不看好的张力']];
function download(name,text){const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
export function methodArchiveV41(data,original){
 const s=data.summary,d=data.narrative,lookup=new Map(d.comments.map(c=>[c.id,c]));
 const archiveVoices=voiceKeys.map(([k,title])=>{const id=d.quotes[k],c=lookup.get(id);return c?{key:k,id,title,text:c.text,date:c.date,note:c.note}:null}).filter(Boolean);
 return `<article class="mp41" id="method-v41" aria-labelledby="mp41-title">
 <nav class="mp41-topnav" aria-label="尾卷目录"><a href="#/overview">争议档案</a><span>尾卷 / 09</span><div><a href="#mp41-trial">核验结论</a><a href="#mp41-reflections">拾取发现</a><a href="#mp41-ending">结语与回声</a></div></nav>
 <header class="mp41-hero"><div class="mp41-bookmark"><span>卷宗九</span><strong>研究方法<br>与最后的回声</strong><small>案卷并未合上。<br>它只在这里交还给读者。</small></div><div class="mp41-hero-copy"><div class="mp41-red-label">一份调查的最后一道工序</div><h1 id="mp41-title">当结论写下，<br><em>质询还没有结束。</em></h1><p>结论写下，追问未止。<b>这些数据，究竟能够证明到哪里？</b></p><div class="mp41-actions"><a href="#mp41-method" class="mp41-button primary">逐页检查方法 ↓</a><a href="#mp41-ending" class="mp41-button subtle">先读结语 ↘</a></div></div><figure class="mp41-hero-photo"><img src="./assets/archive-v3/lab-researcher-concept.jpg" alt="AI辅助概念视觉：研究者面对材料与屏幕，不代表真实研究现场"/><figcaption>工作台的意象 · AI辅助概念创作，非历史照片</figcaption><span class="mp41-photo-tag">材料仍在发问</span></figure><div class="mp41-hero-note" aria-hidden="true">结论<br>不是<br>句号。</div></header>
 <section class="mp41-ledger" aria-labelledby="mp41-ledger-title"><div class="mp41-section-intro"><span>阅读说明 / 不同统计单位</span><h2 id="mp41-ledger-title">同一项研究，有不同的分母。</h2><p>先认清分母。这不是一条过滤漏斗。</p></div><div class="mp41-ledger-grid"><article><small>原始快照</small><strong>30,541</strong><span>评论与回复</span></article><article><small>语义分析</small><strong>21,779</strong><span>语义有效评论</span></article><article><small>框架比较</small><strong>696</strong><span>符合条件的笔记</span></article><article><small>能力表征</small><strong>1,959</strong><span>显性能力提及</span></article></div><p class="mp41-ledger-foot">以上来自论文终版及网页研究快照。对应评论、笔记与能力提及三种统计单位；不能相互相减或作为同一条漏斗计算保留率。</p></section>
 <section id="mp41-method" class="mp41-method"><div class="mp41-section-intro"><span>工序 / 可逐页翻阅</span><h2>把分析的五道工序重新打开。</h2><p>点开工序，核对依据。</p></div><div class="mp41-method-layout"><div class="mp41-step-list" role="group" aria-label="研究工序">${stages.map((x,i)=>`<button class="mp41-step ${i===0?'active':''}" data-mp-step="${i}" aria-pressed="${i===0}"><span>${x.mark}</span><strong>${x.name}</strong><b aria-hidden="true">↗</b></button>`).join('')}</div><div id="mp41-step-result" class="mp41-step-result" aria-live="polite"></div></div></section>
 <section id="mp41-trial" class="mp41-trial"><div class="mp41-section-intro"><span>参与式实验 / 论断核验</span><h2>一条看似可信的结论，能走多远？</h2><p>判断四个论断：证据究竟能走多远？</p></div><div class="mp41-trial-area"><div class="mp41-claim-index" role="group" aria-label="选择待核验论断">${checks.map((x,i)=>`<button data-mp-claim="${i}" class="${i===0?'active':''}" aria-pressed="${i===0}"><span>案号 ${String(i+1).padStart(2,'0')}</span><strong>${escape(x.q)}</strong></button>`).join('')}</div><div class="mp41-claim-paper"><small id="mp41-claim-progress">尚未拆封的判读 0 / 4</small><h3 id="mp41-claim-question"></h3><p class="mp41-claim-prompt">以研究已披露的数据为限，你认为这句话可被支持吗？</p><div class="mp41-claim-buttons"><button data-mp-vote="yes">证据可以支持</button><button data-mp-vote="no">超出了证据范围</button></div><div id="mp41-claim-feedback" class="mp41-claim-feedback" aria-live="polite"></div></div></div></section>
 <section class="mp41-source"><div class="mp41-section-intro"><span>公开图表 / 从图返回来源</span><h2>从图表回到证据。</h2><p>先核对计数，再回看原文。</p></div><div class="mp41-source-links"><button data-mp-flourish="30501030">打开能力层级图 <span>1,959次提及 ↗</span></button><button data-mp-flourish="30509053">打开框架桑基图 <span>696篇笔记 ↗</span></button><a href="#/evidence">核对评论原文 ↗</a><a href="#/lab">进入数据实验室 ↗</a></div><div id="mp41-flourish" class="mp41-flourish" hidden></div><p class="mp41-source-small">两组研究图表已在本地重建，断网也可操作；对应的 Flourish 原工程仅供来源核对。</p></section>
 <details class="mp41-original" id="mp41-full-method"><summary>展开完整方法、样本对照与六项研究边界 <span>↓</span></summary><div class="mp41-original-body">${original}</div></details>
 <section id="mp41-reflections" class="mp41-reflections"><div class="mp41-section-intro"><span>最后的互动 / 个人阅读档案</span><h2>你想留下哪一个问题？</h2><p>选取发现，带走调查札记。</p></div><div class="mp41-discoveries">${findings.map(f=>`<button data-mp-save="${f.id}" aria-pressed="false"><small>${f.sub}</small><strong>${f.title}</strong><span>${f.text}</span><b>＋ 放入阅读档案</b></button>`).join('')}</div><div class="mp41-reading-file"><div><span class="mp41-ribbon">私人的阅读札记 · 非研究问卷</span><h3>你的最后一页</h3><p id="mp41-file-summary">尚未选择任何发现。你可以任选一项，也可以同时保存多项。</p></div><div class="mp41-reading-actions"><button data-mp-download>下载我的阅读档案 ↓</button><button data-mp-clear>重新选择 ↺</button></div></div></section>
 <section class="mp41-voices"><div class="mp41-section-intro"><span>余音 / 六份已核验的引述</span><h2>争论仍在继续。</h2><p>再听一条评论。</p></div><div class="mp41-voices-layout"><div class="mp41-voice-options" role="group" aria-label="选择匿名引文">${archiveVoices.map((x,i)=>`<button data-mp-voice="${i}" class="${i===0?'active':''}" aria-pressed="${i===0}">${String(i+1).padStart(2,'0')} · ${escape(x.title)}</button>`).join('')}</div><div class="mp41-voice-paper" id="mp41-voice-paper" aria-live="polite"></div></div></section>
 <footer id="mp41-ending" class="mp41-ending"><span class="mp41-overline">结语 / 仍未完成的公共追问</span><h2>新闻无学，<br><em>还是专业的学问<br>尚未被真正看见？</em></h2><p>“新闻无学”的诘问，迫使教育面对一种不再由文凭自动担保的信任。知识可以被传授，公共意义却须在查证、解释与担当中获得。新闻教育的价值，最终要由可检验的专业责任证明。</p><div class="mp41-ending-actions"><a href="#/overview">回到第一份档案 ↶</a><a href="#/story">重读完整调查 ↗</a><a href="#/evidence">重新核对原话 ↗</a></div><div class="mp41-credit"><span>《争议档案》 · 新闻传播教育的社会评价</span><span>毛湛文 · 陈俊良</span><small>目的性研究样本，不代表社会总体态度。AI概念视觉不是历史照片。</small></div></footer>
 </article>`;
}
export function mountMethodArchive(root,data){
 const shell=root.querySelector('#method-v41');if(!shell)return ()=>{};
 let active=0,voice=0;const read=new Set(),revealed=new Set();let iframe=null;
 const quotes=voiceKeys.map(([k,title])=>{const id=data.narrative.quotes[k],c=data.narrative.comments.find(c=>c.id===id);return {id,title,c}}).filter(x=>x.c);
 const stepOut=shell.querySelector('#mp41-step-result');
 function stepRender(){const x=stages[active];stepOut.innerHTML=`<div class="mp41-step-paper"><span>材料 / ${x.mark}</span><h3>${x.title}</h3><p>${x.detail}</p><div class="mp41-limit"><b>必须留下的边界</b><p>${x.basis}</p></div><a href="${x.href}">前往核对相关材料 ↗</a></div>`;shell.querySelectorAll('[data-mp-step]').forEach(b=>{let on=Number(b.dataset.mpStep)===active;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))})}
 let claim=0;function claimRender(){const x=checks[claim];shell.querySelector('#mp41-claim-question').textContent=x.q;shell.querySelector('#mp41-claim-progress').textContent=`已拆封 ${revealed.size} / 4 张论断`;shell.querySelectorAll('[data-mp-claim]').forEach(b=>{let on=Number(b.dataset.mpClaim)===claim;b.classList.toggle('active',on);b.classList.toggle('seen',revealed.has(Number(b.dataset.mpClaim)));b.setAttribute('aria-pressed',String(on))});const fb=shell.querySelector('#mp41-claim-feedback');fb.innerHTML=revealed.has(claim)?feedbackHTML(x,null):'<div class="mp41-unsealed">印鉴尚未揭开 · 请先作出判断。</div>'}
 function feedbackHTML(x,voted){return `<div class="mp41-feedback-proof"><span>研究材料的回答 · ${x.answer==='yes'?'在限定范围内可以支持':'不能由该材料推出'}</span><p>${x.proof}</p><div><b>数据证据</b>${x.evidence}</div><div><b>不可跨越的边界</b>${x.boundary}</div>${voted?`<small>${voted===x.answer?'你的判断与材料范围一致。':'你的判断与材料揭示不同；可以继续查看解释。'}</small>`:''}</div>`}
 function voiceRender(){const x=quotes[voice];if(!x)return;const snippet=x.c.text;const text=snippet.length>340?snippet.slice(0,340)+'……':snippet;shell.querySelector('#mp41-voice-paper').innerHTML=`<div class="mp41-voice-number">证词 ${String(voice+1).padStart(2,'0')} / ${quotes.length}</div><blockquote>“${escape(text)}”</blockquote><p>匿名评论 ${escape(x.id)} · ${escape(x.c.date||'日期未记录')} · 来自研究快照</p><div class="mp41-voice-verify"><a href="#/evidence?topic=paper">返回论文引文档案核对全文 ↗</a></div>`;shell.querySelectorAll('[data-mp-voice]').forEach(b=>{const on=Number(b.dataset.mpVoice)===voice;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))})}
 function fileRender(){const list=findings.filter(x=>read.has(x.id));shell.querySelector('#mp41-file-summary').textContent=list.length?`已保存 ${list.length} 项追问：${list.map(x=>x.sub).join('、')}。你可以继续选择，或导出本地阅读档案。`:'尚未选择任何发现。你可以任选一项，也可以同时保存多项。';shell.querySelectorAll('[data-mp-save]').forEach(b=>{const on=read.has(b.dataset.mpSave);b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));b.querySelector('b').textContent=on?'✓ 已放入，点击移除':'＋ 放入阅读档案'})}
 function onClick(e){
 const flowLink=e.target.closest?.('#mp41-flourish [data-em-link]');
 if(flowLink){
  const entry=data.narrative.migration.flows[Number(flowLink.dataset.emLink)];
  const slot=shell.querySelector('#mp41-flow-detail');
  if(entry&&slot){slot.textContent=`${entry.source} → ${entry.target}：${entry.value}篇。此图为696篇笔记的框架配对，并非历史时间变化。`;}
  shell.querySelectorAll('#mp41-flourish .em-ribbon').forEach(x=>x.classList.toggle('is-dim',x!==flowLink));
  flowLink.classList.add('is-highlight');return;
 }
 const b=e.target.closest('button');if(!b||!shell.contains(b))return;
 if(b.hasAttribute('data-mp-step')){active=Number(b.dataset.mpStep);stepRender()}
 if(b.hasAttribute('data-mp-claim')){claim=Number(b.dataset.mpClaim);claimRender()}
 if(b.hasAttribute('data-mp-vote')){const x=checks[claim],v=b.dataset.mpVote;revealed.add(claim);claimRender();shell.querySelector('#mp41-claim-feedback').innerHTML=feedbackHTML(x,v)}
 if(b.hasAttribute('data-mp-save')){const id=b.dataset.mpSave;read.has(id)?read.delete(id):read.add(id);fileRender()}
 if(b.hasAttribute('data-mp-clear')){read.clear();fileRender()}
 if(b.hasAttribute('data-mp-download')){const list=findings.filter(x=>read.has(x.id));const lines=['# 我的《争议档案》阅读札记','','> 此文档来自读者在本地网页的自主选择，不属于研究样本，也不代表调查结论。','',`创建日期：${new Date().toLocaleDateString('zh-CN')}`,'','## 我想继续核对的研究发现',...(list.length?list.flatMap(x=>[`### ${x.sub} · ${x.title}`,x.text,`继续阅读：${/^https?:$/.test(location.protocol)?location.origin+location.pathname:"当前网站"}${x.url}`,'']):['（没有选择任何发现）','']),'## 必须保留的研究边界','- 30,541条原始评论不是全体社会公众的随机抽样。','- 21,779条语义有效评论、696篇框架比较笔记、1,959次能力提及属于不同口径。','- 评论里的AI替代话语并不等于技术实际替代能力。','- 匿名原文仍可能被反向搜索，应遵守公开伦理要求。','',`来源：${data.summary.paperTitle}`,''];download('我的争议档案阅读札记.md',lines.join('\n'))}
 if(b.hasAttribute('data-mp-voice')){voice=Number(b.dataset.mpVoice);voiceRender()}
 if(b.hasAttribute('data-mp-flourish')){const id=b.dataset.mpFlourish,slot=shell.querySelector('#mp41-flourish');if(!slot.hidden && iframe===id){slot.hidden=true;slot.replaceChildren();iframe=null;return}iframe=id;slot.hidden=false;slot.innerHTML=`<div class="mp41-flourish-top"><span>本地数据图 · ${id}</span><a href="https://public.flourish.studio/visualisation/${id}/" target="_blank" rel="noopener noreferrer">核对来源 ↗</a><button data-mp-flourish-close>收起 ×</button></div>` + (id==='30501030'?flourishEmbed('ability'):`<div class="mp41-local-flow" aria-label="696篇笔记的离线桑基图，可点击流向">${employmentDiagram(data.narrative.migration)}</div><div id="mp41-flow-detail" aria-live="polite">选择一条连线，核对配对篇数。</div>`);slot.scrollIntoView({behavior:'smooth',block:'nearest'})}
 if(b.hasAttribute('data-mp-flourish-close')){const slot=shell.querySelector('#mp41-flourish');slot.hidden=true;slot.replaceChildren();iframe=null}
 }
 shell.addEventListener('click',onClick);stepRender();claimRender();voiceRender();fileRender();return ()=>shell.removeEventListener('click',onClick)
}
