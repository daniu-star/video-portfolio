(function(NS){'use strict';
const el=id=>document.getElementById(id);
function update(){
 const pane=el('regionalExpedition');if(!pane)return;
 const visible=NS.state.entered&&NS.state.site==='overview'&&!NS.Drive?.active;
 pane.hidden=!visible;const legend=el('roadLegend');if(legend)legend.hidden=!visible;
 const roads=NS.OpenRoads,ready=roads?.status==='osm-odbl'&&roads.lines?.length>0;
 const text=ready?'已加载 '+roads.lines.length+' 条 OSM 道路折线、'+(roads.railways||[]).length+' 条铁路折线（© OpenStreetMap 贡献者）':'离线真实路网尚未导入：显示两处工程片区的概念道路（虚线），不表示跨区高速。导入 OSM 后自动切换真实公路／铁路。';
 if(el('roadLayerStatus'))el('roadLayerStatus').textContent=text;
 if(el('roadLegendTruth'))el('roadLegendTruth').textContent=ready?'© OpenStreetMap contributors · ODbL · 区域缩放布局':'现为片区模型道路（虚线）；不代表实际公路／铁路走向';
 }
function init(){const pane=el('regionalExpedition');if(!pane)return;
el('regionFold').addEventListener('click',()=>{pane.classList.toggle('is-collapsed');const yes=!pane.classList.contains('is-collapsed');el('regionFold').textContent=yes?'收起':'展开';el('regionFold').setAttribute('aria-expanded',String(yes))});
el('pixelGameLaunch').addEventListener('click',()=>NS.PixelTruck.open());
el('regionYundu').addEventListener('click',()=>NS.App.startBuildingExplore());
NS.onState((s,p)=>{if('site'in p||'entered'in p)update()});update()}
document.addEventListener('DOMContentLoaded',init);NS.RegionExpedition={show:update};
})(window.SpatialApp=window.SpatialApp||{});