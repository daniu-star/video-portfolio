from pathlib import Path
p=Path('/mnt/data/flesh_audit')
def patch(name,old,new):
 f=p/name;s=f.read_text();assert old in s,(name,old[:100]);f.write_text(s.replace(old,new,1))
# engine: contracts with no dominated option, explicit per-capture historical/new pay
patch('js/engine.js',"function newLedger(){return {assets:[],entries:[],pay:0,royalty:0,revenue:0,platformNet:0,rests:0,license:'buyout',job:'在岗',calls:0};}","""const LICENSES={buyout:{pay:19,share:0,maxUses:Infinity,title:'一次买断'},share:{pay:12,share:8,maxUses:Infinity,title:'持续分账'},limited:{pay:16,share:0,maxUses:2,title:'限次使用'}};
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
""")
patch('js/engine.js',"const a={id:'D-'+String(w.assets.length+1).padStart(3,'0'),motion,license:w.license,uses:0,origin:'current'};w.assets.push(a);w.pay+=15;w.platformNet-=15;w.entries.push({type:'采集',asset:a.id,worker:15,platform:-15,desc:`阿玛拉完成「${motion}」，平台支付15G。`});", "const rule=LICENSES[w.license];if(!rule)throw Error('invalid license');const a={id:'D-'+String(w.assets.length+1).padStart(3,'0'),motion,license:w.license,uses:0,origin:'current',paid:rule.pay};w.assets.push(a);w.pay+=rule.pay;w.platformNet-=rule.pay;w.entries.push({type:'采集',asset:a.id,worker:rule.pay,platform:-rule.pay,desc:`阿玛拉完成「${motion}」，按照${rule.title}合同支付${rule.pay}G。`});")
patch('js/engine.js',"if(a.license==='limited'&&a.uses>=2)","if(a.uses>=LICENSES[a.license].maxUses)")
patch('js/engine.js',"const share=a.license==='share'?8:0;", "const share=LICENSES[a.license].share;")
patch('js/engine.js',"root.FleshEngine={assessConversation,compareSameSymptoms,parseRedFlag,assessRural,newLedger,capture,invoke,seedLedger,verifyLedger};", "root.FleshEngine={assessConversation,compareSameSymptoms,parseRedFlag,assessRural,newLedger,capture,invoke,seedLedger,verifyLedger,LICENSES,experienceFeedback,evaluateCapture};")
# 3d projection safe body-relative
patch('js/world3d.js',"function setFactoryDetail(detail){app.factoryDetail={...app.factoryDetail,...detail};}","""function projectWorldPoint(x,y,z){if(!app.canv||!app.ok)return null;const c=cameraInfo();const pos=project([x,y,z],c.vp,c.w,c.h);return pos&&pos.x>=0&&pos.x<=c.w&&pos.y>=0&&pos.y<=c.h?pos:null;}
function setFactoryDetail(detail){app.factoryDetail={...app.factoryDetail,...detail};}""")
patch('js/world3d.js',"root.Flesh3D={init,setScene,setRole,approach,action,setFactoryDetail,app,inspect:{sceneMesh,isBlocked,cameraInfo}};", "root.Flesh3D={init,setScene,setRole,approach,action,setFactoryDetail,projectWorldPoint,app,inspect:{sceneMesh,isBlocked,cameraInfo}};")
# UI
patch('index.html','<title>肉身审计局 v15 · 第三幕交互布局优化 | The Flesh Audit</title>','<title>肉身审计局 v16 · 数据反身性交互升级 | The Flesh Audit</title>')
patch('index.html','<link rel="stylesheet" href="css/factory-layout-v15.css">','<link rel="stylesheet" href="css/factory-layout-v15.css"><link rel="stylesheet" href="css/reflexive-v16.css">')
patch('index.html','<p>三个故事：一次问诊申请、一份症状记录、一笔身体数据的交易。每次做完，你都能看见结果。</p>','<p>三个故事，一项共同任务。看看身体怎样被记录和评价，又怎样改变人下一次的行动。</p>')
patch('index.html','<p class="intro-question">你只需要做他们能做的选择。</p>','<p class="intro-question">每一幕都试着问自己：我为什么改变了做法？谁决定了这条规则？</p>')
patch('index.html','<div id="factoryStatus" class="factory-status" aria-live="polite"></div>','<div id="factoryStatus" class="factory-status" aria-live="polite"></div>\n      <button type="button" id="factorySceneAction" class="factory-scene-action hidden" aria-label="点击三维场景中的工作设备"><span class="scene-pulse" aria-hidden="true"></span><span id="factorySceneActionLabel">点击设备，开始操作</span></button>')
patch('index.html','<p>每一幕都是另一段人生，不是同一个人突然获得其他身份的权限。你可以随时重开或查看原始资料。</p>','<p>第一幕比较个人感受与设备数据，第二幕亲自核对漏记，第三幕点击工厂设备并审查授权。三幕人物各有其生活，场景内的指标、货币和制度均为教学模拟。</p><p>工厂里可直接点击发光工作点；也可以从右侧任务台完成同样的操作。每完成一次任务，记得看看新的记录怎样反过来影响你的下一次选择。</p>')
# game state and selection reset
patch('js/game.js',"visitedFactoryNorth:false,chatDraftAct:null", "visitedFactoryNorth:false,feedbackChoice:null,chatDraftAct:null")
patch('js/game.js',"G.factoryDockOpen=null;G.visitedFactorySouth=false;", "G.factoryDockOpen=null;G.feedbackChoice=null;G.visitedFactorySouth=false;")
# ask user manual correction with two selectable phrases
patch('js/game.js',"G.phase='ruralCorrect';choices('AI记录是否准确？',[{label:`漏了“${item.missing}”，请补上。`,value:'correct'},{label:'暂时不修改，保留漏记的摘要。',value:'leave'}],false);break;", "G.phase='ruralCorrect';choices('AI记录是否准确？',[{label:'逐句核对，自己补回漏记的内容',value:'review'},{label:'暂时不修改，保留漏记的摘要。',value:'leave'}],false);break;")
patch('js/game.js',"case 'ruralCorrect':c.corrected=v==='correct';", "case 'ruralCorrect':if(v==='review'){showCorrectionEditor();return;}c.corrected=v==='correct';")
needle="function ruralAnswer(v){const c=G.ctx,r=R[G.role];switch(G.phase){"
editor="""function showCorrectionEditor(){
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
"""
patch('js/game.js',needle,editor+needle)
# chapter1 score feedback module append to receipt as separate compact tangible interaction
needle=" <details class=\"receipt-details\"><summary>看看规则是怎么影响结果的</summary>"
replace=""" <section class="reflex-loop"><div class="loop-head"><b>反身性实验 · 下一次你会怎么做</b><span>设备读数是虚构的自我管理提示，不是医学判断</span></div><div class="loop-scores"><span>设备自评 <b>58 / 100</b></span><span>本人感受 <b>仍然疲惫</b></span></div><p>你原本只想弄清身体情况。看见一个分数后，会不会为了提高它而改变今天的安排？</p><div class="loop-choices"><button type="button" data-loop="score">按分数改变作息</button><button type="button" data-loop="body">记录真实感受并求助</button><button type="button" data-loop="ignore">暂时不调整</button></div><div id="loopResult" class="loop-result" role="status">选择一项，看看下一轮出现什么数据和生活代价。</div></section>
 <details class="receipt-details"><summary>看看规则是怎么影响结果的</summary>"""
patch('js/game.js',needle,replace)
needle=" $('humanCostA').onclick=()=>setCost('records');$('humanCostB').onclick=()=>setCost('help');"
replace=""" $('humanCostA').onclick=()=>setCost('records');$('humanCostB').onclick=()=>setCost('help');
 const setLoop=(choice)=>{const f=E.experienceFeedback(role,choice);chosen.feedbackChoice=choice;chosen.feedback=f;const box=$('loopResult');box.innerHTML=`<b>第二轮设备自评 ${f.deviceScore}/100 · 本人仍然疲惫</b><p>${esc(f.cost)} ${esc(f.change)}</p><small>你选择了“${esc(f.title)}”。数字变化来自教学设定。设备读数与身体感受未必同步，不能用于诊断。</small>`;box.classList.add('active');$('sheetOverlay').querySelectorAll('[data-loop]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.loop===choice)));};
 $('sheetOverlay').querySelectorAll('[data-loop]').forEach(b=>b.onclick=()=>setLoop(b.dataset.loop));if(chosen.feedbackChoice)setLoop(chosen.feedbackChoice);"""
patch('js/game.js',needle,replace)
# third factory rich exercise
patch('js/game.js',"secondsWorked:0,rests:0,chosenSample:0", "secondsWorked:0,rests:0,failedCaptures:0,lastGrade:'',chosenSample:0")
patch('js/game.js',"function actionBeat(){", """function updateFactorySceneAction(){
 const b=$('factorySceneAction');if(!b)return;const st=factoryState();const active=G.role==='amara'&&st.stage==='work'&&!st.busy&&G.ledger.assets.length<10;
 b.classList.toggle('hidden',!active);if(!active)return;
 const labels=['点击传感器 · 校准姿势','点击工位货箱 · 执行动作','点击采集台 · 核验上传'];text('factorySceneActionLabel',labels[st.workStep]);
 const xyz=st.workStep===0?[-4.1,1.3,.7]:[-2.6,1.45,-1.25];
 const pos=Flesh3D?.projectWorldPoint?.(...xyz);
 if(pos){b.style.left=`${Math.max(80,Math.min(window.innerWidth-170,pos.x))}px`;b.style.top=`${Math.max(170,Math.min(window.innerHeight-155,pos.y))}px`;b.style.opacity='1';}
 else{b.style.left='36%';b.style.top='53%';b.style.opacity='1';}
}
function actionBeat(){""")
# guard: time test and quality at upload
patch('js/game.js',"if(st.fatigue>=85){st.lastSignal='身体很累，先停下来缓一缓。';renderFactory();return;}","if(st.secondsWorked>=600){st.stage='workComplete';st.lastSignal='本次虚构班次时间已用完，采集工作停止。';renderFactory();return;}if(st.fatigue>=85){st.lastSignal='身体很累，先停下来缓一缓。';renderFactory();return;}")
needle=" st.secondsWorked+=8;st.fatigue=Math.min(100,st.fatigue+3);\n const r=E.capture(G.ledger,m);"
replace=""" st.secondsWorked+=8;st.fatigue=Math.min(100,st.fatigue+3);
 const grade=E.evaluateCapture(st.fatigue,st.secondsWorked);st.lastGrade=grade.reason;
 if(!grade.ok){st.failedCaptures++;st.workStep=0;st.lastSignal=`录制未通过：${grade.reason} 本次未入账，耗时仍计入班次。`;Flesh3D?.action('上传');renderFactory();return;}
 const r=E.capture(G.ledger,m);"""
patch('js/game.js',needle,replace)
patch('js/game.js',"st.lastSignal=`${r.asset.id} 上传成功。本次工资 15G，但授权取决于刚才签订的合同。`;", "st.lastSignal=`${r.asset.id} 上传成功。本次采集工资 ${r.asset.paid}G，取决于刚才签订的合同；${grade.reason}`;")
patch('js/game.js',"notify(`记录 ${r.asset.id} 已提交 · 15G 入账`);", "notify(`记录 ${r.asset.id} 已提交 · ${r.asset.paid}G 入账`);")
patch('js/game.js',"function factoryRest(){const st=factoryState();st.fatigue=", "function factoryRest(){const st=factoryState();if(st.busy)return;if(st.secondsWorked+45>600){st.stage='workComplete';st.lastSignal='剩余时间不足以完成一次休息，本次班次结束。';renderFactory();return;}st.fatigue=")
# buttons titles
patch('js/game.js',"const rules=[['buyout','一次买断','15G/份；以后复用，没有自动分成'],['share','持续分账','15G/份；每次平台调用，额外得8G'],['limited','限制使用','15G/份；每份最多调用两次']];", "const rules=[['buyout','一次买断','19G/份；一次到账较高，以后复用无分成'],['share','持续分账','12G/份；首付较少，每次调用再得8G，调用次数不确定'],['limited','限制使用','16G/份；每份最多调用两次，不自动分账']];")
patch('js/game.js',"st.lastSignal='原来工资只按采集次数支付。未来的使用许可由合同决定。';", "st.lastSignal='合同有取舍：买断首付较高，分账依赖未来是否调用，限次授权控制使用范围。';")
patch('js/game.js',"c.append(factoryNote('合同写清了','无论选哪份合同，采集劳动都是按次付费；复用权利与后续分成却完全不同。','warn'));", "c.append(factoryNote('请核对权利与风险','三份合同各有代价。分账可能没有后续收入，买断无法参与后续收益，限次许可降低持续调用空间。均不保证续聘。','warn'));")
patch('js/game.js',"st.stage==='workComplete'?'订单完成，查看工资或平台调用'", "st.stage==='workComplete'?'班次已结束，查看工资或平台调用'")
patch('js/game.js',"'工位的绿灯灭了','班组长说：“今天这批够了，明天有没有活，还得等通知。”你已经做完十份动作，但平台仍保留按约使用它们的能力。'", "'工位的绿灯灭了',`班组长说：“本次班次到这里，明天是否续聘仍待通知。”你本轮留下了${w.assets.filter(a=>a.origin!=='historical').length}份新样本，平台依许可仍可继续调用。`")
patch('js/game.js',"row2.append(factoryButton(st.busy?'正在录制，请完成动作…':phrases[st.workStep],actionBeat,true,st.fatigue>=85||st.busy)", "row2.append(factoryButton(st.busy?'正在录制，请完成动作…':phrases[st.workStep],actionBeat,true,st.fatigue>=85||st.busy)")
patch('js/game.js',"c.append(timeline);\n   const row2", "c.append(timeline);c.append(factoryNote('本次班次与动作质量',`已用 ${st.secondsWorked}/600 秒 · 当前负荷 ${st.fatigue}/100 · 重录 ${st.failedCaptures} 次。疲劳过高可能导致采集质量未通过；休息可以恢复，但也会占用时间。`));\n   const row2")
patch('js/game.js',"text('factoryStatus',south?`累计工资（含历史） ${dollars(w.pay)} · 工作负荷 ${st.fatigue}/100 · 本局新采 ${w.assets.filter(a=>a.origin!=='historical').length} 份`", "text('factoryStatus',south?`工资（含历史） ${dollars(w.pay)} · 负荷 ${st.fatigue}/100 · 剩余 ${Math.max(0,600-st.secondsWorked)} 秒 · 新采 ${w.assets.filter(a=>a.origin!=='historical').length} 份`")
patch('js/game.js',"Flesh3D?.setFactoryDetail?.({role:G.role,stage:st.stage,fatigue:st.fatigue,step:st.workStep,count:w.assets.length,calls:w.calls,selected:st.chosenSample});", "Flesh3D?.setFactoryDetail?.({role:G.role,stage:st.stage,fatigue:st.fatigue,step:st.workStep,count:w.assets.length,calls:w.calls,selected:st.chosenSample});updateFactorySceneAction();")
patch('js/game.js',"$('factoryToggle').onclick=()=>setFactoryDock(!G.factoryDockOpen);", "$('factorySceneAction').onclick=()=>{if(G.act===3&&G.role==='amara'&&factoryState().stage==='work')actionBeat();};window.addEventListener('resize',()=>{if(G.act===3&&!$('factoryScreen').classList.contains('hidden'))updateFactorySceneAction();});$('factoryToggle').onclick=()=>setFactoryDock(!G.factoryDockOpen);")
# content of payout epiphany references fixed 15G: should reflect asset paid
patch('js/game.js',"<strong class=\"v10-result\">15G</strong>","<strong class=\"v10-result\">${asset.paid}G</strong>")
# completion and body to audit next
patch('js/game.js',"<blockquote>是谁决定了这些规则？</blockquote>","""<section class="audit-lab" id="auditLab"><div class="audit-lab-head"><span>终章 / 证据审计台</span><h2>你来判断，哪条规则改变了结果</h2><p>点击三份证据，选择一种解释，再试着修改一条规则。结论必须能回到游戏中实际发生的记录。</p></div><div class="audit-case-tabs"><button type="button" data-audit="record">01 · 服务资格</button><button type="button" data-audit="voice">02 · 症状记录</button><button type="button" data-audit="wage">03 · 数据收益</button></div><div class="audit-case-body" id="auditCaseBody" aria-live="polite"></div></section><blockquote>如果你能修改一条规则，谁会获益，谁还要承担代价？</blockquote>""")
patch('js/game.js',"show('endingScreen');$('endOther').onclick=", "show('endingScreen');initAuditLab();$('endOther').onclick=")
insert="""function initAuditLab(){
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
"""
patch('js/game.js',"function renderEnd(){",insert+"function renderEnd(){")
# remove unneeded earlier 'historical paid wages' contradictions explicit
patch('js/game.js',"${w.assets.length}次动作（含历史）/ ${w.pay}G累计工资", "${w.assets.length}份样本（含历史）/ ${w.pay}G累计工资")
(p/'css/reflexive-v16.css').write_text('''/* v16 | data feedback, direct station interaction and evidence audit. */
.reflex-loop{margin:14px 0 12px;padding:16px;border:1px solid #c8c9bd;background:#f1f0e9;color:#203a42;border-radius:7px}
.loop-head{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px}.loop-head b{font-size:14px}.loop-head span{font-size:11px;color:#637176}
.loop-scores{display:flex;flex-wrap:wrap;gap:8px;margin:13px 0}.loop-scores>span{background:#dae4e1;border:1px solid #a8bab4;padding:9px 11px;font-size:12px;display:flex;gap:10px;align-items:baseline}.loop-scores b{font-size:17px;color:#2c4e58}
.reflex-loop>p{font-size:13px;line-height:1.7}.loop-choices{display:flex;flex-wrap:wrap;gap:7px}.loop-choices button{flex:1 1 135px;border:1px solid #5c777c;background:#315561;color:white;padding:11px;border-radius:5px;cursor:pointer;min-height:44px}.loop-choices button[aria-pressed="true"]{background:#bda274;color:#162c31;border-color:#8f7245}.loop-result{padding:12px;margin-top:10px;background:#e1e9e4;color:#3d535b;font-size:12px;line-height:1.6}.loop-result.active{border-left:3px solid #8ea97e}.loop-result b{display:block;font-size:14px}.loop-result p{margin:5px 0}.loop-result small{display:block}
.record-editor{width:100%;background:#e8efef;color:#28424c;border:1px solid #b5cbce;padding:14px;border-radius:8px}.record-editor-label{font-size:11px;color:#45747a;font-weight:700}.record-editor p{margin:6px 0 11px;line-height:1.65}.record-editor-pieces{display:grid;gap:8px}.record-piece{background:#315c63;color:white;border:1px solid #71979e;border-radius:7px;padding:11px;text-align:left;min-height:44px;cursor:pointer}.record-piece:hover{background:#3c717a}.record-editor-result{font-size:12px;color:#28575c}
.factory-scene-action{position:absolute;z-index:32;left:36%;top:54%;transform:translate(-50%,-50%);border:2px solid #e8c78b;border-radius:100px;min-height:48px;max-width:190px;padding:10px 15px;background:#183c46e8;color:#fff0c9;font-size:12px;line-height:1.4;text-align:center;box-shadow:0 0 0 6px #80bdb129,0 8px 30px #081823c9;cursor:pointer;touch-action:manipulation}.factory-scene-action:hover,.factory-scene-action:focus-visible{background:#365b61;border-color:#f3dba0}.factory-scene-action .scene-pulse{position:absolute;inset:-7px;border:1px solid #82c8ad80;border-radius:100px;pointer-events:none}.factory-scene-action.hidden{display:none!important}
.audit-lab{margin:24px 0;border:1px solid #69828b;background:#172d37;padding:clamp(14px,2vw,23px);border-radius:10px}.audit-lab-head span{color:#d6b77c;font-size:12px}.audit-lab-head h2{font-size:clamp(19px,2vw,26px);margin:10px 0}.audit-lab-head p{color:#b8cbd0;font-size:13px;line-height:1.65}.audit-case-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:18px 0}.audit-case-tabs button,.audit-picks button{border:1px solid #637f87;background:#2b4753;color:#ecf2ed;border-radius:5px;padding:10px;font-size:12px;min-height:44px;cursor:pointer}.audit-case-tabs button[aria-pressed="true"],.audit-picks button[aria-pressed="true"]{border-color:#eccb8c;background:#405f58;color:#ffe1ac}.audit-case-body{padding:15px;background:#203943;border-radius:8px}.audit-case-body h3{font-size:17px}.audit-case-body>p{line-height:1.65;font-size:13px}.audit-evidence{border-left:3px solid #b99e71;padding:12px;background:#2d4850;color:#d8e1da}.audit-evidence b{display:block;color:#e6be85;margin-bottom:6px}.audit-picks{display:grid;grid-template-columns:1fr;gap:6px}.audit-picks button{text-align:left}.audit-feedback{margin:12px 0;color:#c1d5d2;font-size:12px;line-height:1.65}.audit-rule{background:#ad966d;border:0;border-radius:5px;color:#1a2a31;padding:12px;min-height:44px;text-align:left;cursor:pointer}.audit-rule-result{color:#d7e7e3;background:#294950;border-left:3px solid #8ac0a7;padding:12px;margin:10px 0 0;font-size:12px;line-height:1.7}.audit-rule-result.hidden{display:none}
@media(max-width:680px){.factory-scene-action{font-size:10px;max-width:142px;min-height:43px;padding:8px}.audit-case-tabs button{font-size:11px;padding:8px 4px}.loop-choices button{flex-basis:100%}}
''',encoding='utf8')
print('applied changes')
