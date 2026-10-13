#!/usr/bin/env python3
"""
FunPlay Systems – bulk SEO fixer for the static HTML site.

What it does to every .html file it finds (only where the data says so):
  1. <title>            -> new title
  2. meta description   -> new description (adds the tag if missing)
  3. canonical          -> self-referencing https://funplaysystems.com/... (adds if missing)
  4. <h1>               -> new H1 text (keeps the tag's classes/styles)
  5. headings           -> fixes template headings that break the H1>H2>H3 order
  6. <img alt>          -> descriptive alt text from fixpack-data.json; decorative icons get alt=""
  7. <img> size         -> adds width/height (stops layout shift) and loading="lazy" below the fold
  8. product gallery    -> real alt text per image + first image rendered in HTML (crawlable)
  9. JSON-LD            -> removes old/broken blocks, inserts the new sitewide + page schema
 10. Open Graph/Twitter -> adds og:/twitter: tags where missing
 11. internal links     -> rewrites links that point to redirected/404/http/www URLs
 12. search page        -> adds noindex,follow to search-result.html

SAFE BY DEFAULT: it never edits your files in place. It writes changed copies to --out
and a CSV change log. Review, test on staging, then upload.

Usage:
  python3 apply_seo_fixes.py --site /path/to/public_html --out /path/to/output
  python3 apply_seo_fixes.py --site ./public_html --out ./fixed --only /blog/   (one folder)
Requires: Python 3.8+ (no extra packages).
"""
import argparse, csv, html, json, os, re, sys
from urllib.parse import urljoin, urlparse, unquote

BASE = "https://funplaysystems.com"
HERE = os.path.dirname(os.path.abspath(__file__))

def load(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as f:
        return json.load(f)

def esc(s):
    return html.escape(s, quote=True)

def set_attr(tag, name, value):
    """Set/replace an attribute inside a single start tag string."""
    pat = re.compile(r'(\s' + name + r'\s*=\s*)("[^"]*"|\'[^\']*\'|[^\s>]+)', re.I)
    if pat.search(tag):
        return pat.sub(lambda m: m.group(1) + '"' + esc(value) + '"', tag, count=1)
    return re.sub(r'\s*(/?)>$', lambda m: f' {name}="{esc(value)}"' + (" /" if m.group(1) else "") + ">", tag, count=1)

def get_attr(tag, name):
    m = re.search(r'\s' + name + r'\s*=\s*("([^"]*)"|\'([^\']*)\'|([^\s>]+))', tag, re.I)
    if not m: return None
    return m.group(2) if m.group(2) is not None else (m.group(3) if m.group(3) is not None else m.group(4))

class Fixer:
    def __init__(self, data):
        self.d = data
        self.pages = data["pages"]
        self.alts = data["alts"]
        self.dims = data["dims"]
        self.redirects = {unquote(k): v for k, v in data["redirects"].items()}
        self.sitewide = json.dumps(data["sitewide_schema"], ensure_ascii=False, indent=1)
        self.log = []

    def note(self, path, what, before="", after=""):
        self.log.append([path, what, (before or "")[:300], (after or "")[:300]])

    def fix_links(self, path, h):
        def rep(m):
            if m.group(2) is not None: attr, q, url = "href", '"', m.group(2)
            else: attr, q, url = "href", "'", m.group(3)
            if url.startswith(("mailto:", "tel:", "#", "javascript:", "data:")): return m.group(0)
            new = url
            new = re.sub(r"^https?://(www\.|mail\.)?funplaysystems\.com", BASE, new)
            absu = urljoin(BASE + path, new)
            pu = urlparse(absu)
            if pu.netloc == "funplaysystems.com":
                p = unquote(pu.path).replace("&amp;", "&").rstrip('"')
                if p in self.redirects:
                    new = self.redirects[p] + (("#" + pu.fragment) if pu.fragment else "")
                elif new != url:
                    new = absu
            if new != url:
                self.note(path, "link", url, new)
                return f"{attr}={q}{new}{q}"
            return m.group(0)
        return re.sub(r'(href)=(?:"([^"]*)"|\'([^\']*)\')', rep, h)

    def fix_head(self, path, h, P):
        if P.get("title_new") and not P["title_new"].startswith("("):
            m = re.search(r"<title[^>]*>(.*?)</title>", h, re.S | re.I)
            if m:
                h = h[:m.start(1)] + esc(P["title_new"]) + h[m.end(1):]; self.note(path, "title", m.group(1).strip(), P["title_new"])
        if P.get("desc_new"):
            m = re.search(r'<meta\s+[^>]*name=["\']description["\'][^>]*>', h, re.I)
            if m:
                new = set_attr(m.group(0), "content", P["desc_new"]); h = h.replace(m.group(0), new, 1)
            else:
                h = re.sub(r"(</title>)", r'\1\n  <meta name="description" content="' + esc(P["desc_new"]) + '">', h, count=1, flags=re.I)
            self.note(path, "meta description", "", P["desc_new"])
        if P.get("canonical_new"):
            tag = f'<link rel="canonical" href="{P["canonical_new"]}">'
            m = re.search(r'<link\s+[^>]*rel=["\']canonical["\'][^>]*>', h, re.I)
            if m:
                if get_attr(m.group(0), "href") != P["canonical_new"]:
                    h = h.replace(m.group(0), tag, 1); self.note(path, "canonical", get_attr(m.group(0), "href"), P["canonical_new"])
            else:
                h = re.sub(r"(</title>)", r"\1\n  " + tag, h, count=1, flags=re.I); self.note(path, "canonical added", "", P["canonical_new"])
        # keep <meta charset> as the first element in <head>
        mc = re.search(r'\s*<meta\s+charset=[^>]*>', h, re.I)
        hd = re.search(r'<head[^>]*>', h, re.I)
        if mc and hd and mc.start() > hd.end():
            tag_ = mc.group(0).strip(); h = h[:mc.start()] + h[mc.end():]
            h = h[:hd.end()] + "\n  " + tag_ + h[hd.end():]
        if path == "/search-result.html" and "noindex" not in h:
            h = re.sub(r"(</title>)", r'\1\n  <meta name="robots" content="noindex, follow">', h, count=1, flags=re.I)
            self.note(path, "noindex", "", "noindex, follow")
        # Open Graph / Twitter
        og = P.get("og", {})
        add = []
        for k, v in og.items():
            if not v: continue
            tags = list(re.finditer(r'<meta\s+[^>]*property=["\']' + re.escape(k) + r'["\'][^>]*>\s*', h, re.I))
            if tags:
                for t_ in reversed(tags[1:]): h = h[:t_.start()] + h[t_.end():]
                if k in ("og:url", "og:title", "og:description", "og:image") or "funplaysystems.in" in tags[0].group(0):
                    h = h.replace(tags[0].group(0).rstrip(), f'<meta property="{k}" content="{esc(v)}">', 1)
            else:
                add.append(f'<meta property="{k}" content="{esc(v)}">')
        for nm in ("twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:url"):
            tags = list(re.finditer(r'<meta\s+[^>]*name=["\']' + re.escape(nm) + r'["\'][^>]*>\s*', h, re.I))
            for t_ in reversed(tags[1:]): h = h[:t_.start()] + h[t_.end():]
            if tags and nm in ("twitter:title", "twitter:description") and og:
                v = og["og:title"] if nm == "twitter:title" else og["og:description"]
                h = h.replace(tags[0].group(0).rstrip(), f'<meta name="{nm}" content="{esc(v)}">', 1)
        if og and not re.search(r'name=["\']twitter:card["\']', h):
            add.append('<meta name="twitter:card" content="summary_large_image">')
        h2_ = re.sub(r'(<meta\s[^>]*content=["\'])https?://(?:www\.)?funplaysystems\.in/', r"\1" + BASE + "/", h, flags=re.I)
        if h2_ != h: self.note(path, "meta tags: funplaysystems.in -> .com", "", ""); h = h2_
        if add:
            h = re.sub(r"(</head>)", "  " + "\n  ".join(add) + r"\n\1", h, count=1, flags=re.I); self.note(path, "open graph", "", f"{len(add)} tags")
        return h

    def fix_schema(self, path, h, P):
        blocks = list(re.finditer(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>.*?</script>\s*', h, re.S | re.I))
        for b in reversed(blocks):
            h = h[:b.start()] + h[b.end():]
        if blocks: self.note(path, "old JSON-LD removed", f"{len(blocks)} block(s)", "")
        parts = [self.sitewide]
        if P.get("schema"): parts.append(json.dumps(P["schema"], ensure_ascii=False, indent=1))
        if P.get("schema_extra"): parts.append(json.dumps(P["schema_extra"], ensure_ascii=False, indent=1))
        ins = "".join(f'<script type="application/ld+json">\n{x}\n</script>\n' for x in parts)
        h = re.sub(r"(</head>)", ins + r"\1", h, count=1, flags=re.I)
        self.note(path, "JSON-LD inserted", "", f"{len(parts)} block(s)")
        return h

    def fix_headings(self, path, h, P):
        t = P.get("type")
        def self_cls(attrs, cls):
            attrs = attrs or ""
            if re.search(r'class\s*=\s*"', attrs, re.I):
                return re.sub(r'class\s*=\s*"', 'class="' + cls + ' ', attrs, count=1, flags=re.I)
            return attrs + f' class="{cls}"'
        def demote(txt, h):  # heading -> <p> keeping classes
            pat = re.compile(r"<(h[1-6])(\s[^>]*)?>(\s*" + re.escape(txt) + r"\s*(?:<span[^>]*>\s*</span>)?\s*)</\1>", re.I)
            n = len(pat.findall(h))
            if n:
                h = pat.sub(lambda m: "<p" + self_cls(m.group(2), m.group(1).lower()) + ">" + m.group(3) + "</p>", h); self.note(path, "heading -> p", txt, "")
            return h
        def retag(txt, to, h):
            pat = re.compile(r"<(h[1-6])(\s[^>]*)?>(\s*" + re.escape(txt) + r"\s*(?:<span[^>]*>\s*</span>)?\s*)</\1>", re.I)
            if pat.search(h):
                h = pat.sub(lambda m: (f"<{to}{m.group(2) or ''}>{m.group(3)}</{to}>" if m.group(1).lower() == to else f"<{to}{self_cls(m.group(2), m.group(1).lower())}>{m.group(3)}</{to}>"), h); self.note(path, f"heading -> {to}", txt, "")  # rebuild: keep original size via .hN
            return h
        if t == "product" and not re.search(r"<h1[\s>]", h, re.I):
            m = re.search(r'<(h[2-6])(\s[^>]*class=["\'][^"\']*productname[^>]*)>(.*?)</\1>', h, re.S | re.I)
            if m:
                h = h[:m.start()] + f"<h1{m.group(2)}>{m.group(3)}</h1>" + h[m.end():]; self.note(path, "product name promoted to h1", m.group(1), "h1")
        if P.get("h1_new") and P.get("apply_h1"):
            m = re.search(r"<h1(\s[^>]*)?>(.*?)</h1>", h, re.S | re.I)
            if m:
                inner = P.get("h1_html") or esc(P["h1_new"])
                h = h[:m.start(2)] + inner + h[m.end(2):]; self.note(path, "h1", re.sub(r"<[^>]+>", "", m.group(2)).strip(), P["h1_new"])
            elif P.get("add_h1_after"):
                h = h.replace(P["add_h1_after"], P["add_h1_after"] + f'\n<h1 class="descriptionheading">{esc(P["h1_new"])}</h1>', 1)
                self.note(path, "h1 added", "", P["h1_new"])
        h = demote("What are you looking for?", h)
        n0 = len(re.findall(r"<h[1-6][^>]*>\s*(<span[^>]*>\s*</span>)?\s*</h[1-6]>", h, re.I))
        if n0:
            h = re.sub(r"<(h[1-6])([^>]*)>(\s*(<span[^>]*>\s*</span>)?\s*)</\1>", r"<div\2>\3</div>", h, flags=re.I); self.note(path, "empty heading -> div", str(n0), "")
        if t == "product":
            for x in ["Request Your Custom Quote Today!", "Description", "Specifications", "Product details", "Dimensions", "Warranties"]:
                h = retag(x, "h2", h)
        if t == "city":
            h = demote("Multi Play Fun System", h)
            for x in ["How would you like to start?", "Why choose us?"]:
                h = retag(x, "h2", h)
        if t == "category":
            for tag in P.get("demote", []): h = demote(tag, h)
        h = retag("Contact Us", "h2", h) if t in ("product", "city", "blog", "category") else h
        # H1 text
        h = self.normalize_headings(path, h)
        return h

    def normalize_headings(self, path, h):
        """One H1, nothing above it, no skipped levels. Visual size is kept with Bootstrap .hN classes."""
        pat = re.compile(r"<(h[1-6])(\s[^>]*)?>(.*?)</\1>", re.S | re.I)
        ms = list(pat.finditer(h))
        if not ms: return h
        def with_class(attrs, cls):
            attrs = attrs or ""
            if re.search(r'class\s*=\s*"', attrs, re.I):
                return re.sub(r'class\s*=\s*"', 'class="' + cls + ' ', attrs, count=1, flags=re.I)
            return attrs + f' class="{cls}"'
        has_h1 = any(m.group(1).lower() == "h1" for m in ms)
        seen_h1 = False; prev = 0; out = []; last = 0
        for m in ms:
            lvl = int(m.group(1)[1]); attrs = m.group(2); inner = m.group(3); new = None
            if has_h1 and not seen_h1 and lvl != 1:
                new = f"<p{with_class(attrs, 'h' + str(lvl))}>{inner}</p>"
            elif lvl == 1 and seen_h1:
                new = f"<h2{with_class(attrs, 'h1')}>{inner}</h2>"; prev = 2
            else:
                if lvl == 1: seen_h1 = True
                if prev and lvl > prev + 1:
                    nl = prev + 1
                    new = f"<h{nl}{with_class(attrs, 'h' + str(lvl))}>{inner}</h{nl}>"; lvl = nl
                prev = lvl
            if new:
                out.append(h[last:m.start()]); out.append(new); last = m.end()
                self.note(path, "heading level fixed", m.group(0)[:80], new[:80])
        out.append(h[last:])
        return "".join(out)

    def fix_images(self, path, h, P):
        count = [0]
        def rep(m):
            tag = m.group(0)
            src = get_attr(tag, "src") or get_attr(tag, "data-src")
            if not src or "${" in src: return tag
            absu = urljoin(BASE + path, src.strip())
            absu = re.sub(r"^https?://(www\.)?funplaysystems\.com", BASE, absu)
            a = self.alts.get(absu)
            new = tag
            if a is not None:
                if get_attr(tag, "alt") != a:
                    new = set_attr(new, "alt", a)
                if a == "" and not get_attr(new, "aria-hidden"):
                    new = set_attr(new, "aria-hidden", "true")
            wh = self.dims.get(absu)
            if wh and not get_attr(new, "width") and not get_attr(new, "height"):
                new = set_attr(new, "width", str(wh[0])); new = set_attr(new, "height", str(wh[1]))
            count[0] += 1
            if count[0] > 3 and not get_attr(new, "loading") and not get_attr(new, "fetchpriority") and "logo" not in absu:
                new = set_attr(new, "loading", "lazy"); new = set_attr(new, "decoding", "async")
            if new != tag: self.note(path, "img", tag, new)
            return new
        return re.sub(r"<img\b[^>]*>", rep, h, flags=re.I | re.S)

    def fix_gallery(self, path, h, P):
        if "setImageCarousel" not in h: return h
        def rep(m):
            tag = m.group(0)
            raw = get_attr(tag, "data-imgs") or "[]"
            try: arr = json.loads(html.unescape(raw))
            except Exception: arr = re.findall(r'"([^"]+)"', raw)
            alts = [self.alts.get(re.sub(r"^https?://(www\.)?funplaysystems\.com", BASE, urljoin(BASE + path, u)), P.get("h1_new", "")) or P.get("h1_new", "") for u in arr]
            if get_attr(tag, "data-alts"): return tag
            return tag[:-1] + " data-alts='" + json.dumps(alts, ensure_ascii=False).replace("'", "&#39;") + "'>"
        h2 = re.sub(r'<div\b[^>]*class=["\'][^"\']*color-option[^"\']*["\'][^>]*>', rep, h)
        new_js = """function setImageCarousel(element) {
        var imgs = $(element).data("imgs") || [];
        var alts = $(element).data("alts") || [];
        var $carouselInner = $("#carouselImages");
        $carouselInner.empty();
        imgs.forEach(function (src, index) {
          var itemClass = index === 0 ? "carousel-item active" : "carousel-item";
          var alt = (alts[index] || document.title).replace(/"/g, "&quot;");
          $carouselInner.append('<div class="' + itemClass + '"><img src="' + src + '" class="d-block w-100" alt="' + alt + '"' + (index ? ' loading="lazy"' : '') + '></div>');
        });
      }
"""
        img_cls = "d-block w-100"
        start = re.search(r"function\s+setImageCarousel\s*\(\s*element\s*\)\s*\{", h2)
        if start:
            i = start.end(); depth = 1; q = None; esc_ = False
            while i < len(h2) and depth:
                c = h2[i]
                if q:
                    if esc_: esc_ = False
                    elif c == "\\": esc_ = True
                    elif c == q: q = None
                elif c in "'\"`": q = c
                elif c == "{": depth += 1
                elif c == "}": depth -= 1
                i += 1
            if depth == 0:
                cls = re.search(r'<img src="\$\{src\}" class="([^"]*)"', h2[start.start():i])
                if cls: img_cls = cls.group(1)
                fn = new_js.replace('class="d-block w-100"', 'class="' + img_cls + '"')
                h2 = h2[:start.start()] + fn.rstrip() + h2[i:]
        # server-render first slide so Google/AI crawlers see a real <img>
        first = P.get("gallery_first")
        if first:
            h2 = re.sub(r'(<div[^>]*id=["\']carouselImages["\'][^>]*>)\s*(<!--.*?-->)?',
                        lambda m: m.group(1) + f'\n              <div class="carousel-item active"><img src="{first["src"]}" class="{img_cls}" alt="{esc(first["alt"])}" width="{first["w"]}" height="{first["h"]}" fetchpriority="high"></div>',
                        h2, count=1, flags=re.S)
        if h2 != h: self.note(path, "gallery", "JS alt='Colorful Image'", "per-image alt + first image in HTML")
        return h2

    def run_file(self, path, h):
        P = self.pages.get(path, {"type": "other"})
        if P.get("skip"): return h
        h = self.fix_head(path, h, P)
        h = self.fix_schema(path, h, P)
        h = self.fix_headings(path, h, P)
        h = self.fix_gallery(path, h, P)
        h = self.fix_images(path, h, P)
        if P.get("local_block") and "fp-local-links" not in h:
            h = re.sub(r"(<footer\b)", P["local_block"] + "\n" + r"\1", h, count=1, flags=re.I)
            self.note(path, "local links block added", "", "breadcrumb + state hub + nearby cities")
        h = self.fix_links(path, h)
        return h

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", required=True, help="folder with the live site files (public_html copy)")
    ap.add_argument("--out", required=True, help="folder to write fixed copies into")
    ap.add_argument("--only", default="", help="only process URLs starting with this path, e.g. /blog/")
    a = ap.parse_args()
    data = load("fixpack-data.json")
    fx = Fixer(data)
    n = 0
    for root, _, files in os.walk(a.site):
        for fn in files:
            if not fn.lower().endswith(".html"): continue
            full = os.path.join(root, fn)
            rel = "/" + os.path.relpath(full, a.site).replace(os.sep, "/")
            if rel == "/index.html": path = "/"
            else: path = rel
            if a.only and not path.startswith(a.only): continue
            with open(full, encoding="utf-8", errors="surrogateescape") as f: h = f.read()
            new = fx.run_file(path, h)
            if new != h:
                dest = os.path.join(a.out, os.path.relpath(full, a.site))
                rn = data["renames"].get(path)
                if rn: dest = os.path.join(a.out, rn.lstrip("/"))
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                with open(dest, "w", encoding="utf-8", errors="surrogateescape") as f: f.write(new)
                n += 1
    with open(os.path.join(a.out, "_change-log.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["page", "change", "before", "after"]); w.writerows(fx.log)
    print(f"Changed files: {n}. Change log: {os.path.join(a.out, '_change-log.csv')}")

if __name__ == "__main__":
    main()
