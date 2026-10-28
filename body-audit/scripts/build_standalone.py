#!/usr/bin/env python3
"""Pack the current project as a single self-contained offline HTML (no CDN)."""
import base64
from pathlib import Path
import re
root=Path(__file__).resolve().parent.parent
out=root/'肉身审计局_v16_单文件试玩.html'
html=(root/'index.html').read_text(encoding='utf-8')
for css in ['css/game.css','css/cinematic-v11.css','css/world3d.css','css/factory-v7.css','css/director-v9.css','css/receipt-v12.css','css/language-v14.css','css/factory-layout-v15.css','css/reflexive-v16.css']:
    html=html.replace(f'<link rel="stylesheet" href="{css}">', '<style>\n'+(root/css).read_text(encoding='utf-8')+'\n</style>')
for js in ['js/world3d.js','js/data.js','js/engine.js','js/audio.js','js/director-v9.js','js/game.js']:
    code=(root/js).read_text(encoding='utf-8')
    if js=='js/data.js':
        for im in (root/'assets/references').glob('*'):
            mime='image/png' if im.suffix=='.png' else 'image/jpeg'
            uri=f'data:{mime};base64,'+base64.b64encode(im.read_bytes()).decode('ascii')
            code=code.replace("src:'"+im.name+"'", "src:'"+uri+"'")
    html=html.replace(f'<script src="{js}"></script>','<script>\n'+code.replace('</script>', '<\\/script>')+'\n</script>')
out.write_text(html,encoding='utf-8')
print(out, out.stat().st_size)
