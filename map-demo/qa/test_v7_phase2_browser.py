"""V7 P2 browser regression in offline/headless Chromium. Run: python qa/test_v7_phase2_browser.py"""
from pathlib import Path
import json,re,sys,time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>'+ (ROOT/m[1]).read_text(encoding='utf-8')+'</style>',html)
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+ (ROOT/m[1]).read_text(encoding='utf-8').replace('</script>','<\\/script>')+'</script>',html)
report={'name':'V7 Stage 2 Driving Browser QA','environment':'Headless Chromium; inlined static project assets, no network','checks':[],'errors':[]}
def assert_check(name,ok):
    report['checks'].append({'name':name,'passed':bool(ok)})
    if not ok: raise AssertionError(name)

def get(page,js):return page.evaluate(js)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
    page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='domcontentloaded');page.wait_for_timeout(100)
    assert_check('DB and simulation modules loaded',get(page,"!!SpatialApp.DriveRoutes.bridge && SpatialApp.DB.buildingsBySite.huajiang.length>100"))
    assert_check('route source explicitly simulated',get(page,"SpatialApp.DriveRoutes.bridge.status==='SIMULATED'"))
    assert_check('FAST has no driveable route',get(page,"SpatialApp.DriveRoutes.forRoad('fast','fast_town_spine')===null"))
    page.locator('#enterMapBtn').click();page.wait_for_timeout(1350)
    before=get(page,'({site:SpatialApp.state.site,time:SpatialApp.state.timeline,mode:SpatialApp.state.mode,cam:JSON.stringify(SpatialApp.App.engine.cam)})')
    assert_check('prologue entered',get(page,'SpatialApp.state.entered'))
    page.locator('#driveQuickStart').click()
    assert_check('explicit preflight confirmation',page.locator('#drivePrepare').is_visible() and get(page,"SpatialApp.Drive.phase==='prepare'"))
    assert_check('preflight preserves initial site',get(page,"SpatialApp.state.site==='overview'"))
    page.keyboard.press('Escape')
    assert_check('preflight cancel by Escape',get(page,"SpatialApp.Drive.phase==='idle'"))
    page.locator('#driveQuickStart').click()
    page.locator('#driveViewInitial').select_option('passenger')
    page.locator('#driveConfirm').click();page.wait_for_timeout(200)
    before=get(page,'({site:SpatialApp.Drive.snapshot.site,time:SpatialApp.Drive.snapshot.timeline,mode:SpatialApp.Drive.snapshot.mode,cam:JSON.stringify(SpatialApp.Drive.snapshot.camera)})')
    assert_check('driving starts in selected passenger perspective',get(page,"SpatialApp.Drive.active && SpatialApp.Drive.mode==='passenger' && SpatialApp.App.engine.cam.pose!==undefined"))
    assert_check('switches to bridge site',get(page,"SpatialApp.state.site==='huajiang'"))
    assert_check('historical timeline pushed to post-opening',get(page,'SpatialApp.state.timeline>=.91'))
    page.keyboard.press('1');assert_check('key 1 cockpit mode',get(page,"SpatialApp.Drive.mode==='cockpit'"))
    page.keyboard.press('3');assert_check('key 3 follow mode',get(page,"SpatialApp.Drive.mode==='follow'"))
    page.keyboard.press('4');assert_check('key 4 cinematic mode',get(page,"SpatialApp.Drive.mode==='cinematic'"))
    page.locator('[data-drive-view="cockpit"]').click();assert_check('HUD perspective control works',get(page,"SpatialApp.Drive.mode==='cockpit'"))
    page.keyboard.press('Space');assert_check('Space pauses',get(page,'SpatialApp.Drive.paused'))
    old=get(page,'SpatialApp.Drive.progress');page.wait_for_timeout(190)
    assert_check('pause freezes route progress',abs(get(page,'SpatialApp.Drive.progress')-old)<1e-9)
    page.locator('#driveProgress').fill('520')
    assert_check('route seek sets progress and chapter',get(page,'SpatialApp.Drive.progress>=.52') and '越过峡谷' in page.locator('#driveChapter').inner_text())
    page.screenshot(path=str(ROOT/'qa/screenshots/V7_P2_cockpit_midspan.png'))
    page.locator('#driveRate').select_option('1.65');assert_check('tempo control changes playback rate',get(page,'SpatialApp.Drive.timeScale===1.65'))
    page.locator('#driveInfo').click();assert_check('evidence disclosure opens',page.locator('#driveEvidence').is_visible())
    page.locator('#drivePause').click();assert_check('resume works',not get(page,'SpatialApp.Drive.paused'))
    page.locator('#driveProgress').fill('1000');page.wait_for_timeout(130)
    assert_check('journey reaches completion',page.locator('#driveFinish').is_visible())
    page.locator('#driveReplay').click();assert_check('completion supports replay',get(page,"SpatialApp.Drive.phase==='active' && SpatialApp.Drive.progress<.05"))
    page.locator('#driveExit').click()
    assert_check('exit restores prior site',get(page,"SpatialApp.state.site==='overview' && SpatialApp.Drive.phase==='idle'"))
    assert_check('exit restores time, mode and camera',get(page,'SpatialApp.state.timeline')==before['time'] and get(page,'SpatialApp.state.mode')==before['mode'] and get(page,'JSON.stringify(SpatialApp.App.engine.cam)')==before['cam'])
    assert_check('exit clears overlay and camera rig',not page.locator('#driveHud').is_visible() and get(page,'!SpatialApp.App.engine.cam.pose'))
    # Existing road panel is the second entrance.
    page.locator('#siteSelect').select_option('huajiang');page.wait_for_timeout(50)
    page.evaluate("SpatialApp.App.selectSpatialFeature('road:la_s57')");page.wait_for_timeout(260)
    assert_check('selected bridge road offers a simulated tour',page.locator('#featureDrive').is_visible())
    page.locator('#featureDrive').click()
    assert_check('road detail enters preflight',page.locator('#drivePrepare').is_visible())
    page.locator('#driveConfirm').click()
    page.keyboard.press('Escape')
    assert_check('Escape restores road panel',page.locator('#featurePanel').is_visible() and get(page,"SpatialApp.state.selectedFeature==='road:la_s57'"))
    page.locator('#featureBack').click()
    page.evaluate("SpatialApp.App.selectSpatialFeature('building:b_yundu_main')");page.wait_for_timeout(260)
    assert_check('existing building media/evidence panel unaffected',page.locator('#featurePanel').is_visible() and '现场照片尚未入库' in page.locator('#featurePanel').inner_text())
    page.locator('#featureBack').click()
    page.locator('#siteSelect').select_option('fast');page.wait_for_timeout(50)
    page.evaluate("SpatialApp.App.selectSpatialFeature('road:fast_town_spine')");page.wait_for_timeout(260)
    assert_check('FAST simulated roads do not expose car driving',page.locator('#featureDrive').count()==0)
    page.locator('#featureBack').click()
    # Repeat entry/exit with route prepare, no accumulating application state or event handlers.
    cycles=20
    page.evaluate('''async n => { for(let i=0;i<n;i++){
      SpatialApp.Drive.prepare(SpatialApp.DriveRoutes.bridge);
      if(!SpatialApp.Drive.start('cockpit'))throw Error('start failed '+i);
      SpatialApp.Drive.seek(.35); SpatialApp.Drive.setMode('passenger');
      SpatialApp.Drive.exit();
      if(SpatialApp.Drive.phase!=='idle'||SpatialApp.App.engine.cam.pose)throw Error('exit failed '+i);
    }}''',cycles)
    assert_check('20 enter/exit cycles leave no driving state',get(page,"SpatialApp.Drive.phase==='idle' && !SpatialApp.App.engine.cam.pose && SpatialApp.state.site==='fast'"))
    assert_check('no desktop JavaScript exceptions',not errors)
    report['desktop_errors']=errors
    phone=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    phone_err=[];phone.on('pageerror',lambda e:phone_err.append(str(e)))
    phone.set_content(html,wait_until='domcontentloaded');phone.locator('#enterMapBtn').click();phone.wait_for_timeout(1350)
    phone.locator('#driveQuickStart').click()
    assert_check('mobile preflight fits screen',get(phone,"(()=>{const b=document.querySelector('.drive-prep-card').getBoundingClientRect();return b.left>=0&&b.right<=innerWidth&&b.top>=0&&b.bottom<=innerHeight})()"))
    phone.locator('#driveConfirm').click();phone.wait_for_timeout(150)
    phone.evaluate('SpatialApp.Drive.seek(.48)');phone.wait_for_timeout(100)
    assert_check('mobile driving HUD fits screen',get(phone,"(()=>{for(const sel of ['.drive-controls','.drive-hud-top','.drive-view-rail']){const r=document.querySelector(sel).getBoundingClientRect();if(r.left<0||r.right>innerWidth+1||r.bottom>innerHeight+1)return false;}return true})()"))
    phone.screenshot(path=str(ROOT/'qa/screenshots/V7_P2_mobile_drive.png'))
    phone.locator('#driveExit').click()
    assert_check('mobile exit button restores page',get(phone,"SpatialApp.Drive.phase==='idle' && SpatialApp.state.site==='overview'"))
    assert_check('no mobile JavaScript exceptions',not phone_err)
    report['mobile_errors']=phone_err
    browser.close()
report['count']=len(report['checks']);report['passed']=sum(1 for c in report['checks'] if c['passed']);report['status']='PASS' if report['passed']==report['count'] else 'FAIL'
(ROOT/'qa/V7_P2_BROWSER_TEST.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
