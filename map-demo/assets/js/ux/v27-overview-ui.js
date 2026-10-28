/* V27 navigation, no inferred connection road between the two places. */
(function(NS){'use strict';
 const init=()=>document.querySelectorAll('[data-v27-site]').forEach(b=>b.addEventListener('click',()=>{
  const site=b.dataset.v27Site;if(['fast','huajiang'].includes(site))NS.App?.setSite(site,true);
 }));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})(window.SpatialApp=window.SpatialApp||{});
