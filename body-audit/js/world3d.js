/* The Flesh Audit · original dependency-free WebGL environment.
   Vertical slice: procedural geometry, kinematic walk/collision, human motion,
   perspective camera, contact shadows and spatial interaction.
   Not a rigid-body solver or photorealistic mocap system. */
(function(root){'use strict';
const $=id=>document.getElementById(id), TAU=Math.PI*2;
const C={night:'#142b3a',roof:'#1c3342',brick:'#34434e',steel:'#365361',gold:'#d9b17a',cyan:'#66bac0',asphalt:'#202f3c',stripe:'#7b8d91',glass:'#2f6070',rural:'#667064',leaf:'#446b5c',concrete:'#718080',floor:'#1b303b',skin:'#b78a6a',coat:'#4c697b'};
function rgb(hex){const h=hex.replace('#','');return [parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255];}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),mix=(a,b,k)=>a+(b-a)*k;
function vecSub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function norm(a){const l=Math.hypot(...a)||1;return a.map(t=>t/l);}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function dot(a,b){return a.reduce((s,x,i)=>s+x*b[i],0);}
function lookAt(eye,at){const z=norm(vecSub(eye,at)),x=norm(cross([0,1,0],z)),y=cross(z,x);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];}
function perspective(f,aspect,n,far){const q=1/Math.tan(f/2);return [q/aspect,0,0,0,0,q,0,0,0,0,(far+n)/(n-far),-1,0,0,2*far*n/(n-far),0];}
function mul(a,b){const o=new Array(16).fill(0);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
function project(pos,mvp,w,h){const a=mvp;const x=pos[0],y=pos[1],z=pos[2],pw=a[3]*x+a[7]*y+a[11]*z+a[15];if(pw<=0)return null;return {x:(a[0]*x+a[4]*y+a[8]*z+a[12])/pw*w/2+w/2,y:(1-(a[1]*x+a[5]*y+a[9]*z+a[13])/pw)*h/2};}
// Interleaved: XYZ / RGB / normal XYZ. Mesh batches avoid thousands of draw calls.
class Mesh{
 constructor(){this.a=[];this.count=0;}
 tri(p,q,r,c,n,glow=0){const color=rgb(c),ill=glow?1:0;for(const v of [p,q,r])this.a.push(...v,...color,n[0],n[1],n[2]+ill*6);this.count+=3;}
 quad(a,b,c,d,color,normal,glow=0){this.tri(a,b,c,color,normal,glow);this.tri(a,c,d,color,normal,glow);}
 box(x,y,z,w,h,d,c,glow=0){let X=x-w/2,Y=y-h/2,Z=z-d/2,x2=x+w/2,y2=y+h/2,z2=z+d/2;const faces=[[[X,Y,z2],[x2,Y,z2],[x2,y2,z2],[X,y2,z2],[0,0,1]],[[x2,Y,Z],[X,Y,Z],[X,y2,Z],[x2,y2,Z],[0,0,-1]],[[X,Y,Z],[X,Y,z2],[X,y2,z2],[X,y2,Z],[-1,0,0]],[[x2,Y,z2],[x2,Y,Z],[x2,y2,Z],[x2,y2,z2],[1,0,0]],[[X,y2,z2],[x2,y2,z2],[x2,y2,Z],[X,y2,Z],[0,1,0]],[[X,Y,Z],[x2,Y,Z],[x2,Y,z2],[X,Y,z2],[0,-1,0]]];for(const f of faces)this.quad(f[0],f[1],f[2],f[3],c,f[4],glow);}
 pillar(x,y,z,r,h,color,segments=9){this.cyl(x,y,z,r,h,color,segments);}
 cyl(x,y,z,r,h,color,n=10){const bot=y-h/2,top=y+h/2;for(let i=0;i<n;i++){let t=i/n*TAU,u=(i+1)/n*TAU;const ax=x+Math.cos(t)*r,az=z+Math.sin(t)*r,bx=x+Math.cos(u)*r,bz=z+Math.sin(u)*r;const nn=norm([Math.cos((t+u)/2),0,Math.sin((t+u)/2)]);this.quad([ax,bot,az],[bx,bot,bz],[bx,top,bz],[ax,top,az],color,nn);this.tri([x,top,z],[ax,top,az],[bx,top,bz],color,[0,1,0]);}}
 orb(x,y,z,rx,ry,rz,color,lat=6,lon=10){for(let i=0;i<lat;i++){const p0=-Math.PI/2+Math.PI*i/lat,p1=-Math.PI/2+Math.PI*(i+1)/lat;for(let j=0;j<lon;j++){const a=TAU*j/lon,b=TAU*(j+1)/lon;const pt=(p,t)=>[x+rx*Math.cos(p)*Math.cos(t),y+ry*Math.sin(p),z+rz*Math.cos(p)*Math.sin(t)];let p=pt(p0,a),q=pt(p0,b),r=pt(p1,b),s=pt(p1,a);const nn=norm([(p[0]-x)/rx,(p[1]-y)/ry,(p[2]-z)/rz]);this.quad(p,q,r,s,color,nn);}}}
 line(a,b,width,c){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];const len=Math.hypot(dx,dy,dz);if(len===0)return;const u=norm(cross(norm([dx,dy,dz]),[0,1,0]));const side=Math.hypot(...u)<.1?[1,0,0]:u;let x=(a[0]+b[0])/2,y=(a[1]+b[1])/2,z=(a[2]+b[2])/2;this.orb(x,y,z,width/2,len/2,width/2,c,4,5);}
 emit(){return new Float32Array(this.a);}
}
function shader(gl,type,src){let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
function makeProgram(gl){
// Scene lighting: hemispherical fill, warm grazing key, practical light pooling,
// dielectric specular and world-space procedural material grain (no remote assets).
let v=shader(gl,gl.VERTEX_SHADER,`attribute vec3 p;attribute vec3 col;attribute vec3 nor;
uniform mat4 vp;varying vec3 vCol;varying vec3 vPos;varying vec3 vNormal;varying float vEmissive;
void main(){gl_Position=vp*vec4(p,1.);vPos=p;vCol=col;vEmissive=step(5.,nor.z);vNormal=normalize(vec3(nor.x,nor.y,nor.z-vEmissive*6.));}`);
let f=shader(gl,gl.FRAGMENT_SHADER,`precision highp float;
varying vec3 vCol;varying vec3 vPos;varying vec3 vNormal;varying float vEmissive;
uniform vec3 fog;uniform vec3 viewPoint;uniform float sceneId;
float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yxz+33.33);return fract((p.x+p.y)*p.z);}
float valueNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
vec3 pointLight(vec3 lightPosition,vec3 lightColor,float power,vec3 N,vec3 V,float rough){vec3 delta=lightPosition-vPos;float d=length(delta);vec3 L=delta/max(d,.01);float ndl=max(dot(N,L),0.);vec3 H=normalize(L+V);float shininess=mix(92.,12.,rough);float spec=pow(max(dot(N,H),0.),shininess)*(1.-rough*.73);float atten=power/(1.+d*d*.095);return lightColor*(ndl*.74+spec*.33)*atten;}
void main(){vec3 N=normalize(vNormal),V=normalize(viewPoint-vPos);vec3 base=vCol;
float variation=valueNoise(vPos*6.5)*.12+valueNoise(vPos*27.)*.035;
float horizontal=abs(N.y);float metal=step(.35,base.b-base.r);float rough=mix(.79,.31,metal);
base*=1.-variation*.45;
// Asphalt / exposed concrete: irregular fine grain and slight warm wetting.
if(horizontal>.88&&vPos.y<.22){float grains=valueNoise(vPos*54.);base*=.86+grains*.24;rough=.91;}
// Plaster and painted brick: low-contrast dirt at joints rather than texture stickers.
if(horizontal<.27&&vPos.y>1.2){base*=.92+.16*valueNoise(vec3(vPos.x*7.,vPos.y*3.8,vPos.z*7.));}
vec3 key=normalize(vec3(-.32,.83,.47));float lit=max(dot(N,key),0.);
float hemi=.39+.29*max(N.y,0.)+.095*max(-N.y,0.);
vec3 linear=base*(hemi+lit*.47);
vec3 warm=pointLight(vec3(-2.,5.4,1.2),vec3(1.0,.73,.43),4.2,N,V,rough);
vec3 cool=pointLight(vec3(4.2,3.5,-2.2),vec3(.25,.72,1.),3.5,N,V,rough);
if(sceneId>1.5){warm=pointLight(vec3(-4.,5.1,.3),vec3(.43,1.,.92),3.9,N,V,rough);cool=pointLight(vec3(7.3,5.8,1.5),vec3(.40,.71,1.),4.2,N,V,rough);}
if(sceneId>.5&&sceneId<1.5){warm=pointLight(vec3(-3.,5.,1.),vec3(1.,.87,.66),4.5,N,V,rough);cool*=.4;}
linear+=base*(warm+cool)*.57;
float rim=pow(1.-max(dot(N,V),0.),3.);linear+=vec3(.13,.25,.28)*rim*.08;
linear=mix(linear,base*1.18, vEmissive);
float dist=length(viewPoint-vPos);float f=clamp((dist-18.)/28.,0.,.72);
linear=mix(linear,fog,f);
// Filmic soft shoulder + display gamma. Preserves highlights without clipping white.
linear=linear/(linear+vec3(.65));linear=pow(clamp(linear,0.,1.),vec3(.91));
gl_FragColor=vec4(linear,1.);}`);
let pr=gl.createProgram();gl.attachShader(pr,v);gl.attachShader(pr,f);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(pr));return pr;}
function buildings(b,scene){if(scene==='city'){
 // Deep urban facades in actual perspective. Recessed bays and a wide open pavement arrival.
 b.box(-10,6,-8,6,12,3,'#283d50');b.box(-5,4.8,-9.3,4.5,9.6,2.6,'#304657');b.box(7.3,5.7,-9,5.4,11.4,3,'#263949');b.box(12,7,-9,5,14,2,'#223543');
 for(let x of [-12.1,-10.7,-9.3,-8,-6.8,-5.8,-4.7,-3.6,5.5,6.8,8.1,9.4,11.2,12.4])for(let y=2;y<11;y+=1.55){if(Math.abs(x)<3)continue;const lit=(Math.sin(x*19+y*13)+1)>1.25;b.box(x,y,-6.43,.68,.9,.06,lit?'#c9a57a':'#365867',lit?1:0);}
 b.box(-7,.46,-3.8,4,0.92,.7,'#344b55');b.box(-7,1.12,-3.8,4,.17,1,'#b58e6a');
 // Background bridge / visual leading lines.
 b.box(0,4.1,-11,9,.22,1.2,'#344c5b');for(let x=-4;x<5;x+=2)b.box(x,2,-10.8,.22,4,.3,'#476273');
 }else if(scene==='rural'){
 b.box(-8,2.2,-6,8,4.4,2.5,'#66746c');b.box(-8,4.65,-6,8,.45,3.1,'#9d8064');b.box(-8,1.25,-4.68,2.5,2.3,.1,'#293c40');b.box(-8,2.2,-4.61,2.2,.7,.11,'#a0c3bf',1);
 b.box(7.8,2.5,-6.5,7,5,2.6,'#667269');b.box(7.8,5.23,-6.5,7,.55,3.2,'#b6a285');for(let x=5.3;x<=10.4;x+=2)b.box(x,2.5,-5.15,1,1.5,.08,'#c0b7a1');
 for(let x=-13;x<14;x+=1.8){b.box(x,.48,-9,.1,.95,.12,'#7e8b81');b.box(x,1,-9,1.6,.09,.08,'#8a998b');}
 for(const [x,z,r] of [[-12,-3,1.8],[12,-3,2.1],[-1,-9,2.4],[3,-9,2],[10,-10,2.5]]){b.cyl(x,1.3,z,.18,2.6,'#5d6451');b.orb(x,3.3,z,r,2,r,'#3b6c58',8,10);}
 }else{
 b.box(0,6.2,-9,30,12.4,1.1,'#253e4b');b.box(-15,5.3,-2,.9,10.6,17,'#2b4550');b.box(15,5.3,-2,.9,10.6,17,'#263f4d');
 for(let x=-12;x<=12;x+=6){b.box(x,6,-8.25,.55,12,.65,'#46606c');b.box(x,8.3,-8.15,4,.22,.25,'#7ba8aa',1);}
 for(let z=-7;z<6;z+=3.5){b.box(0,9.2,z,29,.2,.22,'#4d6775');b.box(0,8.95,z,9,.07,.1,'#83acac',1);}
 // Walkable workshop lane and conveyor feeding a scanner.
 b.box(4,.68,-1,6,1.1,2.2,'#4b6370');b.box(4,1.29,-1,6,.15,2.28,'#92aaac');for(let x=1.8;x<7;x+=.5)b.box(x,1.42,-1,.12,.06,2.08,'#4c5e63');
 for(let x of [-11,-9,-7]){b.box(x,2,-6,.28,4,2.1,'#526d77');for(let y=1;y<4;y+=.68)b.box(x,y,-4.9,1.85,.07,.14,'#68aaac',1);}
 b.box(9,2.1,-6,2.6,3.9,.8,'#2e5262');b.box(9,2.55,-5.55,2.13,1.7,.07,'#6fa7af',1);b.box(9,3.9,-5.5,1.2,.18,.08,'#d2b179',1);
  // Functional hierarchy: floor-level embodied labor, elevated glass data-control gallery.
  // The balcony has solid supports and edge barriers, not a decorative floating floor.
  b.box(8.4,2.13,2.75,6.7,.24,5.5,'#435967');
  for(const x of [5.4,11.4])for(const z of [.7,4.9])b.box(x,1.07,z,.22,2.1,.22,'#728993');
  for(const x of [5.2,6.7,8.2,9.7,11.3]){b.cyl(x,3.2,.25,.07,1.95,'#8eafb7');b.box(x,4.12,.25,1.35,.08,.07,'#accbd0',1);}
  b.box(8.4,3.22,.25,6.2,.035,.09,'#6eabb2',1);
  // Two independent screens make the manager's viewing/decision work visible.
  for(let i=0;i<3;i++){const x=6.4+i*1.7;b.box(x,3.03,2.6,1.5,1.18,.12,'#142f3c');b.box(x,3.03,2.72,1.29,.96,.08,i===1?'#457c86':'#356b7c',1);b.box(x,2.43,2.58,.12,.24,.12,'#8ba6a8');b.box(x,2.3,2.6,1.48,.07,.75,'#728d93');for(let j=0;j<4;j++)b.box(x-0.44+j*.3,3.13,2.78,.18,.05,.025,'#a8d7ce',1);}
  // Sensor arch with a real clear route beneath it (not a false decorative doorway).
  for(let x of [-5.4,-2.0]){b.box(x,2.25,-2.3,.15,4.5,.17,'#7797a2');b.box(x,1.8,-2.2,.09,2.65,.09,'#6cc2c5',1);}
  b.box(-3.7,4.51,-2.3,3.55,.17,.17,'#9dada7');
  b.box(-3.7,4.3,-2.26,2.4,.07,.085,'#83e0d2',1);
  // Practical workbench, tools, rest seat and physically legible crate stacks.
  b.box(-5.6,.85,-.65,3.25,.2,1.13,'#8e9f9c');for(const x of [-6.95,-4.25])b.box(x,.41,-.65,.13,.83,.15,'#627781');
  for(let i=0;i<3;i++)b.box(-6.5+i*.5,1.05,-.65,.31,.13,.21,['#d0a973','#9cbbb6','#b3a794'][i]);
  b.box(-9.1,.48,3.2,1.35,.12,.63,'#7c9296');for(let x of [-9.62,-8.6])b.box(x,.24,3.2,.09,.45,.45,'#657982');b.box(-9.1,.92,3.48,1.35,.91,.08,'#829b9d');
  // Ground-level legible work zones and data-flow path.
  b.box(-4.1,.037,2.0,6.6,.025,3.0,'#374f56');b.box(-4.1,.051,2.0,6.33,.017,2.7,'#46616a');
  for(let i=0;i<8;i++){b.box(-6.2+i*.63,.064,3.25,.32,.017,.075,'#d7b478');}
  for(let x=-1.2;x<6.5;x+=.74){b.box(x,.065,1.1,.33,.025,.075,'#769da6');}
  // Mechanical scanner with real beam, shield, and lit sensor head.
  b.box(1.12,2.06,-1, .22,3.6,2.9,'#91aab0');b.box(1.2,3.8,-1,1.2,.2,2.9,'#5b8494');b.box(1.28,3.55,-1,.34,.14,.53,'#b2efdf',1);

 }
}
// Dense but intentional scene dressing. Geometry is functional and placed clear of access routes.
function detailMesh(b,scene){
 if(scene==='city'){
  // Human-scale facades, inset storefront doors, window mullions and angled metal canopy.
  for(const x of [-10,-7.2,-4.6,6.4,9.4,12.0]){
   const z=x<0?-6.45:-6.55;
   b.box(x,1.6,z,2.23,2.9,.12,'#2c4149');
   b.box(x,1.55,z+.078,1.90,2.45,.04,'#58747c');
   b.box(x,2.45,z+.115,1.88,.045,.052,'#c1b49b');
   b.box(x,1.55,z+.11,.045,2.45,.06,'#c1aa83');
   b.box(x,3.04,z+.28,2.42,.13,.6,'#605c50');
   b.box(x,3.11,z+.32,2.38,.032,.65,'#b6a47d');
   b.box(x,0.11,z+.14,2.46,.19,.22,'#7e8078');
  }
  // Concrete sidewalk seams, drain covers, curbs, and shallow reflections.
  for(let x=-12.0;x<13;x+=2.4){b.box(x,.036,1.73,.025,.022,2.5,'#51616a'); b.box(x,.034,-2.35,.03,.021,1.45,'#485762');}
  for(let i=0;i<7;i++){let x=-12+i*3.9;b.box(x,.035,3.03,.40,.02,.33,'#273f47');for(let j=0;j<5;j++)b.box(x-.16+j*.08,.046,3.03,.022,.008,.3,'#56676c');}
  for(let x of [-9.5,10.6]){
   b.cyl(x,1.13,1.4,.23,2.2,'#576d6d',13);
   b.orb(x,2.40,1.4,.39,.26,.37,'#40534c',8,12);
   for(let i=0;i<6;i++){let t=TAU*i/6;b.orb(x+Math.cos(t)*.31,2.34+Math.sin(t)*.13,1.4+Math.sin(t)*.21,.20,.15,.21,'#486657',6,8);}
  }
  // Bicycle and roadside sign have physical supports.
  b.cyl(-1.25,1.35,3.2,.065,2.7,'#747d79',9); b.box(-1.25,2.65,3.2,.9,.42,.10,'#647e87'); b.box(-1.25,2.65,3.27,.78,.32,.03,'#b6b4a1');
  // Restrained light pooling (solid polygon gradients are only a CPU-safe approximation).
  for(let i=0;i<5;i++){const x=-2.45+(i-2)*.46;b.orb(x,.015,1.25,.52,.012,.21,i%2?'#42555b':'#344e57',3,10);}
 }else if(scene==='rural'){
  // Proper clinic entrance with a visible door, frames and entrance ramp.
  b.box(-8,1.33,-4.63,2.13,2.54,.11,'#314f52');b.box(-8,1.34,-4.54,1.86,2.38,.04,'#536f72');
  b.box(-7.97,1.38,-4.48,.055,2.36,.05,'#acb7b0');b.box(-8,2.63,-4.49,2.1,.11,.12,'#c5b3a0');
  b.box(-8,.09,-2.65,3.2,.15,2.7,'#9b9b8d');
  for(let z=-3.7;z<-.9;z+=.38)b.box(-8,.174,z,3.15,.014,.025,'#757d77');
  for(let x of [5.3,7.2,9.3]){
   b.box(x,2.48,-5.08,1.13,1.72,.06,'#405b5d');
   b.box(x,2.46,-5.03,1.02,1.57,.02,'#9dc1b6');
   b.box(x,2.47,-4.98,.035,1.5,.035,'#c3cbc1');
  }
  b.box(-1.2,.45,1.9,2.6,.17,.85,'#7f8c82');for(const x of [-2.25,-.15])b.box(x,.22,1.9,.1,.4,.6,'#626e62');
  for(let i=0;i<14;i++){let x=-13+i*1.95; b.box(x,.04,5.0,.55,.012,.14,'#a6a18b');}
  for(let i=0;i<8;i++){let x=-10+i*2.65;b.orb(x,.03,-1.75,.14,.018,.10,'#535f57',3,7);}
 }else{
  // Industrial fixtures have recognizable affordances: cable ducts, rivets, hazard marks,
  // containment guards, barcode reader, steel pallets, and the worker's rest area.
  for(let z=-6;z<=6;z+=3){b.box(-12.5,5.8,z,.24,.25,3.2,'#667b7d');b.box(11.5,5.8,z,.25,.25,3.2,'#667b7d');}
  for(let x=-11;x<=11;x+=4){b.box(x,6.15,-7.6,.17,.14,.7,'#95a5a4');b.box(x,6.03,-7.3,1.7,.07,.1,'#a4c6ba',1);}
  // Cable run anchored by metal brackets.
  b.box(-9.0,2.5,-7.0,.21,.27,4.9,'#505f65');for(let z=-8.9;z<-5;z+=.55)b.box(-9,2.72,z,.24,.045,.15,'#9c9f98');
  for(let x=1.5;x<7;x+=.52){b.box(x,1.38,.10,.17,.04,.14,'#a49c7a');}
  // Safety stripes on the actual floor route.
  for(let x=-6.8;x<-1.3;x+=.56){b.box(x,.075,.51,.22,.02,.18,'#b9a15b');b.box(x+.23,.078,.51,.17,.02,.18,'#484944');}
  // Laser tracking target is functional at upper body height.
  for(let y=.85;y<3.5;y+=.44){b.box(-5.4,y,-2.15,.09,.026,.075,'#80afac',1);b.box(-2.0,y,-2.15,.09,.026,.075,'#80afac',1);}
  b.box(-3.7,.042,-2.1,3.4,.02,.08,'#92bcaa',1);
  b.box(-3.7,.042,-.2,3.4,.02,.08,'#92bcaa',1);
  // Adjustable work monitor and an illuminated tablet with readable outline.
  b.box(-6.15,1.5,-.57,.85,.82,.09,'#243944');b.box(-6.15,1.5,-.51,.70,.68,.04,'#56818a',1);
  b.box(-6.15,1.04,-.58,.10,.22,.1,'#b4b2a0');
  // Elevated data gallery: structural step and control desk.
  b.box(8.4,2.36,3.25,4.9,.16,1.3,'#697f86');
  for(let x of [6.1,8.3,10.5]){b.box(x,2.27,4.45,.85,.20,.90,'#6e7c7f');b.box(x,2.15,4.45,.75,.08,.89,'#384954');}
  for(let i=0;i<7;i++){let x=5.5+i*.85;b.box(x,4.2,.23,.11,.24,.07,'#7fb5b4');}
  // Stackable crates with finger notches and printed band detail.
  for(const [x,z] of [[-10,1.8],[-9,1.8],[-10,3]]){
   b.box(x,.38,z,.82,.7,.77,'#84725c');b.box(x,.67,z+.4,.57,.12,.035,'#aa9a7f');b.box(x,.31,z+.4,.32,.07,.04,'#584e42');
  }
 }
}
function sceneMesh(scene){const b=new Mesh(),city=scene==='city',rural=scene==='rural',factory=scene==='factory';
 b.box(0,-.16,0,32,.3,22,city?'#233542':rural?'#3c504b':'#273d48');
 // Walkable surface has highlights and perspective cues. Non-traversable facades behind.
 for(let z=-4;z<=8;z+=1.75)b.box(0,.006,z,26,.011,.015,city?'#394955':rural?'#657466':'#38505b');
 for(let x=-12;x<=12;x+=2)b.box(x,.006,0,.016,.011,15,city?'#344b56':rural?'#4b6558':'#415563');
 if(city){b.box(0,.03,5,30,.035,3.3,'#172630');for(let x=-13;x<=13;x+=2.6)b.box(x,.06,3.2,1.1,.017,.065,'#ae986f');b.box(0,.09,3.4,30,.05,.08,'#788d93');}
 if(rural){b.box(0,.09,3.3,27,.04,2,'#7f8a78');for(let x=-12;x<=12;x+=3.4)b.box(x,.115,3,1.8,.015,.07,'#c7c1a6');}
 if(factory){b.box(0,.07,4.4,25,.05,.17,'#ceae75');for(let x=-12;x<13;x+=1.9)b.box(x,.07,4.4,.7,.055,.13,'#243f4c');}
 buildings(b,scene);detailMesh(b,scene);
 if(!factory){
 // Primary interaction: functional kiosk in front of scene, with actual front display.
 b.box(2.8,1.32,-1.45,1.45,2.62,.8,'#253d4b');b.box(2.8,2.11,-1.02,1.19,1.13,.075,'#183c4b');b.box(2.8,2.1,-.977,1,.92,.03,'#458493',1);b.box(2.8,1.06,-1,.73,.15,.13,'#d1b280',1);b.box(2.8,.36,-1.35,.95,.18,1,'#536875');b.box(2.8,2.79,-1.45,1.58,.13,.91,'#d2ad79',1);
 b.box(2.8,.015,.05,2.6,.027,2.7,'#426b69');
 b.box(2.8,.02,.05,2.35,.03,2.45,'#426d6c');
 // Distinct arrival/approach: bollards and planted seating off path.
 for(const x of [-.1,5.6]){b.cyl(x,.43,.3,.1,.86,'#98a8aa');b.orb(x,.93,.3,.12,.15,.12,'#ddb57b',5,8);}
 b.box(-6,.42,-.3,2.2,.34,.68,'#8d7564');for(let x of [-6.9,-5.1])b.box(x,.22,-.3,.11,.42,.52,'#354752');
 const palms=city?[[-8,2.8],[8,2.9]]:[[-9,2.5],[9,2.5]];for(const [x,z] of palms){b.box(x,.46,z,1.25,.9,1.25,'#6b6860');b.orb(x,1.23,z,.78,.78,.78,city?'#506d62':'#65846d',7,9);}
 // Street light casts an interpretable physical support and fixture.
 b.cyl(-2.8,2.8,-3.2,.085,5.6,'#72868c');b.box(-2.1,5.58,-3.2,1.5,.12,.16,'#889ea5');b.orb(-1.4,5.47,-3.2,.2,.085,.2,'#eac698',4,8);
 }else{
 // Operational scanner, guarded bays, crate rest zones.
 b.box(-2.6,.65,-1.25,1.9,1.2,1.6,'#405764');b.box(-2.6,1.32,-1.25,1.8,.15,1.5,'#799aa2');b.box(-2.6,1.45,-1.2,.95,.06,.56,'#7ec4c5',1);
 b.box(7.9,1.8,1.2,1.9,3.6,1.4,'#3c6470');b.box(7.9,2.3,2,1.6,1.1,.1,'#78bcbf',1);
 for(const [x,z] of [[-6,2],[-7,3.5],[-5.2,4.1]]){b.box(x,.36,z,1.3,.72,1,'#82735f');b.box(x,.74,z,1.31,.08,1.01,'#baa47d');}
 }
 return b.emit();}
function person(b,x,z,opts={}){
 const floorY=opts.floorY||0; if(floorY){const source=b;b={box:(X,Y,Z,...args)=>source.box(X,Y+floorY,Z,...args),orb:(X,Y,Z,...args)=>source.orb(X,Y+floorY,Z,...args),cyl:(X,Y,Z,...args)=>source.cyl(X,Y+floorY,Z,...args)};}
 const t=opts.t||0,walking=opts.walk||0,type=opts.type||'zhou',activity=opts.action||'',age=type==='zhao'||type==='xu';let c=type==='amara'?'#768d92':type==='ethan'?'#596777':type==='zhou'?'#738073':type==='lin'?'#586776':type==='zhao'?'#626d71':'#937f70';let skin=type==='amara'?'#79523e':type==='ethan'?'#ddb48d':type==='zhou'?'#b88d73':type==='lin'?'#dab095':'#bd9b7a';let phase=t*9,step=Math.sin(phase)*walking,arm=activity==='抬臂'?Math.sin(t*11)*.7+.85:activity==='分拣'?Math.sin(t*11)*.4+.35:activity==='弯腰'?.4:0;let tilt=activity==='弯腰'?.42*(.5+.5*Math.sin(t*8)):0;
 const hop=walking*.045*Math.abs(Math.cos(phase))+Math.sin(t*1.8)*.012;
 b.orb(x,.026,z,.57,.015,.28,'#192a2b',3,8); // stylized contact shadow
 // shoes and legs articulated around hip, world anchored to ground
 for(let side of [-1,1]){const a=side===1?step:-step,hipX=x+side*.14;let footZ=z+.1+a*.17;let kneeZ=z+Math.sin(phase+side*2)*.085*walking; b.box(hipX,.34+hop,z+.015,.20,.56,.24,'#25333e');b.orb(hipX,.75+hop,kneeZ,.125,.15,.13,'#33404a');b.orb(hipX,.11,footZ+.09,.14,.11,.27,'#15232b');
 b.box(hipX,.12,footZ+.25,.275,.05,.16,'#3a4244');}
 const lean=walking*.05+tilt;
 b.orb(x,1.23+hop,z+lean*.1,.39,.52,.24,c,6,10);b.box(x,1.29+hop,z,.6,.7,.42,c);
 b.orb(x,1.75+hop,z+.04,.28,.32,.255,skin,7,10);
 b.orb(x,1.99+hop,z-.055,.29,.12,.27,type==='zhao'?'#8e9a96':'#243039',6,13);
 // Face structure: visible nose bridge, ears, cheek shadow and small eyes.
 b.orb(x,1.77+hop,z+.288,.043,.077,.066,skin,6,8);
 for(let side of [-1,1]){
  b.orb(x+side*.285,1.74+hop,z+.02,.052,.093,.055,skin,5,7);
  b.orb(x+side*.111,1.82+hop,z+.272,.037,.021,.022,'#332c2b',5,7);
  b.box(x+side*.11,1.875+hop,z+.275,.094,.018,.026,'#463c36');
  b.orb(x+side*.24,1.62+hop,z+.16,.055,.04,.031,'#a78168',5,7);
 }
 b.box(x,1.638+hop,z+.263,.14,.018,.027,'#805f58');
 // Shirt collar, clothing seams and waist belt as legible material layers.
 b.box(x,1.48+hop,z+.247,.30,.045,.055,'#929d9b');
 b.box(x,1.05+hop,z+.225,.58,.05,.052,'#303d44');
 b.box(x,1.05+hop,z+.265,.10,.045,.03,'#aca99a');
 // readable character identity through work equipment rather than exaggerated anatomy.
 if(type==='amara'){
  // Shoulder harness, tracking sensor on chest, wrist markers, non-floating safety boots.
  for(let side of [-1,1]){b.box(x+side*.27,1.38+hop,z+.23,.075,.56,.037,'#d0b37e');b.orb(x+side*.47,1.07+hop,z+.03,.075,.075,.09,'#a6e1d7',5,7);}
  b.box(x,1.34+hop,z+.246,.24,.20,.06,'#8cd2c7',1);b.box(x,1.22+hop,z+.252,.12,.07,.07,'#e6c282',1);
  for(let side of [-1,1])b.box(x+side*.15,.08,z+.2,.3,.12,.37,'#1c292f');
  b.orb(x,2.07+hop,z-.045,.31,.13,.285,'#263039',5,9);
 }else if(type==='ethan'){
  // Office jacket, pale monitor glow and wearable badge.
  b.box(x,1.34+hop,z+.232,.19,.53,.03,'#b8bcc0');b.box(x+.13,1.18+hop,z+.25,.19,.12,.03,'#dfbb82',1);
  b.orb(x-.15,1.82+hop,z+.2,.035,.03,.035,'#3b3935',4,6);b.orb(x+.15,1.82+hop,z+.2,.035,.03,.035,'#3b3935',4,6);
 }else{b.orb(x-.10,1.81+hop,z+.232,.025,.022,.024,'#253038',4,6);b.orb(x+.10,1.81+hop,z+.232,.025,.022,.024,'#253038',4,6);}

 for(let side of [-1,1]){let shift=walking*Math.sin(phase+(side===1?Math.PI:0))*.19,ax=x+side*.46;const yy=activity==='抬臂'?1.88+arm*.37:1.30+shift*.4;const zz=z+shift*.3+(activity==='分拣'?.22:0);b.orb(ax,yy,zz,.14,.35,.14,c,5,8);b.orb(ax,yy-.28,zz+.06,.11,.13,.11,skin,5,7);}
 if(age)b.box(x,1.1,z-.3,.11,.56,.11,'#b2a78c');
}
const app={factoryDetail:{role:'amara',fatigue:0,stage:'contract',step:0,count:0,calls:0},ok:false,mode:'city',role:'zhou',player:{x:-4.5,z:1.7,vx:0,vz:0},keys:new Set(),target:null,auto:null,action:null,time:0,follow:0,halt:false, camera:null,gl:null,vertices:{},canv:null,clickable:false};
function setupGL(canvas){const gl=canvas.getContext('webgl',{antialias:true,alpha:false,depth:true,preserveDrawingBuffer:false,powerPreference:'high-performance'});if(!gl)throw Error('WebGL unavailable');const program=makeProgram(gl);const attrs={p:gl.getAttribLocation(program,'p'),col:gl.getAttribLocation(program,'col'),nor:gl.getAttribLocation(program,'nor')},u={vp:gl.getUniformLocation(program,'vp'),fog:gl.getUniformLocation(program,'fog'),cam:gl.getUniformLocation(program,'viewPoint'),scene:gl.getUniformLocation(program,'sceneId')};const buffers={};for(const scene of ['city','rural','factory']){const vertices=sceneMesh(scene),buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);buffers[scene]={buffer,count:vertices.length/9};}const dyn=gl.createBuffer();return {gl,program,attrs,u,buffers,dyn};}
// CPU-projected 3D fallback for browsers that disable WebGL (e.g. sandboxed QA).
// It uses the SAME scene triangles, perspective camera, collision and movement.
function softwareDraw(sceneData,dynamicData,cam){
 const canvas=app.canv,ctx=app.ctx,w=cam.w,h=cam.h;
 const dpr=Math.min(devicePixelRatio||1,1.35),cw=Math.round(w*dpr),ch=Math.round(h*dpr);
 if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle=app.mode==='rural'?'#556b67':app.mode==='factory'?'#152b38':'#162a3c';ctx.fillRect(0,0,w,h);
 const polys=[],vp=cam.vp;
 for(const data of [sceneData,dynamicData]){
  for(let i=0;i<data.length;i+=27){
   const a=[data[i],data[i+1],data[i+2]],b=[data[i+9],data[i+10],data[i+11]],c=[data[i+18],data[i+19],data[i+20]];
   const aa=project(a,vp,w,h),bb=project(b,vp,w,h),cc=project(c,vp,w,h);if(!aa||!bb||!cc)continue;
   if(Math.max(aa.x,bb.x,cc.x)<-20||Math.min(aa.x,bb.x,cc.x)>w+20||Math.max(aa.y,bb.y,cc.y)<-20||Math.min(aa.y,bb.y,cc.y)>h+20)continue;
   const depth=(Math.hypot(a[0]-cam.eye[0],a[1]-cam.eye[1],a[2]-cam.eye[2])+Math.hypot(b[0]-cam.eye[0],b[1]-cam.eye[1],b[2]-cam.eye[2])+Math.hypot(c[0]-cam.eye[0],c[1]-cam.eye[1],c[2]-cam.eye[2]))/3;
   let light=Math.max(0,(data[i+6]*-.32+data[i+7]*.84+data[i+8]*.47));light=.55+light*.47;const glow=data[i+8]>5;
   let mid=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
   const lamps=app.mode==='factory'?[[-4,5,.3],[7.3,5.8,1.5]]:app.mode==='rural'?[[-3,5,1]]:[[-2,5.4,1.2],[4.2,3.5,-2.2]];
   let bounce=0;for(const lamp of lamps){let d=Math.hypot(mid[0]-lamp[0],mid[1]-lamp[1],mid[2]-lamp[2]);bounce+=.15/(1+d*d*.09);}
   light=glow?1.29:light+bounce;
   const fog=Math.min(.67,Math.max(0,(depth-19)/29));let f=app.mode==='rural'?[.34,.38,.34]:app.mode==='factory'?[.08,.14,.17]:[.11,.18,.22],color=[3,4,5].map((offset,j)=>Math.round(255*clamp(Math.pow(clamp(data[i+offset]*light*(1-fog)+f[j]*fog,0,1),.92),0,1)));
   polys.push({p:[aa,bb,cc],depth,fill:`rgb(${color.join(',')})`});
  }
 }
 polys.sort((a,b)=>b.depth-a.depth);
 for(const v of polys){ctx.beginPath();ctx.moveTo(v.p[0].x,v.p[0].y);ctx.lineTo(v.p[1].x,v.p[1].y);ctx.lineTo(v.p[2].x,v.p[2].y);ctx.closePath();ctx.fillStyle=v.fill;ctx.fill();}
}
function drawBuf(gl,buffer,count){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const stride=9*4;gl.vertexAttribPointer(app.attrs.p,3,gl.FLOAT,false,stride,0);gl.vertexAttribPointer(app.attrs.col,3,gl.FLOAT,false,stride,12);gl.vertexAttribPointer(app.attrs.nor,3,gl.FLOAT,false,stride,24);gl.drawArrays(gl.TRIANGLES,0,count);}
function cameraInfo(){
 const w=app.canv.clientWidth||1100,h=app.canv.clientHeight||700,aspect=w/h;
 const reduced=document.body.classList.contains('reduced-motion'),mobile=h>w,factory=app.mode==='factory';
 const focus=factory&&mobile?(app.role==='ethan'?7.4:-4.0):0;
 const cx=factory&&mobile?focus:(reduced?0:app.follow);
 const eye=[cx+(mobile?(factory?-0.5:-1.2):0), mobile?(factory?8.7:10.5):(factory?8.2:7.7), mobile?(factory?17.1:21.5):(factory?18:16.3)];
 const at=[factory&&mobile?focus:cx*.36+(mobile?-1.2:0),factory&&mobile?1.55:1.15, factory&&mobile?0.7:-1.05];
 const fov=(mobile?(factory?56:62):43)*Math.PI/180,view=lookAt(eye,at),vp=mul(perspective(fov,aspect,.1,85),view);
 const forward=norm(vecSub(at,eye)),right=norm(cross(forward,[0,1,0])),up=cross(right,forward);
 return {eye,at,vp,right,up,forward,fov,w,h};
}
function screenFloor(clientX,clientY){const rect=app.canv.getBoundingClientRect(),ndcX=((clientX-rect.left)/rect.width*2-1),ndcY=(1-(clientY-rect.top)/rect.height*2);const c=app.camera||cameraInfo(),tan=Math.tan(c.fov/2);const ray=norm(c.forward.map((v,i)=>v+c.right[i]*ndcX*tan*c.w/c.h+c.up[i]*ndcY*tan));if(ray[1]>=-.02)return null;const t=-c.eye[1]/ray[1];return {x:clamp(c.eye[0]+ray[0]*t,-11.8,11.8),z:clamp(c.eye[2]+ray[2]*t,-4.2,6.4)};}
const bounds={city:{xmin:-11.8,xmax:11.8,zmin:-4.25,zmax:6.3},rural:{xmin:-11.8,xmax:11.8,zmin:-3.8,zmax:6.4},factory:{xmin:-11.7,xmax:11.7,zmin:-6,zmax:6.2}};
const colliders={city:[[-7,-3.8,2.2,.8],[-8,2.8,1.6,1.6],[8,2.9,1.5,1.5]],rural:[[-8,-5,7,2.2],[7.8,-5.7,5.5,2.5],[-9,2.5,1.5,1.5],[9,2.5,1.5,1.5]],factory:[[-2.6,-1.25,2.6,2],[4,-1,7,2.7],[7.9,1.2,2.5,2],[-6,2,1.5,1],[-7,3.5,1.5,1]]};
function isBlocked(x,z){const bd=bounds[app.mode];if(x<bd.xmin+.32||x>bd.xmax-.32||z<bd.zmin+.32||z>bd.zmax-.32)return true;const r=.3;for(const [a,b,w,d] of colliders[app.mode]){const dx=Math.max(Math.abs(x-a)-w/2,0),dz=Math.max(Math.abs(z-b)-d/2,0);if(dx*dx+dz*dz<r*r)return true;}if(app.mode!=='factory'&&x>2.8-1&&x<2.8+1&&z<-1.45+1.05&&z>-1.45-.8)return true;return false;}
function movement(dt){
 if(app.auto){
  const a=app.auto,k=clamp((performance.now()-a.start)/2100,0,1),e=k*k*(3-2*k);
  const x=mix(a.x,1.75,e),z=mix(a.z,1.15,e);
  if(!isBlocked(x,z)){app.player.x=x;app.player.z=z;}
  if(k>=1){app.auto=null;app.player.vx=app.player.vz=0;const cb=app.onArrival;app.onArrival=null;cb?.();}
  return {speed:k>=1?0:1};
 }
 if(app.mode==='factory'){app.player.x=mix(app.player.x,app.role==='ethan'?5.9:-4,dt*1.8);app.player.z=mix(app.player.z,2,dt*1.8);return {speed:0};}const p=app.player;let dx=0,dz=0;const k=app.keys;if(k.has('w')||k.has('arrowup'))dz-=1;if(k.has('s')||k.has('arrowdown'))dz+=1;if(k.has('a')||k.has('arrowleft'))dx-=1;if(k.has('d')||k.has('arrowright'))dx+=1;let manual=Math.hypot(dx,dz)>.01;if(manual)app.target=null;const tar=app.auto?{x:1.75,z:1.15}:app.target;const dist=tar?Math.hypot(tar.x-p.x,tar.z-p.z):0;if(!manual&&tar&&dist>.15){dx=(tar.x-p.x)/dist;dz=(tar.z-p.z)/dist;}else if(tar&&dist<=.15){if(app.auto){const done=app.auto;app.auto=null;app.target=null;app.halt=true;app.onArrival&&app.onArrival(done);}else app.target=null;}
 const l=Math.hypot(dx,dz)||1,acc=app.auto?28:15,max=app.auto?4.6:3.25;let ax=dx/l*acc,az=dz/l*acc;p.vx+=ax*dt;p.vz+=az*dt;if(dx===0&&dz===0){const damp=Math.exp(-12*dt);p.vx*=damp;p.vz*=damp;}let v=Math.hypot(p.vx,p.vz);if(v>max){p.vx*=max/v;p.vz*=max/v;v=max;}const nx=p.x+p.vx*dt,nz=p.z+p.vz*dt;if(!isBlocked(nx,p.z))p.x=nx;else p.vx=0;if(!isBlocked(p.x,nz))p.z=nz;else p.vz=0;return {speed:clamp(v/2.6,0,1)};}
function frame(t){if(!app.ok)return;const now=t/1000,dt=Math.min(app.software?.15:.05,Math.max(.003,now-(app.prev||now-.016)));app.prev=now;app.time=now;const gl=app.gl,w=app.canv.clientWidth,h=app.canv.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(app.software&&t-app.lastDraw<65){requestAnimationFrame(frame);return;}app.lastDraw=t;if(!app.software&&w>0&&h>0&&(app.canv.width!==Math.round(w*dpr)||app.canv.height!==Math.round(h*dpr))){app.canv.width=Math.round(w*dpr);app.canv.height=Math.round(h*dpr);}const result=movement(dt);
 app.follow=mix(app.follow,app.mode==='factory'?0:clamp((app.player.x+.8)*.12,-.8,.85),Math.min(1,dt*1.9));app.camera=cameraInfo();const cam=app.camera;if(!app.software){gl.viewport(0,0,app.canv.width,app.canv.height);const bgcolor=app.mode==='rural'?[.36,.43,.4]:app.mode==='factory'?[.07,.14,.19]:[.07,.15,.22];gl.clearColor(...bgcolor,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.useProgram(app.program);gl.uniformMatrix4fv(app.u.vp,false,new Float32Array(cam.vp));gl.uniform3fv(app.u.fog,new Float32Array(bgcolor));gl.uniform3fv(app.u.cam,new Float32Array(cam.eye));gl.uniform1f(app.u.scene,app.mode==='factory'?2:app.mode==='rural'?1:0);for(const n of Object.values(app.attrs))gl.enableVertexAttribArray(n);const buf=app.buffers[app.mode];drawBuf(gl,buf.buffer,buf.count);}
 const d=new Mesh();const p=app.player,anim=now;
 if(app.mode!=='factory'){
 person(d,p.x,p.z,{type:app.role,t:anim,walk:result.speed});person(d,7.0,-.5,{type:app.mode==='rural'?'xu':'lin',t:anim+.4,walk:0});
 const glow=.57+.43*Math.sin(now*3.1);d.orb(2.8,2.17,-.88,.47,.40,.02,glow>.65?'#95d0c6':'#488b96',4,8);
 for(let i=0;i<12;i++){const phase=i*TAU/12+now*.48;const rr=.94+Math.sin(now*2+i)*.03;d.orb(2.8+Math.cos(phase)*rr,.02,-.2+Math.sin(phase)*rr,.055,.012,.055,'#e1b779',3,5);}
 if(app.mode==='city'){
 // Traffic: vehicles move along the main road with differing speed and depth.
 for(let i=0;i<2;i++){const X=((now*(i?1.5:-2)+i*9+35)%32)-16;d.box(X,.52,5.1+i*.8,2.4,.75,1.1,i?'#415b67':'#94755b');d.box(X,.97,5.1+i*.8,1.1,.43,.9,'#718d95');d.orb(X-.8,.13,5.75+i*.8,.22,.23,.13,'#141d25',4,7);d.orb(X+.8,.13,5.75+i*.8,.22,.23,.13,'#141d25',4,7);}}
 }else{
 const motion=app.action&&now-app.action.time<1.4?app.action.name:'';
 const f=app.factoryDetail||{},labor=f.role==='amara';
 // Each viewpoint owns a physically different workspace: capture floor versus control gallery.
 person(d,-3.8,2.0,{type:'amara',t:anim,action:labor?motion:(Math.sin(now*.85)>.7?'分拣':'')});
 person(d,7.85,2.0,{type:'ethan',floorY:2.26,t:anim+.6,action:!labor&&motion==='调用'?'抬臂':''});
 // Captured actions grow tired: a grounded change in posture, not a biological "worth" score.
 if(labor&&f.fatigue>50){const k=clamp((f.fatigue-50)/50,0,1);d.orb(-3.8,2.25-k*.08,2,.10,.05,.1,'#d7aa79',4,8);}
 if(labor&&f.step===2){d.box(-4.1,.94,.7,.72,.34,.52,'#7ca8a3');d.box(-4.1,1.13,.7,.46,.03,.38,'#b4e4d8',1);}
 if(!labor){for(let i=0;i<4;i++){d.box(6.3+i*.43,3.26,2.8,.15,.05,.028,(f.calls||0)>i?'#cbe4ad':'#527e8a',1);}}
 // Conveyor movement and physical capture volumes.
 for(let i=0;i<10;i++){const x=1.8+((now*.5+i*.72)%5.4);d.box(x,1.65,-1,.39,.26,.43,'#9d927c');}
 if(motion){for(let i=0;i<16;i++){let k=(now-app.action.time)*.7+(i/16),x=mix(-3.8,8,Math.min(1,k));if(k<1)d.orb(x,1.5+Math.sin(k*TAU)*1.3,1.15-2*k,.075,.075,.075,'#a2efdf',4,6);}}
 }
 // Atmospheric floating light motes, kept scarce to protect scene readability.
 if(!document.body.classList.contains('reduced-motion'))for(let i=0;i<24;i++){const x=Math.sin(i*12.989)*10,z=Math.cos(i*4.83)*6,yy=1+((i*.84+now*.08)%4);d.orb(x,yy,z,.015,.025,.015,'#638e93',3,4);}
 const arr=d.emit();if(app.software)softwareDraw(app.softMeshes[app.mode],arr,cam);else{gl.bindBuffer(gl.ARRAY_BUFFER,app.dyn);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.DYNAMIC_DRAW);drawBuf(gl,app.dyn,arr.length/9);}
 if(app.mode!=='factory'){
 const projected=project([2.8,3.04,-1.2],cam.vp,cam.w,cam.h);const el=$('stageHotspot');if(el&&projected){el.style.left=projected.x+'px';el.style.top=projected.y+'px';el.style.bottom='auto';}const label=project([2.8,2.36,-.94],cam.vp,cam.w,cam.h),lbl=$('kiosk3dLabel');if(label&&lbl){lbl.style.left=label.x+'px';lbl.style.top=label.y+'px';lbl.classList.remove('hidden');}
 }
 if(app.mode==='factory')$('kiosk3dLabel')?.classList.add('hidden');
 const hint=$('spatialHint');if(hint){const hide=['intro','roleOverlay','chatScreen','endingScreen','sheetOverlay','helpOverlay','archive'].some(id=>$(id)&&!$(id).classList.contains('hidden'));hint.classList.toggle('hidden',hide||app.mode==='factory');if(!hide&&app.mode!=='factory')hint.innerHTML=`<b>场景探索</b><span>W A S D / 方向键移动 · 点击地面前往</span><small>靠近屏幕按 <kbd>E</kbd> 问诊，也可以直接点击金色标记</small>`;}
 requestAnimationFrame(frame);
}
function init(){try{const host=$('world');if(!host)return false;const canvas=document.createElement('canvas');canvas.id='real3D';canvas.setAttribute('aria-label','可互动立体游戏场景');canvas.setAttribute('role','img');host.prepend(canvas);let s;try{s=setupGL(canvas);}catch(ex){console.info('Switching to CPU-projected 3D',String(ex));const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw ex;s={ctx,software:true,softMeshes:Object.fromEntries(['city','rural','factory'].map(name=>[name,sceneMesh(name)]))};}Object.assign(app,s,{canv:canvas,ok:true});document.body.classList.add('webgl-ready');document.body.dataset.renderMode=app.software?'cpu-3d':'webgl';const hint=document.createElement('div');hint.id='spatialHint';hint.className='spatial-hint hidden';host.appendChild(hint);const kioskLabel=document.createElement('div');kioskLabel.id='kiosk3dLabel';kioskLabel.className='kiosk-3d-label';kioskLabel.innerHTML='<b>陈俊良</b><span>AI 问诊室</span>';host.appendChild(kioskLabel);
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0||!app.clickable||app.mode==='factory')return;const pt=screenFloor(e.clientX,e.clientY);if(pt){if(Math.hypot(pt.x-2.8,pt.z+1.45)<1.5){if(app.onInteraction)app.onInteraction();return;}app.target=pt;}});
 document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())){app.keys.add(e.key.toLowerCase());if(app.clickable&&app.mode!=='factory')e.preventDefault();}if(e.key.toLowerCase()==='e'&&app.clickable&&app.mode!=='factory'&&Math.hypot(app.player.x-2.8,app.player.z+1.45)<2.8)app.onInteraction?.();});document.addEventListener('keyup',e=>app.keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>app.keys.clear());
 const joystick=document.createElement('div');joystick.id='touchPad';joystick.className='touch-pad';joystick.innerHTML='<div class="touch-base"><div class="touch-knob"></div></div><span>拖动行走</span>';host.appendChild(joystick);let id=null;const updateTouch=e=>{const r=joystick.querySelector('.touch-base').getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/(r.width/2),y=(e.clientY-r.top-r.height/2)/(r.height/2),dist=Math.min(1,Math.hypot(x,y)),a=Math.atan2(y,x);app.keys.delete('w');app.keys.delete('s');app.keys.delete('a');app.keys.delete('d');if(dist>.16){const vx=Math.cos(a),vy=Math.sin(a);if(vx>.3)app.keys.add('d');if(vx<-.3)app.keys.add('a');if(vy>.3)app.keys.add('s');if(vy<-.3)app.keys.add('w');}joystick.querySelector('.touch-knob').style.transform=`translate(${vxSafe(x)*28}px,${vxSafe(y)*28}px)`;};const vxSafe=v=>clamp(v,-1,1);joystick.addEventListener('pointerdown',e=>{id=e.pointerId;joystick.setPointerCapture(id);updateTouch(e);});joystick.addEventListener('pointermove',e=>{if(id===e.pointerId)updateTouch(e);});for(const event of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(event,()=>{id=null;app.keys.clear();joystick.querySelector('.touch-knob').style.transform='';});
 requestAnimationFrame(frame);return true;}catch(err){console.warn('3D unavailable, original 2D world retained',err);return false;}}
function setScene(scene){app.mode=scene;app.player.x=scene==='factory'?-4:scene==='rural'?-4.4:-4.5;app.player.z=1.7;app.player.vx=app.player.vz=0;app.target=null;app.auto=null;app.clickable=scene!=='factory';app.follow=0;}
function setRole(role){app.role=role;}
function approach(onArrival){if(!app.ok)return false;app.target=null;app.auto={x:app.player.x,z:app.player.z,start:performance.now()};app.onArrival=onArrival;return true;}
function action(motion){app.action={name:motion,time:app.time};}
function projectWorldPoint(x,y,z){if(!app.canv||!app.ok)return null;const c=cameraInfo();const pos=project([x,y,z],c.vp,c.w,c.h);return pos&&pos.x>=0&&pos.x<=c.w&&pos.y>=0&&pos.y<=c.h?pos:null;}
function setFactoryDetail(detail){app.factoryDetail={...app.factoryDetail,...detail};}
root.Flesh3D={init,setScene,setRole,approach,action,setFactoryDetail,projectWorldPoint,app,inspect:{sceneMesh,isBlocked,cameraInfo}};
})(globalThis);
