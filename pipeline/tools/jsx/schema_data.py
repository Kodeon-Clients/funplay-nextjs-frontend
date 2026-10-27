"""Plain-data inputs for structured data, written into each page's JSON as "schema".

lib/schema.ts turns them into JSON-LD. Sources: the page records (visible breadcrumbs, product data,
FAQ blocks), the JSON-LD the SEO fix pack produced (breadcrumbs, article dates, series item lists,
FAQ entries) and the city fact sheets. Ratings, reviews and offers from the old markup are not carried
over: they were not shown on the pages and the prices were not numbers.

Usage: python3 -I tools/jsx/schema_data.py site
"""
import glob, json, os, re, sys
from bs4 import BeautifulSoup

SITE = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.dirname(HERE)
HOST = "https://funplaysystems.com"
FACTS = json.load(open(os.path.join(TOOLS, "briefs", "cities.json")))
CORE_TYPES = {
    "/about-us.html": "AboutPage", "/contact-us.html": "ContactPage", "/faq.html": "FAQPage",
    "/Products.html": "CollectionPage", "/Projects.html": "CollectionPage", "/blog.html": "CollectionPage",
    "/gallery.html": "CollectionPage", "/clientele.html": "CollectionPage", "/our-network.html": "CollectionPage",
    "/corecraft.html": "CollectionPage", "/funplay-originals.html": "CollectionPage", "/nexlev-series.html": "CollectionPage",
    "/careers.html": "CollectionPage", "/search-result.html": "SearchResultsPage",
}


def records():
    out = {}
    for f in glob.glob(os.path.join(TOOLS, "records", "pages", "*.json")):
        for r in json.load(open(f, encoding="utf-8")):
            out[r["path"]] = r
    return out


def nodes(rec):
    for j in (rec.get("seo") or {}).get("jsonld", []):
        for n in j.get("@graph", [j]):
            yield n


def node(rec, typ):
    return next((n for n in nodes(rec) if n.get("@type") == typ), None)


def short_title(meta):
    h1 = " ".join((meta.get("h1") or "").split())
    t = re.split(r"\s+\|\s+", meta["seo"].get("title", ""))[0].strip()
    return h1 if h1 and len(h1) <= 80 else t


def text(s):
    return " ".join(BeautifulSoup(s, "html.parser").get_text(" ").split()) if "<" in (s or "") else " ".join((s or "").split())


def breadcrumb(rec, meta):
    soup = BeautifulSoup(rec.get("body") or "", "html.parser")
    vis = soup.select_one("nav[aria-label*=readcrumb], .breadcrumb")
    items = []
    if vis is not None:
        for li in vis.find_all("li"):
            a = li.find("a")
            name = " ".join(li.get_text(" ").split())
            if name:
                href = a.get("href") if a else None
                items.append([name, (HOST + href if href and href.startswith("/") else href) if href else None])
    if not items:
        old = node(rec, "BreadcrumbList")
        if old:
            items = [[e.get("name"), e.get("item")] for e in old.get("itemListElement", [])]
    if not items:
        p = rec["path"]
        if rec["type"] in ("city-gym", "city-playground"):
            items = [["Home", HOST + "/"], ["Our Network", HOST + "/our-network.html"]]
            hub = (FACTS.get(p) or {}).get("hub")
            if hub and hub != p:
                items.append([(FACTS.get(hub) or {}).get("state") or "State", HOST + hub])
            items.append([None, None])
        elif rec["type"] == "project":
            items = [["Home", HOST + "/"], ["Projects", HOST + "/Projects.html"], [None, None]]
        elif rec["type"] == "blog":
            items = [["Home", HOST + "/"], ["Blog", HOST + "/blog.html"], [None, None]]
        elif rec["type"] == "career":
            items = [["Home", HOST + "/"], ["Careers", HOST + "/careers.html"], [None, None]]
        elif p == "/":
            return []
        else:
            items = [["Home", HOST + "/"], [None, None]]
    # the current page is always the last item, named after the page (old names were cut off)
    items[-1] = [short_title(meta), HOST + rec["path"]]
    for it in items[:-1]:
        if it[0] and it[0].lower() == "home":
            it[0], it[1] = "Home", HOST + "/"
    return [it for it in items if it[0]]


def faq_from_sections(page):
    out = []
    for s in page.get("sections", []):
        for v in s["props"].values():
            if isinstance(v, dict) and "items" in v and v["items"] and isinstance(v["items"][0], dict) and "q" in v["items"][0]:
                for it in v["items"]:
                    a = it["a"]
                    if not isinstance(a, str):
                        a = " ".join(" ".join(seg if isinstance(seg, str) else flat(seg) for seg in (b.get("c") or [x for i in b.get("items", []) for x in i])) for b in a)
                    out.append([it["q"], " ".join(a.split())])
    return out


def flat(seg):
    return "".join(c if isinstance(c, str) else flat(c) for c in seg.get("c") or [])


def page_text(rec):
    return " ".join(BeautifulSoup(rec.get("body") or "", "html.parser").get_text(" ").split())


def schema_for(rec, meta):
    p, t = rec["path"], rec["type"]
    h1 = BeautifulSoup(rec.get("body") or "", "html.parser").find("h1")
    if h1 is not None:
        meta["h1"] = " ".join(h1.get_text(" ").split())  # the heading as rendered (some stored h1 values were stale)
    d = rec.get("data") or {}
    out = {"breadcrumb": breadcrumb(rec, meta)}
    if p in CORE_TYPES:
        out["pageType"] = CORE_TYPES[p]
    if t == "series":
        out["pageType"] = "CollectionPage"
    old_list = None
    for n in nodes(rec):
        if n.get("@type") == "CollectionPage" and isinstance(n.get("mainEntity"), dict):
            old_list = n["mainEntity"].get("itemListElement")
    if old_list:
        out["itemList"] = [[e.get("name"), e.get("url")] for e in old_list if e.get("url")]
    if t == "product":
        old = node(rec, "Product") or {}
        specs = []
        for pv in old.get("additionalProperty", []):
            v = str(pv.get("value", ""))
            if v and len(v) <= 60 and "NA" != v.strip() and "Specifications" not in v:
                specs.append([pv.get("name"), v])
        imgs = [i for c in d.get("colours") or [] for i in c.get("images", [])] or ([d["image"]] if d.get("image") else [])
        out["product"] = {
            "name": d.get("name") or short_title(meta), "sku": d.get("sku"), "images": imgs[:6],
            "description": d.get("description") or meta["seo"].get("description"),
            "category": old.get("category") or d.get("series"),
            "line": d.get("line"), "series": d.get("series"), "colours": [c.get("name") for c in d.get("colours") or [] if c.get("name")],
            "specs": specs,
        }
    if t in ("city-gym", "city-playground"):
        f = FACTS.get(p) or {}
        place, state = f.get("city"), f.get("state")
        gym = t == "city-gym"
        area = {"city": place if f.get("level") == "City" else None, "state": state if state != place else None,
                "country": "India" if f.get("level") == "Country" or place == "India" else None}
        if not place:
            m = re.search(r"\bin ([^|<]+)$", rec.get("h1") or "")
            area = {"name": m.group(1).strip() if m else None}
        out["service"] = {
            "name": short_title(meta),
            "serviceType": "Outdoor gym equipment supply and installation" if gym else "Outdoor playground equipment supply and installation",
            "areaServed": {k: v for k, v in area.items() if v},
            "description": meta["seo"].get("description"),
        }
    if t == "blog":
        old = node(rec, "BlogPosting") or {}
        img = old.get("image") or (HOST + d["cardImage"] if d.get("cardImage") else None)
        if not img:
            m = re.search(r"background-image:\s*url\('([^']+)'\)", rec.get("body") or "")
            img = HOST + m.group(1) if m else HOST + "/images/logo-black.png"
        out["article"] = {
            "headline": old.get("headline") or short_title(meta), "description": old.get("description") or meta["seo"].get("description"),
            "image": img if isinstance(img, str) else (img[0] if img else None),
            "datePublished": old.get("datePublished"), "dateModified": old.get("dateModified") or old.get("datePublished"),
            "author": (old.get("author") or {}).get("name") or "FunPlay Systems",
        }
        oldfaq = node(rec, "FAQPage")
        if oldfaq:
            txt = page_text(rec).lower()
            qa = [[q.get("name"), q.get("acceptedAnswer", {}).get("text")] for q in oldfaq.get("mainEntity", [])]
            if qa and all(q and q.lower()[:40] in txt for q, _ in qa):
                out["faq"] = [[q, text(a)] for q, a in qa]
    if p == "/faq.html":
        oldfaq = node(rec, "FAQPage") or {}
        out["faq"] = [[q.get("name"), text(q.get("acceptedAnswer", {}).get("text"))] for q in oldfaq.get("mainEntity", [])]
    if t == "career":
        body = page_text(rec)
        out["job"] = {
            "title": short_title(meta), "description": body.split(" Upload Resume")[0][:3000],
            # the pages carry no posting date; the date the role went up on this site (confirm with FunPlay)
            "datePosted": "2026-10-19",
            "employmentType": "FULL_TIME", "email": (re.search(r"[\w.]+@funplaysystems\.com", body) or [None])[0],
        }
    if t == "project":
        pr = (d.get("project") or {})
        out["project"] = {"name": pr.get("title") or short_title(meta), "location": pr.get("location")}
    return out


def main():
    recs = records()
    files = glob.glob(os.path.join(SITE, "content", "pages", "*.json")) + glob.glob(os.path.join(SITE, "content", "city", "*.json")) \
        + glob.glob(os.path.join(SITE, "content", "product", "*.json")) + glob.glob(os.path.join(SITE, "content", "blog", "*.json"))
    n = 0
    for f in files:
        meta = json.load(open(f, encoding="utf-8"))
        rec = recs.get(meta["path"]) or {"path": meta["path"], "type": meta["type"], "body": "", "seo": meta["seo"]}
        sch = schema_for(rec, meta)
        if meta["type"] in ("city-gym", "city-playground") or meta["path"].startswith("/blog/"):
            faq = faq_from_sections(meta)
            if faq:
                sch["faq"] = faq
        if meta["path"] == "/blog/how-to-choose-a-playground-equipment-manufacturer-in-india.html":
            src = json.load(open(os.path.join(TOOLS, "..", "content-src", "new-pages", "choose-manufacturer.json")))
            sch["faq"] = src["faq"]
        meta["schema"] = {k: v for k, v in sch.items() if v}
        json.dump(meta, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        n += 1
    print("schema data written for", n, "pages")


main()
