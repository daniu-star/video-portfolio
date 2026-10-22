(function(NS){'use strict';const M={};
M.clamp=(v,a,b)=>Math.max(a,Math.min(b,v));M.lerp=(a,b,t)=>a+(b-a)*t;M.ease=t=>1-Math.pow(1-t,3);M.smooth=t=>t*t*(3-2*t);
M.hex=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
M.mix=(a,b,t)=>{const A=M.hex(a),B=M.hex(b);return`rgb(${A.map((v,i)=>Math.round(M.lerp(v,B[i],t))).join(',')})`};
M.rgba=(hex,a)=>{const c=M.hex(hex);return`rgba(${c[0]},${c[1]},${c[2]},${a})`};
M.norm=v=>{const l=Math.hypot(v.x,v.y,v.z)||1;return{x:v.x/l,y:v.y/l,z:v.z/l}};M.cross=(a,b)=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});M.dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
M.rotateXZ=(x,z,a)=>({x:x*Math.cos(a)-z*Math.sin(a),z:x*Math.sin(a)+z*Math.cos(a)});
M.project=(p,cam,w,h)=>{if(cam.pose){
 const cp=cam.pose.eye,f=M.norm({x:cam.pose.look.x-cp.x,y:cam.pose.look.y-cp.y,z:cam.pose.look.z-cp.z}),
 r=M.norm(M.cross(f,{x:0,y:1,z:0})),u=M.cross(r,f),v={x:p.x-cp.x,y:p.y-cp.y,z:p.z-cp.z},vx=M.dot(v,r),vy=M.dot(v,u),vz=M.dot(v,f);
 if(vz<4)return null;
 const focal=Math.min(w,h)*.91;
 return{x:w/2+vx*focal/vz,y:h/2-vy*focal/vz,z:vz,scale:focal/vz};
 }
 const cp={x:cam.target.x+cam.distance*Math.cos(cam.pitch)*Math.sin(cam.yaw),y:cam.target.y+cam.distance*Math.sin(cam.pitch),z:cam.target.z+cam.distance*Math.cos(cam.pitch)*Math.cos(cam.yaw)};const f=M.norm({x:cam.target.x-cp.x,y:cam.target.y-cp.y,z:cam.target.z-cp.z});const r=M.norm(M.cross(f,{x:0,y:1,z:0}));const u=M.cross(r,f);const v={x:p.x-cp.x,y:p.y-cp.y,z:p.z-cp.z};const vx=M.dot(v,r),vy=M.dot(v,u),vz=M.dot(v,f);if(vz<20)return null;const focal=Math.min(w,h)*1.02;return{x:w/2+vx*focal/vz,y:h/2-vy*focal/vz,z:vz,scale:focal/vz}};
M.pointOnPolyline=(pts,t)=>{if(!pts.length)return{x:0,y:0,z:0};const lens=[];let total=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],l=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);lens.push(l);total+=l}let d=((t%1)+1)%1*total;for(let i=0;i<lens.length;i++){if(d<=lens[i]){const a=pts[i],b=pts[i+1],q=lens[i]?d/lens[i]:0;return{x:M.lerp(a.x,b.x,q),y:M.lerp(a.y,b.y,q),z:M.lerp(a.z,b.z,q)}}d-=lens[i]}return pts[pts.length-1]};
NS.Math3D=M})(window.SpatialApp=window.SpatialApp||{});
