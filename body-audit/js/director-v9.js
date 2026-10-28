(function(root){'use strict';
const D={timer:null,chapter:0};
// A shot follows an observed consequence, never simply the end of a chapter.
const shots={
 gate:{tone:'scar',ord:'01 / 等待',headline:'申请暂时受阻',line:'平台没有查到可用的旧病历，要求补资料后再申请人工复核。'},
 access:{tone:'open',ord:'01 / 通行',headline:'可以申请人工复核',line:'平台查到了旧记录，允许提交申请；这不代表医生已接诊。'},
 urgent:{tone:'care',ord:'01 / 警讯',headline:'请先寻求医疗帮助',line:'你报告了可能需要紧急处理的症状，不必等待旧记录核验。'},
 unclear:{tone:'care',ord:'01 / 待核实',headline:'症状还需要核实',line:'你暂时无法确认伴随症状，平台不会直接作出复核分流结果。'},
 erasure:{tone:'scar',ord:'02 / 漏记',headline:'AI记录漏了一部分',line:'你刚才说过的重要信息没有写进问诊摘要。'},
 restored:{tone:'open',ord:'02 / 找回',headline:'漏记内容已补入记录',line:'你指出遗漏后，AI已更新这份问诊摘要。'},
 extract:{tone:'scar',ord:'03 / 未分得',headline:'数据被调用，采集者未分成',line:'本次平台产生收入，但按这份合同无需另付复用分成。'},
 shared:{tone:'open',ord:'03 / 分账',headline:'本次调用向采集者分成',line:'平台调用数据后，按照持续分账合同向采集者支付费用。'},
 control:{tone:'control',ord:'03 / 控制台',headline:'平台获得一次调用收入',line:'伊森调用了已上传的动作样本，采集者无需再次完成动作。'},
 sever:{tone:'scar',ord:'03 / 停工',headline:'本批采集订单结束',line:'阿玛拉已完成本批工作，是否续聘仍待通知；数据可按合同继续使用。'},
 finale:{tone:'neutral',ord:'终章 / 身体与数据',headline:'三次数据处理，三种后果',line:'资料影响复核申请，记录影响信息完整性，合同影响后续收益。'}
};
function updateRail(){const rail=document.getElementById('evidenceRail');if(!rail)return;rail.classList.toggle('hidden',D.chapter<1);['evidenceOne','evidenceTwo','evidenceThree'].forEach((id,i)=>document.getElementById(id)?.classList.toggle('acquired',D.chapter>i));}
function clearShot(){document.body.dataset.rupture='none';document.body.dataset.directorTone='none';document.getElementById('directorImpact')?.classList.remove('active');}
function burst(type,detail={}){const s=shots[type];if(!s)return;clearTimeout(D.timer);clearShot();document.body.dataset.rupture=type;document.body.dataset.directorTone=s.tone;const a=document.getElementById('directorImpact');if(!a)return;
 document.getElementById('impactOrdinal').textContent=s.ord;document.getElementById('impactHeadline').textContent=detail.headline||s.headline;document.getElementById('impactSubline').textContent=detail.line||s.line;
 void a.offsetWidth;a.classList.add('active');const ms=document.body.classList.contains('reduced-motion')?320:2350;D.timer=setTimeout(clearShot,ms);updateRail();}
function clear(){clearTimeout(D.timer);clearShot();updateRail();}
function collected(n){D.chapter=Math.max(D.chapter,n);updateRail();}
function restart(){D.chapter=0;clear();}
root.FleshDirector={burst,clear,collected,restart,shots};
})(globalThis);
