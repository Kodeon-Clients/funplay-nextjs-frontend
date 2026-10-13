"""Screenshot pages from the original (port 8001) and the rebuild (port 3456) side by side.

Usage: python3 tools/shots.py <outdir> <width> <path> [<path> ...]
Writes <outdir>/<slug>-<width>-old.png, -new.png and a side-by-side -cmp.png.
"""
import asyncio, os, sys
from PIL import Image
from playwright.async_api import async_playwright

OUT, WIDTH, PATHS = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
os.makedirs(OUT, exist_ok=True)
OLD, NEW = "http://localhost:8001", "http://localhost:3456"


def slug(p):
    return (p.strip("/").replace("/", "_").replace(".html", "") or "home")[:80]


async def shot(page, url, path):
    await page.goto(url, wait_until="networkidle", timeout=60000)
    # scroll through so lazy images and reveal animations fire, then return to top
    h = await page.evaluate("document.body.scrollHeight")
    y = 0
    while y < h:
        await page.evaluate(f"window.scrollTo(0,{y})")
        await page.wait_for_timeout(120)
        y += 700
    await page.wait_for_timeout(1500)
    await page.evaluate("window.scrollTo(0,0)")
    await page.wait_for_timeout(800)
    # freeze animations so both sides are comparable
    await page.add_style_tag(content="[data-anime]{opacity:1!important} *{animation-play-state:paused!important}")
    await page.screenshot(path=path, full_page=True)


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": WIDTH, "height": 900}, device_scale_factor=1)
        page = await ctx.new_page()
        for pth in PATHS:
            s = slug(pth)
            old_p, new_p = f"{OUT}/{s}-{WIDTH}-old.png", f"{OUT}/{s}-{WIDTH}-new.png"
            old_url = OLD + ("/index.html" if pth == "/" else pth)
            try:
                await shot(page, old_url, old_p)
            except Exception as e:
                print("old failed", pth, e)
            try:
                await shot(page, NEW + pth, new_p)
            except Exception as e:
                print('new failed', pth, e); continue
            try:
                a, c = Image.open(old_p), Image.open(new_p)
                H = max(a.height, c.height)
                cmp = Image.new("RGB", (a.width + c.width + 20, H), "white")
                cmp.paste(a, (0, 0))
                cmp.paste(c, (a.width + 20, 0))
                cmp.thumbnail((2400, 12000))
                cmp.save(f"{OUT}/{s}-{WIDTH}-cmp.png")
                print(pth, "old", a.size, "new", c.size)
            except Exception as e:
                print("cmp failed", pth, e)
        await b.close()


asyncio.run(main())
