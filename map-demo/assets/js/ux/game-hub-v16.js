/* V16 exploration hub + bridge evidence checkpoints + road chapter reasoning. Purely local progress. */
(function(NS){'use strict';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const records=()=>NS.LearningRecords;
const save=()=>NS.saveLearningRecords?.();
const Hub={openState:false,activeBridgeCase:-1,bridgeSession:new Set(),
 init(){const btn=document.createElement('button');btn.className='game-hub-launch';btn.id='gameHubLaunch';btn.type='button';btn.textContent='◈ 互动探索 · 游戏档案';btn.addEventListener('click',()=>this.open());document.body.appendChild(btn);
 const hub=document.createElement('section');hub.id='gameHub';hub.className='game-hub';hub.hidden=true;hub.setAttribute('role','dialog');hub.setAttribute('aria-modal','true');hub.setAttribute('aria-label','互动探索入口');document.body.appendChild(hub);
 hub.addEventListener('click',e=>{const b=e.target.closest('[data-hub-action]');if(!b)return;const a=b.dataset.hubAction;
 if(a==='close')this.close();if(a==='fast'){this.close();NS.FastGame.open()}if(a==='bridge'){this.close();NS.App.setSite('huajiang');NS.Drive.prepare(NS.DriveRoutes.bridge)}if(a==='casebook'){this.close();NS.RelationGame.open()}if(a==='export'){this.exportRecords();return}if(a==='reset'){if(window.confirm('确定清除本浏览器里三款游戏的学习记录吗？该操作不能恢复。')){Object.keys(records().fast).forEach(k=>delete records().fast[k]);if(records().fastDrafts)Object.keys(records().fastDrafts).forEach(k=>delete records().fastDrafts[k]);if(records().fastV19)Object.keys(records().fastV19).forEach(k=>delete records().fastV19[k]);try{localStorage.removeItem('guizhou_fast_pixel_v23')}catch(_){ }records().physicsLab=[];records().bridge={seen:[],complete:false};records().truck={seen:[],complete:[]};try{localStorage.removeItem('guizhou-casebook-v24')}catch(_){ }save();this.render()}}});
 document.addEventListener('keydown',e=>{if(this.openState&&e.key==='Escape'){this.close();e.stopPropagation()}});
 // V20 takes over bridge observation and road delivery missions. Do not mount legacy quizzes.
 },
 open(){if(NS.FastGame?.active||NS.Drive?.active||NS.RelationGame?.openState)return;this.openState=true;this.render();$('gameHub').hidden=false;document.querySelector('#gameHub [data-hub-action="close"]')?.focus()},
 close(){this.openState=false;$('gameHub').hidden=true;},
 exportRecords(){const payload={title:'贵州双工程互动探索学习档案',exportedAt:new Date().toISOString(),disclaimer:'只记录教学模拟中的学习与判断，不是工程记录或实际观测数据。',data:records()};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download='贵州双工程_学习档案.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),5000)},
 render(){const R=records(),fast=Object.values(R.fast).reduce((s,v)=>s+(Array.isArray(v)?v.length:0),0),bridge=R.bridge.seen.length,casebook=NS.RelationGame?.completedCount?.()||0;
 $('gameHub').innerHTML=`<div class="game-hub-dialog"><header class="game-hub-top"><div><span>GUIZHOU · SCIENCE / ENGINEERING / ROADS</span><h2>贵州双工程 · 互动探索中心</h2></div><button data-hub-action="close">✕ 返回地图</button></header><p class="game-hub-lead">三种游戏分别关注科学研究、桥梁结构和双工程推理。可以自由选择，不需要按顺序通关；学习记录只存储在本机浏览器。</p>
 <div class="game-hub-grid"><article class="game-hub-card"><b>◎</b><h3>中国天眼 · 像素山路冒险</h3><p>扮演科研人员、建设与运维人员或普通公众，选择施工人员、科学家或游客，沿路遇见五位NPC并回答他们提出的问题。</p><small>进度 ${NS.ProgressV33?.completedPixelCount?.() ?? 0} / 15 站</small><button data-hub-action="fast">进入角色故事 →</button></article>
 <article class="game-hub-card"><b>▱</b><h3>花江峡谷大桥 · 五处工程观察</h3><p>切换视角识别高度、跨度、受力、施工监测与地方出行。</p><small>已完成观察 ${bridge} / 5 处</small><button data-hub-action="bridge">进入桥梁观察 →</button></article>
 <article class="game-hub-card"><b>◈</b><h3>贵州工程调查局 · 证据拼图</h3><p>从天眼和大桥的资料中挑选证据，解决三项跨工程调查。</p><small>完成档案 ${casebook} / 3 份</small><button data-hub-action="casebook">打开调查桌 →</button></article></div>
 <div class="game-hub-notes"><h3>我的探索档案</h3><p>科学故事 ${fast} 项 · 桥梁观察 ${bridge} 项 · 证据调查 ${casebook} 份。项目把事实、教学模拟和田野议题分开标注，历史结果不会因游戏选择而改变。</p><button class="game-hub-reset" data-hub-action="export">导出学习档案 JSON</button>　<button class="game-hub-reset" data-hub-action="reset">清空本地游戏记录</button></div></div>`},

};
NS.GameHub=Hub;document.addEventListener('DOMContentLoaded',()=>Hub.init());
})(window.SpatialApp=window.SpatialApp||{});
