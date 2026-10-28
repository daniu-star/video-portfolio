const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../js/engine.js');
test('职业不进入患者医学风险推断：更换记录只影响信息充分度',()=>{
 const r={history:false},ctx={duration:'today',redFlag:'no',allowRecords:true};
 const a=E.assessConversation(r,ctx),b=E.assessConversation({...r,history:true},ctx);
 assert.equal(a.action,b.action);assert.equal(b.clarity>a.clarity,true);assert.equal(a.serious,false);
});
test('出现紧急征象时不被旧记录降级',()=>{
 const ctx={duration:'today',redFlag:'yes',allowRecords:true};const a=E.assessConversation({history:false},ctx),b=E.assessConversation({history:true},ctx);
 assert.equal(a.serious,true);assert.equal(b.serious,true);assert.equal(a.action,b.action);
});
test('核对只会把玩家真实说过的话写回记录，不会虚构预约',()=>{
 const role={history:false};const ctx={original:'我干活容易累，有时胸口发闷。',bad:'我干活容易累。'};
 const a=E.assessRural(role,{...ctx,corrected:false,record:'missing',contact:'save'});
 const b=E.assessRural(role,{...ctx,corrected:true,record:'photo',contact:'clinic'});
 assert.equal(a.transcript,ctx.bad);assert.equal(b.transcript,ctx.original);assert.match(b.reach,/尚未预约/);
});
test('相同一份动作数据，工资、调用、分成可逐笔核对',()=>{
 const w=E.newLedger();w.license='share';const a=E.capture(w,'行走');assert.equal(a.asset.id,'D-001');assert.equal(E.invoke(w,a.asset.id).share,8);
 assert.equal(w.pay,12);assert.equal(w.royalty,8);assert.equal(w.revenue,30);assert.equal(E.verifyLedger(w).ok,true);
});
test('买断不会假装自动分账',()=>{const w=E.newLedger();w.license='buyout';const a=E.capture(w,'分拣');E.invoke(w,a.asset.id);assert.equal(w.royalty,0);assert.equal(E.verifyLedger(w).ok,true);});
test('限次许可对第三次调用产生真实阻断',()=>{const w=E.newLedger();w.license='limited';const a=E.capture(w,'弯腰');E.invoke(w,a.asset.id);E.invoke(w,a.asset.id);let n=w.entries.length;const blocked=E.invoke(w,a.asset.id);assert.equal(blocked.ok,false);assert.equal(w.entries.length,n);});
test('10次采集触发岗位终止但不抹去已经确认的权益',()=>{const w=E.newLedger();w.license='share';for(let i=0;i<10;i++)E.capture(w,'抬臂');assert.equal(w.job,'本批订单结束，岗位终止');assert.equal(w.pay,120);assert.equal(w.assets.every(a=>a.license==='share'),true);assert.equal(E.verifyLedger(w).ok,true);});
test('反事实只固定授权等条件，保留玩家本次真实评估',()=>{
 const current={history:true},other={history:false},ctx={duration:'today',redFlag:'no',allowRecords:false};
 const actual=E.assessConversation(current,ctx);
 const pair=E.compareSameSymptoms(current,other,ctx,actual);
 assert.equal(pair.first,actual);assert.equal(pair.first.recordsAvailable,false);
 assert.equal(pair.second.recordsAvailable,false);assert.equal(pair.gateIsProblem,false);
 assert.equal(pair.first.action,pair.second.action);
 assert.equal(pair.otherHypothetical,true);
 const authorized=E.compareSameSymptoms(current,other,{...ctx,allowRecords:true});
 assert.equal(authorized.gateIsProblem,true);
 assert.equal(authorized.first.recordsAvailable,true);
 assert.equal(authorized.second.recordsAvailable,false);
});
test('警讯或未确认不允许以旧资料门槛作结论',()=>{
 for(const redFlag of ['yes','unknown']){
  const p=E.compareSameSymptoms({history:false},{history:true},{duration:'ongoing',redFlag,allowRecords:true});
  assert.equal(p.gateIsProblem,false);assert.equal(p.first.action,p.second.action);
  assert.equal(p.first.serviceRoute,p.second.serviceRoute);
 }
});
test('危险症状解析：否定、未知、肯定、转折句',()=>{
 const cases=[['没有胸痛','no'],['暂时没有胸痛，也没有呼吸困难','no'],['不确定有没有胸痛','unknown'],['有没有胸痛我不清楚','unknown'],['我有胸痛','yes'],['没有胸痛，但是喘不上气','yes'],['胸口不疼但呼吸困难','yes'],['我不知道','unknown']];
 for(const [t,want] of cases)assert.equal(E.parseRedFlag(t),want,t);
});
test('伊森先进入工厂只加载有来源的两个历史样本，工人仍可继续工作',()=>{
 const w=E.newLedger();E.seedLedger(w);assert.equal(w.assets.length,2);
 assert.equal(w.assets.every(a=>a.origin==='historical'),true);
 assert.equal(w.job,'在岗');assert.equal(E.capture(w,'行走').asset.id,'D-003');
 assert.equal(E.verifyLedger(w).ok,true);
});
test('问诊回复应给出与角色权限一致的服务流程，而非声称已经预约',()=>{
 const E=require('../js/engine.js');
 const r={history:true};
 const ok=E.assessConversation(r,{duration:'today',redFlag:'no',allowRecords:true});
 const no=E.assessConversation({...r,history:false},{duration:'today',redFlag:'no',allowRecords:true});
 const unknown=E.assessConversation(r,{duration:'today',redFlag:'unknown',allowRecords:true});
 const urgent=E.assessConversation(r,{duration:'today',redFlag:'yes',allowRecords:true});
 assert.match(ok.serviceRoute,/可申请/);assert.match(no.serviceRoute,/先补/);
 assert.match(unknown.serviceRoute,/暂不作服务分流/);assert.match(urgent.serviceRoute,/紧急/);
});
