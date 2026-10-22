from pathlib import Path
import json,re,subprocess,sqlite3,collections
root=Path(__file__).resolve().parents[2]
html=(root/'index.html').read_text('utf-8')
cases={}
def test(label,condition):cases[label]=bool(condition)
for f in ['assets/css/v9-clarity.css','assets/js/ux/regional-expedition.js','assets/data/local_photo_catalog.js','assets/data/offline_roads.js','tools/获取许可照片.py','tools/获取开放道路.py']:
 test('exists_'+f,(root/f).is_file())
 test('linked_'+f, f in html if f.startswith('assets/') and f.endswith(('.css','.js')) else True)
for id in ['regionalExpedition','regionStart','regionYundu','regionFeedback','regionFold']:
 test('region_control_'+id, id in html)
for f in ['assets/js/scene/engine.js','assets/js/app.js','assets/js/ux/regional-expedition.js','assets/js/geo/geo-provider.js','assets/js/ui/feature-panel.js','assets/data/offline_roads.js','assets/data/local_photo_catalog.js']:
 p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
 test('parse_'+f,p.returncode==0)
 test('no_js_error_'+f,not p.stderr)
app=(root/'assets/js/app.js').read_text('utf-8')
test('yundu_after_construction', 'timeline:.99' in app and 'b.phase_start' in app)
test('yundu_focus_distance', 'Math.max(1700' in app)
geo=(root/'assets/js/geo/geo-provider.js').read_text('utf-8')
test('photos_runtime_offline_only','img.src=photo.path' in geo and 'photo.url' not in geo)
test('offline_photo_license_manifest',(root/'database/offline_photo_sources.json').is_file())
photo_manifest=json.loads((root/'database/offline_photo_sources.json').read_text('utf-8'))
photos=[p for p in photo_manifest['photos'] if (root/p['local']).is_file() and (root/p['local']).stat().st_size>30000]
road=(root/'assets/data/offline_roads.js').read_text('utf-8')
result={'version':'V9','mode':'源码/依赖/资源清点；不等于真实浏览器操作测试','static_checks':len(cases),'passed':sum(cases.values()),'failed':[k for k,v in cases.items() if not v], 'local_real_photo_files':len(photos),'identified_licensable_photo_sources':len(photo_manifest['photos']),'actual_osm_roads_imported':road.count('osm-odbl')>0,'offline_runtime_images_only': True,'expected_unavailable':['外部下载当前环境未成功，照片与真实 OSM GeoJSON 仍需在可联网终端导入','无法通过受浏览器安全策略限制的 file:// 页面进行用户浏览器实测']}
(root/'qa/v9/v9_validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
print(json.dumps({k:v for k,v in result.items() if k!='expected_unavailable'},ensure_ascii=False,indent=2))
if result['failed']:raise SystemExit(1)
