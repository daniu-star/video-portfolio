"""Chromium user journey. Local file navigation may be admin-blocked in this environment;
loads the exact project's HTML with its local CSS and JS inlined. Does NOT test
file:// navigation, remote imagery, provider authentication or server deployment.
Usage: python qa/real_browser_journey.py
"""
import json,re,sys,time,os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'qa'/'journey'
OUT.mkdir(parents=True,exist_ok=True)
RAW=(ROOT/'index.html').read_text(encoding='utf-8')
PAGE=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style data-test-file="'+m[1]+'">'+(ROOT/m[1]).read_text(encoding='utf-8')+'</style>',RAW)
PAGE=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script data-test-file="'+m[1]+'">'+(ROOT/m[1]).read_text(encoding='utf-8').replace('</script>','<\\/script>')+'</script>',PAGE)
LAST_STEP='startup'
REPORT={'method':'Chromium DOM/CSS/JS inline from exact index.html; NOT file:// or HTTP load','checks':[],'screenshots':[],'errors':[]}

def check(page,subject,fn,shot=False):
 global LAST_STEP
 LAST_STEP=subject
 result={'subject':subject,'passed':False,'note':''}
 try:
  detail=fn()
  result['passed']=bool(detail is not False)
  if isinstance(detail,str):result['note']=detail[:500]
  page.wait_for_timeout(170)
 except Exception as ex:result['note']=str(ex).split('Call log:')[0][:300]
 REPORT['checks'].append(result)
 print(('PASS' if result['passed'] else 'FAIL'),subject,result['note'][:100],flush=True)
 if shot:
  name=f"{CASE}_{len(REPORT['screenshots']):02d}_{re.sub('[^a-zA-Z0-9]+','_',subject)[:28]}.png"
  try:page.screenshot(path=str(OUT/name),full_page=False,animations='disabled',timeout=10000);REPORT['screenshots'].append(name)
  except Exception as e: REPORT['errors'].append('screenshot: '+str(e)[:150])
 return result['passed']

def is_visible(page,selector):return page.locator(selector).is_visible()

def hit(page,selector):
 return page.evaluate('''(selector)=>{const b=document.querySelector(selector);if(!b)return 'missing';const r=b.getBoundingClientRect();if(r.width<1||r.height<1)return 'zero area';const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>=innerWidth||y>=innerHeight)return `offscreen center (${Math.round(x)},${Math.round(y)})`;const atop=document.elementFromPoint(x,y);return (atop===b||b.contains(atop))?'OK':`COVERED BY ${atop?.tagName||'?'}#${atop?.id||''}.${atop?.className?.toString().slice(0,90)||''}` }''',selector)

def run(page,prefix):
 global CASE
 CASE=prefix
 err=[]
 page.on('pageerror',lambda e:err.append(LAST_STEP+': '+str(e)))
 url=os.environ.get('JOURNEY_URL')
 if url:page.goto(url,wait_until='domcontentloaded',timeout=30000)
 else:page.set_content(PAGE,wait_until='domcontentloaded',timeout=30000)
 page.wait_for_timeout(350)
 check(page,'00_open_index_DOM',lambda:page.locator('#enterMapBtn').is_visible(),True)
 check(page,'01_enter_map_click',lambda:page.locator('#enterMapBtn').click(timeout=6000),False)
 page.wait_for_timeout(1450)
 check(page,'02_map_started',lambda:page.evaluate('SpatialApp.state.entered && document.body.classList.contains("is-map-entered")'),True)
 if page.locator('#visitorGuide').count():
  check(page,'03_onboarding_visible',lambda:is_visible(page,'#visitorGuide'),True)
  check(page,'04_onboarding_skip',lambda:page.locator('#visitorGuideClose').click(timeout=6000))
 check(page,'05_top_help_open',lambda:page.locator('#geoHelpOpen').click(timeout=6000),True)
 check(page,'06_top_help_close',lambda:page.locator('#geoHelpDone').click(timeout=6000))
 check(page,'07_photo_open',lambda:page.locator('#photoOpen').click(timeout=6000),True)
 check(page,'08_photo_source_exists',lambda:page.locator('#photoSource').get_attribute('href') not in ('','#'))
 if page.locator('#photoLoadState').count():
  check(page,'09_photo_load_status',lambda:page.locator('#photoLoadState').inner_text().strip()!='')
 check(page,'10_photo_close',lambda:page.locator('#photoClose').click(timeout=6000))
 check(page,'11_map_provider_dialog',lambda:page.locator('#geoOpen').click(timeout=6000),True)
 check(page,'12_no_key_error',lambda:(page.locator('#geoConnect').click(timeout=6000), '请填写有效' in page.locator('#geoStatus').inner_text())[1])
 check(page,'13_back_from_sdk',lambda:page.locator('#geoDemoBack').click(timeout=6000))
 check(page,'14_building_preview',lambda:page.locator('#exploreStart').click(timeout=6000),True)
 check(page,'15_building_panel_visible',lambda:is_visible(page,'#featurePanel'))
 check(page,'16_building_panel_close',lambda:page.locator('#featureClose').click(timeout=6000))
 check(page,'17_bridge_game_entry',lambda:page.locator('#driveQuickStart').click(timeout=6000),True)
 check(page,'18_driving_intro',lambda:is_visible(page,'#drivePrepare'))
 check(page,'19_start_drive',lambda:page.locator('#driveConfirm').click(timeout=6000),True)
 check(page,'20_driver_switch_passenger',lambda:(page.locator('[data-drive-view="passenger"]').click(timeout=6000),page.evaluate('SpatialApp.Drive.mode === "passenger"'))[1])
 check(page,'21_driver_switch_follow',lambda:(page.locator('[data-drive-view="follow"]').click(timeout=6000),page.evaluate('SpatialApp.Drive.mode === "follow"'))[1])
 check(page,'22_driver_look_right',lambda:(page.locator('#driveLookRight').click(timeout=6000),page.evaluate('SpatialApp.Drive.lookOffset > 0'))[1],True)
 check(page,'23_drive_pause',lambda:(page.locator('#drivePause').click(timeout=6000),page.evaluate('SpatialApp.Drive.paused'))[1])
 check(page,'24_drive_exit_restore',lambda:(page.locator('#driveExit').click(timeout=6000),page.evaluate('SpatialApp.Drive.phase === "idle"'))[1])
 check(page,'25_switch_FAST',lambda:page.locator('#siteSelect').select_option('fast',timeout=6000),True)
 check(page,'26_open_FAST_game',lambda:page.locator('#fastQuickStart').click(timeout=6000),True)
 check(page,'27_FAST_intro_guide',lambda:'微弱信号' in page.locator('#fastGameMain').inner_text())
 check(page,'28_FAST_start',lambda:page.locator('[data-action="begin"]').click(timeout=6000),True)
 check(page,'29_FAST_noise_feedback',lambda:(page.locator('[data-action="verify-quiet"]').click(timeout=6000),'未关闭' in page.locator('#fastGameHint').inner_text())[1])
 for key in ['phone','drone','station']:
  check(page,'30_toggle_'+key,lambda key=key:page.locator(f'[data-id="{key}"][data-action="toggle"]').click(timeout=6000))
 check(page,'31_finish_noise',lambda:(page.locator('[data-action="verify-quiet"]').click(timeout=6000),page.evaluate('SpatialApp.FastGame.stage===1'))[1],True)
 for i in range(3):
  check(page,f'32_zone_{i+1}_choice',lambda:page.locator('[data-action="pick"][data-choice="1"]').click(timeout=6000))
  check(page,f'33_zone_{i+1}_next',lambda:page.locator('[data-action="advance-case"]').click(timeout=6000))
 check(page,'34_FAST_wave_visible',lambda:page.locator('[data-action="wave"]').count()==3,True)
 check(page,'35_FAST_select_wave',lambda:page.locator('[data-action="wave"][data-wave="0"]').click(timeout=6000))
 check(page,'36_FAST_finish',lambda:(page.locator('[data-action="check-wave"]').click(timeout=6000),page.evaluate('SpatialApp.FastGame.stage===3'))[1],True)
 check(page,'37_FAST_return_to_map',lambda:page.locator('[data-action="finish"]').click(timeout=6000))
 if prefix=='mobile':
  check(page,'38_mobile_more_open',lambda:page.locator('#mobileMoreBtn').click(timeout=6000))
  check(page,'39_mobile_database_open',lambda:page.locator('[data-more-action="data"]').click(timeout=6000),True)
  check(page,'40_mobile_database_switch',lambda:(page.locator('#mobileDbSelect').select_option('roads',timeout=6000),page.locator('#mobileDbSelect').input_value()=='roads')[1])
 else:
  check(page,'38_database_open',lambda:page.locator('#dbBtn').click(timeout=6000),True)
  check(page,'39_database_switch',lambda:(page.locator('[data-table="roads"]').click(timeout=6000),True)[1])
 check(page,'40_database_close',lambda:page.locator('#dbClose').click(timeout=6000))
 if prefix=='mobile':
  check(page,'41_mobile_more_for_story',lambda:page.locator('#mobileMoreBtn').click(timeout=6000))
  check(page,'42_mobile_story_start',lambda:page.locator('[data-more-action="story"]').click(timeout=6000))
  check(page,'42_mobile_story_pause',lambda:(page.locator('#mobileMoreBtn').click(timeout=6000),page.locator('[data-more-action="story"]').click(timeout=6000)))
 else:
  check(page,'41_story_click',lambda:page.locator('#storyBtn').click(timeout=6000))
  check(page,'42_story_pause',lambda:page.locator('#storyBtn').click(timeout=6000))
 check(page,'43_all_code_no_page_errors',lambda:len(err)==0)
 REPORT['errors'].extend([f'{prefix}: {e}' for e in err])
 geom=page.evaluate('''()=>({innerWidth,innerHeight,app:(()=>{const r=document.querySelector('.app').getBoundingClientRect();return [r.width,r.height]})(),docWidth:document.documentElement.scrollWidth,docHeight:document.documentElement.scrollHeight})''')
 REPORT[prefix+'_geometry']=geom
 return
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
 for prefix,width,height in [('desktop',1440,900),('mobile',390,844)]:
  if os.environ.get('JOURNEY_ONLY') and prefix!=os.environ['JOURNEY_ONLY']:continue
  context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1)
  page=context.new_page();page.set_default_timeout(6000)
  run(page,prefix)
  context.close()
 browser.close()
REPORT['passed']=sum(x['passed'] for x in REPORT['checks'])
REPORT['failed']=sum(not x['passed'] for x in REPORT['checks'])
(OUT/'journey-results.json').write_text(json.dumps(REPORT,ensure_ascii=False,indent=2),encoding='utf-8')
print('TOTAL:',REPORT['passed'],'passed',REPORT['failed'],'failed. Screenshots:',len(REPORT['screenshots']))
