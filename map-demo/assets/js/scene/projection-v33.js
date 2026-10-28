/* V33 shared perspective/depth contract. All 3D passes use the same clip transform. */
(function(NS){'use strict';
const NEAR=3.5,FAR=60000;
const A=(FAR+NEAR)/(FAR-NEAR),B=2*FAR*NEAR/(FAR-NEAR);
NS.ProjectionV33=Object.freeze({near:NEAR,far:FAR,clip:Object.freeze([A,B]),
 ndcAt(distance){return A-B/distance},
 validDepth(distance){return Number.isFinite(distance)&&distance>=NEAR&&distance<=FAR}});
const preview=new URLSearchParams(location.search).get('gpuDrivePreview')==='1';
NS.RenderSafetyV33={preview,reason:preview?'GPU绘制测试模式，须人工检查路面可见性':'默认使用稳定兼容道路，GPU驾驶管线待实机验收',
 canUseGPUDrive(){return !!this.preview&&!!NS.Drive?.active},
 diagnostic(){return {preview:this.preview,reason:this.reason,projection:NS.ProjectionV33.clip}}};
})(window.SpatialApp=window.SpatialApp||{});
