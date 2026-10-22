/* V3.8 · page 07 only: client-side sample experiment; no user choices leave browser. */
(() => {
  'use strict';
  const fmt=n=>Number(n||0).toLocaleString('zh-CN');
  const pct=(a,b)=>b?((100*a)/b).toFixed(1)+'%':'0.0%';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let handle=null;
  const stop=()=>{if(handle){handle.dispose();handle=null}};
  function mount(main,data,appState,actions){
    stop();
    const root=main.querySelector('#al38-root');if(!root)return ()=>{};
    const months=data.summary.months.map(m=>m.month);
    const full=data.comments;
    const m={level:'all',dateOnly:false,textOnly:false,keyword:'',index:0,shown:0,playing:false,timer:null,filtered:full,monthCounts:[],disposers:[]};
    const el=id=>root.querySelector('#'+id);
    const on=(target,event,fn)=>{target.addEventListener(event,fn);m.disposers.push(()=>target.removeEventListener(event,fn))};
    function matches(c){return (m.level==='all'||c.level===Number(m.level))&&(!m.dateOnly||!!c.date)&&(!m.textOnly||!!(c.text||'').trim())&&(!m.keyword||(c.text||'').toLocaleLowerCase().includes(m.keyword));}
    function render(){
      m.filtered=full.filter(matches);const count=m.filtered.length, total=full.length;
      el('al38-current').textContent=fmt(count);el('al38-share').textContent=`占 ${fmt(total)} 条原始评论的 ${pct(count,total)}`;
      el('al38-retained-bar').style.width=pct(count,total);
      const roots=m.filtered.filter(c=>c.level===1).length,replies=count-roots;
      el('al38-composition-bar').innerHTML=count?`<span style="width:${pct(roots,count)}" title="一级评论 ${fmt(roots)}条"></span><span style="width:${pct(replies,count)}" title="回复 ${fmt(replies)}条"></span>`:'';
      el('al38-comp-legend').innerHTML=`<span><i></i>一级评论 ${fmt(roots)}（${pct(roots,count)}）</span><span><i></i>回复 ${fmt(replies)}（${pct(replies,count)}）</span>`;
      const removed=total-count,dated=m.filtered.filter(c=>!!c.date).length;
      let note='';
      if(!removed)note='尚未筛选：所有原始评论都保留在观察范围内。';
      else if(!count)note='当前条件没有匹配记录。这个结果只说明筛选交集为空，不代表相关讨论不存在。';
      else note=`有 ${fmt(removed)} 条记录未通过当前筛选；被保留的 ${fmt(count)} 条中，${fmt(dated)} 条带有日期。请注意：不同筛选窗口不能直接互相比作总体态度。`;
      el('al38-difference').textContent=note;
      const counts=new Map(months.map(mon=>[mon,0]));
      for(const c of m.filtered){const mon=c.date?.slice(0,7);if(counts.has(mon))counts.set(mon,counts.get(mon)+1)}
      m.monthCounts=months.map(mon=>counts.get(mon));
      renderMonths();renderQuotes();
    }
    function renderMonths(){
      const max=Math.max(...m.monthCounts,1),dateSum=m.monthCounts.reduce((a,b)=>a+b,0);
      let markup='';
      months.forEach((mon,i)=>{
        const h=m.monthCounts[i]/max*100;
        markup+=`<button type="button" class="al38-month-bar${i===m.index?' active':''}${i<=m.index?' played':''}" data-al38-month-index="${i}" aria-label="${mon}，${fmt(m.monthCounts[i])}条；查看该月" title="${mon}：${fmt(m.monthCounts[i])} 条" style="--bar-height:${Math.max(m.monthCounts[i]?1:0,h)}%"><span></span></button>`;
      });
      el('al38-month-chart').innerHTML=markup;
      el('al38-month-title').textContent=months[m.index];
      el('al38-month-count').textContent=`所选样本在该月有 ${fmt(m.monthCounts[m.index])} 条有日期记录`;
      el('al38-time-progress').textContent=`${m.index+1} / ${months.length}`;
      el('al38-time-slider').value=String(m.index);
      el('al38-dated-footnote').textContent=`当前筛选结果：${fmt(m.filtered.length)} 条，其中 ${fmt(dateSum)} 条有日期，${fmt(m.filtered.length-dateSum)} 条缺日期。只显示归档中出现过的48个月份；月份稀疏、样本非概率抽取，图上高度不能解释为平台整体讨论热度。`;
    }
    function renderQuotes(){
      const selected=new Set(m.filtered.map(c=>c.id));
      const ids=Object.values(data.summary.quotes);
      el('al38-voice-grid').innerHTML=ids.map((id,i)=>{
        const c=data.commentsById.get(id);if(!c)return '';
        const keep=selected.has(id),excerpt=(c.text||'（无正文）').slice(0,98);
        return `<article class="al38-voice-card ${keep?'kept':'discarded'}"><div class="al38-voice-top"><span>案例 ${String(i+1).padStart(2,'0')} · ${esc(id)}</span><strong>${keep?'被保留':'被排除'}</strong></div><blockquote>“${esc(excerpt)}${(c.text||'').length>98?'…':''}”</blockquote><div class="al38-voice-bottom"><span>${esc(c.date||'日期缺失')} · ${c.level===1?'一级评论':'回复'}</span><button type="button" data-comment="${esc(id)}">查看原文与来源 ↗</button></div></article>`;
      }).join('');
    }
    function pause(){m.playing=false;clearInterval(m.timer);m.timer=null;el('al38-play').textContent='▶ 播放月份';el('al38-play').setAttribute('aria-pressed','false');}
    function setIndex(i){m.index=Math.max(0,Math.min(months.length-1,i));renderMonths();}
    on(root,'click',e=>{
      const b=e.target.closest('button');if(!b||!root.contains(b))return;
      if(b.dataset.al38Level!==undefined){m.level=b.dataset.al38Level;root.querySelectorAll('[data-al38-level]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});render();return;}
      if(b.dataset.al38Example!==undefined){m.keyword=b.dataset.al38Example.toLocaleLowerCase();el('al38-keyword').value=b.dataset.al38Example;render();return;}
      if(b.dataset.al38Go){el(b.dataset.al38Go)?.scrollIntoView({behavior:document.body.classList.contains('motion-paused')?'instant':'smooth',block:'start'});return;}
      if(b.dataset.al38Reset!==undefined){m.level='all';m.dateOnly=false;m.textOnly=false;m.keyword='';el('al38-date-only').checked=false;el('al38-text-only').checked=false;el('al38-keyword').value='';root.querySelectorAll('[data-al38-level]').forEach(x=>{const active=x.dataset.al38Level==='all';x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active))});render();return;}
      if(b.dataset.al38Sync!==undefined){appState.mode='comments';appState.level=m.level;appState.month='';appState.q=m.keyword;appState.hideEmpty=m.textOnly;appState.labDatedOnly=m.dateOnly;appState.labTextOnlyQuery=!!m.keyword;appState.page=1;root.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x.dataset.mode==='comments'));el('lab-level').value=m.level;el('lab-month').value='';el('lab-search').value=m.keyword;actions.renderLabResults();el('al38-ledger').scrollIntoView({behavior:'smooth'});return;}
      if(b.dataset.al38Report!==undefined){
        const current=m.filtered.length,dated=m.filtered.filter(c=>!!c.date).length,roots=m.filtered.filter(c=>c.level===1).length;
        const report=`# 争议档案 · 第七页数据实验单\n\n数据快照：原始评论30,541条\n当前筛选保留：${fmt(current)}条，占原始库 ${pct(current,full.length)}\n筛选规则：评论层级=${m.level==='all'?'全部':m.level==='1'?'一级评论':'回复'}；仅有日期=${m.dateOnly?'是':'否'}；仅非空文本=${m.textOnly?'是':'否'}；仅原文含词=${m.keyword||'不限'}\n保留记录的构成：一级评论${fmt(roots)}条，回复${fmt(current-roots)}条\n保留记录中有日期：${fmt(dated)}条，日期缺失：${fmt(current-dated)}条\n\n注意：该实验处理原始评论表的筛选交集，不等于论文的21,779条语义有效评论。样本不是概率样本，也不能据此推断平台总体态度。\n`;
        const url=URL.createObjectURL(new Blob([report],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='争议档案_我的数据实验单.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
      }
      if(b.dataset.al38MonthIndex!==undefined){pause();setIndex(Number(b.dataset.al38MonthIndex));return;}
      if(b.id==='al38-play'){if(m.playing){pause();return;}if(m.index===months.length-1)setIndex(0);m.playing=true;b.textContent='Ⅱ 暂停月份';b.setAttribute('aria-pressed','true');m.timer=setInterval(()=>{if(document.body.classList.contains('motion-paused')){pause();return;}if(m.index>=months.length-1){pause();return;}setIndex(m.index+1)},750);return;}
      if(b.id==='al38-time-reset'){pause();setIndex(0);return;}
      if(b.dataset.al38MonthToTable!==undefined){appState.mode='comments';appState.month=months[m.index];appState.level=m.level;appState.q=m.keyword;appState.hideEmpty=m.textOnly;appState.labDatedOnly=false;appState.labTextOnlyQuery=!!m.keyword;appState.page=1;el('lab-level').value=m.level;el('lab-month').value=months[m.index];el('lab-search').value=m.keyword;root.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x.dataset.mode==='comments'));actions.renderLabResults();el('al38-ledger').scrollIntoView({behavior:'smooth'});return;}
    });
    on(el('al38-keyword'),'input',e=>{m.keyword=e.target.value.trim().toLocaleLowerCase();render()});
    on(el('al38-date-only'),'change',e=>{m.dateOnly=e.target.checked;render()});
    on(el('al38-text-only'),'change',e=>{m.textOnly=e.target.checked;render()});
    on(el('al38-time-slider'),'input',e=>{pause();setIndex(Number(e.target.value))});
    render();
    handle={refresh(){// A separate experiment, intentionally unaffected by table-only filters.
      const tag=el('al38-ledger')?.querySelector('.al38-ledger-boundary');if(tag)tag.dataset.mode=appState.mode;
    },dispose(){pause();for(const fn of m.disposers)fn();handle=null;}};
    return ()=>handle?.dispose();
  }
  window.LabArchiveV38={mount,refresh(){handle?.refresh()}};
})();
