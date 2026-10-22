"""Offline headless smoke test, with equivalent inline assets for blocked local navigations.
Run: python qa/test_v7_phase1_browser.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re,json
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text(encoding='utf-8')
def inline_css(m):
    path=m.group(1)
    return '<style data-file="'+path+'">'+(ROOT/path).read_text(encoding='utf-8')+'</style>'
def inline_js(m):
    path=m.group(1)
    return '<script data-file="'+path+'">'+(ROOT/path).read_text(encoding='utf-8').replace('</script>', '<\\/script>')+'</script>'
html=re.sub(r'<link rel="stylesheet" href="([^"]+)">',inline_css,html)
html=re.sub(r'<script src="([^"]+)"></script>',inline_js,html)
report={'method':'headless Chromium using inlined project assets (local navigation administratively blocked)','results':[]}
def ok(name, condition):
    report['results'].append({'name':name,'passed':bool(condition)})
    assert condition,name
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.set_content(html,wait_until='domcontentloaded',timeout=30000)
    page.wait_for_timeout(300)
    ok('startup scenes loaded',page.evaluate("SpatialApp.DB.buildingsBySite.huajiang.length > 100 && SpatialApp.DB.features['building:b_yundu_main']!==undefined"))
    page.locator('#enterMapBtn').click()
    page.wait_for_timeout(1450)
    ok('prologue enter',page.evaluate('SpatialApp.state.entered'))
    page.locator('#exploreStart').click()
    page.wait_for_timeout(1050)
    ok('explore entry selects defined building',page.evaluate("SpatialApp.state.selectedFeature==='building:b_yundu_main'"))
    ok('fallback is honest', '现场照片尚未入库' in page.locator('#featurePanel').inner_text() and '示意建筑' in page.locator('#featurePanel').inner_text())
    ok('panel opens',page.locator('#featurePanel').get_attribute('aria-hidden')=='false')
    page.screenshot(path=str(ROOT/'qa/screenshots/V7_P1_building_panel.png'))
    page.locator('#featureBack').click()
    ok('back clears selected feature',page.evaluate('SpatialApp.state.selectedFeature===null'))
    # True pointer click, choose visible camera-projected building with testable polygon.
    result=page.evaluate('''() => {
      const e=SpatialApp.App.engine;
      const candidates=e.buildingScreens.map(f=>{
        const x=f.polygon.reduce((s,p)=>s+p.x,0)/f.polygon.length,y=f.polygon.reduce((s,p)=>s+p.y,0)/f.polygon.length;
        return {id:f.id,x,y,hit:e.pickObjectAt(x,y)};
      }).filter(f=>f.x>500&&f.x<980&&f.y>230&&f.y<650&&f.hit&&f.hit.type==='feature'&&f.hit.id.startsWith('building:'));
      return candidates[0]||null;
    }''')
    if result:
        page.mouse.click(result['x'],result['y']);page.wait_for_timeout(200)
        ok('canvas pointer selects building',page.evaluate('SpatialApp.state.selectedFeature!==null && SpatialApp.state.selectedFeature.startsWith("building:")'))
        page.keyboard.press('Escape');page.wait_for_timeout(100)
        ok('Escape closes panel',page.locator('#featurePanel').get_attribute('aria-hidden')=='true')
    else: report['results'].append({'name':'canvas pointer selects building','passed':None,'note':'No unobstructed building at tested viewport; retest with camera manipulation'})
    road_point=page.evaluate('''() => {
      const e=SpatialApp.App.engine;
      for(const r of e.roadScreens){for(let i=1;i<r.points.length;i++){
        const a=r.points[i-1],b=r.points[i];for(const t of [.25,.5,.75]){
          const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
          if(x>500&&x<970&&y>180&&y<720){const hit=e.pickObjectAt(x,y);
            if(hit&&hit.type==='feature'&&hit.id.startsWith('road:'))return{x,y,id:hit.id};
          }
        }
      }}return null;
    }''')
    if road_point:
        page.mouse.click(road_point['x'],road_point['y']);page.wait_for_timeout(150)
        ok('canvas pointer selects road',page.evaluate('SpatialApp.state.selectedFeature=== '+json.dumps(road_point['id'])))
        page.locator('#featureBack').click()
    else:report['results'].append({'name':'canvas pointer selects road','passed':None,'note':'No unobstructed road in tested viewport'})
    page.evaluate("SpatialApp.App.selectSpatialFeature('road:la_s57')")
    ok('road details open', '道路示意' in page.locator('#featurePanel').inner_text() and '未验证可驾驶' in page.locator('#featurePanel').inner_text())
    page.locator('#featureBack').click()
    page.evaluate("SpatialApp.App.selectNode('bridge_core',{focus:false})")
    ok('original node dossier works',page.evaluate("SpatialApp.state.selected==='bridge_core' && SpatialApp.state.selectedFeature===null"))
    page.locator('#siteSelect').select_option('fast');page.wait_for_timeout(100)
    ok('site switch works',page.evaluate("SpatialApp.state.site==='fast'&&SpatialApp.state.selectedFeature===null"))
    ok('no JS page errors',len(errors)==0)
    phone=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    phone_errors=[]
    phone.on('pageerror',lambda err:phone_errors.append(str(err)))
    phone.set_content(html,wait_until='domcontentloaded',timeout=30000)
    phone.locator('#enterMapBtn').click();phone.wait_for_timeout(1350)
    phone.locator('#exploreStart').click();phone.wait_for_timeout(300)
    ok('mobile feature panel opens',phone.locator('#featurePanel').get_attribute('aria-hidden')=='false')
    ok('mobile panel fits viewport',phone.evaluate('''() => {const r=document.querySelector('#featurePanel').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight}'''))
    phone.screenshot(path=str(ROOT/'qa/screenshots/V7_P1_mobile.png'))
    phone.locator('#featureClose').click()
    ok('mobile close works',phone.locator('#featurePanel').get_attribute('aria-hidden')=='true')
    ok('no mobile JS errors',not phone_errors)
    report['errors']=errors+phone_errors
    browser.close()
(ROOT/'qa/V7_P1_BROWSER_TEST.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
