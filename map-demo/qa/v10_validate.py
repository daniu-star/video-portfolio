from pathlib import Path
from bs4 import BeautifulSoup
import json,subprocess,hashlib
root=Path(__file__).resolve().parents[1]
checks={}
def check(k,v):checks[k]=bool(v)
html=(root/'index.html').read_text('utf-8')
soup=BeautifulSoup(html,'html.parser')
ids=[x.get('id') for x in soup.find_all(id=True)]
check('unique_dom_ids',len(ids)==len(set(ids)))
for x in ['pixelTruckGame','pixelWorld','pixelGameLaunch','pixelQuickOpen','pixelReverse','pixelEvent','pixelStops','pixelPhotoDialog','pixelPhotoList','pixelMediaStatus']:
 check('has_'+x,x in ids)
for node in soup.find_all(['script','link']):
 link=node.get('src') or node.get('href')
 if link and not link.startswith(('https://','http://','data:')):check('linked_'+link,(root/link).is_file())
for p in list((root/'assets/js').rglob('*.js'))+list((root/'assets/data').glob('*.js')):
 res=subprocess.run(['node','--check',str(p)],capture_output=True)
 check('script_parse_'+p.relative_to(root).as_posix(),res.returncode==0)
road=json.loads((root/'assets/data/v10_verified_road_facts.json').read_text('utf-8'))
check('real_names_present',set(x['id'] for x in road['verified_segments'])=={'G552','S315','LA'})
check('route_not_misrepresented',road['navigation_available']==False and road['cross_region_topology']=='not_verified')
js=(root/'assets/js/ux/pixel-truck.js').read_text()
for x in ['g552','s315','reverse','checkOfflinePhotos','completeStop','openPhoto','moveLane','togglePause']:check('logic_'+x,x in js)
check('map_faux_lines_removed', 'this.renderRoads3D(\'overview\')' in (root/'assets/js/scene/engine.js').read_text() and 'if(NS.OpenRoads?.status' in (root/'assets/js/scene/engine.js').read_text())
photo=json.loads((root/'database/offline_photo_sources.json').read_text('utf-8'))
actual=[]
for obj in photo['photos']:
 file=root/obj['local']
 if file.exists() and file.stat().st_size>30000:actual.append(obj)
check('photo_sources_are_local',all(x['local'].startswith('assets/media/approved/') for x in photo['photos']))
check('photo_source_metadata',all(x.get('license') and x.get('page') for x in photo['photos']))
check('local_photo_import_tool',(root/'tools/导入自有现场照片.py').is_file())
logic=subprocess.run(['node',str(root/'qa/v10_logic_test.js')],capture_output=True,text=True)
check('interactive_js_logic',logic.returncode==0)
result={'version':'V10','mode':'静态/逻辑虚拟DOM测试，未进行真实浏览器端到端验收','checked':len(checks),'passed':sum(checks.values()),'failed':[k for k,v in checks.items() if not v],'logic_test_stdout':logic.stdout.strip(),'verified_named_road_segments':len(road['verified_segments']),'complete_verified_routes':0,'licensed_photo_manifest_entries':len(photo['photos']),'actual_local_real_photo_files':len(actual),'osm_road_geometry_available':(root/'assets/data/offline_roads.js').read_text().find('osm-odbl')>=0}
(root/'qa/v10_validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
if result['failed']:raise SystemExit(1)
