(function(NS){'use strict';
const raw=window.SPATIAL_DB;
const by=(arr,key)=>{const m={};(arr||[]).forEach(x=>{(m[x[key]]||(m[x[key]]=[])).push(x)});return m};
const map=(arr,key='id')=>Object.fromEntries((arr||[]).map(x=>[x[key],x]));
const roadPoints=by(raw.road_points,'road_id');Object.values(roadPoints).forEach(a=>a.sort((x,y)=>x.seq-y.seq));
const timelineBySite=by(raw.timeline_states,'site_id');Object.values(timelineBySite).forEach(a=>a.sort((x,y)=>x.t-y.t));
NS.DB={
 raw,
 metadata:map(raw.metadata,'key'), sources:map(raw.sources), sites:map(raw.sites),
 features:map(raw.spatial_features||[]), featuresBySite:by(raw.spatial_features||[],'site_id'),
 mediaAssets:map(raw.media_assets||[]), mediaBindingsByFeature:by(raw.media_bindings||[],'feature_id'),
 nodes:map(raw.nodes), nodesBySite:by(raw.nodes,'site_id'), legends:map(raw.node_legends,'node_id'),
 districts:map(raw.districts), districtsBySite:by(raw.districts,'site_id'),
 buildings:map(raw.building_instances), buildingsBySite:by(raw.building_instances,'site_id'), buildingsByDistrict:by(raw.building_instances,'district_id'),
 metricsBySite:by(raw.metrics,'site_id'), roads:map(raw.roads), roadsBySite:by(raw.roads,'site_id'), roadPoints,
 transportAssetsBySite:by(raw.transport_assets,'site_id'), structuresBySite:by(raw.structures,'site_id'),
 relationsBySite:by(raw.relations,'site_id'), stories:(raw.story_chapters||[]).slice().sort((a,b)=>a.seq-b.seq),
 timelineBySite, themes:map(raw.themes), terrain:raw.terrain
};
NS.DB.themes.cinema={id:'cinema',name:'山川电影',gradient:['#415c68','#86a4a0','#c0a78d','#435c55'],palette:{accent:'#ead2a0',hot:'#f5e2b4',ground:'#203f3e',terrainHigh:'#a2a18a',terrainLow:'#314d47',road:'#d7d4c4',building:'#c7cac0',village:'#dabf9d'}};
NS.DB.themes.daylight={id:'daylight',name:'自然日光',gradient:['#526f82','#91adb3','#d3bf9e','#667c73'],palette:{accent:'#92d6d3',hot:'#f3c989',ground:'#304b49',terrainHigh:'#8b9478',terrainLow:'#354c42',road:'#d1cfbf',building:'#9cafa8',village:'#dfc5a3'}};
NS.DB.featureMedia=id=>(NS.DB.mediaBindingsByFeature[id]||[]).map(b=>({binding:b,asset:NS.DB.mediaAssets[b.asset_id]})).filter(x=>x.asset);
NS.DB.resolveNode=id=>NS.DB.nodes[id];NS.DB.source=id=>NS.DB.sources[id];
NS.DB.nodeLegend=id=>NS.DB.legends[id];
NS.DB.timelineState=(site,t)=>{const a=NS.DB.timelineBySite[site]||[];if(!a.length)return{t,year_label:'MVP',title:'场景',subtitle:'',infrastructure:1,roads:1,buildings:1,flow:.5,atmosphere:.6};if(t<=a[0].t)return a[0];if(t>=a[a.length-1].t)return a[a.length-1];for(let i=0;i<a.length-1;i++){const A=a[i],B=a[i+1];if(t>=A.t&&t<=B.t){const q=(t-A.t)/(B.t-A.t);const lerp=(x,y)=>x+(y-x)*q;return{...A,t,year_label:q<.5?A.year_label:B.year_label,title:q<.5?A.title:B.title,subtitle:q<.5?A.subtitle:B.subtitle,infrastructure:lerp(A.infrastructure,B.infrastructure),roads:lerp(A.roads,B.roads),buildings:lerp(A.buildings,B.buildings),flow:lerp(A.flow,B.flow),atmosphere:lerp(A.atmosphere,B.atmosphere)}}}return a[a.length-1]};
})(window.SpatialApp=window.SpatialApp||{});
