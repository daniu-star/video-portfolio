from pathlib import Path
import sqlite3,json
ROOT=Path(__file__).resolve().parents[1]
con=sqlite3.connect(ROOT/'database/spatial_demo.db')
tables=['sources','sites','metrics','nodes','node_legends','districts','building_instances','roads','road_points','transport_assets','structures','terrain_samples','relations','story_chapters','timeline_states','themes']
report={t:con.execute(f'SELECT count(*) FROM {t}').fetchone()[0] for t in tables}
report['integrity']=con.execute('PRAGMA integrity_check').fetchone()[0]
report['fast_buildings']=con.execute("SELECT count(*) FROM building_instances WHERE site_id='fast'").fetchone()[0]
report['huajiang_buildings']=con.execute("SELECT count(*) FROM building_instances WHERE site_id='huajiang'").fetchone()[0]
report['nodes_without_legend']=con.execute('SELECT count(*) FROM nodes n LEFT JOIN node_legends l ON n.id=l.node_id WHERE l.node_id IS NULL').fetchone()[0]
print(json.dumps(report,ensure_ascii=False,indent=2))
