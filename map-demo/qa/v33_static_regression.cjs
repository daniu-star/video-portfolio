// V33 static guarantees. Run from project root: node qa/v33_static_regression.cjs
const fs=require('fs'),assert=require('assert'),vm=require('vm');
const read=x=>fs.readFileSync(x,'utf8');
const terrain=read('assets/js/scene/webgl-terrain-v25.js'),drive=read('assets/js/scene/v32-drive-world.js');
const proj=read('assets/js/scene/projection-v33.js'),journey=read('assets/js/ux/v20-journeys.js');
let context={window:{SpatialApp:{}},location:{search:''},URLSearchParams};vm.runInNewContext(proj,context);
const c=context.window.SpatialApp.ProjectionV33;
assert(Math.abs(c.ndcAt(c.near)+1)<1e-9);assert(Math.abs(c.ndcAt(c.far)-1)<1e-9);
assert(c.ndcAt(100)<c.ndcAt(200));assert.strictEqual(context.window.SpatialApp.RenderSafetyV33.canUseGPUDrive(),false);
for(const [kind,source] of [['terrain',terrain],['road',drive]]){
 assert(source.includes('uDepthClip'),kind+' shared depth missing');
 assert(!source.includes('1.0001-35.'),kind+' deprecated projection');
 assert(!source.includes('1.00005-.25'),kind+' deprecated projection');
}
assert(terrain.includes('gl.uniform2fv(L.uDepthClip,NS.ProjectionV33.clip)'));
assert(terrain.includes('gl.uniform2fv(loc.uDepthClip,NS.ProjectionV33.clip)'));
assert(drive.includes('gl.uniform2fv(loc.uDepthClip,NS.ProjectionV33.clip)'));
assert.strictEqual((terrain.match(/canvas.addEventListener\('webglcontextlost'/g)||[]).length,1);
assert(journey.includes('const before=d.progress')&&journey.includes('originalAdvance(dt)'));
assert(!journey.includes('d.duration/(d.timeScale'));
const entry=read('assets/js/ux/v17-entry.js');assert(entry.includes('data-hub-action="casebook"')&&!entry.includes('data-hub-action="truck"'));
console.log('V33 STATIC PASS: shared projection, fail-safe preview, 5-checkpoint distance gate, active hub');
