// V34: test the exact color-chain failure that made the Canvas mountains invisible.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/js/math.js'),'utf8'),context);
const M=context.window.SpatialApp.Math3D;
const a=M.mix('#304a37','#a1ad80',.47);
const b=M.mix(a,'#89877d',.32);
const c=M.mix('#172c2a',b,.76);
const d=M.mix(c,'#92aba7',.13);
for(const [name,v] of [['base',a],['exposed',b],['lit',c],['fog',d]]){
 assert(/^rgb\(\d+,\d+,\d+\)$/.test(v),name+': '+v);
 const t=M.hex(v);assert(t.length===3&&t.every(x=>Number.isFinite(x)&&x>=0&&x<=255),v);
}
assert.deepEqual([...M.hex('#abc')],[170,187,204]);
assert.deepEqual([...M.hex('rgba(12, 24, 64, 0.8)')],[12,24,64]);
console.log(JSON.stringify({test:'V34 nested rgb color compositing',result:'PASS',colors:{a,b,c,d}},null,2));
