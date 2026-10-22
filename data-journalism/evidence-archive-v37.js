/* Evidence Archive V3.7. Everything in this module is computed locally from
   existing anonymized source records; it does not persist reader choices. */
(()=>{
  "use strict";
  const entries=[
    ["public_support","01","记录的必要","对公共职责的期待"],
    ["public_criticism","02","真实性追问","对新闻实践的质询"],
    ["reply_shift","03","理想与生计","对新闻职业的解释"],
    ["irony","04","反讽的力度","对职业价值的戏谑"],
    ["ai","05","技术与能力","关于技能学习的经历"],
    ["respect","06","仍在尊重","对专业的情感表达"]
  ];
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const digits=n=>Number(n||0).toLocaleString("zh-CN");
  const cut=(t,max)=>String(t||"（无文本）").length>max?String(t).slice(0,max)+"……":String(t||"（无文本）");
  function mount(root,data,state,terms){
    if(!root?.querySelector(".ea37-page"))return ()=>{};
    const Q=sel=>root.querySelector(sel);
    const pairs=entries.map(e=>({...{name:e[0],code:e[1],label:e[2],sub:e[3]},id:data.summary.quotes[e[0]]})).filter(x=>data.commentsById.has(x.id));
    let active=pairs[0]?.id,selected=[],openedNotes=new Set(),viewed=new Set(),cleared=false;
    const comments=id=>data.commentsById.get(id);
    const notes=id=>data.notesById.get(id);
    const noteOf=c=>notes(c?.note);
    function contextStatus(c){
      if(!c)return "记录不存在";
      if(c.level===1)return "一级评论 · 可查看已恢复回复";
      if(c.parent&&comments(c.parent))return "已匹配直接父评论";
      if(c.root&&c.root!==c.id&&comments(c.root))return "只确认同根线程，非直接回复关系";
      return "回复上文未恢复";
    }
    function renderCase(){
      const current=pairs.find(x=>x.id===active);if(!current)return;
      const c=comments(current.id),n=noteOf(c),shown=openedNotes.has(c.id);
      Q("#ea37-case-tabs").innerHTML=pairs.map(x=>`<button type="button" class="${x.id===active?"active":""}" data-ea37-case="${x.id}" aria-pressed="${x.id===active}"><small>案卷 ${x.code}</small><b>${esc(x.label)}</b></button>`).join("");
      Q("#ea37-case-content").setAttribute("draggable","true");Q("#ea37-case-content").dataset.ea37Drag=c.id;
      Q("#ea37-case-content").innerHTML=`<div class="ea37-document-number"><span>材料 ${current.code} / 06</span><span>已逐条核对的论文引文</span></div><div class="ea37-case-title">${esc(current.sub)}</div>
        <blockquote class="ea37-raw-quote">${esc(c.text||"（原始记录无文本）")}</blockquote>
        <div class="ea37-document-meta"><span>匿名档案 ${esc(c.id)}</span><span>${esc(c.date||"日期未记录")}</span><span>${digits(c.likes)}赞（采集快照）</span></div>
        <div class="ea37-source-flap ${shown?"revealed":""}">
          <div class="ea37-source-heading"><b>所属笔记 / 语境线索</b><span>${shown?"已揭开":"封存中"}</span></div>
          ${shown?`<p>${esc(n?.title||"原始库未匹配笔记标题；不作补写")}</p><div class="ea37-source-meta">${esc(contextStatus(c))}</div>${n?`<button type="button" data-note="${esc(n.id)}">核对所属笔记 ↗</button>`:""}`:`<p class="ea37-concealed">你读到的是一句话，而非一段完整的人生或讨论。</p><button type="button" class="ea37-unseal" data-ea37-reveal="${c.id}">揭开笔记与线程线索 ↗</button>`}
        </div>
        <div class="ea37-case-actions"><button type="button" class="ea37-ink-button" data-ea37-add="${c.id}">＋ 放入证据对照台</button><button type="button" class="ea37-line-button" data-comment="${c.id}">查看匿名原文与可恢复回复</button></div>`;
      renderProgress();
    }
    function renderDesk(){
      const html=selected.map((id,i)=>{
        const c=comments(id);if(!c)return "";
        const n=noteOf(c);
        return `<article class="ea37-pinned" draggable="false"><div class="ea37-pinned-top"><span>证据 ${i+1} · ${esc(id)}</span><button type="button" data-ea37-remove="${esc(id)}" aria-label="撤回${esc(id)}">× 撤回</button></div><blockquote>${esc(cut(c.text,140))}</blockquote><small>${esc(c.date||"日期未记录")} · ${esc(c.level===1?"一级评论":"回复记录")} · ${digits(c.likes)}赞</small><p class="ea37-pinned-note">所属：${esc(cut(n?.title||"笔记标题未恢复",50))}</p><button type="button" data-comment="${esc(id)}">打开原文 ↗</button></article>`;
      }).join("");
      Q("#ea37-desk-slots").innerHTML=html+Array.from({length:2-selected.length},(_,i)=>`<div class="ea37-empty-slot"><b>＋</b><span>留出第 ${selected.length+i+1} 份材料的位置</span></div>`).join("");
      if(selected.length===2){
        const a=comments(selected[0]),b=comments(selected[1]);
        const same=a.note===b.note;
        Q("#ea37-desk-findings").innerHTML=`<strong>已找到两份材料的可比线索</strong><p>${same?"两份同一笔记，不等于直接对话。":"来自不同笔记。可以比较表达，但不能把它们拼成对话。但不能据此估计总体认可率。"}</p><p>材料一：${esc(contextStatus(a))}。材料二：${esc(contextStatus(b))}。</p>`;
      }else Q("#ea37-desk-findings").textContent=selected.length?"已经放入一份材料。再取一份，比较两条评论的原文与来源。":"这里不计算「正确率」，也不把两则材料外推为总体立场。";
      renderProgress();
    }
    function renderProgress(){
      const finished=[viewed.size>0,openedNotes.size>0,selected.length===2];
      const done=finished.filter(Boolean).length;
      Q("#ea37-reading-progress").textContent=`调查进度 · ${done} / 3｜${finished.map((yes,i)=>`${["读证词","查语境","并置两份"][i]}${yes?"✓":"○"}`).join(" · ")}`;
      Q("#ea37-progress-marks").querySelectorAll("i").forEach((e,i)=>e.classList.toggle("active",finished[i]));
    }
    function counts(){
      const values={all:data.comments.length,paper:pairs.length};
      for(const [topic,regex] of Object.entries(terms))values[topic]=data.comments.filter(c=>regex.test(c.text||"")).length;
      root.querySelectorAll("[data-ea37-count]").forEach(el=>el.textContent=digits(values[el.dataset.ea37Count]||0));
    }
    function add(id){
      if(!comments(id))return;
      if(selected.includes(id))return;
      if(selected.length===2)selected.shift();
      selected.push(id);renderDesk();
      Q(".ea37-reading-desk")?.classList.remove("ea37-pulse");
      void Q(".ea37-reading-desk")?.offsetWidth;
      Q(".ea37-reading-desk")?.classList.add("ea37-pulse");
    }
    const handler=e=>{
      const b=e.target.closest("button[data-ea37-case],button[data-ea37-reveal],button[data-ea37-add],button[data-ea37-remove],button[data-ea37-clear],button[data-ea37-jump]");
      if(!b||!root.contains(b))return;
      if(b.hasAttribute("data-ea37-case")){active=b.dataset.ea37Case;viewed.add(active);renderCase()}
      if(b.hasAttribute("data-ea37-reveal")){openedNotes.add(b.dataset.ea37Reveal);renderCase()}
      if(b.hasAttribute("data-ea37-add"))add(b.dataset.ea37Add);
      if(b.hasAttribute("data-ea37-remove")){selected=selected.filter(x=>x!==b.dataset.ea37Remove);renderDesk()}
      if(b.hasAttribute("data-ea37-clear")){selected=[];renderDesk()}
      if(b.hasAttribute("data-ea37-jump"))Q(b.dataset.ea37Jump==="search"?"#ea37-search-area":"#ea37-investigate")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion:reduce)").matches?"instant":"smooth",block:"start"});
    };
    const dragStart=e=>{const target=e.target.closest("[data-ea37-drag]");if(!target||!root.contains(target))return;
      const id=target.dataset.ea37Drag;if(!comments(id))return;
      e.dataTransfer.setData("text/plain",id);e.dataTransfer.effectAllowed="copy";
    };
    const dragOver=e=>{if(!e.target.closest(".ea37-reading-desk"))return;e.preventDefault();e.dataTransfer.dropEffect="copy";Q(".ea37-reading-desk")?.classList.add("ea37-dropfocus")};
    const dragLeave=e=>{if(e.target.closest(".ea37-reading-desk")&&!Q(".ea37-reading-desk")?.contains(e.relatedTarget))Q(".ea37-reading-desk")?.classList.remove("ea37-dropfocus")};
    const drop=e=>{if(!e.target.closest(".ea37-reading-desk"))return;e.preventDefault();Q(".ea37-reading-desk")?.classList.remove("ea37-dropfocus");add(e.dataTransfer.getData("text/plain"))};
    const dragEnd=()=>Q(".ea37-reading-desk")?.classList.remove("ea37-dropfocus");
    root.addEventListener("click",handler);root.addEventListener("dragstart",dragStart);root.addEventListener("dragover",dragOver);root.addEventListener("dragleave",dragLeave);root.addEventListener("drop",drop);root.addEventListener("dragend",dragEnd);
    counts();renderCase();renderDesk();
    window.EvidenceArchiveV37.refresh=()=>{};
    return ()=>{root.removeEventListener("click",handler);root.removeEventListener("dragstart",dragStart);root.removeEventListener("dragover",dragOver);root.removeEventListener("dragleave",dragLeave);root.removeEventListener("drop",drop);root.removeEventListener("dragend",dragEnd);window.EvidenceArchiveV37.refresh=null};
  }
  window.EvidenceArchiveV37={mount,refresh:null};
})();
