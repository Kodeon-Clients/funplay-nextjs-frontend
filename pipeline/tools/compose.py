"""Merge new written content into the extracted pages.

Usage: python3 -I tools/compose.py <extracted_content_dir> <content_src_dir> <site_content_dir>

- city pages: rewrites the shared "Why choose us?" cards, adds the unique intro under the H1,
  and inserts the unique sections, fact list and FAQ above the local links block
- product pages: replaces the copied series blurb with the unique description
"""
import html, json, os, re, shutil, sys

SRC, CSRC, OUT = sys.argv[1:4]


def load(name, default=None):
    p = os.path.join(CSRC, name)
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else default


shared = load("shared.json", {})
cities = load("cities.json", {})
products = load("products.json", {})
FACTS = json.load(open(os.path.join(os.path.dirname(__file__), "briefs", "cities.json")))
PFACTS = json.load(open(os.path.join(os.path.dirname(__file__), "briefs", "products.json")))
_ex = json.load(open(os.path.join(os.path.dirname(__file__), "briefs", "examples.json")))
for _k in ("city_playground_tier_A", "city_playground_tier_B", "city_gym_tier_B"):
    for _p, _v in _ex[_k].items():
        cities.setdefault(_p, _v)
for _p, _v in _ex["products"].items():
    products.setdefault(_p, _v)
import glob as _glob
for _f in sorted(_glob.glob(os.path.join(CSRC, "batches", "*", "*.json"))):
    for _p, _v in json.load(open(_f, encoding="utf-8")).items():
        if _p.startswith("_"):
            continue
        (products if _p in PFACTS else cities)[_p] = _v
flags = {}
pages_extra = load("pages.json", {})
report = {"why": 0, "city": 0, "product": 0, "missing_anchor": []}


def esc(s):
    return html.escape(s, quote=False)


def block(name, props):
    return f"<fp-block data-name=\"{name}\" data-props='{html.escape(json.dumps(props, ensure_ascii=False), quote=True)}'></fp-block>"


WHY_RE = re.compile(
    r'(<div class="row row-cols-1 row-cols-lg-3 row-cols-sm-2 justify-content-center"[^>]*>)(.*?)(</div>\s*<div class="row mt-5 sm-mt-30px")',
    re.S,
)


def why_cards(items):
    out = []
    for it in items:
        out.append(
            '<div class="col icon-with-text-style-04 transition-inner-all mb-15px mt-15px">'
            '<div class="feature-box bg-white box-shadow-quadruple-large box-shadow-quadruple-large-hover justify-content-start border-radius-5px overflow-hidden pt-18 pb-18 ps-10 pe-10 lg-p-12 h-100 last-paragraph-no-margin">'
            '<div class="feature-box-content">'
            f'<h3 class="d-inline-block alt-font text-dark-gray fw-700 mb-5px fs-18" style="font-size:18px;line-height:26px;letter-spacing:0">{esc(it["h"])}</h3>'
            f'<p>{esc(it["p"])}</p></div><div class="feature-box-overlay bg-white"></div></div></div>'
        )
    return "\n".join(out)


def km_text(k):
    k = int(k)
    if k > 100:
        k = int(round(k, -1))
    return f"About {k:,} km from our Vasai factory (straight line)"


def city_facts(f):
    out = [{"label": "Factory", "value": "Vasai East, Palghar district, Maharashtra"}]
    if f.get("km") and f.get("level") == "City":
        out.append({"label": "Distance", "value": km_text(f["km"])})
    out.append({"label": "Delivery and installation", "value": "By road from Vasai; installed by our team or a local dealer"})
    for name, href in f.get("projects", [])[:1]:
        out.append({"label": f"Reference project in {f.get('state')}", "value": name, "href": href})
    if f.get("twin"):
        out.append({"label": "Also available" , "value": ("Playground equipment in " if f["kind"] == "gym" else "Outdoor gym equipment in ") + (f.get("city") or f.get("state") or ""), "href": f["twin"]})
    out.append({"label": "Sales enquiries", "value": "+91 902 830 2266 · sales@funplaysystems.com", "href": "tel:+919028302266"})
    return out


def city(rec, c):
    b = rec["body"]
    if rec["type"] == "city-playground" and shared.get("why_playground") and "Why choose us?" in b:
        nb, n = WHY_RE.subn(lambda m: m.group(1) + why_cards(shared["why_playground"]) + m.group(3), b, count=1)
        if n:
            b = nb
            report["why"] += 1
    if not c:
        rec["body"] = b
        return
    # intro paragraphs under the H1
    if c.get("intro") and rec["type"] != "city-gym":
        intro = "".join(f'<p class="fs-18 lh-30 mt-15px">{esc(p)}</p>' for p in c["intro"])
        m = re.search(r"(<h1[^>]*>.*?</h1>)", b, re.S)
        if m:
            b = b[: m.end()] + intro + b[m.end():]
        else:
            report["missing_anchor"].append((rec["path"], "h1"))
    f = FACTS.get(rec["path"], {})
    place = f.get("city") or f.get("state") or ""
    gym = rec["type"] == "city-gym"
    new = []
    if gym and c.get("intro"):
        new.append(block("rich-text", {"heading": f"Outdoor gym equipment supplier in {place}", "html": "".join(f"<p>{esc(p)}</p>" for p in c["intro"]), "className": "pt-0 pb-50px"}))
    for sct in c.get("sections", []):
        new.append(block("rich-text", {"heading": sct["h"], "html": sct["html"], "className": "pt-0 pb-50px"}))
    facts = city_facts(f)
    if facts:
        new.append(block("city-facts", {"heading": f"FunPlay in {place}" if place else "FunPlay at a glance", "facts": facts}))
    if c.get("faq"):
        new.append(block("faq", {"items": c["faq"], "id": "city-faq"}))
    if new:
        wrapper = '<div class="fp-city-content pt-80px md-pt-50px">' + "".join(new) + "</div>"
        anchor = "Explore More Categories" if gym else ">Our Network<"
        i = b.find(anchor)
        i = b.rfind("<section", 0, i) if i >= 0 else -1
        if i < 0:
            i = b.find('<section class="fp-local-links')
        b = (b[:i] + wrapper + b[i:]) if i >= 0 else b + wrapper
    rec["body"] = b
    report["city"] += 1


PROJECT_DATA = json.load(open(os.path.join(os.path.dirname(__file__), "projects-data.json")))


def project(rec):
    """Project pages built their content in the browser from a data object; render it into the HTML."""
    from bs4 import BeautifulSoup
    d = PROJECT_DATA.get(rec["path"])
    if not d:
        return
    copy = json.load(open(os.path.join(CSRC, "projects-copy.json")))
    shared, mine = copy["_shared"], copy.get(rec["path"], {})
    d = json.loads(json.dumps(d))
    for k in ("title", "subtitle", "description"):
        if mine.get(k):
            d[k] = mine[k]
    if d.get("atFunplay"):
        d["atFunplay"][0]["title"] = shared["atFunplay_title"]
        d["atFunplay"][0]["description"] = shared["atFunplay_description"]
    for sf in d.get("solutionForEvery") or []:
        for card in sf.get("card", []):
            card["description"] = shared["cards"].get(card["title"].strip(), card["description"])
    seo = rec.setdefault("seo", {})
    if mine.get("seo_title"):
        seo["title"] = mine["seo_title"]
    if mine.get("seo_description"):
        seo["description"] = mine["seo_description"]
    drop_social(seo, title=bool(mine.get("seo_title")), desc=bool(mine.get("seo_description")))
    soup = BeautifulSoup(rec["body"], "html.parser")
    if soup.find("h1") is None and soup.find(id="hero-title") is not None:
        soup.find(id="hero-title").name = "h1"  # the project name is the page's main heading
    def fix(u):
        return "/" + u.lstrip("./") if u and not u.startswith("/") else u
    def put(id_, text):
        el = soup.find(id=id_)
        if el is not None:
            el.string = text
    put("hero-title", d.get("title", ""))
    put("hero-subtitle", d.get("subtitle", ""))
    desc = d.get("description", "")
    put("hero-description", "" if re.fullmatch(r"f+", desc or "") else desc)
    g = soup.find(id="schoolPlayGroundSetup-grid")
    if g is not None:
        for i, src in enumerate(d.get("schoolPlayGroundSetup", [])):
            div = soup.new_tag("div", attrs={"class": "sps-products-solution-img"})
            div.append(soup.new_tag("img", attrs={"src": fix(src), "class": "grid-image", "alt": f"{d.get('title')} playground project, photo {i + 1}", "loading": "lazy"}))
            g.append(div)
    af = (d.get("atFunplay") or [None])[0]
    if af:
        put("atFunplay-title", af.get("title", ""))
        el = soup.find(id="atFunplay-description")
        if el is not None:
            el.clear()
            for k, para in enumerate([x for x in af.get("description", "").split("\n\n") if x.strip()]):
                if k:
                    el.append(soup.new_tag("br")); el.append(soup.new_tag("br"))
                el.append(para.strip())
        img = soup.find(id="atFunplay-image")
        if img is not None:
            img["src"] = fix(af.get("image"))
            img["alt"] = "FunPlay multi play station on a housing project"
        wl = soup.find(id="whyChooseUs-list")
        if wl is not None:
            items = af.get("whyLeadingDevelopersChooseUs", [])
            for idx, it in enumerate(items):
                div = soup.new_tag("div", attrs={"class": "why-choose-us-item" + ("" if idx == len(items) - 1 else " why-choose-us-item-border")})
                div.append(soup.new_tag("img", attrs={"src": fix(it["icon"]), "width": "32", "height": "32", "alt": ""}))
                sp = soup.new_tag("span", attrs={"class": "why-choose-us-title"}); sp.string = it["title"]; div.append(sp)
                wl.append(div)
    sfe = (d.get("solutionForEvery") or [None])[0]
    if sfe:
        put("solutionForEvery-title", sfe.get("title", ""))
        sg = soup.find(id="solutionForEvery-grid")
        if sg is not None:
            for card in sfe.get("card", []):
                div = soup.new_tag("div", attrs={"class": "solution-card"})
                w = soup.new_tag("div", attrs={"class": "solution-image-wrapper"})
                w.append(soup.new_tag("img", attrs={"src": fix(card["image"]), "class": "grid-image", "alt": card["title"].strip(), "loading": "lazy"}))
                c = soup.new_tag("div", attrs={"class": "solution-content"})
                a = soup.new_tag("span", attrs={"class": "fs-20 text-dark-gray fw-600"}); a.string = card["title"].strip()
                bb = soup.new_tag("span", attrs={"class": "lh-26"}); bb.string = card["description"]
                c.append(a); c.append(bb); div.append(w); div.append(c); sg.append(div)
    rec["body"] = soup.decode()
    rec.setdefault("data", {})["project"] = {"title": d.get("title"), "location": d.get("subtitle")}


def product(rec, p):
    b = rec["body"]
    if p.get("description"):
        nb, n = re.subn(r'(<p class="productdescription">)(.*?)(</p>)', lambda m: m.group(1) + esc(p["description"]) + m.group(3), b, count=1, flags=re.S)
        if n:
            b = nb
            rec.setdefault("data", {})["description"] = p["description"]
        else:
            report["missing_anchor"].append((rec["path"], "productdescription"))
    if p.get("spec_paragraph"):
        nb, n = re.subn(r'(>Specifications</h[1-6]>\s*<p[^>]*>)(.*?)(</p>)', lambda m: m.group(1) + esc(p["spec_paragraph"]) + m.group(3), b, count=1, flags=re.S)
        if n:
            b = nb
        else:
            # pages without a Specifications block: add it as a second paragraph under the description
            nb, n = re.subn(r'(<p class="productdescription">.*?</p>)', lambda m: m.group(1) + '<p class="productdescription mt-15px">' + esc(p["spec_paragraph"]) + "</p>", b, count=1, flags=re.S)
            if n:
                b = nb
            else:
                report["missing_anchor"].append((rec["path"], "specifications"))
    if p.get("flags"):
        flags[rec["path"]] = p["flags"]
    for find, repl in p.get("replace", []):
        if find in b:
            b = b.replace(find, repl, 1)
        else:
            report["missing_anchor"].append((rec["path"], find[:50]))
    rec["body"] = b
    report["product"] += 1


# images that do not exist anywhere: use the closest real FunPlay photo (flagged in the review list)
IMAGE_SUBS = {
    "/images/playground-comparison.jpg": "/images/g2.jpg",
    "/images/playground-materials-cover.jpeg": "/images/g10.jpg",
    "/images/themed-playground-customization.JPG": "/images/g12.jpg",
    "/images/play-land-coral-cascade2.jpg": "/images/play-land-coral-cascade3.jpg",
}
LEGACY_GYM = {"/outdoor-gym-equipment-manufacturer-supplier-ahmednagar.html": "Ahmednagar", "/outdoor-gym-equipment-manufacturer-supplier-adoni.html": "Adoni"}


def fix_wrong_city(rec):
    """Some old pages were copied from another city and kept its name in the H1 (e.g. Belgaum said Begusarai)."""
    f = FACTS.get(rec["path"]) or {}
    place = f.get("city")
    m = re.search(r"\bin ([^|<]+)$", rec.get("h1") or "")
    if not place or f.get("level") != "City" or not m:
        return
    wrong = m.group(1).strip()
    norm = lambda x: re.sub(r"[^a-z]", "", x.lower())
    if norm(wrong) == norm(place) or norm(place) in norm(wrong) or norm(wrong) in norm(place):
        return
    slug = rec["path"].rsplit("-", 1)[-1][:-5]
    if norm(wrong)[:4] == norm(slug)[:4]:
        return  # spelling variant of the same place (e.g. Belagavi / Belgaum)
    b = rec["body"]
    b = b.replace(f"Supplier in {wrong}<", f"Supplier in {place}<").replace(f"Manufacturer in {wrong}<", f"Manufacturer in {place}<")
    b = b.replace(f"Manufacturers in {wrong}<", f"Manufacturers in {place}<").replace(f"Outside {wrong} ", f"Outside {place} ")
    rec["body"] = b
    rec["h1"] = rec["h1"][: m.start(1)] + place
    report.setdefault("wrong_city", []).append((rec["path"], wrong, place))


def city_seo(rec):
    """One title/description pattern for every city page (about 260 old gym pages and a few
    playground pages still carried the old keyword-stuffed tags)."""
    f = FACTS.get(rec["path"]) or {}
    place = f.get("city") or f.get("state")
    if not place:
        m = re.search(r"\bin ([^|<]+)$", rec.get("h1") or "")
        place = m.group(1).strip() if m else None
    if not place:
        return
    seo = rec.setdefault("seo", {})
    gym = rec["type"] == "city-gym"
    if gym:
        opts = [f"Outdoor Gym Equipment Supplier in {place} | FunPlay Systems", f"Outdoor Gym Equipment Supplier in {place} | FunPlay",
                f"Outdoor Gym Equipment in {place} | FunPlay", f"Outdoor Gym Equipment, {place}"]
        desc = f"FunPlay Systems supplies outdoor gym and open-air fitness equipment to schools, societies and parks in {place}. Made in our Vasai factory. Get a free quote."
    else:
        opts = [f"Playground Equipment Manufacturer in {place} | FunPlay", f"Playground Equipment in {place} | FunPlay", f"Playground Equipment, {place}"]
        desc = f"FunPlay Systems supplies outdoor playground equipment to schools, societies and parks in {place}. Made in our Vasai factory. Get a free quote."
    old_t, old_d = seo.get("title") or "", seo.get("description") or ""
    stale_t = len(old_t) > 60 or "|" not in old_t or "Manufacturers in" in old_t or place.lower() not in old_t.lower()
    stale_d = not old_d.startswith("FunPlay Systems") or place.lower() not in old_d.lower() or len(old_d) > 165
    if stale_t:
        seo["title"] = next((o for o in opts if len(o) <= 60), opts[-1])
    if stale_d:
        seo["description"] = desc if len(desc) <= 165 else desc.replace(" Made in our Vasai factory.", "")
    drop_social(seo, title=stale_t, desc=stale_d)


def drop_social(seo, title=True, desc=True):
    """Social tags fall back to the page title/description (lib/seo.ts), so drop stale copies."""
    for sub in ("og", "twitter"):
        d = seo.get(sub)
        if isinstance(d, dict):
            for k in [k for k in d if (title and k.endswith(":title")) or (desc and k.endswith(":description")) or k in ("title", "description")]:
                d.pop(k)


def legacy_gym_body(all_recs, city_name):
    """Old-template gym pages get the standard gym page layout (from Chennai) with their own city name."""
    t = next(r for r in all_recs if r["path"] == "/outdoor-gym-equipment-manufacturer-supplier-chennai.html")
    b = re.sub(r'<section class="fp-local-links.*?</section>', "", t["body"], flags=re.S)
    return b.replace("Chennai", city_name)


sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from textfix import PHRASES, no_dashes, tidy  # noqa: E402


LANDING_SEO = {
    "/school.html": ("School Playground Equipment for Schools & Preschools | FunPlay",
                     "Safe, engaging school playground equipment from FunPlay Systems, designed for early learners and schools across India. Get a free custom quote and site plan."),
    "/builders.html": ("Playground Equipment for Builders & Developers | FunPlay",
                       "Award-winning playground equipment for builders, developers and housing societies in India. Site plan integration, installation by our team. Get a free quote."),
    "/generic.html": ("Outdoor Playground Equipment Manufacturer in India | FunPlay",
                      "FunPlay Systems designs and installs outdoor playground equipment for schools, societies and public spaces across India. Get a free custom quote."),
}
PRODUCT_DESC = {
    "/corecraft/fun-fitness-equipment/shoulder-press.html": "Single-user outdoor shoulder press (FFE006S) from FunPlay's CoreCraft Fun Fitness range. Body-weight workout for parks, societies and terrace gyms. Get a quote.",
    "/corecraft/fun-fitness-equipment/parallel-bar-double.html": "Double parallel bar outdoor gym station from FunPlay's CoreCraft Fun Fitness range, for dips and body-weight exercises in parks and societies. Get a quote.",
}


def fixups(rec, all_paths):
    """Page-level SEO fixes found by tools/seo_audit.py."""
    b, p = rec.get("body") or "", rec["path"]
    seo = rec.setdefault("seo", {})
    if p in LANDING_SEO:
        seo["title"], seo["description"] = LANDING_SEO[p]
        drop_social(seo)
        # the hero line is the page's main heading
        b = re.sub(r'<p class="text-white font_56_64 quicksand font-bold">(.*?)</p>',
                   lambda m: '<h1 class="text-white font_56_64 quicksand font-bold" style="color:#fff;margin:0;letter-spacing:normal;font-weight:700;line-height:inherit">' + m.group(1) + "</h1>", b, count=1, flags=re.S)
    if p == "/outdoor-play-equipment.html":
        b = b.replace('<div class="fs-40 lh-48 fw-600 mb-20px text-shadow-large">Discover the Thrill of Outdoor Play</div>',
                      '<h1 class="fs-40 lh-48 fw-600 mb-20px text-shadow-large text-white">Discover the Thrill of Outdoor Play</h1>', 1)
        seo["title"] = "Outdoor Playground Equipment for Kids | FunPlay Systems"
        seo["description"] = "Explore FunPlay's range of outdoor playground equipment: play stations, slides, swings and climbers for schools, societies and parks across India. Enquire now."
        drop_social(seo)
    if p in PRODUCT_DESC:
        seo["description"] = PRODUCT_DESC[p]
        drop_social(seo, title=False)
    if rec["type"] == "product" and "<h1" not in b:
        b = re.sub(r'<h4 class="productname([^"]*)">(.*?)</h4>', r'<h1 class="productname h4\1">\2</h1>', b, count=1)
    # "Live Chat Now" buttons call Tawk (loaded through GTM); fall back to WhatsApp when it is not there
    b = b.replace('href="javascript:void(Tawk_API.toggle())"', 'href="https://wa.me/919028302266" target="_blank" rel="noopener" data-tawk')
    b = b.replace('karnataka-and-andhrapradesh.html""', 'karnataka-and-andhrapradesh.html"').replace("karnataka-and-andhrapradesh.html\"'", "karnataka-and-andhrapradesh.html'")
    if rec["type"] == "project":
        # product links on project pages were relative ("pinnacle/groovy.html") and resolved under /projects/
        def fix_link(m):
            href = m.group(1)
            if href in all_paths:
                return m.group(0)
            tail = href[len("/projects/"):]
            hit = [x for x in all_paths if x.endswith("/" + tail)] or [x for x in all_paths if x.endswith("/" + tail.split("/")[-1])]
            return f'href="{hit[0]}"' if len(hit) == 1 else m.group(0)
        b = re.sub(r'href="(/projects/[^"]+/[^"]+\.html)"', fix_link, b)
    rec["body"] = b


# duplicate content found in the audit: 301 to the original article
NEW_BLOG = []
# city pages added in the rebuild: (new path, template path, template place, new place)
NEW_CITIES = [
    ("/outdoor-playground-equipment-manufacturer-in-mumbai.html", "/outdoor-playground-equipment-manufacturer-in-navi-mumbai.html", "Navi Mumbai", "Mumbai"),
]


def add_new_cities(recs):
    for new, tpl, a, z in NEW_CITIES:
        if any(r["path"] == new for r in recs):
            continue
        t = next(r for r in recs if r["path"] == tpl)
        twin_tpl = tpl.replace("outdoor-playground-equipment-manufacturer-in-", "outdoor-gym-equipment-manufacturer-supplier-")
        twin_new = new.replace("outdoor-playground-equipment-manufacturer-in-", "outdoor-gym-equipment-manufacturer-supplier-")
        rec = json.loads(json.dumps(t, ensure_ascii=False).replace(tpl, new).replace(twin_tpl, twin_new).replace(a, z))
        recs.append(rec)
        f = dict(FACTS[tpl]); f.update(path=new, slug=new.rsplit("-in-", 1)[1][:-5], city=z, gsc={"clicks": 0, "impressions": 0, "position": 0})
        twin = "/outdoor-gym-equipment-manufacturer-supplier-" + f["slug"] + ".html"
        if twin in FACTS:
            f["twin"] = twin
            FACTS[twin]["twin"] = new
            f["km"] = FACTS[twin]["km"]
            f["nearby"] = [x.replace("outdoor-gym-equipment-manufacturer-supplier-", "outdoor-playground-equipment-manufacturer-in-") for x in FACTS[twin]["nearby"]]
        FACTS[new] = f
        # list the new page on the state hub
        hub = next((r for r in recs if r["path"] == f.get("hub")), None)
        if hub:
            names = re.findall(r'<li class="col-6 col-md-4 col-lg-3 mb-5px"><a href="[^"]+">Playground equipment in ([^<]+)</a></li>', hub["body"])
            nxt = next((n for n in names if n > z), None)
            li = f'<li class="col-6 col-md-4 col-lg-3 mb-5px"><a href="{new}">Playground equipment in {z}</a></li>'
            anchor = f'<li class="col-6 col-md-4 col-lg-3 mb-5px"><a href="' if nxt else None
            if nxt:
                k = hub["body"].find(f'">Playground equipment in {nxt}</a></li>')
                k = hub["body"].rfind("<li ", 0, k)
                hub["body"] = hub["body"][:k] + li + hub["body"][k:]


def network_link(rec):
    """our-network.html lists every playground city; add the new ones next to their template city."""
    for new, tpl, a, z in NEW_CITIES:
        if new in rec["body"]:
            continue
        m = re.search(r'<div class="col-lg-3 col-md-4 col-6 mb-2">\s*<a class="btn btn-link" href="' + re.escape(tpl) + r'".*?</div>', rec["body"], re.S)
        if m:
            block_ = m.group(0).replace(tpl, new).replace(a, z)
            rec["body"] = rec["body"][: m.start()] + block_ + "\n" + rec["body"][m.start():]
EXTRA_REDIRECTS = {
    "/blog/the-role-of-organic-shapes-in-modern-playground-design.html": "/blog/school-playground-surface-materials-which-one-is-best.html",
}


def new_blog_pages(blog_recs):
    """Blog posts written for the rebuild (content-src/new-pages/*.json), built on an existing post's layout."""
    from bs4 import BeautifulSoup
    out = []
    folder = os.path.join(CSRC, "new-pages")
    for fn in sorted(os.listdir(folder)) if os.path.isdir(folder) else []:
        n = json.load(open(os.path.join(folder, fn), encoding="utf-8"))
        base = next(r for r in blog_recs if r["path"] == n["clone"])
        rec = json.loads(json.dumps(base))
        rec["path"], rec["h1"] = n["path"], n["h1"]
        soup = BeautifulSoup(rec["body"], "html.parser")
        hero = soup.find("section")
        hero["style"] = f"background-image: url('{n['cover']}')"
        spans = hero.select("span.text-white a")
        spans[0].string, spans[1].string = n["date"], n["category"]
        hero.find("h1").string = n["h1"]
        col = soup.select_one("section.blog-inner-content .col-lg-12")
        col.clear()
        col.append(BeautifulSoup(n["body"], "html.parser"))
        if n.get("faq"):
            col.append(BeautifulSoup(block("faq", {"id": "post-faq", "items": [{"q": q, "a": a} for q, a in n["faq"]]}), "html.parser"))
        tags = soup.select_one(".tags-list")
        if tags is not None:
            tags.clear()
            for t in n["tags"]:
                sp = soup.new_tag("span", attrs={"class": "tag"}); sp.string = t; tags.append(sp)
        rec["body"] = soup.decode()
        url = "https://funplaysystems.com" + n["path"]
        rec["seo"] = {
            "title": n["seo_title"], "description": n["seo_description"], "canonical": url, "robots": "index, follow",
            "og": {"og:type": "article", "og:url": url, "og:image": "https://funplaysystems.com" + n["cover"], "og:site_name": "FunPlay Systems", "og:locale": "en_IN"},
            "twitter": {"twitter:card": "summary_large_image", "twitter:image": "https://funplaysystems.com" + n["cover"]},
            "jsonld": [j for j in base["seo"].get("jsonld", []) if "@graph" in j] + [{
                "@context": "https://schema.org", "@type": "BlogPosting", "headline": n["h1"], "description": n["seo_description"],
                "image": "https://funplaysystems.com" + n["cover"], "datePublished": n["date_iso"], "dateModified": n["date_iso"],
                "author": {"@type": "Organization", "name": "FunPlay Systems", "url": "https://funplaysystems.com/"},
                "publisher": {"@id": "https://funplaysystems.com/#organization"}, "mainEntityOfPage": url, "inLanguage": "en-IN"}],
        }
        rec.setdefault("data", {})["cardImage"] = n["card_image"]
        rec["data"]["latest"] = {"title": n["h1"], "date": n["date"], "image": n["card_image"], "link": n["path"]}
        out.append(rec)
    return out


def latest_posts(recs, latest):
    """'Latest Posts' on blog posts was filled in the browser from latest-blogs.json; render it into the page."""
    for r in recs:
        if r["type"] != "blog" or "Loading latest posts..." not in (r.get("body") or ""):
            continue
        items = [x for x in latest if x["link"] != r["path"]][:3]
        html_ = ""
        for i, x in enumerate(items):
            html_ += (f'<a href="{x["link"]}"><div class="post-item"><div class="post-image"><img src="{x["image"]}" alt="{esc(x["title"])}" loading="lazy"/></div>'
                      f'<div class="post-details alt-font"><p class="post-heading">{esc(x["title"])}</p><p class="post-date">{x["date"]}</p></div></div></a>')
            if i < len(items) - 1:
                html_ += '<div class="separator"></div>'
        r["body"] = r["body"].replace("<p>Loading latest posts...</p>", html_, 1)


def blog_index_cards(rec, new):
    """Add the new posts to the top of the blog index grid (same card markup as the existing ones)."""
    b = rec["body"]
    i = b.find('<ul class="blog-simple" id="blog-list">')
    if i < 0:
        return
    j = b.find('<li class="grid-item">', i)
    k = b.find("</li>", j) + len("</li>")
    card = b[j:k]
    first = re.search(r'href="(/blog/[^"]+)"', card).group(1)
    for n in reversed(new):
        lt = n["data"]["latest"]
        c = card.replace(first, lt["link"])
        c = re.sub(r'(<img alt=")[^"]*(")', lambda m: m.group(1) + esc(lt["title"]) + m.group(2), c, count=1)
        c = re.sub(r'src="[^"]+"', f'src="{lt["image"]}"', c, count=1)
        c = re.sub(r'\s(width|height)="\d+"', "", c, count=2)
        c = re.sub(r'(text-uppercase fw-600" href="[^"]+">)[^<]*(</a>)', lambda m: m.group(1) + lt["date"] + m.group(2), c)
        c = re.sub(r'(card-title[^>]*>)\s*[^<]*?\s*(</a>)', lambda m: m.group(1) + esc(lt["title"]) + m.group(2), c)
        b = b[:j] + c + "\n" + b[j:]
    rec["body"] = b


def main():
    os.makedirs(os.path.join(OUT, "pages"), exist_ok=True)
    all_paths = {n for n, _, _, _ in NEW_CITIES}
    for f in os.listdir(os.path.join(SRC, "pages")):
        all_paths |= {r["path"] for r in json.load(open(os.path.join(SRC, "pages", f), encoding="utf-8"))}
    for f in sorted(os.listdir(os.path.join(SRC, "pages"))):
        recs = json.load(open(os.path.join(SRC, "pages", f), encoding="utf-8"))
        if f == "cities.json":
            add_new_cities(recs)
        dups = json.load(open(os.path.join(os.path.dirname(__file__), "briefs", "city-duplicates.json")))
        for rec in recs:
            blob = json.dumps(rec, ensure_ascii=False)
            if any(a in blob for a in IMAGE_SUBS):
                for a, b2 in IMAGE_SUBS.items():
                    blob = blob.replace(a, b2)
                rec.clear(); rec.update(json.loads(blob))
            if rec.get("body") and 'id="clienteleSwiper"' in rec["body"] and "data-slider-options" not in rec["body"].split('id="clienteleSwiper"')[0][-400:]:
                opts = '{"loop": true, "slidesPerView": 2, "spaceBetween": 20, "autoplay": {"delay": 2000, "disableOnInteraction": false}, "breakpoints": {"640": {"slidesPerView": 3}, "768": {"slidesPerView": 4}, "1024": {"slidesPerView": 5}}}'
                rec["body"] = rec["body"].replace('id="clienteleSwiper"', f"id=\"clienteleSwiper\" data-slider-options='{opts}'", 1)
            if rec["path"] in LEGACY_GYM:
                rec["body"] = legacy_gym_body(recs, LEGACY_GYM[rec["path"]])
                rec["css"], rec["styles"] = [], []
                rec.setdefault("data", {})["cardImage"] = None
            if rec["path"] in dups or rec["path"] in EXTRA_REDIRECTS:
                rec["type"], rec["redirect"], rec["body"] = "redirect", dups.get(rec["path"]) or EXTRA_REDIRECTS[rec["path"]], ""
                continue
            if rec["type"] in ("city-playground", "city-gym"):
                city(rec, cities.get(rec["path"]))
            elif rec["type"] == "project":
                project(rec)
            elif rec["type"] == "product" and rec["path"] in products:
                product(rec, products[rec["path"]])
            extra = pages_extra.get(rec["path"])
            if extra:
                for find, repl in extra.get("replace", []):
                    if find in rec.get("body", ""):
                        rec["body"] = rec["body"].replace(find, repl, 1)
                    else:
                        report["missing_anchor"].append((rec["path"], find[:50]))
                if extra.get("seo"):
                    rec.setdefault("seo", {}).update(extra["seo"])
            if rec["type"] in ("city-playground", "city-gym"):
                fix_wrong_city(rec)
                city_seo(rec)
            fixups(rec, all_paths)
            tidy(rec)
        if f == "blog.json":
            new = new_blog_pages(recs)
            for r in new:
                tidy(r)
            recs += new
            latest = [r["data"]["latest"] for r in new] + json.load(open("source/blog/latest-blogs.json", encoding="utf-8"))
            json.dump(latest, open(os.path.join(OUT, "latest-blogs.json"), "w"), indent=1, ensure_ascii=False)
            latest_posts(recs, latest)
            NEW_BLOG.extend(new)
        json.dump(recs, open(os.path.join(OUT, "pages", f), "w", encoding="utf-8"), ensure_ascii=False)
    # blog index lives in core.json; add the new posts' cards
    core = os.path.join(OUT, "pages", "core.json")
    cr = json.load(open(core, encoding="utf-8"))
    for r in cr:
        if r["path"] == "/blog.html":
            blog_index_cards(r, NEW_BLOG)
        if r["path"] == "/our-network.html":
            network_link(r)
    json.dump(cr, open(core, "w", encoding="utf-8"), ensure_ascii=False)
    os.makedirs(os.path.join(OUT, "styles"), exist_ok=True)
    shutil.copy(os.path.join(SRC, "styles", "page-styles.json"), os.path.join(OUT, "styles", "page-styles.json"))
    json.dump(flags, open(os.path.join(os.path.dirname(__file__), "product-flags.json"), "w"), ensure_ascii=False, indent=1)
    report["missing_anchor_count"] = len(report["missing_anchor"])
    print(json.dumps(report)[:3000])


def write_redirects():
    """content/redirects.json: fix pack redirects and renames, duplicate city pages, old index.html stubs."""
    here = os.path.dirname(__file__)
    fx = json.load(open(os.path.join(here, "fixpack", "script", "fixpack-data.json")))
    red = dict(fx["redirects"]); red.update(fx["renames"])
    red.update(json.load(open(os.path.join(here, "briefs", "city-duplicates.json"))))
    red.update(EXTRA_REDIRECTS)
    red["/sitemap-index.xml"] = "/sitemap.xml"
    red["/rss-feed.xml"] = "/blog.html"
    recs = []
    for f in os.listdir(os.path.join(OUT, "pages")):
        recs += json.load(open(os.path.join(OUT, "pages", f), encoding="utf-8"))
    for r in recs:
        if r["type"] == "stub":
            red[r["path"]] = r["redirect"]
            red[r["path"][: -len("index.html")]] = r["redirect"]
    live = {r["path"] for r in recs if r["type"] in ("home", "page", "blog", "career", "project", "series", "product", "city-gym", "city-playground")}
    out = [{"source": s, "destination": d} for s, d in red.items() if s != d and (s not in live or s == "/index.html")]
    bad = [o for o in out if o["destination"] not in live and o["destination"] != "/"]
    # redirects that only change letter case cannot go in next.config (matching is case-insensitive); proxy.ts handles them
    case_only = [o for o in out if o["source"].lower() == o["destination"].lower()]
    out = [o for o in out if o not in case_only]
    json.dump(out, open(os.path.join(OUT, "redirects.json"), "w"), indent=1, ensure_ascii=False)
    json.dump({o["source"]: o["destination"] for o in case_only}, open(os.path.join(OUT, "case-redirects.json"), "w"), indent=1)
    print("redirects", len(out), "bad destinations", bad)


main()
write_redirects()
