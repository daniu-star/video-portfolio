from pathlib import Path
import sqlite3,re,json,subprocess,sys
ROOT=Path(__file__).resolve().parents[1]
required=['index.html','assets/css/tokens.css','assets/css/layout.css','assets/css/components.css','assets/css/cinematic.css','assets/css/prologue.css','assets/data/database.bundle.js','assets/js/math.js','assets/js/state.js','assets/js/db.js','assets/js/scene/engine.js','assets/js/ui/ui.js','assets/js/app.js','database/spatial_demo.db','database/seed_data.json','database/schema.sql']
missing=[x for x in required if not (ROOT/x).exists()]
assert not missing,('missing',missing)
con=sqlite3.connect(ROOT/'database/spatial_demo.db')
expect={'sources':25,'sites':3,'metrics':25,'nodes':55,'node_legends':55,'districts':7,'building_instances':480,'roads':20,'road_points':145,'transport_assets':280,'structures':5,'terrain_samples':10000,'relations':10,'story_chapters':7,'timeline_states':12,'themes':3}
counts={}
for t,min_n in expect.items():
    n=con.execute(f'SELECT count(*) FROM {t}').fetchone()[0];counts[t]=n;assert n>=min_n,(t,n,min_n)
assert con.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
assert con.execute('SELECT count(*) FROM nodes n LEFT JOIN node_legends l ON n.id=l.node_id WHERE l.node_id IS NULL').fetchone()[0]==0
assert con.execute("SELECT count(*) FROM node_legends WHERE flow_value IS NULL OR flow_value='' ").fetchone()[0]==0
assert con.execute("SELECT count(*) FROM building_instances WHERE site_id='fast'").fetchone()[0]>=200
assert con.execute("SELECT count(*) FROM building_instances WHERE site_id='huajiang'").fetchone()[0]>=140
assert con.execute("SELECT count(*) FROM building_instances WHERE district_id='hj_keli'").fetchone()[0]>=25
assert con.execute("SELECT count(*) FROM building_instances WHERE placement_basis IS NULL OR placement_basis=''").fetchone()[0]==0
assert con.execute("SELECT count(*) FROM node_legends WHERE identity_value IS NULL OR identity_value=''").fetchone()[0]==0
html=(ROOT/'index.html').read_text(encoding='utf-8')
for ref in re.findall(r'(?:src|href)="([^"]+)"',html):
    if ref.startswith(('http:','https:','#')): continue
    assert (ROOT/ref).exists(),('broken ref',ref)
for wanted in ['nodeLegend','timeline','worldCanvas','dataModal','prologue','enterMapBtn']:
    assert wanted in html,wanted
ui=(ROOT/'assets/js/ui/ui.js').read_text(encoding='utf-8')
assert 'timelineRange' in ui and 'timelinePulse' in ui
# JS syntax checks
for js in ['assets/data/database.bundle.js','assets/js/math.js','assets/js/state.js','assets/js/db.js','assets/js/scene/engine.js','assets/js/ui/ui.js','assets/js/app.js']:
    r=subprocess.run(['node','--check',str(ROOT/js)],capture_output=True,text=True)
    assert r.returncode==0,(js,r.stderr)
# Verify bundle is generated from DB and contains high-density tables
bundle=(ROOT/'assets/data/database.bundle.js').read_text(encoding='utf-8')
for needle in ['building_instances','terrain_samples','node_legends','transport_assets','timeline_states']:
    assert f'"{needle}"' in bundle,needle
print(json.dumps({'status':'PROJECT VALID V6','counts':counts,'integrity':'ok','browser_bundle_mb':round((ROOT/'assets/data/database.bundle.js').stat().st_size/1024/1024,2)},ensure_ascii=False,indent=2))
