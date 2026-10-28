/* V33 supplementary export and migration diagnostics. No legacy keys are deleted automatically. */
(function(NS){'use strict';
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}};
NS.ProgressV33={version:33, completedPixelCount(){const r=read('guizhou_fast_pixel_v23')||{};return ['builder','scientist','visitor'].reduce((n,k)=>n+Math.min(5,Math.max(0,Number(r[k]?.completed)||0)),0)}, snapshot(){return {version:33,exportedAt:new Date().toISOString(),records:NS.LearningRecords||{},pixel:read('guizhou_fast_pixel_v23'),casebook:read('guizhou-casebook-v24'),entry:read('guizhou-v17-entry-v1')}}};
const hub=NS.GameHub;if(!hub)return;
hub.exportRecords=function(){const blob=new Blob([JSON.stringify(NS.ProgressV33.snapshot(),null,2)],{type:'application/json;charset=utf-8'});const uri=URL.createObjectURL(blob);const a=document.createElement('a');a.href=uri;a.download='贵州双工程_完整学习档案_V33.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(uri),2000)};
})(window.SpatialApp=window.SpatialApp||{});
