/* Run from the project root: node qa/V30_桥梁净空回归测试.cjs */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),window={SpatialApp:{}};
const sandbox={window,console};
for(const f of ['assets/js/math.js','assets/js/drive/route.js','assets/js/geo/bridge-road-cut-v30.js']){
 vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),sandbox,{filename:f});
}
const db=JSON.parse(fs.readFileSync(path.join(root,'assets/data/database.bundle.js'),'utf8').replace(/^\s*window\.SPATIAL_DB\s*=\s*/,'').replace(/;\s*$/,''));
const route=window.SpatialApp.DriveRoutes.bridge,cut=window.SpatialApp.BridgeRoadClearanceV30;
const terrain=db.terrain.huajiang,N=terrain.n,samples=terrain.samples;
const x0=samples[0][0],z0=samples[0][2],dx=samples[N-1][0]-x0,dz=samples[(N-1)*N][2]-z0;
const elev=(x,z)=>{const ix=Math.max(0,Math.min(N-1,Math.round((x-x0)/dx*(N-1)))),iz=Math.max(0,Math.min(N-1,Math.round((z-z0)/dz*(N-1))));return samples[iz*N+ix][1]};
let checked=0,minGap=Infinity,changed=0;
for(let i=0;i<=200;i++){
 const frame=route.at(i/200),p=frame.position;
 for(const offset of [-23,0,23]){
  const px=p.x+frame.side.x*offset,pz=p.z+frame.side.z*offset;const orig=elev(px,pz),c=cut.height(px,pz,orig);
  assert(c<=orig+1e-9,'visual cut may never raise terrain');
  assert(c<=p.y-16,'road clearance violated at '+i+','+offset)
  minGap=Math.min(minGap,p.y-c);if(c<orig-1e-6)changed++;checked++;
 }
}
for(const [x,z] of [[0,720],[2600,900],[-2800,700],[-300,980]]){
 assert.strictEqual(cut.height(x,z,1350),1350,'far terrain must stay unchanged');
}
console.log(JSON.stringify({status:'PASS',routeSamples:checked,minimumApproximateDeckGap:minGap,correctedSamples:changed,untouchedSourceFile:'assets/data/database.bundle.js',boundaryBehavior:'PASS'},null,2));
