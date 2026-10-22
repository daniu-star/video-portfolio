"""Offline static acceptance checks. Browser rendering is covered by real_browser_journey.py."""
from pathlib import Path
from html.parser import HTMLParser
import json,subprocess,sqlite3,re
ROOT=Path(__file__).resolve().parents[1]
class H(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.scripts=[];self.styles=[];self.buttons=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='script' and 'src'in a:self.scripts.append(a['src'])
  if tag=='link' and a.get('rel')=='stylesheet':self.styles.append(a['href'])
  if tag=='button':self.buttons.append(a)
p=H();p.feed((ROOT/'index.html').read_text(encoding='utf-8'))
jslist=list((ROOT/'assets/js').rglob('*.js'))
css='\n'.join(x.read_text(encoding='utf-8') for x in (ROOT/'assets/css').glob('*.css'))
checks=[]
def ck(name,good,note=''):checks.append(dict(name=name,passed=bool(good),note=str(note)))
ck('no duplicate IDs',len(p.ids)==len(set(p.ids)))
ck('all local styles exist',all((ROOT/s).is_file() for s in p.styles))
ck('all local scripts exist',all((ROOT/s).is_file() for s in p.scripts))
for x in jslist:
 r=subprocess.run(['node','--check',str(x)],capture_output=True,text=True)
 ck('JavaScript parse: '+x.relative_to(ROOT).as_posix(),r.returncode==0,r.stderr[:200])
for id in ['enterMapBtn','visitorGuide','visitorGuideClose','journeyBar','journeyGuideBtn','journeyPhotoBtn','mobileMoreBtn','mobileMoreMenu','inspectorToggle','photoLoadState','driveLookLeft','driveLookRight','driveLookHint','fastQuickStart','fastGameShell','dbMain','geoOpen','geoConnect']:
 ck('required control exists #'+id,id in p.ids)
ux=(ROOT/'assets/js/ux/visitor-journey.js').read_text(encoding='utf-8')
ck('first-visit onboarding routes wired',all(x in ux for x in ('fast','drive','photos','firstVisit(){','choose(kind)')))
ck('mobile tools wired',all(x in ux for x in ('toggleMore()','data-more-action','toggleInspector()')))
ck('mobile turn controls enabled', '.drive-look-controls{display:flex!important' in css)
ck('mobile quiet-zone diagram enabled', '.fast-zone-map{display:grid' in css)
ck('local concepts explicitly labeled', '概念三维地图' in (ROOT/'index.html').read_text(encoding='utf-8'))
ck('real map credentials not prefilled', not re.search(r'<input id="geoApiKey"[^>]*value=',(ROOT/'index.html').read_text(encoding='utf-8')))
conn=sqlite3.connect(ROOT/'database/spatial_demo.db');integ=conn.execute('pragma integrity_check').fetchone()[0]
ck('SQLite integrity',integ=='ok',integ)
for table,lo in [('building_instances',496),('roads',23),('nodes',58),('terrain_samples',10090)]:
 try:n=conn.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0];ck(table+' rows >='+str(lo),n>=lo,n)
 except Exception as e:ck(table+' table missing',False,str(e))
conn.close()
ck('offline DB mirror exists', (ROOT/'assets/data/database.bundle.js').stat().st_size>1000000)
ck('photo fallback and creator credit code', 'photoLoadState' in (ROOT/'assets/js/geo/geo-provider.js').read_text(encoding='utf-8') and ('photo.creator' in (ROOT/'assets/js/geo/geo-provider.js').read_text(encoding='utf-8') or 'available.creator' in (ROOT/'assets/js/geo/geo-provider.js').read_text(encoding='utf-8')))
ck('FAST sim data disclosure', '教学示意' in (ROOT/'assets/js/fast/quiet-game.js').read_text(encoding='utf-8'))
ck('active game suspends background render', 'if(!NS.FastGame?.active)' in (ROOT/'assets/js/scene/engine.js').read_text(encoding='utf-8'))
result={'method':'static source and DB validation, not browser UI test','passed':sum(x['passed'] for x in checks),'failed':sum(not x['passed'] for x in checks),'checks':checks}
(ROOT/'qa/static-regression-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
for x in checks:
 if not x['passed']:print('FAIL',x)
print('STATIC',result['passed'],'passed',result['failed'],'failed')
if result['failed']:raise SystemExit(1)
