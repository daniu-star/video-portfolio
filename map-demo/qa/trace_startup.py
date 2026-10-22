import re
from pathlib import Path
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parents[1];h=(r/'index.html').read_text()
h=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>'+ (r/m[1]).read_text()+'</style>',h)
h=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+ (r/m[1]).read_text().replace('</script>','<\\/script>')+'</script>',h)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu']);page=b.new_page(viewport={'width':390,'height':844})
 def err(e):
  print('ERROR obj',e)
  print('STACK',getattr(e,'stack','no stack'))
 page.on('pageerror',err)
 page.set_content(h,wait_until='domcontentloaded')
 page.wait_for_timeout(1800)
 print('PRESENT',page.evaluate("({top:!!document.getElementById('topbar'),inspector:!!document.getElementById('inspectorContent'),hud:!!document.getElementById('timelineYear'),fast:!!SpatialApp.FastGame})"))
 b.close()
