const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../../assets/js/ux/pixel-truck.js'),'utf8');
const elements=new Map();let registered=0,draws=0;
const canvas=new Proxy({beginPath(){},moveTo(){},lineTo(){},bezierCurveTo(){},stroke(){},fill(){},fillRect(){draws++},save(){},restore(){},translate(){},rotate(){},clearRect(){},fillText(){},setLineDash(){},quadraticCurveTo(){}},{get(o,k){return o[k]||0},set(o,k,v){o[k]=v;return true}});
function elem(id){if(!elements.has(id))elements.set(id,{style:{},hidden:false,textContent:'',classList:{add(){},remove(){},toggle(){}},append(){},appendChild(){},replaceChildren(){},setAttribute(){},addEventListener(){registered++},focus(){},getContext(){return canvas}});return elements.get(id)}
function marker(){return{style:{},className:'',setAttribute(){},addEventListener(){},querySelector(){return{textContent:''}},innerHTML:'',textContent:''}}
const b={window:{SpatialApp:{state:{entered:true,site:'huajiang'},App:{enterMap(){}},Drive:{active:false}}},document:{getElementById:elem,createElement:marker,querySelectorAll(){return[]},addEventListener(){},body:{classList:{add(){},remove(){}}}},requestAnimationFrame(){return 1},cancelAnimationFrame(){},Math,Set,console};
vm.runInNewContext(source,b);const game=b.window.SpatialApp.PixelTruck;
game.open();assert.equal(game.openState,true);game.selectRoute('g552');assert.equal(game.routeId,'g552');
game.transfer();assert.equal(game.routeId,'liuan');game.transfer();assert.equal(game.routeId,'g552');
game.selectRoute('s315');game.transfer();assert.equal(game.routeId,'liuan');
game.reverse();assert.equal(game.direction,-1);game.close();assert.equal(game.openState,false);
console.log('PASS: popup open, g552↔liuan, s315→liuan, return, close; canvas draws '+draws+', listeners '+registered);
