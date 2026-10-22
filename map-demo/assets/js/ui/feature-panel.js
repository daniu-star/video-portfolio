(function(NS){'use strict';
const DB=NS.DB,S=NS.state;
const $=s=>document.querySelector(s);
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const Panel={
 init(){ $('#featureClose').addEventListener('click',()=>this.close());
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.selectedFeature&&!NS.Drive?.active)this.close()});
  NS.onState((s,p)=>{if('site'in p&&s.selectedFeature==null)this.hide();if('selectedFeature'in p){if(s.selectedFeature)this.render();else this.hide()}});
 },
 open(id){this.current=id;this.render()},
 hide(){const p=$('#featurePanel');p.classList.remove('is-open');p.setAttribute('aria-hidden','true');document.body.classList.remove('has-feature')},
 close(){NS.setState({selectedFeature:null,hoveredFeature:null});this.hide()},
 render(){const f=DB.features[S.selectedFeature];if(!f){this.hide();return}this.current=f.id;
  const b=f.object_type==='building'?DB.buildings[f.object_id]:null;
  const r=f.object_type==='road'?DB.roads[f.object_id]:null;
  const district=b&&DB.districts[b.district_id];const isRoad=Boolean(r);
  const title=b?.name||r?.name||f.display_name;
  const status=isRoad?'模拟道路 · 尚未完成道路拓扑核验':b?'示意建筑 · 非单体测绘模型':'区域空间参考对象';
  const intro=b?'该模型是根据空间参考关系程序化生成，不能据此推断实际建筑轮廓、具体门牌或居住者信息。':
   '此线路使用项目概念道路控制点，用于理解区域联系，不具备经过验证的道路导航或通行规则。';
  const driveRoute=isRoad&&NS.DriveRoutes.forRoad(f.site_id,f.object_id);
  const source=DB.sources[f.source_id];
  $('#featurePanelContent').innerHTML=`<div class="feature-eyebrow">建筑与道路 · 空间档案</div>
   <h2>${escapeHTML(title)}</h2><div class="feature-status">${escapeHTML(status)}</div>
   <div class="feature-record"><div class="feature-record-symbol" aria-hidden="true">${isRoad?'≋':'⌂'}</div>
   <div><strong>${isRoad?'道路示意段':'建筑示意体块'}</strong><p>${escapeHTML(intro)}</p></div></div>
   <div class="feature-info"><h3>空间与证据信息</h3>
    ${district?`<p>所属片区：<b>${escapeHTML(district.name)}</b></p>`:''}
    <p>来源单位：${escapeHTML(source?.authority||'项目空间数据库')}</p>
    <p>数据精度：${escapeHTML(f.precision_status||'未核验')}</p>
    <p>资料编号：<code>${escapeHTML(f.id)}</code></p>
   </div><div class="feature-actions"><button id="featureFocus" class="action-btn primary">镜头对准${isRoad?'路段':'模型'}</button>
    ${driveRoute?'<button id="featureDrive" class="action-btn primary">🚘 体验概念桥梁穿越</button>':''}
    ${b&&b.node_id&&DB.nodes[b.node_id]?'<button id="featureRelated" class="action-btn">查看关联地点档案</button>':''}
    <button id="featureBack" class="action-btn">返回地图</button></div>
   <div class="feature-next">${isRoad?(driveRoute?'可体验固定路线的概念演示；实际道路几何与交通状况尚未核实。':'当前未开放可驾驶路线。'):'模型显示空间关系，不代表真实建筑的精确形状。'}</div>`;
  $('#featurePanel').classList.add('is-open');$('#featurePanel').setAttribute('aria-hidden','false');document.body.classList.add('has-feature');
  if(driveRoute){const primary=$('#featureDrive');$('#featurePanelContent .feature-status')?.insertAdjacentElement('afterend',primary);primary.classList.add('feature-drive-inline')}
  $('#featureFocus').onclick=()=>NS.App.focusFeature(f.id);$('#featureBack').onclick=()=>this.close();
  if($('#featureDrive'))$('#featureDrive').onclick=()=>NS.Drive.prepare(driveRoute);
  if($('#featureRelated'))$('#featureRelated').onclick=()=>NS.App.selectNode(b.node_id,{focus:true});
 }
};NS.FeaturePanel=Panel;
addEventListener('DOMContentLoaded',()=>Panel.init());
})(window.SpatialApp=window.SpatialApp||{});
