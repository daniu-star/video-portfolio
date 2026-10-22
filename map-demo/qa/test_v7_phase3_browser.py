"""V7 P3 offline Chromium smoke & SDK adapter contract tests (mock SDK, no live auth)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>'+ (ROOT/m[1]).read_text(encoding='utf-8')+'</style>',html)
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+ (ROOT/m[1]).read_text(encoding='utf-8').replace('</script>','<\\/script>')+'</script>',html)
report={'method':'Chromium static assets inlined; provider objects stubbed. NOT live geographic SDK auth/DEM proof','checks':[],'errors':[]}
def ck(name,value):
 report['checks'].append({'name':name,'passed':bool(value)})
 if not value:raise AssertionError(name)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
 page=browser.new_page(viewport={'width':1440,'height':900})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded');page.wait_for_timeout(180)
 ck('geo module present',page.evaluate('SpatialApp.Geo.initialized'))
 page.locator('#enterMapBtn').click();page.wait_for_timeout(1240)
 page.locator('#geoHelpOpen').click();ck('operation help displayed',page.locator('#geoHelp').is_visible())
 page.locator('#geoHelpDone').click();ck('operation help closed',not page.locator('#geoHelp').is_visible())
 page.locator('#geoOpen').click();ck('map provider setup visible',page.locator('#geoConfig').is_visible())
 page.locator('#geoConnect').click();ck('blank key is rejected clearly','填写有效' in page.locator('#geoStatus').inner_text())
 page.locator('[data-geo-provider="google"]').click();ck('google provider fields',page.locator('#geoGoogleNote').is_visible() and not page.locator('#geoAmapProxyRow').is_visible())
 page.locator('[data-close-geo]').click();ck('setup closes',not page.locator('#geoConfig').is_visible())
 page.locator('#photoOpen').click();ck('photo dialog opens',page.locator('#photoModal').is_visible())
 ck('photo author displayed','SCJiang' in page.locator('#photoCredit').inner_text() or 'Glabb' in page.locator('#photoCredit').inner_text())
 page.locator('[data-photo-site="fast"]').click();ck('fast author license','CC BY-SA 4.0' in page.locator('#photoCredit').inner_text())
 page.locator('[data-photo-site="huajiang"]').click();ck('bridge author license','Glabb' in page.locator('#photoCredit').inner_text())
 page.locator('#photoClose').click()
 page.locator('#siteSelect').select_option('huajiang');page.wait_for_timeout(400)
 ck('bridge pulsing entry appears',page.locator('#bridgePulse').is_visible())
 page.locator('#bridgePulse').click();ck('bridge beacon opens prepare',page.locator('#drivePrepare').is_visible())
 page.locator('#driveCancel').click()
 # Mock AMap API: contract & lifecycle only (does not prove real terrain).
 page.evaluate('''() => {window.AMap={
  convertFrom:(coords,kind,cb)=>cb('complete',{locations:[{lng:coords[0]+.006,lat:coords[1]+.003}]}),
  Pixel:class {constructor(x,y){this.x=x;this.y=y}},
  Marker:class{constructor(o){this.o=o}on(){}setMap(){}},
  Map:class{constructor(el,o){this.el=el;this.options=o;this.events={};window.__amapOptions=o}on(n,f){this.events[n]=f}setPitch(){}setZoomAndCenter(z,c){window.__amapFocus=c}destroy(){window.__amapDestroyed=true}}
 } }''')
 page.locator('#geoOpen').click();page.locator('[data-geo-provider="amap"]').click();page.locator('#geoApiKey').fill('localTestDemoKey123456');page.locator('#geoDevSecretRow summary').click();page.locator('#geoDevSecret').fill('local-demo-secret');page.locator('#geoConnect').click();page.wait_for_timeout(500)
 ck('AMap adapter activates view',page.evaluate("SpatialApp.Geo.mode==='amap' && document.body.classList.contains('is-geo-map')"))
 ck('terrain true configured',page.evaluate('window.__amapOptions.terrain===true && window.__amapOptions.viewMode===\'3D\''))
 page.locator('#geoFocusFast').click();page.wait_for_timeout(120)
 ck('AMap coordinates converted',page.evaluate('Math.abs(window.__amapFocus[0]-106.8626259)<.001'))
 page.locator('#geoClose').click();ck('AMap cleaned up',page.evaluate("SpatialApp.Geo.mode==='demo' && window.__amapDestroyed && !document.body.classList.contains('is-geo-map')"))
 # Google adapter with fake 3D HTMLElement. No external billable requests.
 page.evaluate('''() => {window.google={maps:{importLibrary: async n=>({Map3DElement:class extends HTMLElement{constructor(o){super();this.options=o;window.__googleOptions=o}},Marker3DElement:class extends HTMLElement{constructor(o){super();this.options=o}}})}};
 customElements.define('mock-map3d',class extends HTMLElement{});
 }''')
 # HTMLElement subclasses constructed with illegal constructors in JS; replace with a registered real custom element.
 page.evaluate('''() => {class M extends HTMLElement {constructor(o){super();this.options=o;window.__googleOptions=o}};class K extends HTMLElement{constructor(o){super();this.options=o}};customElements.define('mock-map-3d',M);customElements.define('mock-marker-3d',K);google.maps.importLibrary=async()=>({Map3DElement:M,Marker3DElement:K})}''')
 page.locator('#geoOpen').click();page.locator('[data-geo-provider="google"]').click();page.locator('#geoConnect').click();page.wait_for_timeout(200)
 ck('Google adapter activates 3D view',page.evaluate("SpatialApp.Geo.mode==='google' && window.__googleOptions.mode==='HYBRID'"))
 page.locator('#geoClose').click()
 ck('geo exit restores old map controls',page.locator('#driveQuickStart').is_visible())
 ck('no JavaScript errors',not errors);report['errors']=errors
 (ROOT/'qa/screenshots').mkdir(exist_ok=True)
 page.screenshot(path=str(ROOT/'qa/screenshots/V7_P3_desktop.png'))
 mobile=browser.new_page(viewport={'width':390,'height':844})
 mobile.set_content(html,wait_until='domcontentloaded');mobile.locator('#enterMapBtn').click();mobile.wait_for_timeout(1250)
 mobile.locator('#photoOpen').click();ck('mobile photo modal visible',mobile.locator('#photoModal').is_visible())
 ck('mobile photo dialog within width',mobile.evaluate('(()=>{const r=document.querySelector(".photo-sheet").getBoundingClientRect();return r.left>=0&&r.right<=innerWidth})()'))
 mobile.screenshot(path=str(ROOT/'qa/screenshots/V7_P3_mobile.png'))
 browser.close()
report['passed']=sum(x['passed'] for x in report['checks']);report['total']=len(report['checks'])
(ROOT/'qa/V7_P3_BROWSER_TEST.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
