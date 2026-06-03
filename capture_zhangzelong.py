import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1920, 'height': 1080})
        
        await page.goto('https://www.zhangzelong.top', wait_until='networkidle', timeout=30000)
        await page.wait_for_timeout(3000)
        
        explore_btn = await page.query_selector('button:has-text("探索")')
        if explore_btn:
            await explore_btn.click()
            await page.wait_for_timeout(3000)
        
        video_works_btn = await page.query_selector('button:has-text("影像作品")')
        if video_works_btn:
            await video_works_btn.click()
            await page.wait_for_timeout(5000)
        
        aigc_btn = await page.query_selector('text=AIGC影像')
        if aigc_btn:
            await aigc_btn.click()
            await page.wait_for_timeout(5000)
        
        first_card = await page.query_selector('.group.cursor-pointer')
        if first_card:
            await first_card.click()
            await page.wait_for_timeout(5000)
            await page.screenshot(path='zhangzelong_single_video.png', full_page=False)
            print('Single video page screenshot saved')
            
            text = await page.evaluate('() => document.body.innerText.substring(0, 5000)')
            print('=== SINGLE VIDEO PAGE TEXT ===')
            print(text)
            
            videos = await page.evaluate('''() => {
                return Array.from(document.querySelectorAll('video')).map((v, i) => ({
                    index: i,
                    src: (v.src || v.querySelector('source')?.src || '').substring(0, 150),
                    poster: v.poster.substring(0, 150),
                    muted: v.muted,
                    autoplay: v.autoplay,
                    loop: v.loop,
                    paused: v.paused,
                    playsInline: v.playsInline,
                    style: v.getAttribute('style') || '',
                    className: v.className.substring(0, 150),
                    parentClass: v.parentElement?.className?.substring(0, 150) || '',
                    rect: JSON.stringify(v.getBoundingClientRect())
                }))
            }''')
            print('\\n=== VIDEO ELEMENTS ===')
            for v in videos:
                print(f'  [{v["index"]}] muted={v["muted"]} autoplay={v["autoplay"]} loop={v["loop"]} paused={v["paused"]}')
                print(f'       src={v["src"]}')
                print(f'       class={v["className"]}')
                print(f'       parentClass={v["parentClass"]}')
                print(f'       style={v["style"]}')
                print(f'       rect={v["rect"]}')
            
            full_html = await page.evaluate('''() => {
                const section = document.querySelector('section');
                if (!section) return document.body.innerHTML.substring(0, 15000);
                return section.innerHTML.substring(0, 15000);
            }''')
            print('\\n=== SECTION HTML ===')
            print(full_html)
        else:
            print('No video card found')
        
        await browser.close()

asyncio.run(main())
