(function(){'use strict';
const R=FleshData.roles,E=FleshEngine;
const $=id=>document.getElementById(id); const app=$('app');
const G={act:0,role:'',phase:'',ctx:{},summaries:{},act1Visits:{},ledger:E.newLedger(),choiceIndex:0,factoryDockOpen:null,selectedMotion:'分拣',noticeTimer:0,viewToken:0,comparisons:[],visitedFactorySouth:false,visitedFactoryNorth:false,feedbackChoice:null,chatDraftAct:null,chatDraftRole:null};
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
function hideAll(){['intro','roleOverlay','chatScreen','factoryScreen','sheetOverlay','endingScreen','helpOverlay','archive'].forEach(x=>$(x).classList.add('hidden'));}
function show(id){$(id).classList.remove('hidden');}
function text(id,v){$(id).textContent=v;}
function notify(message){let el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(G.noticeTimer);G.noticeTimer=setTimeout(()=>el.classList.remove('show'),2500);}
function resetAll(){FleshDirector.restart();Flesh3D?.setScene('city');G.act=0;G.role='';G.phase='';G.ctx={};G.summaries={};G.act1Visits={};G.ledger=E.newLedger();G.factoryV7=null;G.factoryDockOpen=null;G.feedbackChoice=null;G.visitedFactorySouth=false;G.visitedFactoryNorth=false;G.choiceIndex=0;G.chatDraftAct=null;G.chatDraftRole=null;G.viewToken++;document.body.dataset.scene='city'; $('machine').classList.remove('hidden');$('stageHotspot').classList.add('hidden');$('playerAvatar').classList.remove('walking');hideAll();show('intro');setProgress(0);setScene('city');}
function setProgress(n){const els=document.querySelectorAll('.progress-track i');els.forEach((e,i)=>e.classList.toggle('completed',i<n));text('progressLabel',n===0?'互动思想实验':`第 ${n} 幕 / 3`);}
function setScene(scene){Flesh3D?.setScene(scene);document.body.dataset.scene=scene;const meta={city:['18:42 · 北京','城市街口','先说说你的情况。'],rural:['09:18 · 社区','城乡问诊点','AI有没有记全你说的症状？'],factory:['16:26 · 数据工厂','动作采集区','同一份动作，可以再用几次？']}[scene];text('sceneTime',meta[0]);text('sceneLocation',meta[1]);text('worldCaption',meta[2]);$('machine').classList.toggle('hidden',scene==='factory');}
function chooseRoles(act){FleshDirector.clear();hideAll();G.act=act;setProgress(act);const titles={1:['城市夜晚','今晚，你是谁？','选择一个人，替他完成今晚的问诊。'],2:['社区问诊','机器听对了吗？','你说出症状后，核对AI记录是否准确。'],3:['数据工厂','谁在劳动，谁在获利？','同一份数据，换个位置看。']};const t=titles[act];text('roleEyebrow',`CHAPTER 0${act} · ${t[0]}`);text('roleHeading',t[1]);text('roleIntro',t[2]);const ids=act===1?['zhou','lin']:act===2?['zhao','xu']:['amara','ethan'];$('roleOptions').innerHTML=ids.map(id=>{const a=R[id];if(a)return `<button type="button" class="role-card" data-role="${id}"><span class="role-badge">${esc(a.short)}</span><span class="role-copy"><strong>${esc(a.name)}</strong><small>${esc(a.job)} · ${esc(a.subtitle)}</small><span>${esc(a.intro)}</span></span><b aria-hidden="true">↗</b></button>`;return id==='amara'?`<button class="role-card" type="button" data-role="amara"><span class="role-badge">阿</span><span class="role-copy"><strong>阿玛拉</strong><small>肯尼亚 · 动作数据采集员</small><span>每份工资都得用身体做出来。你可以休息，但今天的订单不会等你。</span></span><b>↗</b></button>`:`<button class="role-card" type="button" data-role="ethan"><span class="role-badge">伊</span><span class="role-copy"><strong>伊森</strong><small>美国 · 模型平台主管</small><span>你不需要重复动作，就能调用很多次。点击样本前，你会先查它是谁录下来的。</span></span><b>↗</b></button>`}).join('');
 $('roleOptions').querySelectorAll('[data-role]').forEach(btn=>btn.addEventListener('click',()=>selectRole(btn.dataset.role)));show('roleOverlay');}
function selectRole(id){Flesh3D?.setRole(id);G.role=id;G.ctx={};G.phase='';G.chatDraftAct=null;G.chatDraftRole=null;hideAll();if(G.act===3){startFactory();return;}setScene(G.act===1?'city':'rural');show('world');$('playerAvatar').classList.remove('walking');text('avatarName',R[id].name);$('playerAvatar').style.left=G.act===1?'17%':'14%';$('npcAvatar').style.left='72%';$('stageHotspot').classList.remove('hidden');text('sceneTitle', '');$('sceneTitle').innerHTML=`<span>${G.act===1?'今晚，想问清身体情况':'这次，AI记录准确吗'}</span><small>${esc(R[id].intro)}</small>`;text('worldCaption','点击亮起的问诊机，开始问问自己的事。');if(!Flesh3D?.app.ok)notify('点一下亮起的问诊机，就能开始。');}
function goMachine(){if(!G.role||G.act===3||!$('chatScreen').classList.contains('hidden'))return;const token=++G.viewToken;$('stageHotspot').classList.add('hidden');$('playerAvatar').classList.add('walking');$('playerAvatar').style.left='46%';$('worldCaption').textContent='正在走向问诊机。';const arrive=()=>{if(token!==G.viewToken)return;$('playerAvatar').classList.remove('walking');if(G.chatDraftAct===G.act&&G.chatDraftRole===G.role&&$('chatMessages').children.length){show('chatScreen');$('stageHotspot').classList.add('hidden');}else startChat();};if(!Flesh3D?.approach(arrive))setTimeout(arrive,650);}
function startChat(){G.chatDraftAct=G.act;G.chatDraftRole=G.role;$('stageHotspot').classList.add('hidden');$('toast').classList.remove('show');show('chatScreen');const role=R[G.role];text('chatPersonName',role.name);text('chatAvatar',role.short);text('chatPersonContext',`${role.job} · 以本人身份体验`);$('chatMessages').innerHTML='';$('freeInput').value='';G.ctx={allowRecords:false,additional:false,redFlag:'',duration:'',record:'',contact:'',corrected:false};if(G.act===1){G.phase='ask';ai('你好。这里是虚构平台的AI问诊窗口，可以整理症状并申请线上人工复核，不是医院挂号。你今天哪里不舒服？');choices('先说你的情况',role.opening.map((s,i)=>({label:s,value:String(i)})));}else{G.phase='ruralAsk';ai('您好。别着急，您先慢慢说，今天是哪里不舒服？');choices('你想怎么和它说？',role.opening.map((s,i)=>({label:s,value:String(i)})));}}
function appendMessage(who,msg){const el=document.createElement('article');el.className='msg '+(who==='user'?'from-user':'from-ai');const bubble=document.createElement('div');bubble.className='bubble';bubble.textContent=msg;el.appendChild(bubble);$('chatMessages').appendChild(el);const box=$('chatMessages');if(box.scrollHeight-box.scrollTop-box.clientHeight<box.clientHeight+130)box.scrollTop=box.scrollHeight;FleshAudio.ping();}
const ai=msg=>appendMessage('ai',msg),me=msg=>appendMessage('user',msg);
function choices(task,list,free=true){text('chatTask',task);$('chatOptions').innerHTML='';list.forEach((v,i)=>{const b=document.createElement('button');b.className='reply-chip';b.type='button';b.innerHTML=`<span>${esc(v.label)}</span><b>${i+1}</b>`;b.onclick=()=>handleAnswer(v.value,v.label);$('chatOptions').appendChild(b);});$('writeLine').classList.toggle('hidden',!free);text('chatHint',free?'也可以自己打字。遇到没准备的问法，我会请你换个说法。':'需要时可以返回街道或重来。');}
function handleAnswer(value,label){me(label);$('freeInput').value='';$('chatOptions').innerHTML='';$('writeLine').classList.add('hidden');const token=G.viewToken;setTimeout(()=>{if(token!==G.viewToken)return;G.act===1?urbanAnswer(value):ruralAnswer(value);},180);}
function interpretFree(s){let v=s.trim();if(!v)return;const p=G.phase;if(p==='ask'||p==='ruralAsk'){if(/病历|记录|检查/.test(v))return handleAnswer('1',v);if(/医院|医生|上工|上班|请假|费用|车|交通/.test(v))return handleAnswer('2',v);if(/累|头晕|胸|睡|难受|不舒服/.test(v))return handleAnswer('0',v);notify('这个试玩版还不能回答任意话题，试试准备好的问句。');return;}if(p==='timing'){if(/不确定|不清楚|说不/.test(v))return handleAnswer('unsure',v);return handleAnswer(/几天|两周|很久|一直|反复/.test(v)?'ongoing':'today',v);}if(p==='danger'){return handleAnswer(E.parseRedFlag(v),v);}if(p==='record'){if(/同意|可以|授权|读取|查看/.test(v))return handleAnswer('allow',v);if(/拒绝|不用|不想|不要|先不/.test(v))return handleAnswer('deny',v);notify('这一步请先选择要不要读取旧记录。');return;}if(p==='ruralDescribe'){notify('这一步请先选一条实际说出的原话，便于核对机器有没有漏记。');return;}if(p==='ruralCorrect'){return handleAnswer(/没|漏|不对|错|胸|新出现/.test(v)?'correct':'leave',v);}if(p==='ruralRecords'){return handleAnswer(/没有|拒绝|不想|找不到|暂时不/.test(v)?'missing':/有|照片|同意|查看/.test(v)?'photo':'missing',v);}if(p==='ruralContact'){return handleAnswer(/医院|医生|社区|村医/.test(v)?'clinic':/家属|孩子|家人/.test(v)?'family':'save',v);}notify('这句话我还没准备好完整回答，请试试下面已准备好的说法。');if(G.act===1)resumeUrban();else if(G.phase==='ruralResult')choices('这一段故事暂时到这里',[{label:'看看我说的和AI记下的有什么不同。',value:'summary'},{label:'换另一位老人，看看会怎样。',value:'switch'},{label:'继续下一段生活。',value:'next'}],false);}
function urbanAnswer(v){const c=G.ctx,r=R[G.role];switch(G.phase){
 case 'ask': c.initial=v;c.initialText=String($('chatMessages').lastElementChild?.textContent||'');ai(r.openingReplies?.[Number(v)]||r.onOpen);G.phase='timing';choices('你会怎么回答？',[{label:r.timings[0],value:'today'},{label:r.timings[1],value:'ongoing'},{label:r.timings[2],value:'unsure'}]);break;
 case 'timing':c.duration=v;ai('等等，我想问清一个要紧的事：有没有胸口疼、喘不过气，或者差点晕过去？如果有，这比查旧档案更重要。');G.phase='danger';choices('这件事要如实告诉它',[{label:'暂时没有这些情况。',value:'no'},{label:'有胸口不舒服，或差点晕倒。',value:'yes'},{label:'我不太确定。',value:'unknown'}]);break;
 case 'danger':c.redFlag=v;if(v==='yes'){ai('这类表现需要认真对待。如果现在持续胸痛、呼吸困难或接近晕厥，请立即寻求紧急医疗帮助。这里不能替你判断，先不要等旧记录。');finalizeUrban();return;}else ai(v==='unknown'?'谢谢你告诉我。既然不确定，我不会把它当作“没有”。我们继续核对已有信息，也建议及时联系专业医生。':'明白。不过没有这些表现，也不能只凭几句话就确定原因。我们再看看有没有可以参考的旧记录。');G.phase='record';choices('要不要让它参考以前的记录？',[{label:r.history?'可以，看看我之前的体检记录。':'可以，不过我不确定能查到什么。',value:'allow'},{label:'先不用，我想只说这次的情况。',value:'deny'}]);break;
 case 'record':c.allowRecords=v==='allow';finalizeUrban();break;
 case 'urbanResult':if(v==='summary'){showSummary();return;}if(v==='compare'){showUrbanContrast(false);return;}if(v==='doctor'){showDoctorNote();return;}if(v==='next'){G.summaries.act1=G.summaries.act1||{role:G.role,assessment:E.assessConversation(r,c)};showBridge(2);return;}break;
 }}
function finalizeUrban(){
 const c=G.ctx,r=R[G.role],o=E.assessConversation(r,c);
 G.summaries.act1={role:G.role,initial:c.initial,initialText:c.initialText,duration:c.duration,redFlag:c.redFlag,allowRecords:c.allowRecords,assessment:o};
 G.act1Visits[G.role]=JSON.parse(JSON.stringify(G.summaries.act1));
 if(c.redFlag!=='yes')ai(o.recordsAvailable?'我查到了以前的记录，但这次的症状仍然需要单独了解。':'我这里没有可用的连续旧记录。档案少不代表你的不舒服不重要。');
 ai(o.action+'。');
 if(c.redFlag!=='yes')ai('本平台的线上人工复核申请状态是：'+o.serviceRoute+'。');
 G.phase='urbanResult';resumeUrban();showUrbanContrast(true);
}
function showCorrectionEditor(){
 const c=G.ctx,holder=$('chatOptions');holder.innerHTML='';$('writeLine').classList.add('hidden');
 text('chatTask','从下面的片段中找出漏记的原话，补进摘要。');
 const div=document.createElement('div');div.className='record-editor';
 div.innerHTML=`<span class="record-editor-label">原话</span><p>${esc(c.original)}</p><span class="record-editor-label">AI摘要</span><p>${esc(c.bad)}</p><div class="record-editor-pieces" id="recordPieces"></div><p class="record-editor-result" id="recordResult" role="status">请选择需要补回的一段原话。</p>`;
 holder.append(div);
 const distractors=['这次没有不舒服','所有症状都消失了'];const options=[c.omitted,...distractors];
 options.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.className='record-piece';b.textContent=s;b.onclick=()=>{
  if(s!==c.omitted){text('recordResult','这句话不在原话中。请只补回当事人实际说过的内容。');return;}
  text('recordResult',`核对成功，补回“${s}”。这份模拟记录得到修订。`);G.ctx.correctionAttempts=(G.ctx.correctionAttempts||0)+1;
  handleAnswer('correct',`我核对后补回了“${s}”。`);
 };$('recordPieces').append(b);});
}
function ruralAnswer(v){const c=G.ctx,r=R[G.role];switch(G.phase){
 case 'ruralAsk':c.initial=v;c.openingText=String($('chatMessages').lastElementChild?.textContent||'');ai(r.openingReplies?.[Number(v)]||'好，你继续说。');ai('你把这次的不舒服说具体些。我会先写下原话，你再检查有没有漏掉。');G.phase='ruralDescribe';choices('你想怎么描述症状？',r.symptomOptions.map((item,i)=>({label:item.full,value:String(i)})),false);break;
 case 'ruralDescribe':{const item=r.symptomOptions[Number(v)]||r.symptomOptions[0];c.original=item.full;c.bad=item.bad;c.omitted=item.missing;c.good=item.full;ai(`我记成了：“${c.bad}”`);ai('请对照你刚才说的内容：我有没有漏记？');G.phase='ruralCorrect';choices('AI记录是否准确？',[{label:'逐句核对，自己补回漏记的内容',value:'review'},{label:'暂时不修改，保留漏记的摘要。',value:'leave'}],false);break;}
 case 'ruralCorrect':if(v==='review'){showCorrectionEditor();return;}c.corrected=v==='correct';ai(c.corrected?`已补上漏记的“${c.omitted}”。现在记录是：“${c.original}”`:`收到。当前记录仍缺少“${c.omitted}”，我会标为“未核对完整”，请不要直接用它判断身体情况。`);ai(c.corrected?'这份问诊记录已经更新。你手边还有以前的检查资料吗？':'记录里还缺少你刚才提到的内容。你手边还有以前的检查资料吗？');G.phase='ruralRecords';choices('你手边有没有资料？',[{label:r.history?'我有以前的病历，可以给你参考。':'我手机里存着一张以前的检查照片。',value:'photo'},{label:'没有了，我暂时找不到。',value:'missing'},{label:'我暂时不想上传。',value:'deny'}]);break;
 case 'ruralRecords':c.record=v;ai(v==='photo'?'好的，旧检查可以作参考，但这次新出现的症状也要记录。':v==='deny'?'好的，你暂时不上传旧记录。我会继续保存你刚才说的症状。':'没有找到旧记录也可以继续问诊，不能据此推断病情。');const t=E.assessRural(r,c);ai(t.advice);G.phase='ruralContact';choices('接下来你想怎么办？',[{label:'帮我整理一下，去找附近的医生。',value:'clinic'},{label:'我想先告诉家人，让人陪我问问。',value:'family'},{label:'先把这段话保存下来。',value:'save'}],false);break;
 case 'ruralContact':c.contact=v;const res=E.assessRural(r,c);G.summaries.act2={role:G.role,openingText:c.openingText,original:c.original,bad:c.bad,omitted:c.omitted,corrected:c.corrected,record:c.record,contact:c.contact,assessment:res};ai(res.reach+'。你说过的内容已经整理好了，但我没有替你完成真正的预约或诊断。');G.phase='ruralResult';resumeRural();showRuralContrast(true);break;
 case 'ruralResult':if(v==='contrast'){showRuralContrast(false);return;}if(v==='summary'){showRuralSummary();return;}if(v==='switch'){chooseRoles(2);return;}if(v==='next'){showBridge(3);return;}break;
 }}
function showDramaticSheet(type,kicker,title,body,buttons,auto=true){
 if(!auto){showSheet(kicker,title,body,buttons);return;}
 const token=G.viewToken;
 if(G.act!==3)hide('chatScreen');
 const detail=type==='restored'?{headline:'漏记内容已补入记录',line:`AI原先漏掉了“${G.ctx.omitted||'部分原话'}”，现在已写入问诊摘要。`}:type==='erasure'?{headline:'AI摘要仍有遗漏',line:`当前记录仍缺少“${G.ctx.omitted||'部分原话'}”，需要向医生说明完整原话。`}:{};
 FleshDirector.burst(type,detail);
 setTimeout(()=>{if(token!==G.viewToken)return;showSheet(kicker,title,body,buttons);},document.body.classList.contains('reduced-motion')?450:2500);
}
function showSheet(kicker,title,body,buttons){FleshDirector.clear();$('sheetOverlay').dataset.outcome='neutral';G.sheetClose=()=>{if(G.act===1&&G.phase==='urbanResult'){show('chatScreen');resumeUrban();}else if(G.act===2&&G.phase==='ruralResult'){show('chatScreen');resumeRural();}else if(G.act===3){renderFactory();}};text('sheetKicker',kicker);text('sheetTitle',title);$('sheetBody').innerHTML=body;$('sheetActions').innerHTML='';for(const [caption,callback] of buttons){const b=document.createElement('button');b.type='button';b.className='btn '+(caption.includes('继续')?'primary':'secondary');b.textContent=caption;b.onclick=()=>{hide('sheetOverlay');callback();};$('sheetActions').appendChild(b);}show('sheetOverlay');$('sheet').scrollTop=0;$('closeSheet').focus({preventScroll:true});}
function hide(id){$(id).classList.add('hidden');}
function closeSheetAndResume(){if($('sheetOverlay').classList.contains('hidden'))return;hide('sheetOverlay');const callback=G.sheetClose;G.sheetClose=null;if(callback)callback();else if(G.act===1){show('chatScreen');resumeUrban();}else if(G.act===2){show('chatScreen');resumeRural();}else if(G.act===3)renderFactory();const target=!$('chatScreen').classList.contains('hidden')?$('chatOptions .reply-chip'):$('stageHotspot');target?.focus?.({preventScroll:true});}
function showSummary(){const a=E.assessConversation(R[G.role],G.ctx);const role=R[G.role];const mapped=G.ctx.duration==='unsure'?'起始时间尚不明确':G.ctx.duration==='today'?'近期或今天较明显':'已经持续或反复一段时间';showSheet('你的问诊记录','对照你说过的话与AI记录。',`<div class="fact-lines"><p><b>你说过</b><span>${esc(G.ctx.initialText||role.opening[Number(G.ctx.initial)]||role.opening[0])}</span></p><p><b>它记下</b><span>${esc(mapped)}；${G.ctx.redFlag==='yes'?'你说过警讯表现':G.ctx.redFlag==='unknown'?'伴随情况尚未确认':'暂未报告明显警讯'}</span></p><p><b>它不知道</b><span>${esc(a.missing.join('、')||'具体病因仍需专业判断')}</span></p><p><b>目前建议</b><span>${esc(a.action)}</span></p></div><p class="quiet">这里不对身体打分。旧资料可能让回答更具体，但不会自动让身体变得更健康。</p>`,[['返回聊天',()=>{show('chatScreen');resumeUrban();}],['继续下一幕',()=>showBridge(2)]]);}
function resumeRural(){choices('问诊结束。接下来做什么？',[{label:'重新查看漏记记录和修改结果。',value:'contrast'},{label:'对照我的原话与AI摘要。',value:'summary'},{label:'试试另一位老人的问诊。',value:'switch'},{label:'进入数据工厂。',value:'next'}],false);}
/** Report is the reward for finishing ONE interview, not a menu the player must discover. */
function showUrbanContrast(auto=false){
 const chosen=G.summaries.act1; if(!chosen)return;
 const role=R[chosen.role],other=R[chosen.role==='zhou'?'lin':'zhou'];
 const observed=chosen.assessment,paired=E.compareSameSymptoms(role,other,chosen,observed);
 const urgent=G.ctx.redFlag==='yes',unknown=G.ctx.redFlag==='unknown';
 const blocked=!urgent&&!unknown&&!observed.recordsAvailable;
 const shot=urgent?'urgent':unknown?'unclear':blocked?'gate':'access';
 if(auto){FleshDirector.collected(1);const token=G.viewToken;hide('chatScreen');FleshDirector.burst(shot);setTimeout(()=>{if(token===G.viewToken)showUrbanContrast(false);},document.body.classList.contains('reduced-motion')?380:2370);return;}
 const route=x=>unknown?'还需要核实':urgent?'请先就医':x.recordsAvailable?'可以申请复核':'需补充旧病历';
 const status=x=>urgent?'care':unknown?'unclear':x.recordsAvailable?'pass':'gate';
 const resultText=urgent?'先联系医生，别等资料。':unknown?'有些情况还没问清。':blocked?'你的申请卡在了旧记录上。':'你的复核申请入口已经开放。';
 const livedText=urgent?'有警讯，应该优先寻求医疗帮助。':unknown?'伴随情况未核实，先求助，不能武断分流。':paired.gateIsProblem?'两人都同意读取旧病历，但系统只查到其中一人的记录，因此复核申请状态不同。':'这次两人的复核申请状态相同，不能说其中一人被额外阻拦。';
 const portrait=(who,x,lived)=>`<article class="receipt-person ${status(x)}" aria-label="${esc(who.name)}：${esc(route(x))}">
 <div class="receipt-identity"><span class="receipt-monogram" aria-hidden="true">${esc(who.name.slice(0,1))}</span><span><strong>${esc(who.name)}</strong><small>${lived?'本次实际记录':'另一角色 · 模拟结果'}</small></span></div>
 <div class="receipt-state">${esc(route(x))}</div><div class="receipt-reason">${x.recordsAvailable?'本次授权且可检索旧记录':'本次无法使用旧记录'}</div>
 </article>`;
 const body=`<div class="receipt" aria-label="本次问诊回执">
 <div class="receipt-current"><span class="receipt-overline">刚才的结果</span><p>${esc(resultText)}</p><div class="receipt-doctor">${esc(observed.action)}。</div></div>
 <section class="receipt-comparison" aria-label="两名人物的复核申请结果对照">
 <div class="receipt-rowtitle"><h3>两人的复核申请</h3><span>另一位人物是模拟对照，不是实际问诊</span></div>
 <div class="receipt-paths">${portrait(role,observed,true)}${portrait(other,paired.second,false)}</div>
 <div class="receipt-insight"><span aria-hidden="true" class="receipt-rule"></span><p>${esc(livedText)}</p></div>
 </section>
 <section class="receipt-next" id="act1HumanCost"><h3>${urgent?'先联系专业医生':unknown?'先核实身体情况':'现在，你想怎么做？'}</h3><div class="cost-options"><button type="button" id="humanCostA">${urgent?'保存症状记录':unknown?'整理已知情况':role.id==='zhou'?'去补旧病历':'提供旧记录'}</button><button type="button" id="humanCostB">${urgent?'尽快寻求医疗帮助':unknown?'请专业医生进一步核实':role.id==='zhou'?'先找医生问问':'问医生这次的新症状'}</button></div><p class="cost-result" id="act1CostResult" role="status"></p></section>
 <section class="reflex-loop"><div class="loop-head"><b>反身性实验 · 下一次你会怎么做</b><span>设备读数是虚构的自我管理提示，不是医学判断</span></div><div class="loop-scores"><span>设备自评 <b>58 / 100</b></span><span>本人感受 <b>仍然疲惫</b></span></div><p>你原本只想弄清身体情况。看见一个分数后，会不会为了提高它而改变今天的安排？</p><div class="loop-choices"><button type="button" data-loop="score">按分数改变作息</button><button type="button" data-loop="body">记录真实感受并求助</button><button type="button" data-loop="ignore">暂时不调整</button></div><div id="loopResult" class="loop-result" role="status">选择一项，看看下一轮出现什么数据和生活代价。</div></section>
 <details class="receipt-details"><summary>看看规则是怎么影响结果的</summary><p>这是一组虚构情境。只固定持续时间、警讯回答和授权意愿；两位人物最初说的症状不同，因此这里只能比较线上服务分流，不能比较身体健康程度。</p><div class="receipt-metrics"><span>${esc(role.name)}资料 ${observed.clarity}/100</span><span>${esc(other.name)}资料 ${paired.second.clarity}/100</span></div><p>这些数字只表示资料完整程度，不是疾病评分，也不代表真实医院的算法。</p><div class="receipt-whatif"><p>如果不把旧病历当作申请门槛呢？</p><button id="auditReplayButton" type="button">试试另一种规则</button><div class="audit-replay-result hidden" id="auditReplayResult">${urgent?'有警讯，两人都应优先获得医疗帮助。':'两个人都可以提出复核申请；信息仍需医生核实。'}</div></div></details>
 </div>`;
 FleshDirector.collected(1);
 showSheet('陈俊良问诊室 · 回执','这次问诊的结果',body,[['回看对话',()=>{show('chatScreen');resumeUrban();}],['换位体验',()=>chooseRoles(1)],['继续下一幕',()=>showBridge(2)]]);
 $('sheetOverlay').dataset.outcome=shot;
 const result=$('act1CostResult');
 const setCost=choice=>{const line=urgent?(choice==='help'?'如有持续胸痛、呼吸困难、晕厥等，请立即求助急诊。':'已保存症状，不能因此推迟紧急求助。'):unknown?(choice==='help'?'你决定及时联系专业医生，进一步核实伴随情况。':'你保存了已知信息，未确认的情况仍需要核实。'):choice==='records'?(role.id==='zhou'?'去补病历，可能就得少上一天工。':'你把旧病历交上去了，但这次的不舒服仍要重新问。'):(role.id==='zhou'?'你记下症状，打算去找医生。误工和路费仍要自己承担。':'你决定向医生讲清楚这次的新情况。');chosen.afterChoice=choice;chosen.afterMessage=line;chosen.patientNote=choice==='help'?`我是${role.name}。${chosen.initialText||role.opening[0]} 我想请专业医生核实这次症状。`:'已选择整理旧记录，是否提交申请仍需本人确认。';result.textContent=line;result.classList.add('shown');$('humanCostA').setAttribute('aria-pressed',String(choice==='records'));$('humanCostB').setAttribute('aria-pressed',String(choice==='help'));};
 $('humanCostA').onclick=()=>setCost('records');$('humanCostB').onclick=()=>setCost('help');
 const setLoop=(choice)=>{const f=E.experienceFeedback(role,choice);chosen.feedbackChoice=choice;chosen.feedback=f;const box=$('loopResult');box.innerHTML=`<b>第二轮设备自评 ${f.deviceScore}/100 · 本人仍然疲惫</b><p>${esc(f.cost)} ${esc(f.change)}</p><small>你选择了“${esc(f.title)}”。数字变化来自教学设定。设备读数与身体感受未必同步，不能用于诊断。</small>`;box.classList.add('active');$('sheetOverlay').querySelectorAll('[data-loop]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.loop===choice)));};
 $('sheetOverlay').querySelectorAll('[data-loop]').forEach(b=>b.onclick=()=>setLoop(b.dataset.loop));if(chosen.feedbackChoice)setLoop(chosen.feedbackChoice);
 if(chosen.afterChoice){result.textContent=chosen.afterMessage;result.classList.add('shown');$('humanCostA').setAttribute('aria-pressed',String(chosen.afterChoice==='records'));$('humanCostB').setAttribute('aria-pressed',String(chosen.afterChoice==='help'));}
 $('auditReplayButton').onclick=()=>{$('auditReplayResult').classList.remove('hidden');$('auditReplayButton').disabled=true;};
 chosen.contrastViewed=true;
}
function showCompare(){showUrbanContrast(false);}
function showDoctorNote(){const r=R[G.role];const a=E.assessConversation(r,G.ctx);const line=`我是${r.name}。${G.ctx.initialText||r.opening[0]}；目前感觉${G.ctx.duration==='ongoing'?'已持续或反复一段时间':G.ctx.duration==='unsure'?'开始时间不太确定':'近期比较明显'}。${G.ctx.redFlag==='yes'?'有需要重视的伴随症状。':''}我希望由专业医生进一步了解。`;showSheet('给专业医生看的摘要','把你刚才说的话带出去。',`<div class="quote-block">${esc(line)}</div><p class="quiet">这只是一份沟通记录。游戏不能预约医生，也不能替你诊断。</p>`,[['复制这段话',()=>{navigator.clipboard?.writeText(line).then(()=>notify('已复制到剪贴板')).catch(()=>notify('浏览器未允许复制'));resumeUrban();}],['返回聊天',()=>{show('chatScreen');resumeUrban();}],['继续下一幕',()=>showBridge(2)]]);}
function resumeUrban(){choices('问诊结束了，还想看看什么？',[{label:'重新打开双人物对照报告。',value:'compare'},{label:'看看我的问诊记录。',value:'summary'},{label:'准备一段话给真实医生。',value:'doctor'},{label:'继续下一幕。',value:'next'}],false);}
function showRuralSummary(){const r=R[G.role],res=E.assessRural(r,G.ctx);showSheet('原话与记录','看看AI最初漏记了什么。',`<div class="fact-lines"><p><b>你原本说</b><span>${esc(G.ctx.original||'')}</span></p><p><b>AI一开始记下</b><span>${esc(G.ctx.bad||'')}</span></p><p><b>现在保留</b><span>${esc(res.transcript)}</span></p><p><b>实际能做到</b><span>${esc(res.reach)}</span></p></div><p class="quiet">这里的转写错误是虚构教学情节，不意味着某种口音必然无法被现实系统识别。</p>`,[['返回聊天',()=>{show('chatScreen');resumeRural();}],['继续下一幕',()=>showBridge(3)]]);}
function showRuralContrast(auto=false){
 const r=R[G.role],other=R[G.role==='zhao'?'xu':'zhao'],res=E.assessRural(r,G.ctx);
 const restored=Boolean(G.ctx.corrected),missing=G.ctx.omitted||'部分信息';
 const headline=restored?`AI漏记的“${missing}”已补上`:`AI摘要还缺少“${missing}”`;
 const body=`<div class="rural-proof" aria-label="本次问诊记录对照">
 <div class="rural-proof-line"><span>你刚才说</span><p>“${esc(G.ctx.original||'')}”</p></div>
 <div class="rural-proof-line"><span>AI最初记成</span><p>“${esc(G.ctx.bad||'')}”</p></div>
 <div class="rural-proof-missing"><span>漏记的是</span><strong>“${esc(missing)}”</strong></div>
 <div class="rural-proof-outcome ${restored?'is-fixed':'is-missing'}"><span>${restored?'你要求补充后':'你暂时没有修改'}</span><p>${restored?`AI现在已记录完整原话：“${esc(res.transcript)}”`:`记录仍是：“${esc(res.transcript)}”。就医时需要再说出完整原话。`}</p></div>
 </div>
 <div class="rural-next-result"><strong>接下来</strong><p>${esc(res.reach)}。</p></div>
 <details class="rural-proof-details"><summary>换另一位老人，可能发生什么？</summary><p>${esc(other.name)}也有一段模拟经历：他说“${esc(other.symptomOptions[0].full)}”，AI可能漏记“${esc(other.symptomOptions[0].missing)}”。这是另一人的剧情推演，不是实际问诊记录。</p><p>这段游戏演示的是记录可能遗漏重要信息，不代表城乡居民存在天生的表达能力差异。</p></details>`;
 FleshDirector.collected(2);
 showDramaticSheet(restored?'restored':'erasure','02 / 问诊结束',headline,body,[['回到聊天',()=>{show('chatScreen');resumeRural();}],['体验另一位老人',()=>chooseRoles(2)],['进入数据工厂',()=>showBridge(3)]],auto);
 G.summaries.act2.contrastViewed=true;
}

function showBridge(next){FleshDirector.clear();hide('chatScreen');
 const first=G.summaries.act1,second=G.summaries.act2;
 const wasBlocked=first&&first.assessment?.serviceRoute?.startsWith('需先补');
 const intro=next===2?(first?.redFlag==='yes'?'你报告了警讯，重要的是先获得专业帮助。':first?.redFlag==='unknown'?'还有些伴随症状没有确认，不能按缺档案直接判断。':wasBlocked?'本平台要求你先补旧资料。下一站看看另一种记录会漏掉什么。':'本平台允许你提出复核申请，但并不是所有人的资料都容易被系统检索。'):(second?.corrected?`你已把“${second.omitted}”补进问诊记录。下一幕看看身体动作被怎样使用。`:`AI记录仍缺少“${second?.omitted||'部分信息'}”。下一幕看看身体动作被怎样使用。`);
 const title=next===2?'如果AI没有完整记下你的症状？':'动作录下来后，谁还能继续使用？';
 showSheet('故事继续',title,`<div class="v10-bridge"><strong>${esc(intro)}</strong><p>${next===2?'下一站：另一位普通人的问诊。':'下一站：数据采集工厂。'}</p></div>`,[[next===2?'去社区问诊点':'走进数据工厂',()=>chooseRoles(next)]]);
 G.sheetClose=()=>{show('chatScreen');next===2?resumeUrban():resumeRural();};
}

// ACT III · Workers inhabit time and exertion; platforms inhabit repeatable access.
const FACTORY_TASKS=['分拣','抬臂','行走','弯腰'];
function factoryState(){return G.factoryV7 || (G.factoryV7={stage:'contract',contractRead:false,chosen:'',workStep:0,fatigue:0,secondsWorked:0,rests:0,failedCaptures:0,lastGrade:'',chosenSample:0,inspected:new Set(),lastSignal:'',callsByMotion:new Set(),showTrace:false,aim:'训练需要两种不同动作',activeTab:'work'});}
function factoryButton(label,callback,primary=false,disabled=false){let b=document.createElement('button');b.className='f-btn'+(primary?' f-primary':'');b.type='button';b.textContent=label;b.disabled=!!disabled;b.onclick=callback;return b;}
function factoryNote(title,body,tone=''){let b=document.createElement('div');b.className='fv7-note '+tone;b.innerHTML=`<strong>${esc(title)}</strong><p>${esc(body)}</p>`;return b;}
function setFactoryDock(open){
 G.factoryDockOpen=Boolean(open);
 $('factoryDock').dataset.open=String(G.factoryDockOpen);
 $('factoryToggle').setAttribute('aria-expanded',String(G.factoryDockOpen));
 $('factoryControls').setAttribute('aria-hidden',String(!G.factoryDockOpen));
 $('factoryToggle').innerHTML=G.factoryDockOpen?'收起操作 <span aria-hidden="true">▾</span>':'展开操作 <span aria-hidden="true">▴</span>';
}
function startFactory(){
 if(G.factoryDockOpen===null)setFactoryDock(window.matchMedia('(min-width: 681px)').matches);
 setProgress(3);setScene('factory');hideAll();show('factoryScreen');$('stageHotspot').classList.add('hidden');G.phase='factory';const south=G.role==='amara',w=G.ledger,st=factoryState();
 G.visitedFactorySouth ||=south; G.visitedFactoryNorth ||=!south;
 if(!south&&!w.assets.length){E.seedLedger(w);st.lastSignal='这里先显示两份有来源的历史样本。你可以调用，也可以切去阿玛拉现场完成新采集。';}
 if(!south)st.stage='platform'; else if(w.assets.length>=10)st.stage='workComplete'; else if(w.assets.length){st.stage=st.contractRead?'work':'contract';if(!st.contractRead)st.lastSignal='前两份是平台历史档案。你仍可亲自选择新采集的合同，并从下一份样本开始工作。';} else if(!st.contractRead)st.stage='contract';
 text('factoryRole',south?'阿玛拉 · 采集工位 / 虚构的肯尼亚外包工作室':'伊森 · 平台控制室 / 虚构的美国研发机构');
 text('factoryHeading',south?'完成动作，才能领工资。':'你能让数据再赚一次。');
 text('factoryStory',south?'先做完，才能领到钱。':'数据已经到手。先看看许可。');
 Flesh3D?.setFactoryDetail?.({role:G.role,stage:st.stage,fatigue:st.fatigue,count:w.assets.length});renderFactory();
}
function factorySwitch(role){G.role=role;Flesh3D?.setRole(role);startFactory();}
function stageWorkMotion(m){G.selectedMotion=m;const st=factoryState();st.stage='work';st.workStep=0;renderFactory();}
function updateFactorySceneAction(){
 const b=$('factorySceneAction');if(!b)return;const st=factoryState();const active=G.role==='amara'&&st.stage==='work'&&!st.busy&&G.ledger.assets.length<10;
 b.classList.toggle('hidden',!active);if(!active)return;
 const labels=['点击传感器 · 校准姿势','点击工位货箱 · 执行动作','点击采集台 · 核验上传'];text('factorySceneActionLabel',labels[st.workStep]);
 const xyz=st.workStep===0?[-4.1,1.3,.7]:[-2.6,1.45,-1.25];
 const pos=Flesh3D?.projectWorldPoint?.(...xyz);
 if(pos){b.style.left=`${Math.max(80,Math.min(window.innerWidth-170,pos.x))}px`;b.style.top=`${Math.max(170,Math.min(window.innerHeight-155,pos.y))}px`;b.style.opacity='1';}
 else{b.style.left='36%';b.style.top='53%';b.style.opacity='1';}
}
function actionBeat(){
 const st=factoryState();if(st.busy)return;
 if(st.secondsWorked>=600){st.stage='workComplete';st.lastSignal='本次虚构班次时间已用完，采集工作停止。';renderFactory();return;}if(st.fatigue>=85){st.lastSignal='身体很累，先停下来缓一缓。';renderFactory();return;}
 const step=st.workStep,m=G.selectedMotion;
 if(step===0){st.workStep=1;st.secondsWorked+=14;st.fatigue=Math.min(100,st.fatigue+3);st.lastSignal='你把追踪装置固定好了。接下来要把整段动作做完。';Flesh3D?.action('准备');renderFactory();return;}
 if(step===1){st.busy=true;st.lastSignal='追踪设备正在录制你的身体动作……';Flesh3D?.action(m);renderFactory();const marker=G.viewToken;
  setTimeout(()=>{if(marker!==G.viewToken||!G.factoryV7||!st.busy)return;st.busy=false;st.secondsWorked+=22;st.fatigue=Math.min(100,st.fatigue+11);st.workStep=2;st.lastSignal='刚才那段动作已经录完。你可以核对它，再决定是否上传。';renderFactory();},1150);return;
 }
 st.secondsWorked+=8;st.fatigue=Math.min(100,st.fatigue+3);
 const grade=E.evaluateCapture(st.fatigue,st.secondsWorked);st.lastGrade=grade.reason;
 if(!grade.ok){st.failedCaptures++;st.workStep=0;st.lastSignal=`录制未通过：${grade.reason} 本次未入账，耗时仍计入班次。`;Flesh3D?.action('上传');renderFactory();return;}
 const r=E.capture(G.ledger,m);if(!r.ok)return notify(r.why);
 r.asset.duration=44;r.asset.workload=17;r.asset.source='阿玛拉 / 外包动作采集站';r.asset.reviewed=true;r.asset.captureOrder=G.ledger.assets.length;
 st.workStep=0;st.lastSignal=`${r.asset.id} 上传成功。本次采集工资 ${r.asset.paid}G，取决于刚才签订的合同；${grade.reason}`;
 Flesh3D?.action('上传');notify(`记录 ${r.asset.id} 已提交 · ${r.asset.paid}G 入账`);
 if(G.ledger.assets.length===10){G.ledger.job='本批订单完成，是否续聘待通知';st.stage='workComplete';FleshDirector.burst('sever');}
 Flesh3D?.setFactoryDetail?.({role:'amara',stage:st.stage,fatigue:st.fatigue,count:G.ledger.assets.length});renderFactory();
}
function factoryRest(){const st=factoryState();if(st.busy)return;if(st.secondsWorked+45>600){st.stage='workComplete';st.lastSignal='剩余时间不足以完成一次休息，本次班次结束。';renderFactory();return;}st.fatigue=Math.max(0,st.fatigue-32);st.secondsWorked+=45;st.rests++;G.ledger.rests++;st.lastSignal='你坐下喝了点水。身体稍微缓过来了，但这段休息没有新增采集工资。';Flesh3D?.action('休息');renderFactory();}
function factoryInspect(index){const st=factoryState();st.chosenSample=index;const a=G.ledger.assets[index];if(a){st.inspected.add(a.id);st.lastSignal=`你查看了 ${a.id} 的来源与许可：${a.motion}动作，${a.license==='share'?'每次调用要分账':a.license==='limited'?'仅许可两次调用':'一次性买断'}。`;renderFactory();}}
function factoryUse(){const st=factoryState(),w=G.ledger,a=w.assets[st.chosenSample];if(!a)return; if(!st.inspected.has(a.id)){st.lastSignal='先查看样本来源与许可，再决定是否使用。';return renderFactory();}
 const r=E.invoke(w,a.id);if(!r.ok){st.lastSignal=r.why;return renderFactory();}
 st.callsByMotion.add(a.motion);st.lastSignal=`${a.id} 完成一次调用。收入30G，其中${r.share}G按照已有合同付给采集者。`;
 Flesh3D?.action('调用');Flesh3D?.setFactoryDetail?.({role:'ethan',stage:'platform',count:w.assets.length,calls:w.calls,selected:st.chosenSample});renderFactory();if(w.calls===1)showFactoryEpiphany(a,r.share);
}
function showFactoryEpiphany(asset,share){
 const workerGets=share>0,from=asset.source||'阿玛拉 · 动作采集站';
 const primary=workerGets?'本次调用，采集者另得8G分成。':'本次调用，采集者没有新增分成。';
 const heading=workerGets?'平台调用30G，采集者分到8G。':'平台调用30G，采集者分到0G。';
 const body=`<div class="v10-actual">${esc(primary)}</div><div class="audit-pair"><article class="audit-person"><div class="audit-person-top"><span>阿玛拉 · 采集</span></div><strong class="v10-result">${asset.paid}G</strong><p>完成一次「${esc(asset.motion)}」，获得采集工资。</p></article><article class="audit-person"><div class="audit-person-top"><span>伊森 · 平台</span></div><strong class="v10-result">30G</strong><p>本次复用 ${esc(asset.id)} 的收入；其中分给采集者 ${share}G。</p></article></div><div class="audit-readout"><b>动作只做一次，数据可以反复使用。</b><p>合同决定后来的收入能否返回劳动者。</p></div><details class="v10-detail"><summary>查看样本与授权说明</summary><p>数据来源：${esc(from)}。授权类型：${asset.license==='share'?'持续分账':asset.license==='limited'?'限次许可':'一次性买断'}。</p><p>数值属虚构教学模拟；30G为本次收入，不等于平台净利润。</p></details>`;
 FleshDirector.collected(3);
 // Ethan is actively earning: an amber control shot, never a victim's blood-red blockage.
 showDramaticSheet('control','03 / 数据到账',heading,body,[['返回控制台',renderFactory],['查看双边账本',showFactorySheet],['进入结局',renderEnd]],true);
}

function factorySampleCard(a,i){const st=factoryState();const b=document.createElement('button');b.type='button';b.className='fv7-sample'+(st.chosenSample===i?' active':'');b.innerHTML=`<b>${esc(a.id)}</b><span>${esc(a.motion)}</span><small>${a.origin==='historical'?'历史采集 · ':''}${a.uses}次使用 · ${a.license==='share'?'持续分账':a.license==='limited'?'限次授权':'买断'}</small>`;b.onclick=()=>factoryInspect(i);return b;}
function renderFactory(){
 const st=factoryState(),w=G.ledger,south=G.role==='amara',c=$('factoryControls');c.innerHTML='';c.classList.add('fv7-controls');
 const currentBrief=south?(st.stage==='contract'?'先选择数据授权合同':st.stage==='workComplete'?'班次已结束，查看工资或平台调用':st.workStep===0?`选择动作，准备「${G.selectedMotion}」`:st.workStep===1?`进行「${G.selectedMotion}」动作录制`:`核对并上传「${G.selectedMotion}」的数据`):'先核验来源，再决定是否调用样本';
 text('factoryDockEyebrow',south?'阿玛拉 · 采集工作台':'伊森 · 数据控制台');
 text('factoryDockBrief',currentBrief);
 text('deviceCount',`${w.assets.length} / 10`);text('deviceBits',w.assets.length?'◉ '.repeat(Math.min(6,Math.ceil(w.assets.length/2))):'◦ ◦ ◦');
 const dollars=(n)=>`${n}G`;
 text('factoryStatus',south?`工资（含历史） ${dollars(w.pay)} · 负荷 ${st.fatigue}/100 · 剩余 ${Math.max(0,600-st.secondsWorked)} 秒 · 新采 ${w.assets.filter(a=>a.origin!=='historical').length} 份`:`可用样本 ${w.assets.length} 份 · 调用 ${w.calls} 次 · 平台净收支 ${dollars(w.platformNet)}`);
 const top=document.createElement('div');top.className='fv7-head';top.innerHTML=`<span>${south?'在劳动现场｜01':'在控制中心｜02'}</span><strong>${south?'每次采集都要亲自做':'同一份动作，可以多次调用'}</strong><small>${south?'准备 → 录制 → 核对':'核验来源 → 调用 → 查看收益'}</small>`;c.append(top);
 if(south){
  if(st.stage==='contract'){
   c.append(factoryNote('你可以决定新采集的授权方式','这里有三份合同。历史样本的买断许可不会因你这次的选择而改变。'));
   const options=document.createElement('div');options.className='fv7-options';const rules=[['buyout','一次买断','19G/份；一次到账较高，以后复用无分成'],['share','持续分账','12G/份；首付较少，每次调用再得8G，调用次数不确定'],['limited','限制使用','16G/份；每份最多调用两次，不自动分账']];
   for(const [id,t,d] of rules){let b=factoryButton(`${t} · ${d}`,()=>{st.chosen=id;st.lastSignal=`你选择了「${t}」。但合同里没有保证长期雇佣。`;renderFactory();});b.classList.toggle('selected',st.chosen===id);options.appendChild(b);}c.append(options);
   const actions=document.createElement('div');actions.className='fv7-actions';actions.append(factoryButton('仔细看看谁能反复使用数据',()=>{st.contractRead=true;st.lastSignal='合同有取舍：买断首付较高，分账依赖未来是否调用，限次授权控制使用范围。';renderFactory();}),factoryButton('签下这份合同，开始今天的工作',()=>{w.license=st.chosen;st.stage='work';st.contractRead=true;st.lastSignal='合同签好了。工位上的追踪设备已经亮起。';renderFactory();},true,!st.chosen));c.append(actions);
   if(st.contractRead)c.append(factoryNote('请核对权利与风险','三份合同各有代价。分账可能没有后续收入，买断无法参与后续收益，限次许可降低持续调用空间。均不保证续聘。','warn'));
  } else if(st.stage==='workComplete'){
   c.append(factoryNote('工位的绿灯灭了',`班组长说：“本次班次到这里，明天是否续聘仍待通知。”你本轮留下了${w.assets.filter(a=>a.origin!=='historical').length}份新样本，平台依许可仍可继续调用。`,'warn'));
   const row=document.createElement('div');row.className='fv7-actions';row.append(factoryButton('去看看这些动作后来被怎么使用',()=>factorySwitch('ethan'),true),factoryButton('只查看这边的结算',showFactorySheet),factoryButton('结束这段故事',renderEnd));c.append(row);
  } else {
   const row=document.createElement('div');row.className='fv7-motions';for(const motion of FACTORY_TASKS){const b=factoryButton(motion,()=>stageWorkMotion(motion),false,st.busy);b.classList.toggle('selected',G.selectedMotion===motion);row.append(b);}c.append(row);
   const phrases=[`先摆好「${G.selectedMotion}」动作的姿势`,`完成一次「${G.selectedMotion}」动作`,'检查刚才录下的动作，确认上传'];
   const timeline=document.createElement('div');timeline.className='fv7-steps';timeline.innerHTML=['准备姿势','身体执行','确认数据'].map((t,i)=>`<span class="${i===st.workStep?'here':i<st.workStep?'done':''}">${i+1} · ${t}</span>`).join('');c.append(timeline);c.append(factoryNote('本次班次与动作质量',`已用 ${st.secondsWorked}/600 秒 · 当前负荷 ${st.fatigue}/100 · 重录 ${st.failedCaptures} 次。疲劳过高可能导致采集质量未通过；休息可以恢复，但也会占用时间。`));
   const row2=document.createElement('div');row2.className='fv7-actions';row2.append(factoryButton(st.busy?'正在录制，请完成动作…':phrases[st.workStep],actionBeat,true,st.fatigue>=85||st.busy),factoryButton(`坐下休息 · 负荷 −32`,factoryRest,false,st.busy),factoryButton('看合同与工资流水',showFactorySheet,false,st.busy));c.append(row2);
   if(w.assets.length>=2){const compare=factoryButton('暂时换到平台那边看看',()=>factorySwitch('ethan'),false,st.busy);compare.className+=' fv7-link';c.append(compare);}
  }
 }else{
  const samples=document.createElement('div');samples.className='fv7-samples';w.assets.forEach((a,i)=>samples.append(factorySampleCard(a,i)));c.append(samples);
  const selected=w.assets[st.chosenSample]||w.assets[0];if(st.chosenSample>=w.assets.length)st.chosenSample=0;
  const inspected=!!selected&&st.inspected.has(selected.id);
  const inspect=document.createElement('div');inspect.className='fv7-inspector';
  inspect.innerHTML=selected?`<div><small>样本出处</small><strong>${inspected?esc(selected.source||'外包动作采集站 / 阿玛拉'):'请先查看来源'}</strong></div><div><small>使用许可</small><strong>${inspected?(selected.license==='buyout'?'买断 · 可复用':selected.license==='share'?'持续分账 · 每次8G':'限次 · 最多两次'):'尚未核验'}</strong></div><div><small>本份已被调用</small><strong>${selected.uses} 次</strong></div>`:'没有可用样本';c.append(inspect);
  const row=document.createElement('div');row.className='fv7-actions';row.append(factoryButton('核对这份数据来自谁',()=>factoryInspect(st.chosenSample)),factoryButton('把这份样本用于模型训练 · 收入30G',factoryUse,true,!inspected),factoryButton('追踪它的收益去向',showFactorySheet));c.append(row);
  const row2=document.createElement('div');row2.className='fv7-actions secondary';row2.append(factoryButton('看看采集的人怎样完成这份动作',()=>factorySwitch('amara')),factoryButton('结束工作，生成双边对照',renderEnd));c.append(row2);
  c.append(factoryNote('平台账本没有记录的劳动条件',`你已经调用了${w.calls}次，覆盖了${st.callsByMotion.size}种动作。屏幕显示收益，但不会显示采集者此刻的劳累、等待与工作保障。`));
 }
 const comparison=document.createElement('div');comparison.className='fv7-sideby';comparison.innerHTML=`<div><small>采集现场 · 阿玛拉</small><b>${w.assets.length}份样本（含历史）/ ${w.pay}G累计工资</b><span>一次新样本，需要准备、执行、上传；休息仍占用时间。</span></div><div><small>平台控制台 · 伊森</small><b>${w.calls}次调用 / ${w.revenue}G总收入</b><span>已记录的动作可以再使用；后续收益依签约授权分配。</span></div>`;c.append(comparison);
 if(st.lastSignal){const info=factoryNote('刚才发生了什么',st.lastSignal,'feedback');info.setAttribute('role','status');c.append(info);}
 const foot=document.createElement('p');foot.className='fv7-fine';foot.textContent='虚构课堂模拟：货币、工作制度与人物均为设定，不代表全球南方或北方所有人。岗位差异来自故事中的劳动关系与数据权限，而非地域或肤色决定。';c.append(foot);
 Flesh3D?.setFactoryDetail?.({role:G.role,stage:st.stage,fatigue:st.fatigue,step:st.workStep,count:w.assets.length,calls:w.calls,selected:st.chosenSample});updateFactorySceneAction();
}
function showFactorySheet(){const w=G.ledger,st=factoryState(),entries=w.entries.slice(-12).reverse().map(e=>`<li><b>${esc(e.asset)}</b> · ${esc(e.desc)}</li>`).join('');const totals=E.verifyLedger(w);showSheet('采集工资与平台收益','核对一次采集的报酬，以及后续每次调用的收入。',`<div class="compare"><div><small>采集者真实到账</small><strong>${w.pay+w.royalty} G</strong><p>采集工资${w.pay}G · 复用分成${w.royalty}G · 休息${st.rests}次</p></div><div><small>平台净收支</small><strong>${w.platformNet} G</strong><p>调用${w.calls}次 · 已采${w.assets.length}份</p></div></div><p class="quiet">${totals.ok?'每一笔收入与支出均能在下方交易记录中核对。':'账本存在未平衡项，需要复查。'}</p><details open><summary>具体交易流水</summary><ul class="ledger-list">${entries||'<li>还没有交易</li>'}</ul></details>`,[['回到现场',renderFactory],['换另一边看看',()=>factorySwitch(G.role==='amara'?'ethan':'amara')],['查看故事结局',renderEnd]]);}
function initAuditLab(){
 const root=$('auditLab');if(!root)return;const cases={
  record:{title:'服务资格被什么影响？',evidence:G.summaries.act1?`你已获得一次问诊：${R[G.summaries.act1.role].name}。本次复核状态：${G.summaries.act1.assessment.serviceRoute}`:'尚未亲自体验第一幕，以下为规则示范。',options:[['a','有旧记录的人身体一定更健康'],['b','旧记录影响虚构平台的申请资格，却不能决定病情'],['c','只要继续问AI，就能得到确诊']],correct:'b',why:'旧病历在这个虚构平台里影响服务入口；从医学上仍须依据当下症状由专业人员评估。',rule:'取消“必须有旧病历才能申请线上人工复核”的限制',after:'在其他条件不变且无紧急警讯时，缺少旧病历者也可以提出申请；诊断和实际预约仍需要进一步确认。'},
  voice:{title:'谁的原话留在系统里？',evidence:G.summaries.act2?`你说：“${G.summaries.act2.original}” 初稿：“${G.summaries.act2.bad}”`:'尚未体验第二幕，这里演示摘要漏记的情况。',options:[['a','AI摘要既然生成，就一定准确'],['b','某个地区的人天生不善于描述症状'],['c','记录需要当事人核对，重要遗漏可重新补正']],correct:'c',why:'语音识别和摘要可能遗漏信息，核对需要当事人的参与；遗漏与地区身份没有必然对应关系。',rule:'让当事人始终能查看原话和修改摘要',after:'可校正的记录提高了纠错机会，但交通、陪同及专业诊断仍需另行解决。'},
  wage:{title:'哪一方掌握了数据的未来？',evidence:`样本 ${G.ledger.assets.length} 份；已调用 ${G.ledger.calls} 次；采集工资 ${G.ledger.pay}G；复用分成 ${G.ledger.royalty}G。`,options:[['a','一次采集的工资等于所有后续使用收入'],['b','每次复用的收益取决于授权规则，采集劳动仍另有负担'],['c','数据可复用说明采集者没有投入劳动']],correct:'b',why:'平台可以重复使用已获许可的样本；劳动者能否参与分成取决于合同和实际调用，平台账本没有完整记录劳动条件。',rule:'假定所有后续调用都要另付8G给采集者',after:`按目前 ${G.ledger.calls} 次调用测算，采集者理论上获得 ${G.ledger.calls*8}G复用报酬，平台需额外承担同额支付。这是规则替换实验，不会改写已签合同和实际账本。`}
 };
 const open=(key)=>{const x=cases[key],slot=$('auditCaseBody');root.querySelectorAll('[data-audit]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.audit===key)));
  slot.innerHTML=`<h3>${esc(x.title)}</h3><p class="audit-evidence"><b>证据</b>${esc(x.evidence)}</p><p>哪一种解释能从证据中得到支持？</p><div class="audit-picks">${x.options.map(([id,t])=>`<button type="button" data-pick="${id}">${esc(t)}</button>`).join('')}</div><div class="audit-feedback" role="status" id="auditFeedback">请选择解释。</div><button type="button" class="audit-rule" id="auditRule">试着改变规则：${esc(x.rule)}</button><p id="auditRuleResult" class="audit-rule-result hidden">${esc(x.after)}</p>`;
  slot.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{const valid=b.dataset.pick===x.correct;slot.querySelectorAll('[data-pick]').forEach(j=>j.setAttribute('aria-pressed',String(j===b)));$('auditFeedback').textContent=(valid?'这项解释有证据支持。':'这项解释超出了证据，请再核对。')+' '+x.why;});
  $('auditRule').onclick=()=>{$('auditRuleResult').classList.remove('hidden');$('auditRule').setAttribute('aria-expanded','true');};
 };
 root.querySelectorAll('[data-audit]').forEach(b=>b.onclick=()=>open(b.dataset.audit));open('record');
}
function renderEnd(){FleshDirector.collected(3);FleshDirector.clear();hideAll();
 const c1=G.summaries.act1,c2=G.summaries.act2,w=G.ledger;
 G.summaries.act3={role:G.role,assets:w.assets.length,calls:w.calls,workerPay:w.pay+w.royalty,platformNet:w.platformNet};
 const name1=c1?R[c1.role].name:'尚未体验',name2=c2?R[c2.role].name:'尚未体验';
 const first=c1?(c1.redFlag==='yes'?'你报告了需要及时处理的症状，应该先寻求医疗帮助。':c1.redFlag==='unknown'?'伴随症状还没核实，系统暂时没有作出复核分流。':c1.assessment?.recordsAvailable?'平台允许你申请人工复核，但尚未预约医生。':'平台没有可用旧记录，要求补充资料才能申请复核。'):'你还没有经历问诊。';
 const second=c2?(c2.corrected?`你补回了“${c2.omitted}”。`:`“${c2.omitted}”仍待核对。`):'你还没有经历社区问诊。';
 const third=w.calls?`可用${w.assets.length}份样本（含历史），数据被调用${w.calls}次。采集者到账${w.pay+w.royalty}G，平台净收支${w.platformNet}G。`:`可用${w.assets.length}份样本（含历史）；还没有发生平台复用。`;
 $('endingScreen').innerHTML=`<div class="end-content v10-ending"><div class="eyebrow">肉身审计局 / 终章</div><h1>同样是身体数据，<br><em>结果为什么不同？</em></h1><div class="final-statement">旧病历影响能否申请复核，AI摘要决定记录保留了什么，授权合同决定数据复用后谁能分成。</div><div class="end-cards"><article><span>01 · 被判断</span><h3>${esc(name1)}</h3><p>${esc(first)}</p>${c1?.afterChoice?`<small>${esc(c1.afterMessage)}</small>`:''}</article><article><span>02 · 被记录</span><h3>${esc(name2)}</h3><p>${esc(second)}</p>${c2?.original?`<small>你说：${esc(c2.original)}</small>`:''}</article><article><span>03 · 被使用</span><h3>${esc(G.role==='ethan'?'伊森 · 控制台':'阿玛拉 · 采集现场')}</h3><p>${esc(third)}</p>${w.assets[0]?`<small>样本 ${esc(w.assets[0].id)} · ${esc(w.assets[0].license==='share'?'持续分账':w.assets[0].license==='limited'?'限次授权':'买断')}</small>`:''}</article></div><section class="audit-lab" id="auditLab"><div class="audit-lab-head"><span>终章 / 证据审计台</span><h2>你来判断，哪条规则改变了结果</h2><p>点击三份证据，选择一种解释，再试着修改一条规则。结论必须能回到游戏中实际发生的记录。</p></div><div class="audit-case-tabs"><button type="button" data-audit="record">01 · 服务资格</button><button type="button" data-audit="voice">02 · 症状记录</button><button type="button" data-audit="wage">03 · 数据收益</button></div><div class="audit-case-body" id="auditCaseBody" aria-live="polite"></div></section><blockquote>如果你能修改一条规则，谁会获益，谁还要承担代价？</blockquote><details class="v10-final-more"><summary>看三幕之间的关系</summary><p>第一幕：旧档案能否变成服务门槛？第二幕：人说的话怎样进入记录？第三幕：身体动作被复用之后，收益如何分配？</p><p>这不是说每个人都受到相同的压迫。有人被排除，有人通过，有人管理并受益。游戏讨论的是这些差异怎样经由数据规则被组织起来。</p></details><div class="end-actions"><button id="endOther" class="btn primary">换个身份再看一次</button><button id="endArchive" class="btn secondary">研究资料</button><button id="endReboot" class="btn ghost">重新开始</button></div><p class="end-note">虚构教学情境，非医学诊断或真实收入统计。</p></div>`;
 show('endingScreen');initAuditLab();$('endOther').onclick=()=>{G.role='';chooseRoles(1)};$('endArchive').onclick=openArchive;$('endReboot').onclick=resetAll;
}

function openArchive(){hide('helpOverlay');const panel=$('sources');if(!panel.hasChildNodes())panel.innerHTML=FleshData.documents.map((d,i)=>`<article class="source"><span>RESEARCH ${String(i+1).padStart(2,'0')}</span><h3>${esc(d.title)}</h3><p>${esc(d.desc)}</p><img src="${d.src.startsWith('data:')?d.src:'assets/references/'+d.src}" alt="真实学术文献原始截图，未修改" loading="lazy"><cite>${esc(d.cite)}</cite></article>`).join('');show('archive');}
$('factorySceneAction').onclick=()=>{if(G.act===3&&G.role==='amara'&&factoryState().stage==='work')actionBeat();};window.addEventListener('resize',()=>{if(G.act===3&&!$('factoryScreen').classList.contains('hidden'))updateFactorySceneAction();});$('factoryToggle').onclick=()=>setFactoryDock(!G.factoryDockOpen);$('startBtn').onclick=()=>chooseRoles(1);$('stageHotspot').onclick=goMachine;$('machine').onclick=()=>{if(G.role&&G.act<3)goMachine();};$('homeBtn').onclick=resetAll;$('chatExit').onclick=()=>{G.viewToken++;hide('chatScreen');$('stageHotspot').classList.remove('hidden');notify('对话已保留，重新走近问诊机即可接着说。');};$('closeSheet').onclick=closeSheetAndResume;$('sendBtn').onclick=()=>interpretFree($('freeInput').value);$('freeInput').addEventListener('keydown',e=>{if(e.key==='Enter'){$('sendBtn').click();}});$('helpBtn').onclick=()=>show('helpOverlay');$('helpClose').onclick=()=>hide('helpOverlay');$('openArchive').onclick=openArchive;$('archiveClose').onclick=()=>hide('archive');$('soundBtn').onclick=()=>{if(FleshAudio.enabled)FleshAudio.stop();else FleshAudio.start();$('soundBtn').textContent=FleshAudio.enabled?'声音：开':'声音：关';$('soundBtn').setAttribute('aria-pressed',String(FleshAudio.enabled));};$('motionBtn').onclick=()=>{const current=document.body.classList.toggle('reduced-motion');$('motionBtn').setAttribute('aria-pressed',String(current));$('motionBtn').textContent=current?'恢复动效':'减弱动效';};document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('sheetOverlay').classList.contains('hidden')){e.preventDefault();closeSheetAndResume();}else if(G.act===3&&!$('factoryScreen').classList.contains('hidden')&&G.factoryDockOpen){setFactoryDock(false);$('factoryToggle').focus();}else{hide('helpOverlay');hide('archive');}}if(['1','2','3'].includes(e.key)&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!$('chatScreen').classList.contains('hidden')){const arr=$('chatOptions').querySelectorAll('.reply-chip');arr[+e.key-1]?.click();}});
Flesh3D?.init();Flesh3D.app.onInteraction=goMachine;resetAll();
})();
