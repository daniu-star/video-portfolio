import json,re
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'qa'/'v8';OUT.mkdir(parents=True,exist_ok=True)
html=(ROOT/'index.html').read_text('utf-8')
html=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>'+(ROOT/m[1]).read_text('utf-8')+'</style>',html)
html=html.replace('<script src="assets/data/database.bundle.js"></script>','<script>window.requestAnimationFrame=()=>0;</script><script src="assets/data/database.bundle.js"></script>')
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(ROOT/m[1]).read_text('utf-8').replace('</script>','<\\/script>')+'</script>',html)
html=html.replace('</head>','<style>*,*:before,*:after{animation:none!important;transition:none!important}</style></head>')
REPORT=[]

def log(name,fn):
 try:
  result=fn();result=True if result is None else bool(result)
  REPORT.append({'test':name,'passed':result})
  print(('PASS' if result else 'FAIL'),name,flush=True)
 except Exception as exc:
  REPORT.append({'test':name,'passed':False,'error':str(exc)[:200]});print('FAIL',name,str(exc)[:170],flush=True)

def run(br,device,w,h):
 p=br.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
 errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 p.set_content(html,wait_until='domcontentloaded');p.wait_for_timeout(500)
 log(device+' init',lambda:p.evaluate('Boolean(window.SpatialApp&&SpatialApp.App&&SpatialApp.FastGame)'))
 log(device+' terrain status',lambda:p.locator('#terrainTruth').is_visible() and '模拟' in p.locator('#terrainTruth').inner_text())
 log(device+' enter map',lambda:p.locator('#enterMapBtn').click(timeout=5000))
 p.wait_for_timeout(1250)
 if p.locator('#visitorGuideClose').is_visible():p.locator('#visitorGuideClose').click()
 p.wait_for_timeout(350)
 log(device+' driving entry',lambda:p.locator('#driveQuickStart').click(timeout=5000))
 log(device+' driving prepared',lambda:p.locator('#drivePrepare').is_visible())
 log(device+' driving start',lambda:p.locator('#driveConfirm').click(timeout=5000))
 log(device+' driving active',lambda:p.evaluate('SpatialApp.Drive.active'))
 log(device+' model in follow camera',lambda:p.locator('[data-drive-view="follow"]').click(timeout=5000))
 log(device+' model state',lambda:p.evaluate('SpatialApp.Drive.mode==="follow"'))
 p.evaluate('SpatialApp.App.engine.render()');p.screenshot(path=str(OUT/(device+'_follow_vehicle.png')),animations='disabled',timeout=7000)
 log(device+' left lane',lambda:p.locator('#driveLaneLeft').click(timeout=5000))
 log(device+' lane offset',lambda:p.evaluate('SpatialApp.Drive.laneOffset<0'))
 log(device+' right lane',lambda:p.locator('#driveLaneRight').click(timeout=5000))
 log(device+' scenic pause',lambda:p.locator('#driveScenicStop').click(timeout=5000))
 log(device+' scenic state',lambda:p.evaluate('SpatialApp.Drive.scenic===true && SpatialApp.Drive.paused===true'))
 log(device+' scenic resume',lambda:p.locator('#driveScenicStop').click(timeout=5000))
 log(device+' glance',lambda:p.locator('#driveLookRight').click(timeout=5000))
 log(device+' exit driving',lambda:p.locator('#driveExit').click(timeout=5000))
 log(device+' switch FAST',lambda:p.evaluate('SpatialApp.App.setSite("fast")'))
 p.wait_for_timeout(400)
 log(device+' FAST launch',lambda:p.locator('#fastQuickStart').click(timeout=5000))
 log(device+' FAST start',lambda:p.locator('[data-fast-action="begin"]').click(timeout=5000))
 log(device+' FAST 3D canvas',lambda:p.locator('#fastScene').is_visible())
 log(device+' FAST hotspots',lambda:p.locator('[data-fast-action="emitter"]').count()==3)
 p.screenshot(path=str(OUT/(device+'_fast_immersive.png')),animations='disabled')
 for ident in ['mobile','drone','station']:
  log(device+' deactivate '+ident,lambda ident=ident:p.locator(f'[data-fast-action="emitter"][data-id="{ident}"]').click(timeout=5000))
 log(device+' fast stage two',lambda:(p.locator('[data-fast-action="next"]').click(timeout=5000),p.evaluate('SpatialApp.FastGame.stage===1'))[1])
 for ident in ['core','middle','outer']:
  log(device+' inspect '+ident,lambda ident=ident:p.locator(f'[data-fast-action="inspect"][data-id="{ident}"]').click(timeout=5000))
 log(device+' fast stage three',lambda:(p.locator('[data-fast-action="next"]').click(timeout=5000),p.evaluate('SpatialApp.FastGame.stage===2'))[1])
 log(device+' azimuth adjustment',lambda:p.locator('#fastAz').fill('125'))
 log(device+' elevation adjustment',lambda:p.locator('#fastEl').fill('42'))
 log(device+' fast finish',lambda:(p.locator('[data-fast-action="tune"]').click(timeout=5000),p.evaluate('SpatialApp.FastGame.stage===3'))[1])
 p.screenshot(path=str(OUT/(device+'_fast_completed.png')),animations='disabled')
 log(device+' fast exit',lambda:p.locator('[data-fast-action="exit"]').click(timeout=5000))
 log(device+' no JS page errors',lambda:len(errors)==0)
 if errors: print('ERRORS',errors,flush=True)
 p.close()

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for v in [('desktop',1366,768),('mobile',390,844)]:run(browser,*v)
 browser.close()
summary={'checked':len(REPORT),'passed':sum(x['passed'] for x in REPORT),'failed':sum(not x['passed'] for x in REPORT),'checks':REPORT,'method':'实际 Chromium 浏览器采用内联加载项目原样 HTML/CSS/JS；不验证 file://、HTTP 站点加载或外部地形下载'}
(OUT/'result.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),'utf-8')
print('SUMMARY',summary['checked'],summary['passed'],summary['failed'])
