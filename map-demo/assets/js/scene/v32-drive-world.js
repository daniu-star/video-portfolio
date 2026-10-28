/* V32 GPU driving-world preview. Procedural topology; educational geometry, NOT an as-built bridge BIM.
 * All terrain/deck/vehicle draw into a single WebGL2 depth buffer. The Canvas fallback remains unchanged.
 */
(function(NS){'use strict';
const TAU=Math.PI*2;
const V=(x,y,z)=>({x,y,z});
const sub=(a,b)=>V(a.x-b.x,a.y-b.y,a.z-b.z);
const cross=(a,b)=>V(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);
const norm=a=>{const n=Math.hypot(a.x,a.y,a.z)||1;return V(a.x/n,a.y/n,a.z/n)};
const scale=(a,k)=>V(a.x*k,a.y*k,a.z*k);
const add=(a,b)=>V(a.x+b.x,a.y+b.y,a.z+b.z);
const color={road:[.12,.155,.175],lane:[.91,.89,.76],deck:[.40,.44,.44],metal:[.51,.61,.64],cable:[.67,.69,.60],concrete:[.69,.68,.62],steel:[.28,.34,.39],red:[.59,.18,.13],glass:[.10,.20,.27],rubber:[.039,.046,.053],trim:[.8,.78,.69],mark:[.95,.62,.18],body:[.12,.30,.42],dark:[.055,.081,.10],stone:[.32,.32,.29]};
const MATERIAL={road:0,lane:1,deck:2,metal:3,cable:4,concrete:5,steel:6,red:7,glass:8,rubber:9,trim:10,mark:11,body:12,dark:13,stone:14};
class MeshBuilder{
 constructor(){this.data=[];this.triangles=0}
 tri(a,b,c,kind='deck',nOverride=null){const n=nOverride||norm(cross(sub(b,a),sub(c,a))),col=color[kind]||color.deck,id=MATERIAL[kind]||0;
  for(const p of [a,b,c])this.data.push(p.x,p.y,p.z,n.x,n.y,n.z,col[0],col[1],col[2],id);this.triangles++}
 quad(a,b,c,d,kind,n){this.tri(a,b,c,kind,n);this.tri(a,c,d,kind,n)}
 box(center,half,kind='concrete'){
  const {x,y,z}=center,{x:w,y:h,z:d}=half;
  const f=(xx,yy,zz)=>V(x+xx*w,y+yy*h,z+zz*d);
  this.quad(f(-1,-1,1),f(1,-1,1),f(1,1,1),f(-1,1,1),kind,V(0,0,1));
  this.quad(f(1,-1,-1),f(-1,-1,-1),f(-1,1,-1),f(1,1,-1),kind,V(0,0,-1));
  this.quad(f(-1,-1,-1),f(-1,-1,1),f(-1,1,1),f(-1,1,-1),kind,V(-1,0,0));
  this.quad(f(1,-1,1),f(1,-1,-1),f(1,1,-1),f(1,1,1),kind,V(1,0,0));
  this.quad(f(-1,1,1),f(1,1,1),f(1,1,-1),f(-1,1,-1),kind,V(0,1,0));
  this.quad(f(-1,-1,-1),f(1,-1,-1),f(1,-1,1),f(-1,-1,1),kind,V(0,-1,0));
 }
 tube(a,b,r,kind='metal',sides=7){const axis=norm(sub(b,a)),ref=Math.abs(axis.y)>.92?V(1,0,0):V(0,1,0),sx=norm(cross(axis,ref)),sy=norm(cross(axis,sx));
  for(let i=0;i<sides;i++){const t0=TAU*i/sides,t1=TAU*(i+1)/sides,offset=t=>add(scale(sx,Math.cos(t)*r),scale(sy,Math.sin(t)*r));
   const a0=add(a,offset(t0)),a1=add(a,offset(t1)),b0=add(b,offset(t0)),b1=add(b,offset(t1));this.quad(a0,b0,b1,a1,kind)}
 }
 disk(center,r,kind='dark',segments=18){for(let i=0;i<segments;i++){const a=i*TAU/segments,b=(i+1)*TAU/segments;
  this.tri(center,V(center.x+Math.cos(a)*r,center.y,center.z+Math.sin(a)*r),V(center.x+Math.cos(b)*r,center.y,center.z+Math.sin(b)*r),kind,V(0,1,0))}}
 get array(){return new Float32Array(this.data)}
}
class DriveWorld{
 constructor(gl){this.gl=gl;this.ready=false;this.route=null;this.staticBuffer=null;this.staticCount=0;this.carBuffer=null;this.carCount=0;this.frame=-1;
  const vs=`#version 300 es
   precision highp float;
   in vec3 aPos,aNorm,aColor;in float aMaterial;
   uniform vec3 uEye,uRight,uUp,uForward;uniform vec2 uSize,uDepthClip;uniform float uFocal;
   out vec3 vPos,vNorm,vAlbedo;flat out int vMaterial;out float vDepth;
   void main(){vec3 v=aPos-uEye;float z=dot(v,uForward);
    gl_Position=vec4(dot(v,uRight)*2.*uFocal/uSize.x,dot(v,uUp)*2.*uFocal/uSize.y,z*uDepthClip.x-uDepthClip.y,z);
    vPos=aPos;vNorm=aNorm;vAlbedo=aColor;vMaterial=int(aMaterial+.1);vDepth=z;
   }`;
  const fs=`#version 300 es
   precision highp float;
   in vec3 vPos,vNorm,vAlbedo;flat in int vMaterial;in float vDepth;out vec4 frag;
   uniform vec3 uEye,uSun,uFog;uniform float uTime,uWet;
   float hash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);}
   float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
     mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
   void main(){vec3 n=normalize(vNorm),sun=normalize(uSun),view=normalize(uEye-vPos);
     float texture=0.,grain=0.;vec3 c=vAlbedo;
     if(vMaterial==0){texture=noise(vPos*.85);grain=noise(vPos*6.4);c*=.87+.16*texture+.065*grain;c*=1.-uWet*.32;}
     else if(vMaterial==5||vMaterial==2){texture=noise(vPos*.12);c*=.89+.17*texture;}
     else if(vMaterial==3||vMaterial==4||vMaterial==6){c*=.91+.07*noise(vPos*.2);}
     float diffuse=max(0.,dot(n,sun));float ambient=.32+.15*max(n.y,0.);
     vec3 shade=c*(ambient+diffuse*.76);
     float roughness=vMaterial==8?.12:(vMaterial==3||vMaterial==4||vMaterial==12?.29:.79);if(vMaterial==0)roughness=mix(.88,.17,uWet);
     vec3 h=normalize(sun+view);
     float spec=pow(max(0.,dot(n,h)),mix(92.,9.,roughness))*(1.-roughness)*.69;
     if(vMaterial==8){shade=mix(shade,vec3(.15,.28,.34),.4);spec*=1.6;}
     shade+=vec3(1.,.92,.76)*spec;
     float mist=smoothstep(1100.,6800.,vDepth)*.49;
     shade=mix(shade,uFog,mist);
     shade=(shade*(2.51*shade+.03))/(shade*(2.43*shade+.59)+.14);
     frag=vec4(pow(clamp(shade,0.,1.),vec3(.93)),1.);
   }`;
  try{
   const prog=gl.createProgram();for(const [type,code] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){
    const sh=gl.createShader(type);gl.shaderSource(sh,code);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));gl.attachShader(prog,sh);gl.deleteShader(sh)}
   gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));this.program=prog;
   this.loc={};for(const k of ['uEye','uRight','uUp','uForward','uSize','uFocal','uDepthClip','uSun','uFog','uTime','uWet'])this.loc[k]=gl.getUniformLocation(prog,k);
   this.staticVao=gl.createVertexArray();this.staticBuffer=gl.createBuffer();this.bindBuffer(this.staticVao,this.staticBuffer);
   this.carVao=gl.createVertexArray();this.carBuffer=gl.createBuffer();this.bindBuffer(this.carVao,this.carBuffer);
   // Behind all depth-tested geometry, a GPU-rendered atmospheric sky prevents the
   // hard flat-color horizon of the previous separate Canvas backdrop.
   const sv=`#version 300 es
    precision highp float;out vec2 uv;void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));uv=p;gl_Position=vec4(p*2.-1.,1.,1.);}`;
   const sf=`#version 300 es
    precision highp float;in vec2 uv;out vec4 frag;uniform float tick;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float clouds(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
     return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
    void main(){float h=clamp(uv.y,0.,1.);
     vec3 sky=mix(vec3(.68,.73,.72),vec3(.085,.20,.33),smoothstep(.05,1.,h));
     float cirrus=clouds(uv*vec2(7.,4.)+vec2(tick*.0015,0.));
     float mask=smoothstep(.56,.76,cirrus)*(.11+.15*smoothstep(.22,.6,h));sky=mix(sky,vec3(.82,.84,.83),mask);
     float sun=length((uv-vec2(.76,.77))*vec2(1.4,1.));float halo=exp(-sun*sun*84.);
     sky+=vec3(.35,.28,.16)*halo*.52;sky+=vec3(.50,.39,.21)*exp(-sun*sun*5000.)*.95;
     frag=vec4(clamp(sky,0.,1.),1.);
    }`;
   const sky=gl.createProgram();for(const [type,code] of [[gl.VERTEX_SHADER,sv],[gl.FRAGMENT_SHADER,sf]]){
    const sh=gl.createShader(type);gl.shaderSource(sh,code);gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error('sky:'+gl.getShaderInfoLog(sh));
    gl.attachShader(sky,sh);gl.deleteShader(sh)}
   gl.linkProgram(sky);if(!gl.getProgramParameter(sky,gl.LINK_STATUS))throw Error('sky:'+gl.getProgramInfoLog(sky));
   this.skyProgram=sky;this.skyVao=gl.createVertexArray();this.skyTimeLoc=gl.getUniformLocation(sky,'tick');
   this.ready=true;
  }catch(e){console.warn('V32 WebGL scene unavailable:',e);this.error=String(e)}
 }
 bindBuffer(vao,buffer){const gl=this.gl;gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  const stride=40;for(const [attr,n,offset] of [['aPos',3,0],['aNorm',3,12],['aColor',3,24],['aMaterial',1,36]]){
   const loc=gl.getAttribLocation(this.program,attr);if(loc<0)continue;gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,gl.FLOAT,false,stride,offset)}gl.bindVertexArray(null)}
 buildRoute(route){const m=new MeshBuilder(),width=11.4,len=route.length,segments=Math.min(550,Math.ceil(len/12));
  const point=(fr,s,y)=>V(fr.position.x+fr.side.x*s,fr.position.y+y,fr.position.z+fr.side.z*s);
  for(let i=0;i<segments;i++){const a=route.at(i/segments),b=route.at((i+1)/segments),p=(f,s,h)=>point(f,s,h);
   m.quad(p(a,-width,1.22),p(b,-width,1.22),p(b,width,1.22),p(a,width,1.22),'road',V(0,1,0));
   m.quad(p(a,-width,-.9),p(a,width,-.9),p(b,width,-.9),p(b,-width,-.9),'concrete');
   for(const s of [-width,width]){
    m.quad(p(a,s,1.26),p(b,s,1.26),p(b,s+Math.sign(s)*.23,1.26),p(a,s+Math.sign(s)*.23,1.26),'lane',V(0,1,0));
    m.quad(p(a,s,-.6),p(b,s,-.6),p(b,s,.85),p(a,s,.85),'deck');
   }
   const mid=i/segments*len;
   if(Math.floor(mid/11)%2===0){for(const s of [-.22,.22]){} m.quad(p(a,-.22,1.3),p(b,-.22,1.3),p(b,.22,1.3),p(a,.22,1.3),'lane',V(0,1,0))}
   for(const s of [-8.3,8.3])if(mid>210){if(i%13===0)m.quad(p(a,s-.16,1.3),p(b,s-.16,1.3),p(b,s+.16,1.3),p(a,s+.16,1.3),'lane',V(0,1,0))}
  }
  for(let d=0;d<len;d+=21){const f=route.at(d/len);for(const s of [-12.5,12.5]){
   const b=point(f,s,1.1),u=point(f,s,4.0);m.tube(b,u,.19,'steel',6);
   if(d+21<len){const n=route.at((d+21)/len);m.tube(point(f,s,3.5),point(n,s,3.5),.33,'metal',7);m.tube(point(f,s,2.55),point(n,s,2.55),.15,'steel',6)}
   m.box(point(f,s,3.9),V(.36,.14,.23),'metal');
  }}
  // Parapet along the modeled deck, underneath the crash barriers.
  for(const s of [-14,14])for(let d=0;d<len;d+=25){const f=route.at(d/len),q=route.at(Math.min(1,(d+25)/len));m.tube(point(f,s,-2.9),point(q,s,-2.9),.68,'steel',8)}
  // 1420-m educational suspension geometry, towers at +/-710 scene x; not an as-built component survey.
  const towerXs=[-710,710];for(const tx of towerXs){for(const z of [-21,21]){
    const y=650;m.box(V(tx,y+107,z),V(9,108,9),'concrete');
    m.box(V(tx,y+216,z),V(13,8,13),'concrete');
    for(let k=0;k<3;k++){m.box(V(tx,y+18+k*83,z),V(9.7,1.15,9.7),'stone')}
   }m.box(V(tx,798,0),V(10,8,25),'concrete');m.box(V(tx,860,0),V(11,7,29),'concrete')}
  const cableY=x=>{const t=Math.abs(x);return t<=710?692+171*(t/710)**2:863-173*((t-710)/850)};
  for(const z of [-18,18]){
   let prev=null;for(let x=-1560;x<=1560;x+=13){const a=V(x,cableY(x),z);if(prev)m.tube(prev,a,1.5,'cable',9);prev=a;}
   for(let x=-700;x<=700;x+=39){const y=cableY(x),q=V(x,y,z);m.tube(q,V(x,662,z),.36,'metal',6)}
  }
  // Bridge deck girder ribs: visible in chase/cinematic, modelled independently of asphalt.
  for(let x=-1460;x<=1460;x+=44){const f=route.at(Math.min(1,Math.max(0,(x+2140)/len)));for(const z of [-10,0,10])m.box(V(x,648,z),V(1.0,4,1.4),'steel')}
  this.route=route;const data=m.array,gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,this.staticBuffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);this.staticCount=data.length/10;
  this.geometryStats={triangles:m.triangles,vertices:this.staticCount,source:'PROCEDURAL_EDUCATIONAL'};
 }
 carMesh(drive){const f=drive.route.at(drive.progress),p=f.position,side=f.side,front=f.forward,m=new MeshBuilder(),phys=drive.physics,lateral=phys?.lateral||0,heave=phys?.heave||0;
  const at=(s,along,y)=>V(p.x+side.x*(s+lateral)+front.x*along,p.y+front.y*along+y+heave,p.z+side.z*(s+lateral)+front.z*along);
  const box=(lo,hi,kind)=>{
   const [l0,a0,y0]=lo,[l1,a1,y1]=hi;
   const b=[[l0,a0,y0],[l1,a0,y0],[l1,a1,y0],[l0,a1,y0],[l0,a0,y1],[l1,a0,y1],[l1,a1,y1],[l0,a1,y1]].map(t=>at(...t));
   m.quad(b[0],b[1],b[2],b[3],kind);m.quad(b[4],b[5],b[6],b[7],kind);
   m.quad(b[0],b[4],b[7],b[3],kind);m.quad(b[1],b[2],b[6],b[5],kind);
   m.quad(b[0],b[1],b[5],b[4],kind);m.quad(b[3],b[7],b[6],b[2],kind)
  };
  box([-2.12,-4.55,1.3],[2.12,4.55,2.47],'body');
  box([-1.74,-1.92,2.46],[1.74,2.0,3.56],'glass');
  box([-1.83,-2.10,3.46],[1.83,1.15,3.7],'body');
  box([-2.18,-4.6,1.35],[2.18,-4.1,1.9],'steel');
  box([-2.18,4.1,1.35],[2.18,4.57,1.9],'steel');
  for(const s of [-1,1]){box([s*1.88- .14,-4.45,1.31],[s*1.88+.14,4.45,1.44],'trim');
   for(const a of [-2.65,2.68]){
    // Wheel treads & hub geometries as circumferential quads.
    for(let i=0;i<16;i++){const t0=i*TAU/16,t1=(i+1)*TAU/16,r=.89;
     const a0=at(s*2.12,a+r*Math.cos(t0),1.46+r*Math.sin(t0)),a1=at(s*2.12,a+r*Math.cos(t1),1.46+r*Math.sin(t1));
     const b0=at(s*2.36,a+r*Math.cos(t0),1.46+r*Math.sin(t0)),b1=at(s*2.36,a+r*Math.cos(t1),1.46+r*Math.sin(t1));m.quad(a0,b0,b1,a1,'rubber')}
    m.tube(at(s*2.36,a,1.46),at(s*2.39,a,1.46),.43,'metal',12);
   }
   box([s*1.63-.26,4.53,1.94],[s*1.63+.26,4.61,2.26],'lane');
   box([s*1.63-.29,-4.62,1.96],[s*1.63+.29,-4.54,2.24],'red');
  }
  return m.array;
 }
 drawMesh(buffer,vao,count){const gl=this.gl;if(!count)return;gl.bindVertexArray(vao);gl.drawArrays(gl.TRIANGLES,0,count);gl.bindVertexArray(null)}
 render(camBasis,width,height,time,focal,drive){if(!this.ready||!drive?.route)return false;
  if(this.route!==drive.route)this.buildRoute(drive.route);
  const gl=this.gl,{eye,right,up,forward}=camBasis;
  gl.useProgram(this.program);const loc=this.loc;
  for(const [k,v] of [['uEye',eye],['uRight',right],['uUp',up],['uForward',forward]])gl.uniform3f(loc[k],v.x,v.y,v.z);
  gl.uniform3f(loc.uSun,-.66,.82,.42);gl.uniform3f(loc.uFog,.57,.66,.68);
  gl.uniform2f(loc.uSize,width,height);gl.uniform2fv(loc.uDepthClip,NS.ProjectionV33.clip);gl.uniform1f(loc.uFocal,focal);gl.uniform1f(loc.uTime,time);gl.uniform1f(loc.uWet,drive.wet?1:0);
  this.drawMesh(this.staticBuffer,this.staticVao,this.staticCount);
  if(['follow','cinematic'].includes(drive.mode)){
   const car=this.carMesh(drive);gl.bindBuffer(gl.ARRAY_BUFFER,this.carBuffer);gl.bufferData(gl.ARRAY_BUFFER,car,gl.DYNAMIC_DRAW);
   this.drawMesh(this.carBuffer,this.carVao,car.length/10)}
  // Draw behind the scene using the same depth buffer; never overpaint the bridge.
  gl.useProgram(this.skyProgram);gl.bindVertexArray(this.skyVao);
  gl.depthFunc(gl.LEQUAL);gl.depthMask(false);gl.uniform1f(this.skyTimeLoc,time);
  gl.drawArrays(gl.TRIANGLES,0,3);gl.depthMask(true);gl.depthFunc(gl.LESS);gl.bindVertexArray(null);
  return gl.getError()===gl.NO_ERROR;
 }
}
NS.V32DriveWorld=DriveWorld;
})(window.SpatialApp=window.SpatialApp||{});
