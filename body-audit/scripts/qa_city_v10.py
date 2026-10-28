import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
pdir=Path(__file__).resolve().parents[1];html=(pdir/'肉身审计局_v10_单文件试玩.html').read_text();out=pdir/'docs/qa_v10';out.mkdir(exist_ok=True)
async def main():
 async with async_playwright() as a:
  browser=await a.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
  for role,w,h,record,emerg in [('lin',390,844,0,False),('zhou',1440,900,0,False),('lin',390,844,1,False),('lin',1440,900,0,True)]:
   pg=await browser.new_page(viewport={'width':w,'height':h});err=[];pg.on('pageerror',lambda e:err.append(str(e)))
   await pg.set_content(html,wait_until='domcontentloaded')
   await pg.locator('#startBtn').click();await pg.locator(f'[data-role={role}]').click();await pg.locator('#stageHotspot').click(timeout=14000)
   await pg.locator('#chatScreen').wait_for(state='visible',timeout=14000)
   for idx in [0,0,1 if emerg else 0,record]:
    await pg.locator('#chatOptions button').nth(idx).click(timeout=14000)
    await pg.wait_for_timeout(300)
   await pg.locator('#sheetOverlay').wait_for(state='visible',timeout=10000)
   title=await pg.locator('#sheetTitle').inner_text()
   tone=await pg.locator('#sheetOverlay').get_attribute('data-outcome')
   assert tone==('urgent' if emerg else ('gate' if role=='zhou' or record else 'access')),(role,record,emerg,tone)
   assert not err,err
   await pg.screenshot(path=str(out/f'final_{role}_{w}_record{record}_urgent{int(emerg)}.png'),animations='disabled')
   print('PASS',role,w,record,emerg,tone,title,flush=True)
   await pg.close()
  await browser.close()
asyncio.run(main())
