"""Chromium integration harness: mock Terrarium tiles, NEVER claim the fixture is real DEM."""
from pathlib import Path
from io import BytesIO
from PIL import Image
from playwright.sync_api import sync_playwright
import re,json
ROOT=Path(__file__).resolve().parents[1]
h=(ROOT/'index.html').read_text('utf-8')
h=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>'+(ROOT/m[1]).read_text('utf-8')+'</style>',h)
h=h.replace('<script src="assets/data/database.bundle.js"></script>','<script>window.requestAnimationFrame=()=>0;</script><script src="assets/data/database.bundle.js"></script>')
h=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(ROOT/m[1]).read_text('utf-8').replace('</script>','<\\/script>')+'</script>',h)
b=BytesIO();Image.new('RGB',(256,256),(132,55,0)).save(b,format='PNG');fixture=b.getvalue()
results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for kind in ('success','failure'):
  page=browser.new_page(viewport={'width':1000,'height':700})
  def handler(route,request=None):
   if '/terrarium/' not in route.request.url:route.continue_()
   elif kind=='success':route.fulfill(status=200,content_type='image/png',body=fixture,headers={'Access-Control-Allow-Origin':'*','Cache-Control':'no-store'})
   else:route.abort('failed')
  page.route('**/*',handler)
  page.set_content(h,wait_until='domcontentloaded');page.wait_for_timeout(300)
  page.locator('#terrainTruth button').click()
  page.wait_for_function("()=>document.getElementById('terrainTruth').innerText.includes('已载入公开高程')||document.getElementById('terrainTruth').innerText.includes('地形仍为模拟：')",timeout=17000)
  result=page.evaluate('''()=>({real:SpatialApp.TerrainStatus.real,button:document.querySelector('#terrainTruth button')?.hidden,status:document.getElementById('terrainTruth').innerText,terrainFast:SpatialApp.DB.terrain.fast.data_status})''')
  valid=(result['real'] and result['terrainFast']=='OPEN_ELEVATION_OFFSET') if kind=='success' else (not result['real'] and result['terrainFast']=='SIMULATED')
  print(kind,valid,result,flush=True);results.append({'mode':kind,'passed':valid,'data':result});page.close()
 browser.close()
(ROOT/'qa/v8/terrain_test.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),'utf-8')
if not all(x['passed'] for x in results):raise SystemExit(1)
