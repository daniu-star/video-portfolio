export const fmt = n => n == null ? "未记录" : Number(n).toLocaleString("zh-CN");
export const escapeHTML = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const bars = (rows, max = 100, suffix = "%") => `<div class="bars">${rows.map((r,i) => `<div class="bar-row"><span class="bar-name">${escapeHTML(r[0])}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100,r[1]/max*100)}%;animation-delay:${i*.05}s;${r[2] ? `background:${r[2]}`:""}"></div></div><span class="bar-number">${fmt(r[1])}${suffix}</span></div>`).join("")}</div>`;

// Each point is one real source note. Coordinates are a layout, not an inferred semantic embedding.
export function mountNoteField(canvas, notes, onSelect, isPaused) {
  const ctx = canvas.getContext("2d", {alpha:true});
  if (!ctx) return () => {};
  const wrap = canvas.parentElement;
  const tooltip = wrap.querySelector(".field-tooltip");
  let w=0,h=0,dpr=1,frame=0,angle=.38,disposed=false,lastTime=0,projected=[];
  let pointer=null,selected=null;
  const points = notes.map((note,i) => {
    const y=1-2*(i+.5)/notes.length, a=i*Math.PI*(3-Math.sqrt(5));
    const r=Math.sqrt(1-y*y);
    return {x:Math.cos(a)*r,y,z:Math.sin(a)*r,note};
  });
  const resize = () => {
    const box = canvas.getBoundingClientRect();
    w=box.width;h=box.height;dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  function draw(time) {
    if(disposed)return;
    frame=requestAnimationFrame(draw);
    if(time-lastTime<32)return;
    const dt=Math.min(time-lastTime,80);lastTime=time;
    if(!isPaused() && !document.hidden)angle+=dt*.000034;
    ctx.clearRect(0,0,w,h);
    const radius=Math.min(w*.355,h*.43),cx=w*.58,cy=h*.5;
    const ca=Math.cos(angle),sa=Math.sin(angle),tilt=-.26,ct=Math.cos(tilt),st=Math.sin(tilt);
    const project=(x,y,z)=>{
      const xx=x*ca+z*sa,zz=-x*sa+z*ca,yy=y*ct-zz*st,z2=y*st+zz*ct;
      const scale=3.4/(3.4-z2*.5);
      return {x:cx+xx*radius*scale,y:cy+yy*radius*scale,z:z2,scale};
    };
    // Latitude rings give spatial context only.
    for(let lat=-2;lat<=2;lat++){
      const yy=lat*.29,rr=Math.sqrt(1-yy*yy);
      ctx.beginPath();
      for(let j=0;j<=120;j++){const a=j/120*Math.PI*2,p=project(Math.cos(a)*rr,yy,Math.sin(a)*rr);j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}
      ctx.strokeStyle="rgba(113,160,179,.095)";ctx.lineWidth=.6;ctx.stroke();
    }
    const ringR=radius*1.2;
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-.29);ctx.scale(1,.29);
    ctx.beginPath();ctx.arc(0,0,ringR,0,Math.PI*2);
    ctx.strokeStyle="rgba(217,183,129,.28)";ctx.lineWidth=1;ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,ringR*1.06,.5,2.7);ctx.strokeStyle="rgba(120,203,209,.18)";ctx.stroke();ctx.restore();
    projected=points.map(p=>({...project(p.x,p.y,p.z),note:p.note})).sort((a,b)=>a.z-b.z);
    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,radius*1.4);
    glow.addColorStop(0,"rgba(65,112,133,.075)");glow.addColorStop(1,"rgba(8,15,24,0)");
    ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    selected=null;let near=14;
    for(const p of projected){
      const visibility=(p.z+1)/2,activity=Math.log1p(p.note.comments)/8;
      const size=(.55+Math.min(activity,1)*1.6)*p.scale;
      const isGold=p.note.comments>=100;
      ctx.fillStyle=isGold?`rgba(217,183,129,${.2+visibility*.74})`:`rgba(133,195,210,${.12+visibility*.6})`;
      if(isGold&&p.z>.15){ctx.shadowColor="#d9b781";ctx.shadowBlur=8}else ctx.shadowBlur=0;
      ctx.beginPath();ctx.arc(p.x,p.y,size,0,Math.PI*2);ctx.fill();
      if(pointer&&p.z>-.3){const distance=Math.hypot(p.x-pointer.x,p.y-pointer.y);if(distance<near){near=distance;selected=p}}
    }
    ctx.shadowBlur=0;
    // Crosshair is a quiet instrument frame, not another data series.
    ctx.strokeStyle="rgba(140,174,188,.24)";ctx.lineWidth=.6;
    for(const [x,y] of [[cx-radius*1.23,cy],[cx+radius*1.23,cy],[cx,cy-radius*1.17],[cx,cy+radius*1.17]]){
      ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke();
    }
    if(selected&&pointer){
      ctx.strokeStyle="#e6cd9d";ctx.lineWidth=1;ctx.beginPath();ctx.arc(selected.x,selected.y,7,0,Math.PI*2);ctx.stroke();
      tooltip.style.display="block";
      tooltip.style.left=Math.min(w-245,Math.max(10,selected.x+18))+"px";
      tooltip.style.top=Math.max(10,Math.min(h-90,selected.y-55))+"px";
      tooltip.innerHTML=`<b>${escapeHTML(selected.note.id)} · ${fmt(selected.note.comments)} 条评论</b>${escapeHTML(selected.note.title||"未恢复笔记标题")}<br><span class="muted">点击查看笔记档案</span>`;
    } else tooltip.style.display="none";
  }
  const move=e=>{const b=canvas.getBoundingClientRect();pointer={x:e.clientX-b.left,y:e.clientY-b.top}};
  const leave=()=>{pointer=null;tooltip.style.display="none"};
  const click=()=>{if(selected)onSelect(selected.note.id)};
  canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerleave",leave);canvas.addEventListener("click",click);
  frame=requestAnimationFrame(draw);
  return ()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerleave",leave);canvas.removeEventListener("click",click)};
}

export const networkEdges = [
  {object:"专业",basis:"公共价值",pct:51.2,direction:"认可"},
  {object:"职业",basis:"公共价值",pct:50.6,direction:"认可"},
  {object:"专业",basis:"身份情感",pct:50.5,direction:"认可"},
  {object:"课程",basis:"专业知识与理论",pct:50.5,direction:"认可"},
  {object:"行业",basis:"反讽或玩梗",pct:87.1,direction:"否定"},
  {object:"学科",basis:"无依据断言",pct:81.5,direction:"否定"},
  {object:"课程",basis:"反讽或玩梗",pct:79.6,direction:"否定"},
  {object:"行业",basis:"实习就业经历",pct:75.9,direction:"否定"},
  {object:"职业",basis:"反讽或玩梗",pct:75.4,direction:"否定"}
];
export function networkSVG(mode="all"){
  const left=["课程","专业","职业","行业","学科"],right=["公共价值","身份情感","专业知识与理论","反讽或玩梗","无依据断言","实习就业经历"];
  const ly=i=>65+i*76,ry=i=>40+i*65;
  return `<svg class="network-svg" viewBox="0 0 720 430" role="img" aria-label="论文披露的九组评价对象与依据关系；等宽连线，颜色代表报告的评价方向，不代表样本规模">
    <text x="35" y="20">评价对象</text><text x="551" y="20">评价依据</text>
    ${networkEdges.map((e,i)=>{
      const y1=ly(left.indexOf(e.object)),y2=ry(right.indexOf(e.basis))+20;
      const muted=mode!=="all"&&mode!==e.direction;
      return `<path class="network-edge" data-edge="${i}" tabindex="0" role="button" aria-label="${e.object}与${e.basis}，${e.direction}比例${e.pct}%" d="M150 ${y1} C320 ${y1},390 ${y2},540 ${y2}" stroke="${e.direction==="否定"?"#e58f85":"#78cbd1"}" stroke-width="3" fill="none" opacity="${muted?.07:.55}"><title>${e.object} × ${e.basis}：${e.direction} ${e.pct}%</title></path>`;
    }).join("")}
    ${left.map((label,i)=>`<rect x="32" y="${ly(i)-17}" width="117" height="34" rx="2" fill="#1b303e" stroke="#355061"/><text class="node-label" x="90" y="${ly(i)+5}" text-anchor="middle">${label}</text>`).join("")}
    ${right.map((label,i)=>`<rect x="541" y="${ry(i)+3}" width="157" height="34" rx="2" fill="#1b303e" stroke="#355061"/><text class="node-label" x="619" y="${ry(i)+25}" text-anchor="middle">${label}</text>`).join("")}
  </svg>`;
}
