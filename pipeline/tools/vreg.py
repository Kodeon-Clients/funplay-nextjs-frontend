"""Visual regression: screenshot a fixed set of pages (desktop + mobile, plus a few interactive states)
from the running build into <dir>; with --compare <ref-dir>, report the share of changed pixels.
Usage: python3 tools/vreg.py <out-dir> [--compare <ref-dir>]"""
import asyncio, os, sys
from PIL import Image, ImageChops
from playwright.async_api import async_playwright

PAGES = ["/", "/about-us.html", "/contact-us.html", "/Products.html", "/Projects.html", "/projects/raymond-thane.html",
         "/corecraft.html", "/corecraft/castle-crest.html", "/corecraft/individual-equipment/climber.html",
         "/corecraft/castle-crest/crown-court-3.html", "/nexlev-series/abstract/eromofy.html", "/funplay-originals/nature-sparsh/ulta-ghar.html",
         "/corecraft/fun-fitness-equipment/fun-walker-single.html", "/outdoor-playground-equipment-manufacturer-in-pune.html",
         "/outdoor-gym-equipment-manufacturer-supplier-chennai.html", "/outdoor-gym-equipment-manufacturer-supplier-adoni.html",
         "/outdoor-playground-equipment-manufacturer-in-maharashtra.html", "/blog.html",
         "/blog/behind-the-scenes-funplays-manufacturing-marvel.html", "/blog/future-of-play-based-learning-in-indias-schools-challenges-and-opportunities.html",
         "/careers.html", "/careers/design-engineer.html", "/gallery.html", "/faq.html", "/clientele.html", "/industry.html",
         "/our-network.html", "/search-result.html", "/thank-you.html", "/thankyou.html", "/open-air-gym-equipment-manufacturer-and-supplier-in-india.html",
         "/outdoor-play-equipment.html", "/ads.html", "/privacy-policy.html", "/no-such-page.html",
         "/school.html", "/campaign.html"]
OUT = sys.argv[1]
REF = sys.argv[sys.argv.index("--compare") + 1] if "--compare" in sys.argv else None


def slug(p):
    return (p.strip("/").replace("/", "_").replace(".html", "") or "home")[:80]


async def settle(pg):
    await pg.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; })")
    h = await pg.evaluate("document.body.scrollHeight")
    for y in range(0, h, 800):
        await pg.evaluate(f"window.scrollTo(0,{y})")
        await pg.wait_for_timeout(60)
    await pg.wait_for_timeout(800)
    for _ in range(40):
        done = await pg.evaluate("[...document.images].every(i => i.complete)")
        if done:
            break
        await pg.wait_for_timeout(250)
    await pg.evaluate("window.scrollTo(0,0)")
    await pg.add_style_tag(content="*{animation:none!important;transition:none!important;caret-color:transparent!important} [data-anime]{opacity:1!important;transform:none!important} .swiper-wrapper{transform:none!important}")
    await pg.wait_for_timeout(500)


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w, h, tag in ((1366, 900, "d"), (390, 844, "m")):
            ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
            pg = await ctx.new_page()
            for path in PAGES:
                try:
                    await pg.goto("http://localhost:3456" + path, wait_until="networkidle", timeout=60000)
                    await settle(pg)
                    await pg.screenshot(path=f"{OUT}/{slug(path)}-{tag}.png", full_page=True)
                except Exception as e:
                    print("fail", path, tag, e)
            # interactive states
            await pg.goto("http://localhost:3456/", wait_until="networkidle")
            await settle(pg)
            try:
                if tag == "m":
                    await pg.click(".navbar-toggler")
                else:
                    await pg.hover(".navbar-nav .dropdown")
                await pg.wait_for_timeout(600)
                await pg.screenshot(path=f"{OUT}/state-menu-{tag}.png")
                await pg.goto("http://localhost:3456/about-us.html", wait_until="networkidle")
                await pg.click(".contactpopup .popup-with-form")
                await pg.wait_for_timeout(800)
                await pg.screenshot(path=f"{OUT}/state-popup-{tag}.png")
            except Exception as e:
                print("state fail", tag, e)
            await ctx.close()
        await b.close()


asyncio.run(main())
if REF:
    rows = []
    for f in sorted(os.listdir(OUT)):
        if not f.endswith(".png") or not os.path.exists(os.path.join(REF, f)):
            continue
        a, c = Image.open(os.path.join(REF, f)).convert("RGB"), Image.open(os.path.join(OUT, f)).convert("RGB")
        if a.size != c.size:
            rows.append((100.0, f, f"size {a.size} -> {c.size}"))
            continue
        diff = ImageChops.difference(a, c).convert("L").point(lambda v: 255 if v > 24 else 0)
        n = sum(diff.histogram()[255:])
        rows.append((round(100 * n / (a.size[0] * a.size[1]), 3), f, ""))
    rows.sort(reverse=True)
    print(f"{len(rows)} screenshots compared; {sum(1 for r in rows if r[0] == 0)} identical")
    for r in rows[:25]:
        print(f"  {r[0]:8}%  {r[1]}  {r[2]}")
