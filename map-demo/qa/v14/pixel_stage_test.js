const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(require('path').join(__dirname,'../../assets/js/ux/pixel-truck.js'),'utf8');
const elements=new Map();let handler=null,draws=0;
const ctx=new Proxy({beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},fillRect(){draws++},save(){},restore(){},translate(){},rotate(){},clearRect(){},fillText(){},setLineDash(){},quadraticCurveTo(){}},{get(t,k){return t[k]||0},set(t,k,v){t[k]=v;return true}});
function el(id){if(!elements.has(id)){let attrs={},node={id,hidden:false,style:{},textContent:'',classList:{add(){},remove(){},toggle(){}},append(){},appendChild(){},replaceChildren(){},setAttribute(a,b){attrs[a]=b},addEventListener(){},focus(){},getContext(){return ctx}};elements.set(id,node)}return elements.get(id)}
function fakeMarker(){return{type:'button',className:'',style:{},dataset:{},setAttribute(){},addEventListener(){},querySelector(){return{textContent:''}},innerHTML:'',textContent:''}}
const sandbox={window:{SpatialApp:{state:{entered:true,site:'overview'},App:{enterMap(){}},Drive:{active:false}}},document:{getElementById:el,createElement:fakeMarker,querySelectorAll(){return[]},addEventListener(name,fn){handler=fn},body:{classList:{add(){},remove(){}}}},requestAnimationFrame(fn){return 1},cancelAnimationFrame(){},setTimeout(){},Math,Set,console};
vm.runInNewContext(source,sandbox);const p=sandbox.window.SpatialApp.PixelTruck;
p.open();assert.strictEqual(p.openState,true);
for(const id of ['g552','s315','liuan']){
 p.selectRoute(id);assert.strictEqual(p.routeId,id);assert.strictEqual(p.points().length,3);assert.strictEqual(p.position,0);
 p.position=1;p.reverse();assert.strictEqual(p.direction,-1);assert.strictEqual(p.position,0);
 p.reverse();p.reset();assert.strictEqual(p.position,0);
}
p.openPlace({id:'bridge',name:'花江峡谷大桥',type:'place',note:'test',road:'六枝至安龙高速'});assert.strictEqual(el('pixelPlaceDialog').hidden,false);
p.closePlace();assert.strictEqual(el('pixelPlaceDialog').hidden,true);p.close();assert.strictEqual(p.openState,false);
console.log(JSON.stringify({checks:20,passed:20,method:'Node VM mocked DOM and canvas, not browser visuals',draw_calls:draws}));
