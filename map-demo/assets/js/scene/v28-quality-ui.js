/* V28 user-visible GPU truth/quality, no external requests or asset mutation. */
(function(NS){'use strict';
const create=()=>{
 const root=document.createElement('div');root.className='v28-render-hud';root.id='v28RenderHud';root.setAttribute('role','status');
 root.innerHTML='<span class="v28-led" aria-hidden="true"></span><span id="v28RenderStatus">检测地形渲染…</span><button id="v28QualityToggle" type="button" aria-pressed="false">精细地形</button>';
 document.body.appendChild(root);
 const status=document.getElementById('v28RenderStatus'),button=document.getElementById('v28QualityToggle');
 button.onclick=()=>{const engine=NS.App?.engine;if(!engine)return;engine.setQuality(engine.quality==='detailed'?'balanced':'detailed');refresh();};
 function refresh(){const e=NS.App?.engine;if(!e)return;const gpu=!!e.glTerrain?.active(NS.state.site);root.dataset.gpu=String(gpu);
  const source=NS.TerrainStatus?.real?'实测DEM已导入':'概念地形';
  status.textContent=(gpu?'WebGL2立体地形':'兼容地形')+' · '+source;
  button.textContent=e.quality==='detailed'?'精细 ✓':'精细地形';button.setAttribute('aria-pressed',String(e.quality==='detailed'));
 }
 refresh();document.getElementById('siteSelect')?.addEventListener('change',()=>requestAnimationFrame(refresh));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 NS.onState?.(()=>refresh());
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',create);else create();
})(window.SpatialApp=window.SpatialApp||{});
