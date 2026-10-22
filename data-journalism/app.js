import {fmt,escapeHTML as esc,mountNoteField,networkSVG,networkEdges} from "./charts.js";
import {overview,findings,evidencePage,labPage,rebuildPage,methodsPage,quoteCard,chainContent} from "./content.js";
import {narrativeOverview,mountStory} from "./story.js";
import {setupFlourish} from "./flourish.js";
import {cinemaCover,cinemaStory,mountCinema,mountCover} from "./cinema-v2.js";
import {startAmbient,stopAmbient} from "./audio-v2.js";
import {methodArchiveV41,mountMethodArchive} from "./method-archive-v41.js";
setupFlourish();
window.addEventListener("atlas:pixel-music",()=>stopAmbient());

const main=document.querySelector("#main"),dialog=document.querySelector("#detail-dialog");
const content=document.querySelector("#detail-content");
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
let paused=reducedMotion.matches;
try{paused=paused||localStorage.getItem("atlas-motion")==="paused"}catch{}
let data=null,disposeField=null,currentPath="",lastFocused=null,toastTimer=null;
let dialogRoutePushed=false;
const state={q:"",topic:"all",sort:"curated",page:1,mode:"comments",level:"all",month:"",hideEmpty:false,labDatedOnly:false,labTextOnlyQuery:false,sortKey:"likes",sortDir:"desc"};
const validRoutes=new Set(["overview","story","findings","evidence","lab","rebuild","methods"]);
const terms={
  employment:/就业|工作|工资|薪资|招聘|求职|实习|岗位|职业|大厂|找工|收入|offer/i,
  ai:/\bai\b|人工智能|大模型|chatgpt|deepseek|豆包|替代|智能|自动化/i,
  public:/公共|社会责任|真实性|核查|监督|记者|真相|记录|新闻理想|新闻已死|断章取义/,
  education:/课程|课堂|培养|教育|老师|教学|专业课|写作|采访|剪辑|考研|学科/
};

function showToast(text){
  const el=document.querySelector("#toast");el.textContent=text;el.classList.add("visible");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("visible"),3300);
}
function motionUI(){
  document.body.classList.toggle("motion-paused",paused);
  const btn=document.querySelector("#motion-toggle");
  btn.textContent=paused?"开启动态":"暂停动态";btn.setAttribute("aria-pressed",String(paused));
  btn.title=paused?"开启持续动态效果":"暂停持续动态效果";
}
document.querySelector("#motion-toggle").addEventListener("click",()=>{
  paused=!paused;motionUI();try{localStorage.setItem("atlas-motion",paused?"paused":"active")}catch{}
});
reducedMotion.addEventListener("change",e=>{if(e.matches){paused=true;motionUI()}});
motionUI();
document.querySelector("#menu-toggle").addEventListener("click",()=>{
  const sidebar=document.querySelector("#sidebar"),open=sidebar.classList.toggle("open");
  document.querySelector("#menu-toggle").setAttribute("aria-expanded",String(open));
});
document.querySelector(".skip-link").addEventListener("click",e=>{e.preventDefault();main.focus()});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    document.querySelector("#sidebar").classList.remove("open");
    document.querySelector("#menu-toggle").setAttribute("aria-expanded","false");
  }
});

function routeInfo(){
  const [rawPath,query=""]=(location.hash.slice(1)||"/overview").split("?");
  const segments=rawPath.replace(/^\/+/,"").split("/");
  return {path:rawPath,route:segments[0],chapter:segments[1]||"employment",params:new URLSearchParams(query)};
}
function syncState(p,route){
  state.q=p.get("q")||"";
  state.topic=["all","paper",...Object.keys(terms)].includes(p.get("topic"))?p.get("topic"):"all";
  state.month=p.get("month")||"";
  state.level=["1","2"].includes(p.get("level"))?p.get("level"):"all";
  state.mode=p.get("mode")==="notes"?"notes":"comments";
  state.sort=["curated","likes","date"].includes(p.get("sort"))?p.get("sort"):"curated";
  state.sortKey=["likes","date","id","comments","commentLikes"].includes(p.get("sortKey"))?p.get("sortKey"):"likes";
  state.sortDir=p.get("dir")==="asc"?"asc":"desc";
  state.hideEmpty=p.get("nonempty")==="1";
  state.labDatedOnly=p.get("dated")==="1";
  state.labTextOnlyQuery=p.get("qscope")==="text";
  state.page=Math.max(1,parseInt(p.get("page")||"1",10)||1);
}
function writeViewState(){
  const {path,route,params:existing}=routeInfo(),p=new URLSearchParams();
  for(const kind of ["comment","note","paper"])if(existing.has(kind))p.set(kind,existing.get(kind));
  if(state.q)p.set("q",state.q);
  if(state.page>1)p.set("page",state.page);
  if(route==="evidence"){
    if(state.topic!=="all")p.set("topic",state.topic);
    if(state.sort!=="curated")p.set("sort",state.sort);
  } else if(route==="lab"){
    if(state.mode!=="comments")p.set("mode",state.mode);
    if(state.month)p.set("month",state.month);
    if(state.level!=="all")p.set("level",state.level);
    if(state.hideEmpty)p.set("nonempty","1");
    if(state.labDatedOnly)p.set("dated","1");
    if(state.labTextOnlyQuery)p.set("qscope","text");
    if(state.sortKey!=="likes")p.set("sortKey",state.sortKey);
    if(state.sortDir!=="desc")p.set("dir",state.sortDir);
  }
  history.replaceState(null,"",`#${path}${p.size?"?"+p:""}`);
}
function openDetail(kind,id){
  if(!dialog.open)lastFocused=document.activeElement;
  const r=routeInfo();
  r.params.delete("comment");r.params.delete("note");r.params.delete("paper");
  r.params.set(kind,id);
  if(dialog.open){
    history.replaceState(null,"",`#${r.path}?${r.params}`);
    renderRoute();
  }else{
    dialogRoutePushed=true;
    location.hash=`${r.path}?${r.params}`;
  }
}
function closeDetail(){
  if(dialogRoutePushed){dialogRoutePushed=false;history.back()}
  else{
    const r=routeInfo();["comment","note","paper"].forEach(k=>r.params.delete(k));
    history.replaceState(null,"",`#${r.path}${r.params.size?"?"+r.params:""}`);
    dialog.close();
  }
}
dialog.addEventListener("cancel",e=>{e.preventDefault();closeDetail()});
dialog.addEventListener("click",e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left)closeDetail()}});
dialog.addEventListener("close",()=>{
  document.body.style.overflow="";
  if(lastFocused?.isConnected)lastFocused.focus({preventScroll:true});
});
function drawer(title,inner){
  content.innerHTML=`<div class="drawer-head"><span>研究档案 / 嵌套证据视图</span><button data-close aria-label="关闭详情">关闭 ×</button></div><div class="drawer-body"><h2 id="detail-title">${title}</h2>${inner}</div>`;
  if(!dialog.open){dialog.showModal();document.body.style.overflow="hidden"}
  dialog.scrollTop=0;
}
function renderComment(id){
  const c=data.commentsById.get(id);
  if(!c){drawer("未找到评论",`<p>这个匿名档案编号不在当前快照中。</p>`);return}
  const n=data.notesById.get(c.note),parent=data.commentsById.get(c.parent);
  const root=c.root&&c.root!==c.id?data.commentsById.get(c.root):null;
  const direct=data.children.get(c.id)||[];
  const threadKey=c.level===1?c.id:c.root;
  const thread=(data.threads.get(threadKey)||[]).filter(x=>x.id!==c.id&&!direct.includes(x));
  const item=(r,label)=>`<article class="thread-item"><small>${label} · ${r.id} · ${r.date||"日期未记录"}</small><p>${esc(r.text||"（空文本）")}</p><button data-comment="${r.id}">展开这条评论</button><small style="float:right">${fmt(r.likes)} 赞</small></article>`;
  const discrepancy=id===data.summary.quotes.irony?`<div class="audit-box">论文引述此评论为9,197赞；当前原始库为9,191赞。这里保留快照差异。</div>`:"";
  drawer(`评论档案 ${esc(c.id)}`,`
    <div class="drawer-meta"><span>匿名评论</span><span>${c.level===1?"一级评论":"回复记录"}</span><span>${c.date||"发表日期未记录"}</span><span>${fmt(c.likes)} 赞（快照）</span></div>
    <blockquote class="full-comment">${esc(c.text||"（原始记录无文本）")}</blockquote>${discrepancy}
    <div class="drawer-toolbar"><button class="button small" data-copy-comment="${c.id}">复制匿名引文</button><button class="button small ghost" data-copy-link>复制当前档案链接</button></div>
    <div class="drawer-block"><h3>所属笔记</h3>${n?`<button class="text-link" data-note="${c.note}">${esc(n.title||"未恢复标题")} · ${esc(c.note)}</button>`:`<p class="scope-note">原始库未能匹配此评论的所属笔记。保留评论，不补造笔记或原始语境。</p>`}<p class="scope-note" style="margin-top:12px">评论正文经过基本隐私处理；匿名编号不指向原账号，逐字原文仍可能被搜索反查。</p></div>
    ${c.level===2?`<div class="drawer-block"><h3>回复的上文</h3>${parent?item(parent,"已匹配直接父评论"):root?`<p class="scope-note">直接父评论未恢复；以下仅为该回复所属的根评论，不能据此认定两者直接对话。</p>${item(root,"已匹配根评论")}`:`<p class="scope-note">当前原始快照无法恢复该回复的上文，不补造对话。</p>`}</div>`:""}
    <div class="drawer-block"><h3>已恢复的直接回复 <span class="muted">${fmt(direct.length)}</span></h3>${direct.length?direct.slice(0,30).map(r=>item(r,"直接回复")).join(""):`<p class="scope-note">当前快照未匹配到直接回复。它不表示平台上没有回复。</p>`}${direct.length>30?`<p class="scope-note">此面板显示前30条；在评论表按所属笔记查看更完整记录。</p>`:""}</div>
    ${thread.length?`<div class="drawer-block"><h3>同根线程中的其他回复 <span class="muted">${fmt(thread.length)}</span></h3><p class="scope-note">仅确认属于同一根线程，不构造先后回应关系。面板按快照编号展示前20条。</p>${thread.slice(0,20).map(r=>item(r,"同根线程回复")).join("")}${thread.length>20?`<button class="button small ghost" data-search-note="${c.note}">在评论表中查看所属笔记全部记录</button>`:""}</div>`:""}`);
}
function renderNote(id){
  const n=data.notesById.get(id);
  if(!n){drawer("未找到笔记",`<p>当前数据快照不含此笔记编号。</p>`);return}
  const records=(data.noteComments.get(id)||[]).slice().sort((a,b)=>(b.likes??-1)-(a.likes??-1));
  drawer(esc(n.title||"未恢复笔记标题"),`<div class="drawer-meta"><span>笔记 ${n.id}</span><span>${n.date||"发表日期未记录"}</span></div>
  <p class="full-comment">${esc(n.text||"原始库未恢复笔记正文。标题与评论不能代替缺失的正文。")}</p>
  <div class="lab-summary" style="grid-template-columns:1fr 1fr"><div><b>${fmt(n.comments)}</b><span>已采集评论</span></div><div><b>${fmt(n.commentLikes)}</b><span>已采集评论获赞合计</span></div></div>
  <p class="scope-note">以上为当前原始库内的评论统计，不是笔记在平台上的总互动量。</p><div class="drawer-toolbar"><button class="button small" data-search-note="${n.id}">在评论表筛选此笔记</button><button class="button small ghost" data-copy-link>复制档案链接</button></div>
  <div class="drawer-block"><h3>已采集评论 · 按点赞排序</h3>${records.length?records.slice(0,10).map(c=>`<div style="margin-top:15px">${quoteCard(c,n,{excerpt:true})}</div>`).join(""):`<p class="scope-note">当前库没有该笔记的评论记录。</p>`}${records.length>10?`<p class="scope-note">这里显示前10条；其余${fmt(records.length-10)}条可在评论表中浏览。</p>`:""}</div>`);
}
function renderPaper(id){
  const p=data.paper.find(x=>x.id===id);
  if(!p){drawer("未找到章节","<p>请从研究发现或研究方法重新选择章节。</p>");return}
  drawer(esc(p.title),`<div class="drawer-meta"><span>终版论文原文</span><span>毛湛文 · 陈俊良</span></div><p class="scope-note">以下按原文件段落提取，保留原文措辞和数值；正文中的图表请结合本站重绘与原论文阅读。</p><article class="paper-paragraphs">${p.paragraphs.map(t=>`<p>${esc(t)}</p>`).join("")}</article>`);
}

function filterRecords(mode="comments"){
  let records=mode==="notes"?data.notes:data.comments;
  const q=state.q.trim().toLocaleLowerCase();
  const onlyLabText=mode==="comments"&&state.labTextOnlyQuery&&routeInfo().route==="lab";
  if(q)records=records.filter(r=>{
    if(onlyLabText)return (r.text||"").toLocaleLowerCase().includes(q);
    const n=mode==="comments"?data.notesById.get(r.note):null;
    return `${r.id} ${r.note||""} ${r.text||""} ${r.title||""} ${n?.title||""}`.toLocaleLowerCase().includes(q);
  });
  if(mode==="comments"&&state.level!=="all")records=records.filter(r=>r.level===Number(state.level));
  if(state.month)records=records.filter(r=>state.month==="unknown"?!r.date:r.date?.startsWith(state.month));
  if(state.hideEmpty)records=records.filter(r=>r.text?.trim());
  if(mode==="comments"&&state.labDatedOnly)records=records.filter(r=>!!r.date);
  return records;
}
function sortRecords(records,key,direction="desc"){
  const sign=direction==="asc"?1:-1;
  return records.slice().sort((a,b)=>{
    const av=a[key],bv=b[key];
    // Missing values always last, in both directions.
    if(av==null&&bv==null)return a.id.localeCompare(b.id);
    if(av==null)return 1;if(bv==null)return -1;
    if(typeof av==="number")return (av-bv)*sign||a.id.localeCompare(b.id);
    return String(av).localeCompare(String(bv))*sign||a.id.localeCompare(b.id);
  });
}
function evidenceRecords(){
  let rows=filterRecords();
  if(state.topic==="paper"){const ids=new Set(Object.values(data.summary.quotes));rows=rows.filter(c=>ids.has(c.id))}
  else if(terms[state.topic])rows=rows.filter(c=>terms[state.topic].test(c.text));
  if(state.sort==="likes")rows=sortRecords(rows,"likes");
  else if(state.sort==="date")rows=sortRecords(rows,"date");
  else{
    const ids=Object.values(data.summary.quotes);
    const rank=new Map(ids.map((id,i)=>[id,i]));
    rows=rows.slice().sort((a,b)=>{
      if(rank.has(a.id)||rank.has(b.id))return (rank.get(a.id)??999)-(rank.get(b.id)??999);
      return (b.likes??-1)-(a.likes??-1)||a.id.localeCompare(b.id);
    });
  }
  return rows;
}
function pagination(total,size,scope){
  const pages=Math.max(1,Math.ceil(total/size));state.page=Math.min(state.page,pages);
  return `<div class="pagination"><span>${total?`${fmt((state.page-1)*size+1)}–${fmt(Math.min(state.page*size,total))} / ${fmt(total)} 条`:"无匹配记录"}</span><div class="page-controls"><button data-page="${state.page-1}" data-scope="${scope}" ${state.page<=1?"disabled":""}>上一页</button><span>第 ${state.page} / ${pages} 页</span><button data-page="${state.page+1}" data-scope="${scope}" ${state.page>=pages?"disabled":""}>下一页</button></div></div>`;
}
function renderEvidenceResults(){
  const el=document.querySelector("#evidence-results");if(!el)return;
  const rows=evidenceRecords(),pageNav=pagination(rows.length,12,"evidence");
  const chunk=rows.slice((state.page-1)*12,state.page*12);
  el.innerHTML=`<div class="results-line"><span>匹配 <strong>${fmt(rows.length)}</strong> 条评论</span><span>${state.topic==="paper"?"原文核对案例":"浏览分组不代表模型分类"}</span></div>${chunk.length?`<div class="quote-cards">${chunk.map(c=>`<div class="ea37-result-item" draggable="true" data-ea37-drag="${c.id}">${quoteCard(c,data.notesById.get(c.note))}<button type="button" class="ea37-add-from-results" data-ea37-add="${c.id}">＋ 放上证据对照台</button></div>`).join("")}</div>`:`<div class="empty"><h3>没有找到匹配评论</h3><p>换一个关键词，或清除当前分组。</p><button class="button small" data-reset>清除筛选</button></div>`}${pageNav}`;
  writeViewState();
  if(typeof window.EvidenceArchiveV37?.refresh === "function")window.EvidenceArchiveV37.refresh();
}
function renderLabResults(){
  const el=document.querySelector("#lab-results");if(!el)return;
  const key=state.mode==="notes"&&state.sortKey==="likes"?"comments":state.sortKey;
  const rows=sortRecords(filterRecords(state.mode),key,state.sortDir);
  const nav=pagination(rows.length,20,"lab"),chunk=rows.slice((state.page-1)*20,state.page*20);
  const heading=(label,col,width)=>`<th style="width:${width}" ${key===col?`aria-sort="${state.sortDir==="asc"?"ascending":"descending"}"`:""}><button data-sort="${col}">${label}<span aria-hidden="true">${key===col?(state.sortDir==="asc"?"↑":"↓"):"↕"}</span></button></th>`;
  let table;
  if(state.mode==="comments")table=`<table aria-label="原始评论数据表"><thead><tr>${heading("档案","id","90px")}<th style="width:45%">评论原文</th><th style="width:96px">所属笔记</th><th style="width:80px">层级</th>${heading("点赞","likes","90px")}${heading("发表日期","date","115px")}</tr></thead><tbody>${chunk.map(c=>`<tr><td><button class="table-id" data-comment="${c.id}">${c.id}</button></td><td><button class="table-text" data-comment="${c.id}">${esc(c.text||"（空文本记录）")}</button></td><td><button class="table-id" data-note="${c.note}">${esc(c.note)}</button></td><td><span class="table-type">${c.level===1?"一级评论":"回复"}</span></td><td class="number">${fmt(c.likes)}</td><td>${c.date||"<small>未记录</small>"}</td></tr>`).join("")}</tbody></table>`;
  else table=`<table aria-label="原始笔记数据表"><thead><tr>${heading("档案","id","95px")}<th style="width:38%">笔记标题</th>${heading("已采集评论","comments","125px")}${heading("评论获赞","commentLikes","110px")}${heading("发表日期","date","120px")}</tr></thead><tbody>${chunk.map(n=>`<tr><td><button class="table-id" data-note="${n.id}">${n.id}</button></td><td><button class="table-text" data-note="${n.id}">${esc(n.title||"未恢复标题")}</button></td><td class="number">${fmt(n.comments)}</td><td class="number">${fmt(n.commentLikes)}</td><td>${n.date||"<small>未记录</small>"}</td></tr>`).join("")}</tbody></table>`;
  el.innerHTML=`<div class="results-line"><span>匹配 <strong>${fmt(rows.length)}</strong> ${state.mode==="notes"?"篇笔记":"条评论"}${state.month?` · ${esc(state.month==="unknown"?"日期未记录":state.month)}`:""}${state.labDatedOnly&&state.mode==="comments"?` · <span class="al38-dated-badge">限有日期 <button type="button" data-lab-clear-dated>×取消</button></span>`:""}</span><label class="check-label"><input id="hide-empty" type="checkbox" ${state.hideEmpty?"checked":""}>仅非空正文</label></div>${rows.length?`<div class="table-wrap" tabindex="0" role="region" aria-label="可横向滚动的数据表">${table}</div>`:`<div class="empty"><h3>没有符合条件的记录</h3><p>尝试清除关键词、层级或月份筛选。</p><button class="button small" data-reset>重置筛选</button></div>`}${nav}`;
  const level=document.querySelector("#lab-level");if(level)level.disabled=state.mode==="notes";
  document.querySelectorAll("[data-month]").forEach(b=>b.classList.toggle("selected",b.dataset.month===state.month));
  const readout=document.querySelector("#timeline-readout");
  if(readout)readout.textContent=state.month?`${state.month==="unknown"?"日期未记录":state.month} · ${state.mode==="notes"?"笔记表按笔记发表日期筛选":"当前月份筛选"}（柱图始终为全部评论）`:"点击柱形，按月份筛选评论";
  writeViewState();
  if(routeInfo().route==="lab")window.LabArchiveV38?.refresh?.();
}
function refreshResults(){routeInfo().route==="evidence"?renderEvidenceResults():renderLabResults()}
function resetFilters(){
  state.q="";state.topic="all";state.level="all";state.month="";state.hideEmpty=false;state.labDatedOnly=false;state.labTextOnlyQuery=false;state.page=1;
  state.sort="curated";state.sortKey="likes";state.sortDir="desc";
  writeViewState();currentPath="";renderRoute();
}
function download(name,text,mime){
  const blob=new Blob([text],{type:mime}),url=URL.createObjectURL(blob),link=document.createElement("a");
  link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function csvCell(value){
  let text=String(value??"");
  // Prevent spreadsheet formula execution, including leading whitespace.
  if(/^[\s\u0000-\u001f]*[=+\-@]/.test(text))text="'"+text;
  return `"${text.replace(/"/g,'""')}"`;
}
function exportCSV(){
  const notes=state.mode==="notes",key=notes&&state.sortKey==="likes"?"comments":state.sortKey;
  const rows=sortRecords(filterRecords(state.mode),key,state.sortDir);
  const headers=notes?["匿名笔记编号","标题","正文","发表日期","已采集评论数","已采集评论获赞合计"]:["匿名评论编号","所属匿名笔记编号","原文_基本脱敏","层级","发表日期","点赞数_快照","直接父评论编号","根评论编号"];
  const values=rows.map(r=>notes?[r.id,r.title,r.text,r.date,r.comments,r.commentLikes]:[r.id,r.note,r.text,r.level,r.date,r.likes,r.parent,r.root]);
  const csv=[headers,...values].map(r=>r.map(csvCell).join(",")).join("\r\n");
  download(`争议档案_${notes?"笔记":"评论"}_${rows.length}条.csv`,"\ufeff"+csv,"text/csv;charset=utf-8");
  showToast(`已导出全部 ${fmt(rows.length)} 条筛选记录（非仅当前页）`);
}
async function copyText(text){
  try{await navigator.clipboard.writeText(text);showToast("已复制")}
  catch{showToast("浏览器不允许自动复制；请选中原文手动复制")}
}

// All UI text derived from datasets passes through escapeHTML before becoming markup.
document.addEventListener("click",e=>{
  if(e.target.closest(".cover-enter")&&!window.AtlasPixelAudio?.status()?.enabled)startAmbient().catch(()=>{});
  const b=e.target.closest("button,a,[data-edge]");if(!b)return;
  if(b.matches("a[href^='#/']")){
    document.querySelector("#sidebar").classList.remove("open");
    document.querySelector("#menu-toggle").setAttribute("aria-expanded","false");
  }
  if(b.hasAttribute("data-close")){closeDetail();return}
  if(b.dataset.comment){openDetail("comment",b.dataset.comment);return}
  if(b.dataset.note){openDetail("note",b.dataset.note);return}
  if(b.dataset.paper){openDetail("paper",b.dataset.paper);return}
  if(b.dataset.copyComment){
    const c=data.commentsById.get(b.dataset.copyComment);
    copyText(`“${c.text}”\n匿名评论 ${c.id}，${c.date||"日期未记录"}，${fmt(c.likes)}赞（原始库快照）。来源：争议档案 / ${data.summary.paperTitle}。`);return;
  }
  if(b.hasAttribute("data-copy-link")){copyText(location.href);return}
  if(b.dataset.searchNote){
    if(dialog.open)dialog.close();dialogRoutePushed=false;
    location.hash=`/lab?q=${b.dataset.searchNote}`;return;
  }
  if(b.dataset.topic){
    state.topic=b.dataset.topic;state.page=1;
    document.querySelectorAll("[data-topic]").forEach(x=>{x.classList.toggle("active",x===b);x.setAttribute("aria-pressed",String(x===b))});renderEvidenceResults();return;
  }
  if(b.dataset.mode){
    state.mode=b.dataset.mode;state.page=1;state.sortKey=state.mode==="notes"?"comments":"likes";
    document.querySelectorAll("[data-mode]").forEach(x=>x.classList.toggle("active",x===b));renderLabResults();return;
  }
  if(b.dataset.month){
    state.mode="comments";state.month=state.month===b.dataset.month?"":b.dataset.month;state.page=1;
    const s=document.querySelector("#lab-month");s.value=state.month;
    document.querySelectorAll("[data-mode]").forEach(x=>x.classList.toggle("active",x.dataset.mode==="comments"));
    renderLabResults();return;
  }
  if(b.hasAttribute("data-sort")){
    if(state.sortKey===b.dataset.sort)state.sortDir=state.sortDir==="desc"?"asc":"desc";
    else{state.sortKey=b.dataset.sort;state.sortDir="desc"}state.page=1;renderLabResults();return;
  }
  if(b.hasAttribute("data-page")){
    state.page=Number(b.dataset.page);refreshResults();
    document.querySelector(b.dataset.scope==="evidence"?"#evidence-results":"#lab-results")?.scrollIntoView({behavior:paused?"instant":"smooth",block:"start"});
    return;
  }
  if(b.hasAttribute("data-lab-clear-dated")){state.labDatedOnly=false;state.labTextOnlyQuery=false;state.page=1;renderLabResults();return}
  if(b.hasAttribute("data-reset")){resetFilters();return}
  if(b.dataset.export==="csv"){exportCSV();return}
  if(b.dataset.export==="provenance"){
    download("争议档案_来源与口径.json",JSON.stringify(data.summary,null,2),"application/json;charset=utf-8");showToast("已下载来源与口径说明");return;
  }
  if(b.dataset.network){
    document.querySelectorAll("[data-network]").forEach(x=>x.classList.toggle("active",x===b));
    document.querySelector("#network-view").innerHTML=networkSVG(b.dataset.network);return;
  }
  if(b.hasAttribute("data-edge")){
    const n=networkEdges[Number(b.dataset.edge)];
    document.querySelector("#network-detail").innerHTML=`<strong>${n.object} × ${n.basis}：${n.direction} ${n.pct}%</strong>分母为该对象—依据关系内的评价记录；此值来自终版第四节（四）。比例不等于边的共现数量，也不等于全样本立场比例。`;return;
  }
  if(b.dataset.ability){
    document.querySelector("#ability-detail").innerHTML=b.dataset.ability==="front"?`<strong>前台能力 · 1,467次：</strong>平台运营与商业传播743次，基础内容生产724次，合计占全部能力提及74.9%。`:`<strong>核心能力 · 合计492次：</strong>采访与信源关系、信息搜集整理、事实核查与证据、社会解释与议题发现、伦理责任与公共判断。正文未分别披露五类计数。`;return;
  }
  if(b.hasAttribute("data-chain")){
    document.querySelectorAll("[data-chain]").forEach(x=>{x.classList.toggle("active",x===b);x.setAttribute("aria-pressed",String(x===b))});
    document.querySelector("#chain-content").innerHTML=chainContent(Number(b.dataset.chain));return;
  }
  if(b.hasAttribute("data-retry")){location.reload()}
});
document.addEventListener("keydown",e=>{
  if(e.target.matches("[data-edge]")&&(e.key==="Enter"||e.key===" ")){e.preventDefault();e.target.dispatchEvent(new MouseEvent("click",{bubbles:true}))}
});
let debounceTimer;
document.addEventListener("input",e=>{
  if(e.target.matches("#lab-search,#evidence-search")){
    state.q=e.target.value;state.labTextOnlyQuery=false;state.page=1;clearTimeout(debounceTimer);
    debounceTimer=setTimeout(refreshResults,150);
  }
});
document.addEventListener("change",e=>{
  if(e.target.id==="evidence-sort"){state.sort=e.target.value;state.page=1;renderEvidenceResults()}
  if(e.target.id==="lab-level"){state.level=e.target.value;state.page=1;renderLabResults()}
  if(e.target.id==="lab-month"){state.month=e.target.value;state.page=1;renderLabResults()}
  if(e.target.id==="hide-empty"){state.hideEmpty=e.target.checked;state.page=1;renderLabResults()}
});

let navigationSerial=0;
let fullDataPromise=null;
const loadJSON=async(name)=>{if(window.__ATLAS_EMBEDDED?.[name]) return window.__ATLAS_EMBEDDED[name]; const r=await fetch(`./data/${name}.json`);if(!r.ok)throw new Error(`${name}: HTTP ${r.status}`);return r.json()};
function indexRecords(notes,comments){
  const notesById=new Map(notes.map(n=>[n.id,n])),commentsById=new Map(comments.map(c=>[c.id,c]));
  const children=new Map(),threads=new Map(),noteComments=new Map();
  for(const c of comments){
    if(!noteComments.has(c.note))noteComments.set(c.note,[]);noteComments.get(c.note).push(c);
    if(c.parent){if(!children.has(c.parent))children.set(c.parent,[]);children.get(c.parent).push(c)}
    if(c.root&&c.id!==c.root){if(!threads.has(c.root))threads.set(c.root,[]);threads.get(c.root).push(c)}
  }
  return {notes,comments,notesById,commentsById,children,threads,noteComments};
}
async function ensureFullData(){
  if(data.full)return;
  if(!fullDataPromise)fullDataPromise=Promise.all(["notes","comments","paper"].map(loadJSON)).then(([notes,comments,paper])=>{
    Object.assign(data,indexRecords(notes,comments),{paper,full:true});
  }).catch(e=>{fullDataPromise=null;throw e});
  return fullDataPromise;
}
async function renderRoute(){
  if(!data)return;
  const serial=++navigationSerial;
  const r=routeInfo();
  if(r.route==="findings"||r.route==="rebuild"){
    const section=r.route==="rebuild"?"rebuild":({employment:"employment",public:"public",ability:"ability",network:"network"}[r.chapter]||"employment");
    r.route="story";r.path="/story";r.params.set("section",section);
    history.replaceState(null,"",`#/story?${r.params}`);
  }
  const needsFull=["lab","evidence"].includes(r.route)||["comment","note","paper"].some(k=>r.params.has(k));
  if(needsFull&&!data.full){
    if(disposeField){disposeField();disposeField=null}
    currentPath="";
    main.innerHTML='<div class="loading"><span class="loader"></span><h1>正在打开完整证据</h1><p>原始语料仅在查证时加载，主线阅读无需等待。</p></div>';
    try{await ensureFullData()}catch{
      if(serial!==navigationSerial)return;
      main.innerHTML='<div class="error-box"><h1>完整语料未能加载</h1><p>主线内容仍可阅读，恢复网络后可重新打开证据。</p><a href="#/story" class="button">回到故事</a><button class="button" data-retry>重新加载</button></div>';return;
    }
    if(serial!==navigationSerial)return;
  }
  if(!validRoutes.has(r.route)){
    if(disposeField){disposeField();disposeField=null}
    main.innerHTML=`<div class="page"><div class="empty"><h1>档案路径未找到</h1><p>请通过左侧目录继续探索研究。</p><a class="button" href="#/overview">回到研究总览</a></div></div>`;
    currentPath=r.path;document.body.classList.remove("in-story","cinema-mode");if(dialog.open)dialog.close();return;
  }
  // Modal-only transitions retain table filters, scroll position, and the active canvas.
  if(currentPath!==r.path){
    clearTimeout(debounceTimer);
    if(disposeField){disposeField();disposeField=null}
    syncState(r.params,r.route);
    document.body.classList.remove("in-story");
    document.body.classList.toggle("cinema-mode",["overview","story"].includes(r.route));
    const views={overview:()=>cinemaCover(data),story:()=>cinemaStory(data),findings:()=>findings(r.chapter,data),evidence:()=>evidencePage(data,state),
      lab:()=>labPage(data,state),rebuild:rebuildPage,methods:()=>methodArchiveV41(data,methodsPage(data))};
    main.innerHTML=views[r.route]();
    currentPath=r.path;
    document.querySelectorAll("#primary-nav>a").forEach(a=>{const active=a.dataset.route===r.route;a.classList.toggle("active",active);active?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current")});
    document.querySelector("#sidebar").classList.toggle("findings-active",r.route==="findings");
    document.querySelectorAll(".subnav a").forEach(a=>a.classList.toggle("active",a.hash===`#/findings/${r.chapter}`));
    if(r.route==="story")disposeField=mountCinema(main,data);
    if(r.route==="overview")disposeField=mountCover(main,data);
    if(r.route==="methods")disposeField=mountMethodArchive(main,data);
    if(r.route==="evidence"){
      if(window.EvidenceArchiveV37?.mount)disposeField=window.EvidenceArchiveV37.mount(main,data,state,terms);
      document.querySelector("#evidence-sort").value=state.sort;
      // Results update the address, so preserve any initially requested deep-linked drawer.
      renderEvidenceResults();
    }
    if(r.route==="lab"){
      document.querySelector("#lab-level").value=state.level;
      document.querySelector("#lab-month").value=state.month;
      renderLabResults();
      if(window.LabArchiveV38?.mount)disposeField=window.LabArchiveV38.mount(main,data,state,{renderLabResults,resetFilters});
    }
    window.scrollTo({top:0,behavior:"instant"});
    const names={overview:"新闻学还能学吗？",story:"故事与证据",findings:"四重错位",evidence:"评论证据",lab:"数据实验室",rebuild:"价值重塑",methods:"方法与边界"};
    document.title=`${names[r.route]}｜争议档案`;
    document.querySelector("#status-text").textContent=`${names[r.route]} / 终版论文 × 原始数据`;
  }else if(!r.params.has("comment")&&!r.params.has("note")&&!r.params.has("paper") && ["lab","evidence"].includes(r.route)){
    // Browser back/forward can change query parameters without changing the route.
    syncState(r.params,r.route);
    const input=document.querySelector(r.route==="lab"?"#lab-search":"#evidence-search");if(input)input.value=state.q;
    if(r.route==="lab"){
      document.querySelector("#lab-level").value=state.level;document.querySelector("#lab-month").value=state.month;
      document.querySelectorAll("[data-mode]").forEach(x=>x.classList.toggle("active",x.dataset.mode===state.mode));
      renderLabResults();
    }else{
      document.querySelector("#evidence-sort").value=state.sort;
      document.querySelectorAll("[data-topic]").forEach(x=>x.classList.toggle("active",x.dataset.topic===state.topic));
      renderEvidenceResults();
    }
  }
  if(r.params.has("comment"))renderComment(r.params.get("comment"));
  else if(r.params.has("note"))renderNote(r.params.get("note"));
  else if(r.params.has("paper"))renderPaper(r.params.get("paper"));
  else if(dialog.open)dialog.close();
  if(r.route==="story"&&r.params.has("section")){
    requestAnimationFrame(()=>{const el=document.getElementById(r.params.get("section")==="employment"&&r.params.get("play")==="1"?"em-pixel-game":r.params.get("section"));el?.scrollIntoView({behavior:"instant",block:"start"});if(r.params.get("play")==="1")el?.querySelector('[data-gg46="start"]')?.click()});
  }
}
window.addEventListener("hashchange",renderRoute);
async function boot(){
  try{
    const [summary,narrative,assets,sceneRegistry]=await Promise.all(["summary","narrative-v2","assets-v2","scenes-v2"].map(loadJSON));
    data={summary,narrative,assets,sceneRegistry,paper:[],full:false,...indexRecords(narrative.notes,narrative.comments)};
    renderRoute();
  }catch(error){
    console.error("Atlas snapshot loading failed",error);
    main.innerHTML=`<div class="error-box"><h1>研究快照未能加载</h1><p>请检查数据文件，或打开完整包根目录的 index.html。</p><button class="button" data-retry>重新加载</button></div>`;
  }
}
boot();
