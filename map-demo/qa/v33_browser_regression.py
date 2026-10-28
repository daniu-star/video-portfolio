"""V33 offline Chromium regression (optional dependency: playwright, Chromium).
Run from project root: python qa/v33_browser_regression.py
Does not make external network requests or change user game progress outside isolated contexts.
"""
from pathlib import Path
import json,re,sys,shutil
try:
 from playwright.sync_api import sync_playwright
except ImportError:
 print('Install playwright (Python) and a Chromium browser to run this optional test')
 sys.exit(2)
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text(encoding='utf-8')
def css(m):
 p=ROOT/m.group(1)
 return f'<style>\n{p.read_text(encoding="utf-8")}\n</style>' if p.is_file() else m.group(0)
def js(m):
 p=ROOT/m.group(1)
 return f'<script>\n{p.read_text(encoding="utf-8").replace("</script>","<\\/script>")}\n</script>' if p.is_file() else m.group(0)
html=re.sub(r'<link\s+rel="stylesheet"\s+href="([^"]+)"\s*/?>',css,html)
html=re.sub(r'<script\s+src="([^"]+)"\s*>\s*</script>',js,html)
report=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(1280,800),(390,844)]:
  page=browser.new_page(viewport={'width':width,'height':height});errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded',timeout=30000)
  page.evaluate("""()=>{SpatialApp.V17Entry?.finish(true);SpatialApp.App.setSite('huajiang');SpatialApp.Drive.prepare(SpatialApp.DriveRoutes.bridge);SpatialApp.Drive.start('cockpit')}""")
  page.wait_for_timeout(400)
  assert page.evaluate('SpatialApp.Drive.active')
  assert not page.evaluate("document.body.classList.contains('v32-depth-drive')"),'GPU should not hide Canvas by default'
  for i,at in enumerate([.11,.29,.49,.69,.86]):
   state=page.evaluate("""(at)=>{let d=SpatialApp.Drive,j=SpatialApp.Stage4Journey;d.paused=false;d.phase='active';d.progress=at-.00012;d.physics.distance=d.progress*d.route.length;d.physics.speed=25;d.advance(.05);return {open:j.bridge.open,index:j.bridge.index}}""",at)
   assert state['open'] and state['index']==i,(width,i,state)
   task=page.locator('#v20BridgeMission')
   task.locator('[data-v20="view"]').first.click();task.locator('[data-v20="view"]').last.click()
   task.locator('[data-v20="decide"]').click();task.locator('[data-v20="answer"]').first.click();task.locator('[data-v20="continue"]').click()
  assert len(page.evaluate('[...SpatialApp.Stage4Journey.bridge.seen]'))==5
  page.evaluate('SpatialApp.Drive.exit()')
  page.evaluate('SpatialApp.GameHub.open()')
  assert page.locator('#gameHub [data-hub-action="truck"]').count()==0
  page.locator('#gameHub [data-hub-action="casebook"]').click()
  for _ in range(3):
   case=page.locator('#casebookGame')
   case.locator('[data-case="choose"][data-id="f"]').click()
   case.locator('[data-case="choose"][data-id="b"]').click()
   case.locator('[data-case="verify"]').click()
   case.locator('[data-case="continue"]').click()
  assert page.evaluate('SpatialApp.RelationGame.completedCount()')==3
  page.locator('#casebookGame [data-case="exit"]').click()
  page.evaluate('SpatialApp.FastGame.open()')
  assert page.locator('.v23-role').count()==3
  page.locator('.v23-role').first.click()
  assert page.locator('[data-px="walk"]').count()==1
  page.locator('#v23Exit').click()
  assert not errors,errors
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  report.append({'viewport':f'{width}x{height}','five_bridge_checkpoints':True,'casebook_cases':3,'fast_roles':3,'errors':errors,'horizontal_overflow':False})
  page.close()
 browser.close()
print(json.dumps({'result':'PASS','tests':report,'gpu_real_render':'NOT TESTED'},ensure_ascii=False,indent=2))
