import json
import os
import time
from datetime import datetime
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = r"d:\作品集\audit-screenshots"
BASE_URL = "https://www.chenjunliang.top"

diagnostics = {
    "audit_time": datetime.now().isoformat(),
    "base_url": BASE_URL,
    "pages": [],
    "mobile_pages": [],
    "console_errors": [],
    "page_errors": [],
    "summary": {},
}

console_logs = []
page_error_logs = []


def setup_listeners(page, label):
    def on_console(msg):
        if msg.type in ("error", "warning"):
            entry = {
                "page": label,
                "type": msg.type,
                "text": msg.text,
            }
            console_logs.append(entry)
            diagnostics["console_errors"].append(entry)

    def on_pageerror(error):
        entry = {
            "page": label,
            "error": str(error),
        }
        page_error_logs.append(entry)
        diagnostics["page_errors"].append(entry)

    page.on("console", on_console)
    page.on("pageerror", on_pageerror)


def get_performance_timing(page):
    try:
        timing = page.evaluate("""() => {
            const t = performance.timing;
            return {
                dns: t.domainLookupEnd - t.domainLookupStart,
                tcp: t.connectEnd - t.connectStart,
                ssl: t.secureConnectionStart > 0 ? t.connectEnd - t.secureConnectionStart : 0,
                ttfb: t.responseStart - t.requestStart,
                download: t.responseEnd - t.responseStart,
                domParsing: t.domInteractive - t.responseEnd,
                domComplete: t.domComplete - t.domLoading,
                loadEvent: t.loadEventEnd - t.loadEventStart,
                totalLoadTime: t.loadEventEnd - t.navigationStart,
                domContentLoaded: t.domContentLoadedEventEnd - t.navigationStart,
            };
        }""")
        return timing
    except Exception as e:
        return {"error": str(e)}


def get_interactive_element_count(page):
    try:
        count = page.evaluate("""() => {
            const selectors = 'a, button, input, select, textarea, [role="button"], [tabindex]';
            return document.querySelectorAll(selectors).length;
        }""")
        return count
    except Exception as e:
        return -1


def check_layout_issues(page):
    try:
        issues = page.evaluate("""() => {
            const results = [];
            const viewportW = window.innerWidth;
            const allEls = document.querySelectorAll('*');
            for (const el of allEls) {
                const rect = el.getBoundingClientRect();
                if (rect.width > viewportW + 2) {
                    results.push({
                        tag: el.tagName,
                        id: el.id || '',
                        className: (el.className || '').toString().substring(0, 80),
                        width: Math.round(rect.width),
                        viewportWidth: viewportW,
                        overflow: Math.round(rect.width - viewportW),
                    });
                }
            }
            return results.slice(0, 20);
        }""")
        return issues
    except Exception as e:
        return [{"error": str(e)}]


def take_screenshot(page, filename):
    path = os.path.join(SCREENSHOT_DIR, filename)
    try:
        page.screenshot(path=path, full_page=False)
        print(f"  Screenshot saved: {filename}")
    except Exception as e:
        print(f"  Screenshot failed for {filename}: {e}")


def record_page_info(page, label, url, load_start_time):
    timing = get_performance_timing(page)
    interactive_count = get_interactive_element_count(page)
    elapsed = round(time.time() - load_start_time, 2)

    page_info = {
        "label": label,
        "url": url,
        "title": page.title(),
        "actual_url": page.url,
        "wall_time_seconds": elapsed,
        "performance_timing_ms": timing,
        "interactive_element_count": interactive_count,
    }
    return page_info


def run_audit():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            locale="zh-CN",
        )
        page = context.new_page()

        # ============================================================
        # Step 2: Visit landing page
        # ============================================================
        print("\n[Step 2] Visiting landing page...")
        setup_listeners(page, "landing")
        load_start = time.time()
        page.goto(BASE_URL, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)
        take_screenshot(page, "01-landing.png")

        landing_info = record_page_info(page, "landing", BASE_URL, load_start)
        diagnostics["pages"].append(landing_info)
        print(f"  Title: {landing_info['title']}")
        print(f"  URL: {landing_info['actual_url']}")

        # ============================================================
        # Step 3: Performance data already captured above
        # ============================================================
        print(f"  Performance timing: {json.dumps(landing_info['performance_timing_ms'], indent=2)}")

        # ============================================================
        # Step 4: Click "进入作品集" button
        # ============================================================
        print("\n[Step 4] Clicking '进入作品集' button...")
        try:
            enter_btn = page.locator("#enter-portfolio")
            if enter_btn.count() == 0:
                enter_btn = page.locator('button:has-text("进入作品集"), a:has-text("进入作品集"), [class*="enter"]:has-text("进入作品集")')
            if enter_btn.count() > 0:
                enter_btn.first.click()
                print("  Clicked enter-portfolio button")
            else:
                print("  Could not find '进入作品集' button, trying alternative navigation...")
                page.click("text=进入作品集", timeout=5000)
        except Exception as e:
            print(f"  Button click failed: {e}")
            print("  Attempting direct navigation to hub page...")

        page.wait_for_timeout(3000)
        take_screenshot(page, "02-hub.png")

        hub_info = record_page_info(page, "hub", page.url, load_start)
        diagnostics["pages"].append(hub_info)
        print(f"  Hub page URL: {hub_info['actual_url']}")

        # ============================================================
        # Step 5: Get all category links
        # ============================================================
        print("\n[Step 5] Getting category links...")
        categories = []
        try:
            hub_categories = page.locator(".hub-category")
            count = hub_categories.count()
            for i in range(count):
                text = hub_categories.nth(i).inner_text()
                data_cat = hub_categories.nth(i).get_attribute("data-category")
                categories.append({"text": text.strip(), "data-category": data_cat})
                print(f"  Category {i}: text='{text.strip()}', data-category='{data_cat}'")
        except Exception as e:
            print(f"  Error getting categories: {e}")

        if not categories:
            categories = [
                {"text": "documentary", "data-category": "documentary"},
                {"text": "ads", "data-category": "ads"},
                {"text": "game", "data-category": "game"},
                {"text": "real", "data-category": "real"},
            ]
            print("  Using default categories as fallback")

        diagnostics["categories"] = categories

        # ============================================================
        # Step 6 & 7 & 8: Click each category, check player, go back
        # ============================================================
        for cat in categories:
            cat_name = cat.get("data-category") or cat.get("text", "unknown")
            print(f"\n[Step 6-8] Processing category: {cat_name}")

            try:
                cat_locator = page.locator(f'.hub-category[data-category="{cat_name}"]')
                if cat_locator.count() == 0:
                    cat_locator = page.locator(f'text="{cat.get("text", cat_name)}"')
                if cat_locator.count() > 0:
                    cat_locator.first.click()
                    print(f"  Clicked category: {cat_name}")
                else:
                    print(f"  Could not find category element for: {cat_name}")
            except Exception as e:
                print(f"  Click category failed: {e}")

            page.wait_for_timeout(3000)
            take_screenshot(page, f"03-player-{cat_name}.png")

            player_info = record_page_info(page, f"player-{cat_name}", page.url, load_start)

            # Step 7: Check "拉开序幕" button and video element
            try:
                prologue_btn = page.locator('text=拉开序幕')
                prologue_exists = prologue_btn.count() > 0
            except Exception:
                prologue_exists = False

            try:
                video_exists = page.locator("video").count() > 0
            except Exception:
                video_exists = False

            player_info["prologue_button_exists"] = prologue_exists
            player_info["video_element_exists"] = video_exists
            print(f"  Prologue button exists: {prologue_exists}")
            print(f"  Video element exists: {video_exists}")

            diagnostics["pages"].append(player_info)

            # Step 8: Click back button
            try:
                back_btn = page.locator("#btn-back-hub")
                if back_btn.count() == 0:
                    back_btn = page.locator('button:has-text("返回"), [class*="back"]')
                if back_btn.count() > 0:
                    back_btn.first.click()
                    print(f"  Clicked back button")
                else:
                    print(f"  Back button not found, trying browser back")
                    page.go_back()
            except Exception as e:
                print(f"  Back navigation failed: {e}")
                try:
                    page.go_back()
                except Exception:
                    pass

            page.wait_for_timeout(2000)

        # ============================================================
        # Step 9: Visit video collection page
        # ============================================================
        print("\n[Step 9] Visiting video collection page...")
        setup_listeners(page, "video-collection")
        collection_url = f"{BASE_URL}/video-collection.html"
        load_start = time.time()
        page.goto(collection_url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)
        take_screenshot(page, "04-video-collection.png")

        collection_info = record_page_info(page, "video-collection", collection_url, load_start)
        diagnostics["pages"].append(collection_info)
        print(f"  Collection page URL: {collection_info['actual_url']}")

        # ============================================================
        # Step 10: Scroll the collection page
        # ============================================================
        print("\n[Step 10] Scrolling collection page...")
        try:
            page.evaluate("window.scrollTo(0, document.body.scrollHeight / 3)")
            page.wait_for_timeout(1000)
            page.evaluate("window.scrollTo(0, document.body.scrollHeight * 2 / 3)")
            page.wait_for_timeout(1000)
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(1500)
        except Exception as e:
            print(f"  Scroll failed: {e}")

        take_screenshot(page, "05-collection-scrolled.png")

        # ============================================================
        # Step 11: Mobile viewport testing
        # ============================================================
        print("\n[Step 11] Mobile viewport testing (375x812)...")
        mobile_context = browser.new_context(
            viewport={"width": 375, "height": 812},
            locale="zh-CN",
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        )
        mobile_page = mobile_context.new_page()
        setup_listeners(mobile_page, "mobile-landing")

        load_start = time.time()
        mobile_page.goto(BASE_URL, wait_until="networkidle", timeout=30000)
        mobile_page.wait_for_timeout(2000)
        take_screenshot(mobile_page, "06-mobile-landing.png")

        mobile_landing_info = record_page_info(mobile_page, "mobile-landing", BASE_URL, load_start)
        mobile_landing_info["layout_issues"] = check_layout_issues(mobile_page)
        diagnostics["mobile_pages"].append(mobile_landing_info)
        print(f"  Mobile landing - layout issues: {len(mobile_landing_info['layout_issues'])}")

        setup_listeners(mobile_page, "mobile-collection")
        load_start = time.time()
        mobile_page.goto(collection_url, wait_until="networkidle", timeout=30000)
        mobile_page.wait_for_timeout(2000)
        take_screenshot(mobile_page, "07-mobile-collection.png")

        mobile_collection_info = record_page_info(mobile_page, "mobile-collection", collection_url, load_start)
        mobile_collection_info["layout_issues"] = check_layout_issues(mobile_page)
        diagnostics["mobile_pages"].append(mobile_collection_info)
        print(f"  Mobile collection - layout issues: {len(mobile_collection_info['layout_issues'])}")

        mobile_context.close()

        # ============================================================
        # Step 12: Build summary and save diagnostics
        # ============================================================
        print("\n[Step 12] Building diagnostics summary...")
        all_pages = diagnostics["pages"] + diagnostics["mobile_pages"]

        diagnostics["summary"] = {
            "total_pages_audited": len(all_pages),
            "total_console_errors": len(diagnostics["console_errors"]),
            "total_page_errors": len(diagnostics["page_errors"]),
            "categories_found": categories,
            "page_load_times": {
                p["label"]: p.get("wall_time_seconds", "N/A") for p in diagnostics["pages"]
            },
            "mobile_layout_issues": {
                p["label"]: len(p.get("layout_issues", [])) for p in diagnostics["mobile_pages"]
            },
            "performance_overview": {
                p["label"]: {
                    "totalLoadTime_ms": p.get("performance_timing_ms", {}).get("totalLoadTime", "N/A"),
                    "domContentLoaded_ms": p.get("performance_timing_ms", {}).get("domContentLoaded", "N/A"),
                    "ttfb_ms": p.get("performance_timing_ms", {}).get("ttfb", "N/A"),
                }
                for p in diagnostics["pages"]
            },
        }

        output_path = os.path.join(SCREENSHOT_DIR, "diagnostics.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(diagnostics, f, ensure_ascii=False, indent=2)

        print(f"\nDiagnostics saved to: {output_path}")
        print(f"Total pages audited: {len(all_pages)}")
        print(f"Console errors: {len(diagnostics['console_errors'])}")
        print(f"Page errors: {len(diagnostics['page_errors'])}")

        browser.close()


if __name__ == "__main__":
    run_audit()
