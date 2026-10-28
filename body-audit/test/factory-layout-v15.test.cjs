const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
const css=fs.readFileSync(path.join(root,'css/factory-layout-v15.css'),'utf8');
test('第三幕包含独立可折叠任务台与可访问性属性',()=>{
 for(const s of ['id="factoryDock"','id="factoryToggle"','aria-controls="factoryControls"','aria-expanded="false"','id="factoryDockBrief"'])assert.ok(html.includes(s),s);
 assert.match(html,/factory-layout-v15\.css/);
});
test('任务面板有真实开关状态而非仅删除内容',()=>{
 assert.match(js,/function setFactoryDock\(open\)/);
 assert.match(js,/factoryDockOpen=Boolean\(open\)/);
 assert.match(js,/factoryControls'\)\.setAttribute\('aria-hidden'/);
 assert.match(js,/\$\('factoryToggle'\)\.onclick=/);
 assert.match(css,/\[data-open="false"\] \.factory-controls\{display:none!important\}/);
});
test('第三幕按钮支持窄边栏、移动端紧凑态和独立滚动',()=>{
 assert.match(css,/width:clamp\(330px,29vw,420px\)/);
 assert.match(css,/@media\(max-width:680px\)/);
 assert.match(css,/overflow-y:auto/);
 assert.match(css,/53dvh/);
});
