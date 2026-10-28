const test=require('node:test');const assert=require('node:assert/strict');
require('../js/world3d.js');const {sceneMesh,isBlocked}=globalThis.Flesh3D.inspect;
test('three independent three-dimensional room meshes are finite and non-empty',()=>{for(const scene of ['city','rural','factory']){const m=sceneMesh(scene);assert.ok(m.length>10000,scene);assert.equal(m.length%27,0,scene);assert.ok(m.every(Number.isFinite),scene);}});
test('city spawn is on a walkable surface',()=>assert.equal(isBlocked(-4.5,1.7),false));
test('kiosk is solid and player cannot walk through it',()=>assert.equal(isBlocked(2.8,-1.45),true));
test('public sidewalk approach is navigable',()=>{for(let x=-4.5;x<1.75;x+=.35)assert.equal(isBlocked(x,1.15),false,'x='+x);});
test('street furniture creates a blocking collision',()=>assert.equal(isBlocked(-7,-3.8),true));
test('out-of-bounds locations reject navigation',()=>assert.equal(isBlocked(11.75,6.3),true));
