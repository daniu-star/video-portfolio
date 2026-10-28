const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const E=require('../js/engine.js');
const root=path.join(__dirname,'..');
const js=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('设备自评结果与生活感受分离，数据反馈可触发不同行为结果',()=>{
 const r={id:'zhou'},one=E.experienceFeedback(r,'score'),two=E.experienceFeedback(r,'body');
 assert.equal(one.deviceScore,66);assert.equal(two.deviceScore,58);
 assert.equal(one.subjective,two.subjective);assert.ok(one.cost!==two.cost);
 assert.equal(one.isSimulated,true);
});
test('三种合同有不同预付报酬，分账不保证未来必然更优',()=>{
 const result={};for(const license of Object.keys(E.LICENSES)){const w=E.newLedger();w.license=license;const a=E.capture(w,'分拣').asset;result[license]=w.pay;assert.equal(E.verifyLedger(w).ok,true);assert.equal(w.royalty,0);assert.equal(a.paid,w.pay)}
 assert.equal(result.buyout,19);assert.equal(result.share,12);assert.equal(result.limited,16);
 assert.ok(result.buyout>result.share);
});
test('反复调用后分账可能超过买断，限次许可阻止第三次调用',()=>{
 const w=E.newLedger();w.license='share';const a=E.capture(w,'分拣').asset;
 for(let i=0;i<2;i++)E.invoke(w,a.id);assert.equal(w.pay+w.royalty,28);assert.equal(E.verifyLedger(w).ok,true);
 w.license='limited';const b=E.capture(w,'弯腰').asset;
 E.invoke(w,b.id);E.invoke(w,b.id);assert.equal(E.invoke(w,b.id).ok,false);
 assert.equal(E.verifyLedger(w).ok,true);
});
test('动作质量根据负荷与时间评估，过载可重录而非奖励高负荷',()=>{
 assert.equal(E.evaluateCapture(18,44).ok,true);assert.equal(E.evaluateCapture(60,44).ok,false);
 assert.equal(E.evaluateCapture(20,601).ok,false);
});
test('第三幕场景热点及终章交互式证据判断实际接线',()=>{
 for(const s of ['id="factorySceneAction"','id="factorySceneActionLabel"','css/reflexive-v16.css'])assert.ok(html.includes(s));
 for(const s of ['function updateFactorySceneAction()','function showCorrectionEditor()','function initAuditLab()','[data-loop]','id="auditLab"','recordPieces'])assert.ok(js.includes(s),s);
});
