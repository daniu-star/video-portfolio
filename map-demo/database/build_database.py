from pathlib import Path
import sqlite3,json
ROOT=Path(__file__).resolve().parents[1]
DB=ROOT/'database/spatial_demo.db'
if DB.exists(): DB.unlink()
con=sqlite3.connect(DB)
con.executescript((ROOT/'database/schema.sql').read_text(encoding='utf-8'))
seed=json.loads((ROOT/'database/seed_data.json').read_text(encoding='utf-8'))
for table,rows in seed.items():
    if not rows: continue
    cols=list(rows[0])
    sql=f"INSERT INTO {table} ({','.join(cols)}) VALUES ({','.join('?' for _ in cols)})"
    con.executemany(sql,[[row.get(c) for c in cols] for row in rows])
from seed_v7_phase1 import populate
feature_count = populate(con)
from media_pipeline import populate as populate_media
media_count = populate_media(con,ROOT)
con.commit()
print('approved media',media_count)
print('spatial features',feature_count)
print('rebuilt',DB)
print('integrity',con.execute('PRAGMA integrity_check').fetchone()[0])
con.close()
