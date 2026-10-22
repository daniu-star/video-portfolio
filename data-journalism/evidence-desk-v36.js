/* PAGE05 V3.6 — Tactile evidence desk.  All numbers derive from narrative-v2.json network.edges. */
import {escapeHTML as esc, fmt} from './charts.js';
const nameOf=s=>s.replace(/^对象·|^依据·/,'');
const num=e=>e.positive+e.negative;
const pct=e=>num(e)?100*e.positive/num(e):null;
const mk=(o,b)=>o+'|'+b;
export function evidenceDesk(d){
 const n=d.network,objects=n.nodes.filter(x=>x.group==='评价对象').map(x=>x.name),bases=n.nodes.filter(x=>x.group==='评价依据').map(x=>x.name);
 const baseDefault='专业';
 return `<section class="ed36" id="ed36-stage" data-evidence-desk aria-labelledby="ed36-title">
  <div class="ed36-banner"><span class="ed36-number">卷宗 05 · 现场实验</span><span class="ed36-instruction">可拖拽的社会评价实验 / 无数据上传</span></div>
  <header class="ed36-heading"><div><p class="ed36-kicker">翻开档案，改变观察角度</p><h3 id="ed36-title">请亲手为一个判断<br><em>寻找证据。</em></h3></div><div class="ed36-brief"><b>这不是立场投票。</b><p>先选定被评价的对象，再把不同的“判断依据”取出，拖放到审理桌上。每放下一份材料，就能看到样本中相应的认可与否定构成如何变化。</p><button type="button" data-ed-demo>帮我摆好三份不同的证据 ↗</button></div></header>
  <div class="ed36-desk" id="ed36-desk">
   <div class="ed36-casebar"><div><span>① 确定审理对象</span><strong>这次讨论的是：<b id="ed36-current">专业</b></strong></div><div class="ed36-object-drawer" role="group" aria-label="选择评价对象">${objects.map(o=>`<button type="button" data-ed-object="${esc(o)}" aria-pressed="${o===baseDefault}">${esc(o)}</button>`).join('')}</div></div>
   <div class="ed36-workspace">
     <aside class="ed36-drawer"><div class="ed36-drawer-top"><span>② 取出判断依据</span><small>10份材料 / 点击或拖入</small></div><div class="ed36-tickets">${bases.map((b,i)=>`<button type="button" draggable="true" data-ed-ticket="${esc(b)}" title="点击放入空白审理位，或直接拖拽" aria-label="取出证据：${esc(b)}"><span class="ed36-ticket-index">${String(i+1).padStart(2,'0')}</span><b>${esc(b)}</b><span aria-hidden="true" class="ed36-ticket-grip">⠿</span></button>`).join('')}</div><p class="ed36-drawer-note">抽屉里的卡片代表研究编码类别，<strong>不是单条评论</strong>。每张卡背后是一组真实共现记录。</p></aside>
     <div class="ed36-board"><div class="ed36-board-head"><div><span>③ 把证据放在审理桌上</span><h4 id="ed36-board-headline">一份判断，可能有不同的依据。</h4></div><div class="ed36-board-tools"><button type="button" data-ed-undo>撤回上一份 ↶</button><button type="button" data-ed-clear>清空桌面 ×</button></div></div>
      <div class="ed36-droparea" id="ed36-droparea" aria-label="三个可拖放的证据比较位">${[0,1,2].map(i=>`<div class="ed36-slot" data-ed-slot="${i}" tabindex="0" role="button" aria-label="第${i+1}个空白证据位置，选择卡片后可以在这里放置"><div class="ed36-slot-empty"><span>0${i+1}</span><b>放下第${i+1}份依据</b><small>拖拽到这里，或点击左侧纸签</small></div></div>`).join('')}</div>
      <div class="ed36-ledger"><div class="ed36-ledger-head"><span>证据比较轨迹 · 非时间变化</span><span id="ed36-count">0 / 3 份</span></div><div class="ed36-plot"><svg id="ed36-plot" viewBox="0 0 900 200" preserveAspectRatio="none" role="img" aria-label="所选证据的明确立场认可比例，按放入顺序排列"><line x1="20" y1="100" x2="880" y2="100" class="ed36-midline"/><text x="26" y="91">50% 等分参考线</text><g id="ed36-paths"></g></svg></div><p id="ed36-reading" aria-live="polite">桌面尚无材料。先取出一份依据，观察同一个评价对象如何出现不同的立场构成。</p></div>
     </div>
   </div>
   <div class="ed36-ground"><div class="ed36-takeaway"><span>调查者的提醒</span><p>更换依据，会改变我们观察到的分组比例；<strong>但不会改变已经发生的评论。</strong>这些组别不是历史时间线，也不能由此推断评价依据导致了某种立场。</p></div><div class="ed36-actions"><button type="button" data-ed-matrix>到80格关系矩阵核对 ↗</button><button type="button" data-ed-restart>换一个对象重做实验 ↺</button></div></div>
  </div>
  <p class="ed36-note">数据来源：研究归档 network.edges，8类评价对象 × 10类评价依据，共80个编码组合。每张纸签对应其所选对象与依据的共现数量；比例为认可÷（认可＋否定）。中性与无法判断另列，不纳入明确立场百分比。无论如何组合，都不把不同组别求和当作独立人数。</p>
 </section>`;
}
export function mountEvidenceDesk(root,d){
 const el=root.querySelector('[data-evidence-desk]'); if(!el)return()=>{};
 const edgeMap=new Map(d.network.edges.map(e=>[mk(nameOf(e.source),nameOf(e.target)),e]));
 const allBases=d.network.nodes.filter(x=>x.group==='评价依据').map(x=>x.name);
 let object='专业',slots=[null,null,null],history=[],dragged=null;
 const slotsEls=[...el.querySelectorAll('[data-ed-slot]')],tickets=[...el.querySelectorAll('[data-ed-ticket]')];
 const nr=n=>n==null?'—':n.toFixed(1)+'%';
 const get=b=>edgeMap.get(mk(object,b));
 const slotMarkup=(basis,i)=>{
  const e=get(basis),p=pct(e),other=e.neutral+e.unknown;
  return `<div class="ed36-slipped"><span class="ed36-slip-cap">材料 0${i+1} / ${esc(object)}</span><button type="button" class="ed36-slip-x" data-ed-remove="${i}" aria-label="移除第${i+1}份材料">×</button><h5>${esc(basis)}</h5><div class="ed36-slip-count">${fmt(e.n)}<small> 条共现编码</small></div><div class="ed36-slip-meter" role="img" aria-label="认可${e.positive}条，否定${e.negative}条，其他${other}条"><i style="width:${e.positive/e.n*100}%;background:#48736a"></i><i style="width:${e.negative/e.n*100}%;background:#a44331"></i><i style="width:${other/e.n*100}%;background:#bbb0a0"></i></div><p>认可 ${fmt(e.positive)} · 否定 ${fmt(e.negative)} · 其他 ${fmt(other)}</p><div class="ed36-slip-pct"><span>明确立场中认可占比</span><b>${nr(p)}</b></div><button type="button" class="ed36-slip-link" data-ed-find="${esc(basis)}">核对矩阵 →</button></div>`;
 };
 function drawPlot(){let items=slots.map((b,i)=>b?{p:pct(get(b)),i,b}:null).filter(Boolean).filter(x=>x.p!==null),g=el.querySelector('#ed36-paths');
  let out='';const xy=x=>[160+x.i*290,175-x.p*1.55];
  if(items.length>1)out+=`<polyline points="${items.map(q=>xy(q).join(',')).join(' ')}" fill="none" stroke="#a44331" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="ed36-drawn"/>`;
  items.forEach(q=>{let [x,y]=xy(q);out+=`<line x1="${x}" y1="${y}" x2="${x}" y2="182" stroke="#877a66" stroke-dasharray="4 6"/><circle cx="${x}" cy="${y}" r="9" fill="#a44331" stroke="#eee1ca" stroke-width="4"/><text x="${x}" y="${Math.max(19,y-16)}" text-anchor="middle" class="ed36-pct-label">${q.p.toFixed(1)}%</text><text x="${x}" y="194" text-anchor="middle" class="ed36-axis-sub">材料 0${q.i+1}</text>`});g.innerHTML=out;
 }
 function update(){
  slots.forEach((b,i)=>{const target=slotsEls[i];target.classList.toggle('ed36-occupied',Boolean(b));target.classList.remove('ed36-pulsing');target.innerHTML=b?slotMarkup(b,i):`<div class="ed36-slot-empty"><span>0${i+1}</span><b>放下第${i+1}份依据</b><small>拖拽到这里，或点击左侧纸签</small></div>`;target.setAttribute('aria-label',b?`第${i+1}份，${b}，可点击移除`: `第${i+1}个空白证据位置`)});
  tickets.forEach(t=>{const included=slots.includes(t.dataset.edTicket);t.classList.toggle('ed36-ticket-used',included);t.setAttribute('aria-pressed',String(included))});
  const active=slots.filter(Boolean); el.querySelector('#ed36-count').textContent=`${active.length} / 3 份`;
  const headline=el.querySelector('#ed36-board-headline');
  headline.textContent=active.length===0?'一份判断，可能有不同的依据。':active.length===1?'第一份材料已拆封。现在试着换一种依据。':active.length===2?'第二份材料已入卷。比较两种立场构成。':'三份材料就位。请看下方轨迹如何改变。';
  drawPlot();const reading=el.querySelector('#ed36-reading');const ps=active.map(b=>({b,p:pct(get(b))})).filter(x=>x.p!==null);if(ps.length===0)reading.textContent='桌面尚无材料。先取出一份依据，观察同一个评价对象如何出现不同的立场构成。'; else if(ps.length===1)reading.textContent=`“${object} × ${ps[0].b}”的明确立场中，认可占 ${nr(ps[0].p)}。再放入另一份依据，比较分组差异。`;else{const lo=ps.reduce((a,b)=>a.p<b.p?a:b),hi=ps.reduce((a,b)=>a.p>b.p?a:b);reading.textContent=`在已选的${ps.length}组材料中，“${hi.b}”的认可占比最高（${nr(hi.p)}），“${lo.b}”最低（${nr(lo.p)}），相差${(hi.p-lo.p).toFixed(1)}个百分点。这是不同编码组合的横截面比较，不代表同一批评论者改变了看法。`}
 }
 function put(b,i=null){if(!allBases.includes(b))return; if(slots.includes(b)){const at=slots.indexOf(b);if(i!==null&&i!==at){history.push(slots.slice());slots[at]=null;slots[i]=b;update()}return;}const target=i===null?slots.findIndex(x=>x===null):i;if(target===-1){el.querySelector('#ed36-reading').textContent='三个审理位已经摆满。请先移走一份纸签，或点击“清空桌面”。';return}history.push(slots.slice());slots[target]=b;update();const box=slotsEls[target];box.classList.add('ed36-pulsing');if(box.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)box.animate([{transform:'translateY(-15px) rotate(-2deg)',opacity:.5},{transform:'translateY(0) rotate(0deg)',opacity:1}],{duration:520,easing:'cubic-bezier(.19,1,.22,1)'});}
 function setObject(next){if(!d.network.nodes.some(x=>x.group==='评价对象'&&x.name===next))return;object=next;history=[];slots=[null,null,null];el.querySelector('#ed36-current').textContent=object;el.querySelectorAll('[data-ed-object]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.edObject===object)));update()}
 function handleClick(ev){const o=ev.target.closest('[data-ed-object]');if(o){setObject(o.dataset.edObject);return}const t=ev.target.closest('[data-ed-ticket]');if(t){const b=t.dataset.edTicket;if(slots.includes(b)){history.push(slots.slice());slots[slots.indexOf(b)]=null;update()}else put(b);return}const remove=ev.target.closest('[data-ed-remove]');if(remove){const i=Number(remove.dataset.edRemove);if(slots[i]){history.push(slots.slice());slots[i]=null;update()}return}
  const demo=ev.target.closest('[data-ed-demo]');if(demo){setObject('专业');['个人学习经历','专业知识与理论','反讽或梗'].forEach((b,i)=>{put(b,i)});el.querySelector('.ed36-board').scrollIntoView({behavior:'smooth',block:'center'});return}
  if(ev.target.closest('[data-ed-undo]')){if(history.length){slots=history.pop();update()}return}if(ev.target.closest('[data-ed-clear]')){history.push(slots.slice());slots=[null,null,null];update();return}if(ev.target.closest('[data-ed-restart]')){setObject('专业');el.querySelector('.ed36-object-drawer').scrollIntoView({behavior:'smooth',block:'center'});return}
  const find=ev.target.closest('[data-ed-find]');if(find){goToMatrix(find.dataset.edFind);return}if(ev.target.closest('[data-ed-matrix]')){goToMatrix(slots.find(Boolean)||'公共价值');return}
 }
 function goToMatrix(b){const parent=el.closest('[data-network-archive]');if(parent)parent.dispatchEvent(new CustomEvent('na-v36-find',{bubbles:true,detail:{object,basis:b}}));root.querySelector('#na-v35-map')?.scrollIntoView({behavior:'smooth',block:'start'});}
 function dragStart(ev){const t=ev.target.closest('[data-ed-ticket]');if(!t)return;dragged=t.dataset.edTicket;ev.dataTransfer.effectAllowed='copy';ev.dataTransfer.setData('text/plain',dragged);el.classList.add('ed36-dragging');}
 function over(ev){const slot=ev.target.closest('[data-ed-slot]');if(!slot||!dragged)return;ev.preventDefault();ev.dataTransfer.dropEffect='copy';el.querySelectorAll('[data-ed-slot]').forEach(x=>x.classList.toggle('ed36-drop-focus',x===slot));}
 function drop(ev){const slot=ev.target.closest('[data-ed-slot]');if(!slot)return;ev.preventDefault();const b=dragged||ev.dataTransfer.getData('text/plain');if(b)put(b,Number(slot.dataset.edSlot));endDrag()}
 function endDrag(){dragged=null;el.classList.remove('ed36-dragging');el.querySelectorAll('.ed36-drop-focus').forEach(x=>x.classList.remove('ed36-drop-focus'))}
 function keyDown(ev){const s=ev.target.closest('[data-ed-slot]');if(!s||!['Enter',' '].includes(ev.key))return;ev.preventDefault();const i=Number(s.dataset.edSlot);if(slots[i]){history.push(slots.slice());slots[i]=null;update()}else{const b=allBases.find(b=>!slots.includes(b));if(b)put(b,i)}}
 el.addEventListener('click',handleClick);el.addEventListener('dragstart',dragStart);el.addEventListener('dragover',over);el.addEventListener('drop',drop);el.addEventListener('dragend',endDrag);el.addEventListener('keydown',keyDown);update();
 return()=>{el.removeEventListener('click',handleClick);el.removeEventListener('dragstart',dragStart);el.removeEventListener('dragover',over);el.removeEventListener('drop',drop);el.removeEventListener('dragend',endDrag);el.removeEventListener('keydown',keyDown)};
}
