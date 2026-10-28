/* V30 — conceptual bridge approach clearance. Render-time geometry ONLY.
 * The inherited synthetic heightfield intersects the route-locked teaching drive.
 * Keep original DB/DEM untouched; adjust only display vertices around the route.
 * Never use this visual cut as surveyed earthworks or road construction data.
 */
(function(NS){'use strict';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const smooth=t=>{const q=clamp(t,0,1);return q*q*(3-2*q)};
const Cut={
 source:'visual conceptual road-clearance; not measured terrain',
 laneHalf:15,freeHalf:29,bankHalf:155,deckGap:23,
 // Route lookup uses the original authored driving centreline; no duplicate geometry.
 height(x,z,raw){
  const route=NS.DriveRoutes?.bridge,points=route?.points;
  if(!points||points.length<2||x<points[0].x-280||x>points[points.length-1].x+280||Math.abs(z)>520)return raw;
  let best=Infinity,road=0;
  for(let i=0;i<points.length-1;i++){
   const a=points[i],b=points[i+1],dx=b.x-a.x,dz=b.z-a.z,den=dx*dx+dz*dz;
   const t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(den||1),0,1);
   const cx=a.x+dx*t,cz=a.z+dz*t,d2=(x-cx)*(x-cx)+(z-cz)*(z-cz);
   if(d2<best){best=d2;road=a.y+(b.y-a.y)*t;}
  }
  if(best>=this.bankHalf*this.bankHalf)return raw;
  // V34: limit the visual road-cut to a narrow approach corridor. The former 360m
  // half-width flattened approximately 720m of the valley, hiding both mountains.
  // Keep distant ridge geometry unchanged; never alter source DEM/database.
  const distance=Math.sqrt(best), cap=road-this.deckGap;
  if(raw<=cap)return raw; // never raise a canyon floor or turn it into a slab
  const weight=distance<=this.freeHalf?1:1-smooth((distance-this.freeHalf)/(this.bankHalf-this.freeHalf));
  return raw-(raw-cap)*weight;
 },
 evaluate(x,z,raw){return this.height(x,z,raw)}
};
NS.BridgeRoadClearanceV30=Cut;
})(window.SpatialApp=window.SpatialApp||{});
