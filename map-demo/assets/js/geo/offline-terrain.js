/* V8 No-secret-key terrain importer; truthfully labels simulation versus elevation data. */
(function(NS){'use strict';
const r=window.SPATIAL_REAL_ELEVATION, valid=!!(r&&r.grids&&['fast','huajiang'].every(site=>{
 const g=r.grids[site],orig=NS.DB.terrain[site];return g&&orig&&Number.isInteger(g.n)&&g.n>=33&&g.n<=257&&g.samples.length===g.n*g.n&&g.samples.every(p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite));
}));
if(valid){for(const site of ['fast','huajiang'])NS.DB.terrain[site]=r.grids[site]}
NS.TerrainStatus={real:valid,provenance:valid?r.source:null};
const paint=()=>{
 let e=document.getElementById('terrainTruth');if(!e){e=document.createElement('div');e.id='terrainTruth';e.className='terrain-truth';e.setAttribute('role','status');(document.querySelector('.stage')||document.body).appendChild(e)}
 e.textContent=valid?'地形：已导入公开 DEM（建筑仍为示意）':'地形：现为模拟网格 · 真实DEM未导入';
 e.title=valid?'© Mapzen及原始高程数据提供者；建筑与道路仍属示意。':'需要联网运行 tools/下载并构建真实地形.py；无 Google 或高德密钥也可导入。';
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();
})(window.SpatialApp=window.SpatialApp||{});
