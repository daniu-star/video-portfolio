/* V8 · interactive pseudo-3D astronomy laboratory. All geometry and radio responses are educational simulations. */
(function(NS){'use strict';
const $=id=>document.getElementById(id);
const emitters=[{id:'mobile',name:'手机热点',x:-110,z:50},{id:'drone',name:'遥控发射器',x:140,z:-80},{id:'station',name:'模拟台站',x:220,z:165}];
const places=[{id:'core',name:'核心区检查点',r:3.2,angle:-1.2,explain:'距台址约3公里。核心区存在严格的无线电发射设备管理要求；参观人员要遵守现场设备寄存规定。'},{id:'middle',name:'中间区检查点',r:8.4,angle:1.1,explain:'距台址约8公里。中间区采取分级管理，设置台站需核查频率、功率和审批条件。'},{id:'outer',name:'边远区检查点',r:21,angle:3.05,explain:'距台址约21公里。边远区并非无约束区域；涉及无线电的建设应按保护办法核验。'}];
const T=(x,y,z)=>({x,y,z});
const G={active:false,stage:-1,yaw:.45,pitch:.43,zoom:1,origin:'fast',lastFocus:null,emitters:new Set(),inspected:new Set(),aimAz:40,aimEl:12,discovered:false,drag:null,
 get done(){return this.stage>=3},
 init(){
  ['fastQuickStart','fastPulse'].forEach(id=>$(id)?.addEventListener('click',()=>this.open()));
  $('fastGameExit').addEventListener('click',()=>this.close());
  $('fastGameMain').addEventListener('click',e=>{const b=e.target.closest('[data-fast-action]');if(!b)return;this.act(b.dataset.fastAction,b.dataset.id)});
  $('fastGameMain').addEventListener('input',e=>{if(e.target.id==='fastAz'){this.aimAz=Number(e.target.value)}if(e.target.id==='fastEl'){this.aimEl=Number(e.target.value)}this.setReadout()});
  $('fastGameMain').addEventListener('pointerdown',e=>{if(e.target.id!=='fastScene')return;this.drag={x:e.clientX,y:e.clientY,yaw:this.yaw,pitch:this.pitch};e.target.setPointerCapture(e.pointerId)});
  $('fastGameMain').addEventListener('pointermove',e=>{if(!this.drag)return;this.yaw=this.drag.yaw+(e.clientX-this.drag.x)*.008;this.pitch=Math.max(.16,Math.min(1.2,this.drag.pitch+(e.clientY-this.drag.y)*.006));this.paint()});
  ['pointerup','pointercancel'].forEach(k=>$('fastGameMain').addEventListener(k,()=>this.drag=null));
  $('fastGameMain').addEventListener('wheel',e=>{if(e.target.id!=='fastScene')return;e.preventDefault();this.zoom=Math.max(.7,Math.min(1.65,this.zoom*Math.exp(-e.deltaY*.0009)));this.paint()},{passive:false});
  document.addEventListener('keydown',e=>{
    if(!this.active)return;
    if(e.key==='Escape'){this.close();e.stopPropagation();return}
    if(this.stage===2 && !['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)){
      const action={ArrowLeft:'az-dec',ArrowRight:'az-inc',ArrowUp:'el-inc',ArrowDown:'el-dec'}[e.key];
      if(action){e.preventDefault();this.act(action)}
    }
  });
  NS.onState((s,p)=>{if('site' in p){if(this.active&&s.site!=='fast')this.close();this.portal()}});
  setInterval(()=>this.portal(),350);this.portal();
 },
 portal(){const show=NS.state.entered&&NS.state.site==='fast'&&!this.active&&!NS.Drive?.active&&NS.Geo?.mode==='demo';const q=$('fastQuickStart'),p=$('fastPulse');if(q){q.hidden=!show;q.querySelector('small').textContent='旋转模型 · 巡检保护区 · 调谐接收'}if(!p)return;p.hidden=!show;if(!show)return;
  const n=NS.DB.nodes.fast_core,en=NS.App?.engine;if(!n||!en)return;const pos=en.proj({x:n.scene_x,y:n.scene_y+145,z:n.scene_z});if(!pos)return;
  p.style.left=Math.max(10,Math.min(innerWidth-230,pos.x+30))+'px';p.style.top=Math.max(110,Math.min(innerHeight-180,pos.y-55))+'px';
 },
 open(){if(NS.Drive?.active)return;if(!NS.state.entered){NS.App.enterMap();setTimeout(()=>this.open(),950);return}if(this.active)return;
  this.lastFocus=document.activeElement;this.origin=NS.state.site;if(NS.Geo?.mode==='demo'&&NS.state.site!=='fast')NS.App.setSite('fast');
  this.active=true;this.stage=-1;this.yaw=.45;this.pitch=.43;this.zoom=1;this.emitters=new Set(emitters.map(x=>x.id));this.inspected=new Set();this.aimAz=40;this.aimEl=12;this.discovered=false;
  $('fastGameShell').hidden=false;document.body.classList.add('is-fast-playing');this.render();this.portal();$('fastGameExit').focus();
 },
 close(){this.active=false;$('fastGameShell').hidden=true;document.body.classList.remove('is-fast-playing');this.portal();if(this.lastFocus?.isConnected)this.lastFocus.focus({preventScroll:true})},
 act(a,id){
  if(a==='begin'){this.stage=0;this.render();return}
  if(a==='emitter'){this.emitters.delete(id);this.render();return}
  if(a==='next'&&this.stage===0&&this.emitters.size===0){this.stage=1;this.render();return}
  if(a==='inspect'){this.inspected.add(id);this.render();return}
  if(a==='next'&&this.stage===1&&this.inspected.size===3){this.stage=2;this.render();return}
  if(a==='tune'&&this.stage===2){const da=Math.abs(this.aimAz-125),de=Math.abs(this.aimEl-42);this.discovered=da<=9&&de<=7;if(this.discovered){this.stage=3;try{localStorage.setItem('guizhou-fast-immersive-v8',new Date().toISOString())}catch(_){}}this.render();return}
  if(a==='replay'){this.stage=-1;this.emitters=new Set(emitters.map(x=>x.id));this.inspected=new Set();this.aimAz=40;this.aimEl=12;this.discovered=false;this.render();return}
  if(a==='exit'){this.close();return}
  if(this.stage===2 && ['az-dec','az-inc','el-dec','el-inc','reset-aim','aim-demo','aim-hint'].includes(a)){
    if(a==='az-dec')this.aimAz=Math.max(0,this.aimAz-10);
    if(a==='az-inc')this.aimAz=Math.min(180,this.aimAz+10);
    if(a==='el-dec')this.aimEl=Math.max(0,this.aimEl-5);
    if(a==='el-inc')this.aimEl=Math.min(85,this.aimEl+5);
    if(a==='reset-aim'){this.aimAz=40;this.aimEl=12}
    if(a==='aim-demo'){
      this.aimAz=Math.round(this.aimAz+(125-this.aimAz)*.52);
      this.aimEl=Math.round(this.aimEl+(42-this.aimEl)*.52);
    }
    if(a==='aim-hint'){
      const hint=$('fastAimHelp');if(hint)hint.hidden=!hint.hidden;
    }
    const az=$('fastAz'),el=$('fastEl');if(az)az.value=this.aimAz;if(el)el.value=this.aimEl;
    this.setReadout();return;
  }
  if(a==='left'){this.yaw-=.25;this.paint();return}
  if(a==='right'){this.yaw+=.25;this.paint();return}
 },
 intro(){return `<h2>深空守护 · 旋转实验室</h2><p>你将操作一个具有三维透视效果的<strong>教学模型</strong>，依次完成：发现并关闭三处模拟干扰源、进入不同保护分区进行空间巡检、转动虚拟接收器寻找合成目标信号。</p><div class="fast-lab-info">学习目标：认识“天眼”的观测环境如何被保护，以及为什么接收微弱天文信号需要精确指向与多次核验。<br>操作方法：拖动画面旋转、滚轮缩放；触摸屏用手指拖动。所有波形和位置均为模拟。</div><div class="fast-lab-actions"><button data-fast-action="begin">进入三维探索 →</button></div>`},
 scene(){return `<div class="fast-lab-scene ${this.stage===2?'fast-aim-scene':''}" id="fastLabStage"><canvas id="fastScene" aria-label="可通过拖动旋转的三维透视科研装置与地形示意"></canvas><span class="fast-lab-hint">拖动旋转场景 · 滚轮缩放 · 点击场景热点</span><div id="fastHotspots"></div></div><div class="fast-lab-actions"><button data-fast-action="left">↶ 左转镜头</button><button data-fast-action="right">右转镜头 ↷</button></div>`},
 content(){if(this.stage===-1)return this.intro();let intro='',more='';
 if(this.stage===0){intro=`<h2>任务一 · 空间排查</h2><p>在可以旋转的望远镜周边寻找三处金色干扰热点，点击逐个关停。你可以改变视角，看清被山脊遮挡的位置。</p><div class="fast-lab-info">尚待处理的虚拟干扰源：<b>${this.emitters.size}</b> 处。关闭后信号质量提升是教学设定，不代表真实射频测量。</div>`;
 more=`<div class="fast-lab-actions"><button data-fast-action="next" ${this.emitters.size?'disabled':''}>检查完成，前往保护区巡检 →</button></div>`}
 if(this.stage===1){intro=`<h2>任务二 · 三维保护区巡检</h2><p>旋转并探索三个距离不同的检查点。点击不同区域标记，将现场管理提示记入巡检记录。你无需猜答案，但需要看见每个区域为何不同。</p><div class="fast-lab-info">已巡检：<b>${this.inspected.size} / 3</b> 个地点。5、10、30 公里的分区半径依据公开保护规定；位置和设施均为模拟。</div>`;
 more=`<div class="fast-lab-actions"><button data-fast-action="next" ${this.inspected.size!==3?'disabled':''}>完成巡检，进入信号调谐 →</button></div>`}
 if(this.stage===2){intro=`<h2>任务三 · 寻找深空候选信号</h2><p class="fast-aim-lead">你是虚拟观测员。<strong>先调整左右方向，再抬高接收器</strong>，让信号强度提高。达标后点击“采集信号”通关。</p>
 <div class="fast-aim-tutorial" aria-label="三步操作提示"><span><b>①</b> 点击右转，让方位接近目标</span><span><b>②</b> 点击抬高，让仰角接近目标</span><span><b>③</b> 信号显示“已锁定”后采集</span></div>`;
 more=`<section class="fast-aim-console" aria-label="虚拟接收器控制台"><div class="fast-aim-status"><div><small>任务目标</small><b>找到东南方向的重复信号</b></div><div><small>当前信号强度（教学模拟）</small><strong id="fastSignalPct">0%</strong></div></div><div class="fast-signal-track" role="progressbar" aria-label="合成信号强度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="fastSignalTrack"><i id="fastSignalFill"></i></div>
 <div id="fastAimNavigation" class="fast-aim-navigation" role="status" aria-live="polite">正在计算目标方位……</div>
 <div class="fast-aim-fields"><div class="fast-aim-field"><label for="fastAz">左右转向（方位角） <output id="fastAzValue">${this.aimAz}°</output></label><div class="fast-aim-buttons"><button type="button" data-fast-action="az-dec">◀ 向左转 10°</button><button type="button" data-fast-action="az-inc">向右转 10° ▶</button></div><input id="fastAz" type="range" min="0" max="180" step="1" value="${this.aimAz}" aria-label="水平转向方位角"></div>
 <div class="fast-aim-field"><label for="fastEl">抬高 / 降低（俯仰角） <output id="fastElValue">${this.aimEl}°</output></label><div class="fast-aim-buttons"><button type="button" data-fast-action="el-dec">▼ 降低 5°</button><button type="button" data-fast-action="el-inc">抬高 5° ▲</button></div><input id="fastEl" type="range" min="0" max="85" step="1" value="${this.aimEl}" aria-label="垂直抬高俯仰角"></div></div>
 <div class="fast-aim-help" id="fastAimHelp" hidden>操作示例：键盘也可以使用左、右、上、下方向键。如果文字写着“向右转 60°”，请按 6 次“向右转 10°”或拖动第一条滑块；提示“抬高 20°”则按 4 次“抬高 5°”。<strong>拖动望远镜画面只改变观察镜头，不会改变接收器指向。</strong></div>
 <div class="fast-lab-actions fast-aim-actions"><button type="button" data-fast-action="aim-hint">？ 怎么操作</button><button type="button" data-fast-action="aim-demo">✦ 帮我演示一步</button><button type="button" data-fast-action="reset-aim">重新对准</button><button type="button" data-fast-action="tune" id="fastCollect">◎ 采集候选信号</button></div></section>`}
 if(this.stage===3){intro=`<h2>三项探索任务全部完成</h2><p>你学会了识别模拟干扰、理解分区管理的空间差异，并通过操作装置方向寻找合成候选信号。</p><div class="fast-lab-info">这只是科学原理的互动演示。真实天文发现仍需要设备标定、干扰剔除、信号处理、重复观测和独立验证。</div>`;
 more=`<div class="fast-lab-actions"><button data-fast-action="replay">重新探索</button><button data-fast-action="exit">返回地图</button></div>`}
 return intro+(this.stage===2?more: this.scene())+`<div id="fastLabExplain" class="fast-lab-info" role="status">${this.stage===3?'探索完成': '可拖动三维透视场景，找到可点击的标记。'}</div>`+(this.stage===2?this.scene():more)},
 render(){if(!this.active)return;$('fastGameChapter').textContent=['开始体验','排除空间干扰','巡检宁静区','调谐接收器','探索完成'][this.stage+1];$('fastGameScore').textContent=Math.max(0,this.stage)+'/3 已完成';
  $('fastGameMain').innerHTML=`<div class="fast-game-chapter"><span class="fast-kicker">中国天眼 · 空间科普实验 · 非实际观测</span>${this.content()}<p class="fast-evidence">现场保护措施以现行法规与工作人员要求为准。这里的地形、干扰源、接收器与波形全部是独立的教学模拟。<a target="_blank" rel="noopener noreferrer" href="https://www.cac.gov.cn/2025-02/26/c_1742272852825362.htm">查看相关资料</a></p></div>`;
  $('fastGameMain').scrollTop=0;this.setReadout();this.paint();
 },
 setReadout(){
  const az=$('fastAzValue'),el=$('fastElValue');if(az)az.textContent=this.aimAz+'°';if(el)el.textContent=this.aimEl+'°';
  if(this.stage===2){
    const dx=125-this.aimAz,dy=42-this.aimEl;
    const intensity=Math.round(100*Math.exp(-((dx/35)**2+(dy/20)**2)*.8));
    const locked=Math.abs(dx)<=9 && Math.abs(dy)<=7;
    const n=$('fastAimNavigation'),pct=$('fastSignalPct'),fill=$('fastSignalFill'),track=$('fastSignalTrack'),collect=$('fastCollect');
    if(n)n.innerHTML=locked?'<strong>✓ 已锁定候选方向！</strong> 现在可以点击“采集候选信号”。':
      '<strong>下一步：</strong>'+ (Math.abs(dx)>9?(dx>0?'向右转 '+Math.abs(dx)+'°':'向左转 '+Math.abs(dx)+'°'):'水平方向已对准')+
      '，'+(Math.abs(dy)>7?(dy>0?'再抬高 '+Math.abs(dy)+'°':'再降低 '+Math.abs(dy)+'°'):'高度已对准')+'。';
    if(pct)pct.textContent=intensity+'%';if(fill)fill.style.width=intensity+'%';
    if(track)track.setAttribute('aria-valuenow',String(intensity));
    if(collect){collect.disabled=!locked;collect.title=locked?'已锁定，点击采集':'继续调整至目标附近，按钮自动解锁';}
    const info=$('fastLabExplain');if(info)info.textContent=locked?'恭喜！模拟信号已经达到可采集的指向范围。':
      '提示：场景中的金色线是接收器方向。你可以拖动画布查看模型，但真正调谐请使用上方按钮或滑块。';
  }
  this.paint();
 },
 paint(){if(!this.active||this.stage<0)return;const can=$('fastScene');if(!can)return;const area=can.parentElement;
 const W=Math.max(200,area.clientWidth),H=Math.max(200,area.clientHeight),d=Math.min(2,devicePixelRatio||1);can.width=W*d;can.height=H*d;const ctx=can.getContext('2d');ctx.scale(d,d);
 const gradient=ctx.createLinearGradient(0,0,0,H);gradient.addColorStop(0,'#0c1c32');gradient.addColorStop(1,'#154357');ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
 const sy=Math.sin(this.yaw),cy=Math.cos(this.yaw),sp=Math.sin(this.pitch),cp=Math.cos(this.pitch),scale=Math.min(W/650,H/350)*this.zoom;
 const project=(x,y,z)=>{const xr=x*cy-z*sy,zz=x*sy+z*cy;return{x:W/2+xr*scale,y:H*.63-(y*cp-zz*sp)*scale}};
 const poly=(points,color,stroke)=>{ctx.beginPath();points.forEach((p,i)=>{const q=project(...p);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)});ctx.closePath();ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}};
 // terrain-like mesh, spatial wireframe and concentric restriction rings (not surveyed geography)
 for(let z=-330;z<=330;z+=33){const pts=[];for(let x=-380;x<=380;x+=25)pts.push(project(x,8*Math.sin(x*.015)*Math.sin(z*.018)-16,z));ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.strokeStyle='#477b7c55';ctx.lineWidth=.8;ctx.stroke()}
 for(const rad of [58,120,275]){ctx.beginPath();for(let i=0;i<=96;i++){const a=i/96*Math.PI*2,q=project(rad*Math.cos(a),2,rad*Math.sin(a));i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)}ctx.strokeStyle=rad===58?'#91f1dfaa':rad===120?'#ffdc9b99':'#7ab5ff77';ctx.lineWidth=2;ctx.stroke()}
 // paraboloid of revolution: ring contour for actual structure shape, exact pointing simulated
 for(let j=10;j>=0;j--){const r=125*j/10,points=[];for(let i=0;i<=80;i++){const a=i/80*Math.PI*2;points.push(project(r*Math.cos(a),-32+60*(r/125)**2,r*Math.sin(a)))}ctx.beginPath();points.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.strokeStyle=j%2?'#a8dbe7b0':'#e4edf4c4';ctx.lineWidth=1.4;ctx.stroke()}
 for(let k=0;k<18;k++){ctx.beginPath();for(let j=0;j<=10;j++){const r=125*j/10,a=k*Math.PI/9,q=project(r*Math.cos(a),-32+60*(r/125)**2,r*Math.sin(a));j?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)}ctx.strokeStyle='#b4cbd2a0';ctx.stroke()}
 // support towers and suspension cables
 for(const [x,z] of [[-165,-155],[165,-155],[-165,155],[165,155]]){poly([[x-5,0,z-5],[x+5,0,z-5],[x+5,0,z+5],[x-5,0,z+5]],'#446577','#c1f1ec');const a=project(x,5,z),b=project(x,76,z);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle='#dde6f0';ctx.lineWidth=3;ctx.stroke();ctx.beginPath();ctx.moveTo(b.x,b.y);const top=project(0,35,0);ctx.lineTo(top.x,top.y);ctx.strokeStyle='#f0c98780';ctx.lineWidth=1;ctx.stroke()}
 const point=project(0,50,0);ctx.fillStyle='#f0bd77';ctx.beginPath();ctx.arc(point.x,point.y,6,0,7);ctx.fill();
 if(this.stage===2){const a=this.aimAz*Math.PI/180,r=125,h=this.aimEl*Math.PI/180;const end=project(r*Math.sin(a)*Math.cos(h),50+r*Math.sin(h),r*Math.cos(a)*Math.cos(h));ctx.beginPath();ctx.moveTo(point.x,point.y);ctx.lineTo(end.x,end.y);ctx.strokeStyle='#f7bf5d';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#fff0b5';ctx.beginPath();ctx.arc(end.x,end.y,6,0,7);ctx.fill()}
 const layer=$('fastHotspots');if(!layer)return;layer.innerHTML='';const spots=this.stage===0?emitters.map(e=>({id:e.id,name:e.name,x:e.x,z:e.z,done:!this.emitters.has(e.id),act:'emitter'})):
 this.stage===1?places.map(e=>({id:e.id,name:e.name,x:Math.cos(e.angle)*e.r*11,z:Math.sin(e.angle)*e.r*11,done:this.inspected.has(e.id),act:'inspect'})):[];
 for(const p of spots){const q=project(p.x,22,p.z);const b=document.createElement('button');b.type='button';b.className='fast-lab-hotspot'+(p.done?' done':'');b.style.left=q.x+'px';b.style.top=q.y+'px';b.textContent=(p.done?'✓ ':'✦ ')+p.name;b.dataset.fastAction=p.act;b.dataset.id=p.id;b.disabled=p.done;layer.appendChild(b)}
 },
};
// Preserve explanatory material after each spatial operation, instead of reducing the game to multiple-choice answers.
const originalAct=G.act.bind(G);G.act=function(a,id){let prior=this.stage;if(a==='inspect'){const p=places.find(x=>x.id===id);originalAct(a,id);const explain=$('fastLabExplain');if(explain&&p)explain.textContent=p.explain;return}
 if(a==='emitter'){const em=emitters.find(x=>x.id===id);originalAct(a,id);const explain=$('fastLabExplain');if(explain&&em)explain.textContent='已关闭模拟设备“'+em.name+'”。干扰源减少后，虚拟观测条件有所改善。';return}
 if(a==='tune'){originalAct(a,id);return}
 originalAct(a,id)};
NS.FastGame=G;document.addEventListener('DOMContentLoaded',()=>G.init());
})(window.SpatialApp=window.SpatialApp||{});
