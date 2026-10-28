const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const js=path.join(__dirname,'../js');
const game=fs.readFileSync(path.join(js,'game.js'),'utf8');
const director=fs.readFileSync(path.join(js,'director-v9.js'),'utf8');
const engine=fs.readFileSync(path.join(js,'engine.js'),'utf8');
test('第二幕过场不再使用「那句话回来了」等无指代隐喻',()=>{
 assert.doesNotMatch(game+director,/那句话，?回来了|这一句，?没留下|你补回了那句话|工位熄灯了/);
 assert.match(director,/漏记内容已补入记录/);
});
test('第二幕镜头会带入本次真实漏记内容，而非引用固定句子',()=>{
 assert.match(game,/G\.ctx\.omitted/);
 assert.match(game,/FleshDirector\.burst\(type,detail\)/);
 assert.match(director,/function burst\(type,detail=\{\}\)/);
});
test('第二幕回执明确列出本人原话、AI初稿、漏记项、修改结果',()=>{
 for(const label of ['你刚才说','AI最初记成','漏记的是','你要求补充后','你暂时没有修改'])assert.ok(game.includes(label),label);
 assert.ok(game.includes('res.transcript'));
 assert.ok(game.includes('G.ctx.bad'));
});
test('问诊AI不再冒用患者第一人称或虚构真实预约',()=>{
 assert.doesNotMatch(game,/我知道了。可是我刚才那份记录/);
 assert.match(engine,/尚未预约/);
 assert.match(engine,/尚未发送消息/);
});
