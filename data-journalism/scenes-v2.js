import {escapeHTML as esc,fmt} from "./charts.js";

export const palettes=["#d9b77d","#86babc","#d78e75","#a9b298","#978eac","#8c9eab","#beae97","#688b8b"];
export function raceFinal(d){
 const max=Math.max(1,...d.rows.map(r=>Number(r.final)||0));
 const top=Math.ceil(max/200)*200;
 const ticks=[0,.25,.5,.75,1].map(frac=>Math.round(top*frac));
 return `<div class="race-fig" aria-label="八篇样本笔记截至${esc(d.months.at(-1))}的累计已采集评论数">
  <div class="race-axis-intro"><b>纵轴：匿名笔记编号</b><span>横轴：累计已采集评论（条）</span></div>
  <div class="race-coordinate" style="--race-max:${top}">
    <div class="race-rows">${d.rows.map((r,i)=>`<div class="race-data-row" style="--row:${i}"><span class="race-note-label" title="匿名笔记 ${esc(r.id)}">${esc(r.id)}</span><div class="race-track"><i class="race-data-bar" style="--w:${(Number(r.final)/top*100).toFixed(3)}%;--c:${palettes[i]}"></i></div><b class="race-data-value">${fmt(r.final)}</b></div>`).join('')}</div>
    <div class="race-x-ticks" aria-hidden="true">${ticks.map((v,i)=>`<span style="left:${i*25}%">${fmt(v)}</span>`).join('')}</div>
   </div>
  <div class="race-axis-bottom"><span>单位：条／笔记</span><b data-race-month>截至 ${esc(d.months.at(-1))}</b></div>
  <script type="application/json" class="race-monthly-data">${JSON.stringify({months:d.months,rows:d.rows.map(r=>({id:r.id,values:r.values}))}).replaceAll('<','\u003c')}</script>
  <div class="race-method-hint">真实月份来自有日期的已采集评论；早期无记录不补零，也不推断平台总体热度。滚动后自动播放，退出视野保留当前视图。</div>
 </div>`;
}

export function migrationFinal(d){
  const sources=d.frames,targets=d.frames,scale=390/d.total,gap=13;
  const left=new Map(),right=new Map();let y=48;
  for(const name of sources){const value=d.flows.filter(f=>f.source===name).reduce((s,f)=>s+f.value,0);left.set(name,{y,h:value*scale,offset:0,value});y+=value*scale+gap}
  y=48;
  for(const name of targets){const value=d.flows.filter(f=>f.target===name).reduce((s,f)=>s+f.value,0);right.set(name,{y,h:value*scale,offset:0,value});y+=value*scale+gap}
  const links=d.flows.map(f=>{
    const l=left.get(f.source),r=right.get(f.target),h=f.value*scale;
    const y1=l.y+l.offset,y2=r.y+r.offset;l.offset+=h;r.offset+=h;
    return `<path d="M170 ${y1} C310 ${y1},450 ${y2},590 ${y2} L590 ${y2+h} C450 ${y2+h},310 ${y1+h},170 ${y1+h}Z" data-local-value="${esc(f.source)} → ${esc(f.target)}：${f.value}篇" tabindex="0" role="button" fill="${f.target==="就业职业"?"#d9b77d":"#77a7ad"}" opacity="${f.target==="就业职业"?.64:.17}"><title>${esc(f.source)} → ${esc(f.target)}：${f.value}篇</title></path>`;
  }).join("");
  const nodes=(map,x,labelx,anchor)=>[...map].map(([name,r])=>`<rect x="${x}" y="${r.y}" width="7" height="${Math.max(1,r.h)}" fill="${name==="就业职业"?"#d9b77d":"#91b4b5"}"/><text x="${labelx}" y="${r.y+r.h/2+4}" text-anchor="${anchor}">${esc(name)} ${r.value}</text>`).join("");
  return `<svg class="flow-final" viewBox="0 0 760 555" role="img" aria-label="696篇笔记的框架迁移，47条非零流向，评论就业框架285篇"><text x="120" y="22" text-anchor="middle">笔记的框架</text><text x="650" y="22" text-anchor="middle">评论区主导框架</text>${links}${nodes(left,163,153,"end")}${nodes(right,590,608,"start")}</svg>`;
}
export function abilityFinal(rows){
  return `<div class="ability-clusters" role="img" aria-label="前台能力1467次，核心能力492次"><div class="foreground-cluster"><span>前台能力 <b>1,467</b></span><div>${rows.slice(0,2).map(r=>`<div class="ability-orb" data-local-value="${esc(r[1])}：${r[2]}次" tabindex="0" role="button"><strong>${r[2]}</strong><span>${esc(r[1])}</span></div>`).join("")}</div></div><div class="core-cluster" data-local-value="五类核心能力合计492次，未披露内部具体数值" tabindex="0" role="button"><span>核心能力</span><strong>492</strong><small>五类合计</small></div></div>`;
}
export function attributeFinal(rows){
  return `<div class="attribute-pictogram" role="img" aria-label="57个属性判断，19次迁移，16次通用，9次AI替代，8次专业独特，5次AI强化"><div class="pictogram-grid">${rows.flatMap((r,i)=>Array.from({length:r[1]},()=>`<i style="--c:${palettes[i]}" title="${esc(r[0])}"></i>`)).join("")}</div><div class="pictogram-key">${rows.map((r,i)=>`<span><i style="background:${palettes[i]}"></i>${esc(r[0])} <b>${r[1]}</b></span>`).join("")}</div></div>`;
}
const disclosed=new Set(["专业|公共价值","职业|公共价值","专业|身份情感","课程|专业知识与理论","行业|反讽或梗","学科|无依据断言","课程|反讽或梗","行业|实习就业经历","职业|反讽或梗"]);
export function networkFinal(d){
  const objects=d.nodes.filter(n=>n.group==="评价对象"),bases=d.nodes.filter(n=>n.group==="评价依据");
  const coords=new Map();
  objects.forEach((n,i)=>coords.set(n.id,{x:172,y:60+i*52}));
  bases.forEach((n,i)=>coords.set(n.id,{x:578,y:35+i*47}));
  const edges=d.edges.map(r=>{
    const a=coords.get(r.source),b=coords.get(r.target);
    const key=r.source.split("·")[1]+"|"+r.target.split("·")[1],focus=disclosed.has(key);
    const color=r.balance==null?"#66776f":r.balance>=0?"#86babc":"#d78e75";
    return `<path d="M${a.x} ${a.y} C340 ${a.y},410 ${b.y},${b.x} ${b.y}" fill="none" data-local-value="${esc(key.replace("|"," × "))}：${r.n}次共现" tabindex="0" role="button" stroke="${color}" stroke-width="${Math.max(.8,Math.sqrt(r.n)/12)}" opacity="${focus?.8:.08}"><title>${esc(key.replace("|"," × "))}：共现${r.n}次</title></path>`;
  }).join("");
  const nodes=d.nodes.map(n=>{const p=coords.get(n.id),left=n.group==="评价对象";return `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#c8c0a4"/><text x="${p.x+(left?-14:14)}" y="${p.y+4}" text-anchor="${left?"end":"start"}">${esc(n.name)}</text>`}).join("");
  return `<svg class="network-final" viewBox="0 0 800 510" role="img" aria-label="评价关系归档网络：8类对象、10类依据、80条边；突出显示核对的9组关系">${edges}${nodes}</svg>`;
}
const content={
  race:{title:"讨论如何累积",caption:"原始库描述性补充。固定八篇笔记，只计算有发表日期的已采集评论；不是平台总体热度。",duration:20000,file:"race.csv"},
  migration:{title:"讨论在评论区转了向",caption:"复现归档补充，696篇笔记。宽度为笔记数，未识别类别保留；不表示因果。",duration:6000,file:"migration.csv"},
  ability:{title:"专业形象的前台与后台",caption:"终版论文：743＋724＋492＝1,959次能力提及。核心五类未披露细分数量。",duration:5000,file:"ability.csv"},
  attributes:{title:"被明确说出的57次判断",caption:"终版论文：每个标记代表一次属性判断。只有8次被归为新闻专业独特能力。",duration:5000,file:"attributes.csv"},
  network:{title:"同一个对象，不同的依据",caption:"复现归档补充，80条边，不等同于正文60组。边宽为共现次数，颜色为认可与否定的平衡。",duration:6000,file:"network-edges.csv"}
};
export function sceneMarkup(key,data,registry){
  const c=content[key],project=registry[key]||{};
  const fallback={race:()=>raceFinal(data.race),migration:()=>migrationFinal(data.migration),
    ability:()=>abilityFinal(data.ability),attributes:()=>attributeFinal(data.attributes),network:()=>networkFinal(data.network)}[key]();
  const src="";
  return `<figure class="scrolly-scene scene-${key}" id="chart-${key}" data-scene-key="${key}" data-embed="" data-duration="${c.duration}">
    <div class="scene-tools"><span>${c.title}</span><button data-scene-replay="${key}" aria-label="重播${c.title}">重播</button></div>
    <div class="scene-visual"><div class="scene-terminal">${fallback}</div></div>
    <figcaption>${c.caption}</figcaption>
    ${key==="network"?'<div class="scene-legend"><span>青色：认可净优势</span><span>珊瑚：否定净优势</span><span>灰色：无明确方向</span></div>':""}
    <p class="scene-status" aria-live="polite">进入画面后自动呈现。</p>
    <details class="scene-source"><summary>数据与来源</summary><p>${key==="migration"?data.migration.note:key==="network"?data.network.note:c.caption}</p><a href="./data/figures/v2/${c.file}" download>下载汇总数据</a>${project.public?`<a href="${esc(project.public)}" target="_blank" rel="noopener noreferrer">独立查看Flourish图表</a>`:""}</details>
  </figure>`;
}

let scriptPromise;
function loadFlourish(){
  if(window.Flourish?.loadEmbed)return Promise.resolve();
  if(scriptPromise)return scriptPromise;
  scriptPromise=new Promise((resolve,reject)=>{
    window.Flourish={...(window.Flourish||{}),disable_autoload:true};
    const s=document.createElement("script");s.src="https://public.flourish.studio/resources/embed.js";s.async=true;
    s.onload=()=>window.Flourish?.loadEmbed?resolve():reject(new Error("Flourish API unavailable"));
    s.onerror=()=>{s.remove();scriptPromise=null;reject(new Error("Flourish network failure"))};
    document.head.append(s);
  });
  return scriptPromise;
}
export function mountScenes(root){
  const scenes=[...root.querySelectorAll("[data-scene-key]")];
  const state=new Map(scenes.map(el=>[el,{played:false,live:false,token:0,timer:null,raceTimer:null,ratio:0}]));
  let active=null,disposed=false,frame;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const quiet=()=>reduced.matches||navigator.connection?.saveData||document.body.classList.contains("motion-paused");
  function stop(el,message="动画已结束，显示数据终态。"){
    if(!el)return;const s=state.get(el);if(!s)return;
    s.token++;clearTimeout(s.timer);clearInterval(s.raceTimer);s.raceTimer=null;s.live=false;s.played=true;
    el.querySelector(".scene-live")?.replaceChildren();el.classList.remove("scene-is-live");
    el.classList.remove("scene-playing");
    el.querySelector(".scene-status").textContent=message;
    if(active===el)active=null;
  }
  function playRace(el,sc){
    const script=el.querySelector('.race-monthly-data');if(!script)return;
    let series;try{series=JSON.parse(script.textContent)}catch{return}
    const chart=el.querySelector('.race-fig'),rows=[...chart.querySelectorAll('.race-data-row')];const globalTop=Math.ceil(Math.max(...series.rows.flatMap(r=>r.values),1)/200)*200;
    let index=series.months.findIndex((m,i)=>series.rows.some(r=>Number(r.values[i])>0));if(index<0)index=0;
    const paint=i=>{const vals=series.rows.map((r,n)=>({n,v:Number(r.values[i]||0)}));const ranks=vals.slice().sort((a,b)=>b.v-a.v).reduce((acc,x,j)=>(acc[x.n]=j,acc),{});
      rows.forEach((row,n)=>{const v=vals[n].v;row.style.order=String(ranks[n]);const bar=row.querySelector('.race-data-bar'),value=row.querySelector('.race-data-value');bar.style.setProperty('--w',(v/globalTop*100).toFixed(3)+'%');value.textContent=fmt(v);row.title=series.rows[n].id+' · '+series.months[i]+'：'+fmt(v)+'条'});
      const stamp=chart.querySelector('[data-race-month]');if(stamp)stamp.textContent='记录月份 '+series.months[i]+' · 累计采集';};
    paint(index);clearInterval(sc.raceTimer);sc.raceTimer=setInterval(()=>{if(index>=series.months.length-1){clearInterval(sc.raceTimer);sc.raceTimer=null;return}paint(++index)},520);
  }
  function start(el,manual=false){
    const s=state.get(el);if(!s||(!manual&&s.played))return;
    if(active&&active!==el){const older=active,prior=state.get(older);if(prior?.raceTimer)clearInterval(prior.raceTimer);prior.raceTimer=null;older.classList.remove('scene-playing');}
    active=el;s.played=true;s.live=false;el.classList.add('scene-revealed');
    if(quiet()){el.classList.remove('scene-playing');el.querySelector('.scene-status').textContent='完整数据已显示。';return;}
    el.classList.remove('scene-playing');void el.offsetWidth;el.classList.add('scene-playing');
    if(el.dataset.sceneKey==='race')playRace(el,s);
    el.querySelector('.scene-status').textContent=el.dataset.sceneKey==='race'?'已自动开始逐月播放。可重播，也可继续阅读。':'图形已显影。悬停查看计数，点击节点聚焦。';
  }
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){const s=state.get(entry.target);s.ratio=entry.intersectionRatio;
      if(entry.intersectionRatio>=.3)entry.target.classList.add("scene-revealed");
    }
    if(active){const r=active.getBoundingClientRect();if((r.bottom<0||r.top>innerHeight)&&!active.contains(document.activeElement))stop(active)}
    const candidate=scenes.filter(el=>state.get(el).ratio>=.3&&!state.get(el).played)
      .sort((a,b)=>state.get(b).ratio-state.get(a).ratio)[0];
    if(candidate)start(candidate);
  },{threshold:[0,.15,.3,.5,.75]});
  scenes.forEach(el=>observer.observe(el));
  const click=e=>{
   const b=e.target.closest('[data-scene-replay]');if(b){const el=b.closest('[data-scene-key]');stop(el);start(el,true);return}
   const mark=e.target.closest('.scene-terminal [data-local-value]');if(mark){const scene=mark.closest('.scrolly-scene');const read=scene?.querySelector('.scene-status');if(read)read.textContent=mark.dataset.localValue;scene?.querySelectorAll('[data-local-value]').forEach(x=>x.classList.toggle('v49-selected',x===mark));}
 };
  const pause=()=>{if(quiet())scenes.forEach(el=>stop(el,"已减少动态效果，显示完整数据。"))};
  const visibility=()=>{if(document.hidden&&active)stop(active)};
  const scroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(active){const r=active.getBoundingClientRect();if((r.bottom < -innerHeight||r.top>innerHeight*2)&&!active.contains(document.activeElement))stop(active)}})};
  root.addEventListener("click",click);document.addEventListener("visibilitychange",visibility);
  const motionButton=document.querySelector("#motion-toggle");motionButton?.addEventListener("click",pause);
  reduced.addEventListener("change",pause);window.addEventListener("scroll",scroll,{passive:true});
  if(quiet())pause();
  return ()=>{disposed=true;observer.disconnect();cancelAnimationFrame(frame);scenes.forEach(el=>stop(el));root.removeEventListener("click",click);document.removeEventListener("visibilitychange",visibility);motionButton?.removeEventListener("click",pause);reduced.removeEventListener("change",pause);window.removeEventListener("scroll",scroll)};
}
