const {test}=require('node:test'),assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/data.js'),'utf8'),sandbox);
const R=sandbox.FleshData.roles;
test('周远与林舟每个开场问题都有一对一回复，不再依赖统一索引',()=>{
 for(const role of [R.zhou,R.lin]){
  assert.equal(role.opening.length,role.openingReplies.length);
  assert.equal(role.opening.length,3);
 }
 assert.match(R.zhou.openingReplies[1],/上工/);
 assert.match(R.zhou.openingReplies[2],/检查/);
 assert.match(R.lin.openingReplies[1],/体检/);
});
test('乡村和城镇问诊每条原话均有具体可追溯的漏记片段',()=>{
 for(const role of [R.zhao,R.xu]){
  assert.equal(role.openingReplies.length,role.opening.length);
  assert.equal(role.symptomOptions.length,3);
  for(const item of role.symptomOptions){
   assert.ok(item.full.includes(item.missing),role.id+': omitted not in original');
   assert.equal(item.bad.includes(item.missing),false,role.id+': omitted unexpectedly in bad');
   assert.ok(item.bad.length<item.full.length);
  }
 }
});
test('虚构样本不会因为切换平台而覆盖后续合同许可',()=>{
 const E=require('../js/engine.js');const w=E.newLedger();E.seedLedger(w);
 const before=w.assets.map(a=>a.license);
 w.license='share';const next=E.capture(w,'行走');
 assert.deepEqual(w.assets.slice(0,2).map(a=>a.license),before);
 assert.equal(next.asset.license,'share');assert.equal(E.verifyLedger(w).ok,true);
});
