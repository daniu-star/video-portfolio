import sqlite3, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / 'database/spatial_demo.db'
OUT = ROOT / 'assets/data/database.bundle.js'
conn = sqlite3.connect(DB)

def rows(table):
    cur = conn.execute(f'SELECT * FROM {table}')
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, r)) for r in cur.fetchall()]

tables = [
    'metadata','sources','sites','metrics','nodes','node_legends','districts',
    'building_instances','roads','road_points','transport_assets','structures',
    'relations','story_chapters','timeline_states','themes','terrain_samples',
    'spatial_features','media_assets','media_bindings'
]
bundle = {t: rows(t) for t in tables}
# Only publish assets carrying public-web rights and completed review.
bundle['media_assets'] = [m for m in bundle['media_assets']
    if m['license_status']=='authorized' and m['release_status']=='approved' and m['privacy_review']=='passed'
    and ('public_web' in m['permitted_uses'].split(','))]
approved_ids = {m['id'] for m in bundle['media_assets']}
bundle['media_bindings'] = [b for b in bundle['media_bindings'] if b['asset_id'] in approved_ids and b['review_status']=='approved']
for x in bundle['structures']:
    x['params'] = json.loads(x.pop('params_json'))
for x in bundle['story_chapters']:
    x['camera'] = json.loads(x.pop('camera_json'))
    x['action'] = json.loads(x.pop('action_json'))
for x in bundle['themes']:
    x['gradient'] = json.loads(x.pop('gradient_json'))
    x['palette'] = json.loads(x.pop('palette_json'))
terrain = {}
for site in ['fast','huajiang']:
    arr = conn.execute(
        'SELECT gx,gz,scene_x,elevation,scene_z,data_status FROM terrain_samples WHERE site_id=? ORDER BY gz,gx',
        (site,)
    ).fetchall()
    n = max(x[0] for x in arr) + 1 if arr else 0
    terrain[site] = {'n': n, 'samples': [[x[2],x[3],x[4]] for x in arr], 'data_status':'SIMULATED'}
bundle['terrain'] = terrain
bundle['_export'] = {
    'source':'SQLite spatial_demo.db',
    'offline_first':True,
    'note':'VERIFIED=public fact; SIMULATED=MVP spatial geometry. Geometry never claims survey accuracy.'
}
OUT.write_text('window.SPATIAL_DB = ' + json.dumps(bundle,ensure_ascii=False,separators=(',',':')) + ';\n', encoding='utf-8')
print('exported', OUT)
print('tables', {k: len(v) if isinstance(v,list) else len(v) for k,v in bundle.items() if k not in {'terrain','_export'}})
conn.close()
