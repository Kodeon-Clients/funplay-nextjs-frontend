"""Extract every page of the SEO-fixed static site into JSON content collections.

Usage: python3 -I tools/extract.py <fixed_dir> <source_dir> <out_content_dir>

Each page becomes a record: path, type, collection, seo (from the fixed <head>),
header variant, page styles, structured data and the main body HTML (between the
header and the footer). Shared chrome (header, footer, contact popup, scripts) is
removed because the Next.js layout renders it once.
"""
import hashlib, json, os, re, sys
from urllib.parse import urljoin, urlsplit, unquote
from bs4 import BeautifulSoup, Comment

FIXED, SOURCE, OUT = sys.argv[1:4]
HOST = "https://funplaysystems.com"
LINES = {"corecraft": "CoreCraft", "funplay-originals": "Funplay Originals", "nexlev-series": "Nexlev Series"}

# ---------------------------------------------------------------- file index
all_files = set()
for root, _, files in os.walk(SOURCE):
    for f in files:
        all_files.add("/" + os.path.relpath(os.path.join(root, f), SOURCE).replace(os.sep, "/"))
lower_map = {}
for p in all_files:
    lower_map.setdefault(p.lower(), p)

def fix_case(path):
    """Return the real file path for a case-mismatched asset reference."""
    if path in all_files:
        return path
    return lower_map.get(path.lower(), path)

used_assets = set()

def norm_url(val, page_path):
    """Make a URL root-relative (same host) and correct asset case."""
    if val is None:
        return val
    v = val.strip()
    if not v or v.startswith(("#", "mailto:", "tel:", "javascript:", "data:", "whatsapp:")):
        return v
    absu = urljoin(HOST + page_path, v)
    sp = urlsplit(absu)
    if sp.netloc and sp.netloc.lower() not in ("funplaysystems.com", "www.funplaysystems.com"):
        return v
    path = unquote(sp.path) or "/"
    path = re.sub(r"/{2,}", "/", path)
    if re.search(r"\.(jpe?g|png|webp|gif|svg|mp4|mov|pdf|mp3|ico|woff2?|ttf)$", path, re.I):
        path = fix_case(path)
        used_assets.add(path)
    out = path
    if sp.query:
        out += "?" + sp.query
    if sp.fragment:
        out += "#" + sp.fragment
    return out

STYLE_URL = re.compile(r"url\((['\"]?)([^)'\"]+)\1\)")

def norm_style(style, page_path):
    return STYLE_URL.sub(lambda m: "url('" + norm_url(m.group(2), page_path) + "')", style)

# ---------------------------------------------------------------- classify
def classify(path):
    if path == "/":
        return "home", "core"
    parts = path.strip("/").split("/")
    name = parts[-1]
    if parts[0] == "blog" and len(parts) == 2:
        return "blog", "blog"
    if parts[0] == "careers" and len(parts) == 2:
        return "career", "careers"
    if parts[0] == "projects" and len(parts) == 2:
        return "project", "projects"
    if parts[0] in LINES:
        if name == "index.html":
            return "stub", "utility"
        if len(parts) == 2:
            return "series", "series"
        stem = name[:-5]
        sub = "/".join(parts[:-1]) + "/" + stem
        has_children = any(f.startswith("/" + sub + "/") and f.endswith(".html") and not f.endswith("/index.html") for f in all_files)
        if has_children:
            return "series", "series"
        return "product", "products"
    if name.startswith("outdoor-gym-equipment-manufacturer-supplier-"):
        return "city-gym", "cities"
    if name.startswith("outdoor-playground-equipment-manufacturer-in-"):
        return "city-playground", "cities"
    if name in ("6u4qrw8brzaw5exonv52s6o54t4wi2.html", "google3447ae250cffb628.html"):
        return "verification", "utility"
    if name in ("audio1.html", "audio2.html", "audio3.html", "Catalog1.html"):
        return "standalone", "utility"
    return "page", "core"

# ---------------------------------------------------------------- styles registry
styles = {}

def register_style(css):
    css = css.strip()
    if not css:
        return None
    h = hashlib.md5(css.encode()).hexdigest()[:10]
    styles[h] = css
    return h

# ---------------------------------------------------------------- per page
def parse_head(soup, path):
    head = soup.head or soup
    def meta(**kw):
        t = head.find("meta", attrs=kw)
        return t.get("content") if t and t.has_attr("content") else None
    seo = {
        "title": (head.title.get_text(strip=True) if head.title else ""),
        "description": meta(name="description") or "",
        "canonical": None,
        "robots": meta(name="robots"),
        "og": {},
        "twitter": {},
        "jsonld": [],
    }
    c = head.find("link", rel="canonical")
    if c:
        seo["canonical"] = c.get("href")
    for t in head.find_all("meta"):
        p = t.get("property") or ""
        n = t.get("name") or ""
        if p.startswith("og:"):
            seo["og"][p] = t.get("content")
        if n.startswith("twitter:"):
            seo["twitter"][n] = t.get("content")
    for s in soup.find_all("script", type="application/ld+json"):
        txt = s.string or s.get_text()
        try:
            seo["jsonld"].append(json.loads(txt))
        except Exception:
            pass
    # extra stylesheets beyond the shared ones
    extra = []
    for l in head.find_all("link", rel=lambda r: r and "stylesheet" in r):
        href = l.get("href", "")
        base = href.split("/")[-1].split("?")[0]
        if base in ("vendors.min.css", "icon.min.css", "style.css", "responsive.css", "swiper-bundle.min.css") or "fonts.googleapis" in href:
            continue
        extra.append(norm_url(href, path))
    head_styles = [register_style(s.get_text()) for s in head.find_all("style")]
    return seo, extra, [h for h in head_styles if h]


def clean_body(raw, path, rec):
    """Main content = raw HTML between the first </header> and the last <footer>."""
    m = re.search(r'<nav[^>]*class="([^"]*navbar[^"]*)"', raw)
    rec["header"] = "light" if m and "header-light" in m.group(1) else "transparent"
    b0 = raw.find("<body")
    a = raw.find("</header>", b0)
    a = a + len("</header>") if a >= 0 else raw.find(">", b0) + 1
    b = raw.rfind("<footer")
    if b < a:
        b = raw.rfind("</body>")
    inner = raw[a:b]
    # parse the fragment as a whole document: stray closing tags in the source must not end it early
    root = BeautifulSoup(inner, "html.parser")
    # comments, scripts (JSON-LD already captured), GTM noscript
    for c in root.find_all(string=lambda t: isinstance(t, Comment)):
        c.extract()
    for s in root.find_all("script"):
        s.decompose()
    for ns in root.find_all("noscript"):
        if "googletagmanager" in str(ns):
            ns.decompose()
    # embedded contact popups are replaced by the shared popup component
    for cf in root.find_all(id="contact-form"):
        h = cf.find(["h3", "p", "h2", "div"], class_=lambda c: c and "text-dark-gray" in c)
        if h and h.get_text(strip=True):
            rec.setdefault("data", {})["popupTitle"] = h.get_text(" ", strip=True)
        cf.decompose()
    for cp in root.select(".contactpopup"):
        cp.decompose()
    # page styles inside the body
    body_styles = []
    for st in root.find_all("style"):
        h = register_style(st.get_text())
        if h:
            body_styles.append(h)
        st.decompose()
    # normalise every URL-bearing attribute
    for t in root.find_all(True):
        for a in ("src", "href", "data-at2x", "poster", "data-src", "action"):
            if t.has_attr(a):
                t[a] = norm_url(t[a], path)
        if t.has_attr("srcset"):
            t["srcset"] = ", ".join(
                " ".join([norm_url(p.strip().split(" ")[0], path)] + p.strip().split(" ")[1:])
                for p in t["srcset"].split(",") if p.strip())
        if t.has_attr("style"):
            t["style"] = norm_style(t["style"], path)
        if t.has_attr("data-imgs"):
            try:
                imgs = json.loads(t["data-imgs"])
                t["data-imgs"] = json.dumps([norm_url(i, path) for i in imgs])
            except Exception:
                pass
        if t.has_attr("onclick") and "setImageCarousel" in t["onclick"]:
            del t["onclick"]
        if t.name == "a" and t.has_attr("onclick") and "return false" in t["onclick"]:
            del t["onclick"]
    rec["styles"] = rec.get("styles", []) + body_styles
    html = root.decode()
    html = re.sub(r"\n\s*\n+", "\n", html)
    return html.strip()


def product_data(soup, body_html, path, rec):
    d = rec.setdefault("data", {})
    b = BeautifulSoup(body_html, "html.parser")
    h1 = b.find("h1")
    if h1:
        name_parts = list(h1.stripped_strings)
        d["name"] = name_parts[0] if name_parts else h1.get_text(strip=True)
    sku = b.find(class_="sku")
    d["sku"] = sku.get_text(strip=True) if sku else None
    colours = []
    for co in b.select(".color-option"):
        try:
            imgs = json.loads(co.get("data-imgs", "[]"))
        except Exception:
            imgs = []
        try:
            alts = json.loads(co.get("data-alts", "[]"))
        except Exception:
            alts = []
        circle = co.find(class_="color-circle")
        span = co.find("span")
        colours.append({"name": span.get_text(strip=True) if span else "",
                        "swatch": circle.get("style", "") if circle else "",
                        "images": imgs, "alts": alts})
    d["colours"] = colours
    desc = b.find(class_="productdescription")
    d["description"] = desc.get_text(" ", strip=True) if desc else ""
    crumbs = [li.get_text(" ", strip=True) for li in b.select(".breadcrumb li")]
    d["breadcrumb"] = crumbs
    parts = path.strip("/").split("/")
    d["line"] = parts[0]
    d["series"] = "/" + "/".join(parts[:-1]) + ".html"
    img = None
    if colours and colours[0]["images"]:
        img = colours[0]["images"][0]
    else:
        im = b.find("img")
        img = im.get("src") if im else None
    d["image"] = img


def card_image(body_html):
    b = BeautifulSoup(body_html, "html.parser")
    for im in b.find_all("img"):
        s = im.get("src", "")
        if s.startswith("/images/") and not s.endswith(".svg") and "logo" not in s.lower():
            return s
    return None


def main():
    os.makedirs(OUT, exist_ok=True)
    paths = []
    for root, _, files in os.walk(FIXED):
        for f in files:
            if f.endswith(".html"):
                p = "/" + os.path.relpath(os.path.join(root, f), FIXED).replace(os.sep, "/")
                paths.append(p)
    # pages the fix pack left unchanged are copied straight from the source
    for p in all_files:
        if p.endswith(".html") and not p.startswith(("/revolution", "/vendor", "/sass", "/email-templates", "/audio/")):
            if not os.path.exists(os.path.join(FIXED, p.lstrip("/"))) and p not in paths:
                paths.append(p)
    fixdata = json.load(open(os.path.join(os.path.dirname(__file__), "fixpack", "script", "fixpack-data.json")))
    redirect_sources = {k for k in fixdata["redirects"] if k != "/index.html"}
    redirect_sources |= set(fixdata["renames"].keys())
    collections = {}
    for p in sorted(set(paths)):
        if p in redirect_sources or unquote(p) in redirect_sources or "#" in p:
            continue
        fp = os.path.join(FIXED, p.lstrip("/"))
        if not os.path.exists(fp):
            fp = os.path.join(SOURCE, p.lstrip("/"))
        raw = open(fp, encoding="utf-8", errors="ignore").read()
        url_path = "/" if p == "/index.html" else p
        if p == "/index.html":
            pass
        typ, coll = classify(url_path)
        rec = {"path": url_path, "type": typ, "collection": coll}
        if typ in ("verification", "standalone"):
            rec["raw"] = raw
            collections.setdefault(coll, []).append(rec)
            continue
        if typ == "stub":
            m = re.search(r"url=([^\"']+)", raw)
            rec["redirect"] = norm_url(m.group(1), url_path) if m else "/"
            collections.setdefault(coll, []).append(rec)
            continue
        soup = BeautifulSoup(raw, "lxml")
        seo, extra_css, head_styles = parse_head(soup, url_path)
        rec["seo"] = seo
        rec["css"] = extra_css
        rec["styles"] = head_styles
        rec["bodyClass"] = " ".join(soup.body.get("class", [])) if soup.body else ""
        rec["body"] = clean_body(raw, url_path, rec)
        if typ == "product":
            product_data(soup, rec["body"], url_path, rec)
        rec.setdefault("data", {})["cardImage"] = card_image(rec["body"])
        h1 = BeautifulSoup(rec["body"], "html.parser").find("h1")
        rec["h1"] = h1.get_text(" ", strip=True) if h1 else ""
        collections.setdefault(coll, []).append(rec)
    os.makedirs(os.path.join(OUT, "pages"), exist_ok=True)
    for coll, recs in collections.items():
        with open(os.path.join(OUT, "pages", coll + ".json"), "w", encoding="utf-8") as f:
            json.dump(recs, f, ensure_ascii=False)
    os.makedirs(os.path.join(OUT, "styles"), exist_ok=True)
    with open(os.path.join(OUT, "styles", "page-styles.json"), "w", encoding="utf-8") as f:
        json.dump(styles, f, ensure_ascii=False)
    with open(os.path.join(OUT, "..", "tools-assets-used.txt"), "w") as f:
        f.write("\n".join(sorted(used_assets)))
    summary = {k: len(v) for k, v in collections.items()}
    print(json.dumps(summary), "styles", len(styles), "assets", len(used_assets))


main()
