(function(NS){'use strict';
const $=id=>document.getElementById(id);
const LOCATIONS={
 fast:{lat:25.6528077,lng:106.8566259,zoom:15,range:2200,label:'中国天眼 FAST',note:'FAST 核心装置附近的公众可识别地标；科研保护区域不得由地图显示推断进入许可。'},
 huajiang:{lat:25.7047,lng:105.5881,zoom:15.5,range:3100,label:'花江峡谷大桥',note:'公开地理参考中心点（近似）；非主桥中线测绘成果。禁止作为导航停车点。'}
};
const Geo={
 mode:'demo',provider:'amap',location:'huajiang',instance:null,markers:[],loading:false,scriptWait:null,initialized:false,
 init(){
  $('geoOpen').onclick=()=>this.showConfig();$('geoHelpOpen').onclick=()=>this.showDialog('geoHelp');$('geoHelpDone').onclick=()=>this.hideDialog('geoHelp');
  document.querySelectorAll('[data-close-geo]').forEach(b=>b.onclick=()=>this.hideDialog('geoConfig'));document.querySelectorAll('[data-close-help]').forEach(b=>b.onclick=()=>this.hideDialog('geoHelp'));
  $('geoDemoBack').onclick=()=>this.toDemo();$('geoClose').onclick=()=>this.toDemo();$('geoConnect').onclick=()=>this.connect();
  document.querySelectorAll('[data-geo-provider]').forEach(b=>b.onclick=()=>this.selectProvider(b.dataset.geoProvider));
  $('geoFocusFast').onclick=()=>this.focus('fast');$('geoFocusBridge').onclick=()=>this.focus('huajiang');
  $('geoGameFromMap').onclick=()=>this.launchDrive();$('geoFastGameFromMap').onclick=()=>NS.FastGame?.open();$('bridgePulse').onclick=()=>this.launchDrive();
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){['geoHelp','geoConfig'].forEach(id=>{if(!$(id).hidden)this.hideDialog(id)});}});
  NS.onState((s,p)=>{if('site'in p){if(this.mode!=='demo'){if(s.site==='overview')this.focusOverview();else this.focus(s.site)}this.updatePulse()}});
  this.initialized=true;this.updatePulse();
 },
 showDialog(id){$(id).hidden=false;document.body.classList.add('geo-dialog-open')},
 hideDialog(id){$(id).hidden=true;if(['geoHelp','geoConfig'].every(k=>$(k).hidden))document.body.classList.remove('geo-dialog-open')},
 showConfig(){if(!NS.state.entered){NS.App.enterMap();setTimeout(()=>this.showDialog('geoConfig'),1200);return}this.showDialog('geoConfig');this.selectProvider(this.provider)},
 selectProvider(provider){this.provider=provider;document.querySelectorAll('[data-geo-provider]').forEach(b=>b.classList.toggle('is-current',b.dataset.geoProvider===provider));$('geoAmapProxyRow').hidden=provider!=='amap';$('geoDevSecretRow').hidden=provider!=='amap';$('geoGoogleNote').hidden=provider!=='google';this.status(provider==='amap'?'高德：需 Web(JS API) Key；地形使用 2.1Beta。':'Google：需允许域名、启用 API 与计费；数据覆盖情况由供应商决定。')},
 status(t){$('geoStatus').textContent=t;},
 loadScript(src,globalName){return new Promise((resolve,reject)=>{
   if(window[globalName]){resolve(window[globalName]);return}
   const el=document.createElement('script');el.src=src;el.async=true;const timeout=setTimeout(()=>{el.remove();reject(new Error('SDK 请求超时：请检查网络、密钥域名与地图服务可用性'))},18000);
   el.onload=()=>{clearTimeout(timeout);if(window[globalName])resolve(window[globalName]);else reject(new Error('SDK 脚本返回但未完成初始化'))};el.onerror=()=>{clearTimeout(timeout);el.remove();reject(new Error('SDK 网络请求失败，请检查互联网连通性、浏览器限制或域名白名单'))};document.head.append(el);
 })},
 async connect(){if(this.loading)return;const key=$('geoApiKey').value.trim();if(!/^[a-z0-9_-]{10,}$/i.test(key)){this.status('请填写有效的 Web SDK Key，不能直接使用地图网址或搜索页链接。');return}
  if(location.protocol==='file:'){this.status('正在从 file:// 打开：建议通过 run_windows.bat 或 run_mac_linux.sh 用 http://localhost 运行，SDK 可能拒绝本地文件来源。')}
  this.loading=true;$('geoConnect').disabled=true;$('geoConnect').textContent='连接中…';
  const provider=this.provider;try{
   const stage=$('geoMapStage');stage.replaceChildren();stage.hidden=false;
   if(provider==='amap')await this.loadAmap(key,stage);else await this.loadGoogle(key,stage);
   this.mode=provider;document.body.classList.add('is-geo-map');stage.hidden=false;$('geoHud').hidden=false;
   $('geoProviderLabel').textContent=provider==='amap'?'高德 JS API 2.1Beta · 3D 地形':'Google Maps JavaScript API · 3D';this.status('SDK 已初始化；实际地形纹理是否加载完成仍取决于网络与供应商覆盖。');
   this.hideDialog('geoConfig');if(NS.state.site==='overview')this.focusOverview();else this.focus(NS.state.site);this.updatePulse();
  }catch(err){this.status('载入失败：'+String(err.message||err));$('geoMapStage').hidden=true;this.mode='demo';document.body.classList.remove('is-geo-map');}
  finally{this.loading=false;$('geoConnect').disabled=false;$('geoConnect').textContent='载入所选真实 3D 地图'}
 },
 async loadAmap(key,stage){const proxy=$('geoServiceHost').value.trim(), dev=$('geoDevSecret').value.trim();
  if(proxy){if(!/^https?:\/\//.test(proxy))throw Error('安全代理必须是 http(s) URL');window._AMapSecurityConfig={serviceHost:proxy}}
  else if(dev){window._AMapSecurityConfig={securityJsCode:dev};this.status('开发模式：明文安全密钥暴露在当前页面中，勿公开部署。')}
  else throw Error('高德需要配置安全代理 serviceHost；本机调试可选择临时输入 Security JS Code。');
  const AMap=await this.loadScript('https://webapi.amap.com/maps?v=2.1Beta&key='+encodeURIComponent(key),'AMap');
  const pos=LOCATIONS[NS.state.site==='fast'?'fast':'huajiang'];
  const xy=await this.amapCoord(pos);
  const map=new AMap.Map(stage,{viewMode:'3D',terrain:true,zoom:pos.zoom,pitch:65,rotation:10,center:xy,mapStyle:'amap://styles/normal',pitchEnable:true,rotateEnable:true,zooms:[4,20]});
  this.instance=map;this.markers=[];
  for(const site of ['fast','huajiang']){const p=LOCATIONS[site];const pos0=await this.amapCoord(p);const marker=new AMap.Marker({position:pos0,title:p.label,content:this.markerHTML(site),offset:new AMap.Pixel(-45,-55)});marker.on('click',()=>this.pinClicked(site));marker.setMap(map);this.markers.push(marker)}
  map.on('complete',()=>{$('geoGeoStatus').textContent='高德地图已完成基础加载；地形是否可见取决于 2.1Beta / 数据覆盖。'});
 },
 async loadGoogle(key,stage){const google=await this.loadScript('https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(key)+'&v=beta&libraries=maps3d','google');
  const {Map3DElement,Marker3DElement}=await google.maps.importLibrary('maps3d');
  const p=LOCATIONS[NS.state.site==='fast'?'fast':'huajiang'];const map=new Map3DElement({center:{lat:p.lat,lng:p.lng,altitude:700},range:p.range,tilt:70,heading:20,mode:'HYBRID'});
  map.style.width='100%';map.style.height='100%';stage.append(map);this.instance=map;
  if(Marker3DElement){for(const site of ['fast','huajiang']){const q=LOCATIONS[site];const marker=new Marker3DElement({position:{lat:q.lat,lng:q.lng,altitude:30},label:site==='fast'?'FAST':'花江大桥',drawsWhenOccluded:true});marker.addEventListener('gmp-click',()=>this.pinClicked(site));map.append(marker)}}
  $('geoGeoStatus').textContent='Google 3D 初始化成功；实际摄影级地形覆盖与瓦片加载状态由地图提供商决定。';
 },
 markerHTML(site){return '<div class="geo-map-marker '+site+'"><span>'+ (site==='fast'?'◎':'▶')+'</span><b>'+(site==='fast'?'中国天眼 · 科普':'花江大桥 · 驾驶')+'</b></div>'},
 pinClicked(site){this.location=site;if(site==='huajiang'){this.launchDrive()}else{this.focus(site);NS.FastGame?.open()}},
 amapCoord(p){return new Promise(resolve=>{try{window.AMap.convertFrom([p.lng,p.lat],'gps',(status,result)=>{if(status==='complete'&&result?.locations?.length){const q=result.locations[0];resolve([q.lng,q.lat])}else{this.status('高德 GCJ-02 坐标转换失败；暂不保证定位精度');resolve([p.lng,p.lat])}})}catch(_){this.status('高德坐标转换接口不可用；定位精度待核验');resolve([p.lng,p.lat])}})},
 focusOverview(){const mid={lat:25.70,lng:106.22,zoom:9.2,range:160000};this.location='huajiang';if(this.mode==='amap'&&this.instance){const m=this.instance;this.amapCoord(mid).then(x=>{if(this.instance===m){m.setZoomAndCenter(mid.zoom,x);m.setPitch(50)}})}if(this.mode==='google'&&this.instance){this.instance.center={lat:mid.lat,lng:mid.lng,altitude:1600};this.instance.range=mid.range;this.instance.tilt=48}$('geoGeoStatus').textContent='贵州双区域：FAST 与花江峡谷大桥的真实地理位置总览（区域尺度）；两处可能不在同一屏幕最佳精度级别。'},
 focus(site){this.location=site;const p=LOCATIONS[site];if(this.mode==='amap'){const map=this.instance; if(map){this.amapCoord(p).then(xy=>{if(this.instance===map){map.setZoomAndCenter(p.zoom,xy);map.setPitch(64)}})}}
  if(this.mode==='google'&&this.instance){this.instance.center={lat:p.lat,lng:p.lng,altitude:700};this.instance.range=p.range;this.instance.tilt=70}
  $('geoGeoStatus').textContent=p.label+'：'+p.note;this.updatePulse();
 },
 toDemo(){if(this.mode!=='demo'){try{if(this.mode==='amap')this.instance?.destroy()}catch(_){}this.instance=null;$('geoMapStage').replaceChildren();this.mode='demo'}document.body.classList.remove('is-geo-map');$('geoMapStage').hidden=true;$('geoHud').hidden=true;this.hideDialog('geoConfig');this.updatePulse()},
 launchDrive(){this.toDemo();this.hideDialog('geoConfig');if(!NS.state.entered){NS.App.enterMap();setTimeout(()=>NS.Drive.prepare(NS.DriveRoutes.bridge),1350)}else NS.Drive.prepare(NS.DriveRoutes.bridge)},
 updatePulse(){if($('geoFastGameFromMap')){const isFast=this.location==='fast';$('geoFastGameFromMap').hidden=!isFast;$('geoGameFromMap').hidden=isFast}const pin=$('bridgePulse');if(!pin)return;const active=NS.state.entered&&this.mode==='demo'&&NS.state.site==='huajiang'&&!NS.Drive?.active;pin.hidden=!active;if(!active)return;
  const n=NS.DB.nodes.bridge_core;if(!n||!NS.App?.engine){pin.hidden=true;return}const point=NS.App.engine.proj({x:n.scene_x,y:n.scene_y+100,z:n.scene_z});if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y)){pin.hidden=true;return}pin.style.left=Math.max(150,Math.min(innerWidth-270,point.x+20))+'px';pin.style.top=Math.max(120,Math.min(innerHeight-170,point.y-65))+'px';
 }
};
NS.Geo=Geo;
addEventListener('DOMContentLoaded',()=>{Geo.init();setInterval(()=>Geo.updatePulse(),240)});
})(window.SpatialApp=window.SpatialApp||{});
