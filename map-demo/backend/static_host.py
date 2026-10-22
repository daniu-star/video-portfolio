"""Presentation backend: static files only. No API endpoints."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os, sqlite3
ROOT=Path(__file__).resolve().parents[1]
DB=ROOT/'database/spatial_demo.db'
con=sqlite3.connect(DB)
counts={t:con.execute(f'SELECT count(*) FROM {t}').fetchone()[0] for t in ['nodes','roads','terrain_samples','metrics','sources']}
con.close()
print('Database health:', counts)
os.chdir(ROOT)
class Handler(SimpleHTTPRequestHandler):
    extensions_map={**SimpleHTTPRequestHandler.extensions_map,'.js':'application/javascript','.json':'application/json','.geojson':'application/geo+json'}
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        super().end_headers()
print('Open http://127.0.0.1:8080')
ThreadingHTTPServer(('127.0.0.1',8080),Handler).serve_forever()
