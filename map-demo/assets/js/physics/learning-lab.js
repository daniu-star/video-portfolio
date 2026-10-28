/* V21: Educational physics. This is NOT structural engineering or telescope performance software. */
(function(NS){'use strict';
const $=id=>document.getElementById(id), M=NS.Math3D;
const P={mode:'fast',openState:false,showWire:false,quality:'balanced',fast:{focusShift:16,deform:4,noise:35},bridge:{wind:25,load:85,x:0,v:0,phase:0,response:0},series:[],clock:0};
function optics(){
 const f=104.1667,focus=f+P.fast.focusShift,a=P.fast.deform;
 let sum=0,count=0;
 for(let i=-15;i<=15;i++){
  if(i===0)continue;
  const x=i*9,y=x*x/(4*f)+a*.05*Math.sin(x*.037)*Math.pow(x/150,2);
  const slope=x/(2*f)+a*.05*(2*x/22500*Math.sin(x*.037)+(x/150)**2*.037*Math.cos(x*.037));
  const norm=M.norm({x:-slope,y:1,z:0}),dot=-norm.y;
  const rx=-2*dot*norm.x,ry=-1-2*dot*norm.y;
  const hit=x+rx*(focus-y)/Math.max(.001,ry);
  sum+=hit*hit;count++;
 }
 const rms=Math.sqrt(sum/count),geometry=Math.exp(-Math.pow(rms/16,2));
 return {rms,geometry,signal:geometry/(1+P.fast.noise/55)};
}
function stepBridge(dt){
 const b=P.bridge,h=Math.min(.035,Math.max(.001,dt)),omega=2*Math.PI*.85,zeta=.22;
 b.phase+=h*4.2;
 const force=.8*Math.pow(b.wind/30,2)+.16*b.load/100;
 b.v+=(force*Math.sin(b.phase)-2*zeta*omega*b.v-omega*omega*b.x)*h;
 b.x+=b.v*h;b.response=Math.abs(b.x)*16+b.load/180;
}
function graph(){const c=$('v21Graph');if(!c)return;const d=Math.min(2,devicePixelRatio||1),r=c.getBoundingClientRect();if(!r.width)return;
 c.width=Math.round(r.width*d);c.height=Math.round(r.height*d);
 const g=c.getContext('2d'),w=r.width,h=r.height;g.scale(d,d);g.strokeStyle='rgba(173,217,218,.15)';g.lineWidth=1;
 for(let i=1;i<4;i++){g.beginPath();g.moveTo(8,i*h/4);g.lineTo(w-8,i*h/4);g.stroke()}
 g.beginPath();g.strokeStyle='#f2cb7f';g.lineWidth=2.5;
 P.series.forEach((v,i)=>{const x=8+i/Math.max(99,P.series.length-1)*(w-16),y=h-12-M.clamp(v,0,1)*(h-24);i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke();
}
function update(){if(!P.openState)return;const o=optics(),metric=$('v21Metric'),guide=$('v21Guide');if(!metric)return;
 const fast=P.mode==='fast',val=fast?o.signal:Math.min(1,P.bridge.response);
 metric.textContent=fast?Math.round(val*100)+' / 100':P.bridge.response.toFixed(2)+' 相对单位';
 const goal=fast?val>=.7:P.bridge.response<.25;const achievement=$('v21Goal');if(achievement){achievement.textContent=goal?'目标达成，可以保存观察':'继续调整参数';achievement.classList.toggle('achieved',goal)}
 guide.textContent=fast?(o.rms<4?'反射较集中，可以尝试增加干扰观察变化':'反射路径偏离，试着校准接收点或减小形变'):(P.bridge.response>.65?'振动响应增加，试着降低风速或载荷':'尝试改变风速与载荷，对比曲线变化');
 P.series.push(val);if(P.series.length>100)P.series.shift();graph();
}
function view(){const fast=P.mode==='fast',f=P.fast,b=P.bridge,o=optics();return `<div class="v21-head"><div><small>空间物理实验 · 教学模拟</small><h2 id="v21Heading" tabindex="-1">${fast?'天眼｜射电反射':'大桥｜振动响应'}</h2></div><button id="v21Close" aria-label="关闭实验">✕</button></div>
 <p class="v21-objective">${fast?'任务：校准接收位置，再观察形变和干扰如何改变接收结果，并把收集指标提高到70。':'任务：降低风和载荷，使相对响应小于0.25。'}</p>
 <div class="v21-render-options"><span>地图质量</span><button id="v21Quality" type="button" aria-pressed="${P.quality==='detailed'}">${P.quality==='detailed'?'精细模式 ✓':'切换精细模式'}</button></div><div class="v21-switch"><button data-v21-mode="fast" aria-pressed="${fast}">天眼</button><button data-v21-mode="bridge" aria-pressed="${!fast}">花江大桥</button></div>
 <div class="v21-controls">${fast?`
 <label>接收位置偏移 <output id="v21FText">${f.focusShift} 模型单位</output><input id="v21F" type="range" min="-30" max="30" value="${f.focusShift}"></label>
 <label>反射面形变 <output id="v21DText">${f.deform} / 10</output><input id="v21D" type="range" min="0" max="10" value="${f.deform}"></label>
 <label>电磁干扰强度 <output id="v21NText">${f.noise} / 100</output><input id="v21N" type="range" min="0" max="100" value="${f.noise}"></label>`:`
 <label>教学风速 <output id="v21WText">${b.wind} m/s</output><input id="v21W" type="range" min="0" max="30" value="${b.wind}"></label>
 <label>相对载荷 <output id="v21LText">${b.load} %</output><input id="v21L" type="range" min="0" max="100" value="${b.load}"></label>`}</div>
 <div class="v21-readout"><small>${fast?'相对信号收集指标':'相对振动响应'}</small><strong id="v21Metric">${fast?Math.round(o.signal*100)+'/ 100':'0.00 相对单位'}</strong><span id="v21Guide">调整滑块观察模拟结果</span><b id="v21Goal" class="v21-goal">继续调整参数</b><canvas id="v21Graph" height="84" aria-label="最近一段时间的物理响应曲线"></canvas></div>
 <details class="v21-explanation"><summary>查看模拟边界与科学依据</summary><p class="v21-disclaimer">${fast?'局部抛物线镜面反射模型。FAST整个反射面为球面，工作时局部主动变形。图中形变夸张；数值未经观测标定，不代表望远镜实际性能。':'单自由度受迫阻尼振动示意。图中的振幅经过放大，参数为教学数值，不能据此判断真实桥梁的挠度、振动频率或安全性。'}</p></details>
 <div class="v21-actions"><button id="v21Reset">恢复初始值</button><button id="v21Save">保存实验记录</button></div><div id="v21Notice" role="status" aria-live="polite"></div><button class="v21-back-to-story" id="v21StartGame">带着观察记录进入故事任务 →</button>`}
function bind(){const el=$('v21Panel');el.innerHTML=view();$('v21Close').onclick=()=>Lab.close();
 el.querySelectorAll('[data-v21-mode]').forEach(b=>b.onclick=()=>Lab.open(b.dataset.v21Mode));
 for(const [id,obj,key,unit] of [['F',P.fast,'focusShift',' 模型单位'],['D',P.fast,'deform',' / 10'],['N',P.fast,'noise',' / 100'],['W',P.bridge,'wind',' m/s'],['L',P.bridge,'load',' %']]){
  const input=$('v21'+id);if(!input)continue;
  input.oninput=()=>{obj[key]=Number(input.value);$('v21'+id+'Text').textContent=input.value+unit;P.series=[];update()};
 }
 $('v21Quality').onclick=()=>{P.quality=P.quality==='detailed'?'balanced':'detailed';NS.App.engine.setQuality(P.quality);bind();};
 $('v21Reset').onclick=()=>{if(P.mode==='fast')P.fast={focusShift:16,deform:4,noise:35};else Object.assign(P.bridge,{wind:25,load:85,x:0,v:0,response:0,phase:0});P.series=[];bind()};
 $('v21StartGame').onclick=()=>{Lab.close();NS.GameHub?.open()};
 $('v21Save').onclick=()=>{const rec=NS.LearningRecords;if(!rec)return;rec.physicsLab=rec.physicsLab||[];
  rec.physicsLab.push(P.mode==='fast'?{kind:'fast',parameters:{...P.fast},result:optics(),goalMet:optics().signal>=.7,time:new Date().toISOString()}:{kind:'bridge',parameters:{wind:P.bridge.wind,load:P.bridge.load},relativeResponse:P.bridge.response,goalMet:P.bridge.response<.25,time:new Date().toISOString()});
  if(rec.physicsLab.length>30)rec.physicsLab.shift();NS.saveLearningRecords?.();$('v21Notice').textContent='已保存到学习记录。可更改参数后再次观察。';};
 update();}
const Lab={get mode(){return P.mode},get openState(){return P.openState},get fast(){return P.fast},get bridge(){return P.bridge},get showWire(){return P.showWire},open(mode){
 if(NS.FastGame?.active||NS.Drive?.active||NS.PixelTruck?.openState){NS.UI?.toast?.('请先退出当前游戏，再打开物理实验。');return}
 P.mode=mode==='bridge'?'bridge':'fast';P.openState=true;P.series=[];
 const site=P.mode==='fast'?'fast':'huajiang';NS.App.setSite(site);
 NS.setState({timeline:.99,timelinePulse:NS.state.timelinePulse+1});NS.UI?.renderTimeline();
 NS.App.engine.fly({yaw:-.6,pitch:.81,distance:site==='fast'?1920:3200,target:site==='fast'?{x:0,y:80,z:0}:{x:0,y:640,z:0}},1.25);
 document.body.classList.add('v21-open');$('v21Panel').hidden=false;$('v21Toggle').setAttribute('aria-expanded','true');bind();$('v21Heading')?.focus({preventScroll:true});
 },close(){P.openState=false;$('v21Panel').hidden=true;document.body.classList.remove('v21-open');$('v21Toggle').setAttribute('aria-expanded','false');},tick(dt){if(!P.openState)return;if(P.mode==='bridge')stepBridge(dt);P.clock+=dt;if(P.clock>.14){P.clock=0;update();}},init(){
 const b=document.createElement('button');b.id='v21Toggle';b.className='v21-toggle';b.type='button';b.textContent='◈ 物理实验';b.setAttribute('aria-controls','v21Panel');b.setAttribute('aria-expanded','false');b.onclick=()=>P.openState?Lab.close():Lab.open(NS.state.site==='huajiang'?'bridge':'fast');document.body.appendChild(b);
 const sec=document.createElement('section');sec.id='v21Panel';sec.className='v21-panel';sec.hidden=true;sec.setAttribute('role','dialog');sec.setAttribute('aria-modal','false');sec.setAttribute('aria-labelledby','v21Heading');document.body.appendChild(sec);
 }};
NS.PhysicsLab=Lab;document.addEventListener('DOMContentLoaded',()=>Lab.init());
})(window.SpatialApp=window.SpatialApp||{});
