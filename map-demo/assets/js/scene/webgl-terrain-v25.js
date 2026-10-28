/* V25 optional landscape layer: real WebGL2 depth-tested terrain mesh.
 * Source positions are the project's existing SYNTHETIC height samples, or its real elevation
 * import if one is present in DB. This renderer creates no new geographic measurements.
 * If WebGL2 is unavailable the Canvas2D terrain renderer remains authoritative. */
(function(NS){'use strict';
class CinematicTerrain3D{
 constructor(canvas){this.canvas=canvas;this.ready=false;this.scene=null;this.meshCache={};
  if(!canvas)return;
  let gl=null;try{gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,premultipliedAlpha:false,powerPreference:'default'})}catch(err){console.warn('WebGL2 unavailable, retaining Canvas terrain:',err?.message||err)}
  if(!gl)return;this.gl=gl;
  const vs=`#version 300 es
   precision highp float;
   in vec3 aPosition;in vec3 aNormal;in float aOcclusion;
   uniform vec3 uEye,uRight,uUp,uForward;uniform vec2 uSize,uDepthClip;uniform float uFocal,uMinHeight,uHeightRange;
   out vec3 vNormal,vPos;out float vShade,vElevation,vDepth;
   void main(){vec3 v=aPosition-uEye;float vz=dot(v,uForward);
     gl_Position=vec4(dot(v,uRight)*2.0*uFocal/uSize.x,dot(v,uUp)*2.0*uFocal/uSize.y,vz*uDepthClip.x-uDepthClip.y,vz);
     vNormal=aNormal;vPos=aPosition;vShade=aOcclusion;vElevation=clamp((aPosition.y-uMinHeight)/uHeightRange,0.,1.);
     vDepth=vz;
   }`;
  const fs=`#version 300 es
   precision highp float;
   in vec3 vNormal,vPos;in float vShade,vElevation,vDepth;
   uniform vec3 uSun,uFog;uniform float uTime;out vec4 outColor;
   float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
     return mix(mix(hash21(i),hash21(i+vec2(1.,0.)),f.x),mix(hash21(i+vec2(0.,1.)),hash21(i+1.),f.x),f.y);}
   float fbm(vec2 p){float v=0.,amp=.5;for(int i=0;i<5;i++){v+=amp*noise(p);p=p*2.02+17.9;amp*=.5;}return v;}
   void main(){
     vec3 n=normalize(vNormal),sun=normalize(uSun);
     // Fine normal perturbation comes from coherent multi-scale terrain material detail.
     vec2 uv=vPos.xz;
     float soil=noise(uv*.012),grain=noise(uv*.058),micro=noise(uv*.18);
     float gx=(grain-.5)*.75;
     float gz=(micro-.5)*.65;
     float cliff=1.-smoothstep(.55,.91,n.y);
     vec3 detailNormal=normalize(n+vec3(gx*.17*(1.+cliff),0.,gz*.17*(1.+cliff)));
     float ndotl=max(.0,dot(detailNormal,sun));
     float rockGrain=noise(uv*.035+vec2(vPos.y*.0015));
     vec3 forestA=vec3(.084,.195,.146), forestB=vec3(.215,.295,.195);
     vec3 grassA=vec3(.29,.365,.225),grassB=vec3(.39,.43,.25);
     vec3 slate=vec3(.31,.32,.30),stone=vec3(.52,.50,.43);
     vec3 vegetation=mix(forestA,forestB,smoothstep(.2,.78,soil));
     vegetation=mix(vegetation,mix(grassA,grassB,grain),smoothstep(.22,.74,vElevation)*(.58+.3*grain));
     vec3 geology=mix(slate,stone,smoothstep(.2,.82,rockGrain));
     // Cliff bands run with geological height, resisting the appearance of sprayed-on flat noise.
     float strata=sin(vPos.y*.08+noise(uv*.02)*6.28)*.5+.5;
     geology*=.84+.23*strata;
     float exposed=clamp(cliff*(.66+.32*grain)+smoothstep(.70,.97,vElevation)*.26,0.,1.);
     vec3 material=mix(vegetation,geology,exposed);
     material*=.89+.21*grain+.1*(micro-.5);
     // Occlusion & bounced skylight prevent the black-crack appearance of earlier terrain.
     float occlusion=clamp(vShade,0.,.86),sky=.28+.22*max(0.,detailNormal.y);
     float key=(.17+.85*ndotl)*(1.-.68*occlusion);
     float horizon=.18*max(0.,dot(detailNormal,normalize(vec3(-sun.x,.15,-sun.z))));
     vec3 color=material*(key+sky*.64+horizon);
     color+=material*vec3(.18,.12,.045)*pow(ndotl,7.)*.23;
     // Atmospheric perspective is distance driven, not an indiscriminate blur.
     float haze=smoothstep(3200.,14600.,vDepth)*.36;
     color=mix(color,uFog,haze);
     // ACES-inspired soft shoulder; keep texture intact in daylight.
     color=max(color,vec3(0.));
     color=(color*(2.51*color+.03))/(color*(2.43*color+.59)+.14);
     outColor=vec4(pow(clamp(color,0.,1.),vec3(.94)),1.);
   }`;
  const program=gl.createProgram();for(const [type,src] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){
   const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);
   if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){console.warn('cinematic terrain shader unavailable:',gl.getShaderInfoLog(sh));return}
   gl.attachShader(program,sh);gl.deleteShader(sh);
  }
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){console.warn('cinematic terrain program unavailable',gl.getProgramInfoLog(program));return}
  this.program=program;this.locations={};['uEye','uRight','uUp','uForward','uSize','uFocal','uDepthClip','uMinHeight','uHeightRange','uSun','uFog','uTime'].forEach(k=>this.locations[k]=gl.getUniformLocation(program,k));
  this.ready=true;gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
  canvas.addEventListener('webglcontextlost',ev=>{ev.preventDefault();this.ready=false;this.waterReady=false;},{passive:false});
  canvas.addEventListener('webglcontextrestored',()=>{this.ready=false;this.meshCache={};this.waterProgram=null;this.contextLost=true;console.info('terrain: GPU context restored, reload required to recreate resources')});
 }
 active(site){return !!(this.ready&&!this.contextLost&&(!NS.Drive?.active||NS.RenderSafetyV33?.canUseGPUDrive())&&document.body.classList.contains('cinema-focus')&&site!=='overview'&&NS.DB?.terrain?.[site]?.samples?.length)}
 mesh(site){
  const quality=window.SpatialApp?.App?.engine?.quality==='detailed'?'high':'standard';
  const cacheKey=site+':'+quality+':'+(NS.TerrainStatus?.real?'dem':'concept');
  if(this.meshCache[cacheKey])return this.meshCache[cacheKey];
  const t=NS.DB.terrain[site],source=t.samples,sourceN=t.n,gl=this.gl;
  // Resampling improves the mesh silhouette and interpolated normals, but adds NO surveyed elevation.
  const N=Math.min(quality==='high'?225:161,(quality==='high'?3:2)*(sourceN-1)+1);
  const vertexCount=N*N,verts=new Float32Array(vertexCount*7),indices=[];
  const at=(ix,iz)=>source[Math.max(0,Math.min(sourceN-1,iz))*sourceN+Math.max(0,Math.min(sourceN-1,ix))];
  const catmull=(p0,p1,p2,p3,f)=>p1+.5*f*(p2-p0+f*(2*p0-5*p1+4*p2-p3+f*(3*(p1-p2)+p3-p0)));
  const height=(ix,iz)=>{
   const x=Math.max(0,Math.min(sourceN-1,ix)),z=Math.max(0,Math.min(sourceN-1,iz));
   const i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j,row=[];
   for(let k=-1;k<=2;k++)row.push(catmull(at(i-1,j+k)[1],at(i,j+k)[1],at(i+1,j+k)[1],at(i+2,j+k)[1],fx));
   return catmull(row[0],row[1],row[2],row[3],fz);
  };
  const x0=source[0][0],x1=source[sourceN-1][0],z0=source[0][2],z1=source[(sourceN-1)*sourceN][2];
  const real=!!NS.TerrainStatus?.real;
  const hash=(x,z)=>{let v=Math.sin(x*12.9898+z*78.233)*43758.5453;return v-Math.floor(v)};
  const smooth=t=>t*t*(3-2*t);
  const noise=(x,z)=>{const a=Math.floor(x),b=Math.floor(z),fx=smooth(x-a),fz=smooth(z-b);return (hash(a,b)*(1-fx)+hash(a+1,b)*fx)*(1-fz)+(hash(a,b+1)*(1-fx)+hash(a+1,b+1)*fx)*fz};
  const sampleY=(x,z,rawOnly=false)=>{
   const u=(x-x0)/Math.max(1,x1-x0)*(sourceN-1),v=(z-z0)/Math.max(1,z1-z0)*(sourceN-1);
   let y=height(u,v);
   if(!real&&!rawOnly){
    const slope=Math.abs(height(Math.min(sourceN-1,u+.5),v)-height(Math.max(0,u-.5),v))+
                Math.abs(height(u,Math.min(sourceN-1,v+.5))-height(u,Math.max(0,v-.5)));
    // Visual geological grain, 1-5 scene units. Never alter the input database or DEM.
    const envelope=Math.min(1,slope/100)*.72+.18;
    const extra=((noise(x*.011,z*.011)-.5)*4.8+(noise(x*.034+20,z*.034)-.5)*1.8)*envelope;
    y+=extra;
   }
   if(site==='huajiang'){if(NS.HuajiangRiver)y=NS.HuajiangRiver.landHeight(x,z,y);if(NS.BridgeRoadClearanceV30)y=NS.BridgeRoadClearanceV30.height(x,z,y);}
   return y;
  };
  let min=Infinity,max=-Infinity;
  for(let z=0;z<N;z++)for(let x=0;x<N;x++){
   const px=x0+(x1-x0)*x/(N-1),pz=z0+(z1-z0)*z/(N-1),py=sampleY(px,pz);
   min=Math.min(min,py);max=Math.max(max,py);
   const ds=(x1-x0)/(N-1),dt=(z1-z0)/(N-1);
   const dx=(sampleY(px+ds,pz)-sampleY(px-ds,pz))/(2*ds);
   const dz=(sampleY(px,pz+dt)-sampleY(px,pz-dt))/(2*dt);
   const norm=1/Math.hypot(dx,1,dz);let shadow=0;
   for(let k=1;k<=5;k++){
     const len=k*ds*2,peak=sampleY(px-len*.75,pz+len*.42);
     shadow=Math.max(shadow,(peak-py-len*.20)/170);
   }
   const i=(z*N+x)*7;verts.set([px,py,pz,-dx*norm,norm,-dz*norm,Math.min(.85,Math.max(0,shadow))],i);
   if(x<N-1&&z<N-1){const q=z*N+x;indices.push(q,q+N,q+1,q+1,q+N,q+N+1)}
  }
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  const vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,verts,gl.STATIC_DRAW);
  for(const [name,n,offset] of [['aPosition',3,0],['aNormal',3,12],['aOcclusion',1,24]]){
    const loc=gl.getAttribLocation(this.program,name);if(loc<0)continue;gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,gl.FLOAT,false,28,offset);
  }
  const ibo=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(indices),gl.STATIC_DRAW);gl.bindVertexArray(null);
  const result={vao,vbo,ibo,count:indices.length,min,range:Math.max(1,max-min),N,vertexCount,source:real?'IMPORTED_DEM':'SYNTHETIC_VISUAL_DETAIL'};
  this.meshCache[cacheKey]=result;
  return result;
 }
 renderRiverWater(cp,f,r,u,width,height,time,focalPixels){
  const gl=this.gl,river=NS.HuajiangRiver;
  if(!this.waterProgram){
   const v=`#version 300 es
    precision highp float;in vec3 pos;uniform vec3 eye,right,up,forward;uniform vec2 viewport,uDepthClip;uniform float focal;out vec3 world;
    void main(){vec3 delta=pos-eye;float z=dot(delta,forward);gl_Position=vec4(dot(delta,right)*2.*focal/viewport.x,dot(delta,up)*2.*focal/viewport.y,z*uDepthClip.x-uDepthClip.y,z);world=pos;}`;
   const fsrc=`#version 300 es
    precision highp float;in vec3 world;uniform float tick;out vec4 frag;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+1.),f.x),f.y);}
    void main(){
     vec2 p=world.xz;float swell=sin(p.x*.017+tick*.6)*cos(p.y*.023-tick*.44);
     float ripple=n(p*.09+vec2(tick*.1,0.))-0.5;
     vec3 deep=vec3(.025,.16,.19),shallow=vec3(.10,.30,.32);
     vec3 color=mix(deep,shallow,.53+.20*swell+.17*ripple);
     float glint=pow(max(0.,sin(p.x*.18-p.y*.05+tick*1.9)),23.)*.08;
     float strands=pow(max(0.,sin(p.y*.09+p.x*.04+tick*.8)),18.)*.05;
     color+=vec3(.41,.47,.39)*(glint+strands);
     frag=vec4(color,1.);
    }`;
   const shaders=[];for(const [type,code] of [[gl.VERTEX_SHADER,v],[gl.FRAGMENT_SHADER,fsrc]]){const sh=gl.createShader(type);gl.shaderSource(sh,code);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error('water shader: '+gl.getShaderInfoLog(sh));shaders.push(sh)}
   const program=gl.createProgram();shaders.forEach(sh=>gl.attachShader(program,sh));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('water program');this.waterProgram=program;
   this.waterLoc={};for(const k of ['eye','right','up','forward','viewport','focal','uDepthClip','tick'])this.waterLoc[k]=gl.getUniformLocation(program,k);
   this.waterVao=gl.createVertexArray();this.waterVbo=gl.createBuffer();gl.bindVertexArray(this.waterVao);gl.bindBuffer(gl.ARRAY_BUFFER,this.waterVbo);
   const location=gl.getAttribLocation(program,'pos');gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,12,0);gl.bindVertexArray(null);
  }
  const verts=[];for(let i=0;i<240;i++){const a=river.at(i/240),b=river.at((i+1)/240);
   const pts=[[a.x-a.width,a.y+.9,a.z],[a.x+a.width,a.y+.9,a.z],[b.x-b.width,b.y+.9,b.z],[b.x+b.width,b.y+.9,b.z]];
   for(const q of [0,2,1,1,2,3])verts.push(...pts[q]);}
  gl.useProgram(this.waterProgram);gl.bindVertexArray(this.waterVao);gl.bindBuffer(gl.ARRAY_BUFFER,this.waterVbo);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.DYNAMIC_DRAW);
  const loc=this.waterLoc;for(const [name,p] of [['eye',cp],['right',r],['up',u],['forward',f]])gl.uniform3f(loc[name],p.x,p.y,p.z);
  gl.uniform2f(loc.viewport,width,height);gl.uniform1f(loc.focal,focalPixels);gl.uniform2fv(loc.uDepthClip,NS.ProjectionV33.clip);gl.uniform1f(loc.tick,time);
  gl.drawArrays(gl.TRIANGLES,0,verts.length/3);gl.bindVertexArray(null);this.waterReady=true;
 }
 render(site,cam,width,height,time){if(!this.active(site))return false;
  const gl=this.gl,dpr=Math.min(1.4,window.devicePixelRatio||1),w=Math.max(1,Math.round(width*dpr)),h=Math.max(1,Math.round(height*dpr));
  if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h}
  this.waterReady=false;this.driveReady=false;gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LESS);gl.depthMask(true);gl.disable(gl.BLEND);gl.viewport(0,0,w,h);gl.clearColor(.31,.45,.50,(NS.Drive?.active?1:0));gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const cp=cam.pose?.eye||{x:cam.target.x+cam.distance*Math.cos(cam.pitch)*Math.sin(cam.yaw),y:cam.target.y+cam.distance*Math.sin(cam.pitch),z:cam.target.z+cam.distance*Math.cos(cam.pitch)*Math.cos(cam.yaw)};
  const aim=cam.pose?.look||cam.target;
  const M=NS.Math3D;const f=M.norm({x:aim.x-cp.x,y:aim.y-cp.y,z:aim.z-cp.z}),r=M.norm(M.cross(f,{x:0,y:1,z:0})),u=M.cross(r,f);
  const L=this.locations,vec3=(id,p)=>gl.uniform3f(L[id],p.x,p.y,p.z),model=this.mesh(site);
  gl.useProgram(this.program);gl.bindVertexArray(model.vao);
  vec3('uEye',cp);vec3('uRight',r);vec3('uUp',u);vec3('uForward',f);
  gl.uniform2f(L.uSize,width,height);const viewFocal=Math.min(width,height)*(cam.pose?.91:1.02);gl.uniform1f(L.uFocal,viewFocal);
  gl.uniform2fv(L.uDepthClip,NS.ProjectionV33.clip);gl.uniform1f(L.uMinHeight,model.min);gl.uniform1f(L.uHeightRange,model.range);
  gl.uniform3f(L.uSun,-.66,.82,.42);gl.uniform3f(L.uFog,.59,.68,.64);gl.uniform1f(L.uTime,time);
  gl.drawElements(gl.TRIANGLES,model.count,gl.UNSIGNED_INT,0);gl.bindVertexArray(null);
  if(site==='huajiang'&&NS.HuajiangRiver){try{this.renderRiverWater(cp,f,r,u,width,height,time,viewFocal)}catch(err){console.warn('WebGL water fallback:',err?.message);this.waterReady=false}}
  if(NS.RenderSafetyV33?.canUseGPUDrive()&&site==='huajiang'&&NS.V32DriveWorld){
   if(!this.driveWorld)this.driveWorld=new NS.V32DriveWorld(gl);
   try{this.driveReady=!!this.driveWorld.render({eye:cp,right:r,up:u,forward:f},width,height,time,viewFocal,NS.Drive) && gl.getError()===gl.NO_ERROR}
   catch(err){console.warn('V32 GPU driving fallback:',err?.message||err);this.driveReady=false}
  }
  document.body.classList.toggle('v32-depth-drive',!!this.driveReady&&NS.RenderSafetyV33?.preview);document.body.classList.toggle('v33-gpu-opt-in',!!this.driveReady&&NS.RenderSafetyV33?.preview);
  const note=document.getElementById('v32RenderStatus');if(note)note.textContent=this.driveReady?'GPU测试模式 · 请核查道路可见性':'稳定画质 · 教学模型';
  return true;
 }
}
NS.CinematicTerrain3D=CinematicTerrain3D;
})(window.SpatialApp=window.SpatialApp||{});
