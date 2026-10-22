/* Live ink brush lettering renderer, no external JS libraries or font binaries.
   ARIA, text selection and search keep the original semantic heading.  Canvas is purely visual.
   Each glyph is rendered from the browser's calligraphic glyphs, then dry-brushed with
   stratified density, fine fibre gaps, ink pooling, uneven rhythm and restrained splashes. */
(function(){
'use strict';
const SELECTORS=[
 '.v42-masthead h1','.v42-ink-subtitle','.archive-v3 .v3-section-head h2','.archive-v3 .v3-next-main h2',
 '.mp41 .mp41-ending h2','.mp41 .mp41-hero h1','.mp41 .mp41-section-intro h2',
 '.cinema-story .story-prologue h1','.cinema-story .reading-copy h2','.cinema-story .cinema-ending h2',
 '#employment .em-intro-heading h2','#public .pv-intro h2','#public .pv-duet-head h3',
 '#ability .ab-v34-intro h2','.na-v35-reading .na35-heading h2','.ea37-page h1','.al38-page h1',
 '.rm39-archive h1','.rm39-cover-copy h2','.rm39-index h2','#ab-heading','#na-v35-h2','#pv-title','#public .pv-opening h2'
].join(',');
const FONT="'Zhi Mang Xing','Ma Shan Zheng','STXingkai','AR PL KaitiM GB','KaiTi',serif";
const seen=new Set();let pending=false;let resizeTimer=0;
function hash(n){n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>16,0x45d9f3b);return ((n^n>>>16)>>>0)/4294967295}
function softness(x,y,seed){return .5+.24*Math.sin(x*.126+y*.053+seed)+.13*Math.sin(x*.031-y*.113+seed*2.6)+.13*Math.cos(y*.241+x*.031-seed)}
function paintGlyph(ctx,char,size,color,seed,isCover){
 const w=Math.ceil(size*1.56),h=Math.ceil(size*1.66);
 const source=document.createElement('canvas');source.width=w;source.height=h;
 const c=source.getContext('2d',{willReadFrequently:true});
 if(!c)return source;
 c.clearRect(0,0,w,h); c.fillStyle='#fff'; c.strokeStyle='#fff';c.textAlign='center';c.textBaseline='middle';
 c.font=`${size}px ${FONT}`;
 // slight weighted ink, never mechanical faux-bold
 c.lineWidth=Math.max(.55,size*.009);c.lineJoin='round';
 c.strokeText(char,w*.5,h*.505,w*.85);c.fillText(char,w*.5,h*.505,w*.85);
 const img=c.getImageData(0,0,w,h),d=img.data;
 const ink=hexColor(color), pale=isCover?[240,206,159]:[207,173,137];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4;if(d[i+3]<12)continue;
   const irregular=softness(x,y,seed*7.1);
   const fibre=Math.sin(y*.71 + x*.076 + seed*11.8)*.5+.5;
   const rare=hash((x>>1)*73856093^(y>>1)*19349663^(seed*997|0));
   let density=.84+irregular*.19-fibre*.14;
   if(rare>.91 && irregular<.57)density*=.23; // individual broken fibres / 飞白
   if(rare>.981)density*=.02;
   if(irregular>.76)density+=.10; // wet ink pools
   density=Math.min(1,Math.max(.03,density));
   const colorBlend=Math.max(0,Math.min(1,(1-irregular)*.16));
   d[i]=ink[0]*(1-colorBlend)+pale[0]*colorBlend;
   d[i+1]=ink[1]*(1-colorBlend)+pale[1]*colorBlend;
   d[i+2]=ink[2]*(1-colorBlend)+pale[2]*colorBlend;
   d[i+3]=Math.round(d[i+3]*density);
 }
 c.putImageData(img,0,0);
 return source;
}
function hexColor(v){
 const tmp=document.createElement('canvas').getContext('2d');tmp.fillStyle=v||'#ead9bd';
 const z=tmp.fillStyle; if(z[0]==='#'){
 const t=z.length===4?z.slice(1).split('').map(s=>s+s).join(''):z.slice(1);
 return [parseInt(t.slice(0,2),16),parseInt(t.slice(2,4),16),parseInt(t.slice(4,6),16)];}
 const a=(z.match(/\d+(?:\.\d+)?/g)||[]).map(Number);return [a[0]||235,a[1]||213,a[2]||182];
}
function charRects(node){
 const out=[];let seed=0;
 const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){
  const n=walker.currentNode, txt=n.textContent||'';
  if(n.parentElement?.closest('canvas,.ink-v43-layer'))continue;
  for(let i=0;i<txt.length;i++){
   const ch=txt[i];if(!ch.trim())continue;
   const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+1);
   const rect=r.getBoundingClientRect();if(rect.width<1||rect.height<1)continue;
   const cs=getComputedStyle(n.parentElement);
   out.push({ch,rect,font:parseFloat(cs.fontSize)||60,color:cs.color,em:n.parentElement.closest('em,strong')!==null,seed:seed++});
  }
 }
 return out;
}
function brushOne(el,force){
 if(!el.isConnected)return;
 const bounds=el.getBoundingClientRect(); if(bounds.width<30||bounds.height<22)return;
 const old=el.querySelector(':scope > canvas.ink-v43-layer');
 const signature=Math.round(bounds.width)+'/'+Math.round(bounds.height)+'/'+(el.textContent||'');
 if(!force && old?.dataset?.signature===signature)return;
 // Must measure genuine glyph positions BEFORE hiding the source text.
 el.classList.remove('ink-v43-ready');
 const rects=charRects(el),canvas=old||document.createElement('canvas');if(!rects.length)return;
 const ratio=Math.min(2,window.devicePixelRatio||1);
 canvas.width=Math.ceil(bounds.width*ratio);canvas.height=Math.ceil(bounds.height*ratio);
 canvas.className='ink-v43-layer';canvas.dataset.signature=signature;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
 ctx.scale(ratio,ratio);
 const isCover=el.matches('.v42-masthead h1');
 const isEnding=el.matches('.mp41-ending h2,.cinema-ending h2');
 el.classList.add('ink-v43');el.classList.toggle('ink-v43-cover',isCover);el.classList.toggle('ink-v43-ending',isEnding);
 rects.forEach((g,index)=>{
   const f=Math.min(190,Math.max(19,g.font));
   const seed=17+index*13;
   const isRed=g.em||el.matches('.v42-ink-subtitle');
   const rgb=isRed?[198,103,77]:isCover?[246,225,187]:isEnding?[237,219,193]:[48,39,32];
   // Protect dark/paper headings without accidentally turning dark ink white.
   let color=`rgb(${rgb.join(',')})`;
   if(!isCover&&!isEnding&&!isRed){
    const c=hexColor(g.color);
    color=`rgb(${c[0]},${c[1]},${c[2]})`;
   }
   const glyph=paintGlyph(ctx,g.ch,f,color,seed,isCover);
   const cx=g.rect.left-bounds.left+g.rect.width/2,cy=g.rect.top-bounds.top+g.rect.height/2;
   const jitter=(hash(seed*67)-.5)*f*.040;
   const rotate=(hash(seed*123)-.5)*(isCover?.078:.054);
   const sx=(isCover?.98:1)+(hash(seed*9)-.5)*.065;
   const sy=1+(hash(seed*21)-.5)*.065;
   ctx.save();ctx.translate(cx+jitter,cy);ctx.rotate(rotate);ctx.scale(sx,sy);
   ctx.drawImage(glyph,-glyph.width/2,-glyph.height/2);ctx.restore();
 });
 if(isCover){
  // Separate asymmetric ink sweep, with tapering and a few dry-brush whiskers.
  const y=Math.min(bounds.height-11,bounds.height*.91);
  ctx.save();ctx.strokeStyle='rgba(159,58,43,.80)';ctx.lineCap='round';
  for(let j=0;j<6;j++){
   ctx.beginPath();ctx.moveTo(bounds.width*.12,y+j*.8);ctx.bezierCurveTo(bounds.width*.28,y-9+j,bounds.width*.55,y-4+j,bounds.width*.83,y+4+j*.6);
   ctx.lineWidth=Math.max(.5,3-j*.48);ctx.globalAlpha=.65-j*.08;ctx.stroke();
  }
  ctx.restore();
 }
 if(!old)el.appendChild(canvas);
 el.classList.add('ink-v43-ready');
 if(isCover&&!el.dataset.inkAnimated){el.classList.add('ink-v43-animate');el.dataset.inkAnimated='1';}
 seen.add(el);
}
function render(force=false){
 document.querySelectorAll(SELECTORS).forEach(el=>{
  try{brushOne(el,force)}catch(e){el.classList.remove('ink-v43-ready');console.warn('Ink fallback',e)}
 });
 for(const el of Array.from(seen))if(!el.isConnected)seen.delete(el);
}
function schedule(force=false){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;render(force)})}
function boot(){
 schedule();const main=document.getElementById('main');
 if(main){const obs=new MutationObserver(records=>{
  if(records.some(r=>Array.from(r.addedNodes).some(n=>n.nodeType===1 && !(n.classList?.contains('ink-v43-layer')))))schedule();
 });obs.observe(main,{childList:true,subtree:true});}
 window.addEventListener('hashchange',()=>setTimeout(()=>schedule(true),70));
 document.addEventListener('click',evt=>{
   if(!evt.target.closest('[data-ink-replay]'))return;
   evt.preventDefault();
   if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   const heading=document.querySelector('.v42-masthead h1');if(!heading)return;
   heading.classList.remove('ink-v43-animate');void heading.offsetWidth;
   heading.classList.add('ink-v43-animate');
 });
 window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>render(true),150)},{passive:true});
 if(document.fonts?.ready)document.fonts.ready.then(()=>render(true)).catch(()=>{});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.__INK_V43__={render:()=>render(true),version:'4.3',mode:'live textured canvas over accessible HTML text'};
})();
