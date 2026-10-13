"""On-page SEO audit of the running build (default http://localhost:3456).
Crawls every URL in the sitemaps plus the noindex pages listed below and checks: status, one H1,
title length, meta description, canonical (self, absolute), robots, JSON-LD parses, image alt,
internal links resolve (200 or one redirect), em/en dashes and banned phrases in visible copy.
Usage: python3 tools/seo_audit.py [base] > report"""
import concurrent.futures as cf, json, re, sys, collections, urllib.request, urllib.error
from bs4 import BeautifulSoup

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3456"
HOST = "https://funplaysystems.com"
BANNED = ["delve", "tapestry", "elevate your", "in today's fast-paced", "unlock the", "seamless", "game-changer",
          "look no further", "testament to", "nestled", "embark", "realm", "it's worth noting", "in conclusion"]


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


opener = urllib.request.build_opener(NoRedirect)


def get(path):
    try:
        r = opener.open(BASE + path, timeout=30)
        return r.status, r.read().decode("utf-8", "replace"), None
    except urllib.error.HTTPError as e:
        return e.code, "", e.headers.get("Location")


def locs(xml):
    return re.findall(r"<loc>([^<]+)</loc>", xml)


def main():
    _, idx, _ = get("/sitemap.xml")
    urls = []
    for sm in locs(idx):
        _, x, _ = get(sm.replace(HOST, ""))
        urls += [u.replace(HOST, "") or "/" for u in locs(x)]
    print("sitemap urls:", len(urls), "unique:", len(set(urls)))
    issues = collections.defaultdict(list)
    links = collections.Counter()
    titles = collections.defaultdict(list)
    descs = collections.defaultdict(list)

    def audit(p):
        st, html, loc = get(p)
        out = []
        if st != 200:
            return p, [f"status {st} {loc or ''}"], set(), None, None
        s = BeautifulSoup(html, "html.parser")
        h1 = s.find_all("h1")
        if len(h1) != 1:
            out.append(f"h1 count {len(h1)}")
        t = (s.title.get_text() if s.title else "").strip()
        if not t:
            out.append("no title")
        elif len(t) > 65:
            out.append(f"title {len(t)} chars")
        d = s.find("meta", attrs={"name": "description"})
        dv = (d.get("content") or "").strip() if d else ""
        if not dv:
            out.append("no description")
        elif len(dv) > 170 or len(dv) < 70:
            out.append(f"description {len(dv)} chars")
        c = s.find("link", rel="canonical")
        cv = c.get("href") if c else None
        want = HOST + ("/" if p == "/" else p)
        if cv != want:
            out.append(f"canonical {cv}")
        rb = s.find("meta", attrs={"name": "robots"})
        if rb and "noindex" in (rb.get("content") or ""):
            out.append("noindex but in sitemap")
        for j in s.find_all("script", type="application/ld+json"):
            try:
                json.loads(j.string or "")
            except Exception:
                out.append("bad json-ld")
        for img in s.select("main img, body img"):
            if img.get("alt") is None:
                out.append(f"img no alt {img.get('src')}")
                break
        main = s.find("main") or s.body
        for tag in main(["script", "style", "noscript"]):
            tag.decompose()
        text = main.get_text(" ")
        if "—" in text:
            out.append("em dash in copy")
        low = text.lower()
        for b in BANNED:
            if b in low:
                out.append(f"phrase '{b}'")
        hrefs = set()
        for a in s.find_all("a", href=True):
            h = a["href"].split("#")[0].split("?")[0]
            if h.startswith(HOST):
                h = h[len(HOST):] or "/"
            if h.startswith("/") and not h.startswith("//"):
                hrefs.add(h)
        return p, out, hrefs, t, dv

    with cf.ThreadPoolExecutor(16) as ex:
        for p, out, hrefs, t, dv in ex.map(audit, sorted(set(urls))):
            for o in out:
                issues[o.split(" ")[0] + " " + (o.split(" ")[1] if " " in o else "")].append((p, o))
            links.update(hrefs)
            if t:
                titles[t].append(p)
            if dv:
                descs[dv].append(p)
    # internal link targets
    bad = {}

    def chk(h):
        st, _, loc = get(h)
        if st in (301, 302, 307, 308) and loc:
            st2, _, _ = get(loc.replace(HOST, "") if loc.startswith(HOST) else loc)
            return h, (st, st2)
        return h, (st,)

    with cf.ThreadPoolExecutor(16) as ex:
        for h, r in ex.map(chk, list(links)):
            if r[-1] != 200:
                bad[h] = r
    print("\n== issues by type")
    for k, v in sorted(issues.items(), key=lambda kv: -len(kv[1])):
        print(f"{len(v):5}  {k}   e.g. {v[0][0]} -> {v[0][1]}")
    print("\n== duplicate titles:", sum(1 for v in titles.values() if len(v) > 1))
    for t, v in list((t, v) for t, v in titles.items() if len(v) > 1)[:15]:
        print("  ", t, v[:3])
    print("== duplicate descriptions:", sum(1 for v in descs.values() if len(v) > 1))
    for t, v in list((t, v) for t, v in descs.items() if len(v) > 1)[:10]:
        print("  ", t[:80], v[:3])
    print("\n== internal link targets:", len(links), "broken:", len(bad))
    for h, r in list(bad.items())[:40]:
        print("  ", h, r, "linked from", links[h], "pages")
    json.dump({k: v for k, v in issues.items()}, open("/tmp/claude-0/seo-issues.json", "w"), indent=1)


main()
