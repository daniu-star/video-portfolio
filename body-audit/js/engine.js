(function(root){'use strict';
// All monetary values are fictional. No patient disease-risk scoring is made.
function assessConversation(role,ctx){
 const serious=ctx.redFlag==='yes';
 const symptomKnown=Boolean(ctx.duration&&ctx.redFlag);
 const recordsAvailable=Boolean(role.history&&ctx.allowRecords);
 const clarity= Math.min(100,28+(symptomKnown?34:0)+(ctx.duration==='unsure'?0:10)+(recordsAvailable?18:0)+(ctx.additional?10:0));
 const serviceRoute=serious?'警讯优先：直接提示紧急医疗帮助':ctx.redFlag==='unknown'?'伴随情况待核实：暂不作服务分流':recordsAvailable?'可申请本平台人工复核':'需先补既往资料再申请本平台人工复核';
 const action=serious?'请立即寻求急诊或当地紧急医疗帮助':ctx.redFlag==='unknown'?'建议尽快联系专业医务人员核实':'建议视症状持续或加重情况，及时找专业医生评估';
 return {clarity,recordsAvailable,serious,serviceRoute,action,missing:[!ctx.duration?'发生时间':null,ctx.redFlag==='unknown'?'是否有需要紧急处理的伴随症状':null,!recordsAvailable?'可供参考的既往记录':null].filter(Boolean),note:serious?'聊天不能排除紧急问题，不能以本页结果替代线下评估。':'这不是疾病风险分数，只表示本次对话所掌握的信息是否充分。'};
}
/** A paired scenario holds the symptom answers constant and only varies available records.
 *  This is a fictional queueing heuristic, explicitly NOT a clinical risk score. */
/** Compare a recorded visit to a specifically labelled hypothetical run.
 * Clinical complaints may differ by character; only duration, warning signals, and
 * records-consent are held constant in this SERVICE-ROUTING experiment. */
function compareSameSymptoms(currentRole, otherRole, ctx, actualAssessment){
 const fixed={duration:ctx.duration||'unsure',redFlag:ctx.redFlag||'unknown',allowRecords:Boolean(ctx.allowRecords),additional:Boolean(ctx.additional)};
 const first=actualAssessment||assessConversation(currentRole,ctx);
 const second=assessConversation(otherRole,fixed);
 const gateIsProblem=fixed.redFlag==='no'&&first.recordsAvailable!==second.recordsAvailable;
 return {first,second,fixed,gateIsProblem,controlled:'仅对照同一线上复核规则下的资料授权、持续时间和警讯回答。两人最初主诉不同，不能当作相同疾病风险的比较。',otherHypothetical:true};
}
/** Never infer a present red flag from a negated or uncertain mention of it. */
function parseRedFlag(text){
 const s=String(text||'').replace(/\s+/g,'');
 if(!s)return 'unknown';
 const danger=/胸痛|胸闷|胸口|心口|呼吸困难|喘不过气|喘不上气|晕倒|晕厥|差点晕|剧痛|气短/;
 if(/不确定|不清楚|不知道|说不好|说不准|有没有|是否有|不敢确定|可能有|好像有|没法确定/.test(s))return 'unknown';
 let sawNegative=false,sawPositive=false;
 const chunks=s.split(/[,，。；;、]|但是|但|不过|可是/).filter(Boolean);
 for(const ch of chunks){
  if(!danger.test(ch))continue;
  const negative=/没有|没出现|并无|并没有|不是|未出现|不存在|不曾|无|不伴有|不疼|不痛/.test(ch);
  if(negative){sawNegative=true;continue;}
  sawPositive=true;
 }
 if(sawPositive)return 'yes';
 if(sawNegative)return 'no';
 if(/没有|都没有|暂时无|无这些|不伴有/.test(s))return 'no';
 return 'unknown';
}
function assessRural(role,ctx){
 const corrected=Boolean(ctx.corrected),records=ctx.record==='photo'||(role.history&&ctx.record==='authorize');
 const original=String(ctx.original||''),initial=String(ctx.bad||original),transcript=corrected?original:initial;
 const advice=corrected?'谢谢你核对。新出现或重要的不舒服值得及时让专业医生评估；若持续胸痛、呼吸困难或晕厥，应立即寻求紧急医疗帮助。':'这份记录仍没有核对完整，不能用它来排除问题。建议带着原话及时向专业医务人员确认。';
 const reach=ctx.contact==='clinic'?'你打算联系附近的医生；目前尚未预约':ctx.contact==='family'?'你打算把这次情况告诉家人；目前尚未发送消息':'已保存这次的原话，线下就诊仍需安排';
 return {corrected,records,original,initial,transcript,advice,reach,missed:!corrected&&initial!==original};
}
const LICENSES={buyout:{pay:19,share:0,maxUses:Infinity,title:'一次买断'},share:{pay:12,share:8,maxUses:Infinity,title:'持续分账'},limited:{pay:16,share:0,maxUses:2,title:'限次使用'}};
function newLedger(){return {assets:[],entries:[],pay:0,royalty:0,revenue:0,platformNet:0,rests:0,license:'buyout',job:'在岗',calls:0};}
function experienceFeedback(role,choice){
 const isShift=role.id==='zhou';
 const options={score:{title:'按设备分数安排生活',cost:isShift?'为了补齐数据，你放弃一段原本可以接的工时。':'你为了提高睡眠评分，反复查看设备，临睡前反而难以放松。',change:'下一轮有更多可展示的数字，但身体感受仍需自己描述。',scoreChange:8},body:{title:'记录感受并寻求专业帮助',cost:isShift?'联系医生仍可能涉及交通和误工。':'你留出时间记录不舒服的情况，项目进度受到一些影响。',change:'下一轮你的主观感受记录更完整，设备分数未必同步提高。',scoreChange:0},ignore:{title:'先搁置设备提示',cost:isShift?'你暂时保住了工作安排，身体疑虑还在。':'你没有让数字打断工作，但仍需要留意自己的感受。',change:'下一轮仍缺少对新症状的核对。',scoreChange:-2}};
 const x=options[choice];if(!x)throw Error('invalid feedback choice');return {...x,deviceScore:58+x.scoreChange,subjective:'依然感到疲惫',isSimulated:true};
}
function evaluateCapture(fatigue,secondsWorked,maxSeconds=600){
 if(secondsWorked>maxSeconds)return {ok:false,reason:'班次可用时间已经用完'};
 if(fatigue>=60)return {ok:false,reason:'追踪标记出现偏移，数据核对未通过；这一段需要重录。可先休息，恢复后再试。'};
 return {ok:true,reason:'追踪点齐全，符合本次虚构订单的采集要求。'};
}

function capture(w,motion){if(!['分拣','抬臂','行走','弯腰'].includes(motion))throw Error('invalid motion');if(w.assets.length>=10)return {ok:false,why:'今日订单已满'};const rule=LICENSES[w.license];if(!rule)throw Error('invalid license');const a={id:'D-'+String(w.assets.length+1).padStart(3,'0'),motion,license:w.license,uses:0,origin:'current',paid:rule.pay};w.assets.push(a);w.pay+=rule.pay;w.platformNet-=rule.pay;w.entries.push({type:'采集',asset:a.id,worker:rule.pay,platform:-rule.pay,desc:`阿玛拉完成「${motion}」，按照${rule.title}合同支付${rule.pay}G。`});if(w.assets.length===10)w.job='本批订单结束，岗位终止';return {ok:true,asset:a};}
function invoke(w,id){const a=w.assets.find(v=>v.id===id);if(!a)return {ok:false,why:'没有这份样本'};if(a.uses>=LICENSES[a.license].maxUses)return {ok:false,why:'这份样本已达到两次使用上限，需要重新协商许可'};a.uses++;w.calls++;w.revenue+=30;const share=LICENSES[a.license].share;w.royalty+=share;w.platformNet+=30-share;w.entries.push({type:'调用',asset:a.id,worker:share,platform:30-share,desc:`平台使用${a.id}：30G收入，劳动者获得${share}G分成。`});return {ok:true,asset:a,share};}
function seedLedger(w){if(w.assets.length)return;const prev=w.license;w.license='buyout';for(let i=0;i<2;i++){const result=capture(w,['分拣','抬臂'][i]);result.asset.origin='historical';result.asset.source='历史样本 · 阿玛拉 / 虚构外包采集站';}w.license=prev;w.entries.unshift({type:'档案',asset:'—',worker:0,platform:0,desc:'两份有来源的虚构历史样本，已完成采集并支付工资。玩家可切换阿玛拉继续新的采集任务。'});}
function verifyLedger(w){let labor=0,platform=0;for(const e of w.entries){labor+=(e.worker||0);platform+=(e.platform||0);}return {ok:Math.abs(labor-(w.pay+w.royalty))<1e-6&&Math.abs(platform-w.platformNet)<1e-6,labor,platform};}
root.FleshEngine={assessConversation,compareSameSymptoms,parseRedFlag,assessRural,newLedger,capture,invoke,seedLedger,verifyLedger,LICENSES,experienceFeedback,evaluateCapture};
if(typeof module!=='undefined'&&module.exports){module.exports=root.FleshEngine;}
})(globalThis);
