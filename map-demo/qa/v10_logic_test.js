const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
class E{constructor(id=''){this.id=id;this.hidden=true;this.children=[];this.classList={add(){},remove(){},toggle(){}};this.style={};this.handlers={};this.dataset={};this.textContent='';this.value='';}
 append(...children){this.children.push(...children)}replaceChildren(...c){this.children=[...c]};addEventListener(k,handler){this.handlers[k]=handler};focus(){};setAttribute(){}
}
const nodes={};const ids=['pixelTruckGame','pixelPhotoDialog','pixelClose','pixelPhotoClose','pixelGo','pixelReverse','pixelQuickOpen','pixelBrake','pixelPause','pixelLeft','pixelRight','pixelWorld','pixelEvent','pixelEventTitle','pixelEventText','pixelEventActions','pixelPlace','pixelProgress','pixelScore','pixelFuel','pixelSpeed','pixelRoad','pixelMessage','pixelStops','pixelPhotoTitle','pixelPhotoList','pixelPhotoScope'];ids.forEach(x=>nodes[x]=new E(x));nodes.pixelWorld.getContext=()=>({});
const doc={getElementById:id=>nodes[id],createElement:tag=>new E(tag),querySelectorAll:s=>[] ,addEventListener(){}};
const NS={LocalPhotoCatalog:{fast:[],huajiang:[]},state:{entered:true},Drive:{active:false}};
const sandbox={window:{SpatialApp:NS},document:doc,cancelAnimationFrame(){},requestAnimationFrame(){return 1},performance:{now(){return 1}},console};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/ux/pixel-truck.js'),'utf8'),sandbox);
const p=NS.PixelTruck;
let passed=0;function assert(cond,name){if(!cond)throw Error('FAIL '+name);passed++}
for(const id of ['g552','s315']){p.routeId=id;p.reset();assert(p.step===0,'reset');for(let i=0;i<6;i++){for(let j=0;j<4;j++){p.drive()};assert(p.evt===true,'stop event');p.completeStop(true)}assert(p.gameEnded,'complete route');assert(p.discoveries===6,'discovered six');assert(p.step===5,'step clamp');}
p.routeId='g552';p.reset();p.reverse();assert(p.direction===-1,'reverse direction');assert(p.current().name==='云渡服务区','return starts at bridge area');for(let i=0;i<6;i++){for(let j=0;j<4;j++)p.drive();assert(p.evt,'return event');p.completeStop(true)}assert(p.gameEnded,'return finished');p.reverse();assert(p.direction===1,'return to outward journey');p.routeId='g552';p.reset();p.moveLane(-1);assert(p.lane===-1,'left');p.moveLane(1);assert(p.lane===0,'right');p.togglePause();assert(p.paused,'pause');p.togglePause();assert(!p.paused,'resume');p.openPhoto({type:'road',name:'G552',note:'road'});assert(nodes.pixelPhotoDialog.hidden===false,'photo card visible');p.closePhoto();assert(nodes.pixelPhotoDialog.hidden===true,'photo closed');
console.log('PASS',passed,'logic assertions');
