/* V4.4 | Focus the evidence, not the interface.
   Progressive enhancement: no modification to values, categories, or data. */
(()=>{
  'use strict';
  const figures=[
    {selector:'.archive-v3 .v3-time-paper',number:'图一',title:'日期记录的月份分布',scope:'有日期的原始评论；并非平台总体热度。'},
    {selector:'#employment .em-explore-visual',number:'图二',title:'696篇笔记的框架配对',scope:'47条非零流向；线宽为篇数，非时间趋势。'},
    {selector:'#public .pv-evidence-chart',number:'图三',title:'公共价值：评价对象与方向',scope:'共现编码记录；比例仅以明确立场为分母。'},
    {selector:'#ability .ab-v34-flourish-fallback',number:'图四',title:'被看见的专业能力',scope:'1,959次能力提及；不是1,959位独立用户。'},
    {selector:'.na-v35 .na-v35-matrix',number:'图五',title:'评价对象与依据关系',scope:'80条归档聚合关系；不要与正文筛出的60组相加。'},
    {selector:'.al38-page .al38-chart-shell',number:'图七',title:'筛选后的月份观察窗',scope:'仅显示符合当前筛选、并具有日期的记录。'},
    {selector:'.rm39-archive .rm39-research-stats',number:'图八',title:'教育重构所依据的研究发现',scope:'游戏选择是情境设计，不是实测教育效果。'},
    {selector:'.mp41 .mp41-flourish',number:'图九',title:'研究工序与边界',scope:'目的性样本；不可外推为全部网民态度。'}
  ];
  const escape=s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  let focused=null,returnFocus=null,scheduled=false;
  function leaveFocus(){
    if(!focused)return;
    focused.classList.remove('v44-focused');
    document.body.classList.remove('v44-focus-open');
    const back=returnFocus;focused=null;returnFocus=null;
    if(back?.isConnected)back.focus({preventScroll:true});
  }
  function enterFocus(section,button){
    if(focused===section)return;
    leaveFocus();returnFocus=button;focused=section;
    section.classList.add('v44-focused');document.body.classList.add('v44-focus-open');
    section.querySelector('[data-v44-close]')?.focus({preventScroll:true});
  }
  function enhanceOne(c){
    document.querySelectorAll(c.selector).forEach((section)=>{
      if(section.hasAttribute('data-v44-enhanced'))return;
      section.setAttribute('data-v44-enhanced','1');
      section.setAttribute('data-v44-chart-name',c.title);
      // The toolbar is a simple operation, not a headline competing with the chart.
      const tools=document.createElement('div');tools.className='v44-tools';
      tools.innerHTML=`<span class="v44-figure-id">${escape(c.number)} · ${escape(c.title)}</span><button type="button" data-v44-expand aria-label="放大阅读：${escape(c.title)}">放大读图 ↗</button><button type="button" data-v44-close aria-label="关闭放大图表">返回正文 ×</button>`;
      section.prepend(tools);
      tools.querySelector('.v44-figure-id').title=c.scope;
    });
  }
  function enhance(){scheduled=false;for(const c of figures)enhanceOne(c);
    if(focused&&!focused.isConnected)leaveFocus();}
  function later(){if(scheduled)return;scheduled=true;requestAnimationFrame(enhance)}
  document.addEventListener('click',e=>{
    const expand=e.target.closest('[data-v44-expand]');
    if(expand){const section=expand.closest('[data-v44-enhanced]');if(section){e.preventDefault();enterFocus(section,expand)}return}
    if(e.target.closest('[data-v44-close]')){e.preventDefault();leaveFocus()}
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&focused){e.preventDefault();leaveFocus()}
    if(e.key==='Tab'&&focused){
      // Keep keyboard focus inside the full-screen reading surface.
      const focusable=[...focused.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(x=>x.getClientRects().length);
      if(!focusable.length)return;
      if(e.shiftKey&&document.activeElement===focusable[0]){e.preventDefault();focusable.at(-1).focus()}
      else if(!e.shiftKey&&document.activeElement===focusable.at(-1)){e.preventDefault();focusable[0].focus()}
    }
  });
  // Route and game interactions replace sections dynamically; observation is idempotent.
  const target=document.querySelector('#main')||document.body;
  const observer=new MutationObserver(later);observer.observe(target,{childList:true,subtree:true});
  later();
})();
