/* V4.7 — cinematic chapter cut and scroll-triggered evidence entrance */
(function(){'use strict';
let mask=document.querySelector('.v47-curtain');let transitioning=false;
function getMask(){if(mask)return mask;mask=document.createElement('div');mask.className='v47-curtain';mask.setAttribute('aria-hidden','true');mask.innerHTML='<div class="v47-drape v47-drape--l"></div><div class="v47-drape v47-drape--r"></div><div class="v47-curtain-title">第二卷 · 就业结算</div>';document.body.append(mask);return mask}
document.addEventListener('click',e=>{const a=e.target.closest('a[data-v47-curtain]');if(!a||transitioning)return;const href=a.getAttribute('href');if(!href?.startsWith('#/'))return;e.preventDefault();const quiet=matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('motion-paused');if(quiet){location.hash=href;return}
 const overlay=getMask();transitioning=true;overlay.classList.remove('is-opening');overlay.classList.add('is-active');setTimeout(()=>{location.hash=href;setTimeout(()=>overlay.classList.add('is-opening'),120)},480);setTimeout(()=>{overlay.classList.remove('is-active','is-opening');transitioning=false},1850);
},true);
// chart reveal on native/local graphics across chapters; Flourish embeds retain their own animation source.
let observer=null;
function scan(){if(observer)observer.disconnect();if(!('IntersectionObserver' in window))return;observer=new IntersectionObserver(entries=>{for(const ent of entries){if(!ent.isIntersecting)continue;const el=ent.target;if(el.dataset.v47Animated==='1')continue;el.dataset.v47Animated='1';if(document.body.classList.contains('motion-paused')||matchMedia('(prefers-reduced-motion: reduce)').matches){el.classList.add('v47-chart-visible');continue;}el.classList.remove('v47-chart-visible');void el.offsetWidth;el.classList.add('v47-chart-visible');}}, {threshold:.22});document.querySelectorAll('#main .em-comparison,#main .em-flow-svg,#main .pv-evidence-chart,#main .pv-plot,#main .na-v35-reading .na-matrix,#main .ab-v34-stat,#main .lab38-month-chart,#main .v3-time-paper').forEach(e=>observer.observe(e))}
const mo=new MutationObserver(()=>setTimeout(scan,90));const main=document.querySelector('#main');if(main)mo.observe(main,{childList:true});scan();
})();
