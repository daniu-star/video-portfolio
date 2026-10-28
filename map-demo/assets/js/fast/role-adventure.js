/* FAST v16: playable two-era / three-role educational story. All task data and geometry are teaching simulations. */
(function(NS){'use strict';
const $=id=>document.getElementById(id);
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roles={research:{name:'科研人员',icon:'◉',desc:'从洼地地形、反射面协同到射电信号核验，学习提出有证据的科学判断。'},build:{name:'建设与运维人员',icon:'⌘',desc:'识读工程结构，检查施工偏差与设备状态，理解工程质量与安全。'},public:{name:'普通公众',icon:'✧',desc:'从周边居民与科普参观者的视角观察工程，理解科研保护与地方生活。'}};
const eras={construction:{name:'建设时代',date:'2011—2016',year:'2011',t:.26,desc:'FAST于2011年3月开工，2016年9月落成。场景以2011年为入口，后续事件采用时期化教学模拟。'},operation:{name:'运行时代',date:'2020年起',year:'2022',t:.86,desc:'FAST于2020年1月通过国家验收。地图使用2022年时间节点代表运行时期。'}};
const ev=(name,detail)=>({name,detail});
const opt=(name,good,feedback)=>({name,good,feedback});
const missions={
 'research.construction':[
  {id:'site',title:'从洼地认识天眼',tag:'地形调查',prompt:'2011年工程已经开工，台址已选定。请检查既有台址条件，说明为什么大窝凼适合建设大型射电望远镜。',type:'terrain',need:2,
   evidence:[ev('喀斯特洼地','洼地地形能够为巨型反射面提供天然的空间条件，仍需进行工程设计和施工。'),ev('山地屏蔽','周边山体在一定条件下有助于减弱部分地面无线电干扰。'),ev('区域交通','复杂地形也给构件运输和施工组织带来挑战。')],
   options:[opt('结合地形、干扰环境与工程条件共同评估',true,'台址适宜性来自多方面条件，已选定的历史台址不因游戏决策改变。'),opt('只要洼地足够大，就不需要再验证工程条件',false,'尺度只是条件之一；测量、结构和电磁环境同样需要验证。')],fact:'历史事实：FAST于2011年3月正式开工。地图上的台址和考察点为教学示意。'},
  {id:'surface',title:'让反射面与馈源协同',tag:'结构模拟',prompt:'FAST是一面固定在洼地中的球面反射面。请通过两个教学参数调整局部工作面与馈源舱位置，观察协同误差如何变化。',type:'sync',need:1,
   evidence:[ev('主动反射面','观测时局部反射面随跟踪指令调形，整个500米反射面不进行整体旋转。'),ev('馈源舱','馈源舱由索驱动等系统精密定位，协同接收反射后的射电信号。')],
   options:[opt('先完成联动校验，再进入观测准备',true,'正确。主动反射面与馈源舱协同，是认识FAST工作的关键。'),opt('转动整面固定反射面来追踪天体',false,'FAST没有整体旋转500米大锅的机构。请观察局部反射面和馈源的位置变化。')],fact:'科学模型仅表达协同关系。滑块没有现实工程单位，不提供真实设备控制参数。'},
  {id:'quality',title:'处理一组测量偏差',tag:'质量复核',prompt:'安装检测报告出现一条异常读数。请检查记录和测量手段，决定如何向工程团队反馈。',type:'inspection',need:2,
   evidence:[ev('记录A · 符合预期','这一组示意测量与教学目标接近。'),ev('记录B · 超出教学容差','某一局部构件的偏差被标记为待复核，不能从一次读数推定根本原因。'),ev('复核程序','需要核对测量条件、复测结果并与相关人员协作。')],
   options:[opt('记录异常，复测并与施工人员核对',true,'异常得到留痕和复核，科研与工程协作能够继续推进。'),opt('为保证进度，直接删除异常读数',false,'删除异常会破坏证据链，也无法验证测量偏差是否真实存在。')],fact:'该数据案例为教学合成，未对应任何真实工程质量事故。'}],
 'research.operation':[
  {id:'observation',title:'制定一次模拟观测',tag:'系统协同',prompt:'你要为一段射电观测设置教学指向。分别调整局部反射面和馈源舱的联动参数，使系统进入协调状态。',type:'sync',need:1,
   evidence:[ev('500米球面反射面','FAST总口径500米，观测时形成约300米有效照明口径。'),ev('索驱动馈源舱','馈源系统与主动反射面配合完成指向和跟踪。')],
   options:[opt('记录联动状态并开始模拟采样',true,'正确。观测指向依赖多个系统协同，教学参数只是抽象表示。'),opt('保持馈源不动，任意旋转整面反射面',false,'这不符合固定式FAST的结构。需要调整主动反射面与馈源协同。')],fact:'真实FAST由复杂控制系统完成精密定位，当前操作仅为无量纲教学示意。'},
  {id:'spectrum',title:'辨认候选信号与干扰',tag:'数据辨析',prompt:'打开三组完全合成的时间序列。哪一组具有值得进一步复核的重复结构？请先查阅至少两组数据，再作判断。',type:'spectrum',need:2,
   evidence:[ev('A · 随机噪声','波动不规则，没有显示清晰的稳定重复模式。'),ev('B · 周期峰值','出现重复的峰值结构，可列为候选，但还不足以确认其天文来源。'),ev('C · 突发窄带干扰','显示出可能与地面无线电源有关的异常，需要独立排查。')],
   options:[opt('将B标为待复核候选，并调查干扰',true,'周期性为候选提供线索。记录、复测和排除干扰之后才有可能形成可靠结论。'),opt('峰值清晰，立刻向公众宣布发现',false,'单段合成数据不能支持科学发现的宣告。'),opt('将所有异常信号直接删除',false,'无法区分干扰与有价值信号，删除将造成潜在的信息损失。')],fact:'图形全部由前端程序合成，不是FAST实际观测数据。'},
  {id:'validation',title:'科学发现还差哪一步',tag:'研究记录',prompt:'已有一段候选记录，现在需要形成科研日志。请检查观测条件、干扰情况与重复性证据。',type:'inspection',need:3,
   evidence:[ev('观测时段','单时段记录可能受到偶发条件影响。'),ev('干扰排查','应核查候选信号能否由地面发射或设备效应解释。'),ev('重复观测','复测和独立分析能检验候选是否具有可重复性。')],
   options:[opt('保留候选，安排复测并记下不确定性',true,'研究记录将该信号标为候选，而非确证发现。'),opt('因已看到一次峰值，直接判定为新天体',false,'证据尚不足以完成科学确证。')],fact:'科学工作强调可复核的证据链；此处为教学科研过程。'}],
 'build.construction':[
  {id:'structure',title:'识读大型反射面结构',tag:'构件认识',prompt:'进入建设现场的示意模型。检查索网、反射面板和支撑系统，说明这些部件怎样共同工作。',type:'structure',need:3,
   evidence:[ev('索网','大跨度索网为反射面提供重要的可调支承体系。'),ev('反射面板','许多面板组成巨型反射面，其定位精度需要控制与检测。'),ev('支撑塔与馈源索系','支撑结构和索系服务于馈源系统的稳定定位。')],
   options:[opt('按照设计文件核查各部件的连接与测量关系',true,'识读结构与复核测量构成安装工作的基础。'),opt('构件能摆放进去，就表示精度一定合格',false,'位置接近不等于满足设计精度，仍需要测量和验收。')],fact:'工程结构为简化模型，不用于任何真实施工操作。'},
  {id:'assembly',title:'一块反射面板的复核',tag:'模拟装配',prompt:'通过教学滑块调节局部构件偏差和索网对准参数，观察测量结果。只有在允许的模拟范围内，才能提交复核。',type:'assembly',need:1,
   evidence:[ev('测量工具','装配操作需要独立测量来确认定位状态。'),ev('现场交接','偏差记录要能传递给下一道工序。')],
   options:[opt('记录检测值并向下一工序交接',true,'构件在教学容差内，并留有复核记录。'),opt('省略检测，直接覆盖先前记录',false,'关键检测不能被跳过。')],fact:'滑块与容差纯为游戏抽象数值，没有真实施工指导意义。'},
  {id:'weather',title:'现场出现异常警报',tag:'安全决策',prompt:'模拟施工现场出现警报，检测值不稳定。工期紧张，你会怎样处理？',type:'inspection',need:2,
   evidence:[ev('现场状态','警报意味着当前条件需要进一步确认。'),ev('作业权限','暂停和复核需要按现场专业制度报告及执行。'),ev('工序记录','保留原始检测值有助于判断风险和后续处理。')],
   options:[opt('暂停相关作业，按程序上报并检查',true,'安全处置优先，未经确认不应继续推进高风险作业。'),opt('为了赶进度，忽略警报继续施工',false,'忽略警报会让人员与设备暴露于不必要的风险。')],fact:'事件为虚构教学情境，不代表FAST建设现场曾发生该事件。'}],
 'build.operation':[
  {id:'diagnosis',title:'运行设备的状态巡检',tag:'设备诊断',prompt:'建设完成后，维护仍然持续。请查看三个设备的合成监测数据，找出值得复核的一项。',type:'inspection',need:3,
   evidence:[ev('索网监测 · 正常','模拟张力变化处于教学参考范围。'),ev('驱动器反馈 · 异常','模拟定位误差高于教学参考值，需要专业人员进一步复核。'),ev('馈源舱状态 · 待比较','单次读数不能替代一段时间的趋势分析。')],
   options:[opt('标记驱动器异常，按运维流程安排复核',true,'定位反馈值得关注，应通过完整的运维程序进一步分析。'),opt('单靠一次异常读数直接更换全部设备',false,'过度处置也需要证据，实际维护需分析原因并履行专业程序。')],fact:'监测值完全合成，非真实运行故障或设备数据。'},
  {id:'maintenance',title:'怎样安排维护任务',tag:'风险协调',prompt:'一项设备检查可能影响模拟观测排期。请综合安全、人员权限和时间安排作出决定。',type:'inspection',need:3,
   evidence:[ev('设备状态','需要记录异常与正常设备的差别。'),ev('安全管理','专业维护前应按制度完成风险分析和作业准备。'),ev('观测排期','维护计划需要与科研任务协调。')],
   options:[opt('先风险评估、报告并协调维护窗口',true,'兼顾设备安全、科研连续性与运维权限。'),opt('为不影响排期，远程跳过警报继续运行',false,'规避风险报告并不能消除设备风险。')],fact:'不提供真实设备维修参数、步骤或控制接口。'},
  {id:'explain',title:'向年轻人解释工程',tag:'工程记忆',prompt:'一位研学访客想知道“天眼建好了为什么还要维护”。请查看结构档案并给出解释。',type:'structure',need:2,
   evidence:[ev('建造档案','科学装置依靠长期建造、安装精度和跨工种协作。'),ev('运行档案','主动反射面、馈源系统与测控设施需要持续监测和维护。'),ev('建设者视角','工程运行离不开建设者与运行维护人员的持续劳动。')],
   options:[opt('讲解长期维护、监测和多岗位协作',true,'准确说明了大型科学基础设施持续运行所需的工程劳动。'),opt('建成后所有构件都不会发生变化，无需检查',false,'长期稳定运行需要持续的测量、检修和质量管理。')],fact:'角色为教学合成，并未将具体建设者的经历编为未经核实的口述原话。'}],
 'public.construction':[
  {id:'livemap',title:'记下建设前后的生活空间',tag:'地方空间',prompt:'你是一位生活在周边的虚构居民。请标记居住、生产和通行空间，并思考工程变化可能带来哪些问题。',type:'community',need:2,
   evidence:[ev('居住空间','住处与熟悉的邻里往来构成地方生活的重要部分。'),ev('生产空间','土地、农业和就业条件可能影响居民的关注重点。'),ev('通行路线','道路和日常出行需要作为独立问题加以记录。')],
   options:[opt('记录变化与疑问，向有职责的单位核实',true,'记录具体空间及待核实事项，既保留居民经验，也避免过度推断。'),opt('根据游戏地图推定每一户都发生了相同变化',false,'不同家庭的经历可能存在差异，简化地图不足以得出普遍结论。')],fact:'社区点位仅为示意；不代表任何具体家庭的真实搬迁、补偿或个人经历。'},
  {id:'consult',title:'参加一次模拟交流',tag:'社区对话',prompt:'对于工程建设，你更关心道路、生活安排还是科学设备？请选择至少两个议题，阅读不同的回答。',type:'community',need:2,
   evidence:[ev('道路与出行','需要了解施工期道路变化和日常通行信息，应核实当地管理部门公布的安排。'),ev('居住与生产','不同家庭有不同利益，需要取得实际资料，不宜从工程规模推测每户结果。'),ev('科研与电磁环境','射电观测对电磁环境敏感，相关保护安排应说明目的、范围与适用规则。')],
   options:[opt('保留个人关注点并整理公开咨询问题',true,'对具体问题的关心没有统一顺序，记录并持续求证是合理做法。'),opt('将一位模拟人物的回答当作所有居民的意见',false,'一个人物的说法不能自动代表整个社区。')],fact:'对话为教学示例，不是实地受访者的逐字引语。'},
  {id:'memory',title:'让问题留在历史档案中',tag:'记忆归档',prompt:'建设时代结束前，请区分已经知道的历史事实与尚未得到证实的地方生活问题。',type:'archive',need:2,
   evidence:[ev('工程节点','2011年开工、2016年落成属于可查证的工程历史节点。'),ev('生活经验','家庭、道路与空间变化需要个体材料支撑。'),ev('资料局限','一张模拟地图无法验证具体家庭的补偿、迁居或生活态度。')],
   options:[opt('把未核实的具体经历标为待访谈问题',true,'这份档案将随角色延续至运行时代，后续可以继续核对。'),opt('将所有尚未核实的问题标记为“已解决”',false,'缺少资料时应保留不确定性，避免把推断写成事实。')],fact:'可在运行期继续回看建设期记录；本游戏不会自动编造问题的解决结果。'}],
 'public.operation':[
  {id:'visit',title:'选择一条负责任的参观路线',tag:'公众参观',prompt:'请检查核心区、中间区和边远区的示意知识点，然后决定怎样规划公众参观。',type:'zones',need:3,
   evidence:[ev('核心区 · 0—5公里','2019年办法对核心区内无线电发射设备等作严格限制，公众参观须遵守现场要求。'),ev('中间区 · 5—10公里','中间区的相关活动实行分级保护管理，不能简单认定一切活动都被禁止。'),ev('边远区 · 10—30公里','边远区同样可能有电磁环境管理要求，应按活动性质核查具体规定。')],
   options:[opt('依据开放信息和现场规定选择合规路线',true,'既能开展科学参观，也能维护电磁波宁静区的管理要求。'),opt('地图上可以看到科研设施，就表示任何人都能进入',false,'可见不等于开放，概念地图不能替代实际参观许可。')],fact:'分区依据2019年4月1日起施行的保护办法。位置示意不构成真实边界测绘。'},
  {id:'quiet',title:'电磁环境为什么要保护',tag:'干扰试验',prompt:'对比三种合成无线电情境的干扰表现。试验不涉及现实设备控制，也不能代替电磁兼容检测。',type:'signal',need:2,
   evidence:[ev('正常弱信号','遥远天体的射电信号非常微弱，环境干扰会影响观测。'),ev('附近无线电设备','实际影响与设备、频率、距离等条件相关，需要专业排查。'),ev('合法合规措施','现场寄存、禁止擅自携带与依法审批等要求依区域和活动而异。')],
   options:[opt('了解分区规则，按现场要求使用或寄存设备',true,'保护射电环境需要公众遵守明确规则，也需要管理部门依规协调。'),opt('自行闯入设施周边关闭任何可见电器',false,'擅自处置他人设备既不可行也不安全，必须遵守管理程序。')],fact:'教学噪声条为抽象指示，不反映真实射频功率或安全暴露水平。'},
  {id:'sciencepublic',title:'做一份兼顾科学与地方的导览',tag:'科学传播',prompt:'以一名公众科普讲述者的身份，查阅科学原理、工程节点与周边生活资料，再用自己的话写下一句导览说明。',type:'archive',need:2,
   evidence:[ev('科学原理','FAST通过固定反射面、主动调形和馈源系统接收微弱射电信号。'),ev('历史节点','工程于2016年落成，2020年通过国家验收并正式运行。'),ev('周边生活','科学装置与地方居民的通行、生产、记忆和参观活动存在具体联系，需要尊重不同经验。')],
   options:[opt('同时介绍科学装置与周边人的具体生活',true,'完整的科普叙事应当有事实依据，也应避免让地方人物只成为工程背景。'),opt('只讲自己编造的居民故事来增强感人效果',false,'真实人物经历需要可靠资料支持，不能为了传播效果虚构采访内容。')],fact:'文字由玩家自行撰写，保存在本机浏览器中，不向服务器上传。'}]
};
const key='guizhou-games-v16';
function empty(){return{fast:{},bridge:{seen:[],complete:false},truck:{seen:[],complete:[]}}}
function load(){try{const s=JSON.parse(localStorage.getItem(key));return s&&typeof s==='object'&&s.fast&&s.bridge&&s.truck?s:empty()}catch(_){return empty()}}
const store=load();
function save(){try{localStorage.setItem(key,JSON.stringify(store))}catch(_){}}
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const G={active:false,screen:'choose',role:'research',era:'construction',index:0,visited:new Set(),notice:'',success:'',selected:'',sliders:{left:30,right:70},drag:null,yaw:.48,pitch:.55,zoom:1,lastFocus:null,mapPeek:false,lastOutcome:'',
 get group(){return this.role+'.'+this.era},get tasks(){return missions[this.group]},get mission(){return this.tasks[this.index]},get progress(){return store.fast[this.group]||[]},
 init(){const resume=document.createElement('button');resume.id='fastResumeLab';resume.className='fast-resume-lab';resume.type='button';resume.textContent='◎ 返回天眼任务';resume.hidden=true;resume.addEventListener('click',()=>this.resume());document.body.appendChild(resume);['fastQuickStart','fastPulse'].forEach(id=>$(id)?.addEventListener('click',()=>this.open()));$('fastGameExit')?.addEventListener('click',()=>this.close());
 $('fastGameMain')?.addEventListener('click',e=>{const b=e.target.closest('[data-fast-action]');if(b)this.act(b.dataset.fastAction,b.dataset.id)});
 $('fastGameMain')?.addEventListener('input',e=>{if(e.target.dataset.fastValue){this.sliders[e.target.dataset.fastValue]=+e.target.value;this.updateIndicators()}if(e.target.id==='fastPublicNote')this.noteValue=e.target.value});
 $('fastGameMain')?.addEventListener('pointerdown',e=>{if(e.target.id==='fastScene'){this.drag={x:e.clientX,y:e.clientY,yaw:this.yaw,pitch:this.pitch};e.target.setPointerCapture(e.pointerId)}});
 $('fastGameMain')?.addEventListener('pointermove',e=>{if(!this.drag)return;this.yaw=this.drag.yaw+(e.clientX-this.drag.x)*.006;this.pitch=clamp(this.drag.pitch+(e.clientY-this.drag.y)*.005,.16,1.25);this.paint()});
 ['pointerup','pointercancel'].forEach(s=>$('fastGameMain')?.addEventListener(s,()=>this.drag=null));
 $('fastGameMain')?.addEventListener('wheel',e=>{if(e.target.id==='fastScene'){e.preventDefault();this.zoom=clamp(this.zoom*Math.exp(-e.deltaY*.0008),.68,1.7);this.paint()}},{passive:false});
 document.addEventListener('keydown',e=>{if(!this.active)return;if(e.key==='Escape'){this.close();e.stopPropagation()}});
 NS.onState((s,p)=>{if('site'in p){if(this.active&&s.site!=='fast')this.close();this.portal()}});
 setInterval(()=>this.portal(),500);this.portal();},
 portal(){const show=NS.state?.entered&&NS.state.site==='fast'&&!this.active&&!NS.Drive?.active&&NS.Geo?.mode==='demo';const q=$('fastQuickStart'),p=$('fastPulse');if(q){q.hidden=!show;const sm=q.querySelector('small');if(sm)sm.textContent='3种角色 · 2个时代 · 18项任务'}if(!p)return;p.hidden=!show;if(!show)return;
  const n=NS.DB?.nodes?.fast_core,en=NS.App?.engine;if(!n||!en)return;const pt=en.proj({x:n.scene_x,y:n.scene_y+145,z:n.scene_z});if(pt){p.style.left=clamp(pt.x+30,10,innerWidth-210)+'px';p.style.top=clamp(pt.y-55,110,innerHeight-170)+'px'}},
 open(){if(NS.Drive?.active||NS.PixelTruck?.openState)return;if(!NS.state?.entered){NS.App.enterMap();setTimeout(()=>this.open(),1200);return}if(this.active){if(this.mapPeek)this.resume();return}this.lastFocus=document.activeElement;
  if(NS.state.site!=='fast')NS.App.setSite('fast');this.active=true;this.mapPeek=false;this.screen='choose';this.notice='';this.success='';$('fastGameShell').hidden=false;document.body.classList.add('is-fast-playing');this.render();this.portal();$('fastGameExit')?.focus({preventScroll:true})},
 peek(){if(!this.active||this.screen!=='play')return;this.mapPeek=true;$('fastGameShell').hidden=true;document.body.classList.remove('is-fast-playing');document.body.classList.add('is-fast-map-peek');$('fastResumeLab').hidden=false;NS.App?.selectNode?.('fast_core',{focus:true,legend:true})},
 resume(){if(!this.active||!this.mapPeek)return;this.mapPeek=false;document.body.classList.remove('is-fast-map-peek');$('fastResumeLab').hidden=true;$('fastGameShell').hidden=false;document.body.classList.add('is-fast-playing');this.syncEra();this.render()},
 close(){if(!this.active)return;this.active=false;this.mapPeek=false;document.body.classList.remove('is-fast-map-peek');$('fastResumeLab').hidden=true;$('fastGameShell').hidden=true;document.body.classList.remove('is-fast-playing');this.portal();if(this.lastFocus?.isConnected)this.lastFocus.focus({preventScroll:true})},
 setEra(era){if(!eras[era])return;this.era=era;this.resetLocal();this.screen='choose';this.syncEra();this.render()},
 syncEra(){if(NS.state?.site!=='fast')return;NS.setState({timeline:eras[this.era].t,timelinePulse:(NS.state.timelinePulse||0)+1});NS.UI?.renderTimeline?.();NS.App?.engine?.temporalPulse?.(eras[this.era].t,.6)},
 resetLocal(){this.visited=new Set();this.notice='';this.success='';this.selected='';this.sliders={left:30,right:70};this.noteValue=''},
 start(){this.lastOutcome='';this.index=Math.min(this.progress.length,this.tasks.length);this.screen=this.index===this.tasks.length?'result':'play';this.resetLocal();this.syncEra();this.render()},
 act(action,id){if(action==='role'&&roles[id]){this.role=id;this.render();return}if(action==='era'&&eras[id]){this.era=id;this.render();return}
  if(action==='start'){this.start();return}if(action==='peek'){this.peek();return}if(action==='home'){this.screen='choose';this.resetLocal();this.render();return}if(action==='exit'){this.close();return}
  if(action==='restart'){delete store.fast[this.group];save();this.start();return}if(action==='other-era'){this.era=this.era==='construction'?'operation':'construction';this.start();return}
  if(this.screen!=='play'||!this.mission)return;
  const m=this.mission;if(action==='inspect'&&m.evidence[+id]){this.visited.add(+id);this.selected=id;this.notice=m.evidence[+id].detail;this.render();return}
  if(action==='measure'){const good=Math.abs(this.sliders.left-62)<=9&&Math.abs(this.sliders.right-58)<=9;if(good){this.visited.add('bench');this.notice='校验通过。当前两个教学参数相互匹配，已记录一条模拟检测结果。'}else{this.notice='两项参数尚未协同。请调整到标记附近，再提交模拟复核。'}this.render();return}
  if(action==='option'){const o=m.options[+id];if(!o)return;const ready=this.visited.size>=m.need&&(m.type!=='sync'&&m.type!=='assembly'||this.visited.has('bench'));
   if(!ready){this.notice='先完成本任务的资料查看与操作。当前已记录 '+this.visited.size+' 项，至少需要 '+m.need+' 项。';this.render();return}
   if(!o.good){this.notice=o.feedback+' 可以继续查看证据并修正判断。';this.render();return}
   const record={id:m.id,title:m.title,decision:o.name,evidence:[...this.visited].filter(x=>typeof x==='number').map(x=>m.evidence[x]?.name).filter(Boolean),note:(this.noteValue||'').trim().slice(0,280),at:new Date().toISOString()};
   if(!store.fast[this.group])store.fast[this.group]=[];store.fast[this.group].push(record);save();this.lastOutcome=o.feedback;this.index++;this.resetLocal();this.screen=this.index>=this.tasks.length?'result':'play';this.render();return}
  if(action==='look-left'){this.yaw-=.23;this.paint();return}if(action==='look-right'){this.yaw+=.23;this.paint();return}},
 choose(){const done=Object.entries(store.fast).reduce((n,[k,v])=>n+(Array.isArray(v)?v.length:0),0);
  return `<div class="fa-landing"><div class="fa-eyebrow">中国天眼 · 交互历史实验室 / 角色叙事</div><h2>以你的身份，走进两个时代</h2><p>同一座天眼，在科研、工程和周边生活中有不同的意义。选择身份与时代，在三维示意模型中检查证据、操作工具并作出判断。</p><div class="fa-metrics"><span><b>3</b> 种角色</span><span><b>2</b> 个时代</span><span><b>18</b> 项可玩任务</span><span><b>${done}</b> 项已归档</span></div>
   <h3>选择你扮演的角色</h3><div class="fa-role-grid">${Object.entries(roles).map(([id,r])=>`<button class="fa-role ${this.role===id?'active':''}" data-fast-action="role" data-id="${id}" aria-pressed="${this.role===id}"><span>${r.icon}</span><strong>${r.name}</strong><small>${r.desc}</small></button>`).join('')}</div>
   <h3>选择历史时代</h3><div class="fa-era-grid">${Object.entries(eras).map(([id,r])=>`<button class="fa-era ${this.era===id?'active':''}" data-fast-action="era" data-id="${id}" aria-pressed="${this.era===id}"><b>${r.name}</b><strong>${r.date}</strong><small>${r.desc}</small></button>`).join('')}</div>
   <div class="fa-cta"><div><b>本次体验</b><span>${roles[this.role].name} · ${eras[this.era].name} · 已完成 ${this.progress.length} / ${this.tasks.length} 项</span></div><button data-fast-action="start">${this.progress.length===this.tasks.length?'查看角色档案':'进入这段历史'} →</button></div>
   <p class="fa-truth">事实边界：历史节点和法规不因你的选择而改变。场景、人物与任务是明确标注的教学模拟；个人决定和学习记录只保存在当前浏览器。<br>参考依据：<a href="https://english.nao.cas.cn/Research2015/Facilities2015/Telescopes2015/202009/t20200914_243043.html" target="_blank" rel="noopener noreferrer">中国科学院国家天文台FAST技术介绍 ↗</a> · <a href="https://nao.cas.cn/news/zh/202001/t20200111_6407641.html" target="_blank" rel="noopener noreferrer">FAST通过国家验收 ↗</a> · <a href="https://www.moj.gov.cn/pub/sfbgw/flfggz/flfggzdfzwgz/202009/t20200924_142752.html" target="_blank" rel="noopener noreferrer">2019年电磁宁静区保护办法 ↗</a></p></div>`},
 scene(m){return `<div class="fa-scene"><canvas id="fastScene" aria-label="中国天眼透视示意模型，可以拖动旋转并通过下方按钮改变视角"></canvas><div class="fa-scene-meta"><span>${this.era==='construction'?'2011 · 建设期模型':'2022 · 运行期模型'}</span><span>可旋转的概念空间 · 非测绘图</span></div><div class="fa-hotspots" id="fastHotspots"></div></div><div class="fa-scene-controls"><button data-fast-action="look-left">↶ 旋转观察</button><button data-fast-action="look-right">旋转观察 ↷</button><button data-fast-action="peek">⌖ 回到3D主地图考察</button><span>拖动画面旋转，滚轮缩放；资料点也可在右侧点击</span></div>`},
 tool(m){if(m.type==='sync'||m.type==='assembly'){const a=this.sliders.left,b=this.sliders.right;const err=Math.round(Math.abs(a-62)*.7+Math.abs(b-58)*.8);return `<div class="fa-tool"><h4>${m.type==='assembly'?'局部装配测量台':'主动反射面—馈源协同台'}</h4><p>${m.type==='assembly'?'调整局部构件的两个抽象校准值。':'两个参数分别代表局部反射面与馈源控制的教学指令，并非现实方位角。'}</p><label> ${m.type==='assembly'?'面板定位（教学值）':'局部反射面（教学值）'} <output id="faLeft">${a}</output><input type="range" min="0" max="100" step="1" value="${a}" data-fast-value="left"></label><label>${m.type==='assembly'?'索网校准（教学值）':'馈源舱协调（教学值）'} <output id="faRight">${b}</output><input type="range" min="0" max="100" step="1" value="${b}" data-fast-value="right"></label><div class="fa-reference">教学校准参考 · 第一项 53—71，第二项 49—67。下方参数没有现实工程单位。</div><div class="fa-parameter"><span>教学协同偏差</span><strong id="faError">${err}</strong><small>将两个参数分别调整至绿色参考区间后复核</small></div><button class="fa-primary" data-fast-action="measure">◉ 提交模拟测量</button>${this.visited.has('bench')?'<span class="fa-pass">✓ 校验结果已保存</span>':''}</div>`}
  if(m.type==='spectrum'){return `<div class="fa-tool"><h4>合成波形比较台</h4><svg viewBox="0 0 420 130" role="img" aria-label="合成信号图，A为随机波动，B为周期峰，C为局部干扰"><path d="M10 24H410 M10 66H410 M10 108H410" stroke="#5f8c9f" stroke-width=".7"/><path d="M10 24l12 -4 12 5 13 -2 10 6 11 -9 13 3 10 4 14 -5 13 4 12 -3 13 2 14 -5 15 8 12 -6 12 2 14 -4 15 2 15 -6 13 8 14 -4 12 3 12 2 14 -7 10 2 14 4 15 -5 15 7" fill="none" stroke="#a8c4c8" stroke-width="2"/><path d="M10 68h25l5 -31 5 31h65l5 -31 5 31h65l5 -31 5 31h65l5 -31 5 31h65l5 -31 5 31h40" fill="none" stroke="#f6c879" stroke-width="2.3"/><path d="M10 108h90l5 -17 5 17h13l3 -17 3 17h9l4 -17 4 17h11l4 -17 4 17h10l5 -17 5 17h215" fill="none" stroke="#8ce0cd" stroke-width="2"/><g fill="#d6e5ee" font-size="11"><text x="10" y="16">A</text><text x="10" y="59">B</text><text x="10" y="101">C</text></g></svg><p>逐个点击下方数据卡查看说明，再决定是否将B标记为候选。三条曲线只表示特征差别，不包含真实观测信息。</p></div>`}
  if(m.type==='signal'){const k=this.visited.size;return `<div class="fa-tool"><h4>射电环境概念对照</h4><div class="fa-bars" aria-label="教学噪声示意"><span style="height:${30+k*15}%"></span><span style="height:${48+k*11}%"></span><span style="height:${24+k*13}%"></span><span style="height:${52+k*6}%"></span><span style="height:${36+k*12}%"></span><span style="height:${44+k*9}%"></span></div><p>这里的柱形为抽象展示。查看资料后请依据具体保护规则而非柱高决定怎么做。</p></div>`}
  if(m.type==='zones')return `<div class="fa-tool fa-zones"><h4>2019年电磁宁静区管理分级示意</h4><div class="fa-zone-rings"><div>边远区 10—30 km<div>中间区 5—10 km<div>核心区 0—5 km<div>FAST</div></div></div></div></div><p>圆环仅为教学图例，与当前3D模型比例无关。游戏不提供实际行政边界判定。</p></div>`;
  return `<div class="fa-tool"><h4>${m.type==='community'?'社区空间与交流记录':m.type==='inspection'?'测量与报告记录':m.type==='structure'?'工程结构分解档案':m.type==='archive'?'人物与历史档案':'地形与空间档案'}</h4><p>选取下方资料卡，理解不同证据之间的关系。所有现场人物和模拟检测数值都不指向真实个案。</p></div>`},
 play(){const m=this.mission;if(!m)return this.result();const n=this.progress.length;
  const prior=store.fast[this.role+'.construction']||[];const past=this.era==='operation'&&prior.length?`<div class="fa-carry"><b>跨时代档案</b> 你在建设时期已记录${prior.length}项工作。${this.role==='public'?'当时记录的生活疑问仍需根据新的访谈材料核实。':this.role==='research'?'你可以将早期工程精度认识带入当代科学观测。':'你可以依据早期的结构检查经历理解持续维护。'}</div>`:'';
  return `<div class="fa-layout"><aside class="fa-left"><div class="fa-role-tag">${roles[this.role].icon} ${roles[this.role].name} <span>${eras[this.era].date}</span></div><p>${roles[this.role].desc}</p><div class="fa-track">${this.tasks.map((t,i)=>`<div class="${i<this.index?'done':i===this.index?'current':''}"><b>${i<this.index?'✓':String(i+1).padStart(2,'0')}</b><span>${escapeHTML(t.title)}</span></div>`).join('')}</div><div class="fa-left-footer"><button data-fast-action="home">← 更换角色或时代</button><p>相同角色在两时代有独立任务记录，完成后可查看同一人物的历史档案。</p></div></aside>
  <article class="fa-play"><div class="fa-eyebrow">任务 ${this.index+1} / ${this.tasks.length} · ${m.tag} · ${eras[this.era].name}</div><h2>${m.title}</h2>${this.lastOutcome?`<div class="fa-carry">上一任务反馈：${escapeHTML(this.lastOutcome)}</div>`:''}${past}<p class="fa-lead">${m.prompt}</p>${this.scene(m)}${this.tool(m)}<div class="fa-fact">${m.fact}<br><a href="https://english.nao.cas.cn/Research2015/Facilities2015/Telescopes2015/202009/t20200914_243043.html" target="_blank" rel="noopener noreferrer">工程技术参考 ↗</a> · <a href="https://nao.cas.cn/news/zh/202001/t20200111_6407641.html" target="_blank" rel="noopener noreferrer">工程历史参考 ↗</a>${this.era==='operation'?' · <a href="https://www.moj.gov.cn/pub/sfbgw/flfggz/flfggzdfzwgz/202009/t20200924_142752.html" target="_blank" rel="noopener noreferrer">保护办法 ↗</a>':''}</div></article>
  <aside class="fa-right"><div class="fa-side-head"><b>资料与观察</b><span>已读 ${this.visited.size} / ${m.need} 项</span></div><div class="fa-evidence">${m.evidence.map((d,i)=>`<button class="${this.visited.has(i)?'seen':''} ${String(this.selected)===String(i)?'selected':''}" data-fast-action="inspect" data-id="${i}"><span>${this.visited.has(i)?'✓':'◇'}</span><strong>${d.name}</strong><small>${this.visited.has(i)?d.detail:'点击调查 / 查阅'} </small></button>`).join('')}</div>${m.id==='sciencepublic'?`<label class="fa-note">我的一句导览说明<textarea id="fastPublicNote" maxlength="280" placeholder="可以同时写下科学事实与周边人的生活，不要虚构具体受访者原话">${escapeHTML(this.noteValue||'')}</textarea></label>`:''}
    <div class="fa-decision"><h3>你准备怎样做？</h3><p>请先查阅任务证据${m.type==='sync'||m.type==='assembly'?'并完成参数校验':''}，再作判断。</p>${m.options.map((o,i)=>`<button data-fast-action="option" data-id="${i}">${o.name} <span>›</span></button>`).join('')}</div><div class="fa-notice" role="status" aria-live="polite">${escapeHTML(this.notice||'点击资料卡，观察模型或使用任务工具。每次判断都允许修正。')}</div></aside></div>`},
 result(){const a=this.progress,b=store.fast[this.role+'.'+(this.era==='construction'?'operation':'construction')]||[];
  return `<div class="fa-result"><span class="fa-result-icon">✦</span><div class="fa-eyebrow">${roles[this.role].name} · ${eras[this.era].name}</div><h2>这一时期的探索已归档</h2><p>你完成了${a.length}项教学任务。下面记录的是你查看过的证据与作出的判断。真实历史节点未被修改。</p><div class="fa-result-list">${a.map((r,i)=>`<article><small>0${i+1} · ${escapeHTML(r.title)}</small><strong>${escapeHTML(r.decision)}</strong><p>查阅：${escapeHTML((r.evidence||[]).join('、')||'模拟参数校验')}${r.note?'；个人说明：'+escapeHTML(r.note):''}</p></article>`).join('')}</div><div class="fa-cta"><div><b>另一个时代</b><span>${b.length}/3项已归档。通过同一角色比较工程建设与运行中的变化。</span></div><button data-fast-action="other-era">进入另一个时代 →</button></div><div class="fa-result-actions"><button data-fast-action="restart">重新体验这段时期</button><button data-fast-action="home">选择其他角色</button><button data-fast-action="exit">返回地图</button></div><p class="fa-truth">历史事实、地理示意、虚构任务已分别标注。浏览器本地记录可通过清理网站数据删除。</p></div>`},
 render(){if(!this.active)return;const title=this.screen==='choose'?'身份选择':this.screen==='result'?'角色档案':this.mission?.tag||'进行中';$('fastGameChapter').textContent=title;
  const completed=Object.values(store.fast).reduce((a,v)=>a+(Array.isArray(v)?v.length:0),0);$('fastGameScore').textContent=`${completed} / 18 项已归档`;
  $('fastGameMain').innerHTML=this.screen==='choose'?this.choose():this.screen==='result'?this.result():this.play();$('fastGameMain').scrollTop=0;this.updateIndicators();this.paint();},
 updateIndicators(){const left=$('faLeft'),right=$('faRight'),err=$('faError');if(left)left.textContent=this.sliders.left;if(right)right.textContent=this.sliders.right;if(err)err.textContent=Math.round(Math.abs(this.sliders.left-62)*.7+Math.abs(this.sliders.right-58)*.8);this.paint()},
 paint(){if(!this.active||this.screen!=='play')return;const can=$('fastScene');if(!can)return;const w=Math.max(200,can.clientWidth),h=Math.max(180,can.clientHeight);const d=Math.min(devicePixelRatio||1,2);can.width=w*d;can.height=h*d;const c=can.getContext('2d');if(!c)return;c.scale(d,d);const grad=c.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#071a31');grad.addColorStop(1,'#1c4453');c.fillStyle=grad;c.fillRect(0,0,w,h);
  const sz=Math.min(w/560,h/340)*this.zoom,s=Math.sin(this.yaw),co=Math.cos(this.yaw),sp=Math.sin(this.pitch),cp=Math.cos(this.pitch);
  const project=(x,y,z)=>{const xx=x*co-z*s,zz=x*s+z*co;return{x:w*.50+xx*sz,y:h*.62-(y*cp-zz*sp)*sz}};
  const path=(arr,stroke,width)=>{c.beginPath();arr.forEach((p,i)=>{const q=project(...p);i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y)});c.strokeStyle=stroke;c.lineWidth=width;c.stroke()};
  for(let z=-230;z<=230;z+=25){const row=[];for(let x=-250;x<=250;x+=16)row.push([x,-15+17*Math.cos(x/81)*Math.sin(z/68),z]);path(row,'#639c9940',.9)}
  const r=125;for(let k=10;k>=0;k--){const rr=r*k/10,arr=[];for(let i=0;i<=90;i++){const a=i*Math.PI*2/90;arr.push([rr*Math.cos(a),-35+55*(rr/r)**2,rr*Math.sin(a)])}path(arr,this.era==='construction'?'#b3c5b7a0':'#b5d9e0a8',1.35)}
  for(let k=0;k<20;k++){const arr=[];for(let j=0;j<=10;j++){const rr=r*j/10,a=k*Math.PI/10;arr.push([rr*Math.cos(a),-35+55*(rr/r)**2,rr*Math.sin(a)])}path(arr,'#bed0db85',.95)}
  for(const [x,z] of [[-156,-134],[156,-134],[-156,134],[156,134]]){path([[x,0,z],[x,90,z]],'#e1d7c0',2.6);path([[x,90,z],[0,41,0]],'#e0b77977',1.2)}
  const cab=project((this.sliders.right-58)*.24,43+(this.sliders.left-62)*.16,0);c.fillStyle='#f7c97c';c.beginPath();c.arc(cab.x,cab.y,5,0,7);c.fill();
  if(['sync','assembly'].includes(this.mission.type)){const q=project(0,-35,0);c.strokeStyle='#ffe7a2aa';c.lineWidth=2;c.setLineDash([5,5]);c.beginPath();c.moveTo(cab.x,cab.y);c.lineTo(q.x,q.y);c.stroke();c.setLineDash([])}
  if(this.era==='construction'){c.fillStyle='#f3c67b';c.font='12px sans-serif';c.fillText('建设时期 · 局部构件与支承系统示意',16,h-17)}else{c.fillStyle='#93e2d8';c.font='12px sans-serif';c.fillText('运行时期 · 主动反射面与馈源协同示意',16,h-17)}
  // Accessible hotspots mirror the evidence cards; their positions are relative to concept geometry only.
  const box=$('fastHotspots');if(box){box.replaceChildren();const spots=this.mission.evidence.slice(0,3);const loc=[[-140,65,-65],[140,55,-50],[0,45,145]];
   spots.forEach((item,i)=>{const p=project(...loc[i]);const btn=document.createElement('button');btn.type='button';btn.className='fa-hotspot'+(this.visited.has(i)?' seen':'');btn.style.left=clamp(p.x,42,w-45)+'px';btn.style.top=clamp(p.y,28,h-32)+'px';btn.dataset.fastAction='inspect';btn.dataset.id=i;btn.textContent=(this.visited.has(i)?'✓ ':'✦ ')+item.name;box.appendChild(btn)})}
 }
};
NS.FastGame=G;NS.LearningRecords=store;NS.saveLearningRecords=save;document.addEventListener('DOMContentLoaded',()=>G.init());
})(window.SpatialApp=window.SpatialApp||{});
