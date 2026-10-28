/* V26 relative-coordinate Beipanjiang water corridor. This is a teaching visualization,
   not an imported surveyed shoreline, charted water depth, gauge or navigable route. */
(function(NS){'use strict';
// Extended scene corridor. Its centreline, width and banks are an authored visualization,
// not surveyed bathymetry, navigation guidance or real-time river stage.
const bridgeWaterY=650-625, start=-3420,end=3420;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const at=t=>{
 const q=clamp(t,0,1),z=start+(end-start)*q;
 const x=28*Math.sin(z*.0012)+16*Math.sin(z*.0034)+8*Math.sin(z*.0057);
 // One direction of downhill flow; water surface and vessel use one stable reference.
 const y=bridgeWaterY-z*.009;
 const width=110+24*Math.sin(z*.00084+1.2)**2+11*Math.sin(z*.0022)**2;
 return {x,y,z,width};
};
const nearest=(x,z)=>{const t=clamp((z-start)/(end-start),0,1);return {...at(t),t}};
const landHeight=(x,z,raw)=>{
 const river=nearest(x,z),distance=Math.abs(x-river.x),wet=river.width*1.16,bank=wet+220;
 if(distance>=bank)return raw;
 // Gentle synthetic cut limited to the display geometry, leaving the original elevation data untouched.
 const mix=distance<=wet?1:Math.pow((bank-distance)/(bank-wet),2)*(3-2*(bank-distance)/(bank-wet));
 const floor=river.y-(distance<=river.width?9:4);
 return raw*(1-mix)+Math.min(raw,floor)*mix;
};
NS.HuajiangRiver={at,nearest,landHeight,start,end,bridgeWaterY,sourceStatus:'SIMULATED',riverName:'北盘江·花江峡谷段',boardingT:.49};
})(window.SpatialApp=window.SpatialApp||{});
